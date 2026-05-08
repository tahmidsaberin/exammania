import { PrismaClient, QuestionType } from "@prisma/client";
import { AppError } from "../middleware/errorHandler";
import { SaveAnswerPayload } from "../types";

const prisma = new PrismaClient();

export async function getExamBySlug(slug: string) {
  const exam = await prisma.exam.findUnique({
    where: { slug },
    include: { division: true, subject: true, questions: { orderBy: { order: "asc" } } },
  });
  if (!exam) throw new AppError("Exam not found", 404);
  if (!exam.published) throw new AppError("Exam not published", 403);
  return exam;
}

export async function startAttempt(userId: string, examSlug: string) {
  const exam = await prisma.exam.findUnique({ where: { slug: examSlug }, include: { questions: true } });
  if (!exam) throw new AppError("Exam not found", 404);
  if (!exam.published) throw new AppError("Exam not published", 403);
  const existing = await prisma.attempt.findFirst({ where: { userId, examId: exam.id, completedAt: null } });
  if (existing) return existing;
  return prisma.attempt.create({
    data: { userId, examId: exam.id, totalScore: exam.questions.reduce((s, q) => s + q.marks, 0) },
  });
}

export async function saveAnswer(attemptId: string, userId: string, payload: SaveAnswerPayload) {
  const attempt = await prisma.attempt.findUnique({
    where: { id: attemptId },
    include: { exam: { include: { questions: true } } },
  });
  if (!attempt) throw new AppError("Attempt not found", 404);
  if (attempt.userId !== userId) throw new AppError("Forbidden", 403);
  if (attempt.completedAt) throw new AppError("Attempt already completed", 400);
  const question = attempt.exam.questions.find((q) => q.id === payload.questionId);
  if (!question) throw new AppError("Question not found", 404);
  return prisma.attemptAnswer.upsert({
    where: { attemptId_questionId: { attemptId, questionId: payload.questionId } },
    update: { answer: payload.answer },
    create: { attemptId, questionId: payload.questionId, answer: payload.answer },
  });
}

function evaluate(type: QuestionType, answer: string | null, correct: string | null): boolean {
  if (!answer || !correct) return false;
  if (type === QuestionType.MCQ || type === QuestionType.TRUE_FALSE) return answer.trim() === correct.trim();
  return answer.toLowerCase().includes(correct.toLowerCase());
}

export async function submitAttempt(attemptId: string, userId: string) {
  const attempt = await prisma.attempt.findUnique({
    where: { id: attemptId },
    include: { exam: { include: { questions: true } }, answers: true },
  });
  if (!attempt) throw new AppError("Attempt not found", 404);
  if (attempt.userId !== userId) throw new AppError("Forbidden", 403);
  if (attempt.completedAt) throw new AppError("Already submitted", 400);

  let score = 0;
  for (const question of attempt.exam.questions) {
    const given = attempt.answers.find((a) => a.questionId === question.id);
    const isCorrect = evaluate(question.type, given?.answer ?? null, question.correct);
    const marksAwarded = isCorrect ? question.marks : 0;
    score += marksAwarded;
    await prisma.attemptAnswer.upsert({
      where: { attemptId_questionId: { attemptId, questionId: question.id } },
      update: { isCorrect, marksAwarded },
      create: { attemptId, questionId: question.id, answer: given?.answer ?? null, isCorrect, marksAwarded },
    });
  }

  return prisma.attempt.update({
    where: { id: attemptId },
    data: { completedAt: new Date(), score },
    include: { exam: { include: { questions: true } }, answers: { include: { question: true } } },
  });
}

export async function getAttemptResult(attemptId: string, userId: string, isAdmin: boolean) {
  const attempt = await prisma.attempt.findUnique({
    where: { id: attemptId },
    include: { exam: { include: { questions: true, division: true, subject: true } }, answers: { include: { question: true } } },
  });
  if (!attempt) throw new AppError("Attempt not found", 404);
  if (attempt.userId !== userId && !isAdmin) throw new AppError("Forbidden", 403);
  if (!attempt.completedAt) throw new AppError("Not submitted yet", 400);
  return attempt;
}

export async function getUserHistory(userId: string, targetUserId: string, isAdmin: boolean) {
  if (userId !== targetUserId && !isAdmin) throw new AppError("Forbidden", 403);
  return prisma.attempt.findMany({
    where: { userId: targetUserId, completedAt: { not: null } },
    include: { exam: { include: { subject: true, division: true } } },
    orderBy: { completedAt: "desc" },
  });
}
