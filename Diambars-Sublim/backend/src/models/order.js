// models/order.js - Modelo actualizado para la nueva arquitectura de pagos
import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

// ==================== ESQUEMAS EMBEBIDOS ====================

// Esquema para direcciones
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
      default: [-89.2182, 13.6929]
    }
  },
  isDefault: { type: Boolean, default: false }
}, { _id: false });

// Esquema para items de orden
const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  design: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Design'
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0
  },
  totalPrice: {
    type: Number,
    required: true,
    min: 0
  },
  specifications: {
    size: String,
    color: String,
    material: String,
    customizations: mongoose.Schema.Types.Mixed
  },
  productionProgress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  productionStages: {
    designing: { 
      completed: { type: Boolean, default: false },
      completedAt: Date,
      completedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' }
    },
    printing: { 
      completed: { type: Boolean, default: false },
      completedAt: Date,
      completedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' }
    },
    sublimating: { 
      completed: { type: Boolean, default: false },
      completedAt: Date,
      completedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' }
    },
    qualityCheck: { 
      completed: { type: Boolean, default: false },
      completedAt: Date,
      completedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
      approved: Boolean,
      notes: String
    },
    packaging: { 
      completed: { type: Boolean, default: false },
      completedAt: Date,
      completedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' }
    }
  }
}, { _id: true });

// Esquema para historial de estados - SIMPLIFICADO
const orderStatusHistorySchema = new mongoose.Schema({
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

// ==================== ESQUEMA PRINCIPAL ====================

const orderSchema = new mongoose.Schema({
  // Identificación
  orderNumber: {
    type: String,
    unique: true,
    sparse: true
  },
  
  // Usuario
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true
  },
  
  // Items
  items: {
    type: [orderItemSchema],
    validate: {
      validator: function(v) {
        return v && v.length > 0;
      },
      message: 'El pedido debe tener al menos un item'
    }
  },
  
  // Estado
  status: {
    type: String,
    enum: [
      'pending_approval',   // Esperando aprobación/cotización
      'quoted',            // Cotizado, esperando pago/confirmación
      'approved',          // Aprobado, listo para producción
      'in_production',     // En producción
      'quality_check',     // Control de calidad
      'quality_approved',  // Calidad aprobada
      'packaging',         // Empacando
      'ready_for_delivery', // Listo para entrega
      'out_for_delivery',  // En camino/punto de encuentro
      'delivered',         // Entregado
      'completed',         // Completado y cerrado
      'cancelled',         // Cancelado
      'on_hold'           // En espera/pausado
    ],
    default: 'pending_approval'
  },
  
  // Historial de estados
  statusHistory: [orderStatusHistorySchema],
  
  // ==================== INFORMACIÓN DE PAGO - SIMPLIFICADA ====================
  
  payment: {
    // Método principal (del último pago o más relevante)
    method: {
      type: String,
      enum: ['wompi', 'cash', 'bank_transfer', 'multiple'],
      default: null
    },
    
    // Estado consolidado de todos los pagos
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed', 'partially_paid'],
      default: 'pending'
    },
    
    // Referencia al pago principal (más reciente o relevante)
    primaryPaymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment'
    },
    
    // Totales consolidados
    totalPaid: {
      type: Number,
      default: 0,
      min: 0
    },
    
    // Saldo pendiente
    balance: {
      type: Number,
      default: function() { 
        return this.total || 0; 
      },
      min: 0
    },
    
    // Fecha del último pago completado
    lastPaidAt: Date,
    
    // Metadatos para casos especiales
    metadata: {
      hasMultiplePayments: { type: Boolean, default: false },
      requiresAdvancePayment: { type: Boolean, default: false },
      advancePercentage: { type: Number, min: 0, max: 100 },
      paymentNotes: String
    }
  },
  
  // ==================== INFORMACIÓN FINANCIERA ====================
  
  // Totales
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  
  // Descuentos
  discounts: {
    percentage: { type: Number, default: 0, min: 0, max: 100 },
    amount: { type: Number, default: 0, min: 0 },
    reason: String,
    appliedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee'
    }
  },
  
  // Impuestos
  tax: {
    percentage: { type: Number, default: 0, min: 0 },
    amount: { type: Number, default: 0, min: 0 }
  },
  
  // Costos de entrega
  deliveryFee: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Total final
  total: {
    type: Number,
    required: true,
    min: 0
  },
  
  // ==================== INFORMACIÓN DE ENTREGA ====================
  
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
    notes: String
  },
  
  // ==================== FECHAS Y PRODUCCIÓN ====================
  
  estimatedReadyDate: Date,
  actualReadyDate: Date,
  deliveredAt: Date,
  completedAt: Date,
  
  // Fotos de producción y calidad
  productionPhotos: [{
    stage: {
      type: String,
      enum: ['cutting', 'printing', 'pressing', 'quality_check', 'packaging'],
      required: true
    },
    photoUrl: { 
      type: String, 
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
    isQualityPhoto: { 
      type: Boolean, 
      default: false 
    }
  }],
  
  // ==================== NOTAS Y COMUNICACIÓN ====================
  
  clientNotes: {
    type: String,
    maxLength: 2000
  },
  
  adminNotes: {
    type: String,
    maxLength: 2000
  },
  
  // Fotos de producción
  productionPhotos: [{
    url: String,
    publicId: String,
    stage: {
      type: String,
      enum: ['printing', 'sublimating', 'quality_check', 'final']
    },
    uploadedAt: { type: Date, default: Date.now },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    notes: String,
    clientApproved: { type: Boolean, default: false }
  }],
  
  // Mensajes/comunicación
  messages: [{
    from: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'messages.fromModel'
    },
    fromModel: {
      type: String,
      enum: ['User', 'Employee'],
      required: true
    },
    message: { type: String, required: true, maxLength: 1000 },
    timestamp: { type: Date, default: Date.now },
    isRead: { type: Boolean, default: false },
    attachments: [String]
  }],
  
  // ==================== CONTROL DE CALIDAD ====================
  
  qualityCheck: {
    passed: Boolean,
    checkedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    checkedAt: Date,
    issues: [String],
    resolution: String,
    finalApproval: Boolean
  },
  
  // ==================== REVIEW ====================
  
  review: {
    rating: { type: Number, min: 1, max: 5 },
    comment: { type: String, maxLength: 1000 },
    reviewedAt: Date,
    isPublic: { type: Boolean, default: true }
  },
  
  canReview: {
    type: Boolean,
    default: false
  },
  
  // ==================== METADATA ====================
  
  metadata: {
    source: { type: String, enum: ['web', 'mobile', 'admin', 'api'], default: 'web' },
    priority: { type: String, enum: ['low', 'normal', 'high', 'urgent'], default: 'normal' },
    tags: [String],
    isLargeOrder: { type: Boolean, default: false },
    isRush: { type: Boolean, default: false },
    rushFee: { type: Number, default: 0 },
    specialInstructions: String,
    internalNotes: String // Solo para staff interno
  }
  
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ==================== ÍNDICES ====================

