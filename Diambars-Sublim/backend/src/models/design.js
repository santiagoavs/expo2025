import mongoose from 'mongoose';

// Esquema para elementos del diseño (texto, imágenes)
const designElementSchema = new mongoose.Schema({
  type: { 
    type: String, 
    enum: ['text', 'image'], 
    required: true 
  },
  content: { 
    type: String, 
    required: true 
    // Para texto: el texto mismo
    // Para imágenes: URL o referencia al archivo
  },
  areaId: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true 
    // ID del área de personalización donde está este elemento
  },
  position: {
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    width: { type: Number },
    height: { type: Number },
    rotation: { type: Number, default: 0 },
    scaleX: { type: Number, default: 1 },
    scaleY: { type: Number, default: 1 },
    zIndex: { type: Number, default: 1 }
  },
  styles: {
    // Estilos generales
    opacity: { type: Number, default: 1 },
    
    // Para texto
    fontFamily: { type: String },
    fontSize: { type: Number },
    fontWeight: { type: String },
    fontStyle: { type: String },
    textDecoration: { type: String },
    lineHeight: { type: Number },
    textAlign: { type: String },
    fill: { type: String }, // Color del texto
    stroke: { type: String }, // Borde del texto
    strokeWidth: { type: Number },
    
    // Para imágenes
    cornerRadius: { type: Number },
    filters: [{ type: String }]
  },
  isLocked: { 
    type: Boolean, 
    default: false 
  },
  metadata: { 
    type: mongoose.Schema.Types.Mixed 
  }
}, { _id: true });

// Esquema principal de diseño
const designSchema = new mongoose.Schema({
  product: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Product', 
    required: true 
  },
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  name: {
    type: String,
    default: "Diseño personalizado"
  },
  elements: [designElementSchema],
  productOptions: [{
    name: { type: String, required: true }, // Ej: "color", "size"
    value: { type: String, required: true }  // Ej: "rojo", "L"
  }],
  status: { 
    type: String, 
    enum: ['draft', 'pending', 'quoted', 'approved', 'rejected', 'completed'],
    default: 'draft'
  },
  previewImage: { 
    type: String 
    // URL de la vista previa del diseño
  },
  price: { 
    type: Number,
    min: 0
  },
  productionDays: { 
    type: Number 
  },
  clientNotes: { 
    type: String 
  },
  adminNotes: { 
    type: String 
  },
  quotedAt: { 
    type: Date 
  },
  approvedAt: { 
    type: Date 
  },
  rejectedAt: { 
    type: Date 
  },
  rejectionReason: { 
    type: String 
  },
  metadata: {
    mode: { 
      type: String, 
      enum: ['simple', 'advanced'], 
      default: 'simple' 
    },
    colors: [{ type: String }],
    fonts: [{ type: String }],
    complexity: { 
      type: String, 
      enum: ['low', 'medium', 'high'], 
      default: 'medium' 
    }
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Índices para búsquedas eficientes
designSchema.index({ user: 1, createdAt: -1 });
designSchema.index({ product: 1, status: 1 });
designSchema.index({ status: 1, createdAt: -1 });

// Virtuals
designSchema.virtual('order', {
  ref: 'Order',
  localField: '_id',
  foreignField: 'items.design',
  justOne: true
});

// Métodos
designSchema.methods.calculatePreviewDimensions = function() {
  // Lógica para calcular dimensiones óptimas para la previsualización
};

export default mongoose.model('Design', designSchema);