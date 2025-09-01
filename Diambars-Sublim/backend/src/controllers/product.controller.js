import Product from "../models/product.js";
import Design from "../models/design.js";
import Category from "../models/category.js";
import cloudinary from "../utils/cloudinary.js";
import fs from "fs";
import mongoose from "mongoose";
import { validateCustomizationAreas, generateKonvaConfig } from "../utils/productUtils.js";
import { validators, validateFields } from "../utils/validators.utils.js";

const productController = {};

/**
 * Obtiene todos los productos con filtrado avanzado
 */
productController.getAllProducts = async (req, res) => {
  try {
    console.log('🔍 Request query params:', req.query);

    const { 
      page = 1, 
      limit = 12, 
      category, 
      isActive, 
      search,
      sort = 'newest',
      featured
    } = req.query;

    // Validar parámetros de paginación
    const paginationValidation = validateFields({ page, limit }, {
      page: (value) => validators.quantity(value, 1, 1000),
      limit: (value) => validators.quantity(value, 1, 50)
    });

    if (!paginationValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: `Parámetros de paginación inválidos: ${paginationValidation.errors.join('; ')}`,
        error: 'INVALID_PAGINATION'
      });
    }

    const { page: pageNum, limit: limitNum } = paginationValidation.cleaned;

    // Construir filtro
    const filter = {};
    
    if (category && category.trim() !== '') {
      const categoryValidation = validators.mongoId(category, 'Categoría');
      if (categoryValidation.isValid) {
        filter.category = new mongoose.Types.ObjectId(categoryValidation.cleaned);
      }
    }
    
    if (isActive !== undefined && isActive !== '') {
      filter.isActive = isActive === 'true';
    }
    
    if (featured !== undefined && featured !== '') {
      filter['metadata.featured'] = featured === 'true';
    }
    
    if (search && search.trim() !== '') {
      const searchValidation = validators.text(search, 1, 100);
      if (searchValidation.isValid) {
        const searchRegex = new RegExp(searchValidation.cleaned, 'i');
        filter.$or = [
          { name: searchRegex },
          { description: searchRegex },
          { 'metadata.searchTags': searchRegex }
        ];
      }
    }

    // Configurar ordenamiento
    let sortOption = {};
    const validSortOptions = ['newest', 'oldest', 'price_asc', 'price_desc', 'name_asc', 'name_desc'];
    
    if (!validSortOptions.includes(sort)) {
      sortOption = { createdAt: -1 };
    } else {
      switch (sort) {
        case 'newest': sortOption = { createdAt: -1 }; break;
        case 'oldest': sortOption = { createdAt: 1 }; break;
        case 'price_asc': sortOption = { basePrice: 1 }; break;
        case 'price_desc': sortOption = { basePrice: -1 }; break;
        case 'name_asc': sortOption = { name: 1 }; break;
        case 'name_desc': sortOption = { name: -1 }; break;
        default: sortOption = { createdAt: -1 };
      }
    }

    const options = {
      page: pageNum,
      limit: limitNum,
      sort: sortOption,
      populate: [
        { 
          path: 'category', 
          select: 'name slug description',
          match: { isActive: true }
        }
      ],
      lean: true,
      customLabels: {
        totalDocs: 'totalProducts',
        docs: 'products',
        limit: 'perPage',
        page: 'currentPage',
        nextPage: 'next',
        prevPage: 'prev',
        hasNextPage: 'hasNext',
        hasPrevPage: 'hasPrev',
        pagingCounter: 'slNo',
        meta: 'pagination'
      }
    };

    console.log('🔍 Consultando productos con filtro:', filter);

    const result = await Product.paginate(filter, options);

    if (!result.products || result.products.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No se encontraron productos',
        data: {
          products: [],
          pagination: {
            totalProducts: 0,
            totalPages: 0,
            currentPage: pageNum,
            perPage: limitNum,
            hasNext: false,
            hasPrev: false,
            nextPage: null,
            prevPage: null
          },
          filters: { category, isActive, search, sort, featured }
        }
      });
    }

    // Formatear productos
    const products = result.products
      .filter(product => product && typeof product === 'object')
      .map(product => {
        try {
          const priceValidation = validators.price(product.basePrice, 0);
          const productionTimeValidation = validators.quantity(product.productionTime, 1, 30);

          return {
            _id: product._id || null,
            name: product.name || 'Producto sin nombre',
            description: product.description || '',
            category: product.category || null,
            basePrice: priceValidation.isValid ? priceValidation.cleaned : 0,
            productionTime: productionTimeValidation.isValid ? productionTimeValidation.cleaned : 3,
            isActive: Boolean(product.isActive),
            images: {
              main: product.images?.main || '',
              additional: Array.isArray(product.images?.additional) ? product.images.additional : []
            },
            customizationAreas: Array.isArray(product.customizationAreas) ? product.customizationAreas : [],
            options: Array.isArray(product.options) ? product.options : [],
            // ✅ CORREGIDO: Incluir editorConfig para que el frontend pueda usar las dimensiones exactas
            editorConfig: product.editorConfig || {
              stageWidth: 800,
              stageHeight: 600,
              backgroundFill: "#f8f9fa",
              gridSize: 10,
              snapToGrid: true,
              showRulers: true,
              allowZoom: true,
              minZoom: 0.5,
              maxZoom: 3
            },
            metadata: {
              featured: Boolean(product.metadata?.featured),
              searchTags: Array.isArray(product.metadata?.searchTags) ? product.metadata.searchTags : [],
              stats: {
                views: validateNumber(product.metadata?.stats?.views, 0),
                designs: validateNumber(product.metadata?.stats?.designs, 0),
                orders: validateNumber(product.metadata?.stats?.orders, 0)
              }
            },
            createdAt: product.createdAt || new Date(),
            updatedAt: product.updatedAt || new Date(),
            _links: {
              self: `/api/products/${product._id}`,
              designs: `/api/products/${product._id}/designs`,
              konvaConfig: `/api/products/${product._id}/konva-config`,
              category: product.category?._id ? `/api/categories/${product.category._id}` : null
            },
            formattedPrice: `$${(priceValidation.isValid ? priceValidation.cleaned : 0).toFixed(2)}`,
            daysAgo: calculateDaysAgo(product.createdAt),
            statusText: product.isActive ? 'Activo' : 'Inactivo'
          };
        } catch (transformError) {
          console.error('❌ Error transformando producto:', product._id, transformError);
          return null;
        }
      })        
      .filter(product => product !== null);

    console.log(`✅ Productos procesados exitosamente: ${products.length}`);

    const response = {
      success: true,
      message: `${products.length} producto${products.length !== 1 ? 's' : ''} encontrado${products.length !== 1 ? 's' : ''}`,
      data: {
        products,
        pagination: {
          totalProducts: result.totalProducts || 0,
          totalPages: result.totalPages || 0,
          currentPage: result.currentPage || pageNum,
          perPage: result.perPage || limitNum,
          hasNext: Boolean(result.hasNext),
          hasPrev: Boolean(result.hasPrev),
          nextPage: result.next || null,
          prevPage: result.prev || null
        },
        filters: {
          category: category || null,
          isActive: isActive || null,
          search: search || null,
          sort: sort || 'newest',
          featured: featured || null
        },
        meta: {
          requestedAt: new Date().toISOString(),
          processingTime: '< 1s'
        }
      }
    };

    res.status(200).json(response);

  } catch (error) {
    console.error("❌ Error en getAllProducts:", error);
    
    let statusCode = 500;
    let errorMessage = "Error interno del servidor";
    
    if (error.name === 'CastError') {
      statusCode = 400;
      errorMessage = "Parámetros de consulta inválidos";
    } else if (error.name === 'ValidationError') {
      statusCode = 400;
      errorMessage = "Error de validación en la consulta";
    }

    res.status(statusCode).json({ 
      success: false,
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? {
        message: error.message,
        stack: error.stack,
        name: error.name
      } : "Error interno del servidor",
      data: {
        products: [],
        pagination: {
          totalProducts: 0,
          totalPages: 0,
          currentPage: 1,
          perPage: 12,
          hasNext: false,
          hasPrev: false
        }
      }
    });
  }
};

