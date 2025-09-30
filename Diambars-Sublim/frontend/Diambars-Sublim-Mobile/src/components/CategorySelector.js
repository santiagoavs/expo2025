// src/components/CategorySelector.js - Selector de categorías para formularios
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  TextInput,
  ActivityIndicator,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import useCategories from '../hooks/useCategories';

const CategorySelector = ({ 
  selectedCategory, 
  onSelectCategory, 
  placeholder = "Seleccionar categoría",
  style = {},
  disabled = false 
}) => {
  // ==================== HOOKS ====================
  const { categories, loading, fetchCategories } = useCategories();

  // ==================== ESTADOS ====================
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCategories, setFilteredCategories] = useState([]);

  // ==================== EFECTOS ====================
  useEffect(() => {
    if (modalVisible) {
      fetchCategories();
    }
  }, [modalVisible, fetchCategories]);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = categories.filter(category =>
        category.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredCategories(filtered);
    } else {
      setFilteredCategories(categories);
    }
  }, [categories, searchQuery]);

  // ==================== FUNCIONES ====================
  const handleSelectCategory = (category) => {
    onSelectCategory(category);
    setModalVisible(false);
    setSearchQuery('');
  };

  const handleClearSelection = () => {
    onSelectCategory(null);
  };

  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity
      style={styles.categoryItem}
      onPress={() => handleSelectCategory(item)}
    >
      <View style={styles.categoryInfo}>
        <View style={styles.categoryIcon}>
          {item.image ? (
            <Image source={{ uri: item.image }} style={styles.categoryImage} />
          ) : (
            <Ionicons name="folder" size={20} color="#1F64BF" />
          )}
        </View>
        
        <View style={styles.categoryDetails}>
          <Text style={styles.categoryName}>{item.name}</Text>
          {item.description && (
            <Text style={styles.categoryDescription} numberOfLines={1}>
              {item.description}
            </Text>
          )}
        </View>
      </View>
      
      <View style={styles.categoryMeta}>
        <View style={[
          styles.statusDot,
          { backgroundColor: item.isActive ? '#10B981' : '#EF4444' }
        ]} />
        {item.showOnHomepage && (
          <Ionicons name="star" size={16} color="#F59E0B" />
        )}
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="search" size={48} color="#6B7280" />
      <Text style={styles.emptyTitle}>No se encontraron categorías</Text>
      <Text style={styles.emptyDescription}>
        {searchQuery.trim() 
          ? 'Intenta con otros términos de búsqueda'
          : 'No hay categorías disponibles'
        }
      </Text>
    </View>
  );

  // ==================== RENDER ====================
  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        style={[styles.selector, disabled && styles.selectorDisabled]}
        onPress={() => !disabled && setModalVisible(true)}
        disabled={disabled}
      >
        <View style={styles.selectorContent}>
          {selectedCategory ? (
            <View style={styles.selectedCategory}>
              <View style={styles.selectedCategoryInfo}>
                {selectedCategory.image ? (
                  <Image source={{ uri: selectedCategory.image }} style={styles.selectedImage} />
                ) : (
                  <View style={styles.selectedIcon}>
                    <Ionicons name="folder" size={16} color="#1F64BF" />
                  </View>
                )}
                <Text style={styles.selectedText}>{selectedCategory.name}</Text>
              </View>
              
              {!disabled && (
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={handleClearSelection}
                >
                  <Ionicons name="close" size={16} color="#6B7280" />
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <Text style={styles.placeholderText}>{placeholder}</Text>
          )}
        </View>
        
        <Ionicons name="chevron-down" size={20} color="#9CA3AF" />
      </TouchableOpacity>

      {/* Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
            
            <Text style={styles.modalTitle}>Seleccionar Categoría</Text>
            
            <View style={styles.headerSpacer} />
          </View>

          {/* Búsqueda */}
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

          {/* Lista */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#1F64BF" />
              <Text style={styles.loadingText}>Cargando categorías...</Text>
            </View>
          ) : (
            <FlatList
              data={filteredCategories}
              keyExtractor={(item) => item.id}
              renderItem={renderCategoryItem}
              ListEmptyComponent={renderEmptyState}
              contentContainerStyle={styles.listContainer}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </Modal>
    </View>
  );
};

// ==================== ESTILOS ====================
const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  
  // Selector
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
  },
  selectorDisabled: {
    backgroundColor: '#F9FAFB',
    borderColor: '#E5E7EB',
  },
  selectorContent: {
    flex: 1,
  },
  selectedCategory: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectedCategoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  selectedImage: {
    width: 24,
    height: 24,
    borderRadius: 4,
    marginRight: 12,
  },
  selectedIcon: {
    width: 24,
    height: 24,
    borderRadius: 4,
    backgroundColor: '#F2F2F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  selectedText: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
  },
  clearButton: {
    padding: 4,
    marginLeft: 8,
  },
  placeholderText: {
    fontSize: 16,
    color: '#9CA3AF',
  },

  // Modal
  modalContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  closeButton: {
    padding: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  headerSpacer: {
    width: 40,
  },

  // Búsqueda
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginVertical: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#1F2937',
  },

  // Lista
  listContainer: {
    padding: 20,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    marginRight: 12,
  },
  categoryImage: {
    width: 32,
    height: 32,
    borderRadius: 8,
  },
  categoryDetails: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 2,
  },
  categoryDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  categoryMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },

  // Estados
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
});

export default CategorySelector;
