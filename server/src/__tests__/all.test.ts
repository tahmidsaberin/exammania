// ─── Auth tests ──────────────────────────────────────────
import jwt from "jsonwebtoken";

jest.mock("google-auth-library", () => ({
  OAuth2Client: jest.fn().mockImplementation(() => ({
    verifyIdToken: jest.fn().mockResolvedValue({
      getPayload: () => ({ sub: "g-123", email: "test@test.com", name: "Test", picture: null }),
    }),
  })),
}));

jest.mock("@prisma/client", () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    user: {
      upsert: jest.fn().mockResolvedValue({ id: "u-1", googleId: "g-123", email: "test@test.com", name: "Test", avatarUrl: null, role: "STUDENT", createdAt: new Date(), updatedAt: new Date() }),
      findUnique: jest.fn().mockResolvedValue(null),
    },
    division: { findMany: jest.fn().mockResolvedValue([]), findUnique: jest.fn().mockResolvedValue(null) },
    subject: { findMany: jest.fn().mockResolvedValue([]) },
    exam: { findUnique: jest.fn().mockResolvedValue(null), findMany: jest.fn().mockResolvedValue([]) },
    attempt: { findUnique: jest.fn().mockResolvedValue(null), findFirst: jest.fn().mockResolvedValue(null), create: jest.fn(), update: jest.fn(), aggregate: jest.fn().mockResolvedValue({ _avg: { score: 0 } }), count: jest.fn().mockResolvedValue(0), findMany: jest.fn().mockResolvedValue([]) },
    attemptAnswer: { upsert: jest.fn().mockResolvedValue({}) },
    auditLog: { create: jest.fn() },
    question: { createMany: jest.fn().mockResolvedValue({ count: 0 }) },
    $connect: jest.fn(),
    $disconnect: jest.fn(),
  })),
  QuestionType: { MCQ: "MCQ", TRUE_FALSE: "TRUE_FALSE", SHORT_ANSWER: "SHORT_ANSWER" },
}));

beforeEach(() => {
  process.env.JWT_SECRET = "test_jwt_secret_at_least_64_chars_for_testing_purposes_padding!!";
  process.env.GOOGLE_CLIENT_ID = "mock-client-id";
  process.env.GOOGLE_CLIENT_SECRET = "mock-secret";
  process.env.CLIENT_URL = "http://localhost:3000";
  process.env.NODE_ENV = "test";
  process.env.DATABASE_URL = "postgresql://exammania:testpassword@localhost:5432/exammania_test";
});

describe("signJwt", () => {
  it("produces a verifiable JWT with correct sub/email/role", async () => {
    const { signJwt } = await import("../services/authService");
    const token = signJwt({ id: "u-1", email: "test@test.com", role: "STUDENT" });
    expect(typeof token).toBe("string");
    const decoded = jwt.decode(token) as jwt.JwtPayload;
    expect(decoded.sub).toBe("u-1");
    expect(decoded.email).toBe("test@test.com");
    expect(decoded.role).toBe("STUDENT");
  });

  it("expires in ~1 day", async () => {
    const { signJwt } = await import("../services/authService");
    const token = signJwt({ id: "u-1", email: "a@b.com", role: "STUDENT" });
    const d = jwt.decode(token) as jwt.JwtPayload;
    expect(d.exp! - d.iat!).toBeCloseTo(86400, -2);
  });

  it("produces unique tokens for different users", async () => {
    const { signJwt } = await import("../services/authService");
    expect(signJwt({ id: "a", email: "a@a.com", role: "STUDENT" }))
      .not.toBe(signJwt({ id: "b", email: "b@b.com", role: "ADMIN" }));
  });
});

describe("cookieOptions", () => {
  it("sets httpOnly and sameSite=strict", async () => {
    const { cookieOptions } = await import("../services/authService");
    expect(cookieOptions.httpOnly).toBe(true);
    expect(cookieOptions.sameSite).toBe("strict");
  });
});

describe("verifyGoogleToken", () => {
  it("returns user info from a mock token", async () => {
    const { verifyGoogleToken } = await import("../services/authService");
    const info = await verifyGoogleToken("mock-token");
    expect(info.googleId).toBe("g-123");
    expect(info.email).toBe("test@test.com");
  });
});

describe("bulkImportQuestions", () => {
  it("throws 404 for nonexistent exam", async () => {
    const { bulkImportQuestions } = await import("../services/adminService");
    await expect(bulkImportQuestions("no-exam", "question,type,options,correct,marks\nQ,MCQ,A|B,0,1"))
      .rejects.toMatchObject({ statusCode: 404 });
  });
});

describe("getAnalytics", () => {
  it("returns dashboard shape", async () => {
    const { getAnalytics } = await import("../services/adminService");
    const result = await getAnalytics();
    expect(result).toHaveProperty("totalStudents");
    expect(result).toHaveProperty("totalExams");
    expect(result).toHaveProperty("attemptsByDay");
    expect(Array.isArray(result.attemptsByDay)).toBe(true);
  });
});

describe("HTTP routes", () => {
  it("GET /health returns ok", async () => {
    const request = (await import("supertest")).default;
    const { createApp } = await import("../app");
    const app = createApp();
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
  });

  it("POST /api/auth/google without body returns 422", async () => {
    const request = (await import("supertest")).default;
    const { createApp } = await import("../app");
    const app = createApp();
    const res = await request(app).post("/api/auth/google").send({});
    expect(res.status).toBe(422);
  });

  it("GET /api/auth/me without cookie returns 401", async () => {
    const request = (await import("supertest")).default;
    const { createApp } = await import("../app");
    const app = createApp();
    const res = await request(app).get("/api/auth/me");
    expect(res.status).toBe(401);
  });

  it("GET /api/divisions returns array", async () => {
    const request = (await import("supertest")).default;
    const { createApp } = await import("../app");
    const app = createApp();
    const res = await request(app).get("/api/divisions");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it("POST /api/admin/divisions without auth returns 401", async () => {
    const request = (await import("supertest")).default;
    const { createApp } = await import("../app");
    const app = createApp();
    const res = await request(app).post("/api/admin/divisions").send({ slug: "test", name: "Test" });
    expect(res.status).toBe(401);
  });
});
