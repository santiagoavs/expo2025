// src/screens/EditUserScreen.js
import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AuthenticatedWrapper from '../components/AuthenticatedWrapper';
import useUsers from '../hooks/useUsers';

const EditUserScreen = ({ navigation, route }) => {
  const { user: initialUser } = route.params;
  const { updateUser } = useUsers();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    role: 'customer',
    active: true
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // ==================== EFECTOS ====================
  useEffect(() => {
    if (initialUser) {
      setFormData({
        name: initialUser.name || '',
        email: initialUser.email || '',
        phoneNumber: initialUser.phoneNumber || initialUser.phone || '',
        role: initialUser.role || 'customer',
        active: initialUser.active !== false
      });
    }
  }, [initialUser]);

  // ==================== MANEJADORES ====================
  const handleInputChange = useCallback((field, value) => {
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
  }, [errors]);

  const validateForm = useCallback(() => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es obligatorio';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'El email es obligatorio';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'El email no tiene un formato válido';
    }
    
    if (formData.phoneNumber && !/^[\d\s\-\+\(\)]+$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'El teléfono no tiene un formato válido';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback(async () => {
    if (!validateForm()) {
      return;
    }
    
    try {
      setLoading(true);
      await updateUser(initialUser.id, formData);
      navigation.goBack();
    } catch (error) {
      console.error('Error updating user:', error);
    } finally {
      setLoading(false);
    }
  }, [formData, validateForm, updateUser, initialUser, navigation]);

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  // ==================== RENDER ====================
  return (
    <AuthenticatedWrapper title="Editar Usuario" subtitle="Modificar Usuario">
      {/* Header con navegación */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color="#1F64BF" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Editar Usuario</Text>
          <Text style={styles.headerSubtitle}>Modificar información del usuario</Text>
        </View>
      </View>

      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Información básica */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Información Básica</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nombre Completo *</Text>
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
              <Text style={styles.inputLabel}>Email *</Text>
              <TextInput
                style={[styles.input, errors.email && styles.inputError]}
                value={formData.email}
                onChangeText={(value) => handleInputChange('email', value)}
                placeholder="usuario@ejemplo.com"
                placeholderTextColor="#9CA3AF"
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Teléfono</Text>
              <TextInput
                style={[styles.input, errors.phoneNumber && styles.inputError]}
                value={formData.phoneNumber}
                onChangeText={(value) => handleInputChange('phoneNumber', value)}
                placeholder="Número de teléfono"
                placeholderTextColor="#9CA3AF"
                keyboardType="phone-pad"
              />
              {errors.phoneNumber && <Text style={styles.errorText}>{errors.phoneNumber}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nueva Contraseña (opcional)</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={[styles.input, errors.password && styles.inputError]}
                  value={formData.password}
                  onChangeText={(value) => handleInputChange('password', value)}
                  placeholder="Deja vacío para mantener la actual"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons 
                    name={showPassword ? 'eye-off' : 'eye'} 
                    size={20} 
                    color="#6B7280" 
                  />
                </TouchableOpacity>
              </View>
              {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
            </View>

            {formData.password && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Confirmar Nueva Contraseña</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={[styles.input, errors.confirmPassword && styles.inputError]}
                    value={formData.confirmPassword}
                    onChangeText={(value) => handleInputChange('confirmPassword', value)}
                    placeholder="Confirma la nueva contraseña"
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry={!showConfirmPassword}
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <Ionicons 
                      name={showConfirmPassword ? 'eye-off' : 'eye'} 
                      size={20} 
                      color="#6B7280" 
                    />
                  </TouchableOpacity>
                </View>
                {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
              </View>
            )}
          </View>

          {/* Configuración del usuario */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Configuración</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Rol del Usuario</Text>
              <View style={styles.roleContainer}>
                <TouchableOpacity
                  style={[styles.roleButton, formData.role === 'customer' && styles.activeRole]}
                  onPress={() => handleInputChange('role', 'customer')}
                >
                  <Ionicons 
                    name="person" 
                    size={20} 
                    color={formData.role === 'customer' ? 'white' : '#6B7280'} 
                  />
                  <Text style={[styles.roleText, formData.role === 'customer' && styles.activeRoleText]}>
                    Cliente
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.roleButton, formData.role === 'premium' && styles.activeRole]}
                  onPress={() => handleInputChange('role', 'premium')}
                >
                  <Ionicons 
                    name="star" 
                    size={20} 
                    color={formData.role === 'premium' ? 'white' : '#6B7280'} 
                  />
                  <Text style={[styles.roleText, formData.role === 'premium' && styles.activeRoleText]}>
                    Premium
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.roleButton, formData.role === 'admin' && styles.activeRole]}
                  onPress={() => handleInputChange('role', 'admin')}
                >
                  <Ionicons 
                    name="shield" 
                    size={20} 
                    color={formData.role === 'admin' ? 'white' : '#6B7280'} 
                  />
                  <Text style={[styles.roleText, formData.role === 'admin' && styles.activeRoleText]}>
                    Administrador
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Estado del Usuario</Text>
              <View style={styles.statusContainer}>
                <TouchableOpacity
                  style={[styles.statusButton, formData.active && styles.activeStatus]}
                  onPress={() => handleInputChange('active', true)}
                >
                  <Ionicons 
                    name="checkmark-circle" 
                    size={20} 
                    color={formData.active ? 'white' : '#10B981'} 
                  />
                  <Text style={[styles.statusText, formData.active && styles.activeStatusText]}>
                    Activo
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.statusButton, !formData.active && styles.inactiveStatus]}
                  onPress={() => handleInputChange('active', false)}
                >
                  <Ionicons 
                    name="pause-circle" 
                    size={20} 
                    color={!formData.active ? 'white' : '#EF4444'} 
                  />
                  <Text style={[styles.statusText, !formData.active && styles.inactiveStatusText]}>
                    Inactivo
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Botones de acción */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleBack}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.submitButton, loading && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              <Text style={styles.submitButtonText}>
                {loading ? 'Actualizando...' : 'Actualizar Usuario'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </AuthenticatedWrapper>
  );
};

// ==================== ESTILOS ====================
const styles = StyleSheet.create({
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F64BF',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },

  // Container
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },

  // Secciones
  section: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },

  // Inputs
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  inputContainer: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingRight: 50, // Espacio para el ícono
    fontSize: 16,
    color: '#1F2937',
    backgroundColor: 'white',
  },
  eyeButton: {
    position: 'absolute',
    right: 16,
    padding: 4,
  },
  inputError: {
    borderColor: '#EF4444',
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
  },

  // Roles
  roleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  roleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: 'white',
    gap: 8,
  },
  activeRole: {
    backgroundColor: '#1F64BF',
    borderColor: '#1F64BF',
  },
  roleText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  activeRoleText: {
    color: 'white',
  },

  // Estado
  statusContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  statusButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: 'white',
    gap: 8,
  },
  activeStatus: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  inactiveStatus: {
    backgroundColor: '#EF4444',
    borderColor: '#EF4444',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  activeStatusText: {
    color: 'white',
  },
  inactiveStatusText: {
    color: 'white',
  },

  // Acciones
  actionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 20,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  submitButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#1F64BF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});

export default EditUserScreen;
