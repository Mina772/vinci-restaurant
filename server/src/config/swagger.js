import swaggerJSDoc from "swagger-jsdoc";
import { env } from "./env.js";

/** OpenAPI 3 spec assembled from JSDoc annotations across route files. */
export const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: "3.0.3",
    info: {
      title: "VINCI Restaurant API",
      version: "1.0.0",
      description: "Enterprise restaurant ordering platform REST API.",
      license: { name: "MIT" },
    },
    servers: [{ url: env.API_PREFIX, description: "v1" }],
    components: {
      securitySchemes: {
        bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
        cookieAuth: { type: "apiKey", in: "cookie", name: "accessToken" },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ["./src/routes/*.js"],
});
