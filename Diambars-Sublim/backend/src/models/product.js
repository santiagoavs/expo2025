import mongoose from "mongoose";

/**
 * Schema para productos base en el sistema de Diambars
 */
const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "El nombre del producto es obligatorio"],
      trim: true,
      unique: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "La categoría es obligatoria"],
    },
    attributes: [
      {
        name: {
          type: String,
          required: true,
        },
        options: [
          {
            name: {
              type: String,
              required: true,
            },
          },
        ],
      },
    ],
    mainImage: {
      type: String,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

/**
 * Middleware para generar automáticamente un slug a partir del nombre
 */
productSchema.pre("save", function (next) {
  if (this.isModified("name") || this.isNew) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^\w\s]/gi, "")
      .replace(/\s+/g, "-");
  }
  next();
});

const Product = mongoose.model("Product", productSchema);

export default Product;