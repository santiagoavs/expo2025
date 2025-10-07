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
 * Obtiene todas las direcciones de un usuario específico (Admin)
 */
addressController.getUserAddressesByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Validar que userId sea un ID válido de MongoDB
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ 
        success: false,
        message: "ID de usuario inválido",
        error: 'INVALID_USER_ID'
      });
    }
    
    // Usar método estático del modelo para obtener direcciones del usuario específico
    const addresses = await Address.getUserAddresses(userId);
    
    res.status(200).json({
      success: true,
      data: {
        addresses,
        deliveryFees: getDeliveryFeesMap()
      }
    });
    
  } catch (error) {
    console.error("❌ Error en getUserAddressesByUserId:", error);
    res.status(500).json({ 
      success: false,
      message: "Error al obtener las direcciones del usuario",
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
 * Quitar dirección como predeterminada
 */
addressController.unsetDefaultAddress = async (req, res) => {
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
    const address = await Address.findOne({ _id: id, user: userId });
    
    if (!address) {
      return res.status(404).json({ 
        success: false,
        message: "Dirección no encontrada",
        error: 'ADDRESS_NOT_FOUND'
      });
    }
    
    // Quitar como predeterminada
    address.isDefault = false;
    await address.save();
    
    res.status(200).json({
      success: true,
      message: "Dirección ya no es predeterminada",
      data: { address }
    });
    
  } catch (error) {
    console.error("❌ Error en unsetDefaultAddress:", error);
    res.status(500).json({ 
      success: false,
      message: "Error al quitar la dirección predeterminada",
      error: process.env.NODE_ENV === 'development' ? error.message : 'INTERNAL_ERROR'
    });
  }
};

/**
 * Eliminar dirección permanentemente (hard delete)
 */
addressController.hardDeleteAddress = async (req, res) => {
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
    const address = await Address.findOne({ _id: id, user: userId });
    
    if (!address) {
      return res.status(404).json({ 
        success: false,
        message: "Dirección no encontrada",
        error: 'ADDRESS_NOT_FOUND'
      });
    }
    
    // Eliminar permanentemente de la base de datos
    await Address.findByIdAndDelete(id);
    
    res.status(200).json({
      success: true,
      message: "Dirección eliminada permanentemente",
      data: { deletedAddressId: id }
    });
    
  } catch (error) {
    console.error("❌ Error en hardDeleteAddress:", error);
    res.status(500).json({ 
      success: false,
      message: "Error al eliminar la dirección permanentemente",
      error: process.env.NODE_ENV === 'development' ? error.message : 'INTERNAL_ERROR'
    });
  }
};

/**
 * Crea una ubicación predeterminada desde coordenadas (para AddressMapPicker)
 */
addressController.setDefaultLocationFromCoordinates = async (req, res) => {
  try {
    const { coordinates, department, municipality, userId: targetUserId } = req.body;
    const currentUserId = req.user._id;
    
    // Determinar el usuario objetivo (admin puede establecer para otros usuarios)
    const userId = targetUserId || currentUserId;
    
    // Validar que el usuario tenga permisos para establecer dirección para este usuario
    if (targetUserId && targetUserId !== currentUserId) {
      // Verificar si el usuario actual es admin/empleado
      // Aquí podrías agregar lógica para verificar roles de admin
      console.log(`Admin ${currentUserId} estableciendo dirección predeterminada para usuario ${targetUserId}`);
    }
    
    // Validar departamento y municipio
    const validation = validateDepartmentAndMunicipality(department, municipality);
    if (!validation.isValid) {
      return res.status(400).json({ 
        success: false,
        message: validation.message,
        error: validation.error,
        validMunicipalities: validation.validMunicipalities
      });
    }
    
    // Crear nueva dirección predeterminada
    const newAddress = new Address({
      user: userId,
      label: "Mi Ubicación Predeterminada",
      recipient: "Usuario Principal",
      phoneNumber: "71234567", // Número por defecto, se puede actualizar después
      department,
      municipality,
      address: `Ubicación seleccionada en ${municipality}, ${department}`,
      additionalDetails: "Ubicación establecida desde el mapa",
      location: {
        type: "Point",
        coordinates: [coordinates.lng, coordinates.lat] // GeoJSON format: [lng, lat]
      },
      isDefault: true // Se establecerá como predeterminada
    });
    
    await newAddress.save();
    
    res.status(201).json({
      success: true,
      message: "Ubicación establecida como predeterminada exitosamente",
      data: { 
        address: newAddress,
        coordinates: {
          lat: coordinates.lat,
          lng: coordinates.lng
        },
        department,
        municipality
      }
    });
    
  } catch (error) {
    console.error("❌ Error en setDefaultLocationFromCoordinates:", error);
    res.status(500).json({ 
      success: false,
      message: "Error al establecer la ubicación predeterminada",
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
 * Actualizar dirección (admin)
 */
addressController.updateAddressAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validar ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false,
        message: "ID de dirección inválido",
        error: 'INVALID_ADDRESS_ID'
      });
    }
    
    // Verificar que la dirección exista (sin filtrar por usuario para admin)
    const address = await Address.findById(id);
    
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
      'municipality', 'address', 'additionalDetails', 'location', 'isDefault', 'isActive'
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
    console.error("❌ Error en updateAddressAdmin:", error);
    res.status(500).json({ 
      success: false,
      message: "Error al actualizar la dirección",
      error: process.env.NODE_ENV === 'development' ? error.message : 'INTERNAL_ERROR'
    });
  }
};

