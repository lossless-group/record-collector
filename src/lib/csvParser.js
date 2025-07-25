export function parseCSV(csvText) {
  const trimmedText = csvText.trim();
  if (!trimmedText) {
    throw new Error('CSV text is empty');
  }

  // Parse the entire CSV as a single string to handle multiline fields
  const rows = parseCSVRows(trimmedText);
  if (rows.length < 2) {
    throw new Error('CSV must have at least a header row and one data row');
  }

  // Parse header
  const headers = rows[0];
  
  // Validate required 'name' column
  if (!headers.includes('name')) {
    throw new Error('CSV must contain a "name" column');
  }

  // Parse data rows
  const records = [];
  for (let i = 1; i < rows.length; i++) {
    const values = rows[i];
    if (values.length > 0) {
      const record = {};
      
      headers.forEach((header, index) => {
        let value = values[index] || '';
        
        // Try to convert to number if it looks like a number
        if (value && !isNaN(value) && value.trim() !== '') {
          const numValue = Number(value);
          if (!isNaN(numValue)) {
            value = numValue;
          }
        }
        
        record[header] = value;
      });
      
      records.push(record);
    }
  }

  return records;
}

function parseCSVRows(csvText) {
  const rows = [];
  let currentRow = [];
  let currentField = '';
  let inQuotes = false;
  let i = 0;

  while (i < csvText.length) {
    const char = csvText[i];
    
    if (char === '"') {
      if (inQuotes && csvText[i + 1] === '"') {
        // Escaped quote
        currentField += '"';
        i += 2;
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
        i++;
      }
    } else if (char === ',' && !inQuotes) {
      // End of field
      currentRow.push(currentField.trim());
      currentField = '';
      i++;
    } else if (char === '\n' && !inQuotes) {
      // End of row (but only if not in quotes)
      currentRow.push(currentField.trim());
      rows.push(currentRow);
      currentRow = [];
      currentField = '';
      i++;
    } else {
      currentField += char;
      i++;
    }
  }
  
  // Add the last field and row
  currentRow.push(currentField.trim());
  if (currentRow.length > 0) {
    rows.push(currentRow);
  }
  
  return rows;
} 