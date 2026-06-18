import { useState, useEffect } from 'react';

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
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';
import Grid from '@mui/material/Grid2';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';

import MainCard from 'components/MainCard';
import client from 'api/client';

import EyeOutlined from '@ant-design/icons/EyeOutlined';
import CheckCircleOutlined from '@ant-design/icons/CheckCircleOutlined';
import CloseCircleOutlined from '@ant-design/icons/CloseCircleOutlined';
import QuestionCircleOutlined from '@ant-design/icons/QuestionCircleOutlined';

const STATUS_LABELS = {
  pending_hod: 'Pending HoD Academic',
  pending_hod_exams: 'Pending HoD Exams',
  pending_manager: 'Pending Campus Manager'
};

const STATUS_COLORS = {
  pending_hod: 'warning',
  pending_hod_exams: 'warning',
  pending_manager: 'warning'
};

const SCOPE_LABELS = {
  full_semester: 'Full Semester/Year',
  specific_modules: 'Specific Modules'
};

function formatDate(iso) {
  if (!iso) return '\u2014';
  return new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

function formatDateTime(iso) {
  if (!iso) return '\u2014';
  return new Date(iso).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export default function StaffApprovals() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selected, setSelected] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const [decisionOpen, setDecisionOpen] = useState(false);
  const [decisionType, setDecisionType] = useState(null);
  const [comments, setComments] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const userRole = (localStorage.getItem('userRole') || '').toLowerCase();

  const fetchPending = () => {
    setLoading(true);
    setError(null);
    client
      .get('/approvals/pending')
      .then((res) => setRequests(res.data))
      .catch(() => setError('Could not load pending approvals.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleViewDetail = (req) => {
    setSelected(req);
    setDetailOpen(true);
  };

  const handleOpenDecision = (type) => {
    setDecisionType(type);
    setComments('');
    setSubmitError(null);
    setDecisionOpen(true);
  };

  const handleSubmitDecision = async () => {
    if (!selected) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      await client.post(`/approvals/${selected.request_id}/decide`, {
        decision: decisionType,
        comments: comments || null
      });
      setDecisionOpen(false);
      setDetailOpen(false);
      setSelected(null);
      fetchPending();
    } catch (err) {
      setSubmitError(err.response?.data?.detail || 'Failed to submit decision');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h5">Pending Approvals</Typography>
          <Typography variant="body2" color="text.secondary">
            Review and decide on postponement requests awaiting your approval.
          </Typography>
        </Box>
        <Stack direction="row" spacing={2} alignItems="center">
          <Chip label={`${requests.length} pending`} color="warning" variant="outlined" />
          <Button variant="outlined" onClick={fetchPending} disabled={loading}>
            Refresh
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
                  <TableCell>Student</TableCell>
                  <TableCell>Program</TableCell>
                  <TableCell>Academic Year</TableCell>
                  <TableCell>Semester</TableCell>
                  <TableCell>Scope</TableCell>
                  <TableCell>Submitted</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {requests.map((req) => (
                  <TableRow key={req.request_id} hover>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight={500}>
                          {req.student?.name || 'Unknown'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {req.student?.student_number || ''}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{req.student?.program || '\u2014'}</Typography>
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
                      <Typography variant="body2">{formatDate(req.submitted_at || req.created_at)}</Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="View Details">
                        <IconButton size="small" color="primary" onClick={() => handleViewDetail(req)}>
                          <EyeOutlined />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
                {requests.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                      <Typography color="text.secondary" gutterBottom>
                        No requests pending your approval.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </MainCard>

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} maxWidth="md" fullWidth>
        {selected && (
          <>
            <DialogTitle>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="h6">Request Details</Typography>
                <Chip
                  label={STATUS_LABELS[selected.status] || selected.status}
                  color={STATUS_COLORS[selected.status] || 'default'}
                  size="small"
                />
              </Stack>
            </DialogTitle>
            <DialogContent dividers>
              <Stack spacing={3}>
                {/* Student Info */}
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Student Information
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="body2">
                        <strong>Name:</strong> {selected.student?.name || 'Unknown'}
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="body2">
                        <strong>Student #:</strong> {selected.student?.student_number || 'Unknown'}
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="body2">
                        <strong>Program:</strong> {selected.student?.program || 'Unknown'}
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="body2">
                        <strong>Year of Study:</strong> {selected.student?.year_of_study || 'Unknown'}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>

                <Divider />

                {/* Request Info */}
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Request Information
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <Typography variant="body2">
                        <strong>Academic Year:</strong> {selected.academic_year}
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <Typography variant="body2">
                        <strong>Semester:</strong> {selected.semester}
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <Typography variant="body2">
                        <strong>Scope:</strong> {SCOPE_LABELS[selected.scope] || selected.scope}
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="body2">
                        <strong>Submitted:</strong> {formatDateTime(selected.submitted_at)}
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <Typography variant="body2">
                        <strong>Reason:</strong>
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, whiteSpace: 'pre-wrap' }}>
                        {selected.reason}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>

                {/* Modules */}
                {selected.modules && selected.modules.length > 0 && (
                  <>
                    <Divider />
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Affected Modules
                      </Typography>
                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        {selected.modules.map((m, i) => (
                          <Chip key={i} label={`${m.code} - ${m.name}`} size="small" variant="outlined" />
                        ))}
                      </Stack>
                    </Box>
                  </>
                )}

                {/* Evidence Files */}
                {selected.evidence_files && selected.evidence_files.length > 0 && (
                  <>
                    <Divider />
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Evidence Files
                      </Typography>
                      {selected.evidence_files.map((ef) => (
                        <Typography key={ef.evidence_id} variant="body2">
                          {ef.original_name} ({ef.file_type})
                        </Typography>
                      ))}
                    </Box>
                  </>
                )}
              </Stack>
            </DialogContent>
            <DialogActions sx={{ p: 2.5, gap: 1 }}>
              <Button onClick={() => setDetailOpen(false)} color="secondary">
                Close
              </Button>
              <Box sx={{ flex: 1 }} />
              <Button
                variant="outlined"
                color="error"
                startIcon={<CloseCircleOutlined />}
                onClick={() => { setDetailOpen(false); handleOpenDecision('rejected'); }}
              >
                Reject
              </Button>
              <Button
                variant="outlined"
                color="warning"
                startIcon={<QuestionCircleOutlined />}
                onClick={() => { setDetailOpen(false); handleOpenDecision('queried'); }}
              >
                Query
              </Button>
              <Button
                variant="contained"
                color="success"
                startIcon={<CheckCircleOutlined />}
                onClick={() => { setDetailOpen(false); handleOpenDecision('approved'); }}
              >
                Approve
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Decision Confirmation Dialog */}
      <Dialog open={decisionOpen} onClose={() => setDecisionOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {decisionType === 'approved' && 'Confirm Approval'}
          {decisionType === 'rejected' && 'Confirm Rejection'}
          {decisionType === 'queried' && 'Request More Information'}
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            {submitError && <Alert severity="error">{submitError}</Alert>}
            <Typography variant="body2" color="text.secondary">
              {decisionType === 'approved' && 'This will advance the request to the next approval stage.'}
              {decisionType === 'rejected' && 'This will mark the request as rejected. The student will be notified.'}
              {decisionType === 'queried' && 'The student will be asked to provide additional information.'}
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Comments (optional)"
              placeholder="Add any notes or instructions for the student..."
              value={comments}
              onChange={(e) => setComments(e.target.value)}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setDecisionOpen(false)} color="secondary" disabled={submitting}>
            Cancel
          </Button>
          <Box sx={{ flex: 1 }} />
          <Button
            variant="contained"
            color={decisionType === 'approved' ? 'success' : decisionType === 'rejected' ? 'error' : 'warning'}
            onClick={handleSubmitDecision}
            disabled={submitting}
          >
            {submitting
              ? 'Submitting...'
              : decisionType === 'approved'
                ? 'Confirm Approval'
                : decisionType === 'rejected'
                  ? 'Confirm Rejection'
                  : 'Send Query'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}