import { useState } from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import MainCard from 'components/MainCard';
import client from 'api/client';
import { useSnackbar } from 'contexts/SnackbarContext';

export default function ChangePassword() {
  const snackbar = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ current_password: '', new_password: '', confirm_password: '' });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.new_password !== form.confirm_password) {
      snackbar('New passwords do not match.', { severity: 'error' });
      return;
    }
    if (form.new_password.length < 6) {
      snackbar('New password must be at least 6 characters.', { severity: 'error' });
      return;
    }
    setLoading(true);
    try {
      await client.post('/auth/change-password', {
        current_password: form.current_password,
        new_password: form.new_password,
      });
      snackbar('Password changed successfully.', { severity: 'success' });
      setForm({ current_password: '', new_password: '', confirm_password: '' });
    } catch (err) {
      snackbar(err.response?.data?.detail || 'Failed to change password.', { severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 480, mx: 'auto' }}>
      <Stack spacing={1} sx={{ mb: 3 }}>
        <Typography variant="h5">Change Password</Typography>
        <Typography variant="body2" color="text.secondary">
          Update your account password.
        </Typography>
      </Stack>

      <MainCard>
        <form onSubmit={handleSubmit}>
          <Stack spacing={3}>
            <TextField
              fullWidth
              type="password"
              label="Current Password"
              name="current_password"
              value={form.current_password}
              onChange={handleChange}
              required
            />
            <TextField
              fullWidth
              type="password"
              label="New Password"
              name="new_password"
              value={form.new_password}
              onChange={handleChange}
              required
              helperText="At least 6 characters"
            />
            <TextField
              fullWidth
              type="password"
              label="Confirm New Password"
              name="confirm_password"
              value={form.confirm_password}
              onChange={handleChange}
              required
            />
            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? 'Changing...' : 'Change Password'}
            </Button>
          </Stack>
        </form>
      </MainCard>
    </Box>
  );
}
