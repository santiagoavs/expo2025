import React from 'react';
import { useAdminReviews } from '../../hooks/useAdminReviews';
import {
  Box,
  Button,
  Typography,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  Chip,
  Paper,
  Rating,
  Avatar,
  FormControlLabel,
  Switch,
  alpha,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  ChatCircle,
  Eye,
  Check,
  X,
  MagnifyingGlass,
  ArrowsClockwise,
  GridNine,
  Broom,
  Star,
  Clock,
  CheckCircle,
  XCircle
} from '@phosphor-icons/react';

const ReviewsManagement = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const {
    reviews,
    filteredReviews,
    loading,
    searchQuery,
    setSearchQuery,
    selectedFilter,
    setSelectedFilter,
    sortOption,
    setSortOption,
    showOnlyHighRating,
    setShowOnlyHighRating,
    handleApproveReview,
    handleRejectReview,
    handleViewReview,
    handleClearFilters,
    fetchAllReviews,
    getStats,
    stats
  } = useAdminReviews();

  const colors = { primary: '#1F64BF', secondary: '#032CA6', accent: '#040DBF', dark: '#010326', gray: '#64748b' };

  const getStatusText = (status) => {
    const statusTexts = {
      pending: 'Pendiente',
      approved: 'Aprobada',
      rejected: 'Rechazada'
    };
    return statusTexts[status] || status;
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#f59e0b',
      approved: '#10b981',
      rejected: '#ef4444'
    };
    return colors[status] || '#64748b';
  };

  if (loading) {
    return (
      <Box sx={{ 
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: '120px',
        gap: 3
      }}>
        <Box sx={{
          width: 60,
          height: 60,
          borderRadius: '50%',
          border: '4px solid #f3f4f6',
          borderTop: '4px solid #1F64BF',
          animation: 'spin 1s linear infinite',
          '@keyframes spin': {
            '0%': { transform: 'rotate(0deg)' },
            '100%': { transform: 'rotate(360deg)' }
          }
        }} />
        <Typography variant="h6" sx={{ color: '#010326', fontWeight: 600 }}>
          Cargando reseñas...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh',
      paddingTop: '120px',
      paddingBottom: '40px',
      paddingX: { xs: 2, sm: 3, md: 4 },
      backgroundColor: '#ffffff'
    }}>
      <Box sx={{ maxWidth: '1600px', margin: '0 auto' }}>
        
        {/* Header - Mantenido en blanco como estaba */}
        <Paper sx={{ 
          padding: { xs: 3, md: 5 },
          marginBottom: 4,
          borderRadius: '16px',
          background: 'white',
          border: `1px solid ${alpha('#1F64BF', 0.08)}`,
          boxShadow: '0 2px 16px rgba(1, 3, 38, 0.06)',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: '0 4px 20px rgba(1, 3, 38, 0.08)',
            transform: 'translateY(-1px)'
          }
        }}>
          <Box sx={{ 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexDirection: { xs: 'column', md: 'row' },
            gap: 3
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{
                width: 56,
                height: 56,
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #1F64BF 0%, #032CA6 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white'
              }}>
                <ChatCircle size={24} weight="duotone" />
              </Box>
              <Box>
                <Typography variant="h3" sx={{ 
                  fontWeight: 700,
                  color: '#010326',
                  marginBottom: 1,
                  fontSize: { xs: '1.8rem', md: '2.5rem' }
                }}>
                  Gestión de Reseñas
                </Typography>
                <Typography variant="h6" sx={{ 
                  color: '#032CA6',
                  fontWeight: 600
                }}>
                  Administra y modera las reseñas de productos de tus clientes
                </Typography>
              </Box>
            </Box>
            
            {/* Botón con efecto shimmer */}
            <Button
              variant="outlined"
              startIcon={<ArrowsClockwise size={18} />}
              onClick={fetchAllReviews}
              sx={{
                borderColor: colors.primary,
                color: colors.primary,
                borderRadius: '16px',
                padding: '12px 24px',
                textTransform: 'none',
                fontWeight: 600,
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: '-100%',
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(90deg, transparent, rgba(31, 100, 191, 0.15), transparent)',
                  transition: 'left 0.5s ease'
                },
                '&:hover': {
                  borderColor: colors.secondary,
                  backgroundColor: alpha(colors.primary, 0.05),
                  '&::before': { left: '100%' }
                }
              }}
            >
              {isMobile ? 'Refrescar' : 'Refrescar Datos'}
            </Button>
          </Box>
        </Paper>

        {/* Cards de estadísticas - hover disminuido */}
        <Box sx={{ 
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(5, 1fr)' },
          gap: 3,
          marginBottom: 4
        }}>
          {[
            { 
              value: stats.total, 
              label: 'Total de Reseñas', 
              icon: ChatCircle,
              gradient: 'linear-gradient(135deg, #1F64BF 0%, #032CA6 100%)'
            },
            { 
              value: stats.pending, 
              label: 'Pendientes', 
              icon: Clock,
              color: '#f59e0b'
            },
            { 
              value: stats.approved, 
              label: 'Aprobadas', 
              icon: CheckCircle,
              color: '#10b981'
            },
            { 
              value: stats.rejected, 
              label: 'Rechazadas', 
              icon: XCircle,
              color: '#ef4444'
            },
            { 
              value: stats.avgRating, 
              label: 'Rating Promedio', 
              icon: Star,
              color: '#1F64BF'
            }
          ].map((stat, index) => (
            <Paper 
              key={index}
              sx={{ 
                padding: 3,
                borderRadius: '16px',
                background: stat.gradient || 'white',
                color: stat.gradient ? 'white' : '#010326',
                border: stat.gradient ? 'none' : `1px solid ${alpha('#1F64BF', 0.08)}`,
                cursor: 'pointer',
                boxShadow: stat.gradient ? '0 4px 20px rgba(31, 100, 191, 0.25)' : '0 2px 16px rgba(1, 3, 38, 0.06)',
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: '-100%',
                  width: '100%',
                  height: '100%',
                  background: stat.gradient 
                    ? 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)'
                    : 'linear-gradient(90deg, transparent, rgba(31, 100, 191, 0.1), transparent)',
                  transition: 'left 0.5s ease',
                  zIndex: 1
                },
                '&::after': stat.gradient ? {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: '70px',
                  height: '70px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '50%',
                  transform: 'translate(20px, -20px)',
                  zIndex: 0
                } : {},
                '& > *': { position: 'relative', zIndex: 2 },
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: stat.gradient 
                    ? '0 8px 28px rgba(31, 100, 191, 0.3), 0 0 12px rgba(31, 100, 191, 0.15)'
                    : '0 8px 24px rgba(1, 3, 38, 0.1), 0 0 12px rgba(31, 100, 191, 0.08)',
                  '&::before': { left: '100%' }
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ 
                    fontWeight: 700, 
                    marginBottom: 1
                  }}>
                    {stat.value}
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    opacity: 0.9,
                    fontWeight: 500
                  }}>
                    {stat.label}
                  </Typography>
                </Box>
                <Box sx={{ 
                  backgroundColor: stat.gradient 
                    ? 'rgba(255, 255, 255, 0.2)'
                    : alpha(stat.color, 0.1),
                  borderRadius: '12px',
                  padding: 1.5,
                  color: stat.gradient ? 'white' : stat.color
                }}>
                  <stat.icon size={32} weight="duotone" />
                </Box>
              </Box>
            </Paper>
          ))}
        </Box>

        {/* Controles con hover sutil y efectos en los selects */}
        <Paper sx={{ 
          padding: 3,
          marginBottom: 4,
          borderRadius: '16px',
          background: 'white',
          border: `1px solid ${alpha('#1F64BF', 0.08)}`,
          boxShadow: '0 2px 16px rgba(1, 3, 38, 0.06)',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: '0 4px 20px rgba(1, 3, 38, 0.08)',
            transform: 'translateY(-1px)'
          }
        }}>
          <Box sx={{ 
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: 2,
            alignItems: { md: 'center' }
          }}>
            <TextField
              fullWidth
              placeholder="Buscar por cliente, comentario o email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <MagnifyingGlass size={18} color="#032CA6" />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  backgroundColor: '#F2F2F2',
                  transition: 'all 0.2s ease-in-out',
                  '& fieldset': { border: 'none' },
                  '&:hover': {
                    backgroundColor: '#e5e7eb'
                  },
                  '&.Mui-focused': {
                    backgroundColor: 'white',
                    boxShadow: '0 2px 8px rgba(31, 100, 191, 0.15)'
                  }
                }
              }}
            />
            
            <Box sx={{ 
              display: 'flex',
              gap: 2,
              flexWrap: 'wrap',
              minWidth: { md: 'fit-content' }
            }}>
              {/* Select Pendientes con efectos */}
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <Select
                  value={selectedFilter}
                  onChange={(e) => setSelectedFilter(e.target.value)}
                  displayEmpty
                  sx={{ 
                    borderRadius: '12px',
                    backgroundColor: '#F2F2F2',
                    transition: 'all 0.3s ease',
                    '& .MuiOutlinedInput-notchedOutline': {
                      border: 'none'
                    },
                    '&:hover': {
                      backgroundColor: '#e5e7eb',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      transform: 'translateY(-1px)'
                    },
                    '&.Mui-focused': {
                      backgroundColor: 'white',
                      boxShadow: '0 2px 12px rgba(31, 100, 191, 0.2)'
                    }
                  }}
                >
                  <MenuItem value="all">Todas</MenuItem>
                  <MenuItem value="pending">Pendientes</MenuItem>
                  <MenuItem value="approved">Aprobadas</MenuItem>
                  <MenuItem value="rejected">Rechazadas</MenuItem>
                </Select>
              </FormControl>

              {/* Select Más recientes con efectos */}
              <FormControl size="small" sx={{ minWidth: 140 }}>
                <Select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  sx={{ 
                    borderRadius: '12px',
                    backgroundColor: '#F2F2F2',
                    transition: 'all 0.3s ease',
                    '& .MuiOutlinedInput-notchedOutline': {
                      border: 'none'
                    },
                    '&:hover': {
                      backgroundColor: '#e5e7eb',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      transform: 'translateY(-1px)'
                    },
                    '&.Mui-focused': {
                      backgroundColor: 'white',
                      boxShadow: '0 2px 12px rgba(31, 100, 191, 0.2)'
                    }
                  }}
                >
                  <MenuItem value="newest">Más recientes</MenuItem>
                  <MenuItem value="oldest">Más antiguas</MenuItem>
                  <MenuItem value="rating_high">Rating ↓</MenuItem>
                  <MenuItem value="rating_low">Rating ↑</MenuItem>
                </Select>
              </FormControl>

              <FormControlLabel
                control={
                  <Switch
                    checked={showOnlyHighRating}
                    onChange={(e) => setShowOnlyHighRating(e.target.checked)}
                    size="small"
                  />
                }
                label="4+ estrellas"
              />

              {(searchQuery || selectedFilter !== 'all' || sortOption !== 'newest' || showOnlyHighRating) && (
                <Button
                  onClick={handleClearFilters}
                  startIcon={<Broom size={16} />}
                  sx={{ 
                    textTransform: 'none',
                    borderRadius: '12px',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: '-100%',
                      width: '100%',
                      height: '100%',
                      background: 'linear-gradient(90deg, transparent, rgba(31, 100, 191, 0.1), transparent)',
                      transition: 'left 0.5s ease'
                    },
                    '&:hover': {
                      '&::before': { left: '100%' }
                    }
                  }}
                >
                  Limpiar
                </Button>
              )}
            </Box>
          </Box>
        </Paper>

        {/* Header de resultados con hover sutil */}
        <Paper sx={{ 
          padding: 3,
          marginBottom: 4,
          borderRadius: '16px',
          background: 'white',
          border: `1px solid ${alpha('#1F64BF', 0.08)}`,
          boxShadow: '0 2px 16px rgba(1, 3, 38, 0.06)',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: '0 4px 20px rgba(1, 3, 38, 0.08)',
            transform: 'translateY(-1px)'
          }
        }}>
          <Box sx={{ 
            display: 'flex',
            alignItems: 'center',
            gap: 2
          }}>
            <Box sx={{
              padding: 1,
              borderRadius: '8px',
              backgroundColor: alpha('#1F64BF', 0.1),
              color: '#1F64BF'
            }}>
              <GridNine size={24} weight="duotone" />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#010326' }}>
              Reseñas
            </Typography>
            <Chip 
              label={`${filteredReviews.length} encontrada${filteredReviews.length !== 1 ? 's' : ''}`}
              size="small"
              sx={{
                background: alpha('#1F64BF', 0.1),
                color: '#032CA6',
                fontWeight: 600
              }}
            />
          </Box>
        </Paper>

        {/* Lista de reseñas con hover sutil */}
        {filteredReviews.length > 0 ? (
          <Box sx={{ 
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
            gap: 3
          }}>
            {filteredReviews.map((review, index) => (
              <Paper
                key={review._id}
                sx={{ 
                  padding: 3,
                  borderRadius: '16px',
                  background: 'white',
                  borderLeft: `4px solid ${getStatusColor(review.status)}`,
                  border: `1px solid ${alpha('#1F64BF', 0.08)}`,
                  boxShadow: '0 2px 16px rgba(1, 3, 38, 0.06)',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  '&:hover': {
                    boxShadow: '0 4px 20px rgba(1, 3, 38, 0.08)',
                    transform: 'translateY(-1px)'
                  }
                }}
              >
                {/* Header */}
                <Box sx={{ 
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 2
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar sx={{ 
                      backgroundColor: '#1F64BF',
                      width: 40,
                      height: 40,
                      fontWeight: 700
                    }}>
                      {(review.userId?.name || 'A').charAt(0).toUpperCase()}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#010326' }}>
                        {review.userId?.name || 'Usuario Anónimo'}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748b' }}>
                        {new Date(review.createdAt).toLocaleDateString('es-ES')}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Chip
                    label={getStatusText(review.status)}
                    size="small"
                    sx={{
                      backgroundColor: alpha(getStatusColor(review.status), 0.1),
                      color: getStatusColor(review.status),
                      fontWeight: 600
                    }}
                  />
                </Box>

                {/* Rating */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, marginBottom: 2 }}>
                  <Rating value={review.rating} readOnly size="small" />
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#010326' }}>
                    {review.rating}/5
                  </Typography>
                </Box>

                {/* Comentario */}
                <Typography variant="body2" sx={{ 
                  color: '#334155',
                  marginBottom: 3,
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  "{review.comment}"
                </Typography>

                {/* Acciones con efecto shimmer */}
                <Box sx={{ 
                  display: 'flex',
                  gap: 1,
                  flexDirection: { xs: 'column', sm: 'row' }
                }}>
                  <Button
                    variant="outlined"
                    onClick={() => handleViewReview(review)}
                    startIcon={<Eye size={16} />}
                    sx={{
                      flex: 1,
                      textTransform: 'none',
                      borderRadius: '8px',
                      fontSize: '0.8rem',
                      borderColor: colors.primary,
                      color: colors.primary,
                      position: 'relative',
                      overflow: 'hidden',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: '-100%',
                        width: '100%',
                        height: '100%',
                        background: 'linear-gradient(90deg, transparent, rgba(31, 100, 191, 0.1), transparent)',
                        transition: 'left 0.5s ease'
                      },
                      '&:hover': {
                        borderColor: colors.secondary,
                        backgroundColor: alpha(colors.primary, 0.05),
                        '&::before': { left: '100%' }
                      }
                    }}
                  >
                    Ver
                  </Button>
                  
                  {review.status === 'pending' && (
                    <>
                      <Button
                        variant="contained"
                        onClick={() => handleApproveReview(review._id)}
                        startIcon={<Check size={16} />}
                        sx={{
                          flex: 1,
                          backgroundColor: '#10b981',
                          textTransform: 'none',
                          borderRadius: '8px',
                          fontSize: '0.8rem',
                          position: 'relative',
                          overflow: 'hidden',
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: '-100%',
                            width: '100%',
                            height: '100%',
                            background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
                            transition: 'left 0.5s ease'
                          },
                          '&:hover': { 
                            backgroundColor: '#059669',
                            '&::before': { left: '100%' }
                          }
                        }}
                      >
                        Aprobar
                      </Button>
                      <Button
                        variant="contained"
                        onClick={() => handleRejectReview(review._id)}
                        startIcon={<X size={16} />}
                        sx={{
                          flex: 1,
                          backgroundColor: '#ef4444',
                          textTransform: 'none',
                          borderRadius: '8px',
                          fontSize: '0.8rem',
                          position: 'relative',
                          overflow: 'hidden',
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: '-100%',
                            width: '100%',
                            height: '100%',
                            background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
                            transition: 'left 0.5s ease'
                          },
                          '&:hover': { 
                            backgroundColor: '#dc2626',
                            '&::before': { left: '100%' }
                          }
                        }}
                      >
                        Rechazar
                      </Button>
                    </>
                  )}
                </Box>
              </Paper>
            ))}
          </Box>
        ) : (
          <Paper sx={{ 
            padding: 8,
            textAlign: 'center',
            borderRadius: '16px',
            background: 'white',
            border: `2px dashed ${alpha('#1F64BF', 0.2)}`,
            boxShadow: '0 2px 16px rgba(1, 3, 38, 0.06)',
            transition: 'all 0.3s ease',
            '&:hover': {
              borderColor: alpha('#1F64BF', 0.4),
              transform: 'translateY(-1px)',
              boxShadow: '0 4px 20px rgba(1, 3, 38, 0.08)'
            }
          }}>
            <Box sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              backgroundColor: alpha('#1F64BF', 0.1),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 2rem',
              color: '#1F64BF'
            }}>
              <ChatCircle size={32} weight="duotone" />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#010326', marginBottom: 2 }}>
              No se encontraron reseñas
            </Typography>
            <Typography variant="body1" sx={{ color: '#64748b', marginBottom: 3 }}>
              Intenta ajustar los filtros de búsqueda
            </Typography>
            
            {/* Botón con efecto shimmer */}
            <Button
              onClick={handleClearFilters}
              variant="contained"
              startIcon={<Broom size={18} />}
              sx={{
                backgroundColor: colors.primary,
                borderRadius: '12px',
                textTransform: 'none',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: '-100%',
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
                  transition: 'left 0.5s ease'
                },
                '&:hover': {
                  backgroundColor: colors.secondary,
                  '&::before': { left: '100%' }
                }
              }}
            >
              Limpiar Filtros
            </Button>
          </Paper>
        )}
      </Box>
    </Box>
  );
};

export default ReviewsManagement;