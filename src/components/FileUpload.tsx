'use client';

import React, { useState, useRef } from 'react';
import { Upload, FileText, X, Sparkles } from 'lucide-react';

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
    <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 p-8 mb-8 transition-all duration-300 hover:shadow-2xl hover:border-violet-200">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold flex items-center text-gray-800">
          <div className="p-2.5 bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 rounded-xl mr-3 shadow-lg">
            <Upload className="w-6 h-6 text-white" />
          </div>
          Upload Draw.io File
        </h2>
        <Sparkles className="w-5 h-5 text-violet-400 animate-pulse" />
      </div>
      
      <div
        className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${
          isDragging
            ? 'border-violet-500 bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 scale-[1.02] shadow-lg'
            : 'border-gray-300 hover:border-violet-400 hover:bg-gradient-to-br hover:from-gray-50 hover:to-violet-50/30'
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
          <div className="space-y-5">
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-400 to-fuchsia-400 rounded-3xl blur-xl opacity-30 animate-pulse"></div>
                <div className="relative p-8 bg-gradient-to-br from-violet-100 via-purple-100 to-fuchsia-100 rounded-3xl">
                  <FileText className="w-20 h-20 text-violet-600" />
                </div>
              </div>
            </div>
            <button
              onClick={handleButtonClick}
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 text-white rounded-xl hover:from-violet-700 hover:via-purple-700 hover:to-fuchsia-700 transition-all duration-300 font-bold shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
            >
              <Upload className="w-5 h-5 mr-2" />
              Choose File
            </button>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600">or drag and drop your file here</p>
              <p className="text-xs text-gray-400 flex items-center justify-center gap-2">
                <span className="px-3 py-1 bg-violet-100 text-violet-700 rounded-full font-semibold">.drawio</span>
                <span className="px-3 py-1 bg-fuchsia-100 text-fuchsia-700 rounded-full font-semibold">.xml</span>
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-4 bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 rounded-xl p-5 border-2 border-emerald-300 shadow-md">
            <div className="p-2.5 bg-emerald-100 rounded-xl shadow-sm">
              <FileText className="w-7 h-7 text-emerald-600" />
            </div>
            <span className="text-gray-800 font-bold text-lg flex-1 text-left">{fileName}</span>
            <button
              onClick={handleClearFile}
              className="p-2 hover:bg-red-100 rounded-xl transition-all duration-200 group"
              title="Remove file"
            >
              <X className="w-6 h-6 text-gray-500 group-hover:text-red-600 transition-colors" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}