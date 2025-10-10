// src/components/Orders/OrderDetailsModal.js - Versión React Native
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
  ActivityIndicator,
  Image,
  StyleSheet,
  Linking,
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// ================ COMPONENTE PRINCIPAL ================
const OrderDetailsModal = ({ open, onClose, order, onStatusChange }) => {
  // Si no hay orden o el modal no está abierto, no renderizar
  if (!order || !open) {
    return null;
  }

  const [loading, setLoading] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  
  // Estados para modales
  const [showPaymentDetails, setShowPaymentDetails] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);
  const [showStatusChange, setShowStatusChange] = useState(false);
  const [showQualityControl, setShowQualityControl] = useState(false);

  // Formatear fecha
  const formatDate = (date) => {
    if (!date) return 'N/A';
    
    try {
      const dateObj = new Date(date);
      
      if (isNaN(dateObj.getTime())) {
        return 'Fecha inválida';
      }
      
      return dateObj.toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formateando fecha:', error);
      return 'Error en fecha';
    }
  };

  // Obtener color por estado
  const getStatusColor = (status) => {
    const colors = {
      pending_approval: { bg: '#FEF3C7', color: '#92400E' },
      quoted: { bg: '#CFFAFE', color: '#0E7490' },
      approved: { bg: '#D1FAE5', color: '#065F46' },
      in_production: { bg: '#DBEAFE', color: '#1E40AF' },
      quality_check: { bg: '#FED7AA', color: '#9A3412' },
      quality_approved: { bg: '#ECFCCB', color: '#365314' },
      packaging: { bg: '#F3E8FF', color: '#581C87' },
      ready_for_delivery: { bg: '#E9D5FF', color: '#7C2D12' },
      out_for_delivery: { bg: '#CFFAFE', color: '#0E7490' },
      delivered: { bg: '#DCFCE7', color: '#166534' },
      completed: { bg: '#D1FAE5', color: '#064E3B' },
      cancelled: { bg: '#FEE2E2', color: '#991B1B' },
      on_hold: { bg: '#F3F4F6', color: '#374151' }
    };
    return colors[status] || colors.pending_approval;
  };

  // Función auxiliar para obtener el teléfono
  const getUserPhone = () => {
    const currentOrder = orderDetails || order;
    const currentUser = currentOrder?.user;
    const phoneNumber = currentUser?.phoneNumber;
    const phone = currentUser?.phone;
    const result = phoneNumber || phone || null;
    return result;
  };

  // Solo se puede subir fotos en control de calidad
  const canUploadPhotos = order?.status === 'quality_check';
  const hasPhoneNumber = getUserPhone() && getUserPhone().trim() !== '';

  // Cargar detalles completos de la orden
  useEffect(() => {
    if (open && order && order._id) {
      loadOrderDetails();
    }
  }, [open, order]);

  const loadOrderDetails = async () => {
    setLoading(true);
    try {
      // Aquí iría tu llamada a la API
      // const response = await fetch(`/api/orders/${order._id}`);
      // const data = await response.json();
      // if (data.success) {
      //   setOrderDetails(data.data);
      // }
      
      // Simular carga
      await new Promise(resolve => setTimeout(resolve, 1000));
      setOrderDetails(order);
    } catch (error) {
      console.error('Error cargando detalles de la orden:', error);
      Alert.alert('Error', 'No se pudieron cargar los detalles de la orden');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadOrderDetails();
    setRefreshing(false);
  };

  const handleStatusChange = async () => {
    Alert.alert(
      'Cambiar Estado',
      'Funcionalidad de cambio de estado - Próximamente',
      [{ text: 'Entendido' }]
    );
  };

  const handleWhatsApp = () => {
    const phone = getUserPhone();
    if (phone) {
      const message = `Hola, soy de DIAMBARS. Te contacto respecto a tu pedido #${order.orderNumber}`;
      const url = `whatsapp://send?phone=${phone}&text=${encodeURIComponent(message)}`;
      Linking.openURL(url).catch(() => {
        Alert.alert('Error', 'No se pudo abrir WhatsApp');
      });
    } else {
      Alert.alert('Información', 'No hay número de teléfono disponible para este cliente');
    }
  };

  // Renderizar información de la orden
  const renderOrderInformation = () => {
    const statusColor = getStatusColor(order?.status);
    
    return (
      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Header de la orden */}
        <View style={styles.orderHeader}>
          <View style={styles.orderTitleContainer}>
            <View style={styles.orderIcon}>
              <Ionicons name="cube" size={24} color="#1F64BF" />
            </View>
            <View>
              <Text style={styles.orderTitle}>Orden #{order?.orderNumber}</Text>
              <Text style={styles.orderDate}>{formatDate(order?.createdAt)}</Text>
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusColor.bg }]}>
            <Text style={[styles.statusText, { color: statusColor.color }]}>
              {order?.statusLabel}
            </Text>
          </View>
        </View>

        {/* Botones de Acciones Rápidas */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.primaryButton]}
            onPress={() => setShowPaymentDetails(true)}
          >
            <Ionicons name="card" size={16} color="white" />
            <Text style={styles.actionButtonText}>Ver Pagos</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, styles.infoButton]}
            onPress={() => setShowTimeline(true)}
          >
            <Ionicons name="time" size={16} color="white" />
            <Text style={styles.actionButtonText}>Timeline</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, styles.successButton]}
            onPress={() => setShowQualityControl(true)}
          >
            <Ionicons name="checkmark-circle" size={16} color="white" />
            <Text style={styles.actionButtonText}>Calidad</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, styles.outlineButton]}
            onPress={() => setShowStatusChange(true)}
          >
            <Ionicons name="refresh" size={16} color="#1F64BF" />
            <Text style={[styles.actionButtonText, { color: '#1F64BF' }]}>Estado</Text>
          </TouchableOpacity>

          {canUploadPhotos && (
            <TouchableOpacity 
              style={[styles.actionButton, styles.warningButton]}
              onPress={() => setShowPhotoUpload(true)}
            >
              <Ionicons name="camera" size={16} color="white" />
              <Text style={styles.actionButtonText}>Foto</Text>
            </TouchableOpacity>
          )}

          {hasPhoneNumber && (
            <TouchableOpacity 
              style={[styles.actionButton, styles.whatsappButton]}
              onPress={handleWhatsApp}
            >
              <Ionicons name="logo-whatsapp" size={16} color="white" />
              <Text style={styles.actionButtonText}>WhatsApp</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Información del Pedido */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="receipt" size={20} color="#1F64BF" />
            <Text style={styles.sectionTitle}>Detalles del Pedido</Text>
          </View>
          
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Número de orden:</Text>
              <Text style={styles.infoValue}>#{order?.orderNumber}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Total:</Text>
              <Text style={[styles.infoValue, styles.totalValue]}>
                {order?.formattedTotal}
              </Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Cantidad:</Text>
              <Text style={styles.infoValue}>{order?.quantity} unidad(es)</Text>
            </View>
            
            {order?.isManualOrder && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Tipo:</Text>
                <View style={styles.manualBadge}>
                  <Text style={styles.manualBadgeText}>Pedido Manual</Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Información del Cliente */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="person" size={20} color="#1F64BF" />
            <Text style={styles.sectionTitle}>Información del Cliente</Text>
          </View>
          
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Nombre:</Text>
              <Text style={styles.infoValue}>{order?.user?.name || 'N/A'}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Email:</Text>
              <Text style={[styles.infoValue, styles.emailValue]}>
                {order?.user?.email || 'N/A'}
              </Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Teléfono:</Text>
              <Text style={styles.infoValue}>{getUserPhone() || 'N/A'}</Text>
            </View>
            
            {order?.user?.totalOrders && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Total de pedidos:</Text>
                <View style={styles.ordersBadge}>
                  <Text style={styles.ordersBadgeText}>
                    {order.user.totalOrders} pedidos
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Información de Entrega */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="car" size={20} color="#1F64BF" />
            <Text style={styles.sectionTitle}>Información de Entrega</Text>
          </View>
          
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Tipo de entrega:</Text>
              <View style={[
                styles.deliveryBadge,
                order?.deliveryType === 'delivery' ? styles.deliveryPrimary : styles.deliverySecondary
              ]}>
                <Text style={styles.deliveryBadgeText}>
                  {order?.deliveryLabel}
                </Text>
              </View>
            </View>
            
            {order?.deliveryType === 'delivery' && order?.deliveryAddress && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Dirección:</Text>
                <View style={styles.addressContainer}>
                  <Text style={styles.addressText}>
                    {order.deliveryAddress.street}, {order.deliveryAddress.city}
                  </Text>
                  {order.deliveryAddress.phone && (
                    <Text style={styles.phoneText}>
                      📞 {order.deliveryAddress.phone}
                    </Text>
                  )}
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Productos del Pedido */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="cube" size={20} color="#1F64BF" />
            <Text style={styles.sectionTitle}>Productos del Pedido</Text>
          </View>
          
          <View style={styles.productsContainer}>
            {order?.items?.map((item, index) => (
              <View key={index} style={styles.productItem}>
                <View style={styles.productHeader}>
                  {item.product?.images?.[0] && (
                    <Image
                      source={{ uri: item.product.images[0] }}
                      style={styles.productImage}
                    />
                  )}
                  <View style={styles.productInfo}>
                    <Text style={styles.productName}>
                      {item.product?.name || 'Producto personalizado'}
                    </Text>
                    <View style={styles.productBadges}>
                      <View style={styles.quantityBadge}>
                        <Text style={styles.quantityBadgeText}>
                          Cantidad: {item.quantity}
                        </Text>
                      </View>
                      <View style={styles.priceBadge}>
                        <Text style={styles.priceBadgeText}>
                          {item.price || 0}
                        </Text>
                      </View>
                    </View>
                    {item.design && (
                      <Text style={styles.designText}>
                        🎨 Diseño: {item.design.name}
                      </Text>
                    )}
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Notas del Cliente */}
        {order?.clientNotes && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="document-text" size={20} color="#1F64BF" />
              <Text style={styles.sectionTitle}>Notas del Cliente</Text>
            </View>
            
            <View style={styles.notesCard}>
              <Text style={styles.notesText}>"{order.clientNotes}"</Text>
            </View>
          </View>
        )}
      </ScrollView>
    );
  };

  return (
    <Modal
      visible={open}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header del Modal */}
        <View style={styles.modalHeader}>
          <View style={styles.headerContent}>
            <Text style={styles.modalTitle}>Detalles de la Orden</Text>
            <Text style={styles.modalSubtitle}>#{order?.orderNumber}</Text>
          </View>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* Contenido */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#1F64BF" />
            <Text style={styles.loadingText}>Cargando detalles...</Text>
          </View>
        ) : (
          renderOrderInformation()
        )}

        {/* Footer */}
        <View style={styles.modalFooter}>
          <TouchableOpacity 
            style={[styles.button, styles.outlineButton]}
            onPress={onClose}
          >
            <Text style={[styles.buttonText, { color: '#1F64BF' }]}>Cerrar</Text>
          </TouchableOpacity>
        </View>

        {/* Modal de Cambio de Estado (Simplificado) */}
        <Modal
          visible={showStatusChange}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowStatusChange(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.statusModalContent}>
              <View style={styles.statusModalHeader}>
                <Text style={styles.statusModalTitle}>Cambiar Estado</Text>
                <TouchableOpacity onPress={() => setShowStatusChange(false)}>
                  <Ionicons name="close" size={24} color="#6B7280" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.statusInfo}>
                <Ionicons name="information-circle" size={20} color="#3B82F6" />
                <Text style={styles.statusInfoText}>
                  Estado actual: {order?.statusLabel}
                </Text>
              </View>
              
              <Text style={styles.statusLabel}>Seleccionar nuevo estado:</Text>
              
              <ScrollView style={styles.statusOptions}>
                {[
                  { value: 'pending_approval', label: 'Pendiente de Aprobación' },
                  { value: 'approved', label: 'Aprobado' },
                  { value: 'in_production', label: 'En Producción' },
                  { value: 'quality_check', label: 'Control de Calidad' },
                  { value: 'ready_for_delivery', label: 'Listo para Entrega' },
                  { value: 'delivered', label: 'Entregado' }
                ]
                .filter(status => status.value !== order?.status)
                .map((status) => (
                  <TouchableOpacity
                    key={status.value}
                    style={styles.statusOption}
                    onPress={() => {
                      Alert.alert(
                        'Cambiar Estado',
                        `¿Cambiar a "${status.label}"?`,
                        [
                          { text: 'Cancelar', style: 'cancel' },
                          { 
                            text: 'Confirmar', 
                            onPress: () => {
                              handleStatusChange();
                              setShowStatusChange(false);
                            }
                          }
                        ]
                      );
                    }}
                  >
                    <Text style={styles.statusOptionText}>{status.label}</Text>
                    <Ionicons name="chevron-forward" size={16} color="#6B7280" />
                  </TouchableOpacity>
                ))}
              </ScrollView>
              
              <View style={styles.statusModalActions}>
                <TouchableOpacity 
                  style={[styles.button, styles.secondaryButton]}
                  onPress={() => setShowStatusChange(false)}
                >
                  <Text style={styles.secondaryButtonText}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Modales adicionales (placeholders) */}
        <Modal
          visible={showPaymentDetails}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setShowPaymentDetails(false)}
        >
          <View style={styles.subModal}>
            <View style={styles.subModalHeader}>
              <Text style={styles.subModalTitle}>Detalles de Pago</Text>
              <TouchableOpacity onPress={() => setShowPaymentDetails(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            <View style={styles.subModalContent}>
              <Text style={styles.placeholderText}>
                Funcionalidad de pagos - Próximamente
              </Text>
            </View>
          </View>
        </Modal>

        <Modal
          visible={showTimeline}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setShowTimeline(false)}
        >
          <View style={styles.subModal}>
            <View style={styles.subModalHeader}>
              <Text style={styles.subModalTitle}>Timeline de la Orden</Text>
              <TouchableOpacity onPress={() => setShowTimeline(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            <View style={styles.subModalContent}>
              <Text style={styles.placeholderText}>
                Funcionalidad de timeline - Próximamente
              </Text>
            </View>
          </View>
        </Modal>

        <Modal
          visible={showQualityControl}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setShowQualityControl(false)}
        >
          <View style={styles.subModal}>
            <View style={styles.subModalHeader}>
              <Text style={styles.subModalTitle}>Control de Calidad</Text>
              <TouchableOpacity onPress={() => setShowQualityControl(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            <View style={styles.subModalContent}>
              <Text style={styles.placeholderText}>
                Funcionalidad de control de calidad - Próximamente
              </Text>
            </View>
          </View>
        </Modal>

        <Modal
          visible={showPhotoUpload}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setShowPhotoUpload(false)}
        >
          <View style={styles.subModal}>
            <View style={styles.subModalHeader}>
              <Text style={styles.subModalTitle}>Subir Foto de Producción</Text>
              <TouchableOpacity onPress={() => setShowPhotoUpload(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            <View style={styles.subModalContent}>
              <Text style={styles.placeholderText}>
                Funcionalidad de subida de fotos - Próximamente
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
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(31, 100, 191, 0.1)',
  },
  headerContent: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#010326',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '600',
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  orderTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  orderIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(31, 100, 191, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  orderTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#010326',
  },
  orderDate: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  actionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 80,
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: '#1F64BF',
  },
  infoButton: {
    backgroundColor: '#3B82F6',
  },
  successButton: {
    backgroundColor: '#10B981',
  },
  warningButton: {
    backgroundColor: '#F97316',
  },
  whatsappButton: {
    backgroundColor: '#25D366',
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#1F64BF',
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#010326',
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(31, 100, 191, 0.08)',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(31, 100, 191, 0.05)',
  },
  infoLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 14,
    color: '#010326',
    fontWeight: '600',
  },
  totalValue: {
    color: '#1F64BF',
    fontSize: 16,
  },
  emailValue: {
    fontSize: 12,
    textAlign: 'right',
  },
  manualBadge: {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  manualBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  ordersBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  ordersBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  deliveryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  deliveryPrimary: {
    backgroundColor: '#3B82F6',
  },
  deliverySecondary: {
    backgroundColor: '#F97316',
  },
  deliveryBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  addressContainer: {
    alignItems: 'flex-end',
  },
  addressText: {
    fontSize: 14,
    color: '#010326',
    fontWeight: '600',
    textAlign: 'right',
  },
  phoneText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  productsContainer: {
    gap: 12,
  },
  productItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(31, 100, 191, 0.08)',
  },
  productHeader: {
    flexDirection: 'row',
    gap: 12,
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#010326',
    marginBottom: 8,
  },
  productBadges: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  quantityBadge: {
    backgroundColor: 'rgba(31, 100, 191, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  quantityBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1F64BF',
  },
  priceBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  priceBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  designText: {
    fontSize: 12,
    color: '#6B7280',
  },
  notesCard: {
    backgroundColor: 'rgba(31, 100, 191, 0.04)',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#1F64BF',
  },
  notesText: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#374151',
    lineHeight: 20,
  },
  modalFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(31, 100, 191, 0.1)',
    alignItems: 'flex-end',
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#F3F4F6',
  },
  secondaryButtonText: {
    color: '#374151',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  statusModalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxHeight: '80%',
  },
  statusModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#010326',
  },
  statusInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  statusInfoText: {
    fontSize: 14,
    color: '#1E40AF',
    fontWeight: '600',
  },
  statusLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#010326',
    marginBottom: 12,
  },
  statusOptions: {
    maxHeight: 300,
  },
  statusOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(31, 100, 191, 0.1)',
  },
  statusOptionText: {
    fontSize: 14,
    color: '#010326',
    fontWeight: '500',
  },
  statusModalActions: {
    marginTop: 20,
    alignItems: 'flex-end',
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

export default OrderDetailsModal;