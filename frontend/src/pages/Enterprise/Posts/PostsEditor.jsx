import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import postService from '../../../services/postService';

const PostEditor = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [post, setPost] = useState({
    title: '',
    content: '',
    images: []
  });
  const [selectedFiles, setSelectedFiles] = useState([]);

  useEffect(() => {
    if (id) {
      // Fetch post data when id is available
      const fetchPost = async () => {
        try {
          const data = await postService.getPostById(id);
          setPost(data);
        } catch (error) {
          console.error('Error fetching post:', error);
        }
      };
      fetchPost();
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPost(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(prev => [...prev, ...files]);
    
    // Create preview URLs for the images
    const newImageUrls = files.map(file => URL.createObjectURL(file));
    setPost(prev => ({
      ...prev,
      images: [...prev.images, ...newImageUrls]
    }));
  };

  const handleRemoveImage = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPost(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('title', post.title);
      formData.append('content', post.content);
      selectedFiles.forEach(file => {
        formData.append('images', file);
      });

      if (id) {
        await postService.updatePost(id, formData);
      } else {
        await postService.createPost(formData);
      }

      navigate('/enterprise/posts'); // Redirect to posts management page
    } catch (error) {
      console.error('Error saving post:', error);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          {id ? 'Chỉnh sửa bài viết' : 'Thêm mới bài viết'}
        </h1>
        <div className="space-x-2">
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            Trở về
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tiêu đề
          </label>
          <input
            type="text"
            name="title"
            value={post.title}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nội dung
          </label>
          <textarea
            name="content"
            value={post.content}
            onChange={handleChange}
            rows="6"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Thêm ảnh/video
          </label>
          <div className="grid grid-cols-2 gap-4">
            {/* Existing images */}
            {post.images.map((image, index) => (
              <div key={index} className="relative">
                <img
                  src={image}
                  alt={`Upload ${index + 1}`}
                  className="w-full h-48 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                >
                  ×
                </button>
              </div>
            ))}
            
            {/* Upload button */}
            {post.images.length < 2 && (
              <label className="cursor-pointer border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center h-48 hover:border-purple-500">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  multiple
                />
                <div className="text-center">
                  <div className="text-4xl text-gray-400">+</div>
                  <div className="text-sm text-gray-500">Thêm ảnh/video</div>
                </div>
              </label>
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          {id && (
            <button
              type="button"
              onClick={() => {/* Implement delete function */}}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Xóa
            </button>
          )}
          <button
            type="submit"
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            {id ? 'Cập nhật' : 'Thêm mới'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PostEditor;
