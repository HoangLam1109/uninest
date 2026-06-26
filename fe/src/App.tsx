import { AppProviders } from '@/app/providers'
import { AuthBootstrap } from '@/app/router/auth-bootstrap'
import { AppRouter } from '@/app/router'
import { RouteRobots } from '@/seo/seo'

function App() {
  return (
    <AppProviders>
      <AuthBootstrap>
        <RouteRobots />
        <AppRouter />
      </AuthBootstrap>
    </AppProviders>
  )
}

export default App
