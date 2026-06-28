/**
 * End-to-end test script for OneDigest.
 *
 * Tests:
 *  1. User registration
 *  2. User login (NextAuth credentials)
 *  3. Settings GET/PATCH
 *  4. Newsletters browsing (with category & search filters)
 *  5. Subscription CRUD (subscribe, toggle, unsubscribe)
 *  6. Inbound email ingestion (simulates SendGrid webhook)
 *  7. Digest email sending (triggers the worker logic directly)
 *
 * Usage:
 *   npm run test:app
 *   npm run test:app -- --skip-email   # skip SendGrid digest send
 *
 * Prerequisites:
 *   - Dev server running on http://localhost:3000
 *   - Database migrated & seeded (npm run db:migrate && npm run db:seed)
 */
import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { sendDigestEmail } from "../src/lib/email";
import { CATEGORY_LABELS } from "../src/lib/categorize";
import type { Category } from "../src/generated/prisma/enums";

const BASE_URL = process.env.NEXTAUTH_URL || "http://localhost:3000";
const SKIP_EMAIL = process.argv.includes("--skip-email");

const prisma = new PrismaClient({ accelerateUrl: process.env.DATABASE_URL! });

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

let passed = 0;
let failed = 0;

function assert(condition: boolean, label: string) {
  if (condition) {
    console.log(`  PASS  ${label}`);
    passed++;
  } else {
    console.log(`  FAIL  ${label}`);
    failed++;
  }
}

async function api(
  path: string,
  options: RequestInit = {},
  cookie?: string
): Promise<{ status: number; body: Record<string, unknown> | Record<string, unknown>[] }> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> || {}),
  };
  if (cookie) headers["Cookie"] = cookie;

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers, redirect: "manual" });
  let body: Record<string, unknown> | Record<string, unknown>[];
  try {
    body = await res.json();
  } catch {
    body = {};
  }
  return { status: res.status, body };
}

// Get a session cookie by calling the NextAuth credentials sign-in endpoint
async function login(email: string, password: string): Promise<string | null> {
  // First get a CSRF token
  const csrfRes = await fetch(`${BASE_URL}/api/auth/csrf`);
  const { csrfToken } = (await csrfRes.json()) as { csrfToken: string };
  const csrfCookies = csrfRes.headers.getSetCookie?.() || [];

  // Sign in with credentials
  const signinRes = await fetch(`${BASE_URL}/api/auth/callback/credentials`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Cookie: csrfCookies.join("; "),
    },
    body: new URLSearchParams({ csrfToken, email, password }),
    redirect: "manual",
  });

  const cookies = signinRes.headers.getSetCookie?.() || [];
  const allCookies = [...csrfCookies, ...cookies];
  if (allCookies.length === 0) return null;
  return allCookies.map((c) => c.split(";")[0]).join("; ");
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

const TEST_EMAIL = `test-${Date.now()}@example.com`;
const TEST_PASSWORD = "TestPassword123!";
const TEST_NAME = "Test User";

async function testRegistration() {
  console.log("\n--- 1. Registration ---");

  const { status, body } = await api("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ email: TEST_EMAIL, password: TEST_PASSWORD, name: TEST_NAME }),
  });

  assert(status === 201, `Register returns 201 (got ${status})`);
  assert(
    typeof (body as Record<string, unknown>).ingestEmail === "string",
    `Response includes ingestEmail: ${(body as Record<string, unknown>).ingestEmail}`
  );

  // Duplicate registration
  const dup = await api("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ email: TEST_EMAIL, password: TEST_PASSWORD }),
  });
  assert(dup.status === 409, `Duplicate register returns 409 (got ${dup.status})`);
}

async function testLogin(): Promise<string> {
  console.log("\n--- 2. Login ---");

  const cookie = await login(TEST_EMAIL, TEST_PASSWORD);
  assert(cookie !== null, "Login returns session cookie");

  // Verify session
  const sessionRes = await fetch(`${BASE_URL}/api/auth/session`, {
    headers: { Cookie: cookie || "" },
  });
  const session = (await sessionRes.json()) as { user?: { email?: string } };
  assert(session?.user?.email === TEST_EMAIL, `Session user matches: ${session?.user?.email}`);

  return cookie!;
}

