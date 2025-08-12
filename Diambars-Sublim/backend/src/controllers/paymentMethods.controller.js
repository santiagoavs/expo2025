// controllers/paymentMethodsController.js
const PaymentMethod = require('../models/paymentMethod.js');
const { body, validationResult } = require('express-validator');

// Validaciones
const paymentValidation = [
  body('number')
    .isLength({ min: 13, max: 19 })
    .matches(/^\d+$/)
    .withMessage('Número de tarjeta debe contener solo dígitos y tener entre 13-19 caracteres'),
  
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Nombre debe tener entre 2 y 100 caracteres'),
  
  body('expiry')
    .matches(/^(0[1-9]|1[0-2])\/\d{2}$/)
    .withMessage('Fecha de expiración debe tener formato MM/AA')
    .custom((value) => {
      const [month, year] = value.split('/');
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear() % 100;
      const currentMonth = currentDate.getMonth() + 1;
      
      if (parseInt(year) < currentYear || (parseInt(year) === currentYear && parseInt(month) < currentMonth)) {
        throw new Error('La fecha de expiración no puede ser pasada');
      }
      return true;
    }),
  
  body('cvc')
    .isLength({ min: 3, max: 4 })
    .matches(/^\d+$/)
    .withMessage('CVC debe contener solo dígitos y tener entre 3-4 caracteres'),
  
  body('issuer')
    .optional()
    .isIn(['visa', 'mastercard', 'amex', 'discover', 'unknown'])
    .withMessage('Tipo de tarjeta inválido')
];

// Obtener todos los métodos de pago del usuario
const getPaymentMethods = async (req, res) => {
  try {
    console.log('🔍 [paymentController] Obteniendo métodos para usuario:', req.user.id);
    
    const methods = await PaymentMethod.findByUser(req.user.id);
    
    console.log('✅ [paymentController] Encontrados', methods.length, 'métodos');
    
    // Retornar información segura
    const safeMethods = methods.map(method => method.toSafeObject());
    
    res.json({
      success: true,
      paymentMethods: safeMethods
    });
  } catch (error) {
    console.error('❌ [paymentController] Error obteniendo métodos:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo métodos de pago',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
    });
  }
};

// Crear un nuevo método de pago
const createPaymentMethod = [
  ...paymentValidation,
  async (req, res) => {
    try {
      console.log('🆕 [paymentController] Creando método para usuario:', req.user.id);
      
      // Validar datos de entrada
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log('❌ [paymentController] Errores de validación:', errors.array());
        return res.status(400).json({
          success: false,
          message: 'Datos de entrada inválidos',
          errors: errors.array()
        });
      }
      
      const { number, name, expiry, cvc, issuer } = req.body;
      
      // Generar hash del número y encriptar CVC
      const numberHash = PaymentMethod.generateNumberHash(number);
      const cvcEncrypted = PaymentMethod.encryptCVC(cvc);
      const lastFourDigits = number.slice(-4);
      
      console.log('🔧 [paymentController] Datos procesados:', {
        lastFourDigits,
        issuer: issuer || 'unknown',
        hasHash: !!numberHash,
        hasEncryptedCVC: !!cvcEncrypted
      });
      
      // Crear nuevo método
      const newMethod = new PaymentMethod({
        userId: req.user.id,
        lastFourDigits,
        numberHash,
        name: name.trim().toUpperCase(),
        expiry,
        cvcEncrypted,
        issuer: issuer || 'unknown',
        active: false // Los nuevos métodos inician inactivos
      });
      
      await newMethod.save();
      
      console.log('✅ [paymentController] Método creado:', newMethod._id);
      
      res.status(201).json({
        success: true,
        message: 'Método de pago creado exitosamente',
        paymentMethod: newMethod.toSafeObject()
      });
    } catch (error) {
      console.error('❌ [paymentController] Error creando método:', error);
      
      if (error.code === 'DUPLICATE_CARD') {
        return res.status(409).json({
          success: false,
          message: error.message
        });
      }
      
      if (error.code === 11000) {
        return res.status(409).json({
          success: false,
          message: 'Ya tienes registrada una tarjeta con estos datos'
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Error creando método de pago',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
      });
    }
  }
];

