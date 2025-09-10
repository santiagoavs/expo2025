import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import {
  Box,
  Button,
  Typography,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  CircularProgress,
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
  Funnel,
  ArrowsClockwise,
  GridNine,
  Broom,
  Star,
  ChartLine,
  Clock,
  CheckCircle,
  XCircle
} from '@phosphor-icons/react';

const ReviewsManagement = () => {
  // Estados principales
  const [reviews, setReviews] = useState([]);
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('pending');
  const [sortOption, setSortOption] = useState('newest');
  const [showOnlyHighRating, setShowOnlyHighRating] = useState(false);

  // Datos mock simples
  const mockReviews = [
    {
      id: 1,
      userName: 'María González',
      userEmail: 'maria@example.com',
      rating: 5,
      comment: 'Excelente servicio de sublimación. La calidad de la camiseta quedó perfecta.',
      productName: 'Camiseta Personalizada Premium',
      status: 'pending',
      createdAt: '2024-01-15T10:30:00Z'
    },
    {
      id: 2,
      userName: 'Carlos Mendoza',
      userEmail: 'carlos@example.com',
      rating: 4,
      comment: 'Buen trabajo en general. El producto llegó a tiempo y la calidad es buena.',
      productName: 'Polo Corporativo',
      status: 'approved',
      createdAt: '2024-01-14T15:20:00Z'
    },
    {
      id: 3,
      userName: 'Ana Rodríguez',
      userEmail: 'ana@example.com',
      rating: 5,
      comment: 'Increíble trabajo! La taza personalizada quedó exactamente como la quería.',
      productName: 'Taza Personalizada',
      status: 'pending',
      createdAt: '2024-01-13T09:15:00Z'
    },
    {
      id: 4,
      userName: 'Roberto Silva',
      userEmail: 'roberto@example.com',
      rating: 3,
      comment: 'El producto está bien pero esperaba un poco más de calidad por el precio.',
      productName: 'Gorra Bordada',
      status: 'rejected',
      createdAt: '2024-01-12T14:45:00Z'
    }
  ];

  // Cargar datos
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setReviews(mockReviews);
      setLoading(false);
    }, 1000);
  }, []);

  // Filtrar reseñas
  useEffect(() => {
    let filtered = reviews.filter(review => {
      const matchesSearch = 
        review.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        review.comment.toLowerCase().includes(searchQuery.toLowerCase()) ||
        review.productName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesFilter = selectedFilter === 'all' || review.status === selectedFilter;
      const matchesRating = !showOnlyHighRating || review.rating >= 4;

      return matchesSearch && matchesFilter && matchesRating;
    });

    // Ordenar
    filtered.sort((a, b) => {
      switch (sortOption) {
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'rating_high':
          return b.rating - a.rating;
        case 'rating_low':
          return a.rating - b.rating;
        default:
          return 0;
      }
    });

    setFilteredReviews(filtered);
  }, [reviews, searchQuery, selectedFilter, sortOption, showOnlyHighRating]);

  // Estadísticas
  const getStats = () => {
    const total = reviews.length;
    const pending = reviews.filter(r => r.status === 'pending').length;
    const approved = reviews.filter(r => r.status === 'approved').length;
    const avgRating = reviews.length > 0 
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : '0.0';

    return { total, pending, approved, avgRating };
  };

  const stats = getStats();

  // Manejadores
  const handleApproveReview = async (reviewId) => {
    const review = reviews.find(r => r.id === reviewId);
    
    const result = await Swal.fire({
      title: '¿Aprobar reseña?',
      text: `¿Aprobar la reseña de ${review?.userName}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Sí, aprobar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      setReviews(prev => prev.map(r => 
        r.id === reviewId ? { ...r, status: 'approved' } : r
      ));

      Swal.fire({
        title: '¡Aprobada!',
        text: 'La reseña ha sido aprobada',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
    }
  };

  const handleRejectReview = async (reviewId) => {
    const review = reviews.find(r => r.id === reviewId);
    
    const result = await Swal.fire({
      title: '¿Rechazar reseña?',
      text: `¿Rechazar la reseña de ${review?.userName}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Sí, rechazar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      setReviews(prev => prev.map(r => 
        r.id === reviewId ? { ...r, status: 'rejected' } : r
      ));

      Swal.fire({
        title: '¡Rechazada!',
        text: 'La reseña ha sido rechazada',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
    }
  };

  const handleViewReview = (review) => {
    Swal.fire({
      title: `Reseña de ${review.userName}`,
      html: `
        <div style="text-align: left; padding: 20px;">
          <p><strong>Producto:</strong> ${review.productName}</p>
          <p><strong>Cliente:</strong> ${review.userName}</p>
          <p><strong>Email:</strong> ${review.userEmail}</p>
          <p><strong>Calificación:</strong> ${'⭐'.repeat(review.rating)} (${review.rating}/5)</p>
          <p><strong>Fecha:</strong> ${new Date(review.createdAt).toLocaleDateString('es-ES')}</p>
          <div style="margin-top: 16px;">
            <strong>Comentario:</strong>
            <div style="margin-top: 8px; padding: 12px; background: #f8fafc; border-radius: 8px;">
              "${review.comment}"
            </div>
          </div>
        </div>
      `,
      confirmButtonText: 'Cerrar',
      confirmButtonColor: '#1F64BF',
      width: 600
    });
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedFilter('all');
    setSortOption('newest');
    setShowOnlyHighRating(false);
  };

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
        <CircularProgress size={48} sx={{ color: '#1F64BF' }} />
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
        
        {/* Header */}
        <Paper sx={{ 
          padding: { xs: 3, md: 5 },
          marginBottom: 4,
          borderRadius: '16px',
          boxShadow: '0 2px 16px rgba(1, 3, 38, 0.06)'
        }}>
          <Box sx={{ 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexDirection: { xs: 'column', md: 'row' },
            gap: 3
          }}>
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
            
            <Button
              variant="contained"
              startIcon={<ArrowsClockwise size={18} />}
              sx={{
                background: 'linear-gradient(135deg, #1F64BF 0%, #032CA6 100%)',
                borderRadius: '12px',
                padding: '12px 24px',
                textTransform: 'none',
                fontWeight: 600
              }}
              onClick={() => {
                setLoading(true);
                setTimeout(() => setLoading(false), 1000);
              }}
            >
              Refrescar
            </Button>
          </Box>
        </Paper>

        {/* Estadísticas */}
        <Box sx={{ 
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
          gap: 3,
          marginBottom: 4
        }}>
          <Paper sx={{ 
            padding: 3,
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #1F64BF 0%, #032CA6 100%)',
            color: 'white'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700, marginBottom: 1 }}>
                  {stats.total}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Total de Reseñas
                </Typography>
              </Box>
              <ChatCircle size={32} weight="duotone" />
            </Box>
          </Paper>

          <Paper sx={{ padding: 3, borderRadius: '16px' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700, marginBottom: 1, color: '#010326' }}>
                  {stats.pending}
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748b' }}>
                  Pendientes
                </Typography>
              </Box>
              <Box sx={{ 
                backgroundColor: alpha('#f59e0b', 0.1),
                borderRadius: '12px',
                padding: 1.5,
                color: '#f59e0b'
              }}>
                <Clock size={32} weight="duotone" />
              </Box>
            </Box>
          </Paper>

          <Paper sx={{ padding: 3, borderRadius: '16px' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700, marginBottom: 1, color: '#010326' }}>
                  {stats.approved}
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748b' }}>
                  Aprobadas
                </Typography>
              </Box>
              <Box sx={{ 
                backgroundColor: alpha('#10b981', 0.1),
                borderRadius: '12px',
                padding: 1.5,
                color: '#10b981'
              }}>
                <CheckCircle size={32} weight="duotone" />
              </Box>
            </Box>
          </Paper>

          <Paper sx={{ padding: 3, borderRadius: '16px' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700, marginBottom: 1, color: '#010326' }}>
                  {stats.avgRating}
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748b' }}>
                  Rating Promedio
                </Typography>
              </Box>
              <Box sx={{ 
                backgroundColor: alpha('#1F64BF', 0.1),
                borderRadius: '12px',
                padding: 1.5,
                color: '#1F64BF'
              }}>
                <Star size={32} weight="duotone" />
              </Box>
            </Box>
          </Paper>
        </Box>

        {/* Controles */}
        <Paper sx={{ 
          padding: 3,
          marginBottom: 4,
          borderRadius: '16px'
        }}>
          <Box sx={{ 
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: 2,
            alignItems: { md: 'center' }
          }}>
            <TextField
              fullWidth
              placeholder="Buscar por cliente, comentario o producto..."
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
                  '& fieldset': { border: 'none' }
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
                  sx={{ borderRadius: '12px' }}
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
                  sx={{ borderRadius: '12px' }}
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
                  sx={{ textTransform: 'none' }}
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
          <GridNine size={24} weight="duotone" />
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
            {filteredReviews.map((review) => (
              <Paper
                key={review.id}
                sx={{ 
                  padding: 3,
                  borderRadius: '16px',
                  borderLeft: `4px solid ${getStatusColor(review.status)}`,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 24px rgba(1, 3, 38, 0.12)'
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
                      {review.userName.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#010326' }}>
                        {review.userName}
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

                {/* Producto */}
                <Typography variant="body2" sx={{ 
                  fontWeight: 600,
                  color: '#1F64BF',
                  marginBottom: 2
                }}>
                  {review.productName}
                </Typography>

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
                      fontSize: '0.8rem'
                    }}
                  >
                    Ver
                  </Button>
                  
                  {review.status === 'pending' && (
                    <>
                      <Button
                        variant="contained"
                        onClick={() => handleApproveReview(review.id)}
                        startIcon={<Check size={16} />}
                        sx={{
                          flex: 1,
                          backgroundColor: '#10b981',
                          textTransform: 'none',
                          borderRadius: '8px',
                          fontSize: '0.8rem',
                          '&:hover': { backgroundColor: '#059669' }
                        }}
                      >
                        Aprobar
                      </Button>
                      <Button
                        variant="contained"
                        onClick={() => handleRejectReview(review.id)}
                        startIcon={<X size={16} />}
                        sx={{
                          flex: 1,
                          backgroundColor: '#ef4444',
                          textTransform: 'none',
                          borderRadius: '8px',
                          fontSize: '0.8rem',
                          '&:hover': { backgroundColor: '#dc2626' }
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
            border: `2px dashed ${alpha('#1F64BF', 0.2)}`
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
                textTransform: 'none'
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