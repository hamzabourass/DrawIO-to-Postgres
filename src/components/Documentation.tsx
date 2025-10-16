'use client';

import React, { useState } from 'react';
import { BookOpen, ChevronDown, ChevronUp, CheckCircle, AlertTriangle, Code, Database, FileText, Lightbulb } from 'lucide-react';

export default function Documentation() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 p-8 mb-8">
      <div 
        className="flex items-center justify-between cursor-pointer hover:bg-gray-50 -m-8 p-8 rounded-2xl transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
          <div className="p-2.5 bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-500 rounded-xl mr-3 shadow-lg">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          Draw.io Convention Guide
        </h2>
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-gray-600">Click to {isExpanded ? 'hide' : 'show'} documentation</span>
          <div className="p-2 bg-gradient-to-r from-orange-100 to-amber-100 rounded-lg">
            {isExpanded ? <ChevronUp className="w-5 h-5 text-orange-600" /> : <ChevronDown className="w-5 h-5 text-orange-600" />}
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-6 space-y-6">
          {/* Introduction */}
          <div className="p-5 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border-2 border-blue-200">
            <div className="flex items-start gap-3">
              <Lightbulb className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">Introduction</h3>
                <p className="text-gray-700 leading-relaxed">
                  This tool parses your draw.io database diagrams and generates PostgreSQL DDL scripts. 
                  To ensure accurate parsing, please follow these conventions when creating your diagrams.
                </p>
              </div>
            </div>
          </div>

          {/* Table Structure */}
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <Database className="w-6 h-6 mr-2 text-violet-600" />
              1. Table Structure
            </h3>
            
            <div className="space-y-4">
              {/* Using Swimlanes */}
              <div className="p-5 bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl border-2 border-violet-200">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-800 mb-2">Use Container/Swimlane Shapes</h4>
                    <p className="text-gray-700 mb-3">Tables must be represented using <strong>Container</strong> or <strong>Swimlane</strong> shapes in draw.io.</p>
                    <div className="bg-white p-4 rounded-lg border border-violet-300">
                      <p className="text-sm font-mono text-gray-700">
                        <strong>How to create:</strong><br/>
                        1. In draw.io, go to <span className="px-2 py-0.5 bg-violet-100 rounded">Arrange → Insert → Container</span><br/>
                        2. Or use <span className="px-2 py-0.5 bg-violet-100 rounded">Advanced → Pool (Swimlane)</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Table Names */}
              <div className="p-5 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border-2 border-emerald-200">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-800 mb-2">Table Naming</h4>
                    <p className="text-gray-700 mb-3">The table name should be the title/label of the container shape.</p>
                    <div className="bg-white p-4 rounded-lg border border-emerald-300 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-green-600 font-bold">✓</span>
                        <code className="text-sm font-mono bg-emerald-100 px-2 py-1 rounded">users</code>
                        <code className="text-sm font-mono bg-emerald-100 px-2 py-1 rounded">products</code>
                        <code className="text-sm font-mono bg-emerald-100 px-2 py-1 rounded">order_items</code>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-red-600 font-bold">✗</span>
                        <code className="text-sm font-mono bg-red-100 px-2 py-1 rounded">users table</code>
                        <code className="text-sm font-mono bg-red-100 px-2 py-1 rounded">Table-1</code>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Column Definitions */}
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <Code className="w-6 h-6 mr-2 text-fuchsia-600" />
              2. Column Definitions
            </h3>
            
            <div className="space-y-4">
              {/* Column Format */}
              <div className="p-5 bg-gradient-to-r from-fuchsia-50 to-pink-50 rounded-xl border-2 border-fuchsia-200">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-800 mb-3">Column Format</h4>
                    <p className="text-gray-700 mb-3">Each column must follow this format:</p>
                    <div className="bg-white p-4 rounded-lg border border-fuchsia-300 space-y-3">
                      <div>
                        <p className="text-sm font-bold text-gray-700 mb-2">Basic Format:</p>
                        <code className="block text-sm font-mono bg-gray-900 text-emerald-400 px-4 py-2 rounded">
                          column_name: data_type
                        </code>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-700 mb-2">Examples:</p>
                        <div className="space-y-1">
                          <code className="block text-sm font-mono bg-emerald-100 px-3 py-1.5 rounded text-gray-800">id: SERIAL</code>
                          <code className="block text-sm font-mono bg-emerald-100 px-3 py-1.5 rounded text-gray-800">email: VARCHAR(255)</code>
                          <code className="block text-sm font-mono bg-emerald-100 px-3 py-1.5 rounded text-gray-800">created_at: TIMESTAMP</code>
                          <code className="block text-sm font-mono bg-emerald-100 px-3 py-1.5 rounded text-gray-800">price: NUMERIC(10,2)</code>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Constraints */}
              <div className="p-5 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border-2 border-blue-200">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-800 mb-3">Marking Constraints</h4>
                    <div className="bg-white p-4 rounded-lg border border-blue-300 space-y-4">
                      <div>
                        <p className="text-sm font-bold text-green-700 mb-2 flex items-center gap-2">
                          <span className="px-2 py-1 bg-green-100 rounded text-xs">PK</span> Primary Key
                        </p>
                        <p className="text-sm text-gray-700 mb-2">Add <strong>[PK]</strong> to the column or make it underlined:</p>
                        <div className="space-y-1">
                          <code className="block text-sm font-mono bg-emerald-100 px-3 py-1.5 rounded text-gray-800">id: SERIAL [PK]</code>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm font-bold text-blue-700 mb-2 flex items-center gap-2">
                          <span className="px-2 py-1 bg-blue-100 rounded text-xs">FK</span> Foreign Key
                        </p>
                        <p className="text-sm text-gray-700 mb-2">Add <strong>[FK]</strong> to the column:</p>
                        <code className="block text-sm font-mono bg-blue-100 px-3 py-1.5 rounded text-gray-800">user_id: INTEGER [FK]</code>
                      </div>

                      <div>
                        <p className="text-sm font-bold text-purple-700 mb-2 flex items-center gap-2">
                          <span className="px-2 py-1 bg-purple-100 rounded text-xs">UNIQUE</span> Unique Constraint
                        </p>
                        <p className="text-sm text-gray-700 mb-2">Add <strong>[UNIQUE]</strong> or <strong>[UQ]</strong>:</p>
                        <code className="block text-sm font-mono bg-purple-100 px-3 py-1.5 rounded text-gray-800">email: VARCHAR(255) [UNIQUE]</code>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Supported Data Types */}
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <FileText className="w-6 h-6 mr-2 text-teal-600" />
              3. Supported PostgreSQL Data Types
            </h3>

            <div className="p-5 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl border-2 border-teal-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg border border-teal-300">
                  <h5 className="font-bold text-gray-800 mb-2 text-sm">Numeric</h5>
                  <ul className="space-y-1 text-sm font-mono text-gray-700">
                    <li>INTEGER, INT</li>
                    <li>BIGINT</li>
                    <li>SMALLINT</li>
                    <li>SERIAL</li>
                    <li>NUMERIC(p,s)</li>
                    <li>DECIMAL(p,s)</li>
                    <li>REAL, FLOAT</li>
                  </ul>
                </div>

                <div className="bg-white p-4 rounded-lg border border-teal-300">
                  <h5 className="font-bold text-gray-800 mb-2 text-sm">String</h5>
                  <ul className="space-y-1 text-sm font-mono text-gray-700">
                    <li>VARCHAR(n)</li>
                    <li>CHAR(n)</li>
                    <li>TEXT</li>
                  </ul>
                </div>

                <div className="bg-white p-4 rounded-lg border border-teal-300">
                  <h5 className="font-bold text-gray-800 mb-2 text-sm">Date/Time</h5>
                  <ul className="space-y-1 text-sm font-mono text-gray-700">
                    <li>DATE</li>
                    <li>TIME</li>
                    <li>TIMESTAMP</li>
                    <li>TIMESTAMPTZ</li>
                  </ul>
                </div>

                <div className="bg-white p-4 rounded-lg border border-teal-300">
                  <h5 className="font-bold text-gray-800 mb-2 text-sm">Boolean</h5>
                  <ul className="space-y-1 text-sm font-mono text-gray-700">
                    <li>BOOLEAN</li>
                    <li>BOOL</li>
                  </ul>
                </div>

                <div className="bg-white p-4 rounded-lg border border-teal-300">
                  <h5 className="font-bold text-gray-800 mb-2 text-sm">Other</h5>
                  <ul className="space-y-1 text-sm font-mono text-gray-700">
                    <li>UUID</li>
                    <li>JSON</li>
                    <li>JSONB</li>
                    <li>BYTEA</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Best Practices */}
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <AlertTriangle className="w-6 h-6 mr-2 text-amber-600" />
              4. Best Practices & Tips
            </h3>

            <div className="space-y-3">
              <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border-2 border-green-200">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-700"><strong>Use consistent naming:</strong> Use snake_case for table and column names (e.g., user_profiles, created_at)</p>
                </div>
              </div>

              <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border-2 border-green-200">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-700"><strong>Keep it simple:</strong> One column per line inside the table container</p>
                </div>
              </div>

              <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border-2 border-amber-200">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-700"><strong>Avoid special characters:</strong> Don't use special characters in table or column names except underscores</p>
                </div>
              </div>

              <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border-2 border-amber-200">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-700"><strong>Check your format:</strong> Always use "column_name: DATA_TYPE" format with a colon</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}