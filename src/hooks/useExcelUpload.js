import { useState } from 'react'

export function useExcelUpload() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const validateAndParseExcel = async (file) => {
    setIsLoading(true)
    setError(null)

    try {
      // Check file type
      if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls') && !file.name.endsWith('.csv')) {
        throw new Error('Please upload a valid Excel file (.xlsx, .xls, or .csv)')
      }

      // Read file as text (for CSV) or use xlsx library for Excel files
      const fileExtension = file.name.split('.').pop().toLowerCase()
      
      if (fileExtension === 'csv') {
        const text = await file.text()
        const rows = text.split('\n').filter(row => row.trim())
        
        if (rows.length === 0) {
          throw new Error('The file is empty')
        }

        // Parse CSV
        const headers = rows[0].split(',').map(h => h.trim().toLowerCase())
        
        // Check for required columns
        const hasName = headers.some(h => h.includes('name'))
        const hasPhone = headers.some(h => h.includes('phone'))

        if (!hasName && !hasPhone) {
          throw new Error('Missing required columns: "Name" and "Phone Number". Please ensure your file has these columns.')
        }
        
        if (!hasName) {
          throw new Error('Missing required column: "Name". Please add a "Name" column to your file.')
        }
        
        if (!hasPhone) {
          throw new Error('Missing required column: "Phone Number". Please add a "Phone Number" column to your file.')
        }

        // Find column indices
        const nameIndex = headers.findIndex(h => h.includes('name'))
        const phoneIndex = headers.findIndex(h => h.includes('phone'))

        // Parse data rows
        const data = []
        for (let i = 1; i < rows.length; i++) {
          const values = rows[i].split(',').map(v => v.trim())
          if (values[phoneIndex] && values[nameIndex]) {
            data.push({
              id: i,
              name: values[nameIndex],
              phone: values[phoneIndex],
            })
          }
        }

        if (data.length === 0) {
          throw new Error('No valid data found in the file')
        }

        setIsLoading(false)
        return { success: true, data }
      } else {
        // For Excel files, we'll use a simpler approach
        // In a real app, you'd use the 'xlsx' library
        // For now, let's simulate Excel parsing
        throw new Error('Excel file parsing requires the xlsx library. Please use CSV format or install the xlsx library.')
      }
    } catch (err) {
      setIsLoading(false)
      setError(err.message)
      return { success: false, error: err.message }
    }
  }

  return {
    validateAndParseExcel,
    isLoading,
    error,
    setError
  }
}

