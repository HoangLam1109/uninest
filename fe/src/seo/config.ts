import { env } from '@/config/env'

export const siteConfig = {
  name: env.appName,
  defaultTitle: 'UniNest | Tìm phòng trọ và căn hộ tại TP.HCM',
  defaultDescription:
    'UniNest giúp sinh viên và người đi làm tìm phòng trọ, studio, căn hộ và phòng ghép uy tín tại TP.HCM.',
  locale: 'vi_VN',
  defaultImage: '/hero.jpg',
  organization: {
    name: 'UniNest Vietnam',
    phone: '19006789',
    address: {
      streetAddress: '88 Nguyen Hue',
      addressLocality: 'Quan 1',
      addressRegion: 'Ho Chi Minh',
      addressCountry: 'VN',
    },
  },
} as const

export function getSiteUrl() {
  if (env.siteUrl) {
    return env.siteUrl.replace(/\/+$/, '')
  }

  if (typeof window !== 'undefined') {
    return window.location.origin
  }

  return ''
}

export function toAbsoluteUrl(path = '/') {
  const siteUrl = getSiteUrl()
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return siteUrl ? `${siteUrl}${normalizedPath}` : normalizedPath
}
