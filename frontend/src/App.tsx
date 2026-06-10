import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Login from './pages/Login';
import StudentLayout from './layouts/StudentLayout';
import StaffLayout from './layouts/StaffLayout';

import StudentDashboard from './pages/student/Dashboard';
import StaffDashboard from './pages/staff/Dashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Route */}
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Student Portal */}
        <Route path="/student" element={<StudentLayout />}>
          <Route path="dashboard" element={<StudentDashboard />} />
          <Route path="new-request" element={<div className="card"><h2 className="card-title">New Request</h2><p>Form coming soon.</p></div>} />
          <Route path="my-requests" element={<div className="card"><h2 className="card-title">My Requests</h2><p>List coming soon.</p></div>} />
          <Route path="profile" element={<div className="card"><h2 className="card-title">My Profile</h2><p>Profile coming soon.</p></div>} />
        </Route>

        {/* Staff / Admin Portal */}
        <Route path="/staff" element={<StaffLayout />}>
          <Route path="dashboard" element={<StaffDashboard />} />
          <Route path="approvals" element={<div className="card"><h2 className="card-title">Pending Approvals</h2><p>Approval queue coming soon.</p></div>} />
          <Route path="reports" element={<div className="card"><h2 className="card-title">Reports</h2><p>Reports dashboard coming soon.</p></div>} />
          <Route path="users" element={<div className="card"><h2 className="card-title">Manage Users</h2><p>User management coming soon.</p></div>} />
          <Route path="settings" element={<div className="card"><h2 className="card-title">System Rules</h2><p>Config panel coming soon.</p></div>} />
        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