/**
 * Eliminar dirección (admin)
 */
addressController.deleteAddressAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validar ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false,
        message: "ID de dirección inválido",
        error: 'INVALID_ADDRESS_ID'
      });
    }
    
    // Verificar que la dirección exista (sin filtrar por usuario ni isActive para admin)
    const address = await Address.findById(id);
    
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
        user: address.user, 
        _id: { $ne: id },
        isActive: true 
      });
      
      if (nextDefault) {
        nextDefault.isDefault = true;
        await nextDefault.save();
      }
    }
    
    // Eliminar permanentemente de la base de datos
    await Address.findByIdAndDelete(id);
    
    res.status(200).json({
      success: true,
      message: "Dirección eliminada permanentemente",
      data: { deletedAddressId: id }
    });
    
  } catch (error) {
    console.error("❌ Error en deleteAddressAdmin:", error);
    res.status(500).json({ 
      success: false,
      message: "Error al eliminar la dirección",
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
    const filters = {};
    
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

/**
 * Crear dirección (admin)
 */
addressController.createAddressAdmin = async (req, res) => {
  try {
    const {
      userId,
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
    
    console.log('🔧 [createAddressAdmin] Received data:', {
      userId,
      location,
      coordinates: location?.coordinates
    });
    
    // Validaciones básicas
    if (!userId || !recipient || !phoneNumber || !department || !municipality || !address) {
      return res.status(400).json({ 
        success: false,
        message: "Faltan campos requeridos en la dirección",
        error: 'MISSING_REQUIRED_FIELDS'
      });
    }
    
    // Validar que el userId sea un ObjectId válido
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ 
        success: false,
        message: "ID de usuario inválido",
        error: 'INVALID_USER_ID'
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
    
    // Validar y procesar coordenadas
    let processedLocation = { 
      type: "Point", 
      coordinates: DELIVERY_CONFIG.DEFAULT_COORDINATES 
    };
    
    if (location && location.coordinates && location.coordinates.length === 2) {
      const [lng, lat] = location.coordinates;
      // Solo usar las coordenadas si ambas son números válidos
      if (typeof lng === 'number' && typeof lat === 'number' && 
          !isNaN(lng) && !isNaN(lat) && 
          lng !== null && lat !== null) {
        processedLocation = {
          type: "Point",
          coordinates: [lng, lat]
        };
      }
    }
    
    // Crear nueva dirección
    const newAddress = new Address({
      user: userId, // Usar el userId del body en lugar de req.user._id
      label: label || "Mi dirección",
      recipient,
      phoneNumber,
      department,
      municipality,
      address,
      additionalDetails: additionalDetails || "",
      location: processedLocation,
      isDefault: isDefault || false,
      isActive: true
    });
    
    // Si se establece como predeterminada, quitar el flag de otras direcciones del mismo usuario
    if (isDefault) {
      await Address.updateMany(
        { user: userId, isDefault: true },
        { isDefault: false }
      );
    }
    
    await newAddress.save();
    
    // Poblar la información del usuario para la respuesta
    await newAddress.populate('user', 'name email');
    
    res.status(201).json({
      success: true,
      message: "Dirección creada exitosamente",
      data: { address: newAddress }
    });
    
  } catch (error) {
    console.error("❌ Error en createAddressAdmin:", error);
    res.status(500).json({ 
      success: false,
      message: "Error al crear la dirección",
      error: process.env.NODE_ENV === 'development' ? error.message : 'INTERNAL_ERROR'
    });
  }
};

/**
 * Exportar direcciones (admin)
 */
addressController.exportAddresses = async (req, res) => {
  try {
    const {
      userId,
      department,
      municipality,
      search,
      isActive,
      format = 'csv'
    } = req.query;

    // Construir filtros (mismo que getAllAddresses)
    const filters = {};
    
    if (userId) filters.user = userId;
    if (department) filters.department = department;
    if (municipality) filters.municipality = municipality;
    if (isActive !== undefined) filters.isActive = isActive === 'true';

    // Búsqueda por texto
    if (search) {
      filters.$or = [
        { recipient: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } },
        { municipality: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } }
      ];
    }

    // Obtener todas las direcciones que coincidan con los filtros
    const addresses = await Address.find(filters)
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    if (format === 'csv') {
      // Generar CSV
      let csvContent = 'ID,Usuario,Email,Etiqueta,Destinatario,Teléfono,Departamento,Municipio,Dirección,Detalles Adicionales,Coordenadas,Es Principal,Estado,Fecha Creación\n';
      
      addresses.forEach(address => {
        const coordinates = address.location?.coordinates 
          ? `${address.location.coordinates[1]}, ${address.location.coordinates[0]}`
          : '';
        
        csvContent += [
          address._id,
          address.user?.name || '',
          address.user?.email || '',
          address.label || '',
          address.recipient || '',
          address.phoneNumber || '',
          address.department || '',
          address.municipality || '',
          address.address || '',
          address.additionalDetails || '',
          coordinates,
          address.isDefault ? 'Sí' : 'No',
          address.isActive ? 'Activa' : 'Inactiva',
          new Date(address.createdAt).toLocaleDateString('es-ES')
        ].map(field => `"${field}"`).join(',') + '\n';
      });

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="direcciones_${Date.now()}.csv"`);
      res.send(csvContent);
      
    } else {
      // Para otros formatos, devolver JSON por ahora
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="direcciones_${Date.now()}.json"`);
      res.json({
        success: true,
        data: addresses,
        total: addresses.length,
        exportedAt: new Date().toISOString()
      });
    }
    
  } catch (error) {
    console.error("❌ Error en exportAddresses:", error);
    res.status(500).json({ 
      success: false,
      message: "Error al exportar direcciones",
      error: process.env.NODE_ENV === 'development' ? error.message : 'INTERNAL_ERROR'
    });
  }
};

/**
 * Geocodificación - Buscar coordenadas por dirección
 */
addressController.geocodeAddress = async (req, res) => {
  try {
    const { q, limit = 3 } = req.query;
    
    if (!q) {
      return res.status(400).json({
        success: false,
        message: "Parámetro de búsqueda requerido",
        error: 'MISSING_QUERY'
      });
    }
    
    const encodedQuery = encodeURIComponent(q);
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodedQuery}&countrycodes=sv&limit=${limit}&addressdetails=1&extratags=1&namedetails=1`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Diambars-Sublim/1.0'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    res.json({
      success: true,
      data: data
    });
    
  } catch (error) {
    console.error("❌ Error en geocodeAddress:", error);
    res.status(500).json({
      success: false,
      message: "Error al geocodificar la dirección",
      error: process.env.NODE_ENV === 'development' ? error.message : 'INTERNAL_ERROR'
    });
  }
};

/**
 * Geocodificación inversa - Buscar dirección por coordenadas
 */
addressController.reverseGeocode = async (req, res) => {
  try {
    const { lat, lng } = req.query;
    
    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: "Coordenadas requeridas",
        error: 'MISSING_COORDINATES'
      });
    }
    
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&extratags=1&namedetails=1&accept-language=es,en`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Diambars-Sublim/1.0'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    res.json({
      success: true,
      data: data
    });
    
  } catch (error) {
    console.error("❌ Error en reverseGeocode:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener la dirección desde coordenadas",
      error: process.env.NODE_ENV === 'development' ? error.message : 'INTERNAL_ERROR'
    });
  }
};

