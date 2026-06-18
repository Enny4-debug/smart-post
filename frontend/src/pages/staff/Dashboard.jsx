import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid2';
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
import MainCard from 'components/MainCard';
import { useState, useEffect } from 'react';
import client from 'api/client';
import { useNavigate } from 'react-router-dom';

const STATUS_LABELS = {
  pending_hod: 'Pending HoD Academic',
  pending_hod_exams: 'Pending HoD Exams',
  pending_manager: 'Pending Campus Manager'
};

function formatDate(iso) {
  if (!iso) return '\u2014';
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function StaffDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([
      client.get('/admin/stats'),
      client.get('/approvals/pending')
    ])
      .then(([statsRes, pendingRes]) => {
        setStats(statsRes.data);
        setPending((pendingRes.data || []).slice(0, 5));
      })
      .catch(() => setError('Could not load dashboard data.'))
      .finally(() => setLoading(false));
  }, []);

  const totalRequests = stats?.total_requests ?? 0;
  const actionRequired = stats?.action_required ?? 0;
  const totalApproved = stats?.total_approved ?? 0;
  const totalRejected = stats?.total_rejected ?? 0;

  return (
    <Grid container rowSpacing={4.5} columnSpacing={2.75}>
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
              <Typography variant="h3" sx={{ p: 2 }}>{totalRequests}</Typography>
            </MainCard>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <MainCard title="Action Required" content={false}>
              <Typography variant="h3" color="warning.main" sx={{ p: 2 }}>{actionRequired}</Typography>
            </MainCard>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <MainCard title="Approved" content={false}>
              <Typography variant="h3" color="success.main" sx={{ p: 2 }}>{totalApproved}</Typography>
            </MainCard>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <MainCard title="Rejected" content={false}>
              <Typography variant="h3" color="error.main" sx={{ p: 2 }}>{totalRejected}</Typography>
            </MainCard>
          </Grid>
        </>
      )}

      <Grid size={{ xs: 12, md: 7, lg: 8 }}>
        <MainCard
          title="Pending Your Approval"
          content={false}
          secondary={
            <Link component="button" variant="body2" onClick={() => navigate('/staff/approvals')}>
              View All
            </Link>
          }
        >
          {pending.length === 0 ? (
            <Typography sx={{ p: 2 }} color="text.secondary">No requests pending your approval.</Typography>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Student</TableCell>
                    <TableCell>Program</TableCell>
                    <TableCell>Submitted</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pending.map((req) => (
                    <TableRow key={req.request_id} hover sx={{ cursor: 'pointer' }} onClick={() => navigate('/staff/approvals')}>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>
                          {req.student?.name || 'Unknown'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {req.student?.student_number || ''}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{req.student?.program || '\u2014'}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{formatDate(req.submitted_at || req.created_at)}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={STATUS_LABELS[req.status] || req.status}
                          color="warning"
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