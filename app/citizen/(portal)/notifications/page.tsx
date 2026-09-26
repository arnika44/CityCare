"use client";

import Link from "next/link";

export default function NotificationsPage() {
  return (
    <main className="px-6 py-10">
      <div className="mx-auto w-full max-w-5xl">

        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">
            Notifications
          </h2>

          <p className="mt-2 text-gray-700">
            Stay updated about your complaints and their progress.
          </p>
        </div>

        {/* Notification Summary */}
        <div className="mb-8 grid gap-5 md:grid-cols-3">

          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-gray-700">
              Total Notifications
            </p>

            <p className="mt-2 text-3xl font-bold text-blue-600">
              0
            </p>
          </div>

          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-gray-700">
              Complaint Updates
            </p>

            <p className="mt-2 text-3xl font-bold text-orange-600">
              0
            </p>
          </div>

          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-gray-700">
              Resolved
            </p>

            <p className="mt-2 text-3xl font-bold text-green-600">
              0
            </p>
          </div>

        </div>

        {/* Empty Notifications */}
        <div className="rounded-2xl border bg-white p-10 text-center shadow-md">

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-3xl">
            🔔
          </div>

          <h3 className="mt-5 text-xl font-bold text-gray-900">
            No Notifications Yet
          </h3>

          <p className="mx-auto mt-2 max-w-md text-gray-600">
            You will receive notifications here when your complaints are
            submitted, updated, or resolved.
          </p>

        </div>

        {/* Back */}
        <Link
          href="/citizen/dashboard"
          className="mt-6 inline-block font-semibold text-blue-600 hover:underline"
        >
          ← Back to Dashboard
        </Link>

      </div>
    </main>
  );
}