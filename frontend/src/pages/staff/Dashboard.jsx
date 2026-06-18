// material-ui
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid2';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import MainCard from 'components/MainCard';

// react
import { useState, useEffect } from 'react';
import client from 'api/client';

// ==============================|| STAFF DASHBOARD ||============================== //

export default function StaffDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    client
      .get('/admin/stats')
      .then((res) => setStats(res.data))
      .catch(() => setError('Could not load stats.'))
      .finally(() => setLoading(false));
  }, []);

  const totalRequests = stats?.total_requests ?? 0;
  const actionRequired = stats?.action_required ?? 0;
  const totalApproved = stats?.total_approved ?? 0;
  const totalRejected = stats?.total_rejected ?? 0;

  return (
    <Grid container rowSpacing={4.5} columnSpacing={2.75}>
      {/* row 1 */}
      <Grid size={12} sx={{ mb: -2.25 }}>
        <Typography variant="h5">Department Overview</Typography>
        <Typography variant="body2" color="textSecondary">
          Computer Science Department — Academic Year 2025/2026
        </Typography>
      </Grid>

      {loading ? (
        <Grid size={12}>
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        </Grid>
      ) : error ? (
        <Grid size={12}>
          <Typography color="error">{error}</Typography>
        </Grid>
      ) : (
        <>
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <MainCard title="Total Requests" content={false}>
              <Typography variant="h3" sx={{ p: 2 }}>
                {totalRequests}
              </Typography>
            </MainCard>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <MainCard title="Action Required" content={false}>
              <Typography variant="h3" color="warning.main" sx={{ p: 2 }}>
                {actionRequired}
              </Typography>
            </MainCard>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <MainCard title="Approved" content={false}>
              <Typography variant="h3" color="success.main" sx={{ p: 2 }}>
                {totalApproved}
              </Typography>
            </MainCard>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <MainCard title="Rejected" content={false}>
              <Typography variant="h3" color="error.main" sx={{ p: 2 }}>
                {totalRejected}
              </Typography>
            </MainCard>
          </Grid>
        </>
      )}

      {/* row 2 */}
      <Grid size={{ xs: 12, md: 7, lg: 8 }}>
        <MainCard title="Pending Your Approval" content={false}>
          <Typography sx={{ p: 2 }}>Table coming soon...</Typography>
        </MainCard>
      </Grid>
    </Grid>
  );
}
