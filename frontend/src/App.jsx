import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from './contexts/auth-context';
import Routing from './components/Routing';
import { GoogleOAuthProvider } from '@react-oauth/google';


function App() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center font-space-grotesk">
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <GoogleOAuthProvider clientId='1034638916922-m87ikgv2679tj17bnb7skda96l3s98g1.apps.googleusercontent.com'>
          <AuthProvider>
            <Routing />
          </AuthProvider>
        </GoogleOAuthProvider>
      </ThemeProvider>
    </div>
  );
}

export default App;
