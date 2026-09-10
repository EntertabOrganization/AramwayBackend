import { Request, Response } from "express";
import { BlogType, BlogStatus } from "@prisma/client";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiError } from "../../utils/ApiError";
import { getPagination, buildPaginatedResult } from "../../utils/pagination";
import * as service from "./blogs.service";

const VALID_TYPES: BlogType[] = ["BLOG", "NEWS"];
const VALID_STATUSES: BlogStatus[] = ["DRAFT", "PUBLISHED"];

export const createBlog = asyncHandler(async (req: Request, res: Response) => {
  const {
    title,
    slug,
    excerpt,
    content,
    coverImage,
    type,
    status,
    tags,
    categoryId,
    authorName,
    publishedAt,
  } = req.body ?? {};

  if (!title || !slug || !excerpt || !content || !type || !categoryId) {
    throw new ApiError(
      400,
      "title, slug, excerpt, content, type, and categoryId are required"
    );
  }

  if (!VALID_TYPES.includes(type)) {
    throw new ApiError(400, `type must be one of: ${VALID_TYPES.join(", ")}`);
  }

  if (status && !VALID_STATUSES.includes(status)) {
    throw new ApiError(400, `status must be one of: ${VALID_STATUSES.join(", ")}`);
  }

  const category = await service.getCategoryById(categoryId);
  if (!category) {
    throw new ApiError(400, "categoryId does not reference an existing blog category");
  }

  try {
    const blog = await service.createBlog({
      title,
      slug,
      excerpt,
      content,
      coverImage,
      type,
      status,
      tags: Array.isArray(tags) ? tags : undefined,
      categoryId,
      authorName,
      publishedAt: publishedAt ? new Date(publishedAt) : undefined,
    });
    res.status(201).json(blog);
  } catch (err: any) {
    if (err?.code === "P2002") {
      throw new ApiError(409, "A blog with this slug already exists");
    }
    throw err;
  }
});

export const listBlogs = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, skip } = getPagination(req);
  const typeQuery = req.query.type as string | undefined;
  const statusQuery = req.query.status as string | undefined;
  const categoryId = req.query.categoryId as string | undefined;

  if (typeQuery && !VALID_TYPES.includes(typeQuery as BlogType)) {
    throw new ApiError(400, `type must be one of: ${VALID_TYPES.join(", ")}`);
  }
  if (statusQuery && !VALID_STATUSES.includes(statusQuery as BlogStatus)) {
    throw new ApiError(400, `status must be one of: ${VALID_STATUSES.join(", ")}`);
  }

  const [data, total] = await service.listBlogs({
    skip,
    limit,
    type: typeQuery as BlogType | undefined,
    status: statusQuery as BlogStatus | undefined,
    categoryId,
  });

  res.status(200).json(buildPaginatedResult(data, total, page, limit));
});

export const getBlog = asyncHandler(async (req: Request, res: Response) => {
  const blog = await service.getBlogById(req.params.id);
  if (!blog) {
    throw new ApiError(404, "Blog not found");
  }
  res.status(200).json(blog);
});

export const updateBlog = asyncHandler(async (req: Request, res: Response) => {
  const existing = await service.getBlogById(req.params.id);
  if (!existing) {
    throw new ApiError(404, "Blog not found");
  }

  const {
    title,
    slug,
    excerpt,
    content,
    coverImage,
    type,
    status,
    tags,
    categoryId,
    authorName,
    publishedAt,
  } = req.body ?? {};

  if (type && !VALID_TYPES.includes(type)) {
    throw new ApiError(400, `type must be one of: ${VALID_TYPES.join(", ")}`);
  }
  if (status && !VALID_STATUSES.includes(status)) {
    throw new ApiError(400, `status must be one of: ${VALID_STATUSES.join(", ")}`);
  }

  if (categoryId) {
    const category = await service.getCategoryById(categoryId);
    if (!category) {
      throw new ApiError(400, "categoryId does not reference an existing blog category");
    }
  }

  try {
    const blog = await service.updateBlog(req.params.id, {
      title,
      slug,
      excerpt,
      content,
      coverImage,
      type,
      status,
      tags: Array.isArray(tags) ? tags : undefined,
      categoryId,
      authorName,
      publishedAt: publishedAt ? new Date(publishedAt) : undefined,
    });
    res.status(200).json(blog);
  } catch (err: any) {
    if (err?.code === "P2002") {
      throw new ApiError(409, "A blog with this slug already exists");
    }
    throw err;
  }
});

export const deleteBlog = asyncHandler(async (req: Request, res: Response) => {
  const existing = await service.getBlogById(req.params.id);
  if (!existing) {
    throw new ApiError(404, "Blog not found");
  }
  await service.deleteBlog(req.params.id);
  res.status(200).json({ message: "Blog deleted" });
});
