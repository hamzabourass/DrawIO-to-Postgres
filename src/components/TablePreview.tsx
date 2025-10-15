'use client';

import React, { useState } from 'react';
import { Table as TableIcon, ChevronDown, ChevronUp, Key, Link as LinkIcon } from 'lucide-react';
import { Table } from '@/types/database';

interface TablePreviewProps {
  tables: Table[];
}

export default function TablePreview({ tables }: TablePreviewProps) {
  const [expandedTables, setExpandedTables] = useState<Set<string>>(new Set());

  const toggleTable = (tableName: string) => {
    const newExpanded = new Set(expandedTables);
    if (newExpanded.has(tableName)) {
      newExpanded.delete(tableName);
    } else {
      newExpanded.add(tableName);
    }
    setExpandedTables(newExpanded);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">
        Detected Tables ({tables.length})
      </h2>
      
      <div className="space-y-4">
        {tables.map((table) => {
          const isExpanded = expandedTables.has(table.name);
          const pkColumns = table.columns.filter(c => c.isPrimaryKey);
          const fkColumns = table.columns.filter(c => c.isForeignKey);
          
          return (
            <div key={table.id} className="border border-gray-200 rounded-lg overflow-hidden">
              <div
                className="bg-gradient-to-r from-indigo-50 to-blue-50 p-4 cursor-pointer hover:from-indigo-100 hover:to-blue-100 transition"
                onClick={() => toggleTable(table.name)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <TableIcon className="w-5 h-5 text-indigo-600" />
                    <h3 className="font-bold text-lg text-indigo-900">{table.name}</h3>
                    {table.isJunctionTable && (
                      <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full font-semibold">
                        Junction Table
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-600">{table.columns.length} columns</span>
                    {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
                  </div>
                </div>
              </div>

              {isExpanded && (
                <div className="p-4 bg-white">
                  {pkColumns.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                        <Key className="w-4 h-4 mr-1 text-green-600" />
                        Primary Key{pkColumns.length > 1 ? 's' : ''}
                        {pkColumns.length > 1 && (
                          <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">Composite</span>
                        )}
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {pkColumns.map((col) => (
                          <div key={col.name} className="px-3 py-1 bg-green-100 text-green-800 rounded-md text-sm font-medium">
                            {col.name}: {col.type}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {fkColumns.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                        <LinkIcon className="w-4 h-4 mr-1 text-blue-600" />
                        Foreign Key{fkColumns.length > 1 ? 's' : ''}
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {fkColumns.map((col) => (
                          <div key={col.name} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-md text-sm font-medium">
                            {col.name}: {col.type}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">All Columns</h4>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Column Name</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Constraints</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {table.columns.map((col, idx) => (
                            <tr key={idx} className="hover:bg-gray-50">
                              <td className="px-4 py-2 text-sm font-medium text-gray-900">{col.name}</td>
                              <td className="px-4 py-2 text-sm text-gray-600">{col.type}</td>
                              <td className="px-4 py-2 text-sm">
                                <div className="flex flex-wrap gap-1">
                                  {col.isPrimaryKey && <span className="px-2 py-0.5 text-xs bg-green-100 text-green-800 rounded">PK</span>}
                                  {col.isForeignKey && <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded">FK</span>}
                                  {col.isNotNull && !col.isPrimaryKey && <span className="px-2 py-0.5 text-xs bg-yellow-100 text-yellow-800 rounded">NOT NULL</span>}
                                  {col.isUnique && <span className="px-2 py-0.5 text-xs bg-purple-100 text-purple-800 rounded">UNIQUE</span>}
                                  {col.defaultValue && <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-800 rounded">DEFAULT</span>}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {table.foreignKeys.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Relationships</h4>
                      <ul className="space-y-1 text-sm text-gray-600">
                        {table.foreignKeys.map((fk, idx) => (
                          <li key={idx} className="flex items-center">
                            <LinkIcon className="w-3 h-3 mr-2 text-blue-500" />
                            <span>{fk.columns.join(', ')} → {fk.referencedTable}({fk.referencedColumns.join(', ')})</span>
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