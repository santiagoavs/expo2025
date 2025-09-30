// src/screens/ReviewsScreen.js
import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Dimensions,
  ScrollView,
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AuthenticatedWrapper from '../components/AuthenticatedWrapper';
import useReviews from '../hooks/useReviews';

const { width } = Dimensions.get('window');

const ReviewsScreen = ({ navigation }) => {
  const {
    reviews,
    loading,
    error,
    searchQuery,
    selectedFilter,
    sortOption,
    showOnlyHighRating,
    fetchReviews,
    approveReview,
    rejectReview,
    deleteReview,
    featureReview,
    updateFilters,
    clearFilters,
    setSearchQuery,
    setSelectedFilter,
    setSortOption,
    setShowOnlyHighRating,
    getReviewStats
  } = useReviews();

  // ==================== ESTADOS LOCALES ====================
  const [refreshing, setRefreshing] = useState(false);

  // ==================== FILTROS Y BÚSQUEDA ====================
  const filteredReviews = useMemo(() => {
    let filtered = reviews;

    // Aplicar búsqueda
    if (searchQuery.trim()) {
      filtered = filtered.filter(review =>
        review.comment?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        review.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        review.product?.name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Aplicar filtro de estado
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(review => review.status === selectedFilter);
    }

    // Aplicar filtro de calificación alta
    if (showOnlyHighRating) {
      filtered = filtered.filter(review => review.rating >= 4);
    }

    // Aplicar ordenamiento
    filtered.sort((a, b) => {
      switch (sortOption) {
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'status':
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

    return filtered;
  }, [reviews, searchQuery, selectedFilter, showOnlyHighRating, sortOption]);

  // ==================== CALCULADOS ====================
  const stats = useMemo(() => {
    const reviewStats = getReviewStats();
    
    return [
      [
        {
          id: 'total-reviews',
          title: "Total Reseñas",
          value: reviewStats.total,
          icon: 'chatbubbles-outline'
        },
        {
          id: 'pending-reviews',
          title: "Pendientes",
          value: reviewStats.pending,
          icon: 'time-outline'
        }
      ],
      [
        {
          id: 'approved-reviews',
          title: "Aprobadas",
          value: reviewStats.approved,
          icon: 'checkmark-circle-outline'
        },
        {
          id: 'avg-rating',
          title: "Calificación Promedio",
          value: reviewStats.avgRating,
          icon: 'star-outline'
        }
      ]
    ];
  }, [getReviewStats]);

  // ==================== MANEJADORES ====================
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchReviews();
    } catch (error) {
      console.error('Error refreshing reviews:', error);
    } finally {
      setRefreshing(false);
    }
  }, [fetchReviews]);

  const handleSearch = useCallback((text) => {
    setSearchQuery(text);
  }, [setSearchQuery]);

  const handleFilterChange = useCallback((filter) => {
    setSelectedFilter(filter);
  }, [setSelectedFilter]);

  const handleSortChange = useCallback((sort) => {
    setSortOption(sort);
  }, [setSortOption]);

  const handleToggleHighRating = useCallback(() => {
    setShowOnlyHighRating(!showOnlyHighRating);
  }, [showOnlyHighRating, setShowOnlyHighRating]);

  const handleApprove = useCallback(async (review) => {
    try {
      await approveReview(review.id || review._id);
    } catch (error) {
      console.error('Error approving review:', error);
    }
  }, [approveReview]);

  const handleReject = useCallback(async (review) => {
    try {
      await rejectReview(review.id || review._id);
    } catch (error) {
      console.error('Error rejecting review:', error);
    }
  }, [rejectReview]);

  const handleDelete = useCallback(async (review) => {
    try {
      await deleteReview(review.id || review._id);
    } catch (error) {
      console.error('Error deleting review:', error);
    }
  }, [deleteReview]);

  const handleFeature = useCallback(async (review) => {
    try {
      await featureReview(review.id || review._id, !review.featured);
    } catch (error) {
      console.error('Error featuring review:', error);
    }
  }, [featureReview]);

  // ==================== RENDERIZADO ====================
  const renderReviewCard = useCallback(({ item: review }) => {
    // Debug: Mostrar datos del usuario
    console.log('🔍 [ReviewsScreen] Datos de la reseña:', {
      id: review.id || review._id,
      userId: review.userId,
      user: review.user,
      userName: review.user?.name,
      userEmail: review.user?.email
    });

    return (
      <TouchableOpacity
        style={styles.reviewCard}
        activeOpacity={0.7}
      >
        <View style={styles.reviewHeader}>
          <View style={styles.reviewInfo}>
            <View style={styles.userInfo}>
              <View style={styles.userAvatar}>
                <Ionicons name="person" size={20} color="#1F64BF" />
              </View>
              <View style={styles.userDetails}>
                <Text style={styles.userName}>
                  {review.user?.name || review.userId?.name || 'Usuario Anónimo'}
                </Text>
                <Text style={styles.productName}>{review.product?.name || 'Producto'}</Text>
              </View>
            </View>
            <View style={styles.ratingContainer}>
              <View style={styles.rating}>
                {[...Array(5)].map((_, i) => (
                  <Ionicons
                    key={i}
                    name={i < (review.rating || 0) ? 'star' : 'star-outline'}
                    size={16}
                    color="#FFD700"
                  />
                ))}
              </View>
              <Text style={styles.ratingText}>{review.rating || 0}/5</Text>
            </View>
          </View>
          
          {/* Badge de estado */}
          <View style={[styles.statusBadge, getStatusBadgeStyle(review.status)]}>
            <Text style={[styles.statusText, getStatusTextStyle(review.status)]}>
              {getStatusText(review.status)}
            </Text>
          </View>
        </View>
        
        {/* Acciones solo para reseñas pendientes */}
        {review.status === 'pending' && (
          <View style={styles.reviewActions}>
            <TouchableOpacity
              style={styles.approveButton}
              onPress={() => handleApprove(review)}
            >
              <Ionicons name="checkmark" size={20} color="white" />
              <Text style={styles.actionButtonText}>Aprobar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.rejectButton}
              onPress={() => handleReject(review)}
            >
              <Ionicons name="close" size={20} color="white" />
              <Text style={styles.actionButtonText}>Rechazar</Text>
            </TouchableOpacity>
          </View>
        )}
        
        <View style={styles.reviewContent}>
          <Text style={styles.reviewComment}>{review.comment || 'Sin comentario'}</Text>
          {review.response && (
            <View style={styles.responseContainer}>
              <Text style={styles.responseLabel}>Respuesta:</Text>
              <Text style={styles.responseText}>{review.response}</Text>
            </View>
          )}
        </View>
        
        <View style={styles.reviewFooter}>
          <View style={styles.reviewMeta}>
            <View style={[styles.statusBadge, getStatusBadgeStyle(review.status)]}>
              <Text style={[styles.statusText, getStatusTextStyle(review.status)]}>
                {getStatusText(review.status)}
              </Text>
            </View>
            {review.featured && (
              <View style={styles.featuredBadge}>
                <Ionicons name="star" size={12} color="#FFD700" />
                <Text style={styles.featuredText}>Destacada</Text>
              </View>
            )}
          </View>
          <Text style={styles.reviewDate}>
            {new Date(review.createdAt).toLocaleDateString()}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }, [handleApprove, handleReject]);

  const renderEmptyState = useCallback(() => (
    <View style={styles.emptyState}>
      <Ionicons name="chatbubbles-outline" size={64} color="#9CA3AF" />
      <Text style={styles.emptyTitle}>No hay reseñas</Text>
      <Text style={styles.emptySubtitle}>
        {searchQuery ? 'No se encontraron reseñas con ese criterio' : 'Aún no hay reseñas registradas'}
      </Text>
    </View>
  ), [searchQuery]);

  // ==================== RENDER ====================
  return (
    <AuthenticatedWrapper title="Reseñas" subtitle="Gestión de Reseñas">
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Reseñas</Text>
          <Text style={styles.headerSubtitle}>Gestiona las reseñas de productos</Text>
        </View>
      </View>

      {/* Estadísticas en 2x2 */}
      <View style={styles.statsContainer}>
        {stats.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.statsRow}>
            {row.map((stat) => (
              <View key={stat.id} style={styles.statCard}>
                <Ionicons name={stat.icon} size={24} color="#1F64BF" />
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statTitle}>{stat.title}</Text>
              </View>
            ))}
          </View>
        ))}
      </View>

      {/* Filtros y Búsqueda */}
      <View style={styles.filtersContainer}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#6B7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar reseñas..."
            value={searchQuery}
            onChangeText={handleSearch}
            placeholderTextColor="#9CA3AF"
          />
        </View>
        
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.filtersScroll}
          contentContainerStyle={styles.filtersContent}
        >
          <TouchableOpacity
            style={[styles.filterButton, selectedFilter === 'all' && styles.activeFilter]}
            onPress={() => handleFilterChange('all')}
          >
            <Text style={[styles.filterText, selectedFilter === 'all' && styles.activeFilterText]}>
              Todas
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.filterButton, selectedFilter === 'pending' && styles.activeFilter]}
            onPress={() => handleFilterChange('pending')}
          >
            <Text style={[styles.filterText, selectedFilter === 'pending' && styles.activeFilterText]}>
              Pendientes
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.filterButton, selectedFilter === 'approved' && styles.activeFilter]}
            onPress={() => handleFilterChange('approved')}
          >
            <Text style={[styles.filterText, selectedFilter === 'approved' && styles.activeFilterText]}>
              Aprobadas
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.filterButton, selectedFilter === 'rejected' && styles.activeFilter]}
            onPress={() => handleFilterChange('rejected')}
          >
            <Text style={[styles.filterText, selectedFilter === 'rejected' && styles.activeFilterText]}>
              Rechazadas
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterButton, showOnlyHighRating && styles.activeFilter]}
            onPress={handleToggleHighRating}
          >
            <Ionicons 
              name={showOnlyHighRating ? 'star' : 'star-outline'} 
              size={16} 
              color={showOnlyHighRating ? 'white' : '#6B7280'} 
            />
            <Text style={[styles.filterText, showOnlyHighRating && styles.activeFilterText]}>
              Alta Calificación
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Lista de reseñas */}
      <FlatList
        data={filteredReviews}
        renderItem={renderReviewCard}
        keyExtractor={(item) => item.id || item._id}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#1F64BF']}
            tintColor="#1F64BF"
          />
        }
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </AuthenticatedWrapper>
  );
};

