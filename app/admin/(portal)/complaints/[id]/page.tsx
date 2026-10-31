
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

const STATUSES = [
  "Reported",
  "Verified",
  "Assigned",
  "In Progress",
  "Resolved",
] as const;

const DEPARTMENTS = [
  "PWD",
  "Water",
  "Electricity",
  "Sanitation",
  "Traffic",
] as const;

const DEPARTMENT_ADMINS: Record<
  string,
  { id: string; name: string }
> = {
  PWD: { id: "pwd-admin", name: "PWD Department Admin" },
  Water: { id: "water-admin", name: "Water Department Admin" },
  Electricity: {
    id: "electricity-admin",
    name: "Electricity Department Admin",
  },
  Sanitation: {
    id: "sanitation-admin",
    name: "Sanitation Department Admin",
  },
  Traffic: {
    id: "traffic-admin",
    name: "Traffic Department Admin",
  },
};

type Complaint = {
  _id: string;
  citizenId: string;
  category: string;
  description: string;
  imageUrl?: string;
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  landmark?: string;
  locationDetails?: string;
  status: string;
  department?: string;
  assignedAdminId?: string;
  assignedAdminName?: string;
  statusHistory: {
    status: string;
    timestamp: string;
  }[];
  createdAt: string;
  updatedAt: string;
};

function getSuggestedDepartment(category: string) {
  const value = category.toLowerCase();

  if (
    value.includes("water") ||
    value.includes("leak") ||
    value.includes("supply") ||
    value.includes("waterlogging")
  ) {
    return "Water";
  }

  if (
    value.includes("pothole") ||
    value.includes("road") ||
    value.includes("drain")
  ) {
    return "PWD";
  }

  if (
    value.includes("streetlight") ||
    value.includes("electricity") ||
    value.includes("electric")
  ) {
    return "Electricity";
  }

  if (
    value.includes("garbage") ||
    value.includes("waste") ||
    value.includes("sewage") ||
    value.includes("dumping")
  ) {
    return "Sanitation";
  }

  if (value.includes("traffic")) {
    return "Traffic";
  }

  return "";
}

