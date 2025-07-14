import productCreateController from "./productCreate.controller.js";
import productUpdateController from "./productUpdate.controller.js";
import productDeleteController from "./productDelete.controller.js";

/**
 * Controlador unificado para productos
 */
const productController = {
  // Métodos de creación y consulta
  createProduct: productCreateController.createProduct,
  getAllProducts: productCreateController.getAllProducts,
  getProductById: productCreateController.getProductById,
  
  // Métodos de actualización
  updateProduct: productUpdateController.updateProduct,
  updateVariant: productUpdateController.updateVariant,
  
  // Métodos de eliminación
  deleteProduct: productDeleteController.deleteProduct,
};

export default productController;