"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

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
  status: "Reported" | "Verified" | "Assigned" | "In Progress" | "Resolved";
  createdAt: string;
};

export default function MyComplaintsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

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
        console.error("Complaint fetch error:", error);

        setError(
          error instanceof Error
            ? error.message
            : "Unable to load complaints."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchComplaints();
  }, []);

  const handleDeleteComplaint = async (complaintId: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this complaint?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const citizenId = localStorage.getItem("citycare_citizen_id");

      if (!citizenId) {
        alert("Citizen ID not found.");
        return;
      }

      const response = await fetch("/api/complaints", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          complaintId,
          citizenId,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to delete complaint."
        );
      }

      setComplaints((previousComplaints) =>
        previousComplaints.filter(
          (complaint) => complaint._id !== complaintId
        )
      );

      setOpenMenuId(null);
    } catch (error) {
      console.error("Complaint delete error:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Unable to delete complaint."
      );
    }
  };

  const handleEditComplaint = (complaintId: string) => {
    setOpenMenuId(null);

    window.location.href = `/citizen/complaint?edit=${complaintId}`;
  };

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
              {pendingCount}
            </p>
          </div>

          <div className="rounded-xl border bg-white p-6 shadow-md">
            <p className="text-sm font-semibold text-gray-700">
              In Progress
            </p>

            <p className="mt-2 text-3xl font-bold text-orange-600">
              {inProgressCount}
            </p>
          </div>

          <div className="rounded-xl border bg-white p-6 shadow-md">
            <p className="text-sm font-semibold text-gray-700">
              Resolved
            </p>

            <p className="mt-2 text-3xl font-bold text-green-600">
              {resolvedCount}
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

          {/* Loading State */}
          {isLoading && (
            <div className="mt-6 rounded-2xl border bg-white p-10 text-center shadow-md">
              <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />

              <p className="mt-4 font-semibold text-gray-700">
                Loading your complaints...
              </p>
            </div>
          )}

          {/* Error State */}
          {!isLoading && error && (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
              <p className="font-semibold text-red-700">
                {error}
              </p>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && complaints.length === 0 && (
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
          )}

          {/* Complaints */}
          {!isLoading && !error && complaints.length > 0 && (
            <div className="mt-6 space-y-5">

              {complaints.map((complaint) => (
                <Link
                  key={complaint._id}
                  href={`/citizen/complaints/${complaint._id}`}
                  className="relative block rounded-2xl border bg-white p-6 shadow-md transition hover:-translate-y-1 hover:shadow-xl"
                >

                  {/* Three Dot Menu */}
                  <div
                    className="absolute right-4 top-4"
                    onClick={(event) => event.stopPropagation()}
                  >

                    <button
                      type="button"
                      onClick={(event) => {
                        event.preventDefault();

                        setOpenMenuId(
                          openMenuId === complaint._id
                            ? null
                            : complaint._id
                        );
                      }}
                      className="flex h-9 w-9 items-center justify-center rounded-full text-2xl font-bold text-gray-500 transition hover:bg-gray-100 hover:text-gray-800"
                      aria-label="Complaint options"
                    >
                      ⋮
                    </button>

                    {openMenuId === complaint._id && (
                      <div
                        className="absolute right-0 z-20 mt-2 w-48 overflow-hidden rounded-xl border bg-white p-1 shadow-xl"
                        onClick={(event) => event.stopPropagation()}
                      >

                        {/* Edit */}
                        <button
                          type="button"
                          onClick={(event) => {
                            event.preventDefault();
                            handleEditComplaint(complaint._id);
                          }}
                          className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
                        >
                          <span>✏️</span>
                          <span>Edit Complaint</span>
                        </button>

                        {/* Delete */}
                        <button
                          type="button"
                          onClick={(event) => {
                            event.preventDefault();
                            handleDeleteComplaint(complaint._id);
                          }}
                          className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50"
                        >
                          <span>🗑️</span>
                          <span>Delete Complaint</span>
                        </button>

                      </div>
                    )}

                  </div>

                  <div className="flex flex-col gap-5 pr-8 lg:flex-row lg:items-start lg:justify-between">

                    <div className="flex-1">

                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-xl font-bold text-gray-900">
                          {complaint.category}
                        </h3>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${
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

                      <p className="mt-3 text-gray-700">
                        {complaint.description}
                      </p>

                      {complaint.location?.address && (
                        <div className="mt-4 flex items-start gap-2 text-sm text-gray-600">
                          <span>📍</span>

                          <span>
                            {complaint.location.address}
                          </span>
                        </div>
                      )}

                      {complaint.landmark && (
                        <p className="mt-2 text-sm text-gray-600">
                          <span className="font-semibold">
                            Landmark:
                          </span>{" "}
                          {complaint.landmark}
                        </p>
                      )}

                      <p className="mt-4 text-xs text-gray-500">
                        Submitted on{" "}
                        {new Date(
                          complaint.createdAt
                        ).toLocaleString("en-IN")}
                      </p>

                    </div>

                    {complaint.imageUrl && (
                      <div className="w-full lg:w-48">
                        <img
                          src={complaint.imageUrl}
                          alt="Complaint"
                          className="h-36 w-full rounded-xl border object-cover"
                        />
                      </div>
                    )}

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