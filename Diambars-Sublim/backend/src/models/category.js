import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "El nombre de la categoría es obligatorio"],
      trim: true,
      unique: true,
      maxlength: [100, "El nombre no puede exceder los 100 caracteres"],
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
      maxlength: [500, "La descripción no puede exceder los 500 caracteres"],
    },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },
    children: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    }],
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
      min: [0, "El orden no puede ser menor que 0"],
    },
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true } 
  }
);

// Middleware para slug
categorySchema.pre("save", function (next) {
  if (this.isModified("name") || this.isNew) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^\w\s]/gi, "")
      .replace(/\s+/g, "-");
  }
  next();
});

// Middleware para limpiar referencias al eliminar
categorySchema.pre("remove", async function(next) {
  // Eliminar de la lista de hijos del padre
  if (this.parent) {
    await Category.findByIdAndUpdate(this.parent, {
      $pull: { children: this._id }
    });
  }
  
  // Reasignar hijos a null (convertirlos en raíz)
  await Category.updateMany(
    { parent: this._id },
    { $set: { parent: null } }
  );
  
  next();
});

const Category = mongoose.model("Category", categorySchema);

export default Category;