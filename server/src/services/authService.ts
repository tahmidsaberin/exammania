import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { env } from "../config/env";
import { JwtPayload } from "../types";
import { logger } from "../utils/logger";

const googleClient = new OAuth2Client(env.GOOGLE_CLIENT_ID);
const prisma = new PrismaClient();

export interface GoogleUserInfo {
  googleId: string;
  email: string;
  name: string;
  avatarUrl?: string;
}

export async function verifyGoogleToken(idToken: string): Promise<GoogleUserInfo> {
  const ticket = await googleClient.verifyIdToken({ idToken, audience: env.GOOGLE_CLIENT_ID });
  const payload = ticket.getPayload();
  if (!payload?.sub || !payload.email) throw new Error("Invalid Google token");
  return { googleId: payload.sub, email: payload.email, name: payload.name ?? payload.email, avatarUrl: payload.picture };
}

export async function findOrCreateUser(info: GoogleUserInfo) {
  const user = await prisma.user.upsert({
    where: { googleId: info.googleId },
    update: { name: info.name, avatarUrl: info.avatarUrl },
    create: { googleId: info.googleId, email: info.email, name: info.name, avatarUrl: info.avatarUrl },
  });
  logger.info("User authenticated", { userId: user.id });
  return user;
}

export function signJwt(user: { id: string; email: string; role: string }): string {
  const payload: JwtPayload = { sub: user.id, email: user.email, role: user.role };
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: "1d" });
}

export const cookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: env.NODE_ENV === "production" ? "none" as const : "lax" as const,
  maxAge: 24 * 60 * 60 * 1000,
  path: "/",
};
