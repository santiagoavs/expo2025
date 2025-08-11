import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

// Esquema para elementos del diseño optimizado para Konva
const designElementSchema = new mongoose.Schema({
  type: { 
    type: String, 
    enum: ['text', 'image', 'shape', 'path', 'group'], 
    required: [true, 'El tipo de elemento es obligatorio']
  },
  areaId: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: [true, 'El área de personalización es obligatoria'],
    validate: {
      validator: function(v) {
        return mongoose.Types.ObjectId.isValid(v);
      },
      message: 'ID de área inválido'
    }
  },
  // Configuración Konva completa
  konvaAttrs: {
    // Posición y transformación
    x: { 
      type: Number, 
      required: [true, 'La posición X es obligatoria'],
      default: 0 
    },
    y: { 
      type: Number, 
      required: [true, 'La posición Y es obligatoria'],
      default: 0 
    },
    width: { type: Number },
    height: { type: Number },
    rotation: { 
      type: Number, 
      default: 0,
      min: [-360, 'La rotación mínima es -360°'],
      max: [360, 'La rotación máxima es 360°']
    },
    scaleX: { 
      type: Number, 
      default: 1,
      min: [0.1, 'La escala mínima es 0.1'],
      max: [10, 'La escala máxima es 10']
    },
    scaleY: { 
      type: Number, 
      default: 1,
      min: [0.1, 'La escala mínima es 0.1'],
      max: [10, 'La escala máxima es 10']
    },
    skewX: { type: Number, default: 0 },
    skewY: { type: Number, default: 0 },
    offsetX: { type: Number, default: 0 },
    offsetY: { type: Number, default: 0 },
    
    // Propiedades visuales
    opacity: { 
      type: Number, 
      default: 1,
      min: [0, 'La opacidad mínima es 0'],
      max: [1, 'La opacidad máxima es 1']
    },
    visible: { type: Boolean, default: true },
    listening: { type: Boolean, default: true },
    draggable: { type: Boolean, default: false },
    
    // Propiedades específicas por tipo
    // Para texto
    text: { 
      type: String,
      maxlength: [50, 'El texto no puede exceder 50 caracteres']
    },
    fontFamily: { 
      type: String, 
      default: 'Arial',
      enum: ['Arial', 'Helvetica', 'Times New Roman', 'Courier New', 'Georgia', 
             'Verdana', 'Comic Sans MS', 'Impact', 'Trebuchet MS', 'Tahoma']
    },
    fontSize: { 
      type: Number, 
      default: 16,
      min: [8, 'El tamaño mínimo de fuente es 8'],
      max: [200, 'El tamaño máximo de fuente es 200']
    },
    fontStyle: { 
      type: String,
      enum: ['normal', 'italic', 'bold', 'bold italic'],
      default: 'normal'
    },
    textDecoration: { 
      type: String,
      enum: ['', 'underline', 'line-through', 'overline'],
      default: ''
    },
    align: { 
      type: String,
      enum: ['left', 'center', 'right', 'justify'],
      default: 'left'
    },
    verticalAlign: {
      type: String,
      enum: ['top', 'middle', 'bottom'],
      default: 'top'
    },
    padding: { type: Number, default: 0 },
    lineHeight: { type: Number, default: 1 },
    letterSpacing: { type: Number, default: 0 },
    wrap: {
      type: String,
      enum: ['word', 'char', 'none'],
      default: 'word'
    },
    ellipsis: { type: Boolean, default: false },
    
    // Para imagen
    image: { type: String }, // URL o base64
    crop: {
      x: { type: Number, default: 0 },
      y: { type: Number, default: 0 },
      width: { type: Number },
      height: { type: Number }
    },
    
    // Colores y bordes
    fill: { type: String }, // Color de relleno
    fillPatternImage: { type: String }, // URL de patrón
    fillPatternScale: {
      x: { type: Number, default: 1 },
      y: { type: Number, default: 1 }
    },
    fillPatternRotation: { type: Number, default: 0 },
    fillPatternOffset: {
      x: { type: Number, default: 0 },
      y: { type: Number, default: 0 }
    },
    fillLinearGradientStartPoint: {
      x: { type: Number },
      y: { type: Number }
    },
    fillLinearGradientEndPoint: {
      x: { type: Number },
      y: { type: Number }
    },
    fillLinearGradientColorStops: [Number],
    fillRadialGradientStartPoint: {
      x: { type: Number },
      y: { type: Number }
    },
    fillRadialGradientEndPoint: {
      x: { type: Number },
      y: { type: Number }
    },
    fillRadialGradientColorStops: [Number],
    fillRadialGradientStartRadius: { type: Number },
    fillRadialGradientEndRadius: { type: Number },
    
    stroke: { type: String }, // Color del borde
    strokeWidth: { 
      type: Number, 
      default: 0,
      min: [0, 'El ancho del borde no puede ser negativo'],
      max: [50, 'El ancho máximo del borde es 50']
    },
    strokeScaleEnabled: { type: Boolean, default: true },
    dash: [Number],
    dashOffset: { type: Number, default: 0 },
    lineJoin: {
      type: String,
      enum: ['miter', 'round', 'bevel'],
      default: 'miter'
    },
    lineCap: {
      type: String,
      enum: ['butt', 'round', 'square'],
      default: 'butt'
    },
    
    // Sombras
    shadowColor: { type: String },
    shadowBlur: { type: Number, default: 0 },
    shadowOffset: {
      x: { type: Number, default: 0 },
      y: { type: Number, default: 0 }
    },
    shadowOpacity: { 
      type: Number, 
      default: 1,
      min: 0,
      max: 1
    },
    shadowEnabled: { type: Boolean, default: false },
    
    // Filtros
    filters: [{ 
      type: String,
      enum: ['blur', 'brighten', 'contrast', 'grayscale', 'hue', 'invert', 
             'pixelate', 'posterize', 'sepia', 'solarize', 'threshold']
    }],
    blurRadius: { type: Number, default: 10 },
    brightness: { type: Number, default: 0 },
    contrast: { type: Number, default: 0 },
    hue: { type: Number, default: 0 },
    saturation: { type: Number, default: 0 },
    luminance: { type: Number, default: 0 },
    pixelSize: { type: Number, default: 8 },
    levels: { type: Number, default: 0.5 },
    threshold: { type: Number, default: 0.5 },
    
    // Otros
    cornerRadius: { type: Number, default: 0 },
    id: { type: String }, // ID único para Konva
    name: { type: String }, // Nombre para selección
    perfectDrawEnabled: { type: Boolean, default: true },
    globalCompositeOperation: {
      type: String,
      enum: ['source-over', 'source-in', 'source-out', 'source-atop',
             'destination-over', 'destination-in', 'destination-out', 'destination-atop',
             'lighter', 'copy', 'xor', 'multiply', 'screen', 'overlay', 'darken',
             'lighten', 'color-dodge', 'color-burn', 'hard-light', 'soft-light',
             'difference', 'exclusion', 'hue', 'saturation', 'color', 'luminosity'],
      default: 'source-over'
    }
  },
  
  // Datos adicionales no-Konva
  metadata: {
    originalFileName: String,
    fileSize: Number,
    mimeType: String,
    uploadedAt: Date,
    source: {
      type: String,
      enum: ['upload', 'url', 'library', 'generated'],
      default: 'upload'
    },
    tags: [String],
    userNotes: String
  },
  
  isLocked: { 
    type: Boolean, 
    default: false 
  },
  zIndex: { 
    type: Number, 
    default: 1,
    min: [0, 'El z-index no puede ser negativo']
  }
}, { _id: true, timestamps: true });

