import React, { useState } from 'react';
import { useAddresses } from '../../hooks/useAddresses';
import './shippingAddresses.css';
import Modal from '../UI/modal/modal';

const ShippingAddresses = () => {
  const {
    addresses,
    locationData,
    isLoading,
    error,
    loadAddresses,
    createAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    getMunicipalitiesForDepartment,
    getDeliveryFeeForDepartment
  } = useAddresses();

  // Debug logs para verificar datos (simplificado)
  console.log('🏠 [ShippingAddresses] Direcciones cargadas:', addresses?.length || 0);

  // Estados para modales
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  
  // Estados para formularios
  const [formData, setFormData] = useState({
    label: '',
    recipient: '',
    phoneNumber: '',
    department: '',
    municipality: '',
    address: '',
    additionalDetails: '',
    isDefault: false
  });
  
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Limpiar formulario
  const resetForm = () => {
    setFormData({
      label: '',
      recipient: '',
      phoneNumber: '',
      department: '',
      municipality: '',
      address: '',
      additionalDetails: '',
      isDefault: false
    });
    setFormErrors({});
  };

  // Validar formulario
  const validateForm = () => {
    const errors = {};

    if (!formData.recipient.trim()) {
      errors.recipient = 'El nombre del destinatario es requerido';
    } else if (formData.recipient.length < 2) {
      errors.recipient = 'El nombre debe tener al menos 2 caracteres';
    }

    if (!formData.phoneNumber.trim()) {
      errors.phoneNumber = 'El teléfono es requerido';
    } else if (!/^[267]\d{7}$/.test(formData.phoneNumber.replace(/[\s\-\(\)]/g, ''))) {
      errors.phoneNumber = 'Formato de teléfono inválido (ej: 7123-4567)';
    }

    if (!formData.department) {
      errors.department = 'El departamento es requerido';
    }

    if (!formData.municipality) {
      errors.municipality = 'El municipio es requerido';
    }

    if (!formData.address.trim()) {
      errors.address = 'La dirección es requerida';
    } else if (formData.address.length < 10) {
      errors.address = 'La dirección debe ser más específica';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Manejar cambios en el formulario
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Limpiar error del campo si existe
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }

    // Si cambia el departamento, limpiar municipio
    if (field === 'department') {
      setFormData(prev => ({
        ...prev,
        municipality: ''
      }));
    }
  };

  // Abrir modal de edición
  const handleEditAddress = (address) => {
    setFormData({
      label: address.label || '',
      recipient: address.recipient || '',
      phoneNumber: address.phoneNumber || '',
      department: address.department || '',
      municipality: address.municipality || '',
      address: address.address || '',
      additionalDetails: address.additionalDetails || '',
      isDefault: address.isDefault || false
    });
    setEditingAddress(address);
    setFormErrors({});
  };

  // Cerrar modales
  const handleCloseModals = () => {
    setIsAddModalOpen(false);
    setEditingAddress(null);
    resetForm();
  };

  // Manejar envío del formulario
  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const addressData = {
        ...formData,
        phoneNumber: formData.phoneNumber.replace(/[\s\-\(\)]/g, ''), // Limpiar formato
        label: formData.label.trim() || 'Mi dirección'
      };

      if (editingAddress) {
        await updateAddress(editingAddress._id, addressData);
      } else {
        await createAddress(addressData);
      }

      // Recargar direcciones después de crear/actualizar
      await loadAddresses();
      
      handleCloseModals();
    } catch (err) {
      // El error ya se maneja en el hook
      console.error('Error en formulario:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Manejar eliminación
  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta dirección?')) {
      return;
    }

    try {
      await deleteAddress(addressId);
    } catch (err) {
      alert('Error al eliminar la dirección');
    }
  };

  // Manejar cambio de dirección predeterminada
  const handleToggleDefault = async (addressId, currentDefault) => {
    try {
      if (currentDefault) {
        // Si está activa, no hacer nada (o podrías mostrar un mensaje)
        alert('Esta dirección ya está activa');
        return;
      }
      
      await setDefaultAddress(addressId);
    } catch (err) {
      alert('Error al establecer la dirección predeterminada');
    }
  };

  if (isLoading) {
    return (
      <div className="address-container">
        <div className="address-header">
          <h3 className="address-title">Tus direcciones</h3>
        </div>
        <div className="address-underline"></div>
        <div className="loading-state">
          Cargando direcciones...
        </div>
      </div>
    );
  }

  return (
    <div className="address-container">
      <div className="address-header">
        <h3 className="address-title">Tus direcciones</h3>
        <div className="header-buttons">
          <button 
            className="address-button edit"
            onClick={loadAddresses}
            disabled={isSubmitting}
          >
          Recargar
          </button>
          <button 
            className="btn-add" 
            onClick={() => setIsAddModalOpen(true)}
            disabled={isSubmitting}
          >
            Añadir
          </button>
        </div>
      </div>
      <div className="address-underline"></div>

      {error && (
        <div className="error-state">
          {error}
        </div>
      )}

      <div className="address-list">
        {addresses.length === 0 ? (
          <div className="empty-state">
            No tienes direcciones registradas.
            <br />
            <button onClick={() => setIsAddModalOpen(true)}>
              Añadir tu primera dirección
            </button>
          </div>
        ) : (
          addresses.map((address) => (
            <div
              key={address._id}
              className={`address-item ${address.isDefault ? 'active' : 'inactive'}`}
            >
              <div className="address-info">
                <p>
                  <strong>
                    {address.isDefault ? 'Activa actualmente' : 'Dirección registrada'}
                  </strong>
                  {address.label && address.label !== 'Mi dirección' && (
                    <span className="address-label">
                      {' '}({address.label})
                    </span>
                  )}
                  <br />
                  {address.address}
                </p>
              </div>
              
              <div className="address-buttons">
                <button
                  className={`address-button active-toggle ${address.isDefault ? 'active' : ''}`}
                  onClick={() => handleToggleDefault(address._id, address.isDefault)}
                  disabled={isSubmitting}
                  aria-label={address.isDefault ? 'Desactivar' : 'Activar'}
                >
                  {address.isDefault ? 'Desactivar' : 'Activar'}
                </button>
                
                <button
                  className="address-button edit"
                  onClick={() => handleEditAddress(address)}
                  disabled={isSubmitting}
                  aria-label="Editar"
                >
                  Editar
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal para añadir/editar */}
      <Modal 
        isOpen={isAddModalOpen || !!editingAddress} 
        onClose={handleCloseModals}
      >
        <h3 className="modal-title">
          {editingAddress ? 'Editar dirección' : 'Añadir dirección'}
        </h3>
        
        <div className="form-group">
          <label className="form-label">
            Etiqueta (opcional)
          </label>
          <input
            type="text"
            placeholder="Casa, Trabajo, etc."
            value={formData.label}
            onChange={(e) => handleInputChange('label', e.target.value)}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            Nombre del destinatario *
          </label>
          <input
            type="text"
            placeholder="Nombre completo"
            value={formData.recipient}
            onChange={(e) => handleInputChange('recipient', e.target.value)}
            className={`form-input ${formErrors.recipient ? 'input-error' : ''}`}
          />
          {formErrors.recipient && (
            <small className="error-message">{formErrors.recipient}</small>
          )}
        </div>

        <div className="form-group">
          <label className="form-label">
            Teléfono *
          </label>
          <input
            type="tel"
            placeholder="7123-4567"
            value={formData.phoneNumber}
            onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
            className={`form-input ${formErrors.phoneNumber ? 'input-error' : ''}`}
          />
          {formErrors.phoneNumber && (
            <small className="error-message">{formErrors.phoneNumber}</small>
          )}
        </div>

        <div className="form-group">
          <label className="form-label">
            Departamento *
          </label>
          <select
            value={formData.department}
            onChange={(e) => handleInputChange('department', e.target.value)}
            className={`form-select ${formErrors.department ? 'input-error' : ''}`}
          >
            <option value="">Selecciona un departamento</option>
            {locationData.departments?.map((dept) => (
              <option key={dept.name} value={dept.name}>
                {dept.name} (Envío: ${dept.deliveryFee?.toFixed(2) || '0.00'})
              </option>
            ))}
          </select>
          {formErrors.department && (
            <small className="error-message">{formErrors.department}</small>
          )}
        </div>

        <div className="form-group">
          <label className="form-label">
            Municipio *
          </label>
          <select
            value={formData.municipality}
            onChange={(e) => handleInputChange('municipality', e.target.value)}
            disabled={!formData.department}
            className={`form-select ${formErrors.municipality ? 'input-error' : ''} ${!formData.department ? 'disabled-select' : ''}`}
          >
            <option value="">
              {formData.department ? 'Selecciona un municipio' : 'Primero selecciona un departamento'}
            </option>
            {formData.department && getMunicipalitiesForDepartment(formData.department).map((municipality) => (
              <option key={municipality} value={municipality}>
                {municipality}
              </option>
            ))}
          </select>
          {formErrors.municipality && (
            <small className="error-message">{formErrors.municipality}</small>
          )}
        </div>

        <div className="form-group">
          <label className="form-label">
            Dirección completa *
          </label>
          <textarea
            placeholder="Calle, número de casa, referencias importantes..."
            value={formData.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
            rows={3}
            className={`form-textarea ${formErrors.address ? 'input-error' : ''}`}
          />
          {formErrors.address && (
            <small className="error-message">{formErrors.address}</small>
          )}
        </div>

        <div className="form-group">
          <label className="form-label">
            Detalles adicionales (opcional)
          </label>
          <textarea
            placeholder="Color de casa, puntos de referencia adicionales..."
            value={formData.additionalDetails}
            onChange={(e) => handleInputChange('additionalDetails', e.target.value)}
            rows={2}
            className="form-textarea"
          />
        </div>

        <div className="checkbox-group">
          <label className="checkbox-label">
            <input 
              type="checkbox"
              className="checkbox-input"
              checked={formData.isDefault}
              onChange={(e) => handleInputChange('isDefault', e.target.checked)}
            />
            Establecer como dirección predeterminada
          </label>
        </div>

        <div className="modal-buttons">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="submit-button"
          >
            {isSubmitting ? 'Guardando...' : 'Guardar'}
          </button>
          
          {editingAddress && (
            <button
              onClick={() => {
                if (window.confirm('¿Estás seguro de que deseas eliminar esta dirección?')) {
                  handleDeleteAddress(editingAddress._id);
                  handleCloseModals();
                }
              }}
              disabled={isSubmitting}
              className="cancel-button"
            >
              Eliminar
            </button>
          )}
          
          {/* Solo mostrar el botón Cancelar cuando NO se esté editando */}
          {!editingAddress && (
            <button
              onClick={handleCloseModals}
              disabled={isSubmitting}
              className="cancel-button"
            >
              Cancelar
            </button>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default ShippingAddresses;