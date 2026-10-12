"use client";

import { useState } from "react";
import Link from "next/link";

type Department = {
  name: string;
  code: string;
  description: string;
  icon: string;
  color: string;
  complaints: number;
  admin: string;
  href: string;
};

export default function DepartmentsPage() {
  const [search, setSearch] = useState("");

  const departments: Department[] = [
    {
      name: "PWD",
      code: "PWD",
      description:
        "Roads, potholes, damaged roads, footpaths and public infrastructure.",
      icon: "🛣️",
      color: "blue",
      complaints: 0,
      admin: "Not Assigned",
      href: "/admin/departments/pwd",
    },
    {
      name: "Water Department",
      code: "WATER",
      description:
        "Water leakage, broken pipelines, water supply and drainage issues.",
      icon: "💧",
      color: "cyan",
      complaints: 0,
      admin: "Not Assigned",
      href: "/admin/departments/water",
    },
    {
      name: "Electricity Department",
      code: "ELECTRICITY",
      description:
        "Streetlights, electricity poles, wiring and electrical issues.",
      icon: "💡",
      color: "yellow",
      complaints: 0,
      admin: "Not Assigned",
      href: "/admin/departments/electricity",
    },
    {
      name: "Sanitation / Municipal",
      code: "SANITATION",
      description:
        "Garbage, waste disposal, cleanliness and municipal issues.",
      icon: "🗑️",
      color: "green",
      complaints: 0,
      admin: "Not Assigned",
      href: "/admin/departments/sanitation",
    },
    {
      name: "Traffic Department",
      code: "TRAFFIC",
      description:
        "Traffic problems, signals, congestion and road safety issues.",
      icon: "🚦",
      color: "red",
      complaints: 0,
      admin: "Not Assigned",
      href: "/admin/departments/traffic",
    },
  ];

  const filteredDepartments = departments.filter((department) => {
    const text = search.toLowerCase();

    return (
      department.name.toLowerCase().includes(text) ||
      department.code.toLowerCase().includes(text) ||
      department.description.toLowerCase().includes(text)
    );
  });

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Departments
          </h1>

          <p className="text-gray-500 mt-1">
            Manage city departments and their administrators.
          </p>
        </div>

        <div className="px-4 py-2.5 bg-blue-50 text-blue-700 rounded-xl text-sm font-medium">
          {departments.length} Departments
        </div>
      </div>

      {/* SEARCH */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5">

        <label className="block text-sm font-medium text-gray-700 mb-2">
          Search Department
        </label>

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by department name or code..."
          className="w-full md:max-w-xl px-4 py-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* DEPARTMENT CARDS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {filteredDepartments.map((department) => (
          <div
            key={department.code}
            className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-md transition"
          >

            {/* TOP */}
            <div className="flex items-start justify-between gap-4">

              <div className="flex items-center gap-4">

                <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center text-3xl">
                  {department.icon}
                </div>

                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    {department.name}
                  </h2>

                  <span className="inline-block mt-1 px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                    {department.code}
                  </span>
                </div>

              </div>

              <span className="px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-xs font-medium">
                Active
              </span>

            </div>

            {/* DESCRIPTION */}
            <p className="text-sm text-gray-500 mt-5 leading-6">
              {department.description}
            </p>

            {/* INFO */}
            <div className="grid grid-cols-2 gap-3 mt-5">

              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-500">
                  Complaints
                </p>

                <p className="text-xl font-bold text-gray-900 mt-1">
                  {department.complaints}
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-500">
                  Department Admin
                </p>

                <p className="text-sm font-semibold text-gray-900 mt-2">
                  {department.admin}
                </p>
              </div>

            </div>

            {/* ACTIONS */}
            <div className="flex gap-3 mt-5">

              <Link
                href={department.href}
                className="flex-1 text-center px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition"
              >
                Manage Department
              </Link>

              <button
                type="button"
                className="px-4 py-3 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-xl text-sm font-medium transition"
              >
                Assign Admin
              </button>

            </div>

          </div>
        ))}

      </div>

      {/* NO RESULT */}
      {filteredDepartments.length === 0 && (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">

          <div className="text-4xl mb-3">
            🔎
          </div>

          <h3 className="font-semibold text-gray-900">
            No department found
          </h3>

          <p className="text-sm text-gray-500 mt-1">
            Try searching with a different department name.
          </p>

        </div>
      )}

    </div>
  );
}