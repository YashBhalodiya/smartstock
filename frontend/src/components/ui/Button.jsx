import React from 'react';
import { Loader2 } from 'lucide-react';

const Button = ({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon: Icon = null,
  iconPosition = 'left',
  onClick,
  className = '',
  ...props
}) => {
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      className={`btn btn-${variant} btn-${size} ${loading ? 'btn-loading' : ''} ${className}`}
      disabled={isDisabled}
      onClick={onClick}
      {...props}
    >
      {loading && <Loader2 className="btn-spinner" size={16} />}
      {!loading && Icon && iconPosition === 'left' && <span className="btn-icon-left">{Icon}</span>}
      <span className="btn-text">{children}</span>
      {!loading && Icon && iconPosition === 'right' && <span className="btn-icon-right">{Icon}</span>}
    </button>
  );
};

export default Button;
