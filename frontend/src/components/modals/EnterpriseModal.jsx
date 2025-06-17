import React, { useState, useEffect } from 'react';
import { FaMapMarkerAlt, FaMapPin, FaPhone, FaEnvelope, FaGlobe, FaClock, FaUsers, FaWifi, FaParking, FaCoffee, FaUtensils, FaTimes } from 'react-icons/fa';
import PostCard from '../cards/PostCard';
import Scrollbar from '../common/Scrollbar';
import api from '../../services/api';

// Function to get avatar info
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

const EnterpriseModal = ({ isOpen, onClose, enterpriseId }) => {
  const [enterprise, setEnterprise] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && enterpriseId) {
      fetchEnterpriseData();
    }
  }, [isOpen, enterpriseId]);

  const fetchEnterpriseData = async () => {
    try {
      setLoading(true);
      
      // Fetch enterprise info
      const enterpriseResponse = await api.get(`/enterprises/${enterpriseId}`);
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
        const postsResponse = await api.get(`/enterprises/${enterpriseId}/posts`);
        setPosts(postsResponse.data || []);
      }
    } catch (error) {
      console.error('Error fetching enterprise data:', error);
      setEnterprise(null);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const avatarInfo = getAvatarInfo(enterprise?.name);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
      
      {/* Modal */}
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white shadow-lg hover:bg-gray-100 transition-colors"
          >
            <FaTimes className="w-5 h-5 text-gray-600" />
          </button>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : !enterprise ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <p className="text-xl text-gray-600">Không tìm thấy thông tin doanh nghiệp</p>
                <p className="text-sm text-gray-400 mt-2">ID: {enterpriseId}</p>
              </div>
            </div>
          ) : (
            <div className="overflow-y-auto max-h-[90vh]">
              {/* Enterprise Profile */}
              <div className="bg-white">
                <div className="relative h-32 bg-gradient-to-r from-blue-500 to-blue-600">
                  {enterprise.coverImage && (
                    <img
                      src={enterprise.coverImage}
                      alt="Cover"
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="relative px-6 pb-6">
                  <div className="flex flex-col sm:flex-row -mt-8 sm:-mt-12 items-center">
                    {/* Avatar with first letter */}
                    <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-lg border-4 border-white shadow-lg flex items-center justify-center text-white text-xl font-bold ${avatarInfo.bgColor}`}>
                      {avatarInfo.letter}
                    </div>
                    <div className="mt-4 sm:mt-0 sm:ml-4 text-center sm:text-left flex-1">
                      <h1 className="text-2xl font-bold text-gray-900">{enterprise.name}</h1>
                      <div className="flex items-center mt-1 justify-center sm:justify-start">
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full capitalize">
                          {enterprise.enterprise_type || 'Doanh nghiệp'}
                        </span>
                      </div>
                      {enterprise.description && (
                        <p className="text-gray-600 mt-2 text-sm">{enterprise.description}</p>
                      )}
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    {enterprise.address && (
                      <div className="flex items-center text-gray-600">
                        <FaMapPin className="mr-3 text-red-600 flex-shrink-0 w-4 h-4 font-bold" />
                        <span className="truncate">{enterprise.address}</span>
                      </div>
                    )}
                    {enterprise.phone && (
                      <div className="flex items-center text-gray-600">
                        <FaPhone className="mr-3 text-green-500 flex-shrink-0 w-4 h-4" />
                        <span>{enterprise.phone}</span>
                      </div>
                    )}
                    {enterprise.email && (
                      <div className="flex items-center text-gray-600">
                        <FaEnvelope className="mr-3 text-blue-500 flex-shrink-0 w-4 h-4" />
                        <span className="truncate">{enterprise.email}</span>
                      </div>
                    )}
                    {enterprise.website && (
                      <div className="flex items-center text-gray-600">
                        <FaGlobe className="mr-3 text-purple-500 flex-shrink-0 w-4 h-4" />
                        <a href={enterprise.website} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 truncate">
                          {enterprise.website}
                        </a>
                      </div>
                    )}
                    {enterprise.opening_hours && (
                      <div className="flex items-center text-gray-600">
                        <FaClock className="mr-3 text-orange-500 flex-shrink-0 w-4 h-4" />
                        <span>{enterprise.opening_hours}</span>
                      </div>
                    )}
                    {enterprise.capacity && (
                      <div className="flex items-center text-gray-600">
                        <FaUsers className="mr-3 text-indigo-500 flex-shrink-0 w-4 h-4" />
                        <span>Sức chứa: {enterprise.capacity} người</span>
                      </div>
                    )}
                  </div>

                  {/* Contact Person */}
                  {enterprise.contact_person && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <h3 className="text-sm font-semibold text-gray-700 mb-1">Người liên hệ</h3>
                      <p className="text-gray-600 text-sm">{enterprise.contact_person}</p>
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
                            <div key={index} className="flex items-center px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-700">
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
              <div className="border-t bg-gray-50 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Bài đăng của doanh nghiệp</h2>
                                 <div className="max-h-64 overflow-y-auto">
                   {posts.length > 0 ? (
                     <div className="space-y-4">
                       {posts.map((post) => (
                         <PostCard key={post.id} post={post} onEnterpriseClick={null} />
                       ))}
                     </div>
                   ) : (
                     <p className="text-gray-600 text-center py-4 text-sm">
                       Chưa có bài đăng nào từ doanh nghiệp này
                     </p>
                   )}
                 </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnterpriseModal; 