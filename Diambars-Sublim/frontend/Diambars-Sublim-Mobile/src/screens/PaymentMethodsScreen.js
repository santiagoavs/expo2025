// src/screens/PaymentMethodsScreen.js - Pantalla de administración de métodos de pago
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
  ScrollView,
  Dimensions,
  Modal,
  TextInput,
  Switch
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import paymentMethodService from '../api/paymentMethodService';
import AuthenticatedWrapper from '../components/AuthenticatedWrapper';

const { width } = Dimensions.get('window');

const PaymentMethodsScreen = ({ navigation }) => {
  // ==================== ESTADOS LOCALES ====================
  const [configs, setConfigs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit'
  const [showStats, setShowStats] = useState(false);
  
  // Estados del formulario del modal
  const [formData, setFormData] = useState({
    name: '',
    type: 'wompi',
    enabled: true,
    message: ''
  });

  // ==================== FUNCIONES DE CARGA ====================
  
  /**
   * Cargar configuraciones de métodos de pago
   */
  const loadConfigs = async () => {
    try {
      setLoading(true);
      const response = await paymentMethodService.getPaymentConfigs();
      if (response.success) {
        setConfigs(response.configs || []);
        console.log(`✅ [PaymentMethodsScreen] ${response.configs?.length || 0} configuraciones cargadas`);
      }
    } catch (error) {
      console.error('❌ [PaymentMethodsScreen] Error cargando configuraciones:', error);
      Alert.alert('Error', 'Error cargando configuraciones de métodos de pago');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Cargar estadísticas
   */
  const loadStats = async () => {
    try {
      const response = await paymentMethodService.getPaymentStats();
      if (response.success) {
        setStats(response.stats);
        console.log('✅ [PaymentMethodsScreen] Estadísticas cargadas');
      }
    } catch (error) {
      console.error('❌ [PaymentMethodsScreen] Error cargando estadísticas:', error);
    }
  };

  // ==================== EFECTOS ====================
  useEffect(() => {
    loadConfigs();
    loadStats();
  }, []);

  // ==================== FUNCIONES DE UTILIDAD ====================

  /**
   * Obtener icono del método
   */
  const getMethodIcon = (type) => {
    switch (type) {
      case 'wompi':
        return 'card';
      case 'cash':
        return 'cash';
      case 'bank_transfer':
        return 'business';
      case 'credit_card':
        return 'card-outline';
      default:
        return 'wallet';
    }
  };

  /**
   * Obtener color del método
   */
  const getMethodColor = (type) => {
    switch (type) {
      case 'wompi':
        return '#8B5CF6';
      case 'cash':
        return '#10B981';
      case 'bank_transfer':
        return '#3B82F6';
      case 'credit_card':
        return '#F59E0B';
      default:
        return '#6B7280';
    }
  };

  /**
   * Obtener nombre del método
   */
  const getMethodName = (type) => {
    switch (type) {
      case 'wompi':
        return 'Wompi';
      case 'cash':
        return 'Efectivo';
      case 'bank_transfer':
        return 'Transferencia Bancaria';
      case 'credit_card':
        return 'Tarjeta de Crédito';
      default:
        return type;
    }
  };

  // ==================== FUNCIONES ====================

  /**
   * Abrir modal de configuración
   */
  const handleOpenConfigModal = (method = null, mode = 'create') => {
    console.log('⚙️ [PaymentMethodsScreen] Abriendo modal de configuración:', { method, mode });
    setSelectedMethod(method);
    setModalMode(mode);
    
    // Inicializar datos del formulario
    if (method && mode === 'edit') {
      setFormData({
        name: method.name || '',
        type: method.type || 'wompi',
        enabled: method.enabled || true,
        message: method.message || ''
      });
    } else {
      setFormData({
        name: '',
        type: 'wompi',
        enabled: true,
        message: ''
      });
    }
    
    setShowConfigModal(true);
  };

  /**
   * Cerrar modal de configuración
   */
  const handleCloseConfigModal = () => {
    setShowConfigModal(false);
    setSelectedMethod(null);
    setModalMode('create');
    setFormData({
      name: '',
      type: 'wompi',
      enabled: true,
      message: ''
    });
  };

  /**
   * Manejar cambios en el formulario
   */
  const handleFormChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  /**
   * Guardar configuración
   */
  const handleSaveConfig = async () => {
    try {
      if (modalMode === 'create') {
        await paymentMethodService.createPaymentConfig(formData);
        Alert.alert('Éxito', 'Método de pago creado correctamente');
      } else {
        await paymentMethodService.updatePaymentConfig(selectedMethod.type, formData);
        Alert.alert('Éxito', 'Método de pago actualizado correctamente');
      }
      
      await loadConfigs();
      await loadStats();
      handleCloseConfigModal();
    } catch (error) {
      console.error('❌ [PaymentMethodsScreen] Error guardando configuración:', error);
      Alert.alert('Error', 'Error al guardar la configuración');
    }
  };

  /**
   * Manejar edición de método
   */
  const handleEditMethod = (method) => {
    console.log('✏️ [PaymentMethodsScreen] Editando método:', method.type);
    handleOpenConfigModal(method, 'edit');
  };

  /**
   * Manejar eliminación de método
   */
  const handleDeleteMethod = (method) => {
    Alert.alert(
      'Eliminar Método',
      `¿Estás seguro de que quieres eliminar "${method.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar', 
          style: 'destructive',
          onPress: () => {
            console.log('🗑️ [PaymentMethodsScreen] Eliminando método:', method.type);
            // Aquí implementarías la eliminación
            Alert.alert('Éxito', 'Método eliminado correctamente');
          }
        }
      ]
    );
  };

  /**
   * Manejar toggle de estado
   */
  const handleToggleStatus = (method) => {
    const newStatus = !method.enabled;
    console.log(`🔄 [PaymentMethodsScreen] Cambiando estado de ${method.type} a ${newStatus}`);
    
    Alert.alert(
      'Cambiar Estado',
      `¿${newStatus ? 'Habilitar' : 'Deshabilitar'} "${method.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Confirmar', 
          onPress: () => {
            // Aquí implementarías el cambio de estado
            Alert.alert('Éxito', `Método ${newStatus ? 'habilitado' : 'deshabilitado'} correctamente`);
          }
        }
      ]
    );
  };

  /**
   * Manejar refresh
   */
  const handleRefresh = () => {
    refreshPaymentMethods();
  };


  /**
   * Renderizar método de pago para administración
   */
  const renderPaymentMethod = ({ item: config }) => (
    <View style={styles.methodCard}>
      <View style={styles.methodHeader}>
        <View style={[styles.methodIcon, { backgroundColor: getMethodColor(config.type) }]}>
          <Ionicons 
            name={getMethodIcon(config.type)} 
            size={24} 
            color="white" 
          />
        </View>
        
        <View style={styles.methodInfo}>
          <Text style={styles.methodName}>{config.name || getMethodName(config.type)}</Text>
          <Text style={styles.methodType}>{getMethodName(config.type)}</Text>
        </View>

        <View style={styles.methodStatus}>
          <Switch
            value={config.enabled}
            onValueChange={() => handleToggleStatus(config)}
            trackColor={{ false: '#E2E8F0', true: '#032CA6' }}
            thumbColor={config.enabled ? '#FFFFFF' : '#FFFFFF'}
          />
        </View>
      </View>

      {config.message && (
        <Text style={styles.methodMessage}>{config.message}</Text>
      )}

      <View style={styles.methodActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => handleEditMethod(config)}
        >
          <Ionicons name="pencil" size={16} color="#032CA6" />
          <Text style={styles.actionButtonText}>Editar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeleteMethod(config)}
        >
          <Ionicons name="trash" size={16} color="#E53E3E" />
          <Text style={[styles.actionButtonText, styles.deleteButtonText]}>Eliminar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  /**
   * Renderizar estado vacío
   */
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="card-outline" size={64} color="#9CA3AF" />
      <Text style={styles.emptyTitle}>No hay métodos de pago configurados</Text>
      <Text style={styles.emptySubtitle}>
        Configura los métodos de pago disponibles para tus clientes
      </Text>
      <TouchableOpacity
        style={styles.emptyActionButton}
        onPress={() => handleOpenConfigModal(null, 'create')}
      >
        <Ionicons name="add" size={20} color="white" />
        <Text style={styles.emptyActionButtonText}>Agregar Primer Método</Text>
      </TouchableOpacity>
    </View>
  );

  /**
   * Renderizar header de administración
   */
  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        <Text style={styles.headerTitle}>Gestión de Métodos de Pago</Text>
        <Text style={styles.headerSubtitle}>
          Configura los métodos de pago disponibles para tus clientes
        </Text>
      </View>

      <View style={styles.headerActions}>
        <TouchableOpacity
          style={styles.statsButton}
          onPress={() => navigation.navigate('PaymentStats')}
        >
          <Ionicons name="bar-chart" size={20} color="#032CA6" />
          <Text style={styles.statsButtonText}>Estadísticas</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => handleOpenConfigModal(null, 'create')}
        >
          <Ionicons name="add" size={20} color="white" />
          <Text style={styles.addButtonText}>Agregar Método</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // ==================== RENDER ====================
  return (
    <AuthenticatedWrapper>
      <View style={styles.container}>
        {renderHeader()}

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#032CA6" />
            <Text style={styles.loadingText}>Cargando configuraciones...</Text>
          </View>
        ) : configs.length === 0 ? (
          renderEmptyState()
        ) : (
          <FlatList
            data={configs}
            keyExtractor={(item) => item.type}
            renderItem={renderPaymentMethod}
            refreshControl={
              <RefreshControl
                refreshing={loading}
                onRefresh={loadConfigs}
                colors={['#032CA6']}
                tintColor="#032CA6"
              />
            }
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        )}

        {/* Modal de Configuración */}
        <Modal
          visible={showConfigModal}
          animationType="slide"
          presentationStyle="pageSheet"
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {modalMode === 'create' ? 'Nuevo Método de Pago' : 'Editar Método'}
              </Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={handleCloseConfigModal}
              >
                <Ionicons name="close" size={24} color="#4A5568" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              <Text style={styles.modalSubtitle}>
                {modalMode === 'create' 
                  ? 'Configura un nuevo método de pago para tus clientes'
                  : 'Modifica la configuración del método de pago'
                }
              </Text>

              {/* Formulario de configuración */}
              <View style={styles.formContainer}>
                <Text style={styles.formLabel}>Nombre del Método</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Ej: Pago con Tarjeta"
                  value={formData.name}
                  onChangeText={(text) => handleFormChange('name', text)}
                />

                <Text style={styles.formLabel}>Tipo de Método</Text>
                <View style={styles.typeSelector}>
                  <TouchableOpacity
                    style={[
                      styles.typeOption,
                      formData.type === 'wompi' && styles.typeOptionSelected
                    ]}
                    onPress={() => handleFormChange('type', 'wompi')}
                  >
                    <Ionicons 
                      name="card" 
                      size={20} 
                      color={formData.type === 'wompi' ? 'white' : '#8B5CF6'} 
                    />
                    <Text style={[
                      styles.typeOptionText,
                      formData.type === 'wompi' && styles.typeOptionTextSelected
                    ]}>
                      Wompi
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.typeOption,
                      formData.type === 'cash' && styles.typeOptionSelected
                    ]}
                    onPress={() => handleFormChange('type', 'cash')}
                  >
                    <Ionicons 
                      name="cash" 
                      size={20} 
                      color={formData.type === 'cash' ? 'white' : '#10B981'} 
                    />
                    <Text style={[
                      styles.typeOptionText,
                      formData.type === 'cash' && styles.typeOptionTextSelected
                    ]}>
                      Efectivo
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.typeOption,
                      formData.type === 'bank_transfer' && styles.typeOptionSelected
                    ]}
                    onPress={() => handleFormChange('type', 'bank_transfer')}
                  >
                    <Ionicons 
                      name="business" 
                      size={20} 
                      color={formData.type === 'bank_transfer' ? 'white' : '#3B82F6'} 
                    />
                    <Text style={[
                      styles.typeOptionText,
                      formData.type === 'bank_transfer' && styles.typeOptionTextSelected
                    ]}>
                      Transferencia
                    </Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.formLabel}>Mensaje para Clientes</Text>
                <TextInput
                  style={[styles.formInput, styles.textArea]}
                  placeholder="Instrucciones para el cliente..."
                  multiline
                  numberOfLines={3}
                  value={formData.message}
                  onChangeText={(text) => handleFormChange('message', text)}
                />

                <View style={styles.switchContainer}>
                  <Text style={styles.formLabel}>Habilitado</Text>
                  <Switch
                    value={formData.enabled}
                    onValueChange={(value) => handleFormChange('enabled', value)}
                    trackColor={{ false: '#E2E8F0', true: '#032CA6' }}
                    thumbColor="#FFFFFF"
                  />
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleCloseConfigModal}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSaveConfig}
              >
                <Text style={styles.saveButtonText}>
                  {modalMode === 'create' ? 'Crear' : 'Guardar'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
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
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerContent: {
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A202C',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#718096',
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#032CA6',
    backgroundColor: 'white',
  },
  statsButtonText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#032CA6',
    fontWeight: '600',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#032CA6',
  },
  addButtonText: {
    marginLeft: 6,
    fontSize: 14,
    color: 'white',
    fontWeight: '600',
  },
  listContainer: {
    padding: 20,
    flexGrow: 1,
  },
  methodCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  selectedMethodCard: {
    borderColor: '#032CA6',
    backgroundColor: '#F0F4FF',
  },
  methodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  methodIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  methodInfo: {
    flex: 1,
  },
  methodName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A202C',
    marginBottom: 2,
  },
  methodType: {
    fontSize: 12,
    color: '#718096',
    fontWeight: '500',
  },
  methodStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  methodMessage: {
    fontSize: 14,
    color: '#4A5568',
    fontStyle: 'italic',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  methodActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginLeft: 8,
  },
  editButton: {
    backgroundColor: '#F0F4FF',
    borderWidth: 1,
    borderColor: '#032CA6',
  },
  deleteButton: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#E53E3E',
  },
  actionButtonText: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: '500',
    color: '#032CA6',
  },
  deleteButtonText: {
    color: '#E53E3E',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4A5568',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  emptyActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#032CA6',
  },
  emptyActionButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#718096',
  },
  // ==================== ESTILOS DEL MODAL ====================
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A202C',
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#718096',
    marginBottom: 24,
    lineHeight: 22,
  },
  formContainer: {
    marginBottom: 24,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A202C',
    marginBottom: 8,
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1A202C',
    backgroundColor: 'white',
    marginBottom: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: 'white',
    marginRight: 8,
  },
  cancelButtonText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: '#4A5568',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#032CA6',
    marginLeft: 8,
  },
  saveButtonText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  // ==================== ESTILOS DEL SELECTOR DE TIPO ====================
  typeSelector: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  typeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: 'white',
  },
  typeOptionSelected: {
    backgroundColor: '#032CA6',
    borderColor: '#032CA6',
  },
  typeOptionText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '500',
    color: '#4A5568',
  },
  typeOptionTextSelected: {
    color: 'white',
  },
});

export default PaymentMethodsScreen;
