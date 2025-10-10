// src/components/Payments/PaymentStatusPanel.js - Versión React Native
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  ActivityIndicator,
  StyleSheet,
  Linking,
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// ================ COMPONENTE PRINCIPAL ================
const PaymentStatusPanel = ({ orderId, paymentStatus, onRefresh, compact = true }) => {
  // ✅ DEBUG: Log para ver qué datos está recibiendo
  console.log('🔍 [PaymentStatusPanel] Props recibidas:', {
    orderId,
    paymentStatus,
    compact
  });
  
  // ✅ DEBUG: Log detallado de la estructura de paymentStatus
  console.log('🔍 [PaymentStatusPanel] Estructura de paymentStatus:', {
    hasPayments: paymentStatus?.payments,
    paymentsLength: paymentStatus?.payments?.length,
    paymentKeys: paymentStatus ? Object.keys(paymentStatus) : 'null',
    fullPaymentStatus: paymentStatus
  });

  const [showProcessDialog, setShowProcessDialog] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [confirmationData, setConfirmationData] = useState({
    receivedAmount: '',
    notes: '',
    isApproved: true
  });
  const [newPaymentData, setNewPaymentData] = useState({
    method: 'cash',
    amount: '',
    timing: 'on_delivery',
    notes: ''
  });
  const [refreshing, setRefreshing] = useState(false);

  // Obtener icono por método de pago
  const getPaymentMethodIcon = (method) => {
    const icons = {
      wompi: 'card',
      cash: 'cash',
      bank_transfer: 'business'
    };
    return icons[method] || 'receipt';
  };

  // Formatear método de pago para display
  const formatPaymentMethod = (method) => {
    const labels = {
      wompi: 'Tarjeta/Wompi',
      cash: 'Efectivo',
      bank_transfer: 'Transferencia'
    };
    return labels[method] || method;
  };

  // Obtener color por estado de pago
  const getStatusColor = (status) => {
    const colors = {
      pending: { bg: '#fef3c7', color: '#92400e' },
      processing: { bg: '#e0e7ff', color: '#3730a3' },
      completed: { bg: '#dcfce7', color: '#166534' },
      failed: { bg: '#fee2e2', color: '#991b1b' },
      cancelled: { bg: '#f3f4f6', color: '#374151' }
    };
    return colors[status] || colors.pending;
  };

  // Manejar refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await onRefresh?.();
    setRefreshing(false);
  };

  // Manejar procesamiento de nuevo pago
  const handleProcessPayment = async () => {
    try {
      // ✅ VALIDACIÓN DE NEGOCIO: Verificar restricciones antes de procesar
      if (newPaymentData.method === 'cash' && !paymentStatus?.payment?.businessRules?.cashPaymentAllowed) {
        Alert.alert(
          'Pago en efectivo no permitido',
          'Los pagos en efectivo solo se pueden procesar cuando la orden está "Listo para entrega", "En Camino" o "Entregado"',
          [{ text: 'Entendido' }]
        );
        return;
      }

      if (newPaymentData.method === 'bank_transfer' && !paymentStatus?.payment?.businessRules?.bankTransferAllowed) {
        Alert.alert(
          'Transferencia bancaria no permitida',
          'Las transferencias bancarias solo se pueden procesar en estados iniciales o cuando esté "Listo para entrega"',
          [{ text: 'Entendido' }]
        );
        return;
      }

      if (newPaymentData.method === 'wompi' && !paymentStatus?.payment?.businessRules?.wompiPaymentAllowed) {
        Alert.alert(
          'Pago con tarjeta no permitido',
          'Los pagos con tarjeta solo se pueden procesar en estados iniciales o cuando esté "Listo para entrega"',
          [{ text: 'Entendido' }]
        );
        return;
      }

      // Aquí iría la llamada a tu API
      // await processPayment(orderId, newPaymentData);
      
      setShowProcessDialog(false);
      setNewPaymentData({
        method: 'cash',
        amount: '',
        timing: 'on_delivery',
        notes: ''
      });
      onRefresh?.();
    } catch (error) {
      console.error('Error procesando pago:', error);
      Alert.alert('Error', 'No se pudo procesar el pago');
    }
  };

  // Manejar confirmación de pago
  const handleConfirmPayment = async () => {
    try {
      if (!confirmationData.receivedAmount) {
        Alert.alert('Error', 'El monto recibido es requerido');
        return;
      }

      // Aquí iría la llamada a tu API
      // await confirmPayment(selectedPayment._id, confirmationData);
      
      setShowConfirmDialog(false);
      setSelectedPayment(null);
      setConfirmationData({
        receivedAmount: '',
        notes: '',
        isApproved: true
      });
      onRefresh?.();
    } catch (error) {
      console.error('Error confirmando pago:', error);
      Alert.alert('Error', 'No se pudo confirmar el pago');
    }
  };

  // Manejar aprobación de transferencia
  const handleApproveTransfer = async (paymentId) => {
    Alert.alert(
      'Aprobar Transferencia',
      '¿Estás seguro de que quieres aprobar esta transferencia?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Aprobar',
          onPress: async () => {
            try {
              // Aquí iría la llamada a tu API
              // await approveTransfer(paymentId, { isApproved: true, verificationNotes: 'Transferencia verificada y aprobada' });
              onRefresh?.();
              Alert.alert('Éxito', 'Transferencia aprobada correctamente');
            } catch (error) {
              console.error('Error aprobando transferencia:', error);
              Alert.alert('Error', 'No se pudo aprobar la transferencia');
            }
          }
        }
      ]
    );
  };

  // Manejar rechazo de transferencia
  const handleRejectTransfer = async (paymentId) => {
    Alert.prompt(
      'Motivo del rechazo',
      'Explica por qué se rechaza la transferencia:',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Rechazar',
          onPress: async (reason) => {
            if (reason) {
              try {
                // Aquí iría la llamada a tu API
                // await rejectTransfer(paymentId, reason);
                onRefresh?.();
                Alert.alert('Éxito', 'Transferencia rechazada correctamente');
              } catch (error) {
                console.error('Error rechazando transferencia:', error);
                Alert.alert('Error', 'No se pudo rechazar la transferencia');
              }
            }
          }
        }
      ],
      'plain-text'
    );
  };

  // Renderizar pago individual
  const renderPayment = (payment, index) => {
    const statusColor = getStatusColor(payment.status);
    const paymentIcon = getPaymentMethodIcon(payment.method);
    
    return (
      <View key={payment._id || index} style={styles.paymentCard}>
        <View style={styles.paymentHeader}>
          <View style={styles.paymentIconContainer}>
            <Ionicons name={paymentIcon} size={20} color="#1F64BF" />
          </View>
          
          <View style={styles.paymentInfo}>
            <Text style={styles.paymentMethod}>
              {formatPaymentMethod(payment.method)}
            </Text>
            <Text style={styles.paymentDetails}>
              {payment.formattedAmount} • {payment.timing === 'advance' ? 'Adelantado' : 'Contra entrega'}
            </Text>
            {payment.percentage < 100 && (
              <Text style={styles.paymentDetails}>
                Pago parcial: {payment.percentage}%
              </Text>
            )}
          </View>
          
          <View style={[styles.statusBadge, { backgroundColor: statusColor.bg }]}>
            <Text style={[styles.statusText, { color: statusColor.color }]}>
              {payment.statusLabel}
            </Text>
          </View>
        </View>

        {/* Acciones del pago */}
        <View style={styles.paymentActions}>
          {payment.canBeProcessed && payment.method === 'cash' && (
            <TouchableOpacity
              style={[styles.actionButton, styles.successButton]}
              onPress={() => {
                setSelectedPayment(payment);
                setConfirmationData({
                  ...confirmationData,
                  receivedAmount: payment.amount.toString()
                });
                setShowConfirmDialog(true);
              }}
            >
              <Ionicons name="checkmark" size={14} color="white" />
              <Text style={styles.actionButtonText}>Confirmar</Text>
            </TouchableOpacity>
          )}
          
          {payment.canBeProcessed && payment.method === 'bank_transfer' && (
            <>
              <TouchableOpacity
                style={[styles.actionButton, styles.successButton]}
                onPress={() => handleApproveTransfer(payment._id)}
              >
                <Ionicons name="checkmark" size={14} color="white" />
                <Text style={styles.actionButtonText}>Aprobar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.dangerButton]}
                onPress={() => handleRejectTransfer(payment._id)}
              >
                <Ionicons name="close" size={14} color="white" />
                <Text style={styles.actionButtonText}>Rechazar</Text>
              </TouchableOpacity>
            </>
          )}
          
          {payment.method === 'wompi' && payment.paymentUrl && (
            <TouchableOpacity
              style={[styles.actionButton, styles.outlineButton]}
              onPress={() => Linking.openURL(payment.paymentUrl)}
            >
              <Ionicons name="open" size={14} color="#1F64BF" />
              <Text style={[styles.actionButtonText, { color: '#1F64BF' }]}>Ver Link</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Notas del pago */}
        {payment.notes && (
          <View style={styles.notesContainer}>
            <Text style={styles.notesText}>"{payment.notes}"</Text>
          </View>
        )}

        {/* Detalles de transferencia bancaria */}
        {payment.method === 'bank_transfer' && payment.transferDetails && (
          <View style={styles.detailsContainer}>
            <Text style={styles.detailsTitle}>Detalles de la transferencia</Text>
            <View style={styles.detailsGrid}>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Banco:</Text>
                <Text style={styles.detailValue}>{payment.transferDetails.bankName || 'N/A'}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Referencia:</Text>
                <Text style={styles.detailValue}>{payment.transferDetails.referenceNumber || 'N/A'}</Text>
              </View>
              {payment.transferDetails.proofUrl && (
                <TouchableOpacity
                  style={[styles.actionButton, styles.outlineButton]}
                  onPress={() => Linking.openURL(payment.transferDetails.proofUrl)}
                >
                  <Ionicons name="download" size={14} color="#1F64BF" />
                  <Text style={[styles.actionButtonText, { color: '#1F64BF' }]}>Ver comprobante</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {/* Detalles de pago con tarjeta */}
        {payment.method === 'wompi' && payment.wompiDetails && (
          <View style={styles.detailsContainer}>
            <View style={styles.detailsGrid}>
              {payment.wompiDetails.transactionId && (
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>ID Transacción:</Text>
                  <Text style={styles.detailValue}>{payment.wompiDetails.transactionId}</Text>
                </View>
              )}
              {payment.wompiDetails.cardInfo && (
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Tarjeta:</Text>
                  <Text style={styles.detailValue}>
                    **** {payment.wompiDetails.cardInfo.lastFour} ({payment.wompiDetails.cardInfo.brand})
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}
      </View>
    );
  };

  // Si no hay información de pagos
  if (!paymentStatus && !compact) {
    return (
      <View style={styles.emptyCard}>
        <Ionicons name="receipt" size={48} color="#6b7280" />
        <Text style={styles.emptyTitle}>No hay información de pagos</Text>
        <Text style={styles.emptyDescription}>
          Aún no se han procesado pagos para esta orden
        </Text>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => setShowProcessDialog(true)}
        >
          <Ionicons name="add" size={16} color="white" />
          <Text style={styles.primaryButtonText}>Procesar Pago</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Estado de Pagos</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.iconButton} onPress={handleRefresh}>
            <Ionicons name="refresh" size={16} color="#1F64BF" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.primaryButtonSmall}
            onPress={() => setShowProcessDialog(true)}
          >
            <Ionicons name="add" size={14} color="white" />
            <Text style={styles.primaryButtonText}>Nuevo Pago</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Resumen general */}
      {paymentStatus && (
        <View style={styles.summaryCard}>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Total de la orden:</Text>
              <Text style={styles.summaryValue}>
                ${paymentStatus.orderTotal?.toFixed(2) || '0.00'}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Total pagado:</Text>
              <Text style={[styles.summaryValue, { color: '#22c55e' }]}>
                ${paymentStatus.totalPaid?.toFixed(2) || '0.00'}
              </Text>
            </View>
          </View>

          {paymentStatus.remainingAmount > 0 && (
            <View style={styles.warningAlert}>
              <Ionicons name="warning" size={16} color="#92400e" />
              <Text style={styles.warningText}>
                Faltan ${paymentStatus.remainingAmount.toFixed(2)} por pagar
              </Text>
            </View>
          )}

          {paymentStatus.isFullyPaid && (
            <View style={styles.successAlert}>
              <Ionicons name="checkmark-circle" size={16} color="#166534" />
              <Text style={styles.successText}>Orden completamente pagada</Text>
            </View>
          )}

          {/* Restricciones de negocio */}
          {paymentStatus.payment?.statusInfo && (
            <View style={styles.restrictionsSection}>
              <Text style={styles.restrictionsTitle}>Restricciones de Pago por Estado</Text>
              <View style={styles.restrictionsGrid}>
                <View style={[
                  styles.restrictionCard,
                  { 
                    backgroundColor: paymentStatus.payment.businessRules?.cashPaymentAllowed ? '#dcfce7' : '#fee2e2',
                    borderColor: paymentStatus.payment.businessRules?.cashPaymentAllowed ? '#22c55e' : '#ef4444'
                  }
                ]}>
                  <View style={styles.restrictionHeader}>
                    <Ionicons 
                      name="cash" 
                      size={16} 
                      color={paymentStatus.payment.businessRules?.cashPaymentAllowed ? '#22c55e' : '#ef4444'} 
                    />
                    <Text style={styles.restrictionMethod}>Efectivo</Text>
                  </View>
                  <Text style={styles.restrictionDescription}>
                    {paymentStatus.payment.statusInfo.paymentMethodRestrictions.cash}
                  </Text>
                </View>

                <View style={[
                  styles.restrictionCard,
                  { 
                    backgroundColor: paymentStatus.payment.businessRules?.bankTransferAllowed ? '#dcfce7' : '#fee2e2',
                    borderColor: paymentStatus.payment.businessRules?.bankTransferAllowed ? '#22c55e' : '#ef4444'
                  }
                ]}>
                  <View style={styles.restrictionHeader}>
                    <Ionicons 
                      name="business" 
                      size={16} 
                      color={paymentStatus.payment.businessRules?.bankTransferAllowed ? '#22c55e' : '#ef4444'} 
                    />
                    <Text style={styles.restrictionMethod}>Transferencia</Text>
                  </View>
                  <Text style={styles.restrictionDescription}>
                    {paymentStatus.payment.statusInfo.paymentMethodRestrictions.bank_transfer}
                  </Text>
                </View>

                <View style={[
                  styles.restrictionCard,
                  { 
                    backgroundColor: paymentStatus.payment.businessRules?.wompiPaymentAllowed ? '#dcfce7' : '#fee2e2',
                    borderColor: paymentStatus.payment.businessRules?.wompiPaymentAllowed ? '#22c55e' : '#ef4444'
                  }
                ]}>
                  <View style={styles.restrictionHeader}>
                    <Ionicons 
                      name="card" 
                      size={16} 
                      color={paymentStatus.payment.businessRules?.wompiPaymentAllowed ? '#22c55e' : '#ef4444'} 
                    />
                    <Text style={styles.restrictionMethod}>Tarjeta</Text>
                  </View>
                  <Text style={styles.restrictionDescription}>
                    {paymentStatus.payment.statusInfo.paymentMethodRestrictions.wompi}
                  </Text>
                </View>
              </View>
            </View>
          )}
        </View>
      )}

      {/* Lista de pagos */}
      <ScrollView 
        style={styles.paymentsList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {paymentStatus?.payments?.map((payment, index) => renderPayment(payment, index))}
      </ScrollView>

      {/* Modal para procesar nuevo pago */}
      <Modal
        visible={showProcessDialog}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowProcessDialog(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Procesar Nuevo Pago</Text>
            
            {/* Alertas de restricciones */}
            {paymentStatus?.payment?.statusInfo && (
              <View style={styles.infoAlert}>
                <Ionicons name="information-circle" size={16} color="#1F64BF" />
                <View style={styles.alertContent}>
                  <Text style={styles.alertTitle}>
                    Estado actual: {paymentStatus.payment.statusInfo.statusLabel}
                  </Text>
                  <Text style={styles.alertText}>
                    Solo se pueden procesar pagos según el estado de la orden
                  </Text>
                </View>
              </View>
            )}

            <View style={styles.formContainer}>
              <View style={styles.inputRow}>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Método de pago</Text>
                  <View style={styles.pickerContainer}>
                    <Text style={styles.pickerText}>
                      {formatPaymentMethod(newPaymentData.method)}
                      {!paymentStatus?.payment?.businessRules?.[`${newPaymentData.method}PaymentAllowed`] && ' (No permitido)'}
                    </Text>
                  </View>
                  <View style={styles.pickerOptions}>
                    {['cash', 'bank_transfer', 'wompi'].map(method => (
                      <TouchableOpacity
                        key={method}
                        style={[
                          styles.pickerOption,
                          newPaymentData.method === method && styles.pickerOptionSelected,
                          !paymentStatus?.payment?.businessRules?.[`${method}PaymentAllowed`] && styles.pickerOptionDisabled
                        ]}
                        onPress={() => {
                          if (paymentStatus?.payment?.businessRules?.[`${method}PaymentAllowed`]) {
                            setNewPaymentData(prev => ({ ...prev, method }))
                          }
                        }}
                        disabled={!paymentStatus?.payment?.businessRules?.[`${method}PaymentAllowed`]}
                      >
                        <Text style={[
                          styles.pickerOptionText,
                          newPaymentData.method === method && styles.pickerOptionTextSelected,
                          !paymentStatus?.payment?.businessRules?.[`${method}PaymentAllowed`] && styles.pickerOptionTextDisabled
                        ]}>
                          {formatPaymentMethod(method)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Timing</Text>
                  <View style={styles.pickerOptions}>
                    <TouchableOpacity
                      style={[
                        styles.pickerOption,
                        newPaymentData.timing === 'on_delivery' && styles.pickerOptionSelected
                      ]}
                      onPress={() => setNewPaymentData(prev => ({ ...prev, timing: 'on_delivery' }))}
                    >
                      <Text style={[
                        styles.pickerOptionText,
                        newPaymentData.timing === 'on_delivery' && styles.pickerOptionTextSelected
                      ]}>
                        Contra entrega
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.pickerOption,
                        newPaymentData.timing === 'advance' && styles.pickerOptionSelected
                      ]}
                      onPress={() => setNewPaymentData(prev => ({ ...prev, timing: 'advance' }))}
                    >
                      <Text style={[
                        styles.pickerOptionText,
                        newPaymentData.timing === 'advance' && styles.pickerOptionTextSelected
                      ]}>
                        Adelantado
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Monto (opcional)</Text>
                <TextInput
                  style={styles.textInput}
                  value={newPaymentData.amount}
                  onChangeText={(text) => setNewPaymentData(prev => ({ ...prev, amount: text }))}
                  placeholder="Dejar vacío para usar el total de la orden"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Notas adicionales</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  value={newPaymentData.notes}
                  onChangeText={(text) => setNewPaymentData(prev => ({ ...prev, notes: text }))}
                  placeholder="Instrucciones especiales o comentarios..."
                  multiline
                  numberOfLines={3}
                />
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.button, styles.secondaryButton]}
                onPress={() => setShowProcessDialog(false)}
              >
                <Text style={styles.secondaryButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.primaryButton]}
                onPress={handleProcessPayment}
              >
                <Text style={styles.primaryButtonText}>Procesar Pago</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal para confirmar pago en efectivo */}
      <Modal
        visible={showConfirmDialog}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowConfirmDialog(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirmar Pago en Efectivo</Text>

            <View style={styles.formContainer}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Monto recibido *</Text>
                <TextInput
                  style={styles.textInput}
                  value={confirmationData.receivedAmount}
                  onChangeText={(text) => setConfirmationData(prev => ({ ...prev, receivedAmount: text }))}
                  placeholder="Ingrese el monto recibido"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Notas de confirmación</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  value={confirmationData.notes}
                  onChangeText={(text) => setConfirmationData(prev => ({ ...prev, notes: text }))}
                  placeholder="Detalles del pago, cambio entregado, etc..."
                  multiline
                  numberOfLines={3}
                />
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.button, styles.secondaryButton]}
                onPress={() => setShowConfirmDialog(false)}
              >
                <Text style={styles.secondaryButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.primaryButton, !confirmationData.receivedAmount && styles.buttonDisabled]}
                onPress={handleConfirmPayment}
                disabled={!confirmationData.receivedAmount}
              >
                <Text style={styles.primaryButtonText}>Confirmar Pago</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
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
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(31, 100, 191, 0.1)',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#010326',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(31, 100, 191, 0.1)',
  },
  primaryButtonSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#1F64BF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#1F64BF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  summaryCard: {
    backgroundColor: 'white',
    padding: 16,
    margin: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(31, 100, 191, 0.08)',
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryItem: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F64BF',
  },
  warningAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fef3c7',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#f59e0b',
    marginBottom: 8,
  },
  warningText: {
    color: '#92400e',
    fontSize: 14,
    fontWeight: '500',
  },
  successAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#dcfce7',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#22c55e',
  },
  successText: {
    color: '#166534',
    fontSize: 14,
    fontWeight: '500',
  },
  restrictionsSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(31, 100, 191, 0.1)',
  },
  restrictionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#010326',
    marginBottom: 12,
  },
  restrictionsGrid: {
    gap: 12,
  },
  restrictionCard: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  restrictionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  restrictionMethod: {
    fontSize: 14,
    fontWeight: '600',
    color: '#010326',
  },
  restrictionDescription: {
    fontSize: 12,
    color: '#64748b',
  },
  paymentsList: {
    flex: 1,
  },
  paymentCard: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(31, 100, 191, 0.08)',
  },
  paymentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  paymentIconContainer: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(31, 100, 191, 0.1)',
    marginRight: 12,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentMethod: {
    fontSize: 16,
    fontWeight: '600',
    color: '#010326',
    marginBottom: 2,
  },
  paymentDetails: {
    fontSize: 14,
    color: '#64748b',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  paymentActions: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  successButton: {
    backgroundColor: '#22c55e',
  },
  dangerButton: {
    backgroundColor: '#ef4444',
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
  notesContainer: {
    backgroundColor: 'rgba(31, 100, 191, 0.05)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  notesText: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#64748b',
  },
  detailsContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(31, 100, 191, 0.1)',
  },
  detailsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#010326',
    marginBottom: 8,
  },
  detailsGrid: {
    gap: 8,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  detailValue: {
    fontSize: 14,
    color: '#010326',
    fontWeight: '500',
  },
  emptyCard: {
    backgroundColor: 'white',
    padding: 32,
    margin: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(31, 100, 191, 0.08)',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#010326',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 24,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#010326',
    marginBottom: 16,
  },
  infoAlert: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: 'rgba(31, 100, 191, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F64BF',
    marginBottom: 4,
  },
  alertText: {
    fontSize: 12,
    color: '#64748b',
  },
  formContainer: {
    gap: 16,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  inputContainer: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#010326',
    marginBottom: 8,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  pickerText: {
    fontSize: 14,
    color: '#010326',
  },
  pickerOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  pickerOption: {
    flex: 1,
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#d1d5db',
    alignItems: 'center',
  },
  pickerOptionSelected: {
    backgroundColor: '#1F64BF',
    borderColor: '#1F64BF',
  },
  pickerOptionDisabled: {
    backgroundColor: '#f3f4f6',
    borderColor: '#d1d5db',
  },
  pickerOptionText: {
    fontSize: 12,
    color: '#010326',
    fontWeight: '500',
  },
  pickerOptionTextSelected: {
    color: 'white',
  },
  pickerOptionTextDisabled: {
    color: '#9ca3af',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#010326',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 24,
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: '#f3f4f6',
  },
  secondaryButtonText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '600',
  },
  buttonDisabled: {
    backgroundColor: '#9ca3af',
  },
});

export default PaymentStatusPanel;