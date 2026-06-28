"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const body = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    };

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      let message = "Registration failed";
      try {
        const data = await res.json();
        if (data.error) message = data.error;
      } catch {
        // Response body was empty or not JSON
      }
      setError(message);
      setLoading(false);
      return;
    }

    router.push("/login");
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4">
      <div className="w-full max-w-sm">
        <div className="bg-white dark:bg-navy-800 rounded-2xl shadow-lg dark:shadow-navy-950/50 border border-gray-100 dark:border-navy-700 p-8">
          <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-white">Create your account</h1>
          <p className="mt-1 text-center text-sm text-gray-500 dark:text-gray-400">Start organizing your newsletters</p>
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-lg">{error}</div>
            )}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-navy-600 bg-white dark:bg-navy-900 px-3 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:border-blue-900 focus:ring-1 focus:ring-blue-900 dark:focus:border-amber-500 dark:focus:ring-amber-500 transition-colors"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-navy-600 bg-white dark:bg-navy-900 px-3 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:border-blue-900 focus:ring-1 focus:ring-blue-900 dark:focus:border-amber-500 dark:focus:ring-amber-500 transition-colors"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={8}
                className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-navy-600 bg-white dark:bg-navy-900 px-3 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:border-blue-900 focus:ring-1 focus:ring-blue-900 dark:focus:border-amber-500 dark:focus:ring-amber-500 transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-blue-900 text-white rounded-lg text-sm font-semibold hover:bg-blue-800 disabled:opacity-50 transition-colors dark:bg-amber-500 dark:text-navy-900 dark:hover:bg-amber-400 shadow-sm"
            >
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>
        </div>
        <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-blue-900 hover:text-blue-700 dark:text-amber-400 dark:hover:text-amber-300">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
