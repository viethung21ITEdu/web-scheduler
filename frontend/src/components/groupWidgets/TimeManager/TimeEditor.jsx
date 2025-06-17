import React, { useState, useEffect } from 'react';
import timeslotService from '../../../services/timeslotService';
import CalendarSyncSimple from '../../common/CalendarSyncSimple';

const TimeEditor = () => {
  const [timeslots, setTimeslots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState(() => getWeekDates(new Date()));
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(null);
  const [dragEnd, setDragEnd] = useState(null);
  const [pendingSelection, setPendingSelection] = useState(new Set());

  // Khung giờ từ 7:00 đến 22:00
  const timeSlots = [];
  for (let hour = 7; hour <= 22; hour++) {
    timeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
  }

  const daysOfWeek = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'CN'];

  // Lấy các ngày trong tuần
  function getWeekDates(date) {
    const week = [];
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Thứ 2 làm ngày đầu tuần
    startOfWeek.setDate(diff);

    for (let i = 0; i < 7; i++) {
      const dayOfWeek = new Date(startOfWeek);
      dayOfWeek.setDate(startOfWeek.getDate() + i);
      week.push(dayOfWeek);
    }
    return week;
  }

  // Load timeslots khi component mount
  useEffect(() => {
    loadTimeslots();
  }, []);

  // Xử lý mouseup trên document
  useEffect(() => {
    const handleDocumentMouseUp = () => {
      if (isDragging) {
        handleMouseUp();
      }
    };

    document.addEventListener('mouseup', handleDocumentMouseUp);
    return () => {
      document.removeEventListener('mouseup', handleDocumentMouseUp);
    };
  }, [isDragging]);

  const loadTimeslots = async () => {
    try {
      setLoading(true);
      console.log('🔄 Đang tải timeslots...');
      const data = await timeslotService.getUserTimeslots();
      console.log('✅ Dữ liệu timeslots nhận được:', data);
      setTimeslots(data.data || []);
    } catch (error) {
      console.error('❌ Error loading timeslots:', error);
      console.error('Error response:', error.response?.data);
      alert(`Không thể tải danh sách thời gian rảnh: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Kiểm tra cell có được chọn tạm thời không
  const isCellPendingSelection = (dayIndex, timeIndex) => {
    const date = selectedWeek[dayIndex];
    const time = timeSlots[timeIndex];
    const dateStr = date.toISOString().split('T')[0];
    const cellKey = `${dateStr}_${time}`;
    
    return pendingSelection.has(cellKey);
  };

  // Kiểm tra cell có timeslot không
  const hasCellTimeslot = (dayIndex, timeIndex) => {
    const date = selectedWeek[dayIndex];
    const time = timeSlots[timeIndex];
    const cellDateTime = new Date(`${date.toISOString().split('T')[0]}T${time}:00`);
    
    return timeslots.some(slot => {
      const startTime = new Date(slot.start_time);
      const endTime = new Date(slot.end_time);
      return cellDateTime >= startTime && cellDateTime < endTime;
    });
  };

  // Bắt đầu drag
  const handleMouseDown = (dayIndex, timeIndex) => {
    if (loading) return;
    
    const date = selectedWeek[dayIndex];
    const time = timeSlots[timeIndex];
    const cellKey = `${date.toISOString().split('T')[0]}_${time}`;
    
    setIsDragging(true);
    setDragStart({ dayIndex, timeIndex });
    setDragEnd({ dayIndex, timeIndex });
    setPendingSelection(new Set([cellKey]));
  };

  // Di chuyển mouse khi drag
  const handleMouseEnter = (dayIndex, timeIndex) => {
    if (!isDragging || !dragStart) return;
    
    setDragEnd({ dayIndex, timeIndex });
    
    // Tính toán vùng chọn
    const minDay = Math.min(dragStart.dayIndex, dayIndex);
    const maxDay = Math.max(dragStart.dayIndex, dayIndex);
    const minTime = Math.min(dragStart.timeIndex, timeIndex);
    const maxTime = Math.max(dragStart.timeIndex, timeIndex);
    
    const newPendingSelection = new Set();
    for (let d = minDay; d <= maxDay; d++) {
      for (let t = minTime; t <= maxTime; t++) {
        const date = selectedWeek[d];
        const time = timeSlots[t];
        const cellKey = `${date.toISOString().split('T')[0]}_${time}`;
        newPendingSelection.add(cellKey);
      }
    }
    setPendingSelection(newPendingSelection);
  };

  // Kết thúc drag
  const handleMouseUp = () => {
    if (!isDragging) return;
    
    setIsDragging(false);
    setDragStart(null);
    setDragEnd(null);
  };

  // Lưu các ô đã chọn
  const handleSaveSelection = async () => {
    if (pendingSelection.size === 0) {
      alert('Vui lòng chọn ít nhất một ô thời gian');
      return;
    }

    try {
      setLoading(true);
      console.log('🔄 Bắt đầu lưu timeslots...');
      console.log('📝 Các ô được chọn:', Array.from(pendingSelection));
      
      // Chuyển đổi pendingSelection thành các timeslot
      const cellsByDay = {};
      
      // Nhóm các ô theo ngày
      pendingSelection.forEach(cellKey => {
        const [dateStr, time] = cellKey.split('_');
        if (!cellsByDay[dateStr]) {
          cellsByDay[dateStr] = [];
        }
        cellsByDay[dateStr].push(time);
      });
      
      console.log('📅 Nhóm theo ngày:', cellsByDay);
      
      let savedCount = 0;
      let skippedCount = 0;
      
      // Tạo timeslot cho mỗi ngày
      for (const [dateStr, times] of Object.entries(cellsByDay)) {
        const date = new Date(dateStr);
        
        // Sắp xếp thời gian
        times.sort();
        
        // Tìm các khoảng thời gian liên tiếp
        let startTime = times[0];
        let endTime = times[0];
        
        for (let i = 1; i < times.length; i++) {
          const currentHour = parseInt(times[i].split(':')[0]);
          const prevHour = parseInt(times[i-1].split(':')[0]);
          
          if (currentHour === prevHour + 1) {
            // Thời gian liên tiếp
            endTime = times[i];
          } else {
            // Tạo timeslot cho khoảng trước đó
            const endHour = parseInt(endTime.split(':')[0]) + 1;
            const finalEndTime = `${endHour.toString().padStart(2, '0')}:00`;
            
            const timeslotData = {
              start_time: timeslotService.formatDateTime(date, startTime),
              end_time: timeslotService.formatDateTime(date, finalEndTime)
            };
            
            console.log('💾 Chuẩn bị lưu timeslot:', timeslotData);
            
            // Kiểm tra xung đột
            if (!timeslotService.checkTimeConflict(timeslots, timeslotData)) {
              try {
                const result = await timeslotService.createTimeslot(timeslotData);
                console.log('✅ Lưu thành công:', result);
                savedCount++;
              } catch (createError) {
                console.error('❌ Lỗi khi tạo timeslot:', createError);
                console.error('API response:', createError.response?.data);
              }
            } else {
              console.log('⚠️ Bỏ qua do xung đột thời gian:', timeslotData);
              skippedCount++;
            }
            
            // Bắt đầu khoảng mới
            startTime = times[i];
            endTime = times[i];
          }
        }
        
        // Tạo timeslot cuối cùng
        const finalEndHour = parseInt(endTime.split(':')[0]) + 1;
        const finalEndTime = `${finalEndHour.toString().padStart(2, '0')}:00`;
        
        const timeslotData = {
          start_time: timeslotService.formatDateTime(date, startTime),
          end_time: timeslotService.formatDateTime(date, finalEndTime)
        };
        
        console.log('💾 Chuẩn bị lưu timeslot cuối:', timeslotData);
        
        // Kiểm tra xung đột
        if (!timeslotService.checkTimeConflict(timeslots, timeslotData)) {
          try {
            const result = await timeslotService.createTimeslot(timeslotData);
            console.log('✅ Lưu cuối thành công:', result);
            savedCount++;
          } catch (createError) {
            console.error('❌ Lỗi khi tạo timeslot cuối:', createError);
            console.error('API response:', createError.response?.data);
          }
        } else {
          console.log('⚠️ Bỏ qua timeslot cuối do xung đột:', timeslotData);
          skippedCount++;
        }
      }
      
      console.log(`📊 Kết quả: Đã lưu ${savedCount}, Bỏ qua ${skippedCount}`);
      
      await loadTimeslots();
      setPendingSelection(new Set());
      alert(`Lưu thành công ${savedCount} khoảng thời gian! ${skippedCount > 0 ? `(Bỏ qua ${skippedCount} do trùng lặp)` : ''}`);
      
    } catch (error) {
      console.error('❌ Error creating timeslots:', error);
      console.error('Error details:', error.response?.data);
      alert(`Có lỗi khi lưu thời gian rảnh: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Hủy lựa chọn
  const handleCancelSelection = () => {
    setPendingSelection(new Set());
    setDragStart(null);
    setDragEnd(null);
    setIsDragging(false);
  };

  // Xóa timeslot khi click chuột phải
  const handleContextMenu = async (e, dayIndex, timeIndex) => {
    e.preventDefault();
    
    const date = selectedWeek[dayIndex];
    const time = timeSlots[timeIndex];
    const cellDateTime = new Date(`${date.toISOString().split('T')[0]}T${time}:00`);
    
    // Tìm timeslot chứa thời gian này
    const slotToDelete = timeslots.find(slot => {
      const startTime = new Date(slot.start_time);
      const endTime = new Date(slot.end_time);
      return cellDateTime >= startTime && cellDateTime < endTime;
    });
    
    if (slotToDelete) {
      if (window.confirm('Xóa khoảng thời gian rảnh này?')) {
        try {
          await timeslotService.deleteTimeslot(slotToDelete.timeslot_id);
          await loadTimeslots();
          alert('Xóa thành công!');
        } catch (error) {
          console.error('Error deleting timeslot:', error);
          alert('Không thể xóa');
        }
      }
    }
  };

  // Chuyển tuần
  const changeWeek = (direction) => {
    const newDate = new Date(selectedWeek[0]);
    newDate.setDate(newDate.getDate() + (direction * 7));
    setSelectedWeek(getWeekDates(newDate));
    // Reset selection khi chuyển tuần
    setPendingSelection(new Set());
  };

  const formatWeekRange = () => {
    const start = selectedWeek[0];
    const end = selectedWeek[6];
    return `${start.getDate().toString().padStart(2, '0')}/${(start.getMonth() + 1).toString().padStart(2, '0')}/${start.getFullYear()} đến ${end.getDate().toString().padStart(2, '0')}/${(end.getMonth() + 1).toString().padStart(2, '0')}/${end.getFullYear()}`;
  };

  // Handler cho khi user chọn suggested time từ calendar
  const handleSuggestedTimeSelect = async (suggestedTime) => {
    try {
      const timeslotData = {
        start_time: suggestedTime.start,
        end_time: suggestedTime.end
      };
      
      console.log('💡 Saving suggested time:', timeslotData);
      
      await timeslotService.createTimeslot(timeslotData);
      await loadTimeslots();
      alert(`Đã thêm thời gian rảnh: ${suggestedTime.startTime} - ${suggestedTime.endTime}`);
      
    } catch (error) {
      console.error('❌ Error saving suggested time:', error);
      alert(`Lỗi khi lưu thời gian: ${error.response?.data?.message || error.message}`);
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg select-none">
      {/* Google Calendar Sync Section */}
      <div className="mb-6">
        <CalendarSyncSimple 
          selectedDate={selectedWeek[0]?.toISOString().split('T')[0]}
        />
      </div>
      
      {/* Header với navigation và legend */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
        {/* Week Navigation */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => changeWeek(-1)}
            className="bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-2 rounded-md transition-colors"
          >
            {'<'}
          </button>
          <span className="font-medium text-gray-700 min-w-[200px] text-center">
            Từ {formatWeekRange()}
          </span>
          <button 
            onClick={() => changeWeek(1)}
            className="bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-2 rounded-md transition-colors"
          >
            {'>'}
          </button>
        </div>

        {/* Action Buttons */}
        {pendingSelection.size > 0 && (
          <div className="flex gap-2">
            <button
              onClick={handleSaveSelection}
              disabled={loading}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md transition-colors disabled:opacity-50"
            >
              💾 Lưu thời gian đã chọn ({pendingSelection.size})
            </button>
            <button
              onClick={handleCancelSelection}
              disabled={loading}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition-colors disabled:opacity-50"
            >
              ❌ Hủy
            </button>
          </div>
        )}

        {/* Legend */}
        <div className="flex flex-wrap gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded border border-gray-300"></div>
            <span>Có thể tham gia</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded border border-gray-300"></div>
            <span>Đang chọn</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-100 rounded border border-gray-300"></div>
            <span>Không thể tham gia</span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-xl text-gray-600">
          ⏳ Đang tải...
        </div>
      ) : (
        <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
          {/* Calendar Header */}
          <div className="grid grid-cols-8 bg-gray-50 border-b-2 border-gray-200">
            <div className="p-4 font-semibold text-center border-r border-gray-200 bg-gray-100">
              Giờ
            </div>
            {daysOfWeek.map((day, index) => (
              <div key={day} className="p-3 text-center border-r border-gray-200 last:border-r-0">
                <div className="font-semibold text-gray-800 mb-1">{day}</div>
                <div className="text-sm text-gray-600">
                  {selectedWeek[index]?.getDate().toString().padStart(2, '0')}
                </div>
              </div>
            ))}
          </div>

          {/* Calendar Body */}
          <div className="max-h-[500px] overflow-y-auto">
            {timeSlots.map((time, timeIndex) => (
              <div key={time} className="grid grid-cols-8 border-b border-gray-200 last:border-b-0">
                <div className="p-3 text-center text-sm font-medium bg-gray-50 border-r border-gray-200 text-gray-600">
                  {time}
                </div>
                {daysOfWeek.map((_, dayIndex) => {
                  const hasTimeslot = hasCellTimeslot(dayIndex, timeIndex);
                  const isPendingSelection = isCellPendingSelection(dayIndex, timeIndex);
                  
                  return (
                    <div
                      key={`${dayIndex}-${timeIndex}`}
                      className={`
                        h-10 border-r border-gray-200 last:border-r-0 cursor-pointer transition-all duration-200 relative
                        ${hasTimeslot 
                          ? 'bg-green-500 hover:bg-green-600' 
                          : isPendingSelection
                          ? 'bg-blue-500 hover:bg-blue-600'
                          : 'hover:bg-indigo-50'
                        }
                      `}
                      onMouseDown={() => handleMouseDown(dayIndex, timeIndex)}
                      onMouseEnter={() => handleMouseEnter(dayIndex, timeIndex)}
                      onContextMenu={(e) => handleContextMenu(e, dayIndex, timeIndex)}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-6 p-4 bg-indigo-50 border-l-4 border-indigo-500 rounded-r-md">
        <p className="font-semibold text-gray-800 mb-2">💡 Hướng dẫn:</p>
        <p className="text-sm text-gray-600 mb-1">• Click và kéo để chọn thời gian rảnh, sau đó bấm nút "Lưu"</p>
        <p className="text-sm text-gray-600 mb-1">• Click chuột phải để xóa thời gian đã lưu</p>
        <p className="text-sm text-gray-600 mb-1">• Các ô xanh lá là thời gian bạn có thể tham gia</p>
        <p className="text-sm text-gray-600">• Các ô xanh dương là thời gian đang chọn (chưa lưu)</p>
      </div>
    </div>
  );
};

export default TimeEditor; 