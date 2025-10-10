// src/screens/OrderScreen.js - VERSIÓN COMPLETA CON COMPONENTES
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  RefreshControl,
  FlatList,
  StyleSheet,
  StatusBar,
  SafeAreaView,
  Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Importar los componentes que acabamos de crear
import ManualOrderForm from '../components/Orders/ManualOrderForm';
import OrderDetailsModal from '../components/Orders/OrderDetailsModal';
import PaymentStatusPanel from '../components/Orders/PaymentStatusPanel';

const OrderScreen = () => {
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [orders, setOrders] = useState([]);
  
  // Estados para los modales
  const [showManualOrderModal, setShowManualOrderModal] = useState(false);
  const [showOrderDetailsModal, setShowOrderDetailsModal] = useState(false);
  const [showPaymentStatusModal, setShowPaymentStatusModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Datos de ejemplo mejorados
  const mockOrders = [
    {
      id: '1',
      _id: '1',
      orderNumber: 'ORD-001',
      customer: 'Juan Pérez',
      user: { name: 'Juan Pérez', email: 'juan@email.com', phone: '3001234567' },
      status: 'pending_approval',
      statusLabel: 'Pendiente Aprobación',
      total: 150.00,
      formattedTotal: '$150.00',
      deliveryType: 'delivery',
      deliveryLabel: 'Entrega a domicilio',
      deliveryAddress: {
        street: 'Calle 123 #45-67',
        city: 'Medellín',
        phone: '3001234567'
      },
      date: '15 Nov 2024',
      createdAt: '2024-11-15T10:00:00Z',
      quantity: 2,
      isManualOrder: false,
      items: [
        {
          product: { 
            name: 'Camiseta Básica',
            images: ['https://via.placeholder.com/300']
          },
          quantity: 2,
          price: 75.00,
          design: { name: 'Diseño Personalizado' }
        }
      ],
      clientNotes: 'Por favor entregar antes de las 5pm',
      payment: {
        method: 'cash',
        status: 'pending',
        businessRules: {
          cashPaymentAllowed: true,
          bankTransferAllowed: true,
          wompiPaymentAllowed: true
        }
      }
    },
    {
      id: '2',
      _id: '2', 
      orderNumber: 'ORD-002',
      customer: 'María García',
      user: { name: 'María García', email: 'maria@email.com', phone: '3009876543' },
      status: 'in_production',
      statusLabel: 'En Producción',
      total: 275.50,
      formattedTotal: '$275.50',
      deliveryType: 'pickup',
      deliveryLabel: 'Recoger en tienda',
      date: '14 Nov 2024',
      createdAt: '2024-11-14T14:30:00Z',
      quantity: 1,
      isManualOrder: true,
      items: [
        {
          product: { 
            name: 'Taza Personalizada',
            images: ['https://via.placeholder.com/300']
          },
          quantity: 1,
          price: 275.50,
          design: { name: 'Logo Empresarial' }
        }
      ],
      payment: {
        method: 'bank_transfer',
        status: 'processing',
        businessRules: {
          cashPaymentAllowed: true,
          bankTransferAllowed: true,
          wompiPaymentAllowed: false
        }
      }
    },
    {
      id: '3',
      _id: '3',
      orderNumber: 'ORD-003',
      customer: 'Carlos López',
      user: { name: 'Carlos López', email: 'carlos@email.com', phone: '3005556666' },
      status: 'ready_for_delivery',
      statusLabel: 'Listo para Entrega',
      total: 89.99,
      formattedTotal: '$89.99',
      deliveryType: 'delivery',
      deliveryLabel: 'Entrega express',
      deliveryAddress: {
        street: 'Carrera 80 #25-10',
        city: 'Bogotá',
        phone: '3005556666'
      },
      date: '13 Nov 2024',
      createdAt: '2024-11-13T09:15:00Z',
      quantity: 3,
      isManualOrder: false,
      items: [
        {
          product: { 
            name: 'Poster A3',
            images: ['https://via.placeholder.com/300']
          },
          quantity: 3,
          price: 29.99,
          design: { name: 'Arte Abstracto' }
        }
      ],
      payment: {
        method: 'wompi',
        status: 'completed',
        businessRules: {
          cashPaymentAllowed: true,
          bankTransferAllowed: false,
          wompiPaymentAllowed: true
        }
      }
    }
  ];

  // Datos de ejemplo para estadísticas
  const statsData = [
    {
      id: 'today-orders',
      title: "Órdenes de Hoy",
      value: 15,
      change: "+12% vs ayer",
      trend: "up",
      icon: "cube",
      variant: "primary"
    },
    {
      id: 'today-revenue',
      title: "Ingresos de Hoy",
      value: "$1,250",
      change: "1250",
      trend: "up",
      icon: "cash",
      variant: "secondary"
    },
    {
      id: 'in-production',
      title: "En Producción",
      value: 8,
      change: "8 órdenes activas",
      trend: "up",
      icon: "build",
      variant: "secondary"
    },
    {
      id: 'ready-delivery',
      title: "Listas para Entrega",
      value: 3,
      change: "Pendientes de envío",
      trend: "up",
      icon: "checkmark-done",
      variant: "secondary"
    }
  ];

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    try {
      // Simular carga de datos
      await new Promise(resolve => setTimeout(resolve, 1000));
      setOrders(mockOrders);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar las órdenes');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  };

  const handleViewOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowOrderDetailsModal(true);
  };

  const handleViewPaymentStatus = (order) => {
    setSelectedOrder(order);
    setShowPaymentStatusModal(true);
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      // Simular cambio de estado
      setOrders(prev => prev.map(order => 
        order.id === orderId 
          ? { 
              ...order, 
              status: newStatus,
              statusLabel: newStatus.replace('_', ' ').toUpperCase()
            } 
          : order
      ));
      
      Alert.alert('Éxito', `Estado cambiado a ${newStatus}`);
    } catch (error) {
      Alert.alert('Error', 'No se pudo cambiar el estado');
    }
  };

  const handleOrderCreated = (newOrder) => {
    Alert.alert('¡Éxito!', 'Pedido manual creado correctamente');
    // Recargar órdenes para mostrar la nueva
    loadOrders();
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

  // Renderizar tarjeta de estadística
  const renderStatCard = ({ item }) => (
    <TouchableOpacity 
      style={[
        styles.statCard,
        item.variant === 'primary' ? styles.statCardPrimary : styles.statCardSecondary
      ]}
    >
      <View style={styles.statHeader}>
        <View>
          <Text style={[
            styles.statValue,
            item.variant === 'primary' && styles.statValueColored
          ]}>
            {item.value}
          </Text>
          <Text style={[
            styles.statLabel,
            item.variant === 'primary' && styles.statLabelColored
          ]}>
            {item.title}
          </Text>
        </View>
        <View style={[
          styles.statIconContainer,
          item.variant === 'primary' && styles.statIconContainerColored
        ]}>
          <Ionicons name={item.icon} size={24} color={item.variant === 'primary' ? '#fff' : '#1F64BF'} />
        </View>
      </View>
      <View style={[
        styles.statChange,
        item.variant === 'primary' && styles.statChangeColored
      ]}>
        <Ionicons 
          name="trending-up" 
          size={12} 
          color={item.variant === 'primary' ? '#fff' : '#10B981'} 
        />
        <Text style={[
          styles.statTrendText,
          item.variant === 'primary' && styles.statTrendTextColored
        ]}>
          {item.change}
        </Text>
      </View>
    </TouchableOpacity>
  );

  // Renderizar item de orden
  const renderOrderItem = ({ item }) => {
    const statusColor = getStatusColor(item.status);
    
    return (
      <TouchableOpacity 
        style={styles.orderItem}
        onPress={() => handleViewOrderDetails(item)}
      >
        <View style={styles.orderHeader}>
          <View style={styles.orderNumberContainer}>
            <Text style={styles.orderNumber}># {item.orderNumber}</Text>
            {item.isManualOrder && (
              <View style={styles.manualBadge}>
                <Text style={styles.manualBadgeText}>Manual</Text>
              </View>
            )}
          </View>
          <TouchableOpacity 
            style={styles.orderMenuButton}
            onPress={() => handleViewOrderDetails(item)}
          >
            <Ionicons name="ellipsis-vertical" size={20} color="#032CA6" />
          </TouchableOpacity>
        </View>

        <View style={styles.orderDetails}>
          <View style={styles.orderDetailRow}>
            <Ionicons name="person" size={16} color="#032CA6" />
            <Text style={styles.orderDetailText}>
              {item.user?.name || 'Cliente no disponible'}
            </Text>
          </View>

          <View style={styles.orderDetailRow}>
            <View style={[
              styles.statusChip,
              { backgroundColor: statusColor.bg }
            ]}>
              <Text style={[
                styles.statusChipText,
                { color: statusColor.color }
              ]}>
                {item.statusLabel}
              </Text>
            </View>
          </View>

          <View style={styles.orderDetailRow}>
            <Text style={styles.orderTotal}>{item.formattedTotal}</Text>
          </View>

          <View style={styles.orderDetailRow}>
            {item.deliveryType === 'delivery' ? (
              <Ionicons name="car" size={16} color="#032CA6" />
            ) : (
              <Ionicons name="location" size={16} color="#032CA6" />
            )}
            <Text style={styles.orderDetailText}>{item.deliveryLabel}</Text>
          </View>

          <View style={styles.orderDetailRow}>
            <Ionicons name="calendar" size={16} color="#032CA6" />
            <Text style={styles.orderDetailText}>{item.date}</Text>
          </View>
        </View>

        <View style={styles.orderActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleViewOrderDetails(item)}
          >
            <Ionicons name="eye" size={18} color="#10b981" />
            <Text style={[styles.actionButtonText, { color: '#10b981' }]}>
              Ver detalles
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleViewPaymentStatus(item)}
          >
            <Ionicons name="card" size={18} color="#1F64BF" />
            <Text style={[styles.actionButtonText, { color: '#1F64BF' }]}>
              Pagos
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading && orders.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor="#1F64BF" barStyle="light-content" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1F64BF" />
          <Text style={styles.loadingText}>Cargando órdenes...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#1F64BF" barStyle="light-content" />
      
      {/* Header Principal */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerInfo}>
            <Text style={styles.mainTitle}>Gestión de Órdenes</Text>
            <Text style={styles.mainDescription}>
              Administra todos los pedidos y controla el flujo de producción
            </Text>
          </View>
          
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.primaryButton}
              onPress={() => setShowManualOrderModal(true)}
              disabled={loading}
            >
              <Ionicons name="add" size={18} color="#fff" />
              <Text style={styles.primaryButtonText}>Pedido Manual</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.secondaryButton}
              onPress={loadOrders}
              disabled={loading}
            >
              <Ionicons name="refresh" size={20} color="#1F64BF" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={['#1F64BF']}
            tintColor="#1F64BF"
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Estadísticas */}
        <View style={styles.statsSection}>
          <FlatList
            data={statsData}
            renderItem={renderStatCard}
            keyExtractor={item => item.id}
            numColumns={2}
            scrollEnabled={false}
            contentContainerStyle={styles.statsGrid}
          />
        </View>

        {/* Lista de Órdenes */}
        <View style={styles.ordersSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Órdenes Recientes</Text>
            <Text style={styles.ordersCount}>{orders.length} órdenes</Text>
          </View>

          {loading && orders.length > 0 && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="small" color="#1F64BF" />
              <Text style={styles.loadingOverlayText}>Actualizando órdenes...</Text>
            </View>
          )}

          {orders.length > 0 ? (
            <FlatList
              data={orders}
              renderItem={renderOrderItem}
              keyExtractor={item => item.id}
              scrollEnabled={false}
              contentContainerStyle={styles.ordersList}
            />
          ) : (
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Ionicons name="cube" size={32} color="#1F64BF" />
              </View>
              <Text style={styles.emptyTitle}>
                No hay órdenes registradas
              </Text>
              <Text style={styles.emptyDescription}>
                Comienza creando tu primera orden o pedido manual
              </Text>
              <TouchableOpacity 
                style={styles.emptyActionButton}
                onPress={() => setShowManualOrderModal(true)}
              >
                <Ionicons name="add" size={18} color="#fff" />
                <Text style={styles.emptyActionButtonText}>Crear Pedido Manual</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Modal de Pedido Manual */}
      <ManualOrderForm
        open={showManualOrderModal}
        onClose={() => setShowManualOrderModal(false)}
        onOrderCreated={handleOrderCreated}
      />

      {/* Modal de Detalles de Orden */}
      <OrderDetailsModal
        open={showOrderDetailsModal}
        onClose={() => {
          setShowOrderDetailsModal(false);
          setSelectedOrder(null);
        }}
        order={selectedOrder}
        onStatusChange={handleStatusChange}
      />

      {/* Modal de Estado de Pagos */}
      <Modal
        visible={showPaymentStatusModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => {
          setShowPaymentStatusModal(false);
          setSelectedOrder(null);
        }}
      >
        <View style={styles.paymentModal}>
          <View style={styles.paymentModalHeader}>
            <View style={styles.paymentModalTitle}>
              <Ionicons name="card" size={24} color="#1F64BF" />
              <Text style={styles.paymentModalTitleText}>
                Estado de Pagos - Orden #{selectedOrder?.orderNumber}
              </Text>
            </View>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => {
                setShowPaymentStatusModal(false);
                setSelectedOrder(null);
              }}
            >
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <View style={styles.paymentModalContent}>
            <PaymentStatusPanel
              orderId={selectedOrder?.id}
              paymentStatus={selectedOrder?.payment}
              onRefresh={loadOrders}
              compact={false}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

