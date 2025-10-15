import React from 'react';
import { AlertCircle, CheckCircle, X } from 'lucide-react';

interface AlertProps {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  onClose?: () => void;
}

export default function Alert({ type, message, onClose }: AlertProps) {
  const styles = {
    success: {
      container: 'bg-green-50 border-green-200 text-green-800',
      icon: <CheckCircle className="w-5 h-5 text-green-600" />
    },
    error: {
      container: 'bg-red-50 border-red-200 text-red-800',
      icon: <AlertCircle className="w-5 h-5 text-red-600" />
    },
    warning: {
      container: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      icon: <AlertCircle className="w-5 h-5 text-yellow-600" />
    },
    info: {
      container: 'bg-blue-50 border-blue-200 text-blue-800',
      icon: <AlertCircle className="w-5 h-5 text-blue-600" />
    }
  };

  const currentStyle = styles[type];

  return (
    <div className={`mb-6 p-4 border rounded-lg flex items-start justify-between ${currentStyle.container}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {currentStyle.icon}
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium">{message}</p>
        </div>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="flex-shrink-0 ml-4 inline-flex text-gray-400 hover:text-gray-500 focus:outline-none"
        >
          <X className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}