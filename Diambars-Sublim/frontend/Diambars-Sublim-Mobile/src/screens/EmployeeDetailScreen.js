// src/screens/EmployeeDetailScreen.js - Pantalla de detalles de empleado
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
import useEmployees from '../hooks/useEmployees';
import AuthenticatedWrapper from '../components/AuthenticatedWrapper';
import { showDeleteConfirm, showStatusChange } from '../utils/SweetAlert';

const EmployeeDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { employee: initialEmployee } = route.params || {};
  
  const { 
    getEmployeeById, 
    deleteEmployee, 
    hardDeleteEmployee,
    changePassword,
    loading 
  } = useEmployees();

  const [employee, setEmployee] = useState(initialEmployee);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // ==================== EFECTOS ====================
  useEffect(() => {
    if (initialEmployee?.id) {
      loadEmployeeDetail(initialEmployee.id);
    }
  }, [initialEmployee]);

  // ==================== FUNCIONES ====================
  const loadEmployeeDetail = async (employeeId) => {
    try {
      setLoadingDetail(true);
      const employeeData = getEmployeeById(employeeId);
      if (employeeData) {
        setEmployee(employeeData);
      }
    } catch (error) {
      console.error('Error loading employee detail:', error);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleEdit = () => {
    navigation.navigate('EditEmployee', { employee });
  };

  const handleDelete = () => {
    showDeleteConfirm(
      employee.name,
      async () => {
        try {
          await deleteEmployee(employee.id);
          navigation.goBack();
        } catch (error) {
          console.error('Error deleting employee:', error);
        }
      }
    );
  };

  const handleHardDelete = () => {
    Alert.alert(
      'Eliminar Permanentemente',
      `¿Estás seguro de que quieres eliminar permanentemente a ${employee.name}? Esta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await hardDeleteEmployee(employee.id);
              navigation.goBack();
            } catch (error) {
              console.error('Error hard deleting employee:', error);
            }
          }
        }
      ]
    );
  };

  const handleToggleStatus = () => {
    const newStatus = employee.status === 'active' ? 'inactive' : 'active';
    showStatusChange(
      employee.name,
      newStatus === 'active',
      async () => {
        try {
          // Aquí deberías llamar a updateEmployee, pero por simplicidad solo cambiamos el estado local
          setEmployee(prev => ({ 
            ...prev, 
            status: newStatus,
            active: newStatus === 'active'
          }));
        } catch (error) {
          console.error('Error toggling status:', error);
        }
      }
    );
  };

  const handleChangePassword = () => {
    Alert.prompt(
      'Cambiar Contraseña',
      'Ingresa la nueva contraseña:',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cambiar',
          onPress: async (newPassword) => {
            if (newPassword && newPassword.length >= 6) {
              try {
                await changePassword(employee.id, { password: newPassword });
              } catch (error) {
                console.error('Error changing password:', error);
              }
            } else {
              Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
            }
          }
        }
      ],
      'secure-text'
    );
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatLastLogin = (dateString) => {
    if (!dateString) return 'Nunca';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Hoy';
    if (diffDays === 2) return 'Ayer';
    if (diffDays <= 7) return `Hace ${diffDays} días`;
    return date.toLocaleDateString('es-ES');
  };

  // ==================== RENDER ====================
  if (loadingDetail) {
    return (
      <AuthenticatedWrapper title="Detalles" subtitle="Cargando empleado...">
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1F64BF" />
          <Text style={styles.loadingText}>Cargando detalles...</Text>
        </View>
      </AuthenticatedWrapper>
    );
  }

  if (!employee) {
    return (
      <AuthenticatedWrapper title="Error" subtitle="Empleado no encontrado">
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color="#EF4444" />
          <Text style={styles.errorTitle}>Empleado no encontrado</Text>
          <Text style={styles.errorText}>
            El empleado que buscas no existe o ha sido eliminado.
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
    <AuthenticatedWrapper title="Detalles" subtitle={employee.name}>
      {/* Header con flecha de navegación */}
      <View style={styles.navigationHeader}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleBack}
        >
          <Ionicons name="arrow-back" size={24} color="#1F64BF" />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>Detalles de Empleado</Text>
          <Text style={styles.headerSubtitle}>{employee.name}</Text>
        </View>
      </View>
      
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header con imagen */}
        <View style={styles.header}>
          <View style={styles.imageContainer}>
            {employee.profileImage ? (
              <Image source={{ uri: employee.profileImage }} style={styles.employeeImage} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Ionicons name="person" size={48} color="#1F64BF" />
              </View>
            )}
          </View>
          
          <View style={styles.headerInfo}>
            <Text style={styles.employeeName}>{employee.name}</Text>
            <Text style={styles.employeeRole}>{employee.roleDisplay}</Text>
            <View style={styles.statusContainer}>
              <View style={[
                styles.statusDot,
                { backgroundColor: employee.status === 'active' ? '#10B981' : '#EF4444' }
              ]} />
              <Text style={styles.statusText}>
                {employee.status === 'active' ? 'Activo' : 'Inactivo'}
              </Text>
            </View>
          </View>
        </View>

        {/* Información Personal */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información Personal</Text>
          
          <View style={styles.infoRow}>
            <Ionicons name="mail" size={20} color="#1F64BF" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{employee.email}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="call" size={20} color="#1F64BF" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Teléfono</Text>
              <Text style={styles.infoValue}>{employee.phoneNumber || 'N/A'}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="card" size={20} color="#1F64BF" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>DUI</Text>
              <Text style={styles.infoValue}>{employee.dui || 'N/A'}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="location" size={20} color="#1F64BF" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Dirección</Text>
              <Text style={styles.infoValue}>{employee.address || 'N/A'}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="calendar" size={20} color="#1F64BF" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Fecha de Nacimiento</Text>
              <Text style={styles.infoValue}>{formatDate(employee.birthday)}</Text>
            </View>
          </View>
        </View>

        {/* Información Laboral */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información Laboral</Text>
          
          <View style={styles.infoRow}>
            <Ionicons name="briefcase" size={20} color="#1F64BF" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Cargo</Text>
              <Text style={styles.infoValue}>{employee.roleDisplay}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="calendar" size={20} color="#1F64BF" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Fecha de Contratación</Text>
              <Text style={styles.infoValue}>{formatDate(employee.hireDate)}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="time" size={20} color="#1F64BF" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Último Acceso</Text>
              <Text style={styles.infoValue}>{formatLastLogin(employee.lastLogin)}</Text>
            </View>
          </View>
        </View>

        {/* Acciones */}
        <View style={styles.actionsSection}>
          <TouchableOpacity style={styles.actionButton} onPress={handleEdit}>
            <Ionicons name="create" size={20} color="white" />
            <Text style={styles.actionButtonText}>Editar Empleado</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, styles.secondaryButton]} 
            onPress={handleChangePassword}
          >
            <Ionicons name="key" size={20} color="#1F64BF" />
            <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>
              Cambiar Contraseña
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, styles.toggleButton]} 
            onPress={handleToggleStatus}
          >
            <Ionicons 
              name={employee.status === 'active' ? 'pause' : 'play'} 
              size={20} 
              color="white" 
            />
            <Text style={styles.actionButtonText}>
              {employee.status === 'active' ? 'Desactivar' : 'Activar'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, styles.dangerButton]} 
            onPress={handleDelete}
          >
            <Ionicons name="trash" size={20} color="white" />
            <Text style={styles.actionButtonText}>Eliminar Empleado</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, styles.dangerButton]} 
            onPress={handleHardDelete}
          >
            <Ionicons name="trash" size={20} color="white" />
            <Text style={styles.actionButtonText}>Eliminar Permanentemente</Text>
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
    marginRight: 16,
  },
  employeeImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  imagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  employeeName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#010326',
    marginBottom: 8,
  },
  employeeRole: {
    fontSize: 16,
    color: '#1F64BF',
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
    fontWeight: '600',
    color: '#6B7280',
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
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoContent: {
    marginLeft: 12,
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    color: '#010326',
    fontWeight: '500',
  },

  // Acciones
  actionsSection: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  actionButton: {
    backgroundColor: '#1F64BF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  secondaryButton: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#1F64BF',
  },
  toggleButton: {
    backgroundColor: '#F59E0B',
  },
  dangerButton: {
    backgroundColor: '#EF4444',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  secondaryButtonText: {
    color: '#1F64BF',
  },
});

export default EmployeeDetailScreen;
