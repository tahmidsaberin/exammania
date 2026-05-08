import { Request } from "express";
import { User } from "@prisma/client";

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

export interface AuthRequest extends Request {
  user?: User;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface SaveAnswerPayload {
  questionId: string;
  answer: string;
}

export interface CsvQuestion {
  question: string;
  type: "MCQ" | "TRUE_FALSE" | "SHORT_ANSWER";
  options: string;
  correct: string;
  marks: string;
}

export interface AnalyticsDashboard {
  totalStudents: number;
  totalExams: number;
  attemptsToday: number;
  averageScore: number;
  attemptsByDay: { date: string; count: number }[];
  scoreDistribution: { range: string; count: number }[];
}
