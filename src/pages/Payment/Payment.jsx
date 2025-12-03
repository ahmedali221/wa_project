import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Header from '../../components/Header'
import { useAppContext } from '../../context/AppContext'
import PaymentMethodSelector from './components/PaymentMethodSelector'
import PaymobPayment from './components/PaymobPayment'
import StripePayment from './components/StripePayment'
import FawryPayment from './components/FawryPayment'
import packagesService from '../../services/packagesService'

function Payment() {
  const navigate = useNavigate()
  const { selectedPackage } = useAppContext()
  const [paymentMethod, setPaymentMethod] = useState('paymob')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!selectedPackage) {
      navigate('/')
    }
  }, [selectedPackage, navigate])

  const handlePaymentSuccess = async (paymentData) => {
    try {
      setLoading(true)
      
      // Subscribe to the package with payment status PAID
      const result = await packagesService.subscribe(selectedPackage.id, 'PAID')
      
      // Show success message
      alert(`Payment successful! Transaction ID: ${paymentData.transactionId}\nYou have been subscribed to ${selectedPackage.name}.`)
      
      // Redirect to connect WhatsApp page
      navigate('/connect-whatsapp')
    } catch (error) {
      console.error('Subscription error:', error)
      const errorMessage = error.message || 'Payment processed but subscription failed. Please contact support.'
      alert(`Error: ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }

  const handlePaymentError = (error) => {
    console.error('Payment error:', error)
  }

  if (!selectedPackage) {
    return null
  }

  return (
    <motion.div 
      className="min-h-screen bg-gray-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <Header showUserProfile={false} />

      <div className="max-w-7xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <h1 className="text-4xl font-bold text-black mb-2 text-center">
            Complete Your Payment
          </h1>
          <p className="text-gray-600 text-center mb-8">
            Review your selected package and proceed with payment
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Package Summary */}
          <motion.div
            className="bg-white rounded-lg shadow-lg p-6"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            <h2 className="text-2xl font-bold text-black mb-6">Package Summary</h2>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center py-3 border-b border-gray-200">
                <span className="text-gray-600">Package Name</span>
                <span className="font-semibold text-black">{selectedPackage.name}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-200">
                <span className="text-gray-600">Messages</span>
                <span className="font-semibold text-black">{selectedPackage.messagesLimit?.toLocaleString() || 0}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-200">
                <span className="text-gray-600">Characters per message</span>
                <span className="font-semibold text-black">{selectedPackage.charactersLimit?.toLocaleString() || 0}</span>
              </div>
              {selectedPackage.durationDays && (
                <div className="flex justify-between items-center py-3 border-b border-gray-200">
                  <span className="text-gray-600">Duration</span>
                  <span className="font-semibold text-black">
                    {selectedPackage.durationDays === 30 ? '1 Month' : 
                     selectedPackage.durationDays === 7 ? '1 Week' : 
                     `${selectedPackage.durationDays} Days`}
                  </span>
                </div>
              )}
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-black">Total</span>
                <span className="text-2xl font-bold text-[#1FAF6E]">
                  ${selectedPackage.price}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Payment Form */}
          <motion.div
            className="bg-white rounded-lg shadow-lg p-6"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
          >
            <h2 className="text-2xl font-bold text-black mb-6">Payment Details</h2>
            
            <div className="space-y-6">
              <PaymentMethodSelector
                selectedMethod={paymentMethod}
                onSelectMethod={setPaymentMethod}
              />

              <div className="border-t border-gray-200 pt-6">
                {paymentMethod === 'paymob' && (
                  <PaymobPayment
                    packageData={selectedPackage}
                    onPaymentSuccess={handlePaymentSuccess}
                    onPaymentError={handlePaymentError}
                  />
                )}
                {paymentMethod === 'stripe' && (
                  <StripePayment
                    packageData={selectedPackage}
                    onPaymentSuccess={handlePaymentSuccess}
                    onPaymentError={handlePaymentError}
                  />
                )}
                {paymentMethod === 'fawry' && (
                  <FawryPayment
                    packageData={selectedPackage}
                    onPaymentSuccess={handlePaymentSuccess}
                    onPaymentError={handlePaymentError}
                  />
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Back Button */}
        <motion.div
          className="mt-8 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          <button
            onClick={() => navigate('/')}
            className="text-[#1FAF6E] hover:text-[#1FAF6E] font-medium"
          >
            ← Back to Packages
          </button>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default Payment

