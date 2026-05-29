import { MainLayout } from '@/layouts/main-layout'

export function AdminDashboardPage() {
  return (
    <MainLayout>
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-20">
        <h1 className="font-sans text-3xl font-bold text-foreground">Quản trị hệ thống</h1>
        <p className="mt-2 text-muted-foreground">
          Trang dành cho admin / nhân viên — sắp ra mắt.
        </p>
      </div>
    </MainLayout>
  )
}
