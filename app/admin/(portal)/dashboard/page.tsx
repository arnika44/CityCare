"use client";

import Link from "next/link";

export default function AdminDashboardPage() {
  const stats = [
    {
      title: "Total Complaints",
      value: "0",
      description: "All registered complaints",
      icon: "📋",
    },
    {
      title: "Pending",
      value: "0",
      description: "Waiting for action",
      icon: "⏳",
    },
    {
      title: "In Progress",
      value: "0",
      description: "Currently being resolved",
      icon: "🔄",
    },
    {
      title: "Resolved",
      value: "0",
      description: "Successfully resolved",
      icon: "✅",
    },
  ];

  const departments = [
    {
      name: "PWD",
      description: "Roads, potholes and public infrastructure",
      icon: "🛣️",
      href: "/admin/departments/pwd",
    },
    {
      name: "Water Department",
      description: "Water leakage and supply complaints",
      icon: "💧",
      href: "/admin/departments/water",
    },
    {
      name: "Electricity Department",
      description: "Streetlights and electricity issues",
      icon: "💡",
      href: "/admin/departments/electricity",
    },
    {
      name: "Sanitation / Municipal",
      description: "Garbage and cleanliness complaints",
      icon: "🗑️",
      href: "/admin/departments/sanitation",
    },
    {
      name: "Traffic Department",
      description: "Traffic and road-related issues",
      icon: "🚦",
      href: "/admin/departments/traffic",
    },
  ];

  return (
    <div className="space-y-6">

      {/* PAGE HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Admin Dashboard
        </h1>

        <p className="text-gray-500 mt-1">
          Monitor and manage CityCare complaints and departments.
        </p>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {stats.map((stat) => (
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
                  {stat.value}
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
                    Open Department →
                  </p>
                </div>

              </div>
            </Link>
          ))}

        </div>
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