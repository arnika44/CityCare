
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Complaint from "@/models/Complaint";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectToDatabase();

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
      Complaint.countDocuments(),
      Complaint.countDocuments({ status: "Reported" }),
      Complaint.countDocuments({ status: "Verified" }),
      Complaint.countDocuments({ status: "Assigned" }),
      Complaint.countDocuments({ status: "In Progress" }),
      Complaint.countDocuments({ status: "Resolved" }),

      Complaint.aggregate([
        {
          $group: {
            _id: "$department",
            count: { $sum: 1 },
          },
        },
      ]),

      Complaint.find()
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

    const formattedComplaints = recentComplaints.map((item: any) => ({
      _id: item._id.toString(),
      category: item.category,
      status: item.status,
      department: item.department || "",
      createdAt: item.createdAt,
      location: item.location?.address || "",
    }));

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
        error:
          error instanceof Error
            ? error.message
            : "Unknown server error",
      },
      { status: 500 }
    );
  }
}
