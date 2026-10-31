import { NextResponse } from "next/server";
import { pbkdf2Sync, timingSafeEqual } from "crypto";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    await connectToDatabase();

    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required." },
        { status: 400 }
      );
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    });

    if (!user) {
      return NextResponse.json(
        { message: "Invalid email or password." },
        { status: 401 }
      );
    }

    const [salt, storedHash] = user.passwordHash.split(":");

    if (!salt || !storedHash) {
      return NextResponse.json(
        { message: "Invalid account credentials." },
        { status: 401 }
      );
    }

    const enteredHash = pbkdf2Sync(
      password,
      salt,
      100000,
      64,
      "sha512"
    );

    const savedHash = Buffer.from(storedHash, "hex");

    if (
      savedHash.length !== enteredHash.length ||
      !timingSafeEqual(savedHash, enteredHash)
    ) {
      return NextResponse.json(
        { message: "Invalid email or password." },
        { status: 401 }
      );
    }

    return NextResponse.json({
      message: "Login successful.",
      citizenId: user.citizenId,
      name: user.name,
      email: user.email,
    });
  } catch (error) {
    console.error("Citizen login error:", error);

    return NextResponse.json(
      { message: "Login failed. Please try again." },
      { status: 500 }
    );
  }
}