'use client';

import React, { useState } from 'react';
import { Database } from 'lucide-react';
import FileUpload from '../components/FileUpload';
import TablePreview from '../components/TablePreview';
import SQLOutput from '../components/SQLOutput';
import Alert from '../components/Alert';
import { parseDrawioXML } from '../utils/xmlParser';
import { generateSQL } from '../utils/sqlGenerator';
import { Table, SQLGenerationOptions } from '@/types/database';

export default function Home() {
  const [tables, setTables] = useState<Table[]>([]);
  const [sqlScript, setSqlScript] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const handleFileLoad = (content: string) => {
    try {
      const result = parseDrawioXML(content);
      
      if (!result.success) {
        setError(result.error || 'Failed to parse XML');
        setTables([]);
        setSqlScript('');
        return;
      }

      if (result.tables.length === 0) {
        setError('No tables found in the diagram');
        setTables([]);
        setSqlScript('');
        return;
      }

      setTables(result.tables);
      
      // Generate SQL with default options
      const options: SQLGenerationOptions = {
        includeDropStatements: false,
        includeIndexes: true,
        includeForeignKeys: true,
        useIfNotExists: true
      };
      
      const sql = generateSQL(result.tables, options);
      setSqlScript(sql);
      
      setSuccess(`Successfully parsed ${result.tables.length} table(s)!`);
      setError('');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setTables([]);
      setSqlScript('');
    }
  };

  const handleRegenerateSQL = (options: SQLGenerationOptions) => {
    if (tables.length > 0) {
      const sql = generateSQL(tables, options);
      setSqlScript(sql);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Database className="w-12 h-12 text-indigo-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-800">
              Draw.io to PostgreSQL
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            Convert your draw.io database diagrams into PostgreSQL 15.5 DDL scripts
          </p>
        </div>

        {/* Alerts */}
        {success && (
          <Alert type="success" message={success} onClose={() => setSuccess('')} />
        )}
        {error && (
          <Alert type="error" message={error} onClose={() => setError('')} />
        )}

        {/* File Upload */}
        <FileUpload onFileLoad={handleFileLoad} />

        {/* Table Preview */}
        {tables.length > 0 && (
          <TablePreview tables={tables} />
        )}

        {/* SQL Output */}
        {sqlScript && (
          <SQLOutput 
            sqlScript={sqlScript} 
            onRegenerateSQL={handleRegenerateSQL}
          />
        )}

        {/* Schema Visualizer & Tester */}
       
      </div>
    </main>
  );
}