// Esquema principal de diseño
const designSchema = new mongoose.Schema({
  product: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Product', 
    required: [true, 'El producto es obligatorio'],
    immutable: true // No se puede cambiar una vez creado
  },
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: [true, 'El usuario es obligatorio'],
    immutable: true
  },
  name: {
    type: String,
    default: "Diseño personalizado",
    trim: true,
    maxlength: [100, 'El nombre no puede exceder 100 caracteres']
  },
  elements: {
    type: [designElementSchema],
    validate: {
      validator: function(v) {
        return v && v.length > 0;
      },
      message: 'Debe incluir al menos un elemento en el diseño'
    }
  },
  productOptions: [{
    name: { 
      type: String, 
      required: [true, 'El nombre de la opción es obligatorio']
    },
    value: { 
      type: String, 
      required: [true, 'El valor de la opción es obligatorio']
    },
    additionalPrice: { 
      type: Number, 
      default: 0,
      min: 0
    }
  }],
  status: { 
    type: String, 
    enum: ['draft', 'pending', 'quoted', 'approved', 'rejected', 'completed', 'archived'],
    default: 'pending',
    index: true
  },
  previewImage: { 
    type: String,
    validate: {
      validator: function(v) {
        if (!v) return true;
        return /^(https?:\/\/|data:image\/)/.test(v);
      },
      message: 'URL de imagen inválida'
    }
  },
  konvaJSON: { 
    type: String // Almacenar el stage completo serializado para recuperación rápida
  },
  price: { 
    type: Number,
    min: [0, 'El precio no puede ser negativo'],
    validate: {
      validator: function(v) {
        // Solo requerido si el estado es 'quoted' o posterior
        if (['quoted', 'approved', 'completed'].includes(this.status)) {
          return v != null && v > 0;
        }
        return true;
      },
      message: 'El precio es obligatorio para diseños cotizados'
    }
  },
  productionDays: { 
    type: Number,
    min: [1, 'El tiempo mínimo de producción es 1 día'],
    max: [30, 'El tiempo máximo de producción es 30 días']
  },
  clientNotes: { 
    type: String,
    maxlength: [500, 'Las notas no pueden exceder 500 caracteres']
  },
  adminNotes: { 
    type: String,
    maxlength: [500, 'Las notas no pueden exceder 500 caracteres']
  },
  quotedAt: { 
    type: Date,
    validate: {
      validator: function(v) {
        if (!v) return true;
        return v >= this.createdAt;
      },
      message: 'La fecha de cotización no puede ser anterior a la creación'
    }
  },
  approvedAt: { 
    type: Date,
    validate: {
      validator: function(v) {
        if (!v) return true;
        return v >= this.quotedAt || v >= this.createdAt;
      },
      message: 'La fecha de aprobación no puede ser anterior a la cotización'
    }
  },
  rejectedAt: { 
    type: Date 
  },
  rejectionReason: { 
    type: String,
    maxlength: [500, 'El motivo de rechazo no puede exceder 500 caracteres']
  },
  completedAt: {
    type: Date
  },
  // Historial de cambios
  history: [{
    action: {
      type: String,
      enum: ['created', 'updated', 'status_changed', 'quoted', 'approved', 'rejected'],
      required: true
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'history.changedByModel',
      required: true
    },
    changedByModel: {
      type: String,
      enum: ['User', 'Employee'],
      required: true
    },
    previousStatus: String,
    newStatus: String,
    changes: mongoose.Schema.Types.Mixed,
    timestamp: {
      type: Date,
      default: Date.now
    },
    notes: String
  }],
  metadata: {
    mode: { 
      type: String, 
      enum: ['simple', 'advanced'], 
      default: 'simple' 
    },
    colors: [{
      type: String,
      validate: {
        validator: function(v) {
          return /^#[0-9A-F]{6}$/i.test(v) || /^rgb/.test(v) || /^hsl/.test(v);
        },
        message: 'Formato de color inválido'
      }
    }],
    fonts: [{
      type: String,
      trim: true
    }],
    complexity: { 
      type: String, 
      enum: ['low', 'medium', 'high'], 
      default: 'medium' 
    },
    elementCount: {
      text: { type: Number, default: 0, min: 0 },
      image: { type: Number, default: 0, min: 0 },
      shape: { type: Number, default: 0, min: 0 },
      total: { type: Number, default: 0, min: 0 }
    },
    estimatedPrintArea: {
      width: Number,
      height: Number,
      units: {
        type: String,
        enum: ['px', 'cm', 'in'],
        default: 'cm'
      }
    },
    renderTime: Number, // Tiempo en ms para renderizar
    fileSize: Number // Tamaño estimado en bytes
  },
  // Validación y aprobación
  validation: {
    isValid: {
      type: Boolean,
      default: false
    },
    errors: [{
      field: String,
      message: String,
      severity: {
        type: String,
        enum: ['error', 'warning', 'info'],
        default: 'error'
      }
    }],
    warnings: [String],
    checkedAt: Date,
    checkedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee'
    }
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Agregar plugin de paginación
designSchema.plugin(mongoosePaginate);

