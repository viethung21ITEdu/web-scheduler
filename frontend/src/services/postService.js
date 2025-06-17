import api from './api';

const BASE_PATH = '/posts';

const postService = {
  // Get all posts with optional pagination and filtering
  getAllPosts: async (page = 1, limit = 10, type = '') => {
    try {
      const params = { page, limit };
      if (type) {
        params.type = type;
      }
      const response = await api.get(`${BASE_PATH}`, { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get all posts for admin (all statuses)
  getAllPostsForAdmin: async (page = 1, limit = 10, enterprise_id = null) => {
    try {
      const params = { page, limit };
      if (enterprise_id) {
        params.enterprise_id = enterprise_id;
      }
      const response = await api.get('/admin/posts', { params });
      return response.data.data.posts;
    } catch (error) {
      throw error;
    }
  },

  // Get a single post by ID
  getPostById: async (postId) => {
    try {
      const response = await api.get(`${BASE_PATH}/${postId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Create a new post
  createPost: async (postData) => {
    try {
      const response = await api.post(`/enterprises/posts`, postData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update an existing post (for enterprise)
  updatePost: async (postId, postData) => {
    try {
      const response = await api.put(`/enterprises/posts/${postId}`, postData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete a post (for enterprise)
  deletePost: async (postId) => {
    try {
      const response = await api.delete(`/enterprises/posts/${postId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Like/Unlike a post
  toggleLike: async (postId) => {
    try {
      const response = await api.post(`${BASE_PATH}/${postId}/like`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get posts by author ID (e.g., enterprise posts)
  getPostsByAuthor: async (authorId, page = 1, limit = 10) => {
    try {
      const response = await api.get(`${BASE_PATH}/author/${authorId}`, {
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get enterprise's own posts
  getMyPosts: async () => {
    try {
      const response = await api.get('/enterprises/posts');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get approved/pending posts (for admin)
  getPostsByStatus: async (status = 'approved', page = 1, limit = 10, enterprise_id = null) => {
    try {
      const params = { page, limit };
      if (enterprise_id) {
        params.enterprise_id = enterprise_id;
      }
      const response = await api.get(`${BASE_PATH}/status/${status}`, { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Approve or reject a post (for admin)
  updatePostStatus: async (postId, status) => {
    try {
      const response = await api.put(`${BASE_PATH}/${postId}/status`, { status });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default postService;