orderSchema.index({ orderNumber: 1 }, { unique: true, sparse: true });
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ 'payment.status': 1 });
orderSchema.index({ 'payment.method': 1 });
orderSchema.index({ 'payment.primaryPaymentId': 1 }, { sparse: true });
orderSchema.index({ estimatedReadyDate: 1 });
orderSchema.index({ deliveryType: 1 });
orderSchema.index({ 'items.product': 1 });
orderSchema.index({ 'metadata.priority': 1 });
orderSchema.index({ createdAt: -1 });

// ==================== VIRTUALS ====================

orderSchema.virtual('daysInProduction').get(function() {
  if (!this.createdAt) return 0;
  const now = this.completedAt || new Date();
  return Math.floor((now - this.createdAt) / (1000 * 60 * 60 * 24));
});

orderSchema.virtual('isOverdue').get(function() {
  if (['completed', 'delivered', 'cancelled'].includes(this.status)) {
    return false;
  }
  return this.estimatedReadyDate && new Date() > this.estimatedReadyDate;
});

// Nueva virtual para pagos
orderSchema.virtual('isFullyPaid').get(function() {
  return this.payment?.balance === 0;
});

orderSchema.virtual('paymentProgress').get(function() {
  if (!this.total || this.total === 0) return 0;
  const paid = this.payment?.totalPaid || 0;
  return Math.round((paid / this.total) * 100);
});

orderSchema.virtual('productionProgressPercentage').get(function() {
  if (!this.items || this.items.length === 0) return 0;
  
  const totalProgress = this.items.reduce((sum, item) => {
    return sum + (item.productionProgress || 0);
  }, 0);
  
  return Math.round(totalProgress / this.items.length);
});

// ==================== MÉTODOS DE INSTANCIA ====================

