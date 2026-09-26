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

  // Current Location
  const [currentLocation, setCurrentLocation] = useState("");
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [showLocationDetails, setShowLocationDetails] = useState(false);
  const [landmark, setLandmark] = useState("");
  const [locationDetails, setLocationDetails] = useState("");

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
        setPinError(
          "Invalid PIN code. Please enter a valid PIN code."
        );
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

  // Get Current Location
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Location is not supported by your browser.");
      return;
    }

    setIsGettingLocation(true);
    setCurrentLocation("");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
          );

          if (!response.ok) {
            throw new Error("Unable to find address");
          }

          const data = await response.json();

          const address = data.address || {};

          const parts = [
            address.road,
            address.neighbourhood,
            address.suburb,
            address.village,
            address.town,
            address.city,
            address.district,
            address.state,
            address.postcode,
          ].filter(Boolean);

          const uniqueParts = [...new Set(parts)];

          if (uniqueParts.length > 0) {
            setCurrentLocation(uniqueParts.join(", "));
          } else if (data.display_name) {
            setCurrentLocation(data.display_name);
          } else {
            setCurrentLocation("Current location detected");
          }
        } catch (error) {
          setCurrentLocation(
            "Current location detected, but address could not be found."
          );
        } finally {
          setIsGettingLocation(false);
        }
      },
      () => {
        setIsGettingLocation(false);

        alert(
          "Unable to get your location. Please allow location permission and try again."
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
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

            <label className="mt-4 cursor-pointer rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white transition hover:bg-blue-700">
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

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                <div className="flex items-start gap-3">

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xl">
                    📍
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      Current Location
                    </h3>

                    <p className="mt-1 text-sm text-gray-700">
                      Your current address can help CityCare identify
                      nearby civic services and departments.
                    </p>
                  </div>

                </div>

                <button
                  type="button"
                  onClick={handleGetCurrentLocation}
                  disabled={isGettingLocation}
                  className="shrink-0 rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isGettingLocation
                    ? "Detecting Location..."
                    : "Use My Current Location"}
                </button>

              </div>

              {/* Detected Location */}
              {currentLocation && (
                <div className="mt-5 rounded-xl border border-green-200 bg-white p-4">

                  <div className="flex items-start gap-3">

                    <div className="mt-0.5 text-xl">
                      📍
                    </div>

                    <div className="min-w-0 flex-1">

                      <p className="text-sm font-semibold text-green-700">
                        Location Detected
                      </p>

                      <p className="mt-1 text-sm leading-6 text-gray-700">
                        {currentLocation}
                      </p>

                    </div>

                  </div>

                  {/* Add Location Details */}
                  <button
                    type="button"
                    onClick={() =>
                      setShowLocationDetails(!showLocationDetails)
                    }
                    className="mt-4 text-sm font-semibold text-blue-600 transition hover:text-blue-700"
                  >
                    {showLocationDetails
                      ? "− Hide Location Details"
                      : "+ Add Location Details"}
                  </button>

                  {/* Extra Location Details */}
                  {showLocationDetails && (
                    <div className="mt-4 space-y-4 border-t pt-4">

                      {/* Landmark */}
                      <div>
                        <label
                          htmlFor="landmark"
                          className="block text-sm font-semibold text-gray-900"
                        >
                          Landmark / Nearby Place
                        </label>

                        <input
                          id="landmark"
                          type="text"
                          value={landmark}
                          onChange={(event) =>
                            setLandmark(event.target.value)
                          }
                          placeholder="e.g. Near ABC School, opposite City Mall"
                          className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-900 outline-none placeholder:text-gray-400 transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                      </div>

                      {/* More About Location */}
                      <div>
                        <label
                          htmlFor="locationDetails"
                          className="block text-sm font-semibold text-gray-900"
                        >
                          More About This Location
                        </label>

                        <textarea
                          id="locationDetails"
                          value={locationDetails}
                          onChange={(event) =>
                            setLocationDetails(event.target.value)
                          }
                          placeholder="Add any extra detail that can help identify this location..."
                          rows={3}
                          className="mt-2 w-full resize-none rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-900 outline-none placeholder:text-gray-400 transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />

                        <p className="mt-1 text-xs text-gray-500">
                          Example: Near the main gate, beside the park,
                          opposite the bus stop, etc.
                        </p>
                      </div>

                    </div>
                  )}

                </div>
              )}

            </div>

            {/* BUTTONS */}
            <div className="flex flex-wrap gap-4 border-t pt-6">

              <button
                type="submit"
                className="rounded-lg bg-blue-600 px-7 py-3 font-semibold text-white transition hover:bg-blue-700"
              >
                Save Profile
              </button>

              <Link
                href="/citizen/dashboard"
                className="rounded-lg border border-gray-400 bg-white px-7 py-3 font-semibold text-gray-900 transition hover:bg-gray-100"
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