// controllers/address.controller.js - Controlador optimizado
import Address from "../models/address.js";
import mongoose from "mongoose";
import { 
  validateDepartmentAndMunicipality,
  calculateDeliveryFee,
  getDeliveryFeesMap,
  getDeliveryOptions,
  getLocationData,
  DELIVERY_CONFIG
} from "../utils/locationUtils.js";

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
        message: "Faltan campos requeridos en la dirección",
        error: 'MISSING_REQUIRED_FIELDS'
      });
    }
    
    // Validar departamento y municipio usando utilidad centralizada
    const validation = validateDepartmentAndMunicipality(department, municipality);
    if (!validation.isValid) {
      return res.status(400).json({ 
        success: false,
        message: validation.message,
        error: validation.error,
        validDepartments: validation.validDepartments,
        validMunicipalities: validation.validMunicipalities
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
      location: location || { 
        type: "Point", 
        coordinates: DELIVERY_CONFIG.DEFAULT_COORDINATES 
      },
      isDefault: isDefault === true
    });
    
    await newAddress.save();
    
    res.status(201).json({
      success: true,
      message: "Dirección creada exitosamente",
      data: { address: newAddress }
    });
    
  } catch (error) {
    console.error("❌ Error en createAddress:", error);
    res.status(500).json({ 
      success: false,
      message: "Error al crear la dirección",
      error: process.env.NODE_ENV === 'development' ? error.message : 'INTERNAL_ERROR'
    });
  }
};

/**
 * Obtiene todas las direcciones del usuario
 */
addressController.getUserAddresses = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Usar método estático del modelo
    const addresses = await Address.getUserAddresses(userId);
    
    res.status(200).json({
      success: true,
      data: {
        addresses,
        deliveryFees: getDeliveryFeesMap()
      }
    });
    
  } catch (error) {
    console.error("❌ Error en getUserAddresses:", error);
    res.status(500).json({ 
      success: false,
      message: "Error al obtener las direcciones",
      error: process.env.NODE_ENV === 'development' ? error.message : 'INTERNAL_ERROR'
    });
  }
};

/**
 * Obtiene una dirección específica por ID
 */
addressController.getAddressById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    
    // Validar ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false,
        message: "ID de dirección inválido",
        error: 'INVALID_ADDRESS_ID'
      });
    }
    
    // Buscar dirección
    const address = await Address.findOne({ _id: id, user: userId, isActive: true });
    
    if (!address) {
      return res.status(404).json({ 
        success: false,
        message: "Dirección no encontrada",
        error: 'ADDRESS_NOT_FOUND'
      });
    }
    
    res.status(200).json({
      success: true,
      data: { address }
    });
    
  } catch (error) {
    console.error("❌ Error en getAddressById:", error);
    res.status(500).json({ 
      success: false,
      message: "Error al obtener la dirección",
      error: process.env.NODE_ENV === 'development' ? error.message : 'INTERNAL_ERROR'
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
        message: "ID de dirección inválido",
        error: 'INVALID_ADDRESS_ID'
      });
    }
    
    // Verificar que la dirección exista y pertenezca al usuario
    const address = await Address.findOne({ _id: id, user: userId, isActive: true });
    
    if (!address) {
      return res.status(404).json({ 
        success: false,
        message: "Dirección no encontrada",
        error: 'ADDRESS_NOT_FOUND'
      });
    }
    
    // Validar departamento y municipio si se están actualizando
    if (req.body.department || req.body.municipality) {
      const validation = validateDepartmentAndMunicipality(
        req.body.department || address.department,
        req.body.municipality || address.municipality
      );
      
      if (!validation.isValid) {
        return res.status(400).json({ 
          success: false,
          message: validation.message,
          error: validation.error,
          validMunicipalities: validation.validMunicipalities
        });
      }
    }
    
    // Actualizar campos permitidos
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
      data: { address }
    });
    
  } catch (error) {
    console.error("❌ Error en updateAddress:", error);
    res.status(500).json({ 
      success: false,
      message: "Error al actualizar la dirección",
      error: process.env.NODE_ENV === 'development' ? error.message : 'INTERNAL_ERROR'
    });
  }
};

