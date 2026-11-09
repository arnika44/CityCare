
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const COOKIE_NAME = "citycare-admin-session";

function getSecret() {
  const value = process.env.ADMIN_JWT_SECRET;

  if (!value || value.length < 32) {
    throw new Error("ADMIN_JWT_SECRET must be at least 32 characters.");
  }

  return new TextEncoder().encode(value);
}

export async function createAdminToken(admin: {
  _id: unknown;
  email: string;
  role: string;
}) {
  return new SignJWT({
    email: admin.email,
    role: admin.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(admin._id))
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(getSecret());
}

export async function setAdminCookie(token: string) {
  const cookieStore = await cookies();

  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
}

export async function getAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSecret());

    if (!payload.sub || !payload.role || !payload.email) {
      return null;
    }

    return {
      id: payload.sub,
      email: String(payload.email),
      role: String(payload.role),
    };
  } catch {
    return null;
  }
}

export async function clearAdminCookie() {
  const cookieStore = await cookies();

  cookieStore.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });
}
