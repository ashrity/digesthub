export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function generatePlaceholderEmail(
  source: string,
  name: string
): string {
  return `${source}-${slugify(name)}@catalog.onedigest.app`;
}

export function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\b(the|newsletter)\b/g, "")
    .replace(/[^a-z0-9]/g, "")
    .trim();
}

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchWithRetry(
  url: string,
  retries = 3
): Promise<string> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        },
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status} for ${url}`);
      }
      return await res.text();
    } catch (err) {
      if (attempt === retries) throw err;
      const backoff = 1500 * Math.pow(2, attempt - 1);
      console.log(`  Retry ${attempt}/${retries} after ${backoff}ms...`);
      await delay(backoff);
    }
  }
  throw new Error("Unreachable");
}