// ==================== FUNCIONES AUXILIARES ====================
const getStatusText = (status) => {
  const statusTexts = {
    pending: 'Pendiente',
    approved: 'Aprobada',
    rejected: 'Rechazada'
  };
  return statusTexts[status] || status;
};

const getStatusButtonStyle = (status) => {
  switch (status) {
    case 'approved':
      return styles.approvedButton;
    case 'rejected':
      return styles.rejectedButton;
    default:
      return styles.pendingButton;
  }
};

const getStatusBadgeStyle = (status) => {
  switch (status) {
    case 'approved':
      return styles.approvedBadge;
    case 'rejected':
      return styles.rejectedBadge;
    default:
      return styles.pendingBadge;
  }
};

const getStatusTextStyle = (status) => {
  switch (status) {
    case 'approved':
      return styles.approvedText;
    case 'rejected':
      return styles.rejectedText;
    default:
      return styles.pendingText;
  }
};

// ==================== ESTILOS ====================
const styles = StyleSheet.create({
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F64BF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  
  // Estadísticas
  statsContainer: {
    paddingHorizontal: 16,
    marginVertical: 16,
    gap: 12,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    flex: 1,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F64BF',
    marginTop: 8,
  },
  statTitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
    fontWeight: '500',
  },
  
  // Filtros
  filtersContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#374151',
  },
  filtersScroll: {
    marginTop: 8,
  },
  filtersContent: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 6,
  },
  activeFilter: {
    backgroundColor: '#1F64BF',
    borderColor: '#1F64BF',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  activeFilterText: {
    color: 'white',
  },
  
  // Lista
  listContainer: {
    padding: 16,
    flexGrow: 1,
  },
  
  // Cards de reseñas
  reviewCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  reviewInfo: {
    flex: 1,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  productName: {
    fontSize: 14,
    color: '#6B7280',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rating: {
    flexDirection: 'row',
    gap: 2,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  reviewActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 12,
  },
  approveButton: {
    backgroundColor: '#10B981',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  rejectButton: {
    backgroundColor: '#EF4444',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  
  // Badge de estado
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  pendingBadge: {
    backgroundColor: '#FEF3C7',
  },
  approvedBadge: {
    backgroundColor: '#D1FAE5',
  },
  rejectedBadge: {
    backgroundColor: '#FEE2E2',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  pendingText: {
    color: '#D97706',
  },
  approvedText: {
    color: '#059669',
  },
  rejectedText: {
    color: '#DC2626',
  },
  reviewContent: {
    marginBottom: 12,
  },
  reviewComment: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  responseContainer: {
    marginTop: 8,
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
  },
  responseLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 4,
  },
  responseText: {
    fontSize: 14,
    color: '#374151',
  },
  reviewFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  reviewMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pendingBadge: {
    backgroundColor: '#FEF3C7',
  },
  approvedBadge: {
    backgroundColor: '#D1FAE5',
  },
  rejectedBadge: {
    backgroundColor: '#FEE2E2',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  pendingText: {
    color: '#92400E',
  },
  approvedText: {
    color: '#065F46',
  },
  rejectedText: {
    color: '#991B1B',
  },
  featuredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
  },
  featuredText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#92400E',
  },
  reviewDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  
  // Estado vacío
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});

export default ReviewsScreen;
