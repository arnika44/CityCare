
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const citizenId = searchParams.get("citizenId");

    if (!citizenId) {
      return NextResponse.json(
        { message: "Citizen ID is required." },
        { status: 400 }
      );
    }

    const user = await User.findOne({ citizenId }).select(
      "-passwordHash -_id -__v"
    );

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
    await connectToDatabase();

    const body = await request.json();
    const {
      citizenId,
      name,
      phone,
      address,
      pinCode,
      cityDistrict,
      state,
      profileImage,
    } = body;

    if (!citizenId || !name || !phone || !address) {
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

    const user = await User.findOneAndUpdate(
      { citizenId },
      {
        name: name.trim(),
        phone,
        address: address.trim(),
        pinCode: pinCode || "",
        cityDistrict: cityDistrict || "",
        state: state || "",
        profileImage: profileImage || "",
      },
      { new: true, runValidators: true }
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
