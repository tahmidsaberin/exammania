import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: { title: "ExamMania API", version: "1.0.0", description: "Bangladesh academic exam platform REST API" },
    servers: [{ url: "http://localhost:4000" }, { url: "https://api.exammania.com" }],
    components: { securitySchemes: { cookieAuth: { type: "apiKey", in: "cookie", name: "token" } } },
    security: [{ cookieAuth: [] }],
  },
  apis: ["./src/routes/*.ts"],
};

export const swaggerSpec = swaggerJsdoc(options);
