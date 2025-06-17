import React, { useState, useEffect, useRef } from 'react';
import { HiSearch, HiX, HiOfficeBuilding } from 'react-icons/hi';
import { searchEnterprises } from '../../services/adminService';

const EnterpriseSearch = ({ onEnterpriseSelect, selectedEnterprise, placeholder = "Tìm kiếm doanh nghiệp..." }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [error, setError] = useState('');
  
  const searchRef = useRef(null);
  const dropdownRef = useRef(null);

  // Handle search
  const handleSearch = async (searchQuery) => {
    if (!searchQuery || searchQuery.trim().length < 1) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await searchEnterprises(searchQuery);
      if (response.success) {
        setResults(response.data);
        setShowDropdown(true);
      } else {
        throw new Error(response.message || 'Lỗi khi tìm kiếm');
      }
    } catch (error) {
      console.error('❌ Error searching enterprises:', error);
      setError(error.message);
      setResults([]);
      setShowDropdown(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Debounce search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleSearch(query);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  // Handle enterprise selection
  const handleEnterpriseSelect = (enterprise) => {
    onEnterpriseSelect(enterprise);
    setQuery(enterprise.name);
    setShowDropdown(false);
    setResults([]);
  };

  // Handle clear selection
  const handleClear = () => {
    setQuery('');
    setResults([]);
    setShowDropdown(false);
    onEnterpriseSelect(null);
  };

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchRef.current && 
        !searchRef.current.contains(event.target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update query when selectedEnterprise changes externally
  useEffect(() => {
    if (selectedEnterprise) {
      setQuery(selectedEnterprise.name);
    } else {
      setQuery('');
    }
  }, [selectedEnterprise]);

  const getEnterpriseTypeLabel = (type) => {
    const typeMap = {
      'cafe': 'Cafe',
      'restaurant': 'Nhà hàng',
      'library': 'Thư viện',
      'cinema': 'Rạp phim',
      'other': 'Khác'
    };
    return typeMap[type] || type;
  };

  return (
    <div className="relative" ref={searchRef}>
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <HiSearch className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
        />
        {(query || selectedEnterprise) && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <button
              onClick={handleClear}
              className="text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              <HiX className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>

      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute right-12 top-2">
          <div className="animate-spin rounded-full h-5 w-5 border-2 border-purple-500 border-t-transparent"></div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="absolute top-full left-0 right-0 mt-1 p-2 bg-red-100 border border-red-400 text-red-700 rounded-md text-sm z-10">
          {error}
        </div>
      )}

      {/* Dropdown Results */}
      {showDropdown && results.length > 0 && (
        <div 
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-20 max-h-60 overflow-y-auto"
        >
          {results.map((enterprise) => (
            <div
              key={enterprise.id}
              onClick={() => handleEnterpriseSelect(enterprise)}
              className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <HiOfficeBuilding className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {enterprise.name}
                      </p>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                        {getEnterpriseTypeLabel(enterprise.type)}
                      </span>
                    </div>
                    {enterprise.contact_person && (
                      <p className="text-sm text-gray-500 truncate">
                        Liên hệ: {enterprise.contact_person}
                      </p>
                    )}
                    {enterprise.address && (
                      <p className="text-sm text-gray-500 truncate">
                        {enterprise.address}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
                  <span className="text-xs text-gray-400">
                    {enterprise.post_count} bài đăng
                  </span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                    enterprise.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {enterprise.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No results */}
      {showDropdown && results.length === 0 && query && !isLoading && (
        <div 
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-20 p-4 text-center text-gray-500"
        >
          Không tìm thấy doanh nghiệp nào
        </div>
      )}
    </div>
  );
};

export default EnterpriseSearch; 