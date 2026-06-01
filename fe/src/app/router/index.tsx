import { Route, Routes } from 'react-router-dom'
import { USER_ROLES } from '@/constants/roles'
import { paths } from '@/config/constants'
import { adminSidebarConfig, AdminDashboardPage } from '@/features/admin'
import { LoginPage, RegisterPage } from '@/features/auth'
import { ProtectedRoute } from '@/app/router/protected-route'
import { RoleRoute } from '@/app/router/role-route'
import { DashboardLayout } from '@/layouts/dashboard-layout'
import { LandlordLayout } from '@/layouts/landlord-layout'
import { DashboardRedirectPage } from '@/pages/dashboard-redirect'
import { HomePage } from '@/pages/home'
import {
  LandlordDashboardPage,
  LandlordPlaceholderPage,
} from '@/features/landlord'
import { RoomManagementPage } from '@/features/room'
import { staffSidebarConfig, StaffDashboardPage } from '@/features/staff'
import { tenantSidebarConfig, TenantDashboardPage } from '@/features/tenant'
import { NotFoundPage } from '@/pages/not-found'

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
          <Route
            path={paths.tenantDashboard}
            element={
              <DashboardLayout sidebar={tenantSidebarConfig} contentClassName="" />
            }
          >
            <Route index element={<TenantDashboardPage />} />
            <Route path="hoa-don" element={<TenantDashboardPage />} />
            <Route path="bao-tri" element={<TenantDashboardPage />} />
            <Route path="phong-da-luu" element={<TenantDashboardPage />} />
            <Route path="hop-dong" element={<TenantDashboardPage />} />
          </Route>
        </Route>
        <Route element={<RoleRoute allowedRoles={[USER_ROLES.ADMIN]} />}>
          <Route
            path={paths.adminDashboard}
            element={
              <DashboardLayout sidebar={adminSidebarConfig} contentClassName="" />
            }
          >
            <Route index element={<AdminDashboardPage />} />
            <Route path="nguoi-dung" element={<AdminDashboardPage />} />
            <Route path="kiem-duyet" element={<AdminDashboardPage />} />
            <Route path="bao-cao" element={<AdminDashboardPage />} />
            <Route path="ticket" element={<AdminDashboardPage />} />
          </Route>
        </Route>
        <Route element={<RoleRoute allowedRoles={[USER_ROLES.STAFF]} />}>
          <Route
            path={paths.staffDashboard}
            element={
              <DashboardLayout sidebar={staffSidebarConfig} contentClassName="" />
            }
          >
            <Route index element={<StaffDashboardPage />} />
            <Route path="ho-so" element={<StaffDashboardPage />} />
            <Route path="ho-tro" element={<StaffDashboardPage />} />
            <Route path="lich-hen" element={<StaffDashboardPage />} />
            <Route path="cong-viec" element={<StaffDashboardPage />} />
          </Route>
        </Route>
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