// Índices para búsquedas eficientes
designSchema.index({ user: 1, createdAt: -1 });
designSchema.index({ product: 1, status: 1 });
designSchema.index({ status: 1, createdAt: -1 });
designSchema.index({ 'metadata.complexity': 1 });
designSchema.index({ price: 1 });
designSchema.index({ quotedAt: 1 });

// Virtuals
designSchema.virtual('order', {
  ref: 'Order',
  localField: '_id',
  foreignField: 'items.design',
  justOne: true
});

designSchema.virtual('totalPrice').get(function() {
  if (!this.price) return 0;
  
  let total = this.price;
  if (this.productOptions && this.productOptions.length > 0) {
    const additionalCosts = this.productOptions.reduce((sum, opt) => {
      return sum + (opt.additionalPrice || 0);
    }, 0);
    total += additionalCosts;
  }
  
  return Math.round(total * 100) / 100;
});

designSchema.virtual('isEditable').get(function() {
  return ['draft', 'pending'].includes(this.status);
});

// Hooks
designSchema.pre('save', async function(next) {
  console.log('🎨 Design pre-save hook:', {
    isNew: this.isNew,
    status: this.status,
    elements: this.elements?.length,
    user: this.user
  });
  
  // Calcular metadata de elementos
  if (this.elements && this.elements.length > 0) {
    const counts = {
      text: 0,
      image: 0,
      shape: 0,
      total: this.elements.length
    };
    
    const colors = new Set();
    const fonts = new Set();
    
    this.elements.forEach(el => {
      counts[el.type] = (counts[el.type] || 0) + 1;
      
      if (el.konvaAttrs) {
        if (el.konvaAttrs.fill) colors.add(el.konvaAttrs.fill);
        if (el.konvaAttrs.stroke) colors.add(el.konvaAttrs.stroke);
        if (el.konvaAttrs.fontFamily) fonts.add(el.konvaAttrs.fontFamily);
      }
    });
    
    this.metadata.elementCount = counts;
    this.metadata.colors = Array.from(colors);
    this.metadata.fonts = Array.from(fonts);
    
    // Calcular complejidad
    if (counts.total <= 3) {
      this.metadata.complexity = 'low';
    } else if (counts.total <= 8) {
      this.metadata.complexity = 'medium';
    } else {
      this.metadata.complexity = 'high';
    }
  }
  
  // Registrar en historial si hay cambios de estado
  if (!this.isNew && this.isModified('status')) {
    const previousStatus = this._original?.status || 'unknown';
    this.history.push({
      action: 'status_changed',
      changedBy: this._changedBy || this.user,
      changedByModel: this._changedByModel || 'User',
      previousStatus,
      newStatus: this.status,
      timestamp: new Date(),
      notes: `Estado cambiado de ${previousStatus} a ${this.status}`
    });
  }
  
  next();
});

