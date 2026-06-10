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

// ==============================|| MENU ITEMS - STAFF ||============================== //

const staff = {
  id: 'group-staff',
  title: 'Staff / Admin Portal',
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
      id: 'staff-users',
      title: 'Manage Users',
      type: 'item',
      url: '/staff/users',
      icon: icons.TeamOutlined,
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
