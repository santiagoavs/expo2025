// models/PaymentConfig.js - Configuración de métodos de pago del sistema
import mongoose from 'mongoose';

const paymentConfigSchema = new mongoose.Schema({
  // Tipo de método de pago
  type: {
    type: String,
    enum: ['wompi', 'cash', 'bank_transfer', 'credit_card'],
    required: true,
    unique: true
  },
  // Nombre para mostrar
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  // Si está habilitado
  enabled: {
    type: Boolean,
    default: true
  },
  // Configuración específica del método
  config: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  // Mensaje para mostrar al cliente
  message: {
    type: String,
    trim: true,
    maxlength: 500,
    default: ''
  },
  // Metadatos
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

// Índices
paymentConfigSchema.index({ type: 1 });
paymentConfigSchema.index({ enabled: 1 });

// Middleware para actualizar updatedAt
paymentConfigSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Método estático para obtener configuración activa
paymentConfigSchema.statics.getActiveConfigs = function() {
  return this.find({ enabled: true }).sort({ type: 1 });
};

// Método estático para obtener configuración por tipo
paymentConfigSchema.statics.getConfigByType = function(type) {
  return this.findOne({ type, enabled: true });
};

// Método de instancia para obtener información pública
paymentConfigSchema.methods.toPublicObject = function() {
  return {
    type: this.type,
    name: this.name,
    enabled: this.enabled,
    message: this.message,
    config: this.config
  };
};

const PaymentConfig = mongoose.model('PaymentConfig', paymentConfigSchema);
export default PaymentConfig;
