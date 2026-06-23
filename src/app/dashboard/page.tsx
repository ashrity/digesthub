"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import SubscriptionToggle from "@/components/SubscriptionToggle";
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
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  // Group subscriptions by category
  const grouped = subscriptions.reduce<Record<string, Subscription[]>>((acc, sub) => {
    const cat = sub.newsletter.category;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(sub);
    return acc;
  }, {});

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-gray-600">
            Welcome back, {session?.user?.name || session?.user?.email}
          </p>
        </div>
        {settings && (
          <div className="text-right text-sm">
            <p className="text-gray-500">Your ingest email:</p>
            <code className="text-indigo-600 font-mono bg-indigo-50 px-2 py-1 rounded">
              {settings.ingestEmail}
            </code>
            <p className="mt-2 text-gray-500">
              Digest delivery: <span className="font-medium text-gray-700">{settings.deliveryTime}</span>
            </p>
          </div>
        )}
      </div>

      {subscriptions.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">No subscriptions yet</h2>
          <p className="mt-2 text-gray-600">
            Forward newsletters to your ingest email above, or browse the catalog to subscribe.
          </p>
          <a
            href="/browse"
            className="inline-block mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700"
          >
            Browse Newsletters
          </a>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([category, subs]) => (
            <div key={category}>
              <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2 mb-4">
                {CATEGORY_LABELS[category as Category] || category}
                <span className="ml-2 text-sm font-normal text-gray-500">
                  ({subs.length})
                </span>
              </h2>
              <div className="space-y-3">
                {subs.map((sub) => (
                  <div
                    key={sub.id}
                    className="flex items-center justify-between bg-white rounded-lg border border-gray-200 px-4 py-3"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 truncate">{sub.newsletter.name}</p>
                      <p className="text-sm text-gray-500">{sub.newsletter.senderEmail}</p>
                    </div>
                    <div className="flex items-center gap-4 ml-4">
                      <SubscriptionToggle
                        active={sub.active}
                        onToggle={() => toggleSubscription(sub)}
                      />
                      <button
                        onClick={() => removeSubscription(sub)}
                        className="text-sm text-red-500 hover:text-red-700"
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
