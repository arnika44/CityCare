import { NextResponse } from "next/server";
import { pbkdf2Sync, timingSafeEqual } from "crypto";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import {
  createCitizenToken,
  setCitizenCookie,
} from "@/lib/citizenAuth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const email =
      typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "";

    const password =
      typeof body.password === "string" ? body.password : "";

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required." },
        { status: 400 }
      );
    }

    if (password.length > 128) {
      return NextResponse.json(
        { message: "Invalid email or password." },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const user = await User.findOne({ email });

    if (!user || typeof user.passwordHash !== "string") {
      return NextResponse.json(
        { message: "Invalid email or password." },
        { status: 401 }
      );
    }

    const parts = user.passwordHash.split(":");

    if (
      parts.length !== 2 ||
      !/^[a-f0-9]{32}$/i.test(parts[0]) ||
      !/^[a-f0-9]{128}$/i.test(parts[1])
    ) {
      return NextResponse.json(
        { message: "Invalid account credentials." },
        { status: 401 }
      );
    }

    const [salt, storedHash] = parts;

    const enteredHash = pbkdf2Sync(
      password,
      salt,
      100000,
      64,
      "sha512"
    );

    const savedHash = Buffer.from(storedHash, "hex");

    if (!timingSafeEqual(savedHash, enteredHash)) {
      return NextResponse.json(
        { message: "Invalid email or password." },
        { status: 401 }
      );
    }

    const token = await createCitizenToken(
      user.citizenId,
      user.email
    );

    const response = NextResponse.json({
      message: "Login successful.",
      citizenId: user.citizenId,
      name: user.name,
      email: user.email,
    });

    await setCitizenCookie(response, token);

    return response;
  } catch (error) {
    console.error("Citizen login error:", error);

    return NextResponse.json(
      { message: "Login failed. Please try again." },
      { status: 500 }
    );
  }
}