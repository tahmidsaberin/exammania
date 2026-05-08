import { Router, Request, Response } from "express";
import { PrismaClient, QuestionType } from "@prisma/client";
import { z } from "zod";
import multer from "multer";
import { authenticate, requireAdmin } from "../middleware/auth";
import { AuthRequest } from "../types";
import * as examSvc from "../services/examService";
import * as adminSvc from "../services/adminService";

const prisma = new PrismaClient();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

// ─── Exams ───────────────────────────────────────────────

export const examsRouter = Router();

examsRouter.get("/:slug/exams", async (req: Request, res: Response) => {
  const subject = await prisma.subject.findUnique({ where: { slug: req.params.slug } });
  if (!subject) { res.status(404).json({ success: false, error: "Subject not found" }); return; }
  const exams = await prisma.exam.findMany({
    where: { subjectId: subject.id, published: true },
    include: { division: true, _count: { select: { questions: true, attempts: true } } },
    orderBy: { createdAt: "desc" },
  });
  res.json({ success: true, data: { subject, exams } });
});

examsRouter.get("/:slug", async (req: Request, res: Response) => {
  const exam = await examSvc.getExamBySlug(req.params.slug);
  const sanitized = {
    ...exam,
    questions: exam.questions.map((q) => ({ id: q.id, order: q.order, type: q.type, text: q.text, options: q.options, marks: q.marks })),
  };
  res.json({ success: true, data: sanitized });
});

examsRouter.post("/:slug/start", authenticate, async (req: AuthRequest, res: Response) => {
  const attempt = await examSvc.startAttempt(req.user!.id, req.params.slug);
  res.status(201).json({ success: true, data: attempt });
});

// ─── Attempts ────────────────────────────────────────────

export const attemptsRouter = Router();
attemptsRouter.use(authenticate);

attemptsRouter.get("/:id", async (req: AuthRequest, res: Response) => {
  const attempt = await prisma.attempt.findUnique({
    where: { id: req.params.id },
    include: { answers: true, exam: { include: { questions: true } } },
  });
  if (!attempt) { res.status(404).json({ success: false, error: "Not found" }); return; }
  if (attempt.userId !== req.user!.id) { res.status(403).json({ success: false, error: "Forbidden" }); return; }
  const sanitized = {
    ...attempt,
    exam: {
      ...attempt.exam,
      questions: attempt.exam.questions.map((q) => ({ id: q.id, order: q.order, type: q.type, text: q.text, options: q.options, marks: q.marks })),
    },
  };
  res.json({ success: true, data: sanitized });
});

attemptsRouter.put("/:id/save", async (req: AuthRequest, res: Response) => {
  const payload = z.object({ questionId: z.string(), answer: z.string().min(1) }).parse(req.body);
  const saved = await examSvc.saveAnswer(req.params.id, req.user!.id, payload);
  res.json({ success: true, data: saved });
});

attemptsRouter.post("/:id/submit", async (req: AuthRequest, res: Response) => {
  const result = await examSvc.submitAttempt(req.params.id, req.user!.id);
  res.json({ success: true, data: result });
});

attemptsRouter.get("/:id/result", async (req: AuthRequest, res: Response) => {
  const result = await examSvc.getAttemptResult(req.params.id, req.user!.id, req.user!.role === "ADMIN");
  res.json({ success: true, data: result });
});

// ─── Users ───────────────────────────────────────────────

export const usersRouter = Router();
usersRouter.use(authenticate);

usersRouter.get("/me", (req: AuthRequest, res: Response) => {
  const u = req.user!;
  res.json({ success: true, data: { id: u.id, email: u.email, name: u.name, avatarUrl: u.avatarUrl, role: u.role, createdAt: u.createdAt } });
});

usersRouter.get("/:id/history", async (req: AuthRequest, res: Response) => {
  const history = await examSvc.getUserHistory(req.user!.id, req.params.id, req.user!.role === "ADMIN");
  res.json({ success: true, data: history });
});

// ─── Admin ───────────────────────────────────────────────

export const adminRouter = Router();
adminRouter.use(authenticate, requireAdmin);

const divSchema = z.object({ slug: z.string().regex(/^[a-z0-9-]+$/), name: z.string().min(1), namebn: z.string().optional() });
const subSchema = z.object({ slug: z.string().regex(/^[a-z0-9-]+$/), name: z.string().min(1), namebn: z.string().optional(), divisionId: z.string().optional(), isCommon: z.boolean().optional() });
const examSchema = z.object({ title: z.string().min(1), titlebn: z.string().optional(), slug: z.string().regex(/^[a-z0-9-]+$/), divisionId: z.string().optional(), subjectId: z.string(), timeLimitMin: z.number().int().min(1).max(300).optional(), randomize: z.boolean().optional(), published: z.boolean().optional() });
const qSchema = z.object({ order: z.number().int().min(1), type: z.nativeEnum(QuestionType), text: z.string().min(1), options: z.array(z.string()).optional(), correct: z.string().optional(), marks: z.number().int().min(1).optional() });

