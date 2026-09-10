import { Request, Response } from "express";
import { ConsultationStatus } from "@prisma/client";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiError } from "../../utils/ApiError";
import { getPagination, buildPaginatedResult } from "../../utils/pagination";
import * as service from "./consultations.service";

const VALID_STATUSES: ConsultationStatus[] = [
  "PENDING",
  "CONFIRMED",
  "CANCELLED",
  "COMPLETED",
];

export const createConsultation = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      name,
      company,
      email,
      phone,
      country,
      service: svc,
      notes,
      date,
      time,
    } = req.body ?? {};

    if (!name || !email || !phone || !country || !date || !time) {
      throw new ApiError(
        400,
        "name, email, phone, country, date, and time are required"
      );
    }

    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      throw new ApiError(400, "date must be a valid date");
    }

    const consultation = await service.createConsultation({
      name,
      company,
      email,
      phone,
      country,
      service: svc,
      notes,
      date: parsedDate,
      time,
    });

    res.status(201).json(consultation);
  }
);

export const listConsultations = asyncHandler(
  async (req: Request, res: Response) => {
    const { page, limit, skip } = getPagination(req);
    const statusQuery = req.query.status as string | undefined;

    let status: ConsultationStatus | undefined;
    if (statusQuery) {
      if (!VALID_STATUSES.includes(statusQuery as ConsultationStatus)) {
        throw new ApiError(400, `status must be one of: ${VALID_STATUSES.join(", ")}`);
      }
      status = statusQuery as ConsultationStatus;
    }

    const [data, total] = await service.listConsultations({
      skip,
      limit,
      status,
    });

    res.status(200).json(buildPaginatedResult(data, total, page, limit));
  }
);

export const getConsultation = asyncHandler(
  async (req: Request, res: Response) => {
    const consultation = await service.getConsultationById(req.params.id);
    if (!consultation) {
      throw new ApiError(404, "Consultation not found");
    }
    res.status(200).json(consultation);
  }
);

export const updateConsultation = asyncHandler(
  async (req: Request, res: Response) => {
    const existing = await service.getConsultationById(req.params.id);
    if (!existing) {
      throw new ApiError(404, "Consultation not found");
    }

    const { status } = req.body ?? {};
    if (status && !VALID_STATUSES.includes(status)) {
      throw new ApiError(400, `status must be one of: ${VALID_STATUSES.join(", ")}`);
    }

    const consultation = await service.updateConsultation(req.params.id, {
      status,
    });
    res.status(200).json(consultation);
  }
);

export const deleteConsultation = asyncHandler(
  async (req: Request, res: Response) => {
    const existing = await service.getConsultationById(req.params.id);
    if (!existing) {
      throw new ApiError(404, "Consultation not found");
    }
    await service.deleteConsultation(req.params.id);
    res.status(200).json({ message: "Consultation deleted" });
  }
);
