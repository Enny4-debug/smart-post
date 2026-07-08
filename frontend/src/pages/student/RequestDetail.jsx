import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Divider from '@mui/material/Divider';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';

import MainCard from 'components/MainCard';
import client from 'api/client';

import ArrowLeftOutlined from '@ant-design/icons/ArrowLeftOutlined';
import DownloadOutlined from '@ant-design/icons/DownloadOutlined';
import EyeOutlined from '@ant-design/icons/EyeOutlined';
import CloseOutlined from '@ant-design/icons/CloseOutlined';

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
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

const ACTION_LABELS = {
  request_submitted: 'Request Submitted',
  request_auto_flagged: 'Auto-Flagged (Ineligible)',
  approval_decided: 'Decision Made',
  admin_override: 'Admin Override',
  evidence_uploaded: 'Document Uploaded',
  evidence_deleted: 'Document Deleted'
};

function formatBytes(bytes) {
  if (!bytes) return '—';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
}

export default function RequestDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [previewFile, setPreviewFile] = useState(null);

  useEffect(() => {
    client
      .get(`/requests/${id}`)
      .then((res) => { setData(res.data); setError(null); })
      .catch(() => setError('Could not load request details.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !data) {
    return (
      <Box sx={{ textAlign: 'center', py: 6 }}>
        <Typography color="error" gutterBottom>{error || 'Request not found.'}</Typography>
        <Button onClick={() => navigate('/student/my-requests')}>Back to My Requests</Button>
      </Box>
    );
  }

  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
        <IconButton onClick={() => navigate('/student/my-requests')}>
          <ArrowLeftOutlined />
        </IconButton>
        <Box>
          <Typography variant="h5">Request Detail</Typography>
          <Typography variant="body2" color="text.secondary">
            {data.academic_year} — Semester {data.semester}
          </Typography>
        </Box>
      </Stack>

      <Grid container spacing={3}>
        {/* Info Card */}
        <Grid item xs={12} md={4}>
          <MainCard title="Request Info">
            <Stack spacing={1.5}>
              <Box>
                <Typography variant="caption" color="text.secondary">Status</Typography>
                <Box sx={{ mt: 0.5 }}>
                  <Chip
                    label={STATUS_LABELS[data.status] || data.status}
                    color={STATUS_COLORS[data.status] || 'default'}
                    size="small"
                    variant={data.status === 'approved' ? 'filled' : 'outlined'}
                  />
                </Box>
              </Box>
              <Divider />
              <Box>
                <Typography variant="caption" color="text.secondary">Academic Year</Typography>
                <Typography variant="body2">{data.academic_year}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Semester</Typography>
                <Typography variant="body2">{data.semester}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Scope</Typography>
                <Typography variant="body2">{SCOPE_LABELS[data.scope] || data.scope}</Typography>
              </Box>
              <Divider />
              <Box>
                <Typography variant="caption" color="text.secondary">Submitted</Typography>
                <Typography variant="body2">{formatDate(data.submitted_at || data.created_at)}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Reason</Typography>
                <Typography variant="body2">{data.reason}</Typography>
              </Box>
              {data.ineligibility_reason && (
                <>
                  <Divider />
                  <Box>
                    <Typography variant="caption" color="error">Ineligibility Reason</Typography>
                    <Typography variant="body2" color="error">{data.ineligibility_reason}</Typography>
                  </Box>
                  {data.ineligibility_detail && (
                    <Box>
                      <Typography variant="caption" color="error">Details</Typography>
                      <Typography variant="body2" color="error">{data.ineligibility_detail}</Typography>
                    </Box>
                  )}
                </>
              )}
            </Stack>
          </MainCard>
        </Grid>

        {/* Student Info */}
        <Grid item xs={12} md={4}>
          <MainCard title="Student Info">
            {data.student ? (
              <Stack spacing={1.5}>
                <Box>
                  <Typography variant="caption" color="text.secondary">Name</Typography>
                  <Typography variant="body2">{data.student.name}</Typography>
                </Box>
                <Divider />
                <Box>
                  <Typography variant="caption" color="text.secondary">Student #</Typography>
                  <Typography variant="body2">{data.student.student_number}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Program</Typography>
                  <Typography variant="body2">{data.student.program}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Year of Study</Typography>
                  <Typography variant="body2">{data.student.year_of_study || '—'}</Typography>
                </Box>
              </Stack>
            ) : (
              <Typography color="text.secondary">No student data</Typography>
            )}
          </MainCard>
        </Grid>

        {/* Approvals */}
        <Grid item xs={12} md={4}>
          <MainCard title="Approvals">
            {data.approvals && data.approvals.length > 0 ? (
              <Stack spacing={1.5}>
                {data.approvals.map((a) => (
                  <Box key={a.approval_id}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                        {a.approver_role.replace(/_/g, ' ')}
                      </Typography>
                      <Chip
                        label={a.decision}
                        color={a.decision === 'approved' ? 'success' : a.decision === 'rejected' ? 'error' : 'warning'}
                        size="small"
                        variant="outlined"
                      />
                    </Stack>
                    {a.comments && (
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                        "{a.comments}"
                      </Typography>
                    )}
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                      {formatDate(a.decided_at)}
                    </Typography>
                    <Divider sx={{ mt: 1 }} />
                  </Box>
                ))}
              </Stack>
            ) : (
              <Typography color="text.secondary">No approval actions yet</Typography>
            )}
          </MainCard>
        </Grid>

        {/* Evidence Files */}
        <Grid item xs={12}>
          <MainCard title="Documents" content={false}>
            {data.evidence_files && data.evidence_files.length > 0 ? (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>File Name</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Size</TableCell>
                      <TableCell>Uploaded</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data.evidence_files.map((ef) => (
                      <TableRow key={ef.evidence_id} hover>
                        <TableCell>
                          <Typography variant="body2">{ef.original_name}</Typography>
                        </TableCell>
                        <TableCell>
                          <Chip label={ef.file_type} size="small" variant="outlined" />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{formatBytes(ef.size_bytes)}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{formatDate(ef.uploaded_at)}</Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Stack direction="row" spacing={1} justifyContent="flex-end">
                            <IconButton
                              size="small"
                              onClick={() => setPreviewFile(ef)}
                            >
                              <EyeOutlined />
                            </IconButton>
                            <IconButton
                              size="small"
                              component="a"
                              href={`http://localhost:8001/api/v1/documents/download/${ef.evidence_id}`}
                              target="_blank"
                            >
                              <DownloadOutlined />
                            </IconButton>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Box sx={{ p: 3 }}>
                <Typography color="text.secondary">No documents uploaded.</Typography>
              </Box>
            )}
          </MainCard>
        </Grid>

        {/* Timeline */}
        <Grid item xs={12}>
          <MainCard title="Timeline / Audit Trail">
            {data.timeline && data.timeline.length > 0 ? (
              <Stack spacing={2} sx={{ position: 'relative', pl: 3 }}>
                {data.timeline.map((entry, idx) => (
                  <Box key={idx} sx={{ position: 'relative', pl: 3, borderLeft: '2px solid', borderColor: 'divider', ml: 1, pb: idx < data.timeline.length - 1 ? 2 : 0 }}>
                    <Box
                      sx={{
                        position: 'absolute',
                        left: -8,
                        top: 0,
                        width: 14,
                        height: 14,
                        borderRadius: '50%',
                        bgcolor: entry.action === 'request_submitted' ? 'info.main'
                          : entry.action === 'approval_decided' ? 'success.main'
                          : entry.action === 'admin_override' ? 'warning.main'
                          : 'grey.400'
                      }}
                    />
                    <Typography variant="body2" fontWeight={600}>
                      {ACTION_LABELS[entry.action] || entry.action}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      by {entry.user_name} — {formatDate(entry.timestamp)}
                    </Typography>
                    {entry.metadata && entry.metadata.comments && (
                      <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', mt: 0.5 }}>
                        "{entry.metadata.comments}"
                      </Typography>
                    )}
                  </Box>
                ))}
              </Stack>
            ) : (
              <Typography color="text.secondary">No timeline entries.</Typography>
            )}
          </MainCard>
        </Grid>
      </Grid>

      <Dialog open={!!previewFile} onClose={() => setPreviewFile(null)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">{previewFile?.original_name || 'Preview'}</Typography>
            <IconButton onClick={() => setPreviewFile(null)}><CloseOutlined /></IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center', minHeight: 400 }}>
          {previewFile && (
            previewFile.file_type?.startsWith('image/') ? (
              <Box
                component="img"
                src={`http://localhost:8001/api/v1/documents/download/${previewFile.evidence_id}`}
                alt={previewFile.original_name}
                sx={{ maxWidth: '100%', maxHeight: '70vh' }}
              />
            ) : previewFile.file_type === 'application/pdf' ? (
              <Box
                component="iframe"
                src={`http://localhost:8001/api/v1/documents/download/${previewFile.evidence_id}`}
                title={previewFile.original_name}
                sx={{ width: '100%', height: '70vh', border: 'none' }}
              />
            ) : (
              <Typography color="text.secondary">
                Preview not available.{' '}
                <a
                  href={`http://localhost:8001/api/v1/documents/download/${previewFile.evidence_id}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Download instead
                </a>
              </Typography>
            )
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}
