import React, { useState } from 'react';
import './shippingAddresses.css';
import btnAdd from '/images/profile/btnAdd.png';
import btnEdit from '/images/profile/btnEdit.png';
import btnActivate from '/images/profile/btnActivate.png';
import btnDeactivate from '/images/profile/btnDeactivate.png';
import Modal from '../UI/modal/modal';

const ShippingAddresses = () => {
  const [addresses, setAddresses] = useState([
    { id: 1, address: 'Av. Siempre Viva 123', active: true },
    { id: 2, address: 'Calle a Mariona 1, #6', active: false },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAddress, setNewAddress] = useState('');
  const [editingAddress, setEditingAddress] = useState(null);
  const [editedAddress, setEditedAddress] = useState('');

  const handleAddAddress = () => {
    if (newAddress.trim().length === 0) {
      alert('Ingresa una dirección válida');
      return;
    }

    const newEntry = {
      id: Date.now(),
      address: newAddress,
      active: false,
    };

    setAddresses((prev) => [...prev, newEntry]);
    setNewAddress('');
    setIsModalOpen(false);
  };

  return (
    <div className="address-container">
      <div className="address-header">
        <h3 className="address-title">Tus direcciones</h3>
        <button className="btn-add" onClick={() => setIsModalOpen(true)}>Añadir</button>
      </div>
      <div className="address-underline"></div>

    <div className="address-list">
  {addresses.map((item) => (
    <div
      key={item.id}
      className={`address-item ${item.active ? 'active' : 'inactive'}`}
    >
      <p>
        {item.active ? 'Dirección actual' : 'Dirección registrada'}<br />
        {item.address}
      </p>
      <div className="address-buttons">
        <button
          className={`address-button active-toggle ${item.active ? 'active' : ''}`}
          onClick={() => {
            setAddresses((prev) =>
              prev.map((addr) =>
                addr.id === item.id
                  ? { ...addr, active: !addr.active }
                  : { ...addr, active: false }
              )
            );
          }}
          aria-label={item.active ? 'Desactivar' : 'Activar'}
        >
          {item.active ? 'Desactivar' : 'Activar'}
        </button>
        
        <button
          className="address-button edit"
          onClick={() => {
            setEditingAddress(item);
            setEditedAddress(item.address);
          }}
          aria-label="Editar"
        >
          Editar
        </button>
      </div>
    </div>
  ))}
</div>

      {/* Modal para añadir */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <h3 style={{ marginTop: 0 }}>Añadir dirección</h3>
        <input
          type="text"
          placeholder="Dirección completa"
          value={newAddress}
          onChange={(e) => setNewAddress(e.target.value)}
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
        <button onClick={handleAddAddress}>Guardar</button>
      </Modal>

      {/* Modal para editar */}
      {editingAddress && (
        <Modal isOpen={true} onClose={() => setEditingAddress(null)}>
          <h3 style={{ marginTop: 0 }}>Editar dirección</h3>
          <input
            type="text"
            value={editedAddress}
            onChange={(e) => setEditedAddress(e.target.value)}
            placeholder="Dirección completa"
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
                if (editedAddress.trim().length === 0) {
                  alert('Ingresa una dirección válida');
                  return;
                }
                setAddresses((prev) =>
                  prev.map((addr) =>
                    addr.id === editingAddress.id
                      ? { ...addr, address: editedAddress }
                      : addr
                  )
                );
                setEditingAddress(null);
              }}
            >
              Guardar cambios
            </button>
            <button
              style={{ backgroundColor: '#e74c3c', color: '#fff' }}
              onClick={() => {
                if (confirm('¿Deseas eliminar esta dirección?')) {
                  setAddresses((prev) => prev.filter((a) => a.id !== editingAddress.id));
                  setEditingAddress(null);
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

export default ShippingAddresses;
