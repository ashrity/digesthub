import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import { categorizeNewsletter } from "../src/lib/categorize";
import { Category } from "../src/generated/prisma/enums";
import { ScrapedNewsletter } from "./scrapers/types";
import { normalizeName, generatePlaceholderEmail } from "./scrapers/utils";
import { scrapeSubstack } from "./scrapers/substack";
import { scrapeBeehiiv } from "./scrapers/beehiiv";

// Map source categories to our Category enum
const CATEGORY_MAP: Record<string, Category> = {
  technology: "TECHNOLOGY",
  business: "BUSINESS",
  finance: "FINANCE",
  culture: "ENTERTAINMENT",
  entertainment: "ENTERTAINMENT",
  politics: "POLITICS",
  science: "SCIENCE",
  health: "HEALTH",
  food: "FOOD",
  sports: "SPORTS",
  faith: "LIFESTYLE",
  lifestyle: "LIFESTYLE",
  education: "EDUCATION",
  music: "ENTERTAINMENT",
  art: "DESIGN",
  design: "DESIGN",
  climate: "SCIENCE",
  travel: "TRAVEL",
  automotive: "AUTOMOTIVE",
  gaming: "GAMING",
  general: "UNCATEGORIZED",
};

function mapCategory(newsletter: ScrapedNewsletter): Category {
  // Try explicit mapping first
  const mapped = CATEGORY_MAP[newsletter.sourceCategory];
  if (mapped && mapped !== "UNCATEGORIZED") return mapped;

  // Fallback to keyword-based categorization
  const category = categorizeNewsletter(
    newsletter.name,
    newsletter.description,
    ""
  );
  return category;
}

function dedup(newsletters: ScrapedNewsletter[]): ScrapedNewsletter[] {
  const seen = new Map<string, ScrapedNewsletter>();

  for (const nl of newsletters) {
    const key = normalizeName(nl.name);
    if (!key) continue;

    // Prefer entry with more data
    const existing = seen.get(key);
    if (
      !existing ||
      nl.description.length > existing.description.length
    ) {
      seen.set(key, nl);
    }
  }

  return Array.from(seen.values());
}

async function main() {
  console.log("Starting newsletter catalog seed...\n");

  // Scrape both sources, continue if one fails
  const allNewsletters: ScrapedNewsletter[] = [];

  const [substackResults, beehiivResults] = await Promise.allSettled([
    scrapeSubstack(),
    scrapeBeehiiv(),
  ]);

  if (substackResults.status === "fulfilled") {
    allNewsletters.push(...substackResults.value);
  } else {
    console.error("Substack scraping failed entirely:", substackResults.reason);
  }

  if (beehiivResults.status === "fulfilled") {
    allNewsletters.push(...beehiivResults.value);
  } else {
    console.error("Beehiiv scraping failed entirely:", beehiivResults.reason);
  }

  console.log(`\nTotal scraped (before dedup): ${allNewsletters.length}`);

  const unique = dedup(allNewsletters);
  console.log(`After dedup: ${unique.length} newsletters\n`);

  // Upsert into database
  let upserted = 0;
  let errors = 0;

  for (const nl of unique) {
    const senderEmail = generatePlaceholderEmail(nl.source, nl.name);
    const category = mapCategory(nl);

    try {
      await prisma.newsletter.upsert({
        where: { senderEmail },
        create: {
          name: nl.name,
          senderEmail,
          description: nl.description || null,
          category,
          websiteUrl: nl.websiteUrl || null,
        },
        update: {
          name: nl.name,
          description: nl.description || undefined,
          category,
          websiteUrl: nl.websiteUrl || undefined,
        },
      });
      upserted++;

      if (upserted % 50 === 0) {
        console.log(`  Upserted ${upserted}/${unique.length}...`);
      }
    } catch (err) {
      errors++;
      if (errors <= 2) {
        console.error(`  Failed to upsert "${nl.name}":`, err);
      }
    }
  }

  console.log(`\nSeed complete!`);
  console.log(`  Upserted: ${upserted}`);
  console.log(`  Errors: ${errors}`);

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