/**
 * Obtiene un producto específico con su configuración para Konva
 */
productController.getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const idValidation = validators.mongoId(id, 'ID de producto');
    if (!idValidation.isValid) {
      return res.status(400).json({ 
        success: false,
        message: idValidation.error,
        error: 'INVALID_PRODUCT_ID'
      });
    }

    const product = await Product.findById(idValidation.cleaned)
      .populate('category', 'name description slug isActive')
      .lean();
    
    if (!product) {
      return res.status(404).json({ 
        success: false,
        message: "Producto no encontrado",
        error: 'PRODUCT_NOT_FOUND'
      });
    }

    const priceValidation = validators.price(product.basePrice, 0);
    const productionTimeValidation = validators.quantity(product.productionTime, 1, 30);

    const safeProduct = {
      ...product,
      basePrice: priceValidation.isValid ? priceValidation.cleaned : 0,
      productionTime: productionTimeValidation.isValid ? productionTimeValidation.cleaned : 3,
      images: {
        main: product.images?.main || '',
        additional: Array.isArray(product.images?.additional) ? product.images.additional : []
      },
      customizationAreas: Array.isArray(product.customizationAreas) ? product.customizationAreas : [],
      options: Array.isArray(product.options) ? product.options : [],
      // ✅ CORREGIDO: Incluir editorConfig para que el frontend pueda usar las dimensiones exactas
      editorConfig: product.editorConfig || {
        stageWidth: 800,
        stageHeight: 600,
        backgroundFill: "#f8f9fa",
        gridSize: 10,
        snapToGrid: true,
        showRulers: true,
        allowZoom: true,
        minZoom: 0.5,
        maxZoom: 3
      },
      metadata: {
        featured: Boolean(product.metadata?.featured),
        searchTags: Array.isArray(product.metadata?.searchTags) ? product.metadata.searchTags : [],
        stats: {
          views: validateNumber(product.metadata?.stats?.views, 0),
          designs: validateNumber(product.metadata?.stats?.designs, 0),
          orders: validateNumber(product.metadata?.stats?.orders, 0)
        }
      }
    };

    // Incrementar contador de vistas
    await Product.findByIdAndUpdate(idValidation.cleaned, {
      $inc: { 'metadata.stats.views': 1 }
    });

    const konvaConfig = generateKonvaConfig(safeProduct);

    res.status(200).json({
      success: true,
      message: "Producto encontrado",
      data: {
        product: {
          ...safeProduct,
          formattedPrice: `$${safeProduct.basePrice.toFixed(2)}`,
          daysAgo: calculateDaysAgo(safeProduct.createdAt)
        },
        konvaConfig,
        _links: {
          designs: `/api/products/${product._id}/designs`,
          konvaConfig: `/api/products/${product._id}/konva-config`,
          category: safeProduct.category?._id ? `/api/categories/${safeProduct.category._id}` : null,
          update: `/api/products/${product._id}`,
          delete: `/api/products/${product._id}`
        }
      }
    });
  } catch (error) {
    console.error("❌ Error en getProductById:", error);
    res.status(500).json({ 
      success: false,
      message: "Error al obtener el producto",
      error: process.env.NODE_ENV === 'development' ? error.message : "Error interno"
    });
  }
};

