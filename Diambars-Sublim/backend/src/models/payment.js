// models/payment.js - Modelo independiente para pagos
import mongoose from 'mongoose';

// Esquema para detalles de pago en efectivo
const cashDetailsSchema = new mongoose.Schema({
  expectedAmount: {
    type: Number,
    required: true,
    min: 0
  },
  receivedAmount: {
    type: Number,
    min: 0
  },
  changeGiven: {
    type: Number,
    default: 0,
    min: 0
  },
  collectedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
  },
  collectedAt: Date,
  location: {
    type: String,
    default: 'Punto de entrega'
  },
  receiptNumber: String,
  notes: String
}, { _id: false });

// Esquema para detalles de transferencia bancaria
const transferDetailsSchema = new mongoose.Schema({
  bankName: String,
  accountNumber: String,
  accountHolder: String,
  referenceNumber: String,
  transferDate: Date,
  proofUrl: String, // URL del comprobante subido
  proofPublicId: String, // Cloudinary public ID
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
  },
  verifiedAt: Date,
  rejectionReason: String,
  customerEmail: String, // Email donde se envió el comprobante
  emailSentAt: Date
}, { _id: false });

// Esquema para detalles de Wompi
const wompiDetailsSchema = new mongoose.Schema({
  transactionId: String,
  paymentLinkId: String,
  paymentUrl: String,
  reference: {
    type: String,
    unique: true,
    sparse: true
  },
  expiresAt: Date,
  webhookReceived: {
    type: Boolean,
    default: false
  },
  cardInfo: {
    lastFour: String,
    brand: String, // visa, mastercard, etc
    type: String,  // credit, debit
    issuer: String
  },
  authorizationCode: String,
  processingFee: {
    type: Number,
    default: 0
  }
}, { _id: false });

// Esquema principal de pago
const paymentSchema = new mongoose.Schema({
  // Relación con orden (REQUIRED)
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
    index: true
  },
  
  // Información básica del pago
  amount: {
    type: Number,
    required: true,
    min: 0.01
  },
  currency: {
    type: String,
    default: 'USD',
    enum: ['USD']
  },
  
  // Método de pago
  method: {
    type: String,
    enum: ['wompi', 'cash', 'bank_transfer'],
    required: true,
    index: true
  },
  
  // Estado del pago
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded'],
    default: 'pending',
    index: true
  },
  
  // Tipo de pago (adelantado o contra entrega)
  timing: {
    type: String,
    enum: ['advance', 'on_delivery'],
    default: 'on_delivery'
  },
  
  // Tipo de pago (total o parcial)
  paymentType: {
    type: String,
    enum: ['full', 'partial', 'advance_deposit'],
    default: 'full'
  },
  
  // Para pagos parciales - porcentaje del total
  percentage: {
    type: Number,
    min: 1,
    max: 100,
    default: 100
  },
  
  // Metadatos flexibles para cada proveedor
  providerData: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  // Detalles específicos por método
  cashDetails: cashDetailsSchema,
  transferDetails: transferDetailsSchema,
  wompiDetails: wompiDetailsSchema,
  
  // Auditoría y seguimiento
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'createdByModel',
    required: true
  },
  createdByModel: {
    type: String,
    enum: ['User', 'Employee', 'System'],
    default: 'User'
  },
  
  // Timestamps importantes
  processedAt: Date,
  completedAt: Date,
  failedAt: Date,
  cancelledAt: Date,
  refundedAt: Date,
  
  // Notas y observaciones
  notes: {
    type: String,
    maxLength: 1000
  },
  adminNotes: {
    type: String,
    maxLength: 1000
  },
  
  // Para debugging y soporte
  errorMessages: [{
    message: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    context: mongoose.Schema.Types.Mixed
  }],
  
  // Metadata adicional
  metadata: {
    userAgent: String,
    ipAddress: String,
    source: {
      type: String,
      enum: ['web', 'mobile', 'admin'],
      default: 'web'
    },
    retryCount: {
      type: Number,
      default: 0
    }
  }
  
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ==================== ÍNDICES ====================
paymentSchema.index({ orderId: 1, status: 1 });
paymentSchema.index({ method: 1, status: 1 });
paymentSchema.index({ createdAt: -1 });
paymentSchema.index({ 'wompiDetails.reference': 1 }, { sparse: true });
paymentSchema.index({ 'wompiDetails.transactionId': 1 }, { sparse: true });
paymentSchema.index({ 'transferDetails.referenceNumber': 1 }, { sparse: true });
paymentSchema.index({ 'cashDetails.receiptNumber': 1 }, { sparse: true });

// ==================== VIRTUALS ====================
paymentSchema.virtual('isPending').get(function() {
  return this.status === 'pending';
});

paymentSchema.virtual('isCompleted').get(function() {
  return this.status === 'completed';
});

paymentSchema.virtual('isFailed').get(function() {
  return ['failed', 'cancelled'].includes(this.status);
});

paymentSchema.virtual('isExpired').get(function() {
  if (this.method === 'wompi' && this.wompiDetails?.expiresAt) {
    return new Date() > new Date(this.wompiDetails.expiresAt);
  }
  return false;
});

