// src/api/ProductService.js - VERSIÓN SIMPLIFICADA Y CORREGIDA
import apiClient from './ApiClient';

const BASE_URL = '/products';

const ProductService = {
  // ==================== OBTENER PRODUCTOS ====================
  
  getAll: async (params = {}) => {
    try {
      const {
        page = 1,
        limit = 12,
        category,
        isActive,
        search,
        sort = 'newest',
        featured
      } = params;

      console.log('🔍 [ProductService] Obteniendo productos con params:', params);

      const queryParams = new URLSearchParams();
      queryParams.append('page', page.toString());
      queryParams.append('limit', limit.toString());
      
      if (category && category.trim() !== '') queryParams.append('category', category);
      if (isActive !== undefined && isActive !== '') queryParams.append('isActive', isActive);
      if (search && search.trim() !== '') queryParams.append('search', search.trim());
      if (sort) queryParams.append('sort', sort);
      if (featured !== undefined && featured !== '') queryParams.append('featured', featured);

      const url = `${BASE_URL}?${queryParams.toString()}`;
      console.log('📡 [ProductService] URL final:', url);

      const response = await apiClient.get(url);
      
      console.log('✅ [ProductService] Productos obtenidos:', response);
      return response;
    } catch (error) {
      console.error('❌ [ProductService] Error obteniendo productos:', error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      console.log('🔍 [ProductService] Obteniendo producto por ID:', id);
      
      if (!id) {
        throw new Error('ID de producto requerido');
      }

      const response = await apiClient.get(`${BASE_URL}/${id}`);
      console.log('✅ [ProductService] Producto obtenido:', response);
      return response;
    } catch (error) {
      console.error('❌ [ProductService] Error obteniendo producto:', error);
      throw error;
    }
  },

  search: async (query, limit = 10) => {
    try {
      console.log('🔍 [ProductService] Buscando productos:', { query, limit });
      
      if (!query || query.trim().length < 2) {
        return { success: true, data: { products: [] } };
      }

      const queryParams = new URLSearchParams({
        q: query.trim(),
        limit: limit.toString()
      });

      const response = await apiClient.get(`${BASE_URL}/search?${queryParams}`);
      console.log('✅ [ProductService] Resultados de búsqueda:', response);
      return response;
    } catch (error) {
      console.error('❌ [ProductService] Error en búsqueda:', error);
      throw error;
    }
  },

  getRelated: async (id, limit = 4) => {
    try {
      console.log('🔍 [ProductService] Obteniendo productos relacionados:', { id, limit });
      
      if (!id) {
        throw new Error('ID de producto requerido para productos relacionados');
      }

      const response = await apiClient.get(`${BASE_URL}/${id}/related?limit=${limit}`);
      console.log('✅ [ProductService] Productos relacionados:', response);
      return response;
    } catch (error) {
      console.error('❌ [ProductService] Error obteniendo productos relacionados:', error);
      throw error;
    }
  },

  // ==================== CONFIGURACIÓN KONVA ====================
  
  getKonvaConfig: async (id, options = {}) => {
    try {
      console.log('🎨 [ProductService] Obteniendo configuración Konva:', { id, options });
      
      if (!id) {
        throw new Error('ID de producto requerido para configuración Konva');
      }

      const queryParams = new URLSearchParams();
      if (options.mode) queryParams.append('mode', options.mode);
      if (options.guides !== undefined) queryParams.append('guides', options.guides.toString());
      if (options.grid !== undefined) queryParams.append('grid', options.grid.toString());

      const url = queryParams.toString() 
        ? `${BASE_URL}/${id}/konva-config?${queryParams}`
        : `${BASE_URL}/${id}/konva-config`;

      const response = await apiClient.get(url);
      console.log('✅ [ProductService] Configuración Konva obtenida:', response);
      return response;
    } catch (error) {
      console.error('❌ [ProductService] Error obteniendo configuración Konva:', error);
      throw error;
    }
  },

  // ==================== CREAR Y ACTUALIZAR - VERSIÓN SIMPLIFICADA ====================
  
  create: async (productData) => {
    try {
      console.log('🆕 [ProductService] Creando producto:', productData);

      // ✅ VALIDACIÓN BÁSICA SIMPLIFICADA
      if (!productData.name || !productData.name.trim()) {
        throw new Error('El nombre del producto es obligatorio');
      }
      
      if (!productData.basePrice || isNaN(productData.basePrice) || parseFloat(productData.basePrice) <= 0) {
        throw new Error('El precio base debe ser un número mayor que 0');
      }
      
      if (!productData.categoryId || !productData.categoryId.trim()) {
        throw new Error('La categoría es obligatoria');
      }
      
      if (!productData.mainImage) {
        throw new Error('La imagen principal es obligatoria');
      }
      
      if (!productData.customizationAreas || !Array.isArray(productData.customizationAreas) || productData.customizationAreas.length === 0) {
        throw new Error('Debe definir al menos un área de personalización');
      }

      // ✅ VALIDAR ARCHIVO DE IMAGEN PRINCIPAL
      if (!(productData.mainImage instanceof File)) {
        throw new Error('La imagen principal debe ser un archivo válido');
      }
      
      const mainImageValidation = ProductService.validateImageFile(productData.mainImage);
      if (!mainImageValidation.isValid) {
        throw new Error(`Imagen principal inválida: ${mainImageValidation.error}`);
      }

      // ✅ CREAR FORMDATA SIMPLIFICADO
      const formData = new FormData();
      
      // Campos básicos
      formData.append('name', productData.name.trim());
      formData.append('basePrice', productData.basePrice.toString());
      formData.append('categoryId', productData.categoryId.trim());
      formData.append('productionTime', (productData.productionTime || 3).toString());
      formData.append('isActive', productData.isActive !== false ? 'true' : 'false');
      
      if (productData.description && productData.description.trim()) {
        formData.append('description', productData.description.trim());
      }
      
      if (productData.featured !== undefined) {
        formData.append('featured', productData.featured ? 'true' : 'false');
      }

      // ✅ ÁREAS DE PERSONALIZACIÓN - SIMPLIFICADO
      try {
        const areasString = JSON.stringify(productData.customizationAreas);
        formData.append('customizationAreas', areasString);
        console.log('✅ [ProductService] Áreas serializadas correctamente');
      } catch (error) {
        throw new Error(`Error procesando áreas de personalización: ${error.message}`);
      }

      // ✅ OPCIONES DEL PRODUCTO - SIMPLIFICADO
      if (productData.options && Array.isArray(productData.options) && productData.options.length > 0) {
        try {
          const optionsString = JSON.stringify(productData.options);
          formData.append('options', optionsString);
          console.log('✅ [ProductService] Opciones serializadas correctamente');
        } catch (error) {
          throw new Error(`Error procesando opciones: ${error.message}`);
        }
      }

      // ✅ TAGS DE BÚSQUEDA - SIMPLIFICADO
      if (productData.searchTags && Array.isArray(productData.searchTags)) {
        const validTags = productData.searchTags
          .filter(tag => tag && typeof tag === 'string' && tag.trim().length > 0)
          .map(tag => tag.trim().toLowerCase())
          .slice(0, 10);
        
        if (validTags.length > 0) {
          formData.append('searchTags', JSON.stringify(validTags));
          console.log('✅ [ProductService] Tags procesados:', validTags);
        }
      }

      // ✅ IMAGEN PRINCIPAL
      formData.append('mainImage', productData.mainImage, productData.mainImage.name);
      console.log('✅ [ProductService] Imagen principal agregada:', {
        name: productData.mainImage.name,
        size: `${(productData.mainImage.size / 1024).toFixed(2)}KB`,
        type: productData.mainImage.type
      });

      // ✅ IMÁGENES ADICIONALES - SIMPLIFICADO
      if (productData.additionalImages && Array.isArray(productData.additionalImages) && productData.additionalImages.length > 0) {
        if (productData.additionalImages.length > 5) {
          throw new Error('Máximo 5 imágenes adicionales permitidas');
        }
        
        productData.additionalImages.forEach((file, index) => {
          if (!(file instanceof File)) {
            throw new Error(`Imagen adicional ${index + 1} debe ser un archivo válido`);
          }
          
          const imageValidation = ProductService.validateImageFile(file);
          if (!imageValidation.isValid) {
            throw new Error(`Imagen adicional ${index + 1} inválida: ${imageValidation.error}`);
          }
          
          formData.append('additionalImages', file, file.name);
        });
        
        console.log('✅ [ProductService] Imágenes adicionales agregadas:', productData.additionalImages.length);
      }

      // ✅ LOG SIMPLIFICADO DEL FORMDATA
      console.log('📤 [ProductService] FormData preparado con:', {
        fields: Array.from(formData.keys()).filter(key => typeof formData.get(key) === 'string'),
        files: Array.from(formData.keys()).filter(key => formData.get(key) instanceof File),
        totalSize: Array.from(formData.values())
          .filter(value => value instanceof File)
          .reduce((sum, file) => sum + file.size, 0)
      });

      // ✅ ENVIAR REQUEST
      const response = await apiClient.post(BASE_URL, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000, // 60 segundos
        maxContentLength: 50 * 1024 * 1024, // 50MB max
        maxBodyLength: 50 * 1024 * 1024,
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          console.log(`📊 [ProductService] Upload progress: ${percentCompleted}%`);
        }
      });

      console.log('✅ [ProductService] Producto creado exitosamente:', {
        productId: response.data?.product?._id,
        success: response.success
      });
      
      return response;
    } catch (error) {
      console.error('❌ [ProductService] Error creando producto:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      // ✅ MENSAJE DE ERROR SIMPLIFICADO
      let errorMessage = 'Error desconocido al crear producto';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      throw new Error(errorMessage);
    }
  },

  // ✅ FUNCIÓN SIMPLIFICADA PARA VALIDAR ARCHIVOS DE IMAGEN
  validateImageFile: (file) => {
    if (!file || !(file instanceof File)) {
      return { isValid: false, error: 'Debe ser un archivo válido' };
    }
    
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    
    if (file.size > maxSize) {
      return { 
        isValid: false, 
        error: `Archivo muy grande (${(file.size / 1024 / 1024).toFixed(2)}MB). Máximo 5MB permitido` 
      };
    }
    
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      return { 
        isValid: false, 
        error: `Tipo de archivo no válido (${file.type}). Use JPG, PNG o WEBP` 
      };
    }
    
    if (!file.name || file.name.trim() === '') {
      return { isValid: false, error: 'El archivo debe tener un nombre válido' };
    }
    
    return { isValid: true };
  },

  // Actualizar producto existente
  update: async (id, productData) => {
    try {
      console.log('✏️ [ProductService] Actualizando producto:', { id, productData });

      if (!id) {
        throw new Error('ID de producto requerido para actualización');
      }

      const formData = new FormData();
      
      // Solo agregar campos que han cambiado (diferente de undefined)
      if (productData.name !== undefined && productData.name.trim()) {
        formData.append('name', productData.name.trim());
      }
      
      if (productData.description !== undefined) {
        formData.append('description', productData.description ? productData.description.trim() : '');
      }
      
      if (productData.basePrice !== undefined) {
        formData.append('basePrice', productData.basePrice.toString());
      }
      
      if (productData.categoryId !== undefined) {
        formData.append('categoryId', productData.categoryId);
      }
      
      if (productData.productionTime !== undefined) {
        formData.append('productionTime', productData.productionTime.toString());
      }
      
      if (productData.isActive !== undefined) {
        formData.append('isActive', productData.isActive ? 'true' : 'false');
      }
      
      if (productData.featured !== undefined) {
        formData.append('featured', productData.featured ? 'true' : 'false');
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
      if (productData.searchTags && Array.isArray(productData.searchTags)) {
        const validTags = productData.searchTags
          .filter(tag => tag && tag.trim().length > 0)
          .map(tag => tag.trim().toLowerCase())
          .slice(0, 10);
        
        formData.append('searchTags', JSON.stringify(validTags));
      }

      // Nueva imagen principal si se cambió
      if (productData.mainImage && productData.mainImage instanceof File) {
        formData.append('mainImage', productData.mainImage);
      }

      // Nuevas imágenes adicionales si se cambiaron
      if (productData.additionalImages && Array.isArray(productData.additionalImages)) {
        if (productData.additionalImages.length > 5) {
          throw new Error('Máximo 5 imágenes adicionales permitidas');
        }
        
        productData.additionalImages.forEach((file) => {
          if (file instanceof File) {
            formData.append('additionalImages', file);
          }
        });
      }

      console.log('📤 [ProductService] FormData para actualización preparado');

      const response = await apiClient.put(`${BASE_URL}/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000
      });

      console.log('✅ [ProductService] Producto actualizado exitosamente:', response);
      return response;
    } catch (error) {
      console.error('❌ [ProductService] Error actualizando producto:', error);
      throw error;
    }
  },

  // ==================== ESTADÍSTICAS Y GESTIÓN ====================
  
  updateStats: async (id, action) => {
    try {
      const validActions = ['view', 'design', 'order'];
      if (!validActions.includes(action)) {
        throw new Error(`Acción inválida. Debe ser: ${validActions.join(', ')}`);
      }

      if (!id) {
        throw new Error('ID de producto requerido para actualizar estadísticas');
      }

      const response = await apiClient.patch(`${BASE_URL}/${id}/stats`, { action });
      return response;
    } catch (error) {
      // Error silencioso para estadísticas
      throw error;
    }
  },

  delete: async (id) => {
    try {
      console.log('🗑️ [ProductService] Eliminando producto:', id);
      
      if (!id) {
        throw new Error('ID de producto requerido para eliminación');
      }

      const response = await apiClient.delete(`${BASE_URL}/${id}`);
      console.log('✅ [ProductService] Producto eliminado:', response);
      return response;
    } catch (error) {
      console.error('❌ [ProductService] Error eliminando producto:', error);
      throw error;
    }
  },

  // ==================== FUNCIONES DE DESARROLLO ====================
  
  createSamples: async () => {
    try {
      console.log('🧪 [ProductService] Creando productos de ejemplo...');
      
      const response = await apiClient.post(`${BASE_URL}/dev/create-samples`);
      console.log('✅ [ProductService] Productos de ejemplo creados:', response);
      return response;
    } catch (error) {
      console.error('❌ [ProductService] Error creando productos de ejemplo:', error);
      throw error;
    }
  },

  // ==================== UTILIDADES SIMPLIFICADAS ====================
  
  formatProduct: (product) => {
    if (!product || typeof product !== 'object') {
      return null;
    }

    const safeName = product.name || 'Producto sin nombre';
    const safePrice = typeof product.basePrice === 'number' ? product.basePrice : 0;

    return {
      ...product,
      id: product._id || product.id,
      name: safeName,
      basePrice: safePrice,
      formattedPrice: new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'USD'
      }).format(safePrice),
      statusText: product.isActive ? 'Activo' : 'Inactivo',
      categoryName: product.category?.name || 'Sin categoría',
      mainImage: product.images?.main || null,
      additionalImages: product.images?.additional || [],
      totalOrders: product.metadata?.stats?.orders || 0,
      totalViews: product.metadata?.stats?.views || 0,
      totalDesigns: product.metadata?.stats?.designs || 0,
      isFeatured: product.metadata?.featured || false,
      searchTags: product.metadata?.searchTags || [],
      createdDate: product.createdAt ? new Date(product.createdAt).toLocaleDateString() : null,
      updatedDate: product.updatedAt ? new Date(product.updatedAt).toLocaleDateString() : null,
      daysAgo: product.createdAt ? ProductService.calculateDaysAgo(product.createdAt) : 0
    };
  },

  calculateDaysAgo: (date) => {
    if (!date) return 0;
    try {
      const now = new Date();
      const createdDate = new Date(date);
      const diffTime = Math.abs(now - createdDate);
      return Math.floor(diffTime / (1000 * 60 * 60 * 24));
    } catch (error) {
      console.error('Error calculando días:', error);
      return 0;
    }
  },

  // ==================== VALIDACIONES SIMPLIFICADAS ====================

  validateProductData: (productData) => {
    const errors = [];

    // Validación básica simplificada
    if (!productData.name || typeof productData.name !== 'string' || productData.name.trim().length < 2) {
      errors.push('El nombre debe tener al menos 2 caracteres');
    }
    if (productData.name && productData.name.trim().length > 100) {
      errors.push('El nombre no puede exceder 100 caracteres');
    }

    if (!productData.basePrice || isNaN(productData.basePrice) || parseFloat(productData.basePrice) <= 0) {
      errors.push('El precio debe ser un número mayor que 0');
    }
    if (productData.basePrice && parseFloat(productData.basePrice) > 10000) {
      errors.push('El precio no puede exceder $10,000');
    }

    if (!productData.categoryId || typeof productData.categoryId !== 'string') {
      errors.push('Debe seleccionar una categoría válida');
    }

    // Validación de imagen principal (solo para creación)
    if (!productData.id && (!productData.mainImage || !(productData.mainImage instanceof File))) {
      errors.push('Debe proporcionar una imagen principal válida');
    }

    if (productData.mainImage instanceof File) {
      const imageValidation = ProductService.validateImageFile(productData.mainImage);
      if (!imageValidation.isValid) {
        errors.push(imageValidation.error);
      }
    }

    // Validación de imágenes adicionales
    if (productData.additionalImages && Array.isArray(productData.additionalImages)) {
      if (productData.additionalImages.length > 5) {
        errors.push('Máximo 5 imágenes adicionales permitidas');
      }
      
      productData.additionalImages.forEach((file, index) => {
        if (!(file instanceof File)) {
          errors.push(`Imagen adicional ${index + 1} debe ser un archivo válido`);
          return;
        }
        
        const imageValidation = ProductService.validateImageFile(file);
        if (!imageValidation.isValid) {
          errors.push(`Imagen adicional ${index + 1}: ${imageValidation.error}`);
        }
      });
    }

    if (productData.productionTime && 
        (isNaN(productData.productionTime) || 
         parseInt(productData.productionTime) < 1 || 
         parseInt(productData.productionTime) > 30)) {
      errors.push('El tiempo de producción debe estar entre 1 y 30 días');
    }

    if (productData.description && productData.description.length > 1000) {
      errors.push('La descripción no puede exceder 1000 caracteres');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  // Limpiar datos del producto antes de enviar
  sanitizeProductData: (productData) => {
    const sanitized = { ...productData };

    // Limpiar strings
    if (sanitized.name) sanitized.name = sanitized.name.trim();
    if (sanitized.description) sanitized.description = sanitized.description.trim();

    // Convertir números
    if (sanitized.basePrice) sanitized.basePrice = parseFloat(sanitized.basePrice);
    if (sanitized.productionTime) sanitized.productionTime = parseInt(sanitized.productionTime);

    // Limpiar tags
    if (sanitized.searchTags && Array.isArray(sanitized.searchTags)) {
      sanitized.searchTags = sanitized.searchTags
        .filter(tag => tag && tag.trim().length > 0)
        .map(tag => tag.trim().toLowerCase())
        .slice(0, 10);
    }

    return sanitized;
  }
};

export default ProductService;