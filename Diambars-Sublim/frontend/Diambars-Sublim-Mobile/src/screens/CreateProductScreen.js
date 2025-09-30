// src/screens/CreateProductScreen.js - Pantalla de creación de productos completa
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
  Platform,
  Image,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import useProducts from '../hooks/useProducts';
import AuthenticatedWrapper from '../components/AuthenticatedWrapper';
import CategorySelector from '../components/CategorySelector';

const { width } = Dimensions.get('window');

const CreateProductScreen = ({ navigation }) => {
  // ==================== HOOKS ====================
  const {
    createProduct,
    loading
  } = useProducts();

  // ==================== ESTADOS ====================
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');

  // Estados del formulario (igual que el modal desktop)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    basePrice: '',
    productionTime: '3',
    categoryId: '',
    isActive: true,
    featured: false,
    searchTags: []
  });

  // Estados de imágenes
  const [mainImage, setMainImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [additionalImages, setAdditionalImages] = useState([]);
  const [additionalPreviews, setAdditionalPreviews] = useState([]);

  // Estados de áreas de personalización
  const [customizationAreas, setCustomizationAreas] = useState([]);

  // Estados de opciones del producto
  const [productOptions, setProductOptions] = useState([]);
  const [tagInput, setTagInput] = useState('');

  // Estados de errores
  const [errors, setErrors] = useState({});
  
  // Estado para categoría seleccionada
  const [selectedCategory, setSelectedCategory] = useState(null);

  // ==================== EFECTOS ====================
  useEffect(() => {
    // Inicializar con área por defecto
    setCustomizationAreas(getDefaultAreas());
  }, []);

  // ==================== FUNCIONES ====================
  const getDefaultAreas = () => [
    {
      name: 'Área Principal',
      displayName: 'Área Principal',
      position: { x: 50, y: 50, width: 200, height: 200, rotationDegree: 0 },
      accepts: { text: true, image: true },
      maxElements: 5,
      konvaConfig: {
        strokeColor: '#1F64BF',
        strokeWidth: 2,
        fillOpacity: 0.1,
        cornerRadius: 0,
        dash: [5, 5]
      }
    }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  // ==================== MANEJADORES DE IMÁGENES ====================
  const pickMainImage = async () => {
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
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const image = result.assets[0];
        setMainImage(image);
        setImagePreview(image.uri);
        console.log('✅ Imagen principal seleccionada:', image.uri);
      }
    } catch (error) {
      console.error('❌ Error seleccionando imagen principal:', error);
      Alert.alert(
        'Error',
        'No se pudo seleccionar la imagen. Inténtalo de nuevo.',
        [{ text: 'OK' }]
      );
    }
  };

  const pickAdditionalImages = async () => {
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
        allowsMultipleSelection: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const newImages = result.assets.slice(0, 5); // Máximo 5 imágenes
        setAdditionalImages(newImages);
        setAdditionalPreviews(newImages.map(img => img.uri));
        console.log('✅ Imágenes adicionales seleccionadas:', newImages.length);
      }
    } catch (error) {
      console.error('❌ Error seleccionando imágenes adicionales:', error);
      Alert.alert(
        'Error',
        'No se pudieron seleccionar las imágenes. Inténtalo de nuevo.',
        [{ text: 'OK' }]
      );
    }
  };

  const removeMainImage = () => {
    setMainImage(null);
    setImagePreview(null);
  };

  const removeAdditionalImage = (index) => {
    const newImages = additionalImages.filter((_, i) => i !== index);
    setAdditionalImages(newImages);
    setAdditionalPreviews(prev => prev.filter((_, i) => i !== index));
  };

  // ==================== MANEJADORES DE ÁREAS ====================
  const handleAreaChange = (index, field, value) => {
    setCustomizationAreas(prev => prev.map((area, i) => 
      i === index ? { ...area, [field]: value } : area
    ));
  };

  const addCustomizationArea = () => {
    setCustomizationAreas(prev => [
      ...prev,
      {
        name: `Área ${prev.length + 1}`,
        displayName: `Área ${prev.length + 1}`,
        position: { x: 50, y: 50, width: 150, height: 150, rotationDegree: 0 },
        accepts: { text: true, image: true },
        maxElements: 5,
        konvaConfig: {
          strokeColor: '#1F64BF',
          strokeWidth: 2,
          fillOpacity: 0.1,
          cornerRadius: 0,
          dash: [5, 5]
        }
      }
    ]);
  };

  const removeCustomizationArea = (index) => {
    Alert.alert(
      'Eliminar área',
      '¿Estás seguro de que quieres eliminar esta área?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            setCustomizationAreas(prev => prev.filter((_, i) => i !== index));
          }
        }
      ]
    );
  };

  // ==================== MANEJADORES DE OPCIONES ====================
  const addProductOption = () => {
    setProductOptions(prev => [
      ...prev,
      {
        name: 'Nueva Opción',
        label: 'Nueva Opción',
        type: 'color',
        required: false,
        values: [{ label: 'Opción 1', value: 'option1', additionalPrice: 0, inStock: true }],
        metadata: {
          displayType: 'dropdown'
        }
      }
    ]);
  };

  const removeProductOption = (index) => {
    Alert.alert(
      'Eliminar opción',
      '¿Estás seguro de que quieres eliminar esta opción?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            setProductOptions(prev => prev.filter((_, i) => i !== index));
          }
        }
      ]
    );
  };

  const handleOptionChange = (optionIndex, field, value) => {
    setProductOptions(prev => prev.map((option, i) => {
      if (i === optionIndex) {
        if (field.includes('.')) {
          const [parentField, childField] = field.split('.');
          return {
            ...option,
            [parentField]: {
              ...option[parentField],
              [childField]: value
            }
          };
        } else {
          return { ...option, [field]: value };
        }
      }
      return option;
    }));
  };

  // ==================== MANEJADORES DE TAGS ====================
  const addTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !formData.searchTags.includes(tag) && formData.searchTags.length < 10) {
      setFormData(prev => ({
        ...prev,
        searchTags: [...prev.searchTags, tag]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      searchTags: prev.searchTags.filter(tag => tag !== tagToRemove)
    }));
  };

  // ==================== VALIDACIÓN Y ENVÍO ====================
  const validateForm = () => {
    const newErrors = {};
    
    console.log('🔍 [CreateProductScreen] Validando formulario...');
    console.log('🔍 [CreateProductScreen] formData:', formData);
    console.log('🔍 [CreateProductScreen] selectedCategory:', selectedCategory);
    console.log('🔍 [CreateProductScreen] imagePreview:', imagePreview);
    console.log('🔍 [CreateProductScreen] customizationAreas:', customizationAreas);
    
    if (!formData.name || !formData.name.trim()) {
      newErrors.name = 'Nombre requerido';
    }
    
    if (!formData.basePrice || isNaN(formData.basePrice) || parseFloat(formData.basePrice) <= 0) {
      newErrors.basePrice = 'Precio inválido';
    }
    
    if (!selectedCategory || (!selectedCategory.id && !selectedCategory._id)) {
      newErrors.categoryId = 'Selecciona categoría';
    }
    
    if (!imagePreview) {
      newErrors.mainImage = 'Imagen principal requerida';
    }
    
    if (customizationAreas.length === 0) {
      newErrors.areas = 'Debe tener al menos un área';
    }
    
    console.log('🔍 [CreateProductScreen] Errores encontrados:', newErrors);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      Alert.alert('Error', 'Completa los campos requeridos');
      return;
    }

    try {
      setSaving(true);

      // Preparar datos para envío (sin objetos complejos)
      const productData = {
        ...formData,
        basePrice: parseFloat(formData.basePrice),
        productionTime: parseInt(formData.productionTime),
        categoryId: selectedCategory?.id || selectedCategory?._id,
        // Incluir imágenes para validación
        mainImage: mainImage,
        additionalImages: additionalImages,
        // Simplificar customizationAreas para envío
        customizationAreas: customizationAreas.map(area => ({
          name: area.name,
          displayName: area.displayName,
          position: area.position,
          accepts: area.accepts,
          maxElements: area.maxElements,
          konvaConfig: area.konvaConfig
        })),
        // Simplificar options para envío
        options: productOptions.map(option => ({
          name: option.name,
          label: option.label,
          type: option.type,
          required: option.required,
          values: option.values,
          metadata: option.metadata
        })),
        searchTags: formData.searchTags
      };

      console.log('🔍 [CreateProductScreen] formData original:', formData);
      console.log('🔍 [CreateProductScreen] basePrice del formData:', formData.basePrice);
      console.log('🔍 [CreateProductScreen] name del formData:', formData.name);
      console.log('🔍 [CreateProductScreen] Datos del producto a enviar:', productData);
      console.log('🔍 [CreateProductScreen] Categoría seleccionada:', selectedCategory);
      console.log('🔍 [CreateProductScreen] Categoría ID (id):', selectedCategory?.id);
      console.log('🔍 [CreateProductScreen] Categoría ID (_id):', selectedCategory?._id);
      console.log('🔍 [CreateProductScreen] categoryId final:', selectedCategory?.id || selectedCategory?._id);
      console.log('🔍 [CreateProductScreen] Imagen principal:', mainImage);
      console.log('🔍 [CreateProductScreen] Áreas de personalización:', customizationAreas);

      // Crear FormData para envío con archivos
      const formDataToSend = new FormData();
      
      // Agregar campos de texto
      Object.keys(productData).forEach(key => {
        if (key !== 'mainImage' && key !== 'additionalImages') {
          if (Array.isArray(productData[key])) {
            formDataToSend.append(key, JSON.stringify(productData[key]));
          } else if (typeof productData[key] === 'object') {
            formDataToSend.append(key, JSON.stringify(productData[key]));
          } else {
            formDataToSend.append(key, productData[key]);
          }
        }
      });
      
      // Agregar imagen principal
      if (mainImage) {
        formDataToSend.append('mainImage', {
          uri: mainImage.uri,
          type: mainImage.mimeType || 'image/jpeg',
          name: mainImage.fileName || 'main-image.jpg'
        });
      }
      
      // Agregar imágenes adicionales
      if (additionalImages && additionalImages.length > 0) {
        additionalImages.forEach((image, index) => {
          formDataToSend.append('additionalImages', {
            uri: image.uri,
            type: image.mimeType || 'image/jpeg',
            name: image.fileName || `additional-${index}.jpg`
          });
        });
      }

      console.log('📤 [CreateProductScreen] FormData preparado para envío');
      console.log('📤 [CreateProductScreen] Datos del producto antes de enviar:', productData);
      
      // Enviar los datos del producto (no FormData) al hook
      await createProduct(productData);
      
      Alert.alert(
        '¡Éxito!',
        'El producto ha sido creado exitosamente',
        [
          {
            text: 'Continuar',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (error) {
      console.error('❌ [CreateProductScreen] Error creating product:', error);
      
      // Mostrar error específico si está disponible
      const errorMessage = error.message || 'No se pudo crear el producto';
      Alert.alert(
        'Error al crear producto', 
        errorMessage,
        [{ text: 'OK' }]
      );
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

  // ==================== RENDER TABS ====================
  const renderTabButton = (tabKey, title, icon) => (
    <TouchableOpacity
      style={[styles.tabButton, activeTab === tabKey && styles.tabButtonActive]}
      onPress={() => setActiveTab(tabKey)}
    >
      <Ionicons 
        name={icon} 
        size={16} 
        color={activeTab === tabKey ? '#1F64BF' : '#6B7280'} 
      />
      <Text style={[
        styles.tabButtonText,
        activeTab === tabKey && styles.tabButtonTextActive
      ]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  // ==================== RENDER CONTENT ====================
  const renderBasicInfo = () => (
    <View style={styles.tabContent}>
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Nombre del Producto *</Text>
        <TextInput
          style={[styles.textInput, errors.name && styles.inputError]}
          value={formData.name}
          onChangeText={(value) => handleInputChange('name', value)}
          placeholder="Ingresa el nombre del producto"
          placeholderTextColor="#9CA3AF"
        />
        {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
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
            style={[styles.textInput, errors.basePrice && styles.inputError]}
            value={formData.basePrice}
            onChangeText={(value) => handleInputChange('basePrice', value)}
            placeholder="0.00"
            placeholderTextColor="#9CA3AF"
            keyboardType="numeric"
          />
          {errors.basePrice && <Text style={styles.errorText}>{errors.basePrice}</Text>}
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

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Categoría *</Text>
        <CategorySelector
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          placeholder="Seleccionar categoría"
          style={errors.categoryId && styles.inputError}
        />
        {errors.categoryId && <Text style={styles.errorText}>{errors.categoryId}</Text>}
      </View>

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
  );

  const renderImages = () => (
    <View style={styles.tabContent}>
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Imagen Principal *</Text>
        {imagePreview ? (
          <View style={styles.imagePreviewContainer}>
            <Image source={{ uri: imagePreview }} style={styles.imagePreview} />
            <TouchableOpacity style={styles.removeImageButton} onPress={removeMainImage}>
              <Ionicons name="close" size={16} color="white" />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.imagePickerButton} onPress={pickMainImage}>
            <Ionicons name="camera" size={32} color="#1F64BF" />
            <Text style={styles.imagePickerText}>Seleccionar Imagen Principal</Text>
          </TouchableOpacity>
        )}
        {errors.mainImage && <Text style={styles.errorText}>{errors.mainImage}</Text>}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Imágenes Adicionales (máximo 5)</Text>
        <TouchableOpacity style={styles.imagePickerButton} onPress={pickAdditionalImages}>
          <Ionicons name="images" size={32} color="#1F64BF" />
          <Text style={styles.imagePickerText}>Agregar Imágenes</Text>
        </TouchableOpacity>
        
        {additionalPreviews.length > 0 && (
          <View style={styles.additionalImagesContainer}>
            {additionalPreviews.map((uri, index) => (
              <View key={index} style={styles.additionalImageItem}>
                <Image source={{ uri }} style={styles.additionalImagePreview} />
                <TouchableOpacity 
                  style={styles.removeAdditionalImageButton}
                  onPress={() => removeAdditionalImage(index)}
                >
                  <Ionicons name="close" size={12} color="white" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );

  const renderAreas = () => (
    <View style={styles.tabContent}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Áreas de Personalización</Text>
        <TouchableOpacity style={styles.addButton} onPress={addCustomizationArea}>
          <Ionicons name="add" size={16} color="white" />
          <Text style={styles.addButtonText}>Agregar Área</Text>
        </TouchableOpacity>
      </View>

      {customizationAreas.map((area, index) => (
        <View key={index} style={styles.areaCard}>
          <View style={styles.areaHeader}>
            <Text style={styles.areaTitle}>Área {index + 1}</Text>
            <TouchableOpacity 
              style={styles.removeAreaButton}
              onPress={() => removeCustomizationArea(index)}
            >
              <Ionicons name="trash" size={16} color="#EF4444" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Nombre del Área</Text>
            <TextInput
              style={styles.textInput}
              value={area.name}
              onChangeText={(value) => handleAreaChange(index, 'name', value)}
              placeholder="Nombre del área"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Nombre para Mostrar</Text>
            <TextInput
              style={styles.textInput}
              value={area.displayName}
              onChangeText={(value) => handleAreaChange(index, 'displayName', value)}
              placeholder="Nombre para mostrar"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.areaConfigRow}>
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Acepta Texto</Text>
              <Switch
                value={area.accepts.text}
                onValueChange={(value) => handleAreaChange(index, 'accepts', { ...area.accepts, text: value })}
                trackColor={{ false: '#E5E7EB', true: '#1F64BF' }}
                thumbColor={area.accepts.text ? '#FFFFFF' : '#FFFFFF'}
              />
            </View>

            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Acepta Imágenes</Text>
              <Switch
                value={area.accepts.image}
                onValueChange={(value) => handleAreaChange(index, 'accepts', { ...area.accepts, image: value })}
                trackColor={{ false: '#E5E7EB', true: '#1F64BF' }}
                thumbColor={area.accepts.image ? '#FFFFFF' : '#FFFFFF'}
              />
            </View>
          </View>
        </View>
      ))}

      {errors.areas && <Text style={styles.errorText}>{errors.areas}</Text>}

      <View style={styles.noteCard}>
        <Ionicons name="information-circle" size={20} color="#1F64BF" />
        <View style={styles.noteContent}>
          <Text style={styles.noteTitle}>Editor Avanzado</Text>
          <Text style={styles.noteText}>
            Para configurar posiciones exactas, rotaciones y estilos visuales de las áreas, 
            utiliza el panel administrativo web donde está disponible el editor Konva completo.
          </Text>
        </View>
      </View>
    </View>
  );

  const renderOptions = () => (
    <View style={styles.tabContent}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Opciones del Producto</Text>
        <TouchableOpacity style={styles.addButton} onPress={addProductOption}>
          <Ionicons name="add" size={16} color="white" />
          <Text style={styles.addButtonText}>Agregar Opción</Text>
        </TouchableOpacity>
      </View>

      {productOptions.map((option, index) => (
        <View key={index} style={styles.optionCard}>
          <View style={styles.optionHeader}>
            <Text style={styles.optionTitle}>Opción {index + 1}</Text>
            <TouchableOpacity 
              style={styles.removeOptionButton}
              onPress={() => removeProductOption(index)}
            >
              <Ionicons name="trash" size={16} color="#EF4444" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Nombre de la Opción</Text>
            <TextInput
              style={styles.textInput}
              value={option.name}
              onChangeText={(value) => handleOptionChange(index, 'name', value)}
              placeholder="Nombre de la opción"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Etiqueta</Text>
            <TextInput
              style={styles.textInput}
              value={option.label}
              onChangeText={(value) => handleOptionChange(index, 'label', value)}
              placeholder="Etiqueta para mostrar"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Obligatorio</Text>
            <Switch
              value={option.required}
              onValueChange={(value) => handleOptionChange(index, 'required', value)}
              trackColor={{ false: '#E5E7EB', true: '#1F64BF' }}
              thumbColor={option.required ? '#FFFFFF' : '#FFFFFF'}
            />
          </View>
        </View>
      ))}

      <View style={styles.noteCard}>
        <Ionicons name="information-circle" size={20} color="#1F64BF" />
        <View style={styles.noteContent}>
          <Text style={styles.noteTitle}>Configuración Avanzada</Text>
          <Text style={styles.noteText}>
            Para configurar valores específicos, precios adicionales y tipos de opciones avanzadas, 
            utiliza el panel administrativo web.
          </Text>
        </View>
      </View>
    </View>
  );

  const renderTags = () => (
    <View style={styles.tabContent}>
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Tags de Búsqueda</Text>
        <View style={styles.tagInputContainer}>
          <TextInput
            style={styles.tagInput}
            value={tagInput}
            onChangeText={setTagInput}
            placeholder="Agregar tag..."
            placeholderTextColor="#9CA3AF"
            onSubmitEditing={addTag}
          />
          <TouchableOpacity style={styles.addTagButton} onPress={addTag}>
            <Ionicons name="add" size={16} color="white" />
          </TouchableOpacity>
        </View>
        
        {formData.searchTags.length > 0 && (
          <View style={styles.tagsContainer}>
            {formData.searchTags.map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
                <TouchableOpacity onPress={() => removeTag(tag)}>
                  <Ionicons name="close" size={12} color="#6B7280" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );

  // ==================== RENDER ====================
  return (
    <AuthenticatedWrapper title="Crear Producto" subtitle="Nuevo Producto">
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={handleCancel}
        >
          <Text style={styles.cancelButtonText}>Cancelar</Text>
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Crear Producto</Text>
        
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

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {renderTabButton('basic', 'Información', 'information-circle-outline')}
          {renderTabButton('images', 'Imágenes', 'image-outline')}
          {renderTabButton('areas', 'Áreas', 'square-outline')}
          {renderTabButton('options', 'Opciones', 'options-outline')}
          {renderTabButton('tags', 'Tags', 'pricetag-outline')}
        </ScrollView>
      </View>

      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {activeTab === 'basic' && renderBasicInfo()}
          {activeTab === 'images' && renderImages()}
          {activeTab === 'areas' && renderAreas()}
          {activeTab === 'options' && renderOptions()}
          {activeTab === 'tags' && renderTags()}
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
  tabsContainer: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 8,
  },
  tabButtonActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#1F64BF',
  },
  tabButtonText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  tabButtonTextActive: {
    color: '#1F64BF',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  tabContent: {
    padding: 20,
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
    paddingVertical: 12,
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
  placeholderText: {
    color: '#9CA3AF',
    fontSize: 16,
  },
  imagePickerButton: {
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 32,
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  imagePickerText: {
    marginTop: 8,
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  imagePreviewContainer: {
    position: 'relative',
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 8,
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
  additionalImagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
  },
  additionalImageItem: {
    position: 'relative',
    marginRight: 8,
    marginBottom: 8,
  },
  additionalImagePreview: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  removeAdditionalImageButton: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  addButton: {
    backgroundColor: '#1F64BF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  areaCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  areaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  areaTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  removeAreaButton: {
    padding: 8,
  },
  areaConfigRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  optionCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  removeOptionButton: {
    padding: 8,
  },
  tagInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tagInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
    backgroundColor: 'white',
    marginRight: 8,
  },
  addTagButton: {
    backgroundColor: '#1F64BF',
    borderRadius: 8,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
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
    marginRight: 6,
  },
  noteCard: {
    flexDirection: 'row',
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
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

export default CreateProductScreen;