// Actualizar información consolidada de pagos
orderSchema.methods.updatePaymentInfo = async function() {
  const Payment = mongoose.model('Payment');
  
  // Obtener todos los pagos de esta orden
  const payments = await Payment.find({ orderId: this._id }).sort({ createdAt: -1 });
  
  if (payments.length === 0) {
    // No hay pagos
    this.payment = {
      method: null,
      status: 'pending',
      primaryPaymentId: null,
      totalPaid: 0,
      balance: this.total,
      lastPaidAt: null,
      metadata: {
        hasMultiplePayments: false,
        requiresAdvancePayment: false
      }
    };
    return;
  }
  
  // Calcular totales
  const completedPayments = payments.filter(p => p.status === 'completed');
  const processingPayments = payments.filter(p => p.status === 'processing');
  const totalPaid = completedPayments.reduce((sum, p) => sum + p.amount, 0);
  const balance = Math.max(0, this.total - totalPaid);
  
  // Determinar estado consolidado
  let consolidatedStatus = 'pending';
  if (totalPaid >= this.total) {
    consolidatedStatus = 'completed';
  } else if (totalPaid > 0) {
    consolidatedStatus = 'partially_paid';
  } else if (processingPayments.length > 0) {
    consolidatedStatus = 'processing';
  }
  
  // Determinar método principal
  const lastCompletedPayment = completedPayments[0];
  const lastPayment = payments[0];
  const primaryPayment = lastCompletedPayment || lastPayment;
  
  let method = primaryPayment?.method || null;
  if (payments.length > 1 && completedPayments.length > 1) {
    const methods = [...new Set(completedPayments.map(p => p.method))];
    method = methods.length > 1 ? 'multiple' : methods[0];
  }
  
  // Actualizar información
  this.payment = {
    method,
    status: consolidatedStatus,
    primaryPaymentId: primaryPayment?._id || null,
    totalPaid,
    balance,
    lastPaidAt: completedPayments[0]?.completedAt || null,
    metadata: {
      hasMultiplePayments: payments.length > 1,
      requiresAdvancePayment: this.payment?.metadata?.requiresAdvancePayment || false,
      advancePercentage: this.payment?.metadata?.advancePercentage,
      paymentNotes: this.payment?.metadata?.paymentNotes
    }
  };
  
  await this.save();
  
  console.log(`📦 [Order] Información de pago actualizada: ${this.orderNumber} - ${consolidatedStatus}`);
};

// Método para verificar si puede ser pagada
orderSchema.methods.canBeProcessedForPayment = function() {
  const validStatuses = ['pending_approval', 'quoted', 'approved'];
  return validStatuses.includes(this.status);
};

// Método para verificar si requiere pago adelantado
orderSchema.methods.requiresAdvancePayment = function() {
  return this.payment?.metadata?.requiresAdvancePayment || 
         this.metadata?.isLargeOrder || 
         this.total > 500; // Ejemplo: órdenes > $500
};

// Método para calcular monto de adelanto
orderSchema.methods.calculateAdvanceAmount = function(percentage = null) {
  const advancePercentage = percentage || 
                           this.payment?.metadata?.advancePercentage || 
                           50; // 50% por defecto
  
  return Math.round(this.total * advancePercentage / 100 * 100) / 100;
};

// Formatear para respuesta API (datos públicos)
orderSchema.methods.toPublicObject = function() {
  return {
    _id: this._id,
    orderNumber: this.orderNumber,
    status: this.status,
    items: this.items?.map(item => ({
      _id: item._id,
      product: item.product,
      design: item.design,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.totalPrice,
      specifications: item.specifications,
      productionProgress: item.productionProgress
    })),
    
    // Información financiera
    subtotal: this.subtotal,
    discounts: this.discounts,
    tax: this.tax,
    deliveryFee: this.deliveryFee,
    total: this.total,
    
    // Información de pago (datos seguros)
    payment: {
      method: this.payment?.method,
      status: this.payment?.status,
      totalPaid: this.payment?.totalPaid || 0,
      balance: this.payment?.balance || this.total,
      lastPaidAt: this.payment?.lastPaidAt,
      isFullyPaid: this.isFullyPaid,
      paymentProgress: this.paymentProgress,
      requiresAdvancePayment: this.requiresAdvancePayment()
    },
    
    // Entrega
    deliveryType: this.deliveryType,
    deliveryAddress: this.deliveryAddress,
    meetupDetails: this.meetupDetails,
    
    // Fechas
    estimatedReadyDate: this.estimatedReadyDate,
    actualReadyDate: this.actualReadyDate,
    deliveredAt: this.deliveredAt,
    completedAt: this.completedAt,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
    
    // Notas del cliente
    clientNotes: this.clientNotes,
    
    // Fotos de producción (URLs públicas)
    productionPhotos: this.productionPhotos?.map(photo => ({
      url: photo.url,
      stage: photo.stage,
      uploadedAt: photo.uploadedAt,
      notes: photo.notes,
      clientApproved: photo.clientApproved
    })),
    
    // Review
    review: this.review,
    canReview: this.canReview,
    
    // Virtuals
    daysInProduction: this.daysInProduction,
    isOverdue: this.isOverdue,
    productionProgressPercentage: this.productionProgressPercentage
  };
};

