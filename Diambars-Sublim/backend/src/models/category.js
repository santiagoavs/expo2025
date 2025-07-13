import mongoose from "mongoose";

/**
 * Esquema de Categoría
 * 
 * Define la estructura y validación para categorías de productos en la tienda.
 * Soporta una estructura jerárquica donde las categorías pueden tener subcategorías.
 */
const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "El nombre de la categoría es obligatorio"],
      trim: true,
      unique: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      index: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },
    image: {
      type: String,
      required: [true, "La imagen de la categoría es obligatoria"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    showOnHomepage: {
      type: Boolean,
      default: false,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

/**
 * Middleware para generar automáticamente un slug a partir del nombre
 * Se ejecuta antes de guardar una categoría nueva o actualizar el nombre
 */
categorySchema.pre("save", function (next) {
  // Generar slug solo si el nombre ha cambiado o es nuevo
  if (this.isModified("name") || this.isNew) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^\w\s]/gi, "") // Eliminar caracteres especiales
      .replace(/\s+/g, "-");    // Reemplazar espacios con guiones
  }
  next();
});

const Category = mongoose.model("Category", categorySchema);

export default Category;