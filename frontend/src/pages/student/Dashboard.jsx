// material-ui
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid2';
import MainCard from 'components/MainCard';

// project imports

// ==============================|| STUDENT DASHBOARD ||============================== //

export default function StudentDashboard() {
  return (
    <Grid container rowSpacing={4.5} columnSpacing={2.75}>
      {/* row 1 */}
      <Grid size={12} sx={{ mb: -2.25 }}>
        <Typography variant="h5">Welcome back, Jane</Typography>
        <Typography variant="body2" color="textSecondary">
          Here is the status of your academic postponement requests.
        </Typography>
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
        <MainCard title="Total Requests" content={false}>
          <Typography variant="h3" sx={{ p: 2 }}>2</Typography>
        </MainCard>
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
        <MainCard title="Pending Approval" content={false}>
          <Typography variant="h3" color="warning.main" sx={{ p: 2 }}>1</Typography>
        </MainCard>
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
        <MainCard title="Approved" content={false}>
          <Typography variant="h3" color="success.main" sx={{ p: 2 }}>1</Typography>
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
