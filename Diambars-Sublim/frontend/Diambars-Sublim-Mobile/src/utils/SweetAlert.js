// src/utils/SweetAlert.js - Sistema de alertas personalizado con paleta de colores
import { Alert } from 'react-native';

// Paleta de colores personalizada
const COLORS = {
  light: '#F2F2F2',
  primary: '#1F64BF',
  secondary: '#032CA6',
  dark: '#010326',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6'
};

// Configuración base de alertas
const ALERT_CONFIG = {
  // Estilos de botones
  buttonStyle: {
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginHorizontal: 8,
    minWidth: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Colores de botones
  buttonColors: {
    primary: {
      backgroundColor: COLORS.primary,
      color: '#FFFFFF'
    },
    secondary: {
      backgroundColor: COLORS.light,
      color: COLORS.dark
    },
    success: {
      backgroundColor: COLORS.success,
      color: '#FFFFFF'
    },
    warning: {
      backgroundColor: COLORS.warning,
      color: '#FFFFFF'
    },
    error: {
      backgroundColor: COLORS.error,
      color: '#FFFFFF'
    },
    cancel: {
      backgroundColor: 'transparent',
      color: COLORS.dark,
      borderWidth: 1,
      borderColor: COLORS.light
    }
  }
};

// ==================== ALERTAS BÁSICAS ====================

/**
 * Alerta de éxito
 */
export const showSuccess = (title, message, onPress = null) => {
  Alert.alert(
    title || '¡Éxito!',
    message || 'Operación completada exitosamente',
    [
      {
        text: 'Continuar',
        style: 'default',
        onPress: onPress
      }
    ],
    { cancelable: false }
  );
};

/**
 * Alerta de error
 */
export const showError = (title, message, onPress = null) => {
  Alert.alert(
    title || 'Error',
    message || 'Ha ocurrido un error inesperado',
    [
      {
        text: 'Entendido',
        style: 'default',
        onPress: onPress
      }
    ],
    { cancelable: false }
  );
};

/**
 * Alerta de advertencia
 */
export const showWarning = (title, message, onPress = null) => {
  Alert.alert(
    title || 'Advertencia',
    message || 'Por favor, revisa la información',
    [
      {
        text: 'Entendido',
        style: 'default',
        onPress: onPress
      }
    ],
    { cancelable: false }
  );
};

/**
 * Alerta informativa
 */
export const showInfo = (title, message, onPress = null) => {
  Alert.alert(
    title || 'Información',
    message || 'Información importante',
    [
      {
        text: 'Continuar',
        style: 'default',
        onPress: onPress
      }
    ],
    { cancelable: false }
  );
};

// ==================== ALERTAS DE CONFIRMACIÓN ====================

/**
 * Alerta de confirmación simple
 */
export const showConfirm = (title, message, onConfirm, onCancel = null) => {
  Alert.alert(
    title || 'Confirmar',
    message || '¿Estás seguro de continuar?',
    [
      {
        text: 'Cancelar',
        style: 'cancel',
        onPress: onCancel
      },
      {
        text: 'Confirmar',
        style: 'default',
        onPress: onConfirm
      }
    ],
    { cancelable: true }
  );
};

/**
 * Alerta de confirmación con opciones personalizadas
 */
export const showConfirmCustom = (title, message, confirmText, cancelText, onConfirm, onCancel = null) => {
  Alert.alert(
    title || 'Confirmar',
    message || '¿Estás seguro de continuar?',
    [
      {
        text: cancelText || 'Cancelar',
        style: 'cancel',
        onPress: onCancel
      },
      {
        text: confirmText || 'Confirmar',
        style: 'default',
        onPress: onConfirm
      }
    ],
    { cancelable: true }
  );
};

// ==================== ALERTAS DE ELIMINACIÓN ====================

/**
 * Alerta de confirmación de eliminación
 */
export const showDeleteConfirm = (itemName, onConfirm, onCancel = null) => {
  Alert.alert(
    'Eliminar',
    `¿Estás seguro de que quieres eliminar "${itemName}"? Esta acción no se puede deshacer.`,
    [
      {
        text: 'Cancelar',
        style: 'cancel',
        onPress: onCancel
      },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: onConfirm
      }
    ],
    { cancelable: true }
  );
};

/**
 * Alerta de confirmación de eliminación múltiple
 */
export const showBulkDeleteConfirm = (count, onConfirm, onCancel = null) => {
  Alert.alert(
    'Eliminar Múltiples',
    `¿Estás seguro de que quieres eliminar ${count} elementos? Esta acción no se puede deshacer.`,
    [
      {
        text: 'Cancelar',
        style: 'cancel',
        onPress: onCancel
      },
      {
        text: 'Eliminar Todos',
        style: 'destructive',
        onPress: onConfirm
      }
    ],
    { cancelable: true }
  );
};

// ==================== ALERTAS DE ESTADO ====================

/**
 * Alerta de cambio de estado
 */
