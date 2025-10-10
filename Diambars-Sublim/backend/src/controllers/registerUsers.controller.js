import userModel from "../models/users.js";
import bcryptjs from "bcryptjs";
import crypto from "crypto";
import { config } from "../config.js";
import { sendVerificationEmail } from "../services/email/email.service.js";
import { validateEmail, isDisposableEmail } from "../utils/emailValidator.js";

const registerUsersController = {};

/**
 * Controlador para registrar un nuevo usuario.
 * Realiza validaciones de campos obligatorios, correo electrónico,
 * rol y evita duplicaciones. También genera token de verificación
 * y envía correo al usuario.
 */
registerUsersController.registerUser = async (req, res) => {
  console.log('[registerUser] Datos recibidos:', req.body);
  
  const {
    name,
    email,
    password,
    phone,           // Campo del frontend público
    phoneNumber,     // Campo del dashboard admin
    address,         // Campo adicional del frontend público
    role
  } = req.body;

  // Validación de campos obligatorios
  if (!name || !email || !password) {
    console.log('[registerUser] Faltan campos obligatorios');
    return res.status(400).json({ 
      message: "Nombre, email y contraseña son obligatorios." 
    });
  }

  try {
    // Validar el formato y dominio del correo electrónico
    const isValidEmail = await validateEmail(email);
    if (!isValidEmail) {
      console.log('[registerUser] Email inválido:', email);
      return res.status(400).json({ 
        message: "El correo electrónico no es válido o su dominio no existe." 
      });
    }

    // Bloquear correos temporales o desechables
    if (isDisposableEmail(email)) {
      console.log('[registerUser] Email desechable detectado:', email);
      return res.status(400).json({ 
        message: "No se permiten correos temporales o desechables. Por favor, utiliza un correo permanente." 
      });
    }

    // Verificar si ya existe un usuario con el mismo correo
    const existingByEmail = await userModel.findOne({ email: email.toLowerCase() });
    if (existingByEmail) {
      console.log('[registerUser] Email ya existe:', email);
      return res.status(400).json({ 
        message: "El correo ya está registrado." 
      });
    }

    // Prohibir registro de usuarios con rol admin
    if (role === "admin") {
      console.log('[registerUser] Intento de registrar usuario admin rechazado');
      return res.status(403).json({ 
        message: "No se pueden registrar usuarios con rol de administrador desde este flujo." 
      });
    }

    // Generar token de verificación con fecha de expiración (24h)
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Hashear la contraseña antes de guardar
    const passwordHash = await bcryptjs.hash(password, 10);

    // Compatibilidad: usar phone o phoneNumber según lo que venga
    const finalPhoneNumber = phoneNumber || phone;

    // Crear instancia del nuevo usuario
    const newUser = new userModel({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: passwordHash,
      phoneNumber: finalPhoneNumber ? finalPhoneNumber.trim() : undefined,
      role: role || "customer",
      active: true,
      verified: false,
      verificationToken,
      verificationExpires,
      // Guardar address si viene del frontend público (para futuras implementaciones)
      ...(address && { address: address.trim() })
    });

    console.log('[registerUser] Creando usuario:', {
      name: newUser.name,
      email: newUser.email,
      phoneNumber: newUser.phoneNumber,
      role: newUser.role
    });

    // Guardar usuario en la base de datos
    await newUser.save();

    // Enviar correo de verificación
    try {
      await sendVerificationEmail(email, verificationToken, name);
      console.log('[registerUser] Correo de verificación enviado');
    } catch (emailError) {
      console.error("Error al enviar correo de verificación:", emailError);
      // El registro continúa, solo se reporta el error en consola
    }

    console.log('[registerUser] Usuario registrado exitosamente:', newUser._id);

    // Respuesta exitosa sin generar sesión ni token aún
    return res.status(201).json({
      message: "Usuario registrado correctamente. Por favor, verifica tu correo electrónico para activar tu cuenta.",
      userId: newUser._id,
      email: email.toLowerCase().trim() // Para redirección en frontend
    });

  } catch (error) {
    console.error("Error en el registro:", error);
    
    // Manejar errores de validación de Mongoose
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: "Error de validación", 
        errors: validationErrors,
        error: error.message 
      });
    }
    
    return res.status(500).json({ 
      message: "Error interno del servidor", 
      error: error.message 
    });
  }
};

export default registerUsersController;