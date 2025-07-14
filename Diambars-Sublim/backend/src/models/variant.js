import mongoose from "mongoose";

/**
 * Schema para variantes de productos
 */
const variantSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    // Combinación de atributos (ej: {color: "Rojo", material: "Cerámica"})
    attributes: {
      type: Map,
      of: String,
      required: true,
    },
    image: {
      type: String,
      default: "",
    },
    stock: {
      type: Number,
      default: 0,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

/**
 * Índice compuesto para evitar duplicados de la misma combinación de atributos para un producto
 */
variantSchema.index({ product: 1, "attributes": 1 }, { unique: true });

const Variant = mongoose.model("Variant", variantSchema);

export default Variant;