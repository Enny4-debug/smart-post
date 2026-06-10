import { useNavigate } from 'react-router-dom';

// ==============================|| HOOK — LOGOUT ||============================== //

export default function useLogout() {
  const navigate = useNavigate();

  const logout = () => {
    // Clear all auth tokens & user info from localStorage
    localStorage.removeItem('access_token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    // Redirect to login
    navigate('/login', { replace: true });
  };

  return logout;
}
