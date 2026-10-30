
"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type DashboardStats = {
  total: number;
  pending: number;
  reported: number;
  verified: number;
  assigned: number;
  inProgress: number;
  resolved: number;
};

type DepartmentCounts = {
  PWD: number;
  Water: number;
  Electricity: number;
  Sanitation: number;
  Traffic: number;
};

type RecentComplaint = {
  _id: string;
  category: string;
  status: string;
  department: string;
  createdAt: string | null;
  location: string;
};

const initialStats: DashboardStats = {
  total: 0,
  pending: 0,
  reported: 0,
  verified: 0,
  assigned: 0,
  inProgress: 0,
  resolved: 0,
};

const initialDepartments: DepartmentCounts = {
  PWD: 0,
  Water: 0,
  Electricity: 0,
  Sanitation: 0,
  Traffic: 0,
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(initialStats);
  const [departmentsCount, setDepartmentsCount] =
    useState(initialDepartments);
  const [recentComplaints, setRecentComplaints] =
    useState<RecentComplaint[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchDashboardData = useCallback(async (manual = false) => {
    if (manual) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const response = await fetch("/api/admin/dashboard", {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Unable to load dashboard data.");
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Failed to load data.");
      }

      setStats(data.stats || initialStats);
      setDepartmentsCount(data.departments || initialDepartments);
      setRecentComplaints(data.recentComplaints || []);
    } catch (error) {
      console.error("Dashboard Error:", error);
      setError("Unable to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const statCards = [
    {
      title: "Total Complaints",
      value: stats.total,
      description: "All registered complaints",
      icon: "📋",
    },
    {
      title: "Pending",
      value: stats.pending,
      description: "Reported and verified complaints",
      icon: "⏳",
    },
    {
      title: "In Progress",
      value: stats.inProgress,
      description: "Currently being resolved",
      icon: "🔄",
    },
    {
      title: "Resolved",
      value: stats.resolved,
      description: "Successfully resolved",
      icon: "✅",
    },
  ];

  const departments = [
    {
      name: "PWD",
      key: "PWD" as const,
      description: "Roads, potholes and public infrastructure",
      icon: "🛣️",
      href: "/admin/departments/pwd",
    },
    {
      name: "Water Department",
      key: "Water" as const,
      description: "Water leakage and supply complaints",
      icon: "💧",
      href: "/admin/departments/water",
    },
    {
      name: "Electricity Department",
      key: "Electricity" as const,
      description: "Streetlights and electricity issues",
      icon: "💡",
      href: "/admin/departments/electricity",
    },
    {
      name: "Sanitation / Municipal",
      key: "Sanitation" as const,
      description: "Garbage and cleanliness complaints",
      icon: "🗑️",
      href: "/admin/departments/sanitation",
    },
    {
      name: "Traffic Department",
      key: "Traffic" as const,
      description: "Traffic and road-related issues",
      icon: "🚦",
      href: "/admin/departments/traffic",
    },
  ];

  const statusItems = [
    { name: "Reported", value: stats.reported, color: "bg-blue-500" },
    { name: "Verified", value: stats.verified, color: "bg-purple-500" },
    { name: "Assigned", value: stats.assigned, color: "bg-orange-500" },
    { name: "In Progress", value: stats.inProgress, color: "bg-yellow-500" },
    { name: "Resolved", value: stats.resolved, color: "bg-green-500" },
  ];

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "Resolved":
        return "bg-green-50 text-green-700";
      case "In Progress":
        return "bg-yellow-50 text-yellow-700";
      case "Assigned":
        return "bg-orange-50 text-orange-700";
      case "Verified":
        return "bg-purple-50 text-purple-700";
      default:
        return "bg-blue-50 text-blue-700";
    }
  };

  const formatDate = (date: string | null) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6">

      {/* PAGE HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Admin Dashboard
          </h1>

          <p className="text-gray-500 mt-1">
            Monitor and manage CityCare complaints and departments.
          </p>
        </div>

        <button
          onClick={() => fetchDashboardData(true)}
          disabled={refreshing}
          className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
        >
          {refreshing ? "Refreshing..." : "↻ Refresh Data"}
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {statCards.map((stat) => (
          <div
            key={stat.title}
            className="bg-white rounded-2xl border border-gray-200 p-5"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  {stat.title}
                </p>

                <h2 className="text-3xl font-bold text-gray-900 mt-2">
                  {loading ? "..." : stat.value}
                </h2>
              </div>

              <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center text-xl">
                {stat.icon}
              </div>
            </div>

            <p className="text-xs text-gray-400 mt-4">
              {stat.description}
            </p>
          </div>
        ))}
      </div>

      {/* STATUS SUMMARY */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900">
          Complaint Status Summary
        </h2>

        <p className="text-sm text-gray-500 mt-1 mb-5">
          Current status of all registered complaints.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {statusItems.map((item) => (
            <div
              key={item.name}
              className="rounded-xl bg-gray-50 p-4"
            >
              <div className="flex items-center gap-2">
                <span className={`h-3 w-3 rounded-full ${item.color}`} />
                <span className="text-sm text-gray-600">
                  {item.name}
                </span>
              </div>

              <p className="mt-3 text-2xl font-bold text-gray-900">
                {loading ? "..." : item.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* QUICK ACTIONS */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="mb-5">
          <h2 className="text-lg font-bold text-gray-900">
            Quick Actions
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            Quickly access important administration sections.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">

          <Link
            href="/admin/complaints"
            className="border border-gray-200 rounded-xl p-4 hover:border-blue-400 hover:bg-blue-50 transition"
          >
            <div className="text-2xl mb-3">📋</div>

            <h3 className="font-semibold text-gray-900">
              Manage Complaints
            </h3>

            <p className="text-xs text-gray-500 mt-1">
              View, assign and update complaints.
            </p>
          </Link>

          <Link
            href="/admin/departments"
            className="border border-gray-200 rounded-xl p-4 hover:border-blue-400 hover:bg-blue-50 transition"
          >
            <div className="text-2xl mb-3">🏢</div>

            <h3 className="font-semibold text-gray-900">
              Departments
            </h3>

            <p className="text-xs text-gray-500 mt-1">
              Manage department administrators.
            </p>
          </Link>

          <Link
            href="/admin/citizens"
            className="border border-gray-200 rounded-xl p-4 hover:border-blue-400 hover:bg-blue-50 transition"
          >
            <div className="text-2xl mb-3">👥</div>

            <h3 className="font-semibold text-gray-900">
              Citizens
            </h3>

            <p className="text-xs text-gray-500 mt-1">
              View registered citizens.
            </p>
          </Link>

          <Link
            href="/admin/analytics"
            className="border border-gray-200 rounded-xl p-4 hover:border-blue-400 hover:bg-blue-50 transition"
          >
            <div className="text-2xl mb-3">📊</div>

            <h3 className="font-semibold text-gray-900">
              Analytics
            </h3>

            <p className="text-xs text-gray-500 mt-1">
              View complaint statistics and reports.
            </p>
          </Link>

        </div>
      </div>

      {/* DEPARTMENT OVERVIEW */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">

        <div className="mb-5">
          <h2 className="text-lg font-bold text-gray-900">
            Department Overview
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            Access department-specific complaint management.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">

          {departments.map((department) => (
            <Link
              key={department.name}
              href={department.href}
              className="border border-gray-200 rounded-xl p-5 hover:border-blue-400 hover:bg-blue-50 transition"
            >
              <div className="flex items-start gap-4">

                <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-2xl flex-shrink-0">
                  {department.icon}
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900">
                    {department.name}
                  </h3>

                  <p className="text-sm text-gray-500 mt-1">
                    {department.description}
                  </p>

                  <p className="text-sm text-blue-600 font-medium mt-3">
                    {loading
                      ? "Loading..."
                      : `${departmentsCount[department.key]} complaints`}
                  </p>

                  <p className="text-sm text-blue-600 font-medium mt-1">
                    Open Department →
                  </p>
                </div>

              </div>
            </Link>
          ))}

        </div>
      </div>

      {/* RECENT COMPLAINTS */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b px-6 py-5">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Recent Complaints
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Latest five complaints submitted by citizens.
            </p>
          </div>

          <Link
            href="/admin/complaints"
            className="text-sm font-semibold text-blue-600 hover:underline"
          >
            View All Complaints →
          </Link>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-500">
            Loading recent complaints...
          </div>
        ) : recentComplaints.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No complaints have been submitted yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-6 py-4">Complaint ID</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Department</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {recentComplaints.map((complaint) => (
                  <tr key={complaint._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-800">
                      {complaint._id.slice(-8).toUpperCase()}
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-700">
                      {complaint.category}
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-600">
                      {complaint.department}
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDate(complaint.createdAt)}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyle(
                          complaint.status
                        )}`}
                      >
                        {complaint.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CM REVIEW */}
      <div className="bg-blue-600 rounded-2xl p-6 text-white flex flex-col md:flex-row md:items-center md:justify-between gap-5">

        <div>
          <h2 className="text-lg font-bold">
            CM Review
          </h2>

          <p className="text-sm text-blue-100 mt-1">
            Review city-wide complaint performance, department
            progress and high-priority issues.
          </p>
        </div>

        <Link
          href="/admin/cm-review"
          className="bg-white text-blue-600 px-5 py-3 rounded-xl font-semibold text-sm hover:bg-blue-50 transition text-center"
        >
          Open CM Review
        </Link>

      </div>

    </div>
  );
}
