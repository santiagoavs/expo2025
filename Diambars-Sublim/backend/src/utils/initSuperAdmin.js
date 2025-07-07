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

  const existing = await employeeModel.findOne({ email });

  if (!existing) {
    const hashedPassword = await bcrypt.hash(password, 10);
    await employeeModel.create({
      name: "Super Admin",
      birthday: new Date("1990-01-01"),
      email,
      address: "Oficina Central",
      hireDate: new Date(),
      password: hashedPassword,
      phoneNumber: "00000000",
      dui: "00000000-0",
      role: "Admin",
      active: true,
    });
    console.log("✅ Superadmin creado desde variables de entorno.");
  } else {
    console.log("🔐 Superadmin ya existe.");
  }
}