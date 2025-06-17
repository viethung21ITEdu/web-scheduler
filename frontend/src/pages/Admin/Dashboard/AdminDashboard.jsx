import React, { useState, useEffect } from 'react';
import { HiUsers, HiDocumentText, HiUserGroup, HiOfficeBuilding, HiExclamationCircle } from 'react-icons/hi';
import { useDialog } from '../../../components/common';
import { getDashboardStats } from '../../../services/adminService';

// Stat Card Component
const StatCard = ({ icon, title, stats, iconColor }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 flex flex-col">
      <div className="flex items-center mb-4">
        <div className={`p-3 rounded-full ${iconColor} text-white mr-4`}>
          {icon}
        </div>
        <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
      </div>
      
      <div className="flex-1 grid grid-cols-2 gap-4">
        {Object.entries(stats).map(([key, value]) => (
          <div key={key} className="flex flex-col">
            <span className="text-sm text-gray-500 capitalize">
              {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
            </span>
            <span className="text-xl font-bold text-gray-800">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Report Item Component
const ReportItem = ({ report }) => {
  const getStatusColor = () => {
    switch (report.status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'investigating': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = () => {
    switch (report.type) {
      case 'post': return <HiDocumentText className="h-5 w-5" />;
      case 'user': return <HiUsers className="h-5 w-5" />;
      case 'group': return <HiUserGroup className="h-5 w-5" />;
      case 'enterprise': return <HiOfficeBuilding className="h-5 w-5" />;
      default: return <HiExclamationCircle className="h-5 w-5" />;
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm flex items-center justify-between">
      <div className="flex items-center">
        <div className="bg-gray-100 p-2 rounded-lg mr-3">
          {getTypeIcon()}
        </div>
        <div>
          <h4 className="font-medium text-gray-800">{report.title}</h4>
          <p className="text-xs text-gray-500">
            Báo cáo ngày {new Date(report.date).toLocaleDateString('vi-VN')}
          </p>
        </div>
      </div>
      
      <div className="flex items-center">
        <span className={`px-3 py-1 text-xs rounded-full capitalize ${getStatusColor()}`}>
          {report.status}
        </span>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    userStats: { total: 0, active: 0, newToday: 0, newThisWeek: 0 },
    postStats: { total: 0, pending: 0, approved: 0, rejected: 0 },
    groupStats: { total: 0, active: 0, newThisWeek: 0 },
    enterpriseStats: { total: 0, active: 0 },
    recentReports: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { showDialog, DialogComponent } = useDialog();
  
  // Fetch dashboard data from API
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('📊 Fetching dashboard data...');
        
        const response = await getDashboardStats();
        console.log('✅ Dashboard data received:', response);
        
        if (response.success) {
          setStats(response.data);
        } else {
          throw new Error(response.message || 'Lỗi khi lấy dữ liệu dashboard');
        }
      } catch (error) {
        console.error('❌ Error fetching dashboard data:', error);
        setError(error.message);
        // Không gọi showDialog ở đây để tránh vòng lặp
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []); // Bỏ showDialog khỏi dependency array

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col h-full overflow-y-auto bg-gray-50 p-6">
        <div className="bg-white shadow-sm p-4 rounded-lg border-b mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-semibold text-gray-800">Trang quản trị</h1>
              <p className="text-sm text-gray-600">Đang tải dữ liệu...</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-600">Đang tải thống kê...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-gray-50 p-6">
      {/* Header area */}
      <div className="bg-white shadow-sm p-4 rounded-lg border-b mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-semibold text-gray-800">Trang quản trị</h1>
            <p className="text-sm text-gray-600">Thống kê và quản lý toàn hệ thống</p>
          </div>
          {error && (
            <div className="flex items-center text-red-600 text-sm">
              <span>Lỗi: {error}</span>
              <button 
                onClick={() => window.location.reload()} 
                className="ml-2 px-2 py-1 bg-red-100 text-red-700 rounded text-xs hover:bg-red-200"
              >
                Tải lại
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard 
          icon={<HiUsers className="h-6 w-6" />} 
          title="Người dùng" 
          stats={stats.userStats} 
          iconColor="bg-blue-500"
        />
        <StatCard 
          icon={<HiDocumentText className="h-6 w-6" />} 
          title="Bài đăng" 
          stats={stats.postStats} 
          iconColor="bg-amber-500"
        />
        <StatCard 
          icon={<HiUserGroup className="h-6 w-6" />} 
          title="Nhóm" 
          stats={stats.groupStats} 
          iconColor="bg-green-500"
        />
        <StatCard 
          icon={<HiOfficeBuilding className="h-6 w-6" />} 
          title="Doanh nghiệp" 
          stats={stats.enterpriseStats} 
          iconColor="bg-purple-500"
        />
      </div>
      
      {/* Recent reports */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-700">Báo cáo gần đây</h3>
          <button className="text-sm text-blue-600 hover:text-blue-800">Xem tất cả</button>
        </div>
        
        <div className="space-y-4">
          {stats.recentReports.map(report => (
            <ReportItem key={report.id} report={report} />
          ))}        </div>
      </div>
      <DialogComponent />
    </div>
  );
};

export default AdminDashboard;