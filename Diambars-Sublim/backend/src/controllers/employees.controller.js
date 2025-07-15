// employees.controller.js
import employeeModel from "../models/employees.js";
import bcrypt from "bcryptjs";

const employeesController = {};

/**
 * Obtiene todos los empleados activos.
 * Ideal para listados administrativos donde se requieran usuarios habilitados.
 */
employeesController.getEmployees = async (req, res) => {
  try {
    const employees = await employeeModel.find({ active: true });
    return res.status(200).json(employees);
  } catch (error) {
    console.error("Error al obtener empleados:", error);
    return res.status(500).json({ message: "Error interno del servidor", error: error.message });
  }
};

/**
 * Obtiene un empleado por su ID.
 * Devuelve error si el empleado no existe o está inactivo.
 */
employeesController.getEmployeeById = async (req, res) => {
  try {
    const { id } = req.params;
    const employee = await employeeModel.findById(id);

    if (!employee || !employee.active) {
      return res.status(404).json({ message: "Empleado no encontrado o inactivo" });
    }

    return res.status(200).json(employee);
  } catch (error) {
    console.error("Error al obtener empleado por ID:", error);
    return res.status(500).json({ message: "Error interno del servidor", error: error.message });
  }
};

/**
 * Actualiza un empleado sin permitir cambiar la contraseña desde esta ruta.
 * También previene que existan múltiples usuarios con rol "admin".
 */
employeesController.updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const updateFields = { ...req.body };

    // Proteger campo de contraseña
    if (updateFields.password) {
      delete updateFields.password;
    }

    // Verificar que no haya más de un admin
    if (updateFields.role && updateFields.role.toLowerCase() === "admin") {
      const existingAdmin = await employeeModel.findOne({ 
        role: { $regex: new RegExp('^admin$', 'i') }, 
        _id: { $ne: id } 
      });
      if (existingAdmin) {
        return res.status(403).json({ 
          message: "Ya existe un administrador. No se pueden crear más." 
        });
      }
    }

    const updated = await employeeModel.findByIdAndUpdate(id, updateFields, {
      new: true,
      runValidators: true
    });

    if (!updated) {
      return res.status(404).json({ message: "Empleado no encontrado" });
    }

    return res.status(200).json({ message: "Empleado actualizado correctamente", updated });
  } catch (error) {
    console.error("Error al actualizar empleado:", error);
    return res.status(400).json({ message: "Error en la solicitud", error: error.message });
  }
};

/**
 * Cambia la contraseña de un empleado.
 * Verifica permisos: solo admin/manager pueden cambiar contraseñas ajenas sin autenticación previa.
 */
employeesController.changeEmployeePassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: "La contraseña debe tener al menos 6 caracteres" });
    }

    // Validación de permiso: admins o managers pueden cambiar cualquier contraseña
    if (req.user.role.toLowerCase() !== "admin" && 
        req.user.role.toLowerCase() !== "manager" && 
        req.user.id !== id) {
      return res.status(403).json({ message: "No tienes permisos para cambiar la contraseña de otro empleado" });
    }

    const employee = await employeeModel.findById(id).select('+password');
    if (!employee) {
      return res.status(404).json({ message: "Empleado no encontrado" });
    }

    // Si no es admin/manager y cambia su propia contraseña, verificar la actual
    if (req.user.role.toLowerCase() !== "admin" && 
        req.user.role.toLowerCase() !== "manager" && 
        currentPassword) {
      const isMatch = await bcrypt.compare(currentPassword, employee.password);
      if (!isMatch) {
        return res.status(401).json({ message: "La contraseña actual es incorrecta" });
      }
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await employeeModel.findByIdAndUpdate(id, { password: hashedPassword }, { new: true });

    return res.status(200).json({ message: "Contraseña actualizada correctamente" });
  } catch (error) {
    console.error("Error al cambiar contraseña:", error);
    return res.status(500).json({ message: "Error al cambiar la contraseña", error: error.message });
  }
};

/**
 * Inactiva (soft delete) un empleado.
 * No elimina el registro, solo lo desactiva. Protege al superadmin.
 */
employeesController.inactivateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const employee = await employeeModel.findById(id);

    if (!employee) {
      return res.status(404).json({ message: "Empleado no encontrado" });
    }

    // Evitar desactivar al superadmin
    if (employee.email === process.env.SUPERADMIN_EMAIL) {
      return res.status(403).json({ 
        message: "El superadmin no puede ser inactivado" 
      });
    }

    await employeeModel.findByIdAndUpdate(id, { active: false }, { new: true });

    return res.status(200).json({ message: "Empleado inactivado correctamente" });
  } catch (error) {
    console.error("Error al inactivar empleado:", error);
    return res.status(500).json({ message: "Error al inactivar empleado", error: error.message });
  }
};

export default employeesController;
