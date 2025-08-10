import React, { useState } from 'react';
import Cards from 'react-credit-cards-2';
import 'react-credit-cards-2/dist/es/styles-compiled.css';
import './paymentMethods.css';
import Modal from '../UI/modal/modal';

const PaymentMethods = () => {
  const [methods, setMethods] = useState([
    { 
      id: 1, 
      number: '**** **** **** 1234',
      name: 'JUAN PEREZ',
      expiry: '12/28',
      cvc: '123',
      issuer: 'visa',
      active: true 
    },
    { 
      id: 2, 
      number: '**** **** **** 5678',
      name: 'MARIA GARCIA',
      expiry: '06/27',
      cvc: '456',
      issuer: 'mastercard',
      active: false 
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState(null);
  
  // Estado para el formulario de la tarjeta
  const [cardForm, setCardForm] = useState({
    number: '',
    name: '',
    expiry: '',
    cvc: '',
    focus: ''
  });

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
    // Limitar CVC a 4 dígitos
    else if (name === 'cvc') {
      const formattedValue = value.replace(/\D/g, '').substring(0, 4);
      setCardForm(prev => ({ ...prev, [name]: formattedValue }));
    }
    // Nombre en mayúsculas
    else if (name === 'name') {
      setCardForm(prev => ({ ...prev, [name]: value.toUpperCase().substring(0, 30) }));
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
      cvc: '',
      focus: ''
    });
  };

  const validateCard = () => {
    const { number, name, expiry, cvc } = cardForm;
    
    if (!number || number.replace(/\s/g, '').length < 13) {
      alert('Ingresa un número de tarjeta válido (mínimo 13 dígitos)');
      return false;
    }
    
    if (!name || name.trim().length < 2) {
      alert('Ingresa un nombre válido');
      return false;
    }
    
    if (!expiry || expiry.length !== 5) {
      alert('Ingresa una fecha de expiración válida (MM/AA)');
      return false;
    }
    
    if (!cvc || cvc.length < 3) {
      alert('Ingresa un CVC válido (3-4 dígitos)');
      return false;
    }

    // Validar que la fecha no sea pasada
    const [month, year] = expiry.split('/');
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear() % 100;
    const currentMonth = currentDate.getMonth() + 1;
    
    if (parseInt(year) < currentYear || (parseInt(year) === currentYear && parseInt(month) < currentMonth)) {
      alert('La fecha de expiración no puede ser pasada');
      return false;
    }

    return true;
  };

  const detectCardType = (number) => {
    const cleanNumber = number.replace(/\s/g, '');
    
    if (/^4/.test(cleanNumber)) return 'visa';
    if (/^5[1-5]/.test(cleanNumber)) return 'mastercard';
    if (/^3[47]/.test(cleanNumber)) return 'amex';
    if (/^6/.test(cleanNumber)) return 'discover';
    
    return 'unknown';
  };

  const handleAddMethod = () => {
    if (!validateCard()) return;

    const newMethod = {
      id: Date.now(),
      number: `**** **** **** ${cardForm.number.slice(-4)}`,
      name: cardForm.name,
      expiry: cardForm.expiry,
      cvc: cardForm.cvc,
      issuer: detectCardType(cardForm.number),
      active: false,
    };

    setMethods(prev => [...prev, newMethod]);
    resetForm();
    setIsModalOpen(false);
  };

  const handleEditMethod = () => {
    if (!validateCard()) return;

    setMethods(prev =>
      prev.map(m =>
        m.id === editingMethod.id
          ? {
              ...m,
              number: `**** **** **** ${cardForm.number.slice(-4)}`,
              name: cardForm.name,
              expiry: cardForm.expiry,
              cvc: cardForm.cvc,
              issuer: detectCardType(cardForm.number)
            }
          : m
      )
    );
    
    resetForm();
    setEditingMethod(null);
  };

  const openEditModal = (method) => {
    setEditingMethod(method);
    setCardForm({
      number: '1234 5678 9012 ' + method.number.slice(-4),
      name: method.name,
      expiry: method.expiry,
      cvc: method.cvc,
      focus: ''
    });
  };

  const closeModal = () => {
    resetForm();
    setIsModalOpen(false);
    setEditingMethod(null);
  };

  return (
    <div className="payment-container">
      <div className="payment-header">
        <h3 className="payment-title">Tus métodos de pago</h3>
        <button className="btn-add" onClick={() => setIsModalOpen(true)}>
          Añadir
        </button>
      </div>
      <div className="payment-underline"></div>

      <div className="payment-list">
        {methods.map((method) => (
          <div key={method.id} className={`payment-method ${method.active ? 'active' : 'inactive'}`}>
            <p>
              {method.active ? 'Activa actualmente' : 'Registrada - Inactiva'}<br />
              {method.issuer.charAt(0).toUpperCase() + method.issuer.slice(1)} terminada en {method.number.slice(-4)}<br />

            </p>
            <div className="payment-buttons">
              <button
                className={`payment-button active-toggle ${method.active ? 'active' : ''}`}
                onClick={() => {
                  setMethods(prevMethods =>
                    prevMethods.map(m =>
                      m.id === method.id
                        ? { ...m, active: !m.active }
                        : { ...m, active: false }
                    )
                  );
                }}
                aria-label={method.active ? 'Desactivar' : 'Activar'}
              >
                {method.active ? 'Desactivar' : 'Activar'}
              </button>
              
              <button
                className="payment-button edit"
                onClick={() => openEditModal(method)}
                aria-label="Editar"
              >
                Editar
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal para añadir método */}
      <Modal isOpen={isModalOpen} onClose={closeModal}>
        <div className="card-form-container">
          <h3 style={{ marginTop: 0, marginBottom: '20px' }}>Añadir método de pago</h3>
            <Cards
              number={cardForm.number || ''}
              name={cardForm.name || ''}
              expiry={cardForm.expiry || ''}
              cvc={cardForm.cvc || ''}
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
                />
              </div>
              
              <div className="form-group">
                <input
                  type="text"
                  name="cvc"
                  placeholder="CVC"
                  value={cardForm.cvc}
                  onChange={handleInputChange}
                  onFocus={handleInputFocus}
                  className="card-input"
                />
              </div>
            </div>
            
            <button type="button" onClick={handleAddMethod} className="modal-save-btn">
              Guardar tarjeta
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
                cvc={cardForm.cvc || ''}
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
                  />
                </div>
                
                <div className="form-group">
                  <input
                    type="text"
                    name="cvc"
                    placeholder="CVC"
                    value={cardForm.cvc}
                    onChange={handleInputChange}
                    onFocus={handleInputFocus}
                    className="card-input"
                  />
                </div>
              </div>
              
              <div className="modal-buttons">
                <button 
                  type="button" 
                  onClick={handleEditMethod}
                  className="modal-save-btn"
                >
                  Guardar cambios
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('¿Deseas eliminar este método de pago?')) {
                      setMethods(prev => prev.filter(m => m.id !== editingMethod.id));
                      closeModal();
                    }
                  }}
                  className="modal-delete-btn"
                >
                  Eliminar
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