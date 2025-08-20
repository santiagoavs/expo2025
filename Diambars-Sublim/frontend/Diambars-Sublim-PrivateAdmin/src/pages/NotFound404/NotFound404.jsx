// src/pages/NotFound404/NotFound404.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Container,
  Fade,
  Grow,
  Slide
} from '@mui/material';
import { Warning } from '@phosphor-icons/react';

const NotFound404 = () => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(2);
  const [progress, setProgress] = useState(0);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const showTimer = setTimeout(() => setShowContent(true), 300);

    const progressInterval = setInterval(() => {
      setProgress((prevProgress) => {
        const increment = 100 / 20;
        return Math.min(prevProgress + increment, 100);
      });
    }, 100);

    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setTimeout(() => {
            navigate('/catalog-management', { replace: true });
          }, 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearTimeout(showTimer);
      clearInterval(progressInterval);
      clearInterval(countdownInterval);
    };
  }, [navigate]);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100vw',
        // Fondo que empieza blanco y se oscurece progresivamente
        background: '#FFFFFF',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(ellipse at 25% 15%, rgba(31, 100, 191, 0.12) 0%, transparent 60%),
            radial-gradient(ellipse at 75% 25%, rgba(3, 44, 166, 0.10) 0%, transparent 65%),
            radial-gradient(ellipse at 20% 75%, rgba(4, 13, 191, 0.08) 0%, transparent 70%),
            radial-gradient(ellipse at 80% 80%, rgba(1, 3, 38, 0.06) 0%, transparent 55%),
            radial-gradient(ellipse at 50% 40%, rgba(31, 100, 191, 0.05) 0%, transparent 75%),
            radial-gradient(ellipse at 10% 50%, rgba(64, 123, 255, 0.04) 0%, transparent 50%),
            radial-gradient(ellipse at 90% 45%, rgba(0, 84, 164, 0.07) 0%, transparent 60%)
          `,
          backgroundSize: `
            200% 200%, 
            180% 180%, 
            220% 220%, 
            170% 170%, 
            240% 240%, 
            160% 160%,
            150% 150%
          `,
          opacity: 0,
          animation: 'backgroundDarken 4s ease-out forwards, backgroundFlow 4s ease-in-out infinite alternate 2s',
          zIndex: 1
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(circle at 30% 20%, rgba(255, 183, 77, 0.08) 0%, transparent 40%),
            radial-gradient(circle at 70% 60%, rgba(255, 206, 84, 0.06) 0%, transparent 45%),
            radial-gradient(circle at 15% 80%, rgba(255, 159, 67, 0.05) 0%, transparent 35%),
            radial-gradient(circle at 85% 30%, rgba(255, 218, 121, 0.04) 0%, transparent 50%),
            radial-gradient(circle at 50% 70%, rgba(255, 195, 113, 0.07) 0%, transparent 38%)
          `,
          backgroundSize: `
            150% 150%,
            140% 140%,
            130% 130%,
            160% 160%,
            120% 120%
          `,
          opacity: 0,
          animation: 'flashColors 2s ease-in-out infinite, colorAppear 1s ease-out forwards 1.5s',
          zIndex: 2
        },
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 0,
        margin: 0,
        overflow: 'hidden',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        '@keyframes backgroundDarken': {
          '0%': { 
            opacity: 0 
          },
          '100%': { 
            opacity: 1 
          }
        },
        '@keyframes colorAppear': {
          '0%': { 
            opacity: 0 
          },
          '100%': { 
            opacity: 1 
          }
        },
        '@keyframes flashColors': {
          '0%': {
            backgroundPosition: `
              30% 20%,
              70% 60%,
              15% 80%,
              85% 30%,
              50% 70%
            `,
            opacity: 0.3
          },
          '25%': {
            backgroundPosition: `
              35% 25%,
              65% 55%,
              20% 75%,
              80% 35%,
              45% 65%
            `,
            opacity: 0.8
          },
          '50%': {
            backgroundPosition: `
              40% 30%,
              60% 50%,
              25% 70%,
              75% 40%,
              40% 60%
            `,
            opacity: 1
          },
          '75%': {
            backgroundPosition: `
              45% 35%,
              55% 45%,
              30% 65%,
              70% 45%,
              35% 55%
            `,
            opacity: 0.6
          },
          '100%': {
            backgroundPosition: `
              50% 40%,
              50% 40%,
              35% 60%,
              65% 50%,
              30% 50%
            `,
            opacity: 0.2
          }
        },
        '@keyframes backgroundFlow': {
          '0%': {
            backgroundPosition: `
              25% 15%,
              75% 25%,
              20% 75%,
              80% 80%,
              50% 40%,
              10% 50%,
              90% 45%
            `
          },
          '25%': {
            backgroundPosition: `
              30% 20%,
              70% 30%,
              25% 70%,
              75% 75%,
              45% 45%,
              15% 45%,
              85% 50%
            `
          },
          '50%': {
            backgroundPosition: `
              35% 25%,
              65% 35%,
              30% 65%,
              70% 70%,
              40% 50%,
              20% 40%,
              80% 55%
            `
          },
          '75%': {
            backgroundPosition: `
              40% 30%,
              60% 40%,
              35% 60%,
              65% 65%,
              35% 55%,
              25% 35%,
              75% 60%
            `
          },
          '100%': {
            backgroundPosition: `
              45% 35%,
              55% 45%,
              40% 55%,
              60% 60%,
              30% 60%,
              30% 30%,
              70% 65%
            `
          }
        }
      }}
    >
      {/* Overlay suave con destellos adicionales */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(circle at 40% 30%, rgba(100, 149, 237, 0.06) 0%, transparent 70%),
            radial-gradient(circle at 60% 70%, rgba(70, 130, 180, 0.04) 0%, transparent 75%),
            radial-gradient(circle at 80% 20%, rgba(30, 144, 255, 0.03) 0%, transparent 65%)
          `,
          opacity: 0,
          animation: 'overlayAppear 3s ease-out forwards 1s, overlayPulse 3s ease-in-out infinite 4s',
          zIndex: 3,
          '@keyframes overlayAppear': {
            '0%': { opacity: 0 },
            '100%': { opacity: 1 }
          },
          '@keyframes overlayPulse': {
            '0%, 100%': { 
              opacity: 1,
              transform: 'scale(1)'
            },
            '50%': { 
              opacity: 0.7,
              transform: 'scale(1.02)'
            }
          }
        }}
      />

      {/* Contenido principal */}
      <Container
        maxWidth={false}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          position: 'relative',
          zIndex: 5,
          width: '100%',
          maxWidth: '600px',
          px: 4
        }}
      >
        {showContent && (
          <>
            {/* Logo con nombre de empresa */}
            <Fade in timeout={1000}>
              <Box
                sx={{
                  mb: 5,
                  textAlign: 'center',
                  animation: 'gentleFloat 8s ease-in-out infinite',
                  '@keyframes gentleFloat': {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-8px)' }
                  }
                }}
              >
                <img 
                  src="/logo.png" 
                  alt="Logo" 
                  style={{
                    height: '80px',
                    width: 'auto',
                    filter: 'drop-shadow(0 4px 15px rgba(31, 100, 191, 0.2))',
                    marginBottom: '12px',
                    display: 'block',
                    marginLeft: 'auto',
                    marginRight: 'auto'
                  }}
                />
                <Typography
                  variant="h6"
                  sx={{
                    color: '#010326',
                    fontWeight: 600,
                    fontSize: '1.1rem',
                    letterSpacing: '0.1em',
                    fontFamily: '"Inter", "Roboto", sans-serif',
                    textTransform: 'uppercase',
                    opacity: 0.9
                  }}
                >
                  DIAMBARS SUBLIM
                </Typography>
              </Box>
            </Fade>

            {/* Número 404 moderno */}
            <Slide direction="up" in timeout={1200}>
              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: '6rem', md: '8rem', lg: '10rem' },
                  fontWeight: 800,
                  background: 'linear-gradient(135deg, #010326 0%, #1F64BF 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 4,
                  letterSpacing: '-0.02em',
                  filter: 'drop-shadow(0 4px 20px rgba(1, 3, 38, 0.15))',
                  fontFamily: '"Inter", "Roboto", sans-serif'
                }}
              >
                404
              </Typography>
            </Slide>

            {/* Card principal con glassmorphism exacto */}
            <Grow in timeout={1500}>
              <Box
                sx={{
                  // Glassmorphism exacto como solicitaste
                  background: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(50px)',
                  WebkitBackdropFilter: 'blur(50px)',
                  borderRadius: '20px',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  boxShadow: `
                    0 8px 32px rgba(0, 0, 0, 0.1),
                    inset 0 1px 0 rgba(255, 255, 255, 0.5),
                    inset 0 -1px 0 rgba(255, 255, 255, 0.1),
                    inset 0 0 0px 0px rgba(255, 255, 255, 0)
                  `,
                  position: 'relative',
                  overflow: 'hidden',
                  p: { xs: 4, md: 6 },
                  mb: 4,
                  maxWidth: '500px',
                  width: '100%',
                  // Pseudo-elementos para efectos adicionales
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '1px',
                    background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.8), transparent)',
                    zIndex: 1
                  },
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '1px',
                    height: '100%',
                    background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.8), transparent, rgba(255, 255, 255, 0.3))',
                    zIndex: 1
                  }
                }}
              >
                {/* Ícono de advertencia elegante */}
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    mb: 3
                  }}
                >
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: '20px',
                      background: 'linear-gradient(135deg, rgba(31, 100, 191, 0.15), rgba(3, 44, 166, 0.10))',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 8px 25px rgba(31, 100, 191, 0.15)',
                      animation: 'iconBreath 5s ease-in-out infinite',
                      '@keyframes iconBreath': {
                        '0%, 100%': { 
                          transform: 'scale(1)',
                          background: 'linear-gradient(135deg, rgba(31, 100, 191, 0.15), rgba(3, 44, 166, 0.10))'
                        },
                        '50%': { 
                          transform: 'scale(1.05)',
                          background: 'linear-gradient(135deg, rgba(31, 100, 191, 0.25), rgba(3, 44, 166, 0.15))'
                        }
                      }
                    }}
                  >
                    <Warning size={36} color="#1F64BF" weight="duotone" />
                  </Box>
                </Box>

                {/* Título principal */}
                <Typography
                  variant="h4"
                  sx={{
                    color: '#010326',
                    mb: 3,
                    fontWeight: 700,
                    fontSize: { xs: '1.8rem', md: '2.2rem' },
                    fontFamily: '"Inter", "Roboto", sans-serif'
                  }}
                >
                  Página No Encontrada
                </Typography>

                {/* Descripción */}
                <Typography
                  variant="body1"
                  sx={{
                    color: '#032CA6',
                    mb: 5,
                    fontSize: '1.1rem',
                    lineHeight: 1.6,
                    opacity: 0.9
                  }}
                >
                  La página que buscas no existe. Te redirigiremos automáticamente al dashboard principal.
                </Typography>

                {/* Sección de redirección */}
                <Box sx={{ textAlign: 'center' }}>
                  <Typography
                    variant="body2"
                    sx={{
                      color: '#666',
                      fontSize: '0.95rem',
                      mb: 3,
                      fontWeight: 500
                    }}
                  >
                    Redirigiendo en
                  </Typography>

                  {/* Contador moderno */}
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'center',
                      mb: 4
                    }}
                  >
                    <Box
                      sx={{
                        width: 64,
                        height: 64,
                        borderRadius: '18px',
                        background: 'linear-gradient(135deg, #1F64BF, #032CA6)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#FFFFFF',
                        fontSize: '1.75rem',
                        fontWeight: 700,
                        boxShadow: '0 15px 30px rgba(31, 100, 191, 0.4)',
                        animation: 'countPulse 1s ease-in-out infinite',
                        fontFamily: '"Inter", "Roboto", sans-serif',
                        '@keyframes countPulse': {
                          '0%, 100%': { 
                            transform: 'scale(1)',
                            boxShadow: '0 15px 30px rgba(31, 100, 191, 0.4)'
                          },
                          '50%': { 
                            transform: 'scale(1.08)',
                            boxShadow: '0 20px 40px rgba(31, 100, 191, 0.5)'
                          }
                        }
                      }}
                    >
                      {countdown}
                    </Box>
                  </Box>

                  {/* Barra de progreso moderna */}
                  <Box
                    sx={{
                      width: '100%',
                      height: 6,
                      borderRadius: 20,
                      background: 'rgba(31, 100, 191, 0.12)',
                      overflow: 'hidden',
                      border: '1px solid rgba(31, 100, 191, 0.1)',
                      position: 'relative'
                    }}
                  >
                    <Box
                      sx={{
                        width: `${progress}%`,
                        height: '100%',
                        background: 'linear-gradient(90deg, #1F64BF, #032CA6)',
                        borderRadius: 20,
                        transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        position: 'relative',
                        '&::after': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          right: '-25px',
                          width: '50px',
                          height: '100%',
                          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent)',
                          animation: 'shimmer 2.5s ease-in-out infinite',
                          '@keyframes shimmer': {
                            '0%': { transform: 'translateX(-50px)' },
                            '100%': { transform: 'translateX(50px)' }
                          }
                        }
                      }}
                    />
                  </Box>
                </Box>
              </Box>
            </Grow>
          </>
        )}
      </Container>
    </Box>
  );
};

export default NotFound404;