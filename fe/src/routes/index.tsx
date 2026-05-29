import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { LoginPage, RegisterPage } from '@/components/auth'
import { HomePage } from '@/pages/HomePage'
import { TenantPage } from '@/pages/TenantPage'
import { DashboardPage } from '@/pages/landlord/DashboardPage'
import { RoomManagementPage } from '@/pages/landlord/RoomManagementPage'
import { TenantsPage } from '@/pages/landlord/TenantsPage'
import { InvoicesPage } from '@/pages/landlord/InvoicesPage'
import { UtilitiesPage } from '@/pages/landlord/UtilitiesPage'
import { SettingsPage } from '@/pages/landlord/SettingsPage'
import { paths } from './paths'

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={paths.home} element={<HomePage />} />
        <Route path={paths.login} element={<LoginPage />} />
        <Route path={paths.register} element={<RegisterPage />} />
        <Route path={paths.tenant} element={<TenantPage />} />
        <Route path={paths.landlord} element={<DashboardPage />} />
        <Route path={paths.landlordRooms} element={<RoomManagementPage />} />
        <Route path={paths.landlordTenants} element={<TenantsPage />} />
        <Route path={paths.landlordInvoices} element={<InvoicesPage />} />
        <Route path={paths.landlordUtilities} element={<UtilitiesPage />} />
        <Route path={paths.landlordSettings} element={<SettingsPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export { paths } from './paths'
