
import { NextResponse } from "next/server";

import { connectToDatabase } from "@/lib/mongodb";
import Complaint, {
  type Department,
  type AIVerificationStatus,
} from "@/models/Complaint";
import { analyzeComplaint } from "@/lib/gemini";

const departmentMap: Record<string, Department> = {
  Pothole: "PWD",
  "Road Damage": "PWD",
  "Open Drain": "PWD",

  Waterlogging: "Water",
  "Water Leakage": "Water",
  "Water Supply": "Water",

  Streetlight: "Electricity",
  Electricity: "Electricity",

  Garbage: "Sanitation",
  Sewage: "Sanitation",
  "Illegal Dumping": "Sanitation",
  Waste: "Sanitation",

  Traffic: "Traffic",
};

function isValidCloudinaryImageUrl(imageUrl: string) {
  try {
    const url = new URL(imageUrl);

    return (
      url.protocol === "https:" &&
      url.hostname === "res.cloudinary.com"
    );
  } catch {
    return false;
  }
}

function validateComplaintDetails(body: any) {
  const {
    citizenName,
    citizenPhone,
    citizenEmail,
    category,
    description,
    imageUrl,
    location,
  } = body;

  if (
    !citizenName?.trim() ||
    !citizenPhone?.trim() ||
    !citizenEmail?.trim() ||
    !category ||
    !description?.trim() ||
    !imageUrl ||
    !location?.address?.trim()
  ) {
    return "Please provide name, phone, email, photo, category, description and complaint address.";
  }

  if (!/^[0-9]{10}$/.test(citizenPhone.trim())) {
    return "Please enter a valid 10-digit phone number.";
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(citizenEmail.trim())) {
    return "Please enter a valid email address.";
  }

  if (
    typeof imageUrl !== "string" ||
    !isValidCloudinaryImageUrl(imageUrl)
  ) {
    return "Please provide a valid Cloudinary complaint image.";
  }

  const hasLatitude =
    location.latitude !== null &&
    location.latitude !== undefined;

  const hasLongitude =
    location.longitude !== null &&
    location.longitude !== undefined;

  if (hasLatitude !== hasLongitude) {
    return "Both latitude and longitude must be provided together.";
  }

  if (
    hasLatitude &&
    (typeof location.latitude !== "number" ||
      typeof location.longitude !== "number")
  ) {
    return "Invalid GPS coordinates.";
  }

  return null;
}

// Safely extract the actual AI error without exposing API keys.
function getAIErrorMessage(error: unknown): string {
  let message =
    error instanceof Error
      ? error.message
      : String(error);

  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey) {
    message = message.split(apiKey).join("[REDACTED]");
  }

  return message.slice(0, 500);
}

