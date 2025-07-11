import userModel from "../models/users.js";
import bcryptjs from "bcryptjs";
import crypto from "crypto";
import { config } from "../config.js";
import { sendVerificationEmail } from "../utils/emailService.js";
import { validateEmail, isDisposableEmail } from "../utils/emailValidator.js";

const registerUsersController = {};

registerUsersController.registerUser = async (req, res) => {
  const {
    name,
    email,
    password,
    phoneNumber,
    role
  } = req.body;

  // Validación de campos requeridos
  if (!name || !email || !password) {
    return res.status(400).json({ message: "Nombre, email y contraseña son obligatorios." });
  }

  try {
    // Validar formato y dominio del correo electrónico
    const isValidEmail = await validateEmail(email);
    if (!isValidEmail) {
      return res.status(400).json({ 
        message: "El correo electrónico no es válido o su dominio no existe." 
      });
    }

    // Opcional: Bloquear correos temporales/desechables
    if (isDisposableEmail(email)) {
      return res.status(400).json({ 
        message: "No se permiten correos temporales o desechables. Por favor, utiliza un correo permanente." 
      });
    }

    // Validar si ya existe un usuario con el mismo correo
    const existingByEmail = await userModel.findOne({ email });

    if (existingByEmail) {
      return res.status(400).json({ message: "El correo ya está registrado." });
    }

    // Verificar si está intentando registrar un admin cuando ya existe uno
    if (role === "admin") {
      const existingAdmin = await userModel.findOne({ 
        role: { $regex: new RegExp('^admin$', 'i') } 
      });
      
      if (existingAdmin) {
        return res.status(403).json({ 
          message: "Ya existe un administrador. No se pueden crear más." 
        });
      }
    }

    // Generar token de verificación
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas

    // Hashear la contraseña
    const passwordHash = await bcryptjs.hash(password, 10);

    // Crear nuevo usuario
    const newUser = new userModel({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: passwordHash,
      phoneNumber: phoneNumber ? phoneNumber.trim() : undefined,
      role: role || "customer", // por defecto si no se manda
      active: true,
      verified: false, // Por defecto, requiere verificación
      verificationToken, 
      verificationExpires
    });

    await newUser.save();

    // Enviar correo de verificación
    try {
      await sendVerificationEmail(email, verificationToken, name);
    } catch (emailError) {
      console.error("Error al enviar correo de verificación:", emailError);
      // No fallamos la petición por un error en el envío del correo
      // Pero lo registramos para seguimiento
    }

    // No generar token de sesión ni cookies
    // Solo devolver una respuesta exitosa
    return res.status(201).json({
      message: "Usuario registrado correctamente. Por favor, verifica tu correo electrónico para activar tu cuenta.",
      userId: newUser._id
    });

  } catch (error) {
    console.error("Error en el registro:", error);
    return res.status(500).json({ message: "Error interno del servidor", error: error.message });
  }
};

export default registerUsersController;