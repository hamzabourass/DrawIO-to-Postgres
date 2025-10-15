'use client';

import React, { useState, useRef } from 'react';
import { Upload, FileText, X } from 'lucide-react';

interface FileUploadProps {
  onFileLoad: (content: string) => void;
}

export default function FileUpload({ onFileLoad }: FileUploadProps) {
  const [fileName, setFileName] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    setFileName(file.name);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      onFileLoad(content);
    };
    reader.onerror = () => {
      console.error('Error reading file');
    };
    reader.readAsText(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith('.drawio') || file.name.endsWith('.xml'))) {
      processFile(file);
    }
  };

  const handleClearFile = () => {
    setFileName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4 flex items-center text-gray-800">
        <Upload className="w-5 h-5 mr-2 text-indigo-600" />
        Upload Draw.io File
      </h2>
      
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
          isDragging
            ? 'border-indigo-500 bg-indigo-50'
            : 'border-gray-300 hover:border-indigo-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".drawio,.xml"
          onChange={handleFileChange}
          className="hidden"
          id="file-upload"
        />
        
        {!fileName ? (
          <>
            <div className="flex justify-center mb-4">
              <FileText className="w-16 h-16 text-gray-400" />
            </div>
            <button
              onClick={handleButtonClick}
              className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-semibold shadow-md hover:shadow-lg"
            >
              <Upload className="w-5 h-5 mr-2" />
              Choose File
            </button>
            <p className="mt-4 text-sm text-gray-500">
              or drag and drop your file here
            </p>
            <p className="mt-2 text-xs text-gray-400">
              Supports .drawio and .xml files
            </p>
          </>
        ) : (
          <div className="flex items-center justify-center space-x-3">
            <FileText className="w-6 h-6 text-green-600" />
            <span className="text-gray-700 font-medium">{fileName}</span>
            <button
              onClick={handleClearFile}
              className="p-1 hover:bg-gray-100 rounded-full transition"
              title="Remove file"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}