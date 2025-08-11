import userModel from "../models/users.js";
import bcrypt from "bcryptjs";

const usersController = {};

/**
 * GET: Obtiene todos los usuarios (activos e inactivos).
 */
usersController.getUsers = async (req, res) => {
  try {
    // Quitar el filtro { active: true } para mostrar todos los usuarios
    const users = await userModel.find({});
    console.log(`[getUsers] Encontrados ${users.length} usuarios`);
    return res.status(200).json(users);
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    return res.status(500).json({ message: "Error interno del servidor", error: error.message });
  }
};

/**
 * GET: Obtiene un usuario por su ID.
 */
usersController.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`[getUserById] Buscando usuario con ID: ${id}`);
    
    const user = await userModel.findById(id);

    if (!user) {
      console.log(`[getUserById] Usuario no encontrado: ${id}`);
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    console.log(`[getUserById] Usuario encontrado: ${user.email}`);
    return res.status(200).json(user);
  } catch (error) {
    console.error("Error al obtener usuario por ID:", error);
    return res.status(500).json({ message: "Error interno del servidor", error: error.message });
  }
};

/**
 * POST: Crea un nuevo usuario.
 */
usersController.createUser = async (req, res) => {
  try {
    console.log("[createUser] Datos recibidos:", req.body);
    
    const { name, email, password, phoneNumber, phone, role = 'customer', active = true } = req.body;
    
    // Manejar tanto phoneNumber como phone para compatibilidad con frontend
    const finalPhoneNumber = phoneNumber || phone;

    // Validaciones básicas
    if (!name || !email || !password) {
      console.log("[createUser] Faltan campos obligatorios:", { name: !!name, email: !!email, password: !!password });
      return res.status(400).json({ message: "Nombre, email y contraseña son requeridos" });
    }

    // Verificar si el email ya existe
    const existingUser = await userModel.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      console.log("[createUser] Email ya existe:", email);
      return res.status(400).json({ message: "El email ya está registrado" });
    }

    // Validación para rol de administrador único
    if (role === 'admin') {
      const existingAdmin = await userModel.findOne({ role: 'admin' });
      if (existingAdmin) {
        console.log("[createUser] Ya existe un admin");
        return res.status(403).json({ message: "Ya existe un administrador. No se pueden crear más." });
      }
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuario
    const newUser = new userModel({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      phoneNumber: finalPhoneNumber,
      role,
      active: active !== false, // Asegurar que sea boolean
      verified: true // Los usuarios creados por admin están verificados
    });

    console.log("[createUser] Creando usuario:", { name, email, role, active: newUser.active });
    
    const savedUser = await newUser.save();

    // Remover password de la respuesta
    const userResponse = savedUser.toJSON();
    delete userResponse.password;

    console.log("[createUser] Usuario creado exitosamente:", savedUser._id);

    return res.status(201).json({ 
      message: "Usuario creado correctamente", 
      user: userResponse 
    });
  } catch (error) {
    console.error("Error al crear usuario:", error);
    
    // Manejar errores de validación de Mongoose
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: "Error de validación", 
        errors: validationErrors,
        error: error.message 
      });
    }
    
    return res.status(400).json({ message: "Error al crear usuario", error: error.message });
  }
};

/**
 * PUT: Actualiza los datos del usuario, excluyendo la contraseña.
 * También previene la creación de múltiples administradores.
 */
