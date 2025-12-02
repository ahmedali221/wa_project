import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, useParams } from 'react-router-dom'
import Header from '../../components/Header'
import Sidebar from '../../components/Sidebar'
import messagesService from '../../services/messagesService'

function MessageDetail() {
  const navigate = useNavigate()
  const { messageText } = useParams()
  const decodedMessage = decodeURIComponent(messageText || '')
  
  const [messageData, setMessageData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchMessageDetails = async () => {
      try {
        setLoading(true)
        const data = await messagesService.getMessagesByText(decodedMessage)
        setMessageData(data)
      } catch (err) {
        setError(err.message || 'Failed to load message details')
        console.error('Error fetching message details:', err)
      } finally {
        setLoading(false)
      }
    }

    if (decodedMessage) {
      fetchMessageDetails()
    }
  }, [decodedMessage])

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'SENT':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Sent
          </span>
        )
      case 'FAILED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            Failed
          </span>
        )
      case 'PENDING':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            Pending
          </span>
        )
      default:
        return null
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
            {/* Back Button */}
            <button
              onClick={() => navigate('/messages')}
              className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Messages
            </button>

            <h1 className="text-2xl font-bold text-gray-800 mb-6">Message Details</h1>

            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-700">{error}</p>
              </div>
            ) : !messageData ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">Message not found</p>
              </div>
            ) : (
              <>
                {/* Message Content */}
                <div className="bg-gray-50 rounded-lg p-6 mb-6">
                  <h2 className="text-sm font-medium text-gray-700 mb-2">Message Text</h2>
                  <p className="text-gray-900 whitespace-pre-wrap">{messageData.message}</p>
                </div>

                {/* Recipients Table */}
                <div className="mb-4">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">
                    Recipients ({messageData.total})
                  </h2>
                </div>

                <div className="overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                          Phone Number
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                          Error
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {messageData.recipients.map((recipient, index) => (
                        <motion.tr
                          key={recipient.id}
                          className="hover:bg-gray-50"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {recipient.name || 'Unknown'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {recipient.phone}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(recipient.status)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">
                              {formatDate(recipient.createdAt)}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-red-600">
                              {recipient.error || '-'}
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default MessageDetail

