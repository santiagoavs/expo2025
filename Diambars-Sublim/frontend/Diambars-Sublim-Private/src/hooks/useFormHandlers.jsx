import { useState, useEffect } from 'react';
import { usePasswordRecovery } from './usePasswordRecovery';

export const useFormHandlers = () => {
  const {
    step,
    email,
    setEmail,
    code,
    setCode,
    isSubmitting,
    error,
    timer,
    canResend,
    handleRequestCode,
    handleVerifyCode,
    handleResetPassword,
    handleResendCode,
    startTimer
  } = usePasswordRecovery();

  // Manejo de inputs de código
  const handleInputChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    
    if (value && index < 5) {
      // Auto enfoque al siguiente input
      document.getElementById(`code-input-${index + 1}`)?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      // Retroceso al input anterior
      document.getElementById(`code-input-${index - 1}`)?.focus();
    }
  };

  useEffect(() => {
    if (step === 2) {
      startTimer();
    }
  }, [step]);

  return {
    step,
    email,
    setEmail,
    code,
    isSubmitting,
    error,
    timer,
    canResend,
    handleRequestCode,
    handleVerifyCode,
    handleResetPassword,
    handleResendCode,
    handleInputChange,
    handleKeyDown
  };
};