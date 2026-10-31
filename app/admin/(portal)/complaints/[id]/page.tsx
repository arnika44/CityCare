
"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type ComplaintStatus =
  | "Reported"
  | "Verified"
  | "Assigned"
  | "In Progress"
  | "Awaiting Citizen Verification"
  | "Resolved";

type Department =
  | "PWD"
  | "Water"
  | "Electricity"
  | "Sanitation"
  | "Traffic";

interface StatusHistory {
  status: ComplaintStatus;
  timestamp: string;
}

interface Complaint {
  _id: string;
  citizenId: string;
  category: string;
  description: string;
  imageUrl?: string;
  location?: {
    latitude?: number;
    longitude?: number;
    address?: string;
  };
  landmark?: string;
  locationDetails?: string;
  department?: Department | "";
  assignedAdminId?: string;
  assignedAdminName?: string;
  status: ComplaintStatus;
  statusHistory: StatusHistory[];
  resolutionDescription?: string;
  resolutionSubmittedAt?: string;
  citizenResolutionStatus?: "Pending" | "Confirmed" | "Rejected";
  citizenResolutionFeedback?: string;
  citizenResolutionImageUrl?: string;
  citizenVerifiedAt?: string;
  createdAt: string;
  updatedAt: string;
}

const STATUSES: ComplaintStatus[] = [
  "Reported",
  "Verified",
  "Assigned",
  "In Progress",
];

const DEPARTMENTS: Department[] = [
  "PWD",
  "Water",
  "Electricity",
  "Sanitation",
  "Traffic",
];

const DEPARTMENT_ADMINS: Record<
  Department,
  { id: string; name: string }
> = {
  PWD: { id: "PWD-ADMIN-01", name: "PWD Department Admin" },
  Water: { id: "WATER-ADMIN-01", name: "Water Department Admin" },
  Electricity: {
    id: "ELEC-ADMIN-01",
    name: "Electricity Department Admin",
  },
  Sanitation: {
    id: "SAN-ADMIN-01",
    name: "Sanitation Department Admin",
  },
  Traffic: {
    id: "TRAFFIC-ADMIN-01",
    name: "Traffic Department Admin",
  },
};

