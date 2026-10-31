import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Complaint from "@/models/Complaint";

type Department =
  | "PWD"
  | "Water"
  | "Electricity"
  | "Sanitation"
  | "Traffic";

const departmentMap: Record<string, Department> = {
  Pothole: "PWD",
  "Road Damage": "PWD",
  "Open Drain": "PWD",

  Waterlogging: "Water",
  "Water Leakage": "Water",

  Streetlight: "Electricity",

  Garbage: "Sanitation",
  Sewage: "Sanitation",
  "Illegal Dumping": "Sanitation",

  Traffic: "Traffic",
};

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

  const hasLatitude = location.latitude !== null &&
    location.latitude !== undefined;
  const hasLongitude = location.longitude !== null &&
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
      : await Complaint.find({ citizenId }).sort({ createdAt: -1 }).lean();

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

    const department = departmentMap[category] || undefined;

    const complaint = await Complaint.create({
      citizenId,
      citizenName: citizenName.trim(),
      citizenPhone: citizenPhone.trim(),
      citizenEmail: citizenEmail.trim().toLowerCase(),
      category,
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
      ...(department ? { department } : {}),
      status: "Reported",
    });

    return NextResponse.json(
      {
        success: true,
        message: "Complaint submitted successfully.",
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

    complaint.citizenName = citizenName.trim();
    complaint.citizenPhone = citizenPhone.trim();
    complaint.citizenEmail = citizenEmail.trim().toLowerCase();

    complaint.category = category;
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

    const department = departmentMap[category];

    if (department) {
      complaint.department = department;
    } else {
      complaint.department = undefined;
    }

    await complaint.save();

    return NextResponse.json(
      {
        success: true,
        message: "Complaint updated successfully.",
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