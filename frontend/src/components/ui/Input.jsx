import React from 'react';

const Input = React.forwardRef(({
  label,
  error,
  helperText,
  icon: Icon = null,
  containerClass = '',
  className = '',
  id,
  type = 'text',
  ...props
}, ref) => {
  const inputId = id || `input-${Math.random().toString(36).substring(2, 9)}`;

  return (
    <div className={`form-group ${containerClass} ${error ? 'has-error' : ''}`}>
      {label && <label htmlFor={inputId} className="form-label">{label}</label>}
      <div className="input-wrapper">
        {Icon && <span className="input-icon-left">{Icon}</span>}
        <input
          ref={ref}
          type={type}
          id={inputId}
          className={`form-input ${Icon ? 'has-icon' : ''} ${className}`}
          {...props}
        />
      </div>
      {error && <span className="form-error-msg">{error}</span>}
      {!error && helperText && <span className="form-helper-text">{helperText}</span>}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
