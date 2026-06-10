import { Inbox, CheckSquare, AlertTriangle, TrendingUp } from 'lucide-react';

export default function StaffDashboard() {
  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--color-slate-900)' }}>Department Overview</h1>
        <p style={{ color: 'var(--color-slate-500)', marginTop: '0.25rem' }}>Computer Science Department — Academic Year 2025/2026</p>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'var(--color-primary-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary-600)' }}>
            <Inbox size={24} />
          </div>
          <div>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-slate-500)', fontWeight: 500 }}>Total Requests</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-slate-900)' }}>124</p>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderLeft: '4px solid var(--color-warning)' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#b45309' }}>
            <CheckSquare size={24} />
          </div>
          <div>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-slate-500)', fontWeight: 500 }}>Action Required</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-slate-900)' }}>12</p>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#b91c1c' }}>
            <AlertTriangle size={24} />
          </div>
          <div>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-slate-500)', fontWeight: 500 }}>Escalated</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-slate-900)' }}>3</p>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569' }}>
            <TrendingUp size={24} />
          </div>
          <div>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-slate-500)', fontWeight: 500 }}>Approval Rate</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-slate-900)' }}>87%</p>
          </div>
        </div>
      </div>

      {/* Pending Approvals Table */}
      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 className="card-title">Pending Your Approval</h2>
          <a href="#" style={{ fontSize: '0.875rem', color: 'var(--color-primary-600)', fontWeight: 500, textDecoration: 'none' }}>View All</a>
        </div>
        
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-slate-200)', color: 'var(--color-slate-500)', fontSize: '0.875rem' }}>
                <th style={{ padding: '1rem 0' }}>Student</th>
                <th style={{ padding: '1rem 0' }}>Request ID</th>
                <th style={{ padding: '1rem 0' }}>Scope</th>
                <th style={{ padding: '1rem 0' }}>Time Waiting</th>
                <th style={{ padding: '1rem 0', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid var(--color-slate-100)' }}>
                <td style={{ padding: '1rem 0' }}>
                  <p style={{ fontWeight: 500, color: 'var(--color-slate-900)' }}>Jane Doe</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-slate-500)' }}>IAA/2023/001</p>
                </td>
                <td style={{ padding: '1rem 0', color: 'var(--color-slate-700)' }}>REQ-2025-084</td>
                <td style={{ padding: '1rem 0', color: 'var(--color-slate-700)' }}>Full Semester 1</td>
                <td style={{ padding: '1rem 0', color: 'var(--color-warning)', fontWeight: 500 }}>42 hours</td>
                <td style={{ padding: '1rem 0', textAlign: 'right' }}>
                  <button className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.75rem' }}>Review</button>
                </td>
              </tr>
              <tr>
                <td style={{ padding: '1rem 0' }}>
                  <p style={{ fontWeight: 500, color: 'var(--color-slate-900)' }}>John Smith</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-slate-500)' }}>IAA/2024/112</p>
                </td>
                <td style={{ padding: '1rem 0', color: 'var(--color-slate-700)' }}>REQ-2025-089</td>
                <td style={{ padding: '1rem 0', color: 'var(--color-slate-700)' }}>Specific Modules (1)</td>
                <td style={{ padding: '1rem 0', color: 'var(--color-slate-700)' }}>12 hours</td>
                <td style={{ padding: '1rem 0', textAlign: 'right' }}>
                  <button className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.75rem' }}>Review</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
