"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";

const TIMEZONES = [
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Anchorage",
  "Pacific/Honolulu",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Asia/Tokyo",
  "Asia/Shanghai",
  "Asia/Kolkata",
  "Australia/Sydney",
];

export default function SettingsPage() {
  const { status } = useSession();
  const router = useRouter();
  const [deliveryTime, setDeliveryTime] = useState("07:00");
  const [timezone, setTimezone] = useState("America/New_York");
  const [ingestEmail, setIngestEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    const res = await fetch("/api/settings");
    const data = await res.json();
    setDeliveryTime(data.deliveryTime);
    setTimezone(data.timezone);
    setIngestEmail(data.ingestEmail);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (status === "authenticated") fetchSettings();
  }, [status, router, fetchSettings]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);

    await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deliveryTime, timezone }),
    });

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
      <p className="mt-1 text-gray-600">Configure your digest delivery preferences.</p>

      <div className="mt-8 bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900">Your Ingest Email</h2>
        <p className="mt-1 text-sm text-gray-600">
          Forward your newsletter subscriptions to this address. Incoming emails will be collected for your digest.
        </p>
        <div className="mt-3 flex items-center gap-3">
          <code className="flex-1 bg-gray-50 border border-gray-200 rounded-md px-4 py-2 text-sm font-mono text-indigo-600">
            {ingestEmail}
          </code>
          <button
            onClick={() => navigator.clipboard.writeText(ingestEmail)}
            className="px-3 py-2 text-sm bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            Copy
          </button>
        </div>
      </div>

      <form onSubmit={handleSave} className="mt-6 bg-white rounded-lg border border-gray-200 p-6 space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Delivery Schedule</h2>
          <p className="mt-1 text-sm text-gray-600">
            Choose when you want to receive your daily digest email.
          </p>
        </div>

        <div>
          <label htmlFor="deliveryTime" className="block text-sm font-medium text-gray-700">
            Delivery Time
          </label>
          <input
            id="deliveryTime"
            type="time"
            value={deliveryTime}
            onChange={(e) => setDeliveryTime(e.target.value)}
            className="mt-1 block w-full max-w-xs rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label htmlFor="timezone" className="block text-sm font-medium text-gray-700">
            Timezone
          </label>
          <select
            id="timezone"
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className="mt-1 block w-full max-w-xs rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            {TIMEZONES.map((tz) => (
              <option key={tz} value={tz}>
                {tz.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {saving ? "Saving..." : "Save Settings"}
          </button>
          {saved && <span className="text-sm text-green-600">Settings saved!</span>}
        </div>
      </form>
    </div>
  );
}
