import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Header from '../../components/Header'
import Stepper from '../../components/Stepper'
import { useAppContext } from '../../context/AppContext'
import contactsService from '../../services/contactsService'
import message from '../../assets/send.png'

function SendMessages() {
  const navigate = useNavigate()
  const { excelData, whatsappConnected, setExcelData } = useAppContext()
  const [loading, setLoading] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newContact, setNewContact] = useState({ name: '', phone: '', email: '' })
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [hasUploadedExcel, setHasUploadedExcel] = useState(false)

  useEffect(() => {
    // If no data in context, try to fetch from backend
    const fetchContacts = async () => {
      if (excelData.length === 0) {
        setLoading(true)
        try {
          // Check upload status first
          const uploadStatus = await contactsService.getUploadStatus()
          setHasUploadedExcel(uploadStatus.hasUploaded)
          
          const response = await contactsService.getAllContacts()
          const contacts = response.contacts || []
          
          // Format contacts for display
          const formattedContacts = contacts.map((contact, index) => ({
            id: contact.id || index + 1,
            name: contact.name,
            phone: contact.phone,
          }))
          
          if (formattedContacts.length > 0) {
            setExcelData(formattedContacts)
          } else {
            // No contacts found, redirect to upload
            navigate('/upload-excel')
          }
        } catch (error) {
          console.error('Error fetching contacts:', error)
          navigate('/upload-excel')
        } finally {
          setLoading(false)
        }
      } else {
        // Check upload status even if we have data in context
        contactsService.getUploadStatus().then(status => {
          setHasUploadedExcel(status.hasUploaded)
        }).catch(err => {
          console.error('Error checking upload status:', err)
        })
      }
    }

    if (!whatsappConnected) {
      navigate('/connect-whatsapp')
    } else {
      fetchContacts()
    }
  }, [excelData, whatsappConnected, navigate, setExcelData])

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
      
      // Refresh contacts list
      const response = await contactsService.getAllContacts()
      const contacts = response.contacts || []
      
      // Format contacts for display
      const formattedContacts = contacts.map((contact, index) => ({
        id: contact.id || index + 1,
        name: contact.name,
        phone: contact.phone,
      }))
      
      setExcelData(formattedContacts)
      setNewContact({ name: '', phone: '', email: '' })
      setShowAddForm(false)
      setSuccessMessage('Contact added successfully')
    } catch (err) {
      setError(err.message || 'Failed to add contact')
    }
  }

  return (
    <motion.div 
      className="h-screen bg-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <Header showUserProfile={true} />

      <div className="max-w-7xl mx-auto px-6 py-32">
        <div className="flex flex-row gap-8">
          {/* Left Column - Stepper */}
          <motion.div 
            className="flex-1"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.0 }}
          >
            <Stepper activeStep={3} />
          </motion.div>

          {/* Right Column - Verify Messages */}
          <motion.div 
            className="flex-1 flex flex-col"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.0, delay: 0.2 }}
          >
            {/* Top Section */}
            <motion.div 
              className="flex flex-col items-center mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.0, delay: 0.3 }}
            >
              {/* Envelope Icon with motion lines */}
              <motion.div 
                className="relative mb-4 flex items-center justify-center"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                {/* Motion lines to the left */}
                <motion.div 
                  className="absolute left-0 flex gap-1.5"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                >
                  <motion.div 
                    className="w-1 h-12 bg-gray-300 rounded"
                    animate={{ height: [48, 64, 48] }}
                    transition={{ duration: 2.0, repeat: Infinity, delay: 0 }}
                  ></motion.div>
                  <motion.div 
                    className="w-1 h-16 bg-gray-300 rounded"
                    animate={{ height: [64, 48, 64] }}
                    transition={{ duration: 2.0, repeat: Infinity, delay: 0.2 }}
                  ></motion.div>
                  <motion.div 
                    className="w-1 h-12 bg-gray-300 rounded"
                    animate={{ height: [48, 64, 48] }}
                    transition={{ duration: 2.0, repeat: Infinity, delay: 0.4 }}
                  ></motion.div>
                </motion.div>
                <img src={message} alt="Send Message" className="w-32 h-32 relative z-10" />
              </motion.div>

              {/* Small Send Message Button */}
              <button className="bg-gray-100 text-gray-600 px-4 py-2 rounded-md text-sm mb-6 flex items-center gap-2 hover:bg-gray-200 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                Send Message
              </button>

              {/* Title */}
              <h1 className="text-4xl font-bold text-black mb-2 text-center">
                Uploaded Contacts
              </h1>

              {/* Subtitle */}
              <p className="text-gray-600 text-center max-w-md">
                Review the contacts from your Excel file.
              </p>

              {/* Warning Message - Excel cannot be uploaded in step 3 */}
              {hasUploadedExcel && (
                <motion.div 
                  className="mt-4 mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg max-w-md w-full mx-auto"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                >
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p className="text-sm font-semibold text-yellow-800 mb-1">Note</p>
                      <p className="text-sm text-yellow-700">
                        You cannot upload or modify Excel files in this step. To manage contacts, go back to the Contacts page.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

            </motion.div>

            {/* Error Message */}
            {error && (
              <motion.div
                className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg max-w-md w-full mx-auto"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <p className="text-sm text-red-700">{error}</p>
              </motion.div>
            )}

            {/* Success Message */}
            {successMessage && (
              <motion.div
                className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg max-w-md w-full mx-auto"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <p className="text-sm text-green-700">{successMessage}</p>
              </motion.div>
            )}

            {/* Add Contact Button */}
            <div className="mb-4 flex justify-end">
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
                  Add New Contact
                </motion.button>
              )}
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden flex-1 flex flex-col">
              <div className="overflow-y-auto flex-1">
                <table className="w-full">
                  <thead className="bg-gray-100 sticky top-0">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">ID</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Name</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Phone Number</th>
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
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">New</td>
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
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="Phone *"
                              value={newContact.phone}
                              onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1FAF6E] text-sm"
                            />
                            <button
                              onClick={handleAddContact}
                              className="text-[#1FAF6E] hover:text-[#1a8f5a] font-medium px-3"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => {
                                setShowAddForm(false)
                                setNewContact({ name: '', phone: '', email: '' })
                                setError('')
                              }}
                              className="text-gray-600 hover:text-gray-900 px-3"
                            >
                              Cancel
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    )}
                    <AnimatePresence>
                      {excelData.map((msg, index) => (
                        <motion.tr 
                          key={msg.id} 
                          className="hover:bg-gray-50"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.8, delay: index * 0.1 }}
                        >
                        <td className="px-4 py-3 text-sm text-gray-900">{msg.id}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{msg.name}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{msg.phone}</td>
                      </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Navigation Buttons */}
            <motion.div 
              className="mt-6 flex justify-between gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.0, delay: 0.6 }}
            >
              <motion.button 
                onClick={() => {
                  // If user already uploaded Excel, go back to upload-excel page
                  // Otherwise, go back to connect-whatsapp
                  if (hasUploadedExcel) {
                    navigate('/upload-excel')
                  } else {
                    navigate('/connect-whatsapp')
                  }
                }}
                className="bg-gray-100 text-gray-700 px-8 py-4 rounded-md font-medium hover:bg-gray-200 transition-colors flex items-center gap-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </motion.button>
              
              <motion.button 
                onClick={() => navigate('/view-messages')}
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
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}

export default SendMessages

