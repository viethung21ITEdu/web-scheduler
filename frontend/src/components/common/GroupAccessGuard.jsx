import React, { useEffect, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import GroupAccessDenied from '../layoutPrimitives/GroupAccessDenied';
import { canJoinGroup } from '../../services/groupService';

/**
 * Component làm nhiệm vụ bảo vệ truy cập vào các nhóm
 * Kiểm tra nếu người dùng có quyền truy cập nhóm trước khi hiển thị nội dung
 * 
 * @param {React.ReactNode} children - Component con được render nếu người dùng có quyền truy cập
 */
const GroupAccessGuard = ({ children }) => {
  const { groupId } = useParams();
  const [accessCheck, setAccessCheck] = useState({ loading: true, canAccess: false });

  useEffect(() => {
    // Kiểm tra xem người dùng có thể truy cập nhóm hay không
    const checkGroupAccess = () => {
      const hasAccess = canJoinGroup(groupId);
      setAccessCheck({ loading: false, canAccess: hasAccess });
    };

    checkGroupAccess();
  }, [groupId]);

  if (accessCheck.loading) {
    // Hiển thị trạng thái loading nếu đang kiểm tra
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!accessCheck.canAccess) {
    // Hiển thị thông báo từ chối truy cập nếu người dùng không có quyền
    return <GroupAccessDenied groupId={groupId} />;
  }

  // Render component con nếu người dùng có quyền truy cập
  return children;
};

export default GroupAccessGuard;