// ================ ESTILOS ACTUALIZADOS ================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#010326',
  },
  header: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(31, 100, 191, 0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerInfo: {
    flex: 1,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#010326',
    marginBottom: 4,
  },
  mainDescription: {
    fontSize: 14,
    color: '#032CA6',
    fontWeight: '600',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#1F64BF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    minWidth: 140,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  secondaryButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(31, 100, 191, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  statsSection: {
    padding: 16,
  },
  statsGrid: {
    gap: 12,
  },
  statCard: {
    flex: 1,
    minHeight: 140,
    padding: 20,
    borderRadius: 16,
    margin: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statCardPrimary: {
    backgroundColor: '#1F64BF',
  },
  statCardSecondary: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: 'rgba(31, 100, 191, 0.08)',
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#010326',
    marginBottom: 4,
  },
  statValueColored: {
    color: 'white',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    opacity: 0.7,
    color: '#032CA6',
  },
  statLabelColored: {
    color: 'white',
    opacity: 0.9,
  },
  statIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(31, 100, 191, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statIconContainerColored: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  statChange: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    alignSelf: 'flex-start',
  },
  statChangeColored: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  statTrendText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10B981',
  },
  statTrendTextColored: {
    color: 'white',
  },
  ordersSection: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#010326',
  },
  ordersCount: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '600',
  },
  loadingOverlay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: 'rgba(31, 100, 191, 0.04)',
    borderRadius: 8,
    gap: 8,
    marginBottom: 12,
  },
  loadingOverlayText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1F64BF',
  },
  ordersList: {
    gap: 12,
  },
  orderItem: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(31, 100, 191, 0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderNumberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#010326',
  },
  manualBadge: {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  manualBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#8b5cf6',
  },
  orderMenuButton: {
    padding: 4,
  },
  orderDetails: {
    gap: 8,
  },
  orderDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  orderDetailText: {
    fontSize: 14,
    color: '#010326',
  },
  statusChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  orderTotal: {
    fontSize: 14,
    fontWeight: '600',
    color: '#010326',
  },
  orderActions: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(31, 100, 191, 0.1)',
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(31, 100, 191, 0.05)',
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
    gap: 16,
    backgroundColor: 'white',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(31, 100, 191, 0.08)',
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(31, 100, 191, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#010326',
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 14,
    color: '#032CA6',
    textAlign: 'center',
    maxWidth: 300,
  },
  emptyActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#1F64BF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyActionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  paymentModal: {
    flex: 1,
    backgroundColor: 'white',
  },
  paymentModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(31, 100, 191, 0.1)',
  },
  paymentModalTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  paymentModalTitleText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#010326',
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  paymentModalContent: {
    flex: 1,
    padding: 16,
  },
});

export default OrderScreen;