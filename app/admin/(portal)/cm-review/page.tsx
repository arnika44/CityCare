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

const departmentMap: Record<string, string> = {
  Pothole: "PWD",
  "Road Damage": "PWD",
  "Open Drain": "PWD",

  "Water Leakage": "Water",
  "Water Supply": "Water",

  "Broken Streetlight": "Electricity",
  Electricity: "Electricity",

  Garbage: "Sanitation",
  "Illegal Dumping": "Sanitation",
  Waste: "Sanitation",

  "Traffic Problem": "Traffic",
  Traffic: "Traffic",
};

const departments = ["PWD", "Water", "Electricity", "Sanitation", "Traffic"];

export default function CMReviewPage() {
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
        console.error("CM Review error:", error);
        setComplaints([]);
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();
  }, []);

  const total = complaints.length;

  const resolved = complaints.filter(
    (item) => item.status === "Resolved"
  ).length;

  const pending = complaints.filter(
    (item) => item.status !== "Resolved"
  ).length;

  const inProgress = complaints.filter(
    (item) => item.status === "In Progress"
  ).length;

  const assigned = complaints.filter(
    (item) => item.status === "Assigned"
  ).length;

  const resolutionRate =
    total > 0 ? Math.round((resolved / total) * 100) : 0;

  const departmentData = useMemo(() => {
    return departments.map((department) => {
      const departmentComplaints = complaints.filter((complaint) => {
        const category = complaint.category || "";

        return departmentMap[category] === department;
      });

      const totalComplaints = departmentComplaints.length;

      const resolvedComplaints = departmentComplaints.filter(
        (item) => item.status === "Resolved"
      ).length;

      const pendingComplaints =
        totalComplaints - resolvedComplaints;

      const rate =
        totalComplaints > 0
          ? Math.round(
              (resolvedComplaints / totalComplaints) * 100
            )
          : 0;

      return {
        department,
        total: totalComplaints,
        resolved: resolvedComplaints,
        pending: pendingComplaints,
        rate,
      };
    });
  }, [complaints]);

  const highPendingDepartments = [...departmentData]
    .filter((item) => item.pending > 0)
    .sort((a, b) => b.pending - a.pending);

  const recentComplaints = [...complaints]
    .sort(
      (a, b) =>
        new Date(b.createdAt || 0).getTime() -
        new Date(a.createdAt || 0).getTime()
    )
    .slice(0, 8);

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          CM Review
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          City-level overview of complaints, department performance
          and pending civic issues.
        </p>
      </div>

      {loading ? (
        <div className="rounded-xl border bg-white p-10 text-center text-gray-500 shadow-sm">
          Loading city review...
        </div>
      ) : (
        <>
          {/* City Overview */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
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
                Resolved
              </p>

              <h2 className="mt-2 text-3xl font-bold text-green-600">
                {resolved}
              </h2>
            </div>

            <div className="rounded-xl border bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-500">
                Pending
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
                Resolution Rate
              </p>

              <h2 className="mt-2 text-3xl font-bold text-indigo-600">
                {resolutionRate}%
              </h2>
            </div>
          </div>

          {/* City Performance */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="rounded-xl border bg-white p-6 shadow-sm lg:col-span-2">
              <h2 className="font-semibold text-gray-900">
                Overall City Performance
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Current status of civic complaints
              </p>

              <div className="mt-6">
                <div className="mb-2 flex justify-between text-sm">
                  <span className="font-medium text-gray-700">
                    Resolution Progress
                  </span>

                  <span className="font-semibold text-green-600">
                    {resolutionRate}%
                  </span>
                </div>

                <div className="h-4 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-green-500"
                    style={{
                      width: `${resolutionRate}%`,
                    }}
                  />
                </div>
              </div>

              <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-xs text-gray-500">
                    Pending
                  </p>

                  <p className="mt-1 text-xl font-bold text-orange-600">
                    {pending}
                  </p>
                </div>

                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-xs text-gray-500">
                    Assigned
                  </p>

                  <p className="mt-1 text-xl font-bold text-purple-600">
                    {assigned}
                  </p>
                </div>

                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-xs text-gray-500">
                    In Progress
                  </p>

                  <p className="mt-1 text-xl font-bold text-blue-600">
                    {inProgress}
                  </p>
                </div>
              </div>
            </div>

            {/* Review Status */}
            <div className="rounded-xl border bg-white p-6 shadow-sm">
              <h2 className="font-semibold text-gray-900">
                Review Summary
              </h2>

              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between border-b pb-4">
                  <span className="text-sm text-gray-600">
                    Total Issues
                  </span>

                  <span className="font-bold text-gray-900">
                    {total}
                  </span>
                </div>

                <div className="flex items-center justify-between border-b pb-4">
                  <span className="text-sm text-gray-600">
                    Resolved Issues
                  </span>

                  <span className="font-bold text-green-600">
                    {resolved}
                  </span>
                </div>

                <div className="flex items-center justify-between border-b pb-4">
                  <span className="text-sm text-gray-600">
                    Pending Issues
                  </span>

                  <span className="font-bold text-orange-600">
                    {pending}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    Resolution Rate
                  </span>

                  <span className="font-bold text-indigo-600">
                    {resolutionRate}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Department Performance */}
          <div className="rounded-xl border bg-white shadow-sm">
            <div className="border-b px-6 py-4">
              <h2 className="font-semibold text-gray-900">
                Department Performance
              </h2>

              <p className="text-sm text-gray-500">
                Department-wise complaint and resolution overview
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                  <tr>
                    <th className="px-6 py-3">
                      Department
                    </th>

                    <th className="px-6 py-3">
                      Total
                    </th>

                    <th className="px-6 py-3">
                      Resolved
                    </th>

                    <th className="px-6 py-3">
                      Pending
                    </th>

                    <th className="px-6 py-3">
                      Resolution Rate
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y">
                  {departmentData.map((item) => (
                    <tr
                      key={item.department}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {item.department}
                      </td>

                      <td className="px-6 py-4">
                        {item.total}
                      </td>

                      <td className="px-6 py-4 text-green-600">
                        {item.resolved}
                      </td>

                      <td className="px-6 py-4 text-orange-600">
                        {item.pending}
                      </td>

                      <td className="px-6 py-4">
                        <span className="font-semibold text-indigo-600">
                          {item.rate}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* High Pending Departments */}
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <h2 className="font-semibold text-gray-900">
              Departments Requiring Attention
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Departments with pending complaints that may require
              administrative review.
            </p>

            <div className="mt-5 space-y-3">
              {highPendingDepartments.length === 0 ? (
                <div className="rounded-lg bg-green-50 p-4 text-sm text-green-700">
                  No pending department complaints found.
                </div>
              ) : (
                highPendingDepartments.map((item) => (
                  <div
                    key={item.department}
                    className="flex flex-col gap-2 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-semibold text-gray-900">
                        {item.department}
                      </p>

                      <p className="text-sm text-gray-500">
                        {item.pending} pending complaint
                        {item.pending !== 1 ? "s" : ""}
                      </p>
                    </div>

                    <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">
                      Review Required
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent City Complaints */}
          <div className="rounded-xl border bg-white shadow-sm">
            <div className="border-b px-6 py-4">
              <h2 className="font-semibold text-gray-900">
                Recent City Complaints
              </h2>

              <p className="text-sm text-gray-500">
                Latest complaints received by CityCare
              </p>
            </div>

            {recentComplaints.length === 0 ? (
              <div className="p-8 text-center text-sm text-gray-500">
                No complaints available.
              </div>
            ) : (
              <div className="divide-y">
                {recentComplaints.map((complaint, index) => (
                  <div
                    key={complaint._id || complaint.id || index}
                    className="flex flex-col gap-3 p-5 hover:bg-gray-50 md:flex-row md:items-center md:justify-between"
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-gray-900">
                          {complaint.category || "Other"}
                        </span>

                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${getStatusStyle(
                            complaint.status
                          )}`}
                        >
                          {complaint.status || "Reported"}
                        </span>
                      </div>

                      <p className="mt-1 line-clamp-1 text-sm text-gray-600">
                        {complaint.description ||
                          "No description available"}
                      </p>

                      <p className="mt-1 text-xs text-gray-400">
                        {complaint.location?.address ||
                          "Location not available"}
                      </p>
                    </div>

                    <div className="text-left text-xs text-gray-500 md:text-right">
                      <p>
                        {formatDate(complaint.createdAt)}
                      </p>

                      <p className="mt-1">
                        ID:{" "}
                        {complaint._id ||
                          complaint.id ||
                          "N/A"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}