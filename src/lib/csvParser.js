export function parseCSV(csvText) {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) {
    throw new Error('CSV must have at least a header row and one data row');
  }

  // Parse header
  const headers = parseCSVLine(lines[0]);
  
  // Validate required 'name' column
  if (!headers.includes('name')) {
    throw new Error('CSV must contain a "name" column');
  }

  // Parse data rows
  const records = [];
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim()) {
      const values = parseCSVLine(lines[i]);
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

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  let i = 0;

  while (i < line.length) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // Escaped quote
        current += '"';
        i += 2;
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
        i++;
      }
    } else if (char === ',' && !inQuotes) {
      // End of field
      result.push(current.trim());
      current = '';
      i++;
    } else {
      current += char;
      i++;
    }
  }
  
  // Add the last field
  result.push(current.trim());
  
  return result;
} 