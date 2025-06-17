import React, { useState, useEffect, useCallback, useRef } from 'react';
import { HiCheck, HiX, HiFilter } from 'react-icons/hi';
import PostCard from '../../../components/cards/PostCard';
import Scrollbar from '../../../components/common/Scrollbar';
import EnterpriseSearch from '../../../components/common/EnterpriseSearch';
import postService from '../../../services/postService';
import { updatePostStatus } from '../../../services/adminService';

const PostApproval = () => {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedEnterprise, setSelectedEnterprise] = useState(null);
  const [showFilter, setShowFilter] = useState(false);
  const scrollRef = useRef(null);

  const tabs = [
    { key: 'pending', label: 'Chờ duyệt', color: 'text-yellow-600 border-yellow-500' },
    { key: 'all', label: 'Tất cả bài đăng', color: 'text-blue-600 border-blue-500' },
    { key: 'approved', label: 'Đã duyệt', color: 'text-green-600 border-green-500' },
    { key: 'rejected', label: 'Đã từ chối', color: 'text-red-600 border-red-500' }
  ];

  // Fetch posts function
  const fetchPosts = useCallback(async (resetPage = false) => {
    if (loading || (!hasMore && !resetPage)) return;
    
    setLoading(true);
    const currentPage = resetPage ? 1 : page;
    
    try {
      let fetchedPosts;
      
      if (activeTab === 'all') {
        // Lấy tất cả bài đăng cho admin
        fetchedPosts = await postService.getAllPostsForAdmin(currentPage, 10, selectedEnterprise?.id);
      } else {
        // Lấy posts theo status cụ thể
        fetchedPosts = await postService.getPostsByStatus(activeTab, currentPage, 10, selectedEnterprise?.id);
      }
      
      if (resetPage || currentPage === 1) {
        setPosts(fetchedPosts || []);
      } else {
        setPosts(prev => [...prev, ...(fetchedPosts || [])]);
      }
      
      // Kiểm tra có còn posts để load không
      setHasMore((fetchedPosts || []).length === 10);
      
      if (resetPage) {
        setPage(2);
      } else {
        setPage(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      // Fallback to mock data for testing
      const newPosts = Array.from({ length: 5 }, (_, i) => ({
        id: (resetPage || currentPage === 1 ? 0 : posts.length) + i + 1,
        title: `Bài đăng mới ${(resetPage || currentPage === 1 ? 0 : posts.length) + i + 1}`,
        content: 'Nội dung bài đăng mới với các thông tin về khuyến mãi, sự kiện...',
        enterprise_name: selectedEnterprise ? selectedEnterprise.name : `Doanh nghiệp ${(resetPage || currentPage === 1 ? 0 : posts.length) + i + 1}`,
        enterprise_address: `Địa chỉ ${(resetPage || currentPage === 1 ? 0 : posts.length) + i + 1}, TP.HCM`,
        type: 'restaurant',
        status: activeTab === 'all' ? (i % 3 === 0 ? 'approved' : i % 3 === 1 ? 'pending' : 'rejected') : activeTab,
        created_at: new Date(Date.now() - ((resetPage || currentPage === 1 ? 0 : posts.length) + i) * 24 * 60 * 60 * 1000)
      }));

      if (resetPage || currentPage === 1) {
        setPosts(newPosts);
      } else {
        setPosts(prev => [...prev, ...newPosts]);
      }
      setHasMore(currentPage < 3);
      
      if (resetPage) {
        setPage(2);
      } else {
        setPage(prev => prev + 1);
      }
    } finally {
      setLoading(false);
    }
      }, [loading, hasMore, page, posts.length, activeTab, selectedEnterprise]);

  // Handle tab change
  const handleTabChange = (tabKey) => {
    if (tabKey === activeTab) return;
    
    setActiveTab(tabKey);
    setPage(1);
    setHasMore(true);
    setPosts([]);
  };

  // Handle enterprise selection
  const handleEnterpriseSelect = (enterprise) => {
    setSelectedEnterprise(enterprise);
    setPage(1);
    setHasMore(true);
    setPosts([]);
  };

  // Handle scroll
  const handleScroll = useCallback((e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (scrollHeight - scrollTop <= clientHeight * 1.5) {
      fetchPosts();
    }
  }, [fetchPosts]);

  // Initial load and reload when tab or enterprise changes
  useEffect(() => {
    fetchPosts(true);
  }, [activeTab, selectedEnterprise]);

  const handleApprove = async (postId) => {
    try {
      await updatePostStatus(postId, 'approved');
      setPosts(posts.map(post => 
        post.id === postId ? { ...post, status: 'approved' } : post
      ));
    } catch (error) {
      console.error('Error approving post:', error);
      alert('Có lỗi xảy ra khi phê duyệt bài đăng');
    }
  };

  const handleReject = async (postId) => {
    try {
      await updatePostStatus(postId, 'rejected');
      setPosts(posts.map(post => 
        post.id === postId ? { ...post, status: 'rejected' } : post
      ));
    } catch (error) {
      console.error('Error rejecting post:', error);
      alert('Có lỗi xảy ra khi từ chối bài đăng');
    }
  };

  const getEmptyMessage = () => {
    const enterpriseFilter = selectedEnterprise ? ` của ${selectedEnterprise.name}` : '';
    switch (activeTab) {
      case 'pending':
        return `Không có bài đăng nào cần duyệt${enterpriseFilter}`;
      case 'approved':
        return `Không có bài đăng nào đã được duyệt${enterpriseFilter}`;
      case 'rejected':
        return `Không có bài đăng nào bị từ chối${enterpriseFilter}`;
      case 'all':
        return `Không có bài đăng nào${enterpriseFilter}`;
      default:
        return `Không có bài đăng nào${enterpriseFilter}`;
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Duyệt bài đăng</h2>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key)}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.key
                    ? `${tab.color} border-current`
                    : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Filter Section */}
      <div className="mb-6 bg-white rounded-lg shadow-sm p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <HiFilter className="mr-2" />
            Bộ lọc
          </h3>
          <button
            onClick={() => setShowFilter(!showFilter)}
            className="text-sm text-purple-600 hover:text-purple-800 transition-colors"
          >
            {showFilter ? 'Ẩn bộ lọc' : 'Hiện bộ lọc'}
          </button>
        </div>
        
        {showFilter && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lọc theo doanh nghiệp
              </label>
              <EnterpriseSearch
                onEnterpriseSelect={handleEnterpriseSelect}
                selectedEnterprise={selectedEnterprise}
                placeholder="Tìm kiếm doanh nghiệp để lọc bài đăng..."
              />
            </div>
            
            {selectedEnterprise && (
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-md">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-blue-800">
                    Đang lọc bài đăng của: <strong>{selectedEnterprise.name}</strong>
                  </span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                    {selectedEnterprise.post_count} bài đăng
                  </span>
                </div>
                <button
                  onClick={() => handleEnterpriseSelect(null)}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Xóa bộ lọc
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <Scrollbar
        ref={scrollRef}
        height="calc(100vh - 280px)"
        className="pr-4"
        onScroll={handleScroll}
        autoHide={false}
      >
        <div className="space-y-6">
          {posts.map((post) => (
            <div 
              key={post.id}
              className={`relative transition-colors ${
                post.status === 'approved' ? 'bg-green-50' : 
                post.status === 'rejected' ? 'bg-red-50' : 
                'hover:bg-gray-50'
              }`}
            >
              {/* Action buttons - chỉ hiển thị cho bài đăng pending */}
              {post.status === 'pending' && (
                <div className="absolute top-4 right-4 flex space-x-2 z-10">
                  <button
                    onClick={() => handleApprove(post.id)}
                    className="p-2 bg-white text-green-600 hover:bg-green-100 rounded-full transition-colors shadow-lg"
                    title="Phê duyệt"
                  >
                    <HiCheck className="w-6 h-6" />
                  </button>
                  <button
                    onClick={() => handleReject(post.id)}
                    className="p-2 bg-white text-red-600 hover:bg-red-100 rounded-full transition-colors shadow-lg"
                    title="Từ chối"
                  >
                    <HiX className="w-6 h-6" />
                  </button>
                </div>
              )}

              {/* Status badge */}
              <div className="absolute top-4 right-4 z-10">
                {post.status === 'approved' && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    Đã phê duyệt
                  </span>
                )}
                {post.status === 'rejected' && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                    Đã từ chối
                  </span>
                )}
                {post.status === 'pending' && activeTab !== 'pending' && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                    Chờ duyệt
                  </span>
                )}
              </div>

              <PostCard post={post} onEnterpriseClick={null} />
            </div>
          ))}

          {/* Loading state */}
          {loading && (
            <div className="text-center py-4">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-purple-500 border-t-transparent"></div>
            </div>
          )}

          {/* No more posts */}
          {!hasMore && posts.length > 0 && (
            <div className="text-center py-4 text-gray-500">
              Đã hiển thị tất cả bài đăng
            </div>
          )}

          {/* Empty state */}
          {!loading && posts.length === 0 && (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <p className="text-gray-500 text-lg">
                {getEmptyMessage()}
              </p>
            </div>
          )}
        </div>
      </Scrollbar>
    </div>
  );
};

export default PostApproval;