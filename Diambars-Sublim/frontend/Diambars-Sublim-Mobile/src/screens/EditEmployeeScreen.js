// src/screens/EditEmployeeScreen.js - Pantalla para editar empleados
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import useEmployees from '../hooks/useEmployees';
import AuthenticatedWrapper from '../components/AuthenticatedWrapper';

const EditEmployeeScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { employee: initialEmployee } = route.params || {};
  
  const { updateEmployee, loading } = useEmployees();

  // ==================== ESTADOS ====================
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    dui: '',
    address: '',
    birthday: '',
    hireDate: '',
    role: 'employee'
  });

  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [loadingEmployee, setLoadingEmployee] = useState(false);

  // ==================== EFECTOS ====================
  useEffect(() => {
    if (initialEmployee) {
      loadEmployeeData();
    }
  }, [initialEmployee]);

  // ==================== FUNCIONES ====================
  const loadEmployeeData = () => {
    setLoadingEmployee(true);
    
    try {
      setFormData({
        name: initialEmployee.name || '',
        email: initialEmployee.email || '',
        phoneNumber: initialEmployee.phoneNumber || initialEmployee.phone || '',
        dui: initialEmployee.dui || '',
        address: initialEmployee.address || '',
        birthday: initialEmployee.birthday || '',
        hireDate: initialEmployee.hireDate || '',
        role: initialEmployee.role || 'employee'
      });

      if (initialEmployee.profileImage) {
        setImagePreview(initialEmployee.profileImage);
      }
    } catch (error) {
      console.error('Error loading employee data:', error);
      Alert.alert('Error', 'No se pudieron cargar los datos del empleado.');
    } finally {
      setLoadingEmployee(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpiar error del campo
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const pickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permissionResult.granted === false) {
        Alert.alert('Permisos requeridos', 'Se necesita acceso a la galería para seleccionar imágenes.', [{ text: 'OK' }]);
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
        setProfileImage(selectedImage);
        setImagePreview(selectedImage.uri);
        console.log('✅ Imagen de perfil seleccionada:', selectedImage.uri);
      }
    } catch (error) {
      console.error('❌ Error seleccionando imagen:', error);
      Alert.alert('Error', 'No se pudo seleccionar la imagen. Inténtalo de nuevo.', [{ text: 'OK' }]);
    }
  };

  const removeImage = () => {
    setProfileImage(null);
    setImagePreview(null);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Nombre es requerido';
    if (!formData.email.trim()) newErrors.email = 'Email es requerido';
    if (!formData.phoneNumber.trim()) newErrors.phoneNumber = 'Teléfono es requerido';
    if (!formData.dui.trim()) newErrors.dui = 'DUI es requerido';
    if (!formData.address.trim()) newErrors.address = 'Dirección es requerida';
    if (!formData.birthday.trim()) newErrors.birthday = 'Fecha de nacimiento es requerida';
    if (!formData.hireDate.trim()) newErrors.hireDate = 'Fecha de contratación es requerida';

    // Validar formato email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Formato de email inválido';
    }

    // Validar formato DUI
    const duiRegex = /^[0-9]{8}-[0-9]{1}$/;
    if (formData.dui && !duiRegex.test(formData.dui)) {
      newErrors.dui = 'Formato de DUI inválido (12345678-9)';
    }

    // Validar formato teléfono
    const phoneRegex = /^[0-9]{8,15}$/;
    if (formData.phoneNumber && !phoneRegex.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Teléfono debe contener entre 8 y 15 dígitos';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      Alert.alert('Error de validación', 'Por favor corrige los errores antes de continuar.');
      return;
    }

    try {
      setSaving(true);
      
      const employeeData = {
        ...formData,
        profileImage: profileImage,
        id: initialEmployee.id || initialEmployee._id
      };

      console.log('🔍 [EditEmployeeScreen] Datos del empleado a actualizar:', employeeData);

      await updateEmployee(initialEmployee.id || initialEmployee._id, employeeData);
      
      Alert.alert(
        '¡Empleado actualizado!',
        'Los cambios se han guardado exitosamente.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (error) {
      console.error('❌ [EditEmployeeScreen] Error updating employee:', error);
      const errorMessage = error.message || 'No se pudo actualizar el empleado';
      Alert.alert('Error al actualizar empleado', errorMessage, [{ text: 'OK' }]);
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  // ==================== RENDER ====================
  if (loadingEmployee) {
    return (
      <AuthenticatedWrapper title="Editar Empleado" subtitle="Cargando datos...">
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1F64BF" />
          <Text style={styles.loadingText}>Cargando datos del empleado...</Text>
        </View>
      </AuthenticatedWrapper>
    );
  }

  if (!initialEmployee) {
    return (
      <AuthenticatedWrapper title="Error" subtitle="Empleado no encontrado">
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color="#EF4444" />
          <Text style={styles.errorTitle}>Empleado no encontrado</Text>
          <Text style={styles.errorText}>
            El empleado que intentas editar no existe.
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
    <AuthenticatedWrapper title="Editar Empleado" subtitle={initialEmployee.name}>
      {/* Header con flecha de navegación */}
      <View style={styles.navigationHeader}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleBack}
        >
          <Ionicons name="arrow-back" size={24} color="#1F64BF" />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>Editar Empleado</Text>
          <Text style={styles.headerSubtitle}>{initialEmployee.name}</Text>
        </View>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Imagen de perfil */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Foto de Perfil</Text>
          
          <View style={styles.imageSection}>
            {imagePreview ? (
              <View style={styles.imageContainer}>
                <Image source={{ uri: imagePreview }} style={styles.profileImage} />
                <TouchableOpacity style={styles.removeImageButton} onPress={removeImage}>
                  <Ionicons name="close" size={16} color="white" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.imagePlaceholder} onPress={pickImage}>
                <Ionicons name="camera" size={32} color="#1F64BF" />
                <Text style={styles.imagePlaceholderText}>Cambiar foto</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Información Personal */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información Personal</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nombre completo *</Text>
            <TextInput
              style={[styles.input, errors.name && styles.inputError]}
              value={formData.name}
              onChangeText={(value) => handleInputChange('name', value)}
              placeholder="Ingresa el nombre completo"
              placeholderTextColor="#9CA3AF"
            />
            {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email *</Text>
            <TextInput
              style={[styles.input, errors.email && styles.inputError]}
              value={formData.email}
              onChangeText={(value) => handleInputChange('email', value)}
              placeholder="correo@ejemplo.com"
              placeholderTextColor="#9CA3AF"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Teléfono *</Text>
            <TextInput
              style={[styles.input, errors.phoneNumber && styles.inputError]}
              value={formData.phoneNumber}
              onChangeText={(value) => handleInputChange('phoneNumber', value)}
              placeholder="12345678"
              placeholderTextColor="#9CA3AF"
              keyboardType="phone-pad"
            />
            {errors.phoneNumber && <Text style={styles.errorText}>{errors.phoneNumber}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>DUI *</Text>
            <TextInput
              style={[styles.input, errors.dui && styles.inputError]}
              value={formData.dui}
              onChangeText={(value) => handleInputChange('dui', value)}
              placeholder="12345678-9"
              placeholderTextColor="#9CA3AF"
            />
            {errors.dui && <Text style={styles.errorText}>{errors.dui}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Dirección *</Text>
            <TextInput
              style={[styles.input, errors.address && styles.inputError]}
              value={formData.address}
              onChangeText={(value) => handleInputChange('address', value)}
              placeholder="Dirección completa"
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={2}
            />
            {errors.address && <Text style={styles.errorText}>{errors.address}</Text>}
          </View>
        </View>

        {/* Información Laboral */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información Laboral</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Cargo *</Text>
            <View style={styles.roleContainer}>
              {['employee', 'manager', 'delivery', 'production'].map((role) => (
                <TouchableOpacity
                  key={role}
                  style={[
                    styles.roleButton,
                    formData.role === role && styles.roleButtonActive
                  ]}
                  onPress={() => handleInputChange('role', role)}
                >
                  <Text style={[
                    styles.roleButtonText,
                    formData.role === role && styles.roleButtonTextActive
                  ]}>
                    {role === 'employee' ? 'Empleado' :
                     role === 'manager' ? 'Gerente' :
                     role === 'delivery' ? 'Repartidor' : 'Producción'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Fecha de Nacimiento *</Text>
            <TextInput
              style={[styles.input, errors.birthday && styles.inputError]}
              value={formData.birthday}
              onChangeText={(value) => handleInputChange('birthday', value)}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#9CA3AF"
            />
            {errors.birthday && <Text style={styles.errorText}>{errors.birthday}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Fecha de Contratación *</Text>
            <TextInput
              style={[styles.input, errors.hireDate && styles.inputError]}
              value={formData.hireDate}
              onChangeText={(value) => handleInputChange('hireDate', value)}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#9CA3AF"
            />
            {errors.hireDate && <Text style={styles.errorText}>{errors.hireDate}</Text>}
          </View>
        </View>

        {/* Botones */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.cancelButton} 
            onPress={handleBack}
          >
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.saveButton, saving && styles.disabledButton]} 
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <>
                <Ionicons name="checkmark" size={20} color="white" />
                <Text style={styles.saveButtonText}>Guardar Cambios</Text>
              </>
            )}
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
    padding: 32,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 12,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
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
    backgroundColor: '#1F64BF',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },

  // Secciones
  section: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#010326',
    marginBottom: 16,
  },

  // Imagen
  imageSection: {
    alignItems: 'center',
  },
  imageContainer: {
    position: 'relative',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  removeImageButton: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#EF4444',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#1F64BF',
    borderStyle: 'dashed',
  },
  imagePlaceholderText: {
    fontSize: 12,
    color: '#1F64BF',
    marginTop: 4,
  },

  // Formulario
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#010326',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#010326',
    backgroundColor: '#F9FAFB',
  },
  inputError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
  },

  // Roles
  roleContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  roleButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  roleButtonActive: {
    backgroundColor: '#1F64BF',
    borderColor: '#1F64BF',
  },
  roleButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  roleButtonTextActive: {
    color: 'white',
  },

  // Botones
  buttonContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  saveButton: {
    flex: 2,
    backgroundColor: '#1F64BF',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    backgroundColor: '#9CA3AF',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default EditEmployeeScreen;
