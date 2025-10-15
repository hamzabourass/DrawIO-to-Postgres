/**
 * Maps draw.io data types to PostgreSQL data types
 */
export function mapDataType(type: string): string {
  const typeUpper = type.toUpperCase().trim();
  
  // PostgreSQL type mapping
  const typeMap: Record<string, string> = {
    // Numeric types
    'BIGINT': 'BIGINT',
    'INTEGER': 'INTEGER',
    'INT': 'INTEGER',
    'SMALLINT': 'SMALLINT',
    'NUMERIC': 'NUMERIC',
    'DECIMAL': 'DECIMAL',
    'REAL': 'REAL',
    'DOUBLE PRECISION': 'DOUBLE PRECISION',
    'SERIAL': 'SERIAL',
    'BIGSERIAL': 'BIGSERIAL',
    
    // String types
    'TEXT': 'TEXT',
    'VARCHAR': 'VARCHAR(255)',
    'CHAR': 'CHAR(1)',
    'CHARACTER VARYING': 'VARCHAR(255)',
    
    // Date/Time types
    'DATE': 'DATE',
    'TIME': 'TIME',
    'TIMESTAMP': 'TIMESTAMP',
    'TIMESTAMPTZ': 'TIMESTAMPTZ',
    'TIMESTAMP WITH TIME ZONE': 'TIMESTAMP WITH TIME ZONE',
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
    
    // Arrays (generic)
    'ARRAY': 'TEXT[]',
  };
  
  // Check for exact match first
  if (typeMap[typeUpper]) {
    return typeMap[typeUpper];
  }
  
  // Check for VARCHAR with size: VARCHAR(50)
  const varcharMatch = typeUpper.match(/VARCHAR\((\d+)\)/);
  if (varcharMatch) {
    return `VARCHAR(${varcharMatch[1]})`;
  }
  
  // Check for CHAR with size: CHAR(10)
  const charMatch = typeUpper.match(/CHAR\((\d+)\)/);
  if (charMatch) {
    return `CHAR(${charMatch[1]})`;
  }
  
  // Check for NUMERIC/DECIMAL with precision: NUMERIC(10,2)
  const numericMatch = typeUpper.match(/(NUMERIC|DECIMAL)\((\d+),(\d+)\)/);
  if (numericMatch) {
    return `${numericMatch[1]}(${numericMatch[2]},${numericMatch[3]})`;
  }
  
  // Default to TEXT if type is unknown
  console.warn(`Unknown type '${type}', defaulting to TEXT`);
  return 'TEXT';
}

/**
 * Validates if a type is a valid PostgreSQL type
 */
export function isValidPostgresType(type: string): boolean {
  const validTypes = [
    'BIGINT', 'INTEGER', 'SMALLINT', 'NUMERIC', 'DECIMAL', 'REAL', 
    'DOUBLE PRECISION', 'SERIAL', 'BIGSERIAL', 'TEXT', 'VARCHAR', 
    'CHAR', 'DATE', 'TIME', 'TIMESTAMP', 'TIMESTAMPTZ', 'BOOLEAN',
    'UUID', 'JSON', 'JSONB', 'BYTEA'
  ];
  
  const typeUpper = type.toUpperCase().trim();
  
  // Check exact match
  if (validTypes.some(t => typeUpper.startsWith(t))) {
    return true;
  }
  
  return false;
}