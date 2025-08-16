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
 * Obtiene todos los productos con filtrado avanzado y manejo robusto de datos
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

    // Validar parámetros de paginación usando validadores centralizados
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

    // Construir filtro con validación
    const filter = {};
    
    // Filtro por categoría con validación de ObjectId
    if (category && category.trim() !== '') {
      const categoryValidation = validators.mongoId(category, 'Categoría');
      if (categoryValidation.isValid) {
        filter.category = new mongoose.Types.ObjectId(categoryValidation.cleaned);
      } else {
        console.log('⚠️ ID de categoría inválido:', category);
      }
    }
    
    // Filtro por estado activo
    if (isActive !== undefined && isActive !== '') {
      filter.isActive = isActive === 'true';
    }
    
    // Filtro por destacados
    if (featured !== undefined && featured !== '') {
      filter['metadata.featured'] = featured === 'true';
    }
    
    // Filtro por búsqueda de texto con validación
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

    // Configurar ordenamiento con validación
    let sortOption = {};
    const validSortOptions = ['newest', 'oldest', 'price_asc', 'price_desc', 'name_asc', 'name_desc'];
    
    if (!validSortOptions.includes(sort)) {
      console.log('⚠️ Opción de ordenamiento inválida:', sort);
      sortOption = { createdAt: -1 }; // Default
    } else {
      switch (sort) {
        case 'newest':
          sortOption = { createdAt: -1 };
          break;
        case 'oldest':
          sortOption = { createdAt: 1 };
          break;
        case 'price_asc':
          sortOption = { basePrice: 1 };
          break;
        case 'price_desc':
          sortOption = { basePrice: -1 };
          break;
        case 'name_asc':
          sortOption = { name: 1 };
          break;
        case 'name_desc':
          sortOption = { name: -1 };
          break;
        default:
          sortOption = { createdAt: -1 };
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
    console.log('📄 Opciones de paginación:', JSON.stringify(options, null, 2));

    // Ejecutar consulta paginada
    const result = await Product.paginate(filter, options);

    console.log(`📊 Resultados de consulta: ${result.products?.length || 0} productos encontrados`);

    // Manejar caso sin productos
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

    // Transformar y validar datos de productos
    const products = result.products
      .filter(product => product && typeof product === 'object')
      .map(product => {
        try {
          // Validar precio usando validador centralizado
          const priceValidation = validators.price(product.basePrice, 0);
          const productionTimeValidation = validators.quantity(product.productionTime, 1, 30);

          // Validar y establecer valores por defecto seguros
          const safeProduct = {
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
            updatedAt: product.updatedAt || new Date()
          };

          // Agregar campos calculados de forma segura
          return {
            ...safeProduct,
            _links: {
              self: `/api/products/${safeProduct._id}`,
              designs: `/api/products/${safeProduct._id}/designs`,
              konvaConfig: `/api/products/${safeProduct._id}/konva-config`,
              category: safeProduct.category?._id ? `/api/categories/${safeProduct.category._id}` : null
            },
            formattedPrice: `$${safeProduct.basePrice.toFixed(2)}`,
            daysAgo: calculateDaysAgo(safeProduct.createdAt),
            statusText: safeProduct.isActive ? 'Activo' : 'Inactivo'
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
    } else if (error.name === 'MongoServerError') {
      statusCode = 503;
      errorMessage = "Error de conexión con la base de datos";
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

    // Validar ID usando validador centralizado
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

    // Validar y limpiar datos del producto usando validadores centralizados
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

    // Generar configuración para Konva
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
    console.error("Error en getProductById:", error);
    res.status(500).json({ 
      success: false,
      message: "Error al obtener el producto",
      error: process.env.NODE_ENV === 'development' ? error.message : "Error interno"
    });
  }
};

/**
 * Crea un nuevo producto base para sublimación
 */
productController.createProduct = async (req, res) => {
  let uploadedFiles = [];
  
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

    console.log('🆕 Creando producto:', { name, categoryId, basePrice });

    // Validación básica usando validadores centralizados
    const basicValidation = validateFields({
      name,
      description,
      categoryId,
      basePrice,
      productionTime
    }, {
      name: (value) => validators.text(value, 1, 100),
      description: (value) => validators.text(value, 0, 500),
      categoryId: (value) => validators.mongoId(value, 'ID de categoría'),
      basePrice: (value) => validators.price(value, 0.01),
      productionTime: (value) => validators.quantity(value, 1, 30)
    });

    if (!basicValidation.isValid) {
      return res.status(400).json({ 
        success: false,
        message: `Datos básicos inválidos: ${basicValidation.errors.join('; ')}`,
        error: 'VALIDATION_ERROR'
      });
    }

    const { 
      name: cleanName, 
      description: cleanDescription, 
      categoryId: validCategoryId, 
      basePrice: validPrice, 
      productionTime: validProductionTime 
    } = basicValidation.cleaned;

    // Validar que existe imagen principal
    if (!req.files?.mainImage) {
      return res.status(400).json({ 
        success: false,
        message: "La imagen principal es obligatoria",
        error: 'MAIN_IMAGE_REQUIRED'
      });
    }

    // Validar archivo de imagen principal
    const mainImageValidation = validators.imageFile(req.files.mainImage[0]);
    if (!mainImageValidation.isValid) {
      return res.status(400).json({ 
        success: false,
        message: `Imagen principal inválida: ${mainImageValidation.error}`,
        error: 'INVALID_MAIN_IMAGE'
      });
    }

    // Verificar categoría
    const category = await Category.findById(validCategoryId);
    if (!category) {
      return res.status(400).json({ 
        success: false,
        message: "La categoría especificada no existe",
        error: 'CATEGORY_NOT_FOUND'
      });
    }

    // Validar áreas de personalización
    let customizationAreas = [];
    try {
      if (req.body.customizationAreas) {
        customizationAreas = JSON.parse(req.body.customizationAreas);
        
        const areaValidation = validateCustomizationAreas(customizationAreas);
        if (!areaValidation.isValid) {
          return res.status(400).json({ 
            success: false,
            message: "Las áreas de personalización no son válidas",
            errors: areaValidation.errors,
            error: 'INVALID_CUSTOMIZATION_AREAS'
          });
        }
      } else {
        return res.status(400).json({
          success: false,
          message: "Debe definir al menos un área personalizable",
          error: 'CUSTOMIZATION_AREAS_REQUIRED'
        });
      }
    } catch (parseError) {
      return res.status(400).json({ 
        success: false,
        message: "Formato de áreas de personalización inválido",
        error: 'INVALID_AREAS_FORMAT'
      });
    }

    // Validar opciones del producto
    let productOptions = [];
    try {
      if (req.body.options) {
        productOptions = JSON.parse(req.body.options);
        
        for (const option of productOptions) {
          // Validar estructura de opción
          const optionValidation = validateFields(option, {
            name: (value) => validators.text(value, 1, 50),
            type: (value) => validators.text(value, 1, 20)
          });

          if (!optionValidation.isValid) {
            return res.status(400).json({
              success: false,
              message: `Opción inválida: ${optionValidation.errors.join('; ')}`,
              error: 'INVALID_PRODUCT_OPTION'
            });
          }

          if (!Array.isArray(option.values) || option.values.length === 0) {
            return res.status(400).json({
              success: false,
              message: `La opción "${option.name}" debe tener al menos un valor`,
              error: 'OPTION_VALUES_REQUIRED'
            });
          }

          // Validar cada valor de la opción
          for (const value of option.values) {
            const valueValidation = validateFields(value, {
              name: (val) => validators.text(val, 1, 50),
              value: (val) => validators.text(val, 1, 50),
              additionalCost: (val) => validators.price(val, 0)
            });

            if (!valueValidation.isValid) {
              return res.status(400).json({
                success: false,
                message: `Valor de opción inválido en "${option.name}": ${valueValidation.errors.join('; ')}`,
                error: 'INVALID_OPTION_VALUE'
              });
            }
          }
        }
      }
    } catch (parseError) {
      return res.status(400).json({ 
        success: false,
        message: "Formato de opciones del producto inválido",
        error: 'INVALID_OPTIONS_FORMAT'
      });
    }

    // Validar imágenes adicionales si existen
    if (req.files.additionalImages) {
      for (const file of req.files.additionalImages) {
        const imageValidation = validators.imageFile(file);
        if (!imageValidation.isValid) {
          return res.status(400).json({
            success: false,
            message: `Imagen adicional inválida: ${imageValidation.error}`,
            error: 'INVALID_ADDITIONAL_IMAGE'
          });
        }
      }
    }

    // Subir imágenes con manejo de errores
    const imageUrls = {
      main: '',
      additional: []
    };
    
    try {
      // Subir imagen principal
      const mainImageUrl = await cloudinary.uploadImage(
        req.files.mainImage[0].path, 
        "products/main",
        {
          width: 800,
          height: 800,
          crop: "limit",
          quality: "auto:good"
        }
      );
      
      imageUrls.main = mainImageUrl.secure_url;
      uploadedFiles.push({
        path: req.files.mainImage[0].path,
        public_id: mainImageUrl.public_id
      });
      
      // Subir imágenes adicionales si existen
      if (req.files.additionalImages) {
        for (const file of req.files.additionalImages) {
          const result = await cloudinary.uploader.upload(file.path, {
            folder: "products/additional",
            resource_type: "auto",
            transformation: [
              { width: 600, height: 600, crop: "limit" },
              { quality: "auto:good" }
            ]
          });
          
          imageUrls.additional.push(result.secure_url);
          uploadedFiles.push({
            path: file.path,
            public_id: result.public_id
          });
        }
      }
    } catch (uploadError) {
      // Eliminar archivos subidos a Cloudinary en caso de error
      await Promise.all(
        uploadedFiles.map(file => 
          cloudinary.uploader.destroy(file.public_id).catch(err => 
            console.error(`Error eliminando ${file.public_id}:`, err)
          )
        )
      );
      
      cleanTempFiles([...(req.files.mainImage || []), ...(req.files.additionalImages || [])]);
      
      return res.status(500).json({ 
        success: false,
        message: "Error al procesar las imágenes",
        error: 'IMAGE_UPLOAD_ERROR'
      });
    }

    // Procesar tags de búsqueda con validación
    let processedSearchTags = [];
    try {
      if (req.body.searchTags) {
        const tags = JSON.parse(req.body.searchTags);
        if (Array.isArray(tags)) {
          processedSearchTags = tags
            .map(tag => {
              const tagValidation = validators.text(tag, 1, 30);
              return tagValidation.isValid ? tagValidation.cleaned : null;
            })
            .filter(tag => tag !== null);
        }
      }
    } catch {
      processedSearchTags = [];
    }

    // Crear producto
    const newProduct = new Product({
      name: cleanName,
      description: cleanDescription,
      category: category._id,
      basePrice: validPrice,
      productionTime: validProductionTime,
      isActive: isActive !== "false",
      customizationAreas,
      options: productOptions,
      images: imageUrls,
      metadata: {
        featured: featured === "true" || featured === true,
        searchTags: processedSearchTags,
        stats: { views: 0, designs: 0, orders: 0 }
      }
    });

    await newProduct.save();
    
    // Limpiar archivos temporales después de subir a Cloudinary
    cleanTempFiles([...(req.files.mainImage || []), ...(req.files.additionalImages || [])]);

    // Generar configuración para Konva
    const konvaConfig = generateKonvaConfig(newProduct);

    console.log(`✅ Producto creado: ${newProduct._id}`);

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
    console.error("Error en createProduct:", error);
    
    // Limpiar archivos temporales en caso de error
    if (req.files) {
      cleanTempFiles([...(req.files.mainImage || []), ...(req.files.additionalImages || [])]);
    }
    
    res.status(500).json({ 
      success: false,
      message: "Error interno al crear el producto",
      error: process.env.NODE_ENV === 'development' ? error.message : "Error interno"
    });
  }
};

/**
 * Actualiza un producto existente
 */
productController.updateProduct = async (req, res) => {
  let uploadedFiles = [];
  
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

    // Validar ID del producto
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

    // Validar campos básicos si se proporcionan
    const fieldsToValidate = {};
    if (name !== undefined) fieldsToValidate.name = name;
    if (description !== undefined) fieldsToValidate.description = description;
    if (categoryId !== undefined) fieldsToValidate.categoryId = categoryId;
    if (basePrice !== undefined) fieldsToValidate.basePrice = basePrice;
    if (productionTime !== undefined) fieldsToValidate.productionTime = productionTime;

    if (Object.keys(fieldsToValidate).length > 0) {
      const basicValidation = validateFields(fieldsToValidate, {
        name: (value) => validators.text(value, 1, 100),
        description: (value) => validators.text(value, 0, 500),
        categoryId: (value) => validators.mongoId(value, 'ID de categoría'),
        basePrice: (value) => validators.price(value, 0.01),
        productionTime: (value) => validators.quantity(value, 1, 30)
      });

      if (!basicValidation.isValid) {
        return res.status(400).json({ 
          success: false,
          message: `Datos básicos inválidos: ${basicValidation.errors.join('; ')}`,
          error: 'VALIDATION_ERROR'
        });
      }

      // Actualizar campos validados
      const cleanedFields = basicValidation.cleaned;
      if (cleanedFields.name) product.name = cleanedFields.name;
      if (cleanedFields.description !== undefined) product.description = cleanedFields.description;
      if (cleanedFields.basePrice) product.basePrice = cleanedFields.basePrice;
      if (cleanedFields.productionTime) product.productionTime = cleanedFields.productionTime;

      // Actualizar categoría si se proporciona
      if (cleanedFields.categoryId && product.category.toString() !== cleanedFields.categoryId) {
        const category = await Category.findById(cleanedFields.categoryId);
        if (!category) {
          return res.status(400).json({ 
            success: false,
            message: "La categoría especificada no existe",
            error: 'CATEGORY_NOT_FOUND'
          });
        }
        product.category = category._id;
      }
    }

    // Actualizar estado activo
    if (isActive !== undefined) product.isActive = isActive !== "false";

    // Actualizar metadata con validación
    if (featured !== undefined) product.metadata.featured = featured === "true" || featured === true;
    
    if (searchTags) {
      try {
        const tags = JSON.parse(searchTags);
        if (Array.isArray(tags)) {
          const processedTags = tags
            .map(tag => {
              const tagValidation = validators.text(tag, 1, 30);
              return tagValidation.isValid ? tagValidation.cleaned : null;
            })
            .filter(tag => tag !== null);
          product.metadata.searchTags = processedTags;
        }
      } catch {
        // Mantener tags existentes si hay error de parsing
      }
    }

    // Actualizar áreas de personalización con validación
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

    // Actualizar opciones del producto con validación
    if (req.body.options) {
      try {
        const productOptions = JSON.parse(req.body.options);
        
        for (const option of productOptions) {
          const optionValidation = validateFields(option, {
            name: (value) => validators.text(value, 1, 50),
            type: (value) => validators.text(value, 1, 20)
          });

          if (!optionValidation.isValid) {
            return res.status(400).json({
              success: false,
              message: `Opción inválida: ${optionValidation.errors.join('; ')}`,
              error: 'INVALID_PRODUCT_OPTION'
            });
          }

          if (!Array.isArray(option.values) || option.values.length === 0) {
            return res.status(400).json({
              success: false,
              message: `La opción "${option.name}" debe tener al menos un valor`,
              error: 'OPTION_VALUES_REQUIRED'
            });
          }

          // Validar cada valor de la opción
          for (const value of option.values) {
            const valueValidation = validateFields(value, {
              name: (val) => validators.text(val, 1, 50),
              value: (val) => validators.text(val, 1, 50),
              additionalCost: (val) => validators.price(val, 0)
            });

            if (!valueValidation.isValid) {
              return res.status(400).json({
                success: false,
                message: `Valor de opción inválido en "${option.name}": ${valueValidation.errors.join('; ')}`,
                error: 'INVALID_OPTION_VALUE'
              });
            }
          }
        }
        
        product.options = productOptions;
      } catch (parseError) {
        return res.status(400).json({ 
          success: false,
          message: "Formato de opciones del producto inválido",
          error: 'INVALID_OPTIONS_FORMAT'
        });
      }
    }

    // Procesar imágenes si se proporcionan con validación
    if (req.files) {
      // Validar imagen principal si se proporciona
      if (req.files.mainImage) {
        const mainImageValidation = validators.imageFile(req.files.mainImage[0]);
        if (!mainImageValidation.isValid) {
          return res.status(400).json({
            success: false,
            message: `Imagen principal inválida: ${mainImageValidation.error}`,
            error: 'INVALID_MAIN_IMAGE'
          });
        }

        try {
          // Eliminar imagen anterior de Cloudinary
          const mainImageId = extractCloudinaryId(product.images.main);
          if (mainImageId) {
            await cloudinary.uploader.destroy(mainImageId);
          }
          
          // Subir nueva imagen
          const mainImageResult = await cloudinary.uploadImage(
            req.files.mainImage[0].path, 
            "products/main",
            {
              width: 800,
              height: 800,
              crop: "limit",
              quality: "auto:good"
            }
          );

          product.images.main = mainImageResult.secure_url;
          uploadedFiles.push({
            path: req.files.mainImage[0].path,
            public_id: mainImageResult.public_id
          });
        } catch (uploadError) {
          return res.status(500).json({ 
            success: false,
            message: "Error al actualizar la imagen principal",
            error: 'IMAGE_UPLOAD_ERROR'
          });
        }
      }
      
      // Validar y manejar imágenes adicionales
      if (req.files.additionalImages) {
        // Validar todas las imágenes adicionales primero
        for (const file of req.files.additionalImages) {
          const imageValidation = validators.imageFile(file);
          if (!imageValidation.isValid) {
            return res.status(400).json({
              success: false,
              message: `Imagen adicional inválida: ${imageValidation.error}`,
              error: 'INVALID_ADDITIONAL_IMAGE'
            });
          }
        }

        try {
          // Eliminar imágenes anteriores de Cloudinary
          for (const imageUrl of product.images.additional) {
            const imageId = extractCloudinaryId(imageUrl);
            if (imageId) {
              await cloudinary.uploader.destroy(imageId);
            }
          }
          
          // Subir nuevas imágenes
          const newAdditionalImages = [];
          for (const file of req.files.additionalImages) {
            const result = await cloudinary.uploader.upload(file.path, {
              folder: "products/additional",
              resource_type: "auto",
              transformation: [
                { width: 600, height: 600, crop: "limit" },
                { quality: "auto:good" }
              ]
            });
            
            newAdditionalImages.push(result.secure_url);
            uploadedFiles.push({
              path: file.path,
              public_id: result.public_id
            });
          }
          
          product.images.additional = newAdditionalImages;
        } catch (uploadError) {
          return res.status(500).json({ 
            success: false,
            message: "Error al actualizar las imágenes adicionales",
            error: 'IMAGE_UPLOAD_ERROR'
          });
        }
      }
    }

    await product.save();
    
    // Limpiar archivos temporales
    if (req.files) {
      cleanTempFiles([...(req.files.mainImage || []), ...(req.files.additionalImages || [])]);
    }

    console.log(`✅ Producto actualizado: ${product._id}`);

    res.status(200).json({
      success: true,
      message: "Producto actualizado exitosamente",
      data: {
        product: {
          ...product.toObject(),
          formattedPrice: `${product.basePrice.toFixed(2)}`
        },
        konvaConfig: generateKonvaConfig(product)
      }
    });

  } catch (error) {
    console.error("Error en updateProduct:", error);
    
    // Limpiar archivos temporales en caso de error
    if (req.files) {
      cleanTempFiles([...(req.files.mainImage || []), ...(req.files.additionalImages || [])]);
    }
    
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

    // Validar ID usando validador centralizado
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

    // Verificar si hay diseños o pedidos asociados
    const designCount = await Design.countDocuments({ product: idValidation.cleaned });
    if (designCount > 0) {
      // En lugar de eliminar, desactivar el producto
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

    // Si no hay diseños, eliminar imágenes de Cloudinary
    try {
      // Eliminar imagen principal
      const mainImageId = extractCloudinaryId(product.images.main);
      if (mainImageId) {
        await cloudinary.uploader.destroy(mainImageId);
        console.log(`🗑️ Imagen principal eliminada: ${mainImageId}`);
      }
      
      // Eliminar imágenes adicionales
      for (const imageUrl of product.images.additional) {
        const imageId = extractCloudinaryId(imageUrl);
        if (imageId) {
          await cloudinary.uploader.destroy(imageId);
          console.log(`🗑️ Imagen adicional eliminada: ${imageId}`);
        }
      }
    } catch (cloudinaryError) {
      console.error("Error eliminando imágenes de Cloudinary:", cloudinaryError);
      // Continuar con la eliminación del producto aunque falle la limpieza de imágenes
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
    console.error("Error en deleteProduct:", error);
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
    
    // Validar ID usando validador centralizado
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

    // Validar parámetros de consulta opcionales
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

    // Generar configuración para Konva con opciones adicionales para el editor
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
    console.error("Error en getKonvaConfig:", error);
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

    // Validar consulta de búsqueda
    const queryValidation = validators.text(query, 2, 100);
    if (!queryValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: `Consulta de búsqueda inválida: ${queryValidation.error}`,
        error: 'INVALID_SEARCH_QUERY'
      });
    }

    // Validar límite
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
        formattedPrice: `${validPrice.toFixed(2)}`,
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
    console.error("Error en searchProducts:", error);
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

    // Validar ID del producto
    const idValidation = validators.mongoId(id, 'ID de producto');
    if (!idValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: idValidation.error,
        error: 'INVALID_PRODUCT_ID'
      });
    }

    // Validar límite
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

    // Si no hay suficientes productos en la misma categoría, agregar productos aleatorios
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
        formattedPrice: `${validPrice.toFixed(2)}`,
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
    console.error("Error en getRelatedProducts:", error);
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

    // Validar ID del producto
    const idValidation = validators.mongoId(id, 'ID de producto');
    if (!idValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: idValidation.error,
        error: 'INVALID_PRODUCT_ID'
      });
    }

    // Validar acción
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
    console.error("Error en updateProductStats:", error);
    res.status(500).json({
      success: false,
      message: "Error al actualizar estadísticas",
      error: process.env.NODE_ENV === 'development' ? error.message : "Error interno"
    });
  }
};

