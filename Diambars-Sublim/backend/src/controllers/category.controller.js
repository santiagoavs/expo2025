import Category from "../models/category.js";
import Product from "../models/product.js"; 
import cloudinary from "../utils/cloudinary.js";
import fs from "fs";
import { 
  getCategoryPath, 
  getAllSubcategories, 
  wouldCreateCycle,
  buildCategoryTree
} from "../utils/categoryUtils.js";

// Función auxiliar para limpiar archivos temporales
const cleanupTempFile = (filePath) => {
  try {
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`✅ Archivo temporal eliminado: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Error eliminando archivo temporal ${filePath}:`, error.message);
  }
};

// Función auxiliar para limpiar imagen de Cloudinary
const cleanupCloudinaryImage = async (imageUrl) => {
  try {
    if (imageUrl) {
      const urlParts = imageUrl.split('/');
      const filename = urlParts[urlParts.length - 1];
      const publicId = `diambars/categories/${filename.split('.')[0]}`;
      await cloudinary.uploader.destroy(publicId);
      console.log(`✅ Imagen de Cloudinary eliminada: ${publicId}`);
    }
  } catch (error) {
    console.error(`❌ Error eliminando imagen de Cloudinary:`, error.message);
  }
};

// Función auxiliar para validar datos de entrada
const validateCategoryData = (data) => {
  const errors = [];
  
  if (!data.name || !data.name.trim()) {
    errors.push("El nombre de la categoría es obligatorio");
  } else if (data.name.trim().length < 2) {
    errors.push("El nombre debe tener al menos 2 caracteres");
  } else if (data.name.trim().length > 100) {
    errors.push("El nombre no puede exceder los 100 caracteres");
  }
  
  if (data.description && data.description.length > 500) {
    errors.push("La descripción no puede exceder los 500 caracteres");
  }
  
  if (data.order !== undefined && (isNaN(data.order) || data.order < 0)) {
    errors.push("El orden debe ser un número mayor o igual a 0");
  }
  
  return errors;
};

const categoryController = {};

/**
 * Crea una nueva categoría
 *
 * - Requiere nombre e imagen.
 * - Valida si ya existe una categoría con el mismo nombre.
 * - Valida la categoría padre y previene ciclos en la jerarquía.
 * - Sube imagen a Cloudinary.
 * - Guarda la nueva categoría en la base de datos.
 */
