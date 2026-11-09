
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const CITIZEN_COOKIE_NAME = "citycare-citizen-session";

function getSecret() {
  const secret = process.env.CITIZEN_JWT_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error("CITIZEN_JWT_SECRET must contain at least 32 characters.");
  }

  return new TextEncoder().encode(secret);
}

export async function createCitizenToken(
  citizenId: string,
  email: string
) {
  return new SignJWT({ email })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(citizenId)
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(getSecret());
}

export async function setCitizenCookie(
  response: NextResponse,
  token: string
) {
  response.cookies.set(CITIZEN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 8 * 60 * 60,
  });
}

export async function getCitizenSession() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(CITIZEN_COOKIE_NAME)?.value;

    if (!token) return null;

    const { payload } = await jwtVerify(token, getSecret());

    if (
      typeof payload.sub !== "string" ||
      typeof payload.email !== "string"
    ) {
      return null;
    }

    return {
      citizenId: payload.sub,
      email: payload.email,
    };
  } catch {
    return null;
  }
}

export async function clearCitizenCookie(response: NextResponse) {
  response.cookies.set(CITIZEN_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });
}
