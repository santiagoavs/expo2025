// models/PaymentMethod.js - SIN ALMACENAR CVC (CUMPLE PCI DSS)
import mongoose from 'mongoose';
import crypto from 'crypto';

const paymentMethodSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  // Tipo de método de pago
  type: {
    type: String,
    enum: ['credit_card', 'wompi', 'cash', 'bank_transfer'],
    required: true,
    default: 'credit_card'
  },
  // Almacenar solo los últimos 4 dígitos de forma segura (opcional para efectivo/banco)
  lastFourDigits: {
    type: String,
    required: function() {
      return this.type === 'credit_card' || this.type === 'wompi';
    },
    length: 4
  },
  // Hash del número completo para prevenir duplicados (opcional para efectivo/banco)
  numberHash: {
    type: String,
    required: function() {
      return this.type === 'credit_card' || this.type === 'wompi';
    },
    sparse: true // Permite múltiples valores null
  },
  // Número de cuenta bancaria (para transferencias)
  bankAccount: {
    type: String,
    required: function() {
      return this.type === 'bank_transfer';
    },
    sparse: true
  },
  // Nombre del titular
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  // Fecha de expiración (opcional para efectivo/banco)
  expiry: {
    type: String,
    required: function() {
      return this.type === 'credit_card' || this.type === 'wompi';
    },
    match: /^(0[1-9]|1[0-2])\/\d{2}$/
  },
  // Tipo de tarjeta (opcional para efectivo/banco)
  issuer: {
    type: String,
    enum: ['visa', 'mastercard', 'amex', 'discover', 'unknown'],
    default: 'unknown'
  },
  // Si está activa o no
  active: {
    type: Boolean,
    default: false
  },
  // Nickname opcional para la tarjeta
  nickname: {
    type: String,
    trim: true,
    maxlength: 50,
    default: ''
  },
  // Metadatos adicionales
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Índices para optimizar consultas
paymentMethodSchema.index({ userId: 1, active: 1 });
paymentMethodSchema.index({ userId: 1, createdAt: -1 });

// Método para generar hash del número de tarjeta
paymentMethodSchema.statics.generateNumberHash = function(cardNumber) {
  try {
    console.log('🔗 [PaymentMethod] Generando hash del número de tarjeta...');
    const hash = crypto.createHash('sha256').update(cardNumber).digest('hex');
    console.log('✅ [PaymentMethod] Hash generado exitosamente');
    return hash;
  } catch (error) {
    console.error('❌ [PaymentMethod] Error generando hash:', error);
    throw new Error('Error procesando número de tarjeta');
  }
};

// Método para detectar tipo de tarjeta basado en los primeros dígitos
paymentMethodSchema.statics.detectCardType = function(cardNumber) {
  const cleanNumber = cardNumber.replace(/\s/g, '');
  
  if (/^4/.test(cleanNumber)) return 'visa';
  if (/^5[1-5]/.test(cleanNumber)) return 'mastercard';
  if (/^3[47]/.test(cleanNumber)) return 'amex';
  if (/^6/.test(cleanNumber)) return 'discover';
  
  return 'unknown';
};

// Middleware para actualizar updatedAt
paymentMethodSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Middleware para asegurar que solo un método esté activo por usuario
paymentMethodSchema.pre('save', async function(next) {
  try {
    if (this.active && this.isModified('active')) {
      console.log('🔄 [PaymentMethod] Desactivando otros métodos del usuario:', this.userId);
      // Desactivar todos los otros métodos del usuario
      await this.constructor.updateMany(
        { 
          userId: this.userId, 
          _id: { $ne: this._id } 
        },
        { active: false }
      );
      console.log('✅ [PaymentMethod] Otros métodos desactivados');
    }
    next();
  } catch (error) {
    console.error('❌ [PaymentMethod] Error en middleware pre-save:', error);
    next(error);
  }
});

// Método de instancia para verificar si la tarjeta está expirada
paymentMethodSchema.methods.isExpired = function() {
  try {
    // Para métodos que no tienen fecha de expiración, siempre retornar false
    if (!this.expiry || this.type === 'cash' || this.type === 'bank_transfer') {
      return false;
    }
    
    const [month, year] = this.expiry.split('/');
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear() % 100;
    const currentMonth = currentDate.getMonth() + 1;
    
    const cardYear = parseInt(year);
    const cardMonth = parseInt(month);
    
    return cardYear < currentYear || (cardYear === currentYear && cardMonth < currentMonth);
  } catch (error) {
    console.error('❌ [PaymentMethod] Error verificando expiración:', error);
    return false;
  }
};

// Método de instancia para obtener información segura
paymentMethodSchema.methods.toSafeObject = function() {
  return {
    _id: this._id,
    type: this.type,
    lastFourDigits: this.lastFourDigits,
    name: this.name,
    expiry: this.expiry,
    issuer: this.issuer,
    active: this.active,
    nickname: this.nickname,
    isExpired: this.isExpired(),
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

// Método de instancia para obtener nombre para mostrar
paymentMethodSchema.methods.getDisplayName = function() {
  if (this.type === 'cash' || this.type === 'bank_transfer') {
    return this.nickname || this.name;
  }
  
  const issuerName = this.issuer.charAt(0).toUpperCase() + this.issuer.slice(1);
  const baseName = `${issuerName} •••• ${this.lastFourDigits}`;
  
  return this.nickname ? `${this.nickname} (${baseName})` : baseName;
};

// Método estático para encontrar métodos activos de un usuario
paymentMethodSchema.statics.findActiveByUser = function(userId) {
  return this.findOne({ userId, active: true });
};

// Método estático para encontrar todos los métodos de un usuario
paymentMethodSchema.statics.findByUser = function(userId) {
  return this.find({ userId }).sort({ createdAt: -1 });
};

// Validación personalizada para prevenir duplicados (solo para métodos con tarjeta)
paymentMethodSchema.pre('save', async function(next) {
  try {
    // Solo validar duplicados para métodos que tienen número de tarjeta
    if ((this.type === 'credit_card' || this.type === 'wompi') && this.numberHash && (this.isNew || this.isModified('numberHash'))) {
      console.log('🔍 [PaymentMethod] Verificando duplicados...');
      const existing = await this.constructor.findOne({
        userId: this.userId,
        numberHash: this.numberHash,
        _id: { $ne: this._id }
      });
      
      if (existing) {
        console.log('❌ [PaymentMethod] Tarjeta duplicada encontrada');
        const error = new Error('Ya tienes registrada una tarjeta con estos dígitos');
        error.code = 'DUPLICATE_CARD';
        return next(error);
      }
      console.log('✅ [PaymentMethod] No hay duplicados');
    }
    next();
  } catch (error) {
    console.error('❌ [PaymentMethod] Error en validación de duplicados:', error);
    next(error);
  }
});

const PaymentMethod = mongoose.model('PaymentMethod', paymentMethodSchema);
export default PaymentMethod;