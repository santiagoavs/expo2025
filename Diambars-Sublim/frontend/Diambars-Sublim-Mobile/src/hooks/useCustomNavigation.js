// src/hooks/useCustomNavigation.js - HOOK DE NAVEGACIÓN PERSONALIZADO
import { useNavigation as useRNNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import Toast from 'react-native-toast-message';

export const useCustomNavigation = () => {
  const navigation = useRNNavigation();
  const { isAuthenticated, logout } = useAuth();

  // Navegación con validaciones y efectos
  const navigateToLogin = (params = {}) => {
    navigation.navigate('Login', params);
  };

  const navigateToRecovery = (params = {}) => {
    navigation.navigate('RecoveryPassword', params);
  };

  const navigateToCodeConfirmation = (email, additionalParams = {}) => {
    if (!email) {
      Toast.show({
        type: 'error',
        text1: 'Error de Navegación',
        text2: 'Email requerido para verificación',
      });
      return;
    }
    
    navigation.navigate('CodeConfirmation', {
      email,
      ...additionalParams
    });
  };

  const navigateToNewPassword = (verificationToken, email, additionalParams = {}) => {
    if (!verificationToken) {
      Toast.show({
        type: 'error',
        text1: 'Error de Navegación',
        text2: 'Token de verificación requerido',
      });
      return;
    }
    
    navigation.navigate('NewPassword', {
      verificationToken,
      email,
      ...additionalParams
    });
  };

  const navigateToCatalogManagement = () => {
    if (!isAuthenticated) {
      Toast.show({
        type: 'error',
        text1: 'Acceso Denegado',
        text2: 'Debes iniciar sesión primero',
      });
      navigateToLogin();
      return;
    }
    
    navigation.navigate('CatalogManagement');
  };

  // Navegación con reset del stack (útil para logout)
  const resetToLogin = (params = {}) => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login', params }],
    });
  };

  const resetToMain = () => {
    if (!isAuthenticated) {
      resetToLogin();
      return;
    }
    
    navigation.reset({
      index: 0,
      routes: [{ name: 'CatalogManagement' }],
    });
  };

  // Navegación hacia atrás con validaciones
  const goBack = (fallbackRoute = 'Login') => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate(fallbackRoute);
    }
  };

  // Logout con navegación
  const handleLogout = async () => {
    try {
      await logout();
      
      Toast.show({
        type: 'success',
        text1: 'Sesión Cerrada',
        text2: 'Has salido exitosamente',
      });
      
      resetToLogin();
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error al Cerrar Sesión',
        text2: 'Intenta nuevamente',
      });
    }
  };

  // Funciones de navegación con transiciones específicas
  const slideToScreen = (screenName, params = {}) => {
    navigation.navigate(screenName, params);
  };

  const fadeToScreen = (screenName, params = {}) => {
    navigation.navigate(screenName, params);
  };

  // Verificar si puede ir hacia atrás
  const canGoBack = () => {
    return navigation.canGoBack();
  };

  // Obtener el estado actual de navegación
  const getCurrentRoute = () => {
    return navigation.getState();
  };

  // Navegación condicional basada en autenticación
  const navigateWithAuth = (screenName, params = {}) => {
    if (isAuthenticated) {
      navigation.navigate(screenName, params);
    } else {
      Toast.show({
        type: 'info',
        text1: 'Inicia Sesión',
        text2: 'Necesitas estar autenticado',
      });
      navigateToLogin();
    }
  };

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