import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, CheckSquare, BarChart, Settings, Users, LogOut, Building2 } from 'lucide-react';

export default function StaffLayout() {
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
          <Building2 className="sidebar-logo" size={28} />
          <span className="sidebar-logo">SmartPost Staff</span>
        </div>
        
        <nav className="sidebar-nav">
          <NavLink 
            to="/staff/dashboard" 
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <LayoutDashboard size={20} />
            Overview
          </NavLink>
          <NavLink 
            to="/staff/approvals" 
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <CheckSquare size={20} />
            Pending Approvals
          </NavLink>
          <NavLink 
            to="/staff/reports" 
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <BarChart size={20} />
            Reports & Analytics
          </NavLink>
          
          <div style={{ margin: '1rem 0', padding: '0 1rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-slate-400)', textTransform: 'uppercase' }}>
            Administration
          </div>
          
          <NavLink 
            to="/staff/users" 
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <Users size={20} />
            Manage Users
          </NavLink>
          <NavLink 
            to="/staff/settings" 
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <Settings size={20} />
            System Rules
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
              <p style={{ fontSize: '0.875rem', fontWeight: 600 }}>Dr. Smith</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-slate-500)' }}>Academic HOD</p>
            </div>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--color-primary-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>
              DS
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
