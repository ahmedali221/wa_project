import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import { Link } from 'react-router-dom'
import { useAppContext } from '../../context/AppContext'
import { useAuth } from '../../context/AuthContext'
import Package from '../../components/Package'
import packagesService from '../../services/packagesService'
import contactsService from '../../services/contactsService'
import whatsapp_bg from '../../assets/whatsapp.png'
import image from '../../assets/image.png'
import scan_qr from '../../assets/scan_qr.png'
import upload_arrow from '../../assets/upload.png'
import message from '../../assets/send.png'

function Home() {
  const navigate = useNavigate()
  const { setSelectedPackage } = useAppContext()
  const { isAuthenticated } = useAuth()
  const [packages, setPackages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [hasContacts, setHasContacts] = useState(false)
  const [checkingContacts, setCheckingContacts] = useState(false)
  const [hasSubscription, setHasSubscription] = useState(false)

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        setLoading(true)
        setError('')
        const data = await packagesService.getAllPackages()
        setPackages(data)
      } catch (err) {
        setError(err.message || 'Failed to load packages')
        console.error('Error fetching packages:', err)
      } finally {
        setLoading(false)
      }
    }

    const checkContacts = async () => {
      if (isAuthenticated) {
        try {
          setCheckingContacts(true)
          const status = await contactsService.getUploadStatus()
          setHasContacts(status.hasUploaded && status.contactsCount > 0)
        } catch (err) {
          console.error('Error checking contacts:', err)
          setHasContacts(false)
        } finally {
          setCheckingContacts(false)
        }
      }
    }

    const checkSubscription = async () => {
      if (isAuthenticated) {
        try {
          const response = await packagesService.getCurrentSubscription()
          setHasSubscription(response.subscription !== null && response.subscription !== undefined)
        } catch (err) {
          console.error('Error checking subscription:', err)
          setHasSubscription(false)
        }
      }
    }

    fetchPackages()
    checkContacts()
    checkSubscription()
  }, [isAuthenticated])

  const handleSelectPackage = (pkg) => {
    setSelectedPackage(pkg)
    navigate('/payment')
  }
  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 1.2 }
  }

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.15
      }
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="relative px-6 py-20 flex flex-col items-center justify-center text-center overflow-hidden ">
        {/* Background WhatsApp Bubble */}
        <motion.div 
          className="absolute inset-0 flex items-center scale-120 left-120 bottom-30 justify-center pointer-events-none"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.3, scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        >
          <img src={whatsapp_bg} alt="whatsapp" />
        </motion.div>

        <motion.div 
          className="relative z-10 max-w-4xl"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          <motion.h1 
            className="text-5xl md:text-6xl font-bold text-black mb-6 leading-tight"
            variants={fadeInUp}
          >
            Build <span className="text-[#1FAF6E]">WhatsApp</span> experiences with less{' '}
           hassle and more hustle
          </motion.h1>
          <motion.p 
            className="text-lg text-black mb-8 max-w-2xl mx-auto"
            variants={fadeInUp}
          >
