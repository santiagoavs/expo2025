import Product from "../models/product.js";
import Design from "../models/design.js";
import Category from "../models/category.js";
import cloudinary from "../utils/cloudinary.js";
import fs from "fs";
import mongoose from "mongoose";
import { validateCustomizationAreas, generateKonvaConfig } from "../utils/pruductUtils.js";

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

    // Construir filtro con validación
    const filter = {};
    
    // Filtro por categoría
    if (category && category.trim() !== '') {
      if (mongoose.Types.ObjectId.isValid(category)) {
        filter.category = new mongoose.Types.ObjectId(category);
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
    
    // Filtro por búsqueda de texto
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { name: searchRegex },
        { description: searchRegex },
        { 'metadata.searchTags': searchRegex }
      ];
    }

    // Configurar ordenamiento
    let sortOption = {};
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

    // Opciones de paginación con validación
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit) || 12));

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
          // Validar y establecer valores por defecto seguros
          const safeProduct = {
            _id: product._id || null,
            name: product.name || 'Producto sin nombre',
            description: product.description || '',
            category: product.category || null,
            basePrice: validateNumber(product.basePrice, 0),
            productionTime: validateNumber(product.productionTime, 3),
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

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false,
        message: "ID de producto inválido" 
      });
    }

    const product = await Product.findById(id)
      .populate('category', 'name description slug isActive')
      .lean();
    
    if (!product) {
      return res.status(404).json({ 
        success: false,
        message: "Producto no encontrado" 
      });
    }

    // Validar datos del producto
    const safeProduct = {
      ...product,
      basePrice: validateNumber(product.basePrice, 0),
      productionTime: validateNumber(product.productionTime, 3),
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
    await Product.findByIdAndUpdate(id, {
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

    // Validación básica
    if (!name || !name.trim()) {
      return res.status(400).json({ 
        success: false,
        message: "El nombre del producto es obligatorio" 
      });
    }

    if (!req.files?.mainImage) {
      return res.status(400).json({ 
        success: false,
        message: "La imagen principal es obligatoria" 
      });
    }

    // Verificar categoría
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(400).json({ 
        success: false,
        message: "La categoría especificada no existe" 
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
            errors: areaValidation.errors
          });
        }
      } else {
        return res.status(400).json({
          success: false,
          message: "Debe definir al menos un área personalizable"
        });
      }
    } catch (parseError) {
      return res.status(400).json({ 
        success: false,
        message: "Formato de áreas de personalización inválido",
        error: parseError.message
      });
    }

    // Validar opciones del producto
    let productOptions = [];
    try {
      if (req.body.options) {
        productOptions = JSON.parse(req.body.options);
        
        for (const option of productOptions) {
          if (!option.name || !option.type || !Array.isArray(option.values) || option.values.length === 0) {
            return res.status(400).json({
              success: false,
              message: `Opción inválida: ${option.name || 'sin nombre'}`
            });
          }
        }
      }
    } catch (parseError) {
      return res.status(400).json({ 
        success: false,
        message: "Formato de opciones del producto inválido",
        error: parseError.message
      });
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
        error: uploadError.message
      });
    }

    // Procesar tags de búsqueda
    let processedSearchTags = [];
    try {
      if (req.body.searchTags) {
        const tags = JSON.parse(req.body.searchTags);
        processedSearchTags = Array.isArray(tags) ? tags : [];
      }
    } catch {
      processedSearchTags = [];
    }

    // Crear producto
    const newProduct = new Product({
      name: name.trim(),
      description: description ? description.trim() : "",
      category: category._id,
      basePrice: parseFloat(basePrice) || 0,
      productionTime: parseInt(productionTime) || 3,
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

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false,
        message: "ID de producto inválido" 
      });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ 
        success: false,
        message: "Producto no encontrado" 
      });
    }

    // Actualizar campos básicos
    if (name && name.trim()) product.name = name.trim();
    if (description !== undefined) product.description = description.trim();
    if (basePrice !== undefined) product.basePrice = parseFloat(basePrice) || 0;
    if (productionTime !== undefined) product.productionTime = parseInt(productionTime) || 3;
    if (isActive !== undefined) product.isActive = isActive !== "false";

    // Actualizar metadata
    if (featured !== undefined) product.metadata.featured = featured === "true" || featured === true;
    
    if (searchTags) {
      try {
        const tags = JSON.parse(searchTags);
        product.metadata.searchTags = Array.isArray(tags) ? tags : [];
      } catch {
        // Mantener tags existentes si hay error de parsing
      }
    }

    // Actualizar categoría
    if (categoryId && product.category.toString() !== categoryId) {
      const category = await Category.findById(categoryId);
      if (!category) {
        return res.status(400).json({ 
          success: false,
          message: "La categoría especificada no existe" 
        });
      }
      product.category = category._id;
    }

    // Actualizar áreas de personalización
    if (req.body.customizationAreas) {
      try {
        const customizationAreas = JSON.parse(req.body.customizationAreas);
        const areaValidation = validateCustomizationAreas(customizationAreas);
        
        if (!areaValidation.isValid) {
          return res.status(400).json({ 
            success: false,
            message: "Las áreas de personalización no son válidas",
            errors: areaValidation.errors
          });
        }
        
        product.customizationAreas = customizationAreas;
      } catch (parseError) {
        return res.status(400).json({ 
          success: false,
          message: "Formato de áreas de personalización inválido",
          error: parseError.message
        });
      }
    }

    // Actualizar opciones del producto
    if (req.body.options) {
      try {
        const productOptions = JSON.parse(req.body.options);
        
        for (const option of productOptions) {
          if (!option.name || !option.type || !Array.isArray(option.values) || option.values.length === 0) {
            return res.status(400).json({
              success: false,
              message: `Opción inválida: ${option.name || 'sin nombre'}`
            });
          }
        }
        
        product.options = productOptions;
      } catch (parseError) {
        return res.status(400).json({ 
          success: false,
          message: "Formato de opciones del producto inválido",
          error: parseError.message
        });
      }
    }

    // Procesar imágenes si se proporcionan
    if (req.files) {
      // Manejar imagen principal
      if (req.files.mainImage) {
        try {
          // Eliminar imagen anterior de Cloudinary
          const mainImageId = extractCloudinaryId(product.images.main);
          if (mainImageId) {
            await cloudinary.uploader.destroy(mainImageId);
          }
          
          // Subir nueva imagen
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

          product.images.main = mainImageUrl;
          uploadedFiles.push({
            path: req.files.mainImage[0].path,
            public_id: mainImageResult.public_id
          });
        } catch (uploadError) {
          return res.status(500).json({ 
            success: false,
            message: "Error al actualizar la imagen principal",
            error: uploadError.message
          });
        }
      }
      
      // Manejar imágenes adicionales
      if (req.files.additionalImages) {
        try {
          // Eliminar imágenes anteriores de Cloudinary
          for (const imageUrl of product.images.additional) {
            const imageId = extractCloudinaryId(imageUrl);
            if (imageId) {
              await cloudinary.deleteImage(imageUrl, "products");
            }
          }
          
          // Subir nuevas imágenes
          const additionalPaths = req.files.additionalImages.map(file => file.path);
          
          product.images.additional = await cloudinary.uploadMultipleImages(
            additionalPaths,
            "products/additional",
            {
              width: 600,
              height: 600,
              crop: "limit"
            }
          );
        } catch (uploadError) {
          return res.status(500).json({ 
            success: false,
            message: "Error al actualizar las imágenes adicionales",
            error: uploadError.message
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
          formattedPrice: `$${product.basePrice.toFixed(2)}`
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

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false,
        message: "ID de producto inválido" 
      });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ 
        success: false,
        message: "Producto no encontrado" 
      });
    }

    // Verificar si hay diseños o pedidos asociados
    const designCount = await Design.countDocuments({ product: id });
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
          await cloudinary.deleteImage(imageId, "products");
          console.log(`🗑️ Imagen adicional eliminada: ${imageId}`);
        }
      }
    } catch (cloudinaryError) {
      console.error("Error eliminando imágenes de Cloudinary:", cloudinaryError);
      // Continuar con la eliminación del producto aunque falle la limpieza de imágenes
    }

    // Eliminar producto
    await Product.findByIdAndDelete(id);

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
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false,
        message: "ID de producto inválido" 
      });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ 
        success: false,
        message: "Producto no encontrado" 
      });
    }

    // Generar configuración para Konva con opciones adicionales para el editor
    const konvaConfig = generateKonvaConfig(product, {
      includeProductOptions: true,
      editorMode: req.query.mode || 'simple',
      includeGuides: req.query.guides === 'true',
      includeGrid: req.query.grid === 'true'
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

    if (!query || query.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: "La consulta debe tener al menos 2 caracteres"
      });
    }

    const searchRegex = new RegExp(query.trim(), 'i');
    
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
    .limit(parseInt(limit))
    .lean();

    const formattedProducts = products.map(product => ({
      _id: product._id,
      name: product.name,
      description: product.description,
      basePrice: validateNumber(product.basePrice, 0),
      formattedPrice: `$${validateNumber(product.basePrice, 0).toFixed(2)}`,
      category: product.category,
      images: product.images,
      _links: {
        self: `/api/products/${product._id}`,
        konvaConfig: `/api/products/${product._id}/konva-config`
      }
    }));

    res.status(200).json({
      success: true,
      message: `${formattedProducts.length} productos encontrados`,
      data: {
        products: formattedProducts,
        query: query.trim(),
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

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "ID de producto inválido"
      });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Producto no encontrado"
      });
    }

    // Buscar productos relacionados por categoría
    const relatedProducts = await Product.find({
      _id: { $ne: id },
      category: product.category,
      isActive: true
    })
    .populate('category', 'name')
    .limit(parseInt(limit))
    .lean();

    // Si no hay suficientes productos en la misma categoría, agregar productos aleatorios
    if (relatedProducts.length < parseInt(limit)) {
      const additionalProducts = await Product.find({
        _id: { 
          $ne: id, 
          $nin: relatedProducts.map(p => p._id) 
        },
        isActive: true
      })
      .populate('category', 'name')
      .limit(parseInt(limit) - relatedProducts.length)
      .lean();

      relatedProducts.push(...additionalProducts);
    }

    const formattedProducts = relatedProducts.map(product => ({
      _id: product._id,
      name: product.name,
      description: product.description,
      basePrice: validateNumber(product.basePrice, 0),
      formattedPrice: `$${validateNumber(product.basePrice, 0).toFixed(2)}`,
      category: product.category,
      images: product.images,
      daysAgo: calculateDaysAgo(product.createdAt)
    }));

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
    const { action } = req.body; // 'view', 'design', 'order'

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "ID de producto inválido"
      });
    }

    if (!['view', 'design', 'order'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: "Acción inválida. Use: view, design, order"
      });
    }

    const updateField = `metadata.stats.${action}s`;
    
    const product = await Product.findByIdAndUpdate(
      id,
      { $inc: { [updateField]: 1 } },
      { new: true, lean: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Producto no encontrado"
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
        message: `Ya existen ${existingCount} productos en la base de datos`
      });
    }

    // Buscar o crear categoría por defecto
    let defaultCategory = await Category.findOne({ name: 'General' });
    if (!defaultCategory) {
      defaultCategory = new Category({
        name: 'General',
        description: 'Categoría general para productos',
        isActive: true
      });
      await defaultCategory.save();
    }

    // Productos de ejemplo
    const sampleProducts = [
      {
        name: 'Camiseta Personalizable',
        description: 'Camiseta de algodón 100% ideal para personalización con sublimación',
        category: defaultCategory._id,
        basePrice: 24.99,
        productionTime: 3,
        isActive: true,
        images: {
          main: '/src/img/camiseta.png',
          additional: []
        },
        customizationAreas: [
          {
            name: 'Frente',
            x: 50,
            y: 80,
            width: 200,
            height: 250,
            maxElements: 5
          },
          {
            name: 'Espalda',
            x: 50,
            y: 50,
            width: 200,
            height: 300,
            maxElements: 3
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
          },
          {
            name: 'Color',
            type: 'color',
            values: [
              { name: 'Blanco', value: '#FFFFFF', additionalCost: 0 },
              { name: 'Negro', value: '#000000', additionalCost: 1 },
              { name: 'Azul', value: '#0066CC', additionalCost: 1 }
            ]
          }
        ],
        metadata: {
          featured: true,
          searchTags: ['camiseta', 'algodón', 'personalizable', 'sublimación'],
          stats: { views: 0, designs: 0, orders: 0 }
        }
      },
      {
        name: 'Taza Sublimable',
        description: 'Taza de cerámica blanca perfecta para sublimación',
        category: defaultCategory._id,
        basePrice: 19.99,
        productionTime: 2,
        isActive: true,
        images: {
          main: '/src/img/taza.png',
          additional: []
        },
        customizationAreas: [
          {
            name: 'Área principal',
            x: 30,
            y: 50,
            width: 240,
            height: 100,
            maxElements: 3
          }
        ],
        options: [
          {
            name: 'Tipo',
            type: 'style',
            values: [
              { name: 'Estándar', value: 'standard', additionalCost: 0 },
              { name: 'Mágica', value: 'magic', additionalCost: 5 }
            ]
          }
        ],
        metadata: {
          featured: false,
          searchTags: ['taza', 'cerámica', 'sublimación', 'bebidas'],
          stats: { views: 0, designs: 0, orders: 0 }
        }
      },
      {
        name: 'Funda para Teléfono',
        description: 'Funda personalizable para diversos modelos de teléfono',
        category: defaultCategory._id,
        basePrice: 22.99,
        productionTime: 2,
        isActive: true,
        images: {
          main: '/src/img/funda.png',
          additional: []
        },
        customizationAreas: [
          {
            name: 'Parte trasera',
            x: 20,
            y: 40,
            width: 160,
            height: 280,
            maxElements: 4
          }
        ],
        options: [
          {
            name: 'Modelo',
            type: 'style',
            values: [
              { name: 'iPhone 13', value: 'iphone13', additionalCost: 0 },
              { name: 'iPhone 14', value: 'iphone14', additionalCost: 2 },
              { name: 'Samsung S23', value: 'samsung_s23', additionalCost: 1 }
            ]
          }
        ],
        metadata: {
          featured: true,
          searchTags: ['funda', 'teléfono', 'protección', 'personalizable'],
          stats: { views: 0, designs: 0, orders: 0 }
        }
      },
      {
        name: 'Bolso Tote',
        description: 'Bolso de tela resistente ideal para diseños personalizados',
        category: defaultCategory._id,
        basePrice: 27.99,
        productionTime: 4,
        isActive: true,
        images: {
          main: '/src/img/bolso.png',
          additional: []
        },
        customizationAreas: [
          {
            name: 'Frente',
            x: 40,
            y: 60,
            width: 220,
            height: 200,
            maxElements: 3
          }
        ],
        options: [
          {
            name: 'Material',
            type: 'material',
            values: [
              { name: 'Algodón', value: 'cotton', additionalCost: 0 },
              { name: 'Canvas', value: 'canvas', additionalCost: 3 }
            ]
          }
        ],
        metadata: {
          featured: false,
          searchTags: ['bolso', 'tote', 'tela', 'eco'],
          stats: { views: 0, designs: 0, orders: 0 }
        }
      }
    ];

    // Crear productos
    const createdProducts = await Product.insertMany(sampleProducts);

    console.log(`✅ ${createdProducts.length} productos de ejemplo creados`);

    res.status(201).json({
      success: true,
      message: `${createdProducts.length} productos de ejemplo creados exitosamente`,
      data: {
        products: createdProducts.map(product => ({
          ...product.toObject(),
          formattedPrice: `$${product.basePrice.toFixed(2)}`
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
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false,
        message: "ID de producto inválido",
        error: 'INVALID_PRODUCT_ID'
      });
    }
    
    const product = await Product.findById(id);
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
        stageConfig: product.getKonvaStageConfig(),
        areas: product.customizationAreas.map(area => ({
          ...product.getKonvaAreaConfig(area._id),
          editable: true,
          resizable: true,
          draggable: true
        })),
        editorConfig: product.editorConfig
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
    
    // Validar áreas
    const validation = validateCustomizationAreas(areas);
    if (!validation.isValid) {
      return res.status(400).json({ 
        success: false,
        message: "Áreas inválidas",
        errors: validation.errors
      });
    }
    
    // Generar configuración Konva para preview
    const konvaConfig = {
      stage: {
        width: 800,
        height: 600,
        container: 'preview-container'
      },
      backgroundImage: imageUrl,
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

// Función auxiliar para verificar superposición
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

// Funciones auxiliares
function validateNumber(value, defaultValue = 0) {
  const num = Number(value);
  return isNaN(num) || !isFinite(num) ? defaultValue : Math.max(0, num);
}

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

function cleanTempFiles(files) {
  if (!files || !Array.isArray(files)) return;
  
  files.forEach(file => {
    try {
      if (file && file.path && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    } catch (cleanError) {
      console.error('Error limpiando archivo temporal:', cleanError);
    }
  });
}

function extractCloudinaryId(url) {
  if (!url || typeof url !== 'string') return null;
  
  try {
    // Usar la función que ya tienes en tu configuración de Cloudinary
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

export default productController;