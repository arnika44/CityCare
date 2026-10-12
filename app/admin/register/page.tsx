"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminRegisterPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("super-admin");
  const [department, setDepartment] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!fullName || !email || !password || !confirmPassword) {
      setError("Please fill all required fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (role === "department-admin" && !department) {
      setError("Please select a department.");
      return;
    }

    setLoading(true);

    try {
      // Temporary registration
      // Database/API will be connected next.

      const adminData = {
        fullName,
        email,
        role,
        department: role === "department-admin" ? department : null,
      };

      console.log("Admin Registration:", adminData);

      setSuccess("Admin account created successfully!");

      setTimeout(() => {
        router.push("/admin/login");
      }, 1500);
    } catch (error) {
      console.error(error);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-lg">
        <div className="bg-white rounded-2xl shadow-lg p-8">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto mb-4 w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center">
              <span className="text-2xl font-bold text-white">
                CC
              </span>
            </div>

            <h1 className="text-3xl font-bold text-gray-900">
              Admin Registration
            </h1>

            <p className="text-gray-500 mt-2">
              Create a CityCare administrator account
            </p>
          </div>

          <form onSubmit={handleRegister} className="space-y-5">

            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>

              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter full name"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter admin email"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Admin Role *
              </label>

              <select
                value={role}
                onChange={(e) => {
                  setRole(e.target.value);
                  setDepartment("");
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="super-admin">
                  Super Admin
                </option>

                <option value="department-admin">
                  Department Admin
                </option>
              </select>
            </div>

            {/* Department */}
            {role === "department-admin" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department *
                </label>

                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">
                    Select Department
                  </option>

                  <option value="PWD">
                    PWD
                  </option>

                  <option value="Water">
                    Water Department
                  </option>

                  <option value="Electricity">
                    Electricity Department
                  </option>

                  <option value="Sanitation">
                    Sanitation / Municipal
                  </option>

                  <option value="Traffic">
                    Traffic Department
                  </option>
                </select>
              </div>
            )}

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password *
              </label>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create password"
                  className="w-full px-4 py-3 pr-20 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-blue-600"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password *
              </label>

              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword(e.target.value)
                  }
                  placeholder="Confirm password"
                  className="w-full px-4 py-3 pr-20 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-blue-600"
                >
                  {showConfirmPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl p-3">
                {error}
              </div>
            )}

            {/* Success */}
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-600 text-sm rounded-xl p-3">
                {success}
              </div>
            )}

            {/* Register Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 rounded-xl transition"
            >
              {loading ? "Creating Account..." : "Create Admin Account"}
            </button>
          </form>

          {/* Login */}
          <div className="text-center mt-6">
            <p className="text-sm text-gray-500">
              Already have an admin account?
            </p>

            <button
              onClick={() => router.push("/admin/login")}
              className="mt-1 text-blue-600 font-semibold hover:underline"
            >
              Login as Admin
            </button>
          </div>

        </div>
      </div>
    </main>
  );
}