// Formatear para admin (datos completos)
orderSchema.methods.toAdminObject = function() {
  const publicData = this.toPublicObject();
  
  return {
    ...publicData,
    
    // Datos administrativos adicionales
    user: this.user,
    statusHistory: this.statusHistory,
    adminNotes: this.adminNotes,
    
    // Información completa de pago
    payment: {
      ...publicData.payment,
      primaryPaymentId: this.payment?.primaryPaymentId,
      metadata: this.payment?.metadata
    },
    
    // Mensajes completos
    messages: this.messages,
    
    // Control de calidad
    qualityCheck: this.qualityCheck,
    
    // Metadata completa
    metadata: this.metadata,
    
    // Información detallada de items
    items: this.items?.map(item => ({
      ...item.toObject(),
      productionStages: item.productionStages
    }))
  };
};

// ==================== MÉTODOS ESTÁTICOS ====================

// Buscar órdenes por usuario
orderSchema.statics.findByUser = function(userId, options = {}) {
  const query = { user: userId };
  
  if (options.status) {
    query.status = options.status;
  }
  
  return this.find(query)
    .populate('items.product', 'name images category')
    .populate('items.design', 'name previewUrl')
    .sort({ createdAt: -1 });
};

// Buscar órdenes con pagos pendientes
orderSchema.statics.findWithPendingPayments = function() {
  return this.find({
    'payment.status': { $in: ['pending', 'processing', 'partially_paid'] },
    status: { $nin: ['cancelled', 'completed'] }
  })
  .populate('user', 'name email')
  .sort({ createdAt: -1 });
};

// Obtener estadísticas de órdenes
orderSchema.statics.getOrderStats = function(startDate, endDate) {
  const matchStage = {};
  
  if (startDate && endDate) {
    matchStage.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }
  
  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: {
          status: '$status',
          paymentStatus: '$payment.status'
        },
        count: { $sum: 1 },
        totalAmount: { $sum: '$total' },
        avgAmount: { $avg: '$total' }
      }
    },
    {
      $group: {
        _id: '$_id.status',
        paymentBreakdown: {
          $push: {
            paymentStatus: '$_id.paymentStatus',
            count: '$count',
            totalAmount: '$totalAmount'
          }
        },
        totalOrders: { $sum: '$count' },
        totalRevenue: { $sum: '$totalAmount' }
      }
    }
  ]);
};

// ==================== HOOKS ====================

orderSchema.pre('save', async function(next) {
  // Generar número de orden único si es nuevo
  if (this.isNew && !this.orderNumber) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(2);
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    
    // Buscar el último número del día
    const lastOrder = await this.constructor.findOne({
      orderNumber: new RegExp(`^DS${year}${month}${day}`)
    }).sort({ orderNumber: -1 });
    
    let sequence = 1;
    if (lastOrder) {
      const lastSequence = parseInt(lastOrder.orderNumber.slice(-3));
      sequence = lastSequence + 1;
    }
    
    this.orderNumber = `DS${year}${month}${day}${sequence.toString().padStart(3, '0')}`;
  }
  
  // Actualizar balance si cambió el total
  if (this.isModified('total') && this.payment) {
    this.payment.balance = Math.max(0, this.total - (this.payment.totalPaid || 0));
  }
  
  // Log para debugging
  if (this.isNew) {
    console.log(`📦 [Order] Creando nueva orden: ${this.orderNumber}`);
  } else if (this.isModified('status')) {
    console.log(`📦 [Order] Estado cambiado: ${this.orderNumber} -> ${this.status}`);
  }
  
  next();
});

// Hook post-save para actualizar referencias
orderSchema.post('save', async function(doc) {
  // Si cambió información relevante de pago, actualizar pagos relacionados
  if (doc.isModified('total') || doc.isModified('status')) {
    const Payment = mongoose.model('Payment');
    
    // Actualizar metadatos en pagos relacionados si es necesario
    await Payment.updateMany(
      { orderId: doc._id },
      { 
        $set: { 
          'metadata.orderTotal': doc.total,
          'metadata.orderStatus': doc.status 
        } 
      }
    );
  }
});

// ==================== PLUGINS ====================

orderSchema.plugin(mongoosePaginate);

// ==================== MODELO ====================

const Order = mongoose.model('Order', orderSchema);

export default Order;