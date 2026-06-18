import { useState, useEffect } from 'react';

import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid2';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Autocomplete from '@mui/material/Autocomplete';
import MainCard from 'components/MainCard';
import client from 'api/client';

const EDITOR_ROLES = ['administrator', 'campus_manager'];

const REASON_PRESETS = [
  'Financial constraints',
  'Medical reasons',
  'Family responsibilities',
  'Academic difficulties',
  'Employment opportunities',
  'Personal reasons',
  'Relocation',
  'Other'
];

export default function StaffSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [canEdit, setCanEdit] = useState(false);

  const [form, setForm] = useState({
    max_postponement_years: 2,
    fee_threshold: 0,
    hod_review_hours: 48,
    escalation_hours: 72,
    max_evidence_files: 10,
    max_evidence_size_bytes: 5242880,
    allowed_postponement_reasons: [],
  });

  useEffect(() => {
    const role = (localStorage.getItem('userRole') || '').toLowerCase();
    setCanEdit(EDITOR_ROLES.includes(role));
    client
      .get('/settings')
      .then((res) => {
        const d = res.data;
        setForm({
          max_postponement_years: d.max_postponement_years ?? 2,
          fee_threshold: d.fee_threshold ?? 0,
          hod_review_hours: d.hod_review_hours ?? 48,
          escalation_hours: d.escalation_hours ?? 72,
          max_evidence_files: d.max_evidence_files ?? 10,
          max_evidence_size_bytes: d.max_evidence_size_bytes ?? 5242880,
          allowed_postponement_reasons: d.allowed_postponement_reasons || [],
        });
      })
      .catch(() => setError('Failed to load settings.'))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleFileSizeChange = (e) => {
    const mb = parseFloat(e.target.value) || 0;
    setForm((prev) => ({ ...prev, max_evidence_size_bytes: Math.round(mb * 1048576) }));
  };

  const fileSizeMb = () => (form.max_evidence_size_bytes / 1048576).toFixed(1);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      await client.put('/settings', {
        max_postponement_years: parseFloat(form.max_postponement_years),
        fee_threshold: parseFloat(form.fee_threshold),
        hod_review_hours: parseInt(form.hod_review_hours, 10),
        escalation_hours: parseInt(form.escalation_hours, 10),
        max_evidence_files: parseInt(form.max_evidence_files, 10),
        max_evidence_size_bytes: parseInt(form.max_evidence_size_bytes, 10),
        allowed_postponement_reasons: form.allowed_postponement_reasons,
      });
      setSuccess(true);
    } catch {
      setError('Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">System Rules</Typography>
        {!canEdit && (
          <Chip label="Read-only" size="small" color="default" variant="outlined" />
        )}
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>Settings saved successfully.</Alert>}

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <MainCard title="Academic Rules">
            <Stack spacing={3}>
              <TextField
                label="Max Postponement Years"
                type="number"
                value={form.max_postponement_years}
                onChange={handleChange('max_postponement_years')}
                slotProps={{ htmlInput: { min: 0, max: 10, step: 0.5 } }}
                disabled={!canEdit}
                fullWidth
                helperText="Maximum cumulative postponement years allowed (0-10)"
              />
              <TextField
                label="Fee Threshold (TZS)"
                type="number"
                value={form.fee_threshold}
                onChange={handleChange('fee_threshold')}
                slotProps={{ htmlInput: { min: 0, step: 1000 } }}
                disabled={!canEdit}
                fullWidth
                helperText="Minimum fee balance required to apply"
              />
              <Autocomplete
                multiple
                freeSolo
                options={REASON_PRESETS}
                value={form.allowed_postponement_reasons || []}
                onChange={(_, val) => setForm((p) => ({ ...p, allowed_postponement_reasons: val }))}
                disabled={!canEdit}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip label={option} size="small" {...getTagProps({ index })} key={option} />
                  ))
                }
                renderInput={(params) => (
                  <TextField {...params} label="Allowed Reasons" helperText="Type to add new reason" />
                )}
              />
            </Stack>
          </MainCard>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <MainCard title="Approval Workflow">
            <Stack spacing={3}>
              <TextField
                label="HoD Review Hours"
                type="number"
                value={form.hod_review_hours}
                onChange={handleChange('hod_review_hours')}
                slotProps={{ htmlInput: { min: 1, max: 720 } }}
                disabled={!canEdit}
                fullWidth
                helperText="Hours before HoD must review (1-720)"
              />
              <TextField
                label="Escalation Hours"
                type="number"
                value={form.escalation_hours}
                onChange={handleChange('escalation_hours')}
                slotProps={{ htmlInput: { min: 1, max: 720 } }}
                disabled={!canEdit}
                fullWidth
                helperText="Hours before automatic escalation (1-720)"
              />
            </Stack>
          </MainCard>

          <MainCard title="Evidence Rules" sx={{ mt: 3 }}>
            <Stack spacing={3}>
              <TextField
                label="Max Evidence Files"
                type="number"
                value={form.max_evidence_files}
                onChange={handleChange('max_evidence_files')}
                slotProps={{ htmlInput: { min: 1, max: 50 } }}
                disabled={!canEdit}
                fullWidth
                helperText="Maximum files per request (1-50)"
              />
              <TextField
                label="Max File Size (MB)"
                type="number"
                value={fileSizeMb()}
                onChange={handleFileSizeChange}
                slotProps={{ htmlInput: { min: 0.1, max: 100, step: 0.1 } }}
                disabled={!canEdit}
                fullWidth
                helperText="Maximum file size in megabytes"
              />
            </Stack>
          </MainCard>

          {canEdit && (
            <Box sx={{ mt: 3, textAlign: 'right' }}>
              <Button variant="contained" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save Settings'}
              </Button>
            </Box>
          )}
        </Grid>
      </Grid>
    </Box>
  );
}