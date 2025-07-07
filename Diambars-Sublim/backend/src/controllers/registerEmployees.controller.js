import employeesModel from "../models/employees.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { config } from "../config.js";

const registerEmployeesController = {};

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
    Role, 
    active 
  } = req.body;

  // Validación de campos requeridos
  if (!name || !birthday || !email || !address || !hireDate || !password || !phoneNumber || !dui) {
    return res.status(400).json({ message: "Todos los campos son obligatorios." });
  }

  try {
    // Validar si ya existe un empleado con el mismo correo o DUI
    const existingByEmail = await employeesModel.findOne({ email });
    const existingByDui = await employeesModel.findOne({ dui });

    if (existingByEmail) {
      return res.status(400).json({ message: "El correo ya está registrado." });
    }

    if (existingByDui) {
      return res.status(400).json({ message: "El DUI ya está registrado." });
    }

    // Validación de formato ya la maneja el schema, pero podés meter lógica extra aquí si querés

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
      Role: Role || "Employee", // por defecto si no se manda
      active: active !== undefined ? active : true
    });

    await newEmployee.save();

    // Crear token de autenticación
    jwt.sign(
      {
        id: newEmployee._id,
        role: newEmployee.Role,
        email: newEmployee.email
      },
      config.JWT.secret,
      { expiresIn: config.JWT.expiresIn },
      (error, token) => {
        if (error) {
          console.error("Error generando token:", error);
          return res.status(500).json({ message: "Error al generar el token" });
        }

        res.cookie("authToken", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 30 * 24 * 60 * 60 * 1000 // 30 días
        });

        return res.status(201).json({
          message: "Empleado registrado correctamente",
          token,
          employeeId: newEmployee._id
        });
      }
    );
  } catch (error) {
    console.error("Error en el registro:", error);
    return res.status(500).json({ message: "Error interno del servidor", error: error.message });
  }
};

export default registerEmployeesController;
