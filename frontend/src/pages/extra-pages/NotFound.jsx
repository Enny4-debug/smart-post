import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <Stack spacing={2} alignItems="center">
        <Typography variant="h1" color="text.disabled" sx={{ fontSize: 120, fontWeight: 700 }}>
          404
        </Typography>
        <Typography variant="h5" color="text.secondary">
          Page Not Found
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 360, textAlign: 'center' }}>
          The page you are looking for does not exist or has been moved.
        </Typography>
        <Button variant="contained" onClick={() => navigate('/')}>
          Go Home
        </Button>
      </Stack>
    </Box>
  );
}
