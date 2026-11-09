
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Complaint from "@/models/Complaint";
import Notification from "@/models/notification";
import Admin from "@/models/Admin";
import { getAdminSession } from "@/lib/adminAuth";
import { getCitizenSession } from "@/lib/citizenAuth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

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

type NotificationType =
  | "STATUS_UPDATE"
  | "COMPLAINT_ASSIGNED"
  | "COMPLAINT_RESOLVED";

function isValidId(id: string) {
  return /^[a-f\d]{24}$/i.test(id);
}

async function createCitizenNotification(
  citizenId: string,
  complaintId: string,
  title: string,
  message: string,
  type: NotificationType
) {
  try {
    if (!citizenId) return;

    await Notification.create({
      citizenId,
      complaintId,
      title,
      message,
      type,
    });
  } catch (error) {
    console.error("Notification creation error:", error);
  }
}

async function getActiveAdmin() {
  const session = await getAdminSession();

  if (!session?.id) return null;

  const admin = await Admin.findById(session.id);

  if (!admin || !admin.isActive) return null;

  return admin;
}

function isDepartmentAllowed(
  admin: any,
  department: string | undefined
) {
  return (
    admin.role === "super-admin" ||
    (!!department && admin.department === department)
  );
}

// GET: Fetch complaint for its owner or an authorized admin.
export async function GET(request: Request, { params }: Context) {
  try {
    const { id } = await params;

    if (!isValidId(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid complaint ID." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const complaint = await Complaint.findById(id).lean();

    if (!complaint) {
      return NextResponse.json(
        { success: false, message: "Complaint not found." },
        { status: 404 }
      );
    }

    const adminSession = await getAdminSession();

    if (adminSession) {
      const admin = await Admin.findById(adminSession.id)
        .select("role department isActive")
        .lean();

      if (!admin || !admin.isActive) {
        return NextResponse.json(
          { success: false, message: "Admin access denied." },
          { status: 403 }
        );
      }

      if (
        admin.role !== "super-admin" &&
        !(
          admin.role === "department-admin" &&
          admin.department === complaint.department
        )
      ) {
        return NextResponse.json(
          { success: false, message: "You are not authorized to access this complaint." },
          { status: 403 }
        );
      }

      return NextResponse.json(
        { success: true, complaint },
        { status: 200 }
      );
    }

    const citizenSession = await getCitizenSession();

    if (
      !citizenSession ||
      citizenSession.citizenId !== complaint.citizenId
    ) {
      return NextResponse.json(
        { success: false, message: "Unauthorized access." },
        { status: 401 }
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

// PATCH: Citizen resolution action or authorized admin update.
export async function PATCH(request: Request, { params }: Context) {
  try {
    const { id } = await params;

    if (!isValidId(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid complaint ID." },
        { status: 400 }
      );
    }

    const body = await request.json();

    await connectToDatabase();

    const complaint = await Complaint.findById(id);

    if (!complaint) {
      return NextResponse.json(
        { success: false, message: "Complaint not found." },
        { status: 404 }
      );
    }

    // CITIZEN: Confirm or reject resolution.
    if (body.citizenAction) {
      const session = await getCitizenSession();

      if (
        !session ||
        session.citizenId !== complaint.citizenId
      ) {
        return NextResponse.json(
          { success: false, message: "Unauthorized citizen." },
          { status: 401 }
        );
      }

      const { citizenAction, feedback, imageUrl } = body;

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
        complaint.citizenResolutionFeedback =
          typeof feedback === "string" ? feedback.trim() : "";
        complaint.citizenResolutionImageUrl =
          typeof imageUrl === "string" ? imageUrl : "";
        complaint.citizenVerifiedAt = new Date();
        complaint.status = "Resolved";

        complaint.statusHistory.push({
          status: "Resolved",
          timestamp: new Date(),
        });
      } else if (citizenAction === "reject") {
        if (
          typeof feedback !== "string" ||
          !feedback.trim()
        ) {
          return NextResponse.json(
            {
              success: false,
              message:
                "Please provide a reason why the problem is not resolved.",
            },
            { status: 400 }
          );
        }

        complaint.citizenResolutionStatus = "Rejected";
        complaint.citizenResolutionFeedback = feedback.trim();
        complaint.citizenResolutionImageUrl =
          typeof imageUrl === "string" ? imageUrl : "";
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

      await createCitizenNotification(
        complaint.citizenId,
        complaint._id.toString(),
        citizenAction === "confirm"
          ? "Complaint Resolved"
          : "Complaint Reopened",
        citizenAction === "confirm"
          ? "Your complaint has been confirmed as resolved."
          : "Your complaint has been moved back to In Progress.",
        citizenAction === "confirm"
          ? "COMPLAINT_RESOLVED"
          : "STATUS_UPDATE"
      );

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

    // ADMIN AUTHENTICATION.
    const admin = await getActiveAdmin();

    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized admin access." },
        { status: 401 }
      );
    }

    // DEPARTMENT ACCESS CONTROL.
    if (!isDepartmentAllowed(admin, complaint.department)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "You are not authorized to access this department's complaint.",
        },
        { status: 403 }
      );
    }

    // ADMIN: Submit completed work for citizen verification.
    if (body.submitForVerification === true) {
      const { resolutionDescription } = body;

      if (complaint.status !== "In Progress") {
        return NextResponse.json(
          {
            success: false,
            message:
              "Only In Progress complaints can be submitted for verification.",
          },
          { status: 400 }
        );
      }

      if (
        typeof resolutionDescription !== "string" ||
        !resolutionDescription.trim()
      ) {
        return NextResponse.json(
          {
            success: false,
            message: "Please describe the work completed.",
          },
          { status: 400 }
        );
      }

      complaint.resolutionDescription =
        resolutionDescription.trim();
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

      await createCitizenNotification(
        complaint.citizenId,
        complaint._id.toString(),
        "Action Required",
        "The department has submitted completed work. Please verify your complaint.",
        "STATUS_UPDATE"
      );

      return NextResponse.json(
        {
          success: true,
          message: "Complaint submitted for citizen verification.",
          complaint,
        },
        { status: 200 }
      );
    }

    // ADMIN: Update department, assignment, or normal status.
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

    if (status === "Resolved") {
      return NextResponse.json(
        {
          success: false,
          message: "Only the citizen can confirm resolution.",
        },
        { status: 403 }
      );
    }

    if (
      status &&
      !(ADMIN_STATUSES as readonly string[]).includes(status)
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid complaint status." },
        { status: 400 }
      );
    }

    if (
      department &&
      !(VALID_DEPARTMENTS as readonly string[]).includes(department)
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid department." },
        { status: 400 }
      );
    }

    if (
      department &&
      admin.role !== "super-admin" &&
      department !== admin.department
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "You cannot transfer complaints to another department.",
        },
        { status: 403 }
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
          message:
            "Wait for the citizen to verify the resolution.",
        },
        { status: 400 }
      );
    }

    const previousStatus = complaint.status;

    const assignmentChanged =
      (department !== undefined &&
        department !== complaint.department) ||
      (assignedAdminId !== undefined &&
        assignedAdminId !== complaint.assignedAdminId) ||
      (assignedAdminName !== undefined &&
        assignedAdminName !== complaint.assignedAdminName);

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
      (department ||
        assignedAdminId !== undefined ||
        assignedAdminName !== undefined) &&
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

    if (
      complaint.status !== previousStatus ||
      assignmentChanged
    ) {
      const isAssigned =
        complaint.status === "Assigned" || assignmentChanged;

      await createCitizenNotification(
        complaint.citizenId,
        complaint._id.toString(),
        isAssigned
          ? "Complaint Assigned"
          : "Complaint Status Updated",
        isAssigned
          ? `Your complaint has been assigned to ${
              complaint.department || "a department"
            }.`
          : `Your complaint status has been updated to ${complaint.status}.`,
        isAssigned
          ? "COMPLAINT_ASSIGNED"
          : "STATUS_UPDATE"
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
    console.error("Complaint PATCH API Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update complaint.",
      },
      { status: 500 }
    );
  }
}
