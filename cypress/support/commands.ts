// cypress/support/commands.ts
/// <reference types="cypress" />

// Custom command: login via cookie (bypasses Google OAuth in E2E)
Cypress.Commands.add("loginAsStudent", () => {
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
});

Cypress.Commands.add("loginAsAdmin", () => {
  cy.intercept("GET", "**/api/auth/me", {
    body: {
      success: true,
      data: {
        id: "admin-e2e-1",
        email: "admin@test.com",
        name: "E2E Admin",
        role: "ADMIN",
      },
    },
  }).as("authMe");
});

declare global {
  namespace Cypress {
    interface Chainable {
      loginAsStudent(): Chainable<void>;
      loginAsAdmin(): Chainable<void>;
    }
  }
}
