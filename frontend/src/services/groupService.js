import api from './api';

// Lấy tất cả nhóm
export const getAllGroups = async () => {
  try {
    const response = await api.get('/groups');
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Lỗi khi lấy danh sách nhóm:', error);
    return { success: false, message: error.response?.data?.message || 'Lỗi khi lấy danh sách nhóm' };
  }
};

// Lấy nhóm theo ID
export const getGroupById = async (groupId) => {
  try {
    const response = await api.get(`/groups/${groupId}`);
    return response.data;
  } catch (error) {
    console.error('Lỗi khi lấy thông tin nhóm:', error);
    return { success: false, message: error.response?.data?.message || 'Lỗi khi lấy thông tin nhóm' };
  }
};

// Lấy danh sách nhóm của user
export const getUserGroups = async () => {
  try {
    const response = await api.get('/groups/user/groups');
    return response.data;
  } catch (error) {
    console.error('Lỗi khi lấy danh sách nhóm của user:', error);
    return { success: false, data: [], message: error.response?.data?.message || 'Lỗi khi lấy danh sách nhóm' };
  }
};

// Tạo nhóm mới
export const createGroup = async (groupData) => {
  try {
    const response = await api.post('/groups', groupData);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Lỗi khi tạo nhóm:', error);
    return { success: false, message: error.response?.data?.message || 'Lỗi khi tạo nhóm' };
  }
};

// Cập nhật thông tin nhóm
export const updateGroup = async (groupId, groupData) => {
  try {
    const response = await api.put(`/groups/${groupId}`, groupData);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Lỗi khi cập nhật nhóm:', error);
    return { success: false, message: error.response?.data?.message || 'Lỗi khi cập nhật nhóm' };
  }
};

// Xóa nhóm
export const deleteGroup = async (groupId) => {
  try {
    const response = await api.delete(`/groups/${groupId}`);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Lỗi khi xóa nhóm:', error);
    return { success: false, message: error.response?.data?.message || 'Lỗi khi xóa nhóm' };
  }
};

// Lấy danh sách thành viên nhóm
export const getGroupMembers = async (groupId) => {
  try {
    const response = await api.get(`/groups/${groupId}/members`);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Lỗi khi lấy danh sách thành viên:', error);
    return { success: false, message: error.response?.data?.message || 'Lỗi khi lấy danh sách thành viên' };
  }
};

// Thêm thành viên vào nhóm
export const addMember = async (groupId, userData) => {
  try {
    const response = await api.post(`/groups/${groupId}/members`, userData);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Lỗi khi thêm thành viên:', error);
    return { success: false, message: error.response?.data?.message || 'Lỗi khi thêm thành viên' };
  }
};

// Xóa thành viên khỏi nhóm
export const removeMember = async (groupId, userId) => {
  try {
    const response = await api.delete(`/groups/${groupId}/members/${userId}`);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Lỗi khi xóa thành viên:', error);
    return { success: false, message: error.response?.data?.message || 'Lỗi khi xóa thành viên' };
  }
};

// Tạo link mời nhóm
export const generateInviteLink = async (groupId) => {
  try {
    const response = await api.post(`/groups/${groupId}/invite-link`);
    return response.data;
  } catch (error) {
    console.error('Lỗi khi tạo link mời:', error);
    return { success: false, message: error.response?.data?.message || 'Lỗi khi tạo link mời' };
  }
};

// Gửi lời mời qua email
export const sendEmailInvite = async (groupId, email) => {
  try {
    const response = await api.post(`/groups/${groupId}/invite-email`, { email });
    return response.data;
  } catch (error) {
    console.error('Lỗi khi gửi lời mời email:', error);
    return { success: false, message: error.response?.data?.message || 'Lỗi khi gửi lời mời' };
  }
};

// Tham gia nhóm bằng mã mời
export const joinGroupByInvite = async (inviteCode) => {
  try {
    const response = await api.post(`/groups/join/${inviteCode}`);
    return response.data;
  } catch (error) {
    console.error('Lỗi khi tham gia nhóm:', error);
    return { success: false, message: error.response?.data?.message || 'Lỗi khi tham gia nhóm' };
  }
};

// Lấy danh sách yêu cầu tham gia nhóm
export const getJoinRequests = async (groupId) => {
  try {
    const response = await api.get(`/groups/${groupId}/requests`);
    return response.data;
  } catch (error) {
    console.error('Lỗi khi lấy danh sách yêu cầu:', error);
    return { success: false, message: error.response?.data?.message || 'Lỗi khi lấy danh sách yêu cầu' };
  }
};

// Duyệt yêu cầu tham gia nhóm
export const approveJoinRequest = async (groupId, requestId) => {
  try {
    const response = await api.post(`/groups/${groupId}/requests/${requestId}/approve`);
    return response.data;
  } catch (error) {
    console.error('Lỗi khi duyệt yêu cầu:', error);
    return { success: false, message: error.response?.data?.message || 'Lỗi khi duyệt yêu cầu' };
  }
};

// Từ chối yêu cầu tham gia nhóm
export const rejectJoinRequest = async (groupId, requestId) => {
  try {
    const response = await api.post(`/groups/${groupId}/requests/${requestId}/reject`);
    return response.data;
  } catch (error) {
    console.error('Lỗi khi từ chối yêu cầu:', error);
    return { success: false, message: error.response?.data?.message || 'Lỗi khi từ chối yêu cầu' };
  }
};

// Rời nhóm
export const leaveGroup = async (groupId) => {
  try {
    const response = await api.post(`/groups/${groupId}/leave`);
    return response.data;
  } catch (error) {
    console.error('Lỗi khi rời nhóm:', error);
    return { success: false, message: error.response?.data?.message || 'Lỗi khi rời nhóm' };
  }
};

// Confirm participation in event
export const confirmEventParticipation = async (groupId, eventId) => {
  try {
    const response = await api.post(`/events/${eventId}/participate`);
    return {
      success: true,
      data: response.data,
      message: 'Đã xác nhận tham gia sự kiện'
    };
  } catch (error) {
    console.error('❌ Error confirming event participation:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Không thể xác nhận tham gia'
    };
  }
};