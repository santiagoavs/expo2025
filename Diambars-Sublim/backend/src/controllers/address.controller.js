import Address from "../models/address.js";
import mongoose from "mongoose";

const addressController = {};

/**
 * Crea una nueva dirección para el usuario
 */
addressController.createAddress = async (req, res) => {
  try {
    const {
      label,
      recipient,
      phoneNumber,
      department,
      municipality,
      address,
      additionalDetails,
      location,
      isDefault
    } = req.body;
    const userId = req.user._id;
    
    // Validaciones básicas
    if (!recipient || !phoneNumber || !department || !municipality || !address) {
      return res.status(400).json({ 
        success: false,
        message: "Faltan campos requeridos en la dirección" 
      });
    }
    
    // Crear nueva dirección
    const newAddress = new Address({
      user: userId,
      label: label || "Mi dirección",
      recipient,
      phoneNumber,
      department,
      municipality,
      address,
      additionalDetails: additionalDetails || "",
      location: location || { type: "Point", coordinates: [0, 0] },
      isDefault: isDefault === true
    });
    
    await newAddress.save();
    
    res.status(201).json({
      success: true,
      message: "Dirección creada exitosamente",
      data: {
        address: newAddress
      }
    });
    
  } catch (error) {
    console.error("Error en createAddress:", error);
    res.status(500).json({ 
      success: false,
      message: "Error al crear la dirección",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obtiene todas las direcciones del usuario
 */
addressController.getUserAddresses = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const addresses = await Address.find({ user: userId })
      .sort({ isDefault: -1, createdAt: -1 });
    
    res.status(200).json({
      success: true,
      data: {
        addresses
      }
    });
    
  } catch (error) {
    console.error("Error en getUserAddresses:", error);
    res.status(500).json({ 
      success: false,
      message: "Error al obtener las direcciones",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Actualiza una dirección existente
 */
addressController.updateAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    
    // Validar ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false,
        message: "ID de dirección inválido" 
      });
    }
    
    // Verificar que la dirección exista y pertenezca al usuario
    const address = await Address.findOne({ _id: id, user: userId });
    
    if (!address) {
      return res.status(404).json({ 
        success: false,
        message: "Dirección no encontrada" 
      });
    }
    
    // Actualizar campos
    const updateableFields = [
      'label', 'recipient', 'phoneNumber', 'department', 
      'municipality', 'address', 'additionalDetails', 'location', 'isDefault'
    ];
    
    updateableFields.forEach(field => {
      if (req.body[field] !== undefined) {
        address[field] = req.body[field];
      }
    });
    
    await address.save();
    
    res.status(200).json({
      success: true,
      message: "Dirección actualizada exitosamente",
      data: {
        address
      }
    });
    
  } catch (error) {
    console.error("Error en updateAddress:", error);
    res.status(500).json({ 
      success: false,
      message: "Error al actualizar la dirección",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Elimina una dirección
 */
addressController.deleteAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    
    // Validar ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false,
        message: "ID de dirección inválido" 
      });
    }
    
    // Verificar que la dirección exista y pertenezca al usuario
    const address = await Address.findOne({ _id: id, user: userId });
    
    if (!address) {
      return res.status(404).json({ 
        success: false,
        message: "Dirección no encontrada" 
      });
    }
    
    // Si es la dirección predeterminada, establecer otra como predeterminada
    if (address.isDefault) {
      const nextDefault = await Address.findOne({ 
        user: userId, 
        _id: { $ne: id }
      });
      
      if (nextDefault) {
        nextDefault.isDefault = true;
        await nextDefault.save();
      }
    }
    
    await Address.findByIdAndDelete(id);
    
    res.status(200).json({
      success: true,
      message: "Dirección eliminada exitosamente"
    });
    
  } catch (error) {
    console.error("Error en deleteAddress:", error);
    res.status(500).json({ 
      success: false,
      message: "Error al eliminar la dirección",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Establece una dirección como predeterminada
 */
addressController.setDefaultAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    
    // Validar ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false,
        message: "ID de dirección inválido" 
      });
    }
    
    // Verificar que la dirección exista y pertenezca al usuario
    const address = await Address.findOne({ _id: id, user: userId });
    
    if (!address) {
      return res.status(404).json({ 
        success: false,
        message: "Dirección no encontrada" 
      });
    }
    
    // Desmarcar la dirección predeterminada actual
    await Address.updateMany(
      { user: userId, isDefault: true },
      { $set: { isDefault: false } }
    );
    
    // Marcar la nueva dirección predeterminada
    address.isDefault = true;
    await address.save();
    
    res.status(200).json({
      success: true,
      message: "Dirección establecida como predeterminada",
      data: {
        address
      }
    });
    
  } catch (error) {
    console.error("Error en setDefaultAddress:", error);
    res.status(500).json({ 
      success: false,
      message: "Error al establecer la dirección predeterminada",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export default addressController;