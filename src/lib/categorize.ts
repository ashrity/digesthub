import { Category } from "../generated/prisma/enums";

const CATEGORY_KEYWORDS: Record<Category, string[]> = {
  TECHNOLOGY: ["tech", "software", "programming", "code", "developer", "ai", "startup", "saas", "cyber", "cloud", "data"],
  BUSINESS: ["business", "entrepreneur", "startup", "management", "leadership", "strategy", "marketing"],
  FINANCE: ["finance", "investing", "stock", "crypto", "money", "wealth", "trading", "market", "economy"],
  HEALTH: ["health", "fitness", "wellness", "medical", "nutrition", "mental health", "workout"],
  SCIENCE: ["science", "research", "biology", "physics", "chemistry", "space", "climate"],
  SPORTS: ["sports", "nfl", "nba", "mlb", "soccer", "football", "basketball", "baseball", "athletics"],
  ENTERTAINMENT: ["entertainment", "movies", "music", "tv", "celebrity", "streaming", "gaming", "pop culture"],
  POLITICS: ["politics", "policy", "government", "election", "congress", "democrat", "republican"],
  AUTOMOTIVE: ["automotive", "cars", "vehicles", "electric vehicle", "ev", "motor", "driving", "auto"],
  DESIGN: ["design", "ux", "ui", "graphic", "typography", "creative", "illustration"],
  FOOD: ["food", "recipe", "cooking", "restaurant", "chef", "baking", "cuisine"],
  TRAVEL: ["travel", "destination", "flight", "hotel", "tourism", "adventure", "vacation"],
  EDUCATION: ["education", "learning", "teaching", "course", "university", "study", "academic"],
  GAMING: ["gaming", "game", "esports", "playstation", "xbox", "nintendo", "pc gaming"],
  LIFESTYLE: ["lifestyle", "fashion", "home", "diy", "parenting", "relationship", "self-improvement"],
  UNCATEGORIZED: [],
};

export function categorizeNewsletter(
  name: string,
  subject: string,
  body: string
): Category {
  const text = `${name} ${subject} ${body}`.toLowerCase();

  let bestCategory: Category = "UNCATEGORIZED";
  let bestScore = 0;

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (category === "UNCATEGORIZED") continue;

    let score = 0;
    for (const keyword of keywords) {
      if (text.includes(keyword)) score++;
    }

    if (score > bestScore) {
      bestScore = score;
      bestCategory = category as Category;
    }
  }

  return bestCategory;
}

export const CATEGORY_LABELS: Record<Category, string> = {
  TECHNOLOGY: "Technology",
  BUSINESS: "Business",
  FINANCE: "Finance",
  HEALTH: "Health & Wellness",
  SCIENCE: "Science",
  SPORTS: "Sports",
  ENTERTAINMENT: "Entertainment",
  POLITICS: "Politics",
  AUTOMOTIVE: "Automotive",
  DESIGN: "Design",
  FOOD: "Food & Cooking",
  TRAVEL: "Travel",
  EDUCATION: "Education",
  GAMING: "Gaming",
  LIFESTYLE: "Lifestyle",
  UNCATEGORIZED: "Uncategorized",
};
