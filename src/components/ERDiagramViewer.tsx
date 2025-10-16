'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { ZoomIn, ZoomOut, Maximize2, Download, Copy, CheckCircle } from 'lucide-react';

interface Column {
  name: string;
  type: string;
  isPrimaryKey?: boolean;
  isForeignKey?: boolean;
  isUnique?: boolean;
  isNullable?: boolean;
}

interface ForeignKey {
  columnName: string;
  referencedTable: string;
  referencedColumn: string;
}

interface Table {
  name: string;
  columns: Column[];
  foreignKeys: ForeignKey[];
  isJunctionTable?: boolean;
}

interface ERDiagramViewerProps {
  tables: Table[];
}

export default function ERDiagramViewer({ tables }: ERDiagramViewerProps) {
  const [copied, setCopied] = useState(false);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [renderError, setRenderError] = useState<string | null>(null);
  const mermaidRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Generate Mermaid ER Diagram
  const mermaidCode = useMemo(() => {
    let code = 'erDiagram\n';
    
    // Add tables and their columns
    tables.forEach(table => {
      const pkColumns = table.columns.filter(c => c.isPrimaryKey);
      const fkColumns = table.columns.filter(c => c.isForeignKey);
      const regularColumns = table.columns.filter(c => !c.isPrimaryKey && !c.isForeignKey);
      
      code += `    ${table.name} {\n`;
      
      // Add columns
      [...pkColumns, ...fkColumns, ...regularColumns].forEach(col => {
        let type = col.type.replace(/\(.*?\)/g, '').replace(/[^\w]/g, '_');
        if (type.length > 15) type = type.substring(0, 15);
        
        let constraint = '';
        if (col.isPrimaryKey) constraint = ' PK';
        else if (col.isForeignKey) constraint = ' FK';
        else if (col.isUnique) constraint = ' UK';
        
        code += `        ${type} ${col.name}${constraint}\n`;
      });
      
      code += `    }\n`;
    });
    
    // Add relationships - use proper one-to-many notation
    const addedRelationships = new Set<string>();
    tables.forEach(table => {
      table.foreignKeys.forEach(fk => {
        const relKey = `${table.name}-${fk.referencedTable}`;
        const reverseKey = `${fk.referencedTable}-${table.name}`;
        
        if (!addedRelationships.has(relKey) && !addedRelationships.has(reverseKey)) {
          addedRelationships.add(relKey);
          // Referenced table (one) ||--o{ Current table (many)
          code += `    ${fk.referencedTable} ||--o{ ${table.name} : "has"\n`;
        }
      });
    });
    
    return code;
  }, [tables]);

  // Render mermaid diagram using modern API
  useEffect(() => {
    const renderDiagram = async () => {
      if (mermaidRef.current && mermaidCode) {
        try {
          setRenderError(null);
          
          // Dynamic import of mermaid
          const mermaid = (await import('mermaid')).default;
          
          // Initialize mermaid
          mermaid.initialize({
            startOnLoad: false,
            theme: 'default',
            securityLevel: 'loose',
            fontFamily: 'ui-sans-serif, system-ui, sans-serif',
            er: {
              useMaxWidth: false,
            }
          });

          // Clear previous content
          mermaidRef.current.innerHTML = '';
          
          // Generate unique ID
          const id = `mermaid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          
          // Render diagram using modern API
          const { svg } = await mermaid.render(id, mermaidCode);
          
          // Insert SVG
          mermaidRef.current.innerHTML = svg;

          // Center the diagram initially
          setTimeout(() => {
            if (mermaidRef.current && containerRef.current) {
              const svgElement = mermaidRef.current.querySelector('svg');
              if (svgElement) {
                const containerRect = containerRef.current.getBoundingClientRect();
                const svgRect = svgElement.getBoundingClientRect();
                setPosition({
                  x: Math.max(50, (containerRect.width - svgRect.width) / 2),
                  y: 50
                });
              }
            }
          }, 100);
        } catch (error) {
          console.error('Mermaid rendering error:', error);
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          setRenderError(errorMessage);
          
          if (mermaidRef.current) {
            mermaidRef.current.innerHTML = `
              <div class="p-6 bg-red-50 border-2 border-red-200 rounded-lg text-red-800 max-w-2xl">
                <p class="font-semibold mb-2 text-lg">❌ Failed to render diagram</p>
                <p class="text-sm mb-3">Error: ${errorMessage}</p>
                <p class="text-sm">Try copying the Mermaid code and testing it on <a href="https://mermaid.live" target="_blank" rel="noopener noreferrer" class="underline font-medium hover:text-red-900">mermaid.live</a></p>
              </div>
            `;
          }
        }
      }
    };

    renderDiagram();
  }, [mermaidCode]);

  // Zoom handlers
  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.2, 3));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.2, 0.3));
  };

  const handleResetZoom = () => {
    setScale(1);
    if (mermaidRef.current && containerRef.current) {
      const svgElement = mermaidRef.current.querySelector('svg');
      if (svgElement) {
        const containerRect = containerRef.current.getBoundingClientRect();
        const svgRect = svgElement.getBoundingClientRect();
        setPosition({
          x: Math.max(50, (containerRect.width - svgRect.width) / 2),
          y: 50
        });
      }
    }
  };

  // Pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setScale(prev => Math.max(0.3, Math.min(3, prev + delta)));
  };

  // Copy code
  const copyMermaidCode = async () => {
    try {
      await navigator.clipboard.writeText(mermaidCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Download as SVG
  const downloadSVG = () => {
    const svgElement = mermaidRef.current?.querySelector('svg');
    if (svgElement) {
      const svgData = new XMLSerializer().serializeToString(svgElement);
      const blob = new Blob([svgData], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'er-diagram.svg';
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Toolbar */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 p-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-white flex items-center">
            <Maximize2 className="w-6 h-6 mr-2" />
            Entity-Relationship Diagram
          </h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleZoomOut}
              className="p-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition"
              title="Zoom Out"
            >
              <ZoomOut className="w-5 h-5" />
            </button>
            <span className="px-3 py-2 bg-white/20 text-white rounded-lg font-mono text-sm min-w-[80px] text-center">
              {Math.round(scale * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              className="p-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition"
              title="Zoom In"
            >
              <ZoomIn className="w-5 h-5" />
            </button>
            <button
              onClick={handleResetZoom}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition text-sm font-medium"
              title="Reset View"
            >
              Reset
            </button>
            <div className="w-px h-8 bg-white/20"></div>
            <button
              onClick={copyMermaidCode}
              className="p-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition"
              title="Copy Mermaid Code"
            >
              {copied ? <CheckCircle className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
            </button>
            <button
              onClick={downloadSVG}
              className="p-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition"
              title="Download SVG"
            >
              <Download className="w-5 h-5" />
            </button>
          </div>
        </div>
        <p className="text-white/80 text-sm mt-2">
          🖱️ Drag to pan • 🔍 Scroll to zoom • {tables.length} tables • {tables.reduce((acc, t) => acc + t.foreignKeys.length, 0)} relationships
        </p>
      </div>

      {/* Diagram Canvas */}
      <div
        ref={containerRef}
        className="relative bg-gray-50 overflow-hidden"
        style={{ 
          height: '600px',
          cursor: isDragging ? 'grabbing' : 'grab'
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        <div
          ref={mermaidRef}
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transformOrigin: '0 0',
            transition: isDragging ? 'none' : 'transform 0.1s ease-out',
            display: 'inline-block'
          }}
        >
          <div className="flex items-center justify-center h-full text-gray-400">
            Loading diagram...
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-gray-100 p-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex space-x-6">
            <span>💡 <strong>Tip:</strong> Scroll mouse wheel to zoom in/out</span>
            <span>✋ <strong>Pan:</strong> Click and drag to move around</span>
          </div>
          <div className="text-gray-500">
            Generated with Mermaid.js
          </div>
        </div>
      </div>

      {/* Mermaid Code (collapsible) */}
      <details className="border-t border-gray-200">
        <summary className="cursor-pointer p-4 bg-gray-50 hover:bg-gray-100 transition text-sm font-medium text-gray-700 select-none">
          📋 View Mermaid Source Code
        </summary>
        <div className="p-4 bg-gray-900 text-green-400 font-mono text-xs overflow-auto max-h-96">
          <pre className="whitespace-pre-wrap">{mermaidCode}</pre>
        </div>
      </details>
    </div>
  );
}