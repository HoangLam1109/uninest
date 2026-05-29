import type { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { paths } from '@/routes/paths'

interface LandlordLayoutProps {
  children: ReactNode
}

export function LandlordLayout({ children }: LandlordLayoutProps) {
  const location = useLocation()

  const navItems = [
    {
      label: 'Tổng quan',
      icon: '📊',
      path: paths.landlord,
    },
    {
      label: 'Quản lý phòng',
      icon: '🏠',
      path: paths.landlordRooms,
    },
    {
      label: 'Người thuê',
      icon: '👥',
      path: paths.landlordTenants,
    },
    {
      label: 'Hóa đơn',
      icon: '📋',
      path: paths.landlordInvoices,
    },
    {
      label: 'Tiện ích',
      icon: '⚡',
      path: paths.landlordUtilities,
    },
    {
      label: 'Cài đặt',
      icon: '⚙️',
      path: paths.landlordSettings,
    },
  ]

  const isActive = (path: string) => {
    if (path === paths.landlord) {
      return location.pathname === paths.landlord
    }
    return location.pathname === path
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 shadow-sm">
        {/* Logo */}
        <div className="px-6 py-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">U</span>
            </div>
            <div>
              <p className="font-bold text-gray-900">UniNest</p>
              <p className="text-xs text-gray-500">Cho thuê Dashboard</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4">
          {navItems.map((item) => {
            const active = isActive(item.path)
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${
                  active
                    ? 'bg-orange-100 text-orange-600 font-semibold'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Add Tenant Button */}
        <div className="absolute bottom-6 left-4 right-4 px-2">
          <button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2">
            <span>👤</span>
            <span>Thêm người thuê mới</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  )
}