export const showStatusChange = (itemName, newStatus, onConfirm, onCancel = null) => {
  const statusText = newStatus ? 'activar' : 'desactivar';
  const statusIcon = newStatus ? '✅' : '❌';
  
  Alert.alert(
    'Cambiar Estado',
    `${statusIcon} ¿Estás seguro de que quieres ${statusText} "${itemName}"?`,
    [
      {
        text: 'Cancelar',
        style: 'cancel',
        onPress: onCancel
      },
      {
        text: newStatus ? 'Activar' : 'Desactivar',
        style: 'default',
        onPress: onConfirm
      }
    ],
    { cancelable: true }
  );
};

// ==================== ALERTAS DE FORMULARIOS ====================

/**
 * Alerta de validación de formulario
 */
export const showValidationError = (errors) => {
  const errorList = Array.isArray(errors) ? errors : [errors];
  const errorMessage = errorList.join('\n• ');
  
  Alert.alert(
    'Errores de Validación',
    `Por favor, corrige los siguientes errores:\n\n• ${errorMessage}`,
    [
      {
        text: 'Entendido',
        style: 'default'
      }
    ],
    { cancelable: false }
  );
};

/**
 * Alerta de campos requeridos
 */
export const showRequiredFields = (fields) => {
  const fieldList = Array.isArray(fields) ? fields : [fields];
  const fieldMessage = fieldList.join(', ');
  
  Alert.alert(
    'Campos Requeridos',
    `Los siguientes campos son obligatorios: ${fieldMessage}`,
    [
      {
        text: 'Entendido',
        style: 'default'
      }
    ],
    { cancelable: false }
  );
};

// ==================== ALERTAS DE CARGA ====================

/**
 * Alerta de operación en progreso
 */
export const showLoading = (message = 'Procesando...') => {
  // En React Native, usamos un indicador de carga diferente
  // Esta función se puede usar para mostrar un modal de carga personalizado
  return {
    show: () => {
      // Implementar modal de carga personalizado si es necesario
      console.log(`Loading: ${message}`);
    },
    hide: () => {
      // Ocultar modal de carga
      console.log('Loading hidden');
    }
  };
};

// ==================== ALERTAS DE RED ====================

/**
 * Alerta de error de conexión
 */
export const showConnectionError = (onRetry = null) => {
  Alert.alert(
    'Error de Conexión',
    'No se pudo conectar al servidor. Verifica tu conexión a internet e intenta nuevamente.',
    [
      {
        text: 'Cancelar',
        style: 'cancel'
      },
      {
        text: 'Reintentar',
        style: 'default',
        onPress: onRetry
      }
    ],
    { cancelable: true }
  );
};

/**
 * Alerta de timeout
 */
export const showTimeoutError = (onRetry = null) => {
  Alert.alert(
    'Tiempo Agotado',
    'La operación tardó demasiado tiempo. ¿Deseas intentar nuevamente?',
    [
      {
        text: 'Cancelar',
        style: 'cancel'
      },
      {
        text: 'Reintentar',
        style: 'default',
        onPress: onRetry
      }
    ],
    { cancelable: true }
  );
};

// ==================== ALERTAS DE PERMISOS ====================

/**
 * Alerta de permisos insuficientes
 */
export const showPermissionError = (action) => {
  Alert.alert(
    'Permisos Insuficientes',
    `No tienes permisos para ${action}. Contacta al administrador.`,
    [
      {
        text: 'Entendido',
        style: 'default'
      }
    ],
    { cancelable: false }
  );
};

// ==================== ALERTAS DE ÉXITO ESPECÍFICAS ====================

/**
 * Alerta de creación exitosa
 */
export const showCreateSuccess = (itemName, onPress = null) => {
  showSuccess(
    '¡Creado Exitosamente!',
    `"${itemName}" ha sido creado correctamente.`,
    onPress
  );
};

/**
 * Alerta de actualización exitosa
 */
export const showUpdateSuccess = (itemName, onPress = null) => {
  showSuccess(
    '¡Actualizado Exitosamente!',
    `"${itemName}" ha sido actualizado correctamente.`,
    onPress
  );
};

/**
 * Alerta de eliminación exitosa
 */
export const showDeleteSuccess = (itemName, onPress = null) => {
  showSuccess(
    '¡Eliminado Exitosamente!',
    `"${itemName}" ha sido eliminado correctamente.`,
    onPress
  );
};

// ==================== EXPORTAR CONFIGURACIÓN ====================

export { COLORS, ALERT_CONFIG };

// Exportar todas las funciones como objeto para uso fácil
export default {
  // Básicas
  success: showSuccess,
  error: showError,
  warning: showWarning,
  info: showInfo,
  
  // Confirmación
  confirm: showConfirm,
  confirmCustom: showConfirmCustom,
  
  // Eliminación
  deleteConfirm: showDeleteConfirm,
  bulkDeleteConfirm: showBulkDeleteConfirm,
  
  // Estado
  statusChange: showStatusChange,
  
  // Formularios
  validationError: showValidationError,
  requiredFields: showRequiredFields,
  
  // Carga
  loading: showLoading,
  
  // Red
  connectionError: showConnectionError,
  timeoutError: showTimeoutError,
  
  // Permisos
  permissionError: showPermissionError,
  
  // Éxito específico
  createSuccess: showCreateSuccess,
  updateSuccess: showUpdateSuccess,
  deleteSuccess: showDeleteSuccess,
  
  // Configuración
  colors: COLORS,
  config: ALERT_CONFIG
};
