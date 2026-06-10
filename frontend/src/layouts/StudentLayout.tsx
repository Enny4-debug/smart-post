import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FilePlus, FileText, User, LogOut, GraduationCap } from 'lucide-react';

export default function StudentLayout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // TODO: Clear auth tokens
    navigate('/login');
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <GraduationCap className="sidebar-logo" size={28} />
          <span className="sidebar-logo">SmartPost</span>
        </div>
        
        <nav className="sidebar-nav">
          <NavLink 
            to="/student/dashboard" 
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <LayoutDashboard size={20} />
            Dashboard
          </NavLink>
          <NavLink 
            to="/student/new-request" 
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <FilePlus size={20} />
            New Postponement
          </NavLink>
          <NavLink 
            to="/student/my-requests" 
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <FileText size={20} />
            My Requests
          </NavLink>
          <NavLink 
            to="/student/profile" 
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <User size={20} />
            My Profile
          </NavLink>
        </nav>

        <div style={{ marginTop: 'auto', padding: '1rem' }}>
          <button onClick={handleLogout} className="btn" style={{ width: '100%', justifyContent: 'flex-start', color: 'var(--color-danger)' }}>
            <LogOut size={20} />
            Log Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        <header className="topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '0.875rem', fontWeight: 600 }}>Jane Doe</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-slate-500)' }}>ISMS Student</p>
            </div>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--color-primary-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary-600)', fontWeight: 'bold' }}>
              JD
            </div>
          </div>
        </header>
        
        <div className="page-container">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
