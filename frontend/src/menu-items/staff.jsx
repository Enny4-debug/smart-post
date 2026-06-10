// assets
import { DashboardOutlined, CheckSquareOutlined, BarChartOutlined, TeamOutlined, SettingOutlined } from '@ant-design/icons';

// icons
const icons = {
  DashboardOutlined,
  CheckSquareOutlined,
  BarChartOutlined,
  TeamOutlined,
  SettingOutlined
};

const ROLE_LABELS = {
  student: 'Student',
  administrator: 'Administrator',
  hod_academic: 'HoD Academic',
  hod_examinations: 'HoD Examinations',
  campus_manager: 'Campus Manager'
};

const userRole = (localStorage.getItem('userRole') || 'staff').toLowerCase();
const displayRole = ROLE_LABELS[userRole] || 'Staff Portal';

// ==============================|| MENU ITEMS - STAFF ||============================== //

const staff = {
  id: 'group-staff',
  title: `${displayRole} Portal`,
  type: 'group',
  children: [
    {
      id: 'staff-dashboard',
      title: 'Overview',
      type: 'item',
      url: '/staff/dashboard',
      icon: icons.DashboardOutlined,
      breadcrumbs: false
    },
    {
      id: 'staff-approvals',
      title: 'Pending Approvals',
      type: 'item',
      url: '/staff/approvals',
      icon: icons.CheckSquareOutlined,
      breadcrumbs: false
    },
    {
      id: 'staff-reports',
      title: 'Reports & Analytics',
      type: 'item',
      url: '/staff/reports',
      icon: icons.BarChartOutlined,
      breadcrumbs: false
    },
    {
      id: 'staff-settings',
      title: 'System Rules',
      type: 'item',
      url: '/staff/settings',
      icon: icons.SettingOutlined,
      breadcrumbs: false
    }
  ]
};

export default staff;
