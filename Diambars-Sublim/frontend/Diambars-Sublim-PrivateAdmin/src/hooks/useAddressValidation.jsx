// src/hooks/useAddressValidation.js
import { useCallback, useState, useEffect } from 'react';
import addressService from '../api/addressService';
import useGeolocation from './useGeolocation';

const useAddressValidation = () => {
  // ==================== ESTADOS ====================
  const [validationResults, setValidationResults] = useState({});
  const [validating, setValidating] = useState(false);
  const [departmentData, setDepartmentData] = useState({});
  const [deliveryFees, setDeliveryFees] = useState({});

  // Hook de geolocalización
  const { validateAddressForGeocoding, isValidCoordinates } = useGeolocation();

  // ==================== VALIDACIONES BÁSICAS ====================

  /**
   * Validar formato de teléfono salvadoreño
   * @param {string} phone - Número de teléfono
   * @returns {Object} Resultado de validación
   */
  const validatePhone = useCallback((phone) => {
    if (!phone || typeof phone !== 'string') {
      return {
        isValid: false,
        error: 'Número de teléfono requerido',
        formatted: ''
      };
    }

    // Limpiar número (remover espacios, guiones, paréntesis)
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    
    // Validar formato: 8 dígitos comenzando con 2, 6, 7
    const phoneRegex = /^[267]\d{7}$/;
    
    if (!phoneRegex.test(cleanPhone)) {
      return {
        isValid: false,
        error: 'Formato inválido. Debe ser un número salvadoreño (ej: 7123-4567)',
        formatted: phone
      };
    }

    // Formatear número: 7123-4567
    const formatted = `${cleanPhone.slice(0, 4)}-${cleanPhone.slice(4)}`;

    return {
      isValid: true,
      error: null,
      formatted,
      clean: cleanPhone
    };
  }, []);

  /**
   * Validar nombre del destinatario
   * @param {string} name - Nombre del destinatario
   * @returns {Object} Resultado de validación
   */
  const validateRecipient = useCallback((name) => {
    if (!name || typeof name !== 'string') {
      return {
        isValid: false,
        error: 'Nombre del destinatario requerido'
      };
    }

    const trimmedName = name.trim();
    
    if (trimmedName.length < 2) {
      return {
        isValid: false,
        error: 'El nombre debe tener al menos 2 caracteres'
      };
    }

    if (trimmedName.length > 100) {
      return {
        isValid: false,
        error: 'El nombre no puede exceder 100 caracteres'
      };
    }

    // Validar que contenga solo letras, espacios y algunos caracteres especiales
    const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s\.\-\']+$/;
    if (!nameRegex.test(trimmedName)) {
      return {
        isValid: false,
        error: 'El nombre contiene caracteres no válidos'
      };
    }

    return {
      isValid: true,
      error: null,
      formatted: trimmedName
    };
  }, []);

  /**
   * Validar dirección física
   * @param {string} address - Dirección
   * @returns {Object} Resultado de validación
   */
  const validatePhysicalAddress = useCallback((address) => {
    if (!address || typeof address !== 'string') {
      return {
        isValid: false,
        error: 'Dirección requerida'
      };
    }

    const trimmedAddress = address.trim();
    
    if (trimmedAddress.length < 10) {
      return {
        isValid: false,
        error: 'La dirección debe tener al menos 10 caracteres'
      };
    }

    if (trimmedAddress.length > 200) {
      return {
        isValid: false,
        error: 'La dirección no puede exceder 200 caracteres'
      };
    }

    return {
      isValid: true,
      error: null,
      formatted: trimmedAddress
    };
  }, []);

  /**
   * Validar etiqueta de dirección
   * @param {string} label - Etiqueta
   * @returns {Object} Resultado de validación
   */
  const validateLabel = useCallback((label) => {
    if (!label || typeof label !== 'string') {
      return {
        isValid: true, // Opcional
        error: null,
        formatted: 'Mi dirección'
      };
    }

    const trimmedLabel = label.trim();
    
    if (trimmedLabel.length > 50) {
      return {
        isValid: false,
        error: 'La etiqueta no puede exceder 50 caracteres'
      };
    }

    return {
      isValid: true,
      error: null,
      formatted: trimmedLabel || 'Mi dirección'
    };
  }, []);

  /**
   * Validar detalles adicionales
   * @param {string} details - Detalles adicionales
   * @returns {Object} Resultado de validación
   */
  const validateAdditionalDetails = useCallback((details) => {
    if (!details) {
      return {
        isValid: true, // Opcional
        error: null,
        formatted: ''
      };
    }

    if (typeof details !== 'string') {
      return {
        isValid: false,
        error: 'Los detalles deben ser texto válido'
      };
    }

    const trimmedDetails = details.trim();
    
    if (trimmedDetails.length > 200) {
      return {
        isValid: false,
        error: 'Los detalles adicionales no pueden exceder 200 caracteres'
      };
    }

    return {
      isValid: true,
      error: null,
      formatted: trimmedDetails
    };
  }, []);

  /**
   * Validar coordenadas geográficas
   * @param {Array|Object} coordinates - Coordenadas
   * @returns {Object} Resultado de validación
   */
  const validateCoordinates = useCallback((coordinates) => {
    if (!coordinates) {
      return {
        isValid: true, // Opcional
        error: null,
        warning: 'No se proporcionaron coordenadas'
      };
    }

    let lat, lng;

    // Si es array [lng, lat] (GeoJSON)
    if (Array.isArray(coordinates) && coordinates.length >= 2) {
      lng = coordinates[0];
      lat = coordinates[1];
    }
    // Si es objeto con lat/lng
    else if (typeof coordinates === 'object' && coordinates.lat !== undefined && coordinates.lng !== undefined) {
      lat = coordinates.lat;
      lng = coordinates.lng;
    }
    // Si es objeto con latitude/longitude
    else if (typeof coordinates === 'object' && coordinates.latitude !== undefined && coordinates.longitude !== undefined) {
      lat = coordinates.latitude;
      lng = coordinates.longitude;
    }
    else {
      return {
        isValid: false,
        error: 'Formato de coordenadas inválido'
      };
    }

    // Validar formato numérico
    if (!isValidCoordinates(lat, lng)) {
      return {
        isValid: false,
        error: 'Las coordenadas no son números válidos'
      };
    }

    // Validar que estén dentro de El Salvador
    if (!useGeolocation().isWithinElSalvador(lat, lng)) {
      return {
        isValid: false,
        error: 'Las coordenadas están fuera de El Salvador'
      };
    }

    return {
      isValid: true,
      error: null,
      formatted: {
        latitude: lat,
        longitude: lng,
        coordinates: [lng, lat], // GeoJSON format
        display: `${lat.toFixed(6)}, ${lng.toFixed(6)}`
      }
    };
  }, [isValidCoordinates]);

  // ==================== VALIDACIONES GEOGRÁFICAS ====================

  /**
   * Validar departamento
   * @param {string} department - Nombre del departamento
   * @returns {Object} Resultado de validación
   */
  const validateDepartment = useCallback((department) => {
    if (!department || typeof department !== 'string') {
      return {
        isValid: false,
        error: 'Departamento requerido'
      };
    }

    const trimmedDepartment = department.trim();
    
    // Validar contra lista de departamentos de El Salvador
    const validDepartments = Object.keys(departmentData);
    
    if (validDepartments.length > 0 && !validDepartments.includes(trimmedDepartment)) {
      return {
        isValid: false,
        error: 'Departamento no válido para El Salvador',
        suggestions: validDepartments.filter(dept => 
          dept.toLowerCase().includes(trimmedDepartment.toLowerCase())
        )
      };
    }

    return {
      isValid: true,
      error: null,
      formatted: trimmedDepartment
    };
  }, [departmentData]);

  /**
   * Validar municipio
   * @param {string} municipality - Nombre del municipio
   * @param {string} department - Departamento al que pertenece
   * @returns {Object} Resultado de validación
   */
  const validateMunicipality = useCallback((municipality, department) => {
    if (!municipality || typeof municipality !== 'string') {
      return {
        isValid: false,
        error: 'Municipio requerido'
      };
    }

    if (!department) {
      return {
        isValid: false,
        error: 'Selecciona un departamento primero'
      };
    }

    const trimmedMunicipality = municipality.trim();
    const validMunicipalities = departmentData[department] || [];
    
    if (validMunicipalities.length > 0 && !validMunicipalities.includes(trimmedMunicipality)) {
      return {
        isValid: false,
        error: `El municipio "${trimmedMunicipality}" no pertenece al departamento "${department}"`,
        suggestions: validMunicipalities.filter(muni => 
          muni.toLowerCase().includes(trimmedMunicipality.toLowerCase())
        )
      };
    }

    return {
      isValid: true,
      error: null,
      formatted: trimmedMunicipality
    };
  }, [departmentData]);

  // ==================== VALIDACIÓN COMPLETA ====================

  /**
   * Validar dirección completa
   * @param {Object} addressData - Datos completos de la dirección
   * @returns {Object} Resultado de validación completa
   */
  const validateCompleteAddress = useCallback(async (addressData) => {
    setValidating(true);
    
    const {
      recipient,
      phoneNumber,
      department,
      municipality,
      address,
      label,
      additionalDetails,
      coordinates,
      userId
    } = addressData;

    const validationResults = {};
    let hasErrors = false;

    // Validar userId (para admin)
    if (!userId) {
      validationResults.userId = {
        isValid: false,
        error: 'Debe seleccionar un usuario'
      };
      hasErrors = true;
    }

    // Validar campos básicos
    const recipientValidation = validateRecipient(recipient);
    validationResults.recipient = recipientValidation;
    if (!recipientValidation.isValid) hasErrors = true;

    const phoneValidation = validatePhone(phoneNumber);
    validationResults.phoneNumber = phoneValidation;
    if (!phoneValidation.isValid) hasErrors = true;

    const departmentValidation = validateDepartment(department);
    validationResults.department = departmentValidation;
    if (!departmentValidation.isValid) hasErrors = true;

    const municipalityValidation = validateMunicipality(municipality, department);
    validationResults.municipality = municipalityValidation;
    if (!municipalityValidation.isValid) hasErrors = true;

    const addressValidation = validatePhysicalAddress(address);
    validationResults.address = addressValidation;
    if (!addressValidation.isValid) hasErrors = true;

    const labelValidation = validateLabel(label);
    validationResults.label = labelValidation;
    if (!labelValidation.isValid) hasErrors = true;

    const detailsValidation = validateAdditionalDetails(additionalDetails);
    validationResults.additionalDetails = detailsValidation;
    if (!detailsValidation.isValid) hasErrors = true;

    const coordinatesValidation = validateCoordinates(coordinates);
    validationResults.coordinates = coordinatesValidation;
    if (!coordinatesValidation.isValid) hasErrors = true;

    // Validación con backend si los campos básicos están correctos
    let backendValidation = null;
    if (!hasErrors && department && municipality && address) {
      try {
        backendValidation = await addressService.validate({
          department,
          municipality,
          address
        });
        
        if (backendValidation && !backendValidation.success) {
          validationResults.backend = {
            isValid: false,
            error: backendValidation.message || 'Error en validación del servidor'
          };
          hasErrors = true;
        } else if (backendValidation && backendValidation.success) {
          validationResults.backend = {
            isValid: true,
            deliveryFee: backendValidation.data?.estimatedDeliveryFee || 0,
            deliveryOptions: backendValidation.data?.deliveryOptions || {}
          };
        }
      } catch (error) {
        console.error('❌ [useAddressValidation] Backend validation error:', error);
        validationResults.backend = {
          isValid: false,
          error: 'Error al validar con el servidor'
        };
        hasErrors = true;
      }
    }

    // Validación de geocoding si es necesaria
    const geocodingValidation = validateAddressForGeocoding(addressData);
    validationResults.geocoding = geocodingValidation;

    setValidating(false);

    const finalResult = {
      isValid: !hasErrors,
      hasErrors,
      validationResults,
      backendValidation,
      formattedData: hasErrors ? null : {
        userId,
        recipient: recipientValidation.formatted,
        phoneNumber: phoneValidation.formatted,
        department: departmentValidation.formatted,
        municipality: municipalityValidation.formatted,
        address: addressValidation.formatted,
        label: labelValidation.formatted,
        additionalDetails: detailsValidation.formatted,
        coordinates: coordinatesValidation.formatted?.coordinates || null,
        location: coordinatesValidation.formatted ? {
          type: 'Point',
          coordinates: coordinatesValidation.formatted.coordinates
        } : null
      }
    };

    setValidationResults(finalResult);
    return finalResult;
  }, [
    validateRecipient,
    validatePhone,
    validateDepartment,
    validateMunicipality,
    validatePhysicalAddress,
    validateLabel,
    validateAdditionalDetails,
    validateCoordinates,
    validateAddressForGeocoding
  ]);

  // ==================== VALIDACIONES EN TIEMPO REAL ====================

  /**
   * Validar campo individual en tiempo real
   * @param {string} fieldName - Nombre del campo
   * @param {any} value - Valor del campo
   * @param {Object} context - Contexto adicional (ej: department para municipality)
   * @returns {Object} Resultado de validación
   */
  const validateField = useCallback((fieldName, value, context = {}) => {
    let result;

    switch (fieldName) {
      case 'recipient':
        result = validateRecipient(value);
        break;
      case 'phoneNumber':
        result = validatePhone(value);
        break;
      case 'department':
        result = validateDepartment(value);
        break;
      case 'municipality':
        result = validateMunicipality(value, context.department);
        break;
      case 'address':
        result = validatePhysicalAddress(value);
        break;
      case 'label':
        result = validateLabel(value);
        break;
      case 'additionalDetails':
        result = validateAdditionalDetails(value);
        break;
      case 'coordinates':
        result = validateCoordinates(value);
        break;
      default:
        result = { isValid: true, error: null };
    }

    // Actualizar resultados de validación
    setValidationResults(prev => ({
      ...prev,
      validationResults: {
        ...prev.validationResults,
        [fieldName]: result
      }
    }));

    return result;
  }, [
    validateRecipient,
    validatePhone,
    validateDepartment,
    validateMunicipality,
    validatePhysicalAddress,
    validateLabel,
    validateAdditionalDetails,
    validateCoordinates
  ]);

  // ==================== UTILIDADES ====================

  /**
   * Obtener lista de departamentos válidos
   * @returns {Array} Array de departamentos
   */
  const getValidDepartments = useCallback(() => {
    return Object.keys(departmentData);
  }, [departmentData]);

  /**
   * Obtener lista de municipios para un departamento
   * @param {string} department - Nombre del departamento
   * @returns {Array} Array de municipios
   */
  const getValidMunicipalities = useCallback((department) => {
    return departmentData[department] || [];
  }, [departmentData]);

  /**
   * Obtener tarifa de envío para un departamento
   * @param {string} department - Nombre del departamento
   * @returns {number} Tarifa de envío
   */
  const getDeliveryFee = useCallback((department) => {
    return deliveryFees[department] || deliveryFees.defaultFee || 10;
  }, [deliveryFees]);

  /**
   * Limpiar resultados de validación
   */
  const clearValidationResults = useCallback(() => {
    setValidationResults({});
  }, []);

  /**
   * Verificar si un campo tiene errores
   * @param {string} fieldName - Nombre del campo
   * @returns {boolean} True si tiene errores
   */
  const hasFieldError = useCallback((fieldName) => {
    return validationResults.validationResults?.[fieldName]?.isValid === false;
  }, [validationResults]);

  /**
   * Obtener error de un campo específico
   * @param {string} fieldName - Nombre del campo
   * @returns {string|null} Error del campo
   */
  const getFieldError = useCallback((fieldName) => {
    return validationResults.validationResults?.[fieldName]?.error || null;
  }, [validationResults]);

  // ==================== EFECTOS ====================

  /**
   * Cargar datos de departamentos y tarifas al montar
   */
  useEffect(() => {
    const loadLocationData = async () => {
      try {
        const response = await addressService.getLocationData();
        if (response.success && response.data) {
          // Convertir array de departamentos a objeto con municipios
          const departmentObj = {};
          response.data.departments?.forEach(dept => {
            departmentObj[dept.name] = dept.municipalities || [];
          });
          setDepartmentData(departmentObj);
        }
      } catch (error) {
        console.error('❌ [useAddressValidation] Error loading location data:', error);
      }
    };

    const loadDeliveryFees = async () => {
      try {
        const response = await addressService.getDeliveryFees();
        if (response.success && response.data) {
          setDeliveryFees(response.data.fees || {});
        }
      } catch (error) {
        console.error('❌ [useAddressValidation] Error loading delivery fees:', error);
      }
    };

    loadLocationData();
    loadDeliveryFees();
  }, []);

  // ==================== RETURN ====================
  return {
    // Estados
    validationResults,
    validating,
    departmentData,
    deliveryFees,

    // Validaciones individuales
    validatePhone,
    validateRecipient,
    validatePhysicalAddress,
    validateLabel,
    validateAdditionalDetails,
    validateCoordinates,
    validateDepartment,
    validateMunicipality,

    // Validación completa
    validateCompleteAddress,
    validateField,

    // Utilidades
    getValidDepartments,
    getValidMunicipalities,
    getDeliveryFee,
    clearValidationResults,
    hasFieldError,
    getFieldError
  };
};

export default useAddressValidation;