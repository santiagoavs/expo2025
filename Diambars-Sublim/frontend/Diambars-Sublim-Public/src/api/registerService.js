// src/api/registerService.js
import apiClient from './apiClient';

export const registerUser = async (userData) => {
  try {
    console.log('[registerService] Enviando datos de registro:', userData);
    
    // Normalizar datos antes de enviar
    const normalizedData = {
      name: userData.name?.trim(),
      email: userData.email?.toLowerCase().trim(),
      password: userData.password,
      phone: userData.phone?.trim(), // Mantener phone para compatibilidad
      address: userData.address?.trim(), // Si viene del frontend público
      role: userData.role || 'customer'
    };

    // Limpiar campos vacíos
    Object.keys(normalizedData).forEach(key => {
      if (normalizedData[key] === '' || normalizedData[key] === undefined) {
        delete normalizedData[key];
      }
    });

    console.log('[registerService] Datos normalizados:', normalizedData);
    
    const response = await apiClient.post('/users/register', normalizedData);
    console.log('[registerService] Registro exitoso:', response);
    return response;
  } catch (error) {
    console.error('[registerService] Error al registrar usuario:', error);
    
    // Mejorar manejo de errores
    let errorMessage = 'Error al registrar usuario';
    
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
      errorMessage = error.response.data.errors.join(', ');
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    throw new Error(errorMessage);
  }
};