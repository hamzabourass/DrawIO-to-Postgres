import { Table, Column, Edge, ParseResult, Relationship, Cardinality } from '@/types/database';
import { mapDataType } from './typeMapper';

export function parseDrawioXML(xmlContent: string): ParseResult {
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlContent, 'text/xml');
    
    const parserError = xmlDoc.querySelector('parsererror');
    if (parserError) {
      return {
        tables: [],
        edges: [],
        relationships: [],
        success: false,
        error: 'Invalid XML format'
      };
    }

    const cells = xmlDoc.getElementsByTagName('mxCell');
    const tableMap = new Map<string, Table>();
    const edges: Edge[] = [];

    // First pass: identify tables
    for (let i = 0; i < cells.length; i++) {
      const cell = cells[i];
      const value = cell.getAttribute('value');
      const style = cell.getAttribute('style');
      const id = cell.getAttribute('id');
      
      if (style && style.includes('swimlane') && value && id) {
        const tableName = extractTableName(value);
        
        // Skip duplicates
        if (Array.from(tableMap.values()).some(t => t.name === tableName)) {
          continue;
        }
        
        tableMap.set(id, {
          id,
          name: tableName,
          columns: [],
          foreignKeys: [],
          uniqueConstraints: [],
          checkConstraints: [],
          isJunctionTable: false
        });
      }
    }

    // Second pass: collect columns
    for (let i = 0; i < cells.length; i++) {
      const cell = cells[i];
      const parent = cell.getAttribute('parent');
      const value = cell.getAttribute('value');
      const style = cell.getAttribute('style');
      
      if (parent && tableMap.has(parent) && value && style && style.includes('text')) {
        const columnInfo = parseColumn(value);
        if (columnInfo) {
          const table = tableMap.get(parent)!;
          
          // Check for duplicates
          const existingColumn = table.columns.find(
            col => col.name.toUpperCase() === columnInfo.name.toUpperCase()
          );
          
          if (!existingColumn) {
            table.columns.push(columnInfo);
          } else {
            const newPriority = getColumnPriority(columnInfo);
            const existingPriority = getColumnPriority(existingColumn);
            
            if (newPriority > existingPriority) {
              const index = table.columns.indexOf(existingColumn);
              table.columns[index] = columnInfo;
            }
          }
        }
      }
    }

    // Third pass: collect edges for documentation
    for (let i = 0; i < cells.length; i++) {
      const cell = cells[i];
      const style = cell.getAttribute('style');
      const id = cell.getAttribute('id');
      const source = cell.getAttribute('source');
      const target = cell.getAttribute('target');
      
      if (style && style.includes('edgeStyle') && id && source && target) {
        edges.push({ id, source, target, style });
      }
    }

    detectJunctionTables(tableMap, edges);
    
    // IMPORTANT: Infer FK relationships from column names, NOT from edges
    inferForeignKeys(tableMap);
    
    const relationships = buildRelationships(tableMap, edges);

    return {
      tables: Array.from(tableMap.values()),
      edges,
      relationships,
      success: true
    };
  } catch (err) {
    return {
      tables: [],
      edges: [],
      relationships: [],
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error'
    };
  }
}

function getColumnPriority(column: Column): number {
  if (column.isPrimaryKey) return 4;
  if (column.isForeignKey) return 3;
  if (column.isUnique) return 2;
  if (column.isNotNull) return 1;
  return 0;
}

function extractTableName(value: string): string {
  const temp = document.createElement('div');
  temp.innerHTML = value;
  let text = temp.textContent?.trim() || 'UnknownTable';
  text = cleanColumnName(text);
  return text;
}

function cleanColumnName(text: string): string {
  try {
    text = decodeURIComponent(text);
  } catch (e) {
    // Continue with original
  }
  
  text = text.replace(/%3CmxGraphModel%3E.*?%3C%2FmxGraphModel%3E/gi, '');
  text = text.replace(/<mxGraphModel>.*?<\/mxGraphModel>/gi, '');
  text = text.replace(/<[^>]*>/g, '');
  text = text.replace(/&[a-z]+;/gi, '');
  text = text.trim();
  
  return text;
}

