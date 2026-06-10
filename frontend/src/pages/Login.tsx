import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // For now, simple mock login logic
    if (email.includes('student')) {
      navigate('/student/dashboard');
    } else {
      navigate('/staff/dashboard');
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(135deg, var(--color-primary-50) 0%, #ffffff 100%)'
    }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', borderRadius: '1rem', backgroundColor: 'var(--color-primary-100)', color: 'var(--color-primary-600)', marginBottom: '1rem' }}>
            <GraduationCap size={32} />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-slate-900)' }}>SmartPost</h1>
          <p style={{ color: 'var(--color-slate-500)', fontSize: '0.875rem', marginTop: '0.5rem' }}>IAA College Digital Academic Postponement</p>
        </div>

        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label className="input-label">Email Address</label>
            <input 
              type="email" 
              className="input-field" 
              placeholder="e.g. student@iaacollege.ac.tz" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>

          <div className="input-group">
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <label className="input-label">Password</label>
              <a href="#" style={{ fontSize: '0.75rem', color: 'var(--color-primary-600)', textDecoration: 'none' }}>Forgot password?</a>
            </div>
            <input 
              type="password" 
              className="input-field" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
            Sign In
          </button>
        </form>
        
        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.75rem', color: 'var(--color-slate-500)' }}>
          Tip: Type "student" in email for Student Portal,<br/> or anything else for Staff Portal.
        </div>
      </div>
    </div>
  );
}
