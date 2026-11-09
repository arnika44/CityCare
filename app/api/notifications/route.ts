
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import Notification from "@/models/notification";
import Complaint from "@/models/Complaint";
import Admin from "@/models/Admin";
import { getCitizenSession } from "@/lib/citizenAuth";
import { getAdminSession } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const VALID_TYPES = [
  "STATUS_UPDATE",
  "COMPLAINT_ASSIGNED",
  "COMPLAINT_RESOLVED",
] as const;

// GET: Fetch notifications for the logged-in citizen
export async function GET(request: NextRequest) {
  try {
    const session = await getCitizenSession();

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Please login first." },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const notifications = await Notification.find({
      citizenId: session.citizenId,
    })
      .sort({ createdAt: -1 })
      .lean();

    const unreadCount = await Notification.countDocuments({
      citizenId: session.citizenId,
      isRead: false,
    });

    return NextResponse.json({
      success: true,
      notifications,
      unreadCount,
    });
  } catch (error) {
    console.error("Fetch notifications error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to fetch notifications." },
      { status: 500 }
    );
  }
}

// POST: Create a notification for a complaint
export async function POST(request: NextRequest) {
  try {
    const session = await getAdminSession();

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Admin login required." },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const admin = await Admin.findOne({
      _id: session.id,
      isActive: true,
    });

    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Admin account is not active." },
        { status: 403 }
      );
    }

    const body = await request.json();

    const { complaintId, title, message, type } = body;

    if (
      typeof complaintId !== "string" ||
      !mongoose.Types.ObjectId.isValid(complaintId) ||
      typeof title !== "string" ||
      !title.trim() ||
      typeof message !== "string" ||
      !message.trim() ||
      !VALID_TYPES.includes(type)
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid notification details." },
        { status: 400 }
      );
    }

    const complaint = await Complaint.findById(complaintId);

    if (!complaint) {
      return NextResponse.json(
        { success: false, message: "Complaint not found." },
        { status: 404 }
      );
    }

    if (
      admin.role !== "super-admin" &&
      admin.department !== complaint.department
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "You are not allowed to access this complaint.",
        },
        { status: 403 }
      );
    }

    const notification = await Notification.create({
      citizenId: complaint.citizenId,
      complaintId: complaint._id,
      title: title.trim(),
      message: message.trim(),
      type,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Notification created successfully.",
        notification,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create notification error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to create notification." },
      { status: 500 }
    );
  }
}

// PATCH: Mark one or all notifications as read
export async function PATCH(request: NextRequest) {
  try {
    const session = await getCitizenSession();

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Please login first." },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const body = await request.json();
    const { notificationId, markAll } = body;

    // Mark all notifications as read
    if (markAll === true) {
      await Notification.updateMany(
        {
          citizenId: session.citizenId,
          isRead: false,
        },
        {
          $set: { isRead: true },
        }
      );

      return NextResponse.json({
        success: true,
        message: "All notifications marked as read.",
      });
    }

    // Validate notification ID
    if (
      typeof notificationId !== "string" ||
      !mongoose.Types.ObjectId.isValid(notificationId)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Valid notification ID is required.",
        },
        { status: 400 }
      );
    }

    // Update only the logged-in citizen's notification
    const notification = await Notification.findOneAndUpdate(
      {
        _id: notificationId,
        citizenId: session.citizenId,
      },
      {
        $set: { isRead: true },
      },
      {
        new: true,
      }
    );

    if (!notification) {
      return NextResponse.json(
        {
          success: false,
          message: "Notification not found.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Notification marked as read.",
      notification,
    });
  } catch (error) {
    console.error("Update notification error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to update notification." },
      { status: 500 }
    );
  }
}
