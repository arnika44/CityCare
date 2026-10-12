"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Complaint = {
  _id?: string;
  id?: string;
  category?: string;
  description?: string;
  status?: string;
  location?: {
    address?: string;
    latitude?: number;
    longitude?: number;
  };
  createdAt?: string;
  imageUrl?: string;
};

export default function AdminComplaintsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      setLoading(true);

      const response = await fetch("/api/complaints");

      if (!response.ok) {
        throw new Error("Failed to fetch complaints");
      }

      const data = await response.json();

      if (Array.isArray(data)) {
        setComplaints(data);
      } else if (Array.isArray(data.complaints)) {
        setComplaints(data.complaints);
      } else {
        setComplaints([]);
      }
    } catch (error) {
      console.error("Error fetching complaints:", error);
      setComplaints([]);
    } finally {
      setLoading(false);
    }
  };

  const getComplaintId = (complaint: Complaint) => {
    return complaint._id || complaint.id || "";
  };

  const getStatusClass = (status?: string) => {
    switch (status) {
      case "Resolved":
        return "bg-green-100 text-green-700";

      case "In Progress":
        return "bg-blue-100 text-blue-700";

      case "Assigned":
        return "bg-purple-100 text-purple-700";

      case "Verified":
        return "bg-yellow-100 text-yellow-700";

      case "Reported":
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const categories = [
    "All",
    ...Array.from(
      new Set(
        complaints
          .map((complaint) => complaint.category)
          .filter(Boolean) as string[]
      )
    ),
  ];

  const filteredComplaints = complaints.filter((complaint) => {
    const complaintId = getComplaintId(complaint).toLowerCase();

    const searchText = search.toLowerCase();

    const matchesSearch =
      complaintId.includes(searchText) ||
      (complaint.category || "").toLowerCase().includes(searchText) ||
      (complaint.description || "").toLowerCase().includes(searchText) ||
      (complaint.location?.address || "")
        .toLowerCase()
        .includes(searchText);

    const matchesStatus =
      statusFilter === "All" ||
      complaint.status === statusFilter;

    const matchesCategory =
      categoryFilter === "All" ||
      complaint.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const formatDate = (date?: string) => {
    if (!date) return "—";

    try {
      return new Date(date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "—";
    }
  };

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Complaints
          </h1>

          <p className="text-gray-500 mt-1">
            View and manage all citizen complaints.
          </p>
        </div>

        <button
          onClick={fetchComplaints}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition"
        >
          ↻ Refresh
        </button>
      </div>

      {/* SUMMARY */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">

        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-xs text-gray-500">
            Total
          </p>

          <p className="text-2xl font-bold text-gray-900 mt-1">
            {complaints.length}
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-xs text-gray-500">
            Reported
          </p>

          <p className="text-2xl font-bold text-gray-700 mt-1">
            {
              complaints.filter(
                (c) => c.status === "Reported"
              ).length
            }
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-xs text-gray-500">
            Verified
          </p>

          <p className="text-2xl font-bold text-yellow-600 mt-1">
            {
              complaints.filter(
                (c) => c.status === "Verified"
              ).length
            }
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-xs text-gray-500">
            In Progress
          </p>

          <p className="text-2xl font-bold text-blue-600 mt-1">
            {
              complaints.filter(
                (c) => c.status === "In Progress"
              ).length
            }
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-xs text-gray-500">
            Resolved
          </p>

          <p className="text-2xl font-bold text-green-600 mt-1">
            {
              complaints.filter(
                (c) => c.status === "Resolved"
              ).length
            }
          </p>
        </div>

      </div>

      {/* FILTERS */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5">

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search complaint, category, location..."
              className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value)
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All Statuses</option>
              <option value="Reported">Reported</option>
              <option value="Verified">Verified</option>
              <option value="Assigned">Assigned</option>
              <option value="In Progress">
                In Progress
              </option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>

            <select
              value={categoryFilter}
              onChange={(e) =>
                setCategoryFilter(e.target.value)
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white outline-none focus:ring-2 focus:ring-blue-500"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

        </div>
      </div>

      {/* COMPLAINT LIST */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">

        <div className="px-6 py-5 border-b border-gray-200">
          <h2 className="font-bold text-gray-900">
            All Complaints
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            {filteredComplaints.length} complaint(s) found
          </p>
        </div>

        {loading ? (
          <div className="p-10 text-center text-gray-500">
            Loading complaints...
          </div>
        ) : filteredComplaints.length === 0 ? (
          <div className="p-12 text-center">

            <div className="text-4xl mb-4">
              📋
            </div>

            <h3 className="font-semibold text-gray-900">
              No complaints found
            </h3>

            <p className="text-sm text-gray-500 mt-1">
              There are no complaints matching the selected filters.
            </p>

          </div>
        ) : (
          <div className="divide-y divide-gray-200">

            {filteredComplaints.map((complaint) => {
              const complaintId = getComplaintId(complaint);

              return (
                <div
                  key={complaintId}
                  className="p-5 hover:bg-gray-50 transition"
                >

                  <div className="flex flex-col lg:flex-row lg:items-center gap-5">

                    {/* IMAGE */}
                    <div className="w-full lg:w-28 h-24 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">

                      {complaint.imageUrl ? (
                        <img
                          src={complaint.imageUrl}
                          alt="Complaint"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl">
                          📷
                        </div>
                      )}

                    </div>

                    {/* DETAILS */}
                    <div className="flex-1 min-w-0">

                      <div className="flex flex-wrap items-center gap-2">

                        <h3 className="font-semibold text-gray-900">
                          {complaint.category || "General Issue"}
                        </h3>

                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusClass(
                            complaint.status
                          )}`}
                        >
                          {complaint.status || "Reported"}
                        </span>

                      </div>

                      <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                        {complaint.description ||
                          "No description provided."}
                      </p>

                      <div className="flex flex-wrap gap-x-5 gap-y-1 mt-3 text-xs text-gray-500">

                        <span>
                          ID: {complaintId || "—"}
                        </span>

                        <span>
                          📅 {formatDate(complaint.createdAt)}
                        </span>

                        <span>
                          📍{" "}
                          {complaint.location?.address ||
                            "Location not available"}
                        </span>

                      </div>

                    </div>

                    {/* VIEW */}
                    <div className="flex-shrink-0">

                      {complaintId ? (
                        <Link
                          href={`/citizen/complaints/${complaintId}`}
                          className="inline-flex items-center justify-center px-4 py-2.5 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100 transition"
                        >
                          View Details →
                        </Link>
                      ) : (
                        <span className="text-xs text-gray-400">
                          No ID
                        </span>
                      )}

                    </div>

                  </div>

                </div>
              );
            })}

          </div>
        )}

      </div>

    </div>
  );
}