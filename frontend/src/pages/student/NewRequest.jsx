import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// material-ui
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid2';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Alert from '@mui/material/Alert';

// project imports
import MainCard from 'components/MainCard';
import client from 'api/client';

// ==============================|| STUDENT - NEW REQUEST ||============================== //

export default function NewRequest() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    academic_year: '2025/2026',
    semester: 1,
    scope: 'full_semester',
    reason: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await client.post('/requests/', {
        ...formData,
        semester: Number(formData.semester)
      });
      setSuccess(true);
      // Wait a bit, then redirect to my-requests (even if it's a placeholder for now)
      setTimeout(() => {
        navigate('/student/my-requests');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Stack spacing={1} sx={{ mb: 3 }}>
        <Typography variant="h5">New Postponement Request</Typography>
        <Typography variant="body2" color="text.secondary">
          Fill in the details below to formally request a postponement for the academic year or semester.
        </Typography>
      </Stack>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <MainCard title="Request Details">
            <form onSubmit={handleSubmit}>
              <Stack spacing={3}>
                {error && <Alert severity="error">{error}</Alert>}
                {success && <Alert severity="success">Request submitted successfully! Redirecting...</Alert>}

                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      select
                      label="Academic Year"
                      name="academic_year"
                      value={formData.academic_year}
                      onChange={handleChange}
                      required
                    >
                      <MenuItem value="2024/2025">2024/2025</MenuItem>
                      <MenuItem value="2025/2026">2025/2026</MenuItem>
                      <MenuItem value="2026/2027">2026/2027</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      select
                      label="Semester"
                      name="semester"
                      value={formData.semester}
                      onChange={handleChange}
                      required
                    >
                      <MenuItem value={1}>Semester 1</MenuItem>
                      <MenuItem value={2}>Semester 2</MenuItem>
                    </TextField>
                  </Grid>
                </Grid>

                <TextField
                  fullWidth
                  select
                  label="Postponement Scope"
                  name="scope"
                  value={formData.scope}
                  onChange={handleChange}
                  required
                >
                  <MenuItem value="full_semester">Full Semester / Year</MenuItem>
                  <MenuItem value="specific_modules">Specific Modules Only</MenuItem>
                </TextField>

                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Detailed Reason for Postponement"
                  name="reason"
                  placeholder="Explain why you are requesting this postponement (e.g., Medical reasons, financial constraints, etc.)"
                  value={formData.reason}
                  onChange={handleChange}
                  required
                />

                <Box sx={{ p: 2, border: '1px dashed grey', borderRadius: 1, bgcolor: 'grey.50' }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Supporting Evidence (Optional for now)
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Upload medical reports, sponsor letters, or other relevant documents.
                  </Typography>
                  <Button variant="outlined" component="label">
                    Upload File
                    <input type="file" hidden multiple accept=".pdf,.jpg,.png" />
                  </Button>
                </Box>

                <Stack direction="row" justifyContent="flex-end" spacing={2} sx={{ mt: 2 }}>
                  <Button variant="outlined" color="secondary" onClick={() => navigate('/student/dashboard')}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="contained" disabled={loading}>
                    {loading ? 'Submitting...' : 'Submit Request'}
                  </Button>
                </Stack>
              </Stack>
            </form>
          </MainCard>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <MainCard title="Guidelines">
            <Typography variant="body2" paragraph>
              <strong>1. Eligibility:</strong> Ensure you do not have any outstanding fees from previous semesters before requesting a postponement.
            </Typography>
            <Typography variant="body2" paragraph>
              <strong>2. Evidence:</strong> Strong supporting evidence (e.g., hospital letters stamped by a recognized doctor) speeds up the approval process.
            </Typography>
            <Typography variant="body2">
              <strong>3. Approval Flow:</strong> Your request will first be reviewed by the Head of Department (Academic), then HoD (Examinations), and finally the Campus Manager.
            </Typography>
          </MainCard>
        </Grid>
      </Grid>
    </Box>
  );
}
