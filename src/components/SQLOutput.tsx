'use client';

import React, { useState } from 'react';
import { Download, Database, Copy, Settings, Check, Code2, FileCode } from 'lucide-react';
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
    <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold flex items-center text-gray-800">
          <div className="p-2.5 bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 rounded-xl mr-3 shadow-lg">
            <FileCode className="w-6 h-6 text-white" />
          </div>
          Generated SQL Script
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowOptions(!showOptions)}
            className={`flex items-center px-5 py-3 rounded-xl transition-all duration-300 font-bold shadow-md hover:shadow-lg ${
              showOptions 
                ? 'bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Settings className="w-4 h-4 mr-2" />
            Options
          </button>
          <button
            onClick={handleCopy}
            className="flex items-center px-5 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-300 font-bold shadow-md hover:shadow-lg"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 mr-2 text-green-600" />
                <span className="text-green-600">Copied!</span>
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
            className="flex items-center px-5 py-3 bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 text-white rounded-xl hover:from-violet-700 hover:via-purple-700 hover:to-fuchsia-700 transition-all duration-300 font-bold shadow-lg hover:shadow-xl"
          >
            <Download className="w-4 h-4 mr-2" />
            Download
          </button>
        </div>
      </div>

      {showOptions && (
        <div className="mb-6 p-6 bg-gradient-to-br from-gray-50 to-violet-50 rounded-xl border-2 border-gray-200 shadow-inner">
          <h3 className="font-bold text-base text-gray-800 mb-4 flex items-center">
            <Code2 className="w-5 h-5 mr-2 text-violet-600" />
            SQL Generation Options
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Schema Name <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                type="text"
                value={options.schemaName || ''}
                onChange={(e) => handleOptionChange('schemaName', e.target.value)}
                placeholder="e.g., public"
                className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all font-medium"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">ON DELETE Action</label>
              <select
                value={options.onDeleteAction}
                onChange={(e) => handleOptionChange('onDeleteAction', e.target.value)}
                className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all font-medium"
              >
                <option value="CASCADE">CASCADE</option>
                <option value="SET NULL">SET NULL</option>
                <option value="RESTRICT">RESTRICT</option>
                <option value="NO ACTION">NO ACTION</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">ON UPDATE Action</label>
              <select
                value={options.onUpdateAction}
                onChange={(e) => handleOptionChange('onUpdateAction', e.target.value)}
                className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all font-medium"
              >
                <option value="CASCADE">CASCADE</option>
                <option value="SET NULL">SET NULL</option>
                <option value="RESTRICT">RESTRICT</option>
                <option value="NO ACTION">NO ACTION</option>
              </select>
            </div>
          </div>

          <div className="space-y-3">
            <label className="flex items-center p-3 hover:bg-white rounded-lg transition-colors cursor-pointer group">
              <input
                type="checkbox"
                checked={options.includeDropStatements}
                onChange={(e) => handleOptionChange('includeDropStatements', e.target.checked)}
                className="w-5 h-5 text-violet-600 border-2 border-gray-300 rounded focus:ring-violet-500 cursor-pointer"
              />
              <span className="ml-3 text-sm font-semibold text-gray-700 group-hover:text-gray-900">
                Include DROP TABLE statements
              </span>
            </label>

            <label className="flex items-center p-3 hover:bg-white rounded-lg transition-colors cursor-pointer group">
              <input
                type="checkbox"
                checked={options.includeForeignKeys}
                onChange={(e) => handleOptionChange('includeForeignKeys', e.target.checked)}
                className="w-5 h-5 text-violet-600 border-2 border-gray-300 rounded focus:ring-violet-500 cursor-pointer"
              />
              <span className="ml-3 text-sm font-semibold text-gray-700 group-hover:text-gray-900">
                Include foreign key constraints
              </span>
            </label>

            <label className="flex items-center p-3 hover:bg-white rounded-lg transition-colors cursor-pointer group">
              <input
                type="checkbox"
                checked={options.includeIndexes}
                onChange={(e) => handleOptionChange('includeIndexes', e.target.checked)}
                className="w-5 h-5 text-violet-600 border-2 border-gray-300 rounded focus:ring-violet-500 cursor-pointer"
              />
              <span className="ml-3 text-sm font-semibold text-gray-700 group-hover:text-gray-900">
                Include indexes on foreign keys
              </span>
            </label>

            <label className="flex items-center p-3 hover:bg-white rounded-lg transition-colors cursor-pointer group">
              <input
                type="checkbox"
                checked={options.useIfNotExists}
                onChange={(e) => handleOptionChange('useIfNotExists', e.target.checked)}
                className="w-5 h-5 text-violet-600 border-2 border-gray-300 rounded focus:ring-violet-500 cursor-pointer"
              />
              <span className="ml-3 text-sm font-semibold text-gray-700 group-hover:text-gray-900">
                Use IF NOT EXISTS
              </span>
            </label>

            <label className="flex items-center p-3 hover:bg-white rounded-lg transition-colors cursor-pointer group">
              <input
                type="checkbox"
                checked={options.includeComments}
                onChange={(e) => handleOptionChange('includeComments', e.target.checked)}
                className="w-5 h-5 text-violet-600 border-2 border-gray-300 rounded focus:ring-violet-500 cursor-pointer"
              />
              <span className="ml-3 text-sm font-semibold text-gray-700 group-hover:text-gray-900">
                Include table comments
              </span>
            </label>
          </div>
        </div>
      )}

      <div className="relative bg-gradient-to-br from-slate-900 via-gray-900 to-slate-900 text-emerald-400 p-6 rounded-xl overflow-auto max-h-96 font-mono text-sm shadow-2xl border-2 border-slate-700">
        <div className="absolute top-4 right-4 flex gap-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
        </div>
        <pre className="whitespace-pre-wrap pt-8">{sqlScript}</pre>
      </div>

      <div className="mt-6 flex justify-between items-center">
        <div className="flex gap-4">
          <div className="px-5 py-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border-2 border-blue-200 shadow-sm">
            <span className="text-gray-600 font-semibold text-sm">Lines: </span>
            <span className="font-bold text-blue-700 text-lg">{sqlScript.split('\n').length}</span>
          </div>
          <div className="px-5 py-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200 shadow-sm">
            <span className="text-gray-600 font-semibold text-sm">Size: </span>
            <span className="font-bold text-purple-700 text-lg">{(new Blob([sqlScript]).size / 1024).toFixed(2)} KB</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="font-medium">Ready to use</span>
        </div>
      </div>
    </div>
  );
}