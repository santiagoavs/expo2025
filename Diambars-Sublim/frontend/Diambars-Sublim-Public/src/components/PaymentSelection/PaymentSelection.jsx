// components/PaymentSelection/PaymentSelection.jsx - Componente para selección de métodos de pago
import React, { useState, useEffect, useCallback } from 'react';
import './PaymentSelection.css';

const PaymentSelection = ({ 
  orderId, 
  total, 
  onPaymentSelected, 
  onPaymentProcessed,
  loading = false 
}) => {
  // Estados
  const [availableMethods, setAvailableMethods] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [selectedUserMethod, setSelectedUserMethod] = useState(null);
  const [newMethodData, setNewMethodData] = useState({});
  const [showNewMethodForm, setShowNewMethodForm] = useState(false);
  const [loadingMethods, setLoadingMethods] = useState(false);
  const [errors, setErrors] = useState({});

  // Cargar métodos disponibles
  const loadAvailableMethods = useCallback(async () => {
    try {
      setLoadingMethods(true);
      setErrors({});

      const response = await fetch('/api/payment-selection/available', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        setAvailableMethods(data.methods || []);
      } else {
        throw new Error(data.message || 'Error cargando métodos de pago');
      }

    } catch (error) {
      console.error('Error cargando métodos de pago:', error);
      setErrors({ general: error.message });
    } finally {
      setLoadingMethods(false);
    }
  }, []);

  // Cargar métodos al montar el componente
  useEffect(() => {
    loadAvailableMethods();
  }, [loadAvailableMethods]);

  // Manejar selección de método
  const handleMethodSelect = useCallback((method) => {
    setSelectedMethod(method);
    setSelectedUserMethod(null);
    setNewMethodData({});
    setShowNewMethodForm(false);
    setErrors({});
  }, []);

  // Manejar selección de método de usuario
  const handleUserMethodSelect = useCallback((userMethod) => {
    setSelectedUserMethod(userMethod);
    setNewMethodData({});
    setShowNewMethodForm(false);
    setErrors({});
  }, []);

  // Manejar formulario de nuevo método
  const handleNewMethodToggle = useCallback(() => {
    setShowNewMethodForm(!showNewMethodForm);
    setSelectedUserMethod(null);
    setNewMethodData({});
    setErrors({});
  }, [showNewMethodForm]);

  // Manejar cambios en formulario de nuevo método
  const handleNewMethodChange = useCallback((field, value) => {
    setNewMethodData(prev => ({
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
  }, [errors]);

  // Validar formulario de nuevo método
  const validateNewMethod = useCallback(() => {
    const newErrors = {};

    if (selectedMethod?.type === 'credit_card' || selectedMethod?.type === 'wompi') {
      if (!newMethodData.cardNumber) newErrors.cardNumber = 'Número de tarjeta requerido';
      if (!newMethodData.expiry) newErrors.expiry = 'Fecha de expiración requerida';
      if (!newMethodData.name) newErrors.name = 'Nombre del titular requerido';
      if (!newMethodData.cvv) newErrors.cvv = 'CVV requerido';
    } else if (selectedMethod?.type === 'bank_transfer') {
      if (!newMethodData.bankAccount) newErrors.bankAccount = 'Número de cuenta requerido';
      if (!newMethodData.name) newErrors.name = 'Nombre del titular requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [selectedMethod, newMethodData]);

  // Procesar pago
  const handleProcessPayment = useCallback(async () => {
    try {
      if (!selectedMethod) {
        setErrors({ general: 'Selecciona un método de pago' });
        return;
      }

      // Validar nuevo método si es necesario
      if (showNewMethodForm && !validateNewMethod()) {
        return;
      }

      const paymentData = {
        method: selectedMethod.type,
        timing: 'on_delivery', // Por defecto
        userMethodId: selectedUserMethod?.id,
        newMethodData: showNewMethodForm ? newMethodData : null
      };

      const response = await fetch(`/api/payment-selection/orders/${orderId}/process`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(paymentData)
      });

      const data = await response.json();

      if (data.success) {
        onPaymentProcessed?.(data.payment, data.order);
      } else {
        throw new Error(data.message || 'Error procesando pago');
      }

    } catch (error) {
      console.error('Error procesando pago:', error);
      setErrors({ general: error.message });
    }
  }, [selectedMethod, selectedUserMethod, newMethodData, showNewMethodForm, orderId, onPaymentProcessed, validateNewMethod]);

  // Renderizar método de pago
  const renderPaymentMethod = (method) => {
    const isSelected = selectedMethod?.type === method.type;
    const hasUserMethods = method.userMethods?.length > 0;

    return (
      <div 
        key={method.type}
        className={`payment-method ${isSelected ? 'selected' : ''}`}
        onClick={() => handleMethodSelect(method)}
      >
        <div className="method-header">
          <div className="method-info">
            <h3>{method.name}</h3>
            {method.message && <p className="method-message">{method.message}</p>}
          </div>
          <div className="method-icon">
            {method.type === 'wompi' && '💳'}
            {method.type === 'credit_card' && '💳'}
            {method.type === 'bank_transfer' && '🏦'}
            {method.type === 'cash' && '💵'}
          </div>
        </div>

        {isSelected && (
          <div className="method-details">
            {/* Métodos de usuario existentes */}
            {hasUserMethods && (
              <div className="user-methods">
                <h4>Métodos guardados:</h4>
                {method.userMethods.map(userMethod => (
                  <div 
                    key={userMethod.id}
                    className={`user-method ${selectedUserMethod?.id === userMethod.id ? 'selected' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUserMethodSelect(userMethod);
                    }}
                  >
                    <div className="user-method-info">
                      <span className="method-name">{userMethod.name}</span>
                      <span className="method-details">
                        {userMethod.lastFourDigits ? `****${userMethod.lastFourDigits}` : userMethod.bankAccount}
                        {userMethod.expiry && ` - ${userMethod.expiry}`}
                      </span>
                    </div>
                    <div className="method-issuer">
                      {userMethod.issuer && userMethod.issuer !== 'unknown' && (
                        <span className="issuer-badge">{userMethod.issuer}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Opción de agregar nuevo método */}
            {method.canAddNew && (
              <div className="new-method-option">
                <button 
                  type="button"
                  className="add-new-method-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNewMethodToggle();
                  }}
                >
                  {showNewMethodForm ? 'Cancelar' : 'Agregar nuevo método'}
                </button>
              </div>
            )}

            {/* Formulario de nuevo método */}
            {showNewMethodForm && (
              <div className="new-method-form">
                <h4>Nuevo método de pago</h4>
                
                {(method.type === 'credit_card' || method.type === 'wompi') && (
                  <>
                    <div className="form-group">
                      <label>Número de tarjeta</label>
                      <input
                        type="text"
                        placeholder="1234 5678 9012 3456"
                        value={newMethodData.cardNumber || ''}
                        onChange={(e) => handleNewMethodChange('cardNumber', e.target.value)}
                        className={errors.cardNumber ? 'error' : ''}
                      />
                      {errors.cardNumber && <span className="error-text">{errors.cardNumber}</span>}
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Fecha de expiración</label>
                        <input
                          type="text"
                          placeholder="MM/YY"
                          value={newMethodData.expiry || ''}
                          onChange={(e) => handleNewMethodChange('expiry', e.target.value)}
                          className={errors.expiry ? 'error' : ''}
                        />
                        {errors.expiry && <span className="error-text">{errors.expiry}</span>}
                      </div>

                      <div className="form-group">
                        <label>CVV</label>
                        <input
                          type="text"
                          placeholder="123"
                          value={newMethodData.cvv || ''}
                          onChange={(e) => handleNewMethodChange('cvv', e.target.value)}
                          className={errors.cvv ? 'error' : ''}
                        />
                        {errors.cvv && <span className="error-text">{errors.cvv}</span>}
                      </div>
                    </div>
                  </>
                )}

                {method.type === 'bank_transfer' && (
                  <div className="form-group">
                    <label>Número de cuenta bancaria</label>
                    <input
                      type="text"
                      placeholder="1234567890"
                      value={newMethodData.bankAccount || ''}
                      onChange={(e) => handleNewMethodChange('bankAccount', e.target.value)}
                      className={errors.bankAccount ? 'error' : ''}
                    />
                    {errors.bankAccount && <span className="error-text">{errors.bankAccount}</span>}
                  </div>
                )}

                <div className="form-group">
                  <label>Nombre del titular</label>
                  <input
                    type="text"
                    placeholder="Juan Pérez"
                    value={newMethodData.name || ''}
                    onChange={(e) => handleNewMethodChange('name', e.target.value)}
                    className={errors.name ? 'error' : ''}
                  />
                  {errors.name && <span className="error-text">{errors.name}</span>}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  if (loadingMethods) {
    return (
      <div className="payment-selection loading">
        <div className="loading-spinner">Cargando métodos de pago...</div>
      </div>
    );
  }

  return (
    <div className="payment-selection">
      <div className="payment-header">
        <h2>Seleccionar método de pago</h2>
        <div className="order-total">
          Total: ${total?.toFixed(2) || '0.00'}
        </div>
      </div>

      {errors.general && (
        <div className="error-message">
          {errors.general}
        </div>
      )}

      <div className="payment-methods">
        {availableMethods.map(renderPaymentMethod)}
      </div>

      {selectedMethod && (
        <div className="payment-actions">
          <button 
            type="button"
            className="process-payment-btn"
            onClick={handleProcessPayment}
            disabled={loading}
          >
            {loading ? 'Procesando...' : 'Procesar pago'}
          </button>
        </div>
      )}
    </div>
  );
};

export default PaymentSelection;
