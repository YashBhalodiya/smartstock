import React from 'react';

const Badge = ({
  children,
  variant = 'neutral',
  dot = false,
  className = '',
  ...props
}) => {
  return (
    <span 
      className={`badge badge-${variant} ${dot ? 'badge-dot-mode' : ''} ${className}`}
      {...props}
    >
      {dot && <span className="badge-dot-indicator" />}
      {children}
    </span>
  );
};

export default Badge;
