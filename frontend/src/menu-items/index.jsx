// project import
import student from './student';
import staff from './staff';

// ==============================|| MENU ITEMS ||============================== //

// For development/mocking, we display both menus.
// Once auth is connected, this will dynamically select based on user role.
const menuItems = {
  items: [student, staff]
};

export default menuItems;