adminRouter.get("/analytics", async (_req, res) => { res.json({ success: true, data: await adminSvc.getAnalytics() }); });
adminRouter.get("/users", async (_req, res) => { res.json({ success: true, data: await prisma.user.findMany({ orderBy: { createdAt: "desc" }, include: { _count: { select: { attempts: true } } } }) }); });
adminRouter.get("/users/:id/history", async (req: AuthRequest, res: Response) => { const history = await examSvc.getUserHistory(req.user!.id, req.params.id, true); res.json({ success: true, data: history }); });

adminRouter.post("/divisions", async (req: AuthRequest, res: Response) => { const d = divSchema.parse(req.body); const div = await adminSvc.createDivision(d); await adminSvc.auditLog(req.user!.id, "CREATE", "Division", div.id); res.status(201).json({ success: true, data: div }); });
adminRouter.put("/divisions/:id", async (req: AuthRequest, res: Response) => { const d = divSchema.partial().parse(req.body); const div = await adminSvc.updateDivision(req.params.id, d); await adminSvc.auditLog(req.user!.id, "UPDATE", "Division", req.params.id); res.json({ success: true, data: div }); });
adminRouter.delete("/divisions/:id", async (req: AuthRequest, res: Response) => { await adminSvc.deleteDivision(req.params.id); await adminSvc.auditLog(req.user!.id, "DELETE", "Division", req.params.id); res.json({ success: true }); });

adminRouter.post("/subjects", async (req: AuthRequest, res: Response) => { const d = subSchema.parse(req.body); const s = await adminSvc.createSubject(d); await adminSvc.auditLog(req.user!.id, "CREATE", "Subject", s.id); res.status(201).json({ success: true, data: s }); });
adminRouter.put("/subjects/:id", async (req: AuthRequest, res: Response) => { const d = subSchema.partial().parse(req.body); const s = await adminSvc.updateSubject(req.params.id, d); await adminSvc.auditLog(req.user!.id, "UPDATE", "Subject", req.params.id); res.json({ success: true, data: s }); });

adminRouter.post("/exams", async (req: AuthRequest, res: Response) => { const d = examSchema.parse(req.body); const e = await adminSvc.createExam(d); await adminSvc.auditLog(req.user!.id, "CREATE", "Exam", (e as { id: string }).id); res.status(201).json({ success: true, data: e }); });
adminRouter.put("/exams/:id", async (req: AuthRequest, res: Response) => { const d = examSchema.partial().parse(req.body); const e = await adminSvc.updateExam(req.params.id, d); await adminSvc.auditLog(req.user!.id, "UPDATE", "Exam", req.params.id); res.json({ success: true, data: e }); });
adminRouter.delete("/exams/:id", async (req: AuthRequest, res: Response) => { await adminSvc.deleteExam(req.params.id); await adminSvc.auditLog(req.user!.id, "DELETE", "Exam", req.params.id); res.json({ success: true }); });

adminRouter.post("/exams/:slug/questions", async (req: AuthRequest, res: Response) => { const d = qSchema.parse(req.body); const q = await adminSvc.addQuestion(req.params.slug, d); await adminSvc.auditLog(req.user!.id, "CREATE", "Question", (q as { id: string }).id); res.status(201).json({ success: true, data: q }); });
adminRouter.put("/questions/:id", async (req: AuthRequest, res: Response) => { const d = qSchema.partial().parse(req.body); const q = await adminSvc.updateQuestion(req.params.id, d); await adminSvc.auditLog(req.user!.id, "UPDATE", "Question", req.params.id); res.json({ success: true, data: q }); });
adminRouter.delete("/questions/:id", async (req: AuthRequest, res: Response) => { await adminSvc.deleteQuestion(req.params.id); await adminSvc.auditLog(req.user!.id, "DELETE", "Question", req.params.id); res.json({ success: true }); });

adminRouter.post("/exams/:slug/import", upload.single("file"), async (req: AuthRequest, res: Response) => {
  if (!req.file) { res.status(400).json({ success: false, error: "CSV file required" }); return; }
  const result = await adminSvc.bulkImportQuestions(req.params.slug, req.file.buffer.toString("utf-8"));
  await adminSvc.auditLog(req.user!.id, "BULK_IMPORT", "Exam", req.params.slug, result);
  res.json({ success: true, data: result });
});
