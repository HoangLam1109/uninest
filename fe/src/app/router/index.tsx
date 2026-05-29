import { Route, Routes } from 'react-router-dom'
import { paths } from '@/config/constants'
import { LoginPage, RegisterPage } from '@/features/auth'
import { HomePage } from '@/pages/home'
import { NotFoundPage } from '@/pages/not-found'

export function AppRouter() {
  return (
    <Routes>
      <Route path={paths.home} element={<HomePage />} />
      <Route path={paths.login} element={<LoginPage />} />
      <Route path={paths.register} element={<RegisterPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
