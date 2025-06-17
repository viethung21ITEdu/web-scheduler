import locationPreferenceService from './locationPreferenceService';

// Danh sách các loại địa điểm và từ khóa tương ứng
const PLACE_CATEGORIES = {
  'Quán cà phê': [
    'cafe', 'coffee shop', 'cà phê', 'coffee', 'café', 'six', 'giangnam', 'keybox', 'vối',
    'Highlands Coffee', 'Starbucks', 'Trung Nguyên', 'Phúc Long',
    'Cộng Cà phê', 'The Coffee House', 'Milano Coffee',
    'quán cà phê', 'quán coffee', 'cà phê sữa đá'
  ],
  'Quán ăn': [
    'quán ăn', 'ăn', 'ăn uống', 'nhà hàng', 'căn tin', 'căn tin UIT', 'căn tin đại học',
    'quán cơm', 'quán phở', 'quán bún', 'quán bánh mì', 'quán nem', 'bún đậu', 'minh mẫn',
    'bún bò Huế', 'cơm tấm', 'bánh xèo', 'lẩu', 'nướng', 'bbq',
    'KFC', 'McDonald', 'Lotteria', 'Jollibee', 'Gogi House',
    'Phở 2000', 'Món Huế', 'Bún chả', 'Bánh cuốn', 'restaurant'
  ],
  'Rạp phim': ['CineStar', 'Galaxy Cinema', 'CGV', 'Lotte Cinema', 'phim'],
  'Siêu thị': ['siêu thị', 'tạp hoá', 'bách hoá xanh'],
  'Công viên': ['công viên', 'công viên thành phố', 'khu vui chơi', 'sân chơi', 'phố đi bộ'],
  'Trung tâm thương mại': ['mall', 'shopping center', 'Vincom', 'AEON'],
  'Karaoke': ['karaoke', 'ktv', 'hát'],
  'Phòng gym': ['gym', 'fitness', 'thể dục'],
  'Thư viện': ['library', 'thư viện'],
  'Bảo tàng': ['museum', 'bảo tàng']
};

class SuggestionService {
  // Cache để lưu kết quả tìm kiếm
  static searchCache = new Map();
  static cacheTimeout = 30 * 60 * 1000; // 30 phút
  
  // Cache cho suggestions dựa trên fingerprint của nhóm
  static suggestionsCache = new Map();
  static suggestionsCacheTimeout = 60 * 60 * 1000; // 1 giờ

