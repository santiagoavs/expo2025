// src/hooks/useReviews.js
import { useCallback, useEffect, useState } from 'react';
import reviewService from '../api/reviewService';
import { Alert } from 'react-native';

const useReviews = () => {
  // ==================== ESTADOS ====================
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('pending');
  const [sortOption, setSortOption] = useState('newest');
  const [showOnlyHighRating, setShowOnlyHighRating] = useState(false);

  // ==================== UTILIDADES ====================

  // Manejar errores de manera consistente
  const handleError = useCallback((error, defaultMessage) => {
    const errorData = error.response?.data || {};
    const errorMessage = errorData.message || errorData.error || error.message || defaultMessage;

    console.error('❌ [useReviews-Mobile] Error:', { error, response: error.response, config: error.config });
    
    Alert.alert(
      'Error',
      errorMessage,
      [{ text: 'OK', style: 'default' }]
    );
    
    setError(errorMessage);
    throw new Error(errorMessage);
  }, []);

  // ==================== OPERACIONES CRUD ====================

  // Obtener todas las reseñas
  const fetchReviews = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('🔍 [useReviews-Mobile] Obteniendo reseñas...');
      
      const params = {
        status: selectedFilter,
        search: searchQuery,
        sort: sortOption,
        rating: showOnlyHighRating ? 4 : undefined
      };
      
      const response = await reviewService.getAll(params);
      console.log('✅ [useReviews-Mobile] Respuesta recibida:', response);

      // El backend devuelve { data: [...], success: true }
      const data = response.data || response;
      console.log('✅ [useReviews-Mobile] Reseñas extraídas:', data);

      if (!Array.isArray(data)) {
        throw new Error("Formato de reseñas inválido");
      }

      setReviews(data);
      console.log('✅ [useReviews-Mobile] Reseñas establecidas:', data.length);

    } catch (err) {
      console.error("❌ [useReviews-Mobile] Error al cargar reseñas:", err);
      handleError(err, "Error al cargar reseñas");
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, [selectedFilter, searchQuery, sortOption, showOnlyHighRating, handleError]);

  // Aprobar reseña
  const approveReview = useCallback(async (reviewId) => {
    try {
      setLoading(true);
      console.log(`✅ [useReviews-Mobile] Aprobando reseña ${reviewId}`);
      
      const response = await reviewService.approve(reviewId);
      console.log('🔍 [useReviews-Mobile] Respuesta del backend:', response);
      if (response && response.error) {
        throw new Error(response.message || response.error || 'Error al aprobar reseña');
      }

      // Actualizar estado local
      setReviews(prev => prev.map(r => 
        r._id === reviewId || r.id === reviewId ? { ...r, status: 'approved' } : r
      ));

      Alert.alert(
        'Éxito',
        'Reseña aprobada correctamente',
        [{ text: 'OK', style: 'default' }]
      );

      return response;
    } catch (error) {
      handleError(error, 'Error al aprobar reseña');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  // Rechazar reseña
  const rejectReview = useCallback(async (reviewId, reason = '') => {
    try {
      setLoading(true);
      console.log(`❌ [useReviews-Mobile] Rechazando reseña ${reviewId}, razón: ${reason}`);
      
      const response = await reviewService.reject(reviewId, reason);
      console.log('🔍 [useReviews-Mobile] Respuesta del backend:', response);
      if (response && response.error) {
        throw new Error(response.message || response.error || 'Error al rechazar reseña');
      }

      // Actualizar estado local
      setReviews(prev => prev.map(r => 
        r._id === reviewId || r.id === reviewId ? { ...r, status: 'rejected' } : r
      ));

      Alert.alert(
        'Éxito',
        'Reseña rechazada correctamente',
        [{ text: 'OK', style: 'default' }]
      );

      return response;
    } catch (error) {
      handleError(error, 'Error al rechazar reseña');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  // Eliminar reseña
  const deleteReview = useCallback(async (reviewId) => {
    try {
      setLoading(true);
      console.log(`🗑️ [useReviews-Mobile] Eliminando reseña ${reviewId}`);
      
      const response = await reviewService.delete(reviewId);
      console.log('🔍 [useReviews-Mobile] Respuesta del backend:', response);
      if (response && response.error) {
        throw new Error(response.message || response.error || 'Error al eliminar reseña');
      }

      // Remover de estado local
      setReviews(prev => prev.filter(r => r._id !== reviewId && r.id !== reviewId));

      Alert.alert(
        'Éxito',
        'Reseña eliminada correctamente',
        [{ text: 'OK', style: 'default' }]
      );

      return response;
    } catch (error) {
      handleError(error, 'Error al eliminar reseña');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  // Responder a reseña
  const respondToReview = useCallback(async (reviewId, responseText) => {
    try {
      setLoading(true);
      console.log(`💬 [useReviews-Mobile] Respondiendo a reseña ${reviewId}`);
      
      const response = await reviewService.respond(reviewId, responseText);
      console.log('🔍 [useReviews-Mobile] Respuesta del backend:', response);
      if (response && response.error) {
        throw new Error(response.message || response.error || 'Error al responder reseña');
      }

      Alert.alert(
        'Éxito',
        'Respuesta enviada correctamente',
        [{ text: 'OK', style: 'default' }]
      );

      return response;
    } catch (error) {
      handleError(error, 'Error al responder reseña');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  // Destacar reseña
  const featureReview = useCallback(async (reviewId, featured = true) => {
    try {
      setLoading(true);
      console.log(`⭐ [useReviews-Mobile] ${featured ? 'Destacando' : 'Quitando destacado'} reseña ${reviewId}`);
      
      const response = await reviewService.feature(reviewId, featured);
      console.log('🔍 [useReviews-Mobile] Respuesta del backend:', response);
      if (response && response.error) {
        throw new Error(response.message || response.error || 'Error al actualizar reseña');
      }

      // Actualizar estado local
      setReviews(prev => prev.map(r => 
        r._id === reviewId || r.id === reviewId ? { ...r, featured: featured } : r
      ));

      Alert.alert(
        'Éxito',
        `Reseña ${featured ? 'destacada' : 'quitada de destacados'} correctamente`,
        [{ text: 'OK', style: 'default' }]
      );

      return response;
    } catch (error) {
      handleError(error, 'Error al actualizar reseña');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  // ==================== FILTROS Y BÚSQUEDA ====================

  const updateFilters = useCallback((newFilters) => {
    if (newFilters.status !== undefined) {
      setSelectedFilter(newFilters.status);
    }
    if (newFilters.search !== undefined) {
      setSearchQuery(newFilters.search);
    }
    if (newFilters.sort !== undefined) {
      setSortOption(newFilters.sort);
    }
    if (newFilters.rating !== undefined) {
      setShowOnlyHighRating(newFilters.rating);
    }
  }, []);

  const clearFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedFilter('pending');
    setSortOption('newest');
    setShowOnlyHighRating(false);
  }, []);

  // ==================== ESTADÍSTICAS ====================

  // Obtener estadísticas de reseñas
  const getReviewStats = useCallback(() => {
    const total = reviews.length;
    const pending = reviews.filter(review => review.status === 'pending').length;
    const approved = reviews.filter(review => review.status === 'approved').length;
    const rejected = reviews.filter(review => review.status === 'rejected').length;
    const avgRating = reviews.length > 0 
      ? reviews.reduce((sum, review) => sum + (review.rating || 0), 0) / reviews.length 
      : 0;

    return {
      total,
      pending,
      approved,
      rejected,
      avgRating: Math.round(avgRating * 10) / 10
    };
  }, [reviews]);

  // ==================== EFECTOS ====================

  // Cargar reseñas al montar el componente
  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // ==================== RETORNO ====================

  return {
    // Estados
    reviews,
    loading,
    error,
    searchQuery,
    selectedFilter,
    sortOption,
    showOnlyHighRating,

    // Operaciones CRUD
    fetchReviews,
    approveReview,
    rejectReview,
    deleteReview,
    respondToReview,
    featureReview,

    // Filtros y búsqueda
    updateFilters,
    clearFilters,
    setSearchQuery,
    setSelectedFilter,
    setSortOption,
    setShowOnlyHighRating,

    // Estadísticas
    getReviewStats,

    // Utilidades
    hasReviews: reviews.length > 0,
    isEmpty: !loading && reviews.length === 0,
    hasError: !!error
  };
};

export default useReviews;
