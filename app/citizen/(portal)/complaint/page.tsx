"use client";

import { useRef, useState } from "react";

export default function ComplaintPage() {
  const [image, setImage] = useState<string | null>(null);
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [isListening, setIsListening] = useState(false);

  const [location, setLocation] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [showLocationDetails, setShowLocationDetails] = useState(false);
  const [landmark, setLandmark] = useState("");
  const [locationDetails, setLocationDetails] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const imageUrl = URL.createObjectURL(file);
    setImage(imageUrl);
  };

  const handleChoosePhoto = () => {
    fileInputRef.current?.click();
  };

  const handleRemovePhoto = () => {
    setImage(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleVoiceInput = () => {
    const SpeechRecognitionAPI =
      (
        window as typeof window & {
          SpeechRecognition?: new () => any;
          webkitSpeechRecognition?: new () => any;
        }
      ).SpeechRecognition ||
      (
        window as typeof window & {
          SpeechRecognition?: new () => any;
          webkitSpeechRecognition?: new () => any;
        }
      ).webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      alert(
        "Voice input is not supported in this browser. Please use Google Chrome."
      );
      return;
    }

    const recognition = new SpeechRecognitionAPI();

    recognition.lang = "en-IN";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const spokenText = event.results[0][0].transcript;

      setDescription((previous) =>
        previous ? `${previous} ${spokenText}` : spokenText
      );
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert("Location is not supported by your browser.");
      return;
    }

    setIsGettingLocation(true);
    setLocation("");
    setLatitude(null);
    setLongitude(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const currentLatitude = position.coords.latitude;
        const currentLongitude = position.coords.longitude;

        setLatitude(currentLatitude);
        setLongitude(currentLongitude);

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${currentLatitude}&lon=${currentLongitude}&zoom=18&addressdetails=1`
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
            setLocation(uniqueParts.join(", "));
          } else if (data.display_name) {
            setLocation(data.display_name);
          } else {
            setLocation("Current location detected");
          }
        } catch (error) {
          setLocation(
            "Current location detected, but address could not be found."
          );
        } finally {
          setIsGettingLocation(false);
        }
      },
      () => {
        setIsGettingLocation(false);
        setLatitude(null);
        setLongitude(null);

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

  const handleSubmit = async () => {
    if (!image) {
      alert("Please upload a photo of the problem.");
      return;
    }

    if (!category) {
      alert("Please select a problem category.");
      return;
    }

    if (!description.trim()) {
      alert("Please provide a problem description.");
      return;
    }

    if (!location) {
      alert("Please provide the problem location.");
      return;
    }

    if (latitude === null || longitude === null) {
      alert("Please detect your current location again.");
      return;
    }

    setIsSubmitting(true);

    try {
      let citizenId = localStorage.getItem("citycare_citizen_id");

      if (!citizenId) {
        citizenId = crypto.randomUUID();
        localStorage.setItem("citycare_citizen_id", citizenId);
      }

      const response = await fetch("/api/complaints", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          citizenId,
          category,
          description: description.trim(),
          imageUrl: "",
          location: {
            latitude,
            longitude,
            address: location,
          },
          landmark: landmark.trim(),
          locationDetails: locationDetails.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to submit complaint."
        );
      }

      alert("Complaint submitted successfully.");

      setImage(null);
      setCategory("");
      setDescription("");
      setLocation("");
      setLatitude(null);
      setLongitude(null);
      setLandmark("");
      setLocationDetails("");
      setShowLocationDetails(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Complaint submission error:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Something went wrong while submitting the complaint."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="px-6 py-10">
      <div className="mx-auto w-full max-w-4xl">

        {/* Page Header */}
        <div>
          <h2 className="text-3xl font-bold text-gray-900">
            Raise a Complaint
          </h2>

          <p className="mt-2 text-gray-700">
            Report a civic problem by providing its photo and details.
          </p>
        </div>

        {/* Photo Upload Card */}
        <section className="mt-8 rounded-2xl border bg-white p-8 shadow-md">

          <h3 className="text-xl font-bold text-gray-900">
            Upload Problem Photo
          </h3>

          <p className="mt-2 text-gray-600">
            Take a clear photo or upload an existing photo of the problem.
          </p>

          {!image ? (
            <div
              onClick={handleChoosePhoto}
              className="mt-6 flex min-h-[320px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-blue-300 bg-blue-50 px-6 text-center transition hover:bg-blue-100"
            >
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 text-4xl">
                📷
              </div>

              <h4 className="mt-5 text-lg font-bold text-gray-900">
                Upload a Photo
              </h4>

              <p className="mt-2 text-sm text-gray-600">
                Click here to select a photo from your device
              </p>

              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  handleChoosePhoto();
                }}
                className="mt-5 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
              >
                Choose Photo
              </button>

              <p className="mt-4 text-xs text-gray-500">
                JPG, JPEG or PNG
              </p>
            </div>
          ) : (
            <div className="mt-6">

              {/* Image Preview */}
              <div className="overflow-hidden rounded-2xl border bg-gray-50">
                <img
                  src={image}
                  alt="Uploaded civic problem"
                  className="max-h-[500px] w-full object-contain"
                />
              </div>

              {/* Photo Actions */}
              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleChoosePhoto}
                  className="rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white transition hover:bg-blue-700"
                >
                  Change Photo
                </button>

                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="rounded-lg border border-red-300 bg-white px-5 py-2.5 font-semibold text-red-600 transition hover:bg-red-50"
                >
                  Remove Photo
                </button>
              </div>

            </div>
          )}

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png, image/jpeg, image/jpg"
            onChange={handleImageUpload}
            className="hidden"
          />

        </section>

        {/* Problem Details */}
        <section className="mt-8 rounded-2xl border bg-white p-8 shadow-md">

          <h3 className="text-xl font-bold text-gray-900">
            Problem Details
          </h3>

          <p className="mt-2 text-gray-600">
            Tell us what kind of civic problem you are reporting.
          </p>

          {/* Problem Category */}
          <div className="mt-6">
            <label
              htmlFor="category"
              className="block text-sm font-semibold text-gray-900"
            >
              Problem Category
            </label>

            <select
              id="category"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">
                Select a problem category
              </option>

              <option value="Pothole">
                Pothole / Road Damage
              </option>

              <option value="Garbage">
                Garbage / Waste
              </option>

              <option value="Waterlogging">
                Waterlogging
              </option>

              <option value="Water Leakage">
                Water Leakage
              </option>

              <option value="Streetlight">
                Broken Streetlight
              </option>

              <option value="Open Drain">
                Open Drain
              </option>

              <option value="Sewage">
                Sewage Problem
              </option>

              <option value="Traffic">
                Traffic Problem
              </option>

              <option value="Illegal Dumping">
                Illegal Dumping
              </option>

              <option value="Stray Animals">
                Stray Animals
              </option>

              <option value="Other">
                Other
              </option>
            </select>
          </div>

          {/* Problem Description */}
          <div className="mt-6">

            <label
              htmlFor="description"
              className="block text-sm font-semibold text-gray-900"
            >
              Problem Description
            </label>

            <div className="relative mt-2">

              <textarea
                id="description"
                value={description}
                onChange={(event) =>
                  setDescription(event.target.value)
                }
                placeholder="Describe the problem in detail..."
                rows={5}
                className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 pr-16 text-gray-900 outline-none placeholder:text-gray-400 transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

              {/* Mic Button */}
              <button
                type="button"
                onClick={handleVoiceInput}
                title="Speak your problem description"
                className={`absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-lg transition ${
                  isListening
                    ? "bg-red-500 text-white hover:bg-red-600"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                <span className="text-lg">
                  {isListening ? "🔴" : "🎙️"}
                </span>
              </button>

            </div>

            <p className="mt-2 text-xs text-gray-500">
              Type your description or tap the microphone to speak.
            </p>

            {isListening && (
              <p className="mt-2 text-sm font-medium text-red-600">
                Listening... Please speak clearly.
              </p>
            )}

          </div>

        </section>

        {/* Problem Location */}
        <section className="mt-8 rounded-2xl border bg-white p-8 shadow-md">

          <h3 className="text-xl font-bold text-gray-900">
            Problem Location
          </h3>

          <p className="mt-2 text-gray-600">
            Let CityCare detect the location where the problem is being
            reported.
          </p>

          <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-5">

            {/* Location Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

              <div className="flex items-start gap-3">

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xl">
                  📍
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900">
                    Use Current Location
                  </h4>

                  <p className="mt-1 text-sm text-gray-600">
                    Your current address will be detected automatically.
                  </p>
                </div>

              </div>

              <button
                type="button"
                onClick={handleGetLocation}
                disabled={isGettingLocation}
                className="shrink-0 rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isGettingLocation
                  ? "Detecting Location..."
                  : "Use My Location"}
              </button>

            </div>

            {/* Detected Location */}
            {location && (
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
                      {location}
                    </p>

                  </div>

                </div>

                {/* Add Location Details */}
                <button
                  type="button"
                  onClick={() =>
                    setShowLocationDetails(!showLocationDetails)
                  }
                  className="mt-4 text-sm font-semibold text-blue-600 hover:text-blue-700"
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
                        placeholder="Add any extra detail that can help identify the exact spot..."
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

        </section>

        {/* Submit Complaint */}
        <div className="mt-8 flex justify-end">

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="rounded-xl bg-blue-600 px-8 py-3.5 text-base font-bold text-white shadow-md transition hover:bg-blue-700 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Submitting Complaint..." : "Submit Complaint"}
          </button>

        </div>

      </div>
    </main>
  );
}