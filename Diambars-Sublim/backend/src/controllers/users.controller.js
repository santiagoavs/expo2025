import userModel from "../models/users.js";
import bcrypt from "bcryptjs";

const usersController = {};

//GET: Obtener todos los usuarios activos
usersController.getUsers = async (req, res) => {
  try {
    const users = await userModel.find({ active: true });
    return res.status(200).json(users);
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    return res.status(500).json({ message: "Error interno del servidor", error: error.message });
  }
};

//GET: Obtener un usuario por ID
usersController.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await userModel.findById(id);

    if (!user || !user.active) {
      return res.status(404).json({ message: "Usuario no encontrado o inactivo" });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error("Error al obtener usuario por ID:", error);
    return res.status(500).json({ message: "Error interno del servidor", error: error.message });
  }
};

//PUT: Actualizar usuario (no se permite cambiar contraseña aquí)
usersController.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updateFields = { ...req.body };

    // No permitir cambiar contraseña mediante esta ruta
    if (updateFields.password) {
      delete updateFields.password;
    }

    // Evitar cambio de rol a admin si ya existe un admin
    if (updateFields.role === 'admin') {
      const existingAdmin = await userModel.findOne({ role: 'admin', _id: { $ne: id } });
      if (existingAdmin) {
        return res.status(403).json({ message: "Ya existe un administrador. No se pueden crear más." });
      }
    }

    const updated = await userModel.findByIdAndUpdate(id, updateFields, {
      new: true,
      runValidators: true
    });

    if (!updated) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    return res.status(200).json({ message: "Usuario actualizado correctamente", updated });
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    return res.status(400).json({ message: "Error en la solicitud", error: error.message });
  }
};

//PATCH: Cambiar contraseña
usersController.changeUserPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: "La contraseña debe tener al menos 6 caracteres" });
    }

    // Obtener usuario con password para verificar
    const user = await userModel.findById(id).select('+password');
    
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Si se proporciona contraseña actual, verificarla
    if (currentPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: "La contraseña actual es incorrecta" });
      }
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const updated = await userModel.findByIdAndUpdate(id, { password: hashedPassword }, { new: true });

    return res.status(200).json({ message: "Contraseña actualizada correctamente" });
  } catch (error) {
    console.error("Error al cambiar contraseña:", error);
    return res.status(500).json({ message: "Error al cambiar la contraseña", error: error.message });
  }
};

//GET: Obtener wishlist del usuario
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

//PATCH: Agregar producto a wishlist
usersController.addToWishlist = async (req, res) => {
  try {
    const { id } = req.params;
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ message: "ID de producto requerido" });
    }

    const updated = await userModel.findByIdAndUpdate(
      id,
      { $addToSet: { wishlist: productId } }, // $addToSet evita duplicados
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

//PATCH: Eliminar producto de wishlist
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

//GET: Obtener direcciones del usuario
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

//PATCH: Establecer dirección predeterminada
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

//DELETE (soft): Inactivar usuario
usersController.inactivateUser = async (req, res) => {
  try {
    const { id } = req.params;

    const updated = await userModel.findByIdAndUpdate(id, { active: false }, { new: true });

    if (!updated) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    return res.status(200).json({ message: "Usuario inactivado correctamente" });
  } catch (error) {
    console.error("Error al inactivar usuario:", error);
    return res.status(500).json({ message: "Error al inactivar usuario", error: error.message });
  }
};

export default usersController;