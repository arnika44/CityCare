
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

const statusStyles: Record<string, string> = {
  Reported: "bg-sky-50 text-sky-700 ring-sky-200",
  Verified: "bg-violet-50 text-violet-700 ring-violet-200",
  Assigned: "bg-amber-50 text-amber-700 ring-amber-200",
  "In Progress": "bg-orange-50 text-orange-700 ring-orange-200",
  Resolved: "bg-emerald-50 text-emerald-700 ring-emerald-200",
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
          : "Unable to load dashboard data."
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
      icon: "📋",
      gradient: "from-blue-500 to-indigo-600",
      light: "bg-blue-50",
    },
    {
      title: "Pending Complaints",
      value: data.stats.pending,
      icon: "⏳",
      gradient: "from-amber-400 to-orange-500",
      light: "bg-amber-50",
    },
    {
      title: "In Progress",
      value: data.stats.inProgress,
      icon: "🔄",
      gradient: "from-violet-500 to-purple-600",
      light: "bg-violet-50",
    },
    {
      title: "Resolved",
      value: data.stats.resolved,
      icon: "✓",
      gradient: "from-emerald-500 to-green-600",
      light: "bg-emerald-50",
    },
  ];

  const statusCards = [
    {
      title: "Reported",
      value: data.stats.reported,
      color: "border-sky-500",
      icon: "📝",
    },
    {
      title: "Verified",
      value: data.stats.verified,
      color: "border-violet-500",
      icon: "🔍",
    },
    {
      title: "Assigned",
      value: data.stats.assigned,
      color: "border-amber-500",
      icon: "👤",
    },
  ];

  const quickActions = [
    {
      title: "Manage Complaints",
      description: "View and manage citizen complaints",
      link: "/admin/complaints",
      icon: "📋",
      color: "bg-blue-50",
    },
    {
      title: "Departments",
      description: "Manage city departments",
      link: "/admin/departments",
      icon: "🏢",
      color: "bg-violet-50",
    },
    {
      title: "Citizens",
      description: "View registered citizens",
      link: "/admin/citizens",
      icon: "👥",
      color: "bg-emerald-50",
    },
    {
      title: "Analytics",
      description: "Check reports and statistics",
      link: "/admin/analytics",
      icon: "📊",
      color: "bg-orange-50",
    },
  ];

  const departmentNames = [
    "PWD",
    "Water",
    "Electricity",
    "Sanitation",
    "Traffic",
  ];

  return (
    <main className="min-h-screen bg-slate-50/80 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1500px] space-y-8">

        {/* Header */}
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-blue-600">
              CityCare Administration
            </p>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Dashboard Overview
            </h1>
            <p className="mt-2 text-sm font-medium text-slate-500">
              Monitor complaints, departments and city services in one place.
            </p>
          </div>

          <button
            onClick={fetchDashboard}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-slate-900/10 transition hover:-translate-y-0.5 hover:bg-blue-700 disabled:opacity-50"
          >
            <span className="text-lg">↻</span>
            {loading ? "Refreshing..." : "Refresh Dashboard"}
          </button>
        </header>

        {/* Error */}
        {error && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
            <span>{error}</span>
            <button
              onClick={fetchDashboard}
              className="font-bold underline"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Main Statistics */}
        <section>
          <div className="mb-5">
            <h2 className="text-xl font-extrabold tracking-tight text-slate-800">
              Complaint Overview
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Overall performance at a glance
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {summaryCards.map((card) => (
              <div
                key={card.title}
                className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/70"
              >
                <div className="absolute -right-7 -top-7 h-28 w-28 rounded-full bg-slate-50 transition group-hover:scale-125" />

                <div className="relative flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-500">
                      {card.title}
                    </p>
                    <p className="mt-3 text-4xl font-extrabold tracking-tight text-slate-900">
                      {loading ? "—" : card.value}
                    </p>
                  </div>

                  <div
                    className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${card.gradient} text-2xl text-white shadow-lg`}
                  >
                    {card.icon}
                  </div>
                </div>

                <div
                  className={`relative mt-5 h-1.5 w-full overflow-hidden rounded-full ${card.light}`}
                >
                  <div
                    className={`h-full w-2/3 rounded-full bg-gradient-to-r ${card.gradient}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Current Status */}
        <section>
          <div className="mb-5">
            <h2 className="text-xl font-extrabold tracking-tight text-slate-800">
              Current Complaint Status
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Track complaints through their initial stages
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            {statusCards.map((card) => (
              <div
                key={card.title}
                className={`rounded-2xl border border-slate-200 border-l-[5px] ${card.color} bg-white p-6 shadow-sm transition hover:shadow-md`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-slate-500">
                      {card.title}
                    </p>
                    <p className="mt-2 text-3xl font-extrabold text-slate-900">
                      {loading ? "—" : card.value}
                    </p>
                  </div>
                  <span className="text-3xl">{card.icon}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Quick Actions */}
        <section>
          <div className="mb-5">
            <h2 className="text-xl font-extrabold tracking-tight text-slate-800">
              Quick Actions
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Access important management sections
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {quickActions.map((action) => (
              <a
                key={action.title}
                href={action.link}
                className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-100/50"
              >
                <div
                  className={`mb-5 flex h-12 w-12 items-center justify-center rounded-xl ${action.color} text-2xl transition group-hover:scale-110`}
                >
                  {action.icon}
                </div>
                <h3 className="text-base font-extrabold text-slate-800 group-hover:text-blue-700">
                  {action.title}
                </h3>
                <p className="mt-2 text-xs font-medium leading-5 text-slate-500">
                  {action.description}
                </p>
                <p className="mt-4 text-sm font-bold text-blue-600">
                  Open section →
                </p>
              </a>
            ))}
          </div>
        </section>

        {/* Department Overview */}
        <section>
          <div className="mb-5">
            <h2 className="text-xl font-extrabold tracking-tight text-slate-800">
              Department Overview
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Department-wise complaint assignments
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {departmentNames.map((name, index) => {
              const department = data.departments.find(
                (item) =>
                  item.name?.toLowerCase() === name.toLowerCase()
              );

              const icons = ["🛣️", "💧", "💡", "🧹", "🚦"];

              return (
                <div
                  key={name}
                  className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">{icons[index]}</span>
                    <span className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">
                      Department
                    </span>
                  </div>
                  <h3 className="mt-4 text-base font-extrabold text-slate-800">
                    {name}
                  </h3>
                  <p className="mt-2 text-3xl font-extrabold text-slate-900">
                    {loading ? "—" : department?.count ?? 0}
                  </p>
                  <p className="mt-1 text-xs font-medium text-slate-500">
                    Assigned complaints
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Recent Complaints */}
        <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-6 py-5">
            <div>
              <h2 className="text-xl font-extrabold tracking-tight text-slate-800">
                Recent Complaints
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Latest complaints submitted by citizens
              </p>
            </div>

            <a
              href="/admin/complaints"
              className="rounded-xl bg-blue-50 px-4 py-2.5 text-sm font-bold text-blue-700 transition hover:bg-blue-100"
            >
              View All →
            </a>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead className="bg-slate-50/80 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-6 py-4 font-bold">Category</th>
                  <th className="px-6 py-4 font-bold">Department</th>
                  <th className="px-6 py-4 font-bold">Location</th>
                  <th className="px-6 py-4 font-bold">Status</th>
                  <th className="px-6 py-4 font-bold">Date</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center font-medium text-slate-400">
                      Loading complaints...
                    </td>
                  </tr>
                ) : data.recentComplaints.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center font-medium text-slate-400">
                      No complaints found.
                    </td>
                  </tr>
                ) : (
                  data.recentComplaints.map((complaint) => (
                    <tr
                      key={complaint._id}
                      className="transition hover:bg-slate-50/80"
                    >
                      <td className="px-6 py-4 font-bold text-slate-800">
                        {complaint.category}
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-600">
                        {complaint.department || "Not Assigned"}
                      </td>
                      <td className="max-w-[220px] truncate px-6 py-4 text-slate-500">
                        {complaint.location || "—"}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1.5 text-xs font-bold ring-1 ring-inset ${
                            statusStyles[complaint.status] ||
                            "bg-slate-100 text-slate-600 ring-slate-200"
                          }`}
                        >
                          {complaint.status}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 font-medium text-slate-500">
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
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-950 via-blue-950 to-blue-800 p-7 text-white shadow-xl shadow-blue-900/10 sm:p-9">
          <div className="absolute -right-12 -top-20 h-64 w-64 rounded-full border-[35px] border-white/5" />
          <div className="absolute -bottom-24 right-40 h-52 w-52 rounded-full bg-blue-400/10 blur-2xl" />

          <div className="relative flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-300">
                City Performance Monitoring
              </p>
              <h2 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl">
                CM Review Panel
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-blue-100/80">
                Monitor city performance, department-wise progress and citizen
                complaint resolution.
              </p>
            </div>

            <a
              href="/admin/cm-review"
              className="inline-flex shrink-0 items-center justify-center rounded-xl bg-white px-6 py-3 text-sm font-extrabold text-blue-900 shadow-lg transition hover:-translate-y-1 hover:bg-blue-50"
            >
              Open CM Review →
            </a>
          </div>
        </section>

        <footer className="pb-3 text-center text-xs font-medium text-slate-400">
          CityCare Admin Portal • One Platform for Local Problems
        </footer>
      </div>
    </main>
  );
}
