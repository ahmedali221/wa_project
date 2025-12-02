import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import { useAuth } from '../../context/AuthContext'
import whatsapp_bg from '../../assets/whatsapp.png'
import scan_qr from '../../assets/scan_qr.png'
import upload_arrow from '../../assets/upload.png'
import message from '../../assets/send.png'

function HowItWorks() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()

  const handleGetStarted = (e) => {
    e.preventDefault()
    if (isAuthenticated) {
      navigate('/connect-whatsapp')
    } else {
      navigate('/signup')
    }
  }

  const steps = [
    {
      number: '01',
      title: 'Connect WhatsApp',
      description: 'Link your WhatsApp account by scanning the QR code or using a pairing code. Your connection is secure and encrypted.',
      icon: scan_qr,
      color: 'bg-green-50'
    },
    {
      number: '02',
      title: 'Upload Contacts',
      description: 'Upload your contacts via Excel or CSV file. Our system will automatically import and organize your contacts.',
      icon: upload_arrow,
      color: 'bg-green-50'
    },
    {
      number: '03',
      title: 'Compose Message',
      description: 'Write your message and select the contacts you want to send to. You can personalize messages for each recipient.',
      icon: message,
      color: 'bg-green-50'
    },
    {
      number: '04',
      title: 'Send & Track',
      description: 'Send your messages with one click and track delivery status. View statistics and manage your messaging campaigns.',
      icon: whatsapp_bg,
      color: 'bg-green-50'
    }
  ]

  const features = [
    {
      title: 'Easy Setup',
      description: 'Get started in minutes with our simple setup process.'
    },
    {
      title: 'Bulk Messaging',
      description: 'Send messages to hundreds of contacts simultaneously.'
    },
    {
      title: 'Contact Management',
      description: 'Organize and manage your contacts with ease.'
    },
    {
      title: 'Message Tracking',
      description: 'Track sent, delivered, and failed messages in real-time.'
    },
    {
      title: 'Package Plans',
      description: 'Choose from flexible package plans that suit your needs.'
    },
    {
      title: 'Secure & Private',
      description: 'Your data is encrypted and your privacy is protected.'
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="px-6 py-20 bg-gradient-to-br from-green-50 to-white">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h1
            className="text-5xl md:text-6xl font-bold text-gray-900 mb-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            How It <span className="text-[#1FAF6E]">Works</span>
          </motion.h1>
          <motion.p
            className="text-xl text-gray-600 leading-relaxed"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Sending bulk WhatsApp messages has never been easier. Follow these simple steps 
            to get started and reach your audience in minutes.
          </motion.p>
        </div>
      </section>

      {/* Steps Section */}
      <section className="px-6 py-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                className="relative"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
              >
                <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow h-full">
                  {/* Step Number */}
                  <div className="absolute -top-4 -left-4 w-12 h-12 bg-[#1FAF6E] rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {step.number}
                  </div>
                  
                  {/* Icon */}
                  <div className={`w-20 h-20 ${step.color} rounded-full flex items-center justify-center mb-4 mx-auto`}>
                    <img src={step.icon} alt={step.title} className="w-12 h-12" />
                  </div>
                  
                  {/* Content */}
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 text-center">{step.title}</h3>
                  <p className="text-gray-600 text-center leading-relaxed">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="px-6 py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <motion.h2
            className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            Key <span className="text-[#1FAF6E]">Features</span>
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center text-[#1FAF6E] flex-shrink-0">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <motion.h2
            className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            Frequently Asked <span className="text-[#1FAF6E]">Questions</span>
          </motion.h2>
          <div className="space-y-4">
            {[
              {
                question: 'How do I connect my WhatsApp account?',
                answer: 'You can connect your WhatsApp account by scanning the QR code displayed on the screen or by entering a pairing code sent to your phone number.'
              },
              {
                question: 'What file formats are supported for contacts?',
                answer: 'We support Excel files (.xlsx, .xls) and CSV files. Your file should contain columns for Name and Phone Number.'
              },
              {
                question: 'Is my data secure?',
                answer: 'Yes, we use industry-standard encryption to protect your data. Your WhatsApp connection and contacts are stored securely.'
              },
              {
                question: 'Can I send messages to international numbers?',
                answer: 'Yes, you can send messages to any WhatsApp number worldwide, as long as the number is registered on WhatsApp.'
              },
              {
                question: 'What happens if a message fails to send?',
                answer: 'Failed messages are tracked in your dashboard. You can retry sending them or check the error details to resolve the issue.'
              }
            ].map((faq, index) => (
              <motion.div
                key={index}
                className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{faq.question}</h3>
                <p className="text-gray-600">{faq.answer}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-16 bg-gradient-to-r from-[#1FAF6E] to-[#1a8f5a]">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to Start?</h2>
            <p className="text-xl mb-8 text-green-50">
              Join us today and experience the easiest way to send bulk WhatsApp messages.
            </p>
            <div className="flex gap-4 justify-center">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <button
                  onClick={handleGetStarted}
                  className="inline-block bg-white text-[#1FAF6E] px-8 py-3 rounded-md font-semibold hover:bg-green-50 transition-colors"
                >
                  Get Started
                </button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to="/about"
                  className="inline-block bg-transparent border-2 border-white text-white px-8 py-3 rounded-md font-semibold hover:bg-white hover:text-[#1FAF6E] transition-colors"
                >
                  Learn More
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default HowItWorks

