import { Outlet } from 'react-router-dom'
import { LandlordSidebar } from '@/features/landlord'

export function LandlordLayout() {
  return (
    <div className="min-h-svh bg-slate-50">
      <LandlordSidebar />
      <main className="min-h-svh pl-64">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 p-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
