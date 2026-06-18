import { lazy } from 'react';

// project imports
import Loadable from 'components/Loadable';
import DashboardLayout from 'layout/Dashboard';

const StudentDashboard = Loadable(lazy(() => import('pages/student/Dashboard')));
const NewRequest       = Loadable(lazy(() => import('pages/student/NewRequest')));
const MyRequests       = Loadable(lazy(() => import('pages/student/MyRequests')));
const Profile          = Loadable(lazy(() => import('pages/profile/index')));
const StaffDashboard   = Loadable(lazy(() => import('pages/staff/Dashboard')));
const StaffApprovals   = Loadable(lazy(() => import('pages/staff/Approvals')));
const StaffReports     = Loadable(lazy(() => import('pages/staff/Reports')));
const StaffSettings    = Loadable(lazy(() => import('pages/staff/Settings')));
const AdminDashboard   = Loadable(lazy(() => import('pages/admin/Dashboard')));
const AdminUsers       = Loadable(lazy(() => import('pages/admin/Users')));
const AdminAuditLog    = Loadable(lazy(() => import('pages/admin/AuditLog')));

// render - Placeholder pages
const Placeholder = Loadable(lazy(() => import('pages/extra-pages/sample-page')));

// ==============================|| MAIN ROUTING ||============================== //

const MainRoutes = {
  path: '/',
  element: <DashboardLayout />,
  children: [
    {
      path: '/',
      element: <StudentDashboard /> // Default for unauthenticated / student
    },
    {
      path: 'profile',
      element: <Profile />
    },
    // Student Routes
    {
      path: 'student',
      children: [
        { path: 'dashboard',   element: <StudentDashboard /> },
        { path: 'new-request', element: <NewRequest /> },
        { path: 'my-requests', element: <MyRequests /> },
        { path: 'profile',     element: <Profile /> }
      ]
    },
    // Staff Routes (HoD, Campus Manager)
    {
      path: 'staff',
      children: [
        { path: 'dashboard', element: <StaffDashboard /> },
        { path: 'approvals', element: <StaffApprovals /> },
        { path: 'reports',   element: <StaffReports /> },
        { path: 'users',     element: <Placeholder /> },
        { path: 'settings',  element: <StaffSettings /> }
      ]
    },
    // Admin Routes
    {
      path: 'admin',
      children: [
        { path: 'dashboard', element: <AdminDashboard /> },
        { path: 'users',     element: <AdminUsers /> },
        { path: 'audit',     element: <AdminAuditLog /> },
        { path: 'settings',  element: <StaffSettings /> }
      ]
    }
  ]
};

export default MainRoutes;
