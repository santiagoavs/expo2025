// src/pages/NotFound404/NotFound404.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Container, 
  CircularProgress,
  Paper,
  Fade,
  LinearProgress
} from '@mui/material';
import { Warning, ArrowRight } from '@phosphor-icons/react';

const NotFound404 = () => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Actualizar el progreso de la barra
    const progressInterval = setInterval(() => {
      setProgress((prevProgress) => {
        const increment = 100 / 50; // 50 intervals en 5 segundos
        return prevProgress + increment;
      });
    }, 100);

    // Countdown y redirección
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          navigate('/catalog-management', { replace: true });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(progressInterval);
      clearInterval(countdownInterval);
    };
  }, [navigate]);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #010326 0%, #032CA6 50%, #1F64BF 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 2
      }}
    >
      <Container maxWidth="sm">
        <Fade in timeout={1000}>
          <Paper
            elevation={24}
            sx={{
              borderRadius: 4,
              p: 6,
              textAlign: 'center',
              background: 'rgba(255, 255, 255, 0.98)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(31, 100, 191, 0.2)',
              boxShadow: '0 20px 40px rgba(1, 3, 38, 0.3)'
            }}
          >
            {/* Icono principal */}
            <Box
              sx={{
                width: 120,
                height: 120,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #040DBF, #1F64BF)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 3rem auto',
                boxShadow: '0 10px 30px rgba(4, 13, 191, 0.3)'
              }}
            >
              <Warning size={60} color="#FFFFFF" weight="duotone" />
            </Box>

            {/* Título principal */}
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: '4rem', md: '6rem' },
                fontWeight: 800,
                background: 'linear-gradient(135deg, #010326, #032CA6)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 2,
                letterSpacing: '-0.02em'
              }}
            >
              404
            </Typography>

            {/* Subtítulo */}
            <Typography
              variant="h4"
              sx={{
                color: '#010326',
                mb: 2,
                fontWeight: 600,
                fontSize: { xs: '1.5rem', md: '2rem' }
              }}
            >
              Página No Encontrada
            </Typography>

            {/* Descripción */}
            <Typography
              variant="body1"
              sx={{
                color: '#032CA6',
                mb: 4,
                fontSize: '1.1rem',
                lineHeight: 1.6,
                maxWidth: '400px',
                mx: 'auto'
              }}
            >
              La página que buscas no existe en el panel administrativo.
              Te redirigiremos automáticamente al dashboard principal.
            </Typography>

            {/* Contador y progreso */}
            <Box sx={{ mb: 4 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 2,
                  mb: 3
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    color: '#010326',
                    fontWeight: 600
                  }}
                >
                  Redirigiendo en
                </Typography>
                
                <Box
                  sx={{
                    width: 50,
                    height: 50,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #1F64BF, #040DBF)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FFFFFF',
                    fontSize: '1.5rem',
                    fontWeight: 700,
                    boxShadow: '0 4px 15px rgba(31, 100, 191, 0.4)'
                  }}
                >
                  {countdown}
                </Box>
                
                <Typography
                  variant="h6"
                  sx={{
                    color: '#010326',
                    fontWeight: 600
                  }}
                >
                  segundo{countdown !== 1 ? 's' : ''}
                </Typography>
              </Box>

              {/* Barra de progreso */}
              <Box sx={{ width: '100%', mb: 2 }}>
                <LinearProgress
                  variant="determinate"
                  value={progress}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: 'rgba(31, 100, 191, 0.2)',
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 4,
                      background: 'linear-gradient(90deg, #1F64BF, #040DBF)'
                    }
                  }}
                />
              </Box>

              {/* Indicador de redirección */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 1,
                  color: '#032CA6',
                  fontSize: '0.95rem',
                  fontWeight: 500
                }}
              >
                <Typography variant="body2">
                  Ir a Gestión de Catálogo
                </Typography>
                <ArrowRight size={16} weight="bold" />
              </Box>
            </Box>

            {/* Indicador de carga decorativo */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                opacity: 0.7
              }}
            >
              <CircularProgress
                size={24}
                thickness={6}
                sx={{
                  color: '#1F64BF'
                }}
              />
            </Box>
          </Paper>
        </Fade>
      </Container>
    </Box>
  );
};

export default NotFound404;