// material-ui
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid2';
import MainCard from 'components/MainCard';

// project imports

// ==============================|| STAFF DASHBOARD ||============================== //

export default function StaffDashboard() {
  return (
    <Grid container rowSpacing={4.5} columnSpacing={2.75}>
      {/* row 1 */}
      <Grid size={12} sx={{ mb: -2.25 }}>
        <Typography variant="h5">Department Overview</Typography>
        <Typography variant="body2" color="textSecondary">
          Computer Science Department — Academic Year 2025/2026
        </Typography>
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
        <MainCard title="Total Requests" content={false}>
          <Typography variant="h3" sx={{ p: 2 }}>124</Typography>
        </MainCard>
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
        <MainCard title="Action Required" content={false}>
          <Typography variant="h3" color="warning.main" sx={{ p: 2 }}>12</Typography>
        </MainCard>
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
        <MainCard title="Escalated" content={false}>
          <Typography variant="h3" color="error.main" sx={{ p: 2 }}>3</Typography>
        </MainCard>
      </Grid>

      {/* row 2 */}
      <Grid size={{ xs: 12, md: 7, lg: 8 }}>
        <MainCard title="Pending Your Approval" content={false}>
          <Typography sx={{ p: 2 }}>Table coming soon...</Typography>
        </MainCard>
      </Grid>
    </Grid>
  );
}
