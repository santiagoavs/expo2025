// src/screens/CategoriesScreen.js - Pantalla principal de gestión de categorías con tres vistas
import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  TextInput,
  ScrollView,
  Dimensions,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import useCategories from '../hooks/useCategories';
import AuthenticatedWrapper from '../components/AuthenticatedWrapper';
import { showDeleteConfirm, showStatusChange } from '../utils/SweetAlert';

const { width } = Dimensions.get('window');

const CategoriesScreen = ({ navigation }) => {
  // ==================== HOOKS ====================
  const {
    categories,
    categoryTree,
    hierarchicalCategories,
    loading,
    error,
    pagination,
    filters,
    sortBy,
    sortOrder,
    viewMode,
    hasCategories,
    hasTree,
    hasHierarchical,
    isEmpty,
    canRetry,
    fetchCategories,
    fetchCategoryTree,
    fetchHierarchicalCategories,
    deleteCategory,
    toggleCategoryStatus,
    updateFilters,
    updateSorting,
    updateViewMode,
    clearError
  } = useCategories();

  // ==================== ESTADOS LOCALES ====================
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedItems, setExpandedItems] = useState(new Set());

  // ==================== EFECTOS ====================
  useEffect(() => {
    // Cargar datos según el modo de vista
    loadData();
  }, [viewMode]);

  useEffect(() => {
    // Aplicar filtros cuando cambien
    if (searchQuery.trim()) {
      const timeoutId = setTimeout(() => {
        updateFilters({ search: searchQuery.trim() });
      }, 500);
      return () => clearTimeout(timeoutId);
    } else {
      updateFilters({ search: '' });
    }
  }, [searchQuery, updateFilters]);

  // ==================== FUNCIONES ====================
  const loadData = () => {
    if (viewMode === 'tree') {
      fetchCategoryTree();
    } else if (viewMode === 'list') {
      fetchHierarchicalCategories();
    } else {
      fetchCategories();
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadData();
    } finally {
      setRefreshing(false);
    }
  };

  const handleRetry = () => {
    clearError();
    loadData();
  };

  const handleDelete = (category) => {
    const categoryId = category.id || category._id;
    console.log('🗑️ [CategoriesScreen] Eliminando categoría:', { category, categoryId });
    
    if (!categoryId) {
      console.error('❌ [CategoriesScreen] ID de categoría no encontrado:', category);
      return;
    }
    
    showDeleteConfirm(
      category.name,
      () => deleteCategory(categoryId),
      null
    );
  };

  const handleToggleStatus = (category) => {
    const categoryId = category.id || category._id;
    console.log('🔄 [CategoriesScreen] Cambiando estado de categoría:', { category, categoryId });
    
    if (!categoryId) {
      console.error('❌ [CategoriesScreen] ID de categoría no encontrado:', category);
      return;
    }
    
    showStatusChange(
      category.name,
      !category.isActive,
      () => toggleCategoryStatus(categoryId),
      null
    );
  };

  const handleToggleExpand = (categoryId) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const handleCreateCategory = () => {
    navigation.navigate('CreateCategory');
  };

  const handleEditCategory = (category) => {
    navigation.navigate('EditCategory', { category });
  };

  const handleViewCategory = (category) => {
    navigation.navigate('CategoryDetail', { category });
  };

  // ==================== RENDER DE VISTAS ====================
  const renderGridView = () => {
    const data = viewMode === 'tree' ? categoryTree : 
                 viewMode === 'list' ? hierarchicalCategories : categories;

    return (
      <FlatList
        data={data}
        keyExtractor={(item) => item.id || item._id}
        numColumns={2}
        columnWrapperStyle={styles.gridRow}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.gridCard}
            onPress={() => handleViewCategory(item)}
          >
            <View style={styles.cardImageContainer}>
              {item.image ? (
                <Image source={{ uri: item.image }} style={styles.cardImage} />
              ) : (
                <View style={styles.cardImagePlaceholder}>
                  <Ionicons name="folder" size={32} color="#1F64BF" />
                </View>
              )}
            </View>
            
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle} numberOfLines={2}>
                {item.name}
              </Text>
              {item.description && (
                <Text style={styles.cardDescription} numberOfLines={2}>
                  {item.description}
                </Text>
              )}
              
              <View style={styles.cardMeta}>
                <View style={styles.cardStatus}>
                  <View style={[
                    styles.statusDot,
                    { backgroundColor: item.isActive ? '#10B981' : '#EF4444' }
                  ]} />
                  <Text style={styles.statusText}>
                    {item.statusText}
                  </Text>
                </View>
                
                {item.showOnHomepage && (
                  <View style={styles.homepageBadge}>
                    <Ionicons name="star" size={12} color="#F59E0B" />
                  </View>
                )}
              </View>
            </View>
            
            <View style={styles.cardActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleEditCategory(item)}
              >
                <Ionicons name="create" size={16} color="#1F64BF" />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleToggleStatus(item)}
              >
                <Ionicons 
                  name={item.isActive ? "eye-off" : "eye"} 
                  size={16} 
                  color={item.isActive ? "#EF4444" : "#10B981"} 
                />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleDelete(item)}
              >
                <Ionicons name="trash" size={16} color="#EF4444" />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#1F64BF']}
            tintColor="#1F64BF"
          />
        }
        contentContainerStyle={styles.gridContainer}
      />
    );
  };

  const renderTreeView = () => {
  const renderCategory = (category, depth = 0) => {
    const categoryId = category.id || category._id;
    const isExpanded = expandedItems.has(categoryId);
    const hasChildren = category.children && category.children.length > 0;

    return (
      <View key={categoryId} style={styles.treeItem}>
        <View style={[styles.treeNode, { paddingLeft: depth * 24 }]}>
          <TouchableOpacity
            style={styles.treeToggle}
            onPress={() => hasChildren && handleToggleExpand(categoryId)}
          >
              {hasChildren ? (
                <Ionicons 
                  name={isExpanded ? "chevron-down" : "chevron-forward"} 
                  size={16} 
                  color="#1F64BF" 
                />
              ) : (
                <View style={styles.treeLeaf} />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.treeContent}
              onPress={() => handleViewCategory(category)}
            >
              <View style={styles.treeInfo}>
                <View style={styles.treeIcon}>
                  <Ionicons 
                    name={depth === 0 ? "folder-open" : "folder"} 
                    size={20} 
                    color="#1F64BF" 
                  />
                </View>
                
                <View style={styles.treeDetails}>
                  <Text style={styles.treeName}>
                    {category.name}
                    {depth === 0 && (
                      <Text style={styles.treeLevel}> (Principal)</Text>
                    )}
                  </Text>
                  {category.description && (
                    <Text style={styles.treeDescription}>
                      {category.description}
                    </Text>
                  )}
                </View>
              </View>

              <View style={styles.treeImage}>
                {category.image ? (
                  <Image source={{ uri: category.image }} style={styles.treeImageFile} />
                ) : (
                  <View style={styles.treeNoImage}>
                    <Ionicons name="image" size={16} color="#6B7280" />
                  </View>
                )}
              </View>

              <View style={styles.treeMeta}>
                <View style={[
                  styles.treeStatus,
                  { backgroundColor: category.isActive ? '#10B981' : '#EF4444' }
                ]}>
                  <Ionicons 
                    name={category.isActive ? "eye" : "eye-off"} 
                    size={12} 
                    color="white" 
                  />
                </View>
                
                {category.showOnHomepage && (
                  <View style={styles.treeHomepage}>
                    <Ionicons name="star" size={12} color="#F59E0B" />
                  </View>
                )}
              </View>

              <View style={styles.treeActions}>
                <TouchableOpacity
                  style={styles.treeActionButton}
                  onPress={() => handleEditCategory(category)}
                >
                  <Ionicons name="create" size={14} color="#1F64BF" />
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.treeActionButton}
                  onPress={() => handleDelete(category)}
                >
                  <Ionicons name="trash" size={14} color="#EF4444" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </View>

          {hasChildren && isExpanded && (
            <View style={styles.treeChildren}>
              {category.children.map(child => renderCategory(child, depth + 1))}
            </View>
          )}
        </View>
      );
    };

    return (
      <ScrollView
        style={styles.treeContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#1F64BF']}
            tintColor="#1F64BF"
          />
        }
      >
        {categoryTree.length > 0 ? (
          categoryTree.map(category => renderCategory(category))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="git-branch" size={48} color="#6B7280" />
            <Text style={styles.emptyTitle}>No hay categorías</Text>
            <Text style={styles.emptyDescription}>
              Crea tu primera categoría para comenzar
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={handleCreateCategory}
            >
              <Ionicons name="add" size={16} color="white" />
              <Text style={styles.emptyButtonText}>Crear Categoría</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    );
  };

  const renderListView = () => {
    const data = hierarchicalCategories;

    return (
      <View style={styles.listContainer}>
        <View style={styles.listHeader}>
          <Text style={styles.listHeaderCell}>Imagen</Text>
          <Text style={styles.listHeaderCell}>Nombre</Text>
          <Text style={styles.listHeaderCell}>Padre</Text>
          <Text style={styles.listHeaderCell}>Estado</Text>
          <Text style={styles.listHeaderCell}>Homepage</Text>
          <Text style={styles.listHeaderCell}>Orden</Text>
          <Text style={styles.listHeaderCell}>Acciones</Text>
        </View>
        
        <FlatList
          data={data}
          keyExtractor={(item) => item.id || item._id}
          renderItem={({ item }) => (
            <View style={styles.listRow}>
              <View style={styles.listCell}>
                {item.image ? (
                  <Image source={{ uri: item.image }} style={styles.listImage} />
                ) : (
                  <View style={styles.listNoImage}>
                    <Ionicons name="image" size={16} color="#6B7280" />
                  </View>
                )}
              </View>
              
              <View style={styles.listCell}>
                <Text style={styles.listName} numberOfLines={1}>
                  {item.name}
                </Text>
                {item.description && (
                  <Text style={styles.listDescription} numberOfLines={1}>
                    {item.description}
                  </Text>
                )}
              </View>
              
              <View style={styles.listCell}>
                <Text style={styles.listParent} numberOfLines={1}>
                  {item.parentName}
                </Text>
              </View>
              
              <View style={styles.listCell}>
                <View style={[
                  styles.listStatus,
                  { backgroundColor: item.isActive ? '#10B981' : '#EF4444' }
                ]}>
                  <Ionicons 
                    name={item.isActive ? "eye" : "eye-off"} 
                    size={12} 
                    color="white" 
                  />
                  <Text style={styles.listStatusText}>
                    {item.isActive ? 'Activa' : 'Inactiva'}
                  </Text>
                </View>
              </View>
              
              <View style={styles.listCell}>
                <View style={[
                  styles.listHomepage,
                  { backgroundColor: item.showOnHomepage ? '#F59E0B' : '#6B7280' }
                ]}>
                  <Ionicons name="star" size={12} color="white" />
                  <Text style={styles.listHomepageText}>
                    {item.showOnHomepage ? 'Sí' : 'No'}
                  </Text>
                </View>
              </View>
              
              <View style={styles.listCell}>
                <Text style={styles.listOrder}>{item.order}</Text>
              </View>
              
              <View style={styles.listCell}>
                <View style={styles.listActions}>
                  <TouchableOpacity
                    style={styles.listActionButton}
                    onPress={() => handleEditCategory(item)}
                  >
                    <Ionicons name="create" size={14} color="#1F64BF" />
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.listActionButton}
                    onPress={() => handleDelete(item)}
                  >
                    <Ionicons name="trash" size={14} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#1F64BF']}
              tintColor="#1F64BF"
            />
          }
        />
      </View>
    );
  };

  // ==================== RENDER PRINCIPAL ====================
  if (loading && isEmpty) {
    return (
      <AuthenticatedWrapper title="Categorías" subtitle="Gestión de Categorías">
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1F64BF" />
          <Text style={styles.loadingText}>Cargando categorías...</Text>
        </View>
      </AuthenticatedWrapper>
    );
  }

  if (error && canRetry) {
    return (
      <AuthenticatedWrapper title="Categorías" subtitle="Gestión de Categorías">
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color="#EF4444" />
          <Text style={styles.errorTitle}>Error al cargar categorías</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
            <Ionicons name="refresh" size={16} color="#1F64BF" />
            <Text style={styles.retryButtonText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      </AuthenticatedWrapper>
    );
  }

  return (
    <AuthenticatedWrapper title="Categorías" subtitle="Gestión de Categorías">
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Categorías</Text>
          <Text style={styles.headerSubtitle}>
            {viewMode === 'tree' ? 'Vista de Árbol' : 
             viewMode === 'list' ? 'Vista Jerárquica' : 'Vista de Cuadrícula'}
          </Text>
        </View>
        
        <TouchableOpacity style={styles.addButton} onPress={handleCreateCategory}>
          <Ionicons name="add" size={20} color="white" />
        </TouchableOpacity>
      </View>

      {/* Filtros y Búsqueda */}
      <View style={styles.filtersContainer}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#6B7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar categorías..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        
        <View style={styles.viewToggle}>
          <TouchableOpacity
            style={[styles.viewButton, viewMode === 'grid' && styles.viewButtonActive]}
            onPress={() => updateViewMode('grid')}
          >
            <Ionicons name="grid" size={16} color={viewMode === 'grid' ? 'white' : '#1F64BF'} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.viewButton, viewMode === 'tree' && styles.viewButtonActive]}
            onPress={() => updateViewMode('tree')}
          >
            <Ionicons name="git-branch" size={16} color={viewMode === 'tree' ? 'white' : '#1F64BF'} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.viewButton, viewMode === 'list' && styles.viewButtonActive]}
            onPress={() => updateViewMode('list')}
          >
            <Ionicons name="list" size={16} color={viewMode === 'list' ? 'white' : '#1F64BF'} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Contenido */}
      <View style={styles.content}>
        {viewMode === 'grid' && renderGridView()}
        {viewMode === 'tree' && renderTreeView()}
        {viewMode === 'list' && renderListView()}
      </View>
    </AuthenticatedWrapper>
  );
};

