import { useState } from 'react'
import { motion } from 'framer-motion'

function FawryPayment({ packageData, onPaymentSuccess, onPaymentError }) {
  const [formData, setFormData] = useState({
    phoneNumber: '',
    paymentMethod: 'wallet', // wallet, atm, retail
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    if (error) setError('')
  }

  const formatPhoneNumber = (value) => {
    const v = value.replace(/\D/g, '')
    if (v.startsWith('0')) {
      return v.substring(0, 1) + ' ' + v.substring(1, 4) + ' ' + v.substring(4, 7) + ' ' + v.substring(7, 11)
    }
    return v
  }

  const handlePhoneChange = (e) => {
    const formatted = formatPhoneNumber(e.target.value)
    setFormData((prev) => ({ ...prev, phoneNumber: formatted }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Validation
    const phoneDigits = formData.phoneNumber.replace(/\D/g, '')
    if (!formData.phoneNumber || phoneDigits.length !== 11 || !phoneDigits.startsWith('0')) {
      setError('Please enter a valid Egyptian phone number (e.g., 01234567890)')
      setLoading(false)
      return
    }

    try {
      // TODO: Integrate with Fawry API
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))
      
      // On success
      if (onPaymentSuccess) {
        onPaymentSuccess({
          method: 'fawry',
          transactionId: `FAW-${Date.now()}`,
          amount: packageData.price,
          paymentMethod: formData.paymentMethod,
          phoneNumber: formData.phoneNumber,
        })
      }
    } catch (err) {
      const errorMessage = err.message || 'Payment failed. Please try again.'
      setError(errorMessage)
      if (onPaymentError) {
        onPaymentError(err)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 bg-[#FF6B35] rounded flex items-center justify-center">
          <span className="text-white font-bold text-sm">F</span>
        </div>
        <h3 className="text-lg font-semibold text-black">Fawry</h3>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-md p-3 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number
          </label>
          <input
            type="tel"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handlePhoneChange}
            placeholder="0123 456 7890"
            maxLength="15"
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent"
            required
          />
          <p className="text-xs text-gray-500 mt-1">Enter your Egyptian mobile number</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Payment Method
          </label>
          <select
            name="paymentMethod"
            value={formData.paymentMethod}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent"
            required
          >
            <option value="wallet">Mobile Wallet</option>
            <option value="atm">ATM</option>
            <option value="retail">Retail Outlet</option>
          </select>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> After submitting, you will receive a payment reference number. 
            Complete the payment using your selected method, and your subscription will be activated automatically.
          </p>
        </div>

        <div className="pt-4">
          <motion.button
            type="submit"
            disabled={loading}
            className="w-full bg-[#FF6B35] text-white py-4 rounded-md font-semibold text-lg hover:bg-[#E55A2B] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: loading ? 1 : 1.02 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
          >
            {loading ? 'Processing...' : `Pay EGP ${packageData.price}`}
          </motion.button>
        </div>

        <p className="text-xs text-gray-500 text-center mt-4">
          Secure payment powered by Fawry
        </p>
      </form>
    </div>
  )
}

export default FawryPayment