paymentSchema.virtual('formattedAmount').get(function() {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: this.currency
  }).format(this.amount);
});

// ==================== MÉTODOS DE INSTANCIA ====================
paymentSchema.methods.updateStatus = function(newStatus, context = {}) {
  const previousStatus = this.status;
  this.status = newStatus;
  
  // Actualizar timestamps según el estado
  switch (newStatus) {
    case 'processing':
      this.processedAt = new Date();
      break;
    case 'completed':
      this.completedAt = new Date();
      break;
    case 'failed':
      this.failedAt = new Date();
      break;
    case 'cancelled':
      this.cancelledAt = new Date();
      break;
    case 'refunded':
      this.refundedAt = new Date();
      break;
  }
  
  // Log del cambio de estado
  if (!this.metadata) this.metadata = {};
  if (!this.metadata.statusHistory) this.metadata.statusHistory = [];
  
  this.metadata.statusHistory.push({
    from: previousStatus,
    to: newStatus,
    timestamp: new Date(),
    context: context
  });
  
  return this.save();
};

paymentSchema.methods.addError = function(message, context = {}) {
  this.errorMessages.push({
    message,
    context,
    timestamp: new Date()
  });
  return this.save();
};

paymentSchema.methods.canBeProcessed = function() {
  // ✅ LÓGICA FLEXIBLE: Permitir procesamiento en más estados
  const processableStates = ['pending', 'processing'];
  
  // Para pagos en efectivo, permitir procesamiento en estado 'processing'
  if (this.method === 'cash') {
    return processableStates.includes(this.status) && !this.isExpired;
  }
  
  // Para otros métodos, solo en estado 'pending'
  return this.status === 'pending' && !this.isExpired;
};

paymentSchema.methods.canBeCompleted = function() {
  return ['pending', 'processing'].includes(this.status);
};

paymentSchema.methods.toPublicObject = function() {
  return {
    id: this._id,
    orderId: this.orderId,
    amount: this.amount,
    formattedAmount: this.formattedAmount,
    currency: this.currency,
    method: this.method,
    status: this.status,
    timing: this.timing,
    paymentType: this.paymentType,
    percentage: this.percentage,
    createdAt: this.createdAt,
    processedAt: this.processedAt,
    completedAt: this.completedAt,
    isExpired: this.isExpired,
    // Solo datos seguros del proveedor
    providerInfo: this.method === 'wompi' ? {
      paymentUrl: this.wompiDetails?.paymentUrl,
      expiresAt: this.wompiDetails?.expiresAt,
      reference: this.wompiDetails?.reference
    } : this.method === 'bank_transfer' ? {
      bankName: this.transferDetails?.bankName,
      accountNumber: this.transferDetails?.accountNumber,
      accountHolder: this.transferDetails?.accountHolder
    } : this.method === 'cash' ? {
      expectedAmount: this.cashDetails?.expectedAmount,
      location: this.cashDetails?.location
    } : {}
  };
};

// ==================== MÉTODOS ESTÁTICOS ====================
paymentSchema.statics.findByOrderId = function(orderId) {
  return this.find({ orderId }).sort({ createdAt: -1 });
};

paymentSchema.statics.findPendingPayments = function(method = null) {
  const query = { status: 'pending' };
  if (method) query.method = method;
  return this.find(query).populate('orderId', 'orderNumber user total');
};

paymentSchema.statics.getPaymentStats = function(startDate, endDate) {
  const matchStage = {
    createdAt: {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    }
  };
  
  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: {
          method: '$method',
          status: '$status'
        },
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' }
      }
    },
    {
      $group: {
        _id: '$_id.method',
        statuses: {
          $push: {
            status: '$_id.status',
            count: '$count',
            totalAmount: '$totalAmount'
          }
        },
        totalCount: { $sum: '$count' },
        totalAmount: { $sum: '$totalAmount' }
      }
    }
  ]);
};

// ==================== HOOKS ====================
paymentSchema.pre('save', function(next) {
  // Generar receipt number para efectivo si no existe
  if (this.method === 'cash' && this.cashDetails && !this.cashDetails.receiptNumber) {
    this.cashDetails.receiptNumber = `CASH-${this.orderId}-${Date.now()}`;
  }
  
  // Generar reference para wompi si no existe
  if (this.method === 'wompi' && this.wompiDetails && !this.wompiDetails.reference) {
    this.wompiDetails.reference = `DS-${this.orderId}-${Date.now()}`;
  }
  
  next();
});

paymentSchema.pre('save', function(next) {
  // Log para debugging
  if (this.isNew) {
    console.log(`💳 [Payment] Creando nuevo pago: ${this.method} por $${this.amount}`);
  } else if (this.isModified('status')) {
    console.log(`💳 [Payment] Estado cambiado: ${this.method} -> ${this.status}`);
  }
  
  next();
});

// ==================== MODELO ====================
const Payment = mongoose.model('Payment', paymentSchema);

export default Payment;