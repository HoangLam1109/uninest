import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { LoginPage, RegisterPage } from '@/components/auth'
import { HomePage } from '@/pages/HomePage'
import { paths } from './paths'

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={paths.home} element={<HomePage />} />
        <Route path={paths.login} element={<LoginPage />} />
        <Route path={paths.register} element={<RegisterPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export { paths } from './paths'
