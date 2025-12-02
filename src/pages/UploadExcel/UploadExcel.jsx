import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Header from '../../components/Header'
import Stepper from '../../components/Stepper'
import { useAppContext } from '../../context/AppContext'
import contactsService from '../../services/contactsService'
import upload_arrow from '../../assets/upload.png'

function UploadExcel() {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  const { whatsappConnected, setExcelData, setUploadedFileName } = useAppContext()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState('')

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    setError(null)
    setSuccessMessage('')
    setIsLoading(true)

    try {
      // Upload file to backend
      const result = await contactsService.uploadExcel(file)
      
      // Fetch contacts from backend to display
      const contactsResponse = await contactsService.getAllContacts()
      const contacts = contactsResponse.contacts || []
      
      // Format contacts for display (matching the expected format)
      const formattedContacts = contacts.map((contact, index) => ({
        id: contact.id || index + 1,
        name: contact.name,
        phone: contact.phone,
      }))

      setExcelData(formattedContacts)
      setUploadedFileName(file.name)
      
      const stats = result.statistics || {}
      setSuccessMessage(
        `✓ File "${file.name}" uploaded successfully! ` +
        `Imported ${stats.imported || formattedContacts.length} contacts. ` +
        (stats.duplicates > 0 ? `${stats.duplicates} duplicates skipped. ` : '') +
        (stats.errors > 0 ? `${stats.errors} errors. ` : '')
      )
      
      // Navigate to next step after a short delay
      setTimeout(() => {
        navigate('/send-messages')
      }, 2000)
    } catch (err) {
      setError(err.message || 'Failed to upload Excel file. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleButtonClick = () => {
    // Demo mode: No need to check WhatsApp connection
    fileInputRef.current?.click()
  }

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
            <Stepper activeStep={2} />
          </motion.div>

          {/* Right Column - Upload Excel */}
          <motion.div 
            className="flex-1 flex flex-col items-center justify-center"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            {/* Back Button */}
            <div className="w-full max-w-md mb-6 flex justify-start">
              <motion.button 
                onClick={() => navigate('/connect-whatsapp')}
                className="bg-gray-100 text-gray-700 px-6 py-2 rounded-md font-medium hover:bg-gray-200 transition-colors flex items-center gap-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </motion.button>
            </div>
            {/* Excel Icon with Upload Arrow */}
            <motion.div 
              className="mb-8 relative"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1, delay: 0.3 }}
              whileHover={{ scale: 1.1 }}
            >
              <img src={upload_arrow} alt="Upload Excel" className="w-40 h-40" />
            </motion.div>

            {/* Title */}
            <motion.h1 
              className="text-4xl font-bold text-black mb-4 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.4 }}
            >
              Upload Excel File
            </motion.h1>

            {/* Subtitle */}
            <motion.p 
              className="text-gray-600 mb-8 text-center max-w-md"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.5 }}
            >
              You can now send messages to the numbers from your Excel sheet
            </motion.p>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div 
                  className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg max-w-md w-full"
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.8 }}
                >
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Success Message */}
            <AnimatePresence>
              {successMessage && (
                <motion.div 
                  className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg max-w-md w-full"
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.8 }}
                >
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm text-green-700">{successMessage}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileUpload}
              className="hidden"
            />

            {/* Upload Button */}
            <motion.button 
              onClick={handleButtonClick}
              disabled={isLoading}
              className={`bg-[#1FAF6E] text-white px-8 py-4 rounded-md font-medium hover:bg-[#1FAF6E] transition-colors text-lg flex items-center gap-2 mb-6 ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.6 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  Upload Excel Sheet
                </>
              )}
            </motion.button>

            {/* Note */}
            <p className="text-sm text-black text-center max-w-md">
              *Make sure your file is in Excel format (.xlsx, .xls) or CSV format (.csv) with columns:{' '}
              <span className="font-bold">Name</span> and <span className="font-bold">Phone</span>
            </p>
            
            {/* Additional Info */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg max-w-md">
              <p className="text-sm text-blue-700">
                <strong>Required columns:</strong>
                <br />
                • <strong>Name</strong> - Contact name
                <br />
                • <strong>Phone</strong> - Phone number with country code (e.g., +201234567890)
                <br />
                <br />
                <strong>Note:</strong> You will enter the message in the next step.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}

export default UploadExcel
