
"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";

type Status =
  | "Reported"
  | "Verified"
  | "Assigned"
  | "In Progress"
  | "Awaiting Citizen Verification"
  | "Resolved";

type StatusHistory = {
  status: Status;
  timestamp: string;
};

type Complaint = {
  _id: string;
  category: string;
  description: string;
  imageUrl?: string;
  location: {
    latitude?: number;
    longitude?: number;
    address?: string;
  };
  landmark?: string;
  locationDetails?: string;
  status: Status;
  statusHistory?: StatusHistory[];
  resolutionDescription?: string;
  resolutionSubmittedAt?: string;
  citizenResolutionStatus?: "Pending" | "Confirmed" | "Rejected";
  citizenResolutionFeedback?: string;
  citizenResolutionImageUrl?: string;
  citizenVerifiedAt?: string;
  createdAt: string;
  updatedAt: string;
};

const STATUSES: Status[] = [
  "Reported",
  "Verified",
  "Assigned",
  "In Progress",
  "Awaiting Citizen Verification",
  "Resolved",
];

// Published Chief Minister's office telephone directory.
// These are office contacts, not necessarily dedicated grievance helplines.
const CM_OFFICE_CONTACTS: Record<string, { name: string; phone: string }> = {
  "andhra pradesh": { name: "Andhra Pradesh CM Office", phone: "4023476603" },
  "arunachal pradesh": { name: "Arunachal Pradesh CM Office", phone: "3602212456" },
  assam: { name: "Assam CM Office", phone: "3612262222" },
  bihar: { name: "Bihar CM Office", phone: "6122223886" },
  chhattisgarh: { name: "Chhattisgarh CM Office", phone: "7712221000" },
  goa: { name: "Goa CM Office", phone: "8322419841" },
  gujarat: { name: "Gujarat CM Office", phone: "7923232611" },
  haryana: { name: "Haryana CM Office", phone: "1722740945" },
  "himachal pradesh": { name: "Himachal Pradesh CM Office", phone: "1772625400" },
  "jammu and kashmir": { name: "Jammu and Kashmir CM Office", phone: "1912546766" },
  jharkhand: { name: "Jharkhand CM Office", phone: "6512281400" },
  karnataka: { name: "Karnataka CM Office", phone: "8022253414" },
  kerala: { name: "Kerala CM Office", phone: "4712333812" },
  "madhya pradesh": { name: "Madhya Pradesh CM Office", phone: "7552441581" },
  maharashtra: { name: "Maharashtra CM Office", phone: "2222025222" },
  manipur: { name: "Manipur CM Office", phone: "3852450137" },
  meghalaya: { name: "Meghalaya CM Office", phone: "3642224282" },
  mizoram: { name: "Mizoram CM Office", phone: "3892222205" },
  nagaland: { name: "Nagaland CM Office", phone: "3702270097" },
  odisha: { name: "Odisha CM Office", phone: "6742531100" },
  punjab: { name: "Punjab CM Office", phone: "1722740325" },
  rajasthan: { name: "Rajasthan CM Office", phone: "1412227656" },
  sikkim: { name: "Sikkim CM Office", phone: "3592201575" },
  "tamil nadu": { name: "Tamil Nadu CM Office", phone: "4425672345" },
  tripura: { name: "Tripura CM Office", phone: "3812324000" },
  "uttar pradesh": { name: "Uttar Pradesh CM Office", phone: "5222239296" },
  uttarakhand: { name: "Uttarakhand CM Office", phone: "1352665100" },
  "west bengal": { name: "West Bengal CM Office", phone: "3322145555" },
  delhi: { name: "Delhi CM Office", phone: "1123392020" },
  puducherry: { name: "Puducherry CM Office", phone: "4132333399" },
};

// Department numbers are included only where a direct number is available here.
const DEPARTMENT_CONTACTS: Record<string, { name: string; phone: string }> = {
  "delhi|pwd": { name: "Delhi PWD Helpline", phone: "1800110093" },
  "delhi|water": { name: "Delhi Water Helpline", phone: "1916" },
};

const STATE_NAMES = Object.keys(CM_OFFICE_CONTACTS).sort(
  (a, b) => b.length - a.length
);

function getStateFromAddress(address: string) {
  const normalized = address.toLowerCase();

  const aliases: Record<string, string> = {
    "jammu & kashmir": "jammu and kashmir",
    "nct of delhi": "delhi",
    "new delhi": "delhi",
    "orissa": "odisha",
    "uttaranchal": "uttarakhand",
  };

  for (const alias of Object.keys(aliases)) {
    if (normalized.includes(alias)) return aliases[alias];
  }

  return STATE_NAMES.find((state) => normalized.includes(state)) || "";
}

