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
        // Intentar múltiples estrategias de búsqueda
        const searchStrategies = [
          // Estrategia 1: Búsqueda completa
          `${address}, ${municipality}, ${department}, El Salvador`,
          // Estrategia 2: Solo municipio y departamento
          `${municipality}, ${department}, El Salvador`,
          // Estrategia 3: Solo departamento
          `${department}, El Salvador`
        ];

        for (let i = 0; i < searchStrategies.length; i++) {
          const query = searchStrategies[i];
          const encodedQuery = encodeURIComponent(query);
          
          const url = `${this.baseUrl}/search?` + new URLSearchParams({
            format: 'json',
            q: encodedQuery,
            countrycodes: this.countryCode,
            limit: '3',
            addressdetails: '1',
            extratags: '1',
            namedetails: '1'
          });

          console.log(`🗺️ [GeocodingService] Geocoding attempt ${i + 1}:`, { query, address, department, municipality });
          
          const response = await fetch(url, {
            headers: {
              'User-Agent': this.userAgent,
              'Accept': 'application/json',
              'Accept-Language': 'es,en'
            }
          });
          
          if (!response.ok) {
            console.warn(`🗺️ [GeocodingService] API error for attempt ${i + 1}: ${response.status}`);
            continue;
          }
          
          const data = await response.json();
          console.log(`🗺️ [GeocodingService] Geocoding response ${i + 1}:`, data);
          
          if (data && data.length > 0) {
            // Tomar el resultado más relevante
            const result = data[0];
            
            // Si es la primera estrategia (búsqueda completa), usar directamente
            if (i === 0) {
              return {
                latitude: parseFloat(result.lat),
                longitude: parseFloat(result.lon),
                coordinates: [parseFloat(result.lon), parseFloat(result.lat)],
                displayName: result.display_name,
                confidence: result.importance || 0.5,
                addressDetails: result.address || {},
                boundingBox: result.boundingbox || null,
                placeId: result.place_id,
                osmType: result.osm_type,
                searchStrategy: 'complete',
                raw: result
              };
            } else {
              // Para estrategias alternativas, usar coordenadas aproximadas del centro del municipio/departamento
              return {
                latitude: parseFloat(result.lat),
                longitude: parseFloat(result.lon),
                coordinates: [parseFloat(result.lon), parseFloat(result.lat)],
                displayName: result.display_name,
                confidence: 0.3, // Menor confianza para búsquedas aproximadas
                addressDetails: result.address || {},
                boundingBox: result.boundingbox || null,
                placeId: result.place_id,
                osmType: result.osm_type,
                searchStrategy: i === 1 ? 'municipality' : 'department',
                isApproximate: true,
                raw: result
              };
            }
          }
        }
        
        console.warn('🗺️ [GeocodingService] No results found for any search strategy');
        
        // Fallback: Usar coordenadas aproximadas del centro del departamento
        const fallbackCoords = this.getDepartmentCenter(department);
        if (fallbackCoords) {
          console.log('🗺️ [GeocodingService] Using department center as fallback');
          return {
            latitude: fallbackCoords.lat,
            longitude: fallbackCoords.lng,
            coordinates: [fallbackCoords.lng, fallbackCoords.lat],
            displayName: `Centro de ${department}, El Salvador`,
            confidence: 0.1,
            addressDetails: {
              state: department,
              country: 'El Salvador'
            },
            searchStrategy: 'fallback',
            isApproximate: true,
            isFallback: true
          };
        }
        
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

    /**
     * Obtener coordenadas aproximadas del centro de un departamento
     * @param {string} department - Nombre del departamento
     * @returns {Object|null} Coordenadas del centro del departamento
     */
    getDepartmentCenter(department) {
      // Coordenadas aproximadas de los centros de los departamentos de El Salvador
      const departmentCenters = {
        'San Salvador': { lat: 13.6929, lng: -89.2182 },
        'La Libertad': { lat: 13.6769, lng: -89.2796 },
        'Santa Ana': { lat: 13.9942, lng: -89.5597 },
        'San Miguel': { lat: 13.4769, lng: -88.1778 },
        'Sonsonate': { lat: 13.7203, lng: -89.7242 },
        'Ahuachapán': { lat: 13.9214, lng: -89.8450 },
        'Usulután': { lat: 13.3500, lng: -88.4500 },
        'La Unión': { lat: 13.3369, lng: -87.8439 },
        'La Paz': { lat: 13.4833, lng: -89.0167 },
        'Chalatenango': { lat: 14.0333, lng: -88.9333 },
        'Cuscatlán': { lat: 13.7167, lng: -89.1000 },
        'Morazán': { lat: 13.7667, lng: -88.1000 },
        'San Vicente': { lat: 13.6333, lng: -88.8000 },
        'Cabañas': { lat: 13.8667, lng: -88.6333 }
      };

      return departmentCenters[department] || null;
    }

    /**
     * Obtener coordenadas aproximadas del centro de un municipio específico
     * @param {string} municipality - Nombre del municipio
     * @param {string} department - Nombre del departamento
     * @returns {Object|null} Coordenadas del centro del municipio
     */
    getMunicipalityCenter(municipality, department) {
      // Base de datos de coordenadas de municipios principales de El Salvador
      const municipalityCenters = {
        // San Salvador
        'San Salvador': { lat: 13.6929, lng: -89.2182 },
        'Aguilares': { lat: 13.9583, lng: -89.1917 },
        'Apopa': { lat: 13.8000, lng: -89.1833 },
        'Ayutuxtepeque': { lat: 13.7500, lng: -89.2000 },
        'Cuscatancingo': { lat: 13.7167, lng: -89.1833 },
        'Delgado': { lat: 13.7167, lng: -89.1667 },
        'El Paisnal': { lat: 14.0000, lng: -89.2167 },
        'Guazapa': { lat: 13.8833, lng: -89.1667 },
        'Ilopango': { lat: 13.7000, lng: -89.1167 },
        'Mejicanos': { lat: 13.7167, lng: -89.2167 },
        'Nejapa': { lat: 13.8167, lng: -89.2333 },
        'Panchimalco': { lat: 13.6167, lng: -89.1833 },
        'Rosario de Mora': { lat: 13.5667, lng: -89.2000 },
        'San Marcos': { lat: 13.6667, lng: -89.1833 },
        'San Martín': { lat: 13.7833, lng: -89.0500 },
        'Santiago Texacuangos': { lat: 13.6500, lng: -89.1167 },
        'Santo Tomás': { lat: 13.6500, lng: -89.1333 },
        'Soyapango': { lat: 13.7000, lng: -89.1500 },
        'Tonacatepeque': { lat: 13.7833, lng: -89.1167 },

        // La Libertad
        'Santa Tecla': { lat: 13.6769, lng: -89.2796 },
        'Antiguo Cuscatlán': { lat: 13.6667, lng: -89.2500 },
        'Chiltiupán': { lat: 13.6167, lng: -89.4667 },
        'Ciudad Arce': { lat: 13.8333, lng: -89.4500 },
        'Colón': { lat: 13.7500, lng: -89.3500 },
        'Comasagua': { lat: 13.6167, lng: -89.4000 },
        'Huizúcar': { lat: 13.5667, lng: -89.3167 },
        'Jayaque': { lat: 13.6833, lng: -89.4500 },
        'Jicalapa': { lat: 13.5667, lng: -89.3667 },
        'La Libertad': { lat: 13.4833, lng: -89.3167 },
        'Nuevo Cuscatlán': { lat: 13.6500, lng: -89.2667 },
        'Quezaltepeque': { lat: 13.8333, lng: -89.2667 },
        'Sacacoyo': { lat: 13.7000, lng: -89.4000 },
        'San José Villanueva': { lat: 13.6500, lng: -89.4000 },
        'San Juan Opico': { lat: 13.8667, lng: -89.3500 },
        'San Matías': { lat: 13.6167, lng: -89.3500 },
        'San Pablo Tacachico': { lat: 13.9667, lng: -89.3333 },
        'Talnique': { lat: 13.7000, lng: -89.3500 },
        'Tamanique': { lat: 13.5667, lng: -89.4500 },
        'Teotepeque': { lat: 13.6167, lng: -89.5167 },
        'Tepecoyo': { lat: 13.6833, lng: -89.4000 },
        'Zaragoza': { lat: 13.5833, lng: -89.2833 },

        // Santa Ana
        'Santa Ana': { lat: 13.9942, lng: -89.5597 },
        'Candelaria de la Frontera': { lat: 14.1167, lng: -89.6500 },
        'Chalchuapa': { lat: 13.9833, lng: -89.6833 },
        'Coatepeque': { lat: 13.9167, lng: -89.5000 },
        'El Congo': { lat: 13.9167, lng: -89.5000 },
        'El Porvenir': { lat: 14.0833, lng: -89.6000 },
        'Masahuat': { lat: 14.1833, lng: -89.4500 },
        'Metapán': { lat: 14.3333, lng: -89.4500 },
        'San Antonio Pajonal': { lat: 14.1333, lng: -89.7000 },
        'San Sebastián Salitrillo': { lat: 13.9500, lng: -89.6000 },
        'Santiago de la Frontera': { lat: 14.1000, lng: -89.7000 },
        'Texistepeque': { lat: 14.1333, lng: -89.5000 },

        // San Miguel
        'San Miguel': { lat: 13.4769, lng: -88.1778 },
        'Carolina': { lat: 13.3500, lng: -88.1000 },
        'Chapeltique': { lat: 13.6333, lng: -88.2667 },
        'Chinameca': { lat: 13.5000, lng: -88.3500 },
        'Chirilagua': { lat: 13.2167, lng: -88.1333 },
        'Ciudad Barrios': { lat: 13.7667, lng: -88.2667 },
        'Comacarán': { lat: 13.5667, lng: -88.0500 },
        'El Tránsito': { lat: 13.3500, lng: -88.3500 },
        'Lolotique': { lat: 13.5500, lng: -88.3500 },
        'Moncagua': { lat: 13.5333, lng: -88.2500 },
        'Nueva Guadalupe': { lat: 13.5333, lng: -88.3500 },
        'Nuevo Edén de San Juan': { lat: 13.8167, lng: -88.4833 },
        'Quelepa': { lat: 13.4333, lng: -88.2333 },
        'San Antonio': { lat: 13.3833, lng: -88.2333 },
        'San Gerardo': { lat: 13.8000, lng: -88.3500 },
        'San Jorge': { lat: 13.3500, lng: -88.3500 },
        'San Luis de la Reina': { lat: 13.7167, lng: -88.3500 },
        'San Rafael Oriente': { lat: 13.3833, lng: -88.3500 },
        'Sesori': { lat: 13.7167, lng: -88.3667 },
        'Uluazapa': { lat: 13.8000, lng: -88.2500 },

        // Sonsonate
        'Sonsonate': { lat: 13.7203, lng: -89.7242 },
        'Acajutla': { lat: 13.5833, lng: -89.8333 },
        'Armenia': { lat: 13.7500, lng: -89.5000 },
        'Caluco': { lat: 13.7500, lng: -89.6500 },
        'Cuisnahuat': { lat: 13.6167, lng: -89.7500 },
        'Izalco': { lat: 13.7500, lng: -89.6667 },
        'Juayúa': { lat: 13.8333, lng: -89.7500 },
        'Nahuizalco': { lat: 13.7833, lng: -89.7333 },
        'Nahulingo': { lat: 13.7000, lng: -89.7000 },
        'Salcoatitán': { lat: 13.8333, lng: -89.6833 },
        'San Antonio del Monte': { lat: 13.7167, lng: -89.7500 },
        'San Julián': { lat: 13.6667, lng: -89.6667 },
        'Santa Catarina Masahuat': { lat: 13.6667, lng: -89.7500 },
        'Santa Isabel Ishuatán': { lat: 13.6167, lng: -89.6667 },
        'Santo Domingo de Guzmán': { lat: 13.7000, lng: -89.8000 },
        'Sonzacate': { lat: 13.7333, lng: -89.7000 },

        // Ahuachapán
        'Ahuachapán': { lat: 13.9214, lng: -89.8450 },
        'Apaneca': { lat: 13.8500, lng: -89.8000 },
        'Atiquizaya': { lat: 13.9667, lng: -89.7500 },
        'Concepción de Ataco': { lat: 13.8667, lng: -89.8500 },
        'El Refugio': { lat: 13.9167, lng: -89.9167 },
        'Guaymango': { lat: 13.7500, lng: -89.8500 },
        'Jujutla': { lat: 13.7833, lng: -89.9167 },
        'San Francisco Menéndez': { lat: 13.8333, lng: -90.0000 },
        'San Lorenzo': { lat: 13.9167, lng: -89.7500 },
        'San Pedro Puxtla': { lat: 13.7667, lng: -89.8000 },
        'Tacuba': { lat: 13.9000, lng: -89.9333 },
        'Turín': { lat: 13.8500, lng: -89.9167 },

        // Usulután
        'Usulután': { lat: 13.3500, lng: -88.4500 },
        'Alegría': { lat: 13.5000, lng: -88.5000 },
        'Berlín': { lat: 13.5000, lng: -88.5333 },
        'California': { lat: 13.3500, lng: -88.3500 },
        'Concepción Batres': { lat: 13.3500, lng: -88.3667 },
        'El Triunfo': { lat: 13.3500, lng: -88.5000 },
        'Ereguayquín': { lat: 13.3500, lng: -88.4000 },
        'Estanzuelas': { lat: 13.3500, lng: -88.4333 },
        'Jiquilisco': { lat: 13.3167, lng: -88.5833 },
        'Jucuapa': { lat: 13.5167, lng: -88.3833 },
        'Jucuarán': { lat: 13.2500, lng: -88.2500 },
        'Mercedes Umaña': { lat: 13.5167, lng: -88.4333 },
        'Nueva Granada': { lat: 13.3500, lng: -88.3500 },
        'Ozatlán': { lat: 13.3833, lng: -88.5000 },
        'Puerto El Triunfo': { lat: 13.2833, lng: -88.5500 },
        'San Agustín': { lat: 13.4333, lng: -88.6000 },
        'San Buenaventura': { lat: 13.4333, lng: -88.5000 },
        'San Dionisio': { lat: 13.3500, lng: -88.3500 },
        'San Francisco Javier': { lat: 13.4333, lng: -88.4333 },
        'Santa Elena': { lat: 13.3833, lng: -88.4167 },
        'Santa María': { lat: 13.3500, lng: -88.3500 },
        'Santiago de María': { lat: 13.4833, lng: -88.4667 },
        'Tecapán': { lat: 13.3500, lng: -88.3500 },

        // La Unión
        'La Unión': { lat: 13.3369, lng: -87.8439 },
        'Anamorós': { lat: 13.7333, lng: -87.8667 },
        'Bolívar': { lat: 13.4500, lng: -88.0500 },
        'Concepción de Oriente': { lat: 13.8000, lng: -87.8000 },
        'Conchagua': { lat: 13.3000, lng: -87.8667 },
        'El Carmen': { lat: 13.4000, lng: -87.8667 },
        'El Sauce': { lat: 13.6667, lng: -87.8000 },
        'Intipucá': { lat: 13.2000, lng: -88.0500 },
        'Lislique': { lat: 13.7833, lng: -87.8667 },
        'Meanguera del Golfo': { lat: 13.2000, lng: -87.7000 },
        'Nueva Esparta': { lat: 13.7833, lng: -87.8333 },
        'Pasaquina': { lat: 13.5833, lng: -87.8333 },
        'Polorós': { lat: 13.3000, lng: -87.9500 },
        'San Alejo': { lat: 13.4333, lng: -87.9500 },
        'San José': { lat: 13.3500, lng: -87.9500 },
        'Santa Rosa de Lima': { lat: 13.6167, lng: -87.8667 },
        'Yayantique': { lat: 13.4500, lng: -88.0000 },
        'Yucuaiquín': { lat: 13.5333, lng: -87.9500 },

        // La Paz
        'La Paz': { lat: 13.4833, lng: -89.0167 },
        'Cuyultitán': { lat: 13.4500, lng: -89.0000 },
        'El Rosario': { lat: 13.5000, lng: -89.0333 },
        'Jerusalén': { lat: 13.6000, lng: -88.9833 },
        'Mercedes La Ceiba': { lat: 13.4500, lng: -88.9833 },
        'Olocuilta': { lat: 13.5667, lng: -89.1167 },
        'Paraíso de Osorio': { lat: 13.5000, lng: -88.9833 },
        'San Antonio Masahuat': { lat: 13.5000, lng: -89.0500 },
        'San Emigdio': { lat: 13.4500, lng: -88.9500 },
        'San Francisco Chinameca': { lat: 13.5000, lng: -88.9500 },
        'San Juan Nonualco': { lat: 13.5167, lng: -88.8667 },
        'San Juan Talpa': { lat: 13.5000, lng: -89.0833 },
        'San Juan Tepezontes': { lat: 13.6000, lng: -89.0000 },
        'San Luis La Herradura': { lat: 13.3500, lng: -88.9500 },
        'San Luis Talpa': { lat: 13.4500, lng: -89.0833 },
        'San Miguel Tepezontes': { lat: 13.6000, lng: -89.0167 },
        'San Pedro Masahuat': { lat: 13.5000, lng: -89.0333 },
        'San Pedro Nonualco': { lat: 13.5167, lng: -88.9167 },
        'San Rafael Obrajuelo': { lat: 13.5000, lng: -88.9500 },
        'Santa María Ostuma': { lat: 13.6000, lng: -88.9500 },
        'Santiago Nonualco': { lat: 13.5167, lng: -88.9500 },
        'Tapalhuaca': { lat: 13.5000, lng: -88.8667 },
        'Zacatecoluca': { lat: 13.5000, lng: -88.8667 },

        // Chalatenango
        'Chalatenango': { lat: 14.0333, lng: -88.9333 },
        'Agua Caliente': { lat: 14.1833, lng: -89.0000 },
        'Arcatao': { lat: 14.1167, lng: -88.7500 },
        'Azacualpa': { lat: 14.0000, lng: -88.8667 },
        'Cancasque': { lat: 14.0167, lng: -88.8667 },
        'Citalá': { lat: 14.3833, lng: -89.2167 },
        'Comalapa': { lat: 14.1333, lng: -89.0833 },
        'Concepción Quezaltepeque': { lat: 14.0833, lng: -88.9500 },
        'Dulce Nombre de María': { lat: 14.1500, lng: -88.8667 },
        'El Carrizal': { lat: 14.2500, lng: -88.8667 },
        'El Paraíso': { lat: 14.0833, lng: -88.8667 },
        'La Laguna': { lat: 14.1167, lng: -88.8667 },
        'La Palma': { lat: 14.3167, lng: -89.1667 },
        'La Reina': { lat: 14.2000, lng: -88.8667 },
        'Las Flores': { lat: 14.1167, lng: -88.8667 },
        'Las Vueltas': { lat: 14.0833, lng: -88.8667 },
        'Nombre de Jesús': { lat: 14.2500, lng: -88.8667 },
        'Nueva Concepción': { lat: 14.1333, lng: -89.3000 },
        'Nueva Trinidad': { lat: 14.0833, lng: -88.8667 },
        'Ojos de Agua': { lat: 14.0833, lng: -88.8667 },
        'Potonico': { lat: 14.0833, lng: -88.8667 },
        'San Antonio de la Cruz': { lat: 14.0833, lng: -88.8667 },
        'San Antonio Los Ranchos': { lat: 14.0833, lng: -88.8667 },
        'San Fernando': { lat: 14.0833, lng: -88.8667 },
        'San Francisco Lempa': { lat: 14.0833, lng: -88.8667 },
        'San Francisco Morazán': { lat: 14.0833, lng: -88.8667 },
        'San Ignacio': { lat: 14.3167, lng: -89.1667 },
        'San Isidro Labrador': { lat: 14.0833, lng: -88.8667 },
        'San José Cancasque': { lat: 14.0833, lng: -88.8667 },
        'San José Las Flores': { lat: 14.0833, lng: -88.8667 },
        'San Luis del Carmen': { lat: 14.0833, lng: -88.8667 },
        'San Miguel de Mercedes': { lat: 14.0833, lng: -88.8667 },
        'San Rafael': { lat: 14.0833, lng: -88.8667 },
        'Santa Rita': { lat: 14.0833, lng: -88.8667 },
        'Tejutla': { lat: 14.2500, lng: -89.0833 },

        // Cuscatlán
        'Cuscatlán': { lat: 13.7167, lng: -89.1000 },
        'Candelaria': { lat: 13.6833, lng: -89.0500 },
        'Cojutepeque': { lat: 13.7167, lng: -88.9333 },
        'El Carmen': { lat: 13.7000, lng: -89.0167 },
        'El Rosario': { lat: 13.7000, lng: -89.0167 },
        'Monte San Juan': { lat: 13.7000, lng: -89.0167 },
        'Oratorio de Concepción': { lat: 13.7000, lng: -89.0167 },
        'San Bartolomé Perulapía': { lat: 13.7000, lng: -89.0167 },
        'San Cristóbal': { lat: 13.7000, lng: -89.0167 },
        'San José Guayabal': { lat: 13.7000, lng: -89.0167 },
        'San Pedro Perulapán': { lat: 13.7000, lng: -89.0167 },
        'San Rafael Cedros': { lat: 13.7000, lng: -89.0167 },
        'San Ramón': { lat: 13.7000, lng: -89.0167 },
        'Santa Cruz Analquito': { lat: 13.7000, lng: -89.0167 },
        'Santa Cruz Michapa': { lat: 13.7000, lng: -89.0167 },
        'Suchitoto': { lat: 13.9333, lng: -89.0167 },
        'Tenancingo': { lat: 13.8333, lng: -89.0167 },

        // Morazán
        'Morazán': { lat: 13.7667, lng: -88.1000 },
        'Arambala': { lat: 13.7333, lng: -88.1000 },
        'Cacaopera': { lat: 13.7667, lng: -88.0833 },
        'Chilanga': { lat: 13.7500, lng: -88.1167 },
        'Corinto': { lat: 13.8000, lng: -88.0500 },
        'Delicias de Concepción': { lat: 13.7667, lng: -88.1000 },
        'El Divisadero': { lat: 13.7667, lng: -88.1000 },
        'El Rosario': { lat: 13.7667, lng: -88.1000 },
        'Gualococti': { lat: 13.7667, lng: -88.1000 },
        'Guatajiagua': { lat: 13.6667, lng: -88.2000 },
        'Joateca': { lat: 13.7667, lng: -88.1000 },
        'Jocoaitique': { lat: 13.7667, lng: -88.1000 },
        'Jocoro': { lat: 13.6167, lng: -88.0167 },
        'Lolotiquillo': { lat: 13.7667, lng: -88.1000 },
        'Meanguera': { lat: 13.7667, lng: -88.1000 },
        'Osicala': { lat: 13.7667, lng: -88.1000 },
        'Perquín': { lat: 13.7667, lng: -88.1000 },
        'San Carlos': { lat: 13.7667, lng: -88.1000 },
        'San Fernando': { lat: 13.7667, lng: -88.1000 },
        'San Francisco Gotera': { lat: 13.7667, lng: -88.1000 },
        'San Isidro': { lat: 13.7667, lng: -88.1000 },
        'San Simón': { lat: 13.7667, lng: -88.1000 },
        'Sensembra': { lat: 13.7667, lng: -88.1000 },
        'Sociedad': { lat: 13.7667, lng: -88.1000 },
        'Torola': { lat: 13.7667, lng: -88.1000 },
        'Yamabal': { lat: 13.7667, lng: -88.1000 },
        'Yoloaiquín': { lat: 13.7667, lng: -88.1000 },

        // San Vicente
        'San Vicente': { lat: 13.6333, lng: -88.8000 },
        'Apastepeque': { lat: 13.7000, lng: -88.7833 },
        'Guadalupe': { lat: 13.6500, lng: -88.7500 },
        'San Cayetano Istepeque': { lat: 13.6500, lng: -88.8167 },
        'San Esteban Catarina': { lat: 13.6833, lng: -88.8167 },
        'San Ildefonso': { lat: 13.7167, lng: -88.8500 },
        'San Lorenzo': { lat: 13.6500, lng: -88.8500 },
        'San Sebastián': { lat: 13.6500, lng: -88.8333 },
        'Santa Clara': { lat: 13.6500, lng: -88.7500 },
        'Santo Domingo': { lat: 13.6500, lng: -88.8000 },
        'Tecoluca': { lat: 13.5667, lng: -88.7500 },
        'Tepetitán': { lat: 13.6500, lng: -88.8000 },
        'Verapaz': { lat: 13.6500, lng: -88.8000 },

        // Cabañas
        'Cabañas': { lat: 13.8667, lng: -88.6333 },
        'Cinquera': { lat: 13.8667, lng: -88.6333 },
        'Dolores': { lat: 13.8667, lng: -88.6333 },
        'Guacotecti': { lat: 13.8667, lng: -88.6333 },
        'Ilobasco': { lat: 13.8667, lng: -88.8500 },
        'Jutiapa': { lat: 13.8667, lng: -88.6333 },
        'San Isidro': { lat: 13.8667, lng: -88.6333 },
        'Sensuntepeque': { lat: 13.8667, lng: -88.6333 },
        'Tejutepeque': { lat: 13.8667, lng: -88.6333 },
        'Victoria': { lat: 13.8667, lng: -88.6333 },

        // Municipios adicionales de Cabañas
        'Guacolecti': { lat: 13.8667, lng: -88.6333 },
        'Sensuntepeque': { lat: 13.8667, lng: -88.6333 },
        'Cinquera': { lat: 13.8667, lng: -88.6333 },
        'Dolores': { lat: 13.8667, lng: -88.6333 },
        'Guacotecti': { lat: 13.8667, lng: -88.6333 },
        'Ilobasco': { lat: 13.8667, lng: -88.8500 },
        'Jutiapa': { lat: 13.8667, lng: -88.6333 },
        'San Isidro': { lat: 13.8667, lng: -88.6333 },
        'Santa Cruz': { lat: 13.8667, lng: -88.6333 },
        'Suchitoto': { lat: 13.8667, lng: -88.6333 },

        // Municipios adicionales de Morazán
        'Perquín': { lat: 13.8667, lng: -88.6333 },
        'San Francisco Gotera': { lat: 13.8667, lng: -88.6333 },
        'Arambala': { lat: 13.8667, lng: -88.6333 },
        'Cacaopera': { lat: 13.8667, lng: -88.6333 },
        'Chilanga': { lat: 13.8667, lng: -88.6333 },
        'Corinto': { lat: 13.8667, lng: -88.6333 },
        'Delicias de Concepción': { lat: 13.8667, lng: -88.6333 },
        'El Divisadero': { lat: 13.8667, lng: -88.6333 },
        'El Rosario': { lat: 13.8667, lng: -88.6333 },
        'Gualococti': { lat: 13.8667, lng: -88.6333 },
        'Guatajiagua': { lat: 13.8667, lng: -88.6333 },
        'Jocoaitique': { lat: 13.8667, lng: -88.6333 },
        'Jocoro': { lat: 13.8667, lng: -88.6333 },
        'Lolotiquillo': { lat: 13.8667, lng: -88.6333 },
        'Meanguera': { lat: 13.8667, lng: -88.6333 },
        'Osicala': { lat: 13.8667, lng: -88.6333 },
        'San Carlos': { lat: 13.8667, lng: -88.6333 },
        'San Fernando': { lat: 13.8667, lng: -88.6333 },
        'San Simón': { lat: 13.8667, lng: -88.6333 },
        'Sensembra': { lat: 13.8667, lng: -88.6333 },
        'Sociedad': { lat: 13.8667, lng: -88.6333 },
        'Torola': { lat: 13.8667, lng: -88.6333 },
        'Yamabal': { lat: 13.8667, lng: -88.6333 },
        'Yoloaiquín': { lat: 13.8667, lng: -88.6333 }
      };

      // Buscar por municipio exacto (case insensitive)
      const exactMatch = municipalityCenters[municipality];
      if (exactMatch) {
        console.log('🗺️ [GeocodingService] Municipio encontrado en base de datos:', municipality, exactMatch);
        return exactMatch;
      }

      // Buscar por municipio con diferentes variaciones de nombre
      const municipalityLower = municipality.toLowerCase();
      for (const [key, value] of Object.entries(municipalityCenters)) {
        if (key.toLowerCase() === municipalityLower) {
          console.log('🗺️ [GeocodingService] Municipio encontrado por variación:', key, value);
          return value;
        }
      }

      console.log('🗺️ [GeocodingService] Municipio no encontrado:', municipality, 'usando centro del departamento:', department);
      // Si no se encuentra el municipio exacto, usar el centro del departamento
      return this.getDepartmentCenter(department);
    }

    /**
     * Buscar municipio usando geocodificación online como fallback
     * @param {string} municipality - Nombre del municipio
     * @param {string} department - Nombre del departamento
     * @returns {Promise<Object|null>} Coordenadas del municipio
     */
    async searchMunicipalityOnline(municipality, department) {
      try {
        const query = `${municipality}, ${department}, El Salvador`;
        const encodedQuery = encodeURIComponent(query);
        
        const url = `${this.baseUrl}/search?` + new URLSearchParams({
          format: 'json',
          q: encodedQuery,
          countrycodes: this.countryCode,
          limit: '1',
          addressdetails: '1'
        });

        console.log('🗺️ [GeocodingService] Búsqueda online de municipio:', query);
        
        const response = await fetch(url, {
          headers: {
            'User-Agent': this.userAgent,
            'Accept': 'application/json',
            'Accept-Language': 'es,en'
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (data && data.length > 0) {
          const result = data[0];
          const coordinates = {
            lat: parseFloat(result.lat),
            lng: parseFloat(result.lon)
          };
          
          console.log('🗺️ [GeocodingService] Municipio encontrado online:', municipality, coordinates);
          return coordinates;
        }
        
        return null;
      } catch (error) {
        console.error('🗺️ [GeocodingService] Error en búsqueda online:', error);
        return null;
      }
    }
  }
  
  // Crear instancia singleton
  const geocodingService = new GeocodingService();
  
  export default geocodingService;