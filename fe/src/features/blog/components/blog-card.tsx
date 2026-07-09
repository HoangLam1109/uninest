import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import type { BlogPost } from '../types/blog.type'
import { formatBlogDate, getBlogDetailPath } from '../utils/blog'

export function BlogCard({ post }: { post: BlogPost }) {
  return (
    <Card className="group h-full border-primary/10 transition-transform duration-200 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg">
      <Link to={getBlogDetailPath(post.slug)} className="flex h-full flex-col">
        <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
          {post.coverImageUrl ? (
            <img
              src={post.coverImageUrl}
              alt={post.title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/15 via-primary/5 to-white text-sm font-semibold uppercase tracking-[0.18em] text-primary/70">
              UniNest Blog
            </div>
          )}
        </div>

        <CardContent className="flex flex-1 flex-col gap-4">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary/70">
              {formatBlogDate(post.publishedAt ?? post.createdAt)}
            </p>
            <h2 className="line-clamp-2 text-xl font-bold text-slate-950">
              {post.title}
            </h2>
            <p className="text-sm text-slate-500">Tac gia: {post.authorName}</p>
          </div>

          <p className="line-clamp-3 text-sm leading-6 text-slate-600">
            {post.excerpt || post.content}
          </p>

          <div className="mt-auto inline-flex items-center gap-2 text-sm font-semibold text-primary">
            Xem chi tiết
            <ArrowRight className="size-4" />
          </div>
        </CardContent>
      </Link>
    </Card>
  )
}
