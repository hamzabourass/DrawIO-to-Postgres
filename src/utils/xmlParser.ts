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
        
        // Skip if already exists (deduplication)
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
          
          // Check if column with same name already exists
          const existingColumn = table.columns.find(
            col => col.name.toUpperCase() === columnInfo.name.toUpperCase()
          );
          
          if (!existingColumn) {
            table.columns.push(columnInfo);
          } else {
            // If duplicate, keep the one with more constraints (PK > FK > UNIQUE > regular)
            const newPriority = getColumnPriority(columnInfo);
            const existingPriority = getColumnPriority(existingColumn);
            
            if (newPriority > existingPriority) {
              // Replace with the more important one
              const index = table.columns.indexOf(existingColumn);
              table.columns[index] = columnInfo;
            }
          }
        }
      }
    }

    // Third pass: detect relationships
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
    const relationships = processRelationships(tableMap, edges);

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
  
  // Clean up corrupted names
  text = cleanColumnName(text);
  
  return text;
}

function cleanColumnName(text: string): string {
  // Remove URL-encoded characters
  try {
    text = decodeURIComponent(text);
  } catch (e) {
    // If decoding fails, continue with original text
  }
  
  // Remove embedded mxGraphModel XML garbage
  text = text.replace(/%3CmxGraphModel%3E.*?%3C%2FmxGraphModel%3E/gi, '');
  text = text.replace(/<mxGraphModel>.*?<\/mxGraphModel>/gi, '');
  
  // Remove any remaining HTML/XML tags
  text = text.replace(/<[^>]*>/g, '');
  
  // Remove HTML entities
  text = text.replace(/&[a-z]+;/gi, '');
  
  // Trim whitespace
  text = text.trim();
  
  return text;
}

function parseColumn(value: string): Column | null {
  const temp = document.createElement('div');
  temp.innerHTML = value;
  let text = temp.textContent?.trim() || '';
  
  // Clean corrupted text
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
  
  // Additional cleaning for column name
  namePart = namePart.replace(/[%<>]/g, '').trim();
  
  // Skip if name is still corrupted or too long
  if (namePart.length > 100 || namePart.includes('mxGraphModel')) {
    return null;
  }
  
  // Skip if name is empty
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

function processRelationships(tableMap: Map<string, Table>, edges: Edge[]): Relationship[] {
  const relationships: Relationship[] = [];
  
  for (const edge of edges) {
    const sourceTable = tableMap.get(edge.source);
    const targetTable = tableMap.get(edge.target);
    
    if (!sourceTable || !targetTable) continue;
    
    const cardinality = determineCardinality(edge.style);
    
    relationships.push({
      fromTable: sourceTable.name,
      toTable: targetTable.name,
      cardinality,
      edge
    });
    
    createForeignKey(sourceTable, targetTable, cardinality, edge);
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

function createForeignKey(sourceTable: Table, targetTable: Table, cardinality: Cardinality, edge: Edge): void {
  let tableWithFK: Table;
  let referencedTable: Table;
  
  if (cardinality === Cardinality.ONE_TO_MANY) {
    tableWithFK = targetTable;
    referencedTable = sourceTable;
  } else if (cardinality === Cardinality.MANY_TO_ONE) {
    tableWithFK = sourceTable;
    referencedTable = targetTable;
  } else if (cardinality === Cardinality.ONE_TO_ONE) {
    tableWithFK = targetTable;
    referencedTable = sourceTable;
  } else {
    return;
  }
  
  const fkColumns = tableWithFK.columns.filter(col => 
    col.isForeignKey && (
      col.name.toUpperCase().includes(referencedTable.name.toUpperCase()) ||
      col.name.toUpperCase().endsWith('_ID') ||
      col.name.toUpperCase() === 'ID'
    )
  );
  
  if (fkColumns.length === 0) return;
  
  const pkColumns = referencedTable.columns.filter(col => col.isPrimaryKey).map(col => col.name);
  if (pkColumns.length === 0) pkColumns.push('ID');
  
  const existingFk = tableWithFK.foreignKeys.find(fk => fk.columns[0] === fkColumns[0].name);
  
  if (!existingFk) {
    tableWithFK.foreignKeys.push({
      columns: fkColumns.map(c => c.name),
      referencedTable: referencedTable.name,
      referencedColumns: pkColumns,
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
  }
}