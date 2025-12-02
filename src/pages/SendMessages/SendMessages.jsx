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

  useEffect(() => {
    // If no data in context, try to fetch from backend
    const fetchContacts = async () => {
      if (excelData.length === 0) {
        setLoading(true)
        try {
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
      }
    }

    if (!whatsappConnected) {
      navigate('/connect-whatsapp')
    } else {
      fetchContacts()
    }
  }, [excelData, whatsappConnected, navigate, setExcelData])



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

            </motion.div>

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
                onClick={() => navigate('/upload-excel')}
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

