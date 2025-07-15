import mongoose from 'mongoose';
// Modelo de dirección
// Este modelo representa las direcciones de los usuarios en la base de datos
const addressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  street: {
    type: String,
    required: true,
    trim: true
  },
  city: {
    type: String,
    required: true,
    trim: true
  },
  state: {
    type: String,
    trim: true
  },
  postalCode: {
    type: String,
    required: true,
    match: /^[0-9]{4,10}$/
  },
  country: {
    type: String,
    default: 'El Salvador',
    trim: true
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  phoneContact: {  // Para indicaciones de entrega
    type: String,
    match: /^[0-9]{8,15}$/
  }
}, { timestamps: true });

// Auto-gestión de dirección principal
addressSchema.pre('save', async function(next) {
  if (this.isDefault) {
    await mongoose.model('Address').updateMany(
      { user: this.user, _id: { $ne: this._id } },
      { $set: { isDefault: false } }
    );
  }
  next();
});

export default mongoose.models.Address || mongoose.model('Address', addressSchema);