usersController.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updateFields = { ...req.body };

    console.log("[updateUser] Actualizando usuario:", id, "con datos:", updateFields);

    // Evitar actualización de contraseña por esta ruta
    if (updateFields.password) {
      delete updateFields.password;
    }

    // Manejar phoneNumber/phone compatibility
    if (updateFields.phone && !updateFields.phoneNumber) {
      updateFields.phoneNumber = updateFields.phone;
      delete updateFields.phone;
    }

    // Validación para rol de administrador único
    if (updateFields.role === 'admin') {
      const existingAdmin = await userModel.findOne({ role: 'admin', _id: { $ne: id } });
      if (existingAdmin) {
        console.log("[updateUser] Ya existe otro admin");
        return res.status(403).json({ message: "Ya existe un administrador. No se pueden crear más." });
      }
    }

    // Validar email único si se está cambiando
    if (updateFields.email) {
      const existingUser = await userModel.findOne({ 
        email: updateFields.email.toLowerCase(), 
        _id: { $ne: id } 
      });
      if (existingUser) {
        console.log("[updateUser] Email ya existe:", updateFields.email);
        return res.status(400).json({ message: "El email ya está en uso por otro usuario" });
      }
      updateFields.email = updateFields.email.toLowerCase();
    }

    const updated = await userModel.findByIdAndUpdate(id, updateFields, {
      new: true,
      runValidators: true
    });

    if (!updated) {
      console.log("[updateUser] Usuario no encontrado:", id);
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    console.log("[updateUser] Usuario actualizado exitosamente:", updated.email);

    return res.status(200).json({ message: "Usuario actualizado correctamente", user: updated });
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    
    // Manejar errores de validación de Mongoose
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: "Error de validación", 
        errors: validationErrors,
        error: error.message 
      });
    }
    
    return res.status(400).json({ message: "Error en la solicitud", error: error.message });
  }
};

/**
 * PATCH: Cambia el estado activo/inactivo de un usuario.
 */
usersController.updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { active } = req.body;

    console.log("[updateUserStatus] Cambiando estado del usuario:", id, "a:", active);

    if (typeof active !== 'boolean') {
      console.log("[updateUserStatus] Tipo de dato incorrecto para active:", typeof active);
      return res.status(400).json({ message: "El campo 'active' debe ser un boolean (true/false)" });
    }

    const updated = await userModel.findByIdAndUpdate(
      id,
      { active },
      { new: true, runValidators: true }
    );

    if (!updated) {
      console.log("[updateUserStatus] Usuario no encontrado:", id);
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const statusText = active ? 'activado' : 'desactivado';
    console.log("[updateUserStatus] Usuario", statusText, "exitosamente:", updated.email);
    
    return res.status(200).json({ 
      message: `Usuario ${statusText} correctamente`, 
      user: updated 
    });
  } catch (error) {
    console.error("Error al actualizar estado del usuario:", error);
    return res.status(500).json({ message: "Error al actualizar estado", error: error.message });
  }
};

/**
 * PATCH: Cambia la contraseña de un usuario.
 * Requiere validación de la contraseña actual si se proporciona.
 */
usersController.changeUserPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: "La contraseña debe tener al menos 6 caracteres" });
    }

    const user = await userModel.findById(id).select('+password');
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Verificación de la contraseña actual
    if (currentPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: "La contraseña actual es incorrecta" });
      }
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await userModel.findByIdAndUpdate(id, { password: hashedPassword }, { new: true });

    return res.status(200).json({ message: "Contraseña actualizada correctamente" });
  } catch (error) {
    console.error("Error al cambiar contraseña:", error);
    return res.status(500).json({ message: "Error al cambiar la contraseña", error: error.message });
  }
};

/**
 * GET: Obtiene la lista de deseos (wishlist) del usuario.
 */
usersController.getUserWishlist = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await userModel.findById(id).populate('wishlist');

    if (!user || !user.active) {
      return res.status(404).json({ message: "Usuario no encontrado o inactivo" });
    }

    return res.status(200).json(user.wishlist);
  } catch (error) {
    console.error("Error al obtener wishlist:", error);
    return res.status(500).json({ message: "Error interno del servidor", error: error.message });
  }
};

/**
 * PATCH: Añade un producto a la wishlist del usuario.
 */
