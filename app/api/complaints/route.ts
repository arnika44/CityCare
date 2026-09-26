import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Complaint from "@/models/Complaint";

const VALID_STATUSES = [
  "Reported",
  "Verified",
  "Assigned",
  "In Progress",
  "Resolved",
] as const;

type ComplaintStatus = (typeof VALID_STATUSES)[number];

export async function POST(request: Request) {
  try {
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

    if (!citizenId || !category || !description || !location) {
      return NextResponse.json(
        {
          success: false,
          message: "Required complaint details are missing.",
        },
        { status: 400 }
      );
    }

    if (
      typeof location.latitude !== "number" ||
      typeof location.longitude !== "number"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Valid location coordinates are required.",
        },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const complaint = await Complaint.create({
      citizenId,
      category,
      description,
      imageUrl: imageUrl || "",
      location: {
        latitude: location.latitude,
        longitude: location.longitude,
        address: location.address || "",
      },
      landmark: landmark || "",
      locationDetails: locationDetails || "",
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
    console.error("Complaint API Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to submit complaint.",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const citizenId = searchParams.get("citizenId");

    if (!citizenId) {
      return NextResponse.json(
        {
          success: false,
          message: "Citizen ID is required.",
        },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const complaints = await Complaint.find({ citizenId })
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

export async function PUT(request: Request) {
  try {
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

    if (!category || !description || !location) {
      return NextResponse.json(
        {
          success: false,
          message: "Required complaint details are missing.",
        },
        { status: 400 }
      );
    }

    if (
      typeof location.latitude !== "number" ||
      typeof location.longitude !== "number"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Valid location coordinates are required.",
        },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const complaint = await Complaint.findOneAndUpdate(
      {
        _id: complaintId,
        citizenId,
      },
      {
        category,
        description,
        imageUrl: imageUrl || "",
        location: {
          latitude: location.latitude,
          longitude: location.longitude,
          address: location.address || "",
        },
        landmark: landmark || "",
        locationDetails: locationDetails || "",
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!complaint) {
      return NextResponse.json(
        {
          success: false,
          message: "Complaint not found.",
        },
        { status: 404 }
      );
    }

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
        message: "Failed to update complaint.",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();

    const { complaintId, status } = body;

    if (!complaintId || !status) {
      return NextResponse.json(
        {
          success: false,
          message: "Complaint ID and status are required.",
        },
        { status: 400 }
      );
    }

    if (!VALID_STATUSES.includes(status as ComplaintStatus)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid complaint status.",
        },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const complaint = await Complaint.findById(complaintId);

    if (!complaint) {
      return NextResponse.json(
        {
          success: false,
          message: "Complaint not found.",
        },
        { status: 404 }
      );
    }

    const newStatus = status as ComplaintStatus;

    if (complaint.status === newStatus) {
      return NextResponse.json(
        {
          success: true,
          message: "Complaint is already at this status.",
          complaint,
        },
        { status: 200 }
      );
    }

    complaint.status = newStatus;

    complaint.statusHistory.push({
      status: newStatus,
      timestamp: new Date(),
    });

    await complaint.save();

    return NextResponse.json(
      {
        success: true,
        message: "Complaint status updated successfully.",
        complaint,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Complaint Status Update API Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update complaint status.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();

    const { complaintId, citizenId } = body;

    if (!complaintId || !citizenId) {
      return NextResponse.json(
        {
          success: false,
          message: "Complaint ID and Citizen ID are required.",
        },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const complaint = await Complaint.findOneAndDelete({
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