function getSuggestedDepartment(category: string): Department | "" {
  const value = category.toLowerCase();

  if (
    value.includes("pothole") ||
    value.includes("road") ||
    value.includes("drain")
  ) {
    return "PWD";
  }

  if (
    value.includes("water") ||
    value.includes("leak") ||
    value.includes("waterlogging")
  ) {
    return "Water";
  }

  if (
    value.includes("electric") ||
    value.includes("streetlight") ||
    value.includes("switch")
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

function formatDate(date?: string) {
  if (!date) return "Not available";

  return new Date(date).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function statusColor(status: ComplaintStatus) {
  switch (status) {
    case "Reported":
      return "bg-blue-100 text-blue-700";
    case "Verified":
      return "bg-indigo-100 text-indigo-700";
    case "Assigned":
      return "bg-purple-100 text-purple-700";
    case "In Progress":
      return "bg-amber-100 text-amber-700";
    case "Awaiting Citizen Verification":
      return "bg-orange-100 text-orange-700";
    case "Resolved":
      return "bg-green-100 text-green-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

export default function AdminComplaintDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState(false);

  const [selectedDepartment, setSelectedDepartment] =
    useState<Department | "">("");

  const [selectedAdmin, setSelectedAdmin] = useState("");
  const [selectedStatus, setSelectedStatus] =
    useState<ComplaintStatus>("Reported");

  const [resolutionDescription, setResolutionDescription] = useState("");
  const [submittingVerification, setSubmittingVerification] =
    useState(false);

  const fetchComplaint = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`/api/complaints/${id}`, {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to fetch complaint.");
      }

      const item: Complaint = data.complaint;

      setComplaint(item);
      setSelectedDepartment(item.department || "");
      setSelectedAdmin(item.assignedAdminId || "");
      setSelectedStatus(item.status);
      setResolutionDescription(item.resolutionDescription || "");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) fetchComplaint();
  }, [id, fetchComplaint]);

  const handleDepartmentChange = (department: Department | "") => {
    setSelectedDepartment(department);
    setSelectedAdmin(
      department ? DEPARTMENT_ADMINS[department].id : ""
    );
  };

  const handleAssignment = async () => {
    if (!selectedDepartment) {
      alert("Please select a department.");
      return;
    }

    try {
      setUpdating(true);

      const admin = DEPARTMENT_ADMINS[selectedDepartment];

      const response = await fetch(`/api/complaints/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          department: selectedDepartment,
          assignedAdminId: admin.id,
          assignedAdminName: admin.name,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Assignment failed.");
      }

      alert("Department assigned successfully.");
      await fetchComplaint();
    } catch (err) {
      alert(
        err instanceof Error ? err.message : "Assignment failed."
      );
    } finally {
      setUpdating(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!selectedStatus) return;

    if (selectedStatus === "Resolved") {
      alert("Only the citizen can confirm complaint resolution.");
      return;
    }

    try {
      setUpdating(true);

      const response = await fetch(`/api/complaints/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: selectedStatus }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Status update failed.");
      }

      alert("Complaint status updated successfully.");
      await fetchComplaint();
    } catch (err) {
      alert(
        err instanceof Error ? err.message : "Status update failed."
      );
    } finally {
      setUpdating(false);
    }
  };

  const handleSubmitForVerification = async () => {
    if (!resolutionDescription.trim()) {
      alert("Please describe the work completed.");
      return;
    }

    if (!window.confirm(
      "Submit this complaint for citizen verification?"
    )) {
      return;
    }

    try {
      setSubmittingVerification(true);

      const response = await fetch(`/api/complaints/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submitForVerification: true,
          resolutionDescription: resolutionDescription.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to submit for verification."
        );
      }

      alert("Complaint submitted for citizen verification.");
      await fetchComplaint();
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : "Failed to submit for verification."
      );
    } finally {
      setSubmittingVerification(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm font-semibold text-slate-500">
          Loading complaint details...
        </p>
      </div>
    );
  }

  if (error || !complaint) {
    return (
      <div className="min-h-[60vh] px-6 py-10">
        <div className="mx-auto max-w-3xl rounded-2xl border border-red-200 bg-white p-8">
          <h2 className="text-xl font-bold text-red-600">
            Unable to load complaint
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            {error || "Complaint not found."}
          </p>
          <button
            onClick={() => router.back()}
            className="mt-5 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const isAwaitingVerification =
    complaint.status === "Awaiting Citizen Verification";

  const isResolved = complaint.status === "Resolved";

  return (
    <div className="min-h-screen bg-slate-50/80 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1500px] space-y-8">

        {/* PAGE HEADER */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">
              Admin Portal
            </p>

            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Complaint Details
            </h1>

            <p className="mt-2 text-sm font-medium text-slate-500">
              Review, assign and monitor this complaint.
            </p>
          </div>

          <button
            onClick={() => router.push("/admin/complaints")}
            className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50"
          >
            ← Back to Complaints
          </button>
        </div>

        {/* STATUS AND OVERVIEW */}
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">
              Complaint Category
            </p>
            <h3 className="mt-3 text-xl font-extrabold text-slate-900">
              {complaint.category}
            </h3>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">
              Current Status
            </p>
            <span
              className={`mt-3 inline-flex rounded-full px-3 py-1.5 text-xs font-bold ${statusColor(
                complaint.status
              )}`}
            >
              {complaint.status}
            </span>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">
              Department
            </p>
            <h3 className="mt-3 text-xl font-extrabold text-slate-900">
              {complaint.department || "Not Assigned"}
            </h3>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">
              Reported Date
            </p>
            <h3 className="mt-3 text-base font-extrabold text-slate-900">
              {formatDate(complaint.createdAt)}
            </h3>
          </div>
        </div>

        <div className="grid items-start gap-6 xl:grid-cols-3">

          {/* COMPLAINT INFORMATION */}
          <div className="space-y-6 xl:col-span-2">

            <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-extrabold tracking-tight text-slate-800">
                Complaint Information
              </h2>

              <div className="mt-6 space-y-5">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Complaint ID
                  </p>
                  <p className="mt-1 break-all text-sm font-semibold text-slate-700">
                    {complaint._id}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Description
                  </p>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-700">
                    {complaint.description}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Location
                  </p>
                  <p className="mt-2 text-sm text-slate-700">
                    {complaint.location?.address ||
                      `${complaint.location?.latitude ?? "N/A"}, ${
                        complaint.location?.longitude ?? "N/A"
                      }`}
                  </p>
                </div>

                {complaint.landmark && (
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Landmark
                    </p>
                    <p className="mt-1 text-sm text-slate-700">
                      {complaint.landmark}
                    </p>
                  </div>
                )}

                {complaint.locationDetails && (
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Additional Location Details
                    </p>
                    <p className="mt-1 text-sm text-slate-700">
                      {complaint.locationDetails}
                    </p>
                  </div>
                )}

                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Citizen ID
                  </p>
                  <p className="mt-1 break-all text-sm font-semibold text-slate-700">
                    {complaint.citizenId}
                  </p>
                </div>
              </div>

              {complaint.imageUrl && (
                <div className="mt-7">
                  <h3 className="mb-3 text-sm font-bold text-slate-700">
                    Complaint Photo
                  </h3>
                  <a
                    href={complaint.imageUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <img
                      src={complaint.imageUrl}
                      alt="Complaint"
                      className="max-h-[420px] w-full rounded-xl border border-slate-200 object-contain"
                    />
                  </a>
                </div>
              )}
            </section>

            {/* STATUS HISTORY */}
            <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-extrabold tracking-tight text-slate-800">
                Status History
              </h2>

              <div className="mt-6 space-y-5">
                {complaint.statusHistory?.map((item, index) => (
                  <div key={`${item.status}-${index}`} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="h-3 w-3 rounded-full bg-blue-600" />
                      {index !== complaint.statusHistory.length - 1 && (
                        <div className="mt-1 min-h-8 w-0.5 bg-slate-200" />
                      )}
                    </div>

                    <div className="-mt-1 pb-2">
                      <p className="text-sm font-bold text-slate-800">
                        {item.status}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {formatDate(item.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* RESOLUTION DETAILS */}
            {(complaint.resolutionDescription ||
              complaint.citizenResolutionFeedback ||
              complaint.citizenResolutionImageUrl) && (
              <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
                <h2 className="text-xl font-extrabold tracking-tight text-slate-800">
                  Resolution & Citizen Verification
                </h2>

                {complaint.resolutionDescription && (
                  <div className="mt-5">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Work Completed by Department
                    </p>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-700">
                      {complaint.resolutionDescription}
                    </p>
                  </div>
                )}

                {complaint.resolutionSubmittedAt && (
                  <p className="mt-3 text-xs text-slate-500">
                    Submitted for verification:{" "}
                    {formatDate(complaint.resolutionSubmittedAt)}
                  </p>
                )}

                {complaint.citizenResolutionStatus && (
                  <div className="mt-5">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Citizen Response
                    </p>
                    <p className="mt-2 text-sm font-bold text-slate-800">
                      {complaint.citizenResolutionStatus}
                    </p>
                  </div>
                )}

                {complaint.citizenResolutionFeedback && (
                  <div className="mt-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Citizen Feedback
                    </p>
                    <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">
                      {complaint.citizenResolutionFeedback}
                    </p>
                  </div>
                )}

                {complaint.citizenResolutionImageUrl && (
                  <div className="mt-5">
                    <p className="mb-3 text-sm font-bold text-slate-700">
                      Citizen Verification Photo
                    </p>
                    <a
                      href={complaint.citizenResolutionImageUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <img
                        src={complaint.citizenResolutionImageUrl}
                        alt="Citizen verification"
                        className="max-h-[350px] w-full rounded-xl border border-slate-200 object-contain"
                      />
                    </a>
                  </div>
                )}

                {complaint.citizenVerifiedAt && (
                  <p className="mt-4 text-xs text-slate-500">
                    Citizen response date:{" "}
                    {formatDate(complaint.citizenVerifiedAt)}
                  </p>
                )}
              </section>
            )}
          </div>

          {/* ADMIN ACTIONS */}
          <div className="space-y-6">

            {/* DEPARTMENT ASSIGNMENT */}
            <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-extrabold tracking-tight text-slate-800">
                Assign Department
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Select the department responsible for this complaint.
              </p>

              <label className="mt-5 block text-sm font-bold text-slate-700">
                Department
              </label>

              <select
                value={selectedDepartment}
                onChange={(e) =>
                  handleDepartmentChange(e.target.value as Department | "")
                }
                disabled={isAwaitingVerification || isResolved || updating}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:border-blue-500 disabled:bg-slate-100"
              >
                <option value="">Select Department</option>
                {DEPARTMENTS.map((department) => (
                  <option key={department} value={department}>
                    {department}
                  </option>
                ))}
              </select>

              {selectedDepartment && (
                <div className="mt-4 rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Assigned Department Admin
                  </p>
                  <p className="mt-2 text-sm font-bold text-slate-800">
                    {DEPARTMENT_ADMINS[selectedDepartment].name}
                  </p>
                </div>
              )}

              <button
                onClick={handleAssignment}
                disabled={
                  updating ||
                  isAwaitingVerification ||
                  isResolved ||
                  !selectedDepartment
                }
                className="mt-5 w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {updating ? "Updating..." : "Save Assignment"}
              </button>
            </section>

            {/* STATUS UPDATE */}
            <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-extrabold tracking-tight text-slate-800">
                Update Status
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Update the progress of this complaint.
              </p>

              <label className="mt-5 block text-sm font-bold text-slate-700">
                Complaint Status
              </label>

              <select
                value={selectedStatus}
                onChange={(e) =>
                  setSelectedStatus(e.target.value as ComplaintStatus)
                }
                disabled={isAwaitingVerification || isResolved || updating}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:border-blue-500 disabled:bg-slate-100"
              >
                {STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>

              <button
                onClick={handleStatusUpdate}
                disabled={
                  updating ||
                  isAwaitingVerification ||
                  isResolved ||
                  selectedStatus === complaint.status
                }
                className="mt-5 w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Update Status
              </button>
            </section>

            {/* SUBMIT FOR CITIZEN VERIFICATION */}
            {complaint.status === "In Progress" && (
              <section className="rounded-2xl border border-orange-200 bg-white p-6 shadow-sm">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-100 text-xl">
                  ✓
                </div>

                <h2 className="mt-4 text-xl font-extrabold text-slate-800">
                  Submit for Citizen Verification
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  After completing the work, describe what was done.
                  The citizen will verify whether the problem is actually
                  resolved.
                </p>

                <label className="mt-5 block text-sm font-bold text-slate-700">
                  Work Completion Description
                </label>

                <textarea
                  value={resolutionDescription}
                  onChange={(e) =>
                    setResolutionDescription(e.target.value)
                  }
                  rows={5}
                  placeholder="Describe the work completed by the department..."
                  className="mt-2 w-full resize-y rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none focus:border-orange-500"
                />

                <button
                  onClick={handleSubmitForVerification}
                  disabled={
                    submittingVerification ||
                    !resolutionDescription.trim()
                  }
                  className="mt-4 w-full rounded-xl bg-orange-500 px-4 py-3 text-sm font-bold text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submittingVerification
                    ? "Submitting..."
                    : "Submit for Citizen Verification"}
                </button>
              </section>
            )}

            {/* AWAITING CITIZEN RESPONSE */}
            {isAwaitingVerification && (
              <section className="rounded-2xl border border-orange-200 bg-orange-50 p-6">
                <h2 className="text-lg font-extrabold text-orange-800">
                  Awaiting Citizen Verification
                </h2>

                <p className="mt-2 text-sm leading-6 text-orange-700">
                  Department has submitted the completed work. The
                  complaint will be marked Resolved only after the
                  citizen confirms it.
                </p>

                <p className="mt-4 text-xs font-bold text-orange-700">
                  Current response:{" "}
                  {complaint.citizenResolutionStatus || "Pending"}
                </p>
              </section>
            )}

            {/* FINAL RESOLVED STATE */}
            {isResolved && (
              <section className="rounded-2xl border border-green-200 bg-green-50 p-6">
                <h2 className="text-lg font-extrabold text-green-800">
                  Complaint Resolved
                </h2>

                <p className="mt-2 text-sm leading-6 text-green-700">
                  The citizen has confirmed that the reported problem
                  has been resolved.
                </p>
              </section>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
