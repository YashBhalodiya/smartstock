import React from 'react';
import { Search, X } from 'lucide-react';

const SearchBar = ({
  value,
  onChange,
  onClear,
  placeholder = 'Search...',
  className = '',
  ...props
}) => {
  return (
    <div className={`search-bar-container ${className}`}>
      <Search className="search-bar-icon" size={18} />
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="search-bar-input"
        {...props}
      />
      {value && onClear && (
        <button type="button" onClick={onClear} className="search-bar-clear">
          <X size={16} />
        </button>
      )}
    </div>
  );
};

export default SearchBar;