  // Tạo fingerprint từ dữ liệu nhóm để cache suggestions
  static createGroupFingerprint(groupLocationData) {
    // Tạo string duy nhất từ tất cả location và preferences
    const dataString = groupLocationData
      .map(member => {
        const location = member.location || '';
        const preferences = JSON.stringify(member.preferences || {});
        const otherPreference = member.otherPreference || '';
        return `${member.id || member.username}:${location}:${preferences}:${otherPreference}`;
      })
      .sort() // Sort để đảm bảo thứ tự không ảnh hưởng
      .join('|');
    
    // Tạo hash đơn giản từ string
    let hash = 0;
    for (let i = 0; i < dataString.length; i++) {
      const char = dataString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return Math.abs(hash).toString(16);
  }

  // Tính toán thời gian dự kiến cho quá trình tạo suggestions
  static calculateEstimatedTime(locationCount, preferenceCount) {
    // Base time (giây)
    const baseTime = 5;
    
    // Thời gian cho geocoding các vị trí (1s/vị trí + overhead)
    const geocodingTime = locationCount * 1.2 + 3;
    
    // Thời gian cho tìm kiếm địa điểm (3s/sở thích + API delays)
    const searchTime = preferenceCount * 3.5 + 2;
    
    // Thời gian xử lý cuối
    const processingTime = 3;
    
    // Đảm bảo tất cả thời gian đều là số nguyên
    const total = Math.ceil(baseTime + geocodingTime + searchTime + processingTime);
    
    return {
      total: Math.floor(total), // Chỉ lấy phần nguyên
      breakdown: {
        base: Math.floor(baseTime),
        geocoding: Math.floor(geocodingTime),
        search: Math.floor(searchTime),
        processing: Math.floor(processingTime)
      }
    };
  }

  // Lấy danh sách từ khóa tìm kiếm thông minh cho mỗi category
  static getSearchKeywords(category, keywords) {
    if (category === 'Quán cà phê') {
      return ['cafe', 'coffee shop', 'Highlands Coffee', 'Starbucks', 'cà phê'];
    } else if (category === 'Quán ăn') {
      return ['quán ăn', 'nhà hàng', 'quán cơm', 'phở', 'restaurant'];
    } else if (category === 'Công viên') {
      return ['công viên', 'công viên thành phố', 'khu vui chơi', 'sân chơi'];
    } else {
      // Lấy tối đa 3 từ khóa đầu tiên cho các category khác
      return keywords.slice(0, 3);
    }
  }

  // Tính toán vị trí trung tâm của nhóm
  static async calculateGroupCenter(groupLocationData) {
    const validLocations = groupLocationData.filter(member => 
      member.location && member.location.trim()
    );

    if (validLocations.length === 0) {
      // Trả về tọa độ mặc định (ví dụ: trung tâm TP.HCM)
      return {
        lat: 10.8231,
        lng: 106.6297,
        address: 'TP. Hồ Chí Minh'
      };
    }

    try {
      // Geocode tất cả địa chỉ để lấy tọa độ
      const coordinates = [];
      for (const member of validLocations) {
        try {
          const coords = await this.geocodeAddress(member.location);
          if (coords) {
            coordinates.push(coords);
          }
        } catch (error) {
          console.warn(`Không thể geocode địa chỉ: ${member.location}`);
        }
      }

      if (coordinates.length === 0) {
        return {
          lat: 10.8231,
          lng: 106.6297,
          address: 'TP. Hồ Chí Minh'
        };
      }

      // Tính trung bình tọa độ
      const centerLat = coordinates.reduce((sum, coord) => sum + coord.lat, 0) / coordinates.length;
      const centerLng = coordinates.reduce((sum, coord) => sum + coord.lng, 0) / coordinates.length;

      // Reverse geocode để lấy địa chỉ gần đúng
      const centerAddress = await this.reverseGeocode(centerLat, centerLng);

      return {
        lat: centerLat,
        lng: centerLng,
        address: centerAddress || `${centerLat.toFixed(4)}, ${centerLng.toFixed(4)}`
      };
    } catch (error) {
      console.error('Lỗi khi tính toán vị trí trung tâm:', error);
      return {
        lat: 10.8231,
        lng: 106.6297,
        address: 'TP. Hồ Chí Minh'
      };
    }
  }

  // Mapping từ preference ID sang category name
  static PREFERENCE_MAPPING = {
    'cafe': 'Quán cà phê',
    'restaurant': 'Quán ăn', 
    'park': 'Công viên',
    'cinema': 'Rạp phim',
    'mall': 'Trung tâm thương mại',
    'library': 'Thư viện',
    'karaoke': 'Karaoke',
    'gym': 'Phòng gym',
    'supermarket': 'Siêu thị',
    'museum': 'Bảo tàng'
  };

  // Phân tích sở thích chung của nhóm
  static analyzeGroupPreferences(groupLocationData) {
    const allPreferences = {};
    const memberCount = groupLocationData.length;

    console.log('🔍 Bắt đầu phân tích preferences cho', memberCount, 'thành viên');

    // Đếm số lượng thành viên thích mỗi loại địa điểm
    groupLocationData.forEach((member, index) => {
      console.log(`👤 Thành viên ${index + 1} (${member.full_name || member.username}):`, {
        hasPreferences: !!member.preferences,
        preferencesType: typeof member.preferences,
        preferences: member.preferences
      });

      if (member.preferences && typeof member.preferences === 'object') {
        Object.keys(member.preferences).forEach(prefId => {
          console.log(`  - Checking preference ${prefId}: ${member.preferences[prefId]}`);
          if (member.preferences[prefId]) {
            // Map từ preference ID sang category name
            const categoryName = this.PREFERENCE_MAPPING[prefId] || prefId;
            console.log(`  ✅ Mapped ${prefId} → ${categoryName}`);
            allPreferences[categoryName] = (allPreferences[categoryName] || 0) + 1;
          }
        });
      } else {
        console.log(`  ❌ Không có preferences hợp lệ`);
      }
    });

    console.log('📊 Tổng kết preferences:', allPreferences);

    // Sắp xếp theo độ phổ biến
    const sortedPrefs = Object.entries(allPreferences)
      .sort(([,a], [,b]) => b - a)
      .map(([category, count]) => ({
        category,
        count,
        percentage: Math.round((count / memberCount) * 100)
      }));

    return sortedPrefs;
  }

  // Geocoding địa chỉ thành tọa độ
  static async geocodeAddress(address) {
    try {
      const cacheKey = `geocode_${address}`;
      
      // Check cache
      if (this.searchCache.has(cacheKey)) {
        const cached = this.searchCache.get(cacheKey);
        if (Date.now() - cached.timestamp < this.cacheTimeout) {
          return cached.data;
        }
        this.searchCache.delete(cacheKey);
      }

      // Thêm delay để tránh rate limit
      await new Promise(resolve => setTimeout(resolve, 1000));

      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`
      );
      
      if (!response.ok) throw new Error('Geocoding failed');
      
      const data = await response.json();
      
      if (data && data.length > 0) {
        const result = {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon)
        };
        
        // Cache kết quả
        this.searchCache.set(cacheKey, {
          data: result,
          timestamp: Date.now()
        });
        
        return result;
      }
      
      return null;
    } catch (error) {
      console.error('Lỗi geocoding:', error);
      return null;
    }
  }

  // Reverse geocoding tọa độ thành địa chỉ
  static async reverseGeocode(lat, lng) {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      
      if (!response.ok) throw new Error('Reverse geocoding failed');
      
      const data = await response.json();
      return data.display_name || null;
    } catch (error) {
      console.error('Lỗi reverse geocoding:', error);
      return null;
    }
  }

  // Tìm kiếm địa điểm xung quanh vị trí trung tâm
  static async searchPlacesNearby(center, category, radius = 5000) {
    try {
      const cacheKey = `places_${center.lat.toFixed(4)}_${center.lng.toFixed(4)}_${category}`;
      
      // Check cache
      if (this.searchCache.has(cacheKey)) {
        const cached = this.searchCache.get(cacheKey);
        if (Date.now() - cached.timestamp < this.cacheTimeout) {
          console.log(`📦 Cache hit cho ${category}`);
          return cached.data;
        }
        this.searchCache.delete(cacheKey);
      }

      // Sử dụng Nominatim search với timeout
      const keywords = PLACE_CATEGORIES[category] || [category];
      
      console.log(`🌐 API call cho ${category} tại ${center.lat.toFixed(4)}, ${center.lng.toFixed(4)}`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout để tìm nhiều hơn
      
              try {
          // Tạo search query thông minh dựa trên địa chỉ
          let searchArea = '';
          if (center.address) {
            if (center.address.includes('Dĩ An') || center.address.includes('Bình Dương')) {
              searchArea = 'Binh Duong Vietnam';
            } else if (center.address.includes('Thủ Đức')) {
              searchArea = 'Thu Duc Ho Chi Minh City Vietnam';
            } else if (center.address.includes('TP.HCM') || center.address.includes('Ho Chi Minh')) {
              searchArea = 'Ho Chi Minh City Vietnam';
            } else {
              // Lấy 2 phần cuối của địa chỉ (thường là quận/huyện và tỉnh/thành)
              const addressParts = center.address.split(',');
              if (addressParts.length >= 3) {
                searchArea = addressParts.slice(-3).join(',').trim();
              } else {
                searchArea = center.address;
              }
            }
          } else {
            searchArea = `${center.lat.toFixed(4)},${center.lng.toFixed(4)}`;
          }
          
          // Tìm kiếm với nhiều từ khóa khác nhau cho kết quả tốt hơn
          let allPlaces = [];
          const searchKeywords = this.getSearchKeywords(category, keywords);
          
          for (const searchQuery of searchKeywords) {
            const searchUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery + ' ' + searchArea)}&limit=10&addressdetails=1`;
            console.log(`🔗 Search URL: ${searchUrl} (Query: ${searchQuery}, Area: ${searchArea})`);
            
            const response = await fetch(searchUrl, { 
                signal: controller.signal,
                headers: {
                  'User-Agent': 'GroupLocationApp/1.0'
                }
              }
            );
            
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const data = await response.json();
            console.log(`📊 Raw API response for "${searchQuery}":`, data);
            
            // Thêm vào danh sách tổng
            allPlaces.push(...data.filter(place => place.display_name && place.lat && place.lon));
            
            // Delay giữa các request để tránh rate limit
            await new Promise(resolve => setTimeout(resolve, 500));
          }
          
          clearTimeout(timeoutId);
        
                  // Loại bỏ duplicate và xử lý dữ liệu
          const uniquePlaces = new Map();
          allPlaces.forEach(place => {
            // Sử dụng place_id làm key để loại bỏ duplicate
            if (!uniquePlaces.has(place.place_id)) {
              uniquePlaces.set(place.place_id, place);
            }
          });

          let places = Array.from(uniquePlaces.values())
            .map(place => {
              const distance = this.calculateDistance(center.lat, center.lng, parseFloat(place.lat), parseFloat(place.lon));
              return {
                id: place.place_id,
                name: this.extractPlaceName(place.display_name),
                category: category,
                address: place.display_name,
                lat: parseFloat(place.lat),
                lng: parseFloat(place.lon),
                distance
              };
            })
            .filter(place => {
              // Lọc theo khoảng cách
              if (place.distance > 12) return false;
              
              // Lọc đặc biệt để loại bỏ các kết quả không mong muốn
              const nameAndAddress = (place.name + ' ' + place.address).toLowerCase();
              
              if (category === 'Công viên') {
                // Loại bỏ các từ khóa không mong muốn cho công viên
                const unwantedKeywords = [
                  'university', 'college', 'school', 'đại học', 'trường', 'học viện',
                  'parking', 'bãi đỗ', 'chỗ đỗ xe', 'khu đỗ xe',
                  'industrial', 'khu công nghiệp', 'nhà máy',
                  'business park', 'khu kinh doanh',
                  'apartment', 'chung cư', 'building', 'tòa nhà'
                ];
                
                const hasUnwantedKeyword = unwantedKeywords.some(keyword => 
                  nameAndAddress.includes(keyword.toLowerCase())
                );
                
                if (hasUnwantedKeyword) {
                  console.log(`🚫 Filtered out "${place.name}" - contains unwanted keyword for park`);
                  return false;
                }
              }
              
              if (category === 'Quán ăn') {
                // Loại bỏ các công ty/nhà máy thực phẩm cho quán ăn
                const unwantedKeywords = [
                  'company', 'corporation', 'corp', 'ltd', 'công ty', 'cty',
                  'factory', 'plant', 'nhà máy', 'xí nghiệp', 'khu công nghiệp',
                  'processing', 'manufacturing', 'distribution', 'chế biến', 'sản xuất',
                  'industrial', 'industry', 'công nghiệp', 
                  'warehouse', 'kho', 'depot',
                  'wholesale', 'bán sỉ', 'phân phối',
                  'supplier', 'supply', 'cung cấp',
                  'import', 'export', 'xuất nhập khẩu',
                  'food processing', 'beverage company', 'thực phẩm chế biến'
                ];
                
                const hasUnwantedKeyword = unwantedKeywords.some(keyword => 
                  nameAndAddress.includes(keyword.toLowerCase())
                );
                
                if (hasUnwantedKeyword) {
                  console.log(`🚫 Filtered out "${place.name}" - contains unwanted keyword for restaurant`);
                  return false;
                }
              }
              
              return true;
            })
            .sort((a, b) => a.distance - b.distance) // Sắp xếp theo khoảng cách tăng dần
            .slice(0, 5); // Tăng lên 5 địa điểm cho mỗi loại

          console.log(`✅ Tìm được ${places.length} địa điểm cho ${category}`);
          
          // Không sử dụng fallback nữa để test với dữ liệu thật
        
        // Cache kết quả
        this.searchCache.set(cacheKey, {
          data: places,
          timestamp: Date.now()
        });
        
        // Thêm delay nhỏ để tránh rate limit cho lần gọi tiếp theo
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        return places;
        
      } catch (fetchError) {
        clearTimeout(timeoutId);
        if (fetchError.name === 'AbortError') {
          console.warn(`⏰ Timeout tìm kiếm ${category}`);
        } else {
          console.warn(`⚠️ Lỗi API cho ${category}:`, fetchError.message);
        }
        return [];
      }
      
    } catch (error) {
      console.error(`❌ Lỗi tìm kiếm ${category}:`, error);
      return [];
    }
  }



  // Extract clean place name from display_name
  static extractPlaceName(displayName) {
    const parts = displayName.split(',');
    let name = parts[0].trim();
    
    // Loại bỏ số nhà nếu có
    name = name.replace(/^\d+\s*/, '');
    
    // Giới hạn độ dài tên
    if (name.length > 50) {
      name = name.substring(0, 50) + '...';
    }
    
    return name || 'Địa điểm không tên';
  }

  // Tính khoảng cách giữa 2 điểm (Haversine formula)
  static calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Bán kính Trái Đất (km)
    const dLat = this.toRad(lat2 - lat1);
    const dLng = this.toRad(lng2 - lng1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  static toRad(value) {
    return value * Math.PI / 180;
  }

  // Tính tổng khoảng cách từ địa điểm đến tất cả thành viên
  static calculateTotalDistanceToMembers(place, memberLocations) {
    let totalDistance = 0;
    const distances = [];
    
    memberLocations.forEach((memberLoc, index) => {
      const distance = this.calculateDistance(place.lat, place.lng, memberLoc.lat, memberLoc.lng);
      distances.push(distance);
      totalDistance += distance;
    });
    
    const avgDistance = totalDistance / memberLocations.length;
    console.log(`  📏 Khoảng cách đến từng thành viên: [${distances.map(d => d.toFixed(1)).join('km, ')}km]`);
    console.log(`  📊 Tổng: ${totalDistance.toFixed(1)}km, TB: ${avgDistance.toFixed(1)}km`);
    
    return { totalDistance, avgDistance, distances };
  }

  // Tính điểm phù hợp cho từng địa điểm (tối ưu tổng khoảng cách)
  static calculateMatchRate(place, groupPreferences, memberLocations, memberCount) {
    console.log(`\n🎯 Tính toán matchRate cho ${place.name} (${place.category})`);
    console.log(`  📍 Địa điểm: ${place.address}`);
    console.log(`  👥 Số thành viên: ${memberCount}`);
    console.log(`  📍 Số vị trí thành viên: ${memberLocations.length}`);
    console.log(`  ❤️ Sở thích nhóm:`, groupPreferences.map(p => `${p.category}: ${p.count}/${memberCount}`));
    
    let score = 0;
    const maxScore = 100;

    // Điểm dựa trên sở thích (40% tổng điểm) - điều chỉnh cho nhiều sở thích
    const categoryPref = groupPreferences.find(pref => pref.category === place.category);
    if (categoryPref) {
      // Tính điểm dựa trên số người thích, không phải percentage
      const memberLikeScore = (categoryPref.count / memberCount) * 30; // Tối đa 30 điểm
      
      // Bonus nếu là sở thích được chọn (chứng tỏ nhóm quan tâm)
      const selectionBonus = 10; // +10 điểm cho việc được chọn
      
      const preferenceScore = memberLikeScore + selectionBonus;
      score += preferenceScore;
      console.log(`  📊 Sở thích: ${categoryPref.count}/${memberCount} thành viên thích → ${preferenceScore.toFixed(1)} điểm (${memberLikeScore.toFixed(1)} + ${selectionBonus} bonus)`);
    } else {
      console.log(`  📊 Sở thích: Không có ai thích ${place.category} → 0 điểm`);
    }

    // Điểm dựa trên tối ưu tổng khoảng cách (50% tổng điểm)
    let distanceInfo = null;
    if (memberLocations.length === 0) {
      console.log(`  📍 Không có vị trí thành viên nào → 0 điểm khoảng cách`);
      // Nếu không có vị trí nào, cho điểm trung bình
      const distanceScore = 25; // 50% của điểm tối đa
      score += distanceScore;
      console.log(`  📍 Default distance score: ${distanceScore} điểm`);
    } else {
      distanceInfo = this.calculateTotalDistanceToMembers(place, memberLocations);
      const avgDistance = distanceInfo.avgDistance;
      
      console.log(`  📍 Chi tiết khoảng cách:`);
      distanceInfo.distances.forEach((dist, index) => {
        const memberName = memberLocations[index]?.name || `Thành viên ${index + 1}`;
        console.log(`    - ${memberName}: ${dist.toFixed(1)}km`);
      });
      
      let distanceScore;
      if (avgDistance <= 2) {
        // Rất gần trung bình: điểm tối đa
        distanceScore = 50;
      } else if (avgDistance <= 8) {
        // Gần trung bình: điểm cao, giảm tuyến tính từ 50 xuống 0 trong khoảng 2-8km
        distanceScore = 50 * (8 - avgDistance) / 6; // 2km được 50, 8km được 0
      } else if (avgDistance <= 15) {
        // Xa trung bình: điểm thấp
        distanceScore = Math.max(0, (15 - avgDistance) / 7) * 10; // Tối đa 10 điểm
      } else {
        // Rất xa: gần như 0 điểm
        distanceScore = 1;
      }
      
      score += distanceScore;
      console.log(`  📍 Khoảng cách TB: ${avgDistance.toFixed(1)}km → ${distanceScore.toFixed(1)} điểm`);
    }

    // Bonus cho địa điểm có khoảng cách đồng đều (không ai quá xa) - chỉ khi có dữ liệu
    if (distanceInfo && distanceInfo.distances.length > 0) {
      const maxIndividualDistance = Math.max(...distanceInfo.distances);
      const minIndividualDistance = Math.min(...distanceInfo.distances);
      const distanceRange = maxIndividualDistance - minIndividualDistance;
      
      let fairnessScore = 0;
      if (distanceRange <= 3) {
        fairnessScore = 5; // Rất công bằng
      } else if (distanceRange <= 6) {
        fairnessScore = 3; // Khá công bằng
      } else if (distanceRange <= 10) {
        fairnessScore = 1; // Ít công bằng
      }
      
      score += fairnessScore;
      console.log(`  ⚖️ Độ công bằng: ${distanceRange.toFixed(1)}km range → ${fairnessScore.toFixed(1)} điểm`);
    } else {
      console.log(`  ⚖️ Không có dữ liệu khoảng cách để tính độ công bằng → 0 điểm`);
    }

    // Điểm dựa trên tên địa điểm (độ dài hợp lý, không chứa số)
    let nameQualityScore = 0;
    const placeName = place.name.toLowerCase();
    
    // Bonus cho tên không chứa quá nhiều số (địa chỉ)
    const numberCount = (placeName.match(/\d/g) || []).length;
    if (numberCount === 0) {
      nameQualityScore += 2; // Tên sạch, không có số
    } else if (numberCount <= 2) {
      nameQualityScore += 1; // Ít số
    }
    
    // Bonus cho tên có độ dài hợp lý (không quá ngắn hoặc quá dài)
    if (place.name.length >= 5 && place.name.length <= 30) {
      nameQualityScore += 1;
    }
    
    // Penalty cho địa chỉ thô (chứa nhiều dấu phẩy)
    const commaCount = (place.address.match(/,/g) || []).length;
    if (commaCount <= 3) {
      nameQualityScore += 1; // Địa chỉ gọn gàng
    }
    
    score += nameQualityScore;
    console.log(`  📝 Chất lượng tên: ${nameQualityScore.toFixed(1)} điểm (số: ${numberCount}, độ dài: ${place.name.length}, phẩy: ${commaCount})`);

    const finalScore = Math.min(maxScore, Math.round(score));
    console.log(`  ✅ Tổng điểm: ${finalScore}% cho ${place.name}`);

    return finalScore;
  }

  // Tạo lý do phù hợp
  static generateMatchReasons(place, groupPreferences, memberCount, memberLocations = null) {
    const reasons = [];
    
    const categoryPref = groupPreferences.find(pref => pref.category === place.category);
    if (categoryPref) {
      reasons.push(`${place.category} (${categoryPref.count}/${memberCount} thành viên thích)`);
    }

    // Nếu có thông tin vị trí thành viên, tính toán khoảng cách tối ưu
    if (memberLocations && memberLocations.length > 0) {
      const distanceInfo = this.calculateTotalDistanceToMembers(place, memberLocations);
      const avgDistance = distanceInfo.avgDistance;
      const maxDistance = Math.max(...distanceInfo.distances);
      
      if (avgDistance <= 3) {
        reasons.push('Khoảng cách trung bình rất gần cho tất cả thành viên');
      } else if (avgDistance <= 6) {
        reasons.push('Khoảng cách trung bình hợp lý cho nhóm');
      } else if (maxDistance <= 10) {
        reasons.push('Không có thành viên nào quá xa');
      }
      
      // Kiểm tra độ công bằng
      const distanceRange = maxDistance - Math.min(...distanceInfo.distances);
      if (distanceRange <= 3) {
        reasons.push('Khoảng cách đồng đều cho tất cả thành viên');
      }
    } else {
      // Fallback cho trường hợp cũ
      if (place.distance < 2) {
        reasons.push('Khoảng cách gần nhất');
      } else if (place.distance < 5) {
        reasons.push('Khoảng cách hợp lý');
      }
    }

    if (reasons.length === 0) {
      reasons.push('Địa điểm phù hợp với nhóm');
    }

    return reasons;
  }



  // Main function: Tạo suggestions cho nhóm
  static async generateSuggestions(groupId, progressCallback = null) {
    try {
      console.log('🔍 Bắt đầu tạo suggestions cho groupId:', groupId);
      
      // 1. Lấy dữ liệu vị trí và sở thích của tất cả thành viên
      const response = await locationPreferenceService.getGroupLocationPreferences(groupId);
      console.log('📍 Raw response:', JSON.stringify(response, null, 2));
      
      // Extract data array từ response
      const groupLocationData = response.success ? response.data : [];
      console.log('📍 Extracted data array:', JSON.stringify(groupLocationData, null, 2));
      
      if (!groupLocationData || groupLocationData.length === 0) {
        console.log('⚠️ Không có dữ liệu nhóm');
        return [];
      }

      // 2. Kiểm tra cache dựa trên fingerprint của dữ liệu nhóm
      const groupFingerprint = this.createGroupFingerprint(groupLocationData);
      const cacheKey = `suggestions_${groupId}_${groupFingerprint}`;
      
      console.log('🔑 Group fingerprint:', groupFingerprint);
      
      if (this.suggestionsCache.has(cacheKey)) {
        const cached = this.suggestionsCache.get(cacheKey);
        if (Date.now() - cached.timestamp < this.suggestionsCacheTimeout) {
          console.log('📦 Cache hit! Sử dụng suggestions đã cache');
          console.log('💡 Không có thành viên nào thay đổi vị trí hoặc sở thích');
          if (progressCallback) {
            progressCallback({
              stage: 'completed',
              progress: 100,
              message: 'Sử dụng đề xuất đã cache',
              estimatedTime: 0
            });
          }
          return cached.data;
        }
        // Cache hết hạn
        this.suggestionsCache.delete(cacheKey);
        console.log('🕐 Cache đã hết hạn, tạo suggestions mới');
      } else {
        console.log('🆕 Không có cache hoặc dữ liệu đã thay đổi, tạo suggestions mới');
      }

      // 3. Tính toán thời gian dự kiến và báo cáo progress
      const membersWithLocation = groupLocationData.filter(m => m.location && m.location.trim()).length;
      const uniquePreferences = this.analyzeGroupPreferences(groupLocationData);
      
      // Tính thời gian dự kiến (giây)
      const estimatedTimeCalc = this.calculateEstimatedTime(membersWithLocation, uniquePreferences.length);
      console.log(`⏰ Ước tính thời gian: ${estimatedTimeCalc.total}s cho ${membersWithLocation} vị trí và ${uniquePreferences.length} sở thích`);
      
      if (progressCallback) {
        progressCallback({
          stage: 'analyzing',
          progress: 10,
          message: `Phân tích ${groupLocationData.length} thành viên...`,
          estimatedTime: estimatedTimeCalc.total,
          details: {
            members: groupLocationData.length,
            locationsToProcess: membersWithLocation,
            preferencesToSearch: uniquePreferences.length
          }
        });
      }

      console.log('❤️ Sở thích nhóm sau phân tích:', JSON.stringify(uniquePreferences, null, 2));
      
      // Debug chi tiết từng thành viên
      console.log('📋 Chi tiết đầy đủ của từng thành viên:');
      groupLocationData.forEach((member, index) => {
        console.log(`  👤 Thành viên ${index + 1}:`, {
          user_id: member.user_id,
          username: member.username,
          full_name: member.full_name,
          location: member.location,
          location_length: member.location ? member.location.length : 0,
          preferences: member.preferences,
          preferences_keys: member.preferences ? Object.keys(member.preferences) : [],
          preferences_values: member.preferences ? Object.values(member.preferences) : [],
          otherPreference: member.otherPreference,
          updated_at: member.updated_at
        });
      });

      if (uniquePreferences.length === 0) {
        console.log('⚠️ Không có sở thích nào được chọn');
        return [];
      }

      // 4. Tính toán vị trí trung tâm nhóm (để tìm kiếm)
      if (progressCallback) {
        progressCallback({
          stage: 'geocoding',
          progress: 20,
          message: `Đang xử lý vị trí của ${membersWithLocation}/${groupLocationData.length} thành viên...`,
          estimatedTime: Math.floor(estimatedTimeCalc.total - 5) // trừ đi thời gian đã qua, chỉ lấy phần nguyên
        });
      }
      
      console.log('📍 Đang tính toán vị trí trung tâm...');
      const groupCenter = await this.calculateGroupCenter(groupLocationData);
      console.log('🎯 Vị trí trung tâm:', JSON.stringify(groupCenter, null, 2));

      // 5. Thu thập vị trí tọa độ của tất cả thành viên (để tính tổng khoảng cách)
      if (progressCallback) {
        progressCallback({
          stage: 'member_geocoding',
          progress: 40,
          message: `Đang geocoding vị trí ${membersWithLocation}/${groupLocationData.length} thành viên...`,
          estimatedTime: Math.floor(estimatedTimeCalc.total - 15)
        });
      }
      
      console.log('📍 Đang thu thập tọa độ tất cả thành viên...');
      const memberLocations = [];
      for (const member of groupLocationData) {
        if (member.location && member.location.trim()) {
          const coords = await this.geocodeAddress(member.location);
          if (coords) {
            memberLocations.push({
              ...coords,
              name: member.full_name || member.username,
              address: member.location
            });
          }
        }
      }
      console.log(`🎯 Đã có tọa độ ${memberLocations.length} thành viên:`, 
        memberLocations.map(m => `${m.name} (${m.lat.toFixed(4)}, ${m.lng.toFixed(4)})`));

      // 6. Tìm kiếm địa điểm thật cho TẤT CẢ loại sở thích
      const allSuggestions = [];
      
      // Tìm kiếm cho tất cả sở thích được chọn (giới hạn 2 địa điểm mỗi loại)
      for (let i = 0; i < uniquePreferences.length; i++) {
        const pref = uniquePreferences[i];
        const searchProgress = 60 + (i / uniquePreferences.length) * 30; // 60-90%
        
        if (progressCallback) {
          progressCallback({
            stage: 'searching',
            progress: Math.round(searchProgress),
            message: `Đang tìm kiếm ${pref.category} (${i + 1}/${uniquePreferences.length})...`,
            estimatedTime: Math.floor(Math.max(0, estimatedTimeCalc.total - (estimatedTimeCalc.total * searchProgress / 100)))
          });
        }
        
        console.log(`🔍 Tìm kiếm ${pref.category} (${pref.count}/${groupLocationData.length} thành viên thích)...`);
        const places = await this.searchPlacesNearby(groupCenter, pref.category);
        console.log(`✅ Tìm thấy ${places.length} ${pref.category}`);
        
        // Chỉ lấy 2 địa điểm tốt nhất mỗi loại để đảm bảo đa dạng
        const limitedPlaces = places.slice(0, 2);
        
        for (const place of limitedPlaces) {
          const matchRate = this.calculateMatchRate(place, uniquePreferences, memberLocations, groupLocationData.length);
          const matchReasons = this.generateMatchReasons(place, uniquePreferences, groupLocationData.length, memberLocations);

          allSuggestions.push({
            id: `${place.category}_${place.id}`,
            name: place.name,
            category: place.category,
            address: place.address,
            matchRate,
            distance: Number(place.distance.toFixed(1)),
            priceRange: this.generatePriceRange(place.name, place.category),
            matchReasons,
            openingHours: '08:00 - 22:00',
            days: 'Thứ 2 - Chủ nhật',
            lat: place.lat,
            lng: place.lng
          });
        }
      }

      // 7. Sắp xếp theo độ phù hợp và loại bỏ trùng lặp
      if (progressCallback) {
        progressCallback({
          stage: 'finalizing',
          progress: 95,
          message: 'Đang sắp xếp và lọc kết quả...',
          estimatedTime: 2 // Đã là số nguyên
        });
      }
      
      const uniqueSuggestions = allSuggestions
        .filter((suggestion, index, self) => 
          index === self.findIndex(s => s.name === suggestion.name)
        )
        .sort((a, b) => b.matchRate - a.matchRate)
        .slice(0, 20); // Tăng giới hạn lên 20 để hiển thị đa dạng hơn

      console.log('✅ Đã tạo', uniqueSuggestions.length, 'suggestions thật');

      // 8. Cache kết quả suggestions
      this.suggestionsCache.set(cacheKey, {
        data: uniqueSuggestions,
        timestamp: Date.now()
      });
      console.log('💾 Đã cache suggestions với key:', cacheKey);

      // 9. Hoàn thành và trả về kết quả
      if (progressCallback) {
        progressCallback({
          stage: 'completed',
          progress: 100,
          message: `Hoàn thành! Tìm thấy ${uniqueSuggestions.length} đề xuất phù hợp`,
          estimatedTime: 0
        });
      }

      return uniqueSuggestions;

    } catch (error) {
      console.error('❌ Lỗi khi tạo suggestions:', error);
      
      // Đã tắt fallback - chỉ trả về mảng rỗng
      return [];
    }
  }

  // Generate price range based on place category and name characteristics
  static generatePriceRange(placeName = '', category = '') {
    // Dựa trên loại địa điểm để ước tính giá
    if (category.includes('Quán cà phê')) return '₫₫';
    if (category.includes('Quán ăn')) {
      // Phân tích tên để ước tính mức giá
      const name = placeName.toLowerCase();
      if (name.includes('nhà hàng') || name.includes('restaurant')) return '₫₫₫';
      if (name.includes('cơm') || name.includes('phở') || name.includes('bún')) return '₫';
      return '₫₫';
    }
    if (category.includes('Rạp phim')) return '₫₫';
    if (category.includes('Karaoke')) return '₫₫₫';
    if (category.includes('Trung tâm thương mại')) return '₫₫';
    
    return '₫₫'; // Default
  }

  // Chỉ lấy cache suggestions mà không tạo mới
  static async getCachedSuggestions(groupId) {
    try {
      console.log('🔍 Checking cache for groupId:', groupId);
      
      // 1. Lấy dữ liệu vị trí và sở thích của tất cả thành viên để tạo fingerprint
      const response = await locationPreferenceService.getGroupLocationPreferences(groupId);
      const groupLocationData = response.success ? response.data : [];
      
      if (!groupLocationData || groupLocationData.length === 0) {
        console.log('⚠️ Không có dữ liệu nhóm để kiểm tra cache');
        return [];
      }

      // 2. Tạo fingerprint và kiểm tra cache
      const groupFingerprint = this.createGroupFingerprint(groupLocationData);
      const cacheKey = `suggestions_${groupId}_${groupFingerprint}`;
      
      console.log('🔑 Checking cache key:', cacheKey);
      
      if (this.suggestionsCache.has(cacheKey)) {
        const cached = this.suggestionsCache.get(cacheKey);
        if (Date.now() - cached.timestamp < this.suggestionsCacheTimeout) {
          console.log('📦 Cache hit! Trả về suggestions từ cache');
          return cached.data;
        } else {
          // Cache hết hạn
          this.suggestionsCache.delete(cacheKey);
          console.log('🕐 Cache đã hết hạn');
        }
      } else {
        console.log('❌ Không có cache hoặc dữ liệu đã thay đổi');
      }
      
      return [];
    } catch (error) {
      console.error('💥 Error checking cache:', error);
      return [];
    }
  }

  // Xóa cache suggestions cho một nhóm cụ thể (gọi khi có thay đổi dữ liệu)
  static clearSuggestionsCache(groupId = null) {
    if (groupId) {
      // Xóa cache cho nhóm cụ thể
      const keysToDelete = [];
      this.suggestionsCache.forEach((value, key) => {
        if (key.startsWith(`suggestions_${groupId}_`)) {
          keysToDelete.push(key);
        }
      });
      keysToDelete.forEach(key => {
        this.suggestionsCache.delete(key);
        console.log('🗑️ Đã xóa cache suggestions:', key);
      });
    } else {
      // Xóa toàn bộ cache
      this.suggestionsCache.clear();
      console.log('🗑️ Đã xóa toàn bộ cache suggestions');
    }
  }

  // Kiểm tra kích thước cache và dọn dẹp nếu cần
  static cleanupCache() {
    const now = Date.now();
    
    // Dọn dẹp searchCache
    this.searchCache.forEach((value, key) => {
      if (now - value.timestamp > this.cacheTimeout) {
        this.searchCache.delete(key);
      }
    });
    
    // Dọn dẹp suggestionsCache
    this.suggestionsCache.forEach((value, key) => {
      if (now - value.timestamp > this.suggestionsCacheTimeout) {
        this.suggestionsCache.delete(key);
      }
    });
    
    console.log(`🧹 Cache cleanup completed. Search: ${this.searchCache.size}, Suggestions: ${this.suggestionsCache.size}`);
  }
}

export default SuggestionService; 