// Actualizar un método de pago
const updatePaymentMethod = [
  ...paymentValidation,
  async (req, res) => {
    try {
      console.log('🔄 [paymentController] Actualizando método:', req.params.id, 'para usuario:', req.user.id);
      
      // Validar datos de entrada
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Datos de entrada inválidos',
          errors: errors.array()
        });
      }
      
      const { number, name, expiry, cvc, issuer } = req.body;
      
      // Buscar el método existente
      const existingMethod = await PaymentMethod.findOne({
        _id: req.params.id,
        userId: req.user.id
      });
      
      if (!existingMethod) {
        return res.status(404).json({
          success: false,
          message: 'Método de pago no encontrado'
        });
      }
      
      // Preparar datos actualizados
      const numberHash = PaymentMethod.generateNumberHash(number);
      const cvcEncrypted = PaymentMethod.encryptCVC(cvc);
      const lastFourDigits = number.slice(-4);
      
      // Verificar duplicados (excluyendo el método actual)
      const duplicate = await PaymentMethod.findOne({
        userId: req.user.id,
        numberHash,
        _id: { $ne: req.params.id }
      });
      
      if (duplicate) {
        return res.status(409).json({
          success: false,
          message: 'Ya tienes registrada una tarjeta con estos datos'
        });
      }
      
      // Actualizar método
      existingMethod.lastFourDigits = lastFourDigits;
      existingMethod.numberHash = numberHash;
      existingMethod.name = name.trim().toUpperCase();
      existingMethod.expiry = expiry;
      existingMethod.cvcEncrypted = cvcEncrypted;
      existingMethod.issuer = issuer || existingMethod.issuer;
      
      await existingMethod.save();
      
      console.log('✅ [paymentController] Método actualizado:', existingMethod._id);
      
      res.json({
        success: true,
        message: 'Método de pago actualizado exitosamente',
        paymentMethod: existingMethod.toSafeObject()
      });
    } catch (error) {
      console.error('❌ [paymentController] Error actualizando método:', error);
      res.status(500).json({
        success: false,
        message: 'Error actualizando método de pago',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
      });
    }
  }
];

// Eliminar un método de pago
const deletePaymentMethod = async (req, res) => {
  try {
    console.log('🗑️ [paymentController] Eliminando método:', req.params.id, 'para usuario:', req.user.id);
    
    const method = await PaymentMethod.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!method) {
      return res.status(404).json({
        success: false,
        message: 'Método de pago no encontrado'
      });
    }
    
    console.log('✅ [paymentController] Método eliminado:', method._id);
    
    res.json({
      success: true,
      message: 'Método de pago eliminado exitosamente'
    });
  } catch (error) {
    console.error('❌ [paymentController] Error eliminando método:', error);
    res.status(500).json({
      success: false,
      message: 'Error eliminando método de pago',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
    });
  }
};

// Activar/desactivar un método de pago
const togglePaymentMethod = async (req, res) => {
  try {
    console.log('🔄 [paymentController] Cambiando estado del método:', req.params.id, 'para usuario:', req.user.id);
    
    const { active } = req.body;
    
    if (typeof active !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'El campo active debe ser un booleano'
      });
    }
    
    const method = await PaymentMethod.findOne({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!method) {
      return res.status(404).json({
        success: false,
        message: 'Método de pago no encontrado'
      });
    }
    
    // Si se está activando, desactivar todos los demás
    if (active) {
      await PaymentMethod.updateMany(
        { userId: req.user.id, _id: { $ne: req.params.id } },
        { active: false }
      );
    }
    
    method.active = active;
    await method.save();
    
    console.log('✅ [paymentController] Estado cambiado:', method._id, 'activo:', active);
    
    res.json({
      success: true,
      message: `Método de pago ${active ? 'activado' : 'desactivado'} exitosamente`,
      paymentMethod: method.toSafeObject()
    });
  } catch (error) {
    console.error('❌ [paymentController] Error cambiando estado:', error);
    res.status(500).json({
      success: false,
      message: 'Error cambiando estado del método de pago',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
    });
  }
};

// Obtener método activo del usuario
const getActivePaymentMethod = async (req, res) => {
  try {
    console.log('🔍 [paymentController] Obteniendo método activo para usuario:', req.user.id);
    
    const activeMethod = await PaymentMethod.findActiveByUser(req.user.id);
    
    if (!activeMethod) {
      return res.status(404).json({
        success: false,
        message: 'No tienes un método de pago activo'
      });
    }
    
    console.log('✅ [paymentController] Método activo encontrado:', activeMethod._id);
    
    res.json({
      success: true,
      paymentMethod: activeMethod.toSafeObject()
    });
  } catch (error) {
    console.error('❌ [paymentController] Error obteniendo método activo:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo método activo',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
    });
  }
};

module.exports = {
  getPaymentMethods,
  createPaymentMethod,
  updatePaymentMethod,
  deletePaymentMethod,
  togglePaymentMethod,
  getActivePaymentMethod
};