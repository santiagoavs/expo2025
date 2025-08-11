// utils/locationUtils.js - Utilidades de ubicación optimizadas
import { EL_SALVADOR_LOCATIONS, DELIVERY_FEES, DELIVERY_CONFIG } from '../constants/locations.js';

/**
 * Valida si un departamento existe
 */
export const isValidDepartment = (department) => {
  if (!department || typeof department !== 'string') return false;
  return Object.keys(EL_SALVADOR_LOCATIONS).includes(department.trim());
};

/**
 * Valida si un municipio pertenece al departamento
 */
export const isValidMunicipality = (department, municipality) => {
  if (!department || !municipality) return false;
  if (!isValidDepartment(department)) return false;
  
  const municipalities = EL_SALVADOR_LOCATIONS[department.trim()];
  return municipalities && municipalities.includes(municipality.trim());
};

/**
 * Valida formato de teléfono salvadoreño
 */
export const isValidSalvadoranPhone = (phone) => {
  if (!phone || typeof phone !== 'string') return false;
  
  // Limpiar número (remover espacios, guiones, paréntesis)
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
  
  // Validar formato: 8 dígitos comenzando con 2, 6, 7
  const phoneRegex = /^[267]\d{7}$/;
  return phoneRegex.test(cleanPhone);
};

/**
 * Calcula tarifa de envío basada en departamento
 */
export const calculateDeliveryFee = (department) => {
  if (!department || typeof department !== 'string') {
    return DELIVERY_CONFIG.DEFAULT_FEE;
  }
  
  return DELIVERY_FEES[department.trim()] || DELIVERY_CONFIG.DEFAULT_FEE;
};

/**
 * Obtiene lista de departamentos
 */
export const getDepartments = () => {
  return Object.keys(EL_SALVADOR_LOCATIONS);
};

/**
 * Obtiene municipios de un departamento específico
 */
export const getMunicipalities = (department) => {
  if (!department || !isValidDepartment(department)) {
    return [];
  }
  return EL_SALVADOR_LOCATIONS[department.trim()] || [];
};

/**
 * Valida combinación departamento-municipio
 */
export const validateDepartmentAndMunicipality = (department, municipality) => {
  // Validar que se proporcionaron ambos campos
  if (!department || !municipality) {
    return {
      isValid: false,
      message: 'Departamento y municipio son requeridos',
      error: 'MISSING_LOCATION_DATA'
    };
  }

  // Validar departamento
  if (!isValidDepartment(department)) {
    return {
      isValid: false,
      message: 'Departamento no válido',
      error: 'INVALID_DEPARTMENT',
      validDepartments: getDepartments()
    };
  }

  // Validar municipio
  if (!isValidMunicipality(department, municipality)) {
    return {
      isValid: false,
      message: `El municipio "${municipality}" no pertenece al departamento "${department}"`,
      error: 'INVALID_MUNICIPALITY',
      validMunicipalities: getMunicipalities(department)
    };
  }

  return {
    isValid: true,
    message: 'Ubicación válida'
  };
};

/**
 * Obtiene mapa de tarifas de envío
 */
export const getDeliveryFeesMap = () => {
  return {
    fees: DELIVERY_FEES,
    freeDeliveryThreshold: DELIVERY_CONFIG.FREE_DELIVERY_THRESHOLD,
    currency: DELIVERY_CONFIG.CURRENCY,
    defaultFee: DELIVERY_CONFIG.DEFAULT_FEE
  };
};

/**
 * Obtiene opciones de entrega para un departamento
 */
export const getDeliveryOptions = (department) => {
  const fee = calculateDeliveryFee(department);
  const isExpressAvailable = ['San Salvador', 'La Libertad'].includes(department);
  
  return {
    standard: {
      available: true,
      fee,
      estimatedDays: department === 'San Salvador' ? '1-2' : '2-4',
      description: 'Entrega estándar'
    },
    express: {
      available: isExpressAvailable,
      fee: isExpressAvailable ? Math.round(fee * DELIVERY_CONFIG.EXPRESS_MULTIPLIER) : null,
      estimatedDays: isExpressAvailable ? '24hrs' : null,
      description: 'Entrega express (solo área metropolitana)'
    },
    pickup: {
      available: department === 'San Salvador',
      fee: 0,
      estimatedDays: '1-3',
      description: 'Retiro en punto de entrega'
    }
  };
};

/**
 * Obtiene datos completos de ubicaciones para el frontend
 */
export const getLocationData = () => {
  return {
    departments: getDepartments().map(dept => ({
      name: dept,
      municipalities: getMunicipalities(dept),
      deliveryFee: calculateDeliveryFee(dept),
      deliveryOptions: getDeliveryOptions(dept)
    })),
    deliveryConfig: {
      currency: DELIVERY_CONFIG.CURRENCY,
      freeDeliveryThreshold: DELIVERY_CONFIG.FREE_DELIVERY_THRESHOLD,
      defaultFee: DELIVERY_CONFIG.DEFAULT_FEE,
      defaultCoordinates: DELIVERY_CONFIG.DEFAULT_COORDINATES
    }
  };
};

/**
 * Formatea un número de teléfono salvadoreño
 */
export const formatSalvadoranPhone = (phone) => {
  if (!phone || !isValidSalvadoranPhone(phone)) return phone;
  
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
  // Formato: 7123-4567
  return `${cleanPhone.slice(0, 4)}-${cleanPhone.slice(4)}`;
};

/**
 * Calcula distancia estimada entre coordenadas (fórmula simple)
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radio de la Tierra en km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distancia en km
};

export { DELIVERY_CONFIG, EL_SALVADOR_LOCATIONS, DELIVERY_FEES };

export default {
  isValidDepartment,
  isValidMunicipality,
  isValidSalvadoranPhone,
  calculateDeliveryFee,
  getDepartments,
  getMunicipalities,
  validateDepartmentAndMunicipality,
  getDeliveryFeesMap,
  getDeliveryOptions,
  getLocationData,
  formatSalvadoranPhone,
  calculateDistance,
  DELIVERY_CONFIG
};