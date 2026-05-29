import { AppProviders } from '@/app/providers'
import { AuthBootstrap } from '@/app/router/auth-bootstrap'
import { AppRouter } from '@/app/router'

function App() {
  return (
    <AppProviders>
      <AuthBootstrap>
        <AppRouter />
      </AuthBootstrap>
    </AppProviders>
  )
}

export default App
