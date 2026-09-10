import { Prisma, ConsultationStatus } from "@prisma/client";
import prisma from "../../lib/prisma";

export interface CreateConsultationInput {
  name: string;
  company?: string;
  email: string;
  phone: string;
  country: string;
  service?: string;
  notes?: string;
  date: Date;
  time: string;
}

export interface UpdateConsultationInput {
  status?: ConsultationStatus;
}

export const createConsultation = (data: CreateConsultationInput) => {
  return prisma.consultation.create({ data });
};

export const listConsultations = (params: {
  skip: number;
  limit: number;
  status?: ConsultationStatus;
}) => {
  const where: Prisma.ConsultationWhereInput = {};
  if (params.status) where.status = params.status;

  return Promise.all([
    prisma.consultation.findMany({
      where,
      skip: params.skip,
      take: params.limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.consultation.count({ where }),
  ]);
};

export const getConsultationById = (id: string) => {
  return prisma.consultation.findUnique({ where: { id } });
};

export const updateConsultation = (
  id: string,
  data: UpdateConsultationInput
) => {
  return prisma.consultation.update({ where: { id }, data });
};

export const deleteConsultation = (id: string) => {
  return prisma.consultation.delete({ where: { id } });
};
