
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Complaint from "@/models/Complaint";

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
      category,
      description,
      imageUrl,
      location,
      landmark,
      locationDetails,
    } = body;

    if (
      !citizenId ||
      !category ||
      !description?.trim() ||
      !imageUrl ||
      !location?.address ||
      typeof location.latitude !== "number" ||
      typeof location.longitude !== "number"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Please provide all required complaint details.",
        },
        { status: 400 }
      );
    }

    const complaint = await Complaint.create({
      citizenId,
      category,
      description: description.trim(),
      imageUrl,
      location,
      landmark: landmark || "",
      locationDetails: locationDetails || "",
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

    if (
      !category ||
      !description?.trim() ||
      !imageUrl ||
      !location?.address ||
      typeof location.latitude !== "number" ||
      typeof location.longitude !== "number"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Please provide all required complaint details.",
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

    complaint.category = category;
    complaint.description = description.trim();
    complaint.imageUrl = imageUrl;
    complaint.location = location;
    complaint.landmark = landmark || "";
    complaint.locationDetails = locationDetails || "";

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
