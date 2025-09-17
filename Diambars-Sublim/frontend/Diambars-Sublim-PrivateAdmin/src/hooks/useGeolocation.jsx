// src/hooks/useGeolocation.js
import { useCallback, useState } from 'react';
import { toast } from 'react-hot-toast';
import geocodingService from '../api/GeocodingService';

const useGeolocation = () => {
  // ==================== ESTADOS ====================
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastGeocodedAddress, setLastGeocodedAddress] = useState(null);
  const [suggestions, setSuggestions] = useState([]);

  // ==================== GEOCODING ====================

  /**
   * Obtener coordenadas de una dirección
   * @param {string} address - Dirección
   * @param {string} department - Departamento
   * @param {string} municipality - Municipio
   * @returns {Promise<Object|null>} Datos de geocoding
   */
  const geocodeAddress = useCallback(async (address, department, municipality) => {
    if (!address || !department || !municipality) {
      console.warn('🗺️ [useGeolocation] Incomplete address data for geocoding');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('🗺️ [useGeolocation] Geocoding address:', { address, department, municipality });
      
      const result = await geocodingService.geocodeAddress(address, department, municipality);
      
      if (result) {
        setLastGeocodedAddress(result);
        console.log('✅ [useGeolocation] Geocoding successful:', result);
        
        // Mostrar advertencia si es una ubicación aproximada
        if (result.isApproximate) {
          const warningMsg = `Ubicación aproximada encontrada (${result.searchStrategy})`;
          console.warn('⚠️ [useGeolocation]', warningMsg);
          toast.error(warningMsg);
        }
        
        return result;
      } else {
        const errorMsg = 'No se pudo encontrar la ubicación. Intenta con una dirección más específica.';
        setError(errorMsg);
        toast.error(errorMsg);
        return null;
      }
    } catch (error) {
      const errorMsg = 'Error al obtener coordenadas';
      console.error('❌ [useGeolocation] Geocoding error:', error);
      setError(errorMsg);
      toast.error(errorMsg);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Obtener dirección de coordenadas (reverse geocoding)
   * @param {number} lat - Latitud
   * @param {number} lng - Longitud
   * @returns {Promise<Object|null>} Datos de dirección
   */
  const reverseGeocode = useCallback(async (lat, lng) => {
    if (!geocodingService.isValidCoordinates(lat, lng)) {
      console.warn('🗺️ [useGeolocation] Invalid coordinates for reverse geocoding');
      return null;
    }

    if (!geocodingService.isWithinElSalvador(lat, lng)) {
      toast.error('Las coordenadas están fuera de El Salvador');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('🗺️ [useGeolocation] Reverse geocoding:', { lat, lng });
      
      const result = await geocodingService.reverseGeocode(lat, lng);
      
      if (result) {
        console.log('✅ [useGeolocation] Reverse geocoding successful:', result);
        return result;
      } else {
        const errorMsg = 'No se pudo obtener información de la ubicación';
        setError(errorMsg);
        toast.error(errorMsg);
        return null;
      }
    } catch (error) {
      const errorMsg = 'Error al obtener información de ubicación';
      console.error('❌ [useGeolocation] Reverse geocoding error:', error);
      setError(errorMsg);
      toast.error(errorMsg);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Buscar lugares por nombre
   * @param {string} query - Término de búsqueda
   * @param {number} limit - Límite de resultados
   * @returns {Promise<Array>} Array de lugares encontrados
   */
  const searchPlaces = useCallback(async (query, limit = 5) => {
    if (!query || query.trim().length < 2) {
      setSuggestions([]);
      return [];
    }

    setLoading(true);
    setError(null);

    try {
      console.log('🗺️ [useGeolocation] Searching places:', query);
      
      const results = await geocodingService.searchPlaces(query, limit);
      
      setSuggestions(results);
      console.log('✅ [useGeolocation] Place search successful:', results.length, 'results');
      
      return results;
    } catch (error) {
      const errorMsg = 'Error al buscar lugares';
      console.error('❌ [useGeolocation] Place search error:', error);
      setError(errorMsg);
      setSuggestions([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // ==================== VALIDACIONES ====================

  /**
   * Validar si las coordenadas están dentro de El Salvador
   * @param {number} lat - Latitud
   * @param {number} lng - Longitud
   * @returns {boolean} True si está dentro de El Salvador
   */
  const isWithinElSalvador = useCallback((lat, lng) => {
    return geocodingService.isWithinElSalvador(lat, lng);
  }, []);

  /**
   * Validar formato de coordenadas
   * @param {number} lat - Latitud
   * @param {number} lng - Longitud
   * @returns {boolean} True si las coordenadas son válidas
   */
  const isValidCoordinates = useCallback((lat, lng) => {
    return geocodingService.isValidCoordinates(lat, lng);
  }, []);

  /**
   * Validar dirección completa para geocoding
   * @param {Object} addressData - Datos de dirección
   * @returns {Object} Resultado de validación
   */
  const validateAddressForGeocoding = useCallback((addressData) => {
    const { address, department, municipality } = addressData;
    
    const errors = [];
    
    if (!address || address.trim().length < 5) {
      errors.push('La dirección debe tener al menos 5 caracteres');
    }
    
    if (!department || department.trim().length === 0) {
      errors.push('El departamento es requerido');
    }
    
    if (!municipality || municipality.trim().length === 0) {
      errors.push('El municipio es requerido');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      canGeocode: errors.length === 0
    };
  }, []);

  // ==================== UTILIDADES ====================

  /**
   * Calcular distancia entre dos puntos
   * @param {number} lat1 - Latitud punto 1
   * @param {number} lng1 - Longitud punto 1
   * @param {number} lat2 - Latitud punto 2
   * @param {number} lng2 - Longitud punto 2
   * @returns {number} Distancia en kilómetros
   */
  const calculateDistance = useCallback((lat1, lng1, lat2, lng2) => {
    return geocodingService.calculateDistance(lat1, lng1, lat2, lng2);
  }, []);

  /**
   * Formatear coordenadas para display
   * @param {number} lat - Latitud
   * @param {number} lng - Longitud
   * @returns {string} Coordenadas formateadas
   */
  const formatCoordinates = useCallback((lat, lng) => {
    return geocodingService.formatCoordinates(lat, lng);
  }, []);

  /**
   * Obtener el centro de El Salvador
   * @returns {Array} Coordenadas del centro [lng, lat]
   */
  const getElSalvadorCenter = useCallback(() => {
    return geocodingService.getElSalvadorCenter();
  }, []);

  /**
   * Obtener límites de El Salvador para el mapa
   * @returns {Array} Bounding box [[south, west], [north, east]]
   */
  const getElSalvadorBounds = useCallback(() => {
    return geocodingService.getElSalvadorBounds();
  }, []);

  /**
   * Convertir coordenadas de diferentes formatos
   * @param {Array|Object} coords - Coordenadas en diferentes formatos
   * @returns {Object} Coordenadas normalizadas
   */
  const normalizeCoordinates = useCallback((coords) => {
    if (!coords) return null;
    
    // Si es array [lng, lat] (GeoJSON)
    if (Array.isArray(coords) && coords.length >= 2) {
      return {
        latitude: coords[1],
        longitude: coords[0],
        coordinates: coords // Mantener formato GeoJSON
      };
    }
    
    // Si es objeto con lat/lng
    if (typeof coords === 'object' && coords.lat !== undefined && coords.lng !== undefined) {
      return {
        latitude: coords.lat,
        longitude: coords.lng,
        coordinates: [coords.lng, coords.lat]
      };
    }
    
    // Si es objeto con latitude/longitude
    if (typeof coords === 'object' && coords.latitude !== undefined && coords.longitude !== undefined) {
      return {
        latitude: coords.latitude,
        longitude: coords.longitude,
        coordinates: [coords.longitude, coords.latitude]
      };
    }
    
    return null;
  }, []);

  /**
   * Crear configuración básica para mapa de Leaflet
   * @returns {Object} Configuración del mapa
   */
  const getMapConfig = useCallback(() => {
    return {
      center: getElSalvadorCenter().reverse(), // Leaflet usa [lat, lng]
      zoom: 9,
      bounds: getElSalvadorBounds(),
      maxBounds: getElSalvadorBounds(),
      maxZoom: 18,
      minZoom: 7,
      zoomControl: true,
      attributionControl: true
    };
  }, [getElSalvadorCenter, getElSalvadorBounds]);

  /**
   * Obtener configuración de tiles para el mapa
   * @returns {Object} Configuración de tiles
   */
  const getTileLayerConfig = useCallback(() => {
    return {
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
      tileSize: 256,
      zoomOffset: 0
    };
  }, []);

  // ==================== GESTIÓN DE ERRORES ====================

  /**
   * Limpiar error actual
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Limpiar sugerencias
   */
  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
  }, []);

  /**
   * Limpiar toda la data del hook
   */
  const clearAll = useCallback(() => {
    setError(null);
    setSuggestions([]);
    setLastGeocodedAddress(null);
  }, []);

  // ==================== RETURN ====================
  return {
    // Estados
    loading,
    error,
    lastGeocodedAddress,
    suggestions,

    // Operaciones principales
    geocodeAddress,
    reverseGeocode,
    searchPlaces,

    // Validaciones
    isWithinElSalvador,
    isValidCoordinates,
    validateAddressForGeocoding,

    // Utilidades
    calculateDistance,
    formatCoordinates,
    getElSalvadorCenter,
    getElSalvadorBounds,
    normalizeCoordinates,
    getMapConfig,
    getTileLayerConfig,

    // Gestión de estado
    clearError,
    clearSuggestions,
    clearAll
  };
};

export default useGeolocation;  