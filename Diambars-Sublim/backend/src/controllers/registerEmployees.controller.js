import employeesModel from "../models/employees.js";
import bcryptjs from "bcryptjs";
import { validateEmail, isDisposableEmail } from "../utils/emailValidator.js"; // Validación avanzada de correos

const registerEmployeesController = {};

/**
 * Registra un nuevo empleado en la base de datos.
 * Realiza validaciones de campos obligatorios, correos válidos,
 * evita correos desechables y administra unicidad de correo y DUI.
 * También impide que se registren múltiples administradores.
 */
registerEmployeesController.registerEmployee = async (req, res) => {
  const {
    name,
    birthday,
    email,
    address,
    hireDate,
    password,
    phoneNumber,
    dui,
    role,
    active 
  } = req.body;

  // Validación de campos requeridos
  if (
    !name || !birthday || !email || !address ||
    !hireDate || !password || !phoneNumber || !dui
  ) {
    return res.status(400).json({ 
      message: "Todos los campos son obligatorios." 
    });
  }

  try {
    // Validar formato y existencia del dominio del correo
    const isValidEmail = await validateEmail(email);
    if (!isValidEmail) {
      return res.status(400).json({ 
        message: "El correo electrónico no es válido o su dominio no existe." 
      });
    }

    // Bloquear correos temporales/desechables
    if (isDisposableEmail(email)) {
      return res.status(400).json({ 
        message: "No se permiten correos temporales o desechables. Por favor, utiliza un correo permanente." 
      });
    }

    // Verificar si ya existe el correo
    const existingByEmail = await employeesModel.findOne({ email });
    if (existingByEmail) {
      return res.status(400).json({ 
        message: "El correo ya está registrado." 
      });
    }

    // Verificar si ya existe el DUI
    const existingByDui = await employeesModel.findOne({ dui });
    if (existingByDui) {
      return res.status(400).json({ 
        message: "El DUI ya está registrado." 
      });
    }

    // Verificar si ya existe un administrador
    if (role && role.toLowerCase() === "admin") {
      const existingAdmin = await employeesModel.findOne({ 
        role: { $regex: /^admin$/i } 
      });

      if (existingAdmin) {
        return res.status(403).json({ 
          message: "Ya existe un administrador. No se pueden crear más." 
        });
      }
    }

    // Hashear la contraseña
    const passwordHash = await bcryptjs.hash(password, 10);

    // Crear nuevo empleado
    const newEmployee = new employeesModel({
      name: name.trim(),
      birthday,
      email: email.toLowerCase().trim(),
      address: address.trim(),
      hireDate,
      password: passwordHash,
      phoneNumber: phoneNumber.trim(),
      dui: dui.trim(),
      role: (role || "employee").toLowerCase(),
      active: active !== undefined ? active : true
    });

    // Guardar en la base de datos
    await newEmployee.save();

    // Respuesta exitosa
    return res.status(201).json({
      message: "Empleado registrado correctamente",
      employeeId: newEmployee._id,
      employeeName: newEmployee.name,
      employeeRole: newEmployee.role
    });

  } catch (error) {
    // Manejo de errores inesperados
    console.error("Error en el registro:", error);
    return res.status(500).json({ 
      message: "Error interno del servidor", 
      error: error.message 
    });
  }
};

export default registerEmployeesController;
