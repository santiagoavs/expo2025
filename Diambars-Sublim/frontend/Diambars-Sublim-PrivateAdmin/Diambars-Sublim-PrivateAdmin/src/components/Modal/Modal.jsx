// src/components/Modal/Modal.jsx
import React, { useEffect } from 'react';
import { X } from '@phosphor-icons/react';
import './Modal.css';

const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'medium', 
  showCloseButton = true,
  closeOnOverlayClick = true,
  className = ''
}) => {
  
  // Manejar tecla Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevenir scroll del body cuando el modal está abierto
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && closeOnOverlayClick) {
      onClose();
    }
  };

  const getModalSizeClass = () => {
    switch (size) {
      case 'small':
        return 'diambars-modal--small';
      case 'large':
        return 'diambars-modal--large';
      case 'fullscreen':
        return 'diambars-modal--fullscreen';
      default:
        return 'diambars-modal--medium';
    }
  };

  return (
    <div 
      className="diambars-modal-overlay"
      onClick={handleOverlayClick}
    >
      <div className={`diambars-modal ${getModalSizeClass()} ${className}`}>
        
        {/* Modal Header */}
        {(title || showCloseButton) && (
          <div className="diambars-modal-header">
            {title && (
              <h2 className="diambars-modal-title">{title}</h2>
            )}
            
            {showCloseButton && (
              <button 
                className="diambars-modal-close"
                onClick={onClose}
                aria-label="Cerrar modal"
              >
                <h4>X</h4>
              </button>
            )}
          </div>
        )}

        {/* Modal Body */}
        <div className="diambars-modal-body">
          {children}
        </div>

      </div>
    </div>
  );
};

export default Modal;