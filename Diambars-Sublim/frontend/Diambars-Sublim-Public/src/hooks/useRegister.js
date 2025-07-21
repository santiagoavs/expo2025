// src/hooks/useRegister.js
import { useForm } from 'react-hook-form';
import { registerUser } from '../api/registerService';
import { useNavigate } from 'react-router-dom';

export const useRegister = () => {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    reset
  } = useForm();

  const onSubmit = async (data) => {
    try {
      await registerUser(data);

      // Redirige a pantalla de verificación
      navigate('/verifyEmail', { state: { email: data.email } });

      reset();
    } catch (error) {
      const message = error.message || 'Error al registrar';
      setError('root', { message });
    }
  };

  return {
    register,
    handleSubmit,
    errors,
    isSubmitting,
    onSubmit
  };
};