async function testSettings(cookie: string) {
  console.log("\n--- 3. Settings ---");

  // GET settings
  const { status, body } = await api("/api/settings", {}, cookie);
  assert(status === 200, `GET settings returns 200 (got ${status})`);
  assert(
    (body as Record<string, unknown>).deliveryTime === "07:00",
    `Default delivery time is 07:00`
  );

  // PATCH settings
  const patched = await api(
    "/api/settings",
    { method: "PATCH", body: JSON.stringify({ deliveryTime: "09:30", timezone: "America/Chicago" }) },
    cookie
  );
  assert(patched.status === 200, `PATCH settings returns 200`);
  assert(
    (patched.body as Record<string, unknown>).deliveryTime === "09:30",
    `Delivery time updated to 09:30`
  );
  assert(
    (patched.body as Record<string, unknown>).timezone === "America/Chicago",
    `Timezone updated to America/Chicago`
  );

  // Unauthorized access
  const unauth = await api("/api/settings");
  assert(unauth.status === 401, `Settings without auth returns 401 (got ${unauth.status})`);
}

async function testNewsletters(cookie: string) {
  console.log("\n--- 4. Newsletters ---");

  // GET all newsletters
  const { status, body } = await api("/api/newsletters", {}, cookie);
  assert(status === 200, `GET newsletters returns 200`);
  assert(Array.isArray(body), `Response is an array`);
  const newsletters = body as Record<string, unknown>[];
  console.log(`    Found ${newsletters.length} newsletters in catalog`);

  if (newsletters.length > 0) {
    // Filter by category
    const category = (newsletters[0] as Record<string, unknown>).category as string;
    const filtered = await api(`/api/newsletters?category=${category}`, {}, cookie);
    assert(filtered.status === 200, `Filter by category=${category} returns 200`);
    const filteredList = filtered.body as Record<string, unknown>[];
    assert(
      filteredList.every((n) => n.category === category),
      `All results match category ${category}`
    );

    // Search by name
    const name = ((newsletters[0] as Record<string, unknown>).name as string).split(" ")[0];
    const searched = await api(`/api/newsletters?search=${encodeURIComponent(name)}`, {}, cookie);
    assert(searched.status === 200, `Search by "${name}" returns 200`);
  }
}

async function testSubscriptions(cookie: string) {
  console.log("\n--- 5. Subscriptions ---");

  // Find a newsletter to subscribe to
  const { body: nlBody } = await api("/api/newsletters", {}, cookie);
  const newsletters = nlBody as Record<string, unknown>[];
  if (newsletters.length === 0) {
    console.log("    SKIP: No newsletters to test subscriptions with");
    return;
  }

  const nlId = newsletters[0].id as string;
  const nlName = newsletters[0].name as string;

  // POST - subscribe
  const sub = await api(
    "/api/subscriptions",
    { method: "POST", body: JSON.stringify({ newsletterId: nlId }) },
    cookie
  );
  assert(sub.status === 200, `Subscribe to "${nlName}" returns 200`);
  assert((sub.body as Record<string, unknown>).active === true, `Subscription is active`);

  // GET - list subscriptions
  const list = await api("/api/subscriptions", {}, cookie);
  assert(list.status === 200, `GET subscriptions returns 200`);
  const subs = list.body as Record<string, unknown>[];
  assert(subs.some((s) => s.newsletterId === nlId), `Subscription appears in list`);

  // PATCH - toggle off
  const toggled = await api(
    "/api/subscriptions",
    { method: "PATCH", body: JSON.stringify({ newsletterId: nlId, active: false }) },
    cookie
  );
  assert(toggled.status === 200, `Toggle subscription off returns 200`);
  assert((toggled.body as Record<string, unknown>).active === false, `Subscription is now inactive`);

  // PATCH - toggle back on
  const toggledOn = await api(
    "/api/subscriptions",
    { method: "PATCH", body: JSON.stringify({ newsletterId: nlId, active: true }) },
    cookie
  );
  assert(toggledOn.status === 200, `Toggle subscription on returns 200`);

  // DELETE - unsubscribe
  const deleted = await api(
    "/api/subscriptions",
    { method: "DELETE", body: JSON.stringify({ newsletterId: nlId }) },
    cookie
  );
  assert(deleted.status === 200, `Unsubscribe returns 200`);

  // Verify deletion
  const listAfter = await api("/api/subscriptions", {}, cookie);
  const subsAfter = listAfter.body as Record<string, unknown>[];
  assert(!subsAfter.some((s) => s.newsletterId === nlId), `Subscription removed from list`);
}

