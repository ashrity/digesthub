/**
 * Simulates inbound emails by inserting directly into the database.
 * Picks a random user and a few seeded newsletters, creates subscriptions
 * and InboundEmail records with `included: false` so the digest worker
 * will pick them up at the user's next delivery time.
 *
 * Usage:  npx tsx scripts/simulate-inbound.ts
 */
import "dotenv/config";
import { prisma } from "../src/lib/prisma";

const SAMPLE_EMAILS = [
  {
    subject: "The Rise of Local-First Software",
    htmlBody: `<h2>Local-First Software is Taking Over</h2>
      <p>Developers are increasingly building apps that work offline-first and sync later.
      This paradigm shift promises better performance, privacy, and user ownership of data.</p>
      <p>Key technologies driving this trend: CRDTs, SQLite on the edge, and WebAssembly.</p>
      <ul><li>Linear adopted local-first architecture</li><li>Figma's multiplayer engine uses CRDTs</li><li>New frameworks like ElectricSQL make it accessible</li></ul>`,
  },
  {
    subject: "AI Agents Are Changing How We Code",
    htmlBody: `<h2>The Agent Revolution in Software Development</h2>
      <p>AI coding agents have moved beyond autocomplete. They now handle multi-file refactors,
      write tests, and even debug production issues autonomously.</p>
      <p>What this means for engineering teams and how to adopt agents effectively.</p>`,
  },
  {
    subject: "Weekly Market Recap: Tech Earnings Season",
    htmlBody: `<h2>Big Tech Reports Mixed Results</h2>
      <p>This week saw earnings from major tech companies with surprising results.
      Cloud revenue continues to grow while advertising faces headwinds.</p>
      <p><strong>Winners:</strong> Cloud infrastructure, AI compute</p>
      <p><strong>Losers:</strong> Digital advertising, consumer hardware</p>`,
  },
  {
    subject: "5 Recipes That Changed How I Cook",
    htmlBody: `<h2>Simple Techniques, Big Flavor</h2>
      <p>After years in the kitchen, these five recipes fundamentally changed my approach to cooking:</p>
      <ol><li>Salt-crusted fish — letting the oven do the work</li>
      <li>One-pot dal — the power of bloomed spices</li>
      <li>No-knead bread — patience over effort</li>
      <li>Roasted vegetable soup — caramelization is everything</li>
      <li>Pasta aglio e olio — simplicity perfected</li></ol>`,
  },
  {
    subject: "The Science of Sleep: What New Research Tells Us",
    htmlBody: `<h2>Your Sleep is More Important Than You Think</h2>
      <p>New studies reveal that sleep quality matters more than quantity. Researchers found that
      consistent sleep timing improved cognitive performance by 25% compared to variable schedules.</p>
      <p>Three actionable takeaways from the latest sleep science research.</p>`,
  },
];

async function main() {
  // Find a user
  const user = await prisma.user.findFirst();
  if (!user) {
    console.error("No users found. Register an account first at http://localhost:3000");
    process.exit(1);
  }

  console.log(`Using user: ${user.email} (ingest: ${user.ingestEmail})`);
  console.log(`Delivery time: ${user.deliveryTime} ${user.timezone}\n`);

  // Pick random newsletters from the seeded catalog
  const newsletters = await prisma.newsletter.findMany({
    take: SAMPLE_EMAILS.length,
    orderBy: { createdAt: "desc" },
    where: {
      category: { not: "UNCATEGORIZED" },
    },
  });

  if (newsletters.length === 0) {
    console.error("No newsletters found. Run `npm run db:seed` first.");
    process.exit(1);
  }

  console.log(`Selected ${newsletters.length} newsletters:\n`);

  for (let i = 0; i < Math.min(newsletters.length, SAMPLE_EMAILS.length); i++) {
    const nl = newsletters[i];
    const sample = SAMPLE_EMAILS[i];

    // Ensure subscription exists
    await prisma.subscription.upsert({
      where: {
        userId_newsletterId: { userId: user.id, newsletterId: nl.id },
      },
      create: { userId: user.id, newsletterId: nl.id, active: true },
      update: { active: true },
    });

    // Create inbound email
    await prisma.inboundEmail.create({
      data: {
        userId: user.id,
        newsletterId: nl.id,
        fromEmail: nl.senderEmail,
        subject: sample.subject,
        htmlBody: sample.htmlBody,
        textBody: undefined,
      },
    });

    console.log(`  [${nl.category}] "${nl.name}" — ${sample.subject}`);
  }

  console.log(`\nCreated ${Math.min(newsletters.length, SAMPLE_EMAILS.length)} simulated inbound emails.`);
  console.log(`\nNext steps:`);
  console.log(`  1. Run the digest worker:  npm run worker:digest`);
  console.log(`  2. Wait for delivery time (${user.deliveryTime}) or update it to the next minute`);
  console.log(`  3. Check ${user.email} for the digest email`);

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error("Failed:", err);
  process.exit(1);
});
