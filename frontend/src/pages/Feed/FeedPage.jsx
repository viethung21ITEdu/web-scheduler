import React, { useState, useEffect, useRef, useCallback } from 'react';
import PostCard from '../../components/cards/PostCard';
import { Scrollbar } from '../../components/common';
import EnterpriseModal from '../../components/modals/EnterpriseModal';
import postService from '../../services/postService';

const FeedPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedType, setSelectedType] = useState(''); // Filter by business type
  const [businessTypes, setBusinessTypes] = useState([]); // Available business types
  
  // Modal state
  const [showEnterpriseModal, setShowEnterpriseModal] = useState(false);
  const [selectedEnterpriseId, setSelectedEnterpriseId] = useState(null);
  
  const observer = useRef();
  const POSTS_PER_PAGE = 10; // Hiển thị 10 bài đăng mỗi lần tải

  // Handle enterprise click
  const handleEnterpriseClick = (enterpriseId) => {
    setSelectedEnterpriseId(enterpriseId);
    setShowEnterpriseModal(true);
  };

  // Close modal
  const closeEnterpriseModal = () => {
    setShowEnterpriseModal(false);
    setSelectedEnterpriseId(null);
  };
  
  // Function để tải bài đăng theo trang
  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await postService.getAllPosts(page, POSTS_PER_PAGE, selectedType);
      
      if (page === 1) {
        // Reset posts khi tải trang đầu hoặc thay đổi filter
        setPosts(response.posts || []);
      } else {
        // Thêm posts mới vào danh sách hiện tại cho infinite scroll
        setPosts(prevPosts => [...prevPosts, ...(response.posts || [])]);
      }
      
      // Cập nhật hasMore dựa trên pagination info
      const { pagination } = response;
      if (pagination) {
        setHasMore(page < pagination.totalPages);
      } else {
        setHasMore(false);
      }
      
    } catch (error) {
      console.error("Failed to fetch posts:", error);
      setPosts([]);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [page, selectedType]);

  // Function để lấy danh sách business types
  const fetchBusinessTypes = useCallback(async () => {
    try {
      // Lấy tất cả posts để extract business types
      const response = await postService.getAllPosts(1, 100); // Lấy nhiều để có đủ types
      const types = [...new Set((response.posts || []).map(post => post.type))];
      setBusinessTypes(types);
    } catch (error) {
      console.error("Failed to fetch business types:", error);
      setBusinessTypes([]);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  useEffect(() => {
    fetchBusinessTypes();
  }, [fetchBusinessTypes]);
  
  // Reset page when filter changes
  useEffect(() => {
    setPage(1);
  }, [selectedType]);
  
  // Cải thiện infinite scroll với Intersection Observer API
  const lastPostElementRef = useCallback(node => {
    if (loading) return;
    
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        console.log('Tải thêm bài đăng...', page);
        setPage(prevPage => prevPage + 1);
      }
    }, {
      root: null,
      rootMargin: '100px', // Tăng lên để kích hoạt sớm hơn khi cuộn
      threshold: 0.1 // Giảm threshold để kích hoạt khi phần tử chỉ hiện 10%
    });
    
    if (node) observer.current.observe(node);
  }, [loading, hasMore, page]);
    // Handle filter change
  const handleFilterChange = (e) => {
    setSelectedType(e.target.value);
  };
    return (
    <div className="flex h-screen">
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow py-4 px-6">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-semibold text-gray-800">Bảng tin</h1>
          </div>
        </header>

        {/* Main Feed Area - Using Custom Scrollbar */}
        <Scrollbar 
          className="flex-1 bg-gray-50" 
          thumbColor="rgba(59, 130, 246, 0.6)" 
          autoHide={false}
          width="8px"
        >
          <div className="px-4 pt-4 pb-8">
            {/* Bộ lọc */}
            <div className="flex justify-end mb-6">
              {/* Bộ lọc loại doanh nghiệp */}
              <div>
                <select
                  value={selectedType}
                  onChange={handleFilterChange}
                  className="pl-4 pr-8 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                >
                  <option value="">Tất cả loại doanh nghiệp</option>
                  {businessTypes.map((type, index) => (
                    <option key={index} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Posts List */}
            <div className="space-y-3">
              {loading && posts.length === 0 ? (
                // Skeleton loading for initial load
                Array(3).fill(0).map((_, index) => (
                  <div key={index} className="bg-white rounded-lg shadow-md mb-6 p-4 animate-pulse">
                    <div className="flex items-center mb-4">
                      <div className="w-10 h-10 rounded-full bg-gray-300 mr-3"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-300 rounded w-1/2 mb-2"></div>
                        <div className="h-3 bg-gray-300 rounded w-1/4"></div>
                      </div>
                    </div>
                    <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
                    <div className="h-64 bg-gray-300 rounded w-full mb-4"></div>
                  </div>
                ))
              ) : (
                // Actual posts
                posts.map((post, index) => {
                  // Nếu là phần tử cuối cùng, thêm ref cho infinite scroll
                  if (index === posts.length - 1) {
                    return (
                      <div key={post.id} ref={lastPostElementRef}>
                        <PostCard post={post} onEnterpriseClick={handleEnterpriseClick} />
                        {hasMore && <p className="text-center text-sm text-gray-500 mt-2">Đang tìm bài đăng tiếp theo...</p>}
                      </div>
                    );
                  } else {
                    return <PostCard key={post.id} post={post} onEnterpriseClick={handleEnterpriseClick} />;
                  }
                })
              )}
              
              {/* Loading indicator for pagination */}
              {loading && posts.length > 0 && (
                <div className="flex justify-center items-center py-6">
                  <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="ml-2 text-gray-600">Đang tải thêm...</span>
                </div>
              )}
              
              {/* No posts message */}
              {!loading && posts.length === 0 && (
                <div className="text-center py-8 bg-white rounded-lg shadow-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <p className="text-gray-600">Không có bài đăng nào phù hợp với bộ lọc</p>
                  <button 
                    onClick={() => setSelectedType('')} 
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                  >
                    Xem tất cả bài đăng
                  </button>
                </div>
              )}
              
              {/* Thông báo khi không còn bài đăng */}
              {!loading && !hasMore && posts.length > 0 && (
                <div className="text-center py-6 text-gray-500">
                  Đã hiển thị tất cả bài đăng
                </div>
              )}
            </div>
          </div>
        </Scrollbar>
      </div>

      {/* Enterprise Modal */}
      <EnterpriseModal
        isOpen={showEnterpriseModal}
        onClose={closeEnterpriseModal}
        enterpriseId={selectedEnterpriseId}
      />
    </div>
  );
};

export default FeedPage;