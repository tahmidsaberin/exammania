export type Role = "STUDENT" | "ADMIN";
export type QuestionType = "MCQ" | "TRUE_FALSE" | "SHORT_ANSWER";

export interface User { id: string; email: string; name: string; avatarUrl?: string | null; role: Role; createdAt?: string; }
export interface Division { id: string; slug: string; name: string; namebn: string; _count?: { subjects: number; exams: number }; }
export interface Subject { id: string; slug: string; name: string; namebn: string; divisionId?: string | null; isCommon: boolean; _count?: { exams: number }; }
export interface Question { id: string; examId?: string; order: number; type: QuestionType; text: string; options?: string[] | null; marks: number; correct?: string | null; }
export interface Exam { id: string; slug: string; title: string; titlebn: string; timeLimitMin: number; randomize: boolean; published: boolean; divisionId?: string | null; subjectId: string; questions: Question[]; division?: Division | null; subject?: Subject; _count?: { questions: number; attempts: number }; }
export interface AttemptAnswer { id: string; attemptId: string; questionId: string; answer?: string | null; isCorrect: boolean; marksAwarded: number; question?: Question; }
export interface Attempt { id: string; userId: string; examId: string; startedAt: string; completedAt?: string | null; score: number; totalScore: number; exam?: Exam; answers?: AttemptAnswer[]; }
export interface AttemptResult extends Attempt { exam: Exam; answers: AttemptAnswer[]; }
export interface AnalyticsDashboard { totalStudents: number; totalExams: number; attemptsToday: number; averageScore: number; attemptsByDay: { date: string; count: number }[]; scoreDistribution: { range: string; count: number }[]; }
