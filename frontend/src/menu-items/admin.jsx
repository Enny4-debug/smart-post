// assets
import {
  DashboardOutlined,
  TeamOutlined,
  SettingOutlined,
  AuditOutlined,
  SafetyOutlined
} from '@ant-design/icons';

// icons
const icons = {
  DashboardOutlined,
  TeamOutlined,
  SettingOutlined,
  AuditOutlined,
  SafetyOutlined
};

const ROLE_LABELS = {
  student: 'Student',
  administrator: 'Administrator',
  hod_academic: 'HoD Academic',
  hod_examinations: 'HoD Examinations',
  campus_manager: 'Campus Manager'
};

const userRole = (localStorage.getItem('userRole') || 'administrator').toLowerCase();
const displayRole = ROLE_LABELS[userRole] || 'Admin';

// ==============================|| MENU ITEMS - ADMIN ||============================== //

const admin = {
  id: 'group-admin',
  title: `${displayRole} Portal`,
  type: 'group',
  children: [
    {
      id: 'admin-dashboard',
      title: 'System Overview',
      type: 'item',
      url: '/admin/dashboard',
      icon: icons.DashboardOutlined,
      breadcrumbs: false
    },
    {
      id: 'admin-users',
      title: 'Manage Users',
      type: 'item',
      url: '/admin/users',
      icon: icons.TeamOutlined,
      breadcrumbs: false
    },
    {
      id: 'admin-audit',
      title: 'Audit Log',
      type: 'item',
      url: '/admin/audit',
      icon: icons.AuditOutlined,
      breadcrumbs: false
    },
    {
      id: 'admin-settings',
      title: 'System Rules',
      type: 'item',
      url: '/admin/settings',
      icon: icons.SettingOutlined,
      breadcrumbs: false
    }
  ]
};

export default admin;
