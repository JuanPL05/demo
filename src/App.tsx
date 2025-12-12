import { useState, useEffect } from 'react'
import { HomePage } from '@/pages/HomePage'
import { AdminPage } from '@/pages/AdminPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { JudgePage } from '@/pages/JudgePage'

type Route = 'home' | 'admin' | 'dashboard' | 'judge'

function App() {
  const [currentRoute, setCurrentRoute] = useState<Route>('home')
  const [judgeToken, setJudgeToken] = useState<string>('')

  useEffect(() => {
    const path = window.location.pathname
    const hash = window.location.hash

    if (path.includes('/judge/')) {
      const token = path.split('/judge/')[1]
      if (token) {
        setJudgeToken(token)
        setCurrentRoute('judge')
      }
    } else if (hash.includes('#/judge/')) {
      const token = hash.split('#/judge/')[1]
      if (token) {
        setJudgeToken(token)
        setCurrentRoute('judge')
      }
    }
  }, [])

  const navigate = (route: Route, token?: string) => {
    setCurrentRoute(route)
    if (token) {
      setJudgeToken(token)
    }
    
    if (route === 'judge' && token) {
      window.history.pushState({}, '', `#/judge/${token}`)
    } else if (route === 'home') {
      window.history.pushState({}, '', '/')
    } else {
      window.history.pushState({}, '', `#/${route}`)
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