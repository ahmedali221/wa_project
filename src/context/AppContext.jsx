import { createContext, useContext, useState } from 'react'

const AppContext = createContext()

export function AppProvider({ children }) {
  const [whatsappConnected, setWhatsappConnected] = useState(false)
  const [whatsappPhoneNumber, setWhatsappPhoneNumber] = useState(null)
  const [excelData, setExcelData] = useState([])
  const [uploadedFileName, setUploadedFileName] = useState('')
  const [selectedPackage, setSelectedPackage] = useState(null)

  const value = {
    whatsappConnected,
    setWhatsappConnected,
    whatsappPhoneNumber,
    setWhatsappPhoneNumber,
    excelData,
    setExcelData,
    uploadedFileName,
    setUploadedFileName,
    selectedPackage,
    setSelectedPackage,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useAppContext() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider')
  }
  return context
}

