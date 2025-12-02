import { motion } from 'framer-motion'

function Package({ pkg, onSelect, variants }) {
  return (
    <motion.div
      variants={variants}
      whileHover={{ scale: 1.05, y: -5 }}
      transition={{ type: "spring", stiffness: 300 }}
      className="bg-white border-2 border-gray-200 rounded-lg p-8 shadow-lg hover:border-[#1FAF6E] transition-all cursor-pointer"
      onClick={() => onSelect(pkg)}
    >
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-black mb-2">{pkg.name}</h3>
        <div className="text-4xl font-bold text-[#1FAF6E] mb-1">
          {pkg.currency === 'EGP' ? 'EGP' : '$'}{pkg.price}
        </div>
        <p className="text-sm text-gray-500">
          {pkg.durationDays ? `per ${pkg.durationDays === 30 ? 'month' : pkg.durationDays === 7 ? 'week' : `${pkg.durationDays} days`}` : 'per month'}
        </p>
      </div>

      {pkg.description && (
        <p className="text-gray-600 text-center mb-6 text-sm">{pkg.description}</p>
      )}

      <div className="space-y-4 mb-8">
        <div className="flex items-center justify-between py-2 border-b border-gray-100">
          <span className="text-gray-600">Messages</span>
          <span className="font-semibold text-black">{pkg.messagesLimit?.toLocaleString() || 0}</span>
        </div>
        <div className="flex items-center justify-between py-2 border-b border-gray-100">
          <span className="text-gray-600">Characters per message</span>
          <span className="font-semibold text-black">{pkg.charactersLimit?.toLocaleString() || 0}</span>
        </div>
        {pkg.durationDays && (
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Duration</span>
            <span className="font-semibold text-black">{pkg.durationDays} days</span>
          </div>
        )}
      </div>

      <motion.button
        className="w-full bg-[#1FAF6E] text-white py-3 rounded-md font-semibold hover:bg-[#1FAF6E] transition-colors"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        Select Plan
      </motion.button>
    </motion.div>
  )
}

export default Package

