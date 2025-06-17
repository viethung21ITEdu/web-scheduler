import React, { useState, useRef, useEffect } from 'react';

const ChooseMonthAndYear = ({ onMonthYearChange, initialMonth, initialYear }) => {
  const today = new Date();
  const [selectedMonth, setSelectedMonth] = useState(initialMonth || 6); // Default to tháng 6
  const [selectedYear, setSelectedYear] = useState(initialYear || 2025); // Default to năm 2025
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Cập nhật giá trị khi initialMonth hoặc initialYear thay đổi
  useEffect(() => {
    if (initialMonth && initialYear) {
      setSelectedMonth(initialMonth);
      setSelectedYear(initialYear);
    }
  }, [initialMonth, initialYear]);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Tạo danh sách dropdown các tháng từ 6/2025 đến 6/2026
  const generateMonthOptions = () => {
    const months = [];
    
    // Từ tháng 6/2025 đến tháng 12/2025
    for (let month = 6; month <= 12; month++) {
      months.push({ 
        value: month, 
        year: 2025,
        label: `Tháng ${month} - 2025` 
      });
    }
    
    // Từ tháng 1/2026 đến tháng 6/2026
    for (let month = 1; month <= 6; month++) {
      months.push({ 
        value: month, 
        year: 2026,
        label: `Tháng ${month} - 2026` 
      });
    }
    
    return months;
  };

  // Xử lý khi chọn tháng từ dropdown
  const handleMonthSelect = (month, year) => {
    setSelectedMonth(month);
    setSelectedYear(year);
    setShowDropdown(false);
    
    if (onMonthYearChange) {
      onMonthYearChange(month, year);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div 
        className="border border-blue-300 rounded-lg p-2.5 cursor-pointer flex items-center justify-between bg-white hover:bg-blue-50 hover:border-blue-400 hover:shadow-md transform hover:scale-105 transition-all duration-200 font-medium"
        onClick={() => setShowDropdown(!showDropdown)}
      >
        <span className="text-gray-800">Tháng {selectedMonth} - {selectedYear}</span>
        <svg className={`w-5 h-5 text-blue-600 transform transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </div>
      
      {showDropdown && (
        <div className="absolute left-0 right-0 mt-2 border border-blue-200 rounded-lg bg-white z-20 shadow-xl max-h-48 overflow-y-auto">
          {generateMonthOptions().map(month => (
            <div 
              key={`${month.year}-${month.value}`} 
              className={`p-2.5 cursor-pointer font-medium transition-all duration-150 first:rounded-t-lg last:rounded-b-lg ${
                selectedMonth === month.value && selectedYear === month.year 
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white' 
                  : 'hover:bg-blue-50 hover:text-blue-700 text-gray-700'
              }`}
              onClick={() => handleMonthSelect(month.value, month.year)}
            >
              {month.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ChooseMonthAndYear;