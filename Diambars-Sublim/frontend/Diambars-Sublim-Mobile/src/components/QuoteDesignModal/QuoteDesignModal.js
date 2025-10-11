// src/components/QuoteDesignModal/QuoteDesignModal.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
  Dimensions,
  Alert,
  ActivityIndicator
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ================ COMPONENTE PRINCIPAL ================
const QuoteDesignModal = ({
  visible,
  onClose,
  onSubmitQuote,
  design,
  loading: externalLoading = false
}) => {
  // ==================== ESTADOS ====================
  const [loading, setLoading] = useState(false);
  const [quoteData, setQuoteData] = useState({
    price: '',
    productionDays: '3',
    adminNotes: '',
    complexity: 'medium'
  });
  const [errors, setErrors] = useState({});
  const [priceBreakdown, setPriceBreakdown] = useState({
    basePrice: 0,
    designComplexity: 0,
    materials: 0,
    labor: 0,
    total: 0
  });

  // ==================== EFECTOS ====================
  useEffect(() => {
    if (design && visible) {
      // Calcular precio base sugerido
      const basePrice = design.basePrice || design.product?.basePrice || 0;
      const complexityMultiplier = {
        'low': 1.2,
        'medium': 1.5,
        'high': 2.0
      }[design.complexity] || 1.5;
      
      const elementsCount = design.elementsCount || 0;
      const elementsCost = elementsCount * 5; // $5 por elemento adicional
      
      const suggestedPrice = Math.round((basePrice * complexityMultiplier + elementsCost) * 100) / 100;
      
      setQuoteData({
        price: suggestedPrice.toString(),
        productionDays: design.complexity === 'high' ? '5' : design.complexity === 'medium' ? '3' : '2',
        adminNotes: '',
        complexity: design.complexity || 'medium'
      });

      setPriceBreakdown({
        basePrice: basePrice,
        designComplexity: Math.round((basePrice * (complexityMultiplier - 1)) * 100) / 100,
        materials: elementsCost,
        labor: Math.round((basePrice * 0.3) * 100) / 100,
        total: suggestedPrice
      });
    }
  }, [design, visible]);

  // Recalcular cuando cambie el precio
  useEffect(() => {
    const price = parseFloat(quoteData.price) || 0;
    if (price > 0 && design) {
      const basePrice = design.basePrice || design.product?.basePrice || 0;
      const remaining = price - basePrice;
      
      setPriceBreakdown({
        basePrice: basePrice,
        designComplexity: Math.round((remaining * 0.4) * 100) / 100,
        materials: Math.round((remaining * 0.3) * 100) / 100,
        labor: Math.round((remaining * 0.3) * 100) / 100,
        total: price
      });
    }
  }, [quoteData.price, design]);

  // ==================== VALIDACIONES ====================
  const validateForm = () => {
    const newErrors = {};
    
    if (!quoteData.price || parseFloat(quoteData.price) <= 0) {
      newErrors.price = 'El precio debe ser mayor que 0';
    }
    
    if (!quoteData.productionDays || parseInt(quoteData.productionDays) < 1) {
      newErrors.productionDays = 'Los días de producción deben ser al menos 1';
    }
    
    if (parseInt(quoteData.productionDays) > 30) {
      newErrors.productionDays = 'Los días de producción no pueden exceder 30';
    }
    
    setErrors(newErrors);
    
    // Mostrar errores si hay validaciones fallidas
    if (Object.keys(newErrors).length > 0) {
      const errorMessages = Object.values(newErrors).join('\n');
      Alert.alert(
        '⚠️ Datos Inválidos',
        errorMessages,
        [{ text: 'Entendido', style: 'default' }]
      );
      return false;
    }
    
    return true;
  };

  // ==================== MANEJADORES ====================
  const handleInputChange = (field, value) => {
    setQuoteData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpiar error del campo
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      
      const finalQuoteData = {
        price: parseFloat(quoteData.price),
        productionDays: parseInt(quoteData.productionDays),
        adminNotes: quoteData.adminNotes.trim()
      };
      
      await onSubmitQuote(finalQuoteData);
    } catch (error) {
      console.error('Error submitting quote:', error);
      Alert.alert(
        '❌ Error al Enviar Cotización',
        error.message || 'No se pudo enviar la cotización. Inténtalo de nuevo.',
        [{ text: 'Entendido', style: 'cancel' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading && !externalLoading) {
      onClose();
    }
  };

  const addToPrice = (amount) => {
    const currentPrice = parseFloat(quoteData.price) || 0;
    const newPrice = currentPrice + amount;
    handleInputChange('price', newPrice.toFixed(2));
  };

  // ==================== DATOS CALCULADOS ====================
  const formattedPrice = quoteData.price ? 
    new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD'
    }).format(parseFloat(quoteData.price)) : '$0.00';

  const getComplexityColor = (complexity) => {
    const colors = {
      'low': { color: '#10B981', bg: 'rgba(16, 185, 129, 0.1)' },
      'medium': { color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.1)' },
      'high': { color: '#EF4444', bg: 'rgba(239, 68, 68, 0.1)' }
    };
    return colors[complexity] || colors['medium'];
  };

  // ==================== RENDER ====================
  if (!design) return null;

  const complexityColor = getComplexityColor(design.complexity);
  const isLoading = loading || externalLoading;

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
          <View style={styles.modalHeader}>
            <View style={styles.headerContent}>
              <Icon name="cash" size={24} color="white" />
              <Text style={styles.headerTitle}>Cotizar Diseño</Text>
            </View>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={handleClose}
              disabled={isLoading}
            >
              <Icon name="close" size={20} color="white" />
            </TouchableOpacity>
          </View>

          <ScrollView 
            style={styles.modalContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Información del diseño */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionTitle}>
                <Icon name="palette" size={16} color="#010326" />
                <Text style={styles.sectionTitleText}>Información del diseño</Text>
              </View>
              
              <View style={styles.infoGrid}>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Nombre</Text>
                  <Text style={styles.infoValue}>{design.name}</Text>
                </View>
                
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Cliente</Text>
                  <Text style={styles.infoValue}>{design.clientName}</Text>
                </View>
                
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Producto</Text>
                  <Text style={styles.infoValue}>{design.productName}</Text>
                </View>
                
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Elementos</Text>
                  <Text style={styles.infoValue}>
                    {design.elementsCount} elemento{design.elementsCount !== 1 ? 's' : ''}
                  </Text>
                </View>
              </View>

              <View style={styles.complexityContainer}>
                <Text style={styles.infoLabel}>Complejidad:</Text>
                <View style={[
                  styles.complexityChip,
                  { backgroundColor: complexityColor.bg }
                ]}>
                  <Text style={[styles.complexityText, { color: complexityColor.color }]}>
                    {design.complexity}
                  </Text>
                </View>
              </View>

              {design.clientNotes && (
                <View style={styles.notesContainer}>
                  <Text style={styles.infoLabel}>Notas del cliente:</Text>
                  <View style={styles.notesBox}>
                    <Text style={styles.notesText}>"{design.clientNotes}"</Text>
                  </View>
                </View>
              )}
            </View>

            {/* Calculadora de precio */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionTitle}>
                <Icon name="calculator" size={16} color="#010326" />
                <Text style={styles.sectionTitleText}>Cotización</Text>
              </View>

              <View style={styles.calculatorSection}>
                <Text style={styles.calculatorTitle}>💡 Calculadora rápida de precios</Text>
                
                <View style={styles.priceButtonsContainer}>
                  <TouchableOpacity 
                    style={styles.priceButton}
                    onPress={() => addToPrice(5)}
                  >
                    <Text style={styles.priceButtonText}>+$5</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.priceButton}
                    onPress={() => addToPrice(10)}
                  >
                    <Text style={styles.priceButtonText}>+$10</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.priceButton}
                    onPress={() => addToPrice(25)}
                  >
                    <Text style={styles.priceButtonText}>+$25</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.priceButton}
                    onPress={() => addToPrice(50)}
                  >
                    <Text style={styles.priceButtonText}>+$50</Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.breakdownText}>
                  Desglose estimado: Base ${priceBreakdown.basePrice} + Diseño ${priceBreakdown.designComplexity} + Materiales ${priceBreakdown.materials} + Mano de obra ${priceBreakdown.labor}
                </Text>
              </View>

              <View style={styles.inputsRow}>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Precio total</Text>
                  <View style={[
                    styles.textInputContainer,
                    errors.price && styles.inputError
                  ]}>
                    <Text style={styles.currencySymbol}>$</Text>
                    <TextInput
                      style={styles.textInput}
                      value={quoteData.price}
                      onChangeText={(value) => handleInputChange('price', value)}
                      placeholder="0.00"
                      keyboardType="numeric"
                      editable={!isLoading}
                    />
                  </View>
                  {errors.price && (
                    <Text style={styles.errorText}>{errors.price}</Text>
                  )}
                  <Text style={styles.helperText}>Precio final a cobrar al cliente</Text>
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Días de producción</Text>
                  <View style={[
                    styles.textInputContainer,
                    errors.productionDays && styles.inputError
                  ]}>
                    <TextInput
                      style={styles.textInput}
                      value={quoteData.productionDays}
                      onChangeText={(value) => handleInputChange('productionDays', value)}
                      placeholder="3"
                      keyboardType="numeric"
                      editable={!isLoading}
                    />
                    <Text style={styles.daysText}>días</Text>
                  </View>
                  {errors.productionDays && (
                    <Text style={styles.errorText}>{errors.productionDays}</Text>
                  )}
                  <Text style={styles.helperText}>Tiempo estimado para completar</Text>
                </View>
              </View>

              <View style={styles.notesInputContainer}>
                <Text style={styles.inputLabel}>Notas para el cliente (opcional)</Text>
                <TextInput
                  style={[styles.notesInput, styles.textInput]}
                  value={quoteData.adminNotes}
                  onChangeText={(value) => handleInputChange('adminNotes', value)}
                  placeholder="Detalles sobre materiales, proceso, o instrucciones especiales..."
                  multiline
                  numberOfLines={3}
                  editable={!isLoading}
                />
              </View>
            </View>

            {/* Preview de la cotización */}
            <View style={styles.priceDisplay}>
              <Text style={styles.priceValue}>{formattedPrice}</Text>
              <Text style={styles.priceLabel}>
                {quoteData.productionDays} día{parseInt(quoteData.productionDays) !== 1 ? 's' : ''} de producción
              </Text>
            </View>

            {parseFloat(quoteData.price) > 0 && (
              <View style={styles.warningBox}>
                <Icon name="alert-circle" size={20} color="#F59E0B" />
                <View style={styles.warningContent}>
                  <Text style={styles.warningTitle}>Confirmar antes de enviar</Text>
                  <Text style={styles.warningText}>
                    Una vez enviada, la cotización será notificada al cliente por email. 
                    Asegúrate de que el precio y tiempo sean correctos.
                  </Text>
                </View>
              </View>
            )}
          </ScrollView>

          {/* Actions */}
          <View style={styles.modalActions}>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleClose}
              disabled={isLoading}
            >
              <Text style={styles.secondaryButtonText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.primaryButton,
                (!quoteData.price || parseFloat(quoteData.price) <= 0) && styles.buttonDisabled
              ]}
              onPress={handleSubmit}
              disabled={isLoading || !quoteData.price || parseFloat(quoteData.price) <= 0}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Icon name="check-circle" size={16} color="white" />
              )}
              <Text style={styles.primaryButtonText}>
                {isLoading ? 'Enviando...' : 'Enviar Cotización'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// ==================== ESTILOS ====================
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
    maxWidth: 700,
    maxHeight: '90%',
    backgroundColor: 'white',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 64,
    elevation: 8,
  },
  modalHeader: {
    backgroundColor: '#10B981',
    paddingHorizontal: 32,
    paddingVertical: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'relative',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    padding: 32,
    backgroundColor: 'white',
  },
  sectionCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(31, 100, 191, 0.08)',
    padding: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitleText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#010326',
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 20,
  },
  infoItem: {
    flex: 1,
    minWidth: '45%',
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#032CA6',
    opacity: 0.7,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#010326',
    lineHeight: 18,
  },
  complexityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  complexityChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  complexityText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  notesContainer: {
    marginTop: 8,
  },
  notesBox: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(31, 100, 191, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(31, 100, 191, 0.1)',
    marginTop: 8,
  },
  notesText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    lineHeight: 20,
  },
  calculatorSection: {
    padding: 20,
    borderRadius: 12,
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.15)',
    marginBottom: 20,
  },
  calculatorTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#059669',
    marginBottom: 16,
  },
  priceButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  priceButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(5, 150, 105, 0.3)',
    backgroundColor: 'transparent',
  },
  priceButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#059669',
  },
  breakdownText: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },
  inputsRow: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 16,
  },
  inputContainer: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#010326',
    marginBottom: 8,
  },
  textInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 12,
    height: 48,
  },
  inputError: {
    borderColor: '#EF4444',
  },
  currencySymbol: {
    fontSize: 16,
    fontWeight: '500',
    color: '#010326',
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#010326',
    paddingVertical: 12,
  },
  daysText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
  },
  helperText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  notesInputContainer: {
    marginTop: 16,
  },
  notesInput: {
    height: 80,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  priceDisplay: {
    padding: 20,
    borderRadius: 16,
    backgroundColor: '#10B981',
    marginBottom: 24,
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  priceValue: {
    fontSize: 32,
    fontWeight: '700',
    color: 'white',
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
  },
  warningBox: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.2)',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  warningContent: {
    flex: 1,
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 4,
  },
  warningText: {
    fontSize: 12,
    color: '#92400E',
    lineHeight: 16,
  },
  modalActions: {
    paddingHorizontal: 32,
    paddingVertical: 24,
    backgroundColor: 'rgba(16, 185, 129, 0.02)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(16, 185, 129, 0.08)',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'flex-end',
  },
  primaryButton: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingHorizontal: 32,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minWidth: 120,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.24,
    shadowRadius: 16,
    elevation: 4,
  },
  secondaryButton: {
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    minWidth: 100,
  },
  buttonDisabled: {
    backgroundColor: 'rgba(16, 185, 129, 0.3)',
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
    textAlign: 'center',
  },
});

// ==================== PROP TYPES ====================
QuoteDesignModal.defaultProps = {
  visible: false,
  design: null,
  onClose: () => {},
  onSubmitQuote: () => {},
  loading: false
};

export default QuoteDesignModal;