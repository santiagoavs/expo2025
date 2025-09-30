// src/screens/ProductDetailScreen.js - Pantalla de detalles del producto
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import useProducts from '../hooks/useProducts';

const { width } = Dimensions.get('window');

const ProductDetailScreen = ({ route, navigation }) => {
  const { productId } = route.params;
  
  // ==================== HOOKS ====================
  const {
    getProductById,
    toggleProductStatus,
    updateProductStats,
    loading
  } = useProducts();

  // ==================== ESTADOS ====================
  const [product, setProduct] = useState(null);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [error, setError] = useState(null);

  // ==================== EFECTOS ====================
  useEffect(() => {
    loadProduct();
  }, [productId]);

  // ==================== FUNCIONES ====================
  const loadProduct = async () => {
    try {
      setLoadingProduct(true);
      setError(null);
      
      const productData = await getProductById(productId);
      if (productData) {
        setProduct(productData);
        // Actualizar estadísticas de vista
        updateProductStats(productId, 'view');
      } else {
        setError('Producto no encontrado');
      }
    } catch (err) {
      setError('Error al cargar el producto');
      console.error('Error loading product:', err);
    } finally {
      setLoadingProduct(false);
    }
  };

  const handleToggleStatus = async () => {
    try {
      const newStatus = !product.isActive;
      await toggleProductStatus(product.id, newStatus);
      
      // Actualizar estado local
      setProduct(prev => ({
        ...prev,
        isActive: newStatus
      }));
    } catch (error) {
      console.error('Error changing status:', error);
    }
  };

  const handleEditProduct = () => {
    navigation.navigate('EditProduct', { productId: product.id });
  };

  const handleDeleteProduct = () => {
    Alert.alert(
      'Eliminar Producto',
      `¿Estás seguro de que quieres eliminar "${product.name}"? Esta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            // TODO: Implementar eliminación
            Alert.alert('Función en desarrollo', 'La eliminación de productos estará disponible próximamente');
          }
        }
      ]
    );
  };

  // ==================== RENDER ====================
  if (loadingProduct) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1F64BF" />
          <Text style={styles.loadingText}>Cargando producto...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !product) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
          <Text style={styles.errorTitle}>Error</Text>
          <Text style={styles.errorText}>{error || 'Producto no encontrado'}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={loadProduct}
          >
            <Text style={styles.retryButtonText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Detalles del Producto</Text>
        
        <TouchableOpacity
          style={styles.editButton}
          onPress={handleEditProduct}
        >
          <Ionicons name="pencil" size={20} color="#1F64BF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Imagen del Producto */}
        <View style={styles.imageContainer}>
          {product.mainImage ? (
            <Image
              source={{ uri: product.mainImage }}
              style={styles.productImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="image-outline" size={64} color="#9CA3AF" />
              <Text style={styles.imagePlaceholderText}>Sin imagen</Text>
            </View>
          )}
        </View>

        {/* Información Principal */}
        <View style={styles.infoContainer}>
          <View style={styles.titleRow}>
            <Text style={styles.productName}>{product.name}</Text>
            <View style={[
              styles.statusBadge,
              { backgroundColor: product.isActive ? '#10B981' : '#EF4444' }
            ]}>
              <Text style={styles.statusText}>
                {product.isActive ? 'Activo' : 'Inactivo'}
              </Text>
            </View>
          </View>

          <Text style={styles.productPrice}>{product.formattedPrice}</Text>
          <Text style={styles.productCategory}>{product.categoryName}</Text>
          
          {product.description && (
            <Text style={styles.productDescription}>{product.description}</Text>
          )}
        </View>

        {/* Estadísticas */}
        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>Estadísticas</Text>
          
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Ionicons name="eye-outline" size={24} color="#1F64BF" />
              <Text style={styles.statValue}>{product.totalViews}</Text>
              <Text style={styles.statLabel}>Vistas</Text>
            </View>
            
            <View style={styles.statItem}>
              <Ionicons name="cart-outline" size={24} color="#10B981" />
              <Text style={styles.statValue}>{product.totalOrders}</Text>
              <Text style={styles.statLabel}>Pedidos</Text>
            </View>
            
            <View style={styles.statItem}>
              <Ionicons name="brush-outline" size={24} color="#F59E0B" />
              <Text style={styles.statValue}>{product.totalDesigns}</Text>
              <Text style={styles.statLabel}>Diseños</Text>
            </View>
            
            <View style={styles.statItem}>
              <Ionicons name="time-outline" size={24} color="#6B7280" />
              <Text style={styles.statValue}>{product.daysAgo}</Text>
              <Text style={styles.statLabel}>Días</Text>
            </View>
          </View>
        </View>

        {/* Información Adicional */}
        <View style={styles.additionalInfoContainer}>
          <Text style={styles.sectionTitle}>Información Adicional</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Tiempo de Producción:</Text>
            <Text style={styles.infoValue}>{product.productionTime || 3} días</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Fecha de Creación:</Text>
            <Text style={styles.infoValue}>{product.createdDate}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Última Actualización:</Text>
            <Text style={styles.infoValue}>{product.updatedDate}</Text>
          </View>
          
          {product.isFeatured && (
            <View style={styles.featuredBadge}>
              <Ionicons name="star" size={16} color="#F59E0B" />
              <Text style={styles.featuredText}>Producto Destacado</Text>
            </View>
          )}
        </View>

        {/* Tags de Búsqueda */}
        {product.searchTags && product.searchTags.length > 0 && (
          <View style={styles.tagsContainer}>
            <Text style={styles.sectionTitle}>Tags de Búsqueda</Text>
            <View style={styles.tagsList}>
              {product.searchTags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Acciones */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[
            styles.actionButton,
            styles.toggleButton,
            { backgroundColor: product.isActive ? '#EF4444' : '#10B981' }
          ]}
          onPress={handleToggleStatus}
          disabled={loading}
        >
          <Ionicons
            name={product.isActive ? 'pause' : 'play'}
            size={20}
            color="white"
          />
          <Text style={styles.actionButtonText}>
            {product.isActive ? 'Desactivar' : 'Activar'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.editActionButton]}
          onPress={handleEditProduct}
        >
          <Ionicons name="pencil" size={20} color="#1F64BF" />
          <Text style={[styles.actionButtonText, styles.editActionButtonText]}>
            Editar
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={handleDeleteProduct}
        >
          <Ionicons name="trash" size={20} color="#EF4444" />
          <Text style={[styles.actionButtonText, styles.deleteButtonText]}>
            Eliminar
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#1F64BF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
    textAlign: 'center',
  },
  editButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  imageContainer: {
    backgroundColor: 'white',
    marginBottom: 16,
  },
  productImage: {
    width: width,
    height: 250,
  },
  imagePlaceholder: {
    width: width,
    height: 250,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    marginTop: 8,
    fontSize: 16,
    color: '#9CA3AF',
  },
  infoContainer: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  productName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    flex: 1,
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  productPrice: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F64BF',
    marginBottom: 8,
  },
  productCategory: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 12,
  },
  productDescription: {
    fontSize: 16,
    color: '#4B5563',
    lineHeight: 24,
  },
  statsContainer: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    marginBottom: 12,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  additionalInfoContainer: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  infoLabel: {
    fontSize: 16,
    color: '#6B7280',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
  },
  featuredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginTop: 12,
    alignSelf: 'flex-start',
  },
  featuredText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '600',
    color: '#D97706',
  },
  tagsContainer: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 16,
  },
  tagsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 12,
    color: '#6B7280',
  },
  actionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  toggleButton: {
    backgroundColor: '#10B981',
  },
  editActionButton: {
    backgroundColor: '#F3F4F6',
  },
  deleteButton: {
    backgroundColor: '#FEF2F2',
  },
  actionButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  editActionButtonText: {
    color: '#1F64BF',
  },
  deleteButtonText: {
    color: '#EF4444',
  },
});

export default ProductDetailScreen;
