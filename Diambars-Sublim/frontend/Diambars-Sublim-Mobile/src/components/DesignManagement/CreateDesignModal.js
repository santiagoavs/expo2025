import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  StyleSheet,
  Modal
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const CreateDesignModal = ({
  visible,
  onClose,
  onSubmit,
  editMode = false,
  designToEdit = null,
  products = [],
  users = [],
  loading = false
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    productId: '',
    userId: '',
    complexity: 'medium',
    notes: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editMode && designToEdit) {
      setFormData({
        name: designToEdit.name || '',
        description: designToEdit.description || '',
        productId: designToEdit.productId || designToEdit.product?.id || '',
        userId: designToEdit.userId || designToEdit.user?.id || '',
        complexity: designToEdit.complexity || 'medium',
        notes: designToEdit.notes || ''
      });
    } else {
      setFormData({
        name: '',
        description: '',
        productId: '',
        userId: '',
        complexity: 'medium',
        notes: ''
      });
    }
    setErrors({});
  }, [editMode, designToEdit, visible]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre del diseño es requerido';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'El nombre debe tener al menos 3 caracteres';
    }

    if (!formData.productId) {
      newErrors.productId = 'Debe seleccionar un producto';
    }

    if (!formData.userId) {
      newErrors.userId = 'Debe seleccionar un cliente';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      Alert.alert('Error', 'Por favor complete todos los campos requeridos correctamente');
      return;
    }

    const submitData = {
      ...formData,
      name: formData.name.trim(),
      description: formData.description.trim(),
      notes: formData.notes.trim()
    };

    onSubmit(submitData);
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({
        name: '',
        description: '',
        productId: '',
        userId: '',
        complexity: 'medium',
        notes: ''
      });
      setErrors({});
      onClose();
    }
  };

  const updateField = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Icon 
                name={editMode ? "pencil" : "plus"} 
                size={24} 
                color="white" 
              />
              <Text style={styles.headerTitle}>
                {editMode ? 'Editar Diseño' : 'Crear Nuevo Diseño'}
              </Text>
            </View>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={handleClose}
              disabled={loading}
            >
              <Icon name="close" size={20} color="white" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            {/* Nombre del Diseño */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                Nombre del Diseño <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[
                  styles.textInput,
                  errors.name && styles.inputError
                ]}
                value={formData.name}
                onChangeText={(value) => updateField('name', value)}
                placeholder="Ej: Camiseta Personalizada Empresa XYZ"
                placeholderTextColor="#999"
                editable={!loading}
              />
              {errors.name && (
                <Text style={styles.errorText}>{errors.name}</Text>
              )}
            </View>

            {/* Descripción */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Descripción</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={formData.description}
                onChangeText={(value) => updateField('description', value)}
                placeholder="Describe los detalles del diseño..."
                placeholderTextColor="#999"
                multiline
                numberOfLines={3}
                editable={!loading}
              />
            </View>

            {/* Selección de Producto */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                Producto <Text style={styles.required}>*</Text>
              </Text>
              <View style={[
                styles.selectContainer,
                errors.productId && styles.inputError
              ]}>
                <Text style={[
                  styles.selectText,
                  !formData.productId && styles.placeholderText
                ]}>
                  {formData.productId 
                    ? products.find(p => p.id === formData.productId || p._id === formData.productId)?.name || 'Producto seleccionado'
                    : 'Seleccionar producto'
                  }
                </Text>
                <Icon name="chevron-down" size={20} color="#666" />
              </View>
              {errors.productId && (
                <Text style={styles.errorText}>{errors.productId}</Text>
              )}
              
              {/* Lista de productos */}
              <ScrollView style={styles.optionsList} nestedScrollEnabled>
                {products.map(product => (
                  <TouchableOpacity
                    key={product.id || product._id}
                    style={[
                      styles.optionItem,
                      formData.productId === (product.id || product._id) && styles.optionItemSelected
                    ]}
                    onPress={() => updateField('productId', product.id || product._id)}
                    disabled={loading}
                  >
                    <Text style={[
                      styles.optionText,
                      formData.productId === (product.id || product._id) && styles.optionTextSelected
                    ]}>
                      {product.name}
                    </Text>
                    {formData.productId === (product.id || product._id) && (
                      <Icon name="check" size={16} color="#10B981" />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Selección de Cliente */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                Cliente <Text style={styles.required}>*</Text>
              </Text>
              <View style={[
                styles.selectContainer,
                errors.userId && styles.inputError
              ]}>
                <Text style={[
                  styles.selectText,
                  !formData.userId && styles.placeholderText
                ]}>
                  {formData.userId 
                    ? users.find(u => u.id === formData.userId || u._id === formData.userId)?.name || 'Cliente seleccionado'
                    : 'Seleccionar cliente'
                  }
                </Text>
                <Icon name="chevron-down" size={20} color="#666" />
              </View>
              {errors.userId && (
                <Text style={styles.errorText}>{errors.userId}</Text>
              )}
              
              {/* Lista de clientes */}
              <ScrollView style={styles.optionsList} nestedScrollEnabled>
                {users.map(user => (
                  <TouchableOpacity
                    key={user.id || user._id}
                    style={[
                      styles.optionItem,
                      formData.userId === (user.id || user._id) && styles.optionItemSelected
                    ]}
                    onPress={() => updateField('userId', user.id || user._id)}
                    disabled={loading}
                  >
                    <Text style={[
                      styles.optionText,
                      formData.userId === (user.id || user._id) && styles.optionTextSelected
                    ]}>
                      {user.name}
                    </Text>
                    {formData.userId === (user.id || user._id) && (
                      <Icon name="check" size={16} color="#10B981" />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Complejidad */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Complejidad del Diseño</Text>
              <View style={styles.complexityContainer}>
                {[
                  { value: 'low', label: 'Baja', icon: 'trending-down' },
                  { value: 'medium', label: 'Media', icon: 'trending-neutral' },
                  { value: 'high', label: 'Alta', icon: 'trending-up' }
                ].map(option => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.complexityOption,
                      formData.complexity === option.value && styles.complexityOptionSelected
                    ]}
                    onPress={() => updateField('complexity', option.value)}
                    disabled={loading}
                  >
                    <Icon 
                      name={option.icon} 
                      size={16} 
                      color={formData.complexity === option.value ? '#10B981' : '#666'} 
                    />
                    <Text style={[
                      styles.complexityText,
                      formData.complexity === option.value && styles.complexityTextSelected
                    ]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Notas Adicionales */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Notas Adicionales</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={formData.notes}
                onChangeText={(value) => updateField('notes', value)}
                placeholder="Instrucciones especiales, preferencias del cliente, etc..."
                placeholderTextColor="#999"
                multiline
                numberOfLines={4}
                editable={!loading}
              />
            </View>
          </ScrollView>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleClose}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.submitButton,
                loading && styles.buttonDisabled
              ]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Icon 
                  name={editMode ? "content-save" : "send"} 
                  size={16} 
                  color="white" 
                />
              )}
              <Text style={styles.submitButtonText}>
                {loading ? 'Procesando...' : editMode ? 'Guardar Cambios' : 'Crear Diseño'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 500,
    maxHeight: '80%',
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
  },
  header: {
    backgroundColor: '#1F64BF',
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 20,
    maxHeight: 400,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#010326',
    marginBottom: 8,
  },
  required: {
    color: '#EF4444',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
    color: '#010326',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
  },
  selectContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#f9f9f9',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectText: {
    fontSize: 16,
    color: '#010326',
  },
  placeholderText: {
    color: '#999',
  },
  optionsList: {
    maxHeight: 120,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    backgroundColor: 'white',
  },
  optionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionItemSelected: {
    backgroundColor: '#f0f9ff',
  },
  optionText: {
    fontSize: 14,
    color: '#010326',
  },
  optionTextSelected: {
    color: '#1F64BF',
    fontWeight: '600',
  },
  complexityContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  complexityOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f9f9f9',
  },
  complexityOptionSelected: {
    borderColor: '#10B981',
    backgroundColor: '#f0fdf4',
  },
  complexityText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  complexityTextSelected: {
    color: '#10B981',
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#64748b',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  submitButton: {
    flex: 2,
    backgroundColor: '#1F64BF',
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
});

export default CreateDesignModal;