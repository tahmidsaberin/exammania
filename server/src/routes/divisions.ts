import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const divisionsRouter = Router();
const prisma = new PrismaClient();

divisionsRouter.get("/", async (_req: Request, res: Response) => {
  const divisions = await prisma.division.findMany({
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
    where: { OR: [{ divisionId: division.id }, { isCommon: true }] },
    orderBy: [{ isCommon: "asc" }, { name: "asc" }],
    include: { _count: { select: { exams: true } } },
  });
  res.json({ success: true, data: { division, subjects } });
});

export { divisionsRouter };
