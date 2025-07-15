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

const categoryController = {};

/**
 * Crea una nueva categoría con mejor manejo de la jerarquía
 */
categoryController.createCategory = async (req, res) => {
  let tempFilePath = null;
  
  try {
    const { 
      name, 
      description, 
      parent, 
      isActive, 
      showOnHomepage, 
      order 
    } = req.body;

    // Verificar que se haya subido un archivo
    if (!req.file) {
      return res.status(400).json({ 
        message: "La imagen es obligatoria" 
      });
    }
    
    tempFilePath = req.file.path;

    // Verificar que el nombre no esté vacío
    if (!name || !name.trim()) {
      return res.status(400).json({ 
        message: "El nombre de la categoría es obligatorio" 
      });
    }
    
    // Verificar si ya existe una categoría con este nombre (case insensitive)
    const existingCategory = await Category.findOne({ 
      name: { $regex: new RegExp(`^${name.trim()}$`, 'i') } 
    });
    
    if (existingCategory) {
      return res.status(400).json({ 
        message: "Ya existe una categoría con este nombre" 
      });
    }
    
    // Validar categoría padre si se proporciona
    let parentCategory = null;
    if (parent && parent !== 'null' && parent !== 'undefined') {
      parentCategory = await Category.findById(parent);
      if (!parentCategory) {
        return res.status(400).json({ 
          message: "La categoría padre especificada no existe" 
        });
      }
      
      // Verificar que no se cree un ciclo en la jerarquía
      if (await wouldCreateCycle(null, parent)) {
        return res.status(400).json({ 
          message: "No se puede asignar esta categoría como padre porque crearía un ciclo en la jerarquía" 
        });
      }
    }

    // Subir imagen a Cloudinary
    let imageUrl;
    try {
      const result = await cloudinary.uploader.upload(tempFilePath, {
        folder: "diambars/categories",
        allowed_formats: ["jpg", "png", "jpeg", "webp"],
        resource_type: "image"
      });
      imageUrl = result.secure_url;
    } catch (uploadError) {
      console.error("Error al subir la imagen:", uploadError);
      return res.status(500).json({ 
        message: "Error al procesar la imagen",
        error: process.env.NODE_ENV === 'development' ? uploadError.message : undefined
      });
    }

    // Crear la categoría
    const newCategory = new Category({
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
    
    // Eliminar archivo temporal después de éxito
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
    }

    res.status(201).json({
      message: "Categoría creada exitosamente",
      category: newCategory,
    });
  } catch (error) {
    console.error("Error al crear categoría:", {
      message: error.message,
      stack: error.stack,
      body: req.body,
      file: req.file
    });

    // Limpiar archivo temporal en caso de error
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
    }

    // Limpiar imagen de Cloudinary si se subió pero falló el guardado
    if (imageUrl) {
      try {
        const urlParts = imageUrl.split('/');
        const filename = urlParts[urlParts.length - 1];
        const publicId = `diambars/categories/${filename.split('.')[0]}`;
        await cloudinary.uploader.destroy(publicId);
      } catch (cloudinaryError) {
        console.error("Error al limpiar imagen de Cloudinary:", cloudinaryError);
      }
    }

    res.status(500).json({ 
      message: "Error interno al crear la categoría",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obtiene todas las categorías
 * 
 * Devuelve dos estructuras:
 * 1. Una lista plana de todas las categorías
 * 2. Un árbol jerárquico que muestra la relación padre-hijo
 */
/**
 * Obtiene todas las categorías con estructura jerárquica mejorada
 */
categoryController.getAllCategories = async (req, res) => {
  try {
    // Obtener todas las categorías con población de hijos
    const categories = await Category.find()
      .sort({ order: 1, name: 1 })
      .populate('children', 'name _id image');
    
    // Contar productos por categoría
    const categoriesWithCounts = await Promise.all(
      categories.map(async (category) => {
        const categoryIds = [category._id];
        const subcategories = await getAllSubcategories(category._id);
        subcategories.forEach(subcat => categoryIds.push(subcat._id));
        
        let productCount = 0;
        try {
          productCount = await Product.countDocuments({ 
            category: { $in: categoryIds } 
          });
        } catch (err) {
          console.log("Modelo Product no disponible:", err.message);
        }
        
        return {
          ...category.toObject(),
          productCount
        };
      })
    );
    
    // Construir árbol jerárquico
    const categoryTree = buildCategoryTree(categoriesWithCounts);
    
    res.status(200).json({
      categories: categoriesWithCounts,
      categoryTree
    });
  } catch (error) {
    console.error("Error al obtener categorías:", error);
    res.status(500).json({ 
      message: "Error al obtener categorías", 
      error: error.message 
    });
  }
};

/**
 * Obtiene categoría por ID con información completa
 */
categoryController.getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const category = await Category.findById(id)
      .populate('parent', 'name _id')
      .populate('children', 'name _id image');
      
    if (!category) {
      return res.status(404).json({ message: "Categoría no encontrada" });
    }
    
    const path = await getCategoryPath(id);
    const allSubcategories = await getAllSubcategories(id);
    const categoryIds = [category._id, ...allSubcategories.map(sc => sc._id)];
    
    let productCount = 0;
    try {
      productCount = await Product.countDocuments({ category: { $in: categoryIds } });
    } catch (err) {
      console.log("Error contando productos:", err.message);
    }
    
    res.status(200).json({
      category: {
        ...category.toObject(),
        path,
        productCount,
        subcategories: category.children,
        parentCategory: category.parent
      }
    });
  } catch (error) {
    console.error("Error al obtener categoría:", error);
    res.status(500).json({ 
      message: "Error al obtener categoría", 
      error: error.message 
    });
  }
};

/**
 * Actualiza una categoría existente
 * 
 * Permite actualizar cualquier campo, incluyendo la imagen.
 * Incluye validaciones para evitar ciclos en la jerarquía.
 */
categoryController.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, parent, isActive, showOnHomepage, order } = req.body;
    
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: "Categoría no encontrada" });
    }
    
    // Verificar si el nombre ya está tomado por otra categoría
    if (name && name !== category.name) {
      const existingCategory = await Category.findOne({ 
        name: { $regex: new RegExp(`^${name}$`, 'i') },
        _id: { $ne: id }
      });
      
      if (existingCategory) {
        return res.status(400).json({ 
          message: "Ya existe otra categoría con este nombre" 
        });
      }
    }
    
    // Verificar que no se cree un ciclo en la jerarquía
    if (parent && await wouldCreateCycle(id, parent)) {
      return res.status(400).json({ 
        message: "Esta asignación crearía un ciclo en la jerarquía de categorías" 
      });
    }
    
    // Procesar imagen si existe
    if (req.file) {
      try {
        const result = await cloudinary.uploader.upload(
          req.file.path, 
          {
            folder: "diambars/categories",
            allowed_formats: ["jpg", "png", "jpeg", "webp"],
          }
        );
        
        // Actualizar la imagen
        category.image = result.secure_url;
        
        // Eliminar archivo temporal
        fs.unlinkSync(req.file.path);
      } catch (uploadError) {
        console.error("Error al procesar la imagen:", uploadError);
        return res.status(500).json({ 
          message: "Error al procesar la imagen" 
        });
      }
    }
    
    // Actualizar los campos de la categoría
    if (name) category.name = name;
    if (description !== undefined) category.description = description;
    if (parent !== undefined) category.parent = parent || null;
    if (isActive !== undefined) category.isActive = isActive;
    if (showOnHomepage !== undefined) category.showOnHomepage = showOnHomepage;
    if (order !== undefined) category.order = order;
    
    await category.save();
    
    res.status(200).json({
      message: "Categoría actualizada exitosamente",
      category
    });
  } catch (error) {
    // Limpiar archivo temporal en caso de error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    console.error("Error al actualizar categoría:", error);
    res.status(500).json({ message: "Error al actualizar categoría", error: error.message });
  }
};

