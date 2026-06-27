import { siteConfig, toAbsoluteUrl } from './config'

type BreadcrumbItem = {
  name: string
  path: string
}

type FaqItem = {
  question: string
  answer: string
}

export function createOrganizationSchema() {
  return {
    '@type': 'Organization',
    name: siteConfig.organization.name,
    url: toAbsoluteUrl('/'),
    logo: toAbsoluteUrl('/logo.png'),
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: siteConfig.organization.phone,
      contactType: 'customer service',
      areaServed: 'VN',
      availableLanguage: ['vi'],
    },
    address: {
      '@type': 'PostalAddress',
      ...siteConfig.organization.address,
    },
  }
}

export function createWebsiteSchema() {
  return {
    '@type': 'WebSite',
    name: siteConfig.name,
    url: toAbsoluteUrl('/'),
    inLanguage: 'vi-VN',
    potentialAction: {
      '@type': 'SearchAction',
      target: `${toAbsoluteUrl('/phong')}?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  }
}

export function createFaqSchema(items: FaqItem[]) {
  return {
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  }
}

export function createBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: toAbsoluteUrl(item.path),
    })),
  }
}
