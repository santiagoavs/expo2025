// src/screens/ProductsScreen.js - Pantalla principal de gestión de productos
import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
  TextInput,
  ScrollView,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import useProducts from '../hooks/useProducts';
import AuthenticatedWrapper from '../components/AuthenticatedWrapper';

const { width } = Dimensions.get('window');

const ProductsScreen = ({ navigation }) => {
  // ==================== HOOKS ====================
  const {
    products,
    loading,
    error,
    pagination,
    filters,
    fetchProducts,
    fetchAllProducts,
    toggleProductStatus,
    updateProductStats,
    updateFilters,
    clearFilters,
    getProductStats,
    hasProducts,
    isEmpty
  } = useProducts();

  // ==================== ESTADOS LOCALES ====================
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [sortOption, setSortOption] = useState('newest');
  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // ==================== EFECTOS ====================
  useEffect(() => {
    updateFilters({
      search: searchQuery,
      isActive: selectedFilter === 'all' ? '' : selectedFilter === 'active',
      sort: sortOption
    });
  }, [searchQuery, selectedFilter, sortOption, updateFilters]);

  // ==================== CALCULADOS ====================
  const stats = useMemo(() => {
    const productStats = getProductStats();
    
    return [
      {
        id: 'total-products',
        title: "Total",
        value: productStats.total,
        color: '#1F64BF',
        icon: 'cube-outline'
      },
      {
        id: 'active-products',
        title: "Activos",
        value: productStats.active,
        color: '#10B981',
        icon: 'checkmark-circle-outline'
      },
      {
        id: 'inactive-products',
        title: "Inactivos",
        value: productStats.inactive,
        color: '#EF4444',
        icon: 'close-circle-outline'
      },
      {
        id: 'featured-products',
        title: "Destacados",
        value: productStats.featured,
        color: '#F59E0B',
        icon: 'star-outline'
      }
    ];
  }, [getProductStats]);

  // ==================== MANEJADORES ====================
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchProducts();
    } finally {
      setRefreshing(false);
    }
  };

  const handleProductPress = (product) => {
    updateProductStats(product.id, 'view');
    navigation.navigate('ProductDetail', { productId: product.id });
  };

  const handleToggleStatus = async (product) => {
    try {
      const newStatus = !product.isActive;
      await toggleProductStatus(product.id, newStatus);
    } catch (error) {
      console.error('Error cambiando estado:', error);
    }
  };

  const handleEditProduct = (product) => {
    navigation.navigate('EditProduct', { productId: product.id });
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
  };

  const handleFilterChange = (filter) => {
    setSelectedFilter(filter);
  };

  const handleSortChange = (sort) => {
    setSortOption(sort);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedFilter('all');
    setSortOption('newest');
    clearFilters();
  };

  // ==================== RENDER ITEM ====================
  const renderProductItem = ({ item: product }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => handleProductPress(product)}
      activeOpacity={0.7}
    >
      <View style={styles.productHeader}>
        <View style={styles.productImageContainer}>
          {product.mainImage ? (
            <Text style={styles.productImagePlaceholder}>📷</Text>
          ) : (
            <View style={styles.productImagePlaceholder}>
              <Ionicons name="image-outline" size={24} color="#9CA3AF" />
            </View>
          )}
        </View>
        
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>
            {product.name}
          </Text>
          <Text style={styles.productCategory}>{product.categoryName}</Text>
          <Text style={styles.productPrice}>{product.formattedPrice}</Text>
        </View>

        <View style={styles.productActions}>
          <TouchableOpacity
            style={[
              styles.statusButton,
              { backgroundColor: product.isActive ? '#10B981' : '#EF4444' }
            ]}
            onPress={() => handleToggleStatus(product)}
          >
            <Ionicons
              name={product.isActive ? 'checkmark' : 'close'}
              size={16}
              color="white"
            />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => handleEditProduct(product)}
          >
            <Ionicons name="pencil" size={16} color="#1F64BF" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.productStats}>
        <View style={styles.statItem}>
          <Ionicons name="eye-outline" size={14} color="#6B7280" />
          <Text style={styles.statText}>{product.totalViews}</Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="cart-outline" size={14} color="#6B7280" />
          <Text style={styles.statText}>{product.totalOrders}</Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="time-outline" size={14} color="#6B7280" />
          <Text style={styles.statText}>{product.daysAgo}d</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderStatsCard = ({ item: stat }) => (
    <View style={[styles.statCard, { borderLeftColor: stat.color }]}>
      <View style={styles.statContent}>
        <Text style={styles.statValue}>{stat.value}</Text>
        <Text style={styles.statTitle}>{stat.title}</Text>
      </View>
      <Ionicons name={stat.icon} size={24} color={stat.color} />
    </View>
  );

  // ==================== RENDER ====================
  if (loading && !hasProducts) {
    return (
      <AuthenticatedWrapper title="Productos" subtitle="Gestión de Productos">
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1F64BF" />
          <Text style={styles.loadingText}>Cargando productos...</Text>
        </View>
      </AuthenticatedWrapper>
    );
  }

  return (
    <AuthenticatedWrapper title="Productos" subtitle="Gestión de Productos">
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Gestión de Productos</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('CreateProduct')}
        >
          <Ionicons name="add" size={20} color="white" />
        </TouchableOpacity>
      </View>

      {/* Estadísticas */}
      <View style={styles.statsContainer}>
        <FlatList
          data={stats}
          renderItem={renderStatsCard}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.statsList}
        />
      </View>

      {/* Búsqueda y Filtros */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar productos..."
            value={searchQuery}
            onChangeText={handleSearch}
            placeholderTextColor="#9CA3AF"
          />
        </View>
        
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Ionicons name="filter" size={20} color="#1F64BF" />
        </TouchableOpacity>
      </View>

      {/* Filtros Expandibles */}
      {showFilters && (
        <View style={styles.filtersContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity
              style={[
                styles.filterChip,
                selectedFilter === 'all' && styles.filterChipActive
              ]}
              onPress={() => handleFilterChange('all')}
            >
              <Text style={[
                styles.filterChipText,
                selectedFilter === 'all' && styles.filterChipTextActive
              ]}>
                Todos
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.filterChip,
                selectedFilter === 'active' && styles.filterChipActive
              ]}
              onPress={() => handleFilterChange('active')}
            >
              <Text style={[
                styles.filterChipText,
                selectedFilter === 'active' && styles.filterChipTextActive
              ]}>
                Activos
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.filterChip,
                selectedFilter === 'inactive' && styles.filterChipActive
              ]}
              onPress={() => handleFilterChange('inactive')}
            >
              <Text style={[
                styles.filterChipText,
                selectedFilter === 'inactive' && styles.filterChipTextActive
              ]}>
                Inactivos
              </Text>
            </TouchableOpacity>
          </ScrollView>
          
          <TouchableOpacity
            style={styles.clearFiltersButton}
            onPress={handleClearFilters}
          >
            <Text style={styles.clearFiltersText}>Limpiar</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Lista de Productos */}
      {isEmpty ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="cube-outline" size={64} color="#9CA3AF" />
          <Text style={styles.emptyTitle}>No hay productos</Text>
          <Text style={styles.emptyDescription}>
            {searchQuery || selectedFilter !== 'all'
              ? 'No se encontraron productos que coincidan con los filtros'
              : 'Comienza creando tu primer producto'
            }
          </Text>
          <TouchableOpacity
            style={styles.createFirstButton}
            onPress={() => navigation.navigate('CreateProduct')}
          >
            <Text style={styles.createFirstButtonText}>Crear Producto</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={products}
          renderItem={renderProductItem}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#1F64BF']}
              tintColor="#1F64BF"
            />
          }
          contentContainerStyle={styles.productsList}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Error State */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={handleRefresh}
          >
            <Text style={styles.retryButtonText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      )}
    </AuthenticatedWrapper>
  );
};

