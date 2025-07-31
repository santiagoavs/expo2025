import Product from "../models/product.js";
import Design from "../models/designModel.js";
import Category from "../models/category.js";
import cloudinary from "../utils/cloudinary.js";
import fs from "fs";
import {
  validateCustomizationAreas,
  validateDesignAgainstProduct,
  generateKonvaConfig
} from "../utils/pruductUtils.js";

const productController = {};

/**
 * Crea un nuevo producto base para sublimación
 * 
 * - Valida campos requeridos
 * - Sube imágenes a Cloudinary
 * - Valida áreas de personalización
 * - Genera configuración inicial para Konva
 */
productController.createProduct = async (req, res) => {
  let tempFiles = [];
  
  try {
    const { 
      name, 
      description, 
      categoryId,
      customizationAreas,
      basePrice,
      productionTime,
      isActive
    } = req.body;

    // Validación básica
    if (!req.files?.mainImage) {
      return res.status(400).json({ 
        success: false,
        message: "La imagen principal es obligatoria" 
      });
    }

    if (!name || !name.trim()) {
      return res.status(400).json({ 
        success: false,
        message: "El nombre del producto es obligatorio" 
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
    let parsedAreas = [];
    try {
      parsedAreas = JSON.parse(customizationAreas);
      await validateCustomizationAreas(parsedAreas);
    } catch (error) {
      return res.status(400).json({ 
        success: false,
        message: "Las áreas de personalización no son válidas",
        error: error.message
      });
    }

    // Subir imágenes
    const uploadResults = {};
    tempFiles = Object.values(req.files).flat();
    
    try {
      // Subir imagen principal
      uploadResults.mainImage = await cloudinary.uploader.upload(
        req.files.mainImage[0].path,
        { folder: "products/base" }
      );

      // Subir imágenes adicionales si existen
      if (req.files.additionalImages) {
        uploadResults.additionalImages = await Promise.all(
          req.files.additionalImages.map(file => 
            cloudinary.uploader.upload(file.path, { folder: "products/additional" })
          )
        );
      }
    } catch (uploadError) {
      console.error("Error al subir imágenes:", uploadError);
      return res.status(500).json({ 
        success: false,
        message: "Error al procesar las imágenes",
        error: process.env.NODE_ENV === 'development' ? uploadError.message : undefined
      });
    }

    // Crear producto
    const newProduct = new Product({
      name: name.trim(),
      description: description ? description.trim() : "",
      category: category._id,
      basePrice: parseFloat(basePrice) || 0,
      productionTime: parseInt(productionTime) || 3,
      isActive: isActive !== false,
      customizationAreas: parsedAreas,
      images: {
        main: uploadResults.mainImage.secure_url,
        additional: uploadResults.additionalImages?.map(img => img.secure_url) || []
      }
    });

    await newProduct.save();

    // Generar configuración para Konva
    const konvaConfig = generateKonvaConfig(newProduct);

    // Limpiar archivos temporales
    tempFiles.forEach(file => {
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
    });

    res.status(201).json({
      success: true,
      message: "Producto creado exitosamente",
      product: newProduct,
      konvaConfig
    });

  } catch (error) {
    // Limpieza en caso de error
    tempFiles.forEach(file => {
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
    });

    console.error("Error al crear producto:", error);
    res.status(500).json({ 
      success: false,
      message: "Error interno al crear el producto",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obtiene todos los productos con filtros avanzados
 * 
 * - Paginación
 * - Filtrado por categoría, estado y búsqueda
 * - Ordenamiento personalizado
 */
productController.getAllProducts = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      category, 
      isActive, 
      search 
    } = req.query;

    // Construir filtro
    const filter = {};
    if (category) filter.category = category;
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Consulta con paginación
    const [products, total] = await Promise.all([
      Product.find(filter)
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('category', 'name')
        .sort({ createdAt: -1 }),
      Product.countDocuments(filter)
    ]);

    res.status(200).json({
      success: true,
      data: {
        products,
        pagination: {
          total,
          pages: Math.ceil(total / limit),
          currentPage: parseInt(page),
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error("Error al obtener productos:", error);
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

    const product = await Product.findById(id).populate('category', 'name');
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
        konvaConfig
      }
    });
  } catch (error) {
    console.error("Error al obtener producto:", error);
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
  let tempFiles = [];
  
  try {
    const { id } = req.params;
    const { 
      name, 
      description, 
      categoryId,
      customizationAreas,
      basePrice,
      productionTime,
      isActive
    } = req.body;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ 
        success: false,
        message: "Producto no encontrado" 
      });
    }

    // Validar categoría si se cambia
    if (categoryId && categoryId !== product.category.toString()) {
      const category = await Category.findById(categoryId);
      if (!category) {
        return res.status(400).json({ 
          success: false,
          message: "La categoría especificada no existe" 
        });
      }
      product.category = category._id;
    }

    // Validar áreas de personalización si se cambian
    if (customizationAreas) {
      try {
        const parsedAreas = JSON.parse(customizationAreas);
        await validateCustomizationAreas(parsedAreas);
        product.customizationAreas = parsedAreas;
      } catch (error) {
        return res.status(400).json({ 
          success: false,
          message: "Las áreas de personalización no son válidas",
          error: error.message
        });
      }
    }

    // Manejo de imágenes
    if (req.files) {
      tempFiles = Object.values(req.files).flat();
      
      try {
        // Actualizar imagen principal si se proporciona
        if (req.files.mainImage) {
          // Eliminar imagen anterior
          if (product.images.main) {
            await cloudinary.uploader.destroy(
              product.images.main.split('/').pop().split('.')[0]
            );
          }
          
          // Subir nueva imagen
          const uploadResult = await cloudinary.uploader.upload(
            req.files.mainImage[0].path,
            { folder: "products/base" }
          );
          product.images.main = uploadResult.secure_url;
        }

        // Manejar imágenes adicionales
        if (req.files.additionalImages) {
          // Eliminar imágenes anteriores si es necesario
          if (product.images.additional.length > 0) {
            await Promise.all(
              product.images.additional.map(image => 
                cloudinary.uploader.destroy(image.split('/').pop().split('.')[0])
              )
            );
          }
          
          // Subir nuevas imágenes
          product.images.additional = await Promise.all(
            req.files.additionalImages.map(async file => {
              const result = await cloudinary.uploader.upload(
                file.path, 
                { folder: "products/additional" }
              );
              return result.secure_url;
            })
          );
        }
      } catch (uploadError) {
        console.error("Error al procesar imágenes:", uploadError);
        return res.status(500).json({ 
          success: false,
          message: "Error al procesar las imágenes",
          error: process.env.NODE_ENV === 'development' ? uploadError.message : undefined
        });
      }
    }

    // Actualizar otros campos
    if (name) product.name = name.trim();
    if (description !== undefined) product.description = description.trim();
    if (basePrice !== undefined) product.basePrice = parseFloat(basePrice);
    if (productionTime !== undefined) product.productionTime = parseInt(productionTime);
    if (isActive !== undefined) product.isActive = isActive;

    await product.save();

    // Limpiar archivos temporales
    tempFiles.forEach(file => {
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
    });

    res.status(200).json({
      success: true,
      message: "Producto actualizado exitosamente",
      data: product
    });

  } catch (error) {
    // Limpieza en caso de error
    tempFiles.forEach(file => {
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
    });

    console.error("Error al actualizar producto:", error);
    res.status(500).json({ 
      success: false,
      message: "Error interno al actualizar el producto",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Elimina un producto (soft delete)
 */
productController.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ 
        success: false,
        message: "Producto no encontrado" 
      });
    }

    // Verificar si hay diseños asociados
    const designsCount = await Design.countDocuments({ product: id });
    if (designsCount > 0) {
      return res.status(400).json({ 
        success: false,
        message: "No se puede eliminar el producto porque tiene diseños asociados" 
      });
    }

    // Soft delete
    product.isActive = false;
    await product.save();

    res.status(200).json({
      success: true,
      message: "Producto desactivado exitosamente"
    });

  } catch (error) {
    console.error("Error al eliminar producto:", error);
    res.status(500).json({ 
      success: false,
      message: "Error al eliminar el producto",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obtiene la configuración para el editor Konva
 */
productController.getKonvaConfig = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ 
        success: false,
        message: "Producto no encontrado" 
      });
    }

    const konvaConfig = generateKonvaConfig(product);

    res.status(200).json({
      success: true,
      data: konvaConfig
    });
  } catch (error) {
    console.error("Error al obtener configuración Konva:", error);
    res.status(500).json({ 
      success: false,
      message: "Error al obtener la configuración del editor",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export default productController;