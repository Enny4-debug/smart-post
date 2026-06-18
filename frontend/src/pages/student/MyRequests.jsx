import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

// material-ui
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';

// project imports
import MainCard from 'components/MainCard';
import client from 'api/client';

// icons
import PlusOutlined from '@ant-design/icons/PlusOutlined';

// ── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_LABELS = {
  draft: 'Draft',
  submitted: 'Submitted',
  ineligible: 'Ineligible',
  pending_hod: 'Pending HoD Academic',
  pending_hod_exams: 'Pending HoD Exams',
  pending_manager: 'Pending Campus Manager',
  queried: 'Queried',
  approved: 'Approved',
  rejected: 'Rejected'
};

const STATUS_COLORS = {
  draft: 'default',
  submitted: 'info',
  ineligible: 'error',
  pending_hod: 'warning',
  pending_hod_exams: 'warning',
  pending_manager: 'warning',
  queried: 'error',
  approved: 'success',
  rejected: 'error'
};

const SCOPE_LABELS = {
  full_semester: 'Full Semester/Year',
  specific_modules: 'Specific Modules'
};

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

// ==============================|| STUDENT - MY REQUESTS ||============================== //

export default function MyRequests() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const intervalRef = useRef(null);

  const fetchRequests = () => {
    client
      .get('/requests/my')
      .then((res) => { setRequests(res.data); setError(null); })
      .catch(() => setError('Could not load your requests.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRequests();
    intervalRef.current = setInterval(fetchRequests, 10000);
    return () => clearInterval(intervalRef.current);
  }, []);

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h5">My Postponement Requests</Typography>
          <Typography variant="body2" color="text.secondary">
            View the status of your submitted requests.
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<PlusOutlined />} onClick={() => navigate('/student/new-request')}>
          New Request
        </Button>
      </Stack>

      <MainCard content={false}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box sx={{ p: 3 }}>
            <Typography color="error">{error}</Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date Submitted</TableCell>
                  <TableCell>Academic Year</TableCell>
                  <TableCell>Semester</TableCell>
                  <TableCell>Scope</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {requests.map((req) => (
                  <TableRow key={req.request_id} hover>
                    <TableCell>
                      <Typography variant="body2">{formatDate(req.submitted_at || req.created_at)}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{req.academic_year}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">Semester {req.semester}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {SCOPE_LABELS[req.scope] || req.scope}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={STATUS_LABELS[req.status] || req.status}
                        color={STATUS_COLORS[req.status] || 'default'}
                        size="small"
                        variant={req.status === 'approved' ? 'filled' : 'outlined'}
                      />
                    </TableCell>
                  </TableRow>
                ))}
                {requests.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                      <Typography color="text.secondary" gutterBottom>
                        You haven't submitted any postponement requests yet.
                      </Typography>
                      <Button variant="outlined" sx={{ mt: 1 }} onClick={() => navigate('/student/new-request')}>
                        Submit a Request
                      </Button>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </MainCard>
    </Box>
  );
}
