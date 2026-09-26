"use client";

import { useEffect, useState } from "react";

interface Complaint {
  _id: string;
  category: string;
  description: string;
  status: string;
  createdAt: string;
}

export default function FeedbackPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [selectedComplaint, setSelectedComplaint] =
    useState<Complaint | null>(null);

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedback, setFeedback] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadResolvedComplaints = async () => {
      try {
        const citizenId = localStorage.getItem("citycare_citizen_id");

        if (!citizenId) {
          setIsLoading(false);
          return;
        }

        const response = await fetch(
          `/api/complaints?citizenId=${encodeURIComponent(citizenId)}`
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Failed to load complaints."
          );
        }

        const resolvedComplaints = (data.complaints || []).filter(
          (complaint: Complaint) =>
            complaint.status === "Resolved"
        );

        setComplaints(resolvedComplaints);
      } catch (error) {
        console.error(
          "Resolved complaints loading error:",
          error
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadResolvedComplaints();
  }, []);

  const handleComplaintSelect = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const complaintId = event.target.value;

    const complaint =
      complaints.find(
        (item) => item._id === complaintId
      ) || null;

    setSelectedComplaint(complaint);

    setRating(0);
    setHoverRating(0);
    setFeedback("");
  };

  const handleSubmit = async () => {
    if (!selectedComplaint) {
      alert("Please select a resolved complaint.");
      return;
    }

    if (rating === 0) {
      alert("Please give a rating for the resolution.");
      return;
    }

    if (!feedback.trim()) {
      alert("Please describe your experience with the resolution.");
      return;
    }

    const citizenId = localStorage.getItem(
      "citycare_citizen_id"
    );

    if (!citizenId) {
      alert("Citizen information not found. Please login again.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          complaintId: selectedComplaint._id,
          citizenId,
          rating,
          feedback: feedback.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to submit feedback."
        );
      }

      alert("Resolution feedback submitted successfully.");

      setSelectedComplaint(null);
      setRating(0);
      setHoverRating(0);
      setFeedback("");
    } catch (error) {
      console.error(
        "Resolution feedback submission error:",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "Something went wrong while submitting feedback."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="px-6 py-10">
      <div className="mx-auto w-full max-w-4xl">

        {/* Page Header */}
        <div>
          <h2 className="text-3xl font-bold text-gray-900">
            Complaint Feedback
          </h2>

          <p className="mt-2 text-gray-700">
            Tell us how well your resolved complaint was handled.
          </p>
        </div>

        {/* Main Feedback Card */}
        <section className="mt-8 rounded-2xl border bg-white p-8 shadow-md">

          <h3 className="text-xl font-bold text-gray-900">
            Rate Complaint Resolution
          </h3>

          <p className="mt-2 text-gray-600">
            Select one of your resolved complaints and share
            your experience with its resolution.
          </p>

          {/* Select Resolved Complaint */}
          <div className="mt-7">

            <label
              htmlFor="complaint"
              className="block text-sm font-semibold text-gray-900"
            >
              Resolved Complaint
            </label>

            {isLoading ? (
              <div className="mt-2 rounded-lg border bg-gray-50 px-4 py-3 text-sm text-gray-500">
                Loading your resolved complaints...
              </div>
            ) : complaints.length === 0 ? (
              <div className="mt-3 rounded-xl border border-yellow-200 bg-yellow-50 p-5">

                <div className="flex items-start gap-3">

                  <div className="text-2xl">
                    ℹ️
                  </div>

                  <div>
                    <p className="font-semibold text-yellow-800">
                      No resolved complaints yet
                    </p>

                    <p className="mt-1 text-sm leading-6 text-yellow-700">
                      Feedback can be given after one of your
                      complaints has been marked as resolved.
                    </p>
                  </div>

                </div>

              </div>
            ) : (
              <select
                id="complaint"
                value={selectedComplaint?._id || ""}
                onChange={handleComplaintSelect}
                className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="">
                  Select a resolved complaint
                </option>

                {complaints.map((complaint) => (
                  <option
                    key={complaint._id}
                    value={complaint._id}
                  >
                    {complaint.category} —{" "}
                    {complaint.description.length > 65
                      ? `${complaint.description.slice(0, 65)}...`
                      : complaint.description}
                  </option>
                ))}
              </select>
            )}

          </div>

          {/* Selected Complaint Details */}
          {selectedComplaint && (
            <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-5">

              <div className="flex items-start justify-between gap-4">

                <div>
                  <p className="text-sm font-semibold text-green-700">
                    Resolved Complaint
                  </p>

                  <h4 className="mt-1 text-lg font-bold text-gray-900">
                    {selectedComplaint.category}
                  </h4>
                </div>

                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                  Resolved
                </span>

              </div>

              <div className="mt-4 rounded-lg border border-green-100 bg-white p-4">

                <p className="text-sm font-semibold text-gray-700">
                  Complaint Description
                </p>

                <p className="mt-1 text-sm leading-6 text-gray-700">
                  {selectedComplaint.description}
                </p>

              </div>

            </div>
          )}

          {/* Rating Section */}
          {selectedComplaint && (
            <div className="mt-8">

              <label className="block text-sm font-semibold text-gray-900">
                How satisfied are you with the resolution?
              </label>

              <div className="mt-4 flex items-center gap-2">

                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() =>
                      setHoverRating(star)
                    }
                    onMouseLeave={() =>
                      setHoverRating(0)
                    }
                    className="text-4xl transition hover:scale-110"
                    aria-label={`Rate ${star} out of 5`}
                  >
                    <span
                      className={
                        star <= (hoverRating || rating)
                          ? "text-yellow-400"
                          : "text-gray-300"
                      }
                    >
                      ★
                    </span>
                  </button>
                ))}

              </div>

              <p className="mt-2 text-sm text-gray-600">
                {rating === 0
                  ? "Select 1 to 5 stars."
                  : rating === 1
                  ? "Very dissatisfied"
                  : rating === 2
                  ? "Dissatisfied"
                  : rating === 3
                  ? "Average"
                  : rating === 4
                  ? "Satisfied"
                  : "Very satisfied"}
              </p>

            </div>
          )}

          {/* Feedback */}
          {selectedComplaint && (
            <div className="mt-8">

              <label
                htmlFor="feedback"
                className="block text-sm font-semibold text-gray-900"
              >
                Resolution Feedback
              </label>

              <textarea
                id="feedback"
                value={feedback}
                onChange={(event) =>
                  setFeedback(event.target.value)
                }
                placeholder="Tell us whether the problem was properly resolved and how your experience was..."
                rows={6}
                className="mt-2 w-full resize-none rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none placeholder:text-gray-400 transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

              <p className="mt-2 text-xs text-gray-500">
                Example: The pothole was repaired properly and
                the road is now safe to use.
              </p>

            </div>
          )}

          {/* Submit */}
          {selectedComplaint && (
            <div className="mt-8 flex justify-end">

              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="rounded-xl bg-purple-600 px-8 py-3.5 text-base font-bold text-white shadow-md transition hover:bg-purple-700 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting
                  ? "Submitting Feedback..."
                  : "Submit Resolution Feedback"}
              </button>

            </div>
          )}

        </section>

      </div>
    </main>
  );
}