import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import { USER_ROLES } from '@/constants/roles'
import { paths } from '@/config/constants'
import { ProtectedRoute } from '@/app/router/protected-route'
import { RoleRoute } from '@/app/router/role-route'
import { Loading } from '@/components/common/loading'
import { DashboardLayout } from '@/layouts/dashboard-layout'
import { LandlordLayout } from '@/layouts/landlord-layout'
import { TenantLayout } from '@/layouts/tenant-layout'
import { adminSidebarConfig } from '@/features/admin/data'
import { staffSidebarConfig } from '@/features/staff/data'

const AdminDashboardPage = lazy(() =>
  import('@/features/admin/pages/admin-dashboard-page').then((module) => ({
    default: module.AdminDashboardPage,
  })),
)
const DashboardRedirectPage = lazy(() =>
  import('@/pages/dashboard-redirect').then((module) => ({
    default: module.DashboardRedirectPage,
  })),
)
const HomePage = lazy(() =>
  import('@/pages/home').then((module) => ({ default: module.HomePage })),
)
const ChatPage = lazy(() =>
  import('@/features/chat/pages/chat-page').then((module) => ({
    default: module.ChatPage,
  })),
)
const LandlordBookingsPage = lazy(() =>
  import('@/features/booking/pages/landlord-bookings-page').then((module) => ({
    default: module.LandlordBookingsPage,
  })),
)
const LandlordDashboardPage = lazy(() =>
  import('@/features/landlord/components/landlord-dashboard').then((module) => ({
    default: module.LandlordDashboardPage,
  })),
)
const LandlordPlaceholderPage = lazy(() =>
  import('@/features/landlord/components/landlord-placeholder').then((module) => ({
    default: module.LandlordPlaceholderPage,
  })),
)
const LandlordContractsPage = lazy(() =>
  import('@/features/contract/pages/landlord-contracts-page').then((module) => ({
    default: module.LandlordContractsPage,
  })),
)
const LandlordInvoicesPage = lazy(() =>
  import('@/features/invoice/pages/landlord-invoices-page').then((module) => ({
    default: module.LandlordInvoicesPage,
  })),
)
const LandlordTenantsPage = lazy(() =>
  import('@/features/landlord/components/landlord-tenants-page').then((module) => ({
    default: module.LandlordTenantsPage,
  })),
)
const LoginPage = lazy(() =>
  import('@/features/auth/pages/login-page').then((module) => ({
    default: module.LoginPage,
  })),
)
const NotFoundPage = lazy(() =>
  import('@/pages/not-found').then((module) => ({
    default: module.NotFoundPage,
  })),
)
const RegisterPage = lazy(() =>
  import('@/features/auth/pages/register-page').then((module) => ({
    default: module.RegisterPage,
  })),
)
const RoomDetailPage = lazy(() =>
  import('@/features/room/pages/room-detail-page').then((module) => ({
    default: module.RoomDetailPage,
  })),
)
const RoomListPage = lazy(() =>
  import('@/features/room/pages/room-list-page').then((module) => ({
    default: module.RoomListPage,
  })),
)
const RoomManagementPage = lazy(() =>
  import('@/features/room/pages/room-management-page').then((module) => ({
    default: module.RoomManagementPage,
  })),
)
const StaffDashboardPage = lazy(() =>
  import('@/features/staff/pages/staff-dashboard-page').then((module) => ({
    default: module.StaffDashboardPage,
  })),
)
const TenantBookingsPage = lazy(() =>
  import('@/features/booking/pages/tenant-bookings-page').then((module) => ({
    default: module.TenantBookingsPage,
  })),
)
const TenantContractsPage = lazy(() =>
  import('@/features/contract/pages/tenant-contracts-page').then((module) => ({
    default: module.TenantContractsPage,
  })),
)
const TenantDashboardPage = lazy(() =>
  import('@/features/tenant/pages/tenant-dashboard-page').then((module) => ({
    default: module.TenantDashboardPage,
  })),
)
const TenantFavoriteRoomsPage = lazy(() =>
  import('@/features/tenant/pages/tenant-favorite-rooms-page').then((module) => ({
    default: module.TenantFavoriteRoomsPage,
  })),
)
const TenantInvoiceDetailPage = lazy(() =>
  import('@/features/invoice/pages/tenant-invoice-detail-page').then((module) => ({
    default: module.TenantInvoiceDetailPage,
  })),
)
const TenantInvoicesPage = lazy(() =>
  import('@/features/invoice/pages/tenant-invoices-page').then((module) => ({
    default: module.TenantInvoicesPage,
  })),
)
const TenantMeterReadingsPage = lazy(() =>
  import('@/features/invoice/pages/tenant-meter-readings-page').then((module) => ({
    default: module.TenantMeterReadingsPage,
  })),
)

export function AppRouter() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path={paths.home} element={<HomePage />} />
        <Route path={paths.rooms} element={<RoomListPage />} />
        <Route path={paths.roomDetail} element={<RoomDetailPage />} />
        <Route path={paths.login} element={<LoginPage />} />
        <Route path={paths.register} element={<RegisterPage />} />
        <Route path={paths.dashboard} element={<DashboardRedirectPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<RoleRoute allowedRoles={[USER_ROLES.LANDLORD]} />}>
            <Route path={paths.landlordDashboard} element={<LandlordLayout />}>
              <Route index element={<LandlordDashboardPage />} />
              <Route path="phong" element={<RoomManagementPage />} />
              <Route path="dat-phong" element={<LandlordBookingsPage />} />
              <Route path="hop-dong" element={<LandlordContractsPage />} />
              <Route path="nguoi-thue" element={<LandlordTenantsPage />} />
              <Route path="hoa-don" element={<LandlordInvoicesPage />} />
              <Route path="tin-nhan" element={<ChatPage />} />
              <Route
                path="tien-ich"
                element={<LandlordPlaceholderPage title="Tien ich" />}
              />
            </Route>
          </Route>

          <Route element={<RoleRoute allowedRoles={[USER_ROLES.TENANT]} />}>
            <Route path={paths.tenantDashboard} element={<TenantLayout />}>
              <Route index element={<TenantDashboardPage />} />
              <Route path="dat-phong" element={<TenantBookingsPage />} />
              <Route path="hoa-don" element={<TenantInvoicesPage />} />
              <Route path="hoa-don/:id" element={<TenantInvoiceDetailPage />} />
              <Route path="chi-so" element={<TenantMeterReadingsPage />} />
              <Route path="phong-da-luu" element={<TenantFavoriteRoomsPage />} />
              <Route path="hop-dong" element={<TenantContractsPage />} />
              <Route path="tin-nhan" element={<ChatPage />} />
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
    </Suspense>
  )
}
