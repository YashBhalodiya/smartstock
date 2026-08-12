import React from 'react';

export const Table = ({ children, className = '', ...props }) => {
  return (
    <div className="table-responsive">
      <table className={`table-base ${className}`} {...props}>
        {children}
      </table>
    </div>
  );
};

export const Thead = ({ children, className = '', ...props }) => {
  return (
    <thead className={`table-thead ${className}`} {...props}>
      {children}
    </thead>
  );
};

export const Tbody = ({ children, className = '', ...props }) => {
  return (
    <tbody className={`table-tbody ${className}`} {...props}>
      {children}
    </tbody>
  );
};

export const Tr = ({ children, className = '', onClick, ...props }) => {
  return (
    <tr 
      className={`table-row ${onClick ? 'table-row-clickable' : ''} ${className}`} 
      onClick={onClick}
      {...props}
    >
      {children}
    </tr>
  );
};

export const Th = ({ children, className = '', align = 'left', ...props }) => {
  return (
    <th 
      className={`table-th text-${align} ${className}`} 
      {...props}
    >
      {children}
    </th>
  );
};

export const Td = ({ children, className = '', align = 'left', ...props }) => {
  return (
    <td 
      className={`table-td text-${align} ${className}`} 
      {...props}
    >
      {children}
    </td>
  );
};
