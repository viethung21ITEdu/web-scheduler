import React, { useState } from 'react';
import Modal from './Modal';
import MapPicker from './MapPicker';

const MapPickerModal = ({ 
  isOpen, 
  onClose, 
  onLocationSelect, 
  initialLocation = null,
  title = "Chọn địa điểm trên bản đồ"
}) => {
  const [selectedLocation, setSelectedLocation] = useState(initialLocation);

  // Update selectedLocation when initialLocation changes
  React.useEffect(() => {
    setSelectedLocation(initialLocation);
  }, [initialLocation]);

  const handleLocationSelect = (locationData) => {
    console.log('🎯 MapPickerModal received location:', locationData);
    setSelectedLocation(locationData);
  };

  const handleConfirm = () => {
    if (selectedLocation && onLocationSelect) {
      onLocationSelect(selectedLocation);
    }
    onClose();
  };

  const handleClose = () => {
    setSelectedLocation(initialLocation);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div className="p-4 w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">{title}</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Instructions */}
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-2">
            <div className="text-blue-600 mt-0.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-sm text-blue-800">
              <div className="font-medium mb-1">Hướng dẫn:</div>
              <ul className="space-y-1 text-xs">
                <li>• Sử dụng nút "Vị trí hiện tại" để định vị vị trí trên bản đồ</li>
                <li>• Zoom in/out để tìm địa điểm chính xác</li>
                <li>• Xác nhận để chọn địa điểm</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Map Container - Fixed height */}
        <div className="mb-4">
          <MapPicker
            onLocationSelect={handleLocationSelect}
            initialLocation={initialLocation}
            height="350px"
            center={[10.8231, 106.6297]} // TP.HCM
            zoom={13}
          />
        </div>

        {/* Selected Location Info - Only show when location is selected */}
        {selectedLocation && (
          <div className="mb-4 max-h-32 overflow-y-auto">
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start gap-2">
                <div className="text-green-600 mt-0.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="font-medium text-green-800 mb-1">Địa điểm đã chọn:</div>
                  <div className="text-sm text-green-700">
                    <div className="font-medium">{selectedLocation.name}</div>
                    <div className="text-xs text-green-600 mt-1">{selectedLocation.fullAddress}</div>
                    {selectedLocation.lat && selectedLocation.lng && (
                      <div className="text-xs text-green-500 mt-1">
                        Tọa độ: {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons - Fixed at bottom */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 bg-white">
          <button
            onClick={handleClose}
            className="px-6 py-3 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedLocation}
            className={`px-6 py-3 text-sm font-medium rounded-lg transition-colors ${
              selectedLocation
                ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {selectedLocation ? '✓ Xác nhận địa điểm' : 'Chọn địa điểm trước'}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default MapPickerModal; 