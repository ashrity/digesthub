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
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Browse Newsletters</h1>
      <p className="mt-1 text-gray-600 dark:text-gray-400">Discover newsletters and subscribe to add them to your digest.</p>

      <div className="mt-6 flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          placeholder="Search newsletters..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded-xl border border-gray-300 dark:border-navy-600 bg-white dark:bg-navy-800 px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:border-blue-900 focus:ring-1 focus:ring-blue-900 dark:focus:border-amber-500 dark:focus:ring-amber-500 transition-colors"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as Category | "ALL")}
          className="rounded-xl border border-gray-300 dark:border-navy-600 bg-white dark:bg-navy-800 px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:border-blue-900 focus:ring-1 focus:ring-blue-900 dark:focus:border-amber-500 dark:focus:ring-amber-500 transition-colors"
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
          <p className="text-center text-gray-500 dark:text-gray-400 py-8">Loading...</p>
        ) : newsletters.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-navy-800 rounded-2xl border border-gray-100 dark:border-navy-700 shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-blue-900/10 dark:bg-amber-500/15 flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-blue-900 dark:text-amber-400">
                <path fillRule="evenodd" d="M10.5 3.75a6.75 6.75 0 100 13.5 6.75 6.75 0 000-13.5zM2.25 10.5a8.25 8.25 0 1114.59 5.28l4.69 4.69a.75.75 0 11-1.06 1.06l-4.69-4.69A8.25 8.25 0 012.25 10.5z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">No newsletters found</h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400 max-w-md mx-auto">
              Newsletters appear here automatically when users forward emails to their ingest address.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
