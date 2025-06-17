import React, { useState } from 'react';
import { HiSearch } from 'react-icons/hi';

/**
 * Reusable search bar component
 * @param {Object} props - Component props
 * @param {string} props.placeholder - Placeholder text for search input
 * @param {function} props.onSearch - Function called when user submits search
 * @param {string} props.initialValue - Initial search value
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.autoFocus - Whether to focus the input on mount
 */
const SearchBar = ({
  placeholder = 'Thanh tìm kiếm',
  onSearch,
  initialValue = '',
  className = '',
  autoFocus = false,
}) => {
  const [searchValue, setSearchValue] = useState(initialValue);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchValue);
    }
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setSearchValue(value);
    
    // If you want to search as you type (optional)
    // if (onSearch) {
    //   onSearch(value);
    // }
  };

  return (
    <form onSubmit={handleSubmit} className={`w-full ${className}`}>
      <div className="relative">
        <input
          type="text"
          value={searchValue}
          onChange={handleChange}
          placeholder={placeholder}
          className="w-full py-2 px-4 pr-10 bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-colors"
          autoFocus={autoFocus}
        />
        <button 
          type="submit"
          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
          aria-label="Search"
        >
          <HiSearch className="w-5 h-5" />
        </button>
      </div>
    </form>  );
};

export default SearchBar;