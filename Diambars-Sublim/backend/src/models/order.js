import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

// Esquema para elementos de dirección (embebido)
const addressSchema = new mongoose.Schema({
  label: { type: String, trim: true },
  recipient: { type: String, required: true, trim: true },
  phoneNumber: { type: String, required: true, trim: true },
  department: { type: String, required: true, trim: true },
  municipality: { type: String, required: true, trim: true },
  address: { type: String, required: true, trim: true },
  additionalDetails: { type: String, trim: true },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      default: [-89.2182, 13.6929] // San Salvador default
    }
  },
  isDefault: { type: Boolean, default: false }
}, { _id: false });

// Esquema para etapas de producción detalladas
const productionStageSchema = new mongoose.Schema({
  completed: { type: Boolean, default: false },
  completedAt: { type: Date },
  completedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
  },
  notes: { type: String },
  photoUrl: { type: String },
  estimatedDuration: { type: Number }, // En horas
  actualDuration: { type: Number } // En horas
}, { _id: false });

// Esquema mejorado para pagos con soporte Wompi
const paymentSchema = new mongoose.Schema({
  method: { 
    type: String,
    enum: ['cash', 'card', 'transfer', 'wompi'],
    required: true
  },
  status: { 
    type: String,
    enum: ['pending', 'processing', 'paid', 'failed', 'refunded', 'partially_refunded'],
    default: 'pending'
  },
  timing: {
    type: String,
    enum: ['on_delivery', 'advance'],
    default: 'on_delivery'
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'USD'
  },
  // Para pagos parciales (pedidos grandes)
  partialPayment: {
    enabled: { type: Boolean, default: false },
    advancePercentage: { type: Number, min: 0, max: 100 },
    advanceAmount: { type: Number, min: 0 },
    remainingAmount: { type: Number, min: 0 },
    advancePaid: { type: Boolean, default: false },
    advancePaidAt: { type: Date },
    remainingPaid: { type: Boolean, default: false },
    remainingPaidAt: { type: Date }
  },
  // Datos específicos de Wompi
  wompiData: {
    transactionId: String,
    paymentLinkId: String,
    paymentUrl: String,
    reference: String,
    signature: String,
    status: String,
    statusMessage: String,
    paymentMethod: String,
    lastFourDigits: String,
    cardBrand: String,
    completedAt: Date,
    expiresAt: Date
  },
  // Para pagos en efectivo
  cashPaymentDetails: {
    collectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee'
    },
    collectedAt: Date,
    receiptNumber: String,
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: [Number]
    },
    notes: String,
    photoUrl: String // Foto del recibo
  },
  // Intentos fallidos
  failedAttempts: [{
    attemptedAt: Date,
    reason: String,
    transactionId: String,
    errorCode: String
  }],
  // Reembolsos
  refunds: [{
    refundId: String,
    amount: Number,
    reason: String,
    status: String,
    requestedAt: Date,
    processedAt: Date,
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'refunds.requestedByModel'
    },
    requestedByModel: {
      type: String,
      enum: ['User', 'Employee']
    }
  }],
  paidAt: { type: Date },
  metadata: { type: mongoose.Schema.Types.Mixed }
}, { _id: false, timestamps: true });

// Esquema para elementos del pedido con tracking de producción
const orderItemSchema = new mongoose.Schema({
  product: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Product',
    required: true
  },
  design: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Design',
    required: true
  },
  options: [{
    name: { type: String, required: true },
    value: { type: String, required: true },
    additionalPrice: { type: Number, default: 0 }
  }],
  quantity: { 
    type: Number,
    required: true,
    min: 1,
    max: 100
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0
  },
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'in_production', 'ready', 'delivered'],
    default: 'pending'
  },
  // Estados detallados de producción
  productionStatus: {
    type: String,
    enum: ['not_started', 'sourcing', 'preparing', 'printing', 'sublimating', 'quality_check', 'packaging', 'completed'],
    default: 'not_started'
  },
  productionStages: {
    sourcing_product: productionStageSchema,
    preparing_materials: productionStageSchema,
    printing: productionStageSchema,
    sublimating: productionStageSchema,
    quality_check: productionStageSchema,
    packaging: productionStageSchema
  },
  productionProgress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  productionNotes: { type: String },
  readyAt: { type: Date }
}, { _id: true });

