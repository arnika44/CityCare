
import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import Feedback from "@/models/Feedback";
import Complaint from "@/models/Complaint";
import { getCitizenSession } from "@/lib/citizenAuth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const session = await getCitizenSession();

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Please login to submit feedback." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { complaintId, rating, feedback } = body;

    if (!complaintId || rating === undefined || !feedback) {
      return NextResponse.json(
        {
          success: false,
          message: "All feedback details are required.",
        },
        { status: 400 }
      );
    }

    if (
      typeof complaintId !== "string" ||
      !Types.ObjectId.isValid(complaintId)
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid complaint ID." },
        { status: 400 }
      );
    }

    if (
      typeof rating !== "number" ||
      !Number.isInteger(rating) ||
      rating < 1 ||
      rating > 5
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Rating must be a whole number between 1 and 5.",
        },
        { status: 400 }
      );
    }

    if (typeof feedback !== "string" || !feedback.trim()) {
      return NextResponse.json(
        { success: false, message: "Please enter your feedback." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const complaint = await Complaint.findOne({
      _id: complaintId,
      citizenId: session.citizenId,
    });

    if (!complaint) {
      return NextResponse.json(
        { success: false, message: "Complaint not found." },
        { status: 404 }
      );
    }

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

    const existingFeedback = await Feedback.findOne({
      complaintId,
      citizenId: session.citizenId,
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
      citizenId: session.citizenId,
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
  } catch (error: any) {
    if (error?.code === 11000) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Feedback has already been submitted for this complaint.",
        },
        { status: 409 }
      );
    }

    console.error("Feedback API Error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to submit feedback." },
      { status: 500 }
    );
  }
}