/**
 * Crea un nuevo producto - CORREGIDO
 */
productController.createProduct = async (req, res) => {
  // Variables para cleanup
  let tempFiles = [];
  let cloudinaryFiles = [];
  
  try {
    const { 
      name, 
      description, 
      categoryId,
      basePrice,
      productionTime,
      isActive,
      options = [],
      featured = false,
      searchTags = []
    } = req.body;

    console.log('🆕 Creando producto:', { 
      name, 
      categoryId, 
      basePrice,
      hasMainImage: !!req.files?.mainImage,
      hasAdditionalImages: !!req.files?.additionalImages 
    });

    // 1. VALIDACIÓN BÁSICA
    if (!name?.trim()) {
      throw new Error('El nombre del producto es obligatorio');
    }
    if (!categoryId?.trim()) {
      throw new Error('La categoría es obligatoria');
    }
    if (!basePrice || parseFloat(basePrice) <= 0) {
      throw new Error('El precio base debe ser mayor que 0');
    }
    if (!req.files?.mainImage) {
      throw new Error('La imagen principal del producto es obligatoria');
    }

    // 2. VALIDAR QUE LA CATEGORÍA EXISTE Y ESTÁ ACTIVA
    const categoryValidation = validators.mongoId(categoryId, 'Categoría');
    if (!categoryValidation.isValid) {
      throw new Error('ID de categoría inválido');
    }

    const category = await Category.findOne({ 
      _id: categoryValidation.cleaned, 
      isActive: true 
    });
    
    if (!category) {
      throw new Error('La categoría especificada no existe o no está activa');
    }

    // 3. PROCESAR ÁREAS DE PERSONALIZACIÓN
    let customizationAreas = [];
    try {
      if (req.body.customizationAreas) {
        customizationAreas = JSON.parse(req.body.customizationAreas);
        
        const areaValidation = validateCustomizationAreas(customizationAreas);
        if (!areaValidation.isValid) {
          throw new Error(`Áreas de personalización inválidas: ${areaValidation.errors.join(', ')}`);
        }
      } else {
        throw new Error('Debe definir al menos un área personalizable');
      }
    } catch (parseError) {
      if (parseError.message.includes('personalización inválidas') || parseError.message.includes('área personalizable')) {
        throw parseError;
      }
      throw new Error('Formato de áreas de personalización inválido');
    }

    // 4. PROCESAR OPCIONES DEL PRODUCTO
    let productOptions = [];
    try {
      if (req.body.options) {
        productOptions = JSON.parse(req.body.options);
        if (!Array.isArray(productOptions)) {
          throw new Error('Las opciones deben ser un array');
        }
      }
    } catch (parseError) {
      console.warn('⚠️ Error parseando opciones, usando array vacío:', parseError.message);
      productOptions = [];
    }

    // 5. PROCESAR TAGS DE BÚSQUEDA
    let processedSearchTags = [];
    try {
      if (req.body.searchTags) {
        const tags = JSON.parse(req.body.searchTags);
        if (Array.isArray(tags)) {
          processedSearchTags = tags
            .filter(tag => tag && typeof tag === 'string' && tag.trim().length > 0)
            .map(tag => tag.trim().toLowerCase())
            .slice(0, 10);
        }
      }
    } catch (parseError) {
      console.warn('⚠️ Error parseando tags, usando array vacío:', parseError.message);
      processedSearchTags = [];
    }

    // 6. SUBIR IMAGEN PRINCIPAL DEL PRODUCTO
    console.log('📤 Subiendo imagen principal del producto...');
    let mainImageUrl = '';
    try {
      const mainImageFile = req.files.mainImage[0];
      tempFiles.push(mainImageFile.path);
      
      const result = await cloudinary.uploader.upload(mainImageFile.path, {
        folder: "products/main",
        resource_type: "auto",
        transformation: [
          { width: 800, height: 800, crop: "limit" },
          { quality: "auto:good" }
        ]
      });
      
      mainImageUrl = result.secure_url;
      cloudinaryFiles.push(result.public_id);
      
      console.log('✅ Imagen principal del producto subida:', mainImageUrl);
    } catch (uploadError) {
      console.error('❌ Error subiendo imagen principal del producto:', uploadError);
      throw new Error('Error al procesar la imagen principal del producto');
    }

    // 7. SUBIR IMÁGENES ADICIONALES DEL PRODUCTO
    let additionalImageUrls = [];
    if (req.files.additionalImages && req.files.additionalImages.length > 0) {
      console.log('📤 Subiendo imágenes adicionales del producto...');
      try {
        for (const file of req.files.additionalImages) {
          tempFiles.push(file.path);
          
          const result = await cloudinary.uploader.upload(file.path, {
            folder: "products/additional",
            resource_type: "auto",
            transformation: [
              { width: 600, height: 600, crop: "limit" },
              { quality: "auto:good" }
            ]
          });
          
          additionalImageUrls.push(result.secure_url);
          cloudinaryFiles.push(result.public_id);
        }
        console.log(`✅ ${additionalImageUrls.length} imágenes adicionales del producto subidas`);
      } catch (uploadError) {
        console.error('❌ Error subiendo imágenes adicionales del producto:', uploadError);
        throw new Error('Error al procesar las imágenes adicionales del producto');
      }
    }

    // 8. CREAR PRODUCTO
    console.log('💾 Guardando producto en base de datos...');
    
    const newProduct = new Product({
      name: name.trim(),
      description: description?.trim() || '',
      category: category._id,
      basePrice: parseFloat(basePrice),
      productionTime: parseInt(productionTime) || 3,
      isActive: isActive !== "false",
      customizationAreas,
      options: productOptions,
      images: {
        main: mainImageUrl,
        additional: additionalImageUrls
      },
      metadata: {
        featured: featured === "true" || featured === true,
        searchTags: processedSearchTags,
        stats: { views: 0, designs: 0, orders: 0 }
      }
    });

    await newProduct.save();
    
    // 9. LIMPIAR ARCHIVOS TEMPORALES
    cleanupTempFiles(tempFiles);

    // 10. GENERAR CONFIGURACIÓN KONVA
    const konvaConfig = generateKonvaConfig(newProduct);

    console.log(`✅ Producto creado exitosamente: ${newProduct._id}`);

    res.status(201).json({
      success: true,
      message: "Producto creado exitosamente",
      data: {
        product: {
          ...newProduct.toObject(),
          formattedPrice: `$${newProduct.basePrice.toFixed(2)}`
        },
        konvaConfig
      }
    });

  } catch (error) {
    console.error("❌ Error en createProduct:", error);
    
    // CLEANUP EN CASO DE ERROR
    if (tempFiles.length > 0) {
      console.log('🧹 Limpiando archivos temporales...');
      cleanupTempFiles(tempFiles);
    }
    
    if (cloudinaryFiles.length > 0) {
      console.log('🧹 Eliminando archivos de Cloudinary...');
      cloudinaryFiles.forEach(async (publicId) => {
        try {
          if (publicId) {
            await cloudinary.uploader.destroy(publicId);
            console.log(`✅ Eliminado de Cloudinary: ${publicId}`);
          }
        } catch (cleanupError) {
          console.error(`⚠️ Error eliminando ${publicId}:`, cleanupError.message);
        }
      });
    }

    // Determinar tipo de error
    let statusCode = 500;
    let errorMessage = "Error interno al crear el producto";
    
    if (error.name === 'ValidationError') {
      statusCode = 400;
      errorMessage = "Error de validación del producto";
    } else if (error.message && typeof error.message === 'string') {
      statusCode = 400;
      errorMessage = error.message;
    }

    res.status(statusCode).json({ 
      success: false,
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? {
        message: error.message,
        stack: error.stack
      } : "Error interno"
    });
  }
};

