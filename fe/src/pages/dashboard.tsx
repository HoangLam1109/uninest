import { MainLayout } from '@/layouts/main-layout'

export function DashboardPage() {
  return (
    <MainLayout>
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-20">
        <h1 className="font-sans text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="mt-2 text-muted-foreground">Trang quản lý — sắp ra mắt.</p>
      </div>
    </MainLayout>
  )
}
