"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import SubscriptionToggle from "@/components/SubscriptionToggle";
import CategoryIcon from "@/components/CategoryIcon";
import { CATEGORY_LABELS } from "@/lib/categorize";
import type { Category } from "../../generated/prisma/enums";

interface Newsletter {
  id: string;
  name: string;
  senderEmail: string;
  category: Category;
}

interface Subscription {
  id: string;
  active: boolean;
  newsletterId: string;
  newsletter: Newsletter;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [settings, setSettings] = useState<{ ingestEmail: string; deliveryTime: string } | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    const [subsRes, settingsRes] = await Promise.all([
      fetch("/api/subscriptions"),
      fetch("/api/settings"),
    ]);
    setSubscriptions(await subsRes.json());
    setSettings(await settingsRes.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (status === "authenticated") fetchData();
  }, [status, router, fetchData]);

  async function toggleSubscription(sub: Subscription) {
    await fetch("/api/subscriptions", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newsletterId: sub.newsletterId, active: !sub.active }),
    });
    setSubscriptions((prev) =>
      prev.map((s) => (s.id === sub.id ? { ...s, active: !s.active } : s))
    );
  }

  async function removeSubscription(sub: Subscription) {
    await fetch("/api/subscriptions", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newsletterId: sub.newsletterId }),
    });
    setSubscriptions((prev) => prev.filter((s) => s.id !== sub.id));
  }

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <p className="text-gray-500 dark:text-gray-400">Loading...</p>
      </div>
    );
  }

  const grouped = subscriptions.reduce<Record<string, Subscription[]>>((acc, sub) => {
    const cat = sub.newsletter.category;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(sub);
    return acc;
  }, {});

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Welcome back, {session?.user?.name || session?.user?.email}
          </p>
        </div>
        {settings && (
          <div className="text-right text-sm">
            <p className="text-gray-500 dark:text-gray-400">Your ingest email:</p>
            <code className="text-blue-900 dark:text-amber-400 font-mono bg-blue-50 dark:bg-amber-500/10 px-2.5 py-1 rounded-lg text-xs">
              {settings.ingestEmail}
            </code>
            <p className="mt-2 text-gray-500 dark:text-gray-400">
              Digest delivery: <span className="font-medium text-gray-700 dark:text-gray-200">{settings.deliveryTime}</span>
            </p>
          </div>
        )}
      </div>

      {subscriptions.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-navy-800 rounded-2xl border border-gray-100 dark:border-navy-700 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-blue-900/10 dark:bg-amber-500/15 flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-blue-900 dark:text-amber-400">
              <path d="M1.5 8.67v8.58a3 3 0 003 3h15a3 3 0 003-3V8.67l-8.928 5.493a3 3 0 01-3.144 0L1.5 8.67z" />
              <path d="M22.5 6.908V6.75a3 3 0 00-3-3h-15a3 3 0 00-3 3v.158l9.714 5.978a1.5 1.5 0 001.572 0L22.5 6.908z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">No subscriptions yet</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400 max-w-md mx-auto">
            Forward newsletters to your ingest email above, or browse the catalog to subscribe.
          </p>
          <a
            href="/browse"
            className="inline-block mt-6 px-5 py-2.5 bg-blue-900 text-white rounded-lg text-sm font-semibold hover:bg-blue-800 dark:bg-amber-500 dark:text-navy-900 dark:hover:bg-amber-400 shadow-sm transition-colors"
          >
            Browse Newsletters
          </a>
        </div>
      ) : (
        <div className="space-y-10">
          {Object.entries(grouped).map(([category, subs]) => (
            <div key={category}>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-navy-700 pb-2 mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-900 dark:bg-amber-500" />
                {CATEGORY_LABELS[category as Category] || category}
                <span className="ml-1 text-sm font-normal text-gray-500 dark:text-gray-400">
                  ({subs.length})
                </span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {subs.map((sub) => (
                  <div
                    key={sub.id}
                    className={`bg-white dark:bg-navy-800 rounded-2xl border border-gray-200 dark:border-navy-700 p-5 hover:shadow-lg dark:hover:shadow-navy-950/30 transition-all flex flex-col ${
                      !sub.active ? "opacity-60" : ""
                    }`}
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <CategoryIcon category={sub.newsletter.category} />
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-gray-900 dark:text-white truncate">{sub.newsletter.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{sub.newsletter.senderEmail}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100 dark:border-navy-700">
                      <SubscriptionToggle
                        active={sub.active}
                        onToggle={() => toggleSubscription(sub)}
                      />
                      <button
                        onClick={() => removeSubscription(sub)}
                        className="text-sm text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
