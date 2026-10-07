import swaggerJSDoc from "swagger-jsdoc";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const currentDirectory = dirname(fileURLToPath(import.meta.url));

const swaggerDefinition = {
  openapi: "3.0.3",
  info: {
    title: "TDD React TypeScript App API",
    version: "1.0.0",
    description:
      "API documentation for the TDD React TypeScript application backend.",
  },
  servers: [
    {
      url: "http://localhost:4000",
      description: "Local development server",
    },
  ],
  tags: [
    {
      name: "Health",
      description: "Backend health endpoints",
    },
    {
      name: "Challenges",
      description: "Challenge API endpoints",
    },
  ],
};

const options = {
  definition: swaggerDefinition,
  // Match the source file in development and the emitted file in production.
  apis: [resolve(currentDirectory, "app.{ts,js}")],
};

export const swaggerSpec = swaggerJSDoc(options);