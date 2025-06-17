import React, { useState, useEffect, useMemo } from 'react';

// Tạo mảng giờ từ 7h sáng đến 22h tối
const hoursArray = Array.from({ length: 16 }, (_, i) => 7 + i);
const daysOfWeek = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'CN'];

const ChooseFreeTime = ({ initialGrid, onCellToggle, onBatchCellToggle, loading = false }) => {
  const [availabilityGrid, setAvailabilityGrid] = useState({});
  
  // Debug: Kiểm tra props
  useEffect(() => {
    console.log('🔧 ChooseFreeTime props:', {
      hasOnCellToggle: !!onCellToggle,
      hasOnBatchCellToggle: !!onBatchCellToggle,
      loading
    });
  }, [onCellToggle, onBatchCellToggle, loading]);
  
  // Drag selection states
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(null);
  const [dragEnd, setDragEnd] = useState(null);
  const [dragMode, setDragMode] = useState(null); // 'add' hoặc 'remove'
  const [selectedCells, setSelectedCells] = useState(new Set());
  const [mouseDownTime, setMouseDownTime] = useState(0);
  const [hasDragMoved, setHasDragMoved] = useState(false);
  
  // Khởi tạo grid khi component mount hoặc initialGrid thay đổi
  useEffect(() => {
    if (initialGrid && Object.keys(initialGrid).length > 0) {
      console.log('📊 ChooseFreeTime: Nhận initialGrid mới', {
        keys: Object.keys(initialGrid),
        daysWithData: Object.keys(initialGrid).filter(day => 
          Object.values(initialGrid[day]).some(value => value === true)
        ),
        samplesTrue: Object.entries(initialGrid).flatMap(([day, hours]) => 
          Object.entries(hours)
            .filter(([_, value]) => value === true)
            .map(([hour]) => `${day} ${hour}:00`)
        ).slice(0, 5) // Chỉ lấy 5 mẫu đầu tiên
      });
      
      // Kiểm tra dữ liệu trước khi cập nhật state
      const valid = daysOfWeek.every(day => initialGrid[day] !== undefined);
      if (!valid) {
        console.error('⚠️ initialGrid không hợp lệ:', initialGrid);
      }
      
      // Tạo bản sao mới để tránh tham chiếu
      setAvailabilityGrid(JSON.parse(JSON.stringify(initialGrid)));
      
      // Reset các trạng thái liên quan đến drag khi grid thay đổi
      setIsDragging(false);
      setDragStart(null);
      setDragEnd(null);
      setDragMode(null);
      setSelectedCells(new Set());
      setHasDragMoved(false);
    }
  }, [initialGrid]);

  // Helper function để tạo cell key
  const getCellKey = (day, hour) => `${day}-${hour}`;
  
  // Helper function để lấy tất cả ô trong vùng chọn
  const getCellsInSelection = (startDay, startHour, endDay, endHour) => {
    const cells = [];
    
    const startDayIndex = daysOfWeek.indexOf(startDay);
    const endDayIndex = daysOfWeek.indexOf(endDay);
    const startHourIndex = hoursArray.indexOf(startHour);
    const endHourIndex = hoursArray.indexOf(endHour);
    
    const minDay = Math.min(startDayIndex, endDayIndex);
    const maxDay = Math.max(startDayIndex, endDayIndex);
    const minHour = Math.min(startHourIndex, endHourIndex);
    const maxHour = Math.max(startHourIndex, endHourIndex);
    
    for (let dayIdx = minDay; dayIdx <= maxDay; dayIdx++) {
      for (let hourIdx = minHour; hourIdx <= maxHour; hourIdx++) {
        cells.push({
          day: daysOfWeek[dayIdx],
          hour: hoursArray[hourIdx]
        });
      }
    }
    
    return cells;
  };

  // Xử lý click vào ô (auto-save cho single click)
  const handleCellClick = async (day, hour) => {
    // Chỉ xử lý click nếu không phải drag selection
    if (loading || isDragging || hasDragMoved) return; 
    
    const currentState = availabilityGrid[day] && availabilityGrid[day][hour];
    
    // Gọi hàm từ parent component để xử lý toggle
    if (onCellToggle) {
      await onCellToggle(day, hour, currentState);
    }
  };

  // Xử lý mouse down - bắt đầu drag
  const handleMouseDown = (day, hour, e) => {
    if (loading) return;
    
    e.preventDefault();
    setMouseDownTime(Date.now());
    setHasDragMoved(false);
    setDragStart({ day, hour });
    setDragEnd({ day, hour });
    
    // Xác định mode dựa trên trạng thái hiện tại của ô
    const currentState = availabilityGrid[day] && availabilityGrid[day][hour];
    setDragMode(currentState ? 'remove' : 'add');
    
    // Highlight ô đầu tiên
    setSelectedCells(new Set([getCellKey(day, hour)]));
  };

  // Xử lý mouse enter - cập nhật vùng chọn
  const handleMouseEnter = (day, hour) => {
    if (!dragStart || loading) return;
    
    // Chỉ bắt đầu drag nếu di chuyển đến ô khác
    if (dragStart.day !== day || dragStart.hour !== hour) {
      if (!isDragging) {
        setIsDragging(true);
      }
      setHasDragMoved(true);
      setDragEnd({ day, hour });
      
      // Cập nhật vùng chọn
      const cellsInSelection = getCellsInSelection(
        dragStart.day, dragStart.hour,
        day, hour
      );
      
      const newSelectedCells = new Set(
        cellsInSelection.map(cell => getCellKey(cell.day, cell.hour))
      );
      
      setSelectedCells(newSelectedCells);
    }
  };

  
  // Helper function để xác định class của cell
  const getCellClassName = (day, hour) => {
    const cellKey = getCellKey(day, hour);
    const isSelected = selectedCells.has(cellKey);
    const isAvailable = availabilityGrid[day] && availabilityGrid[day][hour];
    
    let baseClass = 'border p-2 cursor-pointer transition-all select-none';
    
    if (loading) {
      return `${baseClass} cursor-wait opacity-50`;
    }
    
    if (isSelected) {
      // Highlighting khi đang drag
      return `${baseClass} ${dragMode === 'add' ? 'bg-green-300 border-green-500' : 'bg-red-300 border-red-500'}`;
    }
    
    if (isAvailable) {
      return `${baseClass} bg-green-500 hover:bg-green-600`;
    }
    
    return `${baseClass} hover:bg-gray-100`;
  };

  // Thêm event listener để handle mouse up trên document
  useEffect(() => {
    const handleDocumentMouseUp = async () => {
      // Chỉ xử lý nếu thực sự có drag movement
      if (!dragStart) return;
      
      // Nếu có drag thật sự (di chuyển qua nhiều ô)
      if (isDragging && hasDragMoved && dragEnd) {
        setIsDragging(false);
        
        console.log('🖱️ Drag selection from', dragStart, 'to', dragEnd);
        
        // Lấy tất cả ô trong vùng chọn
        const cellsInSelection = getCellsInSelection(
          dragStart.day, dragStart.hour,
          dragEnd.day, dragEnd.hour
        );
        
        // Chuẩn bị batch operations
        const operations = [];
        cellsInSelection.forEach(cell => {
          const currentState = availabilityGrid[cell.day] && availabilityGrid[cell.day][cell.hour];
          
          // Chỉ thay đổi nếu trạng thái khác với dragMode mong muốn
          if (dragMode === 'add' && !currentState) {
            operations.push({
              dayName: cell.day,
              hour: cell.hour,
              currentState: false
            });
          } else if (dragMode === 'remove' && currentState) {
            operations.push({
              dayName: cell.day,
              hour: cell.hour,
              currentState: true
            });
          }
        });
        
        // Sử dụng batch processing cho drag selection
        if (operations.length > 0 && onBatchCellToggle) {
          console.log('🚀 Using batch processing for', operations.length, 'operations');
          await onBatchCellToggle(operations);
        }
      }
      
      // Reset tất cả drag states
      setIsDragging(false);
      setDragStart(null);
      setDragEnd(null);
      setDragMode(null);
      setSelectedCells(new Set());
      setHasDragMoved(false);
    };

    document.addEventListener('mouseup', handleDocumentMouseUp);
    
    return () => {
      document.removeEventListener('mouseup', handleDocumentMouseUp);
    };
  }, [isDragging, dragStart, dragEnd, dragMode, availabilityGrid, onBatchCellToggle, hasDragMoved]);

  // Sử dụng useMemo để tối ưu hóa hiệu suất rendering
  const availabilityTable = useMemo(() => (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse border" style={{ userSelect: 'none' }}>
        <thead>
          <tr className="bg-purple-100">
            <th className="border p-2 text-center w-20">Giờ</th>
            {daysOfWeek.map(day => (
              <th key={day} className="border p-2 text-center">{day}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {hoursArray.map(hour => (
            <tr key={hour} className={hour % 2 === 0 ? 'bg-gray-50' : ''}>
              <td className="border p-2 text-center font-medium">{hour}:00</td>
              {daysOfWeek.map(day => (
                <td 
                  key={`${day}-${hour}`} 
                  className={getCellClassName(day, hour)}
                  onClick={() => handleCellClick(day, hour)}
                  onMouseDown={(e) => handleMouseDown(day, hour, e)}
                  onMouseEnter={() => handleMouseEnter(day, hour)}
                  title={`${day}, ${hour}:00 - ${availabilityGrid[day] && availabilityGrid[day][hour] ? 'Có thể tham gia' : 'Không thể tham gia'}`}
                >
                  {availabilityGrid[day] && availabilityGrid[day][hour] ? 
                    <div className="flex justify-center items-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                    </div>
                    : ''
                  }
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ), [availabilityGrid, loading, selectedCells, dragMode]);

  return (
    <div className="bg-white rounded-md">
      {/* Chú thích */}
      <div className="flex items-center mb-4 gap-6 pl-2">
        <div className="flex items-center">
          <div className="w-4 h-4 bg-green-500 rounded-sm mr-2"></div>
          <span className="text-sm">Có thể tham gia</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-white border border-gray-300 rounded-sm mr-2"></div>
          <span className="text-sm">Không thể tham gia</span>
        </div>
        <div className="text-sm text-gray-500">
          (Nhấp hoặc kéo để chọn nhiều ô cùng lúc)
        </div>
        {loading && (
          <div className="text-sm text-blue-600 font-medium">
            ⏳ Đang xử lý...
          </div>
        )}
      </div>
      
      {/* Bảng lịch */}
      {availabilityTable}
      
      {/* Thông báo auto-save */}
      <div className="mt-4 p-3 bg-blue-50 border-l-4 border-blue-500 rounded-r-md">
        <p className="text-sm text-blue-800">
           <strong>Tự động lưu:</strong> Thời gian sẽ tự dộng lưu khi bạn chọn.
        </p>
      </div>
    </div>
  );
};

export default ChooseFreeTime;