// filepath: e:\web-doan-third\web-doan-cnpm\src\routes\AppRoutes.jsx
import { Routes, Route } from 'react-router-dom';
//Auth routes
import Home from '../pages/Auth/Home';
import Login from '../pages/Auth/Login';
import SignUp from '../pages/Auth/SignUp';
import ForgotPassword from '../pages/Auth/ForgotPassword';
import GoogleCallback from '../pages/Auth/GoogleCallback';
import GoogleLinkSuccess from '../pages/Auth/GoogleLinkSuccess';
import GoogleLinkError from '../pages/Auth/GoogleLinkError';
import AuthLayout from '../layouts/AuthLayout';
// Layouts
import MemberLayout from '../layouts/MemberLayout';
import AdminLayout from '../layouts/AdminLayout';
import EnterpriseLayout from '../layouts/EnterpriseLayout';
//Member routes
import Dashboard from '../pages/MemberDashboard';
import MemberProfile from '../pages/MemberDashboard/MemberProfile';
import MemberProfileEdit from '../pages/MemberDashboard/MemberProfileEdit';
import AboutUs from '../pages/AboutUs';
import GroupList from '../pages/MemberDashboard/GroupList';
//Admin routes
import AdminDashboard from '../pages/Admin/Dashboard';
import ManageUsers from '../pages/Admin/ManageUsers';
import ManageGroups from '../pages/Admin/ManageGroups/index.js';
import ManageEnterprises from '../pages/Admin/ManageEnterprises/index.js';
import PostApproval from '../pages/Admin/PostApproval/PostApproval.jsx';
//Leader area routes
import EventManager from '../pages/Group/LeaderArea/EventManager';
import EventUpdate from '../pages/Group/LeaderArea/EventManager/EventUpdate';
import TimeEditor from '../pages/Group/LeaderArea/TimeEditor';
import LocationPreference from '../pages/Group/LeaderArea/LocationPreference';
import GroupCalendar from '../pages/Group/LeaderArea/GroupCalendar';
import SuggestionList from '../pages/Group/LeaderArea/SuggestionList';
import Booking from '../pages/Group/LeaderArea/EventManager/Booking';
import EnterpriseSelection from '../pages/Group/LeaderArea/EnterpriseSelection';
import MyBookings from '../pages/Group/LeaderArea/MyBookings';
import BookingManagement from '../pages/Group/LeaderArea/BookingManagement/BookingManagement';
// Member area routes
import EventViewer from '../pages/Group/MemberArea/EventViewer';
import MemberTimeEditor from '../pages/Group/MemberArea/TimeEditor';
import MemberLocationPreference from '../pages/Group/MemberArea/LocationPreference';
import MemberGroupCalendar from '../pages/Group/MemberArea/GroupCalendar';
// Enterprise routes
import EnterpriseDashboard from '../pages/Enterprise';
import EnterprisePostsManager from '../pages/Enterprise/Posts';
import PostEditor from '../pages/Enterprise/Posts/PostsEditor';
import EnterpriseBookingManager from '../pages/Enterprise/BookingManager';
import EnterpriseProfile from '../pages/Enterprise/Profile';
import EnterpriseInformation from '../pages/EnterpriseInformation/EnterpriseInformation';
import EnterpriseAuth from '../pages/Auth/EnterpriseAuth/EnterpriseAuth';
import JoinGroup from '../pages/JoinGroup';
import ProtectedRoute from '../components/common/ProtectedRoute';
import RedirectIfAuthenticated from '../components/common/RedirectIfAuthenticated';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Auth routes */}
      <Route element={<AuthLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about-us" element={<AboutUs />} />
        <Route 
          path="/login" 
          element={
            <RedirectIfAuthenticated>
              <Login />
            </RedirectIfAuthenticated>
          } 
        />
        <Route 
          path="/signup" 
          element={
            <RedirectIfAuthenticated>
              <SignUp />
            </RedirectIfAuthenticated>
          } 
        />
        <Route 
          path="/forgot-password" 
          element={
            <RedirectIfAuthenticated>
              <ForgotPassword />
            </RedirectIfAuthenticated>
          } 
        />
        <Route 
          path="/enterprise-auth" 
          element={
            <RedirectIfAuthenticated>
              <EnterpriseAuth />
            </RedirectIfAuthenticated>
          } 
        />
      </Route>
      
      {/* Google Auth Callback Route */}
      <Route path="/auth/callback" element={<GoogleCallback />} />
      
      {/* Google Link Success Route */}
      <Route path="/auth/link-success" element={<GoogleLinkSuccess />} />
      
      {/* Google Link Error Route */}
      <Route path="/auth/link-error" element={<GoogleLinkError />} />
      
      {/* Join Group Route */}
      <Route path="/join/:inviteCode" element={<JoinGroup />} />
      
      {/* Member routes */}
      <Route element={
        <ProtectedRoute requiredRole="Member">
          <MemberLayout />
        </ProtectedRoute>
      }>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/groups" element={<GroupList />} />
        <Route path="/profile" element={<MemberProfile />} />
        <Route path="/profile/edit" element={<MemberProfileEdit />} />
      </Route>
      
      {/* Group routes */}
      <Route path="/groups/:groupId/event-manager" element={<EventManager />} />
      <Route path="/groups/:groupId/event-update" element={<EventUpdate />} />
      <Route path="/groups/:groupId/time-editor" element={<TimeEditor />} />
      <Route path="/groups/:groupId/location-preference" element={<LocationPreference />} />
      <Route path="/groups/:groupId/group-calendar" element={<GroupCalendar />} />
      <Route path="/groups/:groupId/suggestion-list" element={<SuggestionList />} />
      <Route path="/groups/:groupId/enterprise-selection/:eventId" element={<EnterpriseSelection />} />
      <Route path="/groups/:groupId/booking" element={<Booking />} />
      <Route path="/groups/:groupId/my-bookings" element={<MyBookings />} />
      <Route path="/groups/:groupId/booking-management" element={<BookingManagement />} />
      
      {/* Member routes for group functionality */}
      <Route path="/groups/:groupId/member/event-viewer" element={<EventViewer />} />
      <Route path="/groups/:groupId/member/time-editor" element={<MemberTimeEditor />} />      
      <Route path="/groups/:groupId/member/location-preference" element={<MemberLocationPreference />} />
      <Route path="/groups/:groupId/member/group-calendar" element={<MemberGroupCalendar />} />
      
      {/* Enterprise Information route */}
      <Route path="/enterprise/:id" element={<EnterpriseInformation />} />
      
      {/* Admin routes */}
      <Route element={
        <ProtectedRoute requiredRole="Admin">
          <AdminLayout />
        </ProtectedRoute>
      }>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<ManageUsers />} />
        <Route path="/admin/posts" element={<PostApproval />} />
        <Route path="/admin/groups" element={<ManageGroups />} />
        <Route path="/admin/enterprises" element={<ManageEnterprises />} />
      </Route>
      
      {/* Enterprise routes */}
      <Route element={
        <ProtectedRoute requiredRole="Enterprise">
          <EnterpriseLayout />
        </ProtectedRoute>
      }>
        <Route path="/enterprise" element={<EnterpriseDashboard />} />
        <Route path="/enterprise/dashboard" element={<EnterpriseDashboard />} />
        <Route path="/enterprise/posts" element={<EnterprisePostsManager />} />
        <Route path="/enterprise/posts/edit/:id" element={<PostEditor />} />
        <Route path="/enterprise/posts/new" element={<PostEditor />} />
        <Route path="/enterprise/booking" element={<EnterpriseBookingManager />} />
        <Route path="/enterprise/profile" element={<EnterpriseProfile />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;