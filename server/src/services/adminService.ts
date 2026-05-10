import { PrismaClient, QuestionType, AcademicLevel, Prisma } from "@prisma/client";
import { parse } from "csv-parse/sync";
import { AppError } from "../middleware/errorHandler";
import { logger } from "../utils/logger";
import { AnalyticsDashboard, CsvQuestion } from "../types";

const prisma = new PrismaClient();

export async function auditLog(userId: string, action: string, entityType: string, entityId: string, meta?: object) {
  await prisma.auditLog.create({ data: { userId, action, entityType, entityId, meta } });
  logger.info(`[ADMIN] ${action}`, { userId, entityType, entityId });
}

export const createDivision = (data: { slug: string; name: string; namebn?: string; level: AcademicLevel }) =>
  prisma.division.create({ data });
export const updateDivision = (id: string, data: { name?: string; namebn?: string; level?: AcademicLevel }) =>
  prisma.division.update({ where: { id }, data });
export const deleteDivision = (id: string) => prisma.division.delete({ where: { id } });

export const createSubject = async (data: {
  slug: string;
  name: string;
  namebn?: string;
  divisionId?: string;
  isCommon?: boolean;
  level?: AcademicLevel;
}) => {
  const payload: Prisma.SubjectCreateInput = {
    slug: data.slug,
    name: data.name,
    namebn: data.namebn,
    divisionId: data.divisionId,
    isCommon: data.isCommon,
    level: data.level,
  } as Prisma.SubjectCreateInput;

  if (data.divisionId && !data.level) {
    const division = await prisma.division.findUnique({ where: { id: data.divisionId } });
    if (division) payload.level = division.level as AcademicLevel;
  }
  if (data.isCommon && !payload.level) {
    throw new AppError("Common subjects must have an academic level", 400);
  }
  return prisma.subject.create({ data: payload });
};
export const updateSubject = async (
  id: string,
  data: { divisionId?: string; isCommon?: boolean; level?: AcademicLevel; [key: string]: unknown }
) => {
  const payload = { ...data } as Prisma.SubjectUpdateInput;
  if (data.divisionId && data.level === undefined) {
    const division = await prisma.division.findUnique({ where: { id: data.divisionId } });
    if (division) payload.level = division.level as AcademicLevel;
  }
  if (data.isCommon && payload.level === undefined) {
    throw new AppError("Common subjects must have an academic level", 400);
  }
  return prisma.subject.update({ where: { id }, data: payload });
};

export const createExam = (data: object) => prisma.exam.create({ data: data as Parameters<typeof prisma.exam.create>[0]["data"] });
export const updateExam = (id: string, data: object) => prisma.exam.update({ where: { id }, data: data as Parameters<typeof prisma.exam.update>[0]["data"] });
export const deleteExam = (id: string) => prisma.exam.delete({ where: { id } });
export const deleteSubject = (id: string) => prisma.subject.delete({ where: { id } });

export async function addQuestion(examSlug: string, data: object) {
  const exam = await prisma.exam.findUnique({ where: { slug: examSlug } });
  if (!exam) throw new AppError("Exam not found", 404);
  return prisma.question.create({ data: { examId: exam.id, ...(data as object) } as Parameters<typeof prisma.question.create>[0]["data"] });
}

export const updateQuestion = (id: string, data: object) => prisma.question.update({ where: { id }, data: data as Parameters<typeof prisma.question.update>[0]["data"] });
export const deleteQuestion = (id: string) => prisma.question.delete({ where: { id } });

export async function bulkImportQuestions(examSlug: string, csvContent: string) {
  const exam = await prisma.exam.findUnique({
    where: { slug: examSlug },
    include: { questions: { orderBy: { order: "desc" }, take: 1 } },
  });
  if (!exam) throw new AppError("Exam not found", 404);

  const records: CsvQuestion[] = parse(csvContent, { columns: true, skip_empty_lines: true, trim: true });
  let startOrder = exam.questions.length > 0 ? (exam.questions[0].order ?? 0) + 1 : 1;

  const questions = records.map((row, idx) => {
    const type = row.type?.toUpperCase() as QuestionType;
    if (!Object.values(QuestionType).includes(type)) throw new AppError(`Invalid type "${row.type}" at row ${idx + 1}`, 422);
    return {
      examId: exam.id,
      order: startOrder++,
      type,
      text: row.question,
      options: row.options ? row.options.split("|").map((o) => o.trim()) : undefined,
      correct: row.correct || null,
      marks: parseInt(row.marks, 10) || 1,
    };
  });

  await prisma.question.createMany({ data: questions });
  return { imported: questions.length };
}

export async function getAnalytics(): Promise<AnalyticsDashboard> {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const sevenDaysAgo = new Date(); sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const [totalStudents, totalExams, attemptsToday, scoreData, rawAttempts, completedAttempts] = await Promise.all([
    prisma.user.count({ where: { role: "STUDENT" } }),
    prisma.exam.count({ where: { published: true } }),
    prisma.attempt.count({ where: { startedAt: { gte: today } } }),
    prisma.attempt.aggregate({ _avg: { score: true }, where: { completedAt: { not: null } } }),
    prisma.attempt.findMany({ where: { startedAt: { gte: sevenDaysAgo } }, select: { startedAt: true } }),
    prisma.attempt.findMany({ where: { completedAt: { not: null } }, select: { score: true, totalScore: true } }),
  ]);

  const attemptsByDay: Record<string, number> = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    attemptsByDay[d.toISOString().split("T")[0]] = 0;
  }
  for (const a of rawAttempts) {
    const key = a.startedAt.toISOString().split("T")[0];
    if (key in attemptsByDay) attemptsByDay[key]++;
  }

  const buckets = { "0-25": 0, "26-50": 0, "51-75": 0, "76-100": 0 };
  for (const a of completedAttempts) {
    if (!a.totalScore) continue;
    const pct = (a.score / a.totalScore) * 100;
    if (pct <= 25) buckets["0-25"]++;
    else if (pct <= 50) buckets["26-50"]++;
    else if (pct <= 75) buckets["51-75"]++;
    else buckets["76-100"]++;
  }

  return {
    totalStudents, totalExams, attemptsToday,
    averageScore: Math.round(scoreData._avg.score ?? 0),
    attemptsByDay: Object.entries(attemptsByDay).map(([date, count]) => ({ date, count })),
    scoreDistribution: Object.entries(buckets).map(([range, count]) => ({ range, count })),
  };
}
