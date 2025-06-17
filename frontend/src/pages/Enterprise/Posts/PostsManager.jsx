import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import postService from '../../../services/postService';

const PostsManager = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [createLoading, setCreateLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [newPost, setNewPost] = useState({
    title: '',
    content: ''
  });
  const [editPost, setEditPost] = useState({
    title: '',
    content: ''
  });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  // Fetch enterprise posts
  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const data = await postService.getMyPosts();
      console.log('📊 Posts data from API:', data);
      setPosts(data || []);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách bài đăng:', error);
      setPosts([]);
      // Có thể hiển thị thông báo lỗi cho user
      alert('Có lỗi xảy ra khi tải danh sách bài đăng. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  // Handle clicking on the delete button to show the confirmation modal
  const handleDeleteClick = (post) => {
    setSelectedPost(post);
    setShowDeleteModal(true);
  };

  // Handle confirming deletion
  const handleConfirmDelete = async () => {
    if (selectedPost) {
      try {
        await postService.deletePost(selectedPost.id);
        // Refresh posts list
        await fetchPosts();
        setShowDeleteModal(false);
        setSelectedPost(null);
      } catch (error) {
        console.error('Lỗi khi xóa bài đăng:', error);
        alert('Có lỗi xảy ra khi xóa bài đăng. Vui lòng thử lại.');
        setShowDeleteModal(false);
        setSelectedPost(null);
      }
    }
  };

  // Handle cancelling deletion
  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setSelectedPost(null);
  };

  // Handle edit button click
  const handleEditClick = (post) => {
    setSelectedPost(post);
    setEditPost({
      title: post.title,
      content: post.content
    });
    setShowEditModal(true);
    setErrors({});
  };

  // Handle edit modal form change
  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditPost(prev => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Validate edit form
  const validateEditForm = () => {
    const newErrors = {};
    
    if (!editPost.title.trim()) {
      newErrors.title = 'Tiêu đề là bắt buộc';
    }
    
    if (!editPost.content.trim()) {
      newErrors.content = 'Nội dung là bắt buộc';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle edit post submission
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateEditForm()) {
      return;
    }

    try {
      setEditLoading(true);
      
      await postService.updatePost(selectedPost.id, {
        title: editPost.title,
        content: editPost.content
      });
      
      // Refresh posts list
      await fetchPosts();
      
      // Close modal and reset form
      setShowEditModal(false);
      setEditPost({ title: '', content: '' });
      setSelectedPost(null);
      setErrors({});
      
    } catch (error) {
      console.error('Lỗi khi cập nhật bài đăng:', error);
      alert('Có lỗi xảy ra khi cập nhật bài đăng. Vui lòng thử lại.');
    } finally {
      setEditLoading(false);
    }
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setShowEditModal(false);
    setEditPost({ title: '', content: '' });
    setSelectedPost(null);
    setErrors({});
  };

  // Handle new post button click
  const handleNewPostClick = () => {
    setShowCreateModal(true);
    setNewPost({ title: '', content: '' });
    setErrors({});
  };

  // Handle create modal form change
  const handleCreateFormChange = (e) => {
    const { name, value } = e.target;
    setNewPost(prev => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!newPost.title.trim()) {
      newErrors.title = 'Tiêu đề là bắt buộc';
    }
    
    if (!newPost.content.trim()) {
      newErrors.content = 'Nội dung là bắt buộc';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle create post submission
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setCreateLoading(true);
      
      const postData = {
        title: newPost.title,
        content: newPost.content
      };

      await postService.createPost(postData);
      
      // Refresh posts list
      await fetchPosts();
      
      // Close modal and reset form
      setShowCreateModal(false);
      setNewPost({ title: '', content: '' });
      setErrors({});
      
    } catch (error) {
      console.error('Lỗi khi tạo bài đăng:', error);
      // Show error message to user
      alert('Có lỗi xảy ra khi tạo bài đăng. Vui lòng thử lại.');
    } finally {
      setCreateLoading(false);
    }
  };

  // Handle cancel create
  const handleCancelCreate = () => {
    setShowCreateModal(false);
    setNewPost({ title: '', content: '' });
    setErrors({});
  };

  // Get status label and color
  const getStatusInfo = (status) => {
    switch (status) {
      case 'approved':
        return { label: 'Đã duyệt', className: 'bg-green-100 text-green-800' };
      case 'pending':
        return { label: 'Chờ duyệt', className: 'bg-yellow-100 text-yellow-800' };
      case 'rejected':
        return { label: 'Bị từ chối', className: 'bg-red-100 text-red-800' };
      default:
        return { label: 'Không xác định', className: 'bg-gray-100 text-gray-800' };
    }
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-gray-50">
      {/* Header area */}
      <div className="bg-white shadow-sm p-4 border-b">
        <h1 className="text-xl font-semibold text-gray-800">Quản lý bài đăng</h1>
        <p className="text-sm text-gray-600">Xem và quản lý các bài đăng của doanh nghiệp</p>
      </div>
      
      {/* Posts content */}
      <div className="flex-1 p-4">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-800">Danh sách bài đăng</h2>
            <button 
              onClick={handleNewPostClick}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition">
              Tạo bài đăng mới
            </button>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-gray-600">Đang tải...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600">Chưa có bài đăng nào</p>
                </div>
              ) : (
                posts.map((post, index) => {
                  const statusInfo = getStatusInfo(post.status);
                  return (
                    <div key={post.id || `post-${index}`} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-medium text-gray-800">{post.title}</h3>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusInfo.className}`}>
                            {statusInfo.label}
                          </span>
                          <div className="flex space-x-1">
                            <button
                              onClick={() => handleEditClick(post)}
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium px-2 py-1 rounded hover:bg-blue-50"
                            >
                              Sửa
                            </button>
                            <button
                              onClick={() => handleDeleteClick(post)}
                              className="text-red-600 hover:text-red-800 text-sm font-medium px-2 py-1 rounded hover:bg-red-50"
                            >
                              Xóa
                            </button>
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-600 mb-2">{post.content}</p>
                      <p className="text-sm text-gray-500">
                        Tạo: {new Date(post.created_at).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>

      {/* Create Post Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Tạo bài đăng mới</h3>
            
            <form onSubmit={handleCreateSubmit}>
              {/* Title input */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tiêu đề <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={newPost.title}
                  onChange={handleCreateFormChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                    errors.title ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Nhập tiêu đề bài đăng"
                />
                {errors.title && (
                  <p className="text-red-500 text-sm mt-1">{errors.title}</p>
                )}
              </div>

              {/* Content textarea */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nội dung <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="content"
                  value={newPost.content}
                  onChange={handleCreateFormChange}
                  rows={4}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                    errors.content ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Nhập nội dung bài đăng"
                />
                {errors.content && (
                  <p className="text-red-500 text-sm mt-1">{errors.content}</p>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleCancelCreate}
                  className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
                  disabled={createLoading}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50"
                  disabled={createLoading}
                >
                  {createLoading ? 'Đang tạo...' : 'Tạo bài đăng'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Post Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Chỉnh sửa bài đăng</h3>
            
            <form onSubmit={handleEditSubmit}>
              {/* Title input */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tiêu đề <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={editPost.title}
                  onChange={handleEditFormChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                    errors.title ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Nhập tiêu đề bài đăng"
                />
                {errors.title && (
                  <p className="text-red-500 text-sm mt-1">{errors.title}</p>
                )}
              </div>

              {/* Content textarea */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nội dung <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="content"
                  value={editPost.content}
                  onChange={handleEditFormChange}
                  rows={4}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                    errors.content ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Nhập nội dung bài đăng"
                />
                {errors.content && (
                  <p className="text-red-500 text-sm mt-1">{errors.content}</p>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
                  disabled={editLoading}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50"
                  disabled={editLoading}
                >
                  {editLoading ? 'Đang cập nhật...' : 'Cập nhật'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Xác nhận xóa</h3>
            <p className="text-gray-600 mb-6">
              Bạn có chắc chắn muốn xóa bài đăng "{selectedPost?.title}"? 
              Hành động này không thể hoàn tác.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleCancelDelete}
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostsManager;
