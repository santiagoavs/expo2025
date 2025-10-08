// src/components/designs/QuoteResponseModal.jsx - VERSIÓN CON ICONOS
import React, { useState, useCallback, useEffect } from 'react';
import {
  CurrencyDollar,
  X,
  CheckCircle,
  XCircle,
  Clock,
  Cube,
  Calendar,
  Palette,
  Note,
  Info,
  Warning,
  ChatCircleDots,
  SpinnerGap
} from '@phosphor-icons/react';
import './quoteResponseModal.css';

const QuoteResponseModal = ({
  isOpen,
  onClose,
  design,
  onSubmit,
  loading = false,
  error = null
}) => {
  // ==================== ESTADOS ====================
  const [decision, setDecision] = useState(null); // 'accept' | 'reject' | null
  const [clientNotes, setClientNotes] = useState('');
  const [validationError, setValidationError] = useState('');

  // ==================== EFECTOS ====================
  
  // Reset form cuando el modal se cierra
  useEffect(() => {
    if (!isOpen) {
      setDecision(null);
      setClientNotes('');
      setValidationError('');
    }
  }, [isOpen]);

  // Prevenir scroll del body
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // ==================== CÁLCULOS ====================
  
  const estimatedDeliveryDate = design?.estimatedDays 
    ? new Date(Date.now() + design.estimatedDays * 24 * 60 * 60 * 1000)
    : null;

  const formattedDeliveryDate = estimatedDeliveryDate
    ? estimatedDeliveryDate.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : 'A definir';

  // ==================== VALIDACIÓN ====================
  
  const validateForm = useCallback(() => {
    if (!decision) {
      setValidationError('Debes seleccionar una opción: Aceptar o Rechazar');
      return false;
    }

    if (decision === 'reject' && !clientNotes.trim()) {
      setValidationError('Por favor, explica por qué rechazas la cotización');
      return false;
    }

    if (clientNotes.length > 1000) {
      setValidationError('Las notas no pueden exceder 1000 caracteres');
      return false;
    }

    setValidationError('');
    return true;
  }, [decision, clientNotes]);

  // ==================== MANEJADORES ====================
  
  const handleDecisionChange = useCallback((newDecision) => {
    setDecision(newDecision);
    setValidationError('');
  }, []);

  const handleNotesChange = useCallback((e) => {
    const value = e.target.value;
    if (value.length <= 1000) {
      setClientNotes(value);
      setValidationError('');
    }
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    // Check if design is in 'quoted' state
    if (design?.status !== 'quoted') {
      setValidationError('No puedes responder a una cotización que no esté en estado "cotizada"');
      return;
    }
    
    try {
      await onSubmit(design._id || design.id, decision === 'accept', clientNotes);
    } catch (err) {
      setValidationError(err.message || 'Error al procesar la respuesta');
    }
  }, [design, decision, clientNotes, onSubmit, validateForm]);

  const handleClose = useCallback(() => {
    if (!loading) {
      onClose();
    }
  }, [loading, onClose]);

  const handleBackdropClick = useCallback((e) => {
    if (e.target === e.currentTarget && !loading) {
      onClose();
    }
  }, [loading, onClose]);

  // ==================== RENDER ====================
  
  if (!isOpen || !design) return null;

  return (
    <div className="quote-modal-overlay" onClick={handleBackdropClick}>
      <div className="quote-response-modal" onClick={(e) => e.stopPropagation()}>
        
        {/* ==================== HEADER ==================== */}
        <div className="modal-header-response">
          <div className="modal-title-response">
            <span className="modal-icon">
              <CurrencyDollar size={32} weight="duotone" />
            </span>
            <div>
              <h2>Responder Cotización</h2>
              <p>Revisa los detalles y decide si deseas continuar</p>
            </div>
          </div>
          <button 
            onClick={handleClose} 
            className="close-btn-quote"
            disabled={loading}
            aria-label="Cerrar modal"
          >
            <X size={20} weight="bold" />
          </button>
        </div>

        {/* ==================== CONTENT ==================== */}
        <div className="modal-content-quote">
          
          {/* Información del Diseño */}
          <div className="design-info-section">
            <h3>
              <Palette size={20} weight="duotone" />
              Información del Diseño
            </h3>
            <div className="design-summary">
              <div className="design-details">
                <h4>{design.name}</h4>
                <p className="product-name">
                  <Cube size={16} weight="duotone" />
                  {' '}Producto: {design.product?.name || 'Producto personalizado'}
                </p>
                <div className="design-meta">
                  <span>
                    <Palette size={14} weight="duotone" />
                    {' '}Estado: {design.statusLabel || design.status}
                  </span>
                  {design.createdAt && (
                    <span>
                      <Calendar size={14} weight="duotone" />
                      {' '}Creado: {new Date(design.createdAt).toLocaleDateString('es-ES')}
                    </span>
                  )}
                </div>
              </div>
              {design.previewImage && (
                <div className="design-preview">
                  <img src={design.previewImage} alt={design.name} />
                </div>
              )}
            </div>
          </div>

          {/* Detalles de la Cotización */}
          <div className="quote-details-section">
            <h3>
              <CurrencyDollar size={20} weight="duotone" />
              Detalles de la Cotización
            </h3>
            
            <div className="quote-info">
              {/* Precio */}
              <div className="quote-price">
                <div className="price-label">Precio Total</div>
                <div className="price-value-response">
                  {design.formattedPrice || `$${design.price?.toFixed(2) || '0.00'}`}
                </div>
              </div>

              {/* Tiempo de Producción */}
              <div className="quote-timeline">
                <div className="timeline-label">Tiempo de Producción</div>
                <div className="timeline-value">
                  {design.estimatedDays || design.productionDays || '7'} días
                </div>
                <div className="estimated-delivery">
                  <Calendar size={14} weight="duotone" />
                  {' '}Entrega estimada: {formattedDeliveryDate}
                </div>
              </div>
            </div>

            {/* Notas del Administrador */}
            {design.adminNotes && (
              <div className="admin-notes">
                <h4>
                  <Note size={16} weight="duotone" />
                  {' '}Notas del Administrador
                </h4>
                <p>"{design.adminNotes}"</p>
              </div>
            )}
          </div>

          {/* Decisión */}
          <div className="decision-section">
            <h3>
              <CheckCircle size={20} weight="duotone" />
              Tu Decisión
            </h3>
            
            <div className="decision-options">
              {/* Opción: Aceptar */}
              <label 
                className={`decision-option ${decision === 'accept' ? 'selected' : ''}`}
                htmlFor="accept-option"
              >
                <input
                  type="radio"
                  id="accept-option"
                  name="decision"
                  checked={decision === 'accept'}
                  onChange={() => handleDecisionChange('accept')}
                />
                <div className="option-content accept">
                  <span className="option-icon">
                    <CheckCircle size={40} weight="duotone" color="#10B981" />
                  </span>
                  <div className="option-text">
                    <h4>Aceptar Cotización</h4>
                    <p>Confirmar y proceder con la producción</p>
                  </div>
                </div>
              </label>

              {/* Opción: Rechazar */}
              <label 
                className={`decision-option ${decision === 'reject' ? 'selected' : ''}`}
                htmlFor="reject-option"
              >
                <input
                  type="radio"
                  id="reject-option"
                  name="decision"
                  checked={decision === 'reject'}
                  onChange={() => handleDecisionChange('reject')}
                />
                <div className="option-content reject">
                  <span className="option-icon">
                    <XCircle size={40} weight="duotone" color="#EF4444" />
                  </span>
                  <div className="option-text">
                    <h4>Rechazar Cotización</h4>
                    <p>Cancelar y solicitar cambios</p>
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Notas del Cliente */}
          <div className="notes-section">
            <h3>
              <ChatCircleDots size={20} weight="duotone" />
              {decision === 'accept' ? ' Notas Adicionales (Opcional)' : ' Motivo del Rechazo'}
              {decision === 'reject' && <span className="required-badge">Requerido</span>}
            </h3>
            <textarea
              value={clientNotes}
              onChange={handleNotesChange}
              placeholder={
                decision === 'accept'
                  ? '¿Hay algo más que quieras que sepamos? (Opcional)'
                  : 'Por favor, explica por qué rechazas la cotización...'
              }
              className="notes-textarea"
              rows={4}
              maxLength={1000}
            />
            <div className="char-count-response">
              {clientNotes.length} / 1000 caracteres
            </div>
          </div>

          {/* Información Importante */}
          <div className="important-info">
            <span className="info-icon">
              <Info size={32} weight="duotone" color="#112f57" />
            </span>
            <div className="info-content">
              <h4>Información Importante</h4>
              <ul>
                <li>
                  <strong>Si aceptas:</strong> La producción comenzará y se procesará el pago según el método seleccionado.
                </li>
                <li>
                  <strong>Si rechazas:</strong> Podrás solicitar cambios o ajustes al diseño antes de continuar.
                </li>
                <li>
                  <strong>Cambios posteriores:</strong> Una vez iniciada la producción, los cambios no estarán disponibles.
                </li>
              </ul>
            </div>
          </div>

          {/* Mensajes de Error */}
          {(error || validationError) && (
            <div className="error-message">
              <Warning size={16} weight="bold" />
              {' '}{error || validationError}
            </div>
          )}
        </div>

        {/* ==================== FOOTER ==================== */}
        <div className="modal-footer">
          <button
            type="button"
            onClick={handleClose}
            className="btn btn-cancel"
            disabled={loading}
          >
            <X size={18} weight="bold" />
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            className={`btn btn-submit-response ${decision === 'accept' ? 'accept' : decision === 'reject' ? 'reject' : ''}`}
            disabled={loading || !decision}
          >
            {loading ? (
              <>
                <SpinnerGap size={18} weight="bold" className="spinner-icon" />
                Procesando...
              </>
            ) : decision === 'accept' ? (
              <>
                <CheckCircle size={18} weight="bold" />
                Aceptar Cotización
              </>
            ) : decision === 'reject' ? (
              <>
                <XCircle size={18} weight="bold" />
                Rechazar Cotización
              </>
            ) : (
              'Selecciona una opción'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuoteResponseModal;