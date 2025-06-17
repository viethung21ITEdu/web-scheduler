// filepath: e:\web-doan-third\web-doan-cnpm\src\components\groupWidgets\TimeManager\ChoosePeriod.jsx
import React, { useState, useEffect } from 'react';

const ChoosePeriod = ({ month, year, currentWeek = 0, onPeriodChange }) => {
  console.log('🎮 CHOOSE PERIOD - Component rendered với props:', { month, year, currentWeek, hasOnPeriodChange: !!onPeriodChange });
  
  // State cho khoảng ngày hiển thị
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null
  });
  
  // State cho tuần hiện tại
  const [weekOffset, setWeekOffset] = useState(currentWeek);

  // Sync weekOffset with currentWeek prop
  useEffect(() => {
    console.log('🎮 CHOOSE PERIOD - useEffect currentWeek:', currentWeek);
    setWeekOffset(currentWeek);
  }, [currentWeek]);
  
  // Reset weekOffset khi tháng hoặc năm thay đổi
  useEffect(() => {
    console.log('🎮 CHOOSE PERIOD - useEffect month/year change:', { month, year });
    setWeekOffset(0); // Reset về tuần đầu tiên khi tháng/năm thay đổi
  }, [month, year]);
  
  // Hàm định dạng ngày theo format dd/MM/yyyy
  const formatDate = (date) => {
    if (!date) return '';
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Hàm tính toán ngày bắt đầu và kết thúc dựa trên tuần hiện tại của tháng đã chọn
  const calculateDateRange = (month, year, weekOffset = 0) => {
    console.log('🎮 CHOOSE PERIOD - calculateDateRange:', { month, year, weekOffset });
    
    // Tạo ngày đầu tiên của tháng đã chọn
    const firstDayOfMonth = new Date(year, month - 1, 1);
    console.log('🎮 CHOOSE PERIOD - firstDayOfMonth:', firstDayOfMonth);
    
    // Tìm ngày thứ 2 đầu tiên trong tháng
    let startDay = new Date(firstDayOfMonth);
    
    // Nếu ngày 1 không phải thứ 2, tìm thứ 2 đầu tiên
    const firstDayWeekday = firstDayOfMonth.getDay(); // 0 = CN, 1 = Thứ 2, ...
    console.log('🎮 CHOOSE PERIOD - firstDayWeekday:', firstDayWeekday);
    
    if (firstDayWeekday !== 1) {
      // Tính số ngày cần cộng để đến thứ 2 tiếp theo
      const daysToAdd = firstDayWeekday === 0 ? 1 : (8 - firstDayWeekday);
      startDay.setDate(firstDayOfMonth.getDate() + daysToAdd);
    }
    
    console.log('🎮 CHOOSE PERIOD - Thứ 2 đầu tiên:', startDay);
    
    // Cộng thêm offset tuần nếu cần
    startDay.setDate(startDay.getDate() + (weekOffset * 7));
    
    // Tính ngày kết thúc (6 ngày sau ngày bắt đầu để có tổng 7 ngày)
    let endDay = new Date(startDay);
    endDay.setDate(endDay.getDate() + 6);
    
    // Kiểm tra xem tuần này có nằm trong tháng được chọn không
    const isValidWeek = startDay.getMonth() === month - 1 || endDay.getMonth() === month - 1;
    
    const result = {
      startDate: startDay,
      endDate: endDay,
      isValidWeek
    };
    
    console.log('🎮 CHOOSE PERIOD - calculateDateRange result:', result);
    return result;
  };

  // Tính lại khoảng ngày khi tháng, năm hoặc tuần thay đổi
  useEffect(() => {
    console.log('🎮 CHOOSE PERIOD - useEffect dateRange calculation:', { month, year, weekOffset });
    
    const newDateRange = calculateDateRange(month, year, weekOffset);
    setDateRange(newDateRange);
    
    console.log('🎮 CHOOSE PERIOD - Chuẩn bị gọi onPeriodChange với:', newDateRange);
    console.log('🎮 CHOOSE PERIOD - onPeriodChange function:', onPeriodChange);
    
    if (onPeriodChange) {
      console.log('🎮 CHOOSE PERIOD - Gọi onPeriodChange(newDateRange)');
      onPeriodChange(newDateRange);
      console.log('🎮 CHOOSE PERIOD - Đã gọi onPeriodChange xong');
    } else {
      console.log('🎮 CHOOSE PERIOD - onPeriodChange KHÔNG tồn tại!');
    }
  }, [month, year, weekOffset]);

  // Hàm xử lý khi chọn tuần trước đó
  const handlePreviousWeek = () => {
    console.log('🎮 CHOOSE PERIOD - handlePreviousWeek, weekOffset hiện tại:', weekOffset);
    if (weekOffset > 0) {
      const newWeek = weekOffset - 1;
      console.log('🎮 CHOOSE PERIOD - Set weekOffset mới:', newWeek);
      setWeekOffset(newWeek);
    }
  };
  
  // Tính số tuần tối đa trong tháng
  const getMaxWeeksInMonth = (month, year) => {
    let maxWeeks = 0;
    let testWeekOffset = 0;
    
    // Kiểm tra từng tuần cho đến khi tìm thấy tuần không hợp lệ
    while (testWeekOffset < 6) { // Tối đa 6 tuần để tránh vòng lặp vô hạn
      const testRange = calculateDateRange(month, year, testWeekOffset);
      if (!testRange.isValidWeek) {
        break;
      }
      maxWeeks = testWeekOffset + 1;
      testWeekOffset++;
    }
    
    return maxWeeks;
  };

  // Hàm xử lý khi chọn tuần tiếp theo
  const handleNextWeek = () => {
    console.log('🎮 CHOOSE PERIOD - handleNextWeek, weekOffset hiện tại:', weekOffset);
    const maxWeeks = getMaxWeeksInMonth(month, year);
    console.log('🎮 CHOOSE PERIOD - maxWeeks trong tháng:', maxWeeks);
    
    if (weekOffset < maxWeeks - 1) {
      const newWeek = weekOffset + 1;
      console.log('🎮 CHOOSE PERIOD - Set weekOffset mới:', newWeek);
      setWeekOffset(newWeek);
    }
  };

  const maxWeeks = getMaxWeeksInMonth(month, year);

  return (
    <div className="flex items-center space-x-3">
      <button 
        onClick={handlePreviousWeek}
        disabled={weekOffset === 0}
        className={`p-2 rounded-lg border transition-all duration-200 ${
          weekOffset === 0 
            ? 'text-gray-400 cursor-not-allowed border-gray-200 bg-gray-50' 
            : 'hover:bg-purple-50 hover:border-purple-300 hover:text-purple-700 hover:scale-110 hover:shadow-md border-purple-200 text-purple-600'
        }`}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      
      <div className="border border-purple-300 rounded-lg p-2.5 bg-gradient-to-r from-purple-50 to-indigo-50 flex items-center min-w-[220px] hover:shadow-md transition-shadow duration-200">
        <span className="text-sm font-medium text-purple-800">
          {dateRange.startDate && dateRange.endDate
            ? `Tuần ${weekOffset + 1}/${maxWeeks}: ${formatDate(dateRange.startDate)} - ${formatDate(dateRange.endDate)}`
            : 'Đang tải...'}
        </span>
      </div>
      
      <button 
        onClick={handleNextWeek}
        disabled={weekOffset >= maxWeeks - 1}
        className={`p-2 rounded-lg border transition-all duration-200 ${
          weekOffset >= maxWeeks - 1 
            ? 'text-gray-400 cursor-not-allowed border-gray-200 bg-gray-50' 
            : 'hover:bg-purple-50 hover:border-purple-300 hover:text-purple-700 hover:scale-110 hover:shadow-md border-purple-200 text-purple-600'
        }`}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
};

export default ChoosePeriod;