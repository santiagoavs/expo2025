// src/components/QuoteDesignModal/QuoteDesignModal.jsx
import React, { useState, useEffect } from 'react';
import './QuoteDesignModal.css';

// Iconos simples
const CloseIcon = () => <span style={{ fontSize: 'inherit' }}>✕</span>;
const MoneyIcon = () => <span style={{ fontSize: 'inherit' }}>💰</span>;
const ClockIcon = () => <span style={{ fontSize: 'inherit' }}>⏰</span>;
const NoteIcon = () => <span style={{ fontSize: 'inherit' }}>📝</span>;
const CalculatorIcon = () => <span style={{ fontSize: 'inherit' }}>🧮</span>;
const CheckIcon = () => <span style={{ fontSize: 'inherit' }}>✅</span>;

const QuoteDesignModal = ({
  isOpen,
  onClose,
  onSubmitQuote,
  design,
  loading = false
}) => {
  const [formData, setFormData] = useState({
    price: '',
    productionDays: '',
    adminNotes: ''
  });
  const [errors, setErrors] = useState({});
  const [suggestions, setSuggestions] = useState({});

  // Reiniciar formulario cuando se abre el modal
  useEffect(() => {
    if (isOpen && design) {
      // Calcular sugerencias basadas en el diseño
      const suggestedPrice = calculateSuggestedPrice(design);
      const suggestedDays = calculateSuggestedDays(design);
      
      setSuggestions({
        price: suggestedPrice,
        days: suggestedDays
      });

      setFormData({
        price: suggestedPrice.toString(),
        productionDays: suggestedDays.toString(),
        adminNotes: ''
      });
      setErrors({});
    }
  }, [isOpen, design]);

  // Calcular precio sugerido basado en complejidad y elementos
  const calculateSuggestedPrice = (design) => {
    if (!design) return 25;

    let basePrice = design.product?.basePrice || 20;
    const elements = design.totalElements || 1;
    const complexity = design.complexity || 'medium';

    // Multiplicadores por complejidad
    const complexityMultiplier = {
      low: 1.2,
      medium: 1.5,
      high: 2.0
    };

    // Costo adicional por elementos
    const elementCost = Math.max(0, elements - 1) * 3;

    const suggestedPrice = (basePrice * complexityMultiplier[complexity]) + elementCost;
    return Math.round(suggestedPrice * 100) / 100;
  };

  // Calcular días sugeridos basado en complejidad
  const calculateSuggestedDays = (design) => {
    if (!design) return 3;

    const complexity = design.complexity || 'medium';
    const elements = design.totalElements || 1;

    const baseDays = {
      low: 2,
      medium: 3,
      high: 5
    };

    const extraDays = Math.floor(elements / 3);
    return baseDays[complexity] + extraDays;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Limpiar error cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validar precio
    if (!formData.price) {
      newErrors.price = 'El precio es obligatorio';
    } else if (isNaN(formData.price) || parseFloat(formData.price) <= 0) {
      newErrors.price = 'El precio debe ser un número válido mayor que 0';
    } else if (parseFloat(formData.price) > 1000) {
      newErrors.price = 'El precio parece demasiado alto. ¿Estás seguro?';
    }

    // Validar días de producción
    if (!formData.productionDays) {
      newErrors.productionDays = 'Los días de producción son obligatorios';
    } else if (isNaN(formData.productionDays) || parseInt(formData.productionDays) <= 0) {
      newErrors.productionDays = 'Debe ser un número válido mayor que 0';
    } else if (parseInt(formData.productionDays) > 30) {
      newErrors.productionDays = 'El tiempo máximo es 30 días';
    }

    // Validar notas (opcional pero con límite)
    if (formData.adminNotes && formData.adminNotes.length > 500) {
      newErrors.adminNotes = 'Las notas no pueden exceder 500 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await onSubmitQuote({
        price: parseFloat(formData.price),
        productionDays: parseInt(formData.productionDays),
        adminNotes: formData.adminNotes.trim()
      });
      
      // El modal se cerrará desde el componente padre tras el éxito
    } catch (error) {
      console.error('Error al enviar cotización:', error);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  const handleUseSuggestion = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value.toString()
    }));
    
    // Limpiar error si existe
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="quote-modal-overlay" onClick={handleClose}>
      <div className="quote-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header del modal */}
        <div className="quote-modal__header">
          <div className="quote-modal__header-info">
            <div className="quote-modal__icon">
              <MoneyIcon />
            </div>
            <div>
              <h2 className="quote-modal__title">Cotizar Diseño</h2>
              <p className="quote-modal__subtitle">
                {design?.name || 'Nuevo diseño'}
              </p>
            </div>
          </div>
          <button 
            className="quote-modal__close-btn"
            onClick={handleClose}
            disabled={loading}
            type="button"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Información del diseño */}
        {design && (
          <div className="quote-modal__design-info">
            <div className="quote-modal__design-preview">
              {design.previewImage || design.productImage ? (
                <img 
                  src={design.previewImage || design.productImage} 
                  alt={design.name}
                  className="quote-modal__design-image"
                />
              ) : (
                <div className="quote-modal__design-placeholder">
                  Sin vista previa
                </div>
              )}
            </div>
            
            <div className="quote-modal__design-details">
              <div className="quote-modal__detail-item">
                <span className="quote-modal__detail-label">Producto:</span>
                <span className="quote-modal__detail-value">{design.productName}</span>
              </div>
              <div className="quote-modal__detail-item">
                <span className="quote-modal__detail-label">Cliente:</span>
                <span className="quote-modal__detail-value">{design.userName}</span>
              </div>
              <div className="quote-modal__detail-item">
                <span className="quote-modal__detail-label">Complejidad:</span>
                <span className={`quote-modal__complexity quote-modal__complexity--${design.complexity}`}>
                  {design.complexity === 'low' ? 'Básica' : 
                   design.complexity === 'medium' ? 'Intermedia' : 'Compleja'}
                </span>
              </div>
              <div className="quote-modal__detail-item">
                <span className="quote-modal__detail-label">Elementos:</span>
                <span className="quote-modal__detail-value">{design.totalElements}</span>
              </div>
            </div>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="quote-modal__form">
          {/* Campo de precio */}
          <div className="quote-modal__field-group">
            <label className="quote-modal__label">
              <MoneyIcon />
              <span>Precio (USD)</span>
            </label>
            <div className="quote-modal__input-wrapper">
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                className={`quote-modal__input ${errors.price ? 'quote-modal__input--error' : ''}`}
                placeholder="25.00"
                step="0.01"
                min="0.01"
                max="1000"
                disabled={loading}
              />
              {suggestions.price && (
                <button
                  type="button"
                  className="quote-modal__suggestion-btn"
                  onClick={() => handleUseSuggestion('price', suggestions.price)}
                  disabled={loading}
                  title={`Precio sugerido: $${suggestions.price}`}
                >
                  <CalculatorIcon />
                  <span>Sugerido: ${suggestions.price}</span>
                </button>
              )}
            </div>
            {errors.price && (
              <span className="quote-modal__error">{errors.price}</span>
            )}
          </div>

          {/* Campo de días de producción */}
          <div className="quote-modal__field-group">
            <label className="quote-modal__label">
              <ClockIcon />
              <span>Días de producción</span>
            </label>
            <div className="quote-modal__input-wrapper">
              <input
                type="number"
                name="productionDays"
                value={formData.productionDays}
                onChange={handleInputChange}
                className={`quote-modal__input ${errors.productionDays ? 'quote-modal__input--error' : ''}`}
                placeholder="3"
                min="1"
                max="30"
                disabled={loading}
              />
              {suggestions.days && (
                <button
                  type="button"
                  className="quote-modal__suggestion-btn"
                  onClick={() => handleUseSuggestion('productionDays', suggestions.days)}
                  disabled={loading}
                  title={`Días sugeridos: ${suggestions.days}`}
                >
                  <CalculatorIcon />
                  <span>Sugerido: {suggestions.days} días</span>
                </button>
              )}
            </div>
            {errors.productionDays && (
              <span className="quote-modal__error">{errors.productionDays}</span>
            )}
          </div>

          {/* Campo de notas */}
          <div className="quote-modal__field-group">
            <label className="quote-modal__label">
              <NoteIcon />
              <span>Notas para el cliente (opcional)</span>
            </label>
            <textarea
              name="adminNotes"
              value={formData.adminNotes}
              onChange={handleInputChange}
              className={`quote-modal__textarea ${errors.adminNotes ? 'quote-modal__input--error' : ''}`}
              placeholder="Detalles adicionales sobre el trabajo, materiales especiales, etc..."
              rows="4"
              maxLength="500"
              disabled={loading}
            />
            <div className="quote-modal__char-count">
              {formData.adminNotes.length}/500 caracteres
            </div>
            {errors.adminNotes && (
              <span className="quote-modal__error">{errors.adminNotes}</span>
            )}
          </div>

          {/* Resumen de la cotización */}
          <div className="quote-modal__summary">
            <h3 className="quote-modal__summary-title">Resumen de la cotización</h3>
            <div className="quote-modal__summary-content">
              <div className="quote-modal__summary-item">
                <span>Precio total:</span>
                <span className="quote-modal__summary-value">
                  ${formData.price || '0.00'}
                </span>
              </div>
              <div className="quote-modal__summary-item">
                <span>Tiempo de entrega:</span>
                <span className="quote-modal__summary-value">
                  {formData.productionDays || '0'} días
                </span>
              </div>
              {formData.price && formData.productionDays && (
                <div className="quote-modal__summary-item quote-modal__summary-item--highlight">
                  <span>Precio por día:</span>
                  <span className="quote-modal__summary-value">
                    ${(parseFloat(formData.price) / parseInt(formData.productionDays)).toFixed(2)}/día
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Botones de acción */}
          <div className="quote-modal__actions">
            <button
              type="button"
              className="quote-modal__btn quote-modal__btn--secondary"
              onClick={handleClose}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="quote-modal__btn quote-modal__btn--primary"
              disabled={loading || !formData.price || !formData.productionDays}
            >
              {loading ? (
                <div className="quote-modal__loading-spinner"></div>
              ) : (
                <>
                  <CheckIcon />
                  <span>Enviar Cotización</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuoteDesignModal;