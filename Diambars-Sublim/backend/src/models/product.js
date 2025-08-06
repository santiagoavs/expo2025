import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'El nombre del producto es obligatorio'],
    trim: true,
    maxlength: [100, 'El nombre no puede exceder 100 caracteres']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'La descripción no puede exceder 500 caracteres']
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'La categoría es obligatoria']
  },
  basePrice: {
    type: Number,
    required: [true, 'El precio base es obligatorio'],
    min: [0, 'El precio no puede ser negativo']
  },
  productionTime: {
    type: Number,
    default: 3,
    min: [1, 'El tiempo de producción mínimo es 1 día']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  images: {
    main: {
      type: String,
      required: [true, 'La imagen principal es obligatoria']
    },
    additional: [{
      type: String
    }]
  },
  customizationAreas: [{
    name: {
      type: String,
      required: true
    },
    x: {
      type: Number,
      required: true
    },
    y: {
      type: Number,
      required: true
    },
    width: {
      type: Number,
      required: true
    },
    height: {
      type: Number,
      required: true
    },
    maxElements: {
      type: Number,
      default: 5
    }
  }],
  options: [{
    name: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['color', 'size', 'material', 'style'],
      required: true
    },
    values: [{
      name: String,
      value: String,
      additionalCost: {
        type: Number,
        default: 0
      }
    }]
  }],
  metadata: {
    featured: {
      type: Boolean,
      default: false
    },
    searchTags: [String],
    stats: {
      views: {
        type: Number,
        default: 0
      },
      designs: {
        type: Number,
        default: 0
      },
      orders: {
        type: Number,
        default: 0
      }
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Agregar el plugin de paginación
productSchema.plugin(mongoosePaginate);

// Índices para optimizar consultas
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ basePrice: 1 });

// Virtual para el conteo de diseños
productSchema.virtual('designCount', {
  ref: 'Design',
  localField: '_id',
  foreignField: 'product',
  count: true
});

export default mongoose.model('Product', productSchema);