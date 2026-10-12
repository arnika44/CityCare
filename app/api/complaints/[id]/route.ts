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

const VALID_DEPARTMENTS = [
  "PWD",
  "Water",
  "Electricity",
  "Sanitation",
  "Traffic",
] as const;

type Context = {
  params: Promise<{
    id: string;
  }>;
};

// ==========================================
// GET SINGLE COMPLAINT
// ==========================================

export async function GET(
  request: Request,
  { params }: Context
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Complaint ID is required.",
        },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const complaint = await Complaint.findById(id).lean();

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
        complaint,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Single Complaint Fetch API Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch complaint.",
      },
      { status: 500 }
    );
  }
}

// ==========================================
// PATCH COMPLAINT
// STATUS / DEPARTMENT / ADMIN ASSIGNMENT
// ==========================================

export async function PATCH(
  request: Request,
  { params }: Context
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Complaint ID is required.",
        },
        { status: 400 }
      );
    }

    const body = await request.json();

    const {
      status,
      department,
      assignedAdminId,
      assignedAdminName,
    } = body;

    // At least one update must be provided
    if (
      !status &&
      !department &&
      !assignedAdminId &&
      !assignedAdminName
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "No update information provided.",
        },
        { status: 400 }
      );
    }

    // Validate status
    if (
      status &&
      !VALID_STATUSES.includes(status)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid complaint status.",
        },
        { status: 400 }
      );
    }

    // Validate department
    if (
      department &&
      !VALID_DEPARTMENTS.includes(department)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid department.",
        },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const complaint = await Complaint.findById(id);

    if (!complaint) {
      return NextResponse.json(
        {
          success: false,
          message: "Complaint not found.",
        },
        { status: 404 }
      );
    }

    // ==========================================
    // DEPARTMENT ASSIGNMENT
    // ==========================================

    if (department) {
      complaint.department = department;
    }

    // ==========================================
    // ADMIN ASSIGNMENT
    // ==========================================

    if (assignedAdminId !== undefined) {
      complaint.assignedAdminId = assignedAdminId;
    }

    if (assignedAdminName !== undefined) {
      complaint.assignedAdminName = assignedAdminName;
    }

    // ==========================================
    // STATUS UPDATE
    // ==========================================

    if (status) {
      const newStatus = status;

      if (complaint.status !== newStatus) {
        complaint.status = newStatus;

        complaint.statusHistory.push({
          status: newStatus,
          timestamp: new Date(),
        });
      }
    }

    // If department/admin is assigned and
    // status is not explicitly provided,
    // automatically mark as Assigned.

    if (
      (department ||
        assignedAdminId ||
        assignedAdminName) &&
      !status &&
      complaint.status !== "Assigned"
    ) {
      complaint.status = "Assigned";

      complaint.statusHistory.push({
        status: "Assigned",
        timestamp: new Date(),
      });
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
    console.error(
      "Complaint Assignment/Update API Error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update complaint.",
      },
      { status: 500 }
    );
  }
}