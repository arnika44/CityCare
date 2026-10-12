"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
  PWD: {
    id: "pwd-admin",
    name: "PWD Department Admin",
  },

  Water: {
    id: "water-admin",
    name: "Water Department Admin",
  },

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

  status:
    | "Reported"
    | "Verified"
    | "Assigned"
    | "In Progress"
    | "Resolved";

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

export default function AdminComplaintDetails() {
  const params = useParams();
  const router = useRouter();

  const id = params.id as string;

  const [complaint, setComplaint] =
    useState<Complaint | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [department, setDepartment] =
    useState("");

  const [status, setStatus] =
    useState("");

  const [error, setError] = useState("");

  // ==========================================
  // FETCH COMPLAINT
  // ==========================================

  useEffect(() => {
    const fetchComplaint = async () => {
      try {
        setLoading(true);

        const response = await fetch(
          `/api/complaints/${id}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Failed to fetch complaint."
          );
        }

        setComplaint(data.complaint);

        setDepartment(
          data.complaint.department || ""
        );

        setStatus(
          data.complaint.status || "Reported"
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong."
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchComplaint();
    }
  }, [id]);

  // ==========================================
  // ASSIGN DEPARTMENT
  // ==========================================

  const handleAssign = async () => {
    if (!department) {
      alert("Please select a department.");
      return;
    }

    try {
      setSaving(true);

      const admin =
        DEPARTMENT_ADMINS[department];

      const response = await fetch(
        `/api/complaints/${id}`,
        {
          method: "PATCH",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            department,
            assignedAdminId: admin?.id || "",
            assignedAdminName: admin?.name || "",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to assign complaint."
        );
      }

      setComplaint(data.complaint);

      setStatus(data.complaint.status);

      alert(
        "Complaint assigned successfully."
      );
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : "Failed to assign complaint."
      );
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // UPDATE STATUS
  // ==========================================

  const handleStatusUpdate = async () => {
    if (!status) return;

    try {
      setSaving(true);

      const response = await fetch(
        `/api/complaints/${id}`,
        {
          method: "PATCH",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            status,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to update status."
        );
      }

      setComplaint(data.complaint);

      alert(
        "Complaint status updated successfully."
      );
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : "Failed to update status."
      );
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-gray-500">
          Loading complaint...
        </p>
      </div>
    );
  }

  // ==========================================
  // ERROR
  // ==========================================

  if (error || !complaint) {
    return (
      <div className="p-6">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6">
          <h2 className="text-lg font-semibold text-red-700">
            Unable to load complaint
          </h2>

          <p className="mt-2 text-sm text-red-600">
            {error || "Complaint not found."}
          </p>

          <button
            onClick={() =>
              router.push(
                "/admin/complaints"
              )
            }
            className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white"
          >
            Back to Complaints
          </button>
        </div>
      </div>
    );
  }

  const selectedAdmin =
    department
      ? DEPARTMENT_ADMINS[department]
      : null;

  return (
    <div className="space-y-6 p-6">

      {/* HEADER */}

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">

        <div>
          <button
            onClick={() =>
              router.push(
                "/admin/complaints"
              )
            }
            className="mb-2 text-sm text-gray-500 hover:text-gray-800"
          >
            ← Back to Complaints
          </button>

          <h1 className="text-2xl font-bold text-gray-900">
            Complaint Details
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Complaint ID: {complaint._id}
          </p>
        </div>

        <span className="rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-700">
          {complaint.status}
        </span>
      </div>

      {/* MAIN GRID */}

      <div className="grid gap-6 lg:grid-cols-3">

        {/* COMPLAINT INFORMATION */}

        <div className="space-y-6 lg:col-span-2">

          <div className="rounded-2xl border bg-white p-6 shadow-sm">

            <h2 className="text-lg font-semibold text-gray-900">
              Complaint Information
            </h2>

            <div className="mt-5 grid gap-5 md:grid-cols-2">

              <div>
                <p className="text-xs text-gray-500">
                  Category
                </p>

                <p className="mt-1 font-medium text-gray-900">
                  {complaint.category}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">
                  Citizen ID
                </p>

                <p className="mt-1 font-medium text-gray-900">
                  {complaint.citizenId}
                </p>
              </div>

              <div className="md:col-span-2">
                <p className="text-xs text-gray-500">
                  Description
                </p>

                <p className="mt-1 leading-7 text-gray-800">
                  {complaint.description}
                </p>
              </div>

              <div className="md:col-span-2">
                <p className="text-xs text-gray-500">
                  Location
                </p>

                <p className="mt-1 text-gray-800">
                  {complaint.location.address ||
                    "Address not available"}
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  Latitude:{" "}
                  {complaint.location.latitude}
                  {" • "}
                  Longitude:{" "}
                  {complaint.location.longitude}
                </p>
              </div>

              {complaint.landmark && (
                <div>
                  <p className="text-xs text-gray-500">
                    Landmark
                  </p>

                  <p className="mt-1 text-gray-800">
                    {complaint.landmark}
                  </p>
                </div>
              )}

              {complaint.locationDetails && (
                <div>
                  <p className="text-xs text-gray-500">
                    Location Details
                  </p>

                  <p className="mt-1 text-gray-800">
                    {complaint.locationDetails}
                  </p>
                </div>
              )}

            </div>
          </div>

          {/* IMAGE */}

          {complaint.imageUrl && (
            <div className="rounded-2xl border bg-white p-6 shadow-sm">

              <h2 className="text-lg font-semibold text-gray-900">
                Complaint Image
              </h2>

              <img
                src={complaint.imageUrl}
                alt="Complaint"
                className="mt-4 max-h-[450px] w-full rounded-xl object-contain bg-gray-100"
              />

            </div>
          )}

          {/* STATUS HISTORY */}

          <div className="rounded-2xl border bg-white p-6 shadow-sm">

            <h2 className="text-lg font-semibold text-gray-900">
              Status History
            </h2>

            <div className="mt-5 space-y-4">

              {complaint.statusHistory
                ?.slice()
                .reverse()
                .map((item, index) => (
                  <div
                    key={`${item.status}-${index}`}
                    className="flex gap-4"
                  >

                    <div className="mt-1 h-3 w-3 rounded-full bg-blue-600" />

                    <div>
                      <p className="font-medium text-gray-900">
                        {item.status}
                      </p>

                      <p className="text-xs text-gray-500">
                        {new Date(
                          item.timestamp
                        ).toLocaleString()}
                      </p>
                    </div>

                  </div>
                ))}

            </div>
          </div>

        </div>

        {/* ADMIN CONTROL */}

        <div className="space-y-6">

          {/* ASSIGNMENT */}

          <div className="rounded-2xl border bg-white p-6 shadow-sm">

            <h2 className="text-lg font-semibold text-gray-900">
              Assign Complaint
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Assign this complaint to the responsible department.
            </p>

            <label className="mt-5 block text-sm font-medium text-gray-700">
              Department
            </label>

            <select
              value={department}
              onChange={(e) =>
                setDepartment(e.target.value)
              }
              className="mt-2 w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-blue-500"
            >
              <option value="">
                Select Department
              </option>

              {DEPARTMENTS.map((item) => (
                <option
                  key={item}
                  value={item}
                >
                  {item}
                </option>
              ))}
            </select>

            {selectedAdmin && (
              <div className="mt-4 rounded-lg bg-gray-50 p-4">

                <p className="text-xs text-gray-500">
                  Department Admin
                </p>

                <p className="mt-1 font-medium text-gray-900">
                  {selectedAdmin.name}
                </p>

              </div>
            )}

            <button
              onClick={handleAssign}
              disabled={saving || !department}
              className="mt-5 w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : "Assign Complaint"}
            </button>

          </div>

          {/* STATUS */}

          <div className="rounded-2xl border bg-white p-6 shadow-sm">

            <h2 className="text-lg font-semibold text-gray-900">
              Update Status
            </h2>

            <select
              value={status}
              onChange={(e) =>
                setStatus(e.target.value)
              }
              className="mt-4 w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-blue-500"
            >
              {STATUSES.map((item) => (
                <option
                  key={item}
                  value={item}
                >
                  {item}
                </option>
              ))}
            </select>

            <button
              onClick={handleStatusUpdate}
              disabled={saving}
              className="mt-4 w-full rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
            >
              {saving
                ? "Updating..."
                : "Update Status"}
            </button>

          </div>

          {/* CURRENT ASSIGNMENT */}

          <div className="rounded-2xl border bg-white p-6 shadow-sm">

            <h2 className="text-lg font-semibold text-gray-900">
              Current Assignment
            </h2>

            <div className="mt-4 space-y-4">

              <div>
                <p className="text-xs text-gray-500">
                  Department
                </p>

                <p className="mt-1 font-medium text-gray-900">
                  {complaint.department ||
                    "Not Assigned"}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">
                  Department Admin
                </p>

                <p className="mt-1 font-medium text-gray-900">
                  {complaint.assignedAdminName ||
                    "Not Assigned"}
                </p>
              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}