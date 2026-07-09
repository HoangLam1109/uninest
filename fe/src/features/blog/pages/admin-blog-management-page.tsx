import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Eye,
  FileText,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'
import { getApiErrorMessage } from '@/lib/api-error'
import { blogApi } from '../api/blog.api'
import type { BlogPost } from '../types/blog.type'
import { formatBlogDate } from '../utils/blog'

type BlogFormState = {
  title: string
  excerpt: string
  content: string
  isPublished: boolean
}

const emptyForm: BlogFormState = {
  title: '',
  excerpt: '',
  content: '',
  isPublished: false,
}

function normalize(value: string) {
  return value.trim().toLowerCase()
}

export function AdminBlogManagementPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null)
  const [deletingPost, setDeletingPost] = useState<BlogPost | null>(null)
  const [form, setForm] = useState<BlogFormState>(emptyForm)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [removeCoverImage, setRemoveCoverImage] = useState(false)

  const blogsQuery = useQuery({
    queryKey: ['blog-admin-posts'],
    queryFn: async () => {
      const { data } = await blogApi.listAdmin({ limit: 100 })
      return data
    },
  })

  useEffect(() => {
    if (!selectedImage) {
      setPreviewUrl(null)
      return
    }

    const objectUrl = URL.createObjectURL(selectedImage)
    setPreviewUrl(objectUrl)

    return () => {
      URL.revokeObjectURL(objectUrl)
    }
  }, [selectedImage])

  const posts = blogsQuery.data?.data ?? []
  const keyword = normalize(search)
  const filteredPosts = posts.filter((post) => {
    if (!keyword) return true

    return [post.title, post.slug, post.excerpt ?? '', post.authorName].some((value) =>
      normalize(value).includes(keyword),
    )
  })

  const publishedCount = posts.filter((post) => post.isPublished).length
  const draftCount = posts.length - publishedCount

  const createMutation = useMutation({
    mutationFn: async () => {
      const { data } = await blogApi.create({
        title: form.title,
        excerpt: form.excerpt,
        content: form.content,
        isPublished: form.isPublished,
        image: selectedImage,
      })
      return data.data
    },
    onSuccess: () => {
      toast.success('Da tao bai viet moi')
      void queryClient.invalidateQueries({ queryKey: ['blog-admin-posts'] })
      void queryClient.invalidateQueries({ queryKey: ['blog-posts'] })
      closeForm()
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Không thể tạo bài viết mới'))
    },
  })

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!editingPost) throw new Error('Missing blog post')

      const { data } = await blogApi.update(editingPost._id, {
        title: form.title,
        excerpt: form.excerpt,
        content: form.content,
        isPublished: form.isPublished,
        image: selectedImage,
        removeCoverImage,
      })
      return data.data
    },
    onSuccess: () => {
      toast.success('Đã cập nhật bài viết')
      void queryClient.invalidateQueries({ queryKey: ['blog-admin-posts'] })
      void queryClient.invalidateQueries({ queryKey: ['blog-posts'] })
      closeForm()
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Không thể cập nhật bài viết'))
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await blogApi.delete(id)
    },
    onSuccess: () => {
      toast.success('Đã xóa bài viết')
      void queryClient.invalidateQueries({ queryKey: ['blog-admin-posts'] })
      void queryClient.invalidateQueries({ queryKey: ['blog-posts'] })
      setDeletingPost(null)
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Không thể xóa bài viết'))
    },
  })

  const publishMutation = useMutation({
    mutationFn: async ({ id, isPublished }: { id: string; isPublished: boolean }) => {
      const { data } = isPublished ? await blogApi.publish(id) : await blogApi.unpublish(id)
      return data.data
    },
    onSuccess: (post) => {
      toast.success(post.isPublished ? 'Đã xuất bản bài viết' : 'Đã chuyển bài viết về nháp')
      void queryClient.invalidateQueries({ queryKey: ['blog-admin-posts'] })
      void queryClient.invalidateQueries({ queryKey: ['blog-posts'] })
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Không thể đổi trạng thái bài viết'))
    },
  })

  function openCreate() {
    setEditingPost(null)
    setForm(emptyForm)
    setSelectedImage(null)
    setRemoveCoverImage(false)
    setFormOpen(true)
  }

  function openEdit(post: BlogPost) {
    setEditingPost(post)
    setForm({
      title: post.title,
      excerpt: post.excerpt ?? '',
      content: post.content,
      isPublished: post.isPublished,
    })
    setSelectedImage(null)
    setRemoveCoverImage(false)
    setFormOpen(true)
  }

  function closeForm() {
    setFormOpen(false)
    setEditingPost(null)
    setForm(emptyForm)
    setSelectedImage(null)
    setRemoveCoverImage(false)
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null
    setSelectedImage(file)

    if (file) {
      setRemoveCoverImage(false)
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!form.title.trim() || !form.content.trim()) {
      toast.error('Vui lòng nhập tiêu đề và nội dung bài viết')
      return
    }

    if (editingPost) {
      updateMutation.mutate()
      return
    }

    createMutation.mutate()
  }

  const currentImageUrl =
    previewUrl ??
    (removeCoverImage ? null : editingPost?.coverImageUrl ?? null)

  return (
    <div className="min-h-svh bg-slate-50 px-4 py-6 md:px-6 lg:px-8 xl:px-10 2xl:px-12">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 xl:max-w-[1360px]">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase text-primary">Admin</p>
            <h1 className="mt-1 text-2xl font-bold text-slate-950 md:text-3xl">
              Quản lý blog
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-500 md:text-base">
              Tạo, chỉnh sửa, đăng bài và quản lý nội dung blog hiển thị trên trang
              chủ UniNest.
            </p>
          </div>
          <Button type="button" size="lg" onClick={openCreate}>
            <Plus className="size-5" />
            Tạo bài viết
          </Button>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-primary/10 bg-white p-5">
            <p className="text-sm text-slate-500">Tổng bài viết</p>
            <p className="mt-2 text-3xl font-bold text-slate-950">{posts.length}</p>
          </div>
          <div className="rounded-xl border border-primary/10 bg-white p-5">
            <p className="text-sm text-slate-500">Đã xuất bản</p>
            <p className="mt-2 text-3xl font-bold text-emerald-600">{publishedCount}</p>
          </div>
          <div className="rounded-xl border border-primary/10 bg-white p-5">
            <p className="text-sm text-slate-500">Bản nháp</p>
            <p className="mt-2 text-3xl font-bold text-amber-600">{draftCount}</p>
          </div>
        </section>

        <section className="rounded-xl border border-primary/10 bg-white">
          <div className="border-b border-primary/10 p-4">
            <div className="relative max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="h-10 border border-primary/10 py-2 pl-9 shadow-none"
                placeholder="Tim theo tieu de, slug..."
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            {blogsQuery.isLoading ? (
              <div className="flex min-h-60 items-center justify-center gap-3 text-sm font-semibold text-slate-500">
                <Loader2 className="size-4 animate-spin text-primary" />
                Đang tải bài viết...
              </div>
            ) : blogsQuery.isError ? (
              <div className="px-6 py-12 text-center">
                <p className="font-semibold text-red-600">
                  Không thể tải danh sách bài viết.
                </p>
              </div>
            ) : filteredPosts.length > 0 ? (
              <table className="w-full min-w-[900px] text-left">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Bài viết</th>
                    <th className="px-4 py-3 font-semibold">Slug</th>
                    <th className="px-4 py-3 font-semibold">Trạng thái</th>
                    <th className="px-4 py-3 font-semibold">ập nhật</th>
                    <th className="px-4 py-3 font-semibold">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-primary/10">
                  {filteredPosts.map((post) => (
                    <tr key={post._id} className="align-top">
                      <td className="px-4 py-4">
                        <div className="flex gap-4">
                          <div className="h-16 w-24 overflow-hidden rounded-xl bg-slate-100">
                            {post.coverImageUrl ? (
                              <img
                                src={post.coverImageUrl}
                                alt={post.title}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center text-xs font-semibold uppercase text-slate-400">
                                No image
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="line-clamp-2 font-semibold text-slate-900">
                              {post.title}
                            </p>
                            <p className="mt-1 line-clamp-2 text-sm text-slate-500">
                              {post.excerpt || post.content}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-500">{post.slug}</td>
                      <td className="px-4 py-4">
                        <button
                          type="button"
                          onClick={() =>
                            publishMutation.mutate({
                              id: post._id,
                              isPublished: !post.isPublished,
                            })
                          }
                          disabled={publishMutation.isPending}
                          className={`rounded-full px-3 py-1 text-xs font-bold ${
                            post.isPublished
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {post.isPublished ? 'Đã xuất bản' : 'Bản nháp'}
                        </button>
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-500">
                        <p>{formatBlogDate(post.updatedAt)}</p>
                        <p className="mt-1 text-xs text-slate-400">Tác giả: {post.authorName}</p>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-8"
                            onClick={() => window.open(`/blog/${post.slug}`, '_blank')}
                          >
                            <Eye className="size-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-8"
                            onClick={() => openEdit(post)}
                          >
                            <Pencil className="size-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-8 text-red-500 hover:text-red-600"
                            onClick={() => setDeletingPost(post)}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="px-6 py-12 text-center text-sm font-semibold text-slate-500">
                Chưa có bài viết nào phù hợp.
              </div>
            )}
          </div>
        </section>
      </div>

      <Modal
        open={formOpen}
        onClose={closeForm}
        className="max-h-[calc(100svh-2rem)] max-w-3xl overflow-y-auto"
      >
        <div className="flex items-start justify-between gap-3 border-b border-border pb-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-primary">
              {editingPost ? 'Chỉnh sửa blog' : 'Tạo bài viết mới'}
            </p>
            <h2 className="mt-1 text-lg font-bold text-foreground">
              {editingPost ? editingPost.title : 'Nội dung blog UniNest'}
            </h2>
          </div>
          <button
            type="button"
            className="flex size-9 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
            aria-label="Dong"
            onClick={closeForm}
          >
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
              Tiêu đề <span className="text-red-500">*</span>
            </label>
            <Input
              value={form.title}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, title: event.target.value }))
              }
              className="h-11 border border-primary/10 shadow-none"
              placeholder="Nhập tiêu đề bài viết"
              required
            />
          </div>

          <div className="grid gap-4 md:grid-cols-[1.4fr_0.8fr]">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                Mô tả ngắn
              </label>
              <textarea
                value={form.excerpt}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, excerpt: event.target.value }))
                }
                className="h-28 w-full resize-none rounded-xl border border-primary/10 px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="Tóm tắt ngắn để hiển thị ở danh sách blog"
              />
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-semibold text-slate-700">
                Ảnh đại diện
              </label>
              <label className="flex cursor-pointer items-center justify-center rounded-2xl border border-dashed border-primary/20 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500 transition-colors hover:border-primary/40 hover:bg-primary/5">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
                Ảnh blog
              </label>

              {currentImageUrl ? (
                <div className="overflow-hidden rounded-2xl border border-primary/10">
                  <img
                    src={currentImageUrl}
                    alt="Preview"
                    className="h-44 w-full object-cover"
                  />
                </div>
              ) : (
                <div className="flex h-44 items-center justify-center rounded-2xl border border-primary/10 bg-slate-50 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                  Chưa có ảnh
                </div>
              )}

              {(currentImageUrl || selectedImage) ? (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setSelectedImage(null)
                    if (editingPost?.coverImageUrl) {
                      setRemoveCoverImage(true)
                    }
                  }}
                >
                  Xóa ảnh đại diện
                </Button>
              ) : null}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
              Nội dung <span className="text-red-500">*</span>
            </label>
            <textarea
              value={form.content}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, content: event.target.value }))
              }
              className="h-72 w-full resize-y rounded-xl border border-primary/10 px-3 py-3 text-sm leading-6 outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="Nhập nội dung bài viết..."
              required
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
              Trạng thái
            </label>
            <select
              value={form.isPublished ? 'published' : 'draft'}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  isPublished: event.target.value === 'published',
                }))
              }
              className="h-11 w-full rounded-xl border border-primary/10 bg-white px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="draft">Bản nháp</option>
              <option value="published">Xuất bản ngay</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
            <Button type="button" variant="outline" onClick={closeForm}>
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {createMutation.isPending || updateMutation.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Đang lưu...
                </>
              ) : editingPost ? (
                <>
                  <Pencil className="size-4" />
                  Cập nhật bài viết
                </>
              ) : (
                <>
                  <FileText className="size-4" />
                  Tạo bài viết 
                </>
              )}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={deletingPost !== null}
        onClose={() => setDeletingPost(null)}
        className="max-w-md"
      >
        <div className="flex items-start justify-between gap-3 border-b border-border pb-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-red-500">
              Xác nhận xóa
            </p>
            <h2 className="mt-1 text-lg font-bold text-foreground">
              Xóa bài viết?
            </h2>
          </div>
          <button
            type="button"
            className="flex size-9 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
            aria-label="Đóng"
            onClick={() => setDeletingPost(null)}
          >
            <X className="size-5" />
          </button>
        </div>

        <p className="mt-4 text-sm leading-6 text-slate-600">
          Bài viết{' '}
          <span className="font-semibold text-slate-950">{deletingPost?.title}</span>{' '}
          sẽ bị xóa khỏi hệ thống.
        </p>

        <div className="mt-6 flex items-center justify-end gap-3 border-t border-border pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => setDeletingPost(null)}
          >
            Hủy
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700"
            disabled={deleteMutation.isPending}
            onClick={() => {
              if (deletingPost) {
                deleteMutation.mutate(deletingPost._id)
              }
            }}
          >
            {deleteMutation.isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Đang xóa...
              </>
            ) : (
              'Xóa bài viết'
            )}
          </Button>
        </div>
      </Modal>
    </div>
  )
}
