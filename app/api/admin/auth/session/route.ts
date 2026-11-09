
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Admin from "@/models/Admin";
import { getAdminSession } from "@/lib/adminAuth";

export async function GET() {
  try {
    const session = await getAdminSession();

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const admin = await Admin.findOne({
      _id: session.id,
      isActive: true,
    }).select("fullName email role department");

    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Admin account is inactive." },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      admin: {
        fullName: admin.fullName,
        email: admin.email,
        role: admin.role,
        department: admin.department,
      },
    });
  } catch (error) {
    console.error("ADMIN SESSION ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Session verification failed." },
      { status: 500 }
    );
  }
}
