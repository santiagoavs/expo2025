// src/screens/CategoryDetailScreen.js - Pantalla de detalles de categoría
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import useCategories from '../hooks/useCategories';
import AuthenticatedWrapper from '../components/AuthenticatedWrapper';
import { showDeleteConfirm, showStatusChange } from '../utils/SweetAlert';

const CategoryDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { category: initialCategory } = route.params || {};
  
  const { 
    getById, 
    deleteCategory, 
    toggleCategoryStatus,
    loading 
  } = useCategories();

  const [category, setCategory] = useState(initialCategory);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // ==================== EFECTOS ====================
  useEffect(() => {
    if (initialCategory?.id) {
      loadCategoryDetail(initialCategory.id);
    }
  }, [initialCategory]);

  // ==================== FUNCIONES ====================
  const loadCategoryDetail = async (categoryId) => {
    try {
      setLoadingDetail(true);
      const response = await getById(categoryId);
      if (response.success) {
        setCategory(response.data);
      }
    } catch (error) {
      console.error('Error loading category detail:', error);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleEdit = () => {
    navigation.navigate('EditCategory', { category });
  };

  const handleDelete = () => {
    showDeleteConfirm(
      category.name,
      async () => {
        try {
          await deleteCategory(category.id);
          navigation.goBack();
        } catch (error) {
          console.error('Error deleting category:', error);
        }
      }
    );
  };

  const handleToggleStatus = () => {
    showStatusChange(
      category.name,
      !category.isActive,
      async () => {
        try {
          await toggleCategoryStatus(category.id);
          setCategory(prev => ({ ...prev, isActive: !prev.isActive }));
        } catch (error) {
          console.error('Error toggling status:', error);
        }
      }
    );
  };

  const handleBack = () => {
    navigation.goBack();
  };

  // ==================== RENDER ====================
  if (loadingDetail) {
    return (
      <AuthenticatedWrapper title="Detalles" subtitle="Cargando categoría...">
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1F64BF" />
          <Text style={styles.loadingText}>Cargando detalles...</Text>
        </View>
      </AuthenticatedWrapper>
    );
  }

  if (!category) {
    return (
      <AuthenticatedWrapper title="Error" subtitle="Categoría no encontrada">
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color="#EF4444" />
          <Text style={styles.errorTitle}>Categoría no encontrada</Text>
          <Text style={styles.errorText}>
            La categoría que buscas no existe o ha sido eliminada.
          </Text>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Ionicons name="arrow-back" size={16} color="white" />
            <Text style={styles.backButtonText}>Volver</Text>
          </TouchableOpacity>
        </View>
      </AuthenticatedWrapper>
    );
  }

  return (
    <AuthenticatedWrapper title="Detalles" subtitle={category.name}>
      {/* Header con flecha de navegación */}
      <View style={styles.navigationHeader}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleBack}
        >
          <Ionicons name="arrow-back" size={24} color="#1F64BF" />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>Detalles de Categoría</Text>
          <Text style={styles.headerSubtitle}>{category.name}</Text>
        </View>
      </View>
      
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header con imagen */}
        <View style={styles.header}>
          <View style={styles.imageContainer}>
            {category.image ? (
              <Image source={{ uri: category.image }} style={styles.categoryImage} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Ionicons name="folder" size={48} color="#1F64BF" />
              </View>
            )}
          </View>
          
          <View style={styles.headerInfo}>
            <Text style={styles.categoryName}>{category.name}</Text>
            <View style={styles.statusContainer}>
              <View style={[
                styles.statusDot,
                { backgroundColor: category.isActive ? '#10B981' : '#EF4444' }
              ]} />
              <Text style={styles.statusText}>{category.statusText}</Text>
            </View>
          </View>
        </View>

        {/* Información básica */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información Básica</Text>
          
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Nombre</Text>
              <Text style={styles.infoValue}>{category.name}</Text>
            </View>
            
            {category.description && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Descripción</Text>
                <Text style={styles.infoValue}>{category.description}</Text>
              </View>
            )}
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Categoría Padre</Text>
              <Text style={styles.infoValue}>{category.parentName}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Orden</Text>
              <Text style={styles.infoValue}>{category.order}</Text>
            </View>
          </View>
        </View>

        {/* Configuración */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Configuración</Text>
          
          <View style={styles.configCard}>
            <View style={styles.configRow}>
              <View style={styles.configInfo}>
                <Ionicons name="eye" size={20} color="#1F64BF" />
                <Text style={styles.configLabel}>Estado</Text>
                <Text style={styles.configDescription}>
                  {category.isActive ? 'La categoría está activa y visible' : 'La categoría está inactiva y oculta'}
                </Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  { backgroundColor: category.isActive ? '#10B981' : '#EF4444' }
                ]}
                onPress={handleToggleStatus}
              >
                <Ionicons 
                  name={category.isActive ? "eye" : "eye-off"} 
                  size={16} 
                  color="white" 
                />
              </TouchableOpacity>
            </View>
            
            <View style={styles.configRow}>
              <View style={styles.configInfo}>
                <Ionicons name="star" size={20} color="#F59E0B" />
                <Text style={styles.configLabel}>Página Principal</Text>
                <Text style={styles.configDescription}>
                  {category.showOnHomepage ? 'Se muestra en la página principal' : 'No se muestra en la página principal'}
                </Text>
              </View>
              <View style={[
                styles.badge,
                { backgroundColor: category.showOnHomepage ? '#F59E0B' : '#6B7280' }
              ]}>
                <Ionicons name="star" size={12} color="white" />
              </View>
            </View>
          </View>
        </View>

        {/* Estadísticas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Estadísticas</Text>
          
          <View style={styles.statsCard}>
            <View style={styles.statItem}>
              <View style={styles.statIcon}>
                <Ionicons name="cube" size={24} color="#1F64BF" />
              </View>
              <View style={styles.statInfo}>
                <Text style={styles.statNumber}>{category.childrenCount || 0}</Text>
                <Text style={styles.statLabel}>Subcategorías</Text>
              </View>
            </View>
            
            <View style={styles.statItem}>
              <View style={styles.statIcon}>
                <Ionicons name="calendar" size={24} color="#1F64BF" />
              </View>
              <View style={styles.statInfo}>
                <Text style={styles.statNumber}>
                  {category.createdAt ? new Date(category.createdAt).toLocaleDateString() : 'N/A'}
                </Text>
                <Text style={styles.statLabel}>Fecha de Creación</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Acciones */}
        <View style={styles.actionsSection}>
          <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
            <Ionicons name="create" size={20} color="white" />
            <Text style={styles.editButtonText}>Editar Categoría</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <Ionicons name="trash" size={20} color="white" />
            <Text style={styles.deleteButtonText}>Eliminar Categoría</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </AuthenticatedWrapper>
  );
};

// ==================== ESTILOS ====================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  
  // Header de navegación
  navigationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    marginRight: 12,
    padding: 4,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#010326',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  
  // Loading y Error
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#EF4444',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F64BF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },

  // Header
  header: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  imageContainer: {
    width: 80,
    height: 80,
    borderRadius: 16,
    overflow: 'hidden',
    marginRight: 16,
  },
  categoryImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F2F2F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  categoryName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#010326',
    marginBottom: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },

  // Secciones
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#010326',
    marginBottom: 12,
    paddingHorizontal: 20,
  },

  // Información
  infoCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: '#010326',
    flex: 2,
    textAlign: 'right',
  },

  // Configuración
  configCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  configRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  configInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  configLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#010326',
    marginLeft: 12,
    flex: 1,
  },
  configDescription: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    marginLeft: 32,
  },
  toggleButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Estadísticas
  statsCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F2F2F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  statInfo: {
    flex: 1,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#010326',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
  },

  // Acciones
  actionsSection: {
    padding: 20,
    paddingBottom: 40,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1F64BF',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    marginBottom: 12,
  },
  editButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EF4444',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default CategoryDetailScreen;