export default function AdminComplaintDetails() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [department, setDepartment] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchComplaint = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`/api/complaints/${id}`, {
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch complaint.");
        }

        const item = data.complaint as Complaint;

        setComplaint(item);
        setDepartment(
          item.department || getSuggestedDepartment(item.category) || ""
        );
        setStatus(item.status || "Reported");
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Something went wrong."
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchComplaint();
  }, [id]);

  const handleAssign = async () => {
    if (!department) {
      setError("Please select a department.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const admin = DEPARTMENT_ADMINS[department];

      const response = await fetch(`/api/complaints/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          department,
          assignedAdminId: admin.id,
          assignedAdminName: admin.name,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to assign complaint.");
      }

      setComplaint(data.complaint);
      setStatus(data.complaint.status);
      setDepartment(data.complaint.department || department);
      setSuccess("Complaint assigned successfully.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to assign complaint."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!status) return;

    if (
      (status === "Assigned" || status === "In Progress") &&
      !complaint?.department
    ) {
      setError("Please assign a department before updating this status.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const response = await fetch(`/api/complaints/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update status.");
      }

      setComplaint(data.complaint);
      setSuccess("Complaint status updated successfully.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update status."
      );
    } finally {
      setSaving(false);
    }
  };

  const cardClass =
    "rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm";

  const headingClass =
    "text-xl font-extrabold tracking-tight text-slate-800";

  const labelClass = "text-sm font-semibold text-slate-500";

  const valueClass = "mt-1 text-sm font-semibold text-slate-800";

  const inputClass =
    "mt-2 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100";

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50/80 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto flex min-h-[60vh] max-w-[1500px] items-center justify-center">
          <p className="text-sm font-semibold text-slate-500">
            Loading complaint...
          </p>
        </div>
      </main>
    );
  }

  if (error && !complaint) {
    return (
      <main className="min-h-screen bg-slate-50/80 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1500px]">
          <div className="rounded-2xl border border-red-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-extrabold text-red-700">
              Unable to load complaint
            </h2>
            <p className="mt-2 text-sm text-red-600">{error}</p>
            <button
              onClick={() => router.push("/admin/complaints")}
              className="mt-5 rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white"
            >
              Back to Complaints
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (!complaint) return null;

  const selectedAdmin = department
    ? DEPARTMENT_ADMINS[department]
    : null;

  const suggestedDepartment = getSuggestedDepartment(complaint.category);

  return (
    <main className="min-h-screen bg-slate-50/80 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1500px] space-y-8">

        {/* HEADER */}
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <button
              onClick={() => router.push("/admin/complaints")}
              className="mb-3 text-sm font-semibold text-blue-600 hover:text-blue-800"
            >
              ← Back to Complaints
            </button>

            <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-blue-600">
              CityCare Administration
            </p>

            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Complaint Details
            </h1>

            <p className="mt-2 text-sm font-medium text-slate-500">
              Review complaint information and manage its assignment and status.
            </p>
          </div>

          <span className="inline-flex w-fit items-center rounded-xl bg-blue-50 px-4 py-3 text-sm font-bold text-blue-700">
            {complaint.status}
          </span>
        </header>

        {/* ALERTS */}
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-3 text-sm font-semibold text-emerald-700">
            {success}
          </div>
        )}

        {/* COMPLAINT OVERVIEW */}
        <section>
          <div className="mb-5">
            <h2 className={headingClass}>Complaint Overview</h2>
            <p className="mt-1 text-sm text-slate-500">
              Basic information about the reported issue.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { title: "Category", value: complaint.category },
              { title: "Current Status", value: complaint.status },
              { title: "Department", value: complaint.department || "Unassigned" },
              {
                title: "Reported On",
                value: new Date(complaint.createdAt).toLocaleDateString("en-IN"),
              },
            ].map((item) => (
              <div key={item.title} className={cardClass}>
                <p className={labelClass}>{item.title}</p>
                <p className="mt-3 text-xl font-extrabold tracking-tight text-slate-900">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* MAIN CONTENT */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

          {/* LEFT SIDE */}
          <div className="space-y-6 lg:col-span-2">

            {/* INFORMATION */}
            <section className={cardClass}>
              <h2 className={headingClass}>Complaint Information</h2>

              <div className="mt-6 grid gap-6 sm:grid-cols-2">
                <div>
                  <p className={labelClass}>Complaint ID</p>
                  <p className={`${valueClass} break-all`}>{complaint._id}</p>
                </div>

                <div>
                  <p className={labelClass}>Citizen ID</p>
                  <p className={valueClass}>{complaint.citizenId}</p>
                </div>

                <div className="sm:col-span-2">
                  <p className={labelClass}>Description</p>
                  <p className="mt-2 text-sm font-medium leading-7 text-slate-700">
                    {complaint.description}
                  </p>
                </div>

                <div className="sm:col-span-2">
                  <p className={labelClass}>Location</p>
                  <p className={valueClass}>
                    {complaint.location?.address || "Address not available"}
                  </p>
                  <p className="mt-2 text-xs font-medium text-slate-400">
                    Latitude: {complaint.location?.latitude ?? "—"} •
                    Longitude: {complaint.location?.longitude ?? "—"}
                  </p>
                </div>

                {complaint.landmark && (
                  <div>
                    <p className={labelClass}>Landmark</p>
                    <p className={valueClass}>{complaint.landmark}</p>
                  </div>
                )}

                {complaint.locationDetails && (
                  <div>
                    <p className={labelClass}>Location Details</p>
                    <p className={valueClass}>{complaint.locationDetails}</p>
                  </div>
                )}
              </div>
            </section>

            {/* IMAGE */}
            {complaint.imageUrl && (
              <section className={cardClass}>
                <h2 className={headingClass}>Complaint Image</h2>
                <img
                  src={complaint.imageUrl}
                  alt="Complaint"
                  className="mt-5 max-h-[450px] w-full rounded-xl bg-slate-50 object-contain"
                />
              </section>
            )}

            {/* STATUS HISTORY */}
            <section className={cardClass}>
              <h2 className={headingClass}>Status History</h2>

              <div className="mt-6 space-y-5">
                {complaint.statusHistory?.length ? (
                  complaint.statusHistory
                    .slice()
                    .reverse()
                    .map((item, index) => (
                      <div
                        key={`${item.status}-${index}`}
                        className="flex gap-4"
                      >
                        <div className="mt-1.5 h-3 w-3 shrink-0 rounded-full bg-blue-600 ring-4 ring-blue-50" />

                        <div>
                          <p className="text-sm font-bold text-slate-800">
                            {item.status}
                          </p>
                          <p className="mt-1 text-xs font-medium text-slate-400">
                            {new Date(item.timestamp).toLocaleString("en-IN")}
                          </p>
                        </div>
                      </div>
                    ))
                ) : (
                  <p className="text-sm text-slate-400">
                    No status history available.
                  </p>
                )}
              </div>
            </section>
          </div>

          {/* RIGHT SIDE */}
          <div className="space-y-6">

            {/* ASSIGNMENT */}
            <section className={cardClass}>
              <h2 className={headingClass}>Assign Complaint</h2>

              <p className="mt-2 text-sm text-slate-500">
                Select the department responsible for resolving this issue.
              </p>

              {suggestedDepartment && !complaint.department && (
                <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                    Suggested Department
                  </p>
                  <p className="mt-1 text-sm font-extrabold text-blue-800">
                    {suggestedDepartment}
                  </p>
                </div>
              )}

              <label className="mt-5 block text-sm font-bold text-slate-700">
                Select Department
              </label>

              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className={inputClass}
              >
                <option value="">Select Department</option>
                {DEPARTMENTS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>

              {selectedAdmin && (
                <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <p className="text-xs font-semibold text-slate-500">
                    Department Admin
                  </p>
                  <p className="mt-1 text-sm font-bold text-slate-800">
                    {selectedAdmin.name}
                  </p>
                </div>
              )}

              <button
                onClick={handleAssign}
                disabled={saving || !department}
                className="mt-5 w-full rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? "Saving..." : "Assign Complaint"}
              </button>
            </section>

            {/* STATUS UPDATE */}
            <section className={cardClass}>
              <h2 className={headingClass}>Update Status</h2>

              <label className="mt-5 block text-sm font-bold text-slate-700">
                Complaint Status
              </label>

              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className={inputClass}
              >
                {STATUSES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>

              <button
                onClick={handleStatusUpdate}
                disabled={saving}
                className="mt-5 w-full rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? "Updating..." : "Update Status"}
              </button>
            </section>

            {/* CURRENT ASSIGNMENT */}
            <section className={cardClass}>
              <h2 className={headingClass}>Current Assignment</h2>

              <div className="mt-5 space-y-5">
                <div>
                  <p className={labelClass}>Department</p>
                  <p className={valueClass}>
                    {complaint.department || "Not Assigned"}
                  </p>
                </div>

                <div>
                  <p className={labelClass}>Department Admin</p>
                  <p className={valueClass}>
                    {complaint.assignedAdminName || "Not Assigned"}
                  </p>
                </div>

                <div>
                  <p className={labelClass}>Admin ID</p>
                  <p className={valueClass}>
                    {complaint.assignedAdminId || "Not Assigned"}
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>

        <footer className="pb-3 text-center text-xs font-medium text-slate-400">
          CityCare Admin Portal • One Platform for Local Problems
        </footer>
      </div>
    </main>
  );
}
