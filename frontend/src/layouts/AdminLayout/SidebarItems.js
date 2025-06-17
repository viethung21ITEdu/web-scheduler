import DashboardIcon from '@mui/icons-material/Dashboard';
import GroupIcon from '@mui/icons-material/Group';
import BusinessIcon from '@mui/icons-material/Business';
import ArticleIcon from '@mui/icons-material/Article';
import PeopleIcon from '@mui/icons-material/People';

const SidebarItems = [
  {
    title: 'Tổng quan',
    path: '/admin/dashboard',
    icon: <DashboardIcon />
  },
  {
    title: 'Quản lý người dùng',
    path: '/admin/users',
    icon: <PeopleIcon />
  },
  {
    title: 'Quản lý nhóm',
    path: '/admin/groups',
    icon: <GroupIcon />
  },
  {
    title: 'Quản lý doanh nghiệp',
    path: '/admin/enterprises',
    icon: <BusinessIcon />
  },
  {
    title: 'Quản lý bài đăng',
    path: '/admin/posts',
    icon: <ArticleIcon />
  }
];

export default SidebarItems; 