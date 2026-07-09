import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Loader2, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { MainLayout } from '@/layouts/main-layout'
import { Seo } from '@/seo/seo'
import { blogApi } from '../api/blog.api'
import { BlogCard } from '../components/blog-card'

function normalize(value: string) {
  return value.trim().toLowerCase()
}

export function BlogListPage() {
  const [search, setSearch] = useState('')

  const blogsQuery = useQuery({
    queryKey: ['blog-posts'],
    queryFn: async () => {
      const { data } = await blogApi.listPublic({ limit: 100 })
      return data
    },
  })

  const posts = blogsQuery.data?.data ?? []
  const keyword = normalize(search)
  const filteredPosts = posts.filter((post) => {
    if (!keyword) return true

    return [post.title, post.excerpt ?? '', post.content, post.authorName].some((value) =>
      normalize(value).includes(keyword),
    )
  })

  return (
    <MainLayout>
      <Seo
        title="Blog UniNest | Kinh nghiệm thuê phòng, quản lý nhà trọ và thông tin hữu ích"
        description="Cập nhật bài viết, kinh nghiệm thuê phòng, quản lý nhà trọ và thông tin hữu ích dành cho tenant và landlord trên UniNest."
        path="/blog"
        keywords={['blog UniNest', 'kinh nghiệm thuê phòng', 'quản lý nhà trọ']}
      />

      <section className="bg-[linear-gradient(135deg,rgba(14,165,233,0.12),rgba(255,255,255,0.96))]">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-16 lg:flex-row lg:items-end lg:justify-between lg:px-10 xl:px-20">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              UniNest Blog
            </p>
            <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950 md:text-5xl">
              Chia sẻ kinh nghiệm thuê phòng, quản lý nhà trọ và thông tin hữu ích
            </h1>
            <p className="mt-4 text-base leading-7 text-slate-600 md:text-lg">
              Tổng hợp các bài viết, hướng dẫn và thông tin hữu ích trên UniNest. Cập nhật kiến thức, kinh nghiệm và mẹo vặt để giúp bạn thuê phòng và quản lý nhà trọ hiệu quả hơn.
            </p>
          </div>

          <div className="relative w-full max-w-md">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="h-12 rounded-full border border-primary/10 bg-white pl-11 shadow-none"
              placeholder="Tìm bài viết..."
            />
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-10 xl:px-20">
          {blogsQuery.isLoading ? (
            <div className="flex min-h-60 items-center justify-center gap-3 text-sm font-semibold text-slate-500">
              <Loader2 className="size-4 animate-spin text-primary" />
              Đang tải bài viết...
            </div>
          ) : blogsQuery.isError ? (
            <div className="rounded-3xl border border-red-100 bg-white px-6 py-10 text-center shadow-sm">
              <p className="text-base font-semibold text-red-600">
                Không thể tải danh sách blog lúc này.
              </p>
            </div>
          ) : filteredPosts.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {filteredPosts.map((post) => (
                <BlogCard key={post._id} post={post} />
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-primary/10 bg-white px-6 py-12 text-center shadow-sm">
              <p className="text-lg font-semibold text-slate-900">
                Chưa có bài viết phù hợp
              </p>
              <p className="mt-2 text-sm text-slate-500">
                Thử đổi từ khóa tìm kiếm hoặc quay lại sau để xem các bài viết mới.
              </p>
            </div>
          )}
        </div>
      </section>
    </MainLayout>
  )
}
