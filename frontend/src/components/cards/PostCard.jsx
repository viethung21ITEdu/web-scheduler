import React from 'react';
import { FaMapPin } from 'react-icons/fa';
// Remove Link import since we'll use onClick instead
// import { Link } from 'react-router-dom';

const PostCard = ({ 
  post = {
    id: '',
    enterprise_id: '',
    title: '',
    content: '',
    enterprise_name: '',
    enterprise_address: '',
    type: '',
    created_at: new Date()
  },
  onEnterpriseClick // Add new prop for handling enterprise click
}) => {  // Format thời gian
  const formatTimeAgo = (date) => {
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    
    let interval = Math.floor(seconds / 31536000);
    if (interval >= 1) {
      return `${interval} năm${interval > 1 ? '' : ''}`;
    }
    
    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) {
      return `${interval} tháng`;
    }
    
    interval = Math.floor(seconds / 86400);
    if (interval >= 1) {
      return `${interval} ngày`;
    }
    
    interval = Math.floor(seconds / 3600);
    if (interval >= 1) {
      return `${interval} giờ`;
    }
    
    interval = Math.floor(seconds / 60);
    if (interval >= 1) {
      return `${interval} phút`;
    }
    
    return `${Math.floor(seconds)} giây`;
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md mb-3 overflow-hidden post-card">
      {/* Header */}
      <div className="p-3">
        {/* Dòng 1: Tên + Type + Time (căn trái) */}
        <div className="flex items-center gap-2 mb-1 justify-start">
          <span className="font-semibold text-sm">
            {post.enterprise_id ? (
              <button 
                onClick={() => onEnterpriseClick && onEnterpriseClick(post.enterprise_id)}
                className="hover:text-blue-600 transition-colors cursor-pointer text-left"
              >
                {post.enterprise_name || 'Doanh nghiệp'}
              </button>
            ) : (
              <span className="text-gray-700">
                {post.enterprise_name || 'Doanh nghiệp'}
              </span>
            )}
          </span>
          <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full flex-shrink-0">
            {post.type || 'Khác'}
          </span>
          <span className="text-xs text-gray-500 flex-shrink-0">
            {formatTimeAgo(new Date(post.created_at))}
          </span>
        </div>
        {/* Dòng 2: Địa chỉ */}
        <p className="text-xs text-gray-500 truncate">{post.enterprise_address || 'Chưa có địa chỉ'}</p>
      </div>
      
      {/* Title */}
      <div className="px-4 pb-1">
        <h3 className="font-bold text-lg text-gray-800">{post.title}</h3>
      </div>
      
      {/* Content */}
      <div className="px-3 pb-2">
        <p className="text-gray-700 mb-1">{post.content}</p>
      </div>
      
      {/* Footer with contact info */}
      <div className="px-3 pt-2 pb-1 border-t">
        {/* Địa chỉ với icon */}
        <div className="flex items-center text-gray-600">
          <FaMapPin className="h-4 w-4 mr-2 text-red-600 flex-shrink-0" />
          <span>{post.enterprise_address || 'Chưa có địa chỉ'}</span>
        </div>
      </div>
    </div>
  );
};

export default PostCard;