designSchema.pre('validate', function(next) {
  console.log('🔍 Design validation:', {
    id: this._id,
    elementsCount: this.elements?.length,
    status: this.status
  });
  
  // Validar que los elementos estén dentro de las áreas permitidas
  if (this.isNew || this.isModified('elements')) {
    this.validation.errors = [];
    this.validation.isValid = true;
    
    if (!this.elements || this.elements.length === 0) {
      this.validation.errors.push({
        field: 'elements',
        message: 'El diseño debe tener al menos un elemento',
        severity: 'error'
      });
      this.validation.isValid = false;
    }
  }
  
  next();
});

// Métodos de instancia
designSchema.methods.calculatePreviewDimensions = function() {
  if (!this.elements || this.elements.length === 0) {
    return { width: 800, height: 600 };
  }
  
  let minX = Infinity, minY = Infinity;
  let maxX = -Infinity, maxY = -Infinity;
  
  this.elements.forEach(el => {
    if (el.konvaAttrs) {
      const x = el.konvaAttrs.x || 0;
      const y = el.konvaAttrs.y || 0;
      const width = el.konvaAttrs.width || 100;
      const height = el.konvaAttrs.height || 100;
      
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x + width);
      maxY = Math.max(maxY, y + height);
    }
  });
  
  return {
    width: Math.max(800, maxX - minX + 100),
    height: Math.max(600, maxY - minY + 100)
  };
};

