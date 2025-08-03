import mongoose from 'mongoose';

// Esquema para opciones del producto (color, talla, etc.)
const productOptionSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    trim: true 
  },
  type: { 
    type: String, 
    required: true, 
    enum: ['color', 'size', 'style', 'material', 'other'],
    default: 'other' 
  },
  values: [{ 
    label: { type: String, required: true, trim: true },
    value: { type: String, required: true, trim: true }, 
    // Para colores, esto podría ser un código hexadecimal
    // Para tallas, podría ser S, M, L, etc.
    additionalPrice: { type: Number, default: 0 }, // Precio adicional por esta opción
    inStock: { type: Boolean, default: true },
    metadata: { type: mongoose.Schema.Types.Mixed }
  }],
  required: { 
    type: Boolean, 
    default: false 
  }
}, { _id: false });

// Esquema para áreas personalizables (donde se puede sublimar)
const customizationAreaSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    trim: true 
  },
  displayName: {
    type: String,
    required: true,
    trim: true
  },
  position: { 
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    width: { type: Number, required: true },
    height: { type: Number, required: true },
    // Posición relativa al producto base (porcentaje o valores absolutos)
    rotationDegree: { type: Number, default: 0 }
  },
  accepts: {
    text: { type: Boolean, default: true },
    image: { type: Boolean, default: true }
  },
  maxElements: { 
    type: Number, 
    default: 10 
  },
  defaultPlacement: {
    type: String,
    enum: ['center', 'top', 'bottom', 'left', 'right'],
    default: 'center'
  },
  // Limitaciones técnicas para esta área
  limitations: {
    minWidth: { type: Number },
    minHeight: { type: Number },
    maxWidth: { type: Number },
    maxHeight: { type: Number },
    allowedFileTypes: [{ type: String }]
  }
}, { _id: true });

// Esquema principal de producto
const productSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    trim: true,
    index: true
  },
  description: { 
    type: String,
    trim: true
  },
  sku: {
    type: String,
    trim: true,
    sparse: true
  },
  category: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Category',
    required: true,
    index: true
  },
  basePrice: { 
    type: Number, 
    required: true,
    min: 0
  },
  productionTime: { 
    type: Number, 
    default: 3,
    min: 1
  }, // Días estimados de producción
  isActive: { 
    type: Boolean, 
    default: true,
    index: true
  },
  images: {
    main: { type: String, required: true }, // URL de imagen principal
    additional: [{ type: String }] // URLs de imágenes adicionales
  },
  customizationAreas: [customizationAreaSchema], // Áreas donde se puede sublimar
  options: [productOptionSchema], // Opciones como color, talla, etc.
  metadata: {
    weight: { type: Number }, // Peso en gramos
    dimensions: {
      width: { type: Number },
      height: { type: Number },
      depth: { type: Number }
    },
    featured: { type: Boolean, default: false },
    searchTags: [{ type: String }],
    recommendedProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }]
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Índices para búsquedas eficientes
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ 'metadata.featured': 1, createdAt: -1 });

// Virtuals
productSchema.virtual('designCount', {
  ref: 'Design',
  localField: '_id',
  foreignField: 'product',
  count: true
});

productSchema.virtual('orderCount', {
  ref: 'Order',
  localField: '_id',
  foreignField: 'items.product',
  count: true
});

export default mongoose.model('Product', productSchema);