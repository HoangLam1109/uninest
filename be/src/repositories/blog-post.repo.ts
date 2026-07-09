import { BlogPostModel } from "../models/BlogPost.model.js";

type BlogPostFilter = {
  q?: string;
  isPublished?: boolean;
};

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildFilter(filter: BlogPostFilter = {}) {
  const query: Record<string, unknown> = {
    deletedAt: null,
  };

  if (typeof filter.isPublished === "boolean") {
    query.isPublished = filter.isPublished;
  }

  if (filter.q) {
    const regex = new RegExp(escapeRegex(filter.q), "i");
    query.$or = [
      { title: regex },
      { slug: regex },
      { excerpt: regex },
      { content: regex },
      { authorName: regex },
    ];
  }

  return query;
}

export const BlogPostRepository = {
  create: (data: Record<string, unknown>) => BlogPostModel.create(data),

  findById: (id: string) => BlogPostModel.findOne({ _id: id, deletedAt: null }),

  findBySlug: (slug: string) =>
    BlogPostModel.findOne({ slug, deletedAt: null, isPublished: true }),

  findByExactSlugIncludingDeleted: (slug: string) =>
    BlogPostModel.findOne({ slug }),

  findPublic: (filter: BlogPostFilter, skip: number, limit: number) =>
    BlogPostModel.find(buildFilter({ ...filter, isPublished: true }))
      .sort({ publishedAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit),

  countPublic: (filter: BlogPostFilter) =>
    BlogPostModel.countDocuments(buildFilter({ ...filter, isPublished: true })),

  findAdmin: (filter: BlogPostFilter, skip: number, limit: number) =>
    BlogPostModel.find(buildFilter(filter))
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),

  countAdmin: (filter: BlogPostFilter) =>
    BlogPostModel.countDocuments(buildFilter(filter)),

  update: (id: string, data: Record<string, unknown>) =>
    BlogPostModel.findOneAndUpdate(
      { _id: id, deletedAt: null },
      { $set: data },
      { returnDocument: "after", runValidators: true },
    ),

  softDelete: (id: string) =>
    BlogPostModel.findByIdAndUpdate(
      id,
      { deletedAt: new Date() },
      { returnDocument: "after" },
    ),
};
