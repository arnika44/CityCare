"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

type Complaint = {
  _id?: string;
  id?: string;
  category?: string;
  description?: string;
  status?: string;
  imageUrl?: string;
  location?: {
    address?: string;
    latitude?: number;
    longitude?: number;
  };
  createdAt?: string;
  updatedAt?: string;
};

const departmentConfig: Record<
  string,
  {
    name: string;
    description: string;
    categories: string[];
  }
> = {
  pwd: {
    name: "PWD",
    description: "Road, pothole and public infrastructure complaints",
    categories: ["Pothole", "Road Damage", "Open Drain"],
  },

  water: {
    name: "Water Department",
    description: "Water supply and leakage related complaints",
    categories: ["Water Leakage", "Water Supply", "Water"],
  },

  electricity: {
    name: "Electricity Department",
    description: "Streetlight and electricity related complaints",
    categories: ["Broken Streetlight", "Electricity", "Streetlight"],
  },

  sanitation: {
    name: "Sanitation / Municipal",
    description: "Garbage, waste and illegal dumping complaints",
    categories: ["Garbage", "Illegal Dumping", "Waste", "Sanitation"],
  },

  traffic: {
    name: "Traffic Department",
    description: "Traffic and road management complaints",
    categories: ["Traffic Problem", "Traffic"],
  },
};