usersController.addToWishlist = async (req, res) => {
  try {
    const { id } = req.params;
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ message: "ID de producto requerido" });
    }

    const updated = await userModel.findByIdAndUpdate(
      id,
      { $addToSet: { wishlist: productId } },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    return res.status(200).json({ message: "Producto añadido a wishlist correctamente" });
  } catch (error) {
    console.error("Error al agregar a wishlist:", error);
    return res.status(500).json({ message: "Error al actualizar wishlist", error: error.message });
  }
};

/**
 * PATCH: Elimina un producto de la wishlist del usuario.
 */
usersController.removeFromWishlist = async (req, res) => {
  try {
    const { id } = req.params;
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ message: "ID de producto requerido" });
    }

    const updated = await userModel.findByIdAndUpdate(
      id,
      { $pull: { wishlist: productId } },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    return res.status(200).json({ message: "Producto eliminado de wishlist correctamente" });
  } catch (error) {
    console.error("Error al eliminar de wishlist:", error);
    return res.status(500).json({ message: "Error al actualizar wishlist", error: error.message });
  }
};

/**
 * GET: Obtiene las direcciones del usuario.
 */
usersController.getUserAddresses = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await userModel.findById(id).populate('addresses');

    if (!user || !user.active) {
      return res.status(404).json({ message: "Usuario no encontrado o inactivo" });
    }

    return res.status(200).json(user.addresses);
  } catch (error) {
    console.error("Error al obtener direcciones:", error);
    return res.status(500).json({ message: "Error interno del servidor", error: error.message });
  }
};

/**
 * PATCH: Establece una dirección como predeterminada para el usuario.
 */
usersController.setDefaultAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const { addressId } = req.body;

    if (!addressId) {
      return res.status(400).json({ message: "ID de dirección requerido" });
    }

    const updated = await userModel.findByIdAndUpdate(
      id,
      { defaultAddress: addressId },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    return res.status(200).json({ message: "Dirección predeterminada actualizada correctamente" });
  } catch (error) {
    console.error("Error al actualizar dirección predeterminada:", error);
    return res.status(500).json({ message: "Error al actualizar dirección", error: error.message });
  }
};

/**
 * DELETE (soft): Inactiva a un usuario en lugar de eliminarlo permanentemente.
 */
usersController.inactivateUser = async (req, res) => {
  try {
    const { id } = req.params;

    const updated = await userModel.findByIdAndUpdate(
      id,
      { active: false },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    return res.status(200).json({ message: "Usuario inactivado correctamente" });
  } catch (error) {
    console.error("Error al inactivar usuario:", error);
    return res.status(500).json({ message: "Error al inactivar usuario", error: error.message });
  }
};

/**
 * PUT: Actualiza el perfil del usuario autenticado
 */
usersController.updateOwnProfile = async (req, res) => {
  try {
    const userId = req.user.id; // Del token JWT
    const updateFields = { ...req.body };

    console.log("[updateOwnProfile] Usuario ID del token:", userId);
    console.log("[updateOwnProfile] Datos del req.user:", req.user);
    console.log("[updateOwnProfile] Campos a actualizar:", updateFields);

    // Evitar actualización de campos sensibles
    delete updateFields.password;
    delete updateFields.role;
    delete updateFields.active;

    // Buscar el usuario actual
    const currentUser = await userModel.findById(userId);
    if (!currentUser) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Si cambia el email, marcar como no verificado
    if (updateFields.email && updateFields.email.toLowerCase() !== currentUser.email.toLowerCase()) {
      console.log("[updateOwnProfile] Email cambió, marcando como no verificado");
      updateFields.verified = false;
    }

    // Actualizar el usuario
    const updated = await userModel.findByIdAndUpdate(userId, updateFields, {
      new: true,
      runValidators: true
    });

    console.log("[updateOwnProfile] Usuario actualizado:", updated);

    return res.status(200).json({ 
      message: "Perfil actualizado correctamente", 
      user: updated 
    });
  } catch (error) {
    console.error("[updateOwnProfile] Error:", error);
    return res.status(500).json({ 
      message: "Error al actualizar perfil", 
      error: error.message 
    });
  }
};

export default usersController;