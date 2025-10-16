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
  const createdConstraints = new Set<string>();
  
  // Group FK columns by referenced table to detect composite keys
  const fksByRefTable = new Map<string, string[]>();
  
  for (const fk of table.foreignKeys) {
    const key = fk.referencedTable;
    if (!fksByRefTable.has(key)) {
      fksByRefTable.set(key, []);
    }
    fksByRefTable.get(key)!.push(...fk.columns);
  }
  
  // Process each referenced table
  for (const [refTableName, fkColumns] of fksByRefTable) {
    const refTable = allTables.find(t => t.name === refTableName);
    if (!refTable) continue;
    
    const refPkColumns = refTable.columns.filter(c => c.isPrimaryKey).map(c => c.name);
    if (refPkColumns.length === 0) continue;
    
    // Remove duplicates from FK columns
    const uniqueFkColumns = Array.from(new Set(fkColumns));
    
    // If we have a composite PK and matching number of FK columns, create composite FK
    if (refPkColumns.length > 1 && uniqueFkColumns.length === refPkColumns.length) {
      const constraintName = `fk_${table.name.toLowerCase()}_${refTableName.toLowerCase()}`;
      
      if (!createdConstraints.has(constraintName)) {
        createdConstraints.add(constraintName);
        
        const refTableFullName = schemaName ? `${schemaName}.${refTableName}` : refTableName;
        
        sql += `ALTER TABLE ${fullName}\n`;
        sql += `    ADD CONSTRAINT ${constraintName}\n`;
        sql += `    FOREIGN KEY (${uniqueFkColumns.join(', ')})\n`;
        sql += `    REFERENCES ${refTableFullName}(${refPkColumns.join(', ')})\n`;
        sql += `    ON DELETE ${onDeleteAction}\n`;
        sql += `    ON UPDATE ${onUpdateAction};\n\n`;
      }
    } else {
      // Create individual FKs for each column
      for (const fkCol of uniqueFkColumns) {
        const constraintName = `fk_${table.name.toLowerCase()}_${fkCol.toLowerCase()}`;
        
        if (!createdConstraints.has(constraintName)) {
          createdConstraints.add(constraintName);
          
          const refTableFullName = schemaName ? `${schemaName}.${refTableName}` : refTableName;
          
          sql += `ALTER TABLE ${fullName}\n`;
          sql += `    ADD CONSTRAINT ${constraintName}\n`;
          sql += `    FOREIGN KEY (${fkCol})\n`;
          sql += `    REFERENCES ${refTableFullName}(${refPkColumns[0]})\n`;
          sql += `    ON DELETE ${onDeleteAction}\n`;
          sql += `    ON UPDATE ${onUpdateAction};\n\n`;
        }
      }
    }
  }
  
  return sql;
}

function generateIndexes(table: Table, schemaName?: string): string {
  if (table.foreignKeys.length === 0) return '';
  
  let sql = '';
  const fullName = schemaName ? `${schemaName}.${table.name}` : table.name;
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