// Esquema para historial de estados
const orderStatusHistorySchema = new mongoose.Schema({
  status: {
    type: String,
    enum: [
      'pending_approval',
      'quoted',
      'approved',
      'rejected',
      'in_production',
      'ready_for_delivery',
      'delivered',
      'completed',
      'cancelled'
    ],
    required: true
  },
  previousStatus: String,
  changedBy: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'statusHistory.changedByModel'
  },
  changedByModel: {
    type: String,
    enum: ['User', 'Employee', 'System'],
    default: 'System'
  },
  notes: { type: String },
  timestamp: { type: Date, default: Date.now },
  metadata: mongoose.Schema.Types.Mixed
}, { _id: true });

// Esquema para fotos de producción
const productionPhotoSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true
  },
  publicId: String, // Cloudinary public ID
  stage: {
    type: String,
    enum: ['printing', 'sublimating', 'quality_check', 'final'],
    required: true
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
  },
  notes: String,
  clientApproved: {
    type: Boolean,
    default: false
  },
  clientResponse: {
    approved: Boolean,
    changeRequested: String,
    notes: String,
    respondedAt: Date
  }
}, { _id: true });

// Función para formatear respuesta de orden
const formatOrderForResponse = (order, includeDetails = false) => {
  if (!order) return null;
  
  // Datos básicos siempre incluidos
  const basicData = {
    _id: order._id,
    orderNumber: order.orderNumber,
    status: order.status,
    total: order.total,
    subtotal: order.subtotal,
    deliveryFee: order.deliveryFee,
    discounts: order.discounts,
    tax: order.tax,
    estimatedReadyDate: order.estimatedReadyDate,
    actualReadyDate: order.actualReadyDate,
    deliveredAt: order.deliveredAt,
    completedAt: order.completedAt,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    deliveryType: order.deliveryType,
    canReview: order.canReview,
    // Información básica de usuario (sin datos sensibles)
    user: order.user ? {
      _id: order.user._id || order.user,
      name: order.user.name,
      email: order.user.email
    } : order.user,
    // Información básica de items
    items: order.items?.map(item => ({
      _id: item._id,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      subtotal: item.subtotal,
      status: item.status,
      productionStatus: item.productionStatus,
      productionProgress: item.productionProgress,
      product: item.product,
      design: item.design,
      options: item.options
    })) || [],
    // Estado de pago (información básica)
    payment: {
      method: order.payment?.method,
      status: order.payment?.status,
      timing: order.payment?.timing,
      amount: order.payment?.amount,
      currency: order.payment?.currency
    }
  };

  // Si no se requieren detalles, retornar solo básicos
  if (!includeDetails) {
    return basicData;
  }

  // Agregar información detallada
  return {
    ...basicData,
    // Dirección completa
    deliveryAddress: order.deliveryAddress,
    meetupDetails: order.meetupDetails,
    // Pago completo (excluyendo datos sensibles de Wompi)
    payment: {
      ...order.payment?.toObject?.() || order.payment,
      wompiData: order.payment?.wompiData ? {
        transactionId: order.payment.wompiData.transactionId,
        reference: order.payment.wompiData.reference,
        status: order.payment.wompiData.status,
        statusMessage: order.payment.wompiData.statusMessage,
        paymentMethod: order.payment.wompiData.paymentMethod,
        lastFourDigits: order.payment.wompiData.lastFourDigits,
        cardBrand: order.payment.wompiData.cardBrand,
        completedAt: order.payment.wompiData.completedAt,
        expiresAt: order.payment.wompiData.expiresAt
        // No incluir signature ni otros datos sensibles
      } : undefined
    },
    // Items con detalles de producción
    items: order.items?.map(item => ({
      ...item.toObject?.() || item,
      productionStages: item.productionStages
    })) || [],
    // Historial de estados
    statusHistory: order.statusHistory,
    // Fotos de producción
    productionPhotos: order.productionPhotos,
    // Notas
    clientNotes: order.clientNotes,
    adminNotes: order.adminNotes,
    // Mensajes (últimos 10 para no sobrecargar)
    messages: order.messages?.slice(-10) || [],
    // Control de calidad
    qualityCheck: order.qualityCheck,
    // Review
    review: order.review,
    // Metadata (excluyendo datos sensibles)
    metadata: order.metadata ? {
      source: order.metadata.source,
      priority: order.metadata.priority,
      tags: order.metadata.tags,
      isLargeOrder: order.metadata.isLargeOrder,
      requiresAdvancePayment: order.metadata.requiresAdvancePayment,
      isRush: order.metadata.isRush,
      rushFee: order.metadata.rushFee
      // No incluir deviceInfo ni otros datos sensibles
    } : undefined,
    // Campos virtuales
    daysInProduction: order.daysInProduction,
    isOverdue: order.isOverdue,
    paymentPending: order.paymentPending,
    productionProgressPercentage: order.productionProgressPercentage
  };
};

