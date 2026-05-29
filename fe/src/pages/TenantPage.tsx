import { LogoutButton } from '@/components/auth/LogoutButton'

export function TenantPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="mx-auto max-w-2xl">
        <div className="rounded-lg bg-white p-8 shadow-lg">
          <h1 className="mb-8 text-4xl font-bold text-gray-900">
            Trang Tenant
          </h1>
          
          <p className="mb-8 text-gray-600">
            Chào mừng bạn đến trang quản lý của người thuê nhà
          </p>

          <div className="mt-8">
            <LogoutButton />
          </div>
        </div>
      </div>
    </div>
  )
}
