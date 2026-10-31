
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Complaint from "@/models/Complaint";

const ADMIN_STATUSES = [
  "Reported",
  "Verified",
  "Assigned",
  "In Progress",
] as const;

const VALID_DEPARTMENTS = [
  "PWD",
  "Water",
  "Electricity",
  "Sanitation",
  "Traffic",
] as const;

type Context = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, { params }: Context) {
  try {
    const { id } = await params;

    await connectToDatabase();

    const complaint = await Complaint.findById(id).lean();

    if (!complaint) {
      return NextResponse.json(
        { success: false, message: "Complaint not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, complaint },
      { status: 200 }
    );
  } catch (error) {
    console.error("Complaint Details GET API Error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to fetch complaint." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request, { params }: Context) {
  try {
    const { id } = await params;
    const body = await request.json();

    await connectToDatabase();

    const complaint = await Complaint.findById(id);

    if (!complaint) {
      return NextResponse.json(
        { success: false, message: "Complaint not found." },
        { status: 404 }
      );
    }

    // CITIZEN: Confirm or reject resolution
    if (body.citizenAction) {
      const {
        citizenAction,
        citizenId,
        feedback,
        imageUrl,
      } = body;

      if (citizenId !== complaint.citizenId) {
        return NextResponse.json(
          { success: false, message: "Unauthorized citizen." },
          { status: 403 }
        );
      }

      if (complaint.status !== "Awaiting Citizen Verification") {
        return NextResponse.json(
          {
            success: false,
            message: "This complaint is not awaiting verification.",
          },
          { status: 400 }
        );
      }

      if (citizenAction === "confirm") {
        complaint.citizenResolutionStatus = "Confirmed";
        complaint.citizenResolutionFeedback = feedback || "";
        complaint.citizenResolutionImageUrl = imageUrl || "";
        complaint.citizenVerifiedAt = new Date();
        complaint.status = "Resolved";

        complaint.statusHistory.push({
          status: "Resolved",
          timestamp: new Date(),
        });
      } else if (citizenAction === "reject") {
        if (!feedback || !feedback.trim()) {
          return NextResponse.json(
            {
              success: false,
              message: "Please provide a reason why the problem is not resolved.",
            },
            { status: 400 }
          );
        }

        complaint.citizenResolutionStatus = "Rejected";
        complaint.citizenResolutionFeedback = feedback;
        complaint.citizenResolutionImageUrl = imageUrl || "";
        complaint.citizenVerifiedAt = new Date();
        complaint.status = "In Progress";

        complaint.statusHistory.push({
          status: "In Progress",
          timestamp: new Date(),
        });
      } else {
        return NextResponse.json(
          { success: false, message: "Invalid citizen action." },
          { status: 400 }
        );
      }

      await complaint.save();

      return NextResponse.json(
        {
          success: true,
          message:
            citizenAction === "confirm"
              ? "Complaint marked as resolved successfully."
              : "Complaint returned to In Progress.",
          complaint,
        },
        { status: 200 }
      );
    }

    // ADMIN: Submit completed work for citizen verification
    if (body.submitForVerification === true) {
      const { resolutionDescription } = body;

      if (complaint.status !== "In Progress") {
        return NextResponse.json(
          {
            success: false,
            message: "Only In Progress complaints can be submitted for verification.",
          },
          { status: 400 }
        );
      }

      if (!resolutionDescription || !resolutionDescription.trim()) {
        return NextResponse.json(
          {
            success: false,
            message: "Please describe the work completed.",
          },
          { status: 400 }
        );
      }

      complaint.resolutionDescription = resolutionDescription.trim();
      complaint.resolutionSubmittedAt = new Date();
      complaint.citizenResolutionStatus = "Pending";
      complaint.citizenResolutionFeedback = "";
      complaint.citizenResolutionImageUrl = "";
      complaint.citizenVerifiedAt = undefined;

      complaint.status = "Awaiting Citizen Verification";

      complaint.statusHistory.push({
        status: "Awaiting Citizen Verification",
        timestamp: new Date(),
      });

      await complaint.save();

      return NextResponse.json(
        {
          success: true,
          message: "Complaint submitted for citizen verification.",
          complaint,
        },
        { status: 200 }
      );
    }

    // ADMIN: Update department, assignment, or normal status
    const {
      status,
      department,
      assignedAdminId,
      assignedAdminName,
    } = body;

    if (
      !status &&
      !department &&
      assignedAdminId === undefined &&
      assignedAdminName === undefined
    ) {
      return NextResponse.json(
        { success: false, message: "No update data provided." },
        { status: 400 }
      );
    }

    // Admin cannot directly mark a complaint as Resolved
    if (status === "Resolved") {
      return NextResponse.json(
        {
          success: false,
          message: "Only the citizen can confirm resolution.",
        },
        { status: 403 }
      );
    }

    if (status && !ADMIN_STATUSES.includes(status)) {
      return NextResponse.json(
        { success: false, message: "Invalid complaint status." },
        { status: 400 }
      );
    }

    if (department && !VALID_DEPARTMENTS.includes(department)) {
      return NextResponse.json(
        { success: false, message: "Invalid department." },
        { status: 400 }
      );
    }

    if (complaint.status === "Resolved") {
      return NextResponse.json(
        {
          success: false,
          message: "Resolved complaints cannot be modified.",
        },
        { status: 400 }
      );
    }

    if (complaint.status === "Awaiting Citizen Verification") {
      return NextResponse.json(
        {
          success: false,
          message: "Wait for the citizen to verify the resolution.",
        },
        { status: 400 }
      );
    }

    if (department) {
      complaint.department = department;
    }

    if (assignedAdminId !== undefined) {
      complaint.assignedAdminId = assignedAdminId;
    }

    if (assignedAdminName !== undefined) {
      complaint.assignedAdminName = assignedAdminName;
    }

    if (status && complaint.status !== status) {
      complaint.status = status;

      complaint.statusHistory.push({
        status,
        timestamp: new Date(),
      });
    }

    if (
      (department || assignedAdminId !== undefined || assignedAdminName !== undefined) &&
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
    console.error("Complaint PATCH API Error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to update complaint." },
      { status: 500 }
    );
  }
}
