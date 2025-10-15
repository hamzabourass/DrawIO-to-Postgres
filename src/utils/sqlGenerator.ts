import { Table, SQLGenerationOptions } from '@/types/database';

export function generateSQL(tables: Table[], options: SQLGenerationOptions = {}): string {
  const {
    includeDropStatements = false,
    includeIndexes = true,
    includeForeignKeys = true,
    useIfNotExists = true,
    schemaName,
    includeComments = false,
    onDeleteAction = 'CASCADE',
    onUpdateAction = 'CASCADE'
  } = options;

  let sql = '-- PostgreSQL 15.5 DDL Script\n';
  sql += '-- Generated from draw.io diagram\n';
  sql += `-- Date: ${new Date().toISOString()}\n\n`;

  if (schemaName) {
    sql += `CREATE SCHEMA IF NOT EXISTS ${schemaName};\n`;
    sql += `SET search_path TO ${schemaName};\n\n`;
  }

  if (includeDropStatements) {
    sql += '-- Drop tables\n';
    for (const table of [...tables].reverse()) {
      const fullName = schemaName ? `${schemaName}.${table.name}` : table.name;
      sql += `DROP TABLE IF EXISTS ${fullName} CASCADE;\n`;
    }
    sql += '\n';
  }

  sql += '-- Create tables\n';
  for (const table of tables) {
    sql += generateCreateTable(table, useIfNotExists, schemaName, includeComments);
    sql += '\n';
  }

  if (includeForeignKeys) {
    sql += '-- Foreign key constraints\n';
    for (const table of tables) {
      sql += generateForeignKeys(table, tables, schemaName, onDeleteAction, onUpdateAction);
    }
    sql += '\n';
  }

  if (includeIndexes) {
    sql += '-- Indexes\n';
    for (const table of tables) {
      sql += generateIndexes(table, schemaName);
    }
  }

  return sql;
}

function generateCreateTable(
  table: Table, 
  useIfNotExists: boolean,
  schemaName?: string,
  includeComments?: boolean
): string {
  const fullName = schemaName ? `${schemaName}.${table.name}` : table.name;
  const ifNotExists = useIfNotExists ? 'IF NOT EXISTS ' : '';
  
  let sql = `-- Table: ${table.name}\n`;
  sql += `CREATE TABLE ${ifNotExists}${fullName} (\n`;
  
  const columnDefs: string[] = [];
  const primaryKeys: string[] = [];
  
  for (const col of table.columns) {
    let colDef = `    ${col.name} ${col.type}`;
    
    if (col.defaultValue) colDef += ` DEFAULT ${col.defaultValue}`;
    if (col.isNotNull && !col.isPrimaryKey) colDef += ' NOT NULL';
    if (col.checkConstraint) colDef += ` CHECK (${col.checkConstraint})`;
    
    columnDefs.push(colDef);
    if (col.isPrimaryKey) primaryKeys.push(col.name);
  }
  
  sql += columnDefs.join(',\n');
  
  if (primaryKeys.length > 0) {
    sql += `,\n    CONSTRAINT pk_${table.name.toLowerCase()} PRIMARY KEY (${primaryKeys.join(', ')})`;
  }
  
  for (const uq of table.uniqueConstraints) {
    sql += `,\n    CONSTRAINT ${uq.name} UNIQUE (${uq.columns.join(', ')})`;
  }
  
  sql += '\n);\n';
  
  if (includeComments && table.isJunctionTable) {
    sql += `COMMENT ON TABLE ${fullName} IS 'Junction table';\n`;
  }
  
  return sql;
}

function generateForeignKeys(
  table: Table,
  allTables: Table[],
  schemaName?: string,
  onDeleteAction = 'CASCADE',
  onUpdateAction = 'CASCADE'
): string {
  if (table.foreignKeys.length === 0) return '';
  
  let sql = '';
  const fullName = schemaName ? `${schemaName}.${table.name}` : table.name;
  const createdConstraints = new Set<string>(); // Track created constraints to avoid duplicates
  
  for (const fk of table.foreignKeys) {
    // Find the referenced table
    const refTable = allTables.find(t => t.name === fk.referencedTable);
    if (!refTable) continue;
    
    // Get the actual PK columns from the referenced table
    const refPkColumns = refTable.columns.filter(c => c.isPrimaryKey).map(c => c.name);
    if (refPkColumns.length === 0) continue;
    
    // CRITICAL FIX: Match the number of FK columns to PK columns
    // If we have more FK columns than PK columns, create separate FKs
    if (fk.columns.length > refPkColumns.length && refPkColumns.length === 1) {
      // Create separate single-column FKs
      for (const fkCol of fk.columns) {
        const constraintName = `fk_${table.name.toLowerCase()}_${fkCol.toLowerCase()}`;
        
        // Skip if already created
        if (createdConstraints.has(constraintName)) continue;
        createdConstraints.add(constraintName);
        
        const refTableName = schemaName ? `${schemaName}.${fk.referencedTable}` : fk.referencedTable;
        
        sql += `ALTER TABLE ${fullName}\n`;
        sql += `    ADD CONSTRAINT ${constraintName}\n`;
        sql += `    FOREIGN KEY (${fkCol})\n`;
        sql += `    REFERENCES ${refTableName}(${refPkColumns[0]})\n`;
        sql += `    ON DELETE ${fk.onDelete || onDeleteAction}\n`;
        sql += `    ON UPDATE ${fk.onUpdate || onUpdateAction};\n\n`;
      }
    } else if (fk.columns.length === refPkColumns.length) {
      // Composite FK matches composite PK
      const constraintName = fk.name || `fk_${table.name.toLowerCase()}_${fk.columns.join('_').toLowerCase()}`;
      
      // Skip if already created
      if (createdConstraints.has(constraintName)) continue;
      createdConstraints.add(constraintName);
      
      const refTableName = schemaName ? `${schemaName}.${fk.referencedTable}` : fk.referencedTable;
      
      sql += `ALTER TABLE ${fullName}\n`;
      sql += `    ADD CONSTRAINT ${constraintName}\n`;
      sql += `    FOREIGN KEY (${fk.columns.join(', ')})\n`;
      sql += `    REFERENCES ${refTableName}(${refPkColumns.join(', ')})\n`;
      sql += `    ON DELETE ${fk.onDelete || onDeleteAction}\n`;
      sql += `    ON UPDATE ${fk.onUpdate || onUpdateAction};\n\n`;
    }
    // Else: skip mismatched FKs
  }
  
  return sql;
}

function generateIndexes(table: Table, schemaName?: string): string {
  if (table.foreignKeys.length === 0) return '';
  
  let sql = '';
  const fullName = schemaName ? `${schemaName}.${table.name}` : table.name;
  
  // Create separate indexes for each FK column
  const indexedColumns = new Set<string>();
  
  for (const fk of table.foreignKeys) {
    for (const col of fk.columns) {
      if (!indexedColumns.has(col)) {
        const indexName = `idx_${table.name.toLowerCase()}_${col.toLowerCase()}`;
        sql += `CREATE INDEX IF NOT EXISTS ${indexName}\n`;
        sql += `    ON ${fullName}(${col});\n\n`;
        indexedColumns.add(col);
      }
    }
  }
  
  return sql;
}

export function formatSQL(sql: string): string {
  return sql.replace(/\n{3,}/g, '\n\n').trim();
}