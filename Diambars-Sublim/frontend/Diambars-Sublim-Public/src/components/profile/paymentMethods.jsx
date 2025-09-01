import React, { useState } from 'react';
import Cards from 'react-credit-cards-2';
import 'react-credit-cards-2/dist/es/styles-compiled.css';
import './paymentMethods.css';
import Modal from '../UI/modal/modal';
import { usePaymentMethods } from '../../hooks/usePaymentMethods';
import { useAuth } from '../../context/authContext';

const PaymentMethods = () => {
  const { isAuthenticated } = useAuth();
  const {
    methods,
    loading,
    error,
    addPaymentMethod,
    updatePaymentMethod,
    deletePaymentMethod,
    togglePaymentMethod,
    clearError
  } = usePaymentMethods();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  
  // Estado para el formulario de la tarjeta (SIN CVC)
  const [cardForm, setCardForm] = useState({
    number: '',
    name: '',
    expiry: '',
    nickname: '',
    focus: ''
  });

  // Si no está autenticado, mostrar mensaje
  if (!isAuthenticated) {
    return (
      <div className="payment-container">
        <div className="payment-header">
          <h3 className="payment-title">Tus métodos de pago</h3>
        </div>
        <div className="payment-underline"></div>
        <div className="auth-required-message">
          <p>Debes iniciar sesión para gestionar tus métodos de pago.</p>
        </div>
      </div>
    );
  }

  const handleInputChange = (evt) => {
    const { name, value } = evt.target;
    
    // Formatear número de tarjeta con espacios
    if (name === 'number') {
      const formattedValue = value
        .replace(/\s/g, '')
        .replace(/(.{4})/g, '$1 ')
        .trim()
        .substring(0, 19); // Máximo 16 dígitos + 3 espacios
      setCardForm(prev => ({ ...prev, [name]: formattedValue }));
    }
    // Formatear fecha de expiración
    else if (name === 'expiry') {
      const formattedValue = value
        .replace(/\D/g, '')
        .replace(/(\d{2})(\d)/, '$1/$2')
        .substring(0, 5);
      setCardForm(prev => ({ ...prev, [name]: formattedValue }));
    }
    // Nombre en mayúsculas
    else if (name === 'name') {
      setCardForm(prev => ({ ...prev, [name]: value.toUpperCase().substring(0, 30) }));
    }
    // Nickname normal
    else if (name === 'nickname') {
      setCardForm(prev => ({ ...prev, [name]: value.substring(0, 50) }));
    }
    else {
      setCardForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleInputFocus = (evt) => {
    setCardForm(prev => ({ ...prev, focus: evt.target.name }));
  };

  const resetForm = () => {
    setCardForm({
      number: '',
      name: '',
      expiry: '',
      nickname: '',
      focus: ''
    });
  };

  const handleAddMethod = async () => {
    try {
      setSubmitting(true);
      clearError();
      
      await addPaymentMethod(cardForm);
      
      resetForm();
      setIsModalOpen(false);
    } catch (err) {
      // El error ya está manejado en el hook, solo necesitamos mostrarlo
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditMethod = async () => {
    try {
      setSubmitting(true);
      clearError();

      await updatePaymentMethod(editingMethod._id, cardForm);
      
      resetForm();
      setEditingMethod(null);
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteMethod = async (methodId) => {
    if (!confirm('¿Deseas eliminar este método de pago?')) {
      return;
    }

    try {
      setSubmitting(true);
      clearError();
      
      await deletePaymentMethod(methodId);
      
      if (editingMethod && editingMethod._id === methodId) {
        closeModal();
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleMethod = async (methodId, currentActive) => {
    try {
      setSubmitting(true);
      clearError();
      
      await togglePaymentMethod(methodId, !currentActive);
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (method) => {
    setEditingMethod(method);
    setCardForm({
      number: '1234 5678 9012 ' + method.lastFourDigits,
      name: method.name,
      expiry: method.expiry,
      nickname: method.nickname || '',
      focus: ''
    });
  };

  const closeModal = () => {
    resetForm();
    setIsModalOpen(false);
    setEditingMethod(null);
  };

  // Función para formatear el número de tarjeta mostrado
  const formatDisplayNumber = (method) => {
    return `**** **** **** ${method.lastFourDigits || '****'}`;
  };

  // Función para capitalizar el nombre del issuer
  const formatIssuerName = (issuer) => {
    if (!issuer || issuer === 'unknown') return 'Tarjeta';
    return issuer.charAt(0).toUpperCase() + issuer.slice(1);
  };

  if (loading && methods.length === 0) {
    return (
      <div className="payment-container">
        <div className="payment-header">
          <h3 className="payment-title">Tus métodos de pago</h3>
        </div>
        <div className="payment-underline"></div>
        <div className="loading-message">
          <p>Cargando métodos de pago...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-container">
      <div className="payment-header">
        <h3 className="payment-title">Tus métodos de pago</h3>
        <button 
          className="btn-add" 
          onClick={() => setIsModalOpen(true)}
          disabled={submitting}
        >
          Añadir
        </button>
      </div>
      <div className="payment-underline"></div>

      {error && (
        <div className="error-message" style={{
          background: '#fee',
          border: '1px solid #fcc',
          borderRadius: '4px',
          padding: '10px',
          margin: '10px 0',
          color: '#c33'
        }}>
          {error}
          <button 
            onClick={clearError}
            style={{ float: 'right', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            ×
          </button>
        </div>
      )}

      <div className="payment-list">
        {methods.length === 0 ? (
          <div className="no-methods-message">
            <p>No tienes métodos de pago registrados</p>
            <small>⚠️ Nota: El CVC se solicitará en cada transacción por seguridad</small>
          </div>
        ) : (
          methods.map((method) => (
            <div key={method._id} className={`payment-method ${method.active ? 'active' : 'inactive'}`}>
              <p>
                {method.active ? 'Activa actualmente' : 'Registrada - Inactiva'}<br />
                {method.nickname && <strong>{method.nickname}</strong>}<br />
                {formatIssuerName(method.issuer)} terminada en {method.lastFourDigits}<br />
                <small>Expira: {method.expiry}</small>
              </p>
              <div className="payment-buttons">
                <button
                  className={`payment-button active-toggle ${method.active ? 'active' : ''}`}
                  onClick={() => handleToggleMethod(method._id, method.active)}
                  disabled={submitting || loading}
                  aria-label={method.active ? 'Desactivar' : 'Activar'}
                >
                  {submitting ? '...' : (method.active ? 'Desactivar' : 'Activar')}
                </button>
                
                <button
                  className="payment-button edit"
                  onClick={() => openEditModal(method)}
                  disabled={submitting || loading}
                  aria-label="Editar"
                >
                  Editar
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {loading && methods.length > 0 && (
        <div className="updating-overlay" style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(255,255,255,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <p>Actualizando...</p>
        </div>
      )}

      {/* Modal para añadir método */}
      <Modal isOpen={isModalOpen} onClose={closeModal}>
        <div className="card-form-container">
          <h3 style={{ marginTop: '20px', marginBottom: '20px' }}>Añadir método de pago</h3>
          
          {/* Aviso de seguridad */}
          <div style={{ 
            background: '#d7be2e30', 
            borderRadius: '13px', 
            padding: '10px', 
            marginBottom: '5px',
            fontSize: '14px'
          }}>
            <strong>Seguridad:</strong> El CVC se solicitará al momento del pago y nunca se almacena.
          </div>
          
          <Cards
            number={cardForm.number || ''}
            name={cardForm.name || ''}
            expiry={cardForm.expiry || ''}
            cvc="***" // Siempre mostrar asteriscos
            focused={cardForm.focus}
            locale={{
              valid: 'VÁLIDA HASTA',
              monthYear: 'MM/AA',
              yourNameHere: 'NOMBRE AQUÍ'
            }}
            placeholders={{
              name: 'TU NOMBRE'
            }}
          />
          
          <form className="card-form" onSubmit={(e) => e.preventDefault()}>
            <div className="form-group">
              <input
                type="text"
                name="number"
                placeholder="Número de tarjeta"
                value={cardForm.number}
                onChange={handleInputChange}
                onFocus={handleInputFocus}
                className="card-input"
                disabled={submitting}
              />
            </div>
            
            <div className="form-group">
              <input
                type="text"
                name="name"
                placeholder="Nombre en la tarjeta"
                value={cardForm.name}
                onChange={handleInputChange}
                onFocus={handleInputFocus}
                className="card-input"
                disabled={submitting}
              />
            </div>
            
            <div className="form-group">
              <input
                type="text"
                name="nickname"
                placeholder="Nombre para identificar (opcional)"
                value={cardForm.nickname}
                onChange={handleInputChange}
                onFocus={handleInputFocus}
                className="card-input"
                disabled={submitting}
              />
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <input
                  type="text"
                  name="expiry"
                  placeholder="MM/AA"
                  value={cardForm.expiry}
                  onChange={handleInputChange}
                  onFocus={handleInputFocus}
                  className="card-input"
                  disabled={submitting}
                />
              </div>
            </div>
            
            <button 
              type="button" 
              onClick={handleAddMethod} 
              className="modal-save-btn"
              disabled={submitting}
            >
              {submitting ? 'Guardando...' : 'Guardar tarjeta'}
            </button>
          </form>
        </div>
      </Modal>

      {/* Modal para editar método */}
      {editingMethod && (
        <Modal isOpen={true} onClose={closeModal}>
          <div className="card-form-container">
            <h3 style={{ marginTop: 0, marginBottom: '20px' }}>Editar método de pago</h3>
            
            <Cards
              number={cardForm.number || ''}
              name={cardForm.name || ''}
              expiry={cardForm.expiry || ''}
              cvc="***" // Siempre mostrar asteriscos
              focused={cardForm.focus}
            />
            
            <form className="card-form" onSubmit={(e) => e.preventDefault()}>
              <div className="form-group">
                <input
                  type="text"
                  name="number"
                  placeholder="Número de tarjeta"
                  value={cardForm.number}
                  onChange={handleInputChange}
                  onFocus={handleInputFocus}
                  className="card-input"
                  disabled={submitting}
                />
              </div>
              
              <div className="form-group">
                <input
                  type="text"
                  name="name"
                  placeholder="Nombre en la tarjeta"
                  value={cardForm.name}
                  onChange={handleInputChange}
                  onFocus={handleInputFocus}
                  className="card-input"
                  disabled={submitting}
                />
              </div>
              
              <div className="form-group">
                <input
                  type="text"
                  name="nickname"
                  placeholder="Nombre para identificar (opcional)"
                  value={cardForm.nickname}
                  onChange={handleInputChange}
                  onFocus={handleInputFocus}
                  className="card-input"
                  disabled={submitting}
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <input
                    type="text"
                    name="expiry"
                    placeholder="MM/AA"
                    value={cardForm.expiry}
                    onChange={handleInputChange}
                    onFocus={handleInputFocus}
                    className="card-input"
                    disabled={submitting}
                  />
                </div>
              </div>
              
              <div className="modal-buttons">
                <button 
                  type="button" 
                  onClick={handleEditMethod}
                  className="modal-save-btn"
                  disabled={submitting}
                >
                  {submitting ? 'Guardando...' : 'Guardar cambios'}
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteMethod(editingMethod._id)}
                  className="modal-delete-btn"
                  disabled={submitting}
                >
                  {submitting ? 'Eliminando...' : 'Eliminar'}
                </button>
              </div>
            </form>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default PaymentMethods;