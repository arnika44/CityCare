"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const [sidebarOpen, setSidebarOpen] = useState(true);

  const menuItems = [
    {
      name: "Dashboard",
      href: "/admin/dashboard",
      icon: "▣",
    },
    {
      name: "Complaints",
      href: "/admin/complaints",
      icon: "▤",
    },
    {
      name: "Departments",
      href: "/admin/departments",
      icon: "▦",
    },
    {
      name: "Citizens",
      href: "/admin/citizens",
      icon: "◉",
    },
    {
      name: "Feedback",
      href: "/admin/feedback",
      icon: "★",
    },
    {
      name: "Analytics",
      href: "/admin/analytics",
      icon: "▥",
    },
    {
      name: "CM Review",
      href: "/admin/cm-review",
      icon: "◆",
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem("citycare-admin");
    localStorage.removeItem("citycare-admin-role");

    router.push("/admin/login");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">

      {/* SIDEBAR */}
      <aside
        className={`fixed left-0 top-0 h-screen bg-white border-r border-gray-200 z-50 transition-all duration-300 ${
          sidebarOpen ? "w-64" : "w-20"
        }`}
      >
        {/* Logo */}
        <div className="h-20 flex items-center border-b border-gray-200 px-5">
          <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-lg">
              CC
            </span>
          </div>

          {sidebarOpen && (
            <div className="ml-3">
              <h1 className="font-bold text-gray-900 text-lg">
                CityCare
              </h1>

              <p className="text-xs text-gray-500">
                Admin Portal
              </p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            const isActive =
              pathname === item.href ||
              pathname.startsWith(item.href + "/");

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center rounded-xl px-3 py-3 transition ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <span className="w-8 text-center text-lg flex-shrink-0">
                  {item.icon}
                </span>

                {sidebarOpen && (
                  <span className="ml-2 font-medium text-sm">
                    {item.name}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">

          {/* Admin Profile */}
          {sidebarOpen && (
            <div className="mb-3 p-3 rounded-xl bg-gray-50">
              <p className="text-sm font-semibold text-gray-900">
                Super Admin
              </p>

              <p className="text-xs text-gray-500 mt-1">
                CityCare Administrator
              </p>
            </div>
          )}

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-3 py-3 rounded-xl text-red-600 hover:bg-red-50 transition"
          >
            <span className="w-8 text-center text-lg">
              ↪
            </span>

            {sidebarOpen && (
              <span className="ml-2 font-medium text-sm">
                Logout
              </span>
            )}
          </button>
        </div>
      </aside>

      {/* MAIN AREA */}
      <div
        className={`flex-1 min-h-screen transition-all duration-300 ${
          sidebarOpen ? "ml-64" : "ml-20"
        }`}
      >

        {/* TOP BAR */}
        <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-40">

          <div className="flex items-center gap-4">

            {/* Sidebar Toggle */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="w-10 h-10 rounded-xl hover:bg-gray-100 flex items-center justify-center text-gray-600 text-xl"
            >
              ☰
            </button>

            <div>
              <h2 className="font-semibold text-gray-900">
                Administration
              </h2>

              <p className="text-xs text-gray-500">
                Manage CityCare services
              </p>
            </div>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-4">

            {/* Notification */}
            <button
              className="w-10 h-10 rounded-xl hover:bg-gray-100 flex items-center justify-center text-gray-600"
              title="Notifications"
            >
              🔔
            </button>

            {/* Admin Avatar */}
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-blue-700 font-semibold">
                A
              </span>
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}