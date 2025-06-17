import React, { useState, useEffect, useCallback, useMemo } from 'react';
import ChooseMonthAndYear from './ChooseMonthAndYear';
import ChoosePeriod from './ChoosePeriod';
import timeslotService from '../../../services/timeslotService';
import CalendarSyncWeek from '../../common/CalendarSyncWeek';

  // Constants
  const DAYS_OF_WEEK = ['CN', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7']; // khớp với JS Date.getDay()
  const DISPLAY_DAYS = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'CN']; // CN ở cuối tuần
const HOURS_ARRAY = Array.from({ length: 16 }, (_, i) => 7 + i); // 7h-22h

const TimeManager = ({ userRole = 'member', groupId }) => {
  // Core states
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedWeekRange, setSelectedWeekRange] = useState(null);
  const [timeslots, setTimeslots] = useState([]);
  const [availabilityGrid, setAvailabilityGrid] = useState({});
  const [loading, setLoading] = useState(false);
  
  // Drag selection states
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(null);
  const [dragEnd, setDragEnd] = useState(null);
  const [dragMode, setDragMode] = useState(null);
  const [selectedCells, setSelectedCells] = useState(new Set());

  // Helper: Create empty grid
  const createEmptyGrid = useCallback(() => {
    const grid = {};
    DAYS_OF_WEEK.forEach(day => {
      grid[day] = {};
      HOURS_ARRAY.forEach(hour => {
        grid[day][hour] = false;
      });
    });
    return grid;
  }, []);

  // Helper: Get week start date from selectedWeekRange
  const getWeekStartDate = useCallback(() => {
    if (!selectedWeekRange?.startDate) {
      // Fallback to current week
      const today = new Date();
      const dayOfWeek = today.getDay();
      const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      const monday = new Date(today);
      monday.setDate(today.getDate() + mondayOffset);
      monday.setHours(0, 0, 0, 0);
      return monday;
    }
    return new Date(selectedWeekRange.startDate);
  }, [selectedWeekRange]);

  // Helper: Check if timeslot is in selected week
  const isTimeslotInWeek = useCallback((timeslot, weekStart) => {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);
    
    const timeslotDate = new Date(timeslot.start_time);
    return timeslotDate >= weekStart && timeslotDate <= weekEnd;
  }, []);

  // Load timeslots from API
  const loadTimeslots = useCallback(async () => {
    if (!selectedWeekRange) {
      console.log('⏸️ Skipping timeslots load - no week selected');
      return;
    }
    
    try {
      setLoading(true);
      const weekStart = getWeekStartDate();
      
      console.log('🔄 Loading timeslots for week:', weekStart.toLocaleDateString());
      
      // Truyền groupId khi gọi API
      const response = await timeslotService.getUserTimeslots(groupId);
      const allTimeslots = response.data || [];
      
      // Filter timeslots for selected week only
      const weekTimeslots = allTimeslots.filter(slot => isTimeslotInWeek(slot, weekStart));
      
      console.log(`📊 Timeslots: ${allTimeslots.length} total → ${weekTimeslots.length} in week`);
      
      setTimeslots(weekTimeslots);
      
      // Build availability grid
      const grid = createEmptyGrid();
      weekTimeslots.forEach(slot => {
        const startTime = new Date(slot.start_time);
        const dayOfWeek = startTime.getDay();
        const dayName = DAYS_OF_WEEK[dayOfWeek]; // sử dụng DAYS_OF_WEEK thay vì DAY_MAPPING
        const hour = startTime.getHours();
        
        if (grid[dayName] && hour >= 7 && hour <= 22) {
          grid[dayName][hour] = true;
        }
      });
      
      setAvailabilityGrid(grid);
      
    } catch (error) {
      console.error('❌ Error loading timeslots:', error);
      setAvailabilityGrid(createEmptyGrid());
    } finally {
      setLoading(false);
    }
  }, [selectedWeekRange, getWeekStartDate, isTimeslotInWeek, createEmptyGrid, groupId]);

  // Create timeslot
  const createTimeslot = useCallback(async (dayName, hour) => {
    const weekStart = getWeekStartDate();
    const dayIndex = DAYS_OF_WEEK.indexOf(dayName);
    if (dayIndex === -1) return false;

    const targetDate = new Date(weekStart);
    // weekStart là Thứ 2, cần offset để map đúng:
    // CN = T2 + 6 ngày, Thứ 2 = T2 + 0 ngày, Thứ 3 = T2 + 1 ngày, etc.
    const dayOffset = dayIndex === 0 ? 6 : dayIndex - 1;
    targetDate.setDate(weekStart.getDate() + dayOffset);
    targetDate.setHours(hour, 0, 0, 0);

    const timeslotData = {
      group_id: parseInt(groupId),
      start_time: timeslotService.formatDateTime(targetDate, `${hour.toString().padStart(2, '0')}:00`),
      end_time: timeslotService.formatDateTime(targetDate, `${(hour + 1).toString().padStart(2, '0')}:00`)
    };

    try {
      const result = await timeslotService.createTimeslot(timeslotData);
      return result.success !== false;
    } catch (error) {
      console.error('❌ Error creating timeslot:', error);
      return false;
    }
  }, [getWeekStartDate, groupId]);

  // Delete timeslot
  const deleteTimeslot = useCallback(async (dayName, hour) => {
    const weekStart = getWeekStartDate();
    const dayIndex = DAYS_OF_WEEK.indexOf(dayName);
    if (dayIndex === -1) return false;

    const targetDate = new Date(weekStart);
    // weekStart là Thứ 2, cần offset để map đúng:
    // CN = T2 + 6 ngày, Thứ 2 = T2 + 0 ngày, Thứ 3 = T2 + 1 ngày, etc.
    const dayOffset = dayIndex === 0 ? 6 : dayIndex - 1;
    targetDate.setDate(weekStart.getDate() + dayOffset);
    targetDate.setHours(hour, 0, 0, 0);

    // Find matching timeslot
    const slotToDelete = timeslots.find(slot => {
      const startTime = new Date(slot.start_time);
      return startTime.toDateString() === targetDate.toDateString() && 
             startTime.getHours() === hour;
    });

    if (!slotToDelete) {
      console.warn('⚠️ Timeslot not found to delete');
      return false;
    }

    try {
      await timeslotService.deleteTimeslot(slotToDelete.timeslot_id);
      return true;
    } catch (error) {
      console.error('❌ Error deleting timeslot:', error);
      return false;
    }
  }, [getWeekStartDate, timeslots]);

  // Batch operations
  const processBatchOperations = useCallback(async (operations) => {
    if (operations.length === 0) return;

    setLoading(true);
    try {
      console.log(`🚀 Processing ${operations.length} batch operations`);
      
      const promises = operations.map(async ({ dayName, hour, isAdd }) => {
        return isAdd ? createTimeslot(dayName, hour) : deleteTimeslot(dayName, hour);
      });

      await Promise.all(promises);
      
      // Small delay for database sync
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Reload timeslots once
      await loadTimeslots();
      
    } catch (error) {
      console.error('❌ Batch operations error:', error);
    } finally {
      setLoading(false);
    }
  }, [createTimeslot, deleteTimeslot, loadTimeslots]);

  // Single cell toggle
  const handleCellToggle = useCallback(async (dayName, hour) => {
    const isCurrentlySelected = availabilityGrid[dayName]?.[hour] || false;
    const operation = {
      dayName,
      hour,
      isAdd: !isCurrentlySelected
    };
    
    await processBatchOperations([operation]);
  }, [availabilityGrid, processBatchOperations]);

  // Month/Year change handler
  const handleMonthYearChange = useCallback((month, year) => {
    console.log('📅 Month/Year changed:', month, year);
    setSelectedMonth(month);
    setSelectedYear(year);
    // selectedWeekRange will be reset by ChoosePeriod component
  }, []);

  // Week range change handler
  const handleWeekRangeChange = useCallback((newRange) => {
    console.log('📅 Week range changed:', newRange);
    setSelectedWeekRange(newRange);
  }, []);

  // Auto-load timeslots when week changes
  useEffect(() => {
    if (selectedWeekRange) {
      loadTimeslots();
    }
  }, [selectedWeekRange, loadTimeslots]);

  // Drag handlers
  const handleMouseDown = useCallback((dayName, hour, e) => {
    if (loading) return;
    
    e.preventDefault();
    setDragStart({ dayName, hour });
    setDragEnd({ dayName, hour });
    
    const isCurrentlySelected = availabilityGrid[dayName]?.[hour] || false;
    setDragMode(isCurrentlySelected ? 'remove' : 'add');
    setSelectedCells(new Set([`${dayName}-${hour}`]));
  }, [loading, availabilityGrid]);

  const handleMouseEnter = useCallback((dayName, hour) => {
    if (!dragStart || loading) return;
    
    // Start dragging only when moving to different cell
    if (dragStart.dayName !== dayName || dragStart.hour !== hour) {
      setIsDragging(true);
      setDragEnd({ dayName, hour });
      
      // Update selection area
      const startDayIndex = DISPLAY_DAYS.indexOf(dragStart.dayName);
      const endDayIndex = DISPLAY_DAYS.indexOf(dayName);
      const startHourIndex = HOURS_ARRAY.indexOf(dragStart.hour);
      const endHourIndex = HOURS_ARRAY.indexOf(hour);
      
      const minDay = Math.min(startDayIndex, endDayIndex);
      const maxDay = Math.max(startDayIndex, endDayIndex);
      const minHour = Math.min(startHourIndex, endHourIndex);
      const maxHour = Math.max(startHourIndex, endHourIndex);
      
      const newSelection = new Set();
      for (let d = minDay; d <= maxDay; d++) {
        for (let h = minHour; h <= maxHour; h++) {
          newSelection.add(`${DISPLAY_DAYS[d]}-${HOURS_ARRAY[h]}`);
        }
      }
      setSelectedCells(newSelection);
    }
  }, [dragStart, loading]);

  const handleMouseUp = useCallback(async () => {
    if (!dragStart) return;
    
    if (isDragging && dragEnd) {
      // Process drag selection
      const startDayIndex = DISPLAY_DAYS.indexOf(dragStart.dayName);
      const endDayIndex = DISPLAY_DAYS.indexOf(dragEnd.dayName);
      const startHourIndex = HOURS_ARRAY.indexOf(dragStart.hour);
      const endHourIndex = HOURS_ARRAY.indexOf(dragEnd.hour);
      
      const minDay = Math.min(startDayIndex, endDayIndex);
      const maxDay = Math.max(startDayIndex, endDayIndex);
      const minHour = Math.min(startHourIndex, endHourIndex);
      const maxHour = Math.max(startHourIndex, endHourIndex);
      
      const operations = [];
      for (let d = minDay; d <= maxDay; d++) {
        for (let h = minHour; h <= maxHour; h++) {
          const dayName = DISPLAY_DAYS[d];
          const hour = HOURS_ARRAY[h];
          const isCurrentlySelected = availabilityGrid[dayName]?.[hour] || false;
          
          if ((dragMode === 'add' && !isCurrentlySelected) || 
              (dragMode === 'remove' && isCurrentlySelected)) {
            operations.push({
              dayName,
              hour,
              isAdd: dragMode === 'add'
            });
          }
        }
      }
      
      if (operations.length > 0) {
        await processBatchOperations(operations);
      }
    } else if (!isDragging) {
      // Single click
      await handleCellToggle(dragStart.dayName, dragStart.hour);
    }
    
    // Reset drag state
    setIsDragging(false);
    setDragStart(null);
    setDragEnd(null);
    setDragMode(null);
    setSelectedCells(new Set());
  }, [dragStart, dragEnd, isDragging, dragMode, availabilityGrid, processBatchOperations, handleCellToggle]);

  // Add global mouse up listener
  useEffect(() => {
    document.addEventListener('mouseup', handleMouseUp);
    return () => document.removeEventListener('mouseup', handleMouseUp);
  }, [handleMouseUp]);

  // Cell styling
  const getCellClassName = useCallback((dayName, hour) => {
    const cellKey = `${dayName}-${hour}`;
    const isSelected = selectedCells.has(cellKey);
    const isAvailable = availabilityGrid[dayName]?.[hour] || false;
    
    let baseClass = 'p-3 cursor-pointer transition-all select-none flex items-center justify-center';
    
    if (loading) {
      return `${baseClass} cursor-wait opacity-50`;
    }
    
    if (isSelected && isDragging) {
      return `${baseClass} ${dragMode === 'add' ? 'bg-green-300' : 'bg-red-300'}`;
    }
    
    if (isAvailable) {
      return `${baseClass} bg-green-500 hover:bg-green-600 text-white`;
    }
    
    return `${baseClass} hover:bg-gray-100`;
  }, [selectedCells, availabilityGrid, loading, isDragging, dragMode]);

  // Memoized dates display - map với DISPLAY_DAYS (CN ở cuối)
  const displayDates = useMemo(() => {
    if (!selectedWeekRange?.startDate) {
      return Array(7).fill('');
    }
    const startDate = new Date(selectedWeekRange.startDate); // startDate là Thứ 2
    
    // Tạo mảng ngày theo thứ tự: Thứ 2, Thứ 3, Thứ 4, Thứ 5, Thứ 6, Thứ 7, CN
    const dates = Array(7).fill().map((_, i) => {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i); // +0, +1, +2, +3, +4, +5, +6
      return date.getDate().toString();
    });
    return dates;
  }, [selectedWeekRange?.startDate]);

  // Statistics
  const statistics = useMemo(() => {
    const totalSlots = timeslots.length;
    const uniqueDays = new Set(timeslots.map(slot => {
      const date = new Date(slot.start_time);
      return date.toDateString();
    })).size;
    
    return { totalSlots, uniqueDays };
  }, [timeslots]);

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="mb-4 pb-3 border-b border-gray-100">
        <h2 className="text-xl font-semibold text-gray-800 mb-1 text-center">
          Chỉnh sửa thời gian rảnh
          {userRole === 'leader' }
        </h2>
        <p className="text-sm text-gray-600 text-center">Chọn tháng và tuần để quản lý lịch rảnh của bạn</p>
      </div>
      
      {/* Calendar Sync Section */}
      <div className="mb-4">
        <CalendarSyncWeek 
          weekRange={selectedWeekRange}
          groupId={groupId}
          onSyncComplete={async (result) => {
            console.log('🔄 Calendar sync completed:', result);
            // Reload timeslots để hiển thị dữ liệu mới sau khi sync
            await loadTimeslots();
          }}
        />
      </div>
      
      {/* Controls */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-center gap-6 mb-5">
        {/* Month/Year */}
        <div className="w-full lg:w-auto">
          <label className="block text-sm font-semibold text-gray-800 mb-1.5">
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"></span>
              Chọn tháng
            </span>
          </label>
          <div className="w-full lg:w-48">
            <ChooseMonthAndYear onMonthYearChange={handleMonthYearChange} />
          </div>
        </div>
        
        {/* Week selection - Center */}
        <div className="w-full lg:w-auto">
          <label className="block text-sm font-semibold text-gray-800 mb-1.5">
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full"></span>
              Chọn tuần
            </span>
          </label>
          <ChoosePeriod 
            month={selectedMonth} 
            year={selectedYear} 
            currentWeek={0}
            onPeriodChange={handleWeekRangeChange}
          />
        </div>
        
        {/* Statistics */}
        <div className="w-full lg:w-auto">
          <label className="block text-sm font-semibold text-gray-800 mb-1.5">
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-gradient-to-r from-green-500 to-green-600 rounded-full"></span>
              Thống kê
            </span>
          </label>
          <div className="w-full lg:w-36 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-2.5 hover:shadow-md transition-all duration-200 hover:scale-105 transform h-[42px] flex items-center">
            <div className="w-full">
              <div className="text-xs text-green-700 font-medium leading-tight">
                {statistics.totalSlots} khung giờ
                {statistics.uniqueDays > 0 && (
                  <span className="text-green-600"> • {statistics.uniqueDays} ngày</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Time Grid */}
      <div className="overflow-x-auto border border-gray-300 rounded-lg">
        <div className="min-w-max">
          {/* Header */}
          <div className="grid grid-cols-8 bg-purple-100 border-b border-gray-300" style={{ userSelect: 'none' }}>
            <div className="p-3 text-center font-medium border-r border-gray-300">Giờ</div>
            {DISPLAY_DAYS.map((day, displayIndex) => {
              // displayIndex khớp hoàn toàn: 0=Thứ2, 1=Thứ3, ..., 6=CN
              return (
                <div key={day} className="p-3 text-center font-medium border-r border-gray-300 last:border-r-0">
                  <div>{day}</div>
                  <div className="text-xs text-gray-500">{displayDates[displayIndex]}</div>
                </div>
              );
            })}
          </div>
          
          {/* Time Rows */}
          {HOURS_ARRAY.map(hour => (
            <div 
              key={hour} 
              className={`grid grid-cols-8 border-b border-gray-200 last:border-b-0 ${hour % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}
            >
              {/* Hour label */}
              <div className="p-3 text-center font-medium border-r border-gray-300 bg-gray-100">
                {hour}:00
              </div>
              
              {/* Day cells */}
              {DISPLAY_DAYS.map(day => (
                <div
                  key={`${day}-${hour}`}
                  className={`${getCellClassName(day, hour)} border-r border-gray-200 last:border-r-0 min-h-[50px]`}
                  onMouseDown={(e) => handleMouseDown(day, hour, e)}
                  onMouseEnter={() => handleMouseEnter(day, hour)}
                  title={`${day}, ${hour}:00`}
                >
                  {availabilityGrid[day]?.[hour] && (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-3 p-2 bg-blue-50 border-l-4 border-blue-500 rounded-r-md">
        <p className="text-xs text-blue-800">
          <strong>Hướng dẫn:</strong> Nhấp để chọn/bỏ chọn 1 ô. Kéo để chọn nhiều ô cùng lúc. Thay đổi tự động được lưu.
          {loading && <span className="ml-2 text-blue-600">⏳ Đang xử lý...</span>}
        </p>
      </div>
    </div>
  );
};

export default TimeManager; 