/**
 * Elimina una dirección (soft delete)
 */
addressController.deleteAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    
    // Validar ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false,
        message: "ID de dirección inválido",
        error: 'INVALID_ADDRESS_ID'
      });
    }
    
    // Verificar que la dirección exista y pertenezca al usuario
    const address = await Address.findOne({ _id: id, user: userId, isActive: true });
    
    if (!address) {
      return res.status(404).json({ 
        success: false,
        message: "Dirección no encontrada",
        error: 'ADDRESS_NOT_FOUND'
      });
    }
    
    // Si es la dirección predeterminada, establecer otra como predeterminada
    if (address.isDefault) {
      const nextDefault = await Address.findOne({ 
        user: userId, 
        _id: { $ne: id },
        isActive: true
      }).sort({ createdAt: -1 });
      
      if (nextDefault) {
        nextDefault.isDefault = true;
        await nextDefault.save();
      }
    }
    
    // Soft delete
    address.isActive = false;
    await address.save();
    
    res.status(200).json({
      success: true,
      message: "Dirección eliminada exitosamente"
    });
    
  } catch (error) {
    console.error("❌ Error en deleteAddress:", error);
    res.status(500).json({ 
      success: false,
      message: "Error al eliminar la dirección",
      error: process.env.NODE_ENV === 'development' ? error.message : 'INTERNAL_ERROR'
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
        message: "ID de dirección inválido",
        error: 'INVALID_ADDRESS_ID'
      });
    }
    
    // Verificar que la dirección exista y pertenezca al usuario
    const address = await Address.findOne({ _id: id, user: userId, isActive: true });
    
    if (!address) {
      return res.status(404).json({ 
        success: false,
        message: "Dirección no encontrada",
        error: 'ADDRESS_NOT_FOUND'
      });
    }
    
    // Establecer como predeterminada (el middleware del modelo maneja la lógica)
    address.isDefault = true;
    await address.save();
    
    res.status(200).json({
      success: true,
      message: "Dirección establecida como predeterminada",
      data: { address }
    });
    
  } catch (error) {
    console.error("❌ Error en setDefaultAddress:", error);
    res.status(500).json({ 
      success: false,
      message: "Error al establecer la dirección predeterminada",
      error: process.env.NODE_ENV === 'development' ? error.message : 'INTERNAL_ERROR'
    });
  }
};

/**
 * Valida una dirección con coordenadas
 */
addressController.validateAddress = async (req, res) => {
  try {
    const { department, municipality, address } = req.body;
    
    // Validaciones básicas
    if (!department || !municipality || !address) {
      return res.status(400).json({ 
        success: false,
        message: "Faltan datos de dirección",
        error: 'INCOMPLETE_ADDRESS'
      });
    }
    
    // Validar departamento y municipio usando utilidad centralizada
    const validation = validateDepartmentAndMunicipality(department, municipality);
    if (!validation.isValid) {
      return res.status(400).json({ 
        success: false,
        message: validation.message,
        error: validation.error,
        validDepartments: validation.validDepartments,
        validMunicipalities: validation.validMunicipalities
      });
    }
    
    res.status(200).json({
      success: true,
      message: "Dirección válida",
      data: {
        isValid: true,
        department,
        municipality,
        estimatedDeliveryFee: calculateDeliveryFee(department),
        deliveryOptions: getDeliveryOptions(department)
      }
    });
    
  } catch (error) {
    console.error("❌ Error en validateAddress:", error);
    res.status(500).json({ 
      success: false,
      message: "Error al validar dirección",
      error: process.env.NODE_ENV === 'development' ? error.message : 'INTERNAL_ERROR'
    });
  }
};

/**
 * Obtiene tarifas de envío por departamento
 */
