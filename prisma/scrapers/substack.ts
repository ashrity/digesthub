import { ScrapedNewsletter } from "./types";
import { delay } from "./utils";

// Valid Substack category IDs discovered via their API
// Each returns 25 publications per page with pagination
const SUBSTACK_CATEGORIES: { id: number; name: string }[] = [
  { id: 4, name: "technology" },
  { id: 11, name: "culture" },
  { id: 18, name: "politics" },
  { id: 34, name: "business" },
  { id: 96, name: "finance" },
  { id: 103, name: "science" },
  { id: 109, name: "health" },
  { id: 114, name: "sports" },
  { id: 118, name: "food" },
];

interface SubstackApiResponse {
  publications: SubstackPublication[];
  more: boolean;
}

interface SubstackPublication {
  name?: string;
  subdomain?: string;
  custom_domain?: string;
  hero_text?: string;
  type?: string;
}

export async function scrapeSubstack(): Promise<ScrapedNewsletter[]> {
  const results: ScrapedNewsletter[] = [];

  for (const category of SUBSTACK_CATEGORIES) {
    try {
      console.log(`[substack] Fetching category: ${category.name} (id=${category.id})...`);
      let page = 0;
      let categoryCount = 0;

      while (page < 8) {
        const url = `https://substack.com/api/v1/category/public/${category.id}/all?page=${page}`;
        const res = await fetchSubstackApi(url);

        if (!res || !res.publications || res.publications.length === 0) break;

        for (const pub of res.publications) {
          if (!pub.name) continue;

          const websiteUrl = pub.custom_domain
            ? `https://${pub.custom_domain}`
            : pub.subdomain
              ? `https://${pub.subdomain}.substack.com`
              : "";

          results.push({
            name: pub.name,
            description: pub.hero_text || "",
            websiteUrl,
            source: "substack",
            sourceCategory: category.name,
          });
          categoryCount++;
        }

        if (!res.more) break;
        page++;
        await delay(2000);
      }

      console.log(`[substack] Category ${category.name}: found ${categoryCount} newsletters`);
      await delay(1500);
    } catch (err) {
      console.error(
        `[substack] Failed category ${category.name}:`,
        (err as Error).message
      );
    }
  }

  console.log(`[substack] Total scraped: ${results.length} newsletters`);
  return results;
}

async function fetchSubstackApi(
  url: string,
  retries = 3
): Promise<SubstackApiResponse | null> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Accept: "application/json",
        },
      });

      if (res.status === 429) {
        const backoff = 5000 * attempt;
        console.log(`  Rate limited, waiting ${backoff}ms...`);
        await delay(backoff);
        continue;
      }

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      return (await res.json()) as SubstackApiResponse;
    } catch (err) {
      if (attempt === retries) {
        console.error(`  Failed after ${retries} attempts: ${(err as Error).message}`);
        return null;
      }
      const backoff = 2000 * Math.pow(2, attempt - 1);
      console.log(`  Retry ${attempt}/${retries} after ${backoff}ms...`);
      await delay(backoff);
    }
  }
  return null;
}
