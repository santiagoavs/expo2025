import Product from "../models/product.js";
import Variant from "../models/variant.js";
import cloudinary from "../utils/cloudinary.js";

const productDeleteController = {};

/**
 * Elimina un producto y todas sus variantes
 */
productDeleteController.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        message: "Producto no encontrado",
      });
    }

    // Eliminar imagen principal si existe
    if (product.mainImage) {
      await cloudinary.deleteImage(product.mainImage, "diambars/products");
    }

    // Obtener todas las variantes
    const variants = await Variant.find({ product: id });

    // Eliminar imágenes de variantes
    for (const variant of variants) {
      if (variant.image) {
        await cloudinary.deleteImage(variant.image, "diambars/variants");
      }
    }

    // Eliminar variantes
    await Variant.deleteMany({ product: id });

    // Eliminar producto
    await Product.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Producto y sus variantes eliminados exitosamente",
    });
  } catch (error) {
    console.error("Error al eliminar producto:", error);
    res.status(500).json({
      message: "Error al eliminar el producto",
      error: error.message,
    });
  }
};

export default productDeleteController;