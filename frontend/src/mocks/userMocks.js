// Mock data for users

// Mock users data
const mockUsers = [
  {
    id: '1',
    username: 'tranthi.b',
    password: '123456', // Thêm mật khẩu mặc định
    name: 'Trần Thị B',
    email: 'tranthi.b@example.com',
    avatar: 'https://i.pravatar.cc/150?img=1',
    role: 'member',
    phone: '0912345678',
    joinedDate: new Date(2023, 5, 15)
  },
  {
    id: '2',
    username: 'levan.c',
    name: 'Lê Văn C',
    email: 'levan.c@example.com',
    avatar: 'https://i.pravatar.cc/150?img=2',
    role: 'member',
    phone: '0923456789',
    joinedDate: new Date(2023, 6, 20)
  },
  {
    id: '3',
    username: 'phamthi.d',
    name: 'Phạm Thị D',
    email: 'phamthi.d@example.com',
    avatar: 'https://i.pravatar.cc/150?img=3',
    role: 'leader',
    phone: '0934567890',
    joinedDate: new Date(2023, 4, 10)
  },
  {
    id: '4',
    username: 'cafehoian',
    name: 'Cafe HoiAn',
    email: 'info@cafehoian.com',
    avatar: '',
    role: 'enterprise',
    phone: '0945678901',
    joinedDate: new Date(2023, 7, 5)
  },
  {
    id: '5',
    username: 'nguyenvan.e',
    name: 'Nguyễn Văn E',
    email: 'nguyenvan.e@example.com',
    avatar: 'https://i.pravatar.cc/150?img=5',
    role: 'member',
    phone: '0956789012',
    joinedDate: new Date(2023, 8, 12)
  },
  {
    id: '6',
    username: 'tranvan.f',
    name: 'Trần Văn F',
    email: 'tranvan.f@example.com',
    avatar: 'https://i.pravatar.cc/150?img=6',
    role: 'member',
    phone: '0967890123',
    joinedDate: new Date(2023, 9, 18)
  },
  {
    id: '7',
    username: 'admin',
    name: 'Admin',
    email: 'admin@example.com',
    avatar: 'https://i.pravatar.cc/150?img=7',
    role: 'admin',
    phone: '0978901234',
    joinedDate: new Date(2023, 1, 1)
  }
];

// Function to simulate authenticating a user
export const authenticateUser = (username, password) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const user = mockUsers.find(user => user.username === username);
      if (user && (user.password === password || password === '123456')) { // Cho phép mật khẩu mặc định là 123456
        // Loại bỏ mật khẩu trước khi trả về
        const { password: _, ...userWithoutPassword } = user;
        resolve({
          ...userWithoutPassword,
          token: 'mock-jwt-token-' + user.id
        });
      } else {
        reject(new Error('Tên đăng nhập hoặc mật khẩu không đúng'));
      }
    }, 500);
  });
};

// Function to get a user by ID
export const getUserById = (id) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const user = mockUsers.find(user => user.id === id);
      if (user) {
        resolve(user);
      } else {
        reject(new Error('User not found'));
      }
    }, 300);
  });
};

// Function to get all users
export const getUsers = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockUsers);
    }, 500);
  });
};

export default mockUsers;
