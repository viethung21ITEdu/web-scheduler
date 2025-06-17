import React, { useState, useEffect, useRef } from 'react';

const MapPicker = ({ 
  onLocationSelect, 
  initialLocation = null,
  height = "400px",
  center = [10.8231, 106.6297], // TP.HCM
  zoom = 13
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(initialLocation);
  const mapRef = useRef(null);
  const leafletRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    loadLeaflet();
  }, []);

  const loadLeaflet = async () => {
    try {
      // Load Leaflet CSS
      if (!document.querySelector('link[href*="leaflet"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      // Load Leaflet JS
      if (!window.L) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
      }

      initializeMap();
    } catch (err) {
      console.error('Error loading Leaflet:', err);
      setError('Không thể tải bản đồ');
      setIsLoading(false);
    }
  };

  const initializeMap = () => {
    if (!window.L || !mapRef.current) return;

    try {
      // Initialize map
      const map = window.L.map(mapRef.current).setView(center, zoom);
      leafletRef.current = map;

      // Add tile layer (OpenStreetMap)
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);

      // Add initial marker if provided
      if (initialLocation) {
        addMarker(initialLocation.lat, initialLocation.lng, initialLocation.name);
      }

      // Add click event
      map.on('click', handleMapClick);

      setIsLoading(false);
    } catch (err) {
      console.error('Error initializing map:', err);
      setError('Không thể khởi tạo bản đồ');
      setIsLoading(false);
    }
  };

  const handleMapClick = async (e) => {
    const lat = e.latlng.lat;
    const lng = e.latlng.lng;

    console.log('🗺️ Map clicked at:', lat, lng);

    // Immediately add marker for visual feedback
    addMarker(lat, lng, 'Đang tải thông tin...');

    try {
      // Reverse geocoding to get address
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'EventManager/1.0 (contact@example.com)'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      
      const locationData = {
        name: data.display_name?.split(',')[0] || 'Địa điểm đã chọn',
        fullAddress: data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
        lat,
        lng,
        type: data.type,
        category: data.class
      };

      console.log('📍 Location data:', locationData);

      addMarker(lat, lng, locationData.name);
      setSelectedLocation(locationData);
      
      if (onLocationSelect) {
        console.log('🎯 Calling onLocationSelect with:', locationData);
        onLocationSelect(locationData);
      }
    } catch (error) {
      console.error('Error getting location details:', error);
      
      // Fallback to coordinates
      const locationData = {
        name: 'Địa điểm đã chọn',
        fullAddress: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
        lat,
        lng
      };

      console.log('📍 Fallback location data:', locationData);

      addMarker(lat, lng, locationData.name);
      setSelectedLocation(locationData);
      
      if (onLocationSelect) {
        console.log('🎯 Calling onLocationSelect (fallback) with:', locationData);
        onLocationSelect(locationData);
      }
    }
  };

  const addMarker = (lat, lng, title = '') => {
    if (!leafletRef.current || !window.L) return;

    // Remove existing marker
    if (markerRef.current) {
      leafletRef.current.removeLayer(markerRef.current);
    }

    // Add new marker
    const marker = window.L.marker([lat, lng]).addTo(leafletRef.current);
    if (title) {
      marker.bindPopup(title, {
        offset: [0, -10],
        closeButton: true,
        autoClose: false,
        closeOnClick: false
      }).openPopup();
    }
    
    markerRef.current = marker;
    
    // Center map on marker
    leafletRef.current.setView([lat, lng], leafletRef.current.getZoom());
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Trình duyệt không hỗ trợ định vị');
      return;
    }

    setIsLoading(true);
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        
        if (leafletRef.current) {
          leafletRef.current.setView([lat, lng], 15);
          addMarker(lat, lng, 'Vị trí hiện tại');
        }
        
        setIsLoading(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        alert('Không thể lấy vị trí hiện tại');
        setIsLoading(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  useEffect(() => {
    return () => {
      // Cleanup
      if (leafletRef.current) {
        leafletRef.current.remove();
      }
    };
  }, []);

  if (error) {
    return (
      <div className="flex items-center justify-center bg-gray-100 rounded-lg" style={{ height }}>
        <div className="text-center text-gray-600">
          <div className="text-lg mb-2">⚠️</div>
          <div>{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Controls */}
      <div className="absolute top-2 right-2 z-[1000] flex flex-col gap-2">
        <button
          onClick={getCurrentLocation}
          className="bg-white hover:bg-gray-50 border border-gray-300 rounded-md p-2 shadow-sm"
          title="Vị trí hiện tại"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>

      {/* Map container */}
      <div 
        ref={mapRef} 
        style={{ height }} 
        className="w-full rounded-lg overflow-hidden border border-gray-300"
      />

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
            <div className="text-sm text-gray-600">Đang tải bản đồ...</div>
          </div>
        </div>
      )}


    </div>
  );
};

export default MapPicker; 