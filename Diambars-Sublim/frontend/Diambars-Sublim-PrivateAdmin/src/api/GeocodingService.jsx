// src/api/geocodingService.js

class GeocodingService {
    constructor() {
      this.baseUrl = 'https://nominatim.openstreetmap.org';
      this.userAgent = 'Diambars-Admin/1.0';
      this.defaultCenter = [-89.2182, 13.6929]; // San Salvador, El Salvador
      this.countryCode = 'sv'; // El Salvador
    }
  
    /**
     * Obtener coordenadas de una dirección usando Nominatim
     * @param {string} address - Dirección completa
     * @param {string} department - Departamento
     * @param {string} municipality - Municipio
     * @returns {Promise<Object|null>} Datos de geocoding
     */
    async geocodeAddress(address, department, municipality) {
      try {
        // Construir query específico para El Salvador
        const query = `${address}, ${municipality}, ${department}, El Salvador`;
        const encodedQuery = encodeURIComponent(query);
        
        const url = `${this.baseUrl}/search?` + new URLSearchParams({
          format: 'json',
          q: encodedQuery,
          countrycodes: this.countryCode,
          limit: '3', // Obtener múltiples resultados para mejor precisión
          addressdetails: '1',
          extratags: '1',
          namedetails: '1'
        });
  
        console.log('🗺️ [GeocodingService] Geocoding request:', { address, department, municipality });
        
        const response = await fetch(url, {
          headers: {
            'User-Agent': this.userAgent,
            'Accept': 'application/json',
            'Accept-Language': 'es,en'
          }
        });
        
        if (!response.ok) {
          throw new Error(`Geocoding API error: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('🗺️ [GeocodingService] Geocoding response:', data);
        
        if (data && data.length > 0) {
          // Tomar el resultado más relevante
          const result = data[0];
          
          return {
            latitude: parseFloat(result.lat),
            longitude: parseFloat(result.lon),
            coordinates: [parseFloat(result.lon), parseFloat(result.lat)], // GeoJSON format [lng, lat]
            displayName: result.display_name,
            confidence: result.importance || 0.5,
            addressDetails: result.address || {},
            boundingBox: result.boundingbox || null,
            placeId: result.place_id,
            osmType: result.osm_type,
            raw: result
          };
        }
        
        console.warn('🗺️ [GeocodingService] No results found for address');
        return null;
      } catch (error) {
        console.error('❌ [GeocodingService] Geocoding error:', error);
        return null;
      }
    }
  
    /**
     * Obtener dirección de coordenadas (reverse geocoding)
     * @param {number} lat - Latitud
     * @param {number} lng - Longitud
     * @returns {Promise<Object|null>} Datos de dirección
     */
    async reverseGeocode(lat, lng) {
      try {
        // Validar que las coordenadas estén dentro de El Salvador (aproximadamente)
        if (!this.isWithinElSalvador(lat, lng)) {
          console.warn('🗺️ [GeocodingService] Coordinates outside El Salvador bounds');
          return null;
        }
  
        const url = `${this.baseUrl}/reverse?` + new URLSearchParams({
          format: 'json',
          lat: lat.toString(),
          lon: lng.toString(),
          addressdetails: '1',
          extratags: '1',
          namedetails: '1',
          'accept-language': 'es,en'
        });
  
        console.log('🗺️ [GeocodingService] Reverse geocoding request:', { lat, lng });
        
        const response = await fetch(url, {
          headers: {
            'User-Agent': this.userAgent,
            'Accept': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error(`Reverse geocoding API error: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('🗺️ [GeocodingService] Reverse geocoding response:', data);
        
        if (data && data.address) {
          return {
            address: data.display_name,
            coordinates: [lng, lat], // GeoJSON format
            addressComponents: {
              department: data.address.state || data.address.county,
              municipality: data.address.city || data.address.town || data.address.village || data.address.municipality,
              road: data.address.road || data.address.street,
              houseNumber: data.address.house_number,
              postcode: data.address.postcode,
              country: data.address.country
            },
            confidence: data.importance || 0.5,
            placeId: data.place_id,
            raw: data
          };
        }
        
        return null;
      } catch (error) {
        console.error('❌ [GeocodingService] Reverse geocoding error:', error);
        return null;
      }
    }
  
    /**
     * Buscar lugares por nombre en El Salvador
     * @param {string} query - Término de búsqueda
     * @param {number} limit - Límite de resultados
     * @returns {Promise<Array>} Array de lugares encontrados
     */
    async searchPlaces(query, limit = 5) {
      try {
        if (!query || query.trim().length < 2) {
          return [];
        }
  
        const encodedQuery = encodeURIComponent(`${query.trim()}, El Salvador`);
        
        const url = `${this.baseUrl}/search?` + new URLSearchParams({
          format: 'json',
          q: encodedQuery,
          countrycodes: this.countryCode,
          limit: limit.toString(),
          addressdetails: '1',
          extratags: '1'
        });
  
        const response = await fetch(url, {
          headers: {
            'User-Agent': this.userAgent,
            'Accept': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error(`Search places API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        return data.map(place => ({
          id: place.place_id,
          name: place.display_name,
          latitude: parseFloat(place.lat),
          longitude: parseFloat(place.lon),
          coordinates: [parseFloat(place.lon), parseFloat(place.lat)],
          type: place.type,
          importance: place.importance || 0,
          addressDetails: place.address || {},
          boundingBox: place.boundingbox || null
        }));
      } catch (error) {
        console.error('❌ [GeocodingService] Search places error:', error);
        return [];
      }
    }
  
    /**
     * Validar si las coordenadas están dentro de El Salvador
     * @param {number} lat - Latitud
     * @param {number} lng - Longitud
     * @returns {boolean} True si está dentro de El Salvador
     */
    isWithinElSalvador(lat, lng) {
      // Límites aproximados de El Salvador
      const bounds = {
        north: 14.445,
        south: 13.148,
        east: -87.692,
        west: -90.128
      };
  
      return (
        lat >= bounds.south &&
        lat <= bounds.north &&
        lng >= bounds.west &&
        lng <= bounds.east
      );
    }
  
    /**
     * Obtener el centro de El Salvador
     * @returns {Array} Coordenadas del centro [lng, lat]
     */
    getElSalvadorCenter() {
      return [...this.defaultCenter];
    }
  
    /**
     * Obtener límites de El Salvador para el mapa
     * @returns {Array} Bounding box [[south, west], [north, east]]
     */
    getElSalvadorBounds() {
      return [
        [13.148, -90.128], // Southwest
        [14.445, -87.692]  // Northeast
      ];
    }
  
    /**
     * Calcular distancia entre dos puntos usando fórmula de Haversine
     * @param {number} lat1 - Latitud punto 1
     * @param {number} lng1 - Longitud punto 1
     * @param {number} lat2 - Latitud punto 2
     * @param {number} lng2 - Longitud punto 2
     * @returns {number} Distancia en kilómetros
     */
    calculateDistance(lat1, lng1, lat2, lng2) {
      const R = 6371; // Radio de la Tierra en km
      const dLat = this.toRad(lat2 - lat1);
      const dLng = this.toRad(lng2 - lng1);
      
      const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) * 
                Math.sin(dLng / 2) * Math.sin(dLng / 2);
      
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = R * c;
      
      return Math.round(distance * 100) / 100; // Redondear a 2 decimales
    }
  
    /**
     * Convertir grados a radianes
     * @param {number} deg - Grados
     * @returns {number} Radianes
     */
    toRad(deg) {
      return deg * (Math.PI / 180);
    }
  
    /**
     * Formatear coordenadas para display
     * @param {number} lat - Latitud
     * @param {number} lng - Longitud
     * @returns {string} Coordenadas formateadas
     */
    formatCoordinates(lat, lng) {
      const latDir = lat >= 0 ? 'N' : 'S';
      const lngDir = lng >= 0 ? 'E' : 'W';
      
      return `${Math.abs(lat).toFixed(6)}°${latDir}, ${Math.abs(lng).toFixed(6)}°${lngDir}`;
    }
  
    /**
     * Validar formato de coordenadas
     * @param {number} lat - Latitud
     * @param {number} lng - Longitud
     * @returns {boolean} True si las coordenadas son válidas
     */
    isValidCoordinates(lat, lng) {
      return (
        typeof lat === 'number' &&
        typeof lng === 'number' &&
        !isNaN(lat) &&
        !isNaN(lng) &&
        lat >= -90 && lat <= 90 &&
        lng >= -180 && lng <= 180
      );
    }
  }
  
  // Crear instancia singleton
  const geocodingService = new GeocodingService();
  
  export default geocodingService;