export default function DepartmentPage() {
  const params = useParams();

  const departmentKey = String(params.department || "").toLowerCase();

  const department = departmentConfig[departmentKey];

  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const response = await fetch("/api/complaints");

        if (!response.ok) {
          throw new Error("Failed to fetch complaints");
        }

        const data = await response.json();

        const allComplaints = Array.isArray(data)
          ? data
          : Array.isArray(data.complaints)
          ? data.complaints
          : [];

        setComplaints(allComplaints);
      } catch (error) {
        console.error("Department complaints error:", error);
        setComplaints([]);
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();
  }, []);

  const departmentComplaints = useMemo(() => {
    if (!department) return [];

    return complaints.filter((complaint) => {
      const category = complaint.category?.toLowerCase() || "";

      return department.categories.some((item) =>
        category.includes(item.toLowerCase())
      );
    });
  }, [complaints, department]);

  const filteredComplaints = useMemo(() => {
    return departmentComplaints.filter((complaint) => {
      const searchText = [
        complaint._id,
        complaint.id,
        complaint.category,
        complaint.description,
        complaint.location?.address,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = searchText.includes(
        search.toLowerCase()
      );

      const matchesStatus =
        statusFilter === "All" ||
        complaint.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [departmentComplaints, search, statusFilter]);

  const total = departmentComplaints.length;

  const reported = departmentComplaints.filter(
    (item) => item.status === "Reported"
  ).length;

  const verified = departmentComplaints.filter(
    (item) => item.status === "Verified"
  ).length;

  const assigned = departmentComplaints.filter(
    (item) => item.status === "Assigned"
  ).length;

  const inProgress = departmentComplaints.filter(
    (item) => item.status === "In Progress"
  ).length;

  const resolved = departmentComplaints.filter(
    (item) => item.status === "Resolved"
  ).length;

  const formatDate = (date?: string) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusStyle = (status?: string) => {
    switch (status) {
      case "Resolved":
        return "bg-green-100 text-green-700";

      case "In Progress":
        return "bg-blue-100 text-blue-700";

      case "Assigned":
        return "bg-purple-100 text-purple-700";

      case "Verified":
        return "bg-yellow-100 text-yellow-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  if (!department) {
    return (
      <div className="rounded-xl border bg-white p-10 text-center shadow-sm">
        <h1 className="text-xl font-bold text-gray-900">
          Department Not Found
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          The requested department does not exist.
        </p>

        <Link
          href="/admin/departments"
          className="mt-5 inline-block rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
        >
          Back to Departments
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2">
            <Link
              href="/admin/departments"
              className="text-sm text-blue-600 hover:underline"
            >
              ← Back to Departments
            </Link>
          </div>

          <h1 className="text-2xl font-bold text-gray-900">
            {department.name}
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            {department.description}
          </p>
        </div>

        <div className="rounded-lg bg-blue-50 px-4 py-3">
          <p className="text-xs text-blue-600">
            Department
          </p>

          <p className="font-semibold text-blue-800">
            {department.name}
          </p>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Total
          </p>

          <h2 className="mt-2 text-3xl font-bold text-gray-900">
            {total}
          </h2>
        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Reported
          </p>

          <h2 className="mt-2 text-3xl font-bold text-gray-600">
            {reported}
          </h2>
        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Verified
          </p>

          <h2 className="mt-2 text-3xl font-bold text-yellow-600">
            {verified}
          </h2>
        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            In Progress
          </p>

          <h2 className="mt-2 text-3xl font-bold text-blue-600">
            {inProgress}
          </h2>
        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Resolved
          </p>

          <h2 className="mt-2 text-3xl font-bold text-green-600">
            {resolved}
          </h2>
        </div>
      </div>

      {/* Search + Filter */}
      <div className="rounded-xl border bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row">
          <input
            type="text"
            placeholder="Search complaint, category, location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
          >
            <option value="All">
              All Status
            </option>

            <option value="Reported">
              Reported
            </option>

            <option value="Verified">
              Verified
            </option>

            <option value="Assigned">
              Assigned
            </option>

            <option value="In Progress">
              In Progress
            </option>

            <option value="Resolved">
              Resolved
            </option>
          </select>
        </div>
      </div>

      {/* Complaint List */}
      <div className="rounded-xl border bg-white shadow-sm">
        <div className="border-b px-6 py-4">
          <h2 className="font-semibold text-gray-900">
            Department Complaints
          </h2>

          <p className="text-sm text-gray-500">
            {filteredComplaints.length} complaint
            {filteredComplaints.length !== 1 ? "s" : ""} found
          </p>
        </div>

        {loading ? (
          <div className="p-10 text-center text-gray-500">
            Loading complaints...
          </div>
        ) : filteredComplaints.length === 0 ? (
          <div className="p-10 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-2xl">
              📋
            </div>

            <h3 className="font-semibold text-gray-900">
              No complaints found
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              There are no complaints matching this department
              and filter.
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {filteredComplaints.map((complaint, index) => (
              <div
                key={complaint._id || complaint.id || index}
                className="p-5 hover:bg-gray-50"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex gap-4">
                    {complaint.imageUrl ? (
                      <img
                        src={complaint.imageUrl}
                        alt="Complaint"
                        className="h-20 w-20 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-gray-100 text-2xl">
                        📷
                      </div>
                    )}

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-gray-900">
                          {complaint.category ||
                            "Civic Complaint"}
                        </h3>

                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${getStatusStyle(
                            complaint.status
                          )}`}
                        >
                          {complaint.status || "Reported"}
                        </span>
                      </div>

                      <p className="mt-1 text-xs text-gray-400">
                        ID:{" "}
                        {complaint._id ||
                          complaint.id ||
                          "N/A"}
                      </p>

                      <p className="mt-2 max-w-2xl text-sm text-gray-600">
                        {complaint.description ||
                          "No description available."}
                      </p>

                      <p className="mt-2 text-xs text-gray-500">
                        📍{" "}
                        {complaint.location?.address ||
                          "Location not available"}
                      </p>

                      <p className="mt-1 text-xs text-gray-400">
                        Reported on{" "}
                        {formatDate(complaint.createdAt)}
                      </p>
                    </div>
                  </div>

                  <Link
                    href={`/citizen/complaints/${
                      complaint._id || complaint.id
                    }`}
                    className="rounded-lg border border-blue-200 px-4 py-2 text-center text-sm font-medium text-blue-600 hover:bg-blue-50"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}