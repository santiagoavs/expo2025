import mongoose, { Schema } from "mongoose";

const employeeSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    match: [
      /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
      "Por favor, ingrese un nombre válido"
    ]
  },
  birthday: {
    type: Date,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/,
      "Por favor, ingrese un correo electrónico válido"
    ]
  },
  address: {
    type: String,
    required: true,
    trim: true
  },
  hireDate: {
    type: Date,
    required: true
  },
  password: {
    type: String,
    required: true,
    minlength: [6, "La contraseña debe tener al menos 6 caracteres"]
  },
  phoneNumber: {
    type: String,
    required: true,
    match: [
      /^[0-9]{8}$/,
      "El teléfono debe contener exactamente 8 dígitos numéricos"
    ]
  },
  dui: {
    type: String,
    default: null,
    match: [
      /^[0-9]{8}-[0-9]{1}$/,
      "El formato del DUI debe ser 12345678-9"
    ]
  },
  role: {
    type: String,
    enum: ["Employee", "Admin", "Gerente", "Bodeguero"],
    default: "Employee"
  },
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  strict: true
});

// Evita OverwriteModelError 
export default mongoose.models.Employee || mongoose.model("Employee", employeeSchema);
