import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import authService from '../../services/authService'

function Header({ showUserProfile = false }) {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const currentUser = authService.getCurrentUser()
    const authenticated = authService.isAuthenticated()
    setUser(currentUser)
    setIsAuthenticated(authenticated)
  }, [])

  const handleLogout = () => {
    authService.logout()
    setUser(null)
    setIsAuthenticated(false)
    navigate('/login', { replace: true })
  }

  // Generate initials from user's name
  const getInitials = (name) => {
    if (!name) return 'U'
    const parts = name.trim().split(' ')
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }

  // Get first name for greeting
  const getFirstName = (name) => {
    if (!name) return 'User'
    return name.trim().split(' ')[0]
  }

  const shouldShowProfile = showUserProfile || isAuthenticated

  return (
    <motion.header 
      className="w-full bg-white border-b border-gray-100 shadow-sm"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1 }}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link to="/">
          <motion.div 
            className="text-[#1FAF6E] text-2xl font-bold cursor-pointer"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            Logo
          </motion.div>
        </Link>
        
        <nav className="hidden md:flex items-center gap-8">
          <Link 
            to="/" 
            className="text-gray-700 hover:text-[#1FAF6E] transition-colors font-medium relative group"
          >
            Home
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#1FAF6E] transition-all group-hover:w-full"></span>
          </Link>
          <Link 
            to="/about" 
            className="text-gray-700 hover:text-[#1FAF6E] transition-colors font-medium relative group"
          >
            About
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#1FAF6E] transition-all group-hover:w-full"></span>
          </Link>
          <Link 
            to="/how-it-works" 
            className="text-gray-700 hover:text-[#1FAF6E] transition-colors font-medium relative group"
          >
            How it works
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#1FAF6E] transition-all group-hover:w-full"></span>
          </Link>
        </nav>

        {shouldShowProfile && user ? (
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-3 bg-green-50 px-4 py-2 rounded-full">
              <div className="w-9 h-9 bg-[#1FAF6E] rounded-full flex items-center justify-center text-white font-semibold text-sm">
                {getInitials(user.name)}
              </div>
              <span className="text-gray-700 font-medium">Welcome, {getFirstName(user.name)}</span>
            </div>
            <Link 
              to="/profile" 
              className="hidden md:block text-gray-700 hover:text-[#1FAF6E] transition-colors font-medium px-4 py-2 rounded-md hover:bg-green-50"
            >
              Profile
            </Link>
            <motion.button
              onClick={handleLogout}
              className="text-gray-600 hover:text-red-600 font-medium px-4 py-2 rounded-md hover:bg-red-50 transition-colors flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="hidden md:inline">Sign Out</span>
            </motion.button>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <Link 
              to="/login" 
              className="text-gray-700 hover:text-[#1FAF6E] transition-colors font-medium px-4 py-2 rounded-md hover:bg-green-50"
            >
              Login
            </Link>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                to="/signup"
                className="bg-[#1FAF6E] text-white px-6 py-3 rounded-md font-medium hover:bg-[#1a8f5a] transition-colors shadow-md hover:shadow-lg"
              >
                Try Now
              </Link>
            </motion.div>
          </div>
        )}
      </div>
    </motion.header>
  )
}

export default Header

