// src/screens/CreateCategoryScreen.js - Pantalla de creación de categorías
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import useCategories from '../hooks/useCategories';
import AuthenticatedWrapper from '../components/AuthenticatedWrapper';
import { showValidationError } from '../utils/SweetAlert';

const { width } = Dimensions.get('window');

const CreateCategoryScreen = ({ navigation }) => {
  // ==================== HOOKS ====================
  const { createCategory, categories, loading } = useCategories();

  // ==================== ESTADOS ====================
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    parentId: null,
    order: 0,
    isActive: true,
    showOnHomepage: false
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});

  // ==================== FUNCIONES ====================
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const pickImage = async () => {
    try {
      // Solicitar permisos primero
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert(
          'Permisos requeridos',
          'Se necesita acceso a la galería para seleccionar imágenes.',
          [{ text: 'OK' }]
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedImage = result.assets[0];
        setImage(selectedImage);
        setImagePreview(selectedImage.uri);
        console.log('✅ Imagen seleccionada:', selectedImage.uri);
      }
    } catch (error) {
      console.error('❌ Error seleccionando imagen:', error);
      Alert.alert(
        'Error',
        'No se pudo seleccionar la imagen. Inténtalo de nuevo.',
        [{ text: 'OK' }]
      );
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es obligatorio';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'El nombre debe tener al menos 2 caracteres';
    } else if (formData.name.trim().length > 100) {
      newErrors.name = 'El nombre no puede exceder 100 caracteres';
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'La descripción no puede exceder 500 caracteres';
    }

    if (formData.order && (isNaN(formData.order) || formData.order < 0)) {
      newErrors.order = 'El orden debe ser un número mayor o igual a 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      const errorMessages = Object.values(errors).filter(Boolean);
      showValidationError(errorMessages);
      return;
    }

    try {
      setSaving(true);

      const categoryData = {
        ...formData,
        name: formData.name.trim(),
        description: formData.description.trim(),
        order: parseInt(formData.order) || 0,
        image: image
      };

      await createCategory(categoryData);
      
      Alert.alert(
        '¡Éxito!',
        'La categoría ha sido creada exitosamente',
        [
          {
            text: 'Continuar',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (error) {
      console.error('Error creating category:', error);
      Alert.alert('Error', 'No se pudo crear la categoría');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    Alert.alert(
      'Cancelar Creación',
      '¿Estás seguro de que quieres cancelar? Los datos no guardados se perderán.',
      [
        { text: 'Continuar Creando', style: 'cancel' },
        { text: 'Cancelar', style: 'destructive', onPress: () => navigation.goBack() }
      ]
    );
  };

  // ==================== RENDER ====================
  return (
    <AuthenticatedWrapper title="Crear Categoría" subtitle="Nueva Categoría">
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancel}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            
            <Text style={styles.headerTitle}>Crear Categoría</Text>
            
            <TouchableOpacity
              style={[styles.saveButton, saving && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={styles.saveButtonText}>Crear</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Formulario */}
          <View style={styles.form}>
            {/* Imagen */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Imagen de la Categoría</Text>
              
              {imagePreview ? (
                <View style={styles.imagePreviewContainer}>
                  <Image source={{ uri: imagePreview }} style={styles.imagePreview} />
                  <TouchableOpacity style={styles.removeImageButton} onPress={removeImage}>
                    <Ionicons name="close" size={16} color="white" />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity style={styles.imagePickerButton} onPress={pickImage}>
                  <Ionicons name="camera" size={32} color="#1F64BF" />
                  <Text style={styles.imagePickerText}>Seleccionar Imagen</Text>
                  <Text style={styles.imagePickerSubtext}>Opcional - Imagen cuadrada recomendada</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Información Básica */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Información Básica</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Nombre de la Categoría *</Text>
                <TextInput
                  style={[styles.textInput, errors.name && styles.inputError]}
                  value={formData.name}
                  onChangeText={(value) => handleInputChange('name', value)}
                  placeholder="Ingresa el nombre de la categoría"
                  placeholderTextColor="#9CA3AF"
                />
                {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Descripción</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea, errors.description && styles.inputError]}
                  value={formData.description}
                  onChangeText={(value) => handleInputChange('description', value)}
                  placeholder="Describe la categoría..."
                  placeholderTextColor="#9CA3AF"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
                {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Categoría Padre</Text>
                <TouchableOpacity style={styles.selectButton}>
                  <Text style={styles.selectButtonText}>
                    {formData.parentId ? 'Categoría seleccionada' : 'Sin categoría padre'}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color="#9CA3AF" />
                </TouchableOpacity>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Orden de Visualización</Text>
                <TextInput
                  style={[styles.textInput, errors.order && styles.inputError]}
                  value={formData.order.toString()}
                  onChangeText={(value) => handleInputChange('order', value)}
                  placeholder="0"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                />
                {errors.order && <Text style={styles.errorText}>{errors.order}</Text>}
              </View>
            </View>

            {/* Configuración */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Configuración</Text>
              
              <View style={styles.switchRow}>
                <View style={styles.switchInfo}>
                  <Text style={styles.switchLabel}>Categoría Activa</Text>
                  <Text style={styles.switchDescription}>
                    Las categorías inactivas no aparecerán en el catálogo
                  </Text>
                </View>
                <TouchableOpacity
                  style={[
                    styles.switch,
                    { backgroundColor: formData.isActive ? '#1F64BF' : '#E5E7EB' }
                  ]}
                  onPress={() => handleInputChange('isActive', !formData.isActive)}
                >
                  <View style={[
                    styles.switchThumb,
                    { transform: [{ translateX: formData.isActive ? 20 : 0 }] }
                  ]} />
                </TouchableOpacity>
              </View>

              <View style={styles.switchRow}>
                <View style={styles.switchInfo}>
                  <Text style={styles.switchLabel}>Mostrar en Página Principal</Text>
                  <Text style={styles.switchDescription}>
                    Las categorías destacadas aparecen en la página principal
                  </Text>
                </View>
                <TouchableOpacity
                  style={[
                    styles.switch,
                    { backgroundColor: formData.showOnHomepage ? '#F59E0B' : '#E5E7EB' }
                  ]}
                  onPress={() => handleInputChange('showOnHomepage', !formData.showOnHomepage)}
                >
                  <View style={[
                    styles.switchThumb,
                    { transform: [{ translateX: formData.showOnHomepage ? 20 : 0 }] }
                  ]} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Nota informativa */}
            <View style={styles.noteCard}>
              <Ionicons name="information-circle" size={20} color="#1F64BF" />
              <View style={styles.noteContent}>
                <Text style={styles.noteTitle}>Información Importante</Text>
                <Text style={styles.noteText}>
                  Las categorías ayudan a organizar los productos. Puedes crear subcategorías 
                  seleccionando una categoría padre. El orden determina la posición en las listas.
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </AuthenticatedWrapper>
  );
};

// ==================== ESTILOS ====================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollView: {
    flex: 1,
  },
  
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

  // Formulario
  form: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#010326',
    marginBottom: 16,
  },

  // Imagen
  imagePreviewContainer: {
    position: 'relative',
    alignItems: 'center',
  },
  imagePreview: {
    width: 120,
    height: 120,
    borderRadius: 16,
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#EF4444',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePickerButton: {
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderStyle: 'dashed',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  imagePickerText: {
    marginTop: 8,
    fontSize: 16,
    color: '#1F64BF',
    fontWeight: '600',
  },
  imagePickerSubtext: {
    marginTop: 4,
    fontSize: 12,
    color: '#6B7280',
  },

  // Inputs
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
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
    backgroundColor: 'white',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  textArea: {
    height: 100,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
  },
  selectButton: {
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
  selectButtonText: {
    fontSize: 16,
    color: '#1F2937',
  },

  // Switches
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
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
  switch: {
    width: 44,
    height: 24,
    borderRadius: 12,
    padding: 2,
    justifyContent: 'center',
  },
  switchThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },

  // Nota
  noteCard: {
    flexDirection: 'row',
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
  },
  noteContent: {
    flex: 1,
    marginLeft: 12,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F64BF',
    marginBottom: 8,
  },
  noteText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
});

export default CreateCategoryScreen;
