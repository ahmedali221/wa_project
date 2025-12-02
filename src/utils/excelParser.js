import * as XLSX from 'xlsx';

/**
 * Parse Excel or CSV file and extract contact data
 * @param {File} file - Excel or CSV file
 * @returns {Promise<{contacts: Array, errors?: Array}>} Parsed contact data
 */
export async function parseExcelFile(file) {
  return new Promise((resolve, reject) => {
    const fileExtension = file.name.toLowerCase().split('.').pop();
    const isCSV = fileExtension === 'csv';

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        let workbook;
        let rows;

        if (isCSV) {
          // Parse CSV
          const csvText = e.target.result;
          workbook = XLSX.read(csvText, { type: 'string' });
        } else {
          // Parse Excel (.xlsx, .xls)
          const data = new Uint8Array(e.target.result);
          workbook = XLSX.read(data, {
            type: 'array',
            cellDates: true,
            raw: false,
          });
        }

        // Get first sheet
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        if (!worksheet['!ref']) {
          reject(new Error('File is empty'));
          return;
        }

        // Convert to JSON
        rows = XLSX.utils.sheet_to_json(worksheet, {
          defval: null,
          raw: false,
        });

        if (rows.length === 0) {
          reject(new Error('No data found in file'));
          return;
        }

        // Extract and normalize contact data
        const contacts = [];
        const errors = [];

        for (let i = 0; i < rows.length; i++) {
          const row = rows[i];

          // Try different column name variations
          const name =
            row.name ||
            row.Name ||
            row.NAME ||
            row['الاسم'] ||
            row['Name'] ||
            `Contact ${i + 2}`;

          const rawPhone =
            row.phone ||
            row.Phone ||
            row.PHONE ||
            row['رقم الهاتف'] ||
            row['الرقم'] ||
            row['phone'] ||
            '';

          const email =
            row.email ||
            row.Email ||
            row.EMAIL ||
            row['البريد'] ||
            null;

          // Normalize phone number
          const phone = normalizePhone(rawPhone);

          // Validate phone
          if (!phone || phone.length < 10) {
            errors.push(`Row ${i + 2}: Invalid phone number`);
            continue;
          }

          contacts.push({
            name: String(name).trim(),
            phone: phone,
            email: email ? String(email).trim() : undefined,
          });
        }

        if (contacts.length === 0) {
          reject(new Error('No valid contacts found. Please check that your file has Name and Phone columns.'));
          return;
        }

        resolve({
          contacts,
          errors: errors.length > 0 ? errors : undefined,
        });
      } catch (error) {
        reject(new Error(`Failed to parse file: ${error.message}`));
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    // Read file based on type
    if (isCSV) {
      reader.readAsText(file);
    } else {
      reader.readAsArrayBuffer(file);
    }
  });
}

/**
 * Normalize phone number to international format
 * @param {string} phone - Raw phone number
 * @returns {string} Normalized phone number with +
 */
function normalizePhone(phone) {
  if (!phone) return '';

  // Remove all non-digit characters except +
  let normalized = phone.toString().replace(/[^\d+]/g, '');

  // Add + if not present
  if (!normalized.startsWith('+')) {
    normalized = '+' + normalized;
  }

  return normalized;
}

