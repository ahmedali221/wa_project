import { useRef, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Header from '../../components/Header'
import Stepper from '../../components/Stepper'
import { useAppContext } from '../../context/AppContext'
import contactsService from '../../services/contactsService'
import { parseExcelFile } from '../../utils/excelParser'
import upload_arrow from '../../assets/upload.png'

function UploadExcel() {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  const { whatsappConnected, setExcelData, setUploadedFileName } = useAppContext()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState('')
  const [contacts, setContacts] = useState([])
  const [loadingContacts, setLoadingContacts] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newContact, setNewContact] = useState({ name: '', phone: '', email: '' })
  const [lastUploadedFileName, setLastUploadedFileName] = useState(null)
  const [hasUploadedOnce, setHasUploadedOnce] = useState(false)
  const [hasNavigatedToStep3, setHasNavigatedToStep3] = useState(false)

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Prevent upload if user has already navigated to step 3
    if (hasNavigatedToStep3) {
      setError('You cannot upload Excel after navigating to step 3. Please go back to the Contacts page to manage your contacts.')
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      return
    }

    // Check with backend if user has already uploaded contacts
    try {
      const status = await contactsService.getUploadStatus()
      if (status.hasUploaded && hasNavigatedToStep3) {
        setError('You cannot upload Excel after navigating to step 3. Please go back to the Contacts page to manage your contacts.')
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
        setHasUploadedOnce(true)
        return
      }
    } catch (err) {
      // If check fails, still try to upload (backend will reject if needed)
      console.error('Error checking upload status:', err)
    }

    setError(null)
    setSuccessMessage('')
    setIsLoading(true)

    try {
      // Step 1: Parse Excel file in frontend
      const parseResult = await parseExcelFile(file)
      
      // Step 2: Send parsed contacts as JSON to backend
      const result = await contactsService.uploadContacts(parseResult.contacts, null)
      
      // Refresh contacts list
      await fetchContacts()
      
      // Format contacts for display (matching the expected format)
      const formattedContacts = parseResult.contacts.map((c, i) => ({
        id: `temp-${i}`,
        name: c.name,
        phone: c.phone,
      }))

      setExcelData(formattedContacts)
      setUploadedFileName(file.name) // From context
      
      // Store uploaded file name and mark as uploaded once (one-time upload in UploadExcel)
      localStorage.setItem('lastUploadedFileName', file.name)
      localStorage.setItem('excelUploadedOnce', 'true')
      setLastUploadedFileName(file.name)
      setHasUploadedOnce(true) // Update state to disable upload
      
      // Refresh upload status from backend
      await checkUploadStatus()
      
      const stats = result.statistics || {}
      setSuccessMessage(
        `✓ File "${file.name}" uploaded successfully! ` +
        `Imported ${stats.imported || formattedContacts.length} contacts. ` +
        (stats.duplicates > 0 ? `${stats.duplicates} duplicates skipped. ` : '') +
        (stats.errors > 0 ? `${stats.errors} errors. ` : '') +
        (parseResult.errors && parseResult.errors.length > 0 ? ` (${parseResult.errors.length} parsing errors)` : '')
      )
    } catch (err) {
      // Check if error is from backend (already uploaded)
      if (err.status === 409 || err.message?.includes('already uploaded')) {
        setError(err.message || 'You have already uploaded contacts. You can only upload once in this step. To upload a new file, please go to the Contacts page.')
        setHasUploadedOnce(true)
        await checkUploadStatus()
      } else {
        setError(err.message || 'Failed to process Excel file. Please try again.')
      }
      console.error('Error processing file:', err)
    } finally {
      setIsLoading(false)
      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  useEffect(() => {
    fetchContacts()
    checkUploadStatus()
    // Check for previously uploaded file name
    const storedFileName = localStorage.getItem('lastUploadedFileName')
    if (storedFileName) {
      setLastUploadedFileName(storedFileName)
    }
    // Check if user has navigated to step 3 before (prevents re-upload after step 3)
    const hasNavigated = localStorage.getItem('hasNavigatedToStep3')
    if (hasNavigated === 'true') {
      setHasNavigatedToStep3(true)
      setHasUploadedOnce(true) // Prevent upload if already navigated to step 3
    }
  }, [])

  const checkUploadStatus = async () => {
    try {
      const status = await contactsService.getUploadStatus()
      if (status.hasUploaded) {
        // Only set hasUploadedOnce if user hasn't navigated to step 3
        // If user has navigated to step 3, hasUploadedOnce is already set to true
        if (!hasNavigatedToStep3) {
          setHasUploadedOnce(true)
          // Also update localStorage for consistency
          localStorage.setItem('excelUploadedOnce', 'true')
          // Show info message to user
          setSuccessMessage(`You have already uploaded contacts (${status.contactsCount} contacts). You can clear all contacts to upload a new file.`)
        } else {
          setHasUploadedOnce(true) // Keep it true if navigated to step 3
          setSuccessMessage(`You have already uploaded contacts (${status.contactsCount} contacts). You cannot upload or modify Excel after navigating to step 3.`)
        }
      }
    } catch (err) {
      console.error('Error checking upload status:', err)
    }
  }

  const fetchContacts = async () => {
    try {
      setLoadingContacts(true)
      const response = await contactsService.getAllContacts()
      setContacts(response.contacts || [])
    } catch (err) {
      console.error('Error fetching contacts:', err)
    } finally {
      setLoadingContacts(false)
    }
  }

  const handleAddContact = async () => {
    if (!newContact.name.trim() || !newContact.phone.trim()) {
      setError('Name and Phone are required')
      return
    }

    try {
      setError('')
      setSuccessMessage('')
      // Remove email if empty string
      const contactData = {
        name: newContact.name.trim(),
        phone: newContact.phone.trim(),
        ...(newContact.email?.trim() ? { email: newContact.email.trim() } : {})
      }
      await contactsService.createContact(contactData)
      await fetchContacts()
      setNewContact({ name: '', phone: '', email: '' })
      setShowAddForm(false)
      setSuccessMessage('Contact added successfully')
    } catch (err) {
      setError(err.message || 'Failed to add contact')
    }
  }

  const handleDeleteContact = async (id) => {
    if (window.confirm('Are you sure you want to delete this contact?')) {
      try {
        await contactsService.deleteContact(id)
        await fetchContacts()
        
        // Check with backend if all contacts are deleted
        const status = await contactsService.getUploadStatus()
        if (!status.hasUploaded) {
          localStorage.removeItem('lastUploadedFileName')
          localStorage.removeItem('excelUploadedOnce')
          setLastUploadedFileName(null)
          // Only reset upload state if user hasn't navigated to step 3
          if (!hasNavigatedToStep3) {
            setHasUploadedOnce(false) // Reset upload state
          }
        }
      } catch (err) {
        setError(err.message || 'Failed to delete contact')
      }
    }
  }

  const handleClearAllContacts = async () => {
    // Prevent clearing if user has navigated to step 3
    if (hasNavigatedToStep3) {
      setError('You cannot clear contacts after navigating to step 3. Please go back to the Contacts page to manage your contacts.')
      return
    }

    if (!window.confirm('Are you sure you want to clear all contacts? This will allow you to upload a new Excel file.')) {
      return
    }

    try {
      setError('')
      setSuccessMessage('')
      setIsLoading(true)
      
      await contactsService.deleteAllContacts()
      await fetchContacts()
      
      // Clear local storage
      localStorage.removeItem('lastUploadedFileName')
      localStorage.removeItem('excelUploadedOnce')
      setLastUploadedFileName(null)
      
      // Reset upload state (user hasn't navigated to step 3, so it's safe)
      setHasUploadedOnce(false)
      
      setSuccessMessage('All contacts cleared. You can now upload a new Excel file.')
    } catch (err) {
      setError(err.message || 'Failed to clear contacts')
    } finally {
      setIsLoading(false)
    }
  }

  const handleButtonClick = () => {
    // Prevent clicking if already navigated to step 3
    if (hasNavigatedToStep3) {
      setError('You cannot upload Excel after navigating to step 3. Please go back to the Contacts page to manage your contacts.')
      return
    }
    // Prevent clicking if already uploaded
    if (hasUploadedOnce) {
      setError('You have already uploaded an Excel file. You can clear all contacts using the "Clear All Contacts" button to upload a new file.')
      return
    }
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
            className="w-80 flex-shrink-0"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1 }}
          >
            <Stepper activeStep={2} />
          </motion.div>

          {/* Middle Column - Upload Excel */}
          <motion.div 
            className="flex-1 flex flex-col items-center justify-center max-w-md"
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
              className="text-4xl font-bold text-black mb-2 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.4 }}
            >
              {hasUploadedOnce ? 'Excel File Uploaded' : 'Upload Excel File'}
            </motion.h1>
            
            {/* Subtitle based on upload status */}
            {hasUploadedOnce && (
              <motion.p 
                className="text-gray-600 mb-4 text-center max-w-md"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.5 }}
              >
                Your Excel file has been uploaded. You can add more contacts manually below.
              </motion.p>
            )}
            
            {/* Show uploaded file info if exists */}
            {lastUploadedFileName && hasUploadedOnce && (
              <motion.div 
                className="mb-6 px-5 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-blue-900 font-bold text-base mb-2">Excel File Already Uploaded</h3>
                    <div className="space-y-2 text-sm">
                      <p className="text-blue-800">
                        <span className="font-semibold">File:</span> <span className="font-mono">{lastUploadedFileName}</span>
                      </p>
                      {hasNavigatedToStep3 ? (
                        <div className="bg-white rounded-md p-3 border border-blue-100">
                          <p className="text-blue-900 font-medium mb-2">⚠️ Important:</p>
                          <ul className="list-disc list-inside space-y-1 text-blue-700 text-xs">
                            <li>You <strong>cannot</strong> upload a new Excel file after navigating to step 3</li>
                            <li>You <strong>cannot</strong> delete or clear the uploaded file</li>
                            <li>You <strong>cannot</strong> replace the existing contacts</li>
                          </ul>
                        </div>
                      ) : (
                        <div className="bg-white rounded-md p-3 border border-blue-100">
                          <p className="text-blue-900 font-medium mb-2">ℹ️ Note:</p>
                          <ul className="list-disc list-inside space-y-1 text-blue-700 text-xs">
                            <li>You can <strong>clear all contacts</strong> using the "Clear All Contacts" button to upload a new Excel file</li>
                            <li>After proceeding to step 3, you <strong>cannot</strong> upload or clear Excel anymore</li>
                            <li>Review your contacts carefully before continuing</li>
                          </ul>
                        </div>
                      )}
                      <div className="bg-green-50 rounded-md p-3 border border-green-200 mt-3">
                        <p className="text-green-900 font-medium mb-1">✅ To add new contacts:</p>
                        <ul className="list-disc list-inside space-y-1 text-green-800 text-xs">
                          <li>Use the <strong>"Add Contact"</strong> button below to add contacts manually</li>
                          <li>Or go to the <strong>Contacts page</strong> to manage your contacts</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Warning Message - only show if not uploaded */}
            {!hasUploadedOnce && !hasNavigatedToStep3 && (
              <motion.div 
                className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg max-w-md w-full"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="text-sm font-semibold text-yellow-800 mb-1">Important Notice</p>
                    <p className="text-sm text-yellow-700">
                      You can only upload an Excel file <strong>once</strong> in this step. After you proceed to the next step, you won't be able to upload again. Make sure to review your contacts before continuing.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Subtitle - only show if not uploaded */}
            {!hasUploadedOnce && !hasNavigatedToStep3 && (
              <motion.p 
                className="text-gray-600 mb-8 text-center max-w-md"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.5 }}
              >
                You can now send messages to the numbers from your Excel sheet
              </motion.p>
            )}

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
              disabled={hasUploadedOnce}
              className="hidden"
            />

            {/* Upload Button */}
            <motion.button 
              onClick={handleButtonClick}
              disabled={isLoading || hasUploadedOnce || hasNavigatedToStep3}
              className={`bg-[#1FAF6E] text-white px-8 py-4 rounded-md font-medium hover:bg-[#1FAF6E] transition-colors text-lg flex items-center gap-2 mb-6 ${
                isLoading || hasUploadedOnce || hasNavigatedToStep3 ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.6 }}
              whileHover={hasUploadedOnce || hasNavigatedToStep3 ? {} : { scale: 1.05 }}
              whileTap={hasUploadedOnce || hasNavigatedToStep3 ? {} : { scale: 0.95 }}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : hasUploadedOnce || hasNavigatedToStep3 ? (
                <>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Already Uploaded
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

            {/* Clear Button - only show if uploaded and not navigated to step 3 */}
            {hasUploadedOnce && !hasNavigatedToStep3 && contacts.length > 0 && (
              <motion.button 
                onClick={handleClearAllContacts}
                disabled={isLoading}
                className="bg-red-500 text-white px-6 py-3 rounded-md font-medium hover:bg-red-600 transition-colors text-sm flex items-center gap-2 mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.7 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Clear All Contacts
              </motion.button>
            )}

            {/* Note - only show if not uploaded and not navigated to step 3 */}
            {!hasUploadedOnce && !hasNavigatedToStep3 && (
              <>
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
              </>
            )}
          </motion.div>

          {/* Right Column - Contacts Table */}
          <motion.div 
            className="flex-1 flex flex-col min-h-0"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
          >
            {/* Contacts Table Section */}
            <div className="w-full h-full flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Contacts ({contacts.length})</h2>
                {!showAddForm && (
                  <motion.button
                    onClick={() => setShowAddForm(true)}
                    className="bg-[#1FAF6E] text-white px-4 py-2 rounded-md font-medium hover:bg-[#1a8f5a] transition-colors flex items-center gap-2 text-sm"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Contact
                  </motion.button>
                )}
              </div>

              {/* Contacts Table */}
              {loadingContacts ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                </div>
              ) : (
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden flex-1 flex flex-col min-h-0">
                  <div className="overflow-auto flex-1">
                    <table className="w-full">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                            Name
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                            Phone Number
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                            Email
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {/* Add New Contact Row */}
                        {showAddForm && (
                          <motion.tr
                            className="bg-green-50"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <td className="px-4 py-3 whitespace-nowrap">
                              <input
                                type="text"
                                placeholder="Name *"
                                value={newContact.name}
                                onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1FAF6E] text-sm"
                              />
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <input
                                type="text"
                                placeholder="Phone *"
                                value={newContact.phone}
                                onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1FAF6E] text-sm"
                              />
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <input
                                type="text"
                                placeholder="Email (optional)"
                                value={newContact.email}
                                onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1FAF6E] text-sm"
                              />
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                              <div className="flex gap-2">
                                <button
                                  onClick={handleAddContact}
                                  className="text-[#1FAF6E] hover:text-[#1a8f5a] font-medium"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() => {
                                    setShowAddForm(false)
                                    setNewContact({ name: '', phone: '', email: '' })
                                    setError('')
                                  }}
                                  className="text-gray-600 hover:text-gray-900"
                                >
                                  Cancel
                                </button>
                              </div>
                            </td>
                          </motion.tr>
                        )}
                        {contacts.length === 0 ? (
                          <tr>
                            <td colSpan="4" className="px-4 py-8 text-center text-gray-500">
                              No contacts yet. Add contacts manually or upload an Excel file.
                            </td>
                          </tr>
                        ) : (
                          contacts.map((contact, index) => (
                            <motion.tr
                              key={contact.id}
                              className="hover:bg-gray-50"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3, delay: index * 0.05 }}
                            >
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{contact.name}</td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{contact.phone}</td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{contact.email || '-'}</td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                                <button
                                  onClick={() => handleDeleteContact(contact.id)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  Delete
                                </button>
                              </td>
                            </motion.tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

            </div>
          </motion.div>
        </div>

        {/* Continue Button - Full Width */}
        {contacts.length > 0 && (
          <motion.div 
            className="mt-8 flex justify-end"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.button 
              onClick={() => {
                // Mark that user has navigated to step 3
                localStorage.setItem('hasNavigatedToStep3', 'true')
                setHasNavigatedToStep3(true)
                navigate('/send-messages')
              }}
              className="bg-[#1FAF6E] text-white px-12 py-4 rounded-md font-bold text-lg hover:bg-[#1a8f5a] transition-colors flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Continue
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </motion.button>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

export default UploadExcel
