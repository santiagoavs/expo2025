import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

export const useAdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('pending');
  const [sortOption, setSortOption] = useState('newest');
  const [showOnlyHighRating, setShowOnlyHighRating] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

  // Obtener todas las reseñas (para admin)
  const fetchAllReviews = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/reviews`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      const reviewsData = result.success ? result.data : result;
      const validReviews = Array.isArray(reviewsData) ? reviewsData : [];
      
      setReviews(validReviews);
      console.log('Reseñas administrativas obtenidas:', validReviews);
    } catch (error) {
      console.error('Error al obtener reseñas:', error);
      Swal.fire({
        title: 'Error',
        text: 'Error al cargar las reseñas',
        icon: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Aprobar reseña
  const approveReview = async (reviewId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}/approve`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Error al aprobar reseña');
      }

      if (result.success) {
        // Actualizar estado local
        setReviews(prev => prev.map(r => 
          r._id === reviewId ? { ...r, status: 'approved' } : r
        ));

        return { success: true, message: result.message };
      }
    } catch (error) {
      console.error('Error al aprobar reseña:', error);
      return { success: false, message: error.message };
    }
  };

  // Rechazar reseña
  const rejectReview = async (reviewId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}/reject`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Error al rechazar reseña');
      }

      if (result.success) {
        // Actualizar estado local
        setReviews(prev => prev.map(r => 
          r._id === reviewId ? { ...r, status: 'rejected' } : r
        ));

        return { success: true, message: result.message };
      }
    } catch (error) {
      console.error('Error al rechazar reseña:', error);
      return { success: false, message: error.message };
    }
  };

  // Manejar aprobación con confirmación
  const handleApproveReview = async (reviewId) => {
    const review = reviews.find(r => r._id === reviewId);
    
    const result = await Swal.fire({
      title: '¿Aprobar reseña?',
      text: `¿Aprobar la reseña de ${review?.userId?.name || 'Usuario'}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Sí, aprobar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      const approvalResult = await approveReview(reviewId);
      
      if (approvalResult.success) {
        Swal.fire({
          title: '¡Aprobada!',
          text: 'La reseña ha sido aprobada y ahora es visible para los clientes',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
      } else {
        Swal.fire({
          title: 'Error',
          text: approvalResult.message || 'Error al aprobar la reseña',
          icon: 'error'
        });
      }
    }
  };

  // Manejar rechazo con confirmación
  const handleRejectReview = async (reviewId) => {
    const review = reviews.find(r => r._id === reviewId);
    
    const result = await Swal.fire({
      title: '¿Rechazar reseña?',
      text: `¿Rechazar la reseña de ${review?.userId?.name || 'Usuario'}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Sí, rechazar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      const rejectionResult = await rejectReview(reviewId);
      
      if (rejectionResult.success) {
        Swal.fire({
          title: '¡Rechazada!',
          text: 'La reseña ha sido rechazada',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
      } else {
        Swal.fire({
          title: 'Error',
          text: rejectionResult.message || 'Error al rechazar la reseña',
          icon: 'error'
        });
      }
    }
  };

  // Ver detalles de reseña
  const handleViewReview = (review) => {
    const userName = review.userId?.name || 'Usuario Anónimo';
    const userEmail = review.userId?.email || 'Sin email';
    
    Swal.fire({
      title: `Reseña de ${userName}`,
      html: `
        <div style="text-align: left; padding: 20px;">
          <p><strong>Cliente:</strong> ${userName}</p>
          <p><strong>Email:</strong> ${userEmail}</p>
          <p><strong>Calificación:</strong> ${'⭐'.repeat(review.rating)} (${review.rating}/5)</p>
          <p><strong>Estado:</strong> <span style="color: ${getStatusColorCSS(review.status)}">${getStatusTextCSS(review.status)}</span></p>
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

  // Funciones auxiliares para colores y textos de estado
  const getStatusTextCSS = (status) => {
    const statusTexts = {
      pending: 'Pendiente',
      approved: 'Aprobada',
      rejected: 'Rechazada'
    };
    return statusTexts[status] || status;
  };

  const getStatusColorCSS = (status) => {
    const colors = {
      pending: '#f59e0b',
      approved: '#10b981',
      rejected: '#ef4444'
    };
    return colors[status] || '#64748b';
  };

  // Filtrar reseñas
  useEffect(() => {
    let filtered = reviews.filter(review => {
      const userName = review.userId?.name || '';
      const userEmail = review.userId?.email || '';
      
      const matchesSearch = 
        userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        review.comment.toLowerCase().includes(searchQuery.toLowerCase()) ||
        userEmail.toLowerCase().includes(searchQuery.toLowerCase());

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

  // Obtener estadísticas
  const getStats = () => {
    const total = reviews.length;
    const pending = reviews.filter(r => r.status === 'pending').length;
    const approved = reviews.filter(r => r.status === 'approved').length;
    const rejected = reviews.filter(r => r.status === 'rejected').length;
    const avgRating = reviews.length > 0 
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : '0.0';

    return { total, pending, approved, rejected, avgRating };
  };

  // Limpiar filtros
  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedFilter('all');
    setSortOption('newest');
    setShowOnlyHighRating(false);
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    fetchAllReviews();
  }, []);

  return {
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
    getStats
  };
};

export default useAdminReviews;