function parseColumn(value: string): Column | null {
  const temp = document.createElement('div');
  temp.innerHTML = value;
  let text = temp.textContent?.trim() || '';
  
  text = cleanColumnName(text);
  
  if (!text.includes(':')) return null;
  
  const isPrimaryKey = text.includes('[PK]');
  const isForeignKey = text.includes('[FK]');
  const isUnique = text.includes('[UNIQUE]') || text.includes('[UQ]');
  const isUnderlined = value.includes('<u>');
  
  const parts = text.split(':');
  if (parts.length < 2) return null;
  
  let namePart = parts[0].trim().replace(/^[+#]\s*/, '');
  const typePart = parts[1].trim().replace(/\[PK\]|\[FK\]|\[UNIQUE\]|\[UQ\]/g, '').trim();
  
  namePart = namePart.replace(/[%<>]/g, '').trim();
  
  if (namePart.length > 100 || namePart.includes('mxGraphModel')) {
    return null;
  }
  
  if (!namePart) return null;
  
  return {
    name: namePart,
    type: mapDataType(typePart),
    isPrimaryKey,
    isForeignKey,
    isNotNull: isPrimaryKey || isUnderlined,
    isUnique
  };
}

function detectJunctionTables(tableMap: Map<string, Table>, edges: Edge[]): void {
  for (const [id, table] of tableMap) {
    const fkCount = table.columns.filter(c => c.isForeignKey).length;
    const pkCount = table.columns.filter(c => c.isPrimaryKey).length;
    const totalColumns = table.columns.length;
    
    if (fkCount >= 2 && (pkCount + fkCount) >= totalColumns * 0.8 && totalColumns <= 6) {
      table.isJunctionTable = true;
    }
  }
}

/**
 * Infer foreign key relationships from column names marked with [FK]
 * This uses intelligent name matching to find the referenced table
 */
function inferForeignKeys(tableMap: Map<string, Table>): void {
  const tables = Array.from(tableMap.values());
  
  for (const table of tables) {
    const fkColumns = table.columns.filter(c => c.isForeignKey);
    
    for (const fkCol of fkColumns) {
      // Try to find the referenced table from the column name
      const referencedTableName = guessReferencedTable(fkCol.name, tables, table.name);
      
      if (referencedTableName) {
        const refTable = tables.find(t => t.name === referencedTableName);
        if (refTable) {
          const refPkColumns = refTable.columns.filter(c => c.isPrimaryKey).map(c => c.name);
          
          if (refPkColumns.length > 0) {
            // Check if FK already exists
            const exists = table.foreignKeys.some(
              fk => fk.columns.includes(fkCol.name) && fk.referencedTable === referencedTableName
            );
            
            if (!exists) {
              table.foreignKeys.push({
                columns: [fkCol.name],
                referencedTable: referencedTableName,
                referencedColumns: [refPkColumns[0]], // Use first PK column
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE'
              });
            }
          }
        }
      }
    }
  }
}

/**
 * Guess the referenced table name from a foreign key column name
 * Examples:
 * - USER_ID -> User
 * - D_DEMANDEUR_ID -> D_Demandeur
 * - CANDIDAT_ASD_ID -> Candidat
 */
function guessReferencedTable(columnName: string, allTables: Table[], currentTableName: string): string | null {
  const cleanName = columnName.toUpperCase().replace(/_ID$/i, '');
  
  // Try exact match first
  for (const table of allTables) {
    if (table.name.toUpperCase() === cleanName) {
      return table.name;
    }
  }
  
  // Try partial match (column name contains table name)
  for (const table of allTables) {
    const tableNameUpper = table.name.toUpperCase();
    if (cleanName.includes(tableNameUpper) || tableNameUpper.includes(cleanName)) {
      return table.name;
    }
  }
  
  // Try without prefixes (D_, M_, P_, etc.)
  const withoutPrefix = cleanName.replace(/^[A-Z]_/, '');
  for (const table of allTables) {
    const tableWithoutPrefix = table.name.toUpperCase().replace(/^[A-Z]_/, '');
    if (withoutPrefix === tableWithoutPrefix) {
      return table.name;
    }
  }
  
  // If nothing found, return null
  return null;
}

/**
 * Build relationships from edges for documentation purposes
 */
function buildRelationships(tableMap: Map<string, Table>, edges: Edge[]): Relationship[] {
  const relationships: Relationship[] = [];
  
  for (const edge of edges) {
    const sourceTable = tableMap.get(edge.source);
    const targetTable = tableMap.get(edge.target);
    
    if (sourceTable && targetTable) {
      const cardinality = determineCardinality(edge.style);
      relationships.push({
        fromTable: sourceTable.name,
        toTable: targetTable.name,
        cardinality,
        edge
      });
    }
  }
  
  return relationships;
}

function determineCardinality(style: string): Cardinality {
  if (style.includes('ERoneToMany')) return Cardinality.ONE_TO_MANY;
  if (style.includes('ERmanyToOne')) return Cardinality.MANY_TO_ONE;
  if (style.includes('ERmanyToMany')) return Cardinality.MANY_TO_MANY;
  if (style.includes('ERoneToOne')) return Cardinality.ONE_TO_ONE;
  return Cardinality.ONE_TO_MANY;
}