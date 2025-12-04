import { Navigate, useLocation } from 'react-router-dom'
import authService from '../../services/authService'

function ProtectedRoute({ children, requiredRole = null }) {
  const location = useLocation()
  
  // Check if user is authenticated
  if (!authService.isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Get current user
  const user = authService.getCurrentUser()
  
  // Check for required role
  if (requiredRole && user?.role !== requiredRole) {
    // Redirect to home or show unauthorized
    return <Navigate to="/" replace />
  }

  return children
}

export default ProtectedRoute

