/**
 * Establecer dirección como predeterminada (admin)
 */
addressController.setDefaultAddressAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validar ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false,
        message: "ID de dirección inválido",
        error: 'INVALID_ADDRESS_ID'
      });
    }
    
    // Verificar que la dirección exista (sin filtrar por usuario para admin)
    const address = await Address.findById(id);
    
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
    console.error("❌ Error en setDefaultAddressAdmin:", error);
    res.status(500).json({ 
      success: false,
      message: "Error al establecer la dirección predeterminada",
      error: process.env.NODE_ENV === 'development' ? error.message : 'INTERNAL_ERROR'
    });
  }
};

/**
 * Quitar dirección como predeterminada (admin)
 */
addressController.unsetDefaultAddressAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validar ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false,
        message: "ID de dirección inválido",
        error: 'INVALID_ADDRESS_ID'
      });
    }
    
    // Verificar que la dirección exista (sin filtrar por usuario para admin)
    const address = await Address.findById(id);
    
    if (!address) {
      return res.status(404).json({ 
        success: false,
        message: "Dirección no encontrada",
        error: 'ADDRESS_NOT_FOUND'
      });
    }
    
    // Quitar como predeterminada
    address.isDefault = false;
    await address.save();
    
    res.status(200).json({
      success: true,
      message: "Dirección ya no es predeterminada",
      data: { address }
    });
    
  } catch (error) {
    console.error("❌ Error en unsetDefaultAddressAdmin:", error);
    res.status(500).json({ 
      success: false,
      message: "Error al quitar la dirección predeterminada",
      error: process.env.NODE_ENV === 'development' ? error.message : 'INTERNAL_ERROR'
    });
  }
};

