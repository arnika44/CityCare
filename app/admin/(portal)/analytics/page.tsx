"use client";

import { useEffect, useMemo, useState } from "react";

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
};

const departments = [
  {
    name: "PWD",
    categories: ["Pothole", "Road Damage", "Open Drain"],
  },
  {
    name: "Water",
    categories: ["Water Leakage", "Water Supply"],
  },
  {
    name: "Electricity",
    categories: ["Broken Streetlight", "Electricity"],
  },
  {
    name: "Sanitation",
    categories: ["Garbage", "Illegal Dumping", "Waste"],
  },
  {
    name: "Traffic",
    categories: ["Traffic Problem", "Traffic"],
  },
];

export default function AnalyticsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
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
        console.error("Analytics error:", error);
        setComplaints([]);
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();
  }, []);

  const total = complaints.length;

  const reported = complaints.filter(
    (item) => item.status === "Reported"
  ).length;

  const verified = complaints.filter(
    (item) => item.status === "Verified"
  ).length;

  const assigned = complaints.filter(
    (item) => item.status === "Assigned"
  ).length;

  const inProgress = complaints.filter(
    (item) => item.status === "In Progress"
  ).length;

  const resolved = complaints.filter(
    (item) => item.status === "Resolved"
  ).length;

  const pending = total - resolved;

  const resolutionRate =
    total > 0 ? Math.round((resolved / total) * 100) : 0;

  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {};

    complaints.forEach((complaint) => {
      const category = complaint.category || "Other";
      counts[category] = (counts[category] || 0) + 1;
    });

    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [complaints]);

  const departmentData = useMemo(() => {
    return departments.map((department) => {
      const count = complaints.filter((complaint) => {
        const category = complaint.category?.toLowerCase() || "";

        return department.categories.some((item) =>
          category.includes(item.toLowerCase())
        );
      }).length;

      return {
        ...department,
        count,
      };
    });
  }, [complaints]);

  const statusData = [
    { name: "Reported", count: reported },
    { name: "Verified", count: verified },
    { name: "Assigned", count: assigned },
    { name: "In Progress", count: inProgress },
    { name: "Resolved", count: resolved },
  ];

  const maxCategoryCount =
    categoryData.length > 0 ? categoryData[0][1] : 1;

  const maxDepartmentCount = Math.max(
    ...departmentData.map((item) => item.count),
    1
  );

  const getStatusStyle = (status: string) => {
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Analytics
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Monitor complaint trends, status distribution and department
          performance.
        </p>
      </div>

      {loading ? (
        <div className="rounded-xl border bg-white p-10 text-center text-gray-500 shadow-sm">
          Loading analytics...
        </div>
      ) : (
        <>
          {/* Main Statistics */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-500">
                Total Complaints
              </p>

              <h2 className="mt-2 text-3xl font-bold text-gray-900">
                {total}
              </h2>
            </div>

            <div className="rounded-xl border bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-500">
                Pending Complaints
              </p>

              <h2 className="mt-2 text-3xl font-bold text-orange-600">
                {pending}
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

          {/* Resolution Overview */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="rounded-xl border bg-white p-6 shadow-sm lg:col-span-2">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-gray-900">
                    Complaint Status
                  </h2>

                  <p className="text-sm text-gray-500">
                    Current complaint lifecycle distribution
                  </p>
                </div>

                <span className="rounded-full bg-green-50 px-3 py-1 text-sm font-semibold text-green-700">
                  {resolutionRate}% Resolved
                </span>
              </div>

              <div className="mt-6 space-y-4">
                {statusData.map((item) => {
                  const percentage =
                    total > 0
                      ? Math.round((item.count / total) * 100)
                      : 0;

                  return (
                    <div key={item.name}>
                      <div className="mb-1 flex justify-between text-sm">
                        <span className="font-medium text-gray-700">
                          {item.name}
                        </span>

                        <span className="text-gray-500">
                          {item.count} ({percentage}%)
                        </span>
                      </div>

                      <div className="h-2.5 overflow-hidden rounded-full bg-gray-100">
                        <div
                          className={`h-full rounded-full ${
                            item.name === "Resolved"
                              ? "bg-green-500"
                              : item.name === "In Progress"
                              ? "bg-blue-500"
                              : item.name === "Assigned"
                              ? "bg-purple-500"
                              : item.name === "Verified"
                              ? "bg-yellow-500"
                              : "bg-gray-400"
                          }`}
                          style={{
                            width: `${percentage}%`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Resolution Rate */}
            <div className="rounded-xl border bg-white p-6 shadow-sm">
              <h2 className="font-semibold text-gray-900">
                Resolution Rate
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Overall complaint resolution
              </p>

              <div className="mt-8 flex items-center justify-center">
                <div className="flex h-40 w-40 flex-col items-center justify-center rounded-full border-[14px] border-green-100">
                  <span className="text-3xl font-bold text-green-600">
                    {resolutionRate}%
                  </span>

                  <span className="text-xs text-gray-500">
                    Resolved
                  </span>
                </div>
              </div>

              <div className="mt-6 text-center text-sm text-gray-500">
                {resolved} of {total} complaints resolved
              </div>
            </div>
          </div>

          {/* Department Performance */}
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <div>
              <h2 className="font-semibold text-gray-900">
                Department-wise Complaints
              </h2>

              <p className="text-sm text-gray-500">
                Distribution of complaints across departments
              </p>
            </div>

            <div className="mt-6 space-y-5">
              {departmentData.map((department) => {
                const percentage =
                  maxDepartmentCount > 0
                    ? (department.count / maxDepartmentCount) * 100
                    : 0;

                return (
                  <div key={department.name}>
                    <div className="mb-2 flex justify-between">
                      <span className="text-sm font-medium text-gray-700">
                        {department.name}
                      </span>

                      <span className="text-sm text-gray-500">
                        {department.count} complaints
                      </span>
                    </div>

                    <div className="h-3 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full bg-blue-500"
                        style={{
                          width: `${percentage}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Category Analysis */}
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <div>
              <h2 className="font-semibold text-gray-900">
                Complaint Categories
              </h2>

              <p className="text-sm text-gray-500">
                Most frequently reported civic problems
              </p>
            </div>

            {categoryData.length === 0 ? (
              <div className="py-10 text-center text-sm text-gray-500">
                No category data available.
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                {categoryData.map(([category, count]) => {
                  const percentage =
                    (count / maxCategoryCount) * 100;

                  return (
                    <div key={category}>
                      <div className="mb-2 flex justify-between">
                        <span className="text-sm font-medium text-gray-700">
                          {category}
                        </span>

                        <span className="text-sm text-gray-500">
                          {count}
                        </span>
                      </div>

                      <div className="h-2.5 overflow-hidden rounded-full bg-gray-100">
                        <div
                          className="h-full rounded-full bg-indigo-500"
                          style={{
                            width: `${percentage}%`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Status Summary Table */}
          <div className="rounded-xl border bg-white shadow-sm">
            <div className="border-b px-6 py-4">
              <h2 className="font-semibold text-gray-900">
                Status Summary
              </h2>

              <p className="text-sm text-gray-500">
                Complaint count by current status
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                  <tr>
                    <th className="px-6 py-3">
                      Status
                    </th>

                    <th className="px-6 py-3">
                      Complaints
                    </th>

                    <th className="px-6 py-3">
                      Percentage
                    </th>

                    <th className="px-6 py-3">
                      Current State
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y">
                  {statusData.map((item) => {
                    const percentage =
                      total > 0
                        ? Math.round((item.count / total) * 100)
                        : 0;

                    return (
                      <tr
                        key={item.name}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-6 py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusStyle(
                              item.name
                            )}`}
                          >
                            {item.name}
                          </span>
                        </td>

                        <td className="px-6 py-4 font-semibold text-gray-900">
                          {item.count}
                        </td>

                        <td className="px-6 py-4 text-gray-600">
                          {percentage}%
                        </td>

                        <td className="px-6 py-4 text-gray-500">
                          {item.name === "Resolved"
                            ? "Completed"
                            : "Requires monitoring"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}