import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DiambarsCard from '../../components/DiambarsCard/DiambarsCard';
import DiambarsBrand from '../../components/DiambarsBrand/DiambarsBrand';
import DiambarsTitle from '../../components/DiambarsTitle/DiambarsTitle';
import DiambarsButton from '../../components/DiambarsButton/DiambarsButton';
import { showSuccess, showError } from '../../utils/sweetAlert';
import './codeConfirmation.css';

const CodeConfirmation = () => {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRefs = useRef([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Auto focus en el primer input al cargar
    inputRefs.current[0]?.focus();

    // Iniciar el temporizador
    startTimer();
  }, []);

  const startTimer = () => {
    setCanResend(false);
    setTimer(30);
    const interval = setInterval(() => {
      setTimer((prevTimer) => {
        if (prevTimer <= 1) {
          clearInterval(interval);
          setCanResend(true);
          return 0;
        }
        return prevTimer - 1;
      });
    }, 1000);
  };

  const handleInput = (index, value) => {
    // Solo permitir números
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto avance al siguiente input
    if (value !== '' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Retroceder al input anterior con backspace
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const completeCode = code.join('');
    if (completeCode.length !== 6) {
      await showError(
        'Código incompleto',
        'Por favor, ingresa el código completo'
      );
      return;
    }

    setIsSubmitting(true);

    try {
      // Simular llamada a API
      await new Promise(resolve => setTimeout(resolve, 1000));
      await showSuccess(
        '¡Código verificado!',
        'Tu código ha sido verificado correctamente'
      );
      navigate('/new-password'); // Ruta actualizada
    } catch (error) {
      await showError(
        'Error',
        'Código inválido. Por favor, intenta nuevamente'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendCode = async () => {
    if (!canResend) return;
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      startTimer();
      await showSuccess(
        '¡Código reenviado!',
        'Se ha enviado un nuevo código a tu correo'
      );
    } catch (error) {
      await showError(
        'Error',
        'No se pudo reenviar el código'
      );
    }
  };

  return (
    <DiambarsCard>
      <button 
        className="back-arrow"
        onClick={() => navigate('/recovery-password')}
        aria-label="Volver"
      >
        <svg 
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
      </button>
      
      <DiambarsBrand />
      
      <div className="diambars-form-column">
        <DiambarsTitle text="Verifica tu código" />
        
        <p className="code-description">
          Ingresa el código de 6 dígitos que enviamos a tu correo electrónico
        </p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="code-input-group">
            {code.map((digit, index) => (
              <input
                key={index}
                ref={el => inputRefs.current[index] = el}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleInput(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="code-input"
                required
              />
            ))}
          </div>
          
          <div className="code-actions">
            <DiambarsButton 
              text="Verificar código"
              isLoading={isSubmitting}
              disabled={isSubmitting}
            />
            
            <button
              type="button"
              className={`resend-code ${!canResend ? 'disabled' : ''}`}
              onClick={handleResendCode}
              disabled={!canResend}
            >
              {canResend ? (
                'Reenviar código'
              ) : (
                `Reenviar código en ${timer}s`
              )}
            </button>
          </div>
        </form>
      </div>
    </DiambarsCard>
  );
};

export default CodeConfirmation;