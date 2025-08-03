import mongoose from 'mongoose';

// Esquema para elementos de dirección
const addressSchema = new mongoose.Schema({
  label: { type: String, trim: true }, // "Casa", "Oficina", etc.
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
      type: [Number], // [longitude, latitude]
      default: [0, 0]
    }
  },
  isDefault: { type: Boolean, default: false }
}, { _id: false });

// Esquema para elementos de pago
const paymentSchema = new mongoose.Schema({
  method: { 
    type: String,
    enum: ['cash', 'card', 'transfer', 'wompi', 'paypal', 'other'],
    required: true
  },
  status: { 
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'USD'
  },
  transactionId: { type: String },
  gatewayResponse: { type: mongoose.Schema.Types.Mixed },
  paidAt: { type: Date },
  metadata: { type: mongoose.Schema.Types.Mixed }
}, { _id: false, timestamps: true });

// Esquema para elementos de un pedido (cada producto con su diseño)
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
    name: { type: String, required: true }, // "color", "size", etc.
    value: { type: String, required: true }  // "rojo", "L", etc.
  }],
  quantity: { 
    type: Number,
    required: true,
    min: 1
  },
  unitPrice: {
    type: Number,
    required: true
  },
  subtotal: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'in_production', 'ready', 'delivered'],
    default: 'pending'
  },
  productionNotes: { type: String },
  readyAt: { type: Date }
}, { _id: true });

// Esquema para el historial de estados de un pedido
const orderStatusHistorySchema = new mongoose.Schema({
  status: {
    type: String,
    enum: [
      'pending_approval', // Pendiente de aprobación
      'quoted', // Cotizado por admin
      'approved', // Aprobado por cliente
      'rejected', // Rechazado por cliente
      'in_production', // En producción
      'ready_for_delivery', // Listo para entrega
      'delivered', // Entregado
      'completed', // Completado (entregado + confirmado)
      'cancelled' // Cancelado
    ],
    required: true
  },
  changedBy: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'changedByModel'
  },
  changedByModel: {
    type: String,
    enum: ['User', 'Employee']
  },
  notes: { type: String },
  timestamp: { type: Date, default: Date.now }
}, { _id: true });

// Esquema principal de orden/pedido
const orderSchema = new mongoose.Schema({
 orderNumber: {
  type: String
},
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true
  },
  items: [orderItemSchema],
  status: {
    type: String,
    enum: [
      'pending_approval', // Pendiente de aprobación
      'quoted', // Cotizado por admin
      'approved', // Aprobado por cliente
      'rejected', // Rechazado por cliente
      'in_production', // En producción
      'ready_for_delivery', // Listo para entrega
      'delivered', // Entregado
      'completed', // Completado (entregado + confirmado)
      'cancelled' // Cancelado
    ],
    default: 'pending_approval'
  },
  statusHistory: [orderStatusHistorySchema],
  deliveryType: {
    type: String,
    enum: ['meetup', 'delivery'],
    default: 'meetup'
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
        type: [Number], // [longitude, latitude]
        default: [0, 0]
      },
      address: { type: String },
      placeName: { type: String }
    },
    notes: { type: String }
  },
  payment: paymentSchema,
  subtotal: { 
    type: Number,
    required: true
  },
  discounts: {
    type: Number,
    default: 0
  },
  deliveryFee: {
    type: Number,
    default: 0
  },
  tax: {
    type: Number,
    default: 0
  },
  total: {
    type: Number,
    required: true
  },
  estimatedReadyDate: {
    type: Date
  },
  clientNotes: { 
    type: String 
  },
  adminNotes: { 
    type: String 
  },
  completedAt: {
    type: Date
  },
  canReview: {
    type: Boolean,
    default: false
  },
  metadata: {
    source: { type: String, enum: ['web', 'app'], default: 'web' },
    priority: { type: String, enum: ['low', 'normal', 'high'], default: 'normal' },
    tags: [{ type: String }]
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Índices para búsquedas eficientes
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ orderNumber: 1 }, { unique: true });

// Generar número de orden único
orderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(2);
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const prefix = `DS${year}${month}`;
    
    // Encontrar el último pedido con este prefijo
    const lastOrder = await mongoose.model('Order').findOne({
      orderNumber: { $regex: `^${prefix}` }
    }, {}, { sort: { orderNumber: -1 } });
    
    let nextNumber = 1;
    if (lastOrder && lastOrder.orderNumber) {
      const lastNumber = parseInt(lastOrder.orderNumber.slice(-4));
      if (!isNaN(lastNumber)) {
        nextNumber = lastNumber + 1;
      }
    }
    
    // Formatear el número con ceros a la izquierda
    const suffix = ('000' + nextNumber).slice(-4);
    this.orderNumber = `${prefix}${suffix}`;
  }
  next();
});

export default mongoose.model('Order', orderSchema);