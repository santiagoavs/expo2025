import mongoose from 'mongoose';

// Esquema para direcciones guardadas de usuarios
const addressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  label: { 
    type: String,
    required: true,
    trim: true
  }, // "Casa", "Oficina", etc.
  recipient: { 
    type: String, 
    required: true, 
    trim: true 
  },
  phoneNumber: { 
    type: String, 
    required: true, 
    trim: true 
  },
  department: { 
    type: String, 
    required: true, 
    trim: true 
  },
  municipality: { 
    type: String, 
    required: true, 
    trim: true 
  },
  address: { 
    type: String, 
    required: true, 
    trim: true 
  },
  additionalDetails: { 
    type: String, 
    trim: true 
  },
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
  isDefault: { 
    type: Boolean, 
    default: false 
  }
}, { 
  timestamps: true 
});

// Índices
addressSchema.index({ user: 1, isDefault: -1 });
addressSchema.index({ location: '2dsphere' });

// Asegurar que solo haya una dirección predeterminada por usuario
addressSchema.pre('save', async function(next) {
  if (this.isDefault) {
    await mongoose.model('Address').updateMany(
      { user: this.user, _id: { $ne: this._id } },
      { $set: { isDefault: false } }
    );
  }
  next();
});

export default mongoose.model('Address', addressSchema);