categoryController.createCategory = async (req, res) => {
  let tempFilePath = null;
  let imageUrl = null;
  
  try {
    const { 
      name, 
      description, 
      parent, 
      isActive, 
      showOnHomepage, 
      order 
    } = req.body;

    // Validar datos de entrada
    const validationErrors = validateCategoryData({ name, description, order });
    if (validationErrors.length > 0) {
      return res.status(400).json({ 
        message: "Datos de entrada inválidos",
        errors: validationErrors
      });
    }

    // Verificar que se haya subido un archivo
    if (!req.file) {
      return res.status(400).json({ 
        message: "La imagen es obligatoria" 
      });
    }
    
    tempFilePath = req.file.path;

    // Verificar tamaño del archivo (máximo 5MB)
    const fileSizeInMB = req.file.size / (1024 * 1024);
    if (fileSizeInMB > 5) {
      cleanupTempFile(tempFilePath);
      return res.status(400).json({ 
        message: "La imagen es demasiado grande. Máximo 5MB permitido." 
      });
    }

    // Verificar si ya existe una categoría con este nombre (case insensitive)
    const existingCategory = await Category.findOne({ 
      name: { $regex: new RegExp(`^${name.trim()}$`, 'i') } 
    });
    
    if (existingCategory) {
      cleanupTempFile(tempFilePath);
      return res.status(400).json({ 
        message: "Ya existe una categoría con este nombre" 
      });
    }
    
    // Validar categoría padre si se proporciona
    let parentCategory = null;
    if (parent && parent !== 'null' && parent !== 'undefined') {
      try {
        parentCategory = await Category.findById(parent);
        if (!parentCategory) {
          cleanupTempFile(tempFilePath);
          return res.status(400).json({ 
            message: "La categoría padre especificada no existe" 
          });
        }
        
        // Verificar que no se cree un ciclo en la jerarquía
        if (await wouldCreateCycle(null, parent)) {
          cleanupTempFile(tempFilePath);
          return res.status(400).json({ 
            message: "No se puede asignar esta categoría como padre porque crearía un ciclo en la jerarquía" 
          });
        }
      } catch (parentError) {
        console.error("Error validando categoría padre:", parentError);
        cleanupTempFile(tempFilePath);
        return res.status(500).json({ 
          message: "Error al validar la categoría padre" 
        });
      }
    }

    // Subir imagen a Cloudinary con reintentos
    let uploadAttempts = 0;
    const maxUploadAttempts = 3;
    
    while (uploadAttempts < maxUploadAttempts) {
      try {
        const result = await cloudinary.uploader.upload(tempFilePath, {
          folder: "diambars/categories",
          allowed_formats: ["jpg", "png", "jpeg", "webp"],
          resource_type: "image",
          quality: "auto:good",
          fetch_format: "auto"
        });
        imageUrl = result.secure_url;
        break; // Éxito, salir del bucle
      } catch (uploadError) {
        uploadAttempts++;
        console.error(`Error al subir la imagen (intento ${uploadAttempts}/${maxUploadAttempts}):`, uploadError);
        
        if (uploadAttempts >= maxUploadAttempts) {
          cleanupTempFile(tempFilePath);
          return res.status(500).json({ 
            message: "Error al procesar la imagen después de varios intentos",
            error: process.env.NODE_ENV === 'development' ? uploadError.message : undefined
          });
        }
        
        // Esperar antes del siguiente intento
        await new Promise(resolve => setTimeout(resolve, 1000 * uploadAttempts));
      }
    }

    // Crear la categoría con transacción
    let newCategory;
    try {
      newCategory = new Category({
        name: name.trim(),
        description: description ? description.trim() : "",
        parent: parentCategory ? parentCategory._id : null,
        image: imageUrl,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
        showOnHomepage: showOnHomepage !== undefined ? Boolean(showOnHomepage) : false,
        order: order ? parseInt(order) : 0,
      });

      await newCategory.save();
      
      // Si tiene padre, actualizar el padre para incluir esta subcategoría
      if (parentCategory) {
        await Category.findByIdAndUpdate(parentCategory._id, {
          $addToSet: { children: newCategory._id }
        });
      }
      
      // Limpiar archivo temporal después de éxito
      cleanupTempFile(tempFilePath);

      res.status(201).json({
        message: "Categoría creada exitosamente",
        category: newCategory,
      });
      
    } catch (saveError) {
      console.error("Error al guardar la categoría:", saveError);
      
      // Limpiar imagen de Cloudinary si se subió pero falló el guardado
      await cleanupCloudinaryImage(imageUrl);
      cleanupTempFile(tempFilePath);
      
      // Determinar el tipo de error
      if (saveError.name === 'ValidationError') {
        return res.status(400).json({ 
          message: "Datos de categoría inválidos",
          errors: Object.values(saveError.errors).map(err => err.message)
        });
      } else if (saveError.code === 11000) {
        return res.status(400).json({ 
          message: "Ya existe una categoría con este nombre" 
        });
      } else {
        return res.status(500).json({ 
          message: "Error interno al crear la categoría",
          error: process.env.NODE_ENV === 'development' ? saveError.message : undefined
        });
      }
    }
    
  } catch (error) {
    console.error("Error inesperado al crear categoría:", {
      message: error.message,
      stack: error.stack,
      body: req.body,
      file: req.file
    });

    // Limpiar recursos en caso de error
    cleanupTempFile(tempFilePath);
    await cleanupCloudinaryImage(imageUrl);

    res.status(500).json({ 
      message: "Error interno del servidor",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obtiene todas las categorías existentes
 *
 * - Devuelve lista plana + árbol jerárquico padre-hijo.
 * - Incluye cantidad de productos por categoría (incluyendo subcategorías).
 */
categoryController.getAllCategories = async (req, res) => {
  try {
    // Obtener todas las categorías con población de hijos
    const categories = await Category.find()
      .sort({ order: 1, name: 1 })
      .populate('children', 'name _id image')
      .lean(); // Usar lean() para mejor rendimiento
    
    if (!categories || categories.length === 0) {
      return res.status(200).json({
        categories: [],
        categoryTree: [],
        message: "No hay categorías disponibles"
      });
    }
    
    // Contar productos por categoría con manejo de errores
    const categoriesWithCounts = await Promise.allSettled(
      categories.map(async (category) => {
        try {
          const categoryIds = [category._id];
          
          // Obtener subcategorías de forma segura
          let subcategories = [];
          try {
            subcategories = await getAllSubcategories(category._id);
            subcategories.forEach(subcat => categoryIds.push(subcat._id));
          } catch (subcatError) {
            console.warn(`Error obteniendo subcategorías para ${category.name}:`, subcatError.message);
          }
          
          let productCount = 0;
          try {
            productCount = await Product.countDocuments({ 
              category: { $in: categoryIds } 
            });
          } catch (productError) {
            console.warn(`Error contando productos para ${category.name}:`, productError.message);
            // Continuar sin el conteo de productos
          }
          
          return {
            ...category,
            productCount
          };
        } catch (error) {
          console.error(`Error procesando categoría ${category.name}:`, error);
          // Devolver la categoría sin conteo de productos
          return {
            ...category,
            productCount: 0
          };
        }
      })
    );
    
    // Filtrar resultados exitosos
    const successfulCategories = categoriesWithCounts
      .filter(result => result.status === 'fulfilled')
      .map(result => result.value);
    
    // Construir árbol jerárquico de forma segura
    let categoryTree = [];
    try {
      categoryTree = buildCategoryTree(successfulCategories);
    } catch (treeError) {
      console.error("Error construyendo árbol de categorías:", treeError);
      // Devolver lista plana si falla la construcción del árbol
    }
    
    res.status(200).json({
      categories: successfulCategories,
      categoryTree,
      total: successfulCategories.length
    });
    
  } catch (error) {
    console.error("Error al obtener categorías:", {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    
    // Determinar el tipo de error
    let statusCode = 500;
    let errorMessage = "Error interno al obtener categorías";
    
    if (error.name === 'CastError') {
      statusCode = 400;
      errorMessage = "Error en los parámetros de consulta";
    } else if (error.name === 'ValidationError') {
      statusCode = 400;
      errorMessage = "Error de validación en los datos";
    }
    
    res.status(statusCode).json({ 
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Obtiene una categoría por su ID
 *
 * - Incluye información completa: padre, hijos, subcategorías y ruta completa.
 * - También devuelve cantidad de productos relacionados.
 */
categoryController.getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validar ID
    if (!id || id.length !== 24) {
      return res.status(400).json({ 
        message: "ID de categoría inválido" 
      });
    }
    
    const category = await Category.findById(id)
      .populate('parent', 'name _id')
      .populate('children', 'name _id image')
      .lean();
      
    if (!category) {
      return res.status(404).json({ 
        message: "Categoría no encontrada" 
      });
    }
    
    // Obtener información adicional de forma segura
    let path = [];
    let allSubcategories = [];
    let productCount = 0;
    
    try {
      path = await getCategoryPath(id);
    } catch (pathError) {
      console.warn("Error obteniendo ruta de categoría:", pathError.message);
    }
    
    try {
      allSubcategories = await getAllSubcategories(id);
    } catch (subcatError) {
      console.warn("Error obteniendo subcategorías:", subcatError.message);
    }
    
    try {
      const categoryIds = [category._id, ...allSubcategories.map(sc => sc._id)];
      productCount = await Product.countDocuments({ category: { $in: categoryIds } });
    } catch (productError) {
      console.warn("Error contando productos:", productError.message);
    }
    
    res.status(200).json({
      category: {
        ...category,
        path,
        productCount,
        subcategories: category.children,
        parentCategory: category.parent
      }
    });
    
  } catch (error) {
    console.error("Error al obtener categoría:", {
      message: error.message,
      stack: error.stack,
      categoryId: req.params.id,
      timestamp: new Date().toISOString()
    });
    
    // Determinar el tipo de error
    let statusCode = 500;
    let errorMessage = "Error interno al obtener la categoría";
    
    if (error.name === 'CastError') {
      statusCode = 400;
      errorMessage = "ID de categoría inválido";
    }
    
    res.status(statusCode).json({ 
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Actualiza los datos de una categoría existente
 *
 * - Valida nombre único y evita ciclos.
 * - Permite subir nueva imagen (opcional).
 * - Actualiza todos los campos personalizables.
 */
categoryController.updateCategory = async (req, res) => {
  let tempFilePath = null;
  let oldImageUrl = null;
  let newImageUrl = null;
  
  try {
    const { id } = req.params;
    const { name, description, parent, isActive, showOnHomepage, order } = req.body;
    
    // Validar ID
    if (!id || id.length !== 24) {
      return res.status(400).json({ 
        message: "ID de categoría inválido" 
      });
    }
    
    // Validar datos de entrada
    const validationErrors = validateCategoryData({ name, description, order });
    if (validationErrors.length > 0) {
      return res.status(400).json({ 
        message: "Datos de entrada inválidos",
        errors: validationErrors
      });
    }
    
    // Buscar la categoría
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ 
        message: "Categoría no encontrada" 
      });
    }
    
    // Guardar imagen anterior para limpieza posterior
    oldImageUrl = category.image;
    
    // Verificar si el nombre ya está tomado por otra categoría
    if (name && name !== category.name) {
      const existingCategory = await Category.findOne({ 
        name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
        _id: { $ne: id }
      });
      
      if (existingCategory) {
        return res.status(400).json({ 
          message: "Ya existe otra categoría con este nombre" 
        });
      }
    }
    
    // Verificar que no se cree un ciclo en la jerarquía
    if (parent && parent !== 'null' && parent !== 'undefined') {
      if (await wouldCreateCycle(id, parent)) {
        return res.status(400).json({ 
          message: "Esta asignación crearía un ciclo en la jerarquía de categorías" 
        });
      }
      
      // Verificar que la categoría padre existe
      const parentCategory = await Category.findById(parent);
      if (!parentCategory) {
        return res.status(400).json({ 
          message: "La categoría padre especificada no existe" 
        });
      }
    }
    
    // Procesar imagen si existe
    if (req.file) {
      tempFilePath = req.file.path;
      
      // Verificar tamaño del archivo
      const fileSizeInMB = req.file.size / (1024 * 1024);
      if (fileSizeInMB > 5) {
        cleanupTempFile(tempFilePath);
        return res.status(400).json({ 
          message: "La imagen es demasiado grande. Máximo 5MB permitido." 
        });
      }
      
      try {
        const result = await cloudinary.uploader.upload(tempFilePath, {
          folder: "diambars/categories",
          allowed_formats: ["jpg", "png", "jpeg", "webp"],
          quality: "auto:good",
          fetch_format: "auto"
        });
        
        newImageUrl = result.secure_url;
        category.image = newImageUrl;
        
        // Limpiar archivo temporal
        cleanupTempFile(tempFilePath);
        
      } catch (uploadError) {
        console.error("Error al procesar la imagen:", uploadError);
        cleanupTempFile(tempFilePath);
        return res.status(500).json({ 
          message: "Error al procesar la imagen",
          error: process.env.NODE_ENV === 'development' ? uploadError.message : undefined
        });
      }
    }
    
    // Actualizar los campos de la categoría
    if (name) category.name = name.trim();
    if (description !== undefined) category.description = description.trim();
    if (parent !== undefined) category.parent = parent === 'null' || parent === 'undefined' ? null : parent;
    if (isActive !== undefined) category.isActive = Boolean(isActive);
    if (showOnHomepage !== undefined) category.showOnHomepage = Boolean(showOnHomepage);
    if (order !== undefined) category.order = parseInt(order) || 0;
    
    // Guardar cambios
    await category.save();
    
    // Limpiar imagen anterior si se subió una nueva
    if (newImageUrl && oldImageUrl && oldImageUrl !== newImageUrl) {
      await cleanupCloudinaryImage(oldImageUrl);
    }
    
    res.status(200).json({
      message: "Categoría actualizada exitosamente",
      category
    });
    
  } catch (error) {
    console.error("Error al actualizar categoría:", {
      message: error.message,
      stack: error.stack,
      categoryId: req.params.id,
      body: req.body
    });
    
    // Limpiar archivo temporal en caso de error
    cleanupTempFile(tempFilePath);
    
    // Limpiar nueva imagen si se subió pero falló el guardado
    if (newImageUrl) {
      await cleanupCloudinaryImage(newImageUrl);
    }
    
    // Determinar el tipo de error
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: "Datos de categoría inválidos",
        errors: Object.values(error.errors).map(err => err.message)
      });
    } else if (error.name === 'CastError') {
      return res.status(400).json({ 
        message: "ID de categoría inválido" 
      });
    } else if (error.code === 11000) {
      return res.status(400).json({ 
        message: "Ya existe una categoría con este nombre" 
      });
    } else {
      return res.status(500).json({ 
        message: "Error interno al actualizar la categoría",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
};

/**
 * Elimina una categoría
 *
 * - Solo elimina si no tiene subcategorías ni productos.
 * - Elimina la imagen de Cloudinary si existe.
 */
categoryController.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validar ID
    if (!id || id.length !== 24) {
      return res.status(400).json({ 
        message: "ID de categoría inválido" 
      });
    }
    
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ 
        message: "Categoría no encontrada" 
      });
    }
    
    // Verificar si la categoría tiene subcategorías
    const hasSubcategories = await Category.exists({ parent: id });
    if (hasSubcategories) {
      return res.status(400).json({ 
        message: "No se puede eliminar una categoría con subcategorías. Elimina o reasigna las subcategorías primero.",
        code: "HAS_SUBCATEGORIES"
      });
    }
    
    // Verificar si hay productos asociados a esta categoría
    let hasProducts = false;
    try {
      hasProducts = await Product.exists({ category: id });
      if (hasProducts) {
        return res.status(400).json({ 
          message: "No se puede eliminar una categoría con productos asociados. Reasigna o elimina los productos primero.",
          code: "HAS_PRODUCTS"
        });
      }
    } catch (err) {
      console.warn("Error verificando productos asociados:", err.message);
      // Continuar sin verificar productos si hay error
    }
    
    // Eliminar la imagen de Cloudinary si existe
    if (category.image) {
      await cleanupCloudinaryImage(category.image);
    }
    
    // Eliminar la categoría
    const deletedCategory = await Category.findByIdAndDelete(id);
    
    if (!deletedCategory) {
      return res.status(404).json({ 
        message: "La categoría ya no existe" 
      });
    }
    
    res.status(200).json({
      message: "Categoría eliminada exitosamente",
      deletedCategory: {
        id: deletedCategory._id,
        name: deletedCategory.name
      }
    });
    
  } catch (error) {
    console.error("Error al eliminar categoría:", {
      message: error.message,
      stack: error.stack,
      categoryId: req.params.id,
      timestamp: new Date().toISOString()
    });
    
    // Determinar el tipo de error
    let statusCode = 500;
    let errorMessage = "Error interno al eliminar la categoría";
    
    if (error.name === 'CastError') {
      statusCode = 400;
      errorMessage = "ID de categoría inválido";
    } else if (error.name === 'ValidationError') {
      statusCode = 400;
      errorMessage = "Error de validación";
    }
    
    res.status(statusCode).json({ 
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Busca categorías por coincidencia de nombre
 *
 * - Devuelve un máximo de 10 resultados.
 * - Útil para el buscador del frontend.
 */
categoryController.searchCategories = async (req, res) => {
  try {
    const { q } = req.query;
    
    // Validar parámetro de búsqueda
    if (!q || q.trim().length < 2) {
      return res.status(400).json({ 
        message: "Se requiere un término de búsqueda de al menos 2 caracteres" 
      });
    }
    
    const searchTerm = q.trim();
    
    // Buscar categorías con múltiples criterios
    const categories = await Category.find({
      $or: [
        { name: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } }
      ]
    })
    .sort({ order: 1, name: 1 })
    .limit(10)
    .lean();
    
    res.status(200).json({ 
      categories,
      total: categories.length,
      searchTerm
    });
    
  } catch (error) {
    console.error("Error al buscar categorías:", {
      message: error.message,
      stack: error.stack,
      searchQuery: req.query.q,
      timestamp: new Date().toISOString()
    });
    
    res.status(500).json({ 
      message: "Error interno al buscar categorías",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Obtiene las categorías activas que se deben mostrar en el homepage
 */
categoryController.getHomepageCategories = async (req, res) => {
  try {
    const categories = await Category.find({ 
      isActive: true, 
      showOnHomepage: true 
    })
    .sort({ order: 1, name: 1 })
    .lean();
    
    res.status(200).json({ 
      categories,
      total: categories.length
    });
    
  } catch (error) {
    console.error("Error al obtener categorías para página principal:", {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    
    res.status(500).json({ 
      message: "Error interno al obtener categorías para página principal",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      timestamp: new Date().toISOString()
    });
  }
};

export default categoryController;