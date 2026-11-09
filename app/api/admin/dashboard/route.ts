
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getAdminSession } from "@/lib/adminAuth";
import Admin from "@/models/Admin";
import Complaint from "@/models/Complaint";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getAdminSession();

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Please login." },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const admin = await Admin.findById(session.id)
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
      admin.role !== "department-admin"
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid admin role." },
        { status: 403 }
      );
    }

    if (
      admin.role === "department-admin" &&
      !admin.department
    ) {
      return NextResponse.json(
        { success: false, message: "Department not assigned." },
        { status: 403 }
      );
    }

    const complaintFilter =
      admin.role === "department-admin"
        ? { department: admin.department }
        : {};

    const [
      total,
      reported,
      verified,
      assigned,
      inProgress,
      resolved,
      departments,
      recentComplaints,
    ] = await Promise.all([
      Complaint.countDocuments(complaintFilter),

      Complaint.countDocuments({
        ...complaintFilter,
        status: "Reported",
      }),

      Complaint.countDocuments({
        ...complaintFilter,
        status: "Verified",
      }),

      Complaint.countDocuments({
        ...complaintFilter,
        status: "Assigned",
      }),

      Complaint.countDocuments({
        ...complaintFilter,
        status: "In Progress",
      }),

      Complaint.countDocuments({
        ...complaintFilter,
        status: "Resolved",
      }),

      Complaint.aggregate([
        { $match: complaintFilter },
        {
          $group: {
            _id: "$department",
            count: { $sum: 1 },
          },
        },
      ]),

      Complaint.find(complaintFilter)
        .select("category status department createdAt location")
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
    ]);

    const formattedDepartments = departments.map(
      (item: { _id: string | null; count: number }) => ({
        name: item._id || "Unassigned",
        count: item.count,
      })
    );

    const formattedComplaints = recentComplaints.map(
      (item: any) => ({
        _id: item._id.toString(),
        category: item.category,
        status: item.status,
        department: item.department || "",
        createdAt: item.createdAt,
        location: item.location?.address || "",
      })
    );

    return NextResponse.json({
      success: true,
      stats: {
        total,
        pending: reported + verified,
        reported,
        verified,
        assigned,
        inProgress,
        resolved,
      },
      departments: formattedDepartments,
      recentComplaints: formattedComplaints,
    });
  } catch (error) {
    console.error("ADMIN DASHBOARD ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch dashboard data.",
      },
      { status: 500 }
    );
  }
}
