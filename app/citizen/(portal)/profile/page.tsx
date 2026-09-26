"use client";

import Link from "next/link";
import { useState } from "react";

type PostOffice = {
  Name: string;
  District: string;
  State: string;
};

type PinApiResponse = {
  Status: string;
  Message: string;
  PostOffice: PostOffice[] | null;
};

export default function ProfilePage() {
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const [pinCode, setPinCode] = useState("");
  const [cityDistrict, setCityDistrict] = useState("");
  const [state, setState] = useState("");
  const [pinLoading, setPinLoading] = useState(false);
  const [pinError, setPinError] = useState("");

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const imageUrl = URL.createObjectURL(file);
    setProfileImage(imageUrl);
  };

  const handlePinChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);

    setPinCode(value);
    setCityDistrict("");
    setState("");
    setPinError("");

    if (value.length !== 6) {
      return;
    }

    setPinLoading(true);

    try {
      const response = await fetch(
        `https://api.postalpincode.in/pincode/${value}`
      );

      if (!response.ok) {
        throw new Error("Unable to fetch PIN details");
      }

      const data: PinApiResponse[] = await response.json();

      const result = data[0];

      if (
        result?.Status === "Success" &&
        result.PostOffice &&
        result.PostOffice.length > 0
      ) {
        const postOffice = result.PostOffice[0];

        setCityDistrict(postOffice.District);
        setState(postOffice.State);
      } else {
        setPinError("Invalid PIN code. Please enter a valid PIN code.");
      }
    } catch (error) {
      console.error(error);
      setPinError(
        "Unable to fetch location details. Please try again."
      );
    } finally {
      setPinLoading(false);
    }
  };

  const handleSubmit = (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (pinCode.length !== 6) {
      setPinError("Please enter a valid 6-digit PIN code.");
      return;
    }

    if (!cityDistrict || !state) {
      setPinError("Please enter a valid PIN code first.");
      return;
    }

    alert("Profile updated successfully!");
  };

  return (
    <main className="px-6 py-10">
      <div className="mx-auto w-full max-w-5xl">

        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">
            My Profile
          </h2>

          <p className="mt-2 text-gray-700">
            Complete and manage your personal information.
          </p>
        </div>

        {/* Main Card */}
        <div className="rounded-2xl border bg-white p-8 shadow-md">

          {/* Profile Photo */}
          <div className="flex flex-col items-center border-b pb-8">
            <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border-4 border-blue-100 bg-gray-100">
              {profileImage ? (
                <img
                  src={profileImage}
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-6xl">👤</span>
              )}
            </div>

            <label className="mt-4 cursor-pointer rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white hover:bg-blue-700 transition">
              Upload Photo

              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>

            <p className="mt-2 text-sm text-gray-600">
              JPG, PNG or JPEG
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="mt-8 space-y-6"
          >

            {/* FULL NAME */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-900">
                Full Name
              </label>

              <input
                type="text"
                placeholder="Enter your full name"
                required
                className="w-full rounded-lg border border-gray-400 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-700 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* PHONE + EMAIL */}
            <div className="grid gap-6 md:grid-cols-2">

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-900">
                  Phone Number
                </label>

                <input
                  type="tel"
                  placeholder="Enter your phone number"
                  required
                  className="w-full rounded-lg border border-gray-400 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-700 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-900">
                  Email
                </label>

                <input
                  type="email"
                  placeholder="Enter your email"
                  required
                  className="w-full rounded-lg border border-gray-400 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-700 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

            </div>

            {/* PIN CODE */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-900">
                PIN Code
              </label>

              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={pinCode}
                onChange={handlePinChange}
                placeholder="Enter your 6-digit PIN code"
                required
                className="w-full rounded-lg border border-gray-400 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-700 outline-none focus:ring-2 focus:ring-blue-500"
              />

              {pinLoading && (
                <p className="mt-2 text-sm font-medium text-blue-600">
                  Fetching location details...
                </p>
              )}

              {pinError && (
                <p className="mt-2 text-sm font-medium text-red-600">
                  {pinError}
                </p>
              )}
            </div>

            {/* CITY / DISTRICT + STATE */}
            <div className="grid gap-6 md:grid-cols-2">

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-900">
                  City / District
                </label>

                <input
                  type="text"
                  value={cityDistrict}
                  readOnly
                  placeholder="Automatically filled from PIN code"
                  className="w-full rounded-lg border border-gray-400 bg-gray-100 px-4 py-3 text-gray-900 placeholder:text-gray-700 outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-900">
                  State
                </label>

                <input
                  type="text"
                  value={state}
                  readOnly
                  placeholder="Automatically filled from PIN code"
                  className="w-full rounded-lg border border-gray-400 bg-gray-100 px-4 py-3 text-gray-900 placeholder:text-gray-700 outline-none"
                />
              </div>

            </div>

            {/* ADDRESS */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-900">
                Complete Address
              </label>

              <textarea
                rows={4}
                placeholder="Enter your complete address"
                required
                className="w-full resize-none rounded-lg border border-gray-400 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-700 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* CURRENT LOCATION */}
            <div className="rounded-xl border border-blue-200 bg-blue-50 p-5">
              <h3 className="text-lg font-bold text-gray-900">
                📍 Current Location
              </h3>

              <p className="mt-1 text-sm text-gray-700">
                Your location can help CityCare identify nearby civic
                services and departments.
              </p>

              <button
                type="button"
                className="mt-4 rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white hover:bg-blue-700 transition"
              >
                Use My Current Location
              </button>
            </div>

            {/* BUTTONS */}
            <div className="flex flex-wrap gap-4 border-t pt-6">

              <button
                type="submit"
                className="rounded-lg bg-blue-600 px-7 py-3 font-semibold text-white hover:bg-blue-700 transition"
              >
                Save Profile
              </button>

              <Link
                href="/citizen/dashboard"
                className="rounded-lg border border-gray-400 bg-white px-7 py-3 font-semibold text-gray-900 hover:bg-gray-100 transition"
              >
                Cancel
              </Link>

            </div>

          </form>
        </div>
      </div>
    </main>
  );
}