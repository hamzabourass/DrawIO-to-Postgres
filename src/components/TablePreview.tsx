'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Key, Database, FileSpreadsheet, Download } from 'lucide-react';
import { Table } from '@/types/database';
import { generateExcelFile, generateSingleTableExcel, generateCSVFile } from '@/utils/excelGenerator';

interface TablePreviewProps {
  tables: Table[];
}

export default function TablePreview({ tables }: TablePreviewProps) {
  const [expandedTables, setExpandedTables] = useState<Set<string>>(new Set());
  const [isExporting, setIsExporting] = useState(false);

  const toggleTable = (tableName: string) => {
    const newExpanded = new Set(expandedTables);
    if (newExpanded.has(tableName)) {
      newExpanded.delete(tableName);
    } else {
      newExpanded.add(tableName);
    }
    setExpandedTables(newExpanded);
  };

  const handleExportAllToExcel = () => {
    setIsExporting(true);
    try {
      generateExcelFile(tables);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
    } finally {
      setTimeout(() => setIsExporting(false), 1000);
    }
  };

  const handleExportSingleTable = (table: Table) => {
    try {
      generateSingleTableExcel(table);
    } catch (error) {
      console.error('Error exporting table to Excel:', error);
    }
  };

  const handleExportToCSV = () => {
    setIsExporting(true);
    try {
      generateCSVFile(tables);
    } catch (error) {
      console.error('Error exporting to CSV:', error);
    } finally {
      setTimeout(() => setIsExporting(false), 1000);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 p-8 mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
          <div className="p-2.5 bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500 rounded-xl mr-3 shadow-lg">
            <Database className="w-6 h-6 text-white" />
          </div>
          Detected Tables
        </h2>
        <div className="flex items-center gap-2">
          <span className="px-4 py-2 bg-gradient-to-r from-blue-100 via-cyan-100 to-teal-100 text-blue-800 rounded-xl text-sm font-bold shadow-sm border border-blue-200">
            {tables.length} {tables.length === 1 ? 'Table' : 'Tables'}
          </span>
        </div>
      </div>

      {/* Export Buttons */}
      <div className="mb-6 p-5 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border-2 border-emerald-200">
        <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center">
          <FileSpreadsheet className="w-5 h-5 mr-2 text-emerald-600" />
          Export Options
        </h3>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleExportAllToExcel}
            disabled={isExporting}
            className="flex items-center px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all duration-300 font-bold shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            {isExporting ? 'Exporting...' : 'Export All to Excel'}
          </button>
          <button
            onClick={handleExportToCSV}
            disabled={isExporting}
            className="flex items-center px-5 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 font-bold shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4 mr-2" />
            {isExporting ? 'Exporting...' : 'Export to CSV'}
          </button>
        </div>
        <p className="text-xs text-gray-600 mt-3">
          Excel export includes: Summary sheet, individual table sheets, and a comprehensive "All Tables" sheet
        </p>
      </div>
      
      <div className="space-y-4">
        {tables.map((table) => {
          const isExpanded = expandedTables.has(table.name);
          const pkColumns = table.columns.filter(c => c.isPrimaryKey);
          const fkColumns = table.columns.filter(c => c.isForeignKey);
          
          return (
            <div 
              key={table.id} 
              className="border-2 border-gray-200 rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:border-violet-300"
            >
              <div
                className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 p-6 cursor-pointer hover:from-indigo-100 hover:via-purple-100 hover:to-pink-100 transition-all duration-300"
                onClick={() => toggleTable(table.name)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white rounded-xl shadow-md">
                      <Database className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-xl text-indigo-900 mb-1">{table.name}</h3>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-600 font-medium">
                          {table.columns.length} {table.columns.length === 1 ? 'column' : 'columns'}
                        </span>
                        {pkColumns.length > 0 && (
                          <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-md text-xs font-bold">
                            {pkColumns.length} PK
                          </span>
                        )}
                        {fkColumns.length > 0 && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-xs font-bold">
                            {fkColumns.length} FK
                          </span>
                        )}
                      </div>
                    </div>
                    {table.isJunctionTable && (
                      <span className="px-3 py-1.5 text-xs bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 rounded-xl font-bold shadow-sm border border-purple-200">
                        Junction Table
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleExportSingleTable(table);
                      }}
                      className="flex items-center px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-all duration-200 font-bold text-sm shadow-sm hover:shadow-md"
                      title={`Export ${table.name} to Excel`}
                    >
                      <FileSpreadsheet className="w-4 h-4 mr-1.5" />
                      Export
                    </button>
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      {isExpanded ? 
                        <ChevronUp className="w-5 h-5 text-gray-600" /> : 
                        <ChevronDown className="w-5 h-5 text-gray-600" />
                      }
                    </div>
                  </div>
                </div>
              </div>

              {isExpanded && (
                <div className="p-6 bg-white space-y-6">
                  {pkColumns.length > 0 && (
                    <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-5 border-2 border-emerald-200">
                      <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center">
                        <Key className="w-5 h-5 mr-2 text-emerald-600" />
                        Primary Key{pkColumns.length > 1 ? 's' : ''}
                        {pkColumns.length > 1 && (
                          <span className="ml-2 text-xs bg-emerald-200 text-emerald-900 px-3 py-1 rounded-full font-bold">
                            Composite
                          </span>
                        )}
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {pkColumns.map((col) => (
                          <div 
                            key={col.name} 
                            className="px-4 py-2 bg-white border-2 border-emerald-300 text-emerald-900 rounded-lg text-sm font-bold shadow-sm hover:shadow-md transition-shadow"
                          >
                            <span className="text-emerald-700">{col.name}</span>
                            <span className="text-gray-500 mx-1">:</span>
                            <span className="text-gray-700 font-mono text-xs">{col.type}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {fkColumns.length > 0 && (
                    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-5 border-2 border-blue-200">
                      <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                        Foreign Key{fkColumns.length > 1 ? 's' : ''}
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {fkColumns.map((col) => (
                          <div 
                            key={col.name} 
                            className="px-4 py-2 bg-white border-2 border-blue-300 text-blue-900 rounded-lg text-sm font-bold shadow-sm hover:shadow-md transition-shadow"
                          >
                            <span className="text-blue-700">{col.name}</span>
                            <span className="text-gray-500 mx-1">:</span>
                            <span className="text-gray-700 font-mono text-xs">{col.type}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center">
                      <div className="w-2 h-2 bg-violet-500 rounded-full mr-2"></div>
                      All Columns
                    </h4>
                    <div className="overflow-x-auto rounded-xl border-2 border-gray-200 shadow-sm">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gradient-to-r from-gray-50 via-gray-100 to-gray-50">
                          <tr>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                              Column Name
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                              Type
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                              Constraints
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {table.columns.map((col, idx) => (
                            <tr key={idx} className="hover:bg-gradient-to-r hover:from-violet-50 hover:to-purple-50 transition-colors">
                              <td className="px-6 py-4 text-sm font-bold text-gray-900">{col.name}</td>
                              <td className="px-6 py-4 text-sm text-gray-700 font-mono bg-gray-50 rounded">{col.type}</td>
                              <td className="px-6 py-4 text-sm">
                                <div className="flex flex-wrap gap-2">
                                  {col.isPrimaryKey && (
                                    <span className="px-3 py-1 text-xs bg-emerald-100 text-emerald-800 rounded-lg font-bold border border-emerald-200">
                                      PK
                                    </span>
                                  )}
                                  {col.isForeignKey && (
                                    <span className="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded-lg font-bold border border-blue-200">
                                      FK
                                    </span>
                                  )}
                                  {col.isNotNull && !col.isPrimaryKey && (
                                    <span className="px-3 py-1 text-xs bg-amber-100 text-amber-800 rounded-lg font-bold border border-amber-200">
                                      NOT NULL
                                    </span>
                                  )}
                                  {col.isUnique && (
                                    <span className="px-3 py-1 text-xs bg-purple-100 text-purple-800 rounded-lg font-bold border border-purple-200">
                                      UNIQUE
                                    </span>
                                  )}
                                  {col.defaultValue && (
                                    <span className="px-3 py-1 text-xs bg-gray-100 text-gray-800 rounded-lg font-bold border border-gray-200">
                                      DEFAULT
                                    </span>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {table.foreignKeys.length > 0 && (
                    <div className="pt-4 border-t-2 border-gray-200">
                      <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                        Relationships
                      </h4>
                      <ul className="space-y-2">
                        {table.foreignKeys.map((fk, idx) => (
                          <li 
                            key={idx} 
                            className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 via-cyan-50 to-teal-50 rounded-xl border-2 border-blue-200 shadow-sm hover:shadow-md transition-shadow"
                          >
                            <svg className="w-5 h-5 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            <span className="text-sm text-gray-800">
                              <span className="font-bold text-blue-700">{fk.columns.join(', ')}</span>
                              <span className="mx-2 text-gray-500">→</span>
                              <span className="font-bold text-teal-700">{fk.referencedTable}</span>
                              <span className="text-gray-500">(</span>
                              <span className="text-gray-700">{fk.referencedColumns.join(', ')}</span>
                              <span className="text-gray-500">)</span>
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}