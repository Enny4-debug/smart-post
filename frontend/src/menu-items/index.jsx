// project import
import student from './student';
import staff from './staff';

// ==============================|| MENU ITEMS ||============================== //

const role = localStorage.getItem('userRole') || 'STUDENT'; // default to student

let items = [];

if (role === 'STUDENT') {
  items = [student];
} else {
  // admin or staff
  items = [staff];
}

const menuItems = {
  items
};

export default menuItems;
