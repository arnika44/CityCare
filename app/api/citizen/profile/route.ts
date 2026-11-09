
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import { getCitizenSession } from "@/lib/citizenAuth";

export const runtime = "nodejs";

const isValidImageUrl = (value: unknown) => {
  if (value === undefined || value === null || value === "") return true;

  if (typeof value !== "string" || value.length > 2000) return false;

  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
};

export async function GET() {
  try {
    const session = await getCitizenSession();

    if (!session) {
      return NextResponse.json(
        { message: "Please login to access your profile." },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const user = await User.findOne({
      citizenId: session.citizenId,
      email: session.email,
    }).select("-passwordHash -_id -__v");

    if (!user) {
      return NextResponse.json(
        { message: "Citizen profile not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Profile fetch error:", error);

    return NextResponse.json(
      { message: "Unable to fetch profile." },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getCitizenSession();

    if (!session) {
      return NextResponse.json(
        { message: "Please login to update your profile." },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const body = await request.json();

    const {
      name,
      phone,
      address,
      pinCode,
      cityDistrict,
      state,
      profileImage,
    } = body;

    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof phone !== "string" ||
      typeof address !== "string" ||
      !address.trim()
    ) {
      return NextResponse.json(
        { message: "Name, phone and address are required." },
        { status: 400 }
      );
    }

    if (!/^\d{10}$/.test(phone)) {
      return NextResponse.json(
        { message: "Enter a valid 10-digit phone number." },
        { status: 400 }
      );
    }

    if (
      (pinCode !== undefined && typeof pinCode !== "string") ||
      (cityDistrict !== undefined && typeof cityDistrict !== "string") ||
      (state !== undefined && typeof state !== "string")
    ) {
      return NextResponse.json(
        { message: "Invalid address details." },
        { status: 400 }
      );
    }

    if (!isValidImageUrl(profileImage)) {
      return NextResponse.json(
        { message: "Invalid profile image URL." },
        { status: 400 }
      );
    }

    const user = await User.findOneAndUpdate(
      {
        citizenId: session.citizenId,
        email: session.email,
      },
      {
        name: name.trim(),
        phone,
        address: address.trim(),
        pinCode: pinCode?.trim() || "",
        cityDistrict: cityDistrict?.trim() || "",
        state: state?.trim() || "",
        profileImage: profileImage || "",
      },
      {
        new: true,
        runValidators: true,
      }
    ).select("-passwordHash -_id -__v");

    if (!user) {
      return NextResponse.json(
        { message: "Citizen profile not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Profile updated successfully.",
      user,
    });
  } catch (error) {
    console.error("Profile update error:", error);

    return NextResponse.json(
      { message: "Unable to update profile." },
      { status: 500 }
    );
  }
}
