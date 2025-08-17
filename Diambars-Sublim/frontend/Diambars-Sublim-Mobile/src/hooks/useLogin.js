import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';

export const useLogin = () => {
  const { login } = useAuth();
  const navigation = useNavigation();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    reset
  } = useForm({
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const onSubmit = async (data) => {
    try {
      console.log('🚀 Intentando login con:', data.email);
      
      const user = await login(data);
      
      console.log('✅ Login exitoso:', user);
      
      // Limpiar formulario
      reset();
      
      // Navegar al panel
      navigation.replace('CatalogManagement');
      
    } catch (error) {
      console.error('❌ Error en login:', error);
      setError('root', { message: 'Error al iniciar sesión' });
    }
  };

  return {
    control,
    handleSubmit,
    errors,
    isSubmitting,
    onSubmit
  };
};