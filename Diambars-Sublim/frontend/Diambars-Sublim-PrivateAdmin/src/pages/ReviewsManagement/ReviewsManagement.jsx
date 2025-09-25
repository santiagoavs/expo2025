import React from 'react';
import { useAdminReviews } from '../../hooks/useAdminReviews'; // Ajusta la ruta según tu estructura
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
  alpha
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
      backgroundColor: '#ffffff',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    }}>
      <Box sx={{ maxWidth: '1600px', margin: '0 auto' }}>
        
        {/* Header */}
        <Paper sx={{ 
          padding: { xs: 3, md: 5 },
          marginBottom: 4,
          borderRadius: '16px',
          background: 'white',
          border: `1px solid ${alpha('#1F64BF', 0.08)}`,
          boxShadow: '0 2px 16px rgba(1, 3, 38, 0.06)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            boxShadow: '0 4px 24px rgba(1, 3, 38, 0.08)',
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
            
            <Button
              variant="contained"
              startIcon={<ArrowsClockwise size={18} />}
              sx={{
                background: 'linear-gradient(135deg, #1F64BF 0%, #032CA6 100%)',
                borderRadius: '12px',
                padding: '12px 24px',
                textTransform: 'none',
                fontWeight: 600,
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(31, 100, 191, 0.3)'
                }
              }}
              onClick={fetchAllReviews}
            >
              Refrescar
            </Button>
          </Box>
        </Paper>

        {/* Estadísticas */}
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
              gradient: 'linear-gradient(135deg, #1F64BF 0%, #032CA6 100%)',
              delay: '0.2s'
            },
            { 
              value: stats.pending, 
              label: 'Pendientes', 
              icon: Clock,
              color: '#f59e0b',
              delay: '0.4s'
            },
            { 
              value: stats.approved, 
              label: 'Aprobadas', 
              icon: CheckCircle,
              color: '#10b981',
              delay: '0.6s'
            },
            { 
              value: stats.rejected, 
              label: 'Rechazadas', 
              icon: XCircle,
              color: '#ef4444',
              delay: '0.8s'
            },
            { 
              value: stats.avgRating, 
              label: 'Rating Promedio', 
              icon: Star,
              color: '#1F64BF',
              delay: '1s'
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
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'pointer',
                boxShadow: '0 2px 16px rgba(1, 3, 38, 0.06)',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 32px rgba(1, 3, 38, 0.12)'
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ 
                    fontWeight: 700, 
                    marginBottom: 1,
                    color: stat.gradient ? 'white' : '#010326'
                  }}>
                    {stat.value}
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    opacity: stat.gradient ? 0.9 : 0.7,
                    color: stat.gradient ? 'white' : '#64748b'
                  }}>
                    {stat.label}
                  </Typography>
                </Box>
                <Box sx={{ 
                  backgroundColor: stat.gradient 
                    ? alpha('#ffffff', 0.2)
                    : alpha(stat.color, 0.1),
                  borderRadius: '12px',
                  padding: 1.5,
                  color: stat.gradient ? 'white' : stat.color,
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'scale(1.1)',
                    backgroundColor: stat.gradient 
                      ? alpha('#ffffff', 0.3)
                      : alpha(stat.color, 0.15)
                  }
                }}>
                  <stat.icon size={32} weight="duotone" />
                </Box>
              </Box>
            </Paper>
          ))}
        </Box>

        {/* Controles */}
        <Paper sx={{ 
          padding: 3,
          marginBottom: 4,
          borderRadius: '16px',
          background: 'white',
          border: `1px solid ${alpha('#1F64BF', 0.08)}`,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: '0 2px 16px rgba(1, 3, 38, 0.06)',
          '&:hover': {
            boxShadow: '0 4px 24px rgba(1, 3, 38, 0.08)',
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
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <Select
                  value={selectedFilter}
                  onChange={(e) => setSelectedFilter(e.target.value)}
                  displayEmpty
                  sx={{ 
                    borderRadius: '12px',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }
                  }}
                >
                  <MenuItem value="all">Todas</MenuItem>
                  <MenuItem value="pending">Pendientes</MenuItem>
                  <MenuItem value="approved">Aprobadas</MenuItem>
                  <MenuItem value="rejected">Rechazadas</MenuItem>
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 120 }}>
                <Select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  sx={{ 
                    borderRadius: '12px',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
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
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-1px)'
                    }
                  }}
                >
                  Limpiar
                </Button>
              )}
            </Box>
          </Box>
        </Paper>

        {/* Header de resultados */}
        <Box sx={{ 
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          marginBottom: 3,
          paddingBottom: 2,
          borderBottom: `1px solid ${alpha('#1F64BF', 0.08)}`
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

        {/* Lista de reseñas */}
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
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  cursor: 'pointer',
                  boxShadow: '0 2px 16px rgba(1, 3, 38, 0.06)',
                  opacity: 0,
                  animation: 'slideUp 0.6s ease-out 0.5s forwards',
                  '@keyframes slideUp': {
                    '0%': { transform: 'translateY(30px)', opacity: 0 },
                    '100%': { transform: 'translateY(0)', opacity: 1 }
                  },
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 32px rgba(1, 3, 38, 0.12)'
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

                {/* Acciones */}
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
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        transform: 'translateY(-1px)',
                        boxShadow: '0 4px 12px rgba(31, 100, 191, 0.2)'
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
                          transition: 'all 0.2s ease-in-out',
                          '&:hover': { 
                            backgroundColor: '#059669',
                            transform: 'translateY(-1px)',
                            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
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
                          transition: 'all 0.2s ease-in-out',
                          '&:hover': { 
                            backgroundColor: '#dc2626',
                            transform: 'translateY(-1px)',
                            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
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
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: '0 2px 16px rgba(1, 3, 38, 0.06)',
            '&:hover': {
              borderColor: alpha('#1F64BF', 0.4),
              transform: 'translateY(-1px)',
              boxShadow: '0 4px 24px rgba(1, 3, 38, 0.08)'
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
            <Typography variant="body1" sx={{ color: '#032CA6', marginBottom: 3 }}>
              Intenta ajustar los filtros de búsqueda
            </Typography>
            <Button
              onClick={handleClearFilters}
              variant="contained"
              startIcon={<Broom size={18} />}
              sx={{
                backgroundColor: '#1F64BF',
                borderRadius: '12px',
                textTransform: 'none',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  backgroundColor: '#032CA6',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 12px rgba(31, 100, 191, 0.3)'
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