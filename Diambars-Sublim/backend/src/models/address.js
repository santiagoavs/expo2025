// models/address.js - Modelo optimizado con importaciones corregidas
import mongoose from 'mongoose';
import { 
  isValidSalvadoranPhone, 
  isValidDepartment, 
  isValidMunicipality,
  calculateDeliveryFee,
  getDepartments,
  DELIVERY_CONFIG
} from '../utils/locationUtils.js';

const addressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  label: {
    type: String,
    trim: true,
    maxlength: 50,
    default: 'Mi dirección'
  },
  recipient: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  phoneNumber: {
    type: String,
    required: true,
    trim: true,
    validate: {
      validator: isValidSalvadoranPhone,
      message: 'Formato de teléfono inválido para El Salvador'
    }
  },
  department: {
    type: String,
    required: true,
    trim: true,
    enum: getDepartments(),
    validate: {
      validator: isValidDepartment,
      message: 'Departamento inválido'
    }
  },
  municipality: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  additionalDetails: {
    type: String,
    trim: true,
    maxlength: 200,
    default: ''
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      default: DELIVERY_CONFIG.DEFAULT_COORDINATES
    }
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Índices optimizados
addressSchema.index({ user: 1, isDefault: -1 });
addressSchema.index({ user: 1, createdAt: -1 });
addressSchema.index({ location: '2dsphere' });

// Validación personalizada para municipio
addressSchema.pre('validate', function(next) {
  if (this.department && this.municipality) {
    if (!isValidMunicipality(this.department, this.municipality)) {
      this.invalidate('municipality', 'El municipio no pertenece al departamento seleccionado');
    }
  }
  next();
});

// Virtual para obtener la tarifa de envío estimada
addressSchema.virtual('estimatedDeliveryFee').get(function() {
  return calculateDeliveryFee(this.department);
});

// Virtual para dirección completa
addressSchema.virtual('fullAddress').get(function() {
  return `${this.address}, ${this.municipality}, ${this.department}`;
});

// Middleware pre-save optimizado
addressSchema.pre('save', async function(next) {
  // Si esta dirección se marca como predeterminada, desmarcar las demás
  if (this.isDefault && this.isModified('isDefault')) {
    await this.constructor.updateMany(
      { 
        user: this.user, 
        _id: { $ne: this._id },
        isDefault: true 
      },
      { $set: { isDefault: false } }
    );
  }
  
  next();
});

// Método estático para obtener la dirección predeterminada
addressSchema.statics.getDefaultForUser = function(userId) {
  return this.findOne({ user: userId, isDefault: true, isActive: true });
};

// Método estático para obtener direcciones del usuario
addressSchema.statics.getUserAddresses = function(userId) {
  return this.find({ user: userId, isActive: true })
    .sort({ isDefault: -1, createdAt: -1 });
};

export default mongoose.model('Address', addressSchema);