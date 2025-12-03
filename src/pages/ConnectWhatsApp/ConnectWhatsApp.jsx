import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Header from '../../components/Header'
import Stepper from '../../components/Stepper'
import { useAppContext } from '../../context/AppContext'
import whatsappService from '../../services/whatsappService'
import authService from '../../services/authService'
import contactsService from '../../services/contactsService'
import scan_qr from '../../assets/scan_qr.png'
import qr from '../../assets/qr.png'

function ConnectWhatsApp() {
  const navigate = useNavigate()
  const { setWhatsappConnected, setWhatsappPhoneNumber } = useAppContext()
  
  const [connectionMethod, setConnectionMethod] = useState(null) // 'qr' or 'pairing'
  const [qrCode, setQrCode] = useState(null)
  const [phoneNumber, setPhoneNumber] = useState('')
  const [pairingCode, setPairingCode] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [status, setStatus] = useState('') // For status messages
  const [isChecking, setIsChecking] = useState(false)
  const [showPhoneNumberDialog, setShowPhoneNumberDialog] = useState(false)
  const [existingPhoneNumber, setExistingPhoneNumber] = useState(null)
  const [isDisconnecting, setIsDisconnecting] = useState(false)

  // Check for existing phone number on mount
  useEffect(() => {
    const checkExistingPhoneNumber = async () => {
      try {
        const profile = await authService.getProfile()
        if (profile.phoneNumber) {
          setExistingPhoneNumber(profile.phoneNumber)
          setShowPhoneNumberDialog(true)
        }
      } catch (err) {
        console.error('Error fetching profile:', err)
        // If not authenticated, redirect to login
        if (err.status === 401) {
          navigate('/login')
        }
      }
    }

    if (authService.isAuthenticated()) {
      checkExistingPhoneNumber()
    }
  }, [navigate])

  // Poll for connection status
  useEffect(() => {
    if (!connectionMethod) return

    const checkStatus = async () => {
      try {
        setIsChecking(true)
        const statusData = await whatsappService.getConnectionStatus()
        
        if (statusData.isConnected && statusData.phoneNumber) {
          // Connection successful
          setWhatsappConnected(true)
          setWhatsappPhoneNumber(statusData.phoneNumber)
          setStatus('Connected successfully!')
          
          // Update user data in localStorage with new phone number
          try {
            const profile = await authService.getProfile()
            const currentUser = authService.getCurrentUser()
            if (currentUser) {
              localStorage.setItem('user', JSON.stringify({
                ...currentUser,
                phoneNumber: profile.phoneNumber,
              }))
            }
          } catch (err) {
            console.error('Error updating user data:', err)
          }
          
          // Check if user has already uploaded Excel, if yes skip to send messages
          try {
            const uploadStatus = await contactsService.getUploadStatus()
            if (uploadStatus.hasUploaded && uploadStatus.contactsCount > 0) {
              // User already uploaded Excel, skip to send messages step
              setTimeout(() => {
                navigate('/send-messages')
              }, 2000)
            } else {
              // User hasn't uploaded Excel yet, go to upload step
              setTimeout(() => {
                navigate('/upload-excel')
              }, 2000)
            }
          } catch (err) {
            console.error('Error checking upload status:', err)
            // Default to upload step if check fails
            setTimeout(() => {
              navigate('/upload-excel')
            }, 2000)
          }
        }
      } catch (err) {
        console.error('Error checking status:', err)
      } finally {
        setIsChecking(false)
      }
    }

    // Check status every 3 seconds
    const interval = setInterval(checkStatus, 3000)
    
    // Initial check
    checkStatus()

    return () => clearInterval(interval)
  }, [connectionMethod, navigate, setWhatsappConnected, setWhatsappPhoneNumber])

  const handleUpdatePhoneNumber = async () => {
    setIsDisconnecting(true)
    setError('')
    
    try {
      // Disconnect existing WhatsApp connection
      await whatsappService.disconnect()
      setShowPhoneNumberDialog(false)
      // Reset state to allow new connection
      setExistingPhoneNumber(null)
    } catch (err) {
      console.error('Error disconnecting:', err)
      // Continue anyway - the new connection will override
      setShowPhoneNumberDialog(false)
      setExistingPhoneNumber(null)
    } finally {
      setIsDisconnecting(false)
    }
  }

  const handleKeepExistingPhoneNumber = async () => {
    setShowPhoneNumberDialog(false)
    // Check if already connected
    try {
      const statusData = await whatsappService.getConnectionStatus()
      if (statusData.isConnected && statusData.phoneNumber) {
        setWhatsappConnected(true)
        setWhatsappPhoneNumber(statusData.phoneNumber)
        
        // Check if user has already uploaded Excel, if yes skip to send messages
        try {
          const uploadStatus = await contactsService.getUploadStatus()
          if (uploadStatus.hasUploaded && uploadStatus.contactsCount > 0) {
            // User already uploaded Excel, skip to send messages step
            navigate('/send-messages')
          } else {
            // User hasn't uploaded Excel yet, go to upload step
            navigate('/upload-excel')
          }
        } catch (err) {
          console.error('Error checking upload status:', err)
          // Default to upload step if check fails
          navigate('/upload-excel')
        }
      }
    } catch (err) {
      console.error('Error checking connection status:', err)
    }
  }

  const handleMethodSelection = async (method) => {
    setConnectionMethod(method)
    setError('')
    setLoading(true)

    try {
      // Initialize WhatsApp client
      await whatsappService.initializeConnection()
      
      if (method === 'qr') {
        // Wait a bit for QR code to be generated
        setTimeout(async () => {
          try {
            const qrData = await whatsappService.getQRCode()
            if (qrData.qrCode) {
              setQrCode(qrData.qrCode)
              setStatus('Scan the QR code with your WhatsApp')
            } else {
              setError('Failed to generate QR code. Please try again.')
            }
          } catch (err) {
            setError(err.message || 'Failed to get QR code')
          } finally {
            setLoading(false)
          }
        }, 3000)
      } else {
        setLoading(false)
        setStatus('Enter your WhatsApp phone number')
      }
    } catch (err) {
      setError(err.message || 'Failed to initialize connection')
      setLoading(false)
    }
  }

  const handleRequestPairingCode = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const data = await whatsappService.requestPairingCode(phoneNumber)
      setPairingCode(data.pairingCode)
      setStatus('Enter this code in your WhatsApp app')
    } catch (err) {
      setError(err.message || 'Failed to request pairing code')
    } finally {
      setLoading(false)
    }
  }

  const handleRefreshQR = async () => {
    setError('')
    setLoading(true)
    setQrCode(null)

    try {
      await whatsappService.initializeConnection()
      
      setTimeout(async () => {
        try {
          const qrData = await whatsappService.getQRCode()
          if (qrData.qrCode) {
            setQrCode(qrData.qrCode)
            setStatus('Scan the QR code with your WhatsApp')
          } else {
            setError('Failed to generate QR code. Please try again.')
          }
        } catch (err) {
          setError(err.message || 'Failed to get QR code')
        } finally {
          setLoading(false)
        }
      }, 3000)
    } catch (err) {
      setError(err.message || 'Failed to refresh QR code')
      setLoading(false)
    }
  }

  const renderMethodSelection = () => (
    <motion.div 
      className="flex flex-col items-center gap-8"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Illustration */}
      <div className="mb-4 relative w-[200px] h-[200px]">
        <img src={scan_qr} alt="WhatsApp Connection" className="w-full relative z-10" />
        <motion.div 
          className="absolute top-5 right-0 transform -translate-y-1/2 translate-x-4 z-0"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 1, delay: 0.3, type: "spring" }}
        >
          <img src={qr} alt="QR Code" className="w-full h-full opacity-90" />
        </motion.div>
      </div>

      {/* Title */}
      <h1 className="text-4xl font-bold text-black mb-2 text-center">
        Connect Your WhatsApp
      </h1>

      {/* Subtitle */}
      <p className="text-gray-600 mb-6 text-center max-w-md">
        Choose your preferred method to connect your WhatsApp account
      </p>

      {/* Method Selection Cards */}
      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-2xl">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleMethodSelection('qr')}
          className="flex-1 bg-white border-2 border-[#1FAF6E] rounded-lg p-6 hover:bg-green-50 transition-colors"
        >
          <div className="flex flex-col items-center gap-3">
            <svg className="w-12 h-12 text-[#1FAF6E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900">Scan QR Code</h3>
            <p className="text-sm text-gray-600 text-center">
              Scan with WhatsApp on your phone
            </p>
          </div>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleMethodSelection('pairing')}
          className="flex-1 bg-white border-2 border-[#1FAF6E] rounded-lg p-6 hover:bg-green-50 transition-colors"
        >
          <div className="flex flex-col items-center gap-3">
            <svg className="w-12 h-12 text-[#1FAF6E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900">Pairing Code</h3>
            <p className="text-sm text-gray-600 text-center">
              Link with phone number
            </p>
          </div>
        </motion.button>
      </div>
    </motion.div>
  )

  const renderQRCode = () => (
    <motion.div 
      className="flex flex-col items-center gap-6"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <h1 className="text-4xl font-bold text-black mb-2 text-center">
        Scan QR Code
      </h1>

      {error && (
        <div className="w-full max-w-md bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {status && !error && (
        <p className="text-gray-600 text-center">{status}</p>
      )}

      {loading ? (
        <div className="flex flex-col items-center gap-4">
          <svg className="animate-spin w-12 h-12 text-[#1FAF6E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-gray-600">Generating QR Code...</p>
        </div>
      ) : qrCode ? (
        <div className="flex flex-col items-center gap-4">
          <div className="bg-white p-6 rounded-lg shadow-lg border-2 border-[#1FAF6E]">
            <img src={qrCode} alt="WhatsApp QR Code" className="w-64 h-64" />
          </div>
          
          {isChecking && (
            <div className="flex items-center gap-2 text-[#1FAF6E]">
              <svg className="animate-spin w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-sm">Waiting for scan...</span>
            </div>
          )}

          <button
            onClick={handleRefreshQR}
            className="text-[#1FAF6E] hover:text-[#188a57] font-medium text-sm"
          >
            Refresh QR Code
          </button>

          <button
            onClick={() => {
              setConnectionMethod(null)
              setQrCode(null)
              setError('')
            }}
            className="text-gray-600 hover:text-gray-800 font-medium text-sm mt-4"
          >
            ← Back to method selection
          </button>
        </div>
      ) : null}
    </motion.div>
  )

  const renderPairingCode = () => (
    <motion.div 
      className="flex flex-col items-center gap-6 w-full max-w-md"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <h1 className="text-4xl font-bold text-black mb-2 text-center">
        Link with Phone Number
      </h1>

      {error && (
        <div className="w-full bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {status && !error && (
        <p className="text-gray-600 text-center">{status}</p>
      )}

      {!pairingCode ? (
        <form onSubmit={handleRequestPairingCode} className="w-full space-y-4">
          <div>
            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
              WhatsApp Phone Number
            </label>
            <input
              type="tel"
              id="phoneNumber"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+201234567890"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1FAF6E] focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Include country code (e.g., +20 for Egypt)
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1FAF6E] text-white py-3 rounded-md font-medium hover:bg-[#188a57] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Requesting Code...' : 'Request Pairing Code'}
          </button>

          <button
            type="button"
            onClick={() => {
              setConnectionMethod(null)
              setPhoneNumber('')
              setError('')
            }}
            className="w-full text-gray-600 hover:text-gray-800 font-medium text-sm"
          >
            ← Back to method selection
          </button>
        </form>
      ) : (
        <div className="w-full space-y-6">
          <div className="bg-green-50 border-2 border-[#1FAF6E] rounded-lg p-8 text-center">
            <p className="text-sm text-gray-600 mb-4">Your Pairing Code:</p>
            <div className="text-5xl font-bold text-[#1FAF6E] tracking-wider">
              {pairingCode}
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-gray-700 mb-2 font-medium">How to use:</p>
            <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
              <li>Open WhatsApp on your phone</li>
              <li>Go to Settings → Linked Devices</li>
              <li>Tap "Link a Device"</li>
              <li>Choose "Link with phone number"</li>
              <li>Enter the code above</li>
            </ol>
          </div>

          {isChecking && (
            <div className="flex items-center justify-center gap-2 text-[#1FAF6E]">
              <svg className="animate-spin w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-sm">Waiting for confirmation...</span>
            </div>
          )}

          <button
            onClick={() => {
              setConnectionMethod(null)
              setPhoneNumber('')
              setPairingCode(null)
              setError('')
            }}
            className="w-full text-gray-600 hover:text-gray-800 font-medium text-sm"
          >
            ← Back to method selection
          </button>
        </div>
      )}
    </motion.div>
  )

  return (
    <motion.div 
      className="min-h-screen bg-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <Header showUserProfile={true} />

      <div className="max-w-7xl mx-auto px-6 py-32">
        <div className="flex flex-row gap-8">
          {/* Left Column - Stepper */}
          <motion.div 
            className="flex-1"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1 }}
          >
            <Stepper activeStep={1} />
          </motion.div>

          {/* Right Column - Connection UI */}
          <div className="flex-1 flex flex-col items-center justify-center">
            {!connectionMethod && renderMethodSelection()}
            {connectionMethod === 'qr' && renderQRCode()}
            {connectionMethod === 'pairing' && renderPairingCode()}
          </div>
        </div>
      </div>

      {/* Phone Number Dialog */}
      <AnimatePresence>
        {showPhoneNumberDialog && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !isDisconnecting && handleKeepExistingPhoneNumber()}
          >
            <motion.div
              className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Existing Phone Number
              </h2>
              
              <div className="mb-6">
                <p className="text-gray-600 mb-4">
                  You already have a phone number associated with your account:
                </p>
                <div className="bg-green-50 border-2 border-[#1FAF6E] rounded-lg p-4 mb-4">
                  <p className="text-lg font-semibold text-[#1FAF6E] text-center">
                    {existingPhoneNumber}
                  </p>
                </div>
                <p className="text-gray-600 text-sm">
                  Would you like to update this phone number by connecting a new WhatsApp account?
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleKeepExistingPhoneNumber}
                  disabled={isDisconnecting}
                  className="flex-1 bg-gray-100 text-gray-700 px-4 py-3 rounded-md font-medium hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Keep Current
                </button>
                <button
                  onClick={handleUpdatePhoneNumber}
                  disabled={isDisconnecting}
                  className="flex-1 bg-[#1FAF6E] text-white px-4 py-3 rounded-md font-medium hover:bg-[#1a8f5a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isDisconnecting ? (
                    <>
                      <svg className="animate-spin w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Disconnecting...
                    </>
                  ) : (
                    'Update Phone Number'
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default ConnectWhatsApp