/**
 * Actualiza un producto existente - CORREGIDO
 */
productController.updateProduct = async (req, res) => {
  let tempFiles = [];
  let cloudinaryFiles = [];
  
  try {
    const { id } = req.params;
    const { 
      name, 
      description, 
      categoryId,
      basePrice,
      productionTime,
      isActive,
      featured,
      searchTags
    } = req.body;

    console.log(`🔄 Actualizando producto: ${id}`);

    const idValidation = validators.mongoId(id, 'ID de producto');
    if (!idValidation.isValid) {
      return res.status(400).json({ 
        success: false,
        message: idValidation.error,
        error: 'INVALID_PRODUCT_ID'
      });
    }

    const product = await Product.findById(idValidation.cleaned);
    if (!product) {
      return res.status(404).json({ 
        success: false,
        message: "Producto no encontrado",
        error: 'PRODUCT_NOT_FOUND'
      });
    }

    // Actualizar campos básicos
    if (name !== undefined && name.trim()) product.name = name.trim();
    if (description !== undefined) product.description = description?.trim() || '';
    if (basePrice !== undefined) product.basePrice = parseFloat(basePrice);
    if (productionTime !== undefined) product.productionTime = parseInt(productionTime);
    if (isActive !== undefined) product.isActive = isActive !== "false";

    // Actualizar categoría si se proporciona
    if (categoryId && categoryId !== product.category.toString()) {
      const categoryValidation = validators.mongoId(categoryId, 'Categoría');
      if (!categoryValidation.isValid) {
        return res.status(400).json({ 
          success: false,
          message: 'ID de categoría inválido',
          error: 'INVALID_CATEGORY_ID'
        });
      }

      const category = await Category.findOne({ 
        _id: categoryValidation.cleaned, 
        isActive: true 
      });
      
      if (!category) {
        return res.status(400).json({ 
          success: false,
          message: "La categoría especificada no existe o no está activa",
          error: 'CATEGORY_NOT_FOUND'
        });
      }
      product.category = category._id;
    }

    // Actualizar metadata
    if (featured !== undefined) product.metadata.featured = featured === "true" || featured === true;
    
    if (searchTags) {
      try {
        const tags = JSON.parse(searchTags);
        if (Array.isArray(tags)) {
          product.metadata.searchTags = tags
            .filter(tag => tag && tag.trim().length > 0)
            .map(tag => tag.trim().toLowerCase())
            .slice(0, 10);
        }
      } catch (parseError) {
        console.warn('⚠️ Error parseando tags en actualización');
      }
    }

    // Actualizar áreas si se proporcionan
    if (req.body.customizationAreas) {
      try {
        const customizationAreas = JSON.parse(req.body.customizationAreas);
        const areaValidation = validateCustomizationAreas(customizationAreas);
        
        if (!areaValidation.isValid) {
          return res.status(400).json({ 
            success: false,
            message: "Las áreas de personalización no son válidas",
            errors: areaValidation.errors,
            error: 'INVALID_CUSTOMIZATION_AREAS'
          });
        }
        
        product.customizationAreas = customizationAreas;
      } catch (parseError) {
        return res.status(400).json({ 
          success: false,
          message: "Formato de áreas de personalización inválido",
          error: 'INVALID_AREAS_FORMAT'
        });
      }
    }

    // Actualizar opciones si se proporcionan
    if (req.body.options) {
      try {
        const productOptions = JSON.parse(req.body.options);
        if (Array.isArray(productOptions)) {
          product.options = productOptions;
        }
      } catch (parseError) {
        console.warn('⚠️ Error parseando opciones en actualización');
      }
    }

    // Procesar nuevas imágenes DEL PRODUCTO si se proporcionan
    if (req.files) {
      // Nueva imagen principal DEL PRODUCTO
      if (req.files.mainImage) {
        try {
          const mainImageFile = req.files.mainImage[0];
          tempFiles.push(mainImageFile.path);
          
          // Eliminar imagen anterior del producto
          const oldMainImageId = extractCloudinaryId(product.images.main);
          if (oldMainImageId) {
            await cloudinary.uploader.destroy(oldMainImageId);
          }
          
          // Subir nueva imagen del producto
          const result = await cloudinary.uploader.upload(mainImageFile.path, {
            folder: "products/main",
            resource_type: "auto",
            transformation: [
              { width: 800, height: 800, crop: "limit" },
              { quality: "auto:good" }
            ]
          });

          product.images.main = result.secure_url;
          cloudinaryFiles.push(result.public_id);
        } catch (uploadError) {
          return res.status(500).json({ 
            success: false,
            message: "Error al actualizar la imagen principal del producto",
            error: 'IMAGE_UPLOAD_ERROR'
          });
        }
      }
      
      // Nuevas imágenes adicionales DEL PRODUCTO
      if (req.files.additionalImages) {
        try {
          // Eliminar imágenes anteriores del producto
          for (const imageUrl of product.images.additional) {
            const imageId = extractCloudinaryId(imageUrl);
            if (imageId) {
              await cloudinary.uploader.destroy(imageId);
            }
          }
          
          // Subir nuevas imágenes del producto
          const newAdditionalImages = [];
          for (const file of req.files.additionalImages) {
            tempFiles.push(file.path);
            
            const result = await cloudinary.uploader.upload(file.path, {
              folder: "products/additional",
              resource_type: "auto",
              transformation: [
                { width: 600, height: 600, crop: "limit" },
                { quality: "auto:good" }
              ]
            });
            
            newAdditionalImages.push(result.secure_url);
            cloudinaryFiles.push(result.public_id);
          }
          
          product.images.additional = newAdditionalImages;
        } catch (uploadError) {
          return res.status(500).json({ 
            success: false,
            message: "Error al actualizar las imágenes adicionales del producto",
            error: 'IMAGE_UPLOAD_ERROR'
          });
        }
      }
    }

    await product.save();
    
    // Limpiar archivos temporales
    cleanupTempFiles(tempFiles);

    console.log(`✅ Producto actualizado: ${product._id}`);

    res.status(200).json({
      success: true,
      message: "Producto actualizado exitosamente",
      data: {
        product: {
          ...product.toObject(),
          formattedPrice: `$${product.basePrice.toFixed(2)}`
        },
        konvaConfig: generateKonvaConfig(product)
      }
    });

  } catch (error) {
    console.error("❌ Error en updateProduct:", error);
    
    // Cleanup en caso de error
    cleanupTempFiles(tempFiles);
    
    // Cleanup de Cloudinary
    cloudinaryFiles.forEach(async (publicId) => {
      try {
        if (publicId) await cloudinary.uploader.destroy(publicId);
      } catch (cleanupError) {
        console.error(`⚠️ Error limpiando ${publicId}:`, cleanupError.message);
      }
    });
    
    res.status(500).json({ 
      success: false,
      message: "Error interno al actualizar el producto",
      error: process.env.NODE_ENV === 'development' ? error.message : "Error interno"
    });
  }
};

