import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { joinGroupByInvite } from '../services/groupService';

/**
 * Trang tham gia nhóm bằng link mời
 */
const JoinGroup = () => {
  const { inviteCode } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (inviteCode) {
      handleJoinGroup();
    }
  }, [inviteCode]);

  const handleJoinGroup = async () => {
    setLoading(true);
    try {
      const response = await joinGroupByInvite(inviteCode);
      if (response.success) {
        setSuccess(true);
        setMessage(response.message);
        // Chuyển hướng sau 3 giây
        setTimeout(() => {
          navigate('/groups');
        }, 3000);
      } else {
        setSuccess(false);
        setMessage(response.message);
      }
    } catch (error) {
      console.error('Lỗi khi tham gia nhóm:', error);
      setSuccess(false);
      setMessage('Có lỗi xảy ra khi tham gia nhóm');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-8 w-96">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-6">Tham gia nhóm</h1>
          
          {loading ? (
            <div className="flex flex-col items-center">
              <div className="h-12 w-12 border-4 border-purple-400 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600">Đang xử lý yêu cầu...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              {success ? (
                <>
                  <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-green-600 mb-4">{message}</p>
                  <p className="text-gray-500 text-sm">Đang chuyển hướng về trang nhóm...</p>
                </>
              ) : (
                <>
                  <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                    <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <p className="text-red-600 mb-4">{message}</p>
                  <button
                    onClick={() => navigate('/groups')}
                    className="px-6 py-2 bg-purple-400 text-black rounded-full hover:bg-purple-500 transition-colors"
                  >
                    Về trang nhóm
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JoinGroup; 