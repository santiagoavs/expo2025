// components/PaymentMethodModals/PaymentStatsModal.jsx - Modal para estadísticas de pagos
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Stack,
  Paper,
  CircularProgress,
  useTheme,
  useMediaQuery,
  alpha,
  Grid,
  Chip,
  Divider
} from '@mui/material';
import {
  ChartBar,
  TrendUp,
  CurrencyDollar,
  CreditCard,
  X
} from '@phosphor-icons/react';
import paymentConfigService from '../../api/PaymentConfigService';

const PaymentStatsModal = ({ open, onClose, stats }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isExtraSmall = useMediaQuery(theme.breakpoints.down(480));

  // Estados locales
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Formatear moneda
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      fullScreen={isExtraSmall}
      PaperProps={{
        elevation: 0,
        sx: {
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: isExtraSmall ? 0 : 3,
          border: `1px solid ${alpha('#1F64BF', 0.08)}`,
          boxShadow: '0 16px 64px rgba(31, 100, 191, 0.16)',
          m: isExtraSmall ? 0 : 2,
          maxHeight: '90vh'
        }
      }}
    >
      <DialogTitle
        sx={{
          p: { xs: 3, md: 4 },
          pb: 2,
          borderBottom: `1px solid ${alpha('#1F64BF', 0.06)}`
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={2}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: alpha('#1F64BF', 0.1),
                color: '#1F64BF'
              }}
            >
              <ChartBar size={24} weight="duotone" />
            </Box>
            <Box>
              <Typography
                variant="h5"
                sx={{
                  fontSize: { xs: '1.25rem', md: '1.5rem' },
                  fontWeight: 700,
                  color: '#010326',
                  fontFamily: "'Mona Sans'"
                }}
              >
                Estadísticas de Pagos
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: '#64748B',
                  fontFamily: "'Mona Sans'"
                }}
              >
                Análisis detallado de métodos de pago
              </Typography>
            </Box>
          </Stack>
          
          <Button
            onClick={onClose}
            sx={{
              minWidth: 'auto',
              p: 1,
              borderRadius: 2,
              color: '#64748B',
              '&:hover': {
                background: alpha('#64748B', 0.08)
              }
            }}
          >
            <X size={20} weight="bold" />
          </Button>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ p: { xs: 3, md: 4 }, maxHeight: 'calc(90vh - 180px)', overflowY: 'auto' }}>
        {!stats ? (
          <Box
            sx={{
              textAlign: 'center',
              py: 8
            }}
          >
            <Typography
              variant="h6"
              sx={{
                color: '#64748B',
                fontFamily: "'Mona Sans'",
                mb: 2
              }}
            >
              No hay estadísticas disponibles
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: '#64748B',
                fontFamily: "'Mona Sans'"
              }}
            >
              Las estadísticas se generarán cuando tengas métodos de pago configurados
            </Typography>
          </Box>
        ) : (
          <Stack spacing={4}>
            {/* Resumen general */}
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3,
                background: 'linear-gradient(135deg, #1F64BF 0%, #032CA6 100%)',
                color: 'white',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: -20,
                  right: -20,
                  width: 100,
                  height: 100,
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '50%'
                }
              }}
            >
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3, position: 'relative', zIndex: 1 }}>
                <Box>
                  <Typography
                    variant="h4"
                    sx={{
                      fontSize: { xs: '2rem', md: '2.5rem' },
                      fontWeight: 800,
                      fontFamily: "'Mona Sans'",
                      mb: 1
                    }}
                  >
                    {stats.totalMethods || 0}
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      opacity: 0.9,
                      fontFamily: "'Mona Sans'"
                    }}
                  >
                    Métodos Configurados
                  </Typography>
                </Box>
                <Box
                  sx={{
                    width: 64,
                    height: 64,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(255, 255, 255, 0.2)',
                    backdropFilter: 'blur(10px)'
                  }}
                >
                  <ChartBar size={32} weight="duotone" />
                </Box>
              </Stack>
              
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  px: 2,
                  py: 1,
                  borderRadius: 2,
                  background: 'rgba(255, 255, 255, 0.15)',
                  backdropFilter: 'blur(10px)',
                  width: 'fit-content',
                  position: 'relative',
                  zIndex: 1
                }}
              >
                <TrendUp size={16} weight="bold" />
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    fontFamily: "'Mona Sans'"
                  }}
                >
                  {stats.activeMethods || 0} activos
                </Typography>
              </Box>
            </Paper>

            {/* Métodos por tipo */}
            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  color: '#010326',
                  mb: 3,
                  fontFamily: "'Mona Sans'"
                }}
              >
                Métodos por Tipo
              </Typography>
              
              <Grid container spacing={3}>
                {stats.methods?.map((method, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 3,
                        borderRadius: 3,
                        border: `1px solid ${alpha('#1F64BF', 0.08)}`,
                        background: 'rgba(255, 255, 255, 0.5)',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 8px 32px rgba(31, 100, 191, 0.12)'
                        }
                      }}
                    >
                      <Stack spacing={2}>
                        <Stack direction="row" alignItems="center" justifyContent="space-between">
                          <Box
                            sx={{
                              width: 40,
                              height: 40,
                              borderRadius: 2,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              background: method.enabled ? alpha('#10B981', 0.1) : alpha('#EF4444', 0.1),
                              color: method.enabled ? '#10B981' : '#EF4444'
                            }}
                          >
                            <CreditCard size={20} weight="duotone" />
                          </Box>
                          <Chip
                            label={method.enabled ? 'Activo' : 'Inactivo'}
                            color={method.enabled ? 'success' : 'error'}
                            size="small"
                            sx={{
                              fontWeight: 600,
                              fontSize: '0.75rem',
                              fontFamily: "'Mona Sans'"
                            }}
                          />
                        </Stack>
                        
                        <Box>
                          <Typography
                            variant="h6"
                            sx={{
                              fontSize: '1.125rem',
                              fontWeight: 700,
                              color: '#010326',
                              mb: 1,
                              fontFamily: "'Mona Sans'"
                            }}
                          >
                            {method.name}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              color: '#64748B',
                              fontFamily: "'Mona Sans'",
                              textTransform: 'capitalize'
                            }}
                          >
                            {method.type.replace('_', ' ')}
                          </Typography>
                        </Box>
                        
                        {method.hasConfig && (
                          <Chip
                            label="Configurado"
                            color="info"
                            size="small"
                            sx={{
                              fontSize: '0.75rem',
                              fontFamily: "'Mona Sans'",
                              width: 'fit-content'
                            }}
                          />
                        )}
                      </Stack>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Box>

            {/* Información adicional */}
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3,
                background: alpha('#1F64BF', 0.04),
                border: `1px solid ${alpha('#1F64BF', 0.08)}`
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontSize: '1.125rem',
                  fontWeight: 700,
                  color: '#010326',
                  mb: 2,
                  fontFamily: "'Mona Sans'"
                }}
              >
                Información del Sistema
              </Typography>
              
              <Stack spacing={2}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    py: 1
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      color: '#64748B',
                      fontFamily: "'Mona Sans'"
                    }}
                  >
                    Total de métodos
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                      color: '#010326',
                      fontFamily: "'Mona Sans'"
                    }}
                  >
                    {stats.totalMethods || 0}
                  </Typography>
                </Box>
                
                <Divider />
                
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    py: 1
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      color: '#64748B',
                      fontFamily: "'Mona Sans'"
                    }}
                  >
                    Métodos activos
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                      color: '#10B981',
                      fontFamily: "'Mona Sans'"
                    }}
                  >
                    {stats.activeMethods || 0}
                  </Typography>
                </Box>
                
                <Divider />
                
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    py: 1
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      color: '#64748B',
                      fontFamily: "'Mona Sans'"
                    }}
                  >
                    Métodos inactivos
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                      color: '#EF4444',
                      fontFamily: "'Mona Sans'"
                    }}
                  >
                    {stats.inactiveMethods || 0}
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </Stack>
        )}
      </DialogContent>

      <DialogActions
        sx={{
          p: { xs: 3, md: 4 },
          pt: 2,
          borderTop: `1px solid ${alpha('#1F64BF', 0.06)}`
        }}
      >
        <Button
          onClick={onClose}
          variant="contained"
          sx={{
            background: 'linear-gradient(135deg, #1F64BF 0%, #032CA6 100%)',
            borderRadius: 2,
            py: 1.5,
            px: 4,
            fontSize: '1rem',
            fontWeight: 600,
            textTransform: 'none',
            fontFamily: "'Mona Sans'",
            boxShadow: '0 4px 16px rgba(31, 100, 191, 0.24)',
            minHeight: 48,
            '&:hover': {
              background: 'linear-gradient(135deg, #032CA6 0%, #1F64BF 100%)',
              boxShadow: '0 6px 24px rgba(31, 100, 191, 0.32)'
            }
          }}
        >
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PaymentStatsModal;