/**
 * Elimina un producto con validación de diseños existentes
 */
productController.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log(`🗑️ Eliminando producto: ${id}`);

    const idValidation = validators.mongoId(id, 'ID de producto');
    if (!idValidation.isValid) {
      return res.status(400).json({ 
        success: false,
        message: idValidation.error,
        error: 'INVALID_PRODUCT_ID'
      });
    }

    const product = await Product.findById(idValidation.cleaned);
    if (!product) {
      return res.status(404).json({ 
        success: false,
        message: "Producto no encontrado",
        error: 'PRODUCT_NOT_FOUND'
      });
    }

    // Verificar si hay diseños asociados
    const designCount = await Design.countDocuments({ product: idValidation.cleaned });
    if (designCount > 0) {
      // Desactivar en lugar de eliminar
      product.isActive = false;
      await product.save();
      
      return res.status(200).json({
        success: true,
        message: "Producto desactivado porque tiene diseños asociados",
        data: {
          product: product.toObject(),
          designCount,
          action: 'deactivated'
        }
      });
    }

    // Eliminar imágenes DEL PRODUCTO de Cloudinary
    try {
      const mainImageId = extractCloudinaryId(product.images.main);
      if (mainImageId) {
        await cloudinary.uploader.destroy(mainImageId);
        console.log(`🗑️ Imagen principal del producto eliminada: ${mainImageId}`);
      }
      
      for (const imageUrl of product.images.additional) {
        const imageId = extractCloudinaryId(imageUrl);
        if (imageId) {
          await cloudinary.uploader.destroy(imageId);
          console.log(`🗑️ Imagen adicional del producto eliminada: ${imageId}`);
        }
      }
    } catch (cloudinaryError) {
      console.error("⚠️ Error eliminando imágenes del producto de Cloudinary:", cloudinaryError);
    }

    // Eliminar producto
    await Product.findByIdAndDelete(idValidation.cleaned);

    console.log(`✅ Producto eliminado completamente: ${id}`);

    res.status(200).json({
      success: true,
      message: "Producto eliminado exitosamente",
      data: {
        deletedProduct: {
          _id: id,
          name: product.name
        },
        action: 'deleted'
      }
    });

  } catch (error) {
    console.error("❌ Error en deleteProduct:", error);
    res.status(500).json({ 
      success: false,
      message: "Error al eliminar el producto",
      error: process.env.NODE_ENV === 'development' ? error.message : "Error interno"
    });
  }
};

