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
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Link from '@mui/material/Link';
import MainCard from 'components/MainCard';
import { useState, useEffect } from 'react';
import client from 'api/client';
import { useNavigate } from 'react-router-dom';

const ROLE_LABELS = {
  student: 'Student',
  administrator: 'Administrator',
  hod_academic: 'HoD Academic',
  hod_examinations: 'HoD Examinations',
  campus_manager: 'Campus Manager'
};

const ROLE_COLORS = {
  student: 'default',
  administrator: 'error',
  hod_academic: 'primary',
  hod_examinations: 'warning',
  campus_manager: 'success'
};

function formatDate(iso) {
  if (!iso) return '\u2014';
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([
      client.get('/admin/stats'),
      client.get('/users/'),
      client.get('/settings')
    ])
      .then(([statsRes, usersRes, configRes]) => {
        setStats(statsRes.data);
        setUsers((usersRes.data || []).slice(0, 5));
        setConfig(configRes.data);
      })
      .catch(() => setError('Could not load dashboard data.'))
      .finally(() => setLoading(false));
  }, []);

  const totalRequests = stats?.total_requests ?? 0;
  const actionRequired = stats?.action_required ?? 0;
  const totalApproved = stats?.total_approved ?? 0;
  const totalRejected = stats?.total_rejected ?? 0;

  const fileSizeMb = config ? (config.max_evidence_size_bytes / 1048576).toFixed(0) : '\u2014';

  return (
    <Grid container rowSpacing={4.5} columnSpacing={2.75}>
      <Grid size={12} sx={{ mb: -2.25 }}>
        <Typography variant="h5">System Overview</Typography>
        <Typography variant="body2" color="textSecondary">
          Administrator Dashboard — IAA College
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
          title="User Management"
          content={false}
          secondary={
            <Link component="button" variant="body2" onClick={() => navigate('/admin/users')}>
              View All
            </Link>
          }
        >
          {users.length === 0 ? (
            <Typography sx={{ p: 2 }} color="text.secondary">No users found.</Typography>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Created</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((u) => (
                    <TableRow key={u.user_id} hover sx={{ cursor: 'pointer' }} onClick={() => navigate('/admin/users')}>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>{u.name}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{u.email}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={ROLE_LABELS[u.role] || u.role}
                          color={ROLE_COLORS[u.role] || 'default'}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={u.is_active ? 'Active' : 'Inactive'}
                          color={u.is_active ? 'success' : 'error'}
                          size="small"
                          variant="filled"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{formatDate(u.created_at)}</Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </MainCard>
      </Grid>

      <Grid size={{ xs: 12, md: 5, lg: 4 }}>
        <MainCard
          title="System Rules"
          content={false}
          secondary={
            <Link component="button" variant="body2" onClick={() => navigate('/admin/settings')}>
              Edit
            </Link>
          }
        >
          {!config ? (
            <Typography sx={{ p: 2 }} color="text.secondary">No configuration loaded.</Typography>
          ) : (
            <Box sx={{ p: 2 }}>
              <Stack divider={<Divider />} spacing={1.5}>
                <Box>
                  <Typography variant="caption" color="text.secondary">Max Postponement Years</Typography>
                  <Typography variant="body2" fontWeight={600}>{config.max_postponement_years}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Fee Threshold</Typography>
                  <Typography variant="body2" fontWeight={600}>TZS {config.fee_threshold?.toLocaleString()}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">HoD Review Window</Typography>
                  <Typography variant="body2" fontWeight={600}>{config.hod_review_hours} hours</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Escalation Threshold</Typography>
                  <Typography variant="body2" fontWeight={600}>{config.escalation_hours} hours</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Max Evidence Files</Typography>
                  <Typography variant="body2" fontWeight={600}>{config.max_evidence_files} files</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Max File Size</Typography>
                  <Typography variant="body2" fontWeight={600}>{fileSizeMb} MB</Typography>
                </Box>
              </Stack>
            </Box>
          )}
        </MainCard>
      </Grid>
    </Grid>
  );
}