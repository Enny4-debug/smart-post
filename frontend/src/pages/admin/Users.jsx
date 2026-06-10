import { useState, useEffect } from 'react';

// material-ui
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';

// project imports
import MainCard from 'components/MainCard';
import client from 'api/client';

// ── Helpers ──────────────────────────────────────────────────────────────────

const ROLE_LABELS = {
  student: 'Student',
  administrator: 'Administrator',
  hod_academic: 'HoD Academic',
  hod_examinations: 'HoD Examinations',
  campus_manager: 'Campus Manager'
};

const ROLE_COLORS = {
  student: 'info',
  administrator: 'error',
  hod_academic: 'warning',
  hod_examinations: 'warning',
  campus_manager: 'secondary'
};

function getInitials(name = '') {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    client
      .get('/users/')
      .then((res) => setUsers(res.data))
      .catch(() => setError('Could not load users. Make sure you are logged in as Administrator.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h5">User Management</Typography>
          <Typography variant="body2" color="text.secondary">
            All registered users in SmartPost
          </Typography>
        </Box>
        <Chip label={`${users.length} users`} color="primary" variant="outlined" />
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
                  <TableCell>User</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Department</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Last Login</TableCell>
                  <TableCell>Joined</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.user_id} hover>
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={1.5}>
                        <Avatar
                          sx={{
                            width: 36,
                            height: 36,
                            fontSize: 13,
                            fontWeight: 600,
                            bgcolor: 'primary.main'
                          }}
                        >
                          {getInitials(user.name)}
                        </Avatar>
                        <Typography variant="body2" fontWeight={500}>
                          {user.name}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {user.email}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={ROLE_LABELS[user.role] || user.role}
                        color={ROLE_COLORS[user.role] || 'default'}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{user.department || '—'}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.is_active ? 'Active' : 'Inactive'}
                        color={user.is_active ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(user.last_login_at)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(user.created_at)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
                {users.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">No users found.</Typography>
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
