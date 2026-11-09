
import { NextResponse } from "next/server";

import { connectToDatabase } from "@/lib/mongodb";
import Complaint, {
  type Department,
  type AIVerificationStatus,
} from "@/models/Complaint";
import Admin from "@/models/Admin";
import { getAdminSession } from "@/lib/adminAuth";
import { getCitizenSession } from "@/lib/citizenAuth";
import { analyzeComplaint } from "@/lib/gemini";

export const runtime = "nodejs";

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
    typeof citizenName !== "string" ||
    !citizenName.trim() ||
    typeof citizenPhone !== "string" ||
    !citizenPhone.trim() ||
    typeof citizenEmail !== "string" ||
    !citizenEmail.trim() ||
    typeof category !== "string" ||
    !category.trim() ||
    typeof description !== "string" ||
    !description.trim() ||
    typeof imageUrl !== "string" ||
    !location ||
    typeof location.address !== "string" ||
    !location.address.trim()
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

  if (!isValidCloudinaryImageUrl(imageUrl)) {
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
    (
      typeof location.latitude !== "number" ||
      typeof location.longitude !== "number" ||
      !Number.isFinite(location.latitude) ||
      !Number.isFinite(location.longitude) ||
      location.latitude < -90 ||
      location.latitude > 90 ||
      location.longitude < -180 ||
      location.longitude > 180
    )
  ) {
    return "Invalid GPS coordinates.";
  }

  return null;
}

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

function isValidComplaintId(id: unknown): id is string {
  return (
    typeof id === "string" &&
    /^[a-f\d]{24}$/i.test(id)
  );
}

// GET: Fetch citizen complaints or authorized admin complaints.
export async function GET(request: Request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const isAdmin = searchParams.get("admin") === "true";

    if (isAdmin) {
      const session = await getAdminSession();

      if (!session) {
        return NextResponse.json(
          {
            success: false,
            message: "Unauthorized. Please login.",
          },
          { status: 401 }
        );
      }

      const admin = await Admin.findById(session.id)
        .select("role department isActive")
        .lean();

      if (!admin || !admin.isActive) {
        return NextResponse.json(
          {
            success: false,
            message: "Admin access denied.",
          },
          { status: 403 }
        );
      }

      let complaintFilter: Record<string, any>;

      if (admin.role === "super-admin") {
        complaintFilter = {};
      } else if (
        admin.role === "department-admin" &&
        admin.department
      ) {
        complaintFilter = {
          department: admin.department,
        };
      } else {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid admin permissions.",
          },
          { status: 403 }
        );
      }

      const complaints = await Complaint.find(complaintFilter)
        .sort({ createdAt: -1 })
        .lean();

      return NextResponse.json(
        {
          success: true,
          complaints,
        },
        { status: 200 }
      );
    }

    const session = await getCitizenSession();

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message: "Please login to view your complaints.",
        },
        { status: 401 }
      );
    }

    const complaints = await Complaint.find({
      citizenId: session.citizenId,
    })
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

// POST: Create a complaint for the authenticated citizen.
export async function POST(request: Request) {
  try {
    const session = await getCitizenSession();

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message: "Please login to submit a complaint.",
        },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const body = await request.json();

    const {
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

    const aiVerification = await verifyComplaintWithAI(
      category,
      description.trim(),
      imageUrl
    );

    const complaint = await Complaint.create({
      citizenId: session.citizenId,

      citizenName: citizenName.trim(),
      citizenPhone: citizenPhone.trim(),
      citizenEmail: session.email.toLowerCase(),

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

      landmark:
        typeof landmark === "string" ? landmark.trim() : "",

      locationDetails:
        typeof locationDetails === "string"
          ? locationDetails.trim()
          : "",

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

// DELETE: Delete only the authenticated citizen's own complaint.
export async function DELETE(request: Request) {
  try {
    const session = await getCitizenSession();

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message: "Please login to delete a complaint.",
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { complaintId } = body;

    if (!isValidComplaintId(complaintId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid complaint ID.",
        },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const deletedComplaint = await Complaint.findOneAndDelete({
      _id: complaintId,
      citizenId: session.citizenId,
    });

    if (!deletedComplaint) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Complaint not found or you are not authorized to delete it.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Complaint deleted successfully.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Complaint Delete API Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete complaint.",
      },
      { status: 500 }
    );
  }
}

// PUT: Update only the authenticated citizen's own complaint.
export async function PUT(request: Request) {
  try {
    const session = await getCitizenSession();

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message: "Please login to update a complaint.",
        },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const body = await request.json();

    const {
      complaintId,
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

    if (!isValidComplaintId(complaintId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid complaint ID.",
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
      citizenId: session.citizenId,
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

    const aiVerification = await verifyComplaintWithAI(
      category,
      description.trim(),
      imageUrl
    );

    const previousDepartment = complaint.department;

    complaint.citizenName = citizenName.trim();
    complaint.citizenPhone = citizenPhone.trim();
    complaint.citizenEmail = session.email.toLowerCase();

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

    complaint.landmark =
      typeof landmark === "string" ? landmark.trim() : "";

    complaint.locationDetails =
      typeof locationDetails === "string"
        ? locationDetails.trim()
        : "";

    complaint.department = aiVerification.department;

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