designSchema.methods.toKonvaJSON = function() {
  const dimensions = this.calculatePreviewDimensions();
  
  return {
    attrs: {
      width: dimensions.width,
      height: dimensions.height
    },
    className: 'Stage',
    children: [{
      attrs: {},
      className: 'Layer',
      children: this.elements.map(el => ({
        attrs: el.konvaAttrs,
        className: el.type === 'text' ? 'Text' : el.type === 'image' ? 'Image' : 'Rect'
      }))
    }]
  };
};

designSchema.methods.validateAgainstProduct = async function(product) {
  const errors = [];
  
  if (!product) {
    errors.push('Producto no encontrado');
    return { isValid: false, errors };
  }
  
  // Validar que todos los elementos estén en áreas válidas
  for (const element of this.elements) {
    const area = product.customizationAreas.id(element.areaId);
    
    if (!area) {
      errors.push(`Área ${element.areaId} no existe en el producto`);
      continue;
    }
    
    // Validar tipo de elemento permitido en el área
    if (element.type === 'text' && !area.accepts.text) {
      errors.push(`El área ${area.name} no acepta texto`);
    }
    
    if (element.type === 'image' && !area.accepts.image) {
      errors.push(`El área ${area.name} no acepta imágenes`);
    }
    
    // Validar posición dentro del área
    const pos = element.konvaAttrs;
    const areaPos = area.position;
    
    if (pos.x < areaPos.x || pos.y < areaPos.y ||
        pos.x + (pos.width || 0) > areaPos.x + areaPos.width ||
        pos.y + (pos.height || 0) > areaPos.y + areaPos.height) {
      errors.push(`Elemento fuera de los límites del área ${area.name}`);
    }
  }
  
  // Validar opciones del producto
  for (const option of this.productOptions) {
    const productOption = product.options.find(o => o.name === option.name);
    
    if (!productOption) {
      errors.push(`Opción ${option.name} no existe en el producto`);
      continue;
    }
    
    const validValue = productOption.values.find(v => v.value === option.value);
    if (!validValue) {
      errors.push(`Valor ${option.value} no válido para opción ${option.name}`);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Método para clonar diseño
designSchema.methods.cloneDesign = function(newUserId) {
  const cloned = this.toObject();
  delete cloned._id;
  delete cloned.createdAt;
  delete cloned.updatedAt;
  
  cloned.user = newUserId || this.user;
  cloned.name = `${this.name} (Copia)`;
  cloned.status = 'draft';
  cloned.history = [{
    action: 'created',
    changedBy: newUserId || this.user,
    changedByModel: 'User',
    timestamp: new Date(),
    notes: `Clonado desde diseño ${this._id}`
  }];
  
  return cloned;
};

export default mongoose.model('Design', designSchema);