
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { showError } from '../utils/sweetAlert';

export const useLogin = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError
  } = useForm();

  const onSubmit = async (data) => {
    try {
      const user = await login(data);
      
      const allowedTypes = ['employee', 'manager', 'warehouse', 'admin'];
      if (user && allowedTypes.includes(user.type.toLowerCase())) {
        const redirectPath = location.state?.from?.pathname || '/catalog-management';
        navigate(redirectPath, { replace: true });
      } else {
        setError('root', {
          type: 'manual',
          message: 'Solo personal autorizado puede acceder'
        });
      }
    } catch (error) {
      let errorMessage = error.message || 'Error al iniciar sesión';

      if (errorMessage.includes('inválidos') || errorMessage.includes('incorrectas')) {
        errorMessage = 'Credenciales incorrectas';
      } else if (error.message === 'Acceso solo para empleados') {
        errorMessage = 'Solo personal autorizado puede acceder';
      } else if (error.needsVerification) {
        navigate('/verify-email', { 
          state: { 
            email: data.email,
            message: 'Verifica tu correo antes de iniciar sesión' 
          } 
        });
        return;
      }
      
      setError('root', {
        type: 'manual',
        message: errorMessage
      });
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
