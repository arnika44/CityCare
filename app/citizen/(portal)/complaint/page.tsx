"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function ComplaintPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const editComplaintId =
    searchParams.get("id") ||
    searchParams.get("edit") ||
    searchParams.get("complaintId");

  const isEditMode = Boolean(editComplaintId);

  const [image, setImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

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
  const [isLoadingComplaint, setIsLoadingComplaint] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  /*
   * Load existing complaint when Edit mode is opened
   */
  useEffect(() => {
    if (!isEditMode || !editComplaintId) {
      return;
    }

    const loadComplaint = async () => {
      setIsLoadingComplaint(true);

      try {
        const citizenId = localStorage.getItem("citycare_citizen_id");

        if (!citizenId) {
          alert("Citizen information not found. Please login again.");
          router.push("/citizen/complaints");
          return;
        }

        const response = await fetch(
          `/api/complaints?citizenId=${encodeURIComponent(citizenId)}`
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Failed to load complaint."
          );
        }

        const complaint = data.complaints?.find(
          (item: any) => item._id === editComplaintId
        );

        if (!complaint) {
          alert("Complaint not found.");
          router.push("/citizen/complaints");
          return;
        }

        /*
         * Fill existing complaint data
         */
        setCategory(complaint.category || "");
        setDescription(complaint.description || "");

        setImage(complaint.imageUrl || null);
        setImageFile(null);

        setLocation(complaint.location?.address || "");
        setLatitude(
          typeof complaint.location?.latitude === "number"
            ? complaint.location.latitude
            : null
        );
        setLongitude(
          typeof complaint.location?.longitude === "number"
            ? complaint.location.longitude
            : null
        );

        setLandmark(complaint.landmark || "");
        setLocationDetails(complaint.locationDetails || "");

        if (complaint.landmark || complaint.locationDetails) {
          setShowLocationDetails(true);
        }
      } catch (error) {
        console.error("Load complaint error:", error);

        alert(
          error instanceof Error
            ? error.message
            : "Something went wrong while loading the complaint."
        );

        router.push("/citizen/complaints");
      } finally {
        setIsLoadingComplaint(false);
      }
    };

    loadComplaint();
  }, [editComplaintId, isEditMode, router]);

  const handleImageUpload = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setImageFile(file);

    const imageUrl = URL.createObjectURL(file);
    setImage(imageUrl);
  };

  const handleChoosePhoto = () => {
    fileInputRef.current?.click();
  };

  const handleTakePhoto = () => {
    cameraInputRef.current?.click();
  };

  const handleRemovePhoto = () => {
    setImage(null);
    setImageFile(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    if (cameraInputRef.current) {
      cameraInputRef.current.value = "";
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
    /*
     * In normal mode photo is required.
     *
     * In edit mode an existing photo can remain unchanged,
     * so a new image file is not required.
     */
    if (!isEditMode && !imageFile) {
      alert("Please upload or take a photo of the problem.");
      return;
    }

    if (isEditMode && !image) {
      alert("Please upload or take a photo of the problem.");
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
      /*
       * Get citizen ID
       */
      let citizenId = localStorage.getItem("citycare_citizen_id");

      if (!citizenId) {
        citizenId = crypto.randomUUID();
        localStorage.setItem("citycare_citizen_id", citizenId);
      }

      /*
       * Image URL
       *
       * If user selected a new image:
       * upload it to Cloudinary.
       *
       * If user did not select a new image:
       * keep the existing image URL.
       */
      let cloudinaryImageUrl = image || "";

      if (imageFile) {
        const formData = new FormData();
        formData.append("file", imageFile);

        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const uploadData = await uploadResponse.json();

        if (!uploadResponse.ok || !uploadData.success) {
          throw new Error(
            uploadData.message || "Failed to upload complaint image."
          );
        }

        cloudinaryImageUrl = uploadData.imageUrl;
      }

      /*
       * EDIT MODE
       */
      if (isEditMode && editComplaintId) {
        const response = await fetch("/api/complaints", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            complaintId: editComplaintId,
            citizenId,
            category,
            description: description.trim(),
            imageUrl: cloudinaryImageUrl,
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
            data.message || "Failed to update complaint."
          );
        }

        alert("Complaint updated successfully.");

        router.push("/citizen/complaints");
        return;
      }

      /*
       * NORMAL CREATE MODE
       */
      const response = await fetch("/api/complaints", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          citizenId,
          category,
          description: description.trim(),
          imageUrl: cloudinaryImageUrl,
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

      /*
       * Clear the complaint form
       */
      setImage(null);
      setImageFile(null);
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

      if (cameraInputRef.current) {
        cameraInputRef.current.value = "";
      }

      /*
       * Open My Complaints automatically
       */
      router.push("/citizen/complaints");
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

  /*
   * Loading screen while existing complaint is being loaded
   */
  if (isEditMode && isLoadingComplaint) {
    return (
      <main className="px-6 py-10">
        <div className="mx-auto flex min-h-[400px] w-full max-w-4xl items-center justify-center">
          <div className="rounded-2xl border bg-white px-8 py-10 text-center shadow-md">
            <div className="text-4xl">⏳</div>

            <h2 className="mt-4 text-xl font-bold text-gray-900">
              Loading Complaint...
            </h2>

            <p className="mt-2 text-sm text-gray-600">
              Please wait while we load your complaint details.
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="px-6 py-10">
      <div className="mx-auto w-full max-w-4xl">

        {/* Page Header */}
        <div>
          <h2 className="text-3xl font-bold text-gray-900">
            {isEditMode ? "Edit Complaint" : "Raise a Complaint"}
          </h2>

          <p className="mt-2 text-gray-700">
            {isEditMode
              ? "Update the details of your complaint and save the changes."
              : "Report a civic problem by providing its photo and details."}
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
            <div className="mt-6 rounded-2xl border-2 border-dashed border-blue-300 bg-blue-50 p-8">

              <div className="flex flex-col items-center justify-center text-center">

                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 text-4xl">
                  📷
                </div>

                <h4 className="mt-5 text-lg font-bold text-gray-900">
                  Add a Photo
                </h4>

                <p className="mt-2 text-sm text-gray-600">
                  Take a new photo or choose an existing photo from your device.
                </p>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row">

                  <button
                    type="button"
                    onClick={handleTakePhoto}
                    className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
                  >
                    📷 Take Photo
                  </button>

                  <button
                    type="button"
                    onClick={handleChoosePhoto}
                    className="rounded-lg border border-blue-300 bg-white px-6 py-3 font-semibold text-blue-700 transition hover:bg-blue-50"
                  >
                    🖼️ Upload Photo
                  </button>

                </div>

                <p className="mt-4 text-xs text-gray-500">
                  JPG, JPEG or PNG
                </p>

              </div>

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
                  onClick={handleTakePhoto}
                  className="rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white transition hover:bg-blue-700"
                >
                  📷 Take New Photo
                </button>

                <button
                  type="button"
                  onClick={handleChoosePhoto}
                  className="rounded-lg border border-blue-300 bg-white px-5 py-2.5 font-semibold text-blue-700 transition hover:bg-blue-50"
                >
                  🖼️ Choose Photo
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

          {/* Upload Existing Photo */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png, image/jpeg, image/jpg"
            onChange={handleImageUpload}
            className="hidden"
          />

          {/* Take Photo Using Camera */}
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
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

                {showLocationDetails && (
                  <div className="mt-4 space-y-4 border-t pt-4">

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
            {isSubmitting
              ? isEditMode
                ? "Updating Complaint..."
                : "Submitting Complaint..."
              : isEditMode
              ? "Update Complaint"
              : "Submit Complaint"}
          </button>

        </div>

      </div>
    </main>
  );
}