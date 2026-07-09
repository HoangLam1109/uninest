import { randomUUID } from "crypto";
import { mkdir, unlink, writeFile } from "fs/promises";
import type { Request, Response } from "express";
import mongoose from "mongoose";
import path from "path";
import { configureCloudinary } from "../config/cloudinary.config.js";
import { BlogPostService } from "../services/blog-post.service.js";
import { buildPublicPathUrl } from "../utils/request-url.utils.js";

function handleError(res: Response, error: unknown) {
  console.error("[BlogPostController]", error);

  if (error instanceof Error) {
    if (error.message === "Blog post not found") {
      return res.status(404).json({ success: false, message: error.message });
    }

    return res.status(400).json({ success: false, message: error.message });
  }

  return res.status(500).json({
    success: false,
    message: "Internal server error",
  });
}

function parseBoolean(value: unknown) {
  if (typeof value === "boolean") return value;
  if (typeof value !== "string") return undefined;
  if (value === "true") return true;
  if (value === "false") return false;
  return undefined;
}

async function persistCoverImage(file: Express.Multer.File, req: Request) {
  try {
    const cloudinary = configureCloudinary();

    const uploadedImage = await new Promise<{
      secure_url: string;
      public_id: string;
    }>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "uninest/blogs",
          public_id: `cover_${randomUUID()}`,
          resource_type: "image",
          transformation: [
            { width: 1600, height: 1200, crop: "limit" },
            { quality: "auto", fetch_format: "auto" },
          ],
        },
        (error, result) => {
          if (error || !result) {
            reject(error ?? new Error("Cloudinary upload failed"));
            return;
          }

          resolve({
            secure_url: result.secure_url,
            public_id: result.public_id,
          });
        },
      );

      uploadStream.end(file.buffer);
    });

    return {
      coverImageUrl: uploadedImage.secure_url,
      coverImageStorageKey: `cloudinary:${uploadedImage.public_id}`,
    };
  } catch (cloudinaryError) {
    console.warn(
      "[BlogPostController] Cloudinary upload failed, saving cover image locally:",
      cloudinaryError,
    );
  }

  const extension = path.extname(file.originalname) || ".jpg";
  const fileName = `${randomUUID()}${extension.toLowerCase()}`;
  const storageKey = path.join("blogs", fileName);
  const uploadsDir = path.resolve(process.cwd(), "uploads", "blogs");

  await mkdir(uploadsDir, { recursive: true });
  await writeFile(path.join(uploadsDir, fileName), file.buffer);

  return {
    coverImageUrl: buildPublicPathUrl(req, `/uploads/blogs/${fileName}`),
    coverImageStorageKey: storageKey.replaceAll("\\", "/"),
  };
}

function getStoredUploadsPath(post: {
  coverImageUrl?: unknown;
  coverImageStorageKey?: unknown;
}) {
  if (typeof post.coverImageStorageKey === "string" && post.coverImageStorageKey.trim()) {
    const normalizedStorageKey = post.coverImageStorageKey
      .trim()
      .replaceAll("\\", "/")
      .replace(/^\/+/, "");
    return `/uploads/${normalizedStorageKey}`;
  }

  if (typeof post.coverImageUrl !== "string" || !post.coverImageUrl.trim()) {
    return null;
  }

  const normalizedUrl = post.coverImageUrl.trim();

  if (normalizedUrl.startsWith("/uploads/blogs/")) {
    return normalizedUrl;
  }

  try {
    const parsedUrl = new URL(normalizedUrl);
    return parsedUrl.pathname.startsWith("/uploads/blogs/")
      ? parsedUrl.pathname
      : null;
  } catch {
    return null;
  }
}

function serializeBlogPost(req: Request, post: unknown) {
  if (!post || typeof post !== "object") {
    return post;
  }

  const serializablePost =
    "toObject" in post && typeof post.toObject === "function"
      ? post.toObject()
      : { ...post };
  const uploadsPath = getStoredUploadsPath(serializablePost);

  return {
    ...serializablePost,
    coverImageUrl:
      uploadsPath
        ? buildPublicPathUrl(req, uploadsPath)
        : (serializablePost.coverImageUrl ?? null),
  };
}

async function removeStoredImage(storageKey?: string | null) {
  if (!storageKey) return;

  const normalizedStorageKey = storageKey.replaceAll("\\", "/");

  if (normalizedStorageKey.startsWith("cloudinary:")) {
    const publicId = normalizedStorageKey.slice("cloudinary:".length).trim();
    if (!publicId) return;

    try {
      const cloudinary = configureCloudinary();
      await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      console.warn(
        "[BlogPostController] Failed to delete Cloudinary image:",
        error,
      );
    }
    return;
  }

  if (!normalizedStorageKey.startsWith("blogs/")) return;

  const uploadsRoot = path.resolve(process.cwd(), "uploads");
  const targetPath = path.resolve(uploadsRoot, normalizedStorageKey);
  const allowedRoot = path.resolve(uploadsRoot, "blogs");

  if (!targetPath.startsWith(allowedRoot)) return;

  try {
    await unlink(targetPath);
  } catch {
    // Ignore missing local files
  }
}

export const getPublicBlogPosts = async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, Number(req.query.page ?? 1));
    const limit = Math.min(100, Math.max(1, Number(req.query.limit ?? 12)));
    const skip = (page - 1) * limit;
    const q =
      typeof req.query.q === "string" && req.query.q.trim()
        ? req.query.q.trim()
        : undefined;

    const { posts, total } = await BlogPostService.listPublic(
      q ? { q, skip, limit } : { skip, limit },
    );

    return res.json({
      success: true,
      data: posts.map((post) => serializeBlogPost(req, post)),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return handleError(res, error);
  }
};