/**
 * Obtiene la configuración Konva para un producto
 */
productController.getKonvaConfig = async (req, res) => {
  try {
    const { id } = req.params;
    
    const idValidation = validators.mongoId(id, 'ID de producto');
    if (!idValidation.isValid) {
      return res.status(400).json({ 
        success: false,
        message: idValidation.error,
        error: 'INVALID_PRODUCT_ID'
      });
    }

    const product = await Product.findById(idValidation.cleaned);
    if (!product) {
      return res.status(404).json({ 
        success: false,
        message: "Producto no encontrado",
        error: 'PRODUCT_NOT_FOUND'
      });
    }

    const mode = req.query.mode || 'simple';
    const validModes = ['simple', 'advanced', 'editor'];
    if (!validModes.includes(mode)) {
      return res.status(400).json({
        success: false,
        message: `Modo inválido. Modos válidos: ${validModes.join(', ')}`,
        error: 'INVALID_MODE'
      });
    }

    const includeGuides = req.query.guides === 'true';
    const includeGrid = req.query.grid === 'true';

    const konvaConfig = generateKonvaConfig(product, {
      includeProductOptions: true,
      editorMode: mode,
      includeGuides,
      includeGrid
    });

    res.status(200).json({
      success: true,
      message: "Configuración Konva generada",
      data: {
        config: konvaConfig,
        productInfo: {
          _id: product._id,
          name: product.name,
          basePrice: product.basePrice,
          customizationAreas: product.customizationAreas.length
        }
      }
    });
  } catch (error) {
    console.error("❌ Error en getKonvaConfig:", error);
    res.status(500).json({ 
      success: false,
      message: "Error al obtener la configuración del editor",
      error: process.env.NODE_ENV === 'development' ? error.message : "Error interno"
    });
  }
};

/**
 * Buscar productos por texto
 */
productController.searchProducts = async (req, res) => {
  try {
    const { q: query, limit = 10 } = req.query;

    const queryValidation = validators.text(query, 2, 100);
    if (!queryValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: `Consulta de búsqueda inválida: ${queryValidation.error}`,
        error: 'INVALID_SEARCH_QUERY'
      });
    }

    const limitValidation = validators.quantity(limit, 1, 50);
    if (!limitValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: `Límite inválido: ${limitValidation.error}`,
        error: 'INVALID_LIMIT'
      });
    }

    const searchRegex = new RegExp(queryValidation.cleaned, 'i');
    
    const products = await Product.find({
      $and: [
        { isActive: true },
        {
          $or: [
            { name: searchRegex },
            { description: searchRegex },
            { 'metadata.searchTags': searchRegex }
          ]
        }
      ]
    })
    .populate('category', 'name')
    .limit(limitValidation.cleaned)
    .lean();

    const formattedProducts = products.map(product => {
      const priceValidation = validators.price(product.basePrice, 0);
      const validPrice = priceValidation.isValid ? priceValidation.cleaned : 0;

      return {
        _id: product._id,
        name: product.name,
        description: product.description,
        basePrice: validPrice,
        formattedPrice: `$${validPrice.toFixed(2)}`,
        category: product.category,
        images: product.images,
        _links: {
          self: `/api/products/${product._id}`,
          konvaConfig: `/api/products/${product._id}/konva-config`
        }
      };
    });

    res.status(200).json({
      success: true,
      message: `${formattedProducts.length} productos encontrados`,
      data: {
        products: formattedProducts,
        query: queryValidation.cleaned,
        total: formattedProducts.length
      }
    });

  } catch (error) {
    console.error("❌ Error en searchProducts:", error);
    res.status(500).json({
      success: false,
      message: "Error en la búsqueda de productos",
      error: process.env.NODE_ENV === 'development' ? error.message : "Error interno"
    });
  }
};

/**
 * Obtener productos relacionados
 */
