import { API_BASE_URL } from '../constants/appConfig';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

// Lấy thống kê dashboard
export const getDashboardStats = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/dashboard/stats`, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Lỗi khi lấy thống kê dashboard');
    }

    return data;
  } catch (error) {
    console.error('❌ Error fetching dashboard stats:', error);
    throw error;
  }
};

// Lấy danh sách người dùng
export const getUsers = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/admin/users?${queryParams}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Lỗi khi lấy danh sách người dùng');
    }

    return data;
  } catch (error) {
    console.error('❌ Error fetching users:', error);
    throw error;
  }
};

// Cập nhật trạng thái người dùng
export const updateUserStatus = async (userId, status) => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/status`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Lỗi khi cập nhật trạng thái người dùng');
    }

    return data;
  } catch (error) {
    console.error('❌ Error updating user status:', error);
    throw error;
  }
};

// Lấy danh sách bài đăng
export const getPosts = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/admin/posts?${queryParams}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Lỗi khi lấy danh sách bài đăng');
    }

    return data;
  } catch (error) {
    console.error('❌ Error fetching posts:', error);
    throw error;
  }
};

// Cập nhật trạng thái bài đăng
export const updatePostStatus = async (postId, status) => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/posts/${postId}/status`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Lỗi khi cập nhật trạng thái bài đăng');
    }

    return data;
  } catch (error) {
    console.error('❌ Error updating post status:', error);
    throw error;
  }
};

// Lấy danh sách nhóm
export const getGroups = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/admin/groups?${queryParams}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Lỗi khi lấy danh sách nhóm');
    }

    return data;
  } catch (error) {
    console.error('❌ Error fetching groups:', error);
    throw error;
  }
};

// Cập nhật trạng thái nhóm
export const updateGroupStatus = async (groupId, status) => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/groups/${groupId}/status`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Lỗi khi cập nhật trạng thái nhóm');
    }

    return data;
  } catch (error) {
    console.error('❌ Error updating group status:', error);
    throw error;
  }
};

// Xóa nhóm
export const deleteGroup = async (groupId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/groups/${groupId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Lỗi khi xóa nhóm');
    }

    return data;
  } catch (error) {
    console.error('❌ Error deleting group:', error);
    throw error;
  }
};

// Cập nhật trạng thái nhiều nhóm
export const batchUpdateGroupStatus = async (groupIds, status) => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/groups/batch-status`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ groupIds, status })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Lỗi khi cập nhật trạng thái nhóm');
    }

    return data;
  } catch (error) {
    console.error('❌ Error batch updating group status:', error);
    throw error;
  }
};

// Xóa nhiều nhóm
export const batchDeleteGroups = async (groupIds) => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/groups/batch`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
      body: JSON.stringify({ groupIds })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Lỗi khi xóa nhóm');
    }

    return data;
  } catch (error) {
    console.error('❌ Error batch deleting groups:', error);
    throw error;
  }
};

// Lấy danh sách doanh nghiệp
export const getEnterprises = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/admin/enterprises?${queryParams}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Lỗi khi lấy danh sách doanh nghiệp');
    }

    return data;
  } catch (error) {
    console.error('❌ Error fetching enterprises:', error);
    throw error;
  }
};

// Thêm người dùng hàng loạt
export const batchAddUsers = async (emails, defaultPassword, role = 'Member') => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/users/batch-add`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ emails, defaultPassword, role })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Lỗi khi thêm người dùng hàng loạt');
    }

    return data;
  } catch (error) {
    console.error('❌ Error batch adding users:', error);
    throw error;
  }
};

// Tìm kiếm người dùng
export const searchUsers = async (query) => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/users/search?query=${encodeURIComponent(query)}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Lỗi khi tìm kiếm người dùng');
    }

    return data;
  } catch (error) {
    console.error('❌ Error searching users:', error);
    throw error;
  }
};

// Xóa người dùng
export const deleteUser = async (userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Lỗi khi xóa người dùng');
    }

    return data;
  } catch (error) {
    console.error('❌ Error deleting user:', error);
    throw error;
  }
};

// Xóa nhiều người dùng
export const batchDeleteUsers = async (userIds) => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/users/batch-delete`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ userIds })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Lỗi khi xóa người dùng hàng loạt');
    }

    return data;
  } catch (error) {
    console.error('❌ Error batch deleting users:', error);
    throw error;
  }
};

// Tìm kiếm doanh nghiệp
export const searchEnterprises = async (query) => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/enterprises/search?query=${encodeURIComponent(query)}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Lỗi khi tìm kiếm doanh nghiệp');
    }

    return data;
  } catch (error) {
    console.error('❌ Error searching enterprises:', error);
    throw error;
  }
};

// Duyệt doanh nghiệp
export const approveEnterprise = async (enterpriseId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/enterprises/${enterpriseId}/approve`, {
      method: 'PUT',
      headers: getAuthHeaders()
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Lỗi khi duyệt doanh nghiệp');
    }

    return data;
  } catch (error) {
    console.error('❌ Error approving enterprise:', error);
    throw error;
  }
};

// Từ chối/khóa doanh nghiệp
export const rejectEnterprise = async (enterpriseId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/enterprises/${enterpriseId}/reject`, {
      method: 'PUT',
      headers: getAuthHeaders()
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Lỗi khi từ chối/khóa doanh nghiệp');
    }

    return data;
  } catch (error) {
    console.error('❌ Error rejecting enterprise:', error);
    throw error;
  }
};

// Cập nhật trạng thái doanh nghiệp
export const updateEnterpriseStatus = async (enterpriseId, status) => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/enterprises/${enterpriseId}/status`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Lỗi khi cập nhật trạng thái doanh nghiệp');
    }

    return data;
  } catch (error) {
    console.error('❌ Error updating enterprise status:', error);
    throw error;
  }
}; 