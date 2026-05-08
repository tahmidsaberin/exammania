/// <reference types="cypress" />

describe("Student Exam Flow (E2E)", () => {
  beforeEach(() => {
    // Intercept the Google auth call – bypass real OAuth
    cy.intercept("POST", "**/api/auth/google", {
      statusCode: 200,
      body: {
        success: true,
        data: {
          id: "user-e2e-1",
          email: "student@test.com",
          name: "E2E Student",
          avatarUrl: null,
          role: "STUDENT",
        },
      },
    }).as("googleAuth");

    // Seed API intercepts
    cy.intercept("GET", "**/api/divisions", {
      body: {
        success: true,
        data: [
          {
            id: "div-1",
            slug: "science",
            name: "Science",
            namebn: "বিজ্ঞান",
            _count: { subjects: 4, exams: 12 },
          },
        ],
      },
    }).as("getDivisions");

    cy.intercept("GET", "**/api/divisions/science/subjects", {
      body: {
        success: true,
        data: {
          division: { id: "div-1", slug: "science", name: "Science", namebn: "বিজ্ঞান" },
          subjects: [
            {
              id: "sub-1",
              slug: "physics",
              name: "Physics",
              namebn: "পদার্থবিজ্ঞান",
              isCommon: false,
              _count: { exams: 3 },
            },
          ],
        },
      },
    }).as("getSubjects");

    cy.intercept("GET", "**/api/subjects/physics/exams", {
      body: {
        success: true,
        data: {
          subject: { id: "sub-1", slug: "physics", name: "Physics", namebn: "পদার্থবিজ্ঞান", isCommon: false },
          exams: [
            {
              id: "exam-1",
              slug: "physics-ch1-mcq",
              title: "Physics Chapter 1 MCQ",
              titlebn: "",
              timeLimitMin: 10,
              randomize: false,
              published: true,
              questions: [],
              _count: { questions: 3, attempts: 5 },
            },
          ],
        },
      },
    }).as("getExams");

    cy.intercept("GET", "**/api/exams/physics-ch1-mcq", {
      body: {
        success: true,
        data: {
          id: "exam-1",
          slug: "physics-ch1-mcq",
          title: "Physics Chapter 1 MCQ",
          titlebn: "",
          timeLimitMin: 10,
          randomize: false,
          published: true,
          questions: [
            {
              id: "q-1",
              order: 1,
              type: "MCQ",
              text: "What is the SI unit of force?",
              options: ["Newton", "Joule", "Watt", "Pascal"],
              marks: 1,
            },
            {
              id: "q-2",
              order: 2,
              type: "TRUE_FALSE",
              text: "Mass and weight are the same.",
              options: ["True", "False"],
              marks: 1,
            },
            {
              id: "q-3",
              order: 3,
              type: "SHORT_ANSWER",
              text: "Define velocity.",
              options: null,
              marks: 2,
            },
          ],
        },
      },
    }).as("getExam");

    cy.intercept("POST", "**/api/exams/physics-ch1-mcq/start", {
      body: {
        success: true,
        data: {
          id: "attempt-e2e-1",
          userId: "user-e2e-1",
          examId: "exam-1",
          startedAt: new Date().toISOString(),
          completedAt: null,
          score: 0,
          totalScore: 4,
        },
      },
    }).as("startAttempt");

    cy.intercept("PUT", "**/api/attempts/attempt-e2e-1/save", {
      body: { success: true, data: {} },
    }).as("saveAnswer");

    cy.intercept("POST", "**/api/attempts/attempt-e2e-1/submit", {
      body: {
        success: true,
        data: {
          id: "attempt-e2e-1",
          score: 3,
          totalScore: 4,
          completedAt: new Date().toISOString(),
        },
      },
    }).as("submitAttempt");

    cy.intercept("GET", "**/api/attempts/attempt-e2e-1/result", {
      body: {
        success: true,
        data: {
          id: "attempt-e2e-1",
          userId: "user-e2e-1",
          examId: "exam-1",
          startedAt: new Date(Date.now() - 120000).toISOString(),
          completedAt: new Date().toISOString(),
          score: 3,
          totalScore: 4,
          exam: {
            id: "exam-1",
            slug: "physics-ch1-mcq",
            title: "Physics Chapter 1 MCQ",
            titlebn: "",
            timeLimitMin: 10,
            randomize: false,
            published: true,
            questions: [
              {
                id: "q-1",
                order: 1,
                type: "MCQ",
                text: "What is the SI unit of force?",
                options: ["Newton", "Joule", "Watt", "Pascal"],
                marks: 1,
                correct: "0",
              },
              {
                id: "q-2",
                order: 2,
                type: "TRUE_FALSE",
                text: "Mass and weight are the same.",
                options: ["True", "False"],
                marks: 1,
                correct: "1",
              },
              {
                id: "q-3",
                order: 3,
                type: "SHORT_ANSWER",
                text: "Define velocity.",
                options: null,
                marks: 2,
                correct: "rate of change of displacement",
              },
            ],
            subject: { id: "sub-1", slug: "physics", name: "Physics", namebn: "" },
          },
          answers: [
            { id: "aa-1", attemptId: "attempt-e2e-1", questionId: "q-1", answer: "0", isCorrect: true, marksAwarded: 1 },
            { id: "aa-2", attemptId: "attempt-e2e-1", questionId: "q-2", answer: "1", isCorrect: true, marksAwarded: 1 },
            { id: "aa-3", attemptId: "attempt-e2e-1", questionId: "q-3", answer: "rate of change", isCorrect: true, marksAwarded: 2 },
          ],
        },
      },
    }).as("getResult");

    // Auth/me
    cy.intercept("GET", "**/api/auth/me", {
      body: {
        success: true,
        data: {
          id: "user-e2e-1",
          email: "student@test.com",
          name: "E2E Student",
          role: "STUDENT",
        },
      },
    }).as("authMe");

    cy.visit("/");
  });

  it("navigates from landing → division → subject → exam start page", () => {
    // Wait for divisions to load
    cy.wait("@getDivisions");

    // Click Science division card
    cy.contains("Science").first().click();
    cy.url().should("include", "/division/science");
    cy.wait("@getSubjects");

    // Click Physics subject
    cy.contains("Physics").click();
    cy.url().should("include", "/subject/physics");
    cy.wait("@getExams");

    // Start exam
    cy.contains("Physics Chapter 1 MCQ").should("be.visible");
    cy.contains("Start Exam").click();
    cy.url().should("include", "/exam/physics-ch1-mcq");
  });

  it("completes the full exam flow: answer all questions → submit → view result", () => {
    cy.visit("/exam/physics-ch1-mcq");
    cy.wait("@getExam");

    // Start screen
    cy.contains("Physics Chapter 1 MCQ").should("be.visible");
    cy.contains("Start Exam").click();
    cy.wait("@startAttempt");

    // Q1 – MCQ
    cy.contains("What is the SI unit of force?").should("be.visible");
    cy.contains("label", "Newton").click();
    cy.wait("@saveAnswer");

    // Navigate to Q2
    cy.contains("Next").click();

    // Q2 – TRUE_FALSE
    cy.contains("Mass and weight are the same.").should("be.visible");
    cy.contains("label", "False").click();
    cy.wait("@saveAnswer");

    // Navigate to Q3
    cy.contains("Next").click();

    // Q3 – SHORT_ANSWER
    cy.contains("Define velocity.").should("be.visible");
    cy.get("textarea").type("rate of change of displacement");
    cy.wait("@saveAnswer");

    // Submit
    cy.contains("Submit Exam").click();

    // Confirm modal
    cy.contains("Are you sure").should("be.visible");
    cy.contains("button", "Confirm").click();
    cy.wait("@submitAttempt");

    // Result page
    cy.url().should("include", "/result/attempt-e2e-1");
    cy.wait("@getResult");

    cy.contains("Your Results").should("be.visible");
    cy.contains("3").should("be.visible"); // score
    cy.contains("75%").should("be.visible");
  });

  it("shows all question types in result review", () => {
    cy.visit("/result/attempt-e2e-1");
    cy.wait("@getResult");

    cy.contains("Question Review").should("be.visible");
    cy.contains("What is the SI unit of force?").should("be.visible");
    cy.contains("Mass and weight are the same.").should("be.visible");
    cy.contains("Define velocity.").should("be.visible");
    cy.contains("✓ Correct").should("be.visible");
  });

  it("allows retaking the exam from result page", () => {
    cy.visit("/result/attempt-e2e-1");
    cy.wait("@getResult");

    cy.contains("Retake Exam").click();
    cy.url().should("include", "/exam/physics-ch1-mcq");
  });
});
