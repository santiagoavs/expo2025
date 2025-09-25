import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import AdminReviewsService from '../api/AdminReviewsService';

export const useAdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('pending');
  const [sortOption, setSortOption] = useState('newest');
  const [showOnlyHighRating, setShowOnlyHighRating] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    avgRating: 0
  });

  // Obtener todas las reseñas (para admin)
  const fetchAllReviews = async () => {
    setLoading(true);
    try {
      const response = await AdminReviewsService.getAll({
        status: selectedFilter,
        search: searchQuery,
        sort: sortOption,
        rating: showOnlyHighRating ? 4 : undefined
      });

      const reviewsData = response.success ? response.data : response;
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
      const response = await AdminReviewsService.approve(reviewId);
      
      if (response.success) {
        // Actualizar estado local
        setReviews(prev => prev.map(r => 
          r._id === reviewId ? { ...r, status: 'approved' } : r
        ));

        Swal.fire({
          title: 'Éxito',
          text: 'Reseña aprobada correctamente',
          icon: 'success'
        });

        return { success: true, message: response.message };
      }
    } catch (error) {
      console.error('Error al aprobar reseña:', error);
      Swal.fire({
        title: 'Error',
        text: 'Error al aprobar la reseña',
        icon: 'error'
      });
      return { success: false, message: error.message };
    }
  };

  // Rechazar reseña
  const rejectReview = async (reviewId, reason = '') => {
    try {
      const response = await AdminReviewsService.reject(reviewId, reason);
      
      if (response.success) {
        // Actualizar estado local
        setReviews(prev => prev.map(r => 
          r._id === reviewId ? { ...r, status: 'rejected' } : r
        ));

        Swal.fire({
          title: 'Éxito',
          text: 'Reseña rechazada correctamente',
          icon: 'success'
        });

        return { success: true, message: response.message };
      }
    } catch (error) {
      console.error('Error al rechazar reseña:', error);
      Swal.fire({
        title: 'Error',
        text: 'Error al rechazar la reseña',
        icon: 'error'
      });
      return { success: false, message: error.message };
    }
  };

  // Eliminar reseña
  const deleteReview = async (reviewId) => {
    try {
      const response = await AdminReviewsService.delete(reviewId);
      
      if (response.success) {
        // Remover del estado local
        setReviews(prev => prev.filter(r => r._id !== reviewId));

        Swal.fire({
          title: 'Éxito',
          text: 'Reseña eliminada correctamente',
          icon: 'success'
        });

        return { success: true, message: response.message };
      }
    } catch (error) {
      console.error('Error al eliminar reseña:', error);
      Swal.fire({
        title: 'Error',
        text: 'Error al eliminar la reseña',
        icon: 'error'
      });
      return { success: false, message: error.message };
    }
  };

  // Actualizar reseña
  const updateReview = async (reviewId, updateData) => {
    try {
      const response = await AdminReviewsService.update(reviewId, updateData);
      
      if (response.success) {
        // Actualizar estado local
        setReviews(prev => prev.map(r => 
          r._id === reviewId ? { ...r, ...updateData } : r
        ));

        Swal.fire({
          title: 'Éxito',
          text: 'Reseña actualizada correctamente',
          icon: 'success'
        });

        return { success: true, message: response.message };
      }
    } catch (error) {
      console.error('Error al actualizar reseña:', error);
      Swal.fire({
        title: 'Error',
        text: 'Error al actualizar la reseña',
        icon: 'error'
      });
      return { success: false, message: error.message };
    }
  };

  // Obtener estadísticas
  const getStats = async () => {
    try {
      console.log('📊 [useAdminReviews] Obteniendo estadísticas...');
      const response = await AdminReviewsService.getStats();
      console.log('📊 [useAdminReviews] Respuesta del servicio:', response);
      
      if (response.success) {
        const statsData = response.data;
        console.log('📊 [useAdminReviews] Datos de estadísticas:', statsData);
        
        const newStats = {
          total: statsData.overview?.total || 0,
          pending: statsData.overview?.pending || 0,
          approved: statsData.overview?.approved || 0,
          rejected: statsData.overview?.rejected || 0,
          avgRating: statsData.rating?.average || 0
        };
        
        console.log('📊 [useAdminReviews] Estadísticas mapeadas:', newStats);
        setStats(newStats);
        return statsData;
      }
      return null;
    } catch (error) {
      console.error('❌ [useAdminReviews] Error al obtener estadísticas:', error);
      return null;
    }
  };

  // Filtrar reseñas
  const filterReviews = async (filters) => {
    try {
      const response = await AdminReviewsService.filter(filters);
      const reviewsData = response.success ? response.data : response;
      const validReviews = Array.isArray(reviewsData) ? reviewsData : [];
      
      setFilteredReviews(validReviews);
      return validReviews;
    } catch (error) {
      console.error('Error al filtrar reseñas:', error);
      return [];
    }
  };

  // Aplicar filtros locales
  const applyLocalFilters = () => {
    let filtered = [...reviews];

    // Filtrar por estado
    if (selectedFilter && selectedFilter !== 'all') {
      filtered = filtered.filter(review => review.status === selectedFilter);
    }

    // Filtrar por búsqueda
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(review => 
        review.user?.name?.toLowerCase().includes(query) ||
        review.comment?.toLowerCase().includes(query) ||
        review.product?.name?.toLowerCase().includes(query)
      );
    }

    // Filtrar por rating alto
    if (showOnlyHighRating) {
      filtered = filtered.filter(review => review.rating >= 4);
    }

    // Ordenar
    switch (sortOption) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case 'rating_high':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'rating_low':
        filtered.sort((a, b) => a.rating - b.rating);
        break;
      default:
        break;
    }

    setFilteredReviews(filtered);
  };

  // Efectos
  useEffect(() => {
    fetchAllReviews();
    getStats(); // Cargar estadísticas al montar el componente
  }, [selectedFilter, searchQuery, sortOption, showOnlyHighRating]);

  useEffect(() => {
    applyLocalFilters();
  }, [reviews, selectedFilter, searchQuery, sortOption, showOnlyHighRating]);

  return {
    // Estado
    reviews,
    filteredReviews,
    loading,
    searchQuery,
    selectedFilter,
    sortOption,
    showOnlyHighRating,
    stats,

    // Setters
    setSearchQuery,
    setSelectedFilter,
    setSortOption,
    setShowOnlyHighRating,

    // Funciones
    fetchAllReviews,
    approveReview,
    rejectReview,
    deleteReview,
    updateReview,
    getStats,
    filterReviews,
    applyLocalFilters,

    // Handlers para el componente
    handleApproveReview: approveReview,
    handleRejectReview: rejectReview,
    handleViewReview: (review) => {
      console.log('Ver reseña:', review);
      // Aquí puedes implementar la lógica para mostrar detalles de la reseña
    },
    handleClearFilters: () => {
      setSearchQuery('');
      setSelectedFilter('pending');
      setSortOption('newest');
      setShowOnlyHighRating(false);
    }
  };
};