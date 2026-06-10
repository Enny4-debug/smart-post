import { useState, useEffect } from 'react';

// material-ui
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid2';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Avatar from '@mui/material/Avatar';

// project imports
import MainCard from 'components/MainCard';
import client from 'api/client';

// ── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name = '') {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// ==============================|| PROFILE ||============================== //

export default function Profile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    department: '',
    profile_picture: ''
  });

  useEffect(() => {
    client
      .get('/users/me')
      .then((res) => {
        setFormData({
          name: res.data.name || '',
          email: res.data.email || '',
          role: res.data.role || '',
          department: res.data.department || '',
          profile_picture: res.data.profile_picture || ''
        });
      })
      .catch(() => setError('Could not load profile information.'))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Image size should be less than 2MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, profile_picture: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await client.patch('/users/me', {
        name: formData.name,
        profile_picture: formData.profile_picture
      });
      setSuccess(true);
      // Update local storage so the header updates instantly
      localStorage.setItem('userName', response.data.name);
      if (response.data.profile_picture) {
        localStorage.setItem('userAvatar', response.data.profile_picture);
      } else {
        localStorage.removeItem('userAvatar');
      }
      // force reload or dispatch event so header updates (simplified: just reload)
      window.location.reload();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update profile');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Stack spacing={1} sx={{ mb: 3 }}>
        <Typography variant="h5">Account Profile</Typography>
        <Typography variant="body2" color="text.secondary">
          View and edit your personal information.
        </Typography>
      </Stack>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <MainCard>
            <Stack spacing={2} alignItems="center">
              <Avatar
                src={formData.profile_picture}
                sx={{
                  width: 100,
                  height: 100,
                  fontSize: 32,
                  fontWeight: 600,
                  bgcolor: 'primary.main'
                }}
              >
                {getInitials(formData.name)}
              </Avatar>
              <Button variant="outlined" component="label" size="small">
                Upload Image
                <input type="file" hidden accept="image/*" onChange={handleImageChange} />
              </Button>
              <Box textAlign="center">
                <Typography variant="h5">{formData.name}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                  {formData.role.replace('_', ' ')}
                </Typography>
              </Box>
            </Stack>
          </MainCard>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <MainCard title="Edit Details">
            <form onSubmit={handleSubmit}>
              <Stack spacing={3}>
                {error && <Alert severity="error">{error}</Alert>}
                {success && <Alert severity="success">Profile updated successfully!</Alert>}

                <TextField
                  fullWidth
                  label="Full Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
                
                <TextField
                  fullWidth
                  label="Email Address"
                  name="email"
                  type="email"
                  value={formData.email}
                  disabled
                  helperText="You cannot change your email address."
                />

                <TextField
                  fullWidth
                  label="Department"
                  name="department"
                  value={formData.department || 'N/A'}
                  disabled
                />

                <Stack direction="row" justifyContent="flex-end">
                  <Button type="submit" variant="contained" disabled={saving}>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </Stack>
              </Stack>
            </form>
          </MainCard>
        </Grid>
      </Grid>
    </Box>
  );
}
