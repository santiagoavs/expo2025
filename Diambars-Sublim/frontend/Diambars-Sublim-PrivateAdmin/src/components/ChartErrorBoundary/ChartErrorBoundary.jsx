// src/components/ChartErrorBoundary/ChartErrorBoundary.jsx
import React from 'react';
import { Box, Typography, Alert, Button } from '@mui/material';
import { ChartBar, Warning } from '@phosphor-icons/react';

class ChartErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Actualizar el state para mostrar la UI de error
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('🚨 [ChartErrorBoundary] Error capturado:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            p: 3,
            textAlign: 'center',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
            border: '1px solid #F59E0B',
            minHeight: '200px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <Warning size={48} color="#F59E0B" weight="duotone" />
          <Typography variant="h6" sx={{ mt: 2, mb: 1, color: '#92400E' }}>
            Error al cargar el gráfico
          </Typography>
          <Typography variant="body2" sx={{ mb: 2, color: '#92400E', opacity: 0.8 }}>
            No se pudieron procesar los datos del gráfico. Esto puede deberse a datos faltantes o un error de conexión.
          </Typography>
          <Button
            variant="outlined"
            onClick={this.handleRetry}
            startIcon={<ChartBar size={16} />}
            sx={{
              borderColor: '#F59E0B',
              color: '#92400E',
              '&:hover': {
                borderColor: '#D97706',
                backgroundColor: 'rgba(245, 158, 11, 0.1)'
              }
            }}
          >
            Reintentar
          </Button>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ChartErrorBoundary;
