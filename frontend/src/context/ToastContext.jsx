import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertTriangle, AlertCircle, Info } from 'lucide-react';

const ToastContext = createContext(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((msgOrObj, typeParam = 'info', durationParam = 4000) => {
    const id = Math.random().toString(36).substring(2, 9);
    let title = '';
    let message = '';
    let type = typeParam;
    let duration = durationParam;

    if (typeof msgOrObj === 'object' && msgOrObj !== null) {
      title = msgOrObj.title || '';
      message = msgOrObj.message || msgOrObj.text || title || '';
      type = msgOrObj.type || typeParam;
      duration = msgOrObj.duration || durationParam;
    } else {
      message = String(msgOrObj || '');
    }

    setToasts((prevToasts) => [...prevToasts, { id, title, message, type, duration }]);
    
    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []);

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="toast-icon text-success" size={20} />;
      case 'warning':
        return <AlertTriangle className="toast-icon text-warning" size={20} />;
      case 'danger':
      case 'error':
        return <AlertCircle className="toast-icon text-danger" size={20} />;
      case 'info':
      default:
        return <Info className="toast-icon text-primary" size={20} />;
    }
  };

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast-item toast-${toast.type || 'info'}`}>
            <div className="toast-content-wrapper">
              {getIcon(toast.type)}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', textAlign: 'left' }}>
                {toast.title && <strong style={{ fontSize: '13px', lineHeight: '1.2' }}>{toast.title}</strong>}
                <span className="toast-message" style={{ fontSize: '12px' }}>{toast.message}</span>
              </div>
            </div>
            <button className="toast-close-btn" onClick={() => removeToast(toast.id)}>
              <X size={16} />
            </button>
            <div 
              className="toast-progress-bar" 
              style={{ animationDuration: `${toast.duration}ms` }}
            />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
