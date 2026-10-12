"use client";

import { useEffect, useMemo, useState } from "react";

type Feedback = {
  _id?: string;
  id?: string;
  complaintId?: string;
  rating?: number;
  feedback?: string;
  comment?: string;
  citizenName?: string;
  citizenEmail?: string;
  createdAt?: string;
};

export default function AdminFeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [ratingFilter, setRatingFilter] = useState("All");

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const response = await fetch("/api/feedback");

        if (!response.ok) {
          throw new Error("Failed to fetch feedback");
        }

        const data = await response.json();

        if (Array.isArray(data)) {
          setFeedbacks(data);
        } else if (Array.isArray(data.feedback)) {
          setFeedbacks(data.feedback);
        } else if (Array.isArray(data.feedbacks)) {
          setFeedbacks(data.feedbacks);
        } else {
          setFeedbacks([]);
        }
      } catch (error) {
        console.error("Error fetching feedback:", error);
        setFeedbacks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFeedback();
  }, []);

  const filteredFeedback = useMemo(() => {
    return feedbacks.filter((item) => {
      const text = [
        item.complaintId,
        item.citizenName,
        item.citizenEmail,
        item.feedback,
        item.comment,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = text.includes(search.toLowerCase());

      const matchesRating =
        ratingFilter === "All" ||
        String(item.rating || 0) === ratingFilter;

      return matchesSearch && matchesRating;
    });
  }, [feedbacks, search, ratingFilter]);

  const totalFeedback = feedbacks.length;

  const averageRating =
    totalFeedback > 0
      ? (
          feedbacks.reduce(
            (sum, item) => sum + Number(item.rating || 0),
            0
          ) / totalFeedback
        ).toFixed(1)
      : "0.0";

  const positiveFeedback = feedbacks.filter(
    (item) => Number(item.rating || 0) >= 4
  ).length;

  const negativeFeedback = feedbacks.filter(
    (item) => Number(item.rating || 0) <= 2
  ).length;

  const getRatingStars = (rating: number = 0) => {
    return "★".repeat(rating) + "☆".repeat(5 - rating);
  };

  const formatDate = (date?: string) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Citizen Feedback
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Review feedback and ratings submitted by citizens.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Total Feedback</p>
          <h2 className="mt-2 text-3xl font-bold text-gray-900">
            {totalFeedback}
          </h2>
        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Average Rating</p>
          <div className="mt-2 flex items-center gap-2">
            <h2 className="text-3xl font-bold text-gray-900">
              {averageRating}
            </h2>
            <span className="text-yellow-500">★</span>
          </div>
        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Positive Feedback</p>
          <h2 className="mt-2 text-3xl font-bold text-green-600">
            {positiveFeedback}
          </h2>
        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Low Ratings</p>
          <h2 className="mt-2 text-3xl font-bold text-red-600">
            {negativeFeedback}
          </h2>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-xl border bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row">
          <input
            type="text"
            placeholder="Search complaint ID, citizen or feedback..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />

          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
            className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
          >
            <option value="All">All Ratings</option>
            <option value="5">★★★★★ 5</option>
            <option value="4">★★★★ 4</option>
            <option value="3">★★★ 3</option>
            <option value="2">★★ 2</option>
            <option value="1">★ 1</option>
          </select>
        </div>
      </div>

      {/* Feedback List */}
      <div className="rounded-xl border bg-white shadow-sm">
        <div className="border-b px-5 py-4">
          <h2 className="font-semibold text-gray-900">
            Feedback Records
          </h2>
          <p className="text-sm text-gray-500">
            {filteredFeedback.length} feedback record
            {filteredFeedback.length !== 1 ? "s" : ""} found
          </p>
        </div>

        {loading ? (
          <div className="p-10 text-center text-gray-500">
            Loading feedback...
          </div>
        ) : filteredFeedback.length === 0 ? (
          <div className="p-10 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-2xl">
              💬
            </div>

            <h3 className="font-semibold text-gray-900">
              No feedback found
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Citizen feedback will appear here once submitted.
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {filteredFeedback.map((item, index) => {
              const rating = Number(item.rating || 0);

              return (
                <div
                  key={item._id || item.id || index}
                  className="p-5 transition hover:bg-gray-50"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="font-semibold text-gray-900">
                          {item.citizenName || "Citizen"}
                        </span>

                        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                          Complaint:{" "}
                          {item.complaintId || "N/A"}
                        </span>
                      </div>

                      {item.citizenEmail && (
                        <p className="mt-1 text-xs text-gray-500">
                          {item.citizenEmail}
                        </p>
                      )}

                      <div className="mt-3 flex items-center gap-3">
                        <span className="text-lg tracking-wide text-yellow-500">
                          {getRatingStars(rating)}
                        </span>

                        <span className="text-sm font-medium text-gray-700">
                          {rating}/5
                        </span>
                      </div>

                      <div className="mt-3 rounded-lg bg-gray-50 p-4">
                        <p className="text-sm leading-6 text-gray-700">
                          {item.feedback ||
                            item.comment ||
                            "No written feedback provided."}
                        </p>
                      </div>
                    </div>

                    <div className="text-sm text-gray-500 lg:text-right">
                      <p>{formatDate(item.createdAt)}</p>

                      {rating >= 4 && (
                        <span className="mt-2 inline-block rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
                          Positive
                        </span>
                      )}

                      {rating === 3 && (
                        <span className="mt-2 inline-block rounded-full bg-yellow-50 px-3 py-1 text-xs font-medium text-yellow-700">
                          Neutral
                        </span>
                      )}

                      {rating <= 2 && (
                        <span className="mt-2 inline-block rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-700">
                          Needs Attention
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}