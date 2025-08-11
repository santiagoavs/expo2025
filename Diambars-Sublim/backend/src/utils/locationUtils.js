// utils/locationUtils.js - Utilidades para manejo de ubicaciones
import { 
  EL_SALVADOR_LOCATIONS, 
  DELIVERY_FEES, 
  DELIVERY_CONFIG,
  EXPRESS_DELIVERY_DEPARTMENTS,
  PICKUP_POINTS
} from '../constants/locations.js';

/**
 * Valida si un departamento existe
 */
export function isValidDepartment(department) {
  return EL_SALVADOR_LOCATIONS.hasOwnProperty(department);
}

/**
 * Valida si un municipio pertenece al departamento especificado
 */
export function isValidMunicipality(department, municipality) {
  if (!isValidDepartment(department)) {
    return false;
  }
  return EL_SALVADOR_LOCATIONS[department].includes(municipality);
}

/**
 * Valida departamento y municipio, retorna resultado detallado
 */
export function validateDepartmentAndMunicipality(department, municipality) {
  // Validar departamento
  if (!isValidDepartment(department)) {
    return {
      isValid: false,
      message: "Departamento inválido",
      error: 'INVALID_DEPARTMENT',
      validDepartments: Object.keys(EL_SALVADOR_LOCATIONS)
    };
  }
  
  // Validar municipio
  if (!isValidMunicipality(department, municipality)) {
    return {
      isValid: false,
      message: "Municipio no pertenece al departamento seleccionado",
      error: 'INVALID_MUNICIPALITY',
      validMunicipalities: EL_SALVADOR_LOCATIONS[department]
    };
  }
  
  return { isValid: true };
}

/**
 * Calcula tarifa de envío basada en el departamento
 */
export function calculateDeliveryFee(department) {
  return DELIVERY_FEES[department] || DELIVERY_CONFIG.DEFAULT_FEE;
}

/**
 * Obtiene todas las tarifas de envío
 */
export function getDeliveryFeesMap() {
  return { ...DELIVERY_FEES, default: DELIVERY_CONFIG.DEFAULT_FEE };
}

/**
 * Obtiene opciones de entrega para un departamento
 */
export function getDeliveryOptions(department) {
  const baseFee = calculateDeliveryFee(department);
  const isExpress = EXPRESS_DELIVERY_DEPARTMENTS.includes(department);
  const hasPickup = PICKUP_POINTS.hasOwnProperty(department);
  
  return {
    standardDelivery: {
      available: true,
      estimatedDays: ['San Salvador', 'La Libertad'].includes(department) ? 1 : 2,
      fee: baseFee
    },
    expressDelivery: {
      available: isExpress,
      estimatedDays: 0.5,
      fee: baseFee * DELIVERY_CONFIG.EXPRESS_MULTIPLIER
    },
    pickupPoint: {
      available: hasPickup,
      estimatedDays: 1,
      fee: 0,
      locations: PICKUP_POINTS[department] || []
    }
  };
}

/**
 * Obtiene lista de departamentos
 */
export function getDepartments() {
  return Object.keys(EL_SALVADOR_LOCATIONS);
}

/**
 * Obtiene municipios de un departamento
 */
export function getMunicipalities(department) {
  return EL_SALVADOR_LOCATIONS[department] || [];
}

/**
 * Obtiene todos los datos de ubicaciones organizados
 */
export function getLocationData() {
  return {
    departments: getDepartments(),
    municipalities: EL_SALVADOR_LOCATIONS,
    totalDepartments: getDepartments().length,
    totalMunicipalities: Object.values(EL_SALVADOR_LOCATIONS).flat().length
  };
}

/**
 * Valida formato de teléfono salvadoreño
 */
export function isValidSalvadoranPhone(phone) {
  return /^[267]\d{7}$/.test(phone);
}

// Re-exportar constantes para que estén disponibles
export { 
  DELIVERY_CONFIG, 
  EXPRESS_DELIVERY_DEPARTMENTS, 
  PICKUP_POINTS,
  EL_SALVADOR_LOCATIONS,
  DELIVERY_FEES 
} from '../constants/locations.js';