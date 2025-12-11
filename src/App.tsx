import { useState } from 'react'
import { HomePage } from '@/pages/HomePage'
import { AdminPage } from '@/pages/AdminPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { JudgePage } from '@/pages/JudgePage'

type Route = 'home' | 'admin' | 'dashboard' | 'judge'

function App() {
  const [currentRoute, setCurrentRoute] = useState<Route>('home')
  const [judgeToken, setJudgeToken] = useState<string>('')

  const navigate = (route: Route, token?: string) => {
    setCurrentRoute(route)
    if (token) {
      setJudgeToken(token)
    }
  }

  return (
    <>
      {currentRoute === 'home' && <HomePage navigate={navigate} />}
      {currentRoute === 'admin' && <AdminPage navigate={navigate} />}
      {currentRoute === 'dashboard' && <DashboardPage navigate={navigate} />}
      {currentRoute === 'judge' && <JudgePage token={judgeToken} navigate={navigate} />}
    </>
  )
}

export default App