const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) { super(message); this.status = status; }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, { ...options, credentials: "include", headers: { "Content-Type": "application/json", ...options.headers } });
  const json = await res.json().catch(() => ({ success: false, error: "Invalid JSON" }));
  if (!res.ok || !json.success) throw new ApiError(json.error ?? "Request failed", res.status);
  return json.data as T;
}

export const authApi = {
  google: (idToken: string) => request<import("@/types").User>("/api/auth/google", { method: "POST", body: JSON.stringify({ idToken }) }),
  me: () => request<import("@/types").User>("/api/auth/me"),
  logout: () => request<null>("/api/auth/logout", { method: "POST" }),
};

export const divisionsApi = {
  list: () => request<import("@/types").Division[]>("/api/divisions"),
  subjects: (slug: string) => request<{ division: import("@/types").Division; subjects: import("@/types").Subject[] }>(`/api/divisions/${slug}/subjects`),
};

export const examsApi = {
  bySubject: (slug: string) => request<{ subject: import("@/types").Subject; exams: import("@/types").Exam[] }>(`/api/subjects/${slug}/exams`),
  get: (slug: string) => request<import("@/types").Exam>(`/api/exams/${slug}`),
  start: (slug: string) => request<import("@/types").Attempt>(`/api/exams/${slug}/start`, { method: "POST" }),
};

export const attemptsApi = {
  get: (id: string) => request<import("@/types").Attempt>(`/api/attempts/${id}`),
  save: (id: string, questionId: string, answer: string) => request<unknown>(`/api/attempts/${id}/save`, { method: "PUT", body: JSON.stringify({ questionId, answer }) }),
  submit: (id: string) => request<import("@/types").AttemptResult>(`/api/attempts/${id}/submit`, { method: "POST" }),
  result: (id: string) => request<import("@/types").AttemptResult>(`/api/attempts/${id}/result`),
};

export const usersApi = {
  me: () => request<import("@/types").User>("/api/users/me"),
  history: (userId: string) => request<import("@/types").Attempt[]>(`/api/users/${userId}/history`),
};

export const adminApi = {
  analytics: () => request<import("@/types").AnalyticsDashboard>("/api/admin/analytics"),
  users: () => request<import("@/types").User[]>("/api/admin/users"),
  createDivision: (data: unknown) => request<import("@/types").Division>("/api/admin/divisions", { method: "POST", body: JSON.stringify(data) }),
  createSubject: (data: unknown) => request<import("@/types").Subject>("/api/admin/subjects", { method: "POST", body: JSON.stringify(data) }),
  subjects: () => request<import("@/types").Subject[]>("/api/admin/subjects"),
  createExam: (data: unknown) => request<import("@/types").Exam>("/api/admin/exams", { method: "POST", body: JSON.stringify(data) }),
  updateExam: (id: string, data: unknown) => request<import("@/types").Exam>(`/api/admin/exams/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteExam: (id: string) => request<null>(`/api/admin/exams/${id}`, { method: "DELETE" }),
  addQuestion: (slug: string, data: unknown) => request<import("@/types").Question>(`/api/admin/exams/${slug}/questions`, { method: "POST", body: JSON.stringify(data) }),
  importCsv: (slug: string, file: File) => {
    const form = new FormData(); form.append("file", file);
    return fetch(`${API_URL}/api/admin/exams/${slug}/import`, { method: "POST", credentials: "include", body: form }).then((r) => r.json());
  },
};

// Added: admin can fetch any student's history
export const adminHistoryApi = {
  studentHistory: (userId: string) =>
    request<import("@/types").Attempt[]>(`/api/admin/users/${userId}/history`),
};
