"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

type Complaint = {
  _id?: string;
  id?: string;
  category?: string;
  description?: string;
  status?: string;
  department?: string;
  assignedAdminName?: string;
  location?: {
    address?: string;
    latitude?: number;
    longitude?: number;
  };
  createdAt?: string;
  imageUrl?: string;
};

const statusStyles: Record<string, string> = {
  Reported: "bg-sky-50 text-sky-700 ring-sky-200",
  Verified: "bg-violet-50 text-violet-700 ring-violet-200",
  Assigned: "bg-amber-50 text-amber-700 ring-amber-200",
  "In Progress": "bg-orange-50 text-orange-700 ring-orange-200",
  Resolved: "bg-emerald-50 text-emerald-700 ring-emerald-200",
};

const pendingStatuses = ["Reported", "Verified", "Assigned"];

export default function AdminComplaintsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState(() => {
    if (typeof window !== "undefined") {
      return new URLSearchParams(window.location.search).get("status") === "Pending"
        ? "Pending"
        : "All";
    }
    return "All";
  });

  const [categoryFilter, setCategoryFilter] = useState("All");

  const fetchComplaints = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/complaints?admin=true", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to load complaints.");
      }

      setComplaints(
        Array.isArray(data.complaints) ? data.complaints : []
      );
    } catch (err) {
      console.error("Admin complaints error:", err);
      setError(
        err instanceof Error ? err.message : "Unable to load complaints."
      );
      setComplaints([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  const getComplaintId = (complaint: Complaint) =>
    complaint._id || complaint.id || "";

  const countStatus = (status: string) =>
    complaints.filter((complaint) => complaint.status === status).length;

  const pendingCount = complaints.filter((complaint) =>
    pendingStatuses.includes(complaint.status || "")
  ).length;

  const categories = [
    "All",
    ...Array.from(
      new Set(
        complaints
          .map((complaint) => complaint.category)
          .filter((category): category is string => Boolean(category))
      )
    ),
  ];

  const handleCardClick = (filter: string) => {
    setStatusFilter(filter);
    setCategoryFilter("All");
    setSearch("");

    setTimeout(() => {
      document.getElementById("complaints-list")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  };

  const filteredComplaints = complaints.filter((complaint) => {
    const searchText = search.toLowerCase();

    const matchesSearch =
      getComplaintId(complaint).toLowerCase().includes(searchText) ||
      (complaint.category || "").toLowerCase().includes(searchText) ||
      (complaint.description || "").toLowerCase().includes(searchText) ||
      (complaint.location?.address || "").toLowerCase().includes(searchText) ||
      (complaint.department || "").toLowerCase().includes(searchText) ||
      (complaint.assignedAdminName || "").toLowerCase().includes(searchText);

    const matchesStatus =
      statusFilter === "All" ||
      (statusFilter === "Pending"
        ? pendingStatuses.includes(complaint.status || "")
        : complaint.status === statusFilter);

    const matchesCategory =
      categoryFilter === "All" || complaint.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const formatDate = (date?: string) => {
    if (!date) return "—";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) return "—";

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const summaryCards = [
    {
      title: "Total Complaints",
      value: complaints.length,
      icon: "📋",
      gradient: "from-blue-500 to-indigo-600",
      light: "bg-blue-50",
      filter: "All",
    },
    {
      title: "Pending Complaints",
      value: pendingCount,
      icon: "⏳",
      gradient: "from-amber-400 to-orange-500",
      light: "bg-amber-50",
      filter: "Pending",
    },
    {
      title: "In Progress",
      value: countStatus("In Progress"),
      icon: "🔄",
      gradient: "from-purple-500 to-fuchsia-600",
      light: "bg-purple-50",
      filter: "In Progress",
    },
    {
      title: "Resolved",
      value: countStatus("Resolved"),
      icon: "✓",
      gradient: "from-emerald-500 to-green-600",
      light: "bg-emerald-50",
      filter: "Resolved",
    },
  ];

  return (
    <main className="min-h-screen bg-slate-50/80 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1500px] space-y-8">

        {/* HEADER */}
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-blue-600">
              CityCare Administration
            </p>

            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Complaints Management
            </h1>

            <p className="mt-2 text-sm font-medium text-slate-500">
              View, monitor and manage all citizen complaints.
            </p>
          </div>

          <button
            onClick={fetchComplaints}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-slate-900/10 transition hover:-translate-y-0.5 hover:bg-blue-700 disabled:opacity-50"
          >
            <span className="text-lg">↻</span>
            {loading ? "Refreshing..." : "Refresh Complaints"}
          </button>
        </header>

        {/* COMPLAINT OVERVIEW */}
        <section>
          <div className="mb-5">
            <h2 className="text-xl font-extrabold tracking-tight text-slate-800">
              Complaint Overview
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Click any card to view its complaints.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {summaryCards.map((card) => (
              <button
                type="button"
                key={card.title}
                onClick={() => handleCardClick(card.filter)}
                className={`group relative overflow-hidden rounded-2xl border bg-white p-6 text-left shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl ${
                  statusFilter === card.filter
                    ? "border-blue-400 ring-2 ring-blue-100"
                    : "border-slate-200/80"
                }`}
              >
                <div className="absolute -right-7 -top-7 h-28 w-28 rounded-full bg-slate-50 transition group-hover:scale-125" />

                <div className="relative flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-500">
                      {card.title}
                    </p>

                    <p className="mt-3 text-4xl font-extrabold tracking-tight text-slate-900">
                      {loading ? "—" : card.value}
                    </p>
                  </div>

                  <div
                    className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${card.gradient} text-2xl text-white shadow-lg`}
                  >
                    {card.icon}
                  </div>
                </div>

                <div className={`relative mt-5 h-1.5 w-full overflow-hidden rounded-full ${card.light}`}>
                  <div
                    className={`h-full w-2/3 rounded-full bg-gradient-to-r ${card.gradient}`}
                  />
                </div>

                <p className="relative mt-3 text-xs font-semibold text-blue-600">
                  Click to view complaints →
                </p>
              </button>
            ))}
          </div>
        </section>

        {/* SEARCH AND FILTERS */}
        <section>
          <div className="mb-5">
            <h2 className="text-xl font-extrabold tracking-tight text-slate-800">
              Search and Filters
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Find complaints using category, status or location.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm md:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Search Complaints
              </label>

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search ID, description, location..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Complaint Status
              </label>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              >
                <option value="All">All Statuses</option>
                <option value="Pending">Pending (Reported, Verified, Assigned)</option>
                <option value="Reported">Reported</option>
                <option value="Verified">Verified</option>
                <option value="Assigned">Assigned</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Complaint Category
              </label>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category === "All" ? "All Categories" : category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* ALL COMPLAINTS */}
        <section
          id="complaints-list"
          className="scroll-mt-6 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-6 py-5">
            <div>
              <h2 className="text-xl font-extrabold tracking-tight text-slate-800">
                {statusFilter === "Pending"
                  ? "Pending Complaints"
                  : statusFilter === "All"
                    ? "All Complaints"
                    : `${statusFilter} Complaints`}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {filteredComplaints.length} complaint(s) found
              </p>
            </div>

            <span className="rounded-xl bg-blue-50 px-4 py-2.5 text-sm font-bold text-blue-700">
              {filteredComplaints.length} Showing / {complaints.length} Total
            </span>
          </div>

          {loading ? (
            <div className="px-6 py-12 text-center text-sm font-medium text-slate-400">
              Loading complaints...
            </div>
          ) : error ? (
            <div className="p-10 text-center">
              <p className="text-sm font-semibold text-red-600">{error}</p>

              <button
                onClick={fetchComplaints}
                className="mt-4 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-700"
              >
                Try Again
              </button>
            </div>
          ) : filteredComplaints.length === 0 ? (
            <div className="px-6 py-14 text-center">
              <div className="mb-4 text-4xl">📋</div>

              <h3 className="text-base font-extrabold text-slate-800">
                No Complaints Found
              </h3>

              <p className="mt-2 text-sm font-medium text-slate-500">
                No complaints match your selected filters.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredComplaints.map((complaint) => {
                const complaintId = getComplaintId(complaint);

                return (
                  <div
                    key={complaintId}
                    className="p-6 transition hover:bg-slate-50/80"
                  >
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-start">

                      {/* IMAGE */}
                      <div className="h-36 w-full shrink-0 overflow-hidden rounded-xl bg-slate-100 lg:w-40">
                        {complaint.imageUrl ? (
                          <img
                            src={complaint.imageUrl}
                            alt="Complaint"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-3xl">
                            📷
                          </div>
                        )}
                      </div>

                      {/* ALL COMPLAINT DETAILS */}
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="text-lg font-extrabold text-slate-800">
                            {complaint.category || "General Issue"}
                          </h3>

                          <span
                            className={`inline-flex rounded-full px-3 py-1.5 text-xs font-bold ring-1 ring-inset ${
                              statusStyles[complaint.status || "Reported"] ||
                              "bg-slate-100 text-slate-600 ring-slate-200"
                            }`}
                          >
                            {complaint.status || "Reported"}
                          </span>
                        </div>

                        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">

                          <div className="rounded-lg bg-slate-50 p-3">
                            <p className="text-xs font-bold uppercase text-slate-400">
                              Complaint ID
                            </p>
                            <p className="mt-1 break-all text-sm font-semibold text-slate-700">
                              {complaintId || "—"}
                            </p>
                          </div>

                          <div className="rounded-lg bg-slate-50 p-3">
                            <p className="text-xs font-bold uppercase text-slate-400">
                              Date
                            </p>
                            <p className="mt-1 text-sm font-semibold text-slate-700">
                              {formatDate(complaint.createdAt)}
                            </p>
                          </div>

                          <div className="rounded-lg bg-slate-50 p-3">
                            <p className="text-xs font-bold uppercase text-slate-400">
                              Department
                            </p>
                            <p className="mt-1 text-sm font-semibold text-slate-700">
                              {complaint.department || "Not Assigned"}
                            </p>
                          </div>

                          <div className="rounded-lg bg-slate-50 p-3">
                            <p className="text-xs font-bold uppercase text-slate-400">
                              Assigned Admin
                            </p>
                            <p className="mt-1 text-sm font-semibold text-slate-700">
                              {complaint.assignedAdminName || "Not Assigned"}
                            </p>
                          </div>

                          <div className="rounded-lg bg-slate-50 p-3 sm:col-span-2">
                            <p className="text-xs font-bold uppercase text-slate-400">
                              Location
                            </p>
                            <p className="mt-1 text-sm font-semibold text-slate-700">
                              {complaint.location?.address || "Location unavailable"}
                            </p>

                            {(complaint.location?.latitude !== undefined ||
                              complaint.location?.longitude !== undefined) && (
                              <p className="mt-2 text-xs text-slate-500">
                                Latitude: {complaint.location?.latitude ?? "—"}
                                {" | "}
                                Longitude: {complaint.location?.longitude ?? "—"}
                              </p>
                            )}
                          </div>

                          <div className="rounded-lg bg-slate-50 p-3 sm:col-span-2">
                            <p className="text-xs font-bold uppercase text-slate-400">
                              Description
                            </p>
                            <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                              {complaint.description || "No description provided."}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* VIEW DETAILS */}
                      <div className="shrink-0">
                        {complaintId ? (
                          <Link
                            href={`/admin/complaints/${complaintId}`}
                            className="inline-flex items-center justify-center rounded-xl bg-blue-50 px-5 py-3 text-sm font-bold text-blue-700 transition hover:bg-blue-100"
                          >
                            View Details →
                          </Link>
                        ) : (
                          <span className="text-xs font-medium text-slate-400">
                            No ID available
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* FOOTER */}
        <footer className="pb-3 text-center text-xs font-medium text-slate-400">
          CityCare Admin Portal • One Platform for Local Problems
        </footer>
      </div>
    </main>
  );
}