function getDepartmentKey(category: string) {
  const value = category.toLowerCase();

  if (
    ["pothole", "road damage", "open drain"].some((item) =>
      value.includes(item)
    )
  ) {
    return "pwd";
  }

  if (
    ["waterlogging", "water leakage", "water supply"].some((item) =>
      value.includes(item)
    )
  ) {
    return "water";
  }

  if (["streetlight", "electricity"].some((item) => value.includes(item))) {
    return "electricity";
  }

  if (
    ["garbage", "sewage", "illegal dumping", "waste"].some((item) =>
      value.includes(item)
    )
  ) {
    return "sanitation";
  }

  if (value.includes("traffic")) return "traffic";

  return "general";
}

export default function ComplaintDetailPage() {
  const params = useParams();
  const complaintId = params.id as string;

  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [citizenId, setCitizenId] = useState("");

  const [citizenFeedback, setCitizenFeedback] = useState("");
  const [verificationImage, setVerificationImage] = useState<File | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchComplaint = useCallback(async () => {
    try {
      setError("");

      const storedCitizenId = localStorage.getItem("citycare_citizen_id");

      if (!storedCitizenId) {
        setError("Citizen ID not found.");
        return;
      }

      setCitizenId(storedCitizenId);

      const response = await fetch(
        `/api/complaints?citizenId=${encodeURIComponent(storedCitizenId)}`,
        { cache: "no-store" }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to fetch complaint.");
      }

      const selectedComplaint = data.complaints.find(
        (item: Complaint) => item._id === complaintId
      );

      if (!selectedComplaint) {
        setError("Complaint not found.");
        return;
      }

      setComplaint(selectedComplaint);
    } catch (error) {
      console.error("Complaint detail fetch error:", error);

      setError(
        error instanceof Error ? error.message : "Unable to load complaint."
      );
    } finally {
      setIsLoading(false);
    }
  }, [complaintId]);

  useEffect(() => {
    if (complaintId) fetchComplaint();
  }, [complaintId, fetchComplaint]);

  const getHistoryTimestamp = (status: Status) => {
    return (
      complaint?.statusHistory?.find((item) => item.status === status)
        ?.timestamp || null
    );
  };

  const isStatusCompleted = (status: Status) => {
    if (!complaint) return false;

    return STATUSES.indexOf(status) <= STATUSES.indexOf(complaint.status);
  };

  const isCurrentStatus = (status: Status) => {
    return complaint?.status === status;
  };

  const handleCitizenResponse = async (action: "confirm" | "reject") => {
    if (!complaint || !citizenId) {
      alert("Citizen information not found.");
      return;
    }

    if (action === "reject" && !citizenFeedback.trim()) {
      alert("Please explain why the problem is not resolved.");
      return;
    }

    const confirmationMessage =
      action === "confirm"
        ? "Are you sure the problem has been resolved?"
        : "Are you sure the problem is still not resolved?";

    if (!window.confirm(confirmationMessage)) return;

    try {
      setIsSubmitting(true);

      let uploadedImageUrl = "";

      if (verificationImage) {
        const formData = new FormData();
        formData.append("file", verificationImage);

        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const uploadData = await uploadResponse.json();

        if (!uploadResponse.ok || !uploadData.success) {
          throw new Error(uploadData.message || "Failed to upload image.");
        }

        uploadedImageUrl = uploadData.imageUrl;
      }

      const response = await fetch(`/api/complaints/${complaintId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          citizenAction: action,
          citizenId,
          feedback: citizenFeedback.trim(),
          imageUrl: uploadedImageUrl,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to submit your response.");
      }

      alert(
        action === "confirm"
          ? "Thank you! Your confirmation has been submitted. Complaint marked as resolved."
          : "Your response has been submitted. The complaint has been returned to In Progress."
      );

      setCitizenFeedback("");
      setVerificationImage(null);
      await fetchComplaint();
    } catch (error) {
      console.error("Citizen verification error:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Unable to submit your response."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <main className="px-6 py-10">
        <div className="mx-auto w-full max-w-5xl">
          <div className="rounded-2xl border bg-white p-10 text-center shadow-md">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
            <p className="mt-4 font-semibold text-gray-700">
              Loading complaint details...
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (error || !complaint) {
    return (
      <main className="px-6 py-10">
        <div className="mx-auto w-full max-w-5xl">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
            <h2 className="text-xl font-bold text-red-700">
              {error || "Complaint not found."}
            </h2>
            <Link
              href="/citizen/complaints"
              className="mt-5 inline-block rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
            >
              ← Back to My Complaints
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const state = getStateFromAddress(complaint.location?.address || "");
  const departmentKey = getDepartmentKey(complaint.category);
  const departmentContact = DEPARTMENT_CONTACTS[`${state}|${departmentKey}`];
  const cmContact = CM_OFFICE_CONTACTS[state];

  return (
    <main className="px-6 py-10">
      <div className="mx-auto w-full max-w-5xl">
        <Link
          href="/citizen/complaints"
          className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700"
        >
          ← Back to My Complaints
        </Link>

        <div className="mt-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Complaint Details
          </h1>
          <p className="mt-2 text-gray-600">
            View complete information and track the progress of your complaint.
          </p>
        </div>

        {/* Complaint Information */}
        <section className="mt-8 rounded-2xl border bg-white p-6 shadow-md">
          <div className="flex flex-col gap-6 lg:flex-row lg:justify-between">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-2xl font-bold text-gray-900">
                  {complaint.category}
                </h2>

                <span
                  className={`rounded-full px-4 py-1.5 text-sm font-bold ${
                    complaint.status === "Resolved"
                      ? "bg-green-100 text-green-700"
                      : complaint.status === "In Progress"
                      ? "bg-orange-100 text-orange-700"
                      : complaint.status === "Verified"
                      ? "bg-blue-100 text-blue-700"
                      : complaint.status === "Assigned"
                      ? "bg-purple-100 text-purple-700"
                      : complaint.status === "Awaiting Citizen Verification"
                      ? "bg-orange-100 text-orange-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {complaint.status}
                </span>
              </div>

              <div className="mt-6">
                <p className="text-sm font-semibold text-gray-500">
                  Description
                </p>
                <p className="mt-2 text-gray-800">{complaint.description}</p>
              </div>

              {complaint.location?.address && (
                <div className="mt-5">
                  <p className="text-sm font-semibold text-gray-500">
                    Location
                  </p>
                  <p className="mt-2 text-gray-800">
                    📍 {complaint.location.address}
                  </p>
                </div>
              )}

              {complaint.landmark && (
                <div className="mt-5">
                  <p className="text-sm font-semibold text-gray-500">
                    Landmark
                  </p>
                  <p className="mt-2 text-gray-800">{complaint.landmark}</p>
                </div>
              )}

              {complaint.locationDetails && (
                <div className="mt-5">
                  <p className="text-sm font-semibold text-gray-500">
                    Location Details
                  </p>
                  <p className="mt-2 text-gray-800">
                    {complaint.locationDetails}
                  </p>
                </div>
              )}

              <div className="mt-5">
                <p className="text-sm font-semibold text-gray-500">
                  Submitted On
                </p>
                <p className="mt-2 text-gray-800">
                  {new Date(complaint.createdAt).toLocaleString("en-IN")}
                </p>
              </div>
            </div>

            {complaint.imageUrl && (
              <div className="w-full lg:w-64">
                <p className="mb-2 text-sm font-semibold text-gray-500">
                  Complaint Image
                </p>
                <img
                  src={complaint.imageUrl}
                  alt="Complaint"
                  className="h-48 w-full rounded-xl border object-cover"
                />
              </div>
            )}
          </div>
        </section>

        {/* Helpline Contacts */}
        <section className="mt-8 rounded-2xl border bg-white p-6 shadow-md">
          <h2 className="text-2xl font-bold text-gray-900">
            Department & Government Helplines
          </h2>
          <p className="mt-2 text-gray-600">
            Contact the concerned department first. If your issue is not
            resolved, contact the Chief Minister's Office.
          </p>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <div className="rounded-xl border border-blue-200 bg-blue-50 p-5">
              <h3 className="font-bold text-gray-900">
                Department Helpline
              </h3>

              <p className="mt-2 text-sm text-gray-600">
                {departmentKey === "general"
                  ? "General civic complaint"
                  : `${departmentKey.toUpperCase()} Department`}
              </p>

              {departmentContact ? (
                <>
                  <p className="mt-3 text-lg font-bold text-gray-900">
                    {departmentContact.phone}
                  </p>
                  <a
                    href={`tel:${departmentContact.phone}`}
                    className="mt-4 inline-block rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
                  >
                    📞 Call Department
                  </a>
                </>
              ) : (
                <p className="mt-3 text-sm text-gray-700">
                  A verified direct department phone number is not configured
                  for this state and category yet. Please use the official
                  government grievance portal.
                </p>
              )}
            </div>

            <div className="rounded-xl border border-green-200 bg-green-50 p-5">
              <h3 className="font-bold text-gray-900">
                Chief Minister's Office
              </h3>

              <p className="mt-2 text-sm text-gray-600">
                {state
                  ? state.replace(/\b\w/g, (letter) => letter.toUpperCase())
                  : "State not identified from address"}
              </p>

              {cmContact ? (
                <>
                  <p className="mt-3 text-lg font-bold text-gray-900">
                    {cmContact.phone}
                  </p>
                  <a
                    href={`tel:${cmContact.phone}`}
                    className="mt-4 inline-block rounded-lg bg-green-600 px-5 py-3 font-semibold text-white transition hover:bg-green-700"
                  >
                    📞 Call CM Office
                  </a>
                </>
              ) : (
                <p className="mt-3 text-sm text-gray-700">
                  State could not be identified or a CM office contact is not
                  available in the directory.
                </p>
              )}
            </div>
          </div>

          <div className="mt-5 rounded-xl border border-gray-200 bg-gray-50 p-5">
            <h3 className="font-bold text-gray-900">
              Government Public Grievance Portal
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              You can also submit or escalate a public service complaint
              through the Government of India's CPGRAMS portal.
            </p>
            <a
              href="https://pgportal.gov.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-block rounded-lg border border-gray-300 bg-white px-5 py-3 font-semibold text-blue-700 transition hover:bg-blue-50"
            >
              Open CPGRAMS Portal ↗
            </a>
          </div>

          <p className="mt-4 text-xs text-gray-500">
            CM office numbers are published office telephone contacts, not
            guaranteed dedicated complaint helplines. Contact availability
            may change. Department numbers are shown only where configured.
          </p>
        </section>

        {/* Department Resolution Details */}
        {complaint.resolutionDescription && (
          <section className="mt-8 rounded-2xl border bg-white p-6 shadow-md">
            <h2 className="text-2xl font-bold text-gray-900">
              Department Work Update
            </h2>
            <p className="mt-2 text-gray-600">
              The department has submitted the following work completion update.
            </p>
            <div className="mt-5 rounded-xl bg-blue-50 p-5">
              <p className="text-sm font-semibold text-blue-700">
                Work Completed
              </p>
              <p className="mt-2 whitespace-pre-wrap text-gray-800">
                {complaint.resolutionDescription}
              </p>
              {complaint.resolutionSubmittedAt && (
                <p className="mt-3 text-sm text-gray-500">
                  Submitted on:{" "}
                  {new Date(
                    complaint.resolutionSubmittedAt
                  ).toLocaleString("en-IN")}
                </p>
              )}
            </div>
          </section>
        )}

        {/* Citizen Verification */}
        {complaint.status === "Awaiting Citizen Verification" && (
          <section className="mt-8 rounded-2xl border border-orange-200 bg-orange-50 p-6 shadow-md">
            <h2 className="text-2xl font-bold text-orange-900">
              Verify Complaint Resolution
            </h2>
            <p className="mt-2 text-orange-800">
              The department says that the work is completed. Please check
              whether your problem has actually been resolved.
            </p>

            <div className="mt-6 rounded-xl border border-orange-200 bg-white p-5">
              <p className="text-sm font-semibold text-gray-700">
                Is your problem resolved?
              </p>
              <p className="mt-2 text-sm text-gray-500">
                You can confirm if the issue is fixed or report that it
                still exists. You may also upload a photo as evidence.
              </p>

              <div className="mt-5">
                <label className="block text-sm font-semibold text-gray-700">
                  Feedback / Additional Details
                </label>
                <textarea
                  value={citizenFeedback}
                  onChange={(e) => setCitizenFeedback(e.target.value)}
                  rows={3}
                  placeholder="Write your feedback here. If the problem is not resolved, explain why..."
                  className="mt-2 w-full rounded-lg border border-gray-300 p-3 text-sm text-gray-800 outline-none focus:border-blue-500"
                />
              </div>

              <div className="mt-5">
                <label className="block text-sm font-semibold text-gray-700">
                  Upload After-Resolution Photo (Optional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setVerificationImage(e.target.files?.[0] || null)
                  }
                  className="mt-2 block w-full text-sm text-gray-600 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-100 file:px-4 file:py-2 file:font-semibold file:text-blue-700 hover:file:bg-blue-200"
                />
                {verificationImage && (
                  <p className="mt-2 text-sm text-green-700">
                    Selected: {verificationImage.name}
                  </p>
                )}
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={() => handleCitizenResponse("confirm")}
                  disabled={isSubmitting}
                  className="rounded-lg bg-green-600 px-5 py-3 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSubmitting ? "Submitting..." : "✓ Problem Resolved"}
                </button>
                <button
                  onClick={() => handleCitizenResponse("reject")}
                  disabled={isSubmitting}
                  className="rounded-lg bg-red-600 px-5 py-3 font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSubmitting ? "Submitting..." : "✕ Problem Not Resolved"}
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Citizen Verification Result */}
        {complaint.citizenResolutionStatus &&
          complaint.status !== "Awaiting Citizen Verification" && (
            <section className="mt-8 rounded-2xl border bg-white p-6 shadow-md">
              <h2 className="text-2xl font-bold text-gray-900">
                Your Verification Response
              </h2>
              <p className="mt-4 text-sm font-semibold text-gray-500">
                Response
              </p>
              <p
                className={`mt-2 font-bold ${
                  complaint.citizenResolutionStatus === "Confirmed"
                    ? "text-green-700"
                    : "text-red-700"
                }`}
              >
                {complaint.citizenResolutionStatus}
              </p>

              {complaint.citizenResolutionFeedback && (
                <div className="mt-4">
                  <p className="text-sm font-semibold text-gray-500">
                    Your Feedback
                  </p>
                  <p className="mt-2 whitespace-pre-wrap text-gray-800">
                    {complaint.citizenResolutionFeedback}
                  </p>
                </div>
              )}

              {complaint.citizenResolutionImageUrl && (
                <div className="mt-5">
                  <p className="mb-2 text-sm font-semibold text-gray-500">
                    Uploaded Verification Photo
                  </p>
                  <img
                    src={complaint.citizenResolutionImageUrl}
                    alt="Citizen verification"
                    className="h-48 w-full rounded-xl border object-cover sm:w-64"
                  />
                </div>
              )}

              {complaint.citizenVerifiedAt && (
                <p className="mt-4 text-sm text-gray-500">
                  Response submitted on:{" "}
                  {new Date(
                    complaint.citizenVerifiedAt
                  ).toLocaleString("en-IN")}
                </p>
              )}
            </section>
          )}

        {/* Tracking */}
        <section className="mt-8 rounded-2xl border bg-white p-6 shadow-md">
          <h2 className="text-2xl font-bold text-gray-900">
            Complaint Tracking
          </h2>
          <p className="mt-2 text-gray-600">
            Track the progress of your complaint from submission to resolution.
          </p>

          <div className="mt-8">
            {STATUSES.map((status, index) => {
              const completed = isStatusCompleted(status);
              const current = isCurrentStatus(status);
              const timestamp = getHistoryTimestamp(status);

              return (
                <div key={status} className="relative flex gap-4">
                  {index < STATUSES.length - 1 && (
                    <div
                      className={`absolute left-5 top-11 h-16 w-0.5 ${
                        completed ? "bg-blue-500" : "bg-gray-200"
                      }`}
                    />
                  )}

                  <div
                    className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold ${
                      current
                        ? "border-blue-600 bg-blue-600 text-white"
                        : completed
                        ? "border-green-500 bg-green-500 text-white"
                        : "border-gray-300 bg-white text-gray-400"
                    }`}
                  >
                    {completed ? "✓" : "○"}
                  </div>

                  <div className="pb-8">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3
                        className={`text-lg font-bold ${
                          current
                            ? "text-blue-600"
                            : completed
                            ? "text-gray-900"
                            : "text-gray-400"
                        }`}
                      >
                        {status}
                      </h3>
                      {current && (
                        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
                          Current Status
                        </span>
                      )}
                    </div>

                    {timestamp ? (
                      <p className="mt-1 text-sm text-gray-500">
                        {new Date(timestamp).toLocaleString("en-IN")}
                      </p>
                    ) : (
                      <p className="mt-1 text-sm text-gray-400">Pending</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Current Status */}
        <section className="mt-8 rounded-2xl border bg-blue-50 p-6">
          <p className="text-sm font-semibold text-blue-700">
            Current Complaint Status
          </p>
          <div className="mt-2 flex items-center gap-3">
            <span className="text-2xl">📌</span>
            <h2 className="text-2xl font-bold text-blue-900">
              {complaint.status}
            </h2>
          </div>
          <button
            onClick={fetchComplaint}
            className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Refresh Status
          </button>
        </section>
      </div>
    </main>
  );
}
