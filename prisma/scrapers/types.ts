export interface ScrapedNewsletter {
  name: string;
  description: string;
  websiteUrl: string;
  source: "substack" | "beehiiv";
  sourceCategory: string;
}
