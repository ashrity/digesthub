"use client";

import { CATEGORY_LABELS } from "@/lib/categorize";
import type { Category } from "../generated/prisma/enums";
import CategoryIcon from "./CategoryIcon";

const CATEGORY_BADGE: Partial<Record<Category, string>> = {
  TECHNOLOGY: "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400",
  BUSINESS: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  FINANCE: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  HEALTH: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
  SCIENCE: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
  SPORTS: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  ENTERTAINMENT: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
  POLITICS: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  AUTOMOTIVE: "bg-slate-100 text-slate-700 dark:bg-slate-800/50 dark:text-slate-400",
  DESIGN: "bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900/30 dark:text-fuchsia-400",
  FOOD: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  TRAVEL: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400",
  EDUCATION: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
  GAMING: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  LIFESTYLE: "bg-lime-100 text-lime-700 dark:bg-lime-900/30 dark:text-lime-400",
  UNCATEGORIZED: "bg-gray-100 text-gray-600 dark:bg-gray-800/50 dark:text-gray-400",
};

interface NewsletterCardProps {
  id: string;
  name: string;
  description: string | null;
  category: Category;
  subscriberCount: number;
  isSubscribed: boolean;
  onToggle: (newsletterId: string, subscribe: boolean) => void;
}

export default function NewsletterCard({
  id,
  name,
  description,
  category,
  subscriberCount,
  isSubscribed,
  onToggle,
}: NewsletterCardProps) {
  const badgeColor = CATEGORY_BADGE[category] || CATEGORY_BADGE.UNCATEGORIZED;

  return (
    <div className="bg-white dark:bg-navy-800 rounded-2xl border border-gray-200 dark:border-navy-600 p-5 hover:shadow-lg dark:hover:shadow-navy-950/50 transition-all flex flex-col h-full">
      <div className="flex items-start gap-3 mb-3">
        <CategoryIcon category={category} size="lg" />
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-gray-900 dark:text-white truncate leading-tight">{name}</h3>
          <span className={`inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full ${badgeColor}`}>
            {CATEGORY_LABELS[category] || category}
          </span>
        </div>
      </div>
      {description && (
        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mb-3 flex-1">{description}</p>
      )}
      {!description && <div className="flex-1" />}
      <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100 dark:border-navy-700">
        <p className="text-xs text-gray-400 dark:text-gray-500">
          {subscriberCount} subscriber{subscriberCount !== 1 ? "s" : ""}
        </p>
        <button
          onClick={() => onToggle(id, !isSubscribed)}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
            isSubscribed
              ? "bg-gray-100 text-gray-700 hover:bg-red-50 hover:text-red-600 dark:bg-navy-700 dark:text-gray-300 dark:hover:bg-red-900/30 dark:hover:text-red-400"
              : "bg-blue-900 text-white hover:bg-blue-800 dark:bg-amber-500 dark:text-navy-900 dark:hover:bg-amber-400 shadow-sm"
          }`}
        >
          {isSubscribed ? "Unsubscribe" : "Subscribe"}
        </button>
      </div>
    </div>
  );
}
