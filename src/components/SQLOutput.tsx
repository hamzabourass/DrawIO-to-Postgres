'use client';

import React, { useState } from 'react';
import { Download, Database, Copy, Settings, Check } from 'lucide-react';
import { SQLGenerationOptions } from '@/types/database';

interface SQLOutputProps {
  sqlScript: string;
  onRegenerateSQL: (options: SQLGenerationOptions) => void;
}

export default function SQLOutput({ sqlScript, onRegenerateSQL }: SQLOutputProps) {
  const [copied, setCopied] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [options, setOptions] = useState<SQLGenerationOptions>({
    includeDropStatements: false,
    includeIndexes: true,
    includeForeignKeys: true,
    useIfNotExists: true,
    includeComments: false,
    onDeleteAction: 'CASCADE',
    onUpdateAction: 'CASCADE',
    schemaName: ''
  });

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(sqlScript);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([sqlScript], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'schema.sql';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleOptionChange = (key: keyof SQLGenerationOptions, value: any) => {
    const newOptions = { ...options, [key]: value };
    setOptions(newOptions);
    onRegenerateSQL(newOptions);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold flex items-center text-gray-800">
          <Database className="w-5 h-5 mr-2 text-indigo-600" />
          Generated SQL Script
        </h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowOptions(!showOptions)}
            className={`flex items-center px-4 py-2 rounded-lg transition ${
              showOptions ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Settings className="w-4 h-4 mr-2" />
            Options
          </button>
          <button
            onClick={handleCopy}
            className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 mr-2 text-green-600" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-2" />
                Copy
              </>
            )}
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            <Download className="w-4 h-4 mr-2" />
            Download
          </button>
        </div>
      </div>

      {showOptions && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="font-semibold text-sm text-gray-700 mb-3">SQL Generation Options</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Schema Name (optional)</label>
              <input
                type="text"
                value={options.schemaName || ''}
                onChange={(e) => handleOptionChange('schemaName', e.target.value)}
                placeholder="e.g., public"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ON DELETE Action</label>
              <select
                value={options.onDeleteAction}
                onChange={(e) => handleOptionChange('onDeleteAction', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="CASCADE">CASCADE</option>
                <option value="SET NULL">SET NULL</option>
                <option value="RESTRICT">RESTRICT</option>
                <option value="NO ACTION">NO ACTION</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ON UPDATE Action</label>
              <select
                value={options.onUpdateAction}
                onChange={(e) => handleOptionChange('onUpdateAction', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="CASCADE">CASCADE</option>
                <option value="SET NULL">SET NULL</option>
                <option value="RESTRICT">RESTRICT</option>
                <option value="NO ACTION">NO ACTION</option>
              </select>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={options.includeDropStatements}
                onChange={(e) => handleOptionChange('includeDropStatements', e.target.checked)}
                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <span className="ml-2 text-sm text-gray-700">Include DROP TABLE statements</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={options.includeForeignKeys}
                onChange={(e) => handleOptionChange('includeForeignKeys', e.target.checked)}
                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <span className="ml-2 text-sm text-gray-700">Include foreign key constraints</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={options.includeIndexes}
                onChange={(e) => handleOptionChange('includeIndexes', e.target.checked)}
                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <span className="ml-2 text-sm text-gray-700">Include indexes on foreign keys</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={options.useIfNotExists}
                onChange={(e) => handleOptionChange('useIfNotExists', e.target.checked)}
                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <span className="ml-2 text-sm text-gray-700">Use IF NOT EXISTS</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={options.includeComments}
                onChange={(e) => handleOptionChange('includeComments', e.target.checked)}
                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <span className="ml-2 text-sm text-gray-700">Include table comments</span>
            </label>
          </div>
        </div>
      )}

      <div className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-auto max-h-96 font-mono text-sm">
        <pre className="whitespace-pre-wrap">{sqlScript}</pre>
      </div>

      <div className="mt-4 flex justify-between items-center text-sm text-gray-600">
        <div>Lines: {sqlScript.split('\n').length}</div>
        <div>Size: {(new Blob([sqlScript]).size / 1024).toFixed(2)} KB</div>
      </div>
    </div>
  );
}