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
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';

// icons
import PlusOutlined from '@ant-design/icons/PlusOutlined';
import EditOutlined from '@ant-design/icons/EditOutlined';
import StopOutlined from '@ant-design/icons/StopOutlined';
import CheckCircleOutlined from '@ant-design/icons/CheckCircleOutlined';

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

  // Modal state
  const [open, setOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [formData, setFormData] = useState({
    user_id: '',
    name: '',
    email: '',
    role: 'student',
    department: '',
    password: ''
  });

  const fetchUsers = () => {
    setLoading(true);
    client
      .get('/users/')
      .then((res) => setUsers(res.data))
      .catch(() => setError('Could not load users. Make sure you are logged in as Administrator.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpen = (user = null) => {
    if (user) {
      setIsEdit(true);
      setFormData({
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department || '',
        password: '' // empty for edit
      });
    } else {
      setIsEdit(false);
      setFormData({
        user_id: '',
        name: '',
        email: '',
        role: 'student',
        department: '',
        password: ''
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      if (isEdit) {
        await client.patch(`/users/${formData.user_id}`, {
          name: formData.name,
          role: formData.role,
          department: formData.department
        });
      } else {
        await client.post('/users/', {
          name: formData.name,
          email: formData.email,
          role: formData.role,
          department: formData.department,
          password: formData.password
        });
      }
      handleClose();
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.detail || 'An error occurred');
    }
  };

  const handleToggleStatus = async (user) => {
    try {
      await client.patch(`/users/${user.user_id}/toggle-status`);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.detail || 'An error occurred');
    }
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h5">User Management</Typography>
          <Typography variant="body2" color="text.secondary">
            All registered users in SmartPost
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <Chip label={`${users.length} users`} color="primary" variant="outlined" />
          <Button variant="contained" startIcon={<PlusOutlined />} onClick={() => handleOpen()}>
            Add User
          </Button>
        </Stack>
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
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.user_id} hover>
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={1.5}>
                        <Avatar sx={{ width: 36, height: 36, fontSize: 13, fontWeight: 600, bgcolor: 'primary.main' }}>
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
                      <Chip label={ROLE_LABELS[user.role] || user.role} color={ROLE_COLORS[user.role] || 'default'} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{user.department || '—'}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={user.is_active ? 'Active' : 'Inactive'} color={user.is_active ? 'success' : 'default'} size="small" />
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
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <IconButton size="small" color="primary" onClick={() => handleOpen(user)} title="Edit User">
                          <EditOutlined />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          color={user.is_active ? "error" : "success"} 
                          onClick={() => handleToggleStatus(user)} 
                          title={user.is_active ? "Deactivate User" : "Activate User"}
                        >
                          {user.is_active ? <StopOutlined /> : <CheckCircleOutlined />}
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
                {users.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">No users found.</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </MainCard>

      {/* User Form Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{isEdit ? 'Edit User' : 'Add New User'}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              fullWidth
              required
            />
            <TextField
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              fullWidth
              required
              disabled={isEdit} // Cannot edit email
            />
            <TextField
              select
              label="Role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              fullWidth
              required
            >
              {Object.entries(ROLE_LABELS).map(([value, label]) => (
                <MenuItem key={value} value={value}>
                  {label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Department (Optional)"
              name="department"
              value={formData.department}
              onChange={handleChange}
              fullWidth
            />
            {!isEdit && (
              <TextField
                label="Temporary Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                fullWidth
                required
              />
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="error">
            Cancel
          </Button>
          <Button onClick={handleSubmit} variant="contained">
            {isEdit ? 'Save Changes' : 'Create User'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
