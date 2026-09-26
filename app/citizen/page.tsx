import Link from "next/link";

export default function Citizen() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
      <div className="w-full max-w-2xl text-center">

        <h1 className="text-5xl font-bold text-blue-600">
          CityCare
        </h1>

        <p className="mt-4 text-xl text-gray-600">
          Citizen Portal
        </p>

        <div className="mt-12 grid gap-6 md:grid-cols-2">

          {/* Login */}
          <Link
            href="/citizen/login"
            className="rounded-2xl bg-white p-10 shadow-md border hover:shadow-xl transition"
          >
            <div className="text-5xl">🔐</div>

            <h2 className="mt-5 text-2xl font-bold text-gray-800">
              Login
            </h2>

            <p className="mt-3 text-gray-600">
              Already have an account? Login to continue.
            </p>

            <div className="mt-6 inline-block rounded-lg bg-blue-600 px-6 py-3 text-white">
              Login
            </div>
          </Link>

          {/* Register */}
          <Link
            href="/citizen/register"
            className="rounded-2xl bg-white p-10 shadow-md border hover:shadow-xl transition"
          >
            <div className="text-5xl">📝</div>

            <h2 className="mt-5 text-2xl font-bold text-gray-800">
              Register
            </h2>

            <p className="mt-3 text-gray-600">
              New to CityCare? Create your account.
            </p>

            <div className="mt-6 inline-block rounded-lg bg-green-600 px-6 py-3 text-white">
              Register
            </div>
          </Link>

        </div>

        <Link
          href="/"
          className="inline-block mt-8 text-blue-600 hover:underline"
        >
          ← Back to Home
        </Link>

      </div>
    </main>
  );
}