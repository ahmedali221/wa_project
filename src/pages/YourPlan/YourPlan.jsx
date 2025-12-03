import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import Header from '../../components/Header'
import Sidebar from '../../components/Sidebar'
import authService from '../../services/authService'
import packagesService from '../../services/packagesService'

function YourPlan() {
  const navigate = useNavigate()
  const [subscription, setSubscription] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        setLoading(true)
        setError('')
        
        if (!authService.isAuthenticated()) {
          navigate('/login')
          return
        }

        const response = await packagesService.getCurrentSubscription()
        
        if (response.subscription) {
          setSubscription(response.subscription)
        } else {
          setError(response.message || 'No active subscription found')
        }
      } catch (err) {
        setError(err.message || 'Failed to load subscription')
        console.error('Error fetching subscription:', err)
        if (err.status === 401) {
          navigate('/login')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchSubscription()
  }, [navigate])

  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  const calculateDays = (startDate, endDate) => {
    if (!startDate || !endDate) return 0
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffTime = Math.abs(end - start)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const handleUpgradePlan = () => {
    navigate('/')
  }

  const handleRenewPlan = () => {
    if (subscription?.package?.id) {
      navigate('/payment', { state: { packageId: subscription.package.id } })
    } else {
      navigate('/')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1FAF6E] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading plan information...</p>
        </div>
      </div>
    )
  }

  return (
    <motion.div 
      className="min-h-screen bg-gray-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Header showUserProfile={true} />
      
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to <span className="text-[#1FAF6E]">adpilot</span>
          </h1>
          <p className="text-gray-600">Track the delivery status of your WhatsApp messages.</p>
        </div>

        <div className="flex gap-8">
          {/* Sidebar */}
          <Sidebar />

          {/* Main Content */}
          <motion.div 
            className="flex-1 bg-white rounded-lg shadow-sm p-8 overflow-y-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Current Plan</h2>
              <div className="flex gap-3">
                <button
                  onClick={handleUpgradePlan}
                  className="bg-[#1FAF6E] text-white px-6 py-2 rounded-md font-medium hover:bg-[#1a8f5a] transition-colors"
                >
                  Upgrade Plan
                </button>
                <button
                  onClick={handleRenewPlan}
                  className="bg-white text-gray-700 px-6 py-2 rounded-md font-medium border border-gray-300 hover:bg-gray-50 transition-colors"
                >
                  Renew Plan
                </button>
              </div>
            </div>

            {error && !subscription ? (
              <div className="text-center py-12">
                <div className="mb-4">
                  <svg className="w-16 h-16 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-gray-600 mb-4">{error}</p>
                <button
                  onClick={handleUpgradePlan}
                  className="bg-[#1FAF6E] text-white px-6 py-3 rounded-md font-medium hover:bg-[#1a8f5a] transition-colors"
                >
                  Browse Plans
                </button>
              </div>
            ) : subscription ? (
              <>
                {/* Plan Summary */}
                <div className="mb-8 pb-6 border-b border-gray-200">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        Plan {subscription.package?.name || 'N/A'}
                      </h3>
                      <p className="text-lg text-gray-700">
                        {calculateDays(subscription.startDate, subscription.endDate)} Days
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600 mb-1">Start Date:</p>
                      <p className="text-gray-900 font-medium">{formatDate(subscription.startDate)}</p>
                      <p className="text-sm text-gray-600 mb-1 mt-3">End Date:</p>
                      <p className="text-gray-900 font-medium">{formatDate(subscription.endDate)}</p>
                    </div>
                  </div>
                </div>

                {/* Plan Details */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Plan Details</h3>
                  <p className="text-gray-600 mb-6">
                    {subscription.package?.description || 'Lorem ipsum dolor sit amet consectetur. Accumsan semper aliquam feugiat.'}
                  </p>
                  
                  <ul className="space-y-3">
                    <li className="flex items-center text-gray-700">
                      <svg className="w-5 h-5 text-[#1FAF6E] mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {subscription.messagesLimit || 0} Messages
                    </li>
                    <li className="flex items-center text-gray-700">
                      <svg className="w-5 h-5 text-[#1FAF6E] mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {subscription.messagesRemaining || 0} Messages Remaining
                    </li>
                    <li className="flex items-center text-gray-700">
                      <svg className="w-5 h-5 text-[#1FAF6E] mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {subscription.messagesUsed || 0} Messages Used
                    </li>
                    {subscription.charactersLimit && (
                      <li className="flex items-center text-gray-700">
                        <svg className="w-5 h-5 text-[#1FAF6E] mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {subscription.charactersLimit.toLocaleString()} Characters Limit Per Message
                      </li>
                    )}
                    {subscription.package?.price && (
                      <li className="flex items-center text-gray-700">
                        <svg className="w-5 h-5 text-[#1FAF6E] mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Price: ${subscription.package.price} {subscription.package.currency ? `(${subscription.package.currency})` : '(USD)'}
                      </li>
                    )}
                  </ul>
                </div>

                {/* Status Badge */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Status:</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      subscription.status === 'ACTIVE' 
                        ? 'bg-green-100 text-green-800' 
                        : subscription.status === 'EXPIRED'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {subscription.status}
                    </span>
                    {subscription.paymentStatus && (
                      <>
                        <span className="text-sm text-gray-600 ml-4">Payment:</span>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          subscription.paymentStatus === 'PAID' 
                            ? 'bg-green-100 text-green-800' 
                            : subscription.paymentStatus === 'PENDING'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {subscription.paymentStatus}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </>
            ) : null}
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}

export default YourPlan

