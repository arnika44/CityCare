
import { NextResponse } from "next/server";
import connectDB from "@/app/lib/mongodb";
import Complaint from "@/app/models/Complaint";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectDB();

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
      departments: departments.map((item) => ({
        name: item._id || "Unassigned",
        count: item.count,
      })),
      recentComplaints,
    });
  } catch (error) {
    console.error("ADMIN DASHBOARD ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch dashboard data.",
        error:
          error instanceof Error ? error.message : "Unknown server error",
      },
      { status: 500 }
    );
  }
}
