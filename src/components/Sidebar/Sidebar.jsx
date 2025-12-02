import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import authService from '../../services/authService'

function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = () => {
    authService.logout()
    navigate('/login', { replace: true })
  }

  const isActive = (path) => {
    return location.pathname === path
  }

  return (
    <motion.div 
      className="w-64 bg-white rounded-lg shadow-sm p-6 flex flex-col h-full"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-lg font-semibold text-gray-800 mb-6">My account</h2>
      
      <nav className="flex-1">
        <Link
          to="/profile"
          className={`block py-3 px-4 rounded-md mb-2 transition-colors ${
            isActive('/profile')
              ? 'bg-green-50 text-green-600 font-medium'
              : 'text-gray-700 hover:bg-gray-50'
          }`}
        >
          My account
        </Link>
        
        <Link
          to="/your-plan"
          className={`block py-3 px-4 rounded-md mb-2 transition-colors ${
            isActive('/your-plan')
              ? 'bg-green-50 text-green-600 font-medium'
              : 'text-gray-700 hover:bg-gray-50'
          }`}
        >
          Your Plan
        </Link>
        
        <Link
          to="/messages"
          className={`block py-3 px-4 rounded-md mb-2 transition-colors ${
            isActive('/messages') || location.pathname.startsWith('/messages/')
              ? 'bg-green-50 text-green-600 font-medium'
              : 'text-gray-700 hover:bg-gray-50'
          }`}
        >
          Messages
        </Link>
        
        <Link
          to="/contacts"
          className={`block py-3 px-4 rounded-md mb-2 transition-colors ${
            isActive('/contacts') || location.pathname.startsWith('/send-messages-from-contacts')
              ? 'bg-green-50 text-green-600 font-medium'
              : 'text-gray-700 hover:bg-gray-50'
          }`}
        >
          Contacts
        </Link>
      </nav>

      <motion.button
        onClick={handleLogout}
        className="flex items-center gap-2 text-red-600 hover:text-red-700 font-medium py-3 px-4 rounded-md hover:bg-red-50 transition-colors mt-auto"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        Log out
      </motion.button>
    </motion.div>
  )
}

export default Sidebar

