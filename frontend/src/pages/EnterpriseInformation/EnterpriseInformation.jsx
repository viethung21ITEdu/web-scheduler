import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaGlobe, FaClock, FaUsers, FaWifi, FaParking, FaCoffee, FaUtensils } from 'react-icons/fa';
import PostCard from '../../components/cards/PostCard';
import Scrollbar from '../../components/common/Scrollbar';
import api from '../../services/api';

const mockEnterprise = {
  id: '1',
  name: 'Cafe Example',
  description: 'Không gian cafe làm việc yên tĩnh, phù hợp cho nhóm bạn và các cuộc họp',
  logo: 'https://via.placeholder.com/150',
  coverImage: 'https://via.placeholder.com/1200x300',
  address: '123 Đường ABC, Quận 1, TP.HCM',
  phone: '0123456789',
  email: 'contact@example.com',
  website: 'https://example.com'
};

const mockPosts = [
  {
    id: '1',
    title: 'Khuyến mãi đặc biệt tháng 6',
    content: 'Giảm 20% cho tất cả các nhóm từ 5 người trở lên',
    image: 'https://via.placeholder.com/800x400',
    author: {
      id: '1',
      name: 'Cafe Example'
    },
    createdAt: new Date(),
    address: '123 Đường ABC, Quận 1, TP.HCM',
    type: 'Khuyến mãi'
  }
];

// Function to get avatar info (same as MemberProfile)
const getAvatarInfo = (name) => {
  if (!name) return { letter: 'E', bgColor: 'bg-orange-500' };
  
  const letter = name.charAt(0).toUpperCase();
  const colors = [
    'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 
    'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-orange-500'
  ];
  
  const colorIndex = letter.charCodeAt(0) % colors.length;
  return {
    letter,
    bgColor: colors[colorIndex]
  };
};

// Function to get facility icon
const getFacilityIcon = (facility) => {
  const facilityIcons = {
    'wifi': FaWifi,
    'parking': FaParking,
    'coffee': FaCoffee,
    'food': FaUtensils,
    'projector': FaClock,
    'ac': FaUsers
  };
  
  const lowerFacility = facility.toLowerCase();
  for (const [key, Icon] of Object.entries(facilityIcons)) {
    if (lowerFacility.includes(key)) {
      return Icon;
    }
  }
  return FaUsers; // Default icon
};

