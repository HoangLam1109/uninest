import { api } from '@/lib/axios'
import type {
  BlogListResponse,
  BlogResponse,
  CreateBlogPostPayload,
  UpdateBlogPostPayload,
} from '../types/blog.type'

function buildBlogFormData(
  payload: CreateBlogPostPayload | UpdateBlogPostPayload,
) {
  const formData = new FormData()

  if (typeof payload.title === 'string') {
    formData.append('title', payload.title)
  }

  if (typeof payload.excerpt === 'string') {
    formData.append('excerpt', payload.excerpt)
  }

  if (typeof payload.content === 'string') {
    formData.append('content', payload.content)
  }

  if (typeof payload.isPublished === 'boolean') {
    formData.append('isPublished', String(payload.isPublished))
  }

  if ('removeCoverImage' in payload && typeof payload.removeCoverImage === 'boolean') {
    formData.append('removeCoverImage', String(payload.removeCoverImage))
  }

  if (payload.image instanceof File) {
    formData.append('image', payload.image)
  }

  return formData
}

export const blogApi = {
  listPublic: (params?: { page?: number; limit?: number; q?: string }) =>
    api.get<BlogListResponse>('/blogs', { params }),

  getBySlug: (slug: string) =>
    api.get<BlogResponse>(`/blogs/${slug}`),

  listAdmin: (params?: { page?: number; limit?: number; q?: string }) =>
    api.get<BlogListResponse>('/blogs/admin', { params }),

  create: (payload: CreateBlogPostPayload) =>
    api.post<BlogResponse>('/blogs/admin', buildBlogFormData(payload)),

  update: (id: string, payload: UpdateBlogPostPayload) =>
    api.put<BlogResponse>(`/blogs/admin/${id}`, buildBlogFormData(payload)),

  publish: (id: string) =>
    api.patch<BlogResponse>(`/blogs/admin/${id}/publish`),

  unpublish: (id: string) =>
    api.patch<BlogResponse>(`/blogs/admin/${id}/unpublish`),

  delete: (id: string) =>
    api.delete<{ success: boolean; message: string }>(`/blogs/admin/${id}`),
}
