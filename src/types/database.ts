// Database column definition
export interface Column {
  name: string;
  type: string;
  isPrimaryKey: boolean;
  isForeignKey: boolean;
  isNotNull: boolean;
  isUnique?: boolean;
  defaultValue?: string;
  checkConstraint?: string;
}

// Table definition
export interface Table {
  id: string;
  name: string;
  columns: Column[];
  foreignKeys: ForeignKey[];
  uniqueConstraints: UniqueConstraint[];
  checkConstraints: CheckConstraint[];
  isJunctionTable: boolean; // For many-to-many relationships
}

// Foreign key relationship (supports composite FKs)
export interface ForeignKey {
  name?: string; // Custom constraint name
  columns: string[]; // Can be multiple columns for composite FK
  referencedTable: string;
  referencedColumns: string[]; // Can be multiple columns
  onDelete?: 'CASCADE' | 'SET NULL' | 'SET DEFAULT' | 'RESTRICT' | 'NO ACTION';
  onUpdate?: 'CASCADE' | 'SET NULL' | 'SET DEFAULT' | 'RESTRICT' | 'NO ACTION';
}

// Unique constraint (can span multiple columns)
export interface UniqueConstraint {
  name: string;
  columns: string[];
}

// Check constraint
export interface CheckConstraint {
  name: string;
  expression: string;
}

// Edge/Relationship from draw.io
export interface Edge {
  id: string;
  source: string;
  target: string;
  style: string;
  sourceLabel?: string;
  targetLabel?: string;
}

// Relationship cardinality
export enum Cardinality {
  ONE_TO_ONE = '1:1',
  ONE_TO_MANY = '1:N',
  MANY_TO_ONE = 'N:1',
  MANY_TO_MANY = 'N:M'
}

// Detected relationship
export interface Relationship {
  fromTable: string;
  toTable: string;
  cardinality: Cardinality;
  edge: Edge;
}

// Parse result
export interface ParseResult {
  tables: Table[];
  edges: Edge[];
  relationships: Relationship[];
  success: boolean;
  error?: string;
}

// SQL Generation options
export interface SQLGenerationOptions {
  includeDropStatements?: boolean;
  includeIndexes?: boolean;
  includeForeignKeys?: boolean;
  useIfNotExists?: boolean;
  schemaName?: string;
  includeComments?: boolean;
  onDeleteAction?: 'CASCADE' | 'SET NULL' | 'RESTRICT' | 'NO ACTION';
  onUpdateAction?: 'CASCADE' | 'SET NULL' | 'RESTRICT' | 'NO ACTION';
}