// Esquema principal de orden - SIN ÍNDICES EN LOS CAMPOS
const orderSchema = new mongoose.Schema({
  // ✅ CAMPO LIMPIO - Sin unique, index, sparse - Todo se define en schema.index()
  orderNumber: {
    type: String
    // ❌ NO unique: true
    // ❌ NO sparse: true  
    // ❌ NO index: true
  },
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true
    // ❌ NO index: true
  },
  items: {
    type: [orderItemSchema],
    validate: {
      validator: function(v) {
        return v && v.length > 0;
      },
      message: 'El pedido debe tener al menos un item'
    }
  },
  status: {
    type: String,
    enum: [
      'pending_approval',
      'quoted', 
      'approved',
      'rejected',
      'in_production',
      'ready_for_delivery',
      'delivered',
      'completed',
      'cancelled'
    ],
    default: 'pending_approval'
    // ❌ NO index: true
  },
  statusHistory: [orderStatusHistorySchema],
  
  // Tipo y detalles de entrega
  deliveryType: {
    type: String,
    enum: ['meetup', 'delivery'],
    default: 'meetup',
    required: true
  },
  deliveryAddress: addressSchema,
  meetupDetails: {
    date: { type: Date },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number],
        default: [-89.2182, 13.6929]
      },
      address: { type: String },
      placeName: { type: String }
    },
    notes: { type: String },
    confirmed: { type: Boolean, default: false },
    confirmedAt: { type: Date }
  },
  
  // Información de pago
  payment: paymentSchema,
  
  // Cálculos de precio
  subtotal: { 
    type: Number,
    required: true,
    min: 0
  },
  discounts: {
    type: Number,
    default: 0,
    min: 0
  },
  discountCodes: [{
    code: String,
    amount: Number,
    percentage: Number,
    appliedAt: Date
  }],
  deliveryFee: {
    type: Number,
    default: 0,
    min: 0
  },
  tax: {
    type: Number,
    default: 0,
    min: 0
  },
  total: {
    type: Number,
    required: true,
    min: 0
  },
  
  // Fechas importantes
  estimatedReadyDate: {
    type: Date,
    required: true
  },
  actualReadyDate: {
    type: Date
  },
  deliveredAt: {
    type: Date
  },
  completedAt: {
    type: Date
  },
  cancelledAt: {
    type: Date
  },
  cancellationReason: {
    type: String
  },
  
  // Fotos de producción para aprobación del cliente
  productionPhotos: [productionPhotoSchema],
  
  // Notas y comunicación
  clientNotes: { 
    type: String,
    maxlength: 1000
  },
  adminNotes: { 
    type: String,
    maxlength: 1000
  },
  internalNotes: { 
    type: String,
    maxlength: 2000
  },
  
  // Mensajes entre cliente y admin
  messages: [{
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'messages.senderModel'
    },
    senderModel: {
      type: String,
      enum: ['User', 'Employee']
    },
    message: String,
    attachments: [String],
    sentAt: {
      type: Date,
      default: Date.now
    },
    read: {
      type: Boolean,
      default: false
    },
    readAt: Date
  }],
  
  // Control de calidad y satisfacción
  qualityCheck: {
    passed: Boolean,
    checkedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee'
    },
    checkedAt: Date,
    notes: String,
    issues: [{
      description: String,
      severity: {
        type: String,
        enum: ['minor', 'major', 'critical']
      },
      resolved: Boolean,
      resolvedAt: Date
    }]
  },
  
  canReview: {
    type: Boolean,
    default: false
  },
  
  review: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    photos: [String],
    createdAt: Date,
    isPublic: {
      type: Boolean,
      default: true
    }
  },
  
  // Metadata y configuración
  metadata: {
    source: { 
      type: String, 
      enum: ['web', 'app', 'admin', 'api'], 
      default: 'web' 
    },
    priority: { 
      type: String, 
      enum: ['low', 'normal', 'high', 'urgent'], 
      default: 'normal' 
    },
    tags: [{ 
      type: String,
      trim: true
    }],
    isLargeOrder: {
      type: Boolean,
      default: false
    },
    requiresAdvancePayment: {
      type: Boolean,
      default: false
    },
    isRush: {
      type: Boolean,
      default: false
    },
    rushFee: {
      type: Number,
      default: 0
    },
    referralCode: String,
    affiliateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    campaignId: String,
    utmSource: String,
    utmMedium: String,
    utmCampaign: String,
    deviceInfo: {
      type: String,
      userAgent: String,
      ip: String,
      country: String
    }
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Agregar plugin de paginación
orderSchema.plugin(mongoosePaginate);

// ==================== TODOS LOS ÍNDICES DEFINIDOS AQUÍ ====================
// ✅ SOLUCIÓN: Definir TODOS los índices en un solo lugar para evitar duplicados

// Índice único para orderNumber (el más importante)
orderSchema.index({ orderNumber: 1 }, { 
  unique: true, 
  sparse: true,
  name: 'idx_order_number_unique'
});

// Índices compuestos para consultas frecuentes
orderSchema.index({ user: 1, createdAt: -1 }, { name: 'idx_user_created' });
orderSchema.index({ status: 1, createdAt: -1 }, { name: 'idx_status_created' });
orderSchema.index({ user: 1, status: 1 }, { name: 'idx_user_status' });

// Índices de pago
orderSchema.index({ 'payment.status': 1 }, { name: 'idx_payment_status' });
orderSchema.index({ 'payment.method': 1 }, { name: 'idx_payment_method' });
orderSchema.index({ 'payment.wompiData.transactionId': 1 }, { 
  sparse: true, 
  name: 'idx_wompi_transaction' 
});

// Índices de productos y diseños
orderSchema.index({ 'items.product': 1 }, { name: 'idx_items_product' });
orderSchema.index({ 'items.design': 1 }, { name: 'idx_items_design' });

// Índices de fechas y entrega
orderSchema.index({ estimatedReadyDate: 1 }, { name: 'idx_estimated_ready' });
orderSchema.index({ deliveryType: 1 }, { name: 'idx_delivery_type' });
orderSchema.index({ createdAt: -1 }, { name: 'idx_created_desc' });

// Índices de metadata
orderSchema.index({ 'metadata.priority': 1 }, { name: 'idx_priority' });

// Virtuals
orderSchema.virtual('daysInProduction').get(function() {
  if (!this.createdAt) return 0;
  const now = this.completedAt || new Date();
  return Math.floor((now - this.createdAt) / (1000 * 60 * 60 * 24));
});

orderSchema.virtual('isOverdue').get(function() {
  if (['completed', 'delivered', 'cancelled'].includes(this.status)) {
    return false;
  }
  return new Date() > this.estimatedReadyDate;
});

orderSchema.virtual('paymentPending').get(function() {
  return this.payment.status === 'pending' && this.payment.timing === 'advance';
});

orderSchema.virtual('productionProgressPercentage').get(function() {
  if (!this.items || this.items.length === 0) return 0;
  
  const totalProgress = this.items.reduce((sum, item) => {
    return sum + (item.productionProgress || 0);
  }, 0);
  
  return Math.round(totalProgress / this.items.length);
});

// Hooks
orderSchema.pre('save', async function(next) {
  console.log('📦 Order pre-save hook:', {
    isNew: this.isNew,
    orderNumber: this.orderNumber,
    status: this.status
  });
  
  // Generar número de orden único
  if (this.isNew && !this.orderNumber) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(2);
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    const prefix = `DS${year}${month}${day}`;
    
    // Encontrar el último pedido del día
    const startOfDay = new Date(date.setHours(0, 0, 0, 0));
    const endOfDay = new Date(date.setHours(23, 59, 59, 999));
    
    const lastOrder = await mongoose.model('Order').findOne({
      createdAt: { $gte: startOfDay, $lte: endOfDay },
      orderNumber: { $regex: `^${prefix}` }
    }, {}, { sort: { orderNumber: -1 } });
    
    let nextNumber = 1;
    if (lastOrder && lastOrder.orderNumber) {
      const lastNumber = parseInt(lastOrder.orderNumber.slice(-4));
      if (!isNaN(lastNumber)) {
        nextNumber = lastNumber + 1;
      }
    }
    
    const suffix = ('0000' + nextNumber).slice(-4);
    this.orderNumber = `${prefix}${suffix}`;
    
    console.log('✅ Número de orden generado:', this.orderNumber);
  }
  
  // Registrar cambios de estado en el historial
  if (!this.isNew && this.isModified('status')) {
    const previousStatus = this._original?.status || 'unknown';
    
    // Buscar si ya existe una entrada para este cambio
    const existingEntry = this.statusHistory.find(entry => 
      entry.status === this.status && 
      entry.previousStatus === previousStatus &&
      new Date() - new Date(entry.timestamp) < 1000 // Menos de 1 segundo
    );
    
    if (!existingEntry) {
      this.statusHistory.push({
        status: this.status,
        previousStatus,
        changedBy: this._changedBy || null,
        changedByModel: this._changedByModel || 'System',
        notes: this._changeNotes || `Estado cambiado de ${previousStatus} a ${this.status}`,
        timestamp: new Date()
      });
    }
  }
  
  // Calcular total si hay cambios en precios
  if (this.isModified('subtotal') || this.isModified('deliveryFee') || 
      this.isModified('tax') || this.isModified('discounts')) {
    this.total = Math.round((this.subtotal + this.deliveryFee + this.tax - this.discounts) * 100) / 100;
  }
  
  // Marcar como pedido grande si cumple criterios
  if (this.total > 100 || this.items.reduce((sum, item) => sum + item.quantity, 0) > 10) {
    this.metadata.isLargeOrder = true;
    
    // Para pedidos grandes, requerir anticipo si no es efectivo
    if (this.payment.method !== 'cash') {
      this.metadata.requiresAdvancePayment = true;
    }
  }
  
  // Activar revisión cuando se complete
  if (this.status === 'completed' && !this.canReview) {
    this.canReview = true;
  }
  
  next();
});

