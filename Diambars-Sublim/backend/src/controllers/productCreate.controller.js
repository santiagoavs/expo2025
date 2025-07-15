import Product from "../models/product.js";
import Variant from "../models/variant.js";
import Category from "../models/category.js";
import cloudinary from "../utils/cloudinary.js";
import variantService from "../utils/variant.service.js";

const productCreateController = {};

/**
 * Crea un nuevo producto con sus variantes
 */
productCreateController.createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      attributes,
      isActive,
    } = req.body;

    // Validaciones básicas
    if (!name || !category) {
      return res.status(400).json({
        message: "El nombre y categoría son obligatorios",
      });
    }

    // Validar que la categoría existe
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(400).json({
        message: "La categoría especificada no existe",
      });
    }

    // Validar los atributos si se proporcionan
    let parsedAttributes = [];
    if (attributes) {
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
    }

    // Procesar imagen principal si se proporciona
    let mainImageUrl = "";
    if (req.file) {
      try {
        mainImageUrl = await cloudinary.uploadImage(
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

    // Crear el producto
    const newProduct = new Product({
      name,
      description,
      category,
      attributes: parsedAttributes,
      mainImage: mainImageUrl,
      isActive: isActive !== undefined ? isActive : true,
    });

    await newProduct.save();

    // Generar variantes si hay atributos definidos
    const variants = [];
    if (parsedAttributes && parsedAttributes.length > 0) {
      const combinations = variantService.generateCombinations(parsedAttributes);

      for (const combination of combinations) {
        const variant = new Variant({
          product: newProduct._id,
          attributes: combination,
          isActive: true,
        });

        await variant.save();
        variants.push(variant);
      }
    }

    res.status(201).json({
      success: true,
      message: "Producto creado exitosamente",
      data: {
        product: newProduct,
        variants: variants,
      },
    });
  } catch (error) {
    console.error("Error al crear producto:", error);

    if (error.code === 11000) {
      return res.status(400).json({
        message: "Ya existe un producto con este nombre",
        error: error.message,
      });
    }

    res.status(500).json({
      message: "Error al crear el producto",
      error: error.message,
    });
  }
};

/**
 * Obtiene todos los productos con sus variantes
 */
productCreateController.getAllProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.category) filter.category = req.query.category;
    if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === 'true';

    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const products = await Product.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("category", "name");

    const total = await Product.countDocuments(filter);

    const productsWithVariants = await Promise.all(
      products.map(async (product) => {
        const variants = await Variant.find({ 
          product: product._id,
          isActive: true 
        });
        return {
          ...product.toObject(),
          variants,
        };
      })
    );

    res.status(200).json({
      success: true,
      data: {
        products: productsWithVariants,
        pagination: {
          total,
          page,
          pages: Math.ceil(total / limit),
          limit,
        },
      },
    });
  } catch (error) {
    console.error("Error al obtener productos:", error);
    res.status(500).json({
      message: "Error al obtener los productos",
      error: error.message,
    });
  }
};

/**
 * Obtiene un producto específico por su ID o slug
 */
productCreateController.getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const filter = mongoose.Types.ObjectId.isValid(id)
      ? { _id: id }
      : { slug: id };

    const product = await Product.findOne(filter)
      .populate("category", "name");

    if (!product) {
      return res.status(404).json({
        message: "Producto no encontrado",
      });
    }

    const variants = await Variant.find({ 
      product: product._id,
      isActive: true
    });

    res.status(200).json({
      success: true,
      data: {
        product: {
          ...product.toObject(),
          variants,
        },
      },
    });
  } catch (error) {
    console.error("Error al obtener producto:", error);
    res.status(500).json({
      message: "Error al obtener el producto",
      error: error.message,
    });
  }
};

export default productCreateController;
