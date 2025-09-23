// controllers/paymentMethods.controller.js - SIN ALMACENAR CVC
import PaymentMethod from '../models/paymentMethod.js';
import { PaymentValidationService } from '../services/paymentValidation.service.js';

// Obtener todos los métodos de pago del usuario
export const getPaymentMethods = async (req, res) => {
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

// Crear un nuevo método de pago (SIN GUARDAR CVC)
export const createPaymentMethod = async (req, res) => {
  try {
    console.log('🆕 [paymentController] Creando método para usuario:', req.user.id);
    console.log('📋 [paymentController] Datos recibidos:', { 
      ...req.body, 
      number: req.body.number ? `****${req.body.number.slice(-4)}` : 'N/A',
      // NO logging del CVC por seguridad
    });
    
    // Validar datos de entrada usando el servicio de validación
    const validation = PaymentValidationService.validatePaymentMethodData(req.body);
    if (!validation.isValid) {
      console.log('❌ [paymentController] Errores de validación:', validation.errors);
      return res.status(400).json({
        success: false,
        message: 'Datos de entrada inválidos',
        errors: validation.errors
      });
    }
    
    const { number, name, expiry, nickname, issuer, type, bankAccount } = req.body;
    
    try {
      let numberHash = null;
      let lastFourDigits = null;
      let detectedIssuer = null;
      
      // Procesar datos según el tipo de método
      switch (type) {
        case 'credit_card':
        case 'wompi':
          if (number && number !== 'N/A') {
            numberHash = PaymentMethod.generateNumberHash(number);
            lastFourDigits = number.slice(-4);
            detectedIssuer = issuer || PaymentMethod.detectCardType(number);
          }
          break;
          
        case 'bank_transfer':
          // Para transferencia bancaria, no se procesan datos de tarjeta
          break;
          
        case 'cash':
          // Para efectivo, no se procesan datos de tarjeta
          break;
      }
      
      console.log('🔧 [paymentController] Datos procesados:', {
        type,
        lastFourDigits,
        issuer: detectedIssuer,
        hasHash: !!numberHash,
        hasNickname: !!nickname
      });
      
      // Crear nuevo método con datos apropiados según el tipo
      const newMethod = new PaymentMethod({
        userId: req.user.id,
        name: name.trim().toUpperCase(),
        type: type || 'credit_card',
        lastFourDigits,
        numberHash,
        expiry: (type === 'credit_card' || type === 'wompi') ? expiry : undefined,
        issuer: detectedIssuer,
        nickname: nickname?.trim() || '',
        bankAccount: type === 'bank_transfer' ? bankAccount : undefined,
        active: false // Los nuevos métodos inician inactivos
      });
      
      await newMethod.save();
      
      console.log('✅ [paymentController] Método creado:', newMethod._id);
      
      res.status(201).json({
        success: true,
        message: 'Método de pago creado exitosamente',
        paymentMethod: newMethod.toSafeObject()
      });
    } catch (processingError) {
      console.error('❌ [paymentController] Error procesando datos:', processingError);
      return res.status(500).json({
        success: false,
        message: 'Error procesando datos de la tarjeta',
        error: process.env.NODE_ENV === 'development' ? processingError.message : 'Error interno'
      });
    }
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
};

// Actualizar un método de pago (SIN CVC)
export const updatePaymentMethod = async (req, res) => {
  try {
    console.log('🔄 [paymentController] Actualizando método:', req.params.id, 'para usuario:', req.user.id);
    
    // Validar datos de entrada usando el servicio de validación
    const validation = PaymentValidationService.validatePaymentMethodData(req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Datos de entrada inválidos',
        errors: validation.errors
      });
    }
    
    const { number, name, expiry, nickname, issuer, type } = req.body;
    
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
    
    // Preparar datos actualizados según el tipo
    let numberHash = null;
    let lastFourDigits = null;
    let detectedIssuer = null;
    
    if (type === 'card' || type === 'wompi') {
      if (number && number !== 'N/A') {
        numberHash = PaymentMethod.generateNumberHash(number);
        lastFourDigits = number.slice(-4);
        detectedIssuer = issuer || PaymentMethod.detectCardType(number);
        
        // Verificar duplicados solo para métodos con tarjeta
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
      }
    }
    
    // Actualizar método con datos apropiados
    existingMethod.name = name.trim().toUpperCase();
    existingMethod.type = type || existingMethod.type;
    existingMethod.lastFourDigits = lastFourDigits;
    existingMethod.numberHash = numberHash;
    existingMethod.expiry = (type === 'card' || type === 'wompi') ? expiry : undefined;
    existingMethod.issuer = detectedIssuer;
    existingMethod.nickname = nickname?.trim() || '';
    
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
};

// Eliminar un método de pago
export const deletePaymentMethod = async (req, res) => {
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
export const togglePaymentMethod = async (req, res) => {
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
export const getActivePaymentMethod = async (req, res) => {
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