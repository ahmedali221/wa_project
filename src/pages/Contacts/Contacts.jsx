import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import Sidebar from '../../components/Sidebar'
import contactsService from '../../services/contactsService'
import messagesService from '../../services/messagesService'

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

  useEffect(() => {
    fetchContacts()
    fetchStatistics()
  }, [])

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
      await contactsService.updateContact(id, editForm)
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
      await fetchContacts()
      setSelectedContacts(selectedContacts.filter(cId => cId !== id))
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
      await contactsService.createContact(newContact)
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

    setError('')
    setSuccessMessage('')
    setUploading(true)

    try {
      // Delete all existing contacts first
      await contactsService.deleteAllContacts()
      
      // Upload new Excel file
      const result = await contactsService.uploadExcel(file)
      
      // Refresh contacts list
      await fetchContacts()
      
      const stats = result.statistics || {}
      setSuccessMessage(
        `Excel file uploaded successfully! ` +
        `Imported ${stats.imported || 0} contacts. ` +
        (stats.duplicates > 0 ? `${stats.duplicates} duplicates skipped. ` : '') +
        (stats.errors > 0 ? `${stats.errors} errors. ` : '')
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
              <h1 className="text-2xl font-bold text-gray-800">Contacts</h1>
              <motion.button
                onClick={handleReuploadExcel}
                disabled={uploading}
                className={`bg-[#1FAF6E] text-white px-6 py-2 rounded-md font-medium hover:bg-[#1a8f5a] transition-colors flex items-center gap-2 ${
                  uploading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                whileHover={!uploading ? { scale: 1.02 } : {}}
                whileTap={!uploading ? { scale: 0.98 } : {}}
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
                    Re-upload Excel
                  </>
                )}
              </motion.button>
            </div>

            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileUpload}
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
            ) : contacts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No contacts found</p>
                <p className="text-gray-400 mt-2">Upload an Excel file to add contacts</p>
              </div>
            ) : (
              <div className="overflow-hidden">
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

