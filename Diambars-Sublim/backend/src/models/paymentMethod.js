// models/PaymentMethod.js
const mongoose = require('mongoose');
const crypto = require('crypto');

const paymentMethodSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  // Almacenar solo los últimos 4 dígitos de forma segura
  lastFourDigits: {
    type: String,
    required: true,
    length: 4
  },
  // Hash del número completo para prevenir duplicados (opcional)
  numberHash: {
    type: String,
    required: true,
    unique: true
  },
  // Nombre del titular
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  // Fecha de expiración
  expiry: {
    type: String,
    required: true,
    match: /^(0[1-9]|1[0-2])\/\d{2}$/
  },
  // CVC encriptado (para mayor seguridad)
  cvcEncrypted: {
    type: String,
    required: true
  },
  // Tipo de tarjeta
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

// Método para encriptar CVC
paymentMethodSchema.statics.encryptCVC = function(cvc) {
  const algorithm = 'aes-256-cbc';
  const key = process.env.PAYMENT_ENCRYPTION_KEY || crypto.randomBytes(32);
  const iv = crypto.randomBytes(16);
  
  const cipher = crypto.createCipher(algorithm, key);
  let encrypted = cipher.update(cvc, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  return `${iv.toString('hex')}:${encrypted}`;
};

// Método para desencriptar CVC
paymentMethodSchema.statics.decryptCVC = function(encryptedCVC) {
  try {
    const algorithm = 'aes-256-cbc';
    const key = process.env.PAYMENT_ENCRYPTION_KEY || crypto.randomBytes(32);
    
    const textParts = encryptedCVC.split(':');
    const iv = Buffer.from(textParts.shift(), 'hex');
    const encryptedText = textParts.join(':');
    
    const decipher = crypto.createDecipher(algorithm, key);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    throw new Error('Error desencriptando CVC');
  }
};

// Método para generar hash del número de tarjeta
paymentMethodSchema.statics.generateNumberHash = function(cardNumber) {
  return crypto.createHash('sha256').update(cardNumber).digest('hex');
};

// Middleware para actualizar updatedAt
paymentMethodSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Middleware para asegurar que solo un método esté activo por usuario
paymentMethodSchema.pre('save', async function(next) {
  if (this.active && this.isModified('active')) {
    // Desactivar todos los otros métodos del usuario
    await this.constructor.updateMany(
      { 
        userId: this.userId, 
        _id: { $ne: this._id } 
      },
      { active: false }
    );
  }
  next();
});

// Método de instancia para verificar si la tarjeta está expirada
paymentMethodSchema.methods.isExpired = function() {
  const [month, year] = this.expiry.split('/');
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear() % 100;
  const currentMonth = currentDate.getMonth() + 1;
  
  const cardYear = parseInt(year);
  const cardMonth = parseInt(month);
  
  return cardYear < currentYear || (cardYear === currentYear && cardMonth < currentMonth);
};

// Método de instancia para obtener información segura
paymentMethodSchema.methods.toSafeObject = function() {
  return {
    _id: this._id,
    lastFourDigits: this.lastFourDigits,
    name: this.name,
    expiry: this.expiry,
    issuer: this.issuer,
    active: this.active,
    isExpired: this.isExpired(),
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

// Método estático para encontrar métodos activos de un usuario
paymentMethodSchema.statics.findActiveByUser = function(userId) {
  return this.findOne({ userId, active: true });
};

// Método estático para encontrar todos los métodos de un usuario
paymentMethodSchema.statics.findByUser = function(userId) {
  return this.find({ userId }).sort({ createdAt: -1 });
};

// Validación personalizada para prevenir duplicados
paymentMethodSchema.pre('save', async function(next) {
  if (this.isNew || this.isModified('numberHash')) {
    const existing = await this.constructor.findOne({
      userId: this.userId,
      numberHash: this.numberHash,
      _id: { $ne: this._id }
    });
    
    if (existing) {
      const error = new Error('Ya tienes registrada una tarjeta con estos dígitos');
      error.code = 'DUPLICATE_CARD';
      return next(error);
    }
  }
  next();
});

module.exports = mongoose.model('PaymentMethod', paymentMethodSchema);