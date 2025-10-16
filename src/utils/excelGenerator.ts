import * as XLSX from 'xlsx';
import { Table } from '@/types/database';

// Define cell styles
const headerStyle = {
  font: { bold: true, color: { rgb: "FFFFFF" }, size: 12 },
  fill: { fgColor: { rgb: "4F46E5" } },
  alignment: { horizontal: "center", vertical: "center" }
};

const tableNameStyle = {
  font: { bold: true, size: 14, color: { rgb: "4F46E5" } },
  alignment: { horizontal: "left", vertical: "center" }
};

const pkStyle = {
  font: { bold: true, color: { rgb: "059669" } },
  fill: { fgColor: { rgb: "D1FAE5" } },
  alignment: { horizontal: "left", vertical: "center" }
};

const fkStyle = {
  font: { bold: true, color: { rgb: "2563EB" } },
  fill: { fgColor: { rgb: "DBEAFE" } },
  alignment: { horizontal: "left", vertical: "center" }
};

const subHeaderStyle = {
  font: { bold: true, size: 11, color: { rgb: "FFFFFF" } },
  fill: { fgColor: { rgb: "7C3AED" } },
  alignment: { horizontal: "center", vertical: "center" }
};

const regularStyle = {
  alignment: { horizontal: "left", vertical: "center" }
};

/**
 * Apply style to a cell
 */
function applyStyle(worksheet: any, cell: string, style: any) {
  if (!worksheet[cell]) return;
  worksheet[cell].s = style;
}

/**
 * Apply style to a range of cells
 */
function applyStyleToRange(worksheet: any, startCol: string, startRow: number, endCol: string, endRow: number, style: any) {
  const cols = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const startColIdx = cols.indexOf(startCol);
  const endColIdx = cols.indexOf(endCol);
  
  for (let row = startRow; row <= endRow; row++) {
    for (let colIdx = startColIdx; colIdx <= endColIdx; colIdx++) {
      const cell = cols[colIdx] + row;
      applyStyle(worksheet, cell, style);
    }
  }
}

/**
 * Generates an Excel file with all tables and their attributes
 */
