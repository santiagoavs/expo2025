import employeeModel from "../models/employees.js";
import bcrypt from "bcryptjs";
import { config } from "../config.js";

export async function ensureSuperAdminExists() {
  const email = config.superadmin.EMAIL;
  const password = config.superadmin.PASSWORD;

  if (!email || !password) {
    console.error("❌ SUPERADMIN_EMAIL o SUPERADMIN_PASSWORD no están definidos en .env");
    return;
  }

  try {
    const existing = await employeeModel.findOne({ email }).select('+password');

    if (!existing) {
      // Validar formato de correo electrónico
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
      if (!emailRegex.test(email)) {
        console.error("❌ El formato del correo electrónico del admin no es válido");
        return;
      }

      // Validar longitud de contraseña
      if (password.length < 6) {
        console.error("❌ La contraseña del admin debe tener al menos 6 caracteres");
        return;
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Crear admin con todos los campos requeridos
      await employeeModel.create({
        name: "AdminDiambars",
        birthday: new Date("1990-01-01"),
        email,
        address: "Oficina Central",
        hireDate: new Date(),
        password: hashedPassword,
        phoneNumber: "00000000", // 8 dígitos para cumplir con la validación
        dui: "00000000-0", // Formato correcto según la validación
        role: "admin", // Usar el formato que espera tu esquema
        active: true,
      });
      console.log("✅ Admin creado desde variables de entorno.");
    } else {
      // Verificar que el usuario existente tenga el rol admin
      if (existing.role.toLowerCase() !== "admin") {
        console.log("⚠️ El usuario con el email de admin existe pero no tiene rol admin. Actualizando...");
        await employeeModel.updateOne({ email }, { role: "admin" });
        console.log("✅ Rol de admin actualizado a admin.");
      } else {
        console.log("🔐 Admin ya existe con rol correcto.");
      }
    }
  } catch (error) {
    console.error("❌ Error al inicializar admin:", error);
  }
}