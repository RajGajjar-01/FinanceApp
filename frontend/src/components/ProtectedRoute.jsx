import { Navigate } from 'react-router';
import { useAuth } from '../contexts/auth-context';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
