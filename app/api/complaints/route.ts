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

    // Admin: Fetch all complaints
    // Citizen: Fetch only their own complaints
    const complaints = isAdmin
      ? await Complaint.find({})
          .sort({ createdAt: -1 })
          .lean()
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