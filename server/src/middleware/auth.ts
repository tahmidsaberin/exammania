import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { env } from "../config/env";
import { AuthRequest, JwtPayload } from "../types";
import { logger } from "../utils/logger";

const prisma = new PrismaClient();

export async function authenticate(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  const token = req.cookies?.token as string | undefined;
  if (!token) { res.status(401).json({ success: false, error: "Not authenticated" }); return; }
  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) { res.status(401).json({ success: false, error: "User not found" }); return; }
    req.user = user;
    next();
  } catch (err) {
    logger.warn("JWT failed", { error: (err as Error).message });
    res.status(401).json({ success: false, error: "Invalid or expired token" });
  }
}

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction): void {
  if (req.user?.role !== "ADMIN") { res.status(403).json({ success: false, error: "Admin access required" }); return; }
  next();
}
