import { FileText, Clock, CheckCircle, AlertCircle } from 'lucide-react';

export default function StudentDashboard() {
  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--color-slate-900)' }}>Welcome back, Jane</h1>
        <p style={{ color: 'var(--color-slate-500)', marginTop: '0.25rem' }}>Here is the status of your academic postponement requests.</p>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'var(--color-primary-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary-600)' }}>
            <FileText size={24} />
          </div>
          <div>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-slate-500)', fontWeight: 500 }}>Total Requests</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-slate-900)' }}>2</p>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#b45309' }}>
            <Clock size={24} />
          </div>
          <div>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-slate-500)', fontWeight: 500 }}>Pending Approval</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-slate-900)' }}>1</p>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#047857' }}>
            <CheckCircle size={24} />
          </div>
          <div>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-slate-500)', fontWeight: 500 }}>Approved</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-slate-900)' }}>1</p>
          </div>
        </div>
      </div>

      {/* Recent Requests Table */}
      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 className="card-title">Recent Requests</h2>
          <button className="btn btn-primary">New Request</button>
        </div>
        
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-slate-200)', color: 'var(--color-slate-500)', fontSize: '0.875rem' }}>
                <th style={{ padding: '1rem 0' }}>Request ID</th>
                <th style={{ padding: '1rem 0' }}>Academic Year</th>
                <th style={{ padding: '1rem 0' }}>Scope</th>
                <th style={{ padding: '1rem 0' }}>Submitted On</th>
                <th style={{ padding: '1rem 0' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid var(--color-slate-100)' }}>
                <td style={{ padding: '1rem 0', fontWeight: 500, color: 'var(--color-primary-600)' }}>REQ-2025-084</td>
                <td style={{ padding: '1rem 0', color: 'var(--color-slate-700)' }}>2025/2026</td>
                <td style={{ padding: '1rem 0', color: 'var(--color-slate-700)' }}>Full Semester 1</td>
                <td style={{ padding: '1rem 0', color: 'var(--color-slate-700)' }}>Oct 12, 2025</td>
                <td style={{ padding: '1rem 0' }}><span className="badge badge-warning">Pending HOD</span></td>
              </tr>
              <tr>
                <td style={{ padding: '1rem 0', fontWeight: 500, color: 'var(--color-primary-600)' }}>REQ-2024-021</td>
                <td style={{ padding: '1rem 0', color: 'var(--color-slate-700)' }}>2024/2025</td>
                <td style={{ padding: '1rem 0', color: 'var(--color-slate-700)' }}>Specific Modules (2)</td>
                <td style={{ padding: '1rem 0', color: 'var(--color-slate-700)' }}>Feb 04, 2024</td>
                <td style={{ padding: '1rem 0' }}><span className="badge badge-success">Approved</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
