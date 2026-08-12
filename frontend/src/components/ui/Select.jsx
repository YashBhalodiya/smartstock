import React from 'react';

const Select = React.forwardRef(({
  label,
  options = [],
  error,
  helperText,
  containerClass = '',
  className = '',
  id,
  placeholder,
  ...props
}, ref) => {
  const selectId = id || `select-${Math.random().toString(36).substring(2, 9)}`;

  return (
    <div className={`form-group ${containerClass} ${error ? 'has-error' : ''}`}>
      {label && <label htmlFor={selectId} className="form-label">{label}</label>}
      <div className="select-wrapper">
        <select
          ref={ref}
          id={selectId}
          className={`form-select ${className}`}
          {...props}
        >
          {placeholder && <option value="" disabled>{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
      {error && <span className="form-error-msg">{error}</span>}
      {!error && helperText && <span className="form-helper-text">{helperText}</span>}
    </div>
  );
});

Select.displayName = 'Select';

export default Select;