// ==================== ESTILOS ====================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
  },
  addButton: {
    backgroundColor: '#1F64BF',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    backgroundColor: 'white',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  statsList: {
    paddingHorizontal: 20,
  },
  statCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    marginRight: 12,
    borderRadius: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minWidth: 120,
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
  },
  statTitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 44,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
  },
  filterButton: {
    marginLeft: 12,
    padding: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
  },
  filtersContainer: {
    backgroundColor: 'white',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    marginRight: 8,
    marginLeft: 20,
  },
  filterChipActive: {
    backgroundColor: '#1F64BF',
  },
  filterChipText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: 'white',
  },
  clearFiltersButton: {
    alignSelf: 'flex-end',
    marginRight: 20,
    marginTop: 8,
  },
  clearFiltersText: {
    fontSize: 14,
    color: '#1F64BF',
    fontWeight: '500',
  },
  productsList: {
    padding: 20,
  },
  productCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  productImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  productImagePlaceholder: {
    fontSize: 24,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  productCategory: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F64BF',
  },
  productActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  editButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  createFirstButton: {
    backgroundColor: '#1F64BF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  createFirstButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  errorContainer: {
    backgroundColor: '#FEF2F2',
    padding: 16,
    margin: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    marginBottom: 8,
  },
  retryButton: {
    alignSelf: 'flex-start',
  },
  retryButtonText: {
    color: '#DC2626',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default ProductsScreen;
