/**
 * Maps draw.io data types to PostgreSQL data types
 */
export function mapDataType(type: string): string {
  if (!type || type.trim() === '') {
    console.warn('Empty type provided, defaulting to TEXT');
    return 'TEXT';
  }

  const typeUpper = type.toUpperCase().trim();
  
  // PostgreSQL type mapping with exact matches first
  const typeMap: Record<string, string> = {
    // Numeric types
    'BIGINT': 'BIGINT',
    'INT8': 'BIGINT',
    'INTEGER': 'INTEGER',
    'INT': 'INTEGER',
    'INT4': 'INTEGER',
    'SMALLINT': 'SMALLINT',
    'INT2': 'SMALLINT',
    'NUMERIC': 'NUMERIC',
    'DECIMAL': 'DECIMAL',
    'REAL': 'REAL',
    'FLOAT4': 'REAL',
    'DOUBLE PRECISION': 'DOUBLE PRECISION',
    'FLOAT8': 'DOUBLE PRECISION',
    'FLOAT': 'DOUBLE PRECISION',
    'SERIAL': 'SERIAL',
    'BIGSERIAL': 'BIGSERIAL',
    'SMALLSERIAL': 'SMALLSERIAL',
    
    // String types
    'TEXT': 'TEXT',
    'VARCHAR': 'VARCHAR(255)',
    'CHARACTER VARYING': 'VARCHAR(255)',
    'CHAR': 'CHAR(1)',
    'CHARACTER': 'CHAR(1)',
    'STRING': 'TEXT',
    
    // Date/Time types
    'DATE': 'DATE',
    'TIME': 'TIME',
    'TIMESTAMP': 'TIMESTAMP',
    'TIMESTAMPTZ': 'TIMESTAMPTZ',
    'TIMESTAMP WITH TIME ZONE': 'TIMESTAMP WITH TIME ZONE',
    'TIMESTAMP WITHOUT TIME ZONE': 'TIMESTAMP',
    'INTERVAL': 'INTERVAL',
    
    // Boolean
    'BOOLEAN': 'BOOLEAN',
    'BOOL': 'BOOLEAN',
    
    // UUID
    'UUID': 'UUID',
    
    // JSON
    'JSON': 'JSON',
    'JSONB': 'JSONB',
    
    // Binary
    'BYTEA': 'BYTEA',
    'BLOB': 'BYTEA',
    
    // Arrays (generic)
    'ARRAY': 'TEXT[]',
    
    // Money
    'MONEY': 'MONEY',
  };
  
  // Check for exact match first
  if (typeMap[typeUpper]) {
    return typeMap[typeUpper];
  }
  
  // Check for VARCHAR with size: VARCHAR(50), CHARACTER VARYING(50)
  const varcharMatch = typeUpper.match(/^(?:VARCHAR|CHARACTER\s+VARYING)\s*\((\d+)\)$/);
  if (varcharMatch) {
    return `VARCHAR(${varcharMatch[1]})`;
  }
  
  // Check for CHAR with size: CHAR(10), CHARACTER(10)
  const charMatch = typeUpper.match(/^(?:CHAR|CHARACTER)\s*\((\d+)\)$/);
  if (charMatch) {
    return `CHAR(${charMatch[1]})`;
  }
  
  // Check for NUMERIC/DECIMAL with precision: NUMERIC(10,2), DECIMAL(10,2)
  const numericMatch = typeUpper.match(/^(NUMERIC|DECIMAL)\s*\((\d+)(?:,\s*(\d+))?\)$/);
  if (numericMatch) {
    if (numericMatch[3]) {
      return `${numericMatch[1]}(${numericMatch[2]},${numericMatch[3]})`;
    }
    return `${numericMatch[1]}(${numericMatch[2]})`;
  }
  
  // Check for array types: INTEGER[], TEXT[], etc.
  const arrayMatch = typeUpper.match(/^([A-Z]+)\s*\[\s*\]$/);
  if (arrayMatch) {
    const baseType = mapDataType(arrayMatch[1]);
    return `${baseType}[]`;
  }
  
  // Check for TIME with precision: TIME(6)
  const timeMatch = typeUpper.match(/^TIME\s*\((\d+)\)$/);
  if (timeMatch) {
    return `TIME(${timeMatch[1]})`;
  }
  
  // Check for TIMESTAMP with precision: TIMESTAMP(6)
  const timestampMatch = typeUpper.match(/^TIMESTAMP\s*\((\d+)\)$/);
  if (timestampMatch) {
    return `TIMESTAMP(${timestampMatch[1]})`;
  }
  
  // If we get here, we might have a custom type or enum - keep as is if it looks valid
  if (/^[A-Z_][A-Z0-9_]*$/.test(typeUpper)) {
    console.warn(`Unknown type '${type}', using as custom type`);
    return typeUpper;
  }
  
  // Default to TEXT if type is completely unknown
  console.warn(`Unknown type '${type}', defaulting to TEXT`);
  return 'TEXT';
}

/**
 * Validates if a type is a valid PostgreSQL type
 */
export function isValidPostgresType(type: string): boolean {
  const validTypes = [
    'BIGINT', 'INTEGER', 'SMALLINT', 'NUMERIC', 'DECIMAL', 'REAL', 
    'DOUBLE PRECISION', 'SERIAL', 'BIGSERIAL', 'SMALLSERIAL',
    'TEXT', 'VARCHAR', 'CHAR', 'CHARACTER VARYING', 'CHARACTER',
    'DATE', 'TIME', 'TIMESTAMP', 'TIMESTAMPTZ', 'INTERVAL',
    'BOOLEAN', 'BOOL',
    'UUID', 'JSON', 'JSONB', 'BYTEA', 'MONEY'
  ];
  
  const typeUpper = type.toUpperCase().trim();
  
  // Check exact match or starts with valid type
  if (validTypes.some(t => typeUpper === t || typeUpper.startsWith(t + '('))) {
    return true;
  }
  
  // Check for array types
  if (typeUpper.endsWith('[]')) {
    return true;
  }
  
  return false;
}

/**
 * Clean and normalize a type string from draw.io
 */
export function cleanTypeString(type: string): string {
  if (!type) return '';
  
  // Remove extra whitespace
  let cleaned = type.trim().replace(/\s+/g, ' ');
  
  // Remove any remaining HTML/XML artifacts
  cleaned = cleaned.replace(/<[^>]*>/g, '');
  cleaned = cleaned.replace(/&[a-zA-Z]+;/g, '');
  
  return cleaned;
}