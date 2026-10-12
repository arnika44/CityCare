"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");

    if (!email || !password) {
      setError("Please enter email and password.");
      return;
    }

    setLoading(true);

    try {
      // Temporary admin login
      // Backend authentication will be connected next.

      if (
        email === "admin@citycare.com" &&
        password === "admin123"
      ) {
        localStorage.setItem("citycare-admin", "true");
        localStorage.setItem("citycare-admin-role", "super-admin");

        router.push("/admin/dashboard");
      } else {
        setError("Invalid admin email or password.");
      }
    } catch (error) {
      console.error(error);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg p-8">

          {/* Logo / Heading */}
          <div className="text-center mb-8">
            <div className="mx-auto mb-4 w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center">
              <span className="text-2xl font-bold text-white">
                CC
              </span>
            </div>

            <h1 className="text-3xl font-bold text-gray-900">
              CityCare Admin
            </h1>

            <p className="text-gray-500 mt-2">
              Administration Portal
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-5">

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Admin Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter admin email"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full px-4 py-3 pr-20 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-blue-600"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl p-3">
                {error}
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 rounded-xl transition"
            >
              {loading ? "Signing in..." : "Login as Admin"}
            </button>
          </form>

          {/* Register */}
          <div className="text-center mt-6">
            <p className="text-sm text-gray-500">
              New administrator?
            </p>

            <button
              onClick={() => router.push("/admin/register")}
              className="mt-1 text-blue-600 font-semibold hover:underline"
            >
              Create Admin Account
            </button>
          </div>

          {/* Temporary Credentials */}
          <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-xl">
            <p className="text-xs font-semibold text-gray-600 mb-2">
              Temporary Login
            </p>

            <p className="text-xs text-gray-500">
              Email: admin@citycare.com
            </p>

            <p className="text-xs text-gray-500">
              Password: admin123
            </p>
          </div>

        </div>
      </div>
    </main>
  );
}