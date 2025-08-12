// src/api/productService.js
import apiClient from './ApiClient';

const BASE_URL = '/products';

export default {
  // ==================== OBTENER PRODUCTOS ====================
  
  // Obtener todos los productos con filtros avanzados
  getAll: async (params = {}) => {
    const {
      page = 1,
      limit = 12,
      category,
      isActive,
      search,
      sort = 'newest',
      featured
    } = params;

    const queryParams = new URLSearchParams();
    queryParams.append('page', page);
    queryParams.append('limit', limit);
    if (category) queryParams.append('category', category);
    if (isActive !== undefined) queryParams.append('isActive', isActive);
    if (search) queryParams.append('search', search);
    if (sort) queryParams.append('sort', sort);
    if (featured !== undefined) queryParams.append('featured', featured);

    const response = await apiClient.get(`${BASE_URL}?${queryParams}`);
    return response;
  },

  // Obtener producto por ID con configuración Konva
  getById: async (id) => {
    const response = await apiClient.get(`${BASE_URL}/${id}`);
    return response;
  },

  // Buscar productos
  search: async (query, limit = 10) => {
    const queryParams = new URLSearchParams({
      q: query,
      limit: limit.toString()
    });

    const response = await apiClient.get(`${BASE_URL}/search?${queryParams}`);
    return response;
  },

  // Obtener productos relacionados
  getRelated: async (id, limit = 4) => {
    const response = await apiClient.get(`${BASE_URL}/${id}/related?limit=${limit}`);
    return response;
  },

  // ==================== CONFIGURACIÓN KONVA ====================
  
  // Obtener configuración Konva para un producto
  getKonvaConfig: async (id, options = {}) => {
    const queryParams = new URLSearchParams();
    if (options.mode) queryParams.append('mode', options.mode);
    if (options.guides) queryParams.append('guides', options.guides);
    if (options.grid) queryParams.append('grid', options.grid);

    const url = queryParams.toString() 
      ? `${BASE_URL}/${id}/konva-config?${queryParams}`
      : `${BASE_URL}/${id}/konva-config`;

    const response = await apiClient.get(url);
    return response;
  },

  // Obtener configuración del editor para admin
  getEditorConfig: async (id) => {
    const response = await apiClient.get(`${BASE_URL}/${id}/editor-config`);
    return response;
  },

  // Vista previa de áreas (para validar antes de crear producto)
  previewAreas: async (areas, imageUrl) => {
    const response = await apiClient.post(`${BASE_URL}/preview-areas`, {
      areas,
      imageUrl
    });
    return response;
  },

  // ==================== CREAR Y ACTUALIZAR ====================
  
  // Crear nuevo producto con imágenes
  create: async (productData) => {
    // Crear FormData para manejar archivos
    const formData = new FormData();
    
    // Campos básicos
    formData.append('name', productData.name);
    formData.append('basePrice', productData.basePrice);
    formData.append('categoryId', productData.categoryId);
    formData.append('productionTime', productData.productionTime || 3);
    formData.append('isActive', productData.isActive);
    
    if (productData.description) {
      formData.append('description', productData.description);
    }
    
    if (productData.featured !== undefined) {
      formData.append('featured', productData.featured);
    }

    // Áreas de personalización
    if (productData.customizationAreas) {
      formData.append('customizationAreas', JSON.stringify(productData.customizationAreas));
    }

    // Opciones del producto
    if (productData.options && productData.options.length > 0) {
      formData.append('options', JSON.stringify(productData.options));
    }

    // Tags de búsqueda
    if (productData.searchTags && productData.searchTags.length > 0) {
      formData.append('searchTags', JSON.stringify(productData.searchTags));
    }

    // Imagen principal
    if (productData.mainImage) {
      formData.append('mainImage', productData.mainImage);
    }

    // Imágenes adicionales
    if (productData.additionalImages && productData.additionalImages.length > 0) {
      productData.additionalImages.forEach((file, index) => {
        formData.append('additionalImages', file);
      });
    }

    const response = await apiClient.post(BASE_URL, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    });
    return response;
  },

  // Actualizar producto existente
  update: async (id, productData) => {
    const formData = new FormData();
    
    // Solo agregar campos que han cambiado
    if (productData.name !== undefined) {
      formData.append('name', productData.name);
    }
    if (productData.description !== undefined) {
      formData.append('description', productData.description);
    }
    if (productData.basePrice !== undefined) {
      formData.append('basePrice', productData.basePrice);
    }
    if (productData.categoryId !== undefined) {
      formData.append('categoryId', productData.categoryId);
    }
    if (productData.productionTime !== undefined) {
      formData.append('productionTime', productData.productionTime);
    }
    if (productData.isActive !== undefined) {
      formData.append('isActive', productData.isActive);
    }
    if (productData.featured !== undefined) {
      formData.append('featured', productData.featured);
    }

    // Áreas de personalización actualizadas
    if (productData.customizationAreas) {
      formData.append('customizationAreas', JSON.stringify(productData.customizationAreas));
    }

    // Opciones actualizadas
    if (productData.options) {
      formData.append('options', JSON.stringify(productData.options));
    }

    // Tags actualizados
    if (productData.searchTags) {
      formData.append('searchTags', JSON.stringify(productData.searchTags));
    }

    // Nueva imagen principal si se cambió
    if (productData.mainImage) {
      formData.append('mainImage', productData.mainImage);
    }

    // Nuevas imágenes adicionales si se cambiaron
    if (productData.additionalImages && productData.additionalImages.length > 0) {
      productData.additionalImages.forEach((file) => {
        formData.append('additionalImages', file);
      });
    }

    const response = await apiClient.put(`${BASE_URL}/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    });
    return response;
  },

  // ==================== ESTADÍSTICAS Y GESTIÓN ====================
  
  // Actualizar estadísticas de producto
  updateStats: async (id, action) => {
    const validActions = ['view', 'design', 'order'];
    if (!validActions.includes(action)) {
      throw new Error(`Acción inválida. Debe ser: ${validActions.join(', ')}`);
    }

    const response = await apiClient.patch(`${BASE_URL}/${id}/stats`, { action });
    return response;
  },

  // Eliminar producto
  delete: async (id) => {
    const response = await apiClient.delete(`${BASE_URL}/${id}`);
    return response;
  },

  // ==================== FUNCIONES DE DESARROLLO ====================
  
  // Crear productos de ejemplo (solo desarrollo)
  createSamples: async () => {
    const response = await apiClient.post(`${BASE_URL}/dev/create-samples`);
    return response;
  },

  // ==================== UTILIDADES ====================
  
  // Validar datos del producto antes de enviar
  validateProductData: (productData) => {
    const errors = [];

    if (!productData.name || productData.name.trim().length < 2) {
      errors.push('El nombre debe tener al menos 2 caracteres');
    }

    if (!productData.basePrice || productData.basePrice <= 0) {
      errors.push('El precio debe ser mayor que 0');
    }

    if (!productData.categoryId) {
      errors.push('Debe seleccionar una categoría');
    }

    if (!productData.mainImage && !productData.id) {
      errors.push('Debe proporcionar una imagen principal');
    }

    if (!productData.customizationAreas || productData.customizationAreas.length === 0) {
      errors.push('Debe definir al menos un área de personalización');
    }

    // Validar áreas de personalización
    if (productData.customizationAreas) {
      productData.customizationAreas.forEach((area, index) => {
        if (!area.name || area.name.trim().length === 0) {
          errors.push(`Área ${index + 1}: El nombre es requerido`);
        }
        
        if (!area.position || typeof area.position.x !== 'number' || 
            typeof area.position.y !== 'number' || 
            typeof area.position.width !== 'number' || 
            typeof area.position.height !== 'number') {
          errors.push(`Área ${index + 1}: Las dimensiones deben ser números válidos`);
        }

        if (area.position && (area.position.width <= 0 || area.position.height <= 0)) {
          errors.push(`Área ${index + 1}: Las dimensiones deben ser mayores que 0`);
        }
      });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  // Formatear producto para mostrar en la UI
  formatProduct: (product) => {
    return {
      ...product,
      id: product._id || product.id,
      formattedPrice: new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'USD'
      }).format(product.basePrice),
      statusText: product.isActive ? 'Activo' : 'Inactivo',
      categoryName: product.category?.name || 'Sin categoría',
      mainImage: product.images?.main || null,
      additionalImages: product.images?.additional || [],
      totalOrders: product.metadata?.stats?.orders || 0,
      totalViews: product.metadata?.stats?.views || 0,
      createdDate: product.createdAt ? new Date(product.createdAt).toLocaleDateString() : null
    };
  },

  // Preparar datos para el editor Konva
  prepareForKonvaEditor: (product) => {
    return {
      productId: product._id,
      productName: product.name,
      backgroundImage: product.images?.main,
      areas: product.customizationAreas?.map(area => ({
        id: area._id,
        name: area.name,
        displayName: area.displayName,
        x: area.position.x,
        y: area.position.y,
        width: area.position.width,
        height: area.position.height,
        rotation: area.position.rotationDegree || 0,
        accepts: area.accepts,
        maxElements: area.maxElements || 10,
        strokeColor: area.konvaConfig?.strokeColor || '#06AED5',
        strokeWidth: area.konvaConfig?.strokeWidth || 2,
        fillOpacity: area.konvaConfig?.fillOpacity || 0.1
      })) || []
    };
  },

  // Convertir datos del editor Konva a formato del backend
  prepareFromKonvaEditor: (konvaData) => {
    return {
      customizationAreas: konvaData.areas?.map(area => ({
        name: area.name,
        displayName: area.displayName || area.name,
        position: {
          x: Math.round(area.x),
          y: Math.round(area.y),
          width: Math.round(area.width),
          height: Math.round(area.height),
          rotationDegree: area.rotation || 0
        },
        accepts: {
          text: area.accepts?.text !== false,
          image: area.accepts?.image !== false
        },
        defaultPlacement: 'center',
        maxElements: area.maxElements || 10,
        konvaConfig: {
          strokeColor: area.strokeColor || '#06AED5',
          strokeWidth: area.strokeWidth || 2,
          fillOpacity: area.fillOpacity || 0.1,
          cornerRadius: 0,
          dash: []
        }
      })) || []
    };
  }
};