export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL?.trim() || 'http://localhost:3000/api',
  appName: import.meta.env.VITE_APP_NAME ?? 'UniNest',
  siteUrl: import.meta.env.VITE_SITE_URL?.trim() || '',
} as const
