import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'El nombre del producto es obligatorio'],
    trim: true,
    minlength: [3, 'El nombre debe tener al menos 3 caracteres'],
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
    required: [true, 'La categoría es obligatoria'],
    validate: {
      validator: async function(v) {
        const Category = mongoose.model('Category');
        const exists = await Category.findById(v);
        return exists && exists.isActive;
      },
      message: 'La categoría no existe o no está activa'
    }
  },
  basePrice: {
    type: Number,
    required: [true, 'El precio base es obligatorio'],
    min: [0, 'El precio no puede ser negativo'],
    validate: {
      validator: function(v) {
        return v > 0 && Number.isFinite(v);
      },
      message: 'El precio debe ser un número válido mayor que 0'
    }
  },
  productionTime: {
    type: Number,
    default: 3,
    min: [1, 'El tiempo de producción mínimo es 1 día'],
    max: [30, 'El tiempo de producción máximo es 30 días']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  images: {
    main: {
      type: String,
      required: [true, 'La imagen principal es obligatoria'],
      validate: {
        validator: function(v) {
          return /^(https?:\/\/|\/src\/|\/public\/)/.test(v);
        },
        message: 'La URL de la imagen no es válida'
      }
    },
    additional: [{
      type: String,
      validate: {
        validator: function(v) {
          return /^(https?:\/\/|\/src\/|\/public\/)/.test(v);
        },
        message: 'La URL de la imagen adicional no es válida'
      }
    }]
  },
  // ESTRUCTURA CORREGIDA PARA KONVA
  customizationAreas: [{
    name: {
      type: String,
      required: [true, 'El nombre del área es obligatorio'],
      trim: true
    },
    displayName: {
      type: String,
      required: [true, 'El nombre de visualización es obligatorio'],
      trim: true
    },
    position: {
      x: {
        type: Number,
        required: [true, 'La posición X es obligatoria'],
        min: [0, 'La posición X no puede ser negativa']
      },
      y: {
        type: Number,
        required: [true, 'La posición Y es obligatoria'],
        min: [0, 'La posición Y no puede ser negativa']
      },
      width: {
        type: Number,
        required: [true, 'El ancho es obligatorio'],
        min: [10, 'El ancho mínimo es 10px'],
        max: [1000, 'El ancho máximo es 1000px']
      },
      height: {
        type: Number,
        required: [true, 'La altura es obligatoria'],
        min: [10, 'La altura mínima es 10px'],
        max: [1000, 'La altura máxima es 1000px']
      },
      rotationDegree: {
        type: Number,
        default: 0,
        min: [-360, 'La rotación mínima es -360°'],
        max: [360, 'La rotación máxima es 360°']
      }
    },
    accepts: {
      text: {
        type: Boolean,
        default: true
      },
      image: {
        type: Boolean,
        default: true
      }
    },
    defaultPlacement: {
      type: String,
      enum: ['center', 'top-left', 'top-right', 'bottom-left', 'bottom-right'],
      default: 'center'
    },
    maxElements: {
      type: Number,
      default: 5,
      min: [1, 'Debe permitir al menos 1 elemento'],
      max: [20, 'El máximo de elementos es 20']
    },
    // Configuración específica para Konva
    konvaConfig: {
      strokeWidth: {
        type: Number,
        default: 2
      },
      strokeColor: {
        type: String,
        default: '#06AED5'
      },
      fillOpacity: {
        type: Number,
        default: 0.1,
        min: 0,
        max: 1
      },
      cornerRadius: {
        type: Number,
        default: 0
      },
      dash: [{
        type: Number
      }]
    }
  }],
  options: [{
    name: {
      type: String,
      required: [true, 'El nombre de la opción es obligatorio'],
      trim: true
    },
    label: {
      type: String,
      required: [true, 'La etiqueta de la opción es obligatoria'],
      trim: true
    },
    type: {
      type: String,
      enum: ['color', 'size', 'material', 'style', 'finish', 'quantity'],
      required: [true, 'El tipo de opción es obligatorio']
    },
    required: {
      type: Boolean,
      default: false
    },
    values: [{
      label: {
        type: String,
        required: [true, 'La etiqueta del valor es obligatoria']
      },
      value: {
        type: String,
        required: [true, 'El valor es obligatorio']
      },
      additionalPrice: {
        type: Number,
        default: 0,
        min: [0, 'El costo adicional no puede ser negativo']
      },
      inStock: {
        type: Boolean,
        default: true
      },
      metadata: {
        colorHex: String, // Para opciones de color
        dimensions: Object, // Para opciones de tamaño
        image: String // Para mostrar preview de la opción
      }
    }],
    metadata: {
      displayType: {
        type: String,
        enum: ['dropdown', 'buttons', 'color-picker', 'slider'],
        default: 'dropdown'
      },
      helpText: String
    }
  }],
  // Configuración para el editor Konva
  editorConfig: {
    stageWidth: {
      type: Number,
      default: 800,
      min: [400, 'El ancho mínimo del stage es 400px'],
      max: [2000, 'El ancho máximo del stage es 2000px']
    },
    stageHeight: {
      type: Number,
      default: 600,
      min: [300, 'La altura mínima del stage es 300px'],
      max: [2000, 'La altura máxima del stage es 2000px']
    },
    backgroundFill: {
      type: String,
      default: '#f8f9fa'
    },
    gridSize: {
      type: Number,
      default: 10
    },
    snapToGrid: {
      type: Boolean,
      default: true
    },
    showRulers: {
      type: Boolean,
      default: true
    },
    allowZoom: {
      type: Boolean,
      default: true
    },
    minZoom: {
      type: Number,
      default: 0.5
    },
    maxZoom: {
      type: Number,
      default: 3
    }
  },
  metadata: {
    featured: {
      type: Boolean,
      default: false
    },
    searchTags: [{
      type: String,
      trim: true,
      lowercase: true
    }],
    stats: {
      views: {
        type: Number,
        default: 0,
        min: 0
      },
      designs: {
        type: Number,
        default: 0,
        min: 0
      },
      orders: {
        type: Number,
        default: 0,
        min: 0
      },
      rating: {
        average: {
          type: Number,
          default: 0,
          min: 0,
          max: 5
        },
        count: {
          type: Number,
          default: 0,
          min: 0
        }
      }
    },
    seo: {
      metaTitle: {
        type: String,
        maxlength: 60
      },
      metaDescription: {
        type: String,
        maxlength: 160
      },
      slug: {
        type: String
        // REMOVIDO: unique: true, sparse: true <- Se define abajo en schema.index()
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

// ==================== ÍNDICES ÚNICOS (SIN DUPLICADOS) ====================
// Definir todos los índices aquí para evitar duplicados

// Índice de texto completo
productSchema.index({ 
  name: 'text', 
  description: 'text', 
  'metadata.searchTags': 'text' 
});

// Índices compuestos más específicos primero
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ 'metadata.featured': 1, isActive: 1 });

// Índices únicos
productSchema.index({ 'metadata.seo.slug': 1 }, { unique: true, sparse: true });

// Índices simples
productSchema.index({ createdAt: -1 });
productSchema.index({ basePrice: 1 });
productSchema.index({ 'metadata.stats.orders': -1 });
productSchema.index({ 'metadata.stats.rating.average': -1 });
productSchema.index({ isActive: 1 });

// Virtual para el conteo de diseños
productSchema.virtual('designCount', {
  ref: 'Design',
  localField: '_id',
  foreignField: 'product',
  count: true
});

// Virtual para disponibilidad
productSchema.virtual('availability').get(function() {
  if (!this.isActive) return 'unavailable';
  if (this.metadata?.stats?.orders > 50) return 'popular';
  return 'available';
});

// Hooks
productSchema.pre('save', function(next) {
  console.log('🔧 Product pre-save hook:', {
    isNew: this.isNew,
    name: this.name,
    areas: this.customizationAreas?.length,
    options: this.options?.length
  });
  
  // Validar que haya al menos un área de personalización
  if (!this.customizationAreas || this.customizationAreas.length === 0) {
    return next(new Error('Debe definir al menos un área de personalización'));
  }
  
  // Validar nombres únicos de áreas
  const areaNames = this.customizationAreas.map(a => a.name);
  const uniqueNames = new Set(areaNames);
  if (areaNames.length !== uniqueNames.size) {
    return next(new Error('Los nombres de las áreas deben ser únicos'));
  }
  
  // Generar slug si no existe
  if (!this.metadata.seo.slug && this.name) {
    this.metadata.seo.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      + '-' + Date.now();
  }
  
  next();
});

// Método para validar áreas superpuestas
productSchema.methods.validateAreaOverlap = function() {
  const areas = this.customizationAreas;
  for (let i = 0; i < areas.length; i++) {
    for (let j = i + 1; j < areas.length; j++) {
      const a1 = areas[i].position;
      const a2 = areas[j].position;
      
      // Verificar superposición
      if (!(a1.x + a1.width < a2.x || 
            a2.x + a2.width < a1.x || 
            a1.y + a1.height < a2.y || 
            a2.y + a2.height < a1.y)) {
        console.warn(`⚠️ Áreas superpuestas detectadas: ${areas[i].name} y ${areas[j].name}`);
        return false;
      }
    }
  }
  return true;
};

// Método para obtener configuración Konva
productSchema.methods.getKonvaStageConfig = function() {
  return {
    width: this.editorConfig.stageWidth,
    height: this.editorConfig.stageHeight,
    container: 'konva-container', // Se establecerá en el frontend
    draggable: false,
    style: {
      backgroundColor: this.editorConfig.backgroundFill
    }
  };
};

// Método para obtener configuración de área para Konva
productSchema.methods.getKonvaAreaConfig = function(areaId) {
  const area = this.customizationAreas.id(areaId);
  if (!area) return null;
  
  return {
    x: area.position.x,
    y: area.position.y,
    width: area.position.width,
    height: area.position.height,
    rotation: area.position.rotationDegree,
    stroke: area.konvaConfig.strokeColor,
    strokeWidth: area.konvaConfig.strokeWidth,
    fill: area.konvaConfig.strokeColor,
    opacity: area.konvaConfig.fillOpacity,
    cornerRadius: area.konvaConfig.cornerRadius,
    dash: area.konvaConfig.dash,
    name: `area-${area._id}`,
    id: area._id.toString(),
    listening: true,
    draggable: false
  };
};

export default mongoose.model('Product', productSchema);