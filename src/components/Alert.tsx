import React from 'react';
import { AlertCircle, CheckCircle, X, AlertTriangle, Info } from 'lucide-react';

interface AlertProps {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  onClose?: () => void;
}

export default function Alert({ type, message, onClose }: AlertProps) {
  const styles = {
    success: {
      container: 'bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-300 text-emerald-900',
      icon: <CheckCircle className="w-5 h-5 text-emerald-600" />,
      closeHover: 'hover:text-emerald-700'
    },
    error: {
      container: 'bg-gradient-to-r from-rose-50 to-pink-50 border-rose-300 text-rose-900',
      icon: <AlertCircle className="w-5 h-5 text-rose-600" />,
      closeHover: 'hover:text-rose-700'
    },
    warning: {
      container: 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-300 text-amber-900',
      icon: <AlertTriangle className="w-5 h-5 text-amber-600" />,
      closeHover: 'hover:text-amber-700'
    },
    info: {
      container: 'bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-300 text-blue-900',
      icon: <Info className="w-5 h-5 text-blue-600" />,
      closeHover: 'hover:text-blue-700'
    }
  };

  const currentStyle = styles[type];

  return (
    <div className={`mb-6 p-4 border-2 rounded-xl flex items-start justify-between shadow-md backdrop-blur-sm ${currentStyle.container} transition-all duration-300 hover:shadow-lg`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {currentStyle.icon}
        </div>
        <div>
          <p className="text-sm font-semibold leading-relaxed">{message}</p>
        </div>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className={`flex-shrink-0 ml-4 transition-colors duration-200 ${currentStyle.closeHover}`}
          aria-label="Close alert"
        >
          <X className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}