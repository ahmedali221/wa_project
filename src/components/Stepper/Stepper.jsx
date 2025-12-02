import { motion } from 'framer-motion'
import scan_qr from '../../assets/scan_qr.png'
import upload_arrow from '../../assets/upload.png'
import message from '../../assets/send.png'

const steps = [
  {
    id: 1,
    title: 'Connect Whatsapp',
    icon: scan_qr,
  },
  {
    id: 2,
    title: 'Upload Excel File',
    icon: upload_arrow,
  },
  {
    id: 3,
    title: 'Send Messages',
    icon: message,
  },
  {
    id: 4,
    title: 'View all messages',
    icon: 'grid',
  },
]

function Stepper({ activeStep = 1 }) {
  return (
    <div className=" rounded-lg p-6 flex-1">
      <div className="space-y-4">
        {steps.map((step, index) => {
          const isActive = step.id <= activeStep
          const isLast = index === steps.length - 1

          return (
            <motion.div 
              key={step.id} 
              className="relative"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              {/* Step Container - Rounded Rectangle */}
              <motion.div 
                className={`flex items-center gap-4 p-4 rounded-lg border ${
                  isActive 
                    ? 'bg-white border-gray-300' 
                    : 'bg-gray-50 border-gray-200'
                }`}
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {/* Icon */}
                <div className="flex-shrink-0">
                  {step.icon === 'grid' ? (
                    <div className={`w-8 h-8 rounded flex items-center justify-center ${
                      isActive ? 'bg-[#1FAF6E]' : 'bg-gray-400'
                    }`}>
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                      </svg>
                    </div>
                  ) : (
                    <img 
                      src={step.icon} 
                      alt={step.title} 
                      className={`w-8 h-8 ${isActive ? 'opacity-100' : 'opacity-50 grayscale'}`}
                    />
                  )}
                </div>

                {/* Step Text */}
                <div className="flex-1">
                  <p className={`text-sm font-bold ${
                    isActive ? 'text-[#1FAF6E]' : 'text-gray-500'
                  }`}>
                    {step.id}. {step.title}
                  </p>
                </div>

                {/* Checkmark Circle */}
                <div className="flex-shrink-0">
                  {isActive ? (
                    <div className="w-6 h-6 bg-[#1FAF6E] rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  ) : (
                    <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center border border-gray-300">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 20 20">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Connector Line - Vertical line in the center */}
              {!isLast && (
                <motion.div 
                  className="absolute left-1/2 top-full transform -translate-x-1/2 w-0.5 h-4 bg-gray-300" 
                  style={{ marginTop: '-1rem' }}
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: isActive ? 1 : 0.5 }}
                  transition={{ duration: 0.8, delay: index * 0.1 + 0.2 }}
                ></motion.div>
              )}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

export default Stepper
