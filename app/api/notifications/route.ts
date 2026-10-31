
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import Notification from "@/models/notification";

// GET: Fetch all notifications for a citizen
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const citizenId = searchParams.get("citizenId");

    if (!citizenId) {
      return NextResponse.json(
        { success: false, message: "Citizen ID is required" },
        { status: 400 }
      );
    }

    const notifications = await Notification.find({ citizenId })
      .sort({ createdAt: -1 })
      .lean();

    const unreadCount = await Notification.countDocuments({
      citizenId,
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
      { success: false, message: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

// POST: Create a notification
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const body = await request.json();

    const {
      citizenId,
      complaintId,
      title,
      message,
      type,
    } = body;

    if (
      !citizenId ||
      !complaintId ||
      !mongoose.Types.ObjectId.isValid(complaintId) ||
      !title ||
      !message ||
      ![
        "STATUS_UPDATE",
        "COMPLAINT_ASSIGNED",
        "COMPLAINT_RESOLVED",
      ].includes(type)
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid notification details" },
        { status: 400 }
      );
    }

    const notification = await Notification.create({
      citizenId: String(citizenId).trim(),
      complaintId,
      title: String(title).trim(),
      message: String(message).trim(),
      type,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Notification created successfully",
        notification,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create notification error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to create notification" },
      { status: 500 }
    );
  }
}

// PATCH: Mark one or all notifications as read
export async function PATCH(request: NextRequest) {
  try {
    await connectToDatabase();

    const body = await request.json();
    const { notificationId, citizenId, markAll } = body;

    if (!citizenId) {
      return NextResponse.json(
        { success: false, message: "Citizen ID is required" },
        { status: 400 }
      );
    }

    if (markAll === true) {
      await Notification.updateMany(
        { citizenId, isRead: false },
        { $set: { isRead: true } }
      );

      return NextResponse.json({
        success: true,
        message: "All notifications marked as read",
      });
    }

    if (
      !notificationId ||
      !mongoose.Types.ObjectId.isValid(notificationId)
    ) {
      return NextResponse.json(
        { success: false, message: "Valid notification ID is required" },
        { status: 400 }
      );
    }

    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, citizenId },
      { $set: { isRead: true } },
      { new: true }
    );

    if (!notification) {
      return NextResponse.json(
        { success: false, message: "Notification not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Notification marked as read",
      notification,
    });
  } catch (error) {
    console.error("Update notification error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to update notification" },
      { status: 500 }
    );
  }
}