/**
 * Crea datos de ejemplo para testing
 */
productController.createSampleProducts = async (req, res) => {
  try {
    // Verificar si ya existen productos
    const existingCount = await Product.countDocuments();
    if (existingCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Ya existen ${existingCount} productos en la base de datos`,
        error: 'PRODUCTS_ALREADY_EXIST'
      });
    }

    // Buscar o crear categoría por defecto
    let defaultCategory = await Category.findOne({ name: 'General' });
    if (!defaultCategory) {
      // Validar datos de la categoría por defecto
      const categoryValidation = validateFields({
        name: 'General',
        description: 'Categoría general para productos'
      }, {
        name: (value) => validators.text(value, 1, 50),
        description: (value) => validators.text(value, 0, 200)
      });

      if (!categoryValidation.isValid) {
        return res.status(500).json({
          success: false,
          message: `Error creando categoría por defecto: ${categoryValidation.errors.join('; ')}`,
          error: 'CATEGORY_CREATION_ERROR'
        });
      }

      defaultCategory = new Category({
        name: categoryValidation.cleaned.name,
        description: categoryValidation.cleaned.description,
        isActive: true
      });
      await defaultCategory.save();
    }

    // Productos de ejemplo con validación
    const sampleProductsData = [
      {
        name: 'Camiseta Personalizable',
        description: 'Camiseta de algodón 100% ideal para personalización con sublimación',
        basePrice: 24.99,
        productionTime: 3,
        searchTags: ['camiseta', 'algodón', 'personalizable', 'sublimación']
      },
      {
        name: 'Taza Sublimable',
        description: 'Taza de cerámica blanca perfecta para sublimación',
        basePrice: 19.99,
        productionTime: 2,
        searchTags: ['taza', 'cerámica', 'sublimación', 'bebidas']
      },
      {
        name: 'Funda para Teléfono',
        description: 'Funda personalizable para diversos modelos de teléfono',
        basePrice: 22.99,
        productionTime: 2,
        searchTags: ['funda', 'teléfono', 'protección', 'personalizable']
      },
      {
        name: 'Bolso Tote',
        description: 'Bolso de tela resistente ideal para diseños personalizados',
        basePrice: 27.99,
        productionTime: 4,
        searchTags: ['bolso', 'tote', 'tela', 'eco']
      }
    ];

    const validatedProducts = [];

    // Validar cada producto de ejemplo
    for (const productData of sampleProductsData) {
      const validation = validateFields(productData, {
        name: (value) => validators.text(value, 1, 100),
        description: (value) => validators.text(value, 0, 500),
        basePrice: (value) => validators.price(value, 0.01),
        productionTime: (value) => validators.quantity(value, 1, 30)
      });

      if (!validation.isValid) {
        console.error(`Error validando producto "${productData.name}":`, validation.errors);
        continue;
      }

      // Validar tags de búsqueda
      const validatedTags = productData.searchTags
        .map(tag => {
          const tagValidation = validators.text(tag, 1, 30);
          return tagValidation.isValid ? tagValidation.cleaned : null;
        })
        .filter(tag => tag !== null);

      validatedProducts.push({
        name: validation.cleaned.name,
        description: validation.cleaned.description,
        category: defaultCategory._id,
        basePrice: validation.cleaned.basePrice,
        productionTime: validation.cleaned.productionTime,
        isActive: true,
        images: {
          main: `/src/img/${productData.name.toLowerCase().replace(/\s+/g, '_')}.png`,
          additional: []
        },
        customizationAreas: [
          {
            name: 'Área principal',
            x: 50,
            y: 80,
            width: 200,
            height: 250,
            maxElements: 5
          }
        ],
        options: [
          {
            name: 'Talla',
            type: 'size',
            values: [
              { name: 'S', value: 's', additionalCost: 0 },
              { name: 'M', value: 'm', additionalCost: 0 },
              { name: 'L', value: 'l', additionalCost: 2 },
              { name: 'XL', value: 'xl', additionalCost: 4 }
            ]
          }
        ],
        metadata: {
          featured: Math.random() > 0.5,
          searchTags: validatedTags,
          stats: { views: 0, designs: 0, orders: 0 }
        }
      });
    }

    if (validatedProducts.length === 0) {
      return res.status(500).json({
        success: false,
        message: "No se pudieron validar productos de ejemplo",
        error: 'VALIDATION_FAILED'
      });
    }

    // Crear productos
    const createdProducts = await Product.insertMany(validatedProducts);

    console.log(`✅ ${createdProducts.length} productos de ejemplo creados`);

    res.status(201).json({
      success: true,
      message: `${createdProducts.length} productos de ejemplo creados exitosamente`,
      data: {
        products: createdProducts.map(product => ({
          ...product.toObject(),
          formattedPrice: `${product.basePrice.toFixed(2)}`
        })),
        category: defaultCategory
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

/**
 * Obtiene configuración para el editor de áreas (Admin)
 */
productController.getEditorConfig = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validar ID usando validador centralizado
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
    
    res.status(200).json({
      success: true,
      data: {
        productId: product._id,
        productName: product.name,
        imageUrl: product.images.main,
        stageConfig: product.getKonvaStageConfig ? product.getKonvaStageConfig() : {},
        areas: product.customizationAreas.map(area => ({
          ...area,
          editable: true,
          resizable: true,
          draggable: true
        })),
        editorConfig: product.editorConfig || {}
      }
    });
    
  } catch (error) {
    console.error("❌ Error en getEditorConfig:", error);
    res.status(500).json({ 
      success: false,
      message: "Error al obtener configuración del editor",
      error: process.env.NODE_ENV === 'development' ? error.message : 'INTERNAL_ERROR'
    });
  }
};

/**
 * Vista previa de áreas mientras se crean (Admin)
 */
productController.previewAreas = async (req, res) => {
  try {
    const { areas, imageUrl } = req.body;
    
    if (!areas || !Array.isArray(areas)) {
      return res.status(400).json({ 
        success: false,
        message: "Debe proporcionar las áreas a previsualizar",
        error: 'AREAS_REQUIRED'
      });
    }

    // Validar URL de imagen si se proporciona
    if (imageUrl) {
      const urlValidation = validators.text(imageUrl, 1, 500);
      if (!urlValidation.isValid) {
        return res.status(400).json({
          success: false,
          message: `URL de imagen inválida: ${urlValidation.error}`,
          error: 'INVALID_IMAGE_URL'
        });
      }
    }
    
    // Validar áreas usando la función existente
    const validation = validateCustomizationAreas(areas);
    if (!validation.isValid) {
      return res.status(400).json({ 
        success: false,
        message: "Áreas inválidas",
        errors: validation.errors,
        error: 'INVALID_AREAS'
      });
    }
    
    // Generar configuración Konva para preview
    const konvaConfig = {
      stage: {
        width: 800,
        height: 600,
        container: 'preview-container'
      },
      backgroundImage: imageUrl || '',
      areas: areas.map((area, index) => ({
        id: `preview-area-${index}`,
        ...area.position,
        stroke: area.konvaConfig?.strokeColor || '#06AED5',
        strokeWidth: 2,
        fill: area.konvaConfig?.strokeColor || '#06AED5',
        opacity: 0.2,
        dash: [5, 5],
        name: area.name,
        displayName: area.displayName
      }))
    };
    
    res.status(200).json({
      success: true,
      message: "Vista previa generada",
      data: {
        konvaConfig,
        areasCount: areas.length,
        hasOverlap: checkAreasOverlap(areas)
      }
    });
    
  } catch (error) {
    console.error("❌ Error en previewAreas:", error);
    res.status(500).json({ 
      success: false,
      message: "Error al generar vista previa",
      error: process.env.NODE_ENV === 'development' ? error.message : 'INTERNAL_ERROR'
    });
  }
};

// ==================== FUNCIONES AUXILIARES ====================

/**
 * Función auxiliar para verificar superposición de áreas
 */
function checkAreasOverlap(areas) {
  for (let i = 0; i < areas.length; i++) {
    for (let j = i + 1; j < areas.length; j++) {
      const a1 = areas[i].position;
      const a2 = areas[j].position;
      
      if (!(a1.x + a1.width < a2.x || 
            a2.x + a2.width < a1.x || 
            a1.y + a1.height < a2.y || 
            a2.y + a2.height < a1.y)) {
        return true;
      }
    }
  }
  return false;
}

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
    console.error('Error calculando días:', error);
    return 0;
  }
}

/**
 * Limpiar archivos temporales del sistema
 */
function cleanTempFiles(files) {
  if (!files || !Array.isArray(files)) return;
  
  files.forEach(file => {
    try {
      if (file && file.path && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
        console.log(`🧹 Archivo temporal eliminado: ${file.path}`);
      }
    } catch (cleanError) {
      console.error('Error limpiando archivo temporal:', cleanError);
    }
  });
}

/**
 * Extraer ID público de Cloudinary desde URL
 */
function extractCloudinaryId(url) {
  if (!url || typeof url !== 'string') return null;
  
  try {
    // Validar que sea una URL válida
    const urlValidation = validators.text(url, 1, 500);
    if (!urlValidation.isValid) return null;

    const urlParts = url.split('/');
    const uploadIndex = urlParts.findIndex(part => part === 'upload');
    
    if (uploadIndex === -1) {
      throw new Error('URL de Cloudinary inválida');
    }
    
    // Tomar todo después de 'upload' y antes de la extensión
    const pathAfterUpload = urlParts.slice(uploadIndex + 1);
    
    // Remover versión si existe (v123456)
    if (pathAfterUpload[0] && pathAfterUpload[0].startsWith('v')) {
      pathAfterUpload.shift();
    }
    
    // Unir el path y remover extensión
    const fullPath = pathAfterUpload.join('/');
    const publicId = fullPath.replace(/\.[^/.]+$/, ''); // Remover extensión
    
    return publicId;
  } catch (error) {
    console.error('Error extrayendo ID de Cloudinary:', error);
    return null;
  }
}

/**
 * Validar estructura completa de producto
 */
function validateProductStructure(productData) {
  const errors = [];
  const cleaned = {};

  // Validar campos básicos
  const basicValidation = validateFields(productData, {
    name: (value) => validators.text(value, 1, 100),
    description: (value) => validators.text(value, 0, 500),
    basePrice: (value) => validators.price(value, 0.01),
    productionTime: (value) => validators.quantity(value, 1, 30)
  });

  if (!basicValidation.isValid) {
    errors.push(...basicValidation.errors);
  } else {
    Object.assign(cleaned, basicValidation.cleaned);
  }

  // Validar categoría si se proporciona
  if (productData.categoryId) {
    const categoryValidation = validators.mongoId(productData.categoryId, 'ID de categoría');
    if (!categoryValidation.isValid) {
      errors.push(categoryValidation.error);
    } else {
      cleaned.categoryId = categoryValidation.cleaned;
    }
  }

  // Validar áreas de personalización
  if (productData.customizationAreas && Array.isArray(productData.customizationAreas)) {
    const areasValidation = validateCustomizationAreas(productData.customizationAreas);
    if (!areasValidation.isValid) {
      errors.push(...areasValidation.errors);
    } else {
      cleaned.customizationAreas = productData.customizationAreas;
    }
  }

  // Validar opciones del producto
  if (productData.options && Array.isArray(productData.options)) {
    const validatedOptions = [];
    for (const option of productData.options) {
      const optionValidation = validateFields(option, {
        name: (value) => validators.text(value, 1, 50),
        type: (value) => validators.text(value, 1, 20)
      });

      if (!optionValidation.isValid) {
        errors.push(`Opción "${option.name || 'sin nombre'}": ${optionValidation.errors.join('; ')}`);
        continue;
      }

      if (!Array.isArray(option.values) || option.values.length === 0) {
        errors.push(`La opción "${option.name}" debe tener al menos un valor`);
        continue;
      }

      // Validar valores de la opción
      const validatedValues = [];
      for (const value of option.values) {
        const valueValidation = validateFields(value, {
          name: (val) => validators.text(val, 1, 50),
          value: (val) => validators.text(val, 1, 50),
          additionalCost: (val) => validators.price(val, 0)
        });

        if (valueValidation.isValid) {
          validatedValues.push(valueValidation.cleaned);
        } else {
          errors.push(`Valor de opción inválido en "${option.name}": ${valueValidation.errors.join('; ')}`);
        }
      }

      if (validatedValues.length > 0) {
        validatedOptions.push({
          ...optionValidation.cleaned,
          values: validatedValues
        });
      }
    }

    if (validatedOptions.length > 0) {
      cleaned.options = validatedOptions;
    }
  }

  // Validar metadatos
  if (productData.metadata) {
    if (productData.metadata.searchTags && Array.isArray(productData.metadata.searchTags)) {
      const validatedTags = productData.metadata.searchTags
        .map(tag => {
          const tagValidation = validators.text(tag, 1, 30);
          return tagValidation.isValid ? tagValidation.cleaned : null;
        })
        .filter(tag => tag !== null);

      if (validatedTags.length > 0) {
        cleaned.searchTags = validatedTags;
      }
    }

    if (typeof productData.metadata.featured === 'boolean') {
      cleaned.featured = productData.metadata.featured;
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    cleaned
  };
}

/**
 * Formatear respuesta de error de validación
 */
function formatValidationError(errors, message = "Error de validación") {
  return {
    success: false,
    message,
    errors: Array.isArray(errors) ? errors : [errors],
    error: 'VALIDATION_ERROR'
  };
}

/**
 * Formatear respuesta de producto para API
 */
function formatProductResponse(product, includeKonvaConfig = false) {
  // Validar precio del producto
  const priceValidation = validators.price(product.basePrice, 0);
  const validPrice = priceValidation.isValid ? priceValidation.cleaned : 0;

  const formattedProduct = {
    _id: product._id,
    name: product.name,
    description: product.description,
    category: product.category,
    basePrice: validPrice,
    formattedPrice: `${validPrice.toFixed(2)}`,
    productionTime: product.productionTime,
    isActive: product.isActive,
    images: product.images,
    customizationAreas: product.customizationAreas,
    options: product.options,
    metadata: product.metadata,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
    daysAgo: calculateDaysAgo(product.createdAt),
    statusText: product.isActive ? 'Activo' : 'Inactivo',
    _links: {
      self: `/api/products/${product._id}`,
      designs: `/api/products/${product._id}/designs`,
      konvaConfig: `/api/products/${product._id}/konva-config`,
      category: product.category?._id ? `/api/categories/${product.category._id}` : null,
      update: `/api/products/${product._id}`,
      delete: `/api/products/${product._id}`
    }
  };

  if (includeKonvaConfig) {
    formattedProduct.konvaConfig = generateKonvaConfig(product);
  }

  return formattedProduct;
}

/**
 * Validar parámetros de consulta para filtros
 */
function validateQueryParams(query) {
  const errors = [];
  const cleaned = {};

  // Validar paginación
  if (query.page !== undefined) {
    const pageValidation = validators.quantity(query.page, 1, 1000);
    if (!pageValidation.isValid) {
      errors.push(`Página: ${pageValidation.error}`);
    } else {
      cleaned.page = pageValidation.cleaned;
    }
  }

  if (query.limit !== undefined) {
    const limitValidation = validators.quantity(query.limit, 1, 50);
    if (!limitValidation.isValid) {
      errors.push(`Límite: ${limitValidation.error}`);
    } else {
      cleaned.limit = limitValidation.cleaned;
    }
  }

  // Validar categoría
  if (query.category && query.category.trim() !== '') {
    const categoryValidation = validators.mongoId(query.category, 'Categoría');
    if (categoryValidation.isValid) {
      cleaned.category = categoryValidation.cleaned;
    }
  }

  // Validar búsqueda
  if (query.search && query.search.trim() !== '') {
    const searchValidation = validators.text(query.search, 1, 100);
    if (searchValidation.isValid) {
      cleaned.search = searchValidation.cleaned;
    }
  }

  // Validar ordenamiento
  const validSortOptions = ['newest', 'oldest', 'price_asc', 'price_desc', 'name_asc', 'name_desc'];
  if (query.sort && !validSortOptions.includes(query.sort)) {
    cleaned.sort = 'newest'; // Default
  } else {
    cleaned.sort = query.sort || 'newest';
  }

  // Validar booleanos
  if (query.isActive !== undefined) {
    cleaned.isActive = query.isActive === 'true';
  }

  if (query.featured !== undefined) {
    cleaned.featured = query.featured === 'true';
  }

  return {
    isValid: errors.length === 0,
    errors,
    cleaned
  };
}

export default productController;