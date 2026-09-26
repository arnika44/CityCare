"use client";

import { useState } from "react";

export default function ChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (newPassword.length < 6) {
      setError("New password must contain at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New password and confirm password do not match.");
      return;
    }

    if (currentPassword === newPassword) {
      setError("New password must be different from current password.");
      return;
    }

    setMessage("Password changed successfully!");

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <main className="px-6 py-10">
      <div className="mx-auto w-full max-w-3xl">

        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">
            Change Password
          </h2>

          <p className="mt-2 text-gray-700">
            Update your CityCare account password.
          </p>
        </div>

        <div className="rounded-2xl border bg-white p-8 shadow-md">

          <div className="mb-8 rounded-xl border border-blue-200 bg-blue-50 p-5">
            <h3 className="text-lg font-bold text-gray-900">
              🔐 Password Security
            </h3>

            <p className="mt-1 text-sm text-gray-700">
              Use a strong password that you do not use on other websites.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-900">
                Current Password
              </label>

              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter your current password"
                required
                className="w-full rounded-lg border border-gray-400 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-700 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-900">
                New Password
              </label>

              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter your new password"
                required
                className="w-full rounded-lg border border-gray-400 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-700 outline-none focus:ring-2 focus:ring-blue-500"
              />

              <p className="mt-2 text-sm text-gray-600">
                Password must contain at least 6 characters.
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-900">
                Confirm New Password
              </label>

              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your new password"
                required
                className="w-full rounded-lg border border-gray-400 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-700 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {error}
              </div>
            )}

            {message && (
              <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
                {message}
              </div>
            )}

            <div className="border-t pt-6">

              <button
                type="submit"
                className="rounded-lg bg-blue-600 px-7 py-3 font-semibold text-white hover:bg-blue-700 transition"
              >
                Change Password
              </button>

            </div>

          </form>
        </div>
      </div>
    </main>
  );
}