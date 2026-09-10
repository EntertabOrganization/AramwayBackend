import swaggerJSDoc from "swagger-jsdoc";
import path from "path";

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Aramway Admin Backend API",
      version: "1.0.0",
      description:
        "Admin backend API for the Aramway business-consultancy marketing site. " +
        "Handles newsletter subscribers, blog/news content, career applications, " +
        "contact-us messages, and consultation bookings.",
    },
    servers: [
      {
        url: "/api",
        description: "API base path",
      },
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: "apiKey",
          in: "cookie",
          name: "token",
        },
      },
      schemas: {
        Error: {
          type: "object",
          properties: {
            error: { type: "string" },
          },
        },
      },
    },
  },
  apis: [
    path.join(__dirname, "../modules/**/*.routes.ts"),
    path.join(__dirname, "../modules/**/*.routes.js"),
  ],
};

export const swaggerSpec = swaggerJSDoc(options);
