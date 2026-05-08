// src/routes/auth.ts
import { Router, Request, Response } from "express";
import { z } from "zod";
import { verifyGoogleToken, findOrCreateUser, signJwt, cookieOptions } from "../services/authService";
import { authenticate } from "../middleware/auth";
import { AuthRequest } from "../types";
import { authLimiter } from "../middleware/rateLimiter";

const authRouter = Router();
authRouter.post("/google", authLimiter, async (req: Request, res: Response) => {
  const { idToken } = z.object({ idToken: z.string().min(1) }).parse(req.body);
  const googleUser = await verifyGoogleToken(idToken);
  const user = await findOrCreateUser(googleUser);
  const token = signJwt(user);
  res.cookie("token", token, cookieOptions).json({ success: true, data: { id: user.id, email: user.email, name: user.name, avatarUrl: user.avatarUrl, role: user.role } });
});
authRouter.post("/logout", (_req: Request, res: Response) => { res.clearCookie("token", { path: "/" }).json({ success: true }); });
authRouter.get("/me", authenticate, (req: AuthRequest, res: Response) => {
  const u = req.user!;
  res.json({ success: true, data: { id: u.id, email: u.email, name: u.name, avatarUrl: u.avatarUrl, role: u.role } });
});
export { authRouter };
