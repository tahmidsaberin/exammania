import { Router, Request, Response } from "express";
import { PrismaClient, AcademicLevel } from "@prisma/client";

const divisionsRouter = Router();
const prisma = new PrismaClient();

const VALID_LEVELS = ["SSC", "HSC"] as const;

divisionsRouter.get("/", async (req: Request, res: Response) => {
  const rawLevel = req.query.level;
  const level = typeof rawLevel === "string" ? rawLevel.toUpperCase() : undefined;
  if (level && !VALID_LEVELS.includes(level as any)) {
    res.status(400).json({ success: false, error: "Invalid academic level" });
    return;
  }

  const divisions = await prisma.division.findMany({
    where: level ? { level: level as AcademicLevel } : undefined,
    orderBy: { name: "asc" },
    include: { _count: { select: { subjects: true, exams: true } } },
  });
  res.json({ success: true, data: divisions });
});

divisionsRouter.get("/:slug/subjects", async (req: Request, res: Response) => {
  const { slug } = req.params;
  const division = await prisma.division.findUnique({ where: { slug } });
  if (!division) { res.status(404).json({ success: false, error: "Division not found" }); return; }
  const subjects = await prisma.subject.findMany({
    where: {
      OR: [
        { divisionId: division.id },
        { isCommon: true, level: division.level },
      ],
    },
    orderBy: [{ isCommon: "asc" }, { name: "asc" }],
    include: { _count: { select: { exams: true } } },
  });
  res.json({ success: true, data: { division, subjects } });
});

export { divisionsRouter };
