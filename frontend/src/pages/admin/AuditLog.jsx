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
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';

import MainCard from 'components/MainCard';
import client from 'api/client';

const ACTION_LABELS = {
  request_created: 'Request Created',
  request_submitted: 'Request Submitted',
  request_drafted: 'Request Drafted',
  verification_passed: 'Verification Passed',
  verification_failed: 'Verification Failed',
  approval_decision: 'Approval Decision',
  file_uploaded: 'File Uploaded',
  file_viewed: 'File Viewed',
  record_viewed: 'Record Viewed',
  record_retrieved: 'Record Retrieved',
  escalation_triggered: 'Escalation Triggered',
  reminder_sent: 'Reminder Sent',
  notification_sent: 'Notification Sent',
  user_created: 'User Created',
  user_updated: 'User Updated',
  user_deactivated: 'User Deactivated',
  rule_updated: 'Rule Updated',
  admin_override: 'Admin Override'
};

const ACTION_COLORS = {
  approval_decision: 'primary',
  user_created: 'success',
  user_deactivated: 'error',
  verification_failed: 'error',
  escalation_triggered: 'warning'
};

function formatDateTime(iso) {
  if (!iso) return '\u2014';
  return new Date(iso).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

export default function AdminAuditLog() {
  const [entries, setEntries] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [limit] = useState(100);

  const fetchLog = (append = false) => {
    setLoading(true);
    setError(null);
    client
      .get(`/admin/audit-log?limit=${limit}&offset=${append ? entries.length : 0}`)
      .then((res) => {
        setTotal(res.data.total);
        setEntries(append ? [...entries, ...res.data.entries] : res.data.entries);
      })
      .catch(() => setError('Could not load audit log.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLog();
  }, []);

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h5">Audit Log</Typography>
          <Typography variant="body2" color="text.secondary">
            Immutable record of all actions in the system ({total} entries)
          </Typography>
        </Box>
        <Button variant="outlined" onClick={() => fetchLog()} disabled={loading}>
          Refresh
        </Button>
      </Stack>

      <MainCard content={false}>
        {loading && entries.length === 0 ? (
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
                  <TableCell>Timestamp</TableCell>
                  <TableCell>User</TableCell>
                  <TableCell>Action</TableCell>
                  <TableCell>Entity</TableCell>
                  <TableCell>Details</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {entries.map((e) => (
                  <TableRow key={e.log_id} hover>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>
                      <Typography variant="body2">{formatDateTime(e.created_at)}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{e.user_name}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={ACTION_LABELS[e.action] || e.action}
                        color={ACTION_COLORS[e.action] || 'default'}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {e.entity_type || '\u2014'}
                        {e.entity_id && (
                          <Typography variant="caption" display="block" color="text.secondary">
                            {e.entity_id.slice(0, 8)}...
                          </Typography>
                        )}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {e.metadata && (
                        <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>
                          {JSON.stringify(e.metadata, null, 1)}
                        </Typography>
                      )}
                      {e.action === 'approval_decision' && e.metadata?.decision && (
                        <Chip
                          label={e.metadata.decision}
                          color={e.metadata.decision === 'approved' ? 'success' : e.metadata.decision === 'rejected' ? 'error' : 'warning'}
                          size="small"
                        />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {entries.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                      <Typography color="text.secondary">No audit log entries found.</Typography>
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