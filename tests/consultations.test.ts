import request from "supertest";
import app from "../src/app";
import { prismaMock } from "./utils/prismaMock";
import { authCookie } from "./utils/testAuth";

const CONSULTATION = {
  id: "88888888-8888-8888-8888-888888888888",
  name: "Alice Example",
  company: null,
  email: "alice@example.com",
  phone: "5551234",
  country: "Wonderland",
  service: null,
  notes: null,
  date: new Date("2026-02-01"),
  time: "10:00",
  status: "PENDING" as const,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("Consultations module", () => {
  describe("POST /api/consultations", () => {
    it("creates a consultation successfully", async () => {
      prismaMock.consultation.create.mockResolvedValue(CONSULTATION as any);

      const res = await request(app).post("/api/consultations").send({
        name: CONSULTATION.name,
        email: CONSULTATION.email,
        phone: CONSULTATION.phone,
        country: CONSULTATION.country,
        date: "2026-02-01",
        time: CONSULTATION.time,
      });

      expect(res.status).toBe(201);
      expect(res.body.name).toBe(CONSULTATION.name);
    });

    it("returns 400 when required fields are missing", async () => {
      const res = await request(app).post("/api/consultations").send({});
      expect(res.status).toBe(400);
      expect(prismaMock.consultation.create).not.toHaveBeenCalled();
    });
  });

  describe("GET /api/consultations", () => {
    it("returns 401 without a cookie", async () => {
      const res = await request(app).get("/api/consultations");
      expect(res.status).toBe(401);
    });

    it("returns 200 with a valid cookie", async () => {
      prismaMock.consultation.findMany.mockResolvedValue([
        CONSULTATION,
      ] as any);
      prismaMock.consultation.count.mockResolvedValue(1);

      const res = await request(app)
        .get("/api/consultations")
        .set("Cookie", authCookie());

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
    });
  });

  describe("GET /api/consultations/:id", () => {
    it("returns 404 when not found", async () => {
      prismaMock.consultation.findUnique.mockResolvedValue(null);

      const res = await request(app)
        .get(`/api/consultations/${CONSULTATION.id}`)
        .set("Cookie", authCookie());

      expect(res.status).toBe(404);
    });
  });

  describe("PATCH /api/consultations/:id", () => {
    it("updates a consultation's status", async () => {
      prismaMock.consultation.findUnique.mockResolvedValue(
        CONSULTATION as any
      );
      prismaMock.consultation.update.mockResolvedValue({
        ...CONSULTATION,
        status: "CONFIRMED",
      } as any);

      const res = await request(app)
        .patch(`/api/consultations/${CONSULTATION.id}`)
        .set("Cookie", authCookie())
        .send({ status: "CONFIRMED" });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe("CONFIRMED");
    });
  });

  describe("DELETE /api/consultations/:id", () => {
    it("deletes a consultation", async () => {
      prismaMock.consultation.findUnique.mockResolvedValue(
        CONSULTATION as any
      );
      prismaMock.consultation.delete.mockResolvedValue(CONSULTATION as any);

      const res = await request(app)
        .delete(`/api/consultations/${CONSULTATION.id}`)
        .set("Cookie", authCookie());

      expect(res.status).toBe(200);
    });
  });
});
