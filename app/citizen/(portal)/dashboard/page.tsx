import Link from "next/link";

export default function CitizenDashboard() {
  return (
    <main className="px-6 py-10">
      <div className="mx-auto w-full max-w-7xl">

        {/* Welcome */}
        <div className="rounded-2xl bg-blue-600 p-8 text-white shadow-md">
          <h2 className="text-3xl font-bold">
            Welcome to CityCare 👋
          </h2>

          <p className="mt-3 text-white">
            Report civic problems, track your complaints and stay updated
            about their resolution.
          </p>
        </div>

        {/* Quick Actions */}
        <section className="mt-10">

          <h2 className="text-2xl font-bold text-gray-900">
            Quick Actions
          </h2>

          <p className="mt-2 text-gray-700">
            What would you like to do today?
          </p>

          <div className="mt-6 grid gap-6 md:grid-cols-3">

            <Link
              href="/citizen/complaint"
              className="rounded-2xl border bg-white p-7 shadow-md hover:-translate-y-1 hover:shadow-xl transition"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-100 text-3xl">
                📝
              </div>

              <h3 className="mt-5 text-xl font-bold text-gray-900">
                Raise a Complaint
              </h3>

              <p className="mt-2 text-gray-800">
                Report a civic problem with details, photo, voice and
                location.
              </p>

              <div className="mt-6 inline-block rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white">
                Report Problem
              </div>
            </Link>

            <Link
              href="/citizen/complaints"
              className="rounded-2xl border bg-white p-7 shadow-md hover:-translate-y-1 hover:shadow-xl transition"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-green-100 text-3xl">
                📋
              </div>

              <h3 className="mt-5 text-xl font-bold text-gray-900">
                My Complaints
              </h3>

              <p className="mt-2 text-gray-800">
                View your submitted complaints and track their current
                status.
              </p>

              <div className="mt-6 inline-block rounded-lg bg-green-600 px-5 py-2.5 font-semibold text-white">
                View Complaints
              </div>
            </Link>

            <Link
              href="/citizen/feedback"
              className="rounded-2xl border bg-white p-7 shadow-md hover:-translate-y-1 hover:shadow-xl transition"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-purple-100 text-3xl">
                ⭐
              </div>

              <h3 className="mt-5 text-xl font-bold text-gray-900">
                Feedback
              </h3>

              <p className="mt-2 text-gray-800">
                Give feedback about resolved complaints and city services.
              </p>

              <div className="mt-6 inline-block rounded-lg bg-purple-600 px-5 py-2.5 font-semibold text-white">
                Give Feedback
              </div>
            </Link>

          </div>
        </section>

        {/* Complaint Summary */}
        <section className="mt-10">

          <h2 className="text-2xl font-bold text-gray-900">
            Complaint Summary
          </h2>

          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

            <div className="rounded-xl border bg-white p-6 shadow-md">
              <p className="text-sm font-semibold text-gray-800">
                Total Complaints
              </p>

              <p className="mt-2 text-3xl font-bold text-blue-600">
                0
              </p>
            </div>

            <div className="rounded-xl border bg-white p-6 shadow-md">
              <p className="text-sm font-semibold text-gray-800">
                Pending
              </p>

              <p className="mt-2 text-3xl font-bold text-yellow-600">
                0
              </p>
            </div>

            <div className="rounded-xl border bg-white p-6 shadow-md">
              <p className="text-sm font-semibold text-gray-800">
                In Progress
              </p>

              <p className="mt-2 text-3xl font-bold text-orange-600">
                0
              </p>
            </div>

            <div className="rounded-xl border bg-white p-6 shadow-md">
              <p className="text-sm font-semibold text-gray-800">
                Resolved
              </p>

              <p className="mt-2 text-3xl font-bold text-green-600">
                0
              </p>
            </div>

          </div>
        </section>

      </div>
    </main>
  );
}