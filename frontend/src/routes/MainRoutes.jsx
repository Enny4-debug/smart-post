import { lazy } from 'react';

// project imports
import Loadable from 'components/Loadable';
import DashboardLayout from 'layout/Dashboard';

// render - Dashboards
const StudentDashboard = Loadable(lazy(() => import('pages/student/Dashboard')));
const StaffDashboard   = Loadable(lazy(() => import('pages/staff/Dashboard')));
const AdminDashboard   = Loadable(lazy(() => import('pages/admin/Dashboard')));

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
    // Student Routes
    {
      path: 'student',
      children: [
        { path: 'dashboard',   element: <StudentDashboard /> },
        { path: 'new-request', element: <Placeholder /> },
        { path: 'my-requests', element: <Placeholder /> },
        { path: 'profile',     element: <Placeholder /> }
      ]
    },
    // Staff Routes (HoD, Campus Manager)
    {
      path: 'staff',
      children: [
        { path: 'dashboard', element: <StaffDashboard /> },
        { path: 'approvals', element: <Placeholder /> },
        { path: 'reports',   element: <Placeholder /> },
        { path: 'users',     element: <Placeholder /> },
        { path: 'settings',  element: <Placeholder /> }
      ]
    },
    // Admin Routes
    {
      path: 'admin',
      children: [
        { path: 'dashboard', element: <AdminDashboard /> },
        { path: 'users',     element: <Placeholder /> },
        { path: 'audit',     element: <Placeholder /> },
        { path: 'settings',  element: <Placeholder /> }
      ]
    }
  ]
};

export default MainRoutes;
