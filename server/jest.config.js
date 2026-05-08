module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["<rootDir>/src/__tests__/**/*.test.ts"],
  moduleNameMapper: { "^@/(.*)$": "<rootDir>/src/$1" },
  testTimeout: 30000,
  collectCoverageFrom: ["src/**/*.ts","!src/index.ts","!src/**/*.d.ts"],
};
