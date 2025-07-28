import React, { useState, useId } from 'react';
import { motion } from 'framer-motion';
import './ContinueButton.css';

const ContinueButton = ({ 
  onClick, 
  children, 
  className = '', 
  style, 
  isLoading = false,
  disabled = false
}) => {
  const [ripple, setRipple] = useState(false);
  const id = useId(); // Genera un ID único para cada instancia
  
  const handleClick = (e) => {
    if (!disabled && !isLoading) {
      setRipple(!ripple);
      if (onClick) onClick(e);
    }
  };

  return (
    <motion.button
      id={`continue-btn-${id}`}
      className={`cb-btn ${className}`}
      style={style}
      onClick={handleClick}
      disabled={disabled || isLoading}
      initial={false}
      whileHover={!disabled && !isLoading ? {
        y: -2,
        backgroundColor: 'rgba(47, 77, 110, 0.95)',
        boxShadow: '0 12px 32px rgba(40, 60, 62, 0.25), 0 0 0 1px rgba(180, 220, 255, 0.6)',
        transition: { duration: 0.3 }
      } : {}}
      whileTap={!disabled && !isLoading ? {
        y: 1,
        scale: 0.98,
        boxShadow: '0 4px 16px rgba(40, 60, 62, 0.15), 0 0 0 1px rgba(180, 220, 255, 0.3)',
        transition: { duration: 0.2 }
      } : {}}
      aria-busy={isLoading}
      aria-disabled={disabled}
    >
      {isLoading ? (
        <div id={`spinner-${id}`} className="cb-spinner" aria-label="Loading"></div>
      ) : (
        <>
          <span id={`text-${id}`} className="cb-text">{children || 'Continue to Design'}</span>
          <motion.span 
            id={`arrow-${id}`}
            className="cb-arrow"
            animate={!disabled && !isLoading ? {
              x: [0, 4, 0],
            } : {}}
            transition={{
              repeat: Infinity,
              duration: 1.5,
              ease: "easeInOut"
            }}
            aria-hidden="true"
          >
            →
          </motion.span>
        </>
      )}
      
      {ripple && (
        <motion.span
          id={`ripple-${id}`}
          className="cb-ripple"
          initial={{ scale: 0, opacity: 0.6 }}
          animate={{ scale: 3, opacity: 0 }}
          transition={{ duration: 0.6 }}
          onAnimationComplete={() => setRipple(false)}
          aria-hidden="true"
        />
      )}
    </motion.button>
  );
};

export default ContinueButton;