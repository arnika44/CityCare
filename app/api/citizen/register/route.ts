import { NextResponse } from "next/server";
import { randomUUID, pbkdf2Sync, randomBytes } from "crypto";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    await connectToDatabase();

    const { name, email, phone, password } = await request.json();

    if (!name || !email || !phone || !password) {
      return NextResponse.json(
        { message: "All fields are required." },
        { status: 400 }
      );
    }

    if (!/^\d{10}$/.test(phone)) {
      return NextResponse.json(
        { message: "Enter a valid 10-digit phone number." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: "Password must contain at least 6 characters." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "An account with this email already exists." },
        { status: 409 }
      );
    }

    const salt = randomBytes(16).toString("hex");
    const hash = pbkdf2Sync(password, salt, 100000, 64, "sha512").toString("hex");

    const user = await User.create({
      citizenId: randomUUID(),
      name: name.trim(),
      email: normalizedEmail,
      phone,
      passwordHash: `${salt}:${hash}`,
    });

    return NextResponse.json(
      {
        message: "Registration successful.",
        citizenId: user.citizenId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Citizen registration error:", error);

    return NextResponse.json(
      { message: "Registration failed. Please try again." },
      { status: 500 }
    );
  }
}