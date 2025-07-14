import mongoose from 'mongoose';

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
    select: false  // No devuelve password en consultas
  },
  phoneNumber: {  // Nombre estandarizado con el modelo de empleados
    type: String,
    match: [
      /^[0-9]{8}$/,
      "El teléfono debe contener exactamente 8 dígitos numéricos"
    ]
  },
  role: {
    type: String,
    enum: ['customer', 'premium', 'admin'],  // Mantén la nomenclatura en minúscula
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
    verificationToken: {
    type: String,
    select: false
  },
    verificationExpires: {
    type: Date,
    select: false
  },
    verified: {
    type: Boolean,
    default: false
},
recoveryData: {
  type: mongoose.Schema.Types.Mixed,
  default: null
},
}, { 
  timestamps: true,
  toJSON: { virtuals: true }
});

// Virtual para obtener direcciones relacionadas
userSchema.virtual('addresses', {
  ref: 'Address',
  localField: '_id',
  foreignField: 'user'
});

// Evitar errores de overwriting del modelo
export default mongoose.models.User || mongoose.model('User', userSchema);