const EnterpriseInformation = () => {
  const { id } = useParams();
  const [enterprise, setEnterprise] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);  useEffect(() => {
    const fetchEnterpriseData = async () => {
      try {
        setLoading(true);
        
        // Fetch enterprise info
        const enterpriseResponse = await api.get(`/enterprises/${id}`);
        if (enterpriseResponse.data) {
          const enterpriseData = enterpriseResponse.data;
          
          // Parse facilities if it's a JSON string
          if (enterpriseData.facilities) {
            try {
              if (typeof enterpriseData.facilities === 'string') {
                enterpriseData.facilities = JSON.parse(enterpriseData.facilities);
              }
            } catch (e) {
              // If parsing fails, treat as comma-separated string
              if (typeof enterpriseData.facilities === 'string') {
                enterpriseData.facilities = enterpriseData.facilities.split(',').map(f => f.trim()).filter(f => f);
              }
            }
          } else {
            enterpriseData.facilities = [];
          }
          
          setEnterprise(enterpriseData);
          
          // Fetch enterprise posts
          const postsResponse = await api.get(`/enterprises/${id}/posts`);
          setPosts(postsResponse.data || []);
        }
      } catch (error) {
        console.error('Error fetching enterprise data:', error);
        // Fallback to mock data for testing
        if (id === '1') {
          setEnterprise(mockEnterprise);
          setPosts(mockPosts);
        } else {
          // Hiển thị thông báo lỗi chi tiết cho debug
          console.log('Enterprise ID not found:', id);
          setEnterprise(null);
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchEnterpriseData();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!enterprise) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <p className="text-xl text-gray-600">Không tìm thấy thông tin doanh nghiệp</p>
          <p className="text-sm text-gray-400 mt-2">ID: {id}</p>
          <button 
            onClick={() => window.history.back()} 
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  const avatarInfo = getAvatarInfo(enterprise?.name);

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Enterprise Profile Card */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
          <div className="relative h-48 bg-gradient-to-r from-blue-500 to-blue-600">
            {enterprise.coverImage && (
              <img
                src={enterprise.coverImage}
                alt="Cover"
                className="w-full h-full object-cover"
              />
            )}
          </div>
          <div className="relative px-6 pb-6">
            <div className="flex flex-col sm:flex-row -mt-12 sm:-mt-16 items-center">
              {/* Avatar with first letter */}
              <div className={`w-24 h-24 rounded-lg border-4 border-white shadow-lg flex items-center justify-center text-white text-2xl font-bold ${avatarInfo.bgColor}`}>
                {avatarInfo.letter}
              </div>
              <div className="mt-4 sm:mt-0 sm:ml-6 text-center sm:text-left flex-1">
                <h1 className="text-3xl font-bold text-gray-900">{enterprise.name}</h1>
                <div className="flex items-center mt-1">
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full capitalize">
                    {enterprise.enterprise_type || 'Doanh nghiệp'}
                  </span>
                </div>
                {enterprise.description && (
                  <p className="text-gray-600 mt-2">{enterprise.description}</p>
                )}
              </div>
            </div>

            {/* Contact Information */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {enterprise.address && (
                <div className="flex items-center text-gray-600">
                  <FaMapMarkerAlt className="mr-2 text-red-500" />
                  <span>{enterprise.address}</span>
                </div>
              )}
              {enterprise.phone && (
                <div className="flex items-center text-gray-600">
                  <FaPhone className="mr-2 text-green-500" />
                  <span>{enterprise.phone}</span>
                </div>
              )}
              {enterprise.email && (
                <div className="flex items-center text-gray-600">
                  <FaEnvelope className="mr-2 text-blue-500" />
                  <span>{enterprise.email}</span>
                </div>
              )}
              {enterprise.website && (
                <div className="flex items-center text-gray-600">
                  <FaGlobe className="mr-2 text-purple-500" />
                  <a href={enterprise.website} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">
                    {enterprise.website}
                  </a>
                </div>
              )}
              {enterprise.opening_hours && (
                <div className="flex items-center text-gray-600">
                  <FaClock className="mr-2 text-orange-500" />
                  <span>{enterprise.opening_hours}</span>
                </div>
              )}
              {enterprise.capacity && (
                <div className="flex items-center text-gray-600">
                  <FaUsers className="mr-2 text-indigo-500" />
                  <span>Sức chứa: {enterprise.capacity} người</span>
                </div>
              )}
            </div>

            {/* Contact Person */}
            {enterprise.contact_person && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-semibold text-gray-700 mb-1">Người liên hệ</h3>
                <p className="text-gray-600">{enterprise.contact_person}</p>
              </div>
            )}

            {/* Facilities */}
            {enterprise.facilities && enterprise.facilities.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Tiện ích</h3>
                <div className="flex flex-wrap gap-2">
                  {enterprise.facilities.map((facility, index) => {
                    const FacilityIcon = getFacilityIcon(facility);
                    return (
                      <div key={index} className="flex items-center px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700">
                        <FacilityIcon className="mr-1 text-xs" />
                        <span>{facility}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Enterprise Posts */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Bài đăng của doanh nghiệp</h2>
          <Scrollbar className="overflow-y-auto" style={{ maxHeight: '600px' }}>
            {posts.length > 0 ? (
              <div className="grid grid-cols-1 gap-6">
                {posts.map((post) => (
                  <PostCard key={post.id} post={post} onEnterpriseClick={null} />
                ))}
              </div>
            ) : (
              <p className="text-gray-600 text-center py-4">
                Chưa có bài đăng nào từ doanh nghiệp này
              </p>
            )}
          </Scrollbar>
        </div>
      </div>
    </div>
  );
};

export default EnterpriseInformation;