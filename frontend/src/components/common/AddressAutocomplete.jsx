import React, { useState, useEffect, useRef } from 'react';

const AddressAutocomplete = ({ 
  value, 
  onChange, 
  placeholder = "Nhập địa chỉ...",
  className = ""
}) => {
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceTimer = useRef(null);
  const cache = useRef(new Map()); // Cache để lưu kết quả đã search
  const lastQuery = useRef(''); // Để tránh search lại query giống nhau

  // Search for address suggestions với caching và optimization
  const searchAddresses = async (query) => {
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }

    // Kiểm tra cache trước
    if (cache.current.has(query)) {
      const cachedResults = cache.current.get(query);
      setSuggestions(cachedResults);
      setShowSuggestions(true);
      return;
    }

    // Tránh search lại query giống nhau
    if (lastQuery.current === query) {
      return;
    }

    lastQuery.current = query;
    setIsLoading(true);
    
    try {
      // Sử dụng Photon API trước (nhanh hơn Nominatim)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

      const response = await fetch(
        `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&lang=vi&limit=5&osm_tag=place:city,place:town,place:village,place:suburb,highway:residential,highway:primary,highway:secondary`,
        {
          signal: controller.signal,
          headers: {
            'User-Agent': 'GroupScheduleApp/1.0'
          }
        }
      );
      
      clearTimeout(timeoutId);
      
      if (!response.ok) throw new Error('Photon API failed');
      
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        const formattedSuggestions = data.features.map(feature => ({
          id: feature.properties.osm_id || Math.random(),
          display_name: formatAddress(feature.properties),
          coordinates: {
            lat: feature.geometry.coordinates[1],
            lng: feature.geometry.coordinates[0]
          }
        }));
        
        // Lưu vào cache
        cache.current.set(query, formattedSuggestions);
        
        // Giới hạn cache size (100 entries)
        if (cache.current.size > 100) {
          const firstKey = cache.current.keys().next().value;
          cache.current.delete(firstKey);
        }
        
        setSuggestions(formattedSuggestions);
        setShowSuggestions(true);
      } else {
        // Fallback to Nominatim nếu Photon không có kết quả
        await searchWithNominatim(query);
      }
    } catch (error) {
      console.warn('Photon search failed, trying Nominatim:', error);
      // Fallback to Nominatim
      await searchWithNominatim(query);
    } finally {
      setIsLoading(false);
    }
  };

  // Fallback search với Nominatim
  const searchWithNominatim = async (query) => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout cho Nominatim

      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=vn&limit=5&addressdetails=1&accept-language=vi`,
        {
          signal: controller.signal,
          headers: {
            'User-Agent': 'GroupScheduleApp/1.0 (your-email@example.com)'
          }
        }
      );
      
      clearTimeout(timeoutId);
      
      if (!response.ok) throw new Error('Nominatim API failed');
      
      const data = await response.json();
      
      if (data && data.length > 0) {
        const formattedSuggestions = data.map(item => ({
          id: item.place_id || Math.random(),
          display_name: item.display_name,
          coordinates: {
            lat: parseFloat(item.lat),
            lng: parseFloat(item.lon)
          }
        }));
        
        // Lưu vào cache
        cache.current.set(query, formattedSuggestions);
        
        setSuggestions(formattedSuggestions);
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } catch (error) {
      console.error('All search methods failed:', error);
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Format address từ Photon API response - tối ưu hơn
  const formatAddress = (properties) => {
    const parts = [];
    
    // Ưu tiên các thông tin quan trọng nhất
    if (properties.housenumber && properties.street) {
      parts.push(`${properties.housenumber} ${properties.street}`);
    } else if (properties.street) {
      parts.push(properties.street);
    } else if (properties.name) {
      parts.push(properties.name);
    }
    
    // Thêm các thông tin địa lý
    if (properties.district && !parts.some(p => p.includes(properties.district))) {
      parts.push(properties.district);
    }
    if (properties.city && !parts.some(p => p.includes(properties.city))) {
      parts.push(properties.city);
    }
    if (properties.state && !parts.some(p => p.includes(properties.state))) {
      parts.push(properties.state);
    }
    
    return parts.length > 0 ? parts.join(', ') : (properties.name || 'Địa chỉ không xác định');
  };

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    onChange(newValue);
    
    // Clear suggestions nếu input trống
    if (newValue.length === 0) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    
    // Debounce search với thời gian dài hơn để giảm API calls
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    
    debounceTimer.current = setTimeout(() => {
      if (newValue.length >= 3) {
        searchAddresses(newValue);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 500); // Tăng từ 300ms lên 500ms
  };

  const handleSuggestionClick = (suggestion) => {
    onChange(suggestion.display_name);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={handleInputChange}
        placeholder={placeholder}
        className={className}
        onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        autoComplete="off"
      />
      
      {isLoading && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
          {suggestions.map((suggestion) => (
            <div
              key={suggestion.id}
              className="p-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              <div className="text-gray-800 text-sm line-clamp-2">
                {suggestion.display_name}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Hiển thị tip khi không có kết quả */}
      {showSuggestions && suggestions.length === 0 && !isLoading && value.length >= 3 && (
        <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg shadow-lg z-50 p-3">
          <div className="text-gray-500 text-sm text-center">
            Không tìm thấy địa chỉ. Thử nhập chi tiết hơn hoặc sử dụng bản đồ.
          </div>
        </div>
      )}
    </div>
  );
};

export default AddressAutocomplete;