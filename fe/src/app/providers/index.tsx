import type { ReactNode } from 'react'
import { Toaster } from '@/components/ui/sonner'
import { QueryProvider } from './query-provider'
import { RouterProvider } from './router-provider'

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <RouterProvider>
        {children}
        <Toaster />
      </RouterProvider>
    </QueryProvider>
  )
}
