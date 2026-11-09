import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Feedback from "@/models/Feedback";
import Complaint from "@/models/Complaint";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      complaintId,
      citizenId,
      rating,
      feedback,
    } = body;

    if (!complaintId || !citizenId || !rating || !feedback) {
      return NextResponse.json(
        {
          success: false,
          message: "All feedback details are required.",
        },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        {
          success: false,
          message: "Rating must be between 1 and 5.",
        },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Check whether the complaint belongs to this citizen
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

    // Feedback can only be submitted for resolved complaints
    if (complaint.status !== "Resolved") {
      return NextResponse.json(
        {
          success: false,
          message:
            "Feedback can only be submitted for resolved complaints.",
        },
        { status: 400 }
      );
    }

    // Prevent duplicate feedback for the same complaint
    const existingFeedback = await Feedback.findOne({
      complaintId,
      citizenId,
    });

    if (existingFeedback) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Feedback has already been submitted for this complaint.",
        },
        { status: 409 }
      );
    }

    const newFeedback = await Feedback.create({
      complaintId,
      citizenId,
      rating,
      feedback: feedback.trim(),
    });

    return NextResponse.json(
      {
        success: true,
        message: "Feedback submitted successfully.",
        feedback: newFeedback,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Feedback API Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to submit feedback.",
      },
      { status: 500 }
    );
  }
}