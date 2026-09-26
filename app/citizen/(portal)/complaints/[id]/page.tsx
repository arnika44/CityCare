"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type Status =
  | "Reported"
  | "Verified"
  | "Assigned"
  | "In Progress"
  | "Resolved";

type StatusHistory = {
  status: Status;
  timestamp: string;
};

type Complaint = {
  _id: string;
  category: string;
  description: string;
  imageUrl?: string;
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  landmark?: string;
  locationDetails?: string;
  status: Status;
  statusHistory?: StatusHistory[];
  createdAt: string;
  updatedAt: string;
};

const STATUSES: Status[] = [
  "Reported",
  "Verified",
  "Assigned",
  "In Progress",
  "Resolved",
];

export default function ComplaintDetailPage() {
  const params = useParams();
  const complaintId = params.id as string;

  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchComplaint = async () => {
      try {
        const citizenId = localStorage.getItem("citycare_citizen_id");

        if (!citizenId) {
          setError("Citizen ID not found.");
          setIsLoading(false);
          return;
        }

        const response = await fetch(
          `/api/complaints?citizenId=${encodeURIComponent(citizenId)}`
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Failed to fetch complaint."
          );
        }

        const selectedComplaint = data.complaints.find(
          (item: Complaint) => item._id === complaintId
        );

        if (!selectedComplaint) {
          setError("Complaint not found.");
          return;
        }

        setComplaint(selectedComplaint);
      } catch (error) {
        console.error("Complaint detail fetch error:", error);

        setError(
          error instanceof Error
            ? error.message
            : "Unable to load complaint."
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (complaintId) {
      fetchComplaint();
    }
  }, [complaintId]);

  const getHistoryTimestamp = (status: Status) => {
    const history = complaint?.statusHistory || [];

    const entry = history.find((item) => item.status === status);

    return entry?.timestamp || null;
  };

  const isStatusCompleted = (status: Status) => {
    if (!complaint) {
      return false;
    }

    const currentIndex = STATUSES.indexOf(complaint.status);
    const statusIndex = STATUSES.indexOf(status);

    return statusIndex <= currentIndex;
  };

  const isCurrentStatus = (status: Status) => {
    return complaint?.status === status;
  };

  if (isLoading) {
    return (
      <main className="px-6 py-10">
        <div className="mx-auto w-full max-w-5xl">
          <div className="rounded-2xl border bg-white p-10 text-center shadow-md">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />

            <p className="mt-4 font-semibold text-gray-700">
              Loading complaint details...
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (error || !complaint) {
    return (
      <main className="px-6 py-10">
        <div className="mx-auto w-full max-w-5xl">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
            <h2 className="text-xl font-bold text-red-700">
              {error || "Complaint not found."}
            </h2>

            <Link
              href="/citizen/complaints"
              className="mt-5 inline-block rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
            >
              ← Back to My Complaints
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="px-6 py-10">
      <div className="mx-auto w-full max-w-5xl">

        {/* Back */}
        <Link
          href="/citizen/complaints"
          className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700"
        >
          ← Back to My Complaints
        </Link>

        {/* Header */}
        <div className="mt-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Complaint Details
          </h1>

          <p className="mt-2 text-gray-600">
            View complete information and track the progress of your complaint.
          </p>
        </div>

        {/* Complaint Information */}
        <section className="mt-8 rounded-2xl border bg-white p-6 shadow-md">
          <div className="flex flex-col gap-6 lg:flex-row lg:justify-between">

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-2xl font-bold text-gray-900">
                  {complaint.category}
                </h2>

                <span
                  className={`rounded-full px-4 py-1.5 text-sm font-bold ${
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
              </div>

              <div className="mt-6">
                <p className="text-sm font-semibold text-gray-500">
                  Description
                </p>

                <p className="mt-2 text-gray-800">
                  {complaint.description}
                </p>
              </div>

              {complaint.location?.address && (
                <div className="mt-5">
                  <p className="text-sm font-semibold text-gray-500">
                    Location
                  </p>

                  <p className="mt-2 text-gray-800">
                    📍 {complaint.location.address}
                  </p>
                </div>
              )}

              {complaint.landmark && (
                <div className="mt-5">
                  <p className="text-sm font-semibold text-gray-500">
                    Landmark
                  </p>

                  <p className="mt-2 text-gray-800">
                    {complaint.landmark}
                  </p>
                </div>
              )}

              {complaint.locationDetails && (
                <div className="mt-5">
                  <p className="text-sm font-semibold text-gray-500">
                    Location Details
                  </p>

                  <p className="mt-2 text-gray-800">
                    {complaint.locationDetails}
                  </p>
                </div>
              )}

              <div className="mt-5">
                <p className="text-sm font-semibold text-gray-500">
                  Submitted On
                </p>

                <p className="mt-2 text-gray-800">
                  {new Date(complaint.createdAt).toLocaleString("en-IN")}
                </p>
              </div>
            </div>

            {complaint.imageUrl && (
              <div className="w-full lg:w-64">
                <p className="mb-2 text-sm font-semibold text-gray-500">
                  Complaint Image
                </p>

                <img
                  src={complaint.imageUrl}
                  alt="Complaint"
                  className="h-48 w-full rounded-xl border object-cover"
                />
              </div>
            )}
          </div>
        </section>

        {/* Tracking */}
        <section className="mt-8 rounded-2xl border bg-white p-6 shadow-md">
          <h2 className="text-2xl font-bold text-gray-900">
            Complaint Tracking
          </h2>

          <p className="mt-2 text-gray-600">
            Track the progress of your complaint from submission to resolution.
          </p>

          <div className="mt-8">
            {STATUSES.map((status, index) => {
              const completed = isStatusCompleted(status);
              const current = isCurrentStatus(status);
              const timestamp = getHistoryTimestamp(status);

              return (
                <div
                  key={status}
                  className="relative flex gap-4"
                >
                  {/* Vertical Line */}
                  {index < STATUSES.length - 1 && (
                    <div
                      className={`absolute left-5 top-11 h-16 w-0.5 ${
                        completed
                          ? "bg-blue-500"
                          : "bg-gray-200"
                      }`}
                    />
                  )}

                  {/* Circle */}
                  <div
                    className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold ${
                      current
                        ? "border-blue-600 bg-blue-600 text-white"
                        : completed
                        ? "border-green-500 bg-green-500 text-white"
                        : "border-gray-300 bg-white text-gray-400"
                    }`}
                  >
                    {completed ? "✓" : "○"}
                  </div>

                  {/* Status Details */}
                  <div className="pb-8">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3
                        className={`text-lg font-bold ${
                          current
                            ? "text-blue-600"
                            : completed
                            ? "text-gray-900"
                            : "text-gray-400"
                        }`}
                      >
                        {status}
                      </h3>

                      {current && (
                        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
                          Current Status
                        </span>
                      )}
                    </div>

                    {timestamp ? (
                      <p className="mt-1 text-sm text-gray-500">
                        {new Date(timestamp).toLocaleString("en-IN")}
                      </p>
                    ) : (
                      <p className="mt-1 text-sm text-gray-400">
                        Pending
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Current Status */}
        <section className="mt-8 rounded-2xl border bg-blue-50 p-6">
          <p className="text-sm font-semibold text-blue-700">
            Current Complaint Status
          </p>

          <div className="mt-2 flex items-center gap-3">
            <span className="text-2xl">📌</span>

            <h2 className="text-2xl font-bold text-blue-900">
              {complaint.status}
            </h2>
          </div>
        </section>

      </div>
    </main>
  );
}