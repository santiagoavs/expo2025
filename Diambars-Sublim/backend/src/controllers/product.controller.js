import Product from "../models/product.js";
import Design from "../models/design.js";
import Category from "../models/category.js";
import cloudinary from "../utils/cloudinary.js";
import fs from "fs";
import mongoose from "mongoose";
import { validateCustomizationAreas, generateKonvaConfig } from "../utils/pruductUtils.js";

const productController = {};

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
      options = []
    } = req.body;

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
        
        // Validar que cada área tenga los campos requeridos
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
        
        // Asegurarse que las opciones tengan los campos requeridos
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
      const mainImageResult = await cloudinary.uploader.upload(req.files.mainImage[0].path, {
        folder: "products/main",
        resource_type: "auto"
      });
      
      imageUrls.main = mainImageResult.secure_url;
      uploadedFiles.push({
        path: req.files.mainImage[0].path,
        public_id: mainImageResult.public_id
      });
      
      // Subir imágenes adicionales si existen
      if (req.files.additionalImages) {
        for (const file of req.files.additionalImages) {
          const result = await cloudinary.uploader.upload(file.path, {
            folder: "products/additional",
            resource_type: "auto"
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
          cloudinary.uploader.destroy(file.public_id).catch(err => console.error(`Error eliminando ${file.public_id}:`, err))
        )
      );
      
      // Limpiar archivos temporales
      cleanTempFiles([...(req.files.mainImage || []), ...(req.files.additionalImages || [])]);
      
      return res.status(500).json({ 
        success: false,
        message: "Error al procesar las imágenes",
        error: uploadError.message
      });
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
      images: imageUrls
    });

    await newProduct.save();
    
    // Limpiar archivos temporales después de subir a Cloudinary
    cleanTempFiles([...(req.files.mainImage || []), ...(req.files.additionalImages || [])]);

    // Generar configuración para Konva
    const konvaConfig = generateKonvaConfig(newProduct);

    res.status(201).json({
      success: true,
      message: "Producto creado exitosamente",
      data: {
        product: newProduct,
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
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obtiene todos los productos con filtrado avanzado
 */
productController.getAllProducts = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      category, 
      isActive, 
      search,
      sort = 'createdAt',
      order = 'desc',
      featured
    } = req.query;

    // Construir filtro
    const filter = {};
    
    if (category) {
      filter.category = mongoose.Types.ObjectId.isValid(category) ? category : null;
    }
    
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }
    
    if (featured !== undefined) {
      filter['metadata.featured'] = featured === 'true';
    }
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'metadata.searchTags': { $regex: search, $options: 'i' } }
      ];
    }

    // Ordenamiento
    const sortOption = {};
    const validSortFields = ['createdAt', 'name', 'basePrice', 'productionTime'];
    
    if (validSortFields.includes(sort)) {
      sortOption[sort] = order === 'asc' ? 1 : -1;
    } else {
      sortOption.createdAt = -1; // Default
    }

    // Consulta con paginación
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: sortOption,
      populate: [
        { path: 'category', select: 'name' }
      ],
      lean: true
    };

    // Ejecutar consulta paginada
    const result = await Product.paginate(filter, options);

    // Transformar resultado para incluir URLs para frontend
    const products = result.docs.map(product => ({
      ...product,
      _links: {
        self: `/api/products/${product._id}`,
        designs: `/api/products/${product._id}/designs`,
        konvaConfig: `/api/products/${product._id}/konva-config`
      }
    }));

    res.status(200).json({
      success: true,
      data: {
        products,
        pagination: {
          total: result.totalDocs,
          pages: result.totalPages,
          currentPage: result.page,
          limit: result.limit,
          hasNextPage: result.hasNextPage,
          hasPrevPage: result.hasPrevPage,
          nextPage: result.nextPage,
          prevPage: result.prevPage
        }
      }
    });
  } catch (error) {
    console.error("Error en getAllProducts:", error);
    res.status(500).json({ 
      success: false,
      message: "Error al obtener los productos",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
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
      .populate('category', 'name')
      .lean();
    
    if (!product) {
      return res.status(404).json({ 
        success: false,
        message: "Producto no encontrado" 
      });
    }

    // Generar configuración para Konva
    const konvaConfig = generateKonvaConfig(product);

    res.status(200).json({
      success: true,
      data: {
        product,
        konvaConfig,
        _links: {
          designs: `/api/products/${product._id}/designs`,
          konvaConfig: `/api/products/${product._id}/konva-config`,
          category: `/api/categories/${product.category._id}`
        }
      }
    });
  } catch (error) {
    console.error("Error en getProductById:", error);
    res.status(500).json({ 
      success: false,
      message: "Error al obtener el producto",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
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
      isActive
    } = req.body;

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
    if (name) product.name = name.trim();
    if (description !== undefined) product.description = description.trim();
    if (basePrice !== undefined) product.basePrice = parseFloat(basePrice);
    if (productionTime !== undefined) product.productionTime = parseInt(productionTime);
    if (isActive !== undefined) product.isActive = isActive !== "false";

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
        
        // Validar opciones
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
          const mainImageResult = await cloudinary.uploader.upload(req.files.mainImage[0].path, {
            folder: "products/main",
            resource_type: "auto"
          });
          
          product.images.main = mainImageResult.secure_url;
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
              await cloudinary.uploader.destroy(imageId);
            }
          }
          
          // Subir nuevas imágenes
          const additionalUrls = [];
          for (const file of req.files.additionalImages) {
            const result = await cloudinary.uploader.upload(file.path, {
              folder: "products/additional",
              resource_type: "auto"
            });
            
            additionalUrls.push(result.secure_url);
            uploadedFiles.push({
              path: file.path,
              public_id: result.public_id
            });
          }
          
          product.images.additional = additionalUrls;
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

    res.status(200).json({
      success: true,
      message: "Producto actualizado exitosamente",
      data: {
        product,
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
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Elimina un producto con validación de diseños existentes
 */
productController.deleteProduct = async (req, res) => {
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

    // Verificar si hay diseños o pedidos asociados
    const designCount = await Design.countDocuments({ product: id });
    if (designCount > 0) {
      // En lugar de eliminar, desactivar el producto
      product.isActive = false;
      await product.save();
      
      return res.status(200).json({
        success: true,
        message: "Producto desactivado porque tiene diseños asociados",
        designCount
      });
    }

    // Si no hay diseños, eliminar imágenes de Cloudinary
    try {
      // Eliminar imagen principal
      const mainImageId = extractCloudinaryId(product.images.main);
      if (mainImageId) {
        await cloudinary.uploader.destroy(mainImageId);
      }
      
      // Eliminar imágenes adicionales
      for (const imageUrl of product.images.additional) {
        const imageId = extractCloudinaryId(imageUrl);
        if (imageId) {
          await cloudinary.uploader.destroy(imageId);
        }
      }
    } catch (cloudinaryError) {
      console.error("Error eliminando imágenes de Cloudinary:", cloudinaryError);
      // Continuar con la eliminación del producto aunque falle la limpieza de imágenes
    }

    // Eliminar producto
    await Product.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Producto eliminado exitosamente"
    });

  } catch (error) {
    console.error("Error en deleteProduct:", error);
    res.status(500).json({ 
      success: false,
      message: "Error al eliminar el producto",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
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
      editorMode: req.query.mode || 'simple'
    });

    res.status(200).json({
      success: true,
      data: konvaConfig
    });
  } catch (error) {
    console.error("Error en getKonvaConfig:", error);
    res.status(500).json({ 
      success: false,
      message: "Error al obtener la configuración del editor",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Función auxiliar para limpiar archivos temporales
function cleanTempFiles(files) {
  if (!files || !Array.isArray(files)) return;
  
  files.forEach(file => {
    try {
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    } catch (cleanError) {
      console.error('Error limpiando archivo temporal:', cleanError);
    }
  });
}

// Función para extraer el ID de Cloudinary de una URL
function extractCloudinaryId(url) {
  if (!url || typeof url !== 'string') return null;
  
  // Cloudinary URLs tienen formato: https://res.cloudinary.com/{cloud_name}/image/upload/v{version}/{public_id}.{format}
  const match = url.match(/\/v\d+\/(.+?)\./);
  return match ? match[1] : null;
}

export default productController;