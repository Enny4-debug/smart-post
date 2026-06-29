import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid2';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import LinearProgress from '@mui/material/LinearProgress';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import DeleteOutlined from '@ant-design/icons/DeleteOutlined';
import FileAddOutlined from '@ant-design/icons/FileAddOutlined';
import UploadOutlined from '@ant-design/icons/UploadOutlined';

import MainCard from 'components/MainCard';
import client from 'api/client';

export default function NewRequest() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    academic_year: '2025/2026',
    semester: 1,
    scope: 'full_semester',
    reason: ''
  });

  const [selectedFiles, setSelectedFiles] = useState([]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileSelect = (e) => {
    const newFiles = Array.from(e.target.files || []);
    setSelectedFiles((prev) => [...prev, ...newFiles]);
    e.target.value = '';
  };

  const handleRemoveFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await client.post('/requests/', {
        ...formData,
        semester: Number(formData.semester)
      });

      const requestId = res.data.request_id;

      if (selectedFiles.length > 0) {
        setUploading(true);
        const uploadPromises = selectedFiles.map((file) => {
          const fd = new FormData();
          fd.append('file', file);
          return client.post(`/documents/${requestId}/upload`, fd);
        });
        await Promise.all(uploadPromises);
        setUploading(false);
      }

      setSuccess(true);
      setTimeout(() => {
        navigate('/student/my-requests');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  const totalSize = selectedFiles.reduce((sum, f) => sum + f.size, 0);

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
                {uploading && <LinearProgress />}

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
                  placeholder="Explain why you are requesting this postponement..."
                  value={formData.reason}
                  onChange={handleChange}
                  required
                />

                <Box sx={{ p: 2, border: '1px dashed', borderColor: 'divider', borderRadius: 1 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Supporting Evidence
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Upload medical reports, sponsor letters, or other relevant documents (PDF, JPG, PNG — max 5MB each).
                  </Typography>

                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<FileAddOutlined />}
                    disabled={loading}
                  >
                    Select Files
                    <input type="file" hidden multiple accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileSelect} />
                  </Button>

                  {selectedFiles.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <List dense disablePadding>
                        {selectedFiles.map((f, i) => (
                          <ListItem
                            key={i}
                            secondaryAction={
                              <IconButton edge="end" size="small" onClick={() => handleRemoveFile(i)}>
                                <DeleteOutlined />
                              </IconButton>
                            }
                          >
                            <ListItemText
                              primary={f.name}
                              secondary={`${(f.size / 1024).toFixed(1)} KB`}
                            />
                          </ListItem>
                        ))}
                      </List>
                      <Typography variant="caption" color="text.secondary">
                        Total: {selectedFiles.length} file(s), {(totalSize / 1024).toFixed(1)} KB
                      </Typography>
                    </Box>
                  )}
                </Box>

                <Stack direction="row" justifyContent="flex-end" spacing={2} sx={{ mt: 2 }}>
                  <Button variant="outlined" color="secondary" onClick={() => navigate('/student/dashboard')}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading}
                    startIcon={uploading ? <UploadOutlined /> : undefined}
                  >
                    {uploading ? 'Uploading files...' : loading ? 'Submitting...' : 'Submit Request'}
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