export const getPublicBlogPostBySlug = async (req: Request, res: Response) => {
  try {
    const post = await BlogPostService.getPublicBySlug(req.params.slug as string);
    return res.json({ success: true, data: serializeBlogPost(req, post) });
  } catch (error) {
    return handleError(res, error);
  }
};

export const getAdminBlogPosts = async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, Number(req.query.page ?? 1));
    const limit = Math.min(100, Math.max(1, Number(req.query.limit ?? 20)));
    const skip = (page - 1) * limit;
    const q =
      typeof req.query.q === "string" && req.query.q.trim()
        ? req.query.q.trim()
        : undefined;

    const { posts, total } = await BlogPostService.listAdmin(
      q ? { q, skip, limit } : { skip, limit },
    );

    return res.json({
      success: true,
      data: posts.map((post) => serializeBlogPost(req, post)),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return handleError(res, error);
  }
};

export const createBlogPost = async (req: Request, res: Response) => {
  try {
    const adminId = req.userId;
    const adminName = req.user?.fullName || "Admin";
    const title = typeof req.body.title === "string" ? req.body.title.trim() : "";
    const content =
      typeof req.body.content === "string" ? req.body.content.trim() : "";

    if (!adminId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: "Title and content are required",
      });
    }

    const uploadedImage = req.file ? await persistCoverImage(req.file, req) : null;
    const isPublished = parseBoolean(req.body.isPublished);

    const post = await BlogPostService.create(adminId, adminName, {
      title,
      content,
      ...(typeof req.body.excerpt === "string"
        ? { excerpt: req.body.excerpt }
        : {}),
      ...(isPublished !== undefined
        ? { isPublished }
        : {}),
      ...(uploadedImage
        ? {
            coverImageUrl: uploadedImage.coverImageUrl,
            coverImageStorageKey: uploadedImage.coverImageStorageKey,
          }
        : {}),
    });

    return res.status(201).json({
      success: true,
      message: "Blog post created successfully",
      data: serializeBlogPost(req, post),
    });
  } catch (error) {
    return handleError(res, error);
  }
};

export const updateBlogPost = async (req: Request, res: Response) => {
  try {
    const id = typeof req.params.id === "string" ? req.params.id : undefined;
    const adminId = req.userId;
    const adminName = req.user?.fullName || "Admin";

    if (!adminId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid blog id" });
    }

    const existing = await BlogPostService.getById(id);
    const uploadedImage = req.file ? await persistCoverImage(req.file, req) : null;
    const shouldRemoveCover = parseBoolean(req.body.removeCoverImage) === true;

    const isPublished = parseBoolean(req.body.isPublished);

    const post = await BlogPostService.update(id, adminId, adminName, {
      ...(typeof req.body.title === "string"
        ? { title: req.body.title }
        : {}),
      ...(typeof req.body.excerpt === "string"
        ? { excerpt: req.body.excerpt }
        : {}),
      ...(typeof req.body.content === "string"
        ? { content: req.body.content }
        : {}),
      ...(isPublished !== undefined
        ? { isPublished }
        : {}),
      ...(uploadedImage
        ? {
            coverImageUrl: uploadedImage.coverImageUrl,
            coverImageStorageKey: uploadedImage.coverImageStorageKey,
          }
        : shouldRemoveCover
          ? {
              coverImageUrl: null,
              coverImageStorageKey: null,
            }
          : {}),
    });

    if (uploadedImage || shouldRemoveCover) {
      await removeStoredImage(existing.coverImageStorageKey);
    }

    return res.json({
      success: true,
      message: "Blog post updated successfully",
      data: serializeBlogPost(req, post),
    });
  } catch (error) {
    return handleError(res, error);
  }
};

export const publishBlogPost = async (req: Request, res: Response) => {
  try {
    const id = typeof req.params.id === "string" ? req.params.id : undefined;
    const adminId = req.userId;
    const adminName = req.user?.fullName || "Admin";

    if (!adminId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid blog id" });
    }

    const post = await BlogPostService.setPublished(id, adminId, adminName, true);
    return res.json({
      success: true,
      message: "Blog post published successfully",
      data: serializeBlogPost(req, post),
    });
  } catch (error) {
    return handleError(res, error);
  }
};

export const unpublishBlogPost = async (req: Request, res: Response) => {
  try {
    const id = typeof req.params.id === "string" ? req.params.id : undefined;
    const adminId = req.userId;
    const adminName = req.user?.fullName || "Admin";

    if (!adminId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid blog id" });
    }

    const post = await BlogPostService.setPublished(id, adminId, adminName, false);
    return res.json({
      success: true,
      message: "Blog post moved to draft successfully",
      data: serializeBlogPost(req, post),
    });
  } catch (error) {
    return handleError(res, error);
  }
};

export const deleteBlogPost = async (req: Request, res: Response) => {
  try {
    const id = typeof req.params.id === "string" ? req.params.id : undefined;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid blog id" });
    }

    const post = await BlogPostService.delete(id);
    await removeStoredImage(post.coverImageStorageKey);

    return res.json({
      success: true,
      message: "Blog post deleted successfully",
    });
  } catch (error) {
    return handleError(res, error);
  }
};
