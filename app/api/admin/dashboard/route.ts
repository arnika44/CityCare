
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
      departmentStats,
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

    const departments: Record<string, number> = {
      PWD: 0,
      Water: 0,
      Electricity: 0,
      Sanitation: 0,
      Traffic: 0,
    };

    departmentStats.forEach((item) => {
      if (item._id && item._id in departments) {
        departments[item._id] = item.count;
      }
    });

    const recent = recentComplaints.map((item: any) => ({
      _id: String(item._id),
      category: item.category || "Other",
      status: item.status || "Reported",
      department: item.department || "Not Assigned",
      createdAt: item.createdAt || null,
      location: item.location?.address || "Location unavailable",
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

      departments,
      recentComplaints: recent,
    });
  } catch (error) {
    console.error("Admin Dashboard API Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch dashboard data.",
      },
      { status: 500 }
    );
  }
}
