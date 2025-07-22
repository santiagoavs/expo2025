// src/hooks/useLogin.js
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/authContext';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../api/loginService.js';

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
      const user = await loginUser(data);
      login(user); // Guardar usuario en contexto
      
      // Si llega aquí, significa que el usuario sí está verificado
      navigate('/profile');
    } catch (error) {
      // Debug: ver qué está llegando del backend
      console.log('Error completo:', error);
      console.log('Status:', error?.response?.status);
      console.log('Data:', error?.response?.data);
      console.log('Message:', error?.message);
      console.log('needsVerification:', error?.needsVerification);

      let message = 'Error al iniciar sesión';

      // Verificar si es un error de correo no verificado
      // El error puede venir en diferentes formatos
      const isVerificationError = 
        error?.needsVerification === true || 
        error?.response?.data?.needsVerification === true ||
        (error?.message && error.message.toLowerCase().includes('verifica')) ||
        (error?.response?.data?.message && error.response.data.message.toLowerCase().includes('verifica'));

      if (isVerificationError) {
        console.log('Detectado error de verificación');
        setError('root', { 
          message: 'NEEDS_VERIFICATION',
          email: data.email 
        });
        return;
      }

      // Verificar otros tipos de error
      if (error?.response?.status === 401 || 
          (error?.message && error.message.toLowerCase().includes('credenciales'))) {
        message = 'Credenciales incorrectas';
      }

      setError('root', { message });
    }
  };

  const handleVerifyEmailClick = (email) => {
    navigate('/verifyEmail', { state: { email, fromLogin: true } });
  };

  return {
    register,
    handleSubmit,
    errors,
    isSubmitting,
    onSubmit,
    handleVerifyEmailClick
  };
};