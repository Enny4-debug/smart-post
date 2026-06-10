// project import
import student from './student';
import staff from './staff';
import admin from './admin';

// ==============================|| MENU ITEMS ||============================== //

const role = (localStorage.getItem('userRole') || 'student').toLowerCase();

let items = [];

if (role === 'student') {
  items = [student];
} else if (role === 'administrator') {
  items = [admin];
} else {
  // hod_academic, hod_examinations, campus_manager
  items = [staff];
}

const menuItems = { items };

export default menuItems;
