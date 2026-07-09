import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { MainLayout } from '@/layouts/main-layout'
import { Seo } from '@/seo/seo'
import { blogApi } from '../api/blog.api'
import { formatBlogDate } from '../utils/blog'

export function BlogDetailPage() {
  const { slug } = useParams<{ slug: string }>()

  const blogQuery = useQuery({
    queryKey: ['blog-post', slug],
    enabled: Boolean(slug),
    queryFn: async () => {
      const { data } = await blogApi.getBySlug(slug!)
      return data.data
    },
  })

  const post = blogQuery.data
  const paragraphs =
    post?.content
      .split(/\n{2,}/)
      .map((paragraph) => paragraph.trim())
      .filter(Boolean) ?? []

  return (
    <MainLayout>
      <Seo
        title={post ? `${post.title} | Blog UniNest` : 'Blog UniNest | Chi tiết bài viết'}
        description={post?.excerpt || 'Đọc bài viết hữu ích từ UniNest.'}
        path={slug ? `/blog/${slug}` : '/blog'}
        image={post?.coverImageUrl || undefined}
        type="article"
      />

      <section className="bg-slate-50 py-10 md:py-14">
        <div className="mx-auto max-w-4xl px-6 lg:px-10">
          <Button variant="outline" asChild>
            <Link to="/blog">
              <ArrowLeft className="size-4" />
              Quay lại blog
            </Link>
          </Button>

          {blogQuery.isLoading ? (
            <div className="flex min-h-80 items-center justify-center gap-3 text-sm font-semibold text-slate-500">
              <Loader2 className="size-4 animate-spin text-primary" />
              Đang tải bài viết...
            </div>
          ) : blogQuery.isError || !post ? (
            <div className="mt-8 rounded-3xl border border-red-100 bg-white px-6 py-10 text-center shadow-sm">
              <h1 className="text-2xl font-bold text-slate-950">
                Không tìm thấy bài viết
              </h1>
              <p className="mt-3 text-sm text-slate-500">
                Bài viết có thể đã bị xóa hoặc chưa được xuất bản.
              </p>
            </div>
          ) : (
            <article className="mt-8 overflow-hidden rounded-[2rem] border border-primary/10 bg-white shadow-sm">
              {post.coverImageUrl ? (
                <div className="aspect-[16/8] overflow-hidden bg-slate-100">
                  <img
                    src={post.coverImageUrl}
                    alt={post.title}
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : null}

              <div className="px-6 py-8 md:px-10 md:py-10">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary/70">
                  {formatBlogDate(post.publishedAt ?? post.createdAt)}
                </p>
                <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 md:text-4xl">
                  {post.title}
                </h1>
                <p className="mt-4 text-sm text-slate-500">
                  Tac gia: {post.authorName}
                </p>

                {post.excerpt ? (
                  <p className="mt-6 rounded-2xl bg-slate-50 px-5 py-4 text-base leading-7 text-slate-600">
                    {post.excerpt}
                  </p>
                ) : null}

                <div className="mt-8 space-y-5 text-base leading-8 text-slate-700">
                  {paragraphs.length > 0 ? (
                    paragraphs.map((paragraph, index) => (
                      <p key={`${post._id}-${index}`} className="whitespace-pre-line">
                        {paragraph}
                      </p>
                    ))
                  ) : (
                    <p className="whitespace-pre-line">{post.content}</p>
                  )}
                </div>
              </div>
            </article>
          )}
        </div>
      </section>
    </MainLayout>
  )
}
