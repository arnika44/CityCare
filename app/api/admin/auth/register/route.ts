
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/mongodb";
import Admin from "@/models/Admin";
import { getAdminSession } from "@/lib/adminAuth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const fullName = String(body.fullName || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    const role = body.role;
    const department = String(body.department || "").trim();
    const setupKey = String(body.setupKey || "");

    if (!fullName || !email || !password) {
      return NextResponse.json(
        { success: false, message: "Please fill all required fields." },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { success: false, message: "Password must be at least 8 characters." },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { success: false, message: "Enter a valid email address." },
        { status: 400 }
      );
    }

    if (!["super-admin", "department-admin"].includes(role)) {
      return NextResponse.json(
        { success: false, message: "Invalid admin role." },
        { status: 400 }
      );
    }

    if (role === "department-admin" && !department) {
      return NextResponse.json(
        { success: false, message: "Please select a department." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const adminCount = await Admin.countDocuments();

    let finalRole = role;
    let finalDepartment = role === "department-admin" ? department : "";

    if (adminCount === 0) {
      const expectedKey = process.env.ADMIN_SETUP_KEY;

      if (!expectedKey || setupKey !== expectedKey) {
        return NextResponse.json(
          { success: false, message: "Invalid setup key." },
          { status: 403 }
        );
      }

      // The first administrator must be the Super Admin.
      finalRole = "super-admin";
      finalDepartment = "";
    } else {
      const session = await getAdminSession();

      if (!session || session.role !== "super-admin") {
        return NextResponse.json(
          {
            success: false,
            message: "Only a logged-in Super Admin can create accounts.",
          },
          { status: 403 }
        );
      }
    }

    const existingAdmin = await Admin.findOne({ email });

    if (existingAdmin) {
      return NextResponse.json(
        { success: false, message: "An account with this email already exists." },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const admin = await Admin.create({
      fullName,
      email,
      passwordHash,
      role: finalRole,
      department: finalDepartment,
      isActive: true,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Admin account created successfully.",
        admin: {
          id: admin._id.toString(),
          fullName: admin.fullName,
          email: admin.email,
          role: admin.role,
          department: admin.department,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("ADMIN REGISTER ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Unable to create admin account." },
      { status: 500 }
    );
  }
}
