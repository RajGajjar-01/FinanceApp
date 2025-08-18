import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from './contexts/auth-context';
import Routing from './routes/Routing';

function App() {
  return (
    <div className="min-h-screen bg-background  font-space-grotesk">
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
          <AuthProvider>
              <Routing />
          </AuthProvider>
      </ThemeProvider>
    </div>
  );
}

export default App;
