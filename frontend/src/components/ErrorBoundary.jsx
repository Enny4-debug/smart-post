import { Component } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <Stack spacing={2} alignItems="center">
            <Typography variant="h3" color="error">
              Something went wrong
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400, textAlign: 'center' }}>
              {this.state.error?.message || 'An unexpected error occurred.'}
            </Typography>
            <Button variant="contained" onClick={() => { this.setState({ hasError: false, error: null }); window.location.href = '/'; }}>
              Reload
            </Button>
          </Stack>
        </Box>
      );
    }
    return this.props.children;
  }
}
