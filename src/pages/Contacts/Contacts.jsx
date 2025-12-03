import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import Sidebar from '../../components/Sidebar'
import contactsService from '../../services/contactsService'
import messagesService from '../../services/messagesService'
import { parseExcelFile } from '../../utils/excelParser'

function Contacts() {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [selectedContacts, setSelectedContacts] = useState([])
  const [editingContact, setEditingContact] = useState(null)
  const [editForm, setEditForm] = useState({ name: '', phone: '', email: '' })
  const [showAddForm, setShowAddForm] = useState(false)
  const [newContact, setNewContact] = useState({ name: '', phone: '', email: '' })
  const [statistics, setStatistics] = useState({ total: 0, sent: 0, failed: 0, pending: 0 })
  const [uploadedFileName, setUploadedFileName] = useState(null)
  const [hasUploadedFromExcelStep, setHasUploadedFromExcelStep] = useState(false)

  useEffect(() => {
    fetchContacts()
    fetchStatistics()
    checkUploadStatus()
    // Check for previously uploaded file name
    const storedFileName = localStorage.getItem('lastUploadedFileName')
    if (storedFileName) {
      setUploadedFileName(storedFileName)
    }
  }, [])

  const checkUploadStatus = async () => {
    try {
      const status = await contactsService.getUploadStatus()
      if (status.hasUploaded && status.contactsCount > 0) {
        // Check if uploaded from UploadExcel step by checking localStorage
        const excelUploadedOnce = localStorage.getItem('excelUploadedOnce') === 'true'
        const lastUploadedFileName = localStorage.getItem('lastUploadedFileName')
        
        // Only set hasUploadedFromExcelStep if it was uploaded from UploadExcel step
        // (indicated by excelUploadedOnce flag and lastUploadedFileName)
        const uploadedFromExcelStep = excelUploadedOnce && lastUploadedFileName
        setHasUploadedFromExcelStep(uploadedFromExcelStep)
        
        // User has uploaded - show info message
        if (uploadedFromExcelStep) {
          setSuccessMessage(`You have ${status.contactsCount} contacts. You can only add new contacts manually from the table below.`)
        } else {
          setSuccessMessage(`You have ${status.contactsCount} contacts. You can upload a new Excel file which will replace all existing contacts.`)
        }
      } else {
        setHasUploadedFromExcelStep(false)
        setSuccessMessage('')
      }
    } catch (err) {
      console.error('Error checking upload status:', err)
    }
  }

  const fetchContacts = async () => {
    try {
      setLoading(true)
      const response = await contactsService.getAllContacts()
      setContacts(response.contacts || [])
    } catch (err) {
      setError(err.message || 'Failed to load contacts')
      console.error('Error fetching contacts:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchStatistics = async () => {
    try {
      const stats = await messagesService.getStatistics()
      setStatistics(stats)
    } catch (err) {
      console.error('Error fetching statistics:', err)
    }
  }

  const handleSelectAll = () => {
    if (selectedContacts.length === contacts.length) {
      setSelectedContacts([])
    } else {
      setSelectedContacts(contacts.map(c => c.id))
    }
  }

  const handleSelectContact = (id) => {
    if (selectedContacts.includes(id)) {
      setSelectedContacts(selectedContacts.filter(cId => cId !== id))
    } else {
      setSelectedContacts([...selectedContacts, id])
    }
  }

  const handleEdit = (contact) => {
    setEditingContact(contact.id)
    setEditForm({
      name: contact.name,
      phone: contact.phone,
      email: contact.email || '',
    })
  }

  const handleCancelEdit = () => {
    setEditingContact(null)
    setEditForm({ name: '', phone: '', email: '' })
  }

  const handleSaveEdit = async (id) => {
    try {
      setError('')
      // Remove email if empty string
      const contactData = {
        name: editForm.name.trim(),
        phone: editForm.phone.trim(),
        ...(editForm.email?.trim() ? { email: editForm.email.trim() } : {})
      }
      await contactsService.updateContact(id, contactData)
      await fetchContacts()
      setEditingContact(null)
      setEditForm({ name: '', phone: '', email: '' })
    } catch (err) {
      setError(err.message || 'Failed to update contact')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this contact?')) {
      return
    }

    try {
      setError('')
      await contactsService.deleteContact(id)
      setSelectedContacts(selectedContacts.filter(cId => cId !== id))
      await fetchContacts()
      
      // Check if all contacts are deleted after refresh
      const response = await contactsService.getAllContacts()
      if (response.contacts.length === 0) {
        localStorage.removeItem('lastUploadedFileName')
        setUploadedFileName(null)
        setHasUploadedFromExcelStep(false)
        // Refresh upload status
        await checkUploadStatus()
      }
    } catch (err) {
      setError(err.message || 'Failed to delete contact')
    }
  }

  const handleSendMessages = () => {
    if (selectedContacts.length === 0) {
      setError('Please select at least one contact to send messages to')
      return
    }

    setError('')
    // Get selected contacts data
    const selectedContactsData = contacts.filter(c => selectedContacts.includes(c.id))
    
    // Navigate to send messages page with selected contacts
    navigate('/send-messages-from-contacts', {
      state: { contacts: selectedContactsData },
    })
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

  const handleCancelAdd = () => {
    setShowAddForm(false)
    setNewContact({ name: '', phone: '', email: '' })
    setError('')
  }

  const handleReuploadExcel = () => {
    fileInputRef.current?.click()
  }

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Prevent upload if already uploaded from UploadExcel step
    if (hasUploadedFromExcelStep) {
      setError('You have already uploaded an Excel file in the Upload Excel step. You cannot upload another file. You can add contacts manually using the "Add New Contact" button.')
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      return
    }

    // Check with backend if user has contacts
    try {
      const status = await contactsService.getUploadStatus()
      if (status.hasUploaded) {
        // User has uploaded - show warning but allow upload (will replace)
        const confirmUpload = window.confirm(
          `You have ${status.contactsCount} contacts.\n\n` +
          `Uploading a new file will DELETE all existing contacts and replace them with the new ones.\n\n` +
          `Do you want to continue?`
        )
        if (!confirmUpload) {
          if (fileInputRef.current) {
            fileInputRef.current.value = ''
          }
          return
        }
      }
    } catch (err) {
      console.error('Error checking upload status:', err)
    }

    setError('')
    setSuccessMessage('')
    setUploading(true)

    try {
      // Step 1: Parse Excel file in frontend
      const parseResult = await parseExcelFile(file)
      
      // Step 2: Delete all existing contacts first (optional - you can change this to append instead)
      await contactsService.deleteAllContacts()
      
      // Step 3: Send parsed contacts as JSON to backend
      const result = await contactsService.uploadContacts(parseResult.contacts, null)
      
      // Refresh contacts list
      await fetchContacts()
      
      // Store uploaded file name in localStorage
      localStorage.setItem('lastUploadedFileName', file.name)
      // Clear the excelUploadedOnce flag since this upload is from Contacts page
      localStorage.removeItem('excelUploadedOnce')
      setUploadedFileName(file.name)
      
      // Refresh upload status
      await checkUploadStatus()
      // Note: This upload is from Contacts page, not from UploadExcel step
      // So we don't set hasUploadedFromExcelStep to true
      
      const stats = result.statistics || {}
      setSuccessMessage(
        `Excel file uploaded successfully! ` +
        `Imported ${stats.imported || 0} contacts. ` +
        (stats.duplicates > 0 ? `${stats.duplicates} duplicates skipped. ` : '') +
        (stats.errors > 0 ? `${stats.errors} errors. ` : '') +
        (parseResult.errors && parseResult.errors.length > 0 ? ` (${parseResult.errors.length} parsing errors)` : '')
      )
      
      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (err) {
      setError(err.message || 'Failed to upload Excel file. Please try again.')
      console.error('Error uploading Excel:', err)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header showUserProfile={true} />
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <Sidebar />

          {/* Main Content */}
          <motion.div
            className="flex-1 bg-white rounded-lg shadow-sm p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex justify-between items-center mb-6">
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-800 mr-4">Contacts</h1>
              </div>
              <div className="flex items-center gap-6">
                <motion.button
                  onClick={handleReuploadExcel}
                  disabled={uploading || hasUploadedFromExcelStep}
                  className={`bg-[#1FAF6E] text-white px-6 py-2 rounded-md font-medium hover:bg-[#1a8f5a] transition-colors flex items-center gap-2 ${
                    uploading || hasUploadedFromExcelStep ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  whileHover={!uploading && !hasUploadedFromExcelStep ? { scale: 1.02 } : {}}
                  whileTap={!uploading && !hasUploadedFromExcelStep ? { scale: 0.98 } : {}}
                >
                  {uploading ? (
                    <>
                      <svg className="animate-spin w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      {uploadedFileName ? 'Re-upload Excel' : 'Upload Excel'}
                    </>
                  )}
                </motion.button>
                {hasUploadedFromExcelStep && (
                  <div className="px-4 py-2 bg-green-50 border border-green-200 rounded-md">
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      <p className="text-sm text-green-800">
                        <strong>Excel already uploaded.</strong> You can only add new contacts manually from the table below.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileUpload}
              disabled={hasUploadedFromExcelStep}
              className="hidden"
            />

            {/* Statistics */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                <div className="text-sm text-green-600 font-medium">Total Contacts</div>
                <div className="text-2xl font-bold text-green-900">{contacts.length}</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                <div className="text-sm text-green-600 font-medium">Messages Sent</div>
                <div className="text-2xl font-bold text-green-900">{statistics.sent || 0}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="text-sm text-gray-600 font-medium">Messages Failed</div>
                <div className="text-2xl font-bold text-gray-900">{statistics.failed || 0}</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                <div className="text-sm text-green-600 font-medium">Total Messages</div>
                <div className="text-2xl font-bold text-green-900">{statistics.total || 0}</div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                <p className="text-gray-700">{error}</p>
              </div>
            )}

            {/* Success Message */}
            {successMessage && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <p className="text-green-700">{successMessage}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="mb-4 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <button
                  onClick={handleSelectAll}
                  className="text-sm text-gray-600 hover:text-gray-800"
                >
                  {selectedContacts.length === contacts.length ? 'Deselect All' : 'Select All'}
                </button>
                {selectedContacts.length > 0 && (
                  <span className="text-sm text-gray-600">
                    {selectedContacts.length} selected
                  </span>
                )}
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
              <motion.button
                onClick={handleSendMessages}
                disabled={selectedContacts.length === 0}
                className={`bg-[#1FAF6E] text-white px-6 py-2 rounded-md font-medium hover:bg-[#1a8f5a] transition-colors flex items-center gap-2 ${
                  selectedContacts.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                whileHover={selectedContacts.length > 0 ? { scale: 1.02 } : {}}
                whileTap={selectedContacts.length > 0 ? { scale: 0.98 } : {}}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                Send Messages ({selectedContacts.length})
              </motion.button>
            </div>

            {/* Contacts Table */}
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
              </div>
            ) : (
              <div className="overflow-hidden">
                {contacts.length === 0 && (
                  <div className="text-center py-6 mb-4">
                    <p className="text-gray-500 text-sm">No contacts yet. Add contacts manually or upload an Excel file.</p>
                  </div>
                )}
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        <input
                          type="checkbox"
                          checked={selectedContacts.length === contacts.length && contacts.length > 0}
                          onChange={handleSelectAll}
                          className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Phone Number
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
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
                        <td className="px-6 py-4 whitespace-nowrap"></td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="text"
                            placeholder="Name *"
                            value={newContact.name}
                            onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1FAF6E]"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="text"
                            placeholder="Phone *"
                            value={newContact.phone}
                            onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1FAF6E]"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="email"
                            placeholder="Email (optional)"
                            value={newContact.email}
                            onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1FAF6E]"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex gap-2">
                            <button
                              onClick={handleAddContact}
                              className="text-[#1FAF6E] hover:text-[#1a8f5a] font-medium"
                            >
                              Save
                            </button>
                            <button
                              onClick={handleCancelAdd}
                              className="text-gray-600 hover:text-gray-900"
                            >
                              Cancel
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    )}
                    {contacts.map((contact, index) => (
                      <motion.tr
                        key={contact.id}
                        className="hover:bg-gray-50"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedContacts.includes(contact.id)}
                            onChange={() => handleSelectContact(contact.id)}
                            className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {editingContact === contact.id ? (
                            <input
                              type="text"
                              value={editForm.name}
                              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                              className="w-full px-2 py-1 border border-gray-300 rounded-md"
                            />
                          ) : (
                            <div className="text-sm font-medium text-gray-900">{contact.name}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {editingContact === contact.id ? (
                            <input
                              type="text"
                              value={editForm.phone}
                              onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                              className="w-full px-2 py-1 border border-gray-300 rounded-md"
                            />
                          ) : (
                            <div className="text-sm text-gray-900">{contact.phone}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {editingContact === contact.id ? (
                            <input
                              type="email"
                              value={editForm.email}
                              onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                              className="w-full px-2 py-1 border border-gray-300 rounded-md"
                            />
                          ) : (
                            <div className="text-sm text-gray-500">{contact.email || '-'}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {editingContact === contact.id ? (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleSaveEdit(contact.id)}
                                className="text-[#1FAF6E] hover:text-[#1a8f5a] font-medium"
                              >
                                Save
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                className="text-gray-600 hover:text-gray-900"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEdit(contact)}
                                className="text-[#1FAF6E] hover:text-[#1a8f5a] font-medium"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(contact.id)}
                                className="text-gray-600 hover:text-gray-900"
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default Contacts

