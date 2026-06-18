import { useEffect, useState } from 'react';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid2';
import MainCard from 'components/MainCard';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Chip from '@mui/material/Chip';
import Link from '@mui/material/Link';
import apiClient from 'api/client';
import { useNavigate } from 'react-router-dom';

const STATUS_LABELS = {
  draft: 'Draft',
  pending_hod: 'Pending HoD Academic',
  pending_hod_exams: 'Pending HoD Exams',
  pending_manager: 'Pending Campus Manager',
  submitted: 'Submitted',
  ineligible: 'Ineligible',
  queried: 'Queried',
  approved: 'Approved',
  rejected: 'Rejected'
};

const STATUS_COLORS = {
  draft: 'default',
  pending_hod: 'warning',
  pending_hod_exams: 'warning',
  pending_manager: 'warning',
  submitted: 'info',
  ineligible: 'error',
  queried: 'warning',
  approved: 'success',
  rejected: 'error'
};

function formatDate(iso) {
  if (!iso) return '\u2014';
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [userRes, requestsRes] = await Promise.all([
          apiClient.get('/auth/me'),
          apiClient.get('/requests/my')
        ]);

        setUser(userRes.data);

        const allRequests = requestsRes.data || [];
        setRequests(allRequests.slice(0, 5));

        const pending = allRequests.filter(r =>
          ['pending_hod', 'pending_hod_exams', 'pending_manager'].includes(r.status)
        ).length;
        const approved = allRequests.filter(r => r.status === 'approved').length;

        setStats({
          total: allRequests.length,
          pending,
          approved
        });
      } catch {
        setError('Could not load your dashboard data.');
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
      <Grid size={12} sx={{ mb: -2.25 }}>
        {error && (
          <Typography color="error" variant="body1" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}
        <Typography variant="h5">Welcome back, {user?.name || 'Student'}</Typography>
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

      <Grid size={{ xs: 12, md: 7, lg: 8 }}>
        <MainCard
          title="Recent Requests"
          content={false}
          secondary={
            <Link component="button" variant="body2" onClick={() => navigate('/student/my-requests')}>
              View All
            </Link>
          }
        >
          {requests.length === 0 ? (
            <Typography sx={{ p: 2 }} color="text.secondary">No requests yet.</Typography>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Academic Year</TableCell>
                    <TableCell>Semester</TableCell>
                    <TableCell>Scope</TableCell>
                    <TableCell>Submitted</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {requests.map((req) => (
                    <TableRow key={req.request_id} hover sx={{ cursor: 'pointer' }} onClick={() => navigate('/student/my-requests')}>
                      <TableCell>
                        <Typography variant="body2">{req.academic_year}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">Semester {req.semester}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {req.scope === 'full_semester' ? 'Full Semester' : 'Specific Modules'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{formatDate(req.submitted_at || req.created_at)}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={STATUS_LABELS[req.status] || req.status}
                          color={STATUS_COLORS[req.status] || 'default'}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </MainCard>
      </Grid>
    </Grid>
  );
}