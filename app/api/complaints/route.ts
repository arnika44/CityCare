import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Complaint from "@/models/Complaint";

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