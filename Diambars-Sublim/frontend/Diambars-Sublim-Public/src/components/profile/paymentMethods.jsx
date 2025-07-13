import React, { useState } from 'react';
import './paymentMethods.css';
import btnAdd from '/images/profile/btnAdd.png';
import btnEdit from '/images/profile/btnEdit.png';
import btnActivate from '/images/profile/btnActivate.png';
import btnDeactivate from '/images/profile/btnDeactivate.png';
import Modal from '../UI/modal/modal';

const PaymentMethods = () => {
  const [methods, setMethods] = useState([
    { id: 1, lastDigits: '1234', active: true },
    { id: 2, lastDigits: '5678', active: false },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newLastDigits, setNewLastDigits] = useState('');
  const [editingMethod, setEditingMethod] = useState(null);
  const [editedLastDigits, setEditedLastDigits] = useState('');


  const handleAddMethod = () => {
    if (newLastDigits.length !== 4 || isNaN(newLastDigits)) {
      alert('Ingresa exactamente 4 dígitos numéricos');
      return;
    }

    const newMethod = {
      id: Date.now(),
      lastDigits: newLastDigits,
      active: false,
    };

    setMethods((prev) => [...prev, newMethod]);
    setNewLastDigits('');
    setIsModalOpen(false);
  };

  return (
    <div className="payment-container">
      <div className="payment-header">
        <h3 className="payment-title">Tus métodos de pago</h3>
        <img
          src={btnAdd}
          alt="Añadir método de pago"
          className="btn-add"
          onClick={() => setIsModalOpen(true)}
        />
      </div>
      <div className="payment-underline"></div>

      <div className="payment-list">
        {methods.map((method) => (
          <div key={method.id} className={`payment-method ${method.active ? 'active' : 'inactive'}`}>
            <p>
              {method.active ? 'Activa actualmente' : 'Registrada - Inactiva'}<br />
              Visa terminada en {method.lastDigits}
            </p>
            <div className="payment-buttons">
              <img
                src={method.active ? btnDeactivate : btnActivate}
                alt={method.active ? 'Desactivar' : 'Activar'}
                onClick={() => {
                  setMethods((prevMethods) =>
                    prevMethods.map((m) =>
                      m.id === method.id
                        ? { ...m, active: !m.active }
                        : { ...m, active: false }
                    )
                  );
                }}
              />
              <img
                src={btnEdit}
                alt="Editar"
                onClick={() => {
                  setEditingMethod(method);
                  setEditedLastDigits(method.lastDigits);
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <h3 style={{ marginTop: 0 }}>Añadir método de pago</h3>
        <input
          type="text"
          placeholder="Últimos 4 dígitos"
          value={newLastDigits}
          onChange={(e) => setNewLastDigits(e.target.value)}
          maxLength={4}
          style={{
            padding: '10px',
            fontSize: '1rem',
            width: '100%',
            marginBottom: '1rem',
            fontFamily: 'Inter, sans-serif',
            fontStyle: 'italic',
            border: '1px solid #ccc',
            borderRadius: '5px',
          }}
        />
        <button onClick={handleAddMethod}>Guardar</button>
      </Modal>

      {editingMethod && (
        <Modal isOpen={true} onClose={() => setEditingMethod(null)}>
          <h3 style={{ marginTop: 0 }}>Editar método</h3>
          <input
            type="text"
            value={editedLastDigits}
            onChange={(e) => setEditedLastDigits(e.target.value)}
            maxLength={4}
            placeholder="Últimos 4 dígitos"
            style={{
              padding: '10px',
              fontSize: '1rem',
              width: '100%',
              marginBottom: '1rem',
              fontFamily: 'Inter, sans-serif',
              fontStyle: 'italic',
              border: '1px solid #ccc',
              borderRadius: '5px',
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
            <button
              onClick={() => {
                if (editedLastDigits.length !== 4 || isNaN(editedLastDigits)) {
                  alert('Ingresa 4 dígitos numéricos válidos');
                  return;
                }
                setMethods((prev) =>
                  prev.map((m) =>
                    m.id === editingMethod.id
                      ? { ...m, lastDigits: editedLastDigits }
                      : m
                  )
                );
                setEditingMethod(null);
              }}
            >
              Guardar cambios
            </button>
            <button
              style={{ backgroundColor: '#e74c3c', color: '#fff' }}
              onClick={() => {
                if (confirm('¿Deseas eliminar este método de pago?')) {
                  setMethods((prev) => prev.filter((m) => m.id !== editingMethod.id));
                  setEditingMethod(null);
                }
              }}
            >
              Eliminar
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default PaymentMethods;