productController.getRelatedProducts = async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 4 } = req.query;

    const idValidation = validators.mongoId(id, 'ID de producto');
    if (!idValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: idValidation.error,
        error: 'INVALID_PRODUCT_ID'
      });
    }

    const limitValidation = validators.quantity(limit, 1, 20);
    if (!limitValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: `Límite inválido: ${limitValidation.error}`,
        error: 'INVALID_LIMIT'
      });
    }

    const product = await Product.findById(idValidation.cleaned);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Producto no encontrado",
        error: 'PRODUCT_NOT_FOUND'
      });
    }

    // Buscar productos relacionados por categoría
    const relatedProducts = await Product.find({
      _id: { $ne: idValidation.cleaned },
      category: product.category,
      isActive: true
    })
    .populate('category', 'name')
    .limit(limitValidation.cleaned)
    .lean();

    // Si no hay suficientes, agregar productos aleatorios
    if (relatedProducts.length < limitValidation.cleaned) {
      const additionalProducts = await Product.find({
        _id: { 
          $ne: idValidation.cleaned, 
          $nin: relatedProducts.map(p => p._id) 
        },
        isActive: true
      })
      .populate('category', 'name')
      .limit(limitValidation.cleaned - relatedProducts.length)
      .lean();

      relatedProducts.push(...additionalProducts);
    }

    const formattedProducts = relatedProducts.map(product => {
      const priceValidation = validators.price(product.basePrice, 0);
      const validPrice = priceValidation.isValid ? priceValidation.cleaned : 0;

      return {
        _id: product._id,
        name: product.name,
        description: product.description,
        basePrice: validPrice,
        formattedPrice: `$${validPrice.toFixed(2)}`,
        category: product.category,
        images: product.images,
        daysAgo: calculateDaysAgo(product.createdAt)
      };
    });

    res.status(200).json({
      success: true,
      message: `${formattedProducts.length} productos relacionados encontrados`,
      data: {
        products: formattedProducts,
        sourceProduct: {
          _id: product._id,
          name: product.name,
          category: product.category
        }
      }
    });

  } catch (error) {
    console.error("❌ Error en getRelatedProducts:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener productos relacionados",
      error: process.env.NODE_ENV === 'development' ? error.message : "Error interno"
    });
  }
};

/**
 * Actualizar estadísticas de un producto
 */
productController.updateProductStats = async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body;

    const idValidation = validators.mongoId(id, 'ID de producto');
    if (!idValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: idValidation.error,
        error: 'INVALID_PRODUCT_ID'
      });
    }

    const validActions = ['view', 'design', 'order'];
    if (!validActions.includes(action)) {
      return res.status(400).json({
        success: false,
        message: `Acción inválida. Acciones válidas: ${validActions.join(', ')}`,
        error: 'INVALID_ACTION'
      });
    }

    const updateField = `metadata.stats.${action}s`;
    
    const product = await Product.findByIdAndUpdate(
      idValidation.cleaned,
      { $inc: { [updateField]: 1 } },
      { new: true, lean: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Producto no encontrado",
        error: 'PRODUCT_NOT_FOUND'
      });
    }

    res.status(200).json({
      success: true,
      message: `Estadística '${action}' actualizada`,
      data: {
        productId: id,
        action,
        newCount: product.metadata?.stats?.[`${action}s`] || 0,
        allStats: product.metadata?.stats || {}
      }
    });

  } catch (error) {
    console.error("❌ Error en updateProductStats:", error);
    res.status(500).json({
      success: false,
      message: "Error al actualizar estadísticas",
      error: process.env.NODE_ENV === 'development' ? error.message : "Error interno"
    });
  }
};

/**
 * Crea datos de ejemplo para testing - CORREGIDO
 */
