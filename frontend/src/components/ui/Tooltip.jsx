import React from 'react';

const Tooltip = ({
  content,
  children,
  position = 'top',
  className = '',
  ...props
}) => {
  if (!content) return <>{children}</>;

  return (
    <div 
      className={`tooltip-container position-${position} ${className}`} 
      {...props}
    >
      {children}
      <span className="tooltip-bubble">{content}</span>
    </div>
  );
};

export default Tooltip;
