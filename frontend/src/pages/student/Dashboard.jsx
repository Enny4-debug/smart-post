// material-ui
import { useEffect, useState } from 'react';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid2';
import MainCard from 'components/MainCard';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

// project imports
import apiClient from 'api/client';

// ==============================|| STUDENT DASHBOARD ||============================== //

export default function StudentDashboard() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Attempt to fetch current user and their requests
        const [userRes, requestsRes] = await Promise.all([
          apiClient.get('/auth/me'),
          apiClient.get('/requests/me')
        ]);

        setUser(userRes.data);
        
        const requests = requestsRes.data || [];
        const pending = requests.filter(r => r.status === 'PENDING_HOD' || r.status === 'PENDING_EXAMS' || r.status === 'PENDING_MANAGER').length;
        const approved = requests.filter(r => r.status === 'APPROVED').length;

        setStats({
          total: requests.length,
          pending,
          approved
        });
      } catch (err) {
        console.error("Error fetching dashboard data", err);
        setError("Could not load your dashboard data. Please make sure you are logged in.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Grid container rowSpacing={4.5} columnSpacing={2.75}>
      {/* row 1 */}
      <Grid size={12} sx={{ mb: -2.25 }}>
        {error && (
          <Typography color="error" variant="body1" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}
        <Typography variant="h5" sx={{ textTransform: 'capitalize' }}>Welcome back, {user?.first_name || 'Student'}</Typography>
        <Typography variant="body2" color="textSecondary">
          Here is the status of your academic postponement requests.
        </Typography>
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
        <MainCard title="Total Requests" content={false}>
          <Typography variant="h3" sx={{ p: 2 }}>{stats.total}</Typography>
        </MainCard>
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
        <MainCard title="Pending Approval" content={false}>
          <Typography variant="h3" color="warning.main" sx={{ p: 2 }}>{stats.pending}</Typography>
        </MainCard>
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
        <MainCard title="Approved" content={false}>
          <Typography variant="h3" color="success.main" sx={{ p: 2 }}>{stats.approved}</Typography>
        </MainCard>
      </Grid>

      {/* row 2 */}
      <Grid size={{ xs: 12, md: 7, lg: 8 }}>
        <MainCard title="Recent Requests" content={false}>
          <Typography sx={{ p: 2 }}>Table coming soon...</Typography>
        </MainCard>
      </Grid>
    </Grid>
  );
}