productController.createSampleProducts = async (req, res) => {
  try {
    const existingCount = await Product.countDocuments();
    if (existingCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Ya existen ${existingCount} productos en la base de datos`,
        error: 'PRODUCTS_ALREADY_EXIST'
      });
    }

    // BUSCAR CATEGORÍA EXISTENTE ACTIVA (NO CREAR NUEVA)
    let defaultCategory = await Category.findOne({ 
      isActive: true 
    }).sort({ createdAt: -1 });

    // Si NO existe ninguna categoría activa, crear una básica SIN imagen
    if (!defaultCategory) {
      console.log('📂 No se encontraron categorías activas. Creando categoría básica...');
      defaultCategory = new Category({
        name: 'General',
        slug: 'general',
        description: 'Categoría general para productos de sublimación',
        isActive: true,
        // NO incluir imagen aquí - las categorías pueden no tener imagen
        metadata: {
          featured: false,
          searchTags: ['general', 'productos'],
          stats: { products: 0, designs: 0 }
        }
      });
      await defaultCategory.save();
      console.log(`✅ Categoría básica creada: ${defaultCategory._id}`);
    } else {
      console.log(`✅ Usando categoría existente: ${defaultCategory.name} (${defaultCategory._id})`);
    }

    // Productos de ejemplo con SOLO DATOS - sin imágenes reales
    const sampleProductsData = [
      {
        name: 'Camiseta Personalizable',
        description: 'Camiseta de algodón 100% ideal para personalización con sublimación. Perfecta para diseños creativos.',
        basePrice: 24.99,
        productionTime: 3,
        searchTags: ['camiseta', 'algodón', 'personalizable', 'sublimación', 'ropa']
      },
      {
        name: 'Taza Sublimable',
        description: 'Taza de cerámica blanca perfecta para sublimación. Ideal para regalos personalizados.',
        basePrice: 19.99,
        productionTime: 2,
        searchTags: ['taza', 'cerámica', 'sublimación', 'bebidas', 'regalo']
      },
      {
        name: 'Funda para Teléfono',
        description: 'Funda personalizable para diversos modelos de teléfono. Protección y estilo en uno.',
        basePrice: 22.99,
        productionTime: 2,
        searchTags: ['funda', 'teléfono', 'protección', 'personalizable', 'accesorios']
      },
      {
        name: 'Llavero Personalizado',
        description: 'Llavero de acrílico perfecto para sublimación. Pequeño regalo con gran impacto.',
        basePrice: 8.99,
        productionTime: 1,
        searchTags: ['llavero', 'acrílico', 'regalo', 'personalizable', 'pequeño']
      }
    ];

    const validatedProducts = sampleProductsData.map((productData, index) => ({
      name: productData.name,
      description: productData.description,
      category: defaultCategory._id,
      basePrice: productData.basePrice,
      productionTime: productData.productionTime,
      isActive: true,
      // Usar imágenes placeholder o vacías para los productos de ejemplo
      images: {
        main: 'https://via.placeholder.com/800x600/e0e0e0/666666?text=Producto+' + (index + 1),
        additional: []
      },
      customizationAreas: [
        {
          name: 'area_principal',
          displayName: 'Área Principal',
          position: { 
            x: 50, 
            y: 80, 
            width: 200, 
            height: 250, 
            rotationDegree: 0 
          },
          accepts: { text: true, image: true },
          maxElements: 5,
          konvaConfig: {
            strokeColor: '#1F64BF',
            strokeWidth: 2,
            fillOpacity: 0.1,
            cornerRadius: 0,
            dash: [5, 5]
          }
        }
      ],
      options: [
        {
          name: 'size',
          label: 'Talla',
          type: 'size',
          required: false,
          values: [
            { label: 'S', value: 's', additionalPrice: 0, inStock: true },
            { label: 'M', value: 'm', additionalPrice: 0, inStock: true },
            { label: 'L', value: 'l', additionalPrice: 2, inStock: true },
            { label: 'XL', value: 'xl', additionalPrice: 4, inStock: true }
          ]
        }
      ],
      metadata: {
        featured: Math.random() > 0.5,
        searchTags: productData.searchTags,
        stats: { views: 0, designs: 0, orders: 0 }
      }
    }));

    const createdProducts = await Product.insertMany(validatedProducts);

    console.log(`✅ ${createdProducts.length} productos de ejemplo creados exitosamente`);

    res.status(201).json({
      success: true,
      message: `${createdProducts.length} productos de ejemplo creados exitosamente`,
      data: {
        products: createdProducts.map(product => ({
          ...product.toObject(),
          formattedPrice: `$${product.basePrice.toFixed(2)}`
        })),
        category: {
          _id: defaultCategory._id,
          name: defaultCategory.name,
          slug: defaultCategory.slug
        },
        note: 'Productos creados con imágenes placeholder. Edita cada producto para agregar imágenes reales.'
      }
    });

  } catch (error) {
    console.error("❌ Error creando productos de ejemplo:", error);
    res.status(500).json({
      success: false,
      message: "Error al crear productos de ejemplo",
      error: process.env.NODE_ENV === 'development' ? error.message : "Error interno"
    });
  }
};

// ==================== FUNCIONES AUXILIARES ====================

/**
 * Validar número con valor por defecto
 */
function validateNumber(value, defaultValue = 0) {
  const priceValidation = validators.price(value, 0);
  return priceValidation.isValid ? priceValidation.cleaned : defaultValue;
}

/**
 * Calcular días transcurridos desde una fecha
 */
function calculateDaysAgo(date) {
  if (!date) return 0;
  try {
    const now = new Date();
    const createdDate = new Date(date);
    const diffTime = Math.abs(now - createdDate);
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  } catch (error) {
    console.error('⚠️ Error calculando días:', error);
    return 0;
  }
}

/**
 * Limpiar archivos temporales
 */
function cleanupTempFiles(filePaths) {
  if (!Array.isArray(filePaths)) return;
  
  filePaths.forEach(filePath => {
    try {
      if (filePath && fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`🧹 Archivo temporal eliminado: ${filePath}`);
      }
    } catch (cleanError) {
      console.error(`⚠️ Error limpiando archivo temporal ${filePath}:`, cleanError.message);
    }
  });
}

/**
 * Extraer ID público de Cloudinary desde URL
 */
function extractCloudinaryId(url) {
  if (!url || typeof url !== 'string') return null;
  
  try {
    const parts = url.split('/');
    const uploadIndex = parts.findIndex(part => part === 'upload');
    
    if (uploadIndex === -1) return null;
    
    let pathParts = parts.slice(uploadIndex + 1);
    
    // Remover versión si existe (ej: v1234567890)
    if (pathParts[0] && pathParts[0].startsWith('v') && /^v\d+$/.test(pathParts[0])) {
      pathParts = pathParts.slice(1);
    }
    
    const fullPath = pathParts.join('/');
    const publicId = fullPath.replace(/\.[^/.]+$/, '');
    
    return publicId || null;
  } catch (error) {
    console.error('⚠️ Error extrayendo public_id:', error);
    return null;
  }
}

export default productController;