A smart platform for sending and managing WhatsApp messages automatically for businesses and individuals. Full control over your messages.          </motion.p>
          <motion.div 
            className="flex gap-4 justify-center flex-wrap"
            variants={fadeInUp}
          >
            {isAuthenticated && hasSubscription ? (
              <motion.button
                onClick={() => navigate('/send-messages-from-contacts')}
                className="bg-[#1FAF6E] text-white px-8 py-3 rounded-md font-medium hover:bg-[#1a8f5a] transition-colors flex items-center gap-2"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Send New Messages
              </motion.button>
            ) : (
              <>
            <Link
              to="/connect-whatsapp"
              className="bg-[#1FAF6E] text-white px-8 py-3 rounded-md font-medium hover:bg-[#1FAF6E] transition-colors"
            >
              Try Now
            </Link>
            <button className="bg-black text-white px-8 py-3 rounded-md font-medium hover:bg-gray-800 transition-colors">
              Know More
            </button>
              </>
            )}
          </motion.div>
        </motion.div>
      </section>

      {/* Content Section */}
      <section className="px-6 py-20">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          {/* Image Placeholder */}
          <motion.div 
            className="relative"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2 }}
          >
       <img src={image} alt="whatsapp" />
          </motion.div>

          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2 }}
          >
            <h2 className="text-3xl font-bold text-black mb-4">
              Optimized messaging professional outcomes ...
            </h2>
            <p className="text-lg text-black mb-6">
            Automate your WhatsApp communication and manage your contacts with maximum efficiency.
            </p>
            <Link
              to="/connect-whatsapp"
              className="border-2 border-[#1FAF6E] text-[#1FAF6E] px-8 py-3 rounded-md font-medium hover:bg-green-50 transition-colors inline-block"
            >
              Try Now
            </Link>
          </motion.div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="px-6 py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <motion.h2 
            className="text-4xl font-bold text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2 }}
          >
            <span className="text-[#1FAF6E]">How</span> it Works ?
          </motion.h2>
          
          <motion.div 
            className="grid md:grid-cols-3 gap-12"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {/* Icon 1 - Phone with WhatsApp and QR code */}
            <motion.div
              variants={fadeInUp}
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="flex flex-col mb-4 items-center text-center">
                <img src={scan_qr} alt="scan_qr" />
              </div>
              <p className="text-center text-gray-600 font-medium">Scan QR & connect to whatsapp</p>
            </motion.div>

            {/* Icon 2 - Excel with upload arrow */}
            <motion.div 
              className="flex flex-col items-center text-center"
              variants={fadeInUp}
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="flex flex-col mb-8 items-center text-center">
                <img src={upload_arrow} alt="upload_arrow" />
              </div>
              <p className="text-center text-gray-600 font-medium">Upload Excel file</p>
            </motion.div>

            {/* Icon 3 - Envelope with speed lines */}
            <motion.div 
              className="flex flex-col items-center text-center"
              variants={fadeInUp}
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="flex flex-col mb-8 items-center text-center">
                <img src={message} alt="message" />
              </div>
              <p className="text-center text-gray-600 font-medium">Send Message</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Packages Section */}
      <section className="px-6 py-20 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.h2 
            className="text-4xl font-bold text-center mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2 }}
          >
            Choose Your <span className="text-[#1FAF6E]">Package</span>
          </motion.h2>
          <motion.p 
            className="text-lg text-gray-600 text-center mb-12 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, delay: 0.1 }}
          >
            Select the perfect plan for your messaging needs
          </motion.p>

          {loading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#1FAF6E]"></div>
              <p className="mt-4 text-gray-600">Loading packages...</p>
            </div>
          )}

          {error && (
            <div className="text-center py-12">
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-md p-4 max-w-md mx-auto">
                <p className="font-semibold">Error loading packages</p>
                <p className="text-sm mt-1">{error}</p>
              </div>
            </div>
          )}

          {!loading && !error && packages.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600">No packages available at the moment.</p>
            </div>
          )}

          {!loading && !error && packages.length > 0 && (
            <motion.div 
              className="grid md:grid-cols-3 gap-8"
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
            >
              {packages.map((pkg) => (
                <Package
                  key={pkg.id}
                  pkg={pkg}
                  onSelect={handleSelectPackage}
                  variants={fadeInUp}
                />
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* Bottom CTA Section */}
      <motion.section 
        className="px-6 py-16 mb-10 bg-[#1FAF6E] flex flex-col items-center justify-center rounded-lg shadow-lg max-w-3xl mx-auto mt-16"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2 }}
      >
        <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Ready to Supercharge Your WhatsApp Messaging?
        </h3>
        <p className="text-lg md:text-xl text-green-100 mb-8 max-w-xl">
          Connect your WhatsApp and start sending personalized messages at scale in just a few clicks!
        </p>
        <Link
          to="/connect-whatsapp"
          className="bg-white text-[#1FAF6E] px-10 py-4 rounded-full font-semibold text-lg shadow hover:bg-green-50 hover:scale-105 transition-all duration-200 focus:outline-none inline-block"
        >
          Connect WhatsApp
        </Link>
      </motion.section>
      <Footer />
    </div>
  )
}

export default Home

