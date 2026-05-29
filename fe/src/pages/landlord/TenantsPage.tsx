import { LandlordLayout } from '@/components/landlord/LandlordLayout'

export function TenantsPage() {
  return (
    <LandlordLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white px-8 py-6 border-b border-gray-200">
          <h1 className="text-3xl font-bold text-gray-900">Người thuê</h1>
          <p className="text-gray-600 mt-1">Quản lý thông tin người thuê và hợp đồng</p>
        </div>

        <div className="px-8 py-6">
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <p className="text-gray-500 text-lg">Trang quản lý người thuê sẽ được code ở đây</p>
          </div>
        </div>
      </div>
    </LandlordLayout>
  )
}
