import { Route, Routes } from 'react-router-dom'
import { USER_ROLES } from '@/constants/roles'
import { paths } from '@/config/constants'
import { LoginPage, RegisterPage } from '@/features/auth'
import { ProtectedRoute } from '@/app/router/protected-route'
import { RoleRoute } from '@/app/router/role-route'
import { LandlordLayout } from '@/layouts/landlord-layout'
import { AdminDashboardPage } from '@/pages/admin-dashboard'
import { DashboardRedirectPage } from '@/pages/dashboard-redirect'
import { HomePage } from '@/pages/home'
import {
  LandlordDashboardPage,
  LandlordPlaceholderPage,
} from '@/features/landlord'
import { RoomManagementPage } from '@/features/room'
import { NotFoundPage } from '@/pages/not-found'
import { TenantDashboardPage } from '@/pages/tenant-dashboard'

export function AppRouter() {
  return (
    <Routes>
      <Route path={paths.home} element={<HomePage />} />
      <Route path={paths.login} element={<LoginPage />} />
      <Route path={paths.register} element={<RegisterPage />} />
      <Route path={paths.dashboard} element={<DashboardRedirectPage />} />
      <Route element={<ProtectedRoute />}>
        <Route
          element={<RoleRoute allowedRoles={[USER_ROLES.LANDLORD]} />}
        >
          <Route path={paths.landlordDashboard} element={<LandlordLayout />}>
            <Route index element={<LandlordDashboardPage />} />
            <Route path="phong" element={<RoomManagementPage />} />
            <Route
              path="nguoi-thue"
              element={<LandlordPlaceholderPage title="Người thuê" />}
            />
            <Route
              path="hoa-don"
              element={<LandlordPlaceholderPage title="Hóa đơn" />}
            />
            <Route
              path="tien-ich"
              element={<LandlordPlaceholderPage title="Tiện ích" />}
            />
            <Route
              path="cai-dat"
              element={<LandlordPlaceholderPage title="Cài đặt" />}
            />
          </Route>
        </Route>
        <Route element={<RoleRoute allowedRoles={[USER_ROLES.TENANT]} />}>
          <Route path={paths.tenantDashboard} element={<TenantDashboardPage />} />
        </Route>
        <Route
          element={
            <RoleRoute allowedRoles={[USER_ROLES.ADMIN, USER_ROLES.STAFF]} />
          }
        >
          <Route path={paths.adminDashboard} element={<AdminDashboardPage />} />
        </Route>
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
