"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CitizenRegister() {
  const router = useRouter();

  const handleRegister = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    router.push("/citizen/dashboard");
  };

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-md">

        <div className="text-center">
          <h1 className="text-4xl font-bold text-blue-600">
            CityCare
          </h1>

          <p className="mt-2 text-gray-900 font-medium">
            Citizen Registration
          </p>
        </div>

        <div className="mt-8 rounded-2xl bg-white p-8 shadow-lg border">

          <h2 className="text-2xl font-bold text-gray-900 text-center">
            Create Account
          </h2>

          <p className="mt-2 text-center text-gray-800">
            Register to report and track civic complaints
          </p>

          <form onSubmit={handleRegister} className="mt-8 space-y-5">

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Full Name
              </label>

              <input
                type="text"
                placeholder="Enter your full name"
                required
                className="w-full rounded-lg border border-gray-400 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-700 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Email
              </label>

              <input
                type="email"
                placeholder="Enter your email"
                required
                className="w-full rounded-lg border border-gray-400 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-700 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Password
              </label>

              <input
                type="password"
                placeholder="Create a password"
                required
                className="w-full rounded-lg border border-gray-400 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-700 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Confirm Password
              </label>

              <input
                type="password"
                placeholder="Confirm your password"
                required
                className="w-full rounded-lg border border-gray-400 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-700 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700 transition"
            >
              Create Account
            </button>

          </form>

          <p className="mt-6 text-center text-gray-800">
            Already have an account?{" "}
            <Link
              href="/citizen/login"
              className="font-semibold text-blue-600 hover:underline"
            >
              Login
            </Link>
          </p>

        </div>

        <div className="mt-6 text-center">
          <Link
            href="/citizen"
            className="font-medium text-blue-600 hover:underline"
          >
            ← Back to Citizen Portal
          </Link>
        </div>

      </div>
    </main>
  );
}