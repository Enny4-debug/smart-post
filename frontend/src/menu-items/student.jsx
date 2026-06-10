// assets
import { DashboardOutlined, FileAddOutlined, FileTextOutlined, UserOutlined } from '@ant-design/icons';

// icons
const icons = {
  DashboardOutlined,
  FileAddOutlined,
  FileTextOutlined,
  UserOutlined
};

// ==============================|| MENU ITEMS - STUDENT ||============================== //

const student = {
  id: 'group-student',
  title: 'Student Portal',
  type: 'group',
  children: [
    {
      id: 'student-dashboard',
      title: 'Dashboard',
      type: 'item',
      url: '/student/dashboard',
      icon: icons.DashboardOutlined,
      breadcrumbs: false
    },
    {
      id: 'student-new-request',
      title: 'New Postponement',
      type: 'item',
      url: '/student/new-request',
      icon: icons.FileAddOutlined,
      breadcrumbs: false
    },
    {
      id: 'student-my-requests',
      title: 'My Requests',
      type: 'item',
      url: '/student/my-requests',
      icon: icons.FileTextOutlined,
      breadcrumbs: false
    },
    {
      id: 'student-profile',
      title: 'My Profile',
      type: 'item',
      url: '/student/profile',
      icon: icons.UserOutlined,
      breadcrumbs: false
    }
  ]
};

export default student;