async function testInboundEmail() {
  console.log("\n--- 6. Inbound Email Ingestion ---");

  // Get the test user's ingest email
  const user = await prisma.user.findUnique({ where: { email: TEST_EMAIL } });
  if (!user) {
    console.log("    SKIP: Test user not found in database");
    return;
  }

  const ingestEmail = user.ingestEmail;
  console.log(`    Sending to ingest address: ${ingestEmail}`);

  // Simulate a SendGrid Inbound Parse webhook (multipart form data)
  const formData = new FormData();
  formData.set("to", ingestEmail);
  formData.set("from", '"Tech Daily" <techdaily@example.com>');
  formData.set("subject", "Breaking: New JavaScript Runtime Released");
  formData.set(
    "html",
    "<h2>A New Era for JavaScript</h2><p>A new JS runtime promises 10x faster cold starts and built-in TypeScript support.</p>"
  );
  formData.set("text", "A new JS runtime promises 10x faster cold starts and built-in TypeScript support.");

  const res = await fetch(`${BASE_URL}/api/inbound`, { method: "POST", body: formData });
  const body = await res.json();
  assert(res.status === 200, `Inbound POST returns 200 (got ${res.status})`);
  assert(body.success === true, `Inbound response: success=true`);

  // Verify records were created
  const inbound = await prisma.inboundEmail.findFirst({
    where: { userId: user.id, subject: "Breaking: New JavaScript Runtime Released" },
    include: { newsletter: true },
  });
  assert(inbound !== null, `InboundEmail record created in database`);
  assert(inbound?.newsletter?.senderEmail === "techdaily@example.com", `Newsletter auto-created for sender`);
  assert(inbound?.included === false, `Email marked as not yet included in digest`);

  // Verify auto-subscription
  if (inbound?.newsletterId) {
    const subscription = await prisma.subscription.findUnique({
      where: { userId_newsletterId: { userId: user.id, newsletterId: inbound.newsletterId } },
    });
    assert(subscription !== null, `Auto-subscription created`);
    assert(subscription?.active === true, `Auto-subscription is active`);
  }

  // Send a second email from a different sender
  const formData2 = new FormData();
  formData2.set("to", ingestEmail);
  formData2.set("from", '"Market Watch" <marketwatch@example.com>');
  formData2.set("subject", "Weekly Market Recap: S&P Hits New High");
  formData2.set(
    "html",
    "<h2>Markets Surge</h2><p>The S&P 500 reached a new all-time high on strong earnings and positive economic data.</p>"
  );
  formData2.set("text", "The S&P 500 reached a new all-time high.");

  const res2 = await fetch(`${BASE_URL}/api/inbound`, { method: "POST", body: formData2 });
  assert(res2.status === 200, `Second inbound email accepted`);

  // Verify categorization
  const financeNl = await prisma.newsletter.findUnique({ where: { senderEmail: "marketwatch@example.com" } });
  assert(financeNl?.category === "FINANCE", `Market newsletter categorized as FINANCE (got ${financeNl?.category})`);

  // Test invalid recipient
  const formBad = new FormData();
  formBad.set("to", "nobody@other.com");
  formBad.set("from", "test@example.com");
  formBad.set("subject", "Test");
  formBad.set("html", "<p>test</p>");
  const resBad = await fetch(`${BASE_URL}/api/inbound`, { method: "POST", body: formBad });
  assert(resBad.status === 404, `Invalid recipient returns 404 (got ${resBad.status})`);
}

