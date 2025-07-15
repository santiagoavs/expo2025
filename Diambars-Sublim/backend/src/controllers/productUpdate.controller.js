import Product from "../models/product.js";
import Variant from "../models/variant.js";
import Category from "../models/category.js";
import cloudinary from "../utils/cloudinary.js";
import variantService from "../utils/variant.service.js";

const productUpdateController = {};

/**
 * Actualiza los datos de un producto existente.
 * Incluye validación de categoría, procesamiento de imagen,
 * actualización de atributos y variantes automáticas.
 */
productUpdateController.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      category,
      attributes,
      isActive,
    } = req.body;

    // Buscar el producto por ID
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        message: "Producto no encontrado",
      });
    }

    // Validar categoría (si se especificó)
    if (category) {
      const categoryExists = await Category.findById(category);
      if (!categoryExists) {
        return res.status(400).json({
          message: "La categoría especificada no existe",
        });
      }
    }

    // Procesar nueva imagen (si viene en la petición)
    if (req.file) {
      try {
        // Eliminar imagen anterior (si existe)
        if (product.mainImage) {
          await cloudinary.deleteImage(product.mainImage, "diambars/products");
        }

        // Subir nueva imagen
        product.mainImage = await cloudinary.uploadImage(
          req.file.path,
          "diambars/products"
        );
      } catch (uploadError) {
        return res.status(500).json({
          message: "Error al procesar la imagen",
          error: uploadError.message,
        });
      }
    }

    // Actualizar campos básicos del producto
    if (name) product.name = name;
    if (description !== undefined) product.description = description;
    if (category) product.category = category;
    if (isActive !== undefined) product.isActive = isActive;

    // Si se especifican nuevos atributos, generar variantes
    if (attributes) {
      let parsedAttributes;

      // Validar formato de atributos
      try {
        parsedAttributes = typeof attributes === 'string'
          ? JSON.parse(attributes)
          : attributes;

        if (!Array.isArray(parsedAttributes)) {
          throw new Error("Los atributos deben ser un array");
        }
      } catch (error) {
        return res.status(400).json({
          message: "Formato de atributos inválido",
          error: error.message,
        });
      }

      product.attributes = parsedAttributes;

      // Generar todas las combinaciones posibles de atributos
      const combinations = variantService.generateCombinations(parsedAttributes);

      // Obtener variantes existentes del producto
      const existingVariants = await Variant.find({ product: product._id });

      // Crear mapa de variantes existentes para comparación
      const existingVariantMap = new Map();
      existingVariants.forEach(variant => {
        const key = JSON.stringify(Object.fromEntries(variant.attributes));
        existingVariantMap.set(key, variant);
      });

      // Procesar cada combinación de atributos
      for (const combination of combinations) {
        const key = JSON.stringify(combination);

        if (existingVariantMap.has(key)) {
          // Si la combinación ya existe, marcar como procesada
          existingVariantMap.delete(key);
        } else {
          // Si es nueva, crear variante
          const newVariant = new Variant({
            product: product._id,
            attributes: combination,
            isActive: true,
          });

          await newVariant.save();
        }
      }

      // Las variantes que no se procesaron se desactivan
      for (const [, variant] of existingVariantMap) {
        variant.isActive = false;
        await variant.save();
      }
    }

    // Guardar cambios en producto
    await product.save();

    // Obtener variantes activas después de la actualización
    const updatedVariants = await Variant.find({
      product: product._id,
      isActive: true
    });

    res.status(200).json({
      success: true,
      message: "Producto actualizado exitosamente",
      data: {
        product,
        variants: updatedVariants,
      },
    });
  } catch (error) {
    console.error("Error al actualizar producto:", error);

    // Manejar error de nombre duplicado
    if (error.code === 11000) {
      return res.status(400).json({
        message: "Ya existe un producto con este nombre",
        error: error.message,
      });
    }

    res.status(500).json({
      message: "Error al actualizar el producto",
      error: error.message,
    });
  }
};

/**
 * Actualiza los datos de una variante específica.
 * Puede incluir stock, estado y nueva imagen.
 */
productUpdateController.updateVariant = async (req, res) => {
  try {
    const { id } = req.params;
    const { stock, isActive } = req.body;

    // Buscar variante por ID
    const variant = await Variant.findById(id);
    if (!variant) {
      return res.status(404).json({
        message: "Variante no encontrada",
      });
    }

    // Actualizar datos básicos
    if (stock !== undefined) variant.stock = Number(stock);
    if (isActive !== undefined) variant.isActive = isActive;

    // Procesar nueva imagen (si se proporciona)
    if (req.file) {
      try {
        // Eliminar imagen anterior (si existe)
        if (variant.image) {
          await cloudinary.deleteImage(variant.image, "diambars/variants");
        }

        // Subir nueva imagen
        variant.image = await cloudinary.uploadImage(
          req.file.path,
          "diambars/variants"
        );
      } catch (uploadError) {
        return res.status(500).json({
          message: "Error al procesar la imagen",
          error: uploadError.message,
        });
      }
    }

    // Guardar cambios en la variante
    await variant.save();

    res.status(200).json({
      success: true,
      message: "Variante actualizada exitosamente",
      data: {
        variant,
      },
    });
  } catch (error) {
    console.error("Error al actualizar variante:", error);
    res.status(500).json({
      message: "Error al actualizar la variante",
      error: error.message,
    });
  }
};

export default productUpdateController;
