import { Navigate } from 'react-router';
import { useAuth } from '../contexts/auth-context';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  return !user ? <Navigate to="/" replace />:children;
};

export default ProtectedRoute;
