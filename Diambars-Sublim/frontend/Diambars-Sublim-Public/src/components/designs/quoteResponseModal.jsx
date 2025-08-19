// src/components/designs/QuoteResponseModal.jsx - MODAL PARA RESPONDER COTIZACIONES
import React, { useState, useCallback, useEffect } from 'react';
import './quoteResponseModal.css';

const QuoteResponseModal = ({
  isOpen,
  onClose,
  design,
  onSubmit
}) => {
  // ==================== ESTADOS ====================
  const [decision, setDecision] = useState(''); // 'accept' | 'reject' | ''
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ==================== EFECTOS ====================

  // Resetear estados cuando se abre/cierra el modal
  useEffect(() => {
    if (isOpen) {
      setDecision('');
      setNotes('');
      setError('');
    }
  }, [isOpen]);

  // ==================== MANEJADORES ====================

  const handleDecisionChange = useCallback((newDecision) => {
    setDecision(newDecision);
    setError('');
  }, []);

  const handleNotesChange = useCallback((e) => {
    setNotes(e.target.value);
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    if (!decision) {
      setError('Debes seleccionar una opción');
      return;
    }

    if (decision === 'reject' && !notes.trim()) {
      setError('Debes proporcionar un motivo para rechazar la cotización');
      return;
    }

    try {
      setLoading(true);
      setError('');

      await onSubmit(design.id, {
        accept: decision === 'accept',
        notes: notes.trim()
      });

    } catch (err) {
      console.error('Error enviando respuesta:', err);
      setError(err.message || 'Error al enviar la respuesta');
    } finally {
      setLoading(false);
    }
  }, [decision, notes, design, onSubmit]);

  const handleClose = useCallback(() => {
    if (!loading) {
      onClose();
    }
  }, [loading, onClose]);

  // ==================== RENDER ====================

  if (!isOpen || !design) return null;

  // Calcular fecha estimada de entrega
  const estimatedDelivery = design.productionDays 
    ? new Date(Date.now() + design.productionDays * 24 * 60 * 60 * 1000).toLocaleDateString()
    : null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="quote-response-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title">
            <span className="modal-icon">💰</span>
            <div>
              <h2>Responder Cotización</h2>
              <p>Decide si aceptas o rechazas esta propuesta</p>
            </div>
          </div>
          <button 
            onClick={handleClose} 
            className="close-btn" 
            disabled={loading}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Content */}
          <div className="modal-content">
            {/* Información del diseño */}
            <div className="design-info-section">
              <h3>Información del Diseño</h3>
              <div className="design-summary">
                <div className="design-details">
                  <h4>{design.name}</h4>
                  <p className="product-name">{design.product?.name}</p>
                  <div className="design-meta">
                    <span>Creado: {design.createdAt?.toLocaleDateString()}</span>
                    <span>Cotizado: {design.quotedAt?.toLocaleDateString()}</span>
                  </div>
                </div>
                
                {design.previewImage && (
                  <div className="design-preview">
                    <img src={design.previewImage} alt={design.name} />
                  </div>
                )}
              </div>
            </div>

            {/* Detalles de la cotización */}
            <div className="quote-details-section">
              <h3>Detalles de la Cotización</h3>
              <div className="quote-info">
                <div className="quote-price">
                  <div className="price-label">Precio Total</div>
                  <div className="price-value">{design.formattedPrice}</div>
                </div>
                
                <div className="quote-timeline">
                  <div className="timeline-label">Tiempo de Producción</div>
                  <div className="timeline-value">
                    {design.productionDays} día{design.productionDays !== 1 ? 's' : ''}
                  </div>
                  {estimatedDelivery && (
                    <div className="estimated-delivery">
                      Fecha estimada: {estimatedDelivery}
                    </div>
                  )}
                </div>
              </div>

              {design.adminNotes && (
                <div className="admin-notes">
                  <h4>Notas del Administrador:</h4>
                  <p>"{design.adminNotes}"</p>
                </div>
              )}
            </div>

            {/* Opciones de respuesta */}
            <div className="response-section">
              <h3>Tu Decisión</h3>
              
              <div className="decision-options">
                <label className={`decision-option ${decision === 'accept' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="decision"
                    value="accept"
                    checked={decision === 'accept'}
                    onChange={(e) => handleDecisionChange(e.target.value)}
                    disabled={loading}
                  />
                  <div className="option-content accept">
                    <div className="option-icon">✅</div>
                    <div className="option-text">
                      <h4>Aceptar Cotización</h4>
                      <p>Proceder con la producción del diseño</p>
                    </div>
                  </div>
                </label>

                <label className={`decision-option ${decision === 'reject' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="decision"
                    value="reject"
                    checked={decision === 'reject'}
                    onChange={(e) => handleDecisionChange(e.target.value)}
                    disabled={loading}
                  />
                  <div className="option-content reject">
                    <div className="option-icon">❌</div>
                    <div className="option-text">
                      <h4>Rechazar Cotización</h4>
                      <p>No proceder con esta propuesta</p>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Notas adicionales */}
            <div className="notes-section">
              <h3>
                {decision === 'reject' ? 'Motivo del Rechazo *' : 'Comentarios Adicionales (Opcional)'}
              </h3>
              <textarea
                value={notes}
                onChange={handleNotesChange}
                placeholder={
                  decision === 'reject' 
                    ? 'Explica por qué rechazas esta cotización...'
                    : 'Cualquier comentario o instrucción especial...'
                }
                maxLength={500}
                className="notes-textarea"
                disabled={loading}
              />
              <div className="char-count">
                {notes.length}/500 caracteres
              </div>
            </div>

            {/* Mensaje de error */}
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            {/* Información importante */}
            <div className="important-info">
              <div className="info-icon">ℹ️</div>
              <div className="info-content">
                <h4>Información Importante</h4>
                <ul>
                  <li><strong>Si aceptas:</strong> Tu diseño entrará en producción y se generará un pedido.</li>
                  <li><strong>Si rechazas:</strong> El diseño será marcado como rechazado y no se procesará.</li>
                  <li><strong>Tiempo límite:</strong> Esta cotización es válida por 30 días.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="modal-footer">
            <button 
              type="button"
              onClick={handleClose} 
              className="btn btn-cancel"
              disabled={loading}
            >
              Cancelar
            </button>
            
            <button 
              type="submit"
              className={`btn btn-submit ${decision === 'accept' ? 'accept' : 'reject'}`}
              disabled={loading || !decision}
            >
              {loading ? 'Enviando...' : 
               decision === 'accept' ? '✅ Aceptar Cotización' : 
               decision === 'reject' ? '❌ Rechazar Cotización' : 
               'Selecciona una opción'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuoteResponseModal;