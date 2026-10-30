
"use client";

import { useCallback, useEffect, useState } from "react";

type Stats = {
  total: number;
  pending: number;
  reported: number;
  verified: number;
  assigned: number;
  inProgress: number;
  resolved: number;
};

type Department = {
  name: string;
  count: number;
};

type Complaint = {
  _id: string;
  category: string;
  status: string;
  department?: string;
  createdAt: string;
  location?: string;
};

type DashboardData = {
  stats: Stats;
  departments: Department[];
  recentComplaints: Complaint[];
};

const emptyStats: Stats = {
  total: 0,
  pending: 0,
  reported: 0,
  verified: 0,
  assigned: 0,
  inProgress: 0,
  resolved: 0,
};

const statusColors: Record<string, string> = {
  Reported: "bg-blue-100 text-blue-700",
  Verified: "bg-purple-100 text-purple-700",
  Assigned: "bg-yellow-100 text-yellow-700",
  "In Progress": "bg-orange-100 text-orange-700",
  Resolved: "bg-green-100 text-green-700",
};

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData>({
    stats: emptyStats,
    departments: [],
    recentComplaints: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/admin/dashboard", {
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to load dashboard data.");
      }

      setData({
        stats: { ...emptyStats, ...result.stats },
        departments: result.departments || [],
        recentComplaints: result.recentComplaints || [],
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load dashboard data. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const summaryCards = [
    {
      title: "Total Complaints",
      value: data.stats.total,
      color: "bg-blue-50 text-blue-700",
      icon: "📋",
    },
    {
      title: "Pending",
      value: data.stats.pending,
      color: "bg-yellow-50 text-yellow-700",
      icon: "⏳",
    },
    {
      title: "In Progress",
      value: data.stats.inProgress,
      color: "bg-orange-50 text-orange-700",
      icon: "🔄",
    },
    {
      title: "Resolved",
      value: data.stats.resolved,
      color: "bg-green-50 text-green-700",
      icon: "✅",
    },
  ];

  const statusCards = [
    {
      title: "Reported",
      value: data.stats.reported,
      color: "border-blue-500",
    },
    {
      title: "Verified",
      value: data.stats.verified,
      color: "border-purple-500",
    },
    {
      title: "Assigned",
      value: data.stats.assigned,
      color: "border-yellow-500",
    },
  ];

  const quickActions = [
    { title: "Manage Complaints", link: "/admin/complaints", icon: "📋" },
    { title: "Departments", link: "/admin/departments", icon: "🏢" },
    { title: "Citizens", link: "/admin/citizens", icon: "👥" },
    { title: "Analytics", link: "/admin/analytics", icon: "📊" },
  ];

  return (
    <div className="space-y-8 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Admin Dashboard
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Overview of CityCare complaints and activities
          </p>
        </div>

        <button
          onClick={fetchDashboard}
          disabled={loading}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Refreshing..." : "↻ Refresh"}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
          <button
            onClick={fetchDashboard}
            className="ml-3 font-semibold underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Main Summary Cards */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-gray-800">
          Complaint Overview
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {summaryCards.map((card) => (
            <div
              key={card.title}
              className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-500">
                  {card.title}
                </p>
                <span className="text-2xl">{card.icon}</span>
              </div>
              <p className="mt-3 text-3xl font-bold text-gray-900">
                {loading ? "..." : card.value}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Current Status */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-gray-800">
          Current Complaint Status
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {statusCards.map((card) => (
            <div
              key={card.title}
              className={`rounded-xl border-l-4 ${card.color} border border-gray-200 bg-white p-5 shadow-sm`}
            >
              <p className="text-sm font-medium text-gray-500">
                {card.title}
              </p>
              <p className="mt-2 text-2xl font-bold text-gray-900">
                {loading ? "..." : card.value}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Quick Actions */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-gray-800">
          Quick Actions
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {quickActions.map((action) => (
            <a
              key={action.title}
              href={action.link}
              className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <span className="text-2xl">{action.icon}</span>
              <span className="font-semibold text-gray-700">
                {action.title}
              </span>
            </a>
          ))}
        </div>
      </section>

      {/* Department Overview */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-gray-800">
          Department Overview
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {["PWD", "Water", "Electricity", "Sanitation", "Traffic"].map(
            (name) => {
              const department = data.departments.find(
                (item) =>
                  item.name?.toLowerCase() === name.toLowerCase()
              );

              return (
                <div
                  key={name}
                  className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
                >
                  <p className="font-semibold text-gray-700">{name}</p>
                  <p className="mt-2 text-2xl font-bold text-gray-900">
                    {loading ? "..." : department?.count ?? 0}
                  </p>
                  <p className="text-xs text-gray-500">
                    Assigned complaints
                  </p>
                </div>
              );
            }
          )}
        </div>
      </section>

      {/* Recent Complaints */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">
            Recent Complaints
          </h2>
          <a
            href="/admin/complaints"
            className="text-sm font-semibold text-blue-600 hover:underline"
          >
            View All
          </a>
        </div>

        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full min-w-[650px] text-left text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-5 py-4 font-semibold">Category</th>
                <th className="px-5 py-4 font-semibold">Department</th>
                <th className="px-5 py-4 font-semibold">Location</th>
                <th className="px-5 py-4 font-semibold">Status</th>
                <th className="px-5 py-4 font-semibold">Date</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-gray-500">
                    Loading complaints...
                  </td>
                </tr>
              ) : data.recentComplaints.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-gray-500">
                    No complaints found.
                  </td>
                </tr>
              ) : (
                data.recentComplaints.map((complaint) => (
                  <tr key={complaint._id} className="hover:bg-gray-50">
                    <td className="px-5 py-4 font-medium text-gray-800">
                      {complaint.category}
                    </td>
                    <td className="px-5 py-4 text-gray-600">
                      {complaint.department || "Not Assigned"}
                    </td>
                    <td className="max-w-[200px] truncate px-5 py-4 text-gray-600">
                      {complaint.location || "—"}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          statusColors[complaint.status] ||
                          "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {complaint.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-gray-600">
                      {complaint.createdAt
                        ? new Date(complaint.createdAt).toLocaleDateString()
                        : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* CM Review */}
      <section className="rounded-xl bg-gradient-to-r from-blue-700 to-blue-500 p-6 text-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold">CM Review Panel</h2>
            <p className="mt-1 text-sm text-blue-100">
              Monitor city performance and department-wise complaint progress.
            </p>
          </div>

          <a
            href="/admin/cm-review"
            className="rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-blue-700 hover:bg-blue-50"
          >
            Open CM Review
          </a>
        </div>
      </section>
    </div>
  );
}
