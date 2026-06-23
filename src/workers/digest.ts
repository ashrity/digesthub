import { PrismaClient } from "../generated/prisma/client";
import { sendDigestEmail } from "../lib/email";
import { CATEGORY_LABELS } from "../lib/categorize";
import type { Category } from "../generated/prisma/enums";

const prisma = new PrismaClient({
  accelerateUrl: process.env.DATABASE_URL!,
});

async function sendDigestsForCurrentMinute() {
  const now = new Date();
  const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

  console.log(`[${new Date().toISOString()}] Checking for users with delivery time ${currentTime}...`);

  // Find users whose delivery time matches the current minute
  const users = await prisma.user.findMany({
    where: { deliveryTime: currentTime },
    include: {
      subscriptions: {
        where: { active: true },
        include: { newsletter: true },
      },
    },
  });

  console.log(`Found ${users.length} user(s) to send digests to.`);

  for (const user of users) {
    // Get unincluded inbound emails for active subscriptions
    const newsletterIds = user.subscriptions.map((s) => s.newsletterId);

    const emails = await prisma.inboundEmail.findMany({
      where: {
        userId: user.id,
        newsletterId: { in: newsletterIds },
        included: false,
      },
      include: { newsletter: true },
      orderBy: { receivedAt: "desc" },
    });

    if (emails.length === 0) {
      console.log(`No new emails for ${user.email}, skipping.`);
      continue;
    }

    // Group emails by category then by newsletter
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

    try {
      await sendDigestEmail(user.email, sections);

      // Mark emails as included
      await prisma.inboundEmail.updateMany({
        where: { id: { in: emails.map((e) => e.id) } },
        data: { included: true },
      });

      // Log the digest
      await prisma.digestLog.create({
        data: { userId: user.id, emailCount: emails.length },
      });

      console.log(`Digest sent to ${user.email} with ${emails.length} email(s).`);
    } catch (err) {
      console.error(`Failed to send digest to ${user.email}:`, err);
    }
  }
}

// Run every minute
async function main() {
  console.log("Digest worker started.");
  // Run immediately on start
  await sendDigestsForCurrentMinute();

  // Then run every 60 seconds
  setInterval(sendDigestsForCurrentMinute, 60_000);
}

main().catch(console.error);