// Método para calcular progreso de producción
orderSchema.methods.calculateProductionProgress = function() {
  const stages = [
    'sourcing_product',
    'preparing_materials',
    'printing',
    'sublimating',
    'quality_check',
    'packaging'
  ];
  
  let totalProgress = 0;
  
  this.items.forEach(item => {
    let itemProgress = 0;
    stages.forEach(stage => {
      if (item.productionStages[stage]?.completed) {
        itemProgress += (100 / stages.length);
      }
    });
    item.productionProgress = Math.round(itemProgress);
    totalProgress += itemProgress;
  });
  
  return Math.round(totalProgress / this.items.length);
};

// Método para verificar si puede cancelarse
orderSchema.methods.canBeCancelled = function() {
  const cancellableStatuses = ['pending_approval', 'quoted', 'approved'];
  return cancellableStatuses.includes(this.status) && 
         this.payment.status !== 'paid';
};

// Método para obtener siguiente estado válido
orderSchema.methods.getNextValidStatuses = function(userRole = 'user') {
  const transitions = {
    user: {
      'delivered': ['completed']
    },
    admin: {
      'pending_approval': ['quoted', 'rejected', 'cancelled'],
      'quoted': ['approved', 'rejected', 'cancelled'],
      'approved': ['in_production', 'cancelled'],
      'rejected': ['pending_approval'],
      'in_production': ['ready_for_delivery', 'cancelled'],
      'ready_for_delivery': ['delivered', 'cancelled'],
      'delivered': ['completed'],
      'cancelled': ['pending_approval']
    }
  };
  
  const roleTransitions = transitions[userRole === 'admin' ? 'admin' : 'user'];
  return roleTransitions[this.status] || [];
};

// Método para aplicar descuento
orderSchema.methods.applyDiscount = function(code, amount, percentage) {
  if (percentage) {
    this.discounts = Math.round(this.subtotal * (percentage / 100) * 100) / 100;
  } else if (amount) {
    this.discounts = Math.min(amount, this.subtotal);
  }
  
  this.discountCodes.push({
    code,
    amount: amount || null,
    percentage: percentage || null,
    appliedAt: new Date()
  });
  
  this.total = Math.round((this.subtotal + this.deliveryFee + this.tax - this.discounts) * 100) / 100;
};

// ==================== MÉTODOS NUEVOS PARA RESPUESTAS SEGURAS ====================

// Método para respuesta básica (lista de órdenes)
orderSchema.methods.toSafeObject = function() {
  const obj = this.toObject();
  return formatOrderForResponse(obj, false);
};

// Método para respuesta detallada (orden individual)
orderSchema.methods.toDetailedObject = function() {
  const obj = this.toObject();
  return formatOrderForResponse(obj, true);
};

export default mongoose.model('Order', orderSchema);