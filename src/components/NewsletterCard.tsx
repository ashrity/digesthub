"use client";

import { CATEGORY_LABELS } from "@/lib/categorize";
import type { Category } from "../generated/prisma/enums";

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
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 truncate">{name}</h3>
          <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full bg-indigo-50 text-indigo-700">
            {CATEGORY_LABELS[category] || category}
          </span>
          {description && (
            <p className="mt-2 text-sm text-gray-600 line-clamp-2">{description}</p>
          )}
          <p className="mt-2 text-xs text-gray-400">
            {subscriberCount} subscriber{subscriberCount !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={() => onToggle(id, !isSubscribed)}
          className={`ml-4 shrink-0 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            isSubscribed
              ? "bg-gray-100 text-gray-700 hover:bg-red-50 hover:text-red-600"
              : "bg-indigo-600 text-white hover:bg-indigo-700"
          }`}
        >
          {isSubscribed ? "Unsubscribe" : "Subscribe"}
        </button>
      </div>
    </div>
  );
}
