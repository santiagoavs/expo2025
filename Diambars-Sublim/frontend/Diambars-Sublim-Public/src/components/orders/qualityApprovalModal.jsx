import React, { useState, useEffect } from 'react';
import { X, CheckCircle, XCircle, Image, Info, SpinnerGap } from '@phosphor-icons/react';
import './orderModals.css';

const QualityApprovalModal = ({ isOpen, onClose, order, onSubmit, loading }) => {
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [decision, setDecision] = useState(null); // 'approve' or 'reject'
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');

  // Reset form when modal opens/closes or order changes
  useEffect(() => {
    if (isOpen && order?.productionPhotos?.length > 0) {
      setSelectedPhoto(order.productionPhotos[0]);
      setDecision(null);
      setFeedback('');
      setError('');
    }
  }, [isOpen, order]);

  if (!isOpen || !order) return null;

  const pendingPhotos = order.productionPhotos?.filter(photo => !photo.clientResponse) || [];
  
  if (pendingPhotos.length === 0) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-container" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h2>Control de Calidad</h2>
            <button className="close-button" onClick={onClose}>
              <X size={24} />
            </button>
          </div>
          <div className="modal-content centered-message">
            <CheckCircle size={48} weight="fill" className="success-icon" />
            <h3>¡Todas las fotos han sido revisadas!</h3>
            <p>No hay más fotos pendientes de aprobación para esta orden.</p>
          </div>
          <div className="modal-footer">
            <button className="primary-button" onClick={onClose}>
              Cerrar
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!decision) {
      setError('Por favor, selecciona una opción (Aprobar o Rechazar)');
      return;
    }
    
    if (decision === 'reject' && !feedback.trim()) {
      setError('Por favor, proporciona una razón para el rechazo');
      return;
    }
    
    onSubmit({
      orderId: order._id,
      photoId: selectedPhoto._id,
      approved: decision === 'approve',
      feedback: decision === 'approve' ? 'Aprobado por el cliente' : feedback
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container quality-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Control de Calidad - Orden #{order.orderNumber}</h2>
          <button className="close-button" onClick={onClose}>
            <X size={24} />
          </button>
        </div>
        
        <div className="quality-content">
          {/* Photo List */}
          <div className="photo-list">
            <h3>Fotos de Producción</h3>
            <div className="photo-thumbnails">
              {order.productionPhotos?.map((photo, index) => (
                <div 
                  key={photo._id || index}
                  className={`photo-thumbnail ${selectedPhoto?._id === photo._id ? 'selected' : ''}`}
                  onClick={() => setSelectedPhoto(photo)}
                >
                  <Image size={24} weight="fill" />
                  <span>Foto {index + 1}</span>
                  {photo.clientResponse && (
                    <span className={`status-badge ${photo.clientResponse.approved ? 'approved' : 'rejected'}`}>
                      {photo.clientResponse.approved ? '✓' : '✗'}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          {/* Main Content */}
          <div className="quality-main">
            {/* Photo Preview */}
            <div className="photo-preview">
              {selectedPhoto?.url ? (
                <img 
                  src={selectedPhoto.url} 
                  alt={`Foto de producción ${selectedPhoto._id}`} 
                  className="preview-image"
                />
              ) : (
                <div className="no-image">
                  <Image size={48} weight="light" />
                  <p>No hay imagen disponible</p>
                </div>
              )}
              
              <div className="photo-info">
                <p><strong>Subido el:</strong> {new Date(selectedPhoto?.uploadedAt).toLocaleDateString('es-ES')}</p>
                <p><strong>Notas del equipo:</strong> {selectedPhoto?.notes || 'Sin notas'}</p>
              </div>
            </div>
            
            {/* Approval Form */}
            <form onSubmit={handleSubmit} className="approval-form">
              <h3>¿Cómo calificas esta producción?</h3>
              
              <div className="decision-options">
                <label className={`decision-option ${decision === 'approve' ? 'selected' : ''}`}>
                  <input 
                    type="radio" 
                    name="decision" 
                    value="approve"
                    checked={decision === 'approve'}
                    onChange={() => setDecision('approve')}
                  />
                  <div className="option-content">
                    <CheckCircle size={24} weight="fill" className="approve-icon" />
                    <span>Aprobar</span>
                    <p>La producción cumple con mis expectativas.</p>
                  </div>
                </label>
                
                <label className={`decision-option ${decision === 'reject' ? 'selected' : ''}`}>
                  <input 
                    type="radio" 
                    name="decision" 
                    value="reject"
                    checked={decision === 'reject'}
                    onChange={() => setDecision('reject')}
                  />
                  <div className="option-content">
                    <XCircle size={24} weight="fill" className="reject-icon" />
                    <span>Rechazar</span>
                    <p>Hay problemas que necesitan corrección.</p>
                  </div>
                </label>
              </div>
              
              {decision === 'reject' && (
                <div className="feedback-section">
                  <label htmlFor="feedback">Explica los problemas encontrados:</label>
                  <textarea
                    id="feedback"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Describe los problemas que encontraste en la producción..."
                    rows={4}
                    required
                  />
                </div>
              )}
              
              {error && <div className="error-message">{error}</div>}
              
              <div className="form-actions">
                <button 
                  type="button" 
                  className="secondary-button"
                  onClick={onClose}
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="primary-button"
                  disabled={loading || !decision}
                >
                  {loading ? (
                    <>
                      <SpinnerGap size={20} className="spinner" />
                      Procesando...
                    </>
                  ) : 'Enviar Respuesta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QualityApprovalModal;
