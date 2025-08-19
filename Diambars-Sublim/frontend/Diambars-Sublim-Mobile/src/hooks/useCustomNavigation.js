// src/hooks/useCustomNavigation.js - HOOK DE NAVEGACIÓN PERSONALIZADO

// Importamos useNavigation de React Navigation, renombrado para evitar confusión
import { useNavigation as useRNNavigation } from '@react-navigation/native';

// Importamos nuestro hook de autenticación para saber si el usuario está logueado y poder hacer logout
import { useAuth } from '../context/AuthContext';

// Importamos Toast para mostrar notificaciones visuales en la app
import Toast from 'react-native-toast-message';

// Definimos el hook personalizado
export const useCustomNavigation = () => {

  // Obtenemos el objeto de navegación de React Navigation
  const navigation = useRNNavigation();

  // Obtenemos el estado de autenticación y la función de logout desde el contexto
  const { isAuthenticated, logout } = useAuth();

  // -------------------------------
  // Funciones de navegación básicas
  // -------------------------------

  // Navegar a la pantalla de Login
  const navigateToLogin = (params = {}) => {
    navigation.navigate('Login', params);
  };

  // Navegar a la pantalla de recuperación de contraseña
  const navigateToRecovery = (params = {}) => {
    navigation.navigate('RecoveryPassword', params);
  };

  // Navegar a la pantalla de confirmación de código
  const navigateToCodeConfirmation = (email, additionalParams = {}) => {
    // Validamos que se haya proporcionado un email
    if (!email) {
      Toast.show({
        type: 'error',
        text1: 'Error de Navegación',
        text2: 'Email requerido para verificación',
      });
      return; // Salimos si no hay email
    }
    
    // Navegamos a CodeConfirmation con los parámetros necesarios
    navigation.navigate('CodeConfirmation', {
      email,
      ...additionalParams
    });
  };

  // Navegar a la pantalla de establecer nueva contraseña
  const navigateToNewPassword = (verificationToken, email, additionalParams = {}) => {
    // Validamos que exista un token de verificación
    if (!verificationToken) {
      Toast.show({
        type: 'error',
        text1: 'Error de Navegación',
        text2: 'Token de verificación requerido',
      });
      return; // Salimos si no hay token
    }
    
    // Navegamos a NewPassword con los parámetros necesarios
    navigation.navigate('NewPassword', {
      verificationToken,
      email,
      ...additionalParams
    });
  };

  // Navegar a la gestión del catálogo, solo si está autenticado
  const navigateToCatalogManagement = () => {
    if (!isAuthenticated) {
      Toast.show({
        type: 'error',
        text1: 'Acceso Denegado',
        text2: 'Debes iniciar sesión primero',
      });
      navigateToLogin(); // Redirige a login si no está autenticado
      return;
    }
    
    // Si está autenticado, navegamos normalmente
    navigation.navigate('CatalogManagement');
  };

  // -------------------------------
  // Funciones de navegación con reset del stack
  // -------------------------------

  // Reinicia la navegación y va a Login (útil después de logout)
  const resetToLogin = (params = {}) => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login', params }],
    });
  };

  // Reinicia la navegación y va a la pantalla principal si está autenticado
  const resetToMain = () => {
    if (!isAuthenticated) {
      resetToLogin(); // Si no está autenticado, vamos a login
      return;
    }
    
    navigation.reset({
      index: 0,
      routes: [{ name: 'CatalogManagement' }],
    });
  };

  // -------------------------------
  // Funciones de navegación hacia atrás
  // -------------------------------

  const goBack = (fallbackRoute = 'Login') => {
    if (navigation.canGoBack()) {
      navigation.goBack(); // Si puede regresar en el stack, lo hace
    } else {
      navigation.navigate(fallbackRoute); // Si no, va a una ruta de fallback
    }
  };

  // -------------------------------
  // Logout con navegación y notificación
  // -------------------------------

  const handleLogout = async () => {
    try {
      await logout(); // Ejecuta el logout del contexto

      // Mostramos mensaje de éxito
      Toast.show({
        type: 'success',
        text1: 'Sesión Cerrada',
        text2: 'Has salido exitosamente',
      });

      // Reseteamos la navegación a Login
      resetToLogin();
    } catch (error) {
      // Mostramos mensaje de error si falla el logout
      Toast.show({
        type: 'error',
        text1: 'Error al Cerrar Sesión',
        text2: 'Intenta nuevamente',
      });
    }
  };

  // -------------------------------
  // Funciones de navegación con transiciones (simples)
  // -------------------------------

  const slideToScreen = (screenName, params = {}) => {
    navigation.navigate(screenName, params);
  };

  const fadeToScreen = (screenName, params = {}) => {
    navigation.navigate(screenName, params);
  };

  // -------------------------------
  // Funciones auxiliares de navegación
  // -------------------------------

  // Verifica si puede ir hacia atrás
  const canGoBack = () => {
    return navigation.canGoBack();
  };

  // Obtiene el estado actual de navegación (stack completo)
  const getCurrentRoute = () => {
    return navigation.getState();
  };

  // Navegación condicional basada en autenticación
  const navigateWithAuth = (screenName, params = {}) => {
    if (isAuthenticated) {
      navigation.navigate(screenName, params); // Si está autenticado, navega
    } else {
      // Si no, muestra mensaje e ir a login
      Toast.show({
        type: 'info',
        text1: 'Inicia Sesión',
        text2: 'Necesitas estar autenticado',
      });
      navigateToLogin();
    }
  };

  // -------------------------------
  // Retorno del hook: todas las funciones y estados
  // -------------------------------

  return {
    // Navegación básica
    navigate: navigation.navigate,
    goBack,
    canGoBack,
    getCurrentRoute,
    
    // Navegación específica de la app
    navigateToLogin,
    navigateToRecovery,
    navigateToCodeConfirmation,
    navigateToNewPassword,
    navigateToCatalogManagement,
    
    // Reset navigation
    resetToLogin,
    resetToMain,
    
    // Navegación con efectos
    slideToScreen,
    fadeToScreen,
    navigateWithAuth,
    
    // Logout
    handleLogout,
    
    // Estado
    isAuthenticated,
  };
};
