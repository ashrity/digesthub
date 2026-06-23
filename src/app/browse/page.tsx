"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, useCallback } from "react";
import NewsletterCard from "@/components/NewsletterCard";
import { CATEGORY_LABELS } from "@/lib/categorize";
import type { Category } from "../../generated/prisma/enums";

interface NewsletterData {
  id: string;
  name: string;
  description: string | null;
  category: Category;
  subscriptions: { id: string }[];
  _count: { subscriptions: number };
}

const ALL_CATEGORIES: (Category | "ALL")[] = [
  "ALL",
  "TECHNOLOGY",
  "BUSINESS",
  "FINANCE",
  "HEALTH",
  "SCIENCE",
  "SPORTS",
  "ENTERTAINMENT",
  "POLITICS",
  "AUTOMOTIVE",
  "DESIGN",
  "FOOD",
  "TRAVEL",
  "EDUCATION",
  "GAMING",
  "LIFESTYLE",
  "UNCATEGORIZED",
];

export default function BrowsePage() {
  const { status } = useSession();
  const [newsletters, setNewsletters] = useState<NewsletterData[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<Category | "ALL">("ALL");
  const [loading, setLoading] = useState(true);

  const fetchNewsletters = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (category !== "ALL") params.set("category", category);
    if (search) params.set("search", search);

    const res = await fetch(`/api/newsletters?${params}`);
    setNewsletters(await res.json());
    setLoading(false);
  }, [category, search]);

  useEffect(() => {
    fetchNewsletters();
  }, [fetchNewsletters]);

  async function handleToggle(newsletterId: string, subscribe: boolean) {
    if (status !== "authenticated") {
      window.location.href = "/login";
      return;
    }

    if (subscribe) {
      await fetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newsletterId }),
      });
    } else {
      await fetch("/api/subscriptions", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newsletterId }),
      });
    }

    fetchNewsletters();
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900">Browse Newsletters</h1>
      <p className="mt-1 text-gray-600">Discover newsletters and subscribe to add them to your digest.</p>

      <div className="mt-6 flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          placeholder="Search newsletters..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as Category | "ALL")}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          {ALL_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat === "ALL" ? "All Categories" : CATEGORY_LABELS[cat]}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-8">
        {loading ? (
          <p className="text-center text-gray-500 py-8">Loading...</p>
        ) : newsletters.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">No newsletters found</h2>
            <p className="mt-2 text-gray-600">
              Newsletters appear here automatically when users forward emails to their ingest address.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {newsletters.map((nl) => (
              <NewsletterCard
                key={nl.id}
                id={nl.id}
                name={nl.name}
                description={nl.description}
                category={nl.category}
                subscriberCount={nl._count.subscriptions}
                isSubscribed={nl.subscriptions?.length > 0}
                onToggle={handleToggle}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
