import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4">
      <div className="max-w-2xl text-center">
        <h1 className="text-5xl font-bold text-gray-900 tracking-tight">
          All Your Newsletters.
          <br />
          <span className="text-indigo-600">One Daily Email.</span>
        </h1>
        <p className="mt-6 text-lg text-gray-600 leading-relaxed">
          Stop drowning in newsletter emails. OneDigest collects all your subscriptions
          and delivers them in a single, organized digest at the time you choose —
          grouped by category so you can find what matters fast.
        </p>
        <div className="mt-10 flex gap-4 justify-center">
          <Link
            href="/register"
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
          >
            Get Started
          </Link>
          <Link
            href="/login"
            className="px-6 py-3 bg-white text-gray-700 rounded-lg font-medium border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            Sign In
          </Link>
        </div>
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8 text-left">
          <div>
            <h3 className="font-semibold text-gray-900">Unified Inbox</h3>
            <p className="mt-2 text-sm text-gray-600">
              Forward newsletters to your unique OneDigest address. We collect and organize them for you.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Category Grouping</h3>
            <p className="mt-2 text-sm text-gray-600">
              Newsletters are auto-categorized into sections like Tech, Finance, Automotive, and more.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Your Schedule</h3>
            <p className="mt-2 text-sm text-gray-600">
              Pick the time you want your digest delivered. Morning, afternoon, or evening — your call.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
