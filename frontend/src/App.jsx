import { useState } from 'react'
import { Button } from "@/components/ui/button"
import Landing from './pages/landing'
import { ThemeProvider } from '@/components/theme-provider'
import Login from './pages/login'
import Register from './pages/register'
import Dashboard from './pages/dashboard'
import { AuthProvider } from './contexts/auth-context'
import { ModeToggle } from './components/mode-toggler'


function App() {
  // const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-background flex items-center justify-center font-mona-sans">
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <AuthProvider>
          {/* <ModeToggle /> */}
          <Landing />
        </AuthProvider>
      </ThemeProvider>
    </div>
  )
}

export default App
