import { isAxiosError } from 'axios'

type ApiErrorBody = { message?: string }

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (!isAxiosError<ApiErrorBody>(error)) return fallback
  const message = error.response?.data?.message
  return typeof message === 'string' && message.length > 0 ? message : fallback
}
