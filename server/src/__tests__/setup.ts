export default async function globalSetup() {
  process.env.NODE_ENV = "test";
  process.env.DATABASE_URL =
    process.env.DATABASE_URL ||
    "postgresql://exammania:testpassword@localhost:5432/exammania_test";
  process.env.JWT_SECRET =
    "test_jwt_secret_at_least_64_characters_long_for_ci_testing_purposes!!";
  process.env.GOOGLE_CLIENT_ID = "mock_google_client_id";
  process.env.GOOGLE_CLIENT_SECRET = "mock_google_client_secret";
  process.env.CLIENT_URL = "http://localhost:3000";
}
