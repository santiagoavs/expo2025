// src/hooks/useLogin.js
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const useLogin = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError
  } = useForm();

  const onSubmit = async (data) => {
    try {
      const user = await login(data); // Usa login desde el contexto

      if (!user.verified) {
        // Redirigir si el usuario no ha verificado su correo
        navigate('/verify-email', { state: { email: data.email } });
        return;
      }

      console.log('[useLogin] Usuario autenticado:', user);
    } catch (error) {
      let message = 'Error al iniciar sesión';

      if (error?.message?.includes('Credenciales')) {
        message = 'Credenciales incorrectas';
      }

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