addressController.getDeliveryFees = async (req, res) => {
  try {
    const deliveryFees = getDeliveryFeesMap();
    
    res.status(200).json({
      success: true,
      data: {
        fees: deliveryFees,
        currency: DELIVERY_CONFIG.CURRENCY,
        freeDeliveryThreshold: DELIVERY_CONFIG.FREE_DELIVERY_THRESHOLD,
        expressDeliveryAvailable: true,
        lastUpdated: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error("❌ Error en getDeliveryFees:", error);
    res.status(500).json({ 
      success: false,
      message: "Error al obtener tarifas",
      error: process.env.NODE_ENV === 'development' ? error.message : 'INTERNAL_ERROR'
    });
  }
};

/**
 * Obtiene datos de ubicaciones (departamentos y municipios)
 */
addressController.getLocationData = async (req, res) => {
  try {
    const locationData = getLocationData();
    
    res.status(200).json({
      success: true,
      data: locationData
    });
    
  } catch (error) {
    console.error("❌ Error en getLocationData:", error);
    res.status(500).json({ 
      success: false,
      message: "Error al obtener datos de ubicaciones",
      error: process.env.NODE_ENV === 'development' ? error.message : 'INTERNAL_ERROR'
    });
  }
};

/**
 * Obtiene todas las direcciones para administradores
 */
addressController.getAllAddresses = async (req, res) => {
  try {
    const {
      userId,
      department,
      municipality,
      search,
      isActive,
      page = 1,
      limit = 20,
      sort = 'createdAt_desc'
    } = req.query;

    // Construir filtros
    const filters = { isActive: true }; // Solo direcciones activas por defecto
    
    if (userId) filters.user = userId;
    if (department) filters.department = department;
    if (municipality) filters.municipality = municipality;
    if (isActive !== undefined) filters.isActive = isActive === 'true';
    
    // Filtro de búsqueda
    if (search) {
      filters.$or = [
        { recipient: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } },
        { phoneNumber: { $regex: search, $options: 'i' } },
        { label: { $regex: search, $options: 'i' } }
      ];
    }

    // Configurar paginación
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOptions = {};
    
    // Configurar ordenamiento
    if (sort === 'createdAt_desc') sortOptions.createdAt = -1;
    else if (sort === 'createdAt_asc') sortOptions.createdAt = 1;
    else if (sort === 'recipient_asc') sortOptions.recipient = 1;
    else if (sort === 'recipient_desc') sortOptions.recipient = -1;
    else if (sort === 'department_asc') sortOptions.department = 1;
    else if (sort === 'department_desc') sortOptions.department = -1;

    // Ejecutar consulta con paginación
    const [addresses, totalCount] = await Promise.all([
      Address.find(filters)
        .populate('user', 'name email')
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit)),
      Address.countDocuments(filters)
    ]);

    // Calcular estadísticas
    const statistics = {
      total: totalCount,
      active: await Address.countDocuments({ ...filters, isActive: true }),
      inactive: await Address.countDocuments({ ...filters, isActive: false }),
      byDepartment: await Address.aggregate([
        { $match: filters },
        { $group: { _id: '$department', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      byUser: await Address.aggregate([
        { $match: filters },
        { $group: { _id: '$user', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ])
    };

    // Información de paginación
    const totalPages = Math.ceil(totalCount / parseInt(limit));
    const hasNext = parseInt(page) < totalPages;
    const hasPrev = parseInt(page) > 1;

    res.status(200).json({
      success: true,
      data: {
        addresses,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: totalCount,
          hasNext,
          hasPrev,
          itemsPerPage: parseInt(limit)
        },
        statistics,
        filters: {
          userId,
          department,
          municipality,
          search,
          isActive,
          sort
        }
      }
    });
    
  } catch (error) {
    console.error("❌ Error en getAllAddresses:", error);
    res.status(500).json({ 
      success: false,
      message: "Error al obtener las direcciones",
      error: process.env.NODE_ENV === 'development' ? error.message : 'INTERNAL_ERROR'
    });
  }
};

export default addressController;