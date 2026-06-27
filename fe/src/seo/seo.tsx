import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { siteConfig, toAbsoluteUrl } from './config'

type MetaTag = {
  name?: string
  property?: string
  content: string
}

type SeoProps = {
  title?: string
  description?: string
  path?: string
  image?: string
  type?: string
  noIndex?: boolean
  keywords?: string[]
  structuredData?: Record<string, unknown> | Array<Record<string, unknown>>
}

const PAGE_OWNER = 'page'
const ROUTE_OWNER = 'route'

function upsertHeadTag(
  tagName: 'meta' | 'link' | 'script',
  selector: string,
  attributes: Record<string, string>,
  owner: string,
) {
  let element = document.head.querySelector<HTMLElement>(selector)

  if (!element) {
    element = document.createElement(tagName)
    document.head.appendChild(element)
  }

  element.setAttribute('data-seo-owner', owner)
  Object.entries(attributes).forEach(([key, value]) => {
    element?.setAttribute(key, value)
  })
}

function setMetaTag({ name, property, content }: MetaTag) {
  const selector = name
    ? `meta[name="${name}"]`
    : `meta[property="${property}"]`

  upsertHeadTag('meta', selector, {
    ...(name ? { name } : {}),
    ...(property ? { property } : {}),
    content,
  }, PAGE_OWNER)
}

function buildStructuredDataMarkup(
  value?: Record<string, unknown> | Array<Record<string, unknown>>,
) {
  if (!value) return ''

  if (Array.isArray(value)) {
    return JSON.stringify({
      '@context': 'https://schema.org',
      '@graph': value,
    })
  }

  return JSON.stringify(value)
}

export function Seo({
  title,
  description = siteConfig.defaultDescription,
  path = '/',
  image = siteConfig.defaultImage,
  type = 'website',
  noIndex = false,
  keywords,
  structuredData,
}: SeoProps) {
  useEffect(() => {
    const previousTitle = document.title
    const canonicalUrl = toAbsoluteUrl(path)
    const imageUrl = image.startsWith('http') ? image : toAbsoluteUrl(image)

    document.title = title || siteConfig.defaultTitle

    const pageMetaTags: MetaTag[] = [
      { name: 'description', content: description },
      {
        name: 'robots',
        content: noIndex ? 'noindex, nofollow' : 'index, follow',
      },
      {
        name: 'keywords',
        content: keywords?.join(', ') || '',
      },
      { property: 'og:title', content: title || siteConfig.defaultTitle },
      { property: 'og:description', content: description },
      { property: 'og:type', content: type },
      { property: 'og:url', content: canonicalUrl },
      { property: 'og:image', content: imageUrl },
      { property: 'og:site_name', content: siteConfig.name },
      { property: 'og:locale', content: siteConfig.locale },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: title || siteConfig.defaultTitle },
      { name: 'twitter:description', content: description },
      { name: 'twitter:image', content: imageUrl },
    ]

    pageMetaTags.forEach(setMetaTag)

    upsertHeadTag('link', 'link[rel="canonical"]', {
      rel: 'canonical',
      href: canonicalUrl,
    }, PAGE_OWNER)

    const markup = buildStructuredDataMarkup(structuredData)

    if (markup) {
      upsertHeadTag(
        'script',
        'script[type="application/ld+json"][data-seo-owner="page"]',
        {
          type: 'application/ld+json',
        },
        PAGE_OWNER,
      )

      const script = document.head.querySelector<HTMLScriptElement>(
        'script[type="application/ld+json"][data-seo-owner="page"]',
      )

      if (script) {
        script.textContent = markup
      }
    }

    return () => {
      document.title = previousTitle
      document.head
        .querySelectorAll('[data-seo-owner="page"]')
        .forEach((element) => element.remove())
    }
  }, [description, image, keywords, noIndex, path, structuredData, title, type])

  return null
}

export function RouteRobots() {
  const location = useLocation()

  useEffect(() => {
    const pathname = location.pathname
    const isPublicRoute =
      pathname === '/' ||
      pathname === '/phong' ||
      pathname.startsWith('/phong/')

    upsertHeadTag(
      'meta',
      'meta[name="robots"]',
      {
        name: 'robots',
        content: isPublicRoute ? 'index, follow' : 'noindex, nofollow',
      },
      ROUTE_OWNER,
    )
  }, [location.pathname])

  return null
}
