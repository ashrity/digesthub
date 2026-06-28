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
  const [copied, setCopied] = useState(false);

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

  function handleCopy() {
    navigator.clipboard.writeText(ingestEmail);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <p className="text-gray-500 dark:text-gray-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
      <p className="mt-1 text-gray-600 dark:text-gray-400">Configure your digest delivery preferences.</p>

      <div className="mt-8 bg-white dark:bg-navy-800 rounded-2xl border border-gray-100 dark:border-navy-700 shadow-sm p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-900/10 dark:bg-amber-500/15 flex items-center justify-center shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-blue-900 dark:text-amber-400">
              <path d="M1.5 8.67v8.58a3 3 0 003 3h15a3 3 0 003-3V8.67l-8.928 5.493a3 3 0 01-3.144 0L1.5 8.67z" />
              <path d="M22.5 6.908V6.75a3 3 0 00-3-3h-15a3 3 0 00-3 3v.158l9.714 5.978a1.5 1.5 0 001.572 0L22.5 6.908z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Your Ingest Email</h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Forward your newsletter subscriptions to this address.
            </p>
            <div className="mt-3 flex items-center gap-3">
              <code className="flex-1 bg-gray-50 dark:bg-navy-900 border border-gray-200 dark:border-navy-600 rounded-lg px-4 py-2.5 text-sm font-mono text-blue-900 dark:text-amber-400 truncate">
                {ingestEmail}
              </code>
              <button
                onClick={handleCopy}
                className="px-4 py-2.5 text-sm font-medium bg-gray-100 dark:bg-navy-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-navy-600 transition-colors shrink-0"
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="mt-6 bg-white dark:bg-navy-800 rounded-2xl border border-gray-100 dark:border-navy-700 shadow-sm p-6 space-y-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-900/10 dark:bg-amber-500/15 flex items-center justify-center shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-blue-900 dark:text-amber-400">
              <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 00-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 000-1.5h-3.75V6z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Delivery Schedule</h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Choose when you want to receive your daily digest email.
            </p>
          </div>
        </div>

        <div>
          <label htmlFor="deliveryTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Delivery Time
          </label>
          <input
            id="deliveryTime"
            type="time"
            value={deliveryTime}
            onChange={(e) => setDeliveryTime(e.target.value)}
            className="mt-1 block w-full max-w-xs rounded-lg border border-gray-300 dark:border-navy-600 bg-white dark:bg-navy-900 px-3 py-2.5 text-sm text-gray-900 dark:text-white focus:border-blue-900 focus:ring-1 focus:ring-blue-900 dark:focus:border-amber-500 dark:focus:ring-amber-500 transition-colors"
          />
        </div>

        <div>
          <label htmlFor="timezone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Timezone
          </label>
          <select
            id="timezone"
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className="mt-1 block w-full max-w-xs rounded-lg border border-gray-300 dark:border-navy-600 bg-white dark:bg-navy-900 px-3 py-2.5 text-sm text-gray-900 dark:text-white focus:border-blue-900 focus:ring-1 focus:ring-blue-900 dark:focus:border-amber-500 dark:focus:ring-amber-500 transition-colors"
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
            className="px-5 py-2.5 bg-blue-900 text-white rounded-lg text-sm font-semibold hover:bg-blue-800 disabled:opacity-50 transition-colors dark:bg-amber-500 dark:text-navy-900 dark:hover:bg-amber-400 shadow-sm"
          >
            {saving ? "Saving..." : "Save Settings"}
          </button>
          {saved && <span className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">Settings saved!</span>}
        </div>
      </form>
    </div>
  );
}