// ==================== ESTILOS ====================
const styles = StyleSheet.create({
  // Header
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
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#010326',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  addButton: {
    backgroundColor: '#1F64BF',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Filtros
  filtersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F2',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#010326',
  },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: '#F2F2F2',
    borderRadius: 12,
    padding: 4,
  },
  viewButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginHorizontal: 2,
  },
  viewButtonActive: {
    backgroundColor: '#1F64BF',
  },

  // Contenido
  content: {
    flex: 1,
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
    marginTop: 12,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F64BF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },

  // Vista de Cuadrícula
  gridContainer: {
    padding: 16,
  },
  gridRow: {
    justifyContent: 'space-between',
  },
  gridCard: {
    width: (width - 48) / 2,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardImageContainer: {
    height: 80,
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F2F2F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#010326',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: '#6B7280',
  },
  homepageBadge: {
    backgroundColor: '#F59E0B',
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F2F2F2',
  },

  // Vista de Árbol
  treeContainer: {
    flex: 1,
    padding: 16,
  },
  treeItem: {
    marginBottom: 8,
    minHeight: 60, // Altura mínima fija
  },
  treeNode: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    minHeight: 60, // Altura mínima fija
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  treeToggle: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  treeLeaf: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#6B7280',
  },
  treeContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 36, // Altura mínima para el contenido
  },
  treeInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  treeIcon: {
    marginRight: 12,
  },
  treeDetails: {
    flex: 1,
  },
  treeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#010326',
  },
  treeLevel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '400',
  },
  treeDescription: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  treeImage: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginRight: 12,
    overflow: 'hidden',
    flexShrink: 0, // Evita que se comprima
  },
  treeImageFile: {
    width: '100%',
    height: '100%',
  },
  treeNoImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F2F2F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  treeMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    flexShrink: 0, // Evita que se comprima
  },
  treeStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 6,
  },
  treeHomepage: {
    backgroundColor: '#F59E0B',
    borderRadius: 8,
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  treeActions: {
    flexDirection: 'row',
    flexShrink: 0, // Evita que se comprima
  },
  treeActionButton: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: '#F2F2F2',
    marginLeft: 4,
  },
  treeChildren: {
    marginLeft: 24,
  },

  // Vista de Lista
  listContainer: {
    flex: 1,
  },
  listHeader: {
    flexDirection: 'row',
    backgroundColor: '#F2F2F2',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  listHeaderCell: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: '#010326',
    textAlign: 'center',
  },
  listRow: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  listCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listImage: {
    width: 24,
    height: 24,
    borderRadius: 4,
  },
  listNoImage: {
    width: 24,
    height: 24,
    backgroundColor: '#F2F2F2',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#010326',
  },
  listDescription: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  listParent: {
    fontSize: 12,
    color: '#6B7280',
  },
  listStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  listStatusText: {
    fontSize: 10,
    color: 'white',
    marginLeft: 4,
  },
  listHomepage: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  listHomepageText: {
    fontSize: 10,
    color: 'white',
    marginLeft: 4,
  },
  listOrder: {
    fontSize: 12,
    color: '#6B7280',
  },
  listActions: {
    flexDirection: 'row',
  },
  listActionButton: {
    padding: 4,
    borderRadius: 4,
    backgroundColor: '#F2F2F2',
    marginHorizontal: 2,
  },

  // Estado vacío
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#010326',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F64BF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default CategoriesScreen;
