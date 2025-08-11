import mongoose from 'mongoose';

// Schema de usuario actualizado
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    match: [
      /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
      "Por favor, ingrese un nombre válido"
    ]
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: [
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/,
      "Por favor, ingrese un correo electrónico válido"
    ],
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: [6, "La contraseña debe tener al menos 6 caracteres"],
    select: false
  },
  phoneNumber: {
    type: String,
    required: false, // Hacer opcional
    match: [
      /^[0-9]{8}$/,
      "El teléfono debe contener exactamente 8 dígitos numéricos"
    ]
  },
  role: {
    type: String,
    enum: ['customer', 'premium', 'admin'],
    default: 'customer'
  },
  defaultAddress: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Address'
  },
  wishlist: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  verified: {
    type: Boolean,
    default: false
  },
  active: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: null
  },
  avatar: {
    type: String,
    default: null
  },
  verificationToken: {
    type: String,
    select: false
  },
  verificationExpires: {
    type: Date,
    select: false
  },
  recoveryData: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
}, { 
  timestamps: true,
  toJSON: { 
    virtuals: true,
    transform: function(doc, ret) {
      // Agregar permisos basados en el rol
      ret.permissions = getUserPermissions(ret.role);
      return ret;
    }
  }
});

// Función para obtener permisos basados en el rol
function getUserPermissions(role) {
  const permissions = {
    customer: ['catalog', 'orders', 'profile'],
    premium: ['catalog', 'orders', 'profile', 'discounts', 'priority_support'],
    admin: ['users', 'orders', 'catalog', 'reports', 'settings', 'discounts', 'analytics']
  };
  
  return permissions[role] || permissions.customer;
}

// Virtual para obtener direcciones relacionadas
userSchema.virtual('addresses', {
  ref: 'Address',
  localField: '_id',
  foreignField: 'user'
});

// Método para actualizar último login
userSchema.methods.updateLastLogin = function() {
  this.lastLogin = new Date();
  return this.save({ validateBeforeSave: false });
};

// Método estático para obtener permisos
userSchema.statics.getPermissionsByRole = function(role) {
  return getUserPermissions(role);
};

// Evitar errores de overwriting del modelo
export default mongoose.models.User || mongoose.model('User', userSchema);