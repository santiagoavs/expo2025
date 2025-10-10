// src/components/Orders/ManualOrderForm.js - Versión React Native
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  Image,
  StyleSheet,
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// ================ COMPONENTE PRINCIPAL ================
const ManualOrderForm = ({ open, onClose, onOrderCreated }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [designSearchQuery, setDesignSearchQuery] = useState('');
  const [previewDesign, setPreviewDesign] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  
  const [deliveryType, setDeliveryType] = useState('meetup');
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showAddressModal, setShowAddressModal] = useState(false);
  
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Datos de ejemplo
  const [designs, setDesigns] = useState([]);
  const [selectedDesign, setSelectedDesign] = useState(null);
  const [userAddresses, setUserAddresses] = useState([]);

  const steps = [
    { label: 'Diseño', icon: 'palette' },
    { label: 'Dirección', icon: 'car' },
    { label: 'Pago', icon: 'card' },
    { label: 'Confirmar', icon: 'checkmark' }
  ];

  // Cargar diseños de ejemplo
  useEffect(() => {
    if (open) {
      loadDesigns();
    }
  }, [open]);

  const loadDesigns = async () => {
    setLoading(true);
    try {
      // Simular carga de diseños
      await new Promise(resolve => setTimeout(resolve, 1000));
      const mockDesigns = [
        {
          _id: '1',
          name: 'Diseño Personalizado 1',
          user: { name: 'Juan Pérez', _id: 'user1' },
          product: { name: 'Camiseta Básica', images: ['https://via.placeholder.com/300'] },
          price: 45
        },
        {
          _id: '2',
          name: 'Diseño Empresarial',
          user: { name: 'María García', _id: 'user2' },
          product: { name: 'Taza Personalizada', images: ['https://via.placeholder.com/300'] },
          price: 25
        },
        {
          _id: '3',
          name: 'Logo Corporativo',
          user: { name: 'Carlos López', _id: 'user3' },
          product: { name: 'Poster A3', images: ['https://via.placeholder.com/300'] },
          price: 80
        }
      ];
      setDesigns(mockDesigns);
    } catch (error) {
      console.error('Error cargando diseños:', error);
    } finally {
      setLoading(false);
    }
  };

  // Cargar direcciones de ejemplo
  const loadAddresses = async (userId) => {
    try {
      // Simular carga de direcciones
      await new Promise(resolve => setTimeout(resolve, 500));
      const mockAddresses = [
        {
          _id: 'addr1',
          label: 'Casa',
          recipient: 'Juan Pérez',
          address: 'Calle 123 #45-67',
          municipality: 'Medellín',
          department: 'Antioquia',
          phoneNumber: '3001234567',
          isDefault: true
        },
        {
          _id: 'addr2',
          label: 'Oficina',
          recipient: 'Juan Pérez',
          address: 'Carrera 50 #80-10',
          municipality: 'Medellín',
          department: 'Antioquia',
          phoneNumber: '3001234567',
          isDefault: false
        }
      ];
      setUserAddresses(mockAddresses);
    } catch (error) {
      console.error('Error cargando direcciones:', error);
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleDesignSelect = (design) => {
    setSelectedDesign(design);
    loadAddresses(design.user._id);
    setCurrentStep(1);
  };

  const handleCreateOrder = async () => {
    setLoading(true);
    try {
      const orderData = {
        designId: selectedDesign?._id,
        userId: selectedDesign?.user?._id,
        productId: selectedDesign?.product?._id,
        estimatedPrice: selectedDesign?.price || 0,
        deliveryType: deliveryType,
        deliveryAddress: selectedAddress,
        paymentMethod: paymentMethod,
        quantity: 1,
        notes: `Pedido manual creado desde diseño: ${selectedDesign?.name}`,
        isManualOrder: true
      };
      
      // Simular creación de orden
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      Alert.alert(
        '¡Pedido Creado!',
        `El pedido manual se ha creado exitosamente para ${selectedDesign?.name}`,
        [{ text: 'Aceptar', onPress: () => {
          onOrderCreated?.(orderData);
          handleClose();
        }}]
      );
    } catch (error) {
      console.error('Error creando orden:', error);
      Alert.alert('Error', 'No se pudo crear el pedido');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setCurrentStep(0);
    setDesignSearchQuery('');
    setSelectedDesign(null);
    setDeliveryType('meetup');
    setSelectedAddress(null);
    setPaymentMethod('cash');
    onClose();
  };

  const canProceedToNext = () => {
    switch (currentStep) {
      case 0: return selectedDesign !== null;
      case 1: return deliveryType && (deliveryType === 'meetup' || selectedAddress);
      case 2: return paymentMethod;
      case 3: return true;
      default: return false;
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDesigns();
    setRefreshing(false);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Seleccionar Diseño</Text>
            
            {/* Barra de búsqueda */}
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color="#032CA6" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Buscar diseño..."
                value={designSearchQuery}
                onChangeText={setDesignSearchQuery}
                placeholderTextColor="#64748b"
              />
            </View>

            {loading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#1F64BF" />
                <Text style={styles.loadingText}>Cargando diseños...</Text>
              </View>
            )}

            <ScrollView 
              style={styles.designsList}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
              }
            >
              {designs.map((design) => (
                <TouchableOpacity
                  key={design._id}
                  style={[
                    styles.designCard,
                    selectedDesign?._id === design._id && styles.designCardSelected
                  ]}
                  onPress={() => handleDesignSelect(design)}
                >
                  <View style={styles.designHeader}>
                    {design.product?.images?.[0] && (
                      <Image
                        source={{ uri: design.product.images[0] }}
                        style={styles.designImage}
                      />
                    )}
                    <TouchableOpacity
                      style={styles.previewButton}
                      onPress={() => {
                        setPreviewDesign(design);
                        setShowPreview(true);
                      }}
                    >
                      <Ionicons name="eye" size={16} color="#032CA6" />
                    </TouchableOpacity>
                  </View>
                  
                  <View style={styles.designInfo}>
                    <Text style={styles.designName}>{design.name}</Text>
                    
                    <View style={styles.designDetails}>
                      <Text style={styles.designDetail}>Cliente: {design.user?.name}</Text>
                      <Text style={styles.designDetail}>Producto: {design.product?.name}</Text>
                    </View>
                    
                    {design.price && (
                      <View style={styles.priceBadge}>
                        <Text style={styles.priceText}>${design.price}</Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {designs.length === 0 && !loading && (
              <View style={styles.emptyState}>
                <Ionicons name="images" size={48} color="#6B7280" />
                <Text style={styles.emptyText}>No hay diseños disponibles</Text>
              </View>
            )}
          </View>
        );

      case 1:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Dirección de Entrega</Text>
            
            <View style={styles.deliveryOptions}>
              <Text style={styles.sectionLabel}>Tipo de Entrega</Text>
              <View style={styles.optionsRow}>
                <TouchableOpacity
                  style={[
                    styles.optionCard,
                    deliveryType === 'meetup' && styles.optionCardSelected
                  ]}
                  onPress={() => setDeliveryType('meetup')}
                >
                  <Ionicons 
                    name="location" 
                    size={28} 
                    color={deliveryType === 'meetup' ? '#032CA6' : '#666'} 
                  />
                  <Text style={styles.optionTitle}>Punto de Entrega</Text>
                  <Text style={styles.optionDescription}>
                    Reunión en ubicación específica
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.optionCard,
                    deliveryType === 'delivery' && styles.optionCardSelected
                  ]}
                  onPress={() => setDeliveryType('delivery')}
                >
                  <Ionicons 
                    name="car" 
                    size={28} 
                    color={deliveryType === 'delivery' ? '#032CA6' : '#666'} 
                  />
                  <Text style={styles.optionTitle}>Delivery</Text>
                  <Text style={styles.optionDescription}>
                    Entrega a domicilio
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {deliveryType === 'delivery' && (
              <View style={styles.addressSection}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionLabel}>Direcciones Guardadas</Text>
                  <TouchableOpacity 
                    style={styles.addButton}
                    onPress={() => setShowAddressModal(true)}
                  >
                    <Ionicons name="add" size={16} color="#1F64BF" />
                    <Text style={styles.addButtonText}>Nueva Dirección</Text>
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.addressesList}>
                  {userAddresses.map((address) => (
                    <TouchableOpacity
                      key={address._id}
                      style={[
                        styles.addressCard,
                        selectedAddress?._id === address._id && styles.addressCardSelected
                      ]}
                      onPress={() => setSelectedAddress(address)}
                    >
                      <View style={styles.addressHeader}>
                        <Text style={styles.addressLabel}>{address.label}</Text>
                        {address.isDefault && (
                          <View style={styles.defaultBadge}>
                            <Text style={styles.defaultBadgeText}>Predeterminada</Text>
                          </View>
                        )}
                      </View>
                      <View style={styles.addressDetails}>
                        <Text style={styles.addressText}>{address.recipient}</Text>
                        <Text style={styles.addressText}>{address.address}</Text>
                        <Text style={styles.addressLocation}>
                          {address.municipality}, {address.department}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                {userAddresses.length === 0 && (
                  <View style={styles.emptyState}>
                    <Ionicons name="location" size={32} color="#6B7280" />
                    <Text style={styles.emptyText}>No hay direcciones guardadas</Text>
                  </View>
                )}
              </View>
            )}

            {deliveryType === 'meetup' && (
              <View style={styles.infoAlert}>
                <Ionicons name="information-circle" size={20} color="#3B82F6" />
                <Text style={styles.infoText}>
                  Se coordinará el punto de entrega directamente con el cliente.
                </Text>
              </View>
            )}
          </View>
        );

      case 2:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Método de Pago</Text>

            {/* Resumen del pedido */}
            <View style={styles.orderSummary}>
              <Text style={styles.summaryTitle}>Resumen del Pedido</Text>
              <View style={styles.summaryDetails}>
                <Text style={styles.summaryText}>
                  <Text style={styles.summaryLabel}>Diseño:</Text> {selectedDesign?.name}
                </Text>
                <Text style={styles.summaryText}>
                  <Text style={styles.summaryLabel}>Cliente:</Text> {selectedDesign?.user?.name}
                </Text>
                <Text style={styles.summaryText}>
                  <Text style={styles.summaryLabel}>Precio:</Text> ${selectedDesign?.price || 0}
                </Text>
              </View>
              {selectedDesign?.price > 50 && (
                <View style={styles.warningAlert}>
                  <Ionicons name="warning" size={16} color="#92400E" />
                  <Text style={styles.warningText}>
                    Pedido grande detectado. Se requiere adelanto del 30% (${Math.round(selectedDesign.price * 0.3)})
                  </Text>
                </View>
              )}
            </View>

            <Text style={styles.sectionLabel}>Selecciona el Método de Pago</Text>

            <View style={styles.paymentOptions}>
              <TouchableOpacity
                style={[
                  styles.optionCard,
                  paymentMethod === 'cash' && styles.optionCardSelected
                ]}
                onPress={() => setPaymentMethod('cash')}
              >
                <Ionicons 
                  name="cash" 
                  size={28} 
                  color={paymentMethod === 'cash' ? '#032CA6' : '#666'} 
                />
                <Text style={styles.optionTitle}>Efectivo</Text>
                <Text style={styles.optionDescription}>
                  Pago contra entrega
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.optionCard,
                  paymentMethod === 'bank_transfer' && styles.optionCardSelected
                ]}
                onPress={() => setPaymentMethod('bank_transfer')}
              >
                <Ionicons 
                  name="business" 
                  size={28} 
                  color={paymentMethod === 'bank_transfer' ? '#032CA6' : '#666'} 
                />
                <Text style={styles.optionTitle}>Transferencia</Text>
                <Text style={styles.optionDescription}>
                  Datos bancarios
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.optionCard,
                  paymentMethod === 'wompi' && styles.optionCardSelected
                ]}
                onPress={() => setPaymentMethod('wompi')}
              >
                <Ionicons 
                  name="card" 
                  size={28} 
                  color={paymentMethod === 'wompi' ? '#032CA6' : '#666'} 
                />
                <Text style={styles.optionTitle}>Tarjeta</Text>
                <Text style={styles.optionDescription}>
                  Wompi/PayPal
                </Text>
              </TouchableOpacity>
            </View>

            {paymentMethod && (
              <View style={styles.paymentInfo}>
                {paymentMethod === 'cash' && (
                  <View style={styles.infoAlert}>
                    <Text style={styles.infoTitle}>💰 Pago en Efectivo</Text>
                    <Text style={styles.infoText}>
                      El cliente pagará contra entrega al recibir el producto. No se requiere pago anticipado.
                    </Text>
                  </View>
                )}

                {paymentMethod === 'bank_transfer' && (
                  <View style={styles.warningAlert}>
                    <Text style={styles.infoTitle}>🏦 Transferencia Bancaria</Text>
                    <Text style={styles.infoText}>
                      El cliente debe realizar una transferencia bancaria a la cuenta configurada.
                    </Text>
                    <Text style={styles.infoSubtext}>
                      Los datos bancarios se proporcionarán de forma segura después de confirmar el pedido.
                    </Text>
                  </View>
                )}

                {paymentMethod === 'wompi' && (
                  <View style={styles.warningAlert}>
                    <Text style={styles.infoTitle}>💳 Pago con Tarjeta (Wompi)</Text>
                    <Text style={styles.infoText}>
                      Se utilizará una tarjeta guardada del cliente para procesar el pago.
                    </Text>
                    <Text style={styles.infoSubtext}>
                      Solo se pueden usar tarjetas previamente guardadas por el cliente.
                    </Text>
                    <Text style={styles.errorText}>
                      El admin NO puede crear nuevas tarjetas por seguridad.
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>
        );

      case 3:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Confirmar Pedido</Text>

            <View style={styles.successAlert}>
              <Ionicons name="checkmark-circle" size={20} color="#059669" />
              <Text style={styles.successText}>
                Revisa todos los detalles antes de crear el pedido.
              </Text>
            </View>

            <View style={styles.confirmationGrid}>
              <View style={styles.confirmationCard}>
                <Text style={styles.confirmationTitle}>Diseño Seleccionado</Text>
                <Text style={styles.confirmationValue}>{selectedDesign?.name}</Text>
                <Text style={styles.confirmationDetail}>
                  Cliente: {selectedDesign?.user?.name}
                </Text>
                <Text style={styles.confirmationDetail}>
                  Producto: {selectedDesign?.product?.name}
                </Text>
                <Text style={styles.confirmationPrice}>
                  ${selectedDesign?.price || 0}
                </Text>
              </View>

              <View style={styles.confirmationCard}>
                <Text style={styles.confirmationTitle}>Dirección de Entrega</Text>
                <Text style={styles.confirmationValue}>
                  {deliveryType === 'meetup' ? 'Punto de Entrega' : 'Delivery'}
                </Text>
                {deliveryType === 'delivery' && selectedAddress && (
                  <>
                    <Text style={styles.confirmationDetail}>
                      {selectedAddress.label}
                    </Text>
                    <Text style={styles.confirmationDetail}>
                      {selectedAddress.address}
                    </Text>
                    <Text style={styles.confirmationLocation}>
                      {selectedAddress.municipality}, {selectedAddress.department}
                    </Text>
                  </>
                )}
                {deliveryType === 'meetup' && (
                  <Text style={styles.confirmationDetail}>
                    Se coordinará con el cliente
                  </Text>
                )}
              </View>

              <View style={styles.confirmationCard}>
                <Text style={styles.confirmationTitle}>Método de Pago</Text>
                <Text style={styles.confirmationValue}>
                  {paymentMethod === 'cash' ? '💰 Efectivo' : 
                   paymentMethod === 'bank_transfer' ? '🏦 Transferencia' : 
                   '💳 Tarjeta'}
                </Text>
                <Text style={styles.confirmationDetail}>
                  {paymentMethod === 'cash' ? 'Pago contra entrega' : 
                   paymentMethod === 'bank_transfer' ? 'Transferencia bancaria' : 
                   'Wompi/PayPal'}
                </Text>
                {selectedDesign?.price > 50 && (
                  <View style={styles.advanceAlert}>
                    <Text style={styles.advanceText}>
                      Adelanto: ${Math.round(selectedDesign.price * 0.3)}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <Modal
      visible={open}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Ionicons name="receipt" size={24} color="#1F64BF" />
            <Text style={styles.title}>Crear Pedido Manual</Text>
          </View>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Ionicons name="close" size={24} color="#032CA6" />
          </TouchableOpacity>
        </View>

        {/* Stepper */}
        <View style={styles.stepper}>
          {steps.map((step, index) => (
            <View key={step.label} style={styles.stepContainer}>
              <View style={[
                styles.stepCircle,
                index <= currentStep && styles.stepCircleActive
              ]}>
                <Ionicons 
                  name={step.icon} 
                  size={16} 
                  color={index <= currentStep ? 'white' : '#6B7280'} 
                />
              </View>
              <Text style={[
                styles.stepLabel,
                index <= currentStep && styles.stepLabelActive
              ]}>
                {step.label}
              </Text>
              {index < steps.length - 1 && (
                <View style={[
                  styles.stepLine,
                  index < currentStep && styles.stepLineActive
                ]} />
              )}
            </View>
          ))}
        </View>

        {/* Contenido del paso actual */}
        <View style={styles.content}>
          {renderStepContent()}
        </View>

        {/* Acciones */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={currentStep === 0 ? handleClose : handleBack}
          >
            <Ionicons 
              name={currentStep === 0 ? 'close' : 'arrow-back'} 
              size={16} 
              color="#1F64BF" 
            />
            <Text style={styles.secondaryButtonText}>
              {currentStep === 0 ? 'Cancelar' : 'Atrás'}
            </Text>
          </TouchableOpacity>

          <View style={styles.spacer} />

          {currentStep < steps.length - 1 ? (
            <TouchableOpacity
              style={[
                styles.button,
                styles.primaryButton,
                !canProceedToNext() && styles.buttonDisabled
              ]}
              onPress={handleNext}
              disabled={!canProceedToNext()}
            >
              <Text style={styles.primaryButtonText}>Siguiente</Text>
              <Ionicons name="arrow-forward" size={16} color="white" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[
                styles.button,
                styles.primaryButton,
                (!canProceedToNext() || loading) && styles.buttonDisabled
              ]}
              onPress={handleCreateOrder}
              disabled={!canProceedToNext() || loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Ionicons name="checkmark" size={16} color="white" />
              )}
              <Text style={styles.primaryButtonText}>
                {loading ? 'Creando...' : 'Crear Pedido'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Modal de vista previa */}
        <Modal
          visible={showPreview}
          animationType="fade"
          transparent={true}
          onRequestClose={() => setShowPreview(false)}
        >
          <View style={styles.previewOverlay}>
            <View style={styles.previewContent}>
              <View style={styles.previewHeader}>
                <Text style={styles.previewTitle}>
                  Vista Previa: {previewDesign?.name}
                </Text>
                <TouchableOpacity 
                  style={styles.previewClose}
                  onPress={() => setShowPreview(false)}
                >
                  <Ionicons name="close" size={24} color="#6B7280" />
                </TouchableOpacity>
              </View>
              <View style={styles.previewBody}>
                {previewDesign?.product?.images?.[0] && (
                  <Image
                    source={{ uri: previewDesign.product.images[0] }}
                    style={styles.previewImage}
                    resizeMode="contain"
                  />
                )}
                <View style={styles.previewInfo}>
                  <Text style={styles.previewDesignName}>{previewDesign?.name}</Text>
                  <Text style={styles.previewDetail}>
                    Cliente: {previewDesign?.user?.name}
                  </Text>
                  <Text style={styles.previewDetail}>
                    Producto: {previewDesign?.product?.name}
                  </Text>
                  <Text style={styles.previewPrice}>
                    ${previewDesign?.price || 0}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </Modal>

        {/* Modal de dirección (placeholder) */}
        <Modal
          visible={showAddressModal}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setShowAddressModal(false)}
        >
          <View style={styles.subModal}>
            <View style={styles.subModalHeader}>
              <Text style={styles.subModalTitle}>Nueva Dirección</Text>
              <TouchableOpacity onPress={() => setShowAddressModal(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            <View style={styles.subModalContent}>
              <Text style={styles.placeholderText}>
                Funcionalidad de gestión de direcciones - Próximamente
              </Text>
            </View>
          </View>
        </Modal>
      </View>
    </Modal>
  );
};

// ================ ESTILOS ================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(31, 100, 191, 0.1)',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#010326',
  },
  closeButton: {
    padding: 4,
  },
  stepper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(31, 100, 191, 0.1)',
  },
  stepContainer: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row',
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  stepCircleActive: {
    backgroundColor: '#1F64BF',
  },
  stepLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
  },
  stepLabelActive: {
    color: '#1F64BF',
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#F3F4F6',
    marginHorizontal: 8,
  },
  stepLineActive: {
    backgroundColor: '#1F64BF',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#010326',
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#010326',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  designsList: {
    flex: 1,
  },
  designCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(31, 100, 191, 0.08)',
  },
  designCardSelected: {
    borderColor: '#1F64BF',
    borderWidth: 2,
    backgroundColor: 'rgba(31, 100, 191, 0.05)',
  },
  designHeader: {
    position: 'relative',
    marginBottom: 12,
  },
  designImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
  },
  previewButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 6,
    borderRadius: 6,
  },
  designInfo: {
    gap: 8,
  },
  designName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#010326',
  },
  designDetails: {
    gap: 4,
  },
  designDetail: {
    fontSize: 14,
    color: '#6B7280',
  },
  priceBadge: {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  priceText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  deliveryOptions: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#010326',
    marginBottom: 12,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  optionCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(31, 100, 191, 0.08)',
  },
  optionCardSelected: {
    borderColor: '#1F64BF',
    borderWidth: 2,
    backgroundColor: 'rgba(31, 100, 191, 0.05)',
  },
  optionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#010326',
    marginTop: 8,
    marginBottom: 4,
    textAlign: 'center',
  },
  optionDescription: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 16,
  },
  addressSection: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1F64BF',
  },
  addButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1F64BF',
  },
  addressesList: {
    flex: 1,
  },
  addressCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(31, 100, 191, 0.08)',
  },
  addressCardSelected: {
    borderColor: '#1F64BF',
    borderWidth: 2,
    backgroundColor: 'rgba(31, 100, 191, 0.05)',
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  addressLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#010326',
  },
  defaultBadge: {
    backgroundColor: '#1F64BF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  defaultBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'white',
  },
  addressDetails: {
    gap: 4,
  },
  addressText: {
    fontSize: 14,
    color: '#6B7280',
  },
  addressLocation: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  infoAlert: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#1E40AF',
    lineHeight: 20,
  },
  orderSummary: {
    backgroundColor: 'rgba(3, 44, 166, 0.05)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#010326',
    marginBottom: 8,
  },
  summaryDetails: {
    gap: 4,
  },
  summaryText: {
    fontSize: 14,
    color: '#6B7280',
  },
  summaryLabel: {
    fontWeight: '600',
    color: '#010326',
  },
  warningAlert: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    color: '#92400E',
    lineHeight: 20,
  },
  paymentOptions: {
    gap: 12,
    marginBottom: 24,
  },
  paymentInfo: {
    marginTop: 16,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#010326',
    marginBottom: 4,
  },
  infoSubtext: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    lineHeight: 16,
  },
  errorText: {
    fontSize: 12,
    color: '#DC2626',
    fontWeight: '600',
    marginTop: 4,
  },
  successAlert: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
  },
  successText: {
    flex: 1,
    fontSize: 14,
    color: '#065F46',
    lineHeight: 20,
  },
  confirmationGrid: {
    gap: 16,
  },
  confirmationCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(31, 100, 191, 0.08)',
  },
  confirmationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#010326',
    marginBottom: 8,
  },
  confirmationValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F64BF',
    marginBottom: 4,
  },
  confirmationDetail: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  confirmationLocation: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  confirmationPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#059669',
    marginTop: 8,
  },
  advanceAlert: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    padding: 8,
    borderRadius: 6,
    marginTop: 8,
  },
  advanceText: {
    fontSize: 12,
    color: '#92400E',
    fontWeight: '600',
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(31, 100, 191, 0.1)',
    gap: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 120,
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: '#1F64BF',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#1F64BF',
  },
  buttonDisabled: {
    backgroundColor: '#9CA3AF',
    borderColor: '#9CA3AF',
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: '#1F64BF',
    fontSize: 14,
    fontWeight: '600',
  },
  spacer: {
    flex: 1,
  },
  previewOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  previewContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    width: '100%',
    maxHeight: '80%',
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(31, 100, 191, 0.1)',
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#010326',
  },
  previewClose: {
    padding: 4,
  },
  previewBody: {
    padding: 16,
  },
  previewImage: {
    width: '100%',
    height: 300,
    borderRadius: 8,
    marginBottom: 16,
  },
  previewInfo: {
    gap: 8,
  },
  previewDesignName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#010326',
  },
  previewDetail: {
    fontSize: 14,
    color: '#6B7280',
  },
  previewPrice: {
    fontSize: 20,
    fontWeight: '700',
    color: '#059669',
    marginTop: 8,
  },
  subModal: {
    flex: 1,
    backgroundColor: 'white',
  },
  subModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(31, 100, 191, 0.1)',
  },
  subModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#010326',
  },
  subModalContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  placeholderText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
});

export default ManualOrderForm;