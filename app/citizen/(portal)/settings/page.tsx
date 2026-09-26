"use client";

import { useState } from "react";

export default function SettingsPage() {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [complaintUpdates, setComplaintUpdates] = useState(true);
  const [locationAccess, setLocationAccess] = useState(false);

  const handleSave = () => {
    alert("Settings saved successfully!");
  };

  return (
    <main className="px-6 py-10">
      <div className="mx-auto w-full max-w-5xl">

        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">
            Settings
          </h2>

          <p className="mt-2 text-gray-700">
            Manage your CityCare account preferences.
          </p>
        </div>

        <div className="space-y-6">

          {/* Notification Settings */}
          <section className="rounded-2xl border bg-white p-7 shadow-md">
            <h3 className="text-xl font-bold text-gray-900">
              🔔 Notification Settings
            </h3>

            <p className="mt-1 text-gray-700">
              Choose how you want to receive updates.
            </p>

            <div className="mt-6 space-y-5">

              <div className="flex items-center justify-between gap-6 border-b pb-5">
                <div>
                  <h4 className="font-semibold text-gray-900">
                    Email Notifications
                  </h4>

                  <p className="mt-1 text-sm text-gray-700">
                    Receive important CityCare updates through email.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setEmailNotifications(!emailNotifications)
                  }
                  className={`relative h-7 w-12 shrink-0 rounded-full transition ${
                    emailNotifications
                      ? "bg-blue-600"
                      : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${
                      emailNotifications
                        ? "left-6"
                        : "left-1"
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900">
                    Complaint Status Updates
                  </h4>

                  <p className="mt-1 text-sm text-gray-700">
                    Get notified when your complaint status changes.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setComplaintUpdates(!complaintUpdates)
                  }
                  className={`relative h-7 w-12 shrink-0 rounded-full transition ${
                    complaintUpdates
                      ? "bg-blue-600"
                      : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${
                      complaintUpdates
                        ? "left-6"
                        : "left-1"
                    }`}
                  />
                </button>
              </div>

            </div>
          </section>

          {/* Location Settings */}
          <section className="rounded-2xl border bg-white p-7 shadow-md">
            <h3 className="text-xl font-bold text-gray-900">
              📍 Location Settings
            </h3>

            <p className="mt-1 text-gray-700">
              Manage location access for location-based civic services.
            </p>

            <div className="mt-6 flex items-center justify-between gap-6">
              <div>
                <h4 className="font-semibold text-gray-900">
                  Allow Location Access
                </h4>

                <p className="mt-1 text-sm text-gray-700">
                  Use your location to find nearby services and departments.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setLocationAccess(!locationAccess)}
                className={`relative h-7 w-12 shrink-0 rounded-full transition ${
                  locationAccess
                    ? "bg-blue-600"
                    : "bg-gray-300"
                }`}
              >
                <span
                  className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${
                    locationAccess
                      ? "left-6"
                      : "left-1"
                  }`}
                />
              </button>
            </div>
          </section>

          {/* Account Information */}
          <section className="rounded-2xl border bg-white p-7 shadow-md">
            <h3 className="text-xl font-bold text-gray-900">
              👤 Account Information
            </h3>

            <p className="mt-1 text-gray-700">
              Manage your CityCare account.
            </p>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-xl bg-gray-50 p-5">
                <p className="text-sm font-semibold text-gray-700">
                  Account Type
                </p>

                <p className="mt-1 font-bold text-gray-900">
                  Citizen
                </p>
              </div>

              <div className="rounded-xl bg-gray-50 p-5">
                <p className="text-sm font-semibold text-gray-700">
                  Account Status
                </p>

                <p className="mt-1 font-bold text-green-600">
                  Active
                </p>
              </div>
            </div>
          </section>

          {/* Save */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleSave}
              className="rounded-lg bg-blue-600 px-7 py-3 font-semibold text-white hover:bg-blue-700 transition"
            >
              Save Settings
            </button>
          </div>

        </div>
      </div>
    </main>
  );
}