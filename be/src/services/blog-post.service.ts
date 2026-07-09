import { BlogPostRepository } from "../repositories/blog-post.repo.js";

type BlogPostMutationInput = {
  title?: string;
  excerpt?: string;
  content?: string;
  coverImageUrl?: string | null;
  coverImageStorageKey?: string | null;
  isPublished?: boolean;
};

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-")
    .slice(0, 180);
}

async function ensureUniqueSlug(title: string, excludeId?: string) {
  const baseSlug = slugify(title) || "blog-post";
  let slug = baseSlug;
  let attempt = 1;

  while (true) {
    const existing = await BlogPostRepository.findByExactSlugIncludingDeleted(slug);
    if (!existing || existing._id.toString() === excludeId) {
      return slug;
    }

    attempt += 1;
    slug = `${baseSlug}-${attempt}`;
  }
}

export class BlogPostService {
  static async listPublic(params: { q?: string; skip: number; limit: number }) {
    const filter = params.q ? { q: params.q } : {};
    const [posts, total] = await Promise.all([
      BlogPostRepository.findPublic(filter, params.skip, params.limit),
      BlogPostRepository.countPublic(filter),
    ]);

    return { posts, total };
  }

  static async listAdmin(params: { q?: string; skip: number; limit: number }) {
    const filter = params.q ? { q: params.q } : {};
    const [posts, total] = await Promise.all([
      BlogPostRepository.findAdmin(filter, params.skip, params.limit),
      BlogPostRepository.countAdmin(filter),
    ]);

    return { posts, total };
  }

  static async getPublicBySlug(slug: string) {
    const post = await BlogPostRepository.findBySlug(slug);
    if (!post) {
      throw new Error("Blog post not found");
    }

    return post;
  }

  static async getById(id: string) {
    const post = await BlogPostRepository.findById(id);
    if (!post) {
      throw new Error("Blog post not found");
    }

    return post;
  }

  static async create(
    adminId: string,
    adminName: string,
    data: Required<Pick<BlogPostMutationInput, "title" | "content">> &
      BlogPostMutationInput,
  ) {
    const slug = await ensureUniqueSlug(data.title);
    const isPublished = data.isPublished === true;

    return BlogPostRepository.create({
      title: data.title.trim(),
      slug,
      content: data.content.trim(),
      authorName: adminName,
      createdBy: adminId,
      updatedBy: adminId,
      updatedByName: adminName,
      isPublished,
      publishedAt: isPublished ? new Date() : null,
      ...(typeof data.excerpt === "string" && data.excerpt.trim()
        ? { excerpt: data.excerpt.trim() }
        : {}),
      ...(typeof data.coverImageUrl !== "undefined"
        ? { coverImageUrl: data.coverImageUrl }
        : {}),
      ...(typeof data.coverImageStorageKey !== "undefined"
        ? { coverImageStorageKey: data.coverImageStorageKey }
        : {}),
    });
  }

  static async update(
    id: string,
    adminId: string,
    adminName: string,
    data: BlogPostMutationInput,
  ) {
    const existing = await this.getById(id);
    const nextTitle = data.title?.trim() || existing.title;
    const nextIsPublished =
      typeof data.isPublished === "boolean" ? data.isPublished : existing.isPublished;
    const shouldRegenerateSlug =
      typeof data.title === "string" && data.title.trim() && data.title.trim() !== existing.title;

    const updateData: Record<string, unknown> = {
      updatedBy: adminId,
      updatedByName: adminName,
      isPublished: nextIsPublished,
      publishedAt: nextIsPublished
        ? existing.publishedAt ?? new Date()
        : null,
    };

    if (typeof data.title === "string" && data.title.trim()) {
      updateData.title = nextTitle;
    }

    if (shouldRegenerateSlug) {
      updateData.slug = await ensureUniqueSlug(nextTitle, id);
    }

    if (typeof data.excerpt === "string") {
      updateData.excerpt = data.excerpt.trim() || null;
    }

    if (typeof data.content === "string" && data.content.trim()) {
      updateData.content = data.content.trim();
    }

    if (typeof data.coverImageUrl === "string" || data.coverImageUrl === null) {
      updateData.coverImageUrl = data.coverImageUrl;
    }

    if (
      typeof data.coverImageStorageKey === "string" ||
      data.coverImageStorageKey === null
    ) {
      updateData.coverImageStorageKey = data.coverImageStorageKey;
    }

    const updated = await BlogPostRepository.update(id, updateData);
    if (!updated) {
      throw new Error("Blog post not found");
    }

    return updated;
  }

  static async setPublished(
    id: string,
    adminId: string,
    adminName: string,
    isPublished: boolean,
  ) {
    const existing = await this.getById(id);
    const updated = await BlogPostRepository.update(id, {
      isPublished,
      publishedAt: isPublished ? existing.publishedAt ?? new Date() : null,
      updatedBy: adminId,
      updatedByName: adminName,
    });

    if (!updated) {
      throw new Error("Blog post not found");
    }

    return updated;
  }

  static async delete(id: string) {
    const existing = await this.getById(id);
    await BlogPostRepository.softDelete(id);
    return existing;
  }
}