async function verifyComplaintWithAI(
  reportedCategory: string,
  description: string,
  imageUrl: string
) {
  try {
    const analysis = await analyzeComplaint(
      description,
      imageUrl,
      reportedCategory
    );

    const department =
      departmentMap[analysis.verifiedCategory];

    const needsManualReview =
      analysis.needsManualReview || !department;

    return {
      category: needsManualReview
        ? reportedCategory
        : analysis.verifiedCategory,

      reportedCategory,

      aiVerifiedCategory: analysis.verifiedCategory,

      aiVerificationStatus: (
        needsManualReview ? "Manual Review" : "Verified"
      ) as AIVerificationStatus,

      aiConfidence: analysis.confidence,
      aiReason: analysis.reason,
      aiVerifiedAt: new Date(),

      department: needsManualReview
        ? undefined
        : department,
    };
  } catch (error) {
    console.error(
      "Gemini Complaint Verification Error:",
      error
    );

    return {
      category: reportedCategory,
      reportedCategory,
      aiVerifiedCategory: "",
      aiVerificationStatus: "Failed" as AIVerificationStatus,
      aiConfidence: undefined,
      aiReason: getAIErrorMessage(error),
      aiVerifiedAt: undefined,
      department: undefined,
    };
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const citizenId = searchParams.get("citizenId");
    const isAdmin = searchParams.get("admin") === "true";

    if (!citizenId && !isAdmin) {
      return NextResponse.json(
        {
          success: false,
          message: "Citizen ID is required.",
        },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const complaints = isAdmin
      ? await Complaint.find({}).sort({ createdAt: -1 }).lean()
      : await Complaint.find({ citizenId })
          .sort({ createdAt: -1 })
          .lean();

    return NextResponse.json(
      {
        success: true,
        complaints,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Complaint Fetch API Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch complaints.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();

    const body = await request.json();

    const {
      citizenId,
      citizenName,
      citizenPhone,
      citizenEmail,
      category,
      description,
      imageUrl,
      location,
      landmark,
      locationDetails,
    } = body;

    if (!citizenId) {
      return NextResponse.json(
        {
          success: false,
          message: "Citizen ID is required. Please login again.",
        },
        { status: 400 }
      );
    }

    const validationError = validateComplaintDetails(body);

    if (validationError) {
      return NextResponse.json(
        {
          success: false,
          message: validationError,
        },
        { status: 400 }
      );
    }

    // Analyze the complaint photo and description using Gemini.
    const aiVerification = await verifyComplaintWithAI(
      category,
      description.trim(),
      imageUrl
    );

    const complaint = await Complaint.create({
      citizenId,

      citizenName: citizenName.trim(),
      citizenPhone: citizenPhone.trim(),
      citizenEmail: citizenEmail.trim().toLowerCase(),

      ...aiVerification,

      description: description.trim(),
      imageUrl,

      location: {
        address: location.address.trim(),
        ...(typeof location.latitude === "number"
          ? { latitude: location.latitude }
          : {}),
        ...(typeof location.longitude === "number"
          ? { longitude: location.longitude }
          : {}),
      },

      landmark: landmark || "",
      locationDetails: locationDetails || "",

      status: "Reported",
    });

    const message =
      aiVerification.aiVerificationStatus === "Verified"
        ? "Complaint submitted and AI verified successfully."
        : "Complaint submitted successfully. It requires manual verification before department assignment.";

    return NextResponse.json(
      {
        success: true,
        message,
        complaint,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Complaint Create API Error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to submit complaint.",
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    await connectToDatabase();

    const body = await request.json();

    const {
      complaintId,
      citizenId,
      citizenName,
      citizenPhone,
      citizenEmail,
      category,
      description,
      imageUrl,
      location,
      landmark,
      locationDetails,
    } = body;

    if (!complaintId || !citizenId) {
      return NextResponse.json(
        {
          success: false,
          message: "Complaint ID and Citizen ID are required.",
        },
        { status: 400 }
      );
    }

    const validationError = validateComplaintDetails(body);

    if (validationError) {
      return NextResponse.json(
        {
          success: false,
          message: validationError,
        },
        { status: 400 }
      );
    }

    const complaint = await Complaint.findOne({
      _id: complaintId,
      citizenId,
    });

    if (!complaint) {
      return NextResponse.json(
        {
          success: false,
          message: "Complaint not found.",
        },
        { status: 404 }
      );
    }

    if (
      complaint.status === "Resolved" ||
      complaint.status === "Awaiting Citizen Verification"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "This complaint can no longer be edited.",
        },
        { status: 400 }
      );
    }

    // Re-run AI verification whenever a complaint is edited.
    const aiVerification = await verifyComplaintWithAI(
      category,
      description.trim(),
      imageUrl
    );

    const previousDepartment = complaint.department;

    complaint.citizenName = citizenName.trim();
    complaint.citizenPhone = citizenPhone.trim();
    complaint.citizenEmail = citizenEmail.trim().toLowerCase();

    complaint.category = aiVerification.category;
    complaint.reportedCategory = aiVerification.reportedCategory;
    complaint.aiVerifiedCategory =
      aiVerification.aiVerifiedCategory;
    complaint.aiVerificationStatus =
      aiVerification.aiVerificationStatus;
    complaint.aiConfidence = aiVerification.aiConfidence;
    complaint.aiReason = aiVerification.aiReason;
    complaint.aiVerifiedAt = aiVerification.aiVerifiedAt;

    complaint.description = description.trim();
    complaint.imageUrl = imageUrl;

    complaint.location = {
      address: location.address.trim(),
      ...(typeof location.latitude === "number"
        ? { latitude: location.latitude }
        : {}),
      ...(typeof location.longitude === "number"
        ? { longitude: location.longitude }
        : {}),
    };

    complaint.landmark = landmark || "";
    complaint.locationDetails = locationDetails || "";

    complaint.department = aiVerification.department;

    // If the department changes, the previous admin assignment
    // is no longer considered valid.
    if (previousDepartment !== aiVerification.department) {
      complaint.assignedAdminId = "";
      complaint.assignedAdminName = "";

      if (complaint.status !== "Reported") {
        complaint.status = "Reported";
        complaint.statusHistory.push({
          status: "Reported",
          timestamp: new Date(),
        });
      }
    }

    await complaint.save();

    return NextResponse.json(
      {
        success: true,
        message:
          aiVerification.aiVerificationStatus === "Verified"
            ? "Complaint updated and AI verified successfully."
            : "Complaint updated. Manual verification is required.",
        complaint,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Complaint Update API Error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to update complaint.",
      },
      { status: 500 }
    );
  }
}
