
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface Notification {
  _id: string;
  citizenId: string;
  complaintId: string;
  title: string;
  message: string;
  type: "STATUS_UPDATE" | "COMPLAINT_ASSIGNED" | "COMPLAINT_RESOLVED";
  isRead: boolean;
  createdAt: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchNotifications = async () => {
    try {
      setError("");

      const citizenId = localStorage.getItem("citycare_citizen_id");

      if (!citizenId) {
        setError("Please login to view your notifications.");
        return;
      }

      const response = await fetch(
        `/api/notifications?citizenId=${encodeURIComponent(citizenId)}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load notifications.");
      }

      setNotifications(
        Array.isArray(data.notifications) ? data.notifications : []
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch("/api/notifications", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ notificationId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not update notification.");
      }

      setNotifications((previous) =>
        previous.map((notification) =>
          notification._id === notificationId
            ? { ...notification, isRead: true }
            : notification
        )
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not update notification."
      );
    }
  };

  const markAllAsRead = async () => {
    try {
      const citizenId = localStorage.getItem("citycare_citizen_id");

      if (!citizenId) return;

      const response = await fetch("/api/notifications", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          citizenId,
          markAll: true,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not update notifications.");
      }

      setNotifications((previous) =>
        previous.map((notification) => ({
          ...notification,
          isRead: true,
        }))
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not update notifications."
      );
    }
  };

  const totalNotifications = notifications.length;

  const complaintUpdates = notifications.filter(
    (notification) => notification.type !== "COMPLAINT_RESOLVED"
  ).length;

  const resolvedNotifications = notifications.filter(
    (notification) => notification.type === "COMPLAINT_RESOLVED"
  ).length;

  const unreadCount = notifications.filter(
    (notification) => !notification.isRead
  ).length;

  return (
    <main className="px-6 py-10">
      <div className="mx-auto w-full max-w-5xl">

        {/* Header */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              Notifications
            </h2>

            <p className="mt-2 text-gray-700">
              Stay updated about your complaints and their progress.
            </p>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
            >
              Mark All as Read
            </button>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        {/* Notification Summary */}
        <div className="mb-8 grid gap-5 md:grid-cols-3">

          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-gray-700">
              Total Notifications
            </p>

            <p className="mt-2 text-3xl font-bold text-blue-600">
              {totalNotifications}
            </p>
          </div>

          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-gray-700">
              Complaint Updates
            </p>

            <p className="mt-2 text-3xl font-bold text-orange-600">
              {complaintUpdates}
            </p>
          </div>

          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-gray-700">
              Resolved
            </p>

            <p className="mt-2 text-3xl font-bold text-green-600">
              {resolvedNotifications}
            </p>
          </div>

        </div>

        {/* Notifications List */}
        {loading ? (
          <div className="rounded-2xl border bg-white p-10 text-center shadow-md">
            <p className="font-semibold text-gray-700">
              Loading notifications...
            </p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="rounded-2xl border bg-white p-10 text-center shadow-md">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-3xl">
              🔔
            </div>

            <h3 className="mt-5 text-xl font-bold text-gray-900">
              No Notifications Yet
            </h3>

            <p className="mx-auto mt-2 max-w-md text-gray-600">
              You will receive notifications here when your complaints are
              submitted, updated, or resolved.
            </p>

          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div
                key={notification._id}
                className={`rounded-xl border p-5 shadow-sm ${
                  notification.isRead
                    ? "bg-white"
                    : "border-blue-200 bg-blue-50"
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">

                  <div className="flex gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xl">
                      {notification.type === "COMPLAINT_RESOLVED"
                        ? "✅"
                        : notification.type === "COMPLAINT_ASSIGNED"
                        ? "👷"
                        : "🔔"}
                    </div>

                    <div>
                      <h3 className="font-bold text-gray-900">
                        {notification.title}
                      </h3>

                      <p className="mt-1 text-gray-700">
                        {notification.message}
                      </p>

                      <p className="mt-2 text-xs text-gray-500">
                        {new Date(notification.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {!notification.isRead && (
                      <>
                        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                          New
                        </span>

                        <button
                          onClick={() => markAsRead(notification._id)}
                          className="text-sm font-semibold text-blue-600 hover:underline"
                        >
                          Mark as Read
                        </button>
                      </>
                    )}
                  </div>

                </div>
              </div>
            ))}
          </div>
        )}

        {/* Back */}
        <Link
          href="/citizen/dashboard"
          className="mt-6 inline-block font-semibold text-blue-600 hover:underline"
        >
          ← Back to Dashboard
        </Link>

      </div>
    </main>
  );
}