/**
 * Elimina una categoría
 * 
 * Solo permite eliminar si la categoría no tiene subcategorías ni productos asociados.
 */
categoryController.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: "Categoría no encontrada" });
    }
    
    // Verificar si la categoría tiene subcategorías
    const hasSubcategories = await Category.exists({ parent: id });
    if (hasSubcategories) {
      return res.status(400).json({ 
        message: "No se puede eliminar una categoría con subcategorías. Elimina o reasigna las subcategorías primero." 
      });
    }
    
    // Verificar si hay productos asociados a esta categoría
    try {
      const hasProducts = await Product.exists({ category: id });
      if (hasProducts) {
        return res.status(400).json({ 
          message: "No se puede eliminar una categoría con productos asociados. Reasigna o elimina los productos primero." 
        });
      }
    } catch (err) {
      console.log("Modelo Product no disponible o error:", err.message);
      // Continuar sin verificar productos
    }
    
    // Eliminar la imagen de Cloudinary si existe
    if (category.image) {
      try {
        // Extraer el public_id de la URL
        const urlParts = category.image.split('/');
        const filename = urlParts[urlParts.length - 1];
        const publicId = `diambars/categories/${filename.split('.')[0]}`;
        
        await cloudinary.uploader.destroy(publicId);
      } catch (cloudinaryError) {
        console.error("Error al eliminar imagen de Cloudinary:", cloudinaryError);
        // Continuamos con la eliminación de la categoría incluso si falla la eliminación de la imagen
      }
    }
    
    // Eliminar la categoría
    await Category.findByIdAndDelete(id);
    
    res.status(200).json({
      message: "Categoría eliminada exitosamente"
    });
  } catch (error) {
    console.error("Error al eliminar categoría:", error);
    res.status(500).json({ message: "Error al eliminar categoría", error: error.message });
  }
};

/**
 * Busca categorías por nombre
 * 
 * Útil para búsquedas en el frontend, devuelve hasta 10 resultados.
 */
categoryController.searchCategories = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({ message: "Se requiere un término de búsqueda" });
    }
    
    const categories = await Category.find({
      name: { $regex: q, $options: 'i' }
    }).sort({ order: 1, name: 1 }).limit(10);
    
    res.status(200).json({ categories });
  } catch (error) {
    console.error("Error al buscar categorías:", error);
    res.status(500).json({ message: "Error al buscar categorías", error: error.message });
  }
};

/**
 * Obtiene categorías para mostrar en la página principal
 * 
 * Devuelve solo categorías activas y marcadas para mostrar en homepage.
 */
categoryController.getHomepageCategories = async (req, res) => {
  try {
    const categories = await Category.find({ 
      isActive: true, 
      showOnHomepage: true 
    }).sort({ order: 1, name: 1 });
    
    res.status(200).json({ categories });
  } catch (error) {
    console.error("Error al obtener categorías para página principal:", error);
    res.status(500).json({ message: "Error al obtener categorías para página principal", error: error.message });
  }
};

export default categoryController;