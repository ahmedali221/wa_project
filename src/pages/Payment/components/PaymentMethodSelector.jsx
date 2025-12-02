import { motion } from 'framer-motion'

const paymentMethods = [
  {
    id: 'paymob',
    name: 'Paymob',
    icon: 'PM',
    color: '#1FAF6E',
    description: 'Credit/Debit Card',
  },
  {
    id: 'stripe',
    name: 'Stripe',
    icon: 'S',
    color: '#635BFF',
    description: 'Credit/Debit Card',
  },
  {
    id: 'fawry',
    name: 'Fawry',
    icon: 'F',
    color: '#FF6B35',
    description: 'Mobile Wallet / ATM / Retail',
  },
]

function PaymentMethodSelector({ selectedMethod, onSelectMethod }) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-black mb-4">Select Payment Method</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {paymentMethods.map((method) => (
          <motion.button
            key={method.id}
            onClick={() => onSelectMethod(method.id)}
            className={`p-4 rounded-lg border-2 transition-all text-left ${
              selectedMethod === method.id
                ? 'border-[#1FAF6E] bg-green-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center gap-3 mb-2">
              <div
                className="w-10 h-10 rounded flex items-center justify-center text-white font-bold"
                style={{ backgroundColor: method.color }}
              >
                {method.icon}
              </div>
              <div>
                <h4 className="font-semibold text-black">{method.name}</h4>
                <p className="text-xs text-gray-500">{method.description}</p>
              </div>
            </div>
            {selectedMethod === method.id && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-2"
              >
                <span className="text-xs text-[#1FAF6E] font-medium">✓ Selected</span>
              </motion.div>
            )}
          </motion.button>
        ))}
      </div>
    </div>
  )
}

export default PaymentMethodSelector


