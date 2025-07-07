import employeesModel from "../models/employees.js";
import bcryptjs from "bcryptjs";
import jsonwebtoken from "jsonwebtoken";
import { config } from "../config.js";

const loginEmployeesController = {
  login: async (req, res) => {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ message: "Email y contraseña son requeridos." });
    }

    try {
      const userFound = await employeesModel.findOne({ email }).select("+password");
      if (!userFound) {
        return res.status(401).json({ message: "Credenciales incorrectas." });
      }

      const isMatch = await bcryptjs.compare(password, userFound.password);
      if (!isMatch) {
        return res.status(401).json({ message: "Credenciales incorrectas." });
      }

      if (!userFound.active) {
        return res.status(403).json({ message: "Cuenta desactivada." });
      }

      const userRole = userFound.role; // ojo: es .role, no .Role
      const userId = userFound._id;

      const allowedRoles = ["Admin", "Gerente", "Employee", "Bodeguero"];
      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({ message: "Rol no autorizado." });
      }

      const token = jsonwebtoken.sign(
        { id: userId, role: userRole, email },
        config.JWT.secret,
        { expiresIn: config.JWT.expiresIn }
      );

      res.cookie("authToken", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });

      return res.status(200).json({
        message: "Login exitoso",
        id: userId,
        role: userRole,
        email
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({
        message: "Error interno del servidor",
        error: process.env.NODE_ENV === "development" ? error.message : undefined
      });
    }
  }
};

export default loginEmployeesController;