/**
 * Obtener estadísticas de direcciones (admin)
 */
addressController.getStatistics = async (req, res) => {
  try {
    // Obtener estadísticas básicas
    const totalAddresses = await Address.countDocuments({ isActive: true });
    const activeAddresses = await Address.countDocuments({ isActive: true });
    const inactiveAddresses = await Address.countDocuments({ isActive: false });
    
    // Distribución por departamento
    const byDepartmentPipeline = [
      { $match: { isActive: true } },
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ];
    const departmentDistribution = await Address.aggregate(byDepartmentPipeline);
    const byDepartment = departmentDistribution.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});
    
    // Distribución por usuario
    const byUserPipeline = [
      { $match: { isActive: true } },
      { $group: { _id: '$user', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ];
    const userDistribution = await Address.aggregate(byUserPipeline);
    const byUser = userDistribution.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});
    
    // Direcciones creadas recientemente (últimos 30 días)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentlyCreated = await Address.countDocuments({
      isActive: true,
      createdAt: { $gte: thirtyDaysAgo }
    });
    
    const statistics = {
      total: totalAddresses,
      active: activeAddresses,
      inactive: inactiveAddresses,
      byDepartment,
      byUser,
      recentlyCreated
    };
    
    res.status(200).json({
      success: true,
      data: statistics
    });
    
  } catch (error) {
    console.error("❌ Error en getStatistics:", error);
    res.status(500).json({ 
      success: false,
      message: "Error al obtener estadísticas de direcciones",
      error: process.env.NODE_ENV === 'development' ? error.message : 'INTERNAL_ERROR'
    });
  }
};

/**
 * Detectar direcciones duplicadas
 */
addressController.detectDuplicates = async (req, res) => {
  try {
    const { userId, address, department, municipality, coordinates } = req.body;
    
    console.log('🔍 [detectDuplicates] Buscando duplicados para:', { userId, address, department, municipality });
    
    // Buscar direcciones similares del mismo usuario
    const existingAddresses = await Address.find({
      user: userId,
      department,
      municipality,
      isActive: true
    });
    
    const duplicates = [];
    
    for (const existing of existingAddresses) {
      let similarityScore = 0;
      
      // Calcular similitud de texto
      const textSimilarity = calculateTextSimilarity(
        address.toLowerCase().trim(),
        existing.address.toLowerCase().trim()
      );
      similarityScore += textSimilarity * 60;
      
      // Calcular similitud por coordenadas si ambas tienen
      if (coordinates && existing.location && existing.location.coordinates) {
        const distance = calculateDistance(
          coordinates[1], coordinates[0], // lat, lng
          existing.location.coordinates[1], existing.location.coordinates[0]
        );
        
        if (distance < 0.1) similarityScore += 30; // Muy cerca (100m)
        else if (distance < 0.5) similarityScore += 15; // Cerca (500m)
        else if (distance < 1) similarityScore += 5; // Relativamente cerca (1km)
      }
      
      // Misma ubicación geográfica
      if (existing.department === department && existing.municipality === municipality) {
        similarityScore += 10;
      }
      
      // Solo considerar como duplicado si el score es alto
      if (similarityScore > 70) {
        duplicates.push({
          ...existing.toObject(),
          similarityScore: Math.round(similarityScore),
          textSimilarity: Math.round(textSimilarity * 100),
          distance: coordinates && existing.location ? 
            calculateDistance(
              coordinates[1], coordinates[0],
              existing.location.coordinates[1], existing.location.coordinates[0]
            ) : null
        });
      }
    }
    
    console.log('🔍 [detectDuplicates] Encontrados', duplicates.length, 'posibles duplicados');
    
    res.json({
      success: true,
      data: {
        hasDuplicates: duplicates.length > 0,
        duplicates: duplicates.sort((a, b) => b.similarityScore - a.similarityScore),
        totalFound: duplicates.length
      }
    });
    
  } catch (error) {
    console.error("❌ Error en detectDuplicates:", error);
    res.status(500).json({
      success: false,
      message: "Error al detectar direcciones duplicadas",
      error: process.env.NODE_ENV === 'development' ? error.message : 'INTERNAL_ERROR'
    });
  }
};

// Función auxiliar para calcular similitud de texto
function calculateTextSimilarity(str1, str2) {
  if (str1 === str2) return 1.0;
  
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1.0;
  
  const editDistance = levenshteinDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
}

// Función auxiliar para calcular distancia de Levenshtein
function levenshteinDistance(str1, str2) {
  const matrix = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
}

// Función auxiliar para calcular distancia entre coordenadas
function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // Radio de la Tierra en km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default addressController;