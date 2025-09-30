// src/screens/EditProductScreen.js - Pantalla de edición de productos
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Switch,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import useProducts from '../hooks/useProducts';

const EditProductScreen = ({ route, navigation }) => {
  const { productId } = route.params;
  
  // ==================== HOOKS ====================
  const {
    getProductById,
    updateProduct,
    loading
  } = useProducts();

  // ==================== ESTADOS ====================
  const [product, setProduct] = useState(null);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  // Estados del formulario
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    basePrice: '',
    productionTime: '3',
    isActive: true,
    featured: false,
    searchTags: []
  });

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
        setFormData({
          name: productData.name || '',
          description: productData.description || '',
          basePrice: productData.basePrice?.toString() || '',
          productionTime: productData.productionTime?.toString() || '3',
          isActive: productData.isActive ?? true,
          featured: productData.isFeatured ?? false,
          searchTags: productData.searchTags || []
        });
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

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // Validaciones básicas
      if (!formData.name.trim()) {
        Alert.alert('Error', 'El nombre del producto es obligatorio');
        return;
      }

      if (!formData.basePrice || isNaN(parseFloat(formData.basePrice)) || parseFloat(formData.basePrice) <= 0) {
        Alert.alert('Error', 'El precio debe ser un número mayor que 0');
        return;
      }

      const productData = {
        ...formData,
        basePrice: parseFloat(formData.basePrice),
        productionTime: parseInt(formData.productionTime)
      };

      await updateProduct(productId, productData);
      
      Alert.alert(
        '¡Éxito!',
        'El producto ha sido actualizado exitosamente',
        [
          {
            text: 'Continuar',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (error) {
      console.error('Error saving product:', error);
      Alert.alert('Error', 'No se pudo actualizar el producto');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    Alert.alert(
      'Cancelar Edición',
      '¿Estás seguro de que quieres cancelar? Los cambios no guardados se perderán.',
      [
        { text: 'Continuar Editando', style: 'cancel' },
        { text: 'Cancelar', style: 'destructive', onPress: () => navigation.goBack() }
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
          style={styles.cancelButton}
          onPress={handleCancel}
        >
          <Text style={styles.cancelButtonText}>Cancelar</Text>
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Editar Producto</Text>
        
        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={styles.saveButtonText}>Guardar</Text>
          )}
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Información Básica */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Información Básica</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nombre del Producto *</Text>
              <TextInput
                style={styles.textInput}
                value={formData.name}
                onChangeText={(value) => handleInputChange('name', value)}
                placeholder="Ingresa el nombre del producto"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Descripción</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={formData.description}
                onChangeText={(value) => handleInputChange('description', value)}
                placeholder="Describe el producto..."
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.inputLabel}>Precio Base *</Text>
                <TextInput
                  style={styles.textInput}
                  value={formData.basePrice}
                  onChangeText={(value) => handleInputChange('basePrice', value)}
                  placeholder="0.00"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                />
              </View>

              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.inputLabel}>Tiempo de Producción (días)</Text>
                <TextInput
                  style={styles.textInput}
                  value={formData.productionTime}
                  onChangeText={(value) => handleInputChange('productionTime', value)}
                  placeholder="3"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>

          {/* Configuración */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Configuración</Text>
            
            <View style={styles.switchRow}>
              <View style={styles.switchInfo}>
                <Text style={styles.switchLabel}>Producto Activo</Text>
                <Text style={styles.switchDescription}>
                  Los productos inactivos no aparecerán en el catálogo público
                </Text>
              </View>
              <Switch
                value={formData.isActive}
                onValueChange={(value) => handleInputChange('isActive', value)}
                trackColor={{ false: '#E5E7EB', true: '#1F64BF' }}
                thumbColor={formData.isActive ? '#FFFFFF' : '#FFFFFF'}
              />
            </View>

            <View style={styles.switchRow}>
              <View style={styles.switchInfo}>
                <Text style={styles.switchLabel}>Producto Destacado</Text>
                <Text style={styles.switchDescription}>
                  Los productos destacados aparecen primero en el catálogo
                </Text>
              </View>
              <Switch
                value={formData.featured}
                onValueChange={(value) => handleInputChange('featured', value)}
                trackColor={{ false: '#E5E7EB', true: '#F59E0B' }}
                thumbColor={formData.featured ? '#FFFFFF' : '#FFFFFF'}
              />
            </View>
          </View>

          {/* Información Adicional */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Información Adicional</Text>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Categoría:</Text>
              <Text style={styles.infoValue}>{product.categoryName}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Fecha de Creación:</Text>
              <Text style={styles.infoValue}>{product.createdDate}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Última Actualización:</Text>
              <Text style={styles.infoValue}>{product.updatedDate}</Text>
            </View>
          </View>

          {/* Estadísticas */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Estadísticas</Text>
            
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Ionicons name="eye-outline" size={24} color="#1F64BF" />
                <Text style={styles.statValue}>{product.totalViews}</Text>
                <Text style={styles.statLabel}>Vistas</Text>
              </View>
              
              <View style={styles.statCard}>
                <Ionicons name="cart-outline" size={24} color="#10B981" />
                <Text style={styles.statValue}>{product.totalOrders}</Text>
                <Text style={styles.statLabel}>Pedidos</Text>
              </View>
              
              <View style={styles.statCard}>
                <Ionicons name="brush-outline" size={24} color="#F59E0B" />
                <Text style={styles.statValue}>{product.totalDesigns}</Text>
                <Text style={styles.statLabel}>Diseños</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  cancelButton: {
    padding: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#6B7280',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  saveButton: {
    backgroundColor: '#1F64BF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    backgroundColor: 'white',
    marginBottom: 16,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
    backgroundColor: 'white',
  },
  textArea: {
    height: 100,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  switchInfo: {
    flex: 1,
    marginRight: 16,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 4,
  },
  switchDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
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
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    marginHorizontal: 4,
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
});

export default EditProductScreen;
