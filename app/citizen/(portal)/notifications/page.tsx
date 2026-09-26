"use client";

import Link from "next/link";

const notifications = [
  {
    id: 1,
    icon: "📝",
    title: "Complaint Submitted",
    message:
      "Your complaint has been successfully submitted and is waiting for verification.",
    time: "Just now",
    type: "info",
  },
  {
    id: 2,
    icon: "🔄",
    title: "Complaint Status Updated",
    message:
      "Your complaint status will appear here whenever the department updates it.",
    time: "2 hours ago",
    type: "update",
  },
  {
    id: 3,
    icon: "✅",
    title: "Complaint Resolved",
    message:
      "Resolved complaint notifications will appear here after the department completes the work.",
    time: "Yesterday",
    type: "success",
  },
];

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
              3
            </p>
          </div>

          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-gray-700">
              Complaint Updates
            </p>

            <p className="mt-2 text-3xl font-bold text-orange-600">
              2
            </p>
          </div>

          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-gray-700">
              Resolved
            </p>

            <p className="mt-2 text-3xl font-bold text-green-600">
              1
            </p>
          </div>
        </div>

        {/* Notifications */}
        <div className="rounded-2xl border bg-white shadow-md">
          <div className="border-b px-6 py-5">
            <h3 className="text-xl font-bold text-gray-900">
              Recent Notifications
            </h3>
          </div>

          <div className="divide-y">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className="flex gap-4 px-6 py-6 hover:bg-gray-50 transition"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-2xl">
                  {notification.icon}
                </div>

                <div className="flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h4 className="font-bold text-gray-900">
                      {notification.title}
                    </h4>

                    <span className="text-sm text-gray-600">
                      {notification.time}
                    </span>
                  </div>

                  <p className="mt-2 text-gray-700">
                    {notification.message}
                  </p>
                </div>
              </div>
            ))}
          </div>
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