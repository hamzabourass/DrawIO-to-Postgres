'use client';

import React, { useState } from 'react';
import { Database, Sparkles, Zap } from 'lucide-react';
import FileUpload from '../components/FileUpload';
import TablePreview from '../components/TablePreview';
import SQLOutput from '../components/SQLOutput';
import Alert from '../components/Alert';
import Documentation from '../components/Documentation';
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
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50 to-purple-50 p-8">
      {/* Background decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-violet-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-fuchsia-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/2 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 rounded-3xl blur-2xl opacity-40 animate-pulse"></div>
              <div className="relative p-5 bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 rounded-3xl shadow-2xl transform hover:scale-110 transition-transform duration-300">
                <Database className="w-16 h-16 text-white" />
              </div>
            </div>
          </div>
          
          <h1 className="text-6xl font-black mb-4 bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent">
            Draw.io to PostgreSQL
          </h1>
          
          <p className="text-gray-600 text-xl max-w-2xl mx-auto font-medium mb-6">
            Convert your draw.io database diagrams into production-ready PostgreSQL 15.5 DDL scripts
          </p>

          <div className="flex items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-md border-2 border-violet-200">
              <Zap className="w-4 h-4 text-violet-600" />
              <span className="font-bold text-gray-700">Fast</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-md border-2 border-purple-200">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span className="font-bold text-gray-700">Accurate</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-md border-2 border-fuchsia-200">
              <Database className="w-4 h-4 text-fuchsia-600" />
              <span className="font-bold text-gray-700">Professional</span>
            </div>
          </div>
        </div>

        {/* Alerts */}
        {success && (
          <Alert type="success" message={success} onClose={() => setSuccess('')} />
        )}
        {error && (
          <Alert type="error" message={error} onClose={() => setError('')} />
        )}

        {/* Documentation Section */}
        <Documentation />

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

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500 font-medium">
            Built with ❤️ for database designers
          </p>
        </div>
      </div>
    </main>
  );
}