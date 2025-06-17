import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext.jsx';

export const useAuth = () => {
  // Sử dụng hook useContext để lấy giá trị từ AuthContext
  const context = useContext(AuthContext);
  
  // Trả về giá trị mặc định nếu AuthContext chưa được khởi tạo
  if (context === undefined) {
    return {
      user: null,
      isAuthenticated: false,
      login: () => {},
      logout: () => {},
      updateUser: () => {}
    };
  }
  
  return context;
};