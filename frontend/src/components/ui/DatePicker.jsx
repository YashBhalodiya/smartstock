import React from 'react';
import { Calendar } from 'lucide-react';

const DatePicker = ({
  label,
  error,
  helperText,
  containerClass = '',
  className = '',
  id,
  ...props
}) => {
  const dateId = id || `date-${Math.random().toString(36).substring(2, 9)}`;

  return (
    <div className={`form-group ${containerClass} ${error ? 'has-error' : ''}`}>
      {label && <label htmlFor={dateId} className="form-label">{label}</label>}
      <div className="input-wrapper">
        <span className="input-icon-left"><Calendar size={18} /></span>
        <input
          type="date"
          id={dateId}
          className={`form-input has-icon date-picker-input ${className}`}
          {...props}
        />
      </div>
      {error && <span className="form-error-msg">{error}</span>}
      {!error && helperText && <span className="form-helper-text">{helperText}</span>}
    </div>
  );
};

export default DatePicker;
