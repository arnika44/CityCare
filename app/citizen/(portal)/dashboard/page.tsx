"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Complaint = {
  _id: string;
  category: string;
  description: string;
  status:
    | "Reported"
    | "Verified"
    | "Assigned"
    | "In Progress"
    | "Resolved";
  createdAt: string;
};

export default function CitizenDashboard() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const citizenId = localStorage.getItem("citycare_citizen_id");

        if (!citizenId) {
          setComplaints([]);
          setIsLoading(false);
          return;
        }

        const response = await fetch(
          `/api/complaints?citizenId=${encodeURIComponent(citizenId)}`
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Failed to fetch complaints."
          );
        }

        setComplaints(data.complaints || []);
      } catch (error) {
        console.error("Dashboard complaint fetch error:", error);
        setComplaints([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchComplaints();
  }, []);

  const pendingCount = complaints.filter(
    (complaint) =>
      complaint.status === "Reported" ||
      complaint.status === "Verified" ||
      complaint.status === "Assigned"
  ).length;

  const inProgressCount = complaints.filter(
    (complaint) => complaint.status === "In Progress"
  ).length;

  const resolvedCount = complaints.filter(
    (complaint) => complaint.status === "Resolved"
  ).length;

  const recentComplaints = complaints.slice(0, 3);

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
              className="rounded-2xl border bg-white p-7 shadow-md transition hover:-translate-y-1 hover:shadow-xl"
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
              className="rounded-2xl border bg-white p-7 shadow-md transition hover:-translate-y-1 hover:shadow-xl"
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
              className="rounded-2xl border bg-white p-7 shadow-md transition hover:-translate-y-1 hover:shadow-xl"
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
                {complaints.length}
              </p>
            </div>

            <div className="rounded-xl border bg-white p-6 shadow-md">
              <p className="text-sm font-semibold text-gray-800">
                Pending
              </p>

              <p className="mt-2 text-3xl font-bold text-yellow-600">
                {pendingCount}
              </p>
            </div>

            <div className="rounded-xl border bg-white p-6 shadow-md">
              <p className="text-sm font-semibold text-gray-800">
                In Progress
              </p>

              <p className="mt-2 text-3xl font-bold text-orange-600">
                {inProgressCount}
              </p>
            </div>

            <div className="rounded-xl border bg-white p-6 shadow-md">
              <p className="text-sm font-semibold text-gray-800">
                Resolved
              </p>

              <p className="mt-2 text-3xl font-bold text-green-600">
                {resolvedCount}
              </p>
            </div>

          </div>
        </section>

        {/* Recent Complaints */}
        <section className="mt-10">

          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Recent Complaints
              </h2>

              <p className="mt-2 text-gray-700">
                View your latest submitted complaints.
              </p>
            </div>

            <Link
              href="/citizen/complaints"
              className="text-sm font-semibold text-blue-600 hover:text-blue-700"
            >
              View All
            </Link>
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="mt-5 rounded-2xl border bg-white p-8 text-center shadow-md">
              <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />

              <p className="mt-3 text-sm font-semibold text-gray-700">
                Loading recent complaints...
              </p>
            </div>
          )}

          {/* No Complaints */}
          {!isLoading && recentComplaints.length === 0 && (
            <div className="mt-5 rounded-2xl border bg-white p-8 text-center shadow-md">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-3xl">
                📋
              </div>

              <h3 className="mt-4 text-lg font-bold text-gray-900">
                No complaints yet
              </h3>

              <p className="mt-2 text-sm text-gray-600">
                Your recent complaints will appear here after you submit a
                complaint.
              </p>

              <Link
                href="/citizen/complaint"
                className="mt-5 inline-block rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white transition hover:bg-blue-700"
              >
                Report a Problem
              </Link>

            </div>
          )}

          {/* Recent Complaint Cards */}
          {!isLoading && recentComplaints.length > 0 && (
            <div className="mt-5 space-y-4">

              {recentComplaints.map((complaint) => (
                <Link
                  key={complaint._id}
                  href={`/citizen/complaints/${complaint._id}`}
                  className="block rounded-2xl border bg-white p-5 shadow-md transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        {complaint.category}
                      </h3>

                      <p className="mt-1 line-clamp-2 text-sm text-gray-600">
                        {complaint.description}
                      </p>

                      <p className="mt-2 text-xs text-gray-500">
                        Submitted on{" "}
                        {new Date(
                          complaint.createdAt
                        ).toLocaleString("en-IN")}
                      </p>
                    </div>

                    <div className="flex shrink-0 items-center gap-3">

                      <span
                        className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                          complaint.status === "Resolved"
                            ? "bg-green-100 text-green-700"
                            : complaint.status === "In Progress"
                            ? "bg-orange-100 text-orange-700"
                            : complaint.status === "Verified"
                            ? "bg-blue-100 text-blue-700"
                            : complaint.status === "Assigned"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {complaint.status}
                      </span>

                      <span className="text-lg text-gray-400">
                        →
                      </span>

                    </div>

                  </div>
                </Link>
              ))}

            </div>
          )}

        </section>

      </div>
    </main>
  );
}