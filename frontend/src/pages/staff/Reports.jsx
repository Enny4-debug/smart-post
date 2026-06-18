import { useState, useEffect } from 'react';

import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid2';
import CircularProgress from '@mui/material/CircularProgress';
import Chip from '@mui/material/Chip';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import MainCard from 'components/MainCard';
import client from 'api/client';

import { PieChart } from '@mui/x-charts/PieChart';
import { BarChart } from '@mui/x-charts/BarChart';

const STATUS_LABELS = {
  pending_hod: 'Pending HoD Academic',
  pending_hod_exams: 'Pending HoD Exams',
  pending_manager: 'Pending Campus Manager',
  submitted: 'Submitted',
  ineligible: 'Ineligible',
  queried: 'Queried',
  approved: 'Approved',
  rejected: 'Rejected'
};

const STATUS_COLORS = {
  pending_hod: '#faad14',
  pending_hod_exams: '#faad14',
  pending_manager: '#faad14',
  submitted: '#1890ff',
  ineligible: '#ff4d4f',
  queried: '#ff7a45',
  approved: '#52c41a',
  rejected: '#ff4d4f'
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function StaffReports() {
  const [summary, setSummary] = useState(null);
  const [trends, setTrends] = useState(null);
  const [programs, setPrograms] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      setError(null);
      try {
        const [sumRes, trendRes, progRes, timeRes] = await Promise.all([
          client.get('/reports/summary'),
          client.get('/reports/trends?year=2026'),
          client.get('/reports/by-program'),
          client.get('/reports/approval-timeline')
        ]);
        setSummary(sumRes.data);
        setTrends(trendRes.data);
        setPrograms(progRes.data || []);
        setTimeline(timeRes.data || []);
      } catch {
        setError('Could not load report data.');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  const statusData = summary?.status_counts
    ? Object.entries(summary.status_counts)
        .filter(([_, count]) => count > 0)
        .map(([key, count]) => ({
          id: key,
          label: STATUS_LABELS[key] || key,
          value: count,
          color: STATUS_COLORS[key] || '#999'
        }))
    : [];

  const trendData = trends?.monthly || [];
  const hasTrendData = trendData.some((v) => v > 0);

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3 }}>Reports & Analytics</Typography>

      <Grid container spacing={3}>
        {/* KPI Cards */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MainCard>
            <Typography variant="subtitle2" color="text.secondary">Total Requests</Typography>
            <Typography variant="h3">{summary?.total || 0}</Typography>
          </MainCard>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MainCard>
            <Typography variant="subtitle2" color="text.secondary">Approved</Typography>
            <Typography variant="h3" color="success.main">{summary?.status_counts?.approved || 0}</Typography>
          </MainCard>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MainCard>
            <Typography variant="subtitle2" color="text.secondary">Rejected</Typography>
            <Typography variant="h3" color="error.main">{summary?.status_counts?.rejected || 0}</Typography>
          </MainCard>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MainCard>
            <Typography variant="subtitle2" color="text.secondary">Pending</Typography>
            <Typography variant="h3" color="warning.main">
              {(summary?.status_counts?.pending_hod || 0) +
                (summary?.status_counts?.pending_hod_exams || 0) +
                (summary?.status_counts?.pending_manager || 0)}
            </Typography>
          </MainCard>
        </Grid>

        {/* Status Distribution Pie Chart */}
        <Grid size={{ xs: 12, md: 6 }}>
          <MainCard title="Requests by Status">
            {statusData.length > 0 ? (
              <PieChart
                series={[{ data: statusData, innerRadius: 50, outerRadius: 120, paddingAngle: 2 }]}
                height={300}
                slotProps={{ legend: { direction: 'column', position: { vertical: 'middle', horizontal: 'right' } } }}
              />
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                No data yet
              </Typography>
            )}
          </MainCard>
        </Grid>

        {/* Monthly Trends Bar Chart */}
        <Grid size={{ xs: 12, md: 6 }}>
          <MainCard title={`Monthly Requests (${trends?.year || 2026})`}>
            {hasTrendData ? (
              <BarChart
                xAxis={[{ data: MONTHS, scaleType: 'band' }]}
                series={[{ data: trendData, color: '#1890ff' }]}
                height={300}
              />
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                No data yet
              </Typography>
            )}
          </MainCard>
        </Grid>

        {/* Approval Timeline */}
        <Grid size={{ xs: 12, md: 6 }}>
          <MainCard title="Average Approval Time">
            {timeline.length > 0 ? (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Approver Role</TableCell>
                      <TableCell align="right">Avg Time (hours)</TableCell>
                      <TableCell align="right">Decisions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {timeline.map((t) => (
                      <TableRow key={t.role}>
                        <TableCell>
                          <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                            {t.role.replace(/_/g, ' ')}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2">
                            {t.average_hours != null ? `${t.average_hours}h` : '\u2014'}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Chip label={t.total_decisions} size="small" variant="outlined" />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                No decisions yet
              </Typography>
            )}
          </MainCard>
        </Grid>

        {/* By Program */}
        <Grid size={{ xs: 12, md: 6 }}>
          <MainCard title="Requests by Programme">
            {programs.length > 0 ? (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Programme</TableCell>
                      <TableCell align="right">Requests</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {programs.map((p, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <Typography variant="body2">{p.program}</Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Chip label={p.count} size="small" color="primary" variant="outlined" />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                No data yet
              </Typography>
            )}
          </MainCard>
        </Grid>
      </Grid>
    </Box>
  );
}