import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import GroupHeader from '../../../../components/layoutPrimitives/GroupHeader';
import LeaderLayout from '../../../../components/layoutPrimitives/LeaderLayout';
import { getGroupById } from '../../../../services/groupService';
import SuggestionService from '../../../../services/suggestionService';



const SuggestionList = () => {
  const navigate = useNavigate();
  const { groupId } = useParams();
  const [groupInfo, setGroupInfo] = useState({
    name: '',
    memberCount: 0,
  });
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('matchRate'); // matchRate, distance, rating
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loadingProgress, setLoadingProgress] = useState({
    stage: 'initializing',
    progress: 0,
    message: 'Khởi tạo...',
    estimatedTime: 0,
    details: null
  });

  // Lấy thông tin nhóm và tạo đề xuất thực tế
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Dọn dẹp cache cũ trước khi tạo suggestions mới
        SuggestionService.cleanupCache();
        
        // Lấy thông tin nhóm
        const groupResponse = await getGroupById(groupId);
        if (groupResponse.success) {
          setGroupInfo({
            name: groupResponse.data.name,
            memberCount: groupResponse.data.memberCount
          });
        }

        // Tạo suggestions dựa trên dữ liệu thực tế với progress tracking
        const realSuggestions = await SuggestionService.generateSuggestions(groupId, (progress) => {
          setLoadingProgress(progress);
        });
        setSuggestions(realSuggestions);
        
        setLoading(false);
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu:', error);
        // Đã tắt fallback - chỉ hiển thị lỗi
        setSuggestions([]);
        setLoading(false);
      }
    };

    fetchData();
  }, [groupId]);



  // Xử lý sự kiện khi nhấn nút "Thêm vào sự kiện"
  const handleAddToEvent = (suggestion) => {
    // Trong thực tế, sẽ gọi API để thêm địa điểm vào sự kiện
    alert(`Đã thêm "${suggestion.name}" vào danh sách sự kiện!`);
    navigate(`/groups/${groupId}/event-manager`);
  };

  // Lọc và sắp xếp danh sách đề xuất
  const getFilteredAndSortedSuggestions = () => {
    let filtered = suggestions;
    
    // Lọc theo danh mục
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(s => s.category === selectedCategory);
    }
    
    // Sắp xếp
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'distance':
          return a.distance - b.distance;
        case 'matchRate':
        default:
          if (b.matchRate !== a.matchRate) {
            return b.matchRate - a.matchRate;
          }
          // Nếu matchRate bằng nhau, ưu tiên khoảng cách gần hơn
          return a.distance - b.distance;
      }
    });
    
    return filtered;
  };

  // Các nút chức năng bên phải
  const rightButtons = [
    { label: 'Sự kiện', onClick: () => navigate(`/groups/${groupId}/event-manager`) },
    { label: 'Quản lý thời gian', onClick: () => navigate(`/groups/${groupId}/time-editor`) },
    { label: 'Quản lý vị trí và sở thích', onClick: () => navigate(`/groups/${groupId}/location-preference`) },
    { label: 'Lịch rảnh nhóm', onClick: () => navigate(`/groups/${groupId}/group-calendar`) },
    { label: 'Đề xuất địa điểm', onClick: () => {} },
  ];

  // Component cho match rate badge
  const MatchRateBadge = ({ rate }) => {
    const getColor = () => {
      if (rate >= 90) return 'bg-green-500';
      if (rate >= 75) return 'bg-blue-500';
      if (rate >= 60) return 'bg-yellow-500';
      return 'bg-red-500';
    };

    return (
      <div className={`${getColor()} text-white px-3 py-1 rounded-full text-sm font-semibold`}>
        {rate}% phù hợp
      </div>
    );
  };

  // Component cho rating stars (hiển thị khi có dữ liệu thật)
  const StarRating = ({ rating, reviewCount }) => {
    // Nếu không có dữ liệu rating/reviewCount thật, không hiển thị
    if (!rating || !reviewCount) {
      return (
        <div className="flex items-center gap-1 text-sm text-gray-500">
          <span>⭐</span>
          <span>Chưa có đánh giá</span>
        </div>
      );
    }

    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<span key={i} className="text-yellow-400">★</span>);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<span key={i} className="text-yellow-400">★</span>);
      } else {
        stars.push(<span key={i} className="text-gray-300">★</span>);
      }
    }

    return (
      <div className="flex items-center gap-1">
        <div className="flex">{stars}</div>
        <span className="text-sm text-gray-600">({reviewCount})</span>
      </div>
    );
  };

  // Hàm render mỗi đề xuất trong danh sách
  const renderSuggestionCard = (suggestion) => (
    <div key={suggestion.id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-800 mb-1">{suggestion.name}</h3>
            <p className="text-purple-600 font-medium text-sm">{suggestion.category}</p>
          </div>
          <MatchRateBadge rate={suggestion.matchRate} />
        </div>
        
        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
          <div className="flex items-center gap-1">
            <span>📍</span>
            <span>{suggestion.distance} km</span>
          </div>
          <div className="flex items-center gap-1">
            <span>💰</span>
            <span>{suggestion.priceRange}</span>
          </div>
        </div>
      </div>

             {/* Body */}
       <div className="p-6">
         <div className="grid md:grid-cols-2 gap-6">
           {/* Thông tin chính */}
           <div className="space-y-4">
             <div>
               <h4 className="font-semibold text-gray-800 mb-2">Địa chỉ</h4>
               <p className="text-gray-600 text-sm">{suggestion.address}</p>
             </div>
             
             <div>
               <h4 className="font-semibold text-gray-800 mb-2">Giờ mở cửa</h4>
               <p className="text-gray-600 text-sm">{suggestion.openingHours} • {suggestion.days}</p>
             </div>
           </div>

           {/* Thông tin phụ */}
           <div className="space-y-4">
             <div>
               <h4 className="font-semibold text-gray-800 mb-2">Lý do phù hợp</h4>
               <ul className="space-y-1">
                 {suggestion.matchReasons.map((reason, index) => (
                   <li key={index} className="text-sm text-gray-600 flex items-center gap-2">
                     <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
                     {reason}
                   </li>
                 ))}
               </ul>
             </div>
           </div>
         </div>
       </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            Cập nhật lần cuối: hôm nay
          </div>
          <button
            onClick={() => handleAddToEvent(suggestion)}
            className="bg-gradient-to-r from-purple-500 to-blue-600 text-white px-6 py-2 rounded-lg hover:from-purple-600 hover:to-blue-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg"
          >
            Thêm vào sự kiện
          </button>
        </div>
      </div>
    </div>
  );

  const filteredSuggestions = getFilteredAndSortedSuggestions();
  const categories = ['all', ...new Set(suggestions.map(s => s.category))];

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <GroupHeader 
        groupName={groupInfo.name || 'Đang tải...'}
        memberCount={groupInfo.memberCount || 0}
        showBackToGroups={true}
        isLeader={true}
      />
      
      {/* Main Content */}
      <LeaderLayout rightButtons={rightButtons} activePage="Đề xuất địa điểm">
        <div className="space-y-6">
          {/* Page Header */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="mb-4 pb-3 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-800 mb-1 text-center">Đề xuất địa điểm thông minh cho nhóm</h2>
              <p className="text-sm text-gray-600 text-center">
                Phân tích dựa trên vị trí và sở thích thực tế của {groupInfo.memberCount} thành viên
              </p>
              <p className="text-xs text-purple-600 text-center mt-1">
                Tự động tính toán độ phù hợp dựa trên dữ liệu nhóm
              </p>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 items-center justify-between">
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">Danh mục:</span>
                  <select 
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                  >
                    <option value="all">Tất cả</option>
                    {categories.slice(1).map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">Sắp xếp:</span>
                  <select 
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                  >
                    <option value="matchRate">Độ phù hợp</option>
                    <option value="distance">Khoảng cách</option>
                  </select>
                </div>
              </div>

              <div className="text-sm text-gray-600">
                Tìm thấy <span className="font-semibold text-purple-600">{filteredSuggestions.length}</span> địa điểm phù hợp
                <br />
                <span className="text-xs text-gray-500">Độ phù hợp tính dựa trên sở thích và vị trí thành viên</span>
              </div>
            </div>
          </div>

          {/* Suggestions List */}
          <div className="space-y-6">
            {loading ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                {/* Progress Bar */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Tiến độ</span>
                    <span className="text-sm text-gray-500">{loadingProgress.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${loadingProgress.progress}%` }}
                    ></div>
                  </div>
                </div>

                {/* Current Status */}
                <div className="mb-6">
                  <div className="inline-block w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                  <p className="text-lg font-medium text-gray-800 mb-2">{loadingProgress.message}</p>
                  
                  {/* Estimated Time */}
                  {loadingProgress.estimatedTime > 0 && (
                    <p className="text-sm text-orange-600 font-medium">
                      Ước tính còn lại: {loadingProgress.estimatedTime}s
                    </p>
                  )}
                </div>

                {/* Details */}
                {loadingProgress.details && (
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <h4 className="font-medium text-gray-700 mb-2">Chi tiết xử lý:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-gray-600">
                      <div className="flex items-center justify-center bg-white rounded p-3">
                        <span className="mr-2">👥</span>
                        <span>{loadingProgress.details.members} thành viên</span>
                      </div>
                      <div className="flex items-center justify-center bg-white rounded p-3">
                        <span className="mr-2">📍</span>
                        <span>{loadingProgress.details.locationsToProcess} vị trí</span>
                      </div>
                      <div className="flex items-center justify-center bg-white rounded p-3">
                        <span className="mr-2">❤️</span>
                        <span>{loadingProgress.details.preferencesToSearch} sở thích</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Stage Steps */}
                <div className="text-sm text-gray-500 space-y-1">
                  <div className={`flex items-center justify-center py-1 ${loadingProgress.stage === 'analyzing' ? 'text-purple-600 font-medium' : loadingProgress.progress > 10 ? 'text-green-600' : ''}`}>
                    <span className="mr-2">{loadingProgress.progress > 10 ? '✓' : '•'}</span>
                    <span>Phân tích dữ liệu nhóm</span>
                  </div>
                  <div className={`flex items-center justify-center py-1 ${loadingProgress.stage === 'geocoding' ? 'text-purple-600 font-medium' : loadingProgress.progress > 20 ? 'text-green-600' : ''}`}>
                    <span className="mr-2">{loadingProgress.progress > 20 ? '✓' : '•'}</span>
                    <span>Tính toán vị trí trung tâm</span>
                  </div>
                  <div className={`flex items-center justify-center py-1 ${loadingProgress.stage === 'member_geocoding' ? 'text-purple-600 font-medium' : loadingProgress.progress > 40 ? 'text-green-600' : ''}`}>
                    <span className="mr-2">{loadingProgress.progress > 40 ? '✓' : '•'}</span>
                    <span>Xử lý vị trí thành viên</span>
                  </div>
                  <div className={`flex items-center justify-center py-1 ${loadingProgress.stage === 'searching' ? 'text-purple-600 font-medium' : loadingProgress.progress > 90 ? 'text-green-600' : ''}`}>
                    <span className="mr-2">{loadingProgress.progress > 90 ? '✓' : '•'}</span>
                    <span>Tìm kiếm địa điểm phù hợp</span>
                  </div>
                  <div className={`flex items-center justify-center py-1 ${loadingProgress.stage === 'finalizing' ? 'text-purple-600 font-medium' : loadingProgress.progress === 100 ? 'text-green-600' : ''}`}>
                    <span className="mr-2">{loadingProgress.progress === 100 ? '✓' : '•'}</span>
                    <span>Sắp xếp và hoàn thiện kết quả</span>
                  </div>
                </div>
              </div>
            ) : filteredSuggestions.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Chưa đủ dữ liệu để tạo đề xuất thông minh</h3>
                <p className="text-gray-600 mb-4">
                  Cần ít nhất một thành viên có vị trí và sở thích để hệ thống có thể phân tích và tạo đề xuất phù hợp
                </p>
                <div className="space-y-2 mb-4">
                  <button 
                    onClick={() => navigate(`/groups/${groupId}/location-preference`)}
                    className="bg-purple-500 text-white px-6 py-2 rounded-lg hover:bg-purple-600 transition-colors mr-3"
                  >
                    Cập nhật vị trí & sở thích
                  </button>
                  <button 
                    onClick={() => window.location.reload()}
                    className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Thử lại
                  </button>
                </div>
              </div>
            ) : (
              filteredSuggestions.map(renderSuggestionCard)
            )}
          </div>
        </div>
      </LeaderLayout>
    </div>
  );
};

export default SuggestionList;
