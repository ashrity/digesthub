import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-950 via-blue-900 to-navy-800">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent" />
        <div className="relative max-w-3xl mx-auto text-center px-4 py-24 sm:py-32">
          <h1 className="text-5xl sm:text-6xl font-bold text-white tracking-tight leading-tight">
            All Your Newsletters.
            <br />
            <span className="text-amber-400">One Daily Email.</span>
          </h1>
          <p className="mt-6 text-lg text-blue-100/80 leading-relaxed max-w-xl mx-auto">
            Stop drowning in newsletter emails. OneDigest collects all your subscriptions
            and delivers them in a single, organized digest at the time you choose.
          </p>
          <div className="mt-10 flex gap-4 justify-center">
            <Link
              href="/register"
              className="px-7 py-3 bg-amber-500 text-blue-950 rounded-xl font-semibold hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/25 hover:shadow-amber-400/30"
            >
              Get Started
            </Link>
            <Link
              href="/login"
              className="px-7 py-3 bg-white/10 text-white rounded-xl font-semibold border border-white/20 hover:bg-white/20 backdrop-blur-sm transition-all"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-4xl mx-auto px-4 py-20">
        <h2 className="text-center text-2xl font-bold text-gray-900 dark:text-white mb-12">
          How it works
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-navy-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-navy-700">
            <div className="w-12 h-12 rounded-xl bg-blue-900/10 dark:bg-amber-500/15 flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-blue-900 dark:text-amber-400">
                <path d="M1.5 8.67v8.58a3 3 0 003 3h15a3 3 0 003-3V8.67l-8.928 5.493a3 3 0 01-3.144 0L1.5 8.67z" />
                <path d="M22.5 6.908V6.75a3 3 0 00-3-3h-15a3 3 0 00-3 3v.158l9.714 5.978a1.5 1.5 0 001.572 0L22.5 6.908z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white text-lg">Unified Inbox</h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              Forward newsletters to your unique OneDigest address. We collect and organize them for you.
            </p>
          </div>
          <div className="bg-white dark:bg-navy-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-navy-700">
            <div className="w-12 h-12 rounded-xl bg-blue-900/10 dark:bg-amber-500/15 flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-blue-900 dark:text-amber-400">
                <path fillRule="evenodd" d="M2.25 4.125c0-1.036.84-1.875 1.875-1.875h5.25c1.036 0 1.875.84 1.875 1.875V17.25a4.5 4.5 0 11-9 0V4.125zm4.5 14.25a1.125 1.125 0 100-2.25 1.125 1.125 0 000 2.25z" clipRule="evenodd" />
                <path d="M10.719 21.75h9.156c1.036 0 1.875-.84 1.875-1.875v-5.25c0-1.036-.84-1.875-1.875-1.875h-.14l-8.742 8.743c-.09.089-.18.175-.274.257zM12.738 17.625l6.474-6.474a1.875 1.875 0 00-1.337-.551H10.5v5.25a4.502 4.502 0 002.238 3.775z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white text-lg">Smart Categories</h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              Newsletters are auto-categorized into sections like Tech, Finance, Automotive, and more.
            </p>
          </div>
          <div className="bg-white dark:bg-navy-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-navy-700">
            <div className="w-12 h-12 rounded-xl bg-blue-900/10 dark:bg-amber-500/15 flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-blue-900 dark:text-amber-400">
                <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 00-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 000-1.5h-3.75V6z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white text-lg">Your Schedule</h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              Pick the time you want your digest delivered. Morning, afternoon, or evening — your call.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