export function generateExcelFile(tables: Table[]): void {
  // Create a new workbook
  const workbook = XLSX.utils.book_new();

  // Create a summary sheet
  const summaryData = [
    ['DATABASE SCHEMA SUMMARY'],
    [''],
    ['Table Name', 'Total Columns', 'Primary Keys', 'Foreign Keys', 'Junction Table'],
    ...tables.map(table => [
      table.name,
      table.columns.length,
      table.columns.filter(c => c.isPrimaryKey).length,
      table.columns.filter(c => c.isForeignKey).length,
      table.isJunctionTable ? 'Yes' : 'No'
    ])
  ];

  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  
  // Style summary sheet
  applyStyle(summarySheet, 'A1', { 
    font: { bold: true, size: 16, color: { rgb: "4F46E5" } },
    alignment: { horizontal: "center", vertical: "center" }
  });
  
  // Merge title cell
  summarySheet['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 4 } }];
  
  // Style headers
  applyStyleToRange(summarySheet, 'A', 3, 'E', 3, headerStyle);
  
  // Set column widths
  summarySheet['!cols'] = [
    { wch: 30 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 }
  ];

  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

  // Create a sheet for each table
  const usedSheetNames = new Set<string>();
  
  tables.forEach((table, index) => {
    const tableData: any[][] = [
      [`TABLE: ${table.name.toUpperCase()}`],
      [''],
      ['Column Name', 'Data Type', 'Primary Key', 'Foreign Key', 'Not Null', 'Unique', 'Default Value', 'Check Constraint']
    ];

    let currentRow = 4; // Starting row for data (1-indexed)

    // Add columns
    table.columns.forEach(col => {
      tableData.push([
        col.name,
        col.type,
        col.isPrimaryKey ? '✓' : '',
        col.isForeignKey ? '✓' : '',
        col.isNotNull ? '✓' : '',
        col.isUnique ? '✓' : '',
        col.defaultValue || '',
        col.checkConstraint || ''
      ]);
    });

    // Add foreign key relationships section if they exist
    if (table.foreignKeys.length > 0) {
      currentRow = tableData.length + 1;
      tableData.push([]);
      tableData.push(['FOREIGN KEY RELATIONSHIPS']);
      tableData.push(['Column(s)', 'References Table', 'References Column(s)', 'On Delete', 'On Update']);
      table.foreignKeys.forEach(fk => {
        tableData.push([
          fk.columns.join(', '),
          fk.referencedTable,
          fk.referencedColumns.join(', '),
          fk.onDelete || 'CASCADE',
          fk.onUpdate || 'CASCADE'
        ]);
      });
    }

    const tableSheet = XLSX.utils.aoa_to_sheet(tableData);
    
    // Style table name
    applyStyle(tableSheet, 'A1', tableNameStyle);
    tableSheet['!merges'] = tableSheet['!merges'] || [];
    tableSheet['!merges'].push({ s: { r: 0, c: 0 }, e: { r: 0, c: 7 } });
    
    // Style column headers
    applyStyleToRange(tableSheet, 'A', 3, 'H', 3, headerStyle);
    
    // Apply styles to data rows
    table.columns.forEach((col, idx) => {
      const rowNum = idx + 4;
      const cols = 'ABCDEFGH';
      
      // Apply PK style
      if (col.isPrimaryKey) {
        for (let i = 0; i < 8; i++) {
          applyStyle(tableSheet, cols[i] + rowNum, pkStyle);
        }
      }
      // Apply FK style
      else if (col.isForeignKey) {
        for (let i = 0; i < 8; i++) {
          applyStyle(tableSheet, cols[i] + rowNum, fkStyle);
        }
      }
      // Apply regular style
      else {
        for (let i = 0; i < 8; i++) {
          applyStyle(tableSheet, cols[i] + rowNum, regularStyle);
        }
      }
    });

    // Style FK relationships section if exists
    if (table.foreignKeys.length > 0) {
      const fkHeaderRow = table.columns.length + 5;
      applyStyle(tableSheet, 'A' + fkHeaderRow, subHeaderStyle);
      tableSheet['!merges'].push({ 
        s: { r: fkHeaderRow - 1, c: 0 }, 
        e: { r: fkHeaderRow - 1, c: 4 } 
      });
      
      applyStyleToRange(tableSheet, 'A', fkHeaderRow + 1, 'E', fkHeaderRow + 1, headerStyle);
    }
    
    // Set column widths
    tableSheet['!cols'] = [
      { wch: 25 },  // Column Name
      { wch: 20 },  // Data Type
      { wch: 12 },  // Primary Key
      { wch: 12 },  // Foreign Key
      { wch: 10 },  // Not Null
      { wch: 10 },  // Unique
      { wch: 18 },  // Default Value
      { wch: 25 }   // Check Constraint
    ];

    // Generate unique sheet name (Excel limit is 31 characters)
    let sheetName = table.name;
    
    // If name is too long, truncate it
    if (sheetName.length > 28) {
      sheetName = sheetName.substring(0, 28);
    }
    
    // If sheet name already exists, add a number suffix
    let finalSheetName = sheetName;
    let counter = 1;
    while (usedSheetNames.has(finalSheetName)) {
      const suffix = `_${counter}`;
      const maxLength = 31 - suffix.length;
      finalSheetName = sheetName.substring(0, maxLength) + suffix;
      counter++;
    }
    
    usedSheetNames.add(finalSheetName);
    XLSX.utils.book_append_sheet(workbook, tableSheet, finalSheetName);
  });

  // Create a comprehensive "All Tables" sheet
  const allTablesData: any[][] = [
    ['COMPLETE DATABASE SCHEMA'],
    [''],
    ['Table Name', 'Column Name', 'Data Type', 'PK', 'FK', 'Not Null', 'Unique', 'Default', 'Check Constraint']
  ];

  tables.forEach(table => {
    table.columns.forEach((col, index) => {
      allTablesData.push([
        index === 0 ? table.name : '', // Only show table name on first row
        col.name,
        col.type,
        col.isPrimaryKey ? '✓' : '',
        col.isForeignKey ? '✓' : '',
        col.isNotNull ? '✓' : '',
        col.isUnique ? '✓' : '',
        col.defaultValue || '',
        col.checkConstraint || ''
      ]);
    });
    // Add empty row between tables
    allTablesData.push(['', '', '', '', '', '', '', '', '']);
  });

  const allTablesSheet = XLSX.utils.aoa_to_sheet(allTablesData);
  
  // Style title
  applyStyle(allTablesSheet, 'A1', {
    font: { bold: true, size: 16, color: { rgb: "4F46E5" } },
    alignment: { horizontal: "center", vertical: "center" }
  });
  allTablesSheet['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 8 } }];
  
  // Style headers
  applyStyleToRange(allTablesSheet, 'A', 3, 'I', 3, headerStyle);
  
  // Apply styles to data rows
  let currentRow = 4;
  tables.forEach(table => {
    table.columns.forEach((col) => {
      const cols = 'ABCDEFGHI';
      
      if (col.isPrimaryKey) {
        for (let i = 0; i < 9; i++) {
          applyStyle(allTablesSheet, cols[i] + currentRow, pkStyle);
        }
      } else if (col.isForeignKey) {
        for (let i = 0; i < 9; i++) {
          applyStyle(allTablesSheet, cols[i] + currentRow, fkStyle);
        }
      } else {
        for (let i = 0; i < 9; i++) {
          applyStyle(allTablesSheet, cols[i] + currentRow, regularStyle);
        }
      }
      currentRow++;
    });
    currentRow++; // Skip empty row
  });
  
  allTablesSheet['!cols'] = [
    { wch: 30 },  // Table Name
    { wch: 25 },  // Column Name
    { wch: 20 },  // Data Type
    { wch: 8 },   // PK
    { wch: 8 },   // FK
    { wch: 10 },  // Not Null
    { wch: 10 },  // Unique
    { wch: 18 },  // Default
    { wch: 25 }   // Check Constraint
  ];

  XLSX.utils.book_append_sheet(workbook, allTablesSheet, 'All Tables');

  // Generate Excel file
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
  const fileName = `database_schema_${timestamp}.xlsx`;
  
  XLSX.writeFile(workbook, fileName, { cellStyles: true });
}

/**
 * Generates an Excel file for a single table
 */
export function generateSingleTableExcel(table: Table): void {
  const workbook = XLSX.utils.book_new();

  const tableData: any[][] = [
    [`TABLE: ${table.name.toUpperCase()}`],
    table.isJunctionTable ? ['Type: JUNCTION TABLE'] : [],
    [''],
    ['Column Name', 'Data Type', 'Primary Key', 'Foreign Key', 'Not Null', 'Unique', 'Default Value', 'Check Constraint']
  ];

  // Add columns
  table.columns.forEach(col => {
    tableData.push([
      col.name,
      col.type,
      col.isPrimaryKey ? '✓' : '',
      col.isForeignKey ? '✓' : '',
      col.isNotNull ? '✓' : '',
      col.isUnique ? '✓' : '',
      col.defaultValue || '',
      col.checkConstraint || ''
    ]);
  });

  // Add constraints section
  if (table.foreignKeys.length > 0) {
    tableData.push([]);
    tableData.push(['FOREIGN KEY CONSTRAINTS']);
    tableData.push(['Column(s)', 'References Table', 'References Column(s)', 'On Delete', 'On Update']);
    table.foreignKeys.forEach(fk => {
      tableData.push([
        fk.columns.join(', '),
        fk.referencedTable,
        fk.referencedColumns.join(', '),
        fk.onDelete || 'CASCADE',
        fk.onUpdate || 'CASCADE'
      ]);
    });
  }

  if (table.uniqueConstraints.length > 0) {
    tableData.push([]);
    tableData.push(['UNIQUE CONSTRAINTS']);
    tableData.push(['Constraint Name', 'Column(s)']);
    table.uniqueConstraints.forEach(uq => {
      tableData.push([
        uq.name,
        uq.columns.join(', ')
      ]);
    });
  }

  if (table.checkConstraints.length > 0) {
    tableData.push([]);
    tableData.push(['CHECK CONSTRAINTS']);
    tableData.push(['Constraint Name', 'Expression']);
    table.checkConstraints.forEach(ck => {
      tableData.push([
        ck.name,
        ck.expression
      ]);
    });
  }

  const tableSheet = XLSX.utils.aoa_to_sheet(tableData);
  
  // Style table name
  const titleRow = table.isJunctionTable ? 1 : 1;
  applyStyle(tableSheet, 'A' + titleRow, tableNameStyle);
  tableSheet['!merges'] = tableSheet['!merges'] || [];
  tableSheet['!merges'].push({ s: { r: 0, c: 0 }, e: { r: 0, c: 7 } });
  
  // Style junction table type if applicable
  if (table.isJunctionTable) {
    applyStyle(tableSheet, 'A2', {
      font: { bold: true, color: { rgb: "9333EA" } },
      fill: { fgColor: { rgb: "F3E8FF" } },
      alignment: { horizontal: "left", vertical: "center" }
    });
    tableSheet['!merges'].push({ s: { r: 1, c: 0 }, e: { r: 1, c: 7 } });
  }
  
  // Style column headers
  const headerRow = table.isJunctionTable ? 4 : 4;
  applyStyleToRange(tableSheet, 'A', headerRow, 'H', headerRow, headerStyle);
  
  // Apply styles to data rows
  const dataStartRow = headerRow + 1;
  table.columns.forEach((col, idx) => {
    const rowNum = dataStartRow + idx;
    const cols = 'ABCDEFGH';
    
    if (col.isPrimaryKey) {
      for (let i = 0; i < 8; i++) {
        applyStyle(tableSheet, cols[i] + rowNum, pkStyle);
      }
    } else if (col.isForeignKey) {
      for (let i = 0; i < 8; i++) {
        applyStyle(tableSheet, cols[i] + rowNum, fkStyle);
      }
    } else {
      for (let i = 0; i < 8; i++) {
        applyStyle(tableSheet, cols[i] + rowNum, regularStyle);
      }
    }
  });

  // Style constraint sections
  let currentRow = dataStartRow + table.columns.length + 1;
  
  if (table.foreignKeys.length > 0) {
    currentRow++;
    applyStyle(tableSheet, 'A' + currentRow, subHeaderStyle);
    tableSheet['!merges'].push({ s: { r: currentRow - 1, c: 0 }, e: { r: currentRow - 1, c: 4 } });
    currentRow++;
    applyStyleToRange(tableSheet, 'A', currentRow, 'E', currentRow, headerStyle);
    currentRow += table.foreignKeys.length + 1;
  }

  if (table.uniqueConstraints.length > 0) {
    currentRow++;
    applyStyle(tableSheet, 'A' + currentRow, subHeaderStyle);
    tableSheet['!merges'].push({ s: { r: currentRow - 1, c: 0 }, e: { r: currentRow - 1, c: 1 } });
    currentRow++;
    applyStyleToRange(tableSheet, 'A', currentRow, 'B', currentRow, headerStyle);
    currentRow += table.uniqueConstraints.length + 1;
  }

  if (table.checkConstraints.length > 0) {
    currentRow++;
    applyStyle(tableSheet, 'A' + currentRow, subHeaderStyle);
    tableSheet['!merges'].push({ s: { r: currentRow - 1, c: 0 }, e: { r: currentRow - 1, c: 1 } });
    currentRow++;
    applyStyleToRange(tableSheet, 'A', currentRow, 'B', currentRow, headerStyle);
  }
  
  tableSheet['!cols'] = [
    { wch: 25 },
    { wch: 20 },
    { wch: 12 },
    { wch: 12 },
    { wch: 10 },
    { wch: 10 },
    { wch: 18 },
    { wch: 25 }
  ];

  XLSX.utils.book_append_sheet(workbook, tableSheet, table.name.substring(0, 31));

  const fileName = `${table.name}_schema.xlsx`;
  XLSX.writeFile(workbook, fileName, { cellStyles: true });
}

/**
 * Export table data as CSV (alternative format)
 */
export function generateCSVFile(tables: Table[]): void {
  const csvData = [
    ['Table Name', 'Column Name', 'Data Type', 'Primary Key', 'Foreign Key', 'Not Null', 'Unique', 'Default Value', 'Check Constraint']
  ];

  tables.forEach(table => {
    table.columns.forEach(col => {
      csvData.push([
        table.name,
        col.name,
        col.type,
        col.isPrimaryKey ? 'Yes' : 'No',
        col.isForeignKey ? 'Yes' : 'No',
        col.isNotNull ? 'Yes' : 'No',
        col.isUnique ? 'Yes' : 'No',
        col.defaultValue || '',
        col.checkConstraint || ''
      ]);
    });
  });

  const worksheet = XLSX.utils.aoa_to_sheet(csvData);
  const csv = XLSX.utils.sheet_to_csv(worksheet);
  
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
  link.href = url;
  link.download = `database_schema_${timestamp}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}