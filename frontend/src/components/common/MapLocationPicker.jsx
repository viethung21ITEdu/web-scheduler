import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to handle map clicks and update marker position
const LocationMarker = ({ position, setPosition, onPositionChange }) => {
  const map = useMapEvents({
    click(e) {
      const newPos = [e.latlng.lat, e.latlng.lng];
      setPosition(newPos);
      onPositionChange(e.latlng.lat, e.latlng.lng);
    },
  });

  useEffect(() => {
    if (position) {
      map.flyTo(position, map.getZoom());
    }
  }, [position, map]);

  return position ? (
    <Marker 
      position={position}
      draggable={true}
      eventHandlers={{
        dragend: (e) => {
          const marker = e.target;
          const newPos = marker.getLatLng();
          const newPosition = [newPos.lat, newPos.lng];
          setPosition(newPosition);
          onPositionChange(newPos.lat, newPos.lng);
        }
      }}
    />
  ) : null;
};

// Component to update map view when position changes
const MapUpdater = ({ center }) => {
  const map = useMap();
  
  useEffect(() => {
    if (center) {
      map.setView(center, 15);
    }
  }, [center, map]);
  
  return null;
};

const MapLocationPicker = ({ 
  isOpen, 
  onClose, 
  onLocationSelect,
  initialLocation = null 
}) => {
  const [position, setPosition] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  const [mapCenter, setMapCenter] = useState([10.8231, 106.6297]); // Default: Ho Chi Minh City

  // Initialize position when modal opens
  useEffect(() => {
    if (!isOpen) return;

    const initializePosition = async () => {
      let initialPos = [10.8231, 106.6297]; // Default

      if (initialLocation && typeof initialLocation === 'string') {
        // Try to geocode the initial location
        try {
          const coords = await geocodeAddress(initialLocation);
          if (coords) {
            initialPos = [coords.lat, coords.lng];
          }
        } catch (error) {
          console.error('Error geocoding initial location:', error);
        }
      } else if (initialLocation && initialLocation.lat && initialLocation.lng) {
        initialPos = [initialLocation.lat, initialLocation.lng];
      } else {
        // Try to get user's current location
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              const userPos = [pos.coords.latitude, pos.coords.longitude];
              setPosition(userPos);
              setMapCenter(userPos);
              reverseGeocode(pos.coords.latitude, pos.coords.longitude);
            },
            (error) => {
              console.error('Error getting user location:', error);
              setPosition(initialPos);
              setMapCenter(initialPos);
              reverseGeocode(initialPos[0], initialPos[1]);
            }
          );
          return;
        }
      }

      setPosition(initialPos);
      setMapCenter(initialPos);
      reverseGeocode(initialPos[0], initialPos[1]);
    };

    initializePosition();
  }, [isOpen, initialLocation]);

  // Geocode address to coordinates
  const geocodeAddress = async (address) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&countrycodes=vn&limit=1&addressdetails=1&accept-language=vi`
      );
      
      const data = await response.json();
      
      if (data && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon)
        };
      }
      return null;
    } catch (error) {
      console.error('Error geocoding address:', error);
      return null;
    }
  };

  // Reverse geocode coordinates to address
  const reverseGeocode = async (lat, lng) => {
    setIsLoadingAddress(true);
    
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&accept-language=vi`
      );
      
      const data = await response.json();
      
      if (data && data.display_name) {
        setSelectedAddress(data.display_name);
      } else {
        setSelectedAddress(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
      }
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      setSelectedAddress(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
    } finally {
      setIsLoadingAddress(false);
    }
  };

  const handlePositionChange = (lat, lng) => {
    reverseGeocode(lat, lng);
  };

  const handleConfirm = () => {
    if (position && selectedAddress) {
      onLocationSelect({
        address: selectedAddress,
        coordinates: {
          lat: position[0],
          lng: position[1]
        }
      });
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-11/12 max-w-4xl h-5/6 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">Chọn vị trí trên bản đồ</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            ×
          </button>
        </div>

        {/* Map container */}
        <div className="flex-1 relative">
          {position && (
            <MapContainer
              center={mapCenter}
              zoom={15}
              style={{ height: '100%', width: '100%' }}
              zoomControl={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <LocationMarker 
                position={position} 
                setPosition={setPosition}
                onPositionChange={handlePositionChange}
              />
              <MapUpdater center={mapCenter} />
            </MapContainer>
          )}
        </div>

        {/* Address display and controls */}
        <div className="p-4 border-t bg-gray-50">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Địa chỉ đã chọn:
            </label>
            <div className="flex items-center">
              {isLoadingAddress && (
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2"></div>
              )}
              <span className="text-gray-800">{selectedAddress || 'Đang tải...'}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Nhấp vào bản đồ hoặc kéo marker để chọn vị trí chính xác
            </p>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirm}
                disabled={!selectedAddress}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapLocationPicker;