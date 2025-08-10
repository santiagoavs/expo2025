import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import './modal.css';

const Modal = ({ isOpen, onClose, children }) => {
  useEffect(() => {
    if (isOpen) {
      // Prevenir scroll del body
      document.body.classList.add('modal-open');
    } else {
      // Restaurar scroll del body
      document.body.classList.remove('modal-open');
    }

    // Cleanup al desmontar o cambiar isOpen
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [isOpen]);

  useEffect(() => {
    // Manejar tecla Escape
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  const handleBackdropClick = (e) => {
    // Cerrar modal solo si se hace click en el backdrop, no en el contenido
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  // Usar createPortal para renderizar el modal directamente en body
  return createPortal(
    <div 
      className="modal-backdrop" 
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="modal-content">
        <button 
          className="modal-close" 
          onClick={onClose}
          aria-label="Cerrar modal"
          type="button"
        >
          ×
        </button>
        {children}
      </div>
    </div>,
    document.body
  );
};

export default Modal;