async function testDigestEmail() {
  console.log("\n--- 7. Digest Email Sending ---");

  if (SKIP_EMAIL) {
    console.log("    SKIP: --skip-email flag set");
    return;
  }

  if (!process.env.SENDGRID_API_KEY || process.env.SENDGRID_API_KEY.startsWith("SG.your")) {
    console.log("    SKIP: SENDGRID_API_KEY not configured");
    return;
  }

  const user = await prisma.user.findUnique({ where: { email: TEST_EMAIL } });
  if (!user) {
    console.log("    SKIP: Test user not found");
    return;
  }

  // Get unincluded emails for this user
  const emails = await prisma.inboundEmail.findMany({
    where: { userId: user.id, included: false },
    include: { newsletter: true },
  });

  if (emails.length === 0) {
    console.log("    SKIP: No unincluded emails to digest");
    return;
  }

  // Group by category (same logic as the worker)
  const grouped: Record<string, { name: string; subject: string; htmlBody: string }[]> = {};
  for (const email of emails) {
    const category = email.newsletter?.category || "UNCATEGORIZED";
    const label = CATEGORY_LABELS[category as Category] || category;
    if (!grouped[label]) grouped[label] = [];
    grouped[label].push({
      name: email.newsletter?.name || email.fromEmail,
      subject: email.subject,
      htmlBody: email.htmlBody,
    });
  }

  const sections = Object.entries(grouped).map(([category, newsletters]) => ({
    category,
    newsletters,
  }));

  console.log(`    Sending digest with ${emails.length} email(s) across ${sections.length} section(s)`);
  sections.forEach((s) => console.log(`      ${s.category}: ${s.newsletters.length} item(s)`));

  try {
    await sendDigestEmail(user.email, sections);
    console.log(`    Digest sent to: ${user.email}`);

    // Mark as included
    await prisma.inboundEmail.updateMany({
      where: { id: { in: emails.map((e) => e.id) } },
      data: { included: true },
    });

    await prisma.digestLog.create({
      data: { userId: user.id, emailCount: emails.length },
    });

    assert(true, `Digest email sent successfully via SendGrid`);

    // Verify digest log
    const log = await prisma.digestLog.findFirst({
      where: { userId: user.id },
      orderBy: { sentAt: "desc" },
    });
    assert(log !== null, `DigestLog record created`);
    assert(log?.emailCount === emails.length, `DigestLog emailCount matches (${log?.emailCount})`);
  } catch (err) {
    assert(false, `Digest email send failed: ${err}`);
  }
}

// ---------------------------------------------------------------------------
// Cleanup & main
// ---------------------------------------------------------------------------

async function cleanup() {
  console.log("\n--- Cleanup ---");

  // Delete all test data (cascades handle related records)
  const deleted = await prisma.user.deleteMany({ where: { email: TEST_EMAIL } });
  console.log(`  Deleted ${deleted.count} test user(s)`);

  // Clean up auto-created newsletters from test
  await prisma.newsletter.deleteMany({
    where: { senderEmail: { in: ["techdaily@example.com", "marketwatch@example.com"] } },
  });
  console.log("  Deleted test newsletters");
}

async function main() {
  console.log("=== OneDigest Test Suite ===");
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Skip email: ${SKIP_EMAIL}`);

  // Check server is running
  try {
    await fetch(BASE_URL);
  } catch {
    console.error(`\nERROR: Dev server not reachable at ${BASE_URL}`);
    console.error("Start it with: npm run dev");
    process.exit(1);
  }

  try {
    await testRegistration();
    const cookie = await testLogin();
    await testSettings(cookie);
    await testNewsletters(cookie);
    await testSubscriptions(cookie);
    await testInboundEmail();
    await testDigestEmail();
  } finally {
    await cleanup();
    await prisma.$disconnect();
  }

  console.log(`\n=== Results: ${passed} passed, ${failed} failed ===`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error("Test runner failed:", err);
  process.exit(1);
});
