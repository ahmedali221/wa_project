import { createContext, useContext, useState, useEffect } from 'react'
import authService from '../services/authService'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = () => {
      try {
        const token = localStorage.getItem('access_token')
        const userData = authService.getCurrentUser()
        
        if (token && userData) {
          setUser(userData)
          setIsAuthenticated(true)
        } else {
          setUser(null)
          setIsAuthenticated(false)
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
        setUser(null)
        setIsAuthenticated(false)
      } finally {
        setLoading(false)
      }
    }

    initAuth()
  }, [])

  // Login function
  const login = async (credentials) => {
    try {
      const data = await authService.login(credentials)
      const userData = authService.getCurrentUser()
      setUser(userData)
      setIsAuthenticated(true)
      return data
    } catch (error) {
      throw error
    }
  }

  // Logout function
  const logout = () => {
    authService.logout()
    setUser(null)
    setIsAuthenticated(false)
  }

  // Update user function
  const updateUser = (userData) => {
    setUser(userData)
    if (userData) {
      localStorage.setItem('user', JSON.stringify(userData))
    }
  }

  // Check if user is admin
  const isAdmin = () => {
    return user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN'
  }

  // Check if user is super admin
  const isSuperAdmin = () => {
    return user?.role === 'SUPER_ADMIN'
  }

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    updateUser,
    isAdmin,
    isSuperAdmin,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}


