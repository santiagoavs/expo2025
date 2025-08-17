import { useState, useEffect } from 'react';
import { paymentMethodsService } from '../api/paymentMethodsService';
import { useAuth } from '../context/authContext';

export const usePaymentMethods = () => {
  const { user, isAuthenticated } = useAuth();
  const [methods, setMethods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cargar métodos de pago cuando el usuario esté autenticado
  useEffect(() => {
    if (isAuthenticated && user) {
      loadPaymentMethods();
    } else {
      // Si no hay usuario, limpiar los métodos
      setMethods([]);
      setError(null);
    }
  }, [isAuthenticated, user]);

  const loadPaymentMethods = async () => {
    try {
      console.log('🔄 [usePaymentMethods] Cargando métodos de pago');
      setLoading(true);
      setError(null);

      const userMethods = await paymentMethodsService.getPaymentMethods();
      console.log('✅ [usePaymentMethods] Métodos cargados:', userMethods);
      
      setMethods(Array.isArray(userMethods) ? userMethods : []);
    } catch (err) {
      console.error('❌ [usePaymentMethods] Error cargando métodos:', err);
      setError(err.message || 'Error cargando métodos de pago');
      setMethods([]);
    } finally {
      setLoading(false);
    }
  };

  const detectCardType = (number) => {
    const cleanNumber = number.replace(/\s/g, '');
    
    if (/^4/.test(cleanNumber)) return 'visa';
    if (/^5[1-5]/.test(cleanNumber)) return 'mastercard';
    if (/^3[47]/.test(cleanNumber)) return 'amex';
    if (/^6/.test(cleanNumber)) return 'discover';
    
    return 'unknown';
  };

  const validateCard = (cardData) => {
    const { number, name, expiry } = cardData;
    
    if (!number || number.replace(/\s/g, '').length < 13) {
      throw new Error('Ingresa un número de tarjeta válido (mínimo 13 dígitos)');
    }
    
    if (!name || name.trim().length < 2) {
      throw new Error('Ingresa un nombre válido');
    }
    
    if (!expiry || expiry.length !== 5) {
      throw new Error('Ingresa una fecha de expiración válida (MM/AA)');
    }

    // Validar que la fecha no sea pasada
    const [month, year] = expiry.split('/');
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear() % 100;
    const currentMonth = currentDate.getMonth() + 1;
    
    if (parseInt(year) < currentYear || (parseInt(year) === currentYear && parseInt(month) < currentMonth)) {
      throw new Error('La fecha de expiración no puede ser pasada');
    }

    return true;
  };

  const addPaymentMethod = async (cardData) => {
    try {
      console.log('🆕 [usePaymentMethods] Agregando método de pago');
      setLoading(true);
      setError(null);

      // Validar datos (sin CVC)
      validateCard(cardData);

      // Preparar datos para enviar al backend (SIN CVC)
      const paymentData = {
        number: cardData.number.replace(/\s/g, ''), // Enviar número completo al backend
        name: cardData.name.trim(),
        expiry: cardData.expiry,
        issuer: detectCardType(cardData.number),
        nickname: cardData.nickname?.trim() || '',
        active: false // Los nuevos métodos inician inactivos
      };

      const newMethod = await paymentMethodsService.createPaymentMethod(paymentData);
      
      // Actualizar lista local
      setMethods(prev => [...prev, newMethod]);
      
      console.log('✅ [usePaymentMethods] Método agregado exitosamente');
      return newMethod;
    } catch (err) {
      console.error('❌ [usePaymentMethods] Error agregando método:', err);
      const errorMessage = err.message || 'Error agregando método de pago';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updatePaymentMethod = async (methodId, cardData) => {
    try {
      console.log('🔄 [usePaymentMethods] Actualizando método:', methodId);
      setLoading(true);
      setError(null);

      // Validar datos (sin CVC)
      validateCard(cardData);

      // Preparar datos para enviar al backend (SIN CVC)
      const paymentData = {
        number: cardData.number.replace(/\s/g, ''),
        name: cardData.name.trim(),
        expiry: cardData.expiry,
        issuer: detectCardType(cardData.number),
        nickname: cardData.nickname?.trim() || ''
      };

      const updatedMethod = await paymentMethodsService.updatePaymentMethod(methodId, paymentData);
      
      // Actualizar lista local
      setMethods(prev => 
        prev.map(method => 
          method._id === methodId ? updatedMethod : method
        )
      );
      
      console.log('✅ [usePaymentMethods] Método actualizado exitosamente');
      return updatedMethod;
    } catch (err) {
      console.error('❌ [usePaymentMethods] Error actualizando método:', err);
      const errorMessage = err.message || 'Error actualizando método de pago';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const deletePaymentMethod = async (methodId) => {
    try {
      console.log('🗑️ [usePaymentMethods] Eliminando método:', methodId);
      setLoading(true);
      setError(null);

      await paymentMethodsService.deletePaymentMethod(methodId);
      
      // Actualizar lista local
      setMethods(prev => prev.filter(method => method._id !== methodId));
      
      console.log('✅ [usePaymentMethods] Método eliminado exitosamente');
    } catch (err) {
      console.error('❌ [usePaymentMethods] Error eliminando método:', err);
      const errorMessage = err.message || 'Error eliminando método de pago';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const togglePaymentMethod = async (methodId, isActive) => {
    try {
      console.log('🔄 [usePaymentMethods] Cambiando estado del método:', methodId, 'activo:', isActive);
      setLoading(true);
      setError(null);

      // Si estamos activando un método, desactivar todos los demás primero
      if (isActive) {
        setMethods(prev => 
          prev.map(method => ({ ...method, active: false }))
        );
      }

      const updatedMethod = await paymentMethodsService.togglePaymentMethod(methodId, isActive);
      
      // Actualizar lista local
      setMethods(prev => 
        prev.map(method => {
          if (method._id === methodId) {
            return { ...method, active: isActive };
          }
          // Si estamos activando uno, desactivar los demás
          return isActive ? { ...method, active: false } : method;
        })
      );
      
      console.log('✅ [usePaymentMethods] Estado cambiado exitosamente');
    } catch (err) {
      console.error('❌ [usePaymentMethods] Error cambiando estado:', err);
      const errorMessage = err.message || 'Error cambiando estado del método';
      setError(errorMessage);
      
      // Revertir cambio local en caso de error
      await loadPaymentMethods();
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    methods,
    loading,
    error,
    addPaymentMethod,
    updatePaymentMethod,
    deletePaymentMethod,
    togglePaymentMethod,
    refreshMethods: loadPaymentMethods,
    clearError: () => setError(null)
  };
};