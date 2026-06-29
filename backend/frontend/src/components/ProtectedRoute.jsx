// components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { useShop } from '../context/ShopContext';

export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useShop();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

export default ProtectedRoute;