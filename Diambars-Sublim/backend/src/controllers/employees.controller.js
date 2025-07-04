import employeeModel from "../models/employees.js";
import bcrypt from "bcryptjs";

const employeesController = {};

//GET: Obtener todos los empleados activos
employeesController.getEmployees = async (req, res) => {
  try {
    const employees = await employeeModel.find({ active: true });
    return res.status(200).json(employees);
  } catch (error) {
    console.error("Error al obtener empleados:", error);
    return res.status(500).json({ message: "Error interno del servidor", error: error.message });
  }
};

//GET: Obtener un empleado por ID
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

//PUT: Actualizar empleado (no se permite cambiar contraseña aquí)
employeesController.updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const updateFields = { ...req.body };

    if (updateFields.password) {
      delete updateFields.password;
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

//PATCH: Cambiar contraseña
employeesController.changePassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: "La contraseña debe tener al menos 6 caracteres" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const updated = await employeeModel.findByIdAndUpdate(id, { password: hashedPassword }, { new: true });

    if (!updated) {
      return res.status(404).json({ message: "Empleado no encontrado" });
    }

    return res.status(200).json({ message: "Contraseña actualizada correctamente" });
  } catch (error) {
    console.error("Error al cambiar contraseña:", error);
    return res.status(500).json({ message: "Error al cambiar la contraseña", error: error.message });
  }
};

//DELETE (soft): Inactivar empleado
employeesController.inactivateEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    const updated = await employeeModel.findByIdAndUpdate(id, { active: false }, { new: true });

    if (!updated) {
      return res.status(404).json({ message: "Empleado no encontrado" });
    }

    return res.status(200).json({ message: "Empleado inactivado correctamente" });
  } catch (error) {
    console.error("Error al inactivar empleado:", error);
    return res.status(500).json({ message: "Error al inactivar empleado", error: error.message });
  }
};

export default employeesController;
