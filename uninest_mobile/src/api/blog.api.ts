import { api } from "@/lib/api-client";
import type { BlogListResponse, BlogResponse } from "@/types/blog";

function buildBlogQuery(params?: { page?: number; limit?: number; q?: string }) {
  const query = new URLSearchParams();
  query.set("page", String(params?.page ?? 1));
  query.set("limit", String(params?.limit ?? 50));
  if (params?.q) query.set("q", params.q);
  return query.toString();
}

export const blogApi = {
  listPublic: (params?: { page?: number; limit?: number; q?: string }) =>
    api.get<BlogListResponse>(`/blogs?${buildBlogQuery(params)}`),

  getBySlug: (slug: string) => api.get<BlogResponse>(`/blogs/${slug}`),
};
