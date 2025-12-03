import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Header from '../../components/Header'
import Sidebar from '../../components/Sidebar'
import whatsappService from '../../services/whatsappService'
import packagesService from '../../services/packagesService'
import contactsService from '../../services/contactsService'

function SendMessagesFromContacts() {
  const navigate = useNavigate()
  const location = useLocation()
  const [contacts, setContacts] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [messageText, setMessageText] = useState('')
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState('')
  const [subscription, setSubscription] = useState(null)
  const [loadingSubscription, setLoadingSubscription] = useState(true)
  const [selectedContacts, setSelectedContacts] = useState([])
  const [showCampaignOptions, setShowCampaignOptions] = useState(false)
  const [campaignResult, setCampaignResult] = useState(null)

  // Load subscription data
  useEffect(() => {
    const loadSubscription = async () => {
      try {
        setLoadingSubscription(true)
        const response = await packagesService.getCurrentSubscription()
        if (response.subscription) {
          setSubscription(response.subscription)
        }
      } catch (err) {
        console.error('Error loading subscription:', err)
      } finally {
        setLoadingSubscription(false)
      }
    }
    loadSubscription()
  }, [])

  useEffect(() => {
    // Get contacts from location state or fetch all contacts
    const contactsFromState = location.state?.contacts || []
    
    if (contactsFromState.length > 0) {
      // Format contacts for display
      const formattedContacts = contactsFromState.map((contact, index) => ({
        id: contact.id || index + 1,
        name: contact.name,
        phone: contact.phone,
        email: contact.email,
      }))

      setContacts(formattedContacts)
      // Select all by default
      setSelectedContacts(formattedContacts.map(c => c.id))
    } else {
      // No contacts in state, fetch all contacts from backend
      const fetchAllContacts = async () => {
        try {
          const response = await contactsService.getAllContacts()
          const allContacts = response.contacts || []
          
          if (allContacts.length === 0) {
            // No contacts at all, redirect to contacts page
            navigate('/contacts')
            return
          }

          // Format contacts for display
          const formattedContacts = allContacts.map((contact, index) => ({
            id: contact.id || index + 1,
            name: contact.name,
            phone: contact.phone,
            email: contact.email,
          }))

          setContacts(formattedContacts)
          // Select all by default
          setSelectedContacts(formattedContacts.map(c => c.id))
        } catch (err) {
          console.error('Error fetching contacts:', err)
          navigate('/contacts')
        }
      }
      
      fetchAllContacts()
    }
  }, [location.state, navigate])

  const handleSelectAll = () => {
    const allFilteredSelected = filteredContacts.every(c => selectedContacts.includes(c.id))
    if (allFilteredSelected) {
      // Deselect all filtered contacts
      setSelectedContacts(selectedContacts.filter(id => !filteredContacts.some(c => c.id === id)))
    } else {
      // Select all filtered contacts
      const filteredIds = filteredContacts.map(c => c.id)
      setSelectedContacts([...new Set([...selectedContacts, ...filteredIds])])
    }
  }

  const handleSelectContact = (id) => {
    if (selectedContacts.includes(id)) {
      setSelectedContacts(selectedContacts.filter(cId => cId !== id))
    } else {
      setSelectedContacts([...selectedContacts, id])
    }
  }

  const handleSendMessages = async () => {
    if (!messageText.trim()) {
      setSendError('Please enter a message to send')
      return
    }

    if (selectedContacts.length === 0) {
      setSendError('Please select at least one contact to send messages to')
      return
    }

    // Get selected contacts
    const contactsToSend = contacts.filter(c => selectedContacts.includes(c.id))

    // Check package limits
    if (subscription) {
      if (subscription.messagesRemaining < contactsToSend.length) {
        setSendError(`You only have ${subscription.messagesRemaining} messages remaining, but you're trying to send ${contactsToSend.length} messages. Please select fewer contacts or upgrade your package.`)
        return
      }

      if (messageText.length > subscription.charactersLimit) {
        setSendError(`Message is too long. Maximum ${subscription.charactersLimit} characters allowed, but your message has ${messageText.length} characters.`)
        return
      }
    }

    // Verify connection before sending
    try {
      const status = await whatsappService.getConnectionStatus()
      if (!status.isConnected) {
        setSendError('WhatsApp is not connected. Please connect your WhatsApp account first.')
        setTimeout(() => {
          navigate('/connect-whatsapp')
        }, 2000)
        return
      }
    } catch (err) {
      setSendError('Failed to verify WhatsApp connection. Please reconnect.')
      return
    }

    setSending(true)
    setSendError('')

    try {
      // Prepare messages to send (only selected ones)
      const messagesToSend = contactsToSend.map(c => ({
        phone: c.phone,
        message: messageText,
        name: c.name,
      }))

      // Send messages via API
      const result = await whatsappService.sendMessages(messagesToSend)
      
      // Show success message and options for next campaign
      const successCount = result.results.filter(r => r.status === 'success').length
      const totalSent = result.results.length
      
      // Store success data and show campaign options
      setCampaignResult({
        successCount,
        totalSent,
        contacts: contactsToSend
      })
      setShowCampaignOptions(true)
      setSendError('') // Clear any errors
    } catch (err) {
      setSendError(err.message || 'Failed to send messages')
      console.error('Error sending messages:', err)
    } finally {
      setSending(false)
    }
  }

  const handleConfirmNumbers = () => {
    // Keep current contacts and compose new message
    setMessageText('') // Clear message
    setShowCampaignOptions(false)
    // Contacts are already in state, just reset message
  }

  const handleKeepCurrent = () => {
    // Keep current contacts and compose new message (same as confirm)
    setMessageText('') // Clear message
    setShowCampaignOptions(false)
    // Contacts are already in state, just reset message
  }

  const handleGoToContacts = () => {
    // Navigate back to contacts page
    navigate('/contacts')
  }

  const filteredContacts = contacts.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <motion.div 
      className="min-h-screen bg-gray-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <Header showUserProfile={true} />

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <Sidebar />

          {/* Main Content */}
          <motion.div 
            className="flex-1 flex flex-col"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {/* Header Section */}
            <motion.div 
              className="mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Send Messages
              </h1>
              <p className="text-gray-600">
                Select contacts and enter your message to send.
              </p>
            </motion.div>

            {/* Message Textarea */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message Text
                {subscription && (
                  <span className="text-gray-500 ml-2">
                    ({messageText.length} / {subscription.charactersLimit} characters)
                  </span>
                )}
              </label>
              <textarea
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Enter your message here..."
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1FAF6E] focus:border-transparent resize-none"
                maxLength={subscription?.charactersLimit || undefined}
              />
              {subscription && (
                <div className="mt-2 flex items-center justify-between text-sm">
                  <span className={`${messageText.length > subscription.charactersLimit ? 'text-red-600' : 'text-gray-600'}`}>
                    {messageText.length} / {subscription.charactersLimit} characters
                  </span>
                  {subscription.messagesRemaining !== undefined && (
                    <span className="text-gray-600">
                      {subscription.messagesRemaining} messages remaining
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Error Message */}
            {sendError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">{sendError}</p>
              </div>
            )}

            {/* Campaign Success Modal */}
            <AnimatePresence>
              {showCampaignOptions && campaignResult && (
                <motion.div
                  className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowCampaignOptions(false)}
                >
                  <motion.div
                    className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="text-center mb-6">
                      <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                        <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        Messages Sent Successfully!
                      </h3>
                      <p className="text-gray-600">
                        Successfully sent <span className="font-bold text-green-600">{campaignResult.successCount}</span> out of <span className="font-bold">{campaignResult.totalSent}</span> messages.
                      </p>
                    </div>

                    <div className="space-y-3 mb-6">
                      <motion.button
                        onClick={handleConfirmNumbers}
                        className="w-full bg-[#1FAF6E] text-white px-6 py-3 rounded-md font-medium hover:bg-[#1a8f5a] transition-colors flex items-center justify-center gap-2"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Confirm Numbers & Compose New Message
                      </motion.button>

                      <motion.button
                        onClick={handleKeepCurrent}
                        className="w-full bg-green-50 text-[#1FAF6E] border-2 border-[#1FAF6E] px-6 py-3 rounded-md font-medium hover:bg-green-100 transition-colors flex items-center justify-center gap-2"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                        </svg>
                        Keep Current & Compose New Message
                      </motion.button>
                    </div>

                    <button
                      onClick={handleGoToContacts}
                      className="w-full text-gray-600 hover:text-gray-800 text-sm font-medium py-2"
                    >
                      Go Back to Contacts
                    </button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Send Button */}
            <div className="mb-6 flex gap-4">
              <button
                onClick={() => navigate('/contacts')}
                className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-md font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </button>
              
              <button
                onClick={handleSendMessages}
                disabled={sending || !messageText.trim() || selectedContacts.length === 0}
                className="flex-1 bg-[#1FAF6E] text-white px-6 py-3 rounded-md font-medium hover:bg-[#1a8f5a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {sending ? (
                  <>
                    <svg className="animate-spin w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                  </>
                ) : (
                  `Send to ${selectedContacts.length} Contact${selectedContacts.length !== 1 ? 's' : ''}`
                )}
              </button>
            </div>

            {/* Action Bar */}
            <div className="flex gap-4 mb-6">
              {/* Search Input */}
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Search contacts"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 pl-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1FAF6E] focus:border-transparent"
                />
                <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden flex-1 flex flex-col">
              <div className="overflow-y-auto flex-1">
                <table className="w-full">
                  <thead className="bg-gray-100 sticky top-0">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 w-12">
                        <input 
                          type="checkbox" 
                          className="rounded"
                          checked={filteredContacts.length > 0 && filteredContacts.every(c => selectedContacts.includes(c.id))}
                          onChange={handleSelectAll}
                        />
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Name</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Phone Number</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <AnimatePresence>
                      {filteredContacts.map((contact, index) => (
                        <motion.tr 
                          key={contact.id} 
                          className="hover:bg-gray-50"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.8, delay: index * 0.05 }}
                        >
                          <td className="px-4 py-3">
                            <input 
                              type="checkbox" 
                              className="rounded"
                              checked={selectedContacts.includes(contact.id)}
                              onChange={() => handleSelectContact(contact.id)}
                            />
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">{contact.name}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{contact.phone}</td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}

export default SendMessagesFromContacts

