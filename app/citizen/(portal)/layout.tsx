"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CitizenPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const router = useRouter();

  const handleLogout = () => {
    router.push("/citizen/login");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-50 h-screen w-72 bg-white border-r shadow-lg transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between border-b px-6 py-5">
          <div>
            <h1 className="text-2xl font-bold text-blue-600">
              CityCare
            </h1>

            <p className="mt-1 text-sm font-medium text-gray-900">
              Citizen Portal
            </p>
          </div>

          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg px-2 py-1 text-xl text-gray-900 hover:bg-gray-100"
          >
            ✕
          </button>
        </div>

        {/* Navigation */}
        <nav className="space-y-2 px-4 py-6">
          <Link
            href="/citizen/profile"
            className="flex items-center gap-4 rounded-xl px-4 py-3 font-semibold text-gray-900 hover:bg-blue-50 hover:text-blue-600 transition"
          >
            <span className="text-xl">👤</span>
            <span>Profile</span>
          </Link>

          <Link
            href="/citizen/dashboard"
            className="flex items-center gap-4 rounded-xl px-4 py-3 font-semibold text-gray-900 hover:bg-blue-50 hover:text-blue-600 transition"
          >
            <span className="text-xl">🏠</span>
            <span>Dashboard</span>
          </Link>

          <Link
            href="/citizen/notifications"
            className="flex items-center gap-4 rounded-xl px-4 py-3 font-semibold text-gray-900 hover:bg-blue-50 hover:text-blue-600 transition"
          >
            <span className="text-xl">🔔</span>
            <span>Notifications</span>
          </Link>

          <Link
            href="/citizen/settings"
            className="flex items-center gap-4 rounded-xl px-4 py-3 font-semibold text-gray-900 hover:bg-blue-50 hover:text-blue-600 transition"
          >
            <span className="text-xl">⚙️</span>
            <span>Settings</span>
          </Link>

          <Link
            href="/citizen/language"
            className="flex items-center gap-4 rounded-xl px-4 py-3 font-semibold text-gray-900 hover:bg-blue-50 hover:text-blue-600 transition"
          >
            <span className="text-xl">🌐</span>
            <span>Language</span>
          </Link>

          <Link
            href="/citizen/change-password"
            className="flex items-center gap-4 rounded-xl px-4 py-3 font-semibold text-gray-900 hover:bg-blue-50 hover:text-blue-600 transition"
          >
            <span className="text-xl">🔑</span>
            <span>Change Password</span>
          </Link>

          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-4 rounded-xl px-4 py-3 font-semibold text-red-600 hover:bg-red-50 transition"
          >
            <span className="text-xl">🚪</span>
            <span>Logout</span>
          </button>
        </nav>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
        />
      )}

      {/* Main Content */}
      <div
        className={`min-h-screen transition-all duration-300 ${
          sidebarOpen ? "lg:ml-72" : "ml-0"
        }`}
      >
        {/* Top Header */}
        <header className="flex items-center justify-between border-b bg-white px-6 py-5 shadow-sm">
          <div className="flex items-center gap-4">
            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-xl text-gray-900 hover:bg-gray-100"
              >
                ☰
              </button>
            )}

            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                CityCare
              </h1>

              <p className="mt-1 text-sm text-gray-700">
                Citizen Portal
              </p>
            </div>
          </div>

          {/* Profile */}
          <Link
            href="/citizen/profile"
            className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border-2 border-blue-500 bg-blue-100 text-xl font-bold text-blue-600 hover:ring-4 hover:ring-blue-100 transition"
            title="Profile"
          >
            👤
          </Link>
        </header>

        {/* Page Content */}
        {children}
      </div>
    </div>
  );
}