"use client";

import Link from "next/link";

export default function MyComplaintsPage() {
  const complaints: any[] = [];

  return (
    <main className="px-6 py-10">
      <div className="mx-auto w-full max-w-7xl">

        {/* Page Header */}
        <div>
          <h2 className="text-3xl font-bold text-gray-900">
            My Complaints
          </h2>

          <p className="mt-2 text-gray-700">
            View your submitted complaints and track their current status.
          </p>
        </div>

        {/* Summary */}
        <section className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

          <div className="rounded-xl border bg-white p-6 shadow-md">
            <p className="text-sm font-semibold text-gray-700">
              Total Complaints
            </p>

            <p className="mt-2 text-3xl font-bold text-blue-600">
              {complaints.length}
            </p>
          </div>

          <div className="rounded-xl border bg-white p-6 shadow-md">
            <p className="text-sm font-semibold text-gray-700">
              Pending
            </p>

            <p className="mt-2 text-3xl font-bold text-yellow-600">
              0
            </p>
          </div>

          <div className="rounded-xl border bg-white p-6 shadow-md">
            <p className="text-sm font-semibold text-gray-700">
              In Progress
            </p>

            <p className="mt-2 text-3xl font-bold text-orange-600">
              0
            </p>
          </div>

          <div className="rounded-xl border bg-white p-6 shadow-md">
            <p className="text-sm font-semibold text-gray-700">
              Resolved
            </p>

            <p className="mt-2 text-3xl font-bold text-green-600">
              0
            </p>
          </div>

        </section>

        {/* Complaints List */}
        <section className="mt-10">

          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Submitted Complaints
              </h2>

              <p className="mt-1 text-gray-600">
                Track the current status of your reported civic problems.
              </p>
            </div>

            <Link
              href="/citizen/complaint"
              className="shrink-0 rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
            >
              + Raise Complaint
            </Link>
          </div>

          {/* Empty State */}
          <div className="mt-6 rounded-2xl border bg-white p-10 text-center shadow-md">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-3xl">
              📋
            </div>

            <h3 className="mt-5 text-xl font-bold text-gray-900">
              No Complaints Yet
            </h3>

            <p className="mx-auto mt-2 max-w-md text-gray-600">
              You have not submitted any civic complaints yet. Once you
              submit a complaint, it will appear here.
            </p>

            <Link
              href="/citizen/complaint"
              className="mt-6 inline-block rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
            >
              Raise Your First Complaint
            </Link>

          </div>

        </section>

      </div>
    </main>
  );
}