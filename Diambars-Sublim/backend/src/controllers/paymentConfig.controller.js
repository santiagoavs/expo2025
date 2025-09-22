// controllers/paymentConfig.controller.js - Configuración de métodos de pago del sistema
import PaymentConfig from '../models/paymentConfig.js';

// Obtener todas las configuraciones de métodos de pago
export const getPaymentConfigs = async (req, res) => {
  try {
    console.log('🔍 [paymentConfigController] Obteniendo configuraciones de métodos de pago');
    
    const configs = await PaymentConfig.find().sort({ type: 1 });
    
    console.log('✅ [paymentConfigController] Encontradas', configs.length, 'configuraciones');
    
    res.json({
      success: true,
      configs: configs.map(config => config.toPublicObject())
    });
  } catch (error) {
    console.error('❌ [paymentConfigController] Error obteniendo configuraciones:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo configuraciones de métodos de pago',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
    });
  }
};

// Obtener configuración pública (sin datos sensibles)
export const getPublicPaymentConfig = async (req, res) => {
  try {
    console.log('🌐 [paymentConfigController] Obteniendo configuración pública');
    
    const configs = await PaymentConfig.getActiveConfigs();
    
    const publicConfig = {
      methods: {}
    };
    
    configs.forEach(config => {
      publicConfig.methods[config.type] = {
        enabled: config.enabled,
        name: config.name,
        message: config.message
      };
    });
    
    console.log('✅ [paymentConfigController] Configuración pública generada');
    
    res.json({
      success: true,
      config: publicConfig
    });
  } catch (error) {
    console.error('❌ [paymentConfigController] Error obteniendo configuración pública:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo configuración pública',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
    });
  }
};

// Crear o actualizar configuración de método de pago
export const upsertPaymentConfig = async (req, res) => {
  try {
    console.log('🆕 [paymentConfigController] Creando/actualizando configuración:', req.body.type);
    console.log('📋 [paymentConfigController] Datos recibidos:', req.body);
    
    const { type, name, enabled, config, message } = req.body;
    
    // Validar datos de entrada
    if (!type || !name) {
      return res.status(400).json({
        success: false,
        message: 'Tipo y nombre son requeridos'
      });
    }
    
    if (!['wompi', 'cash', 'bank'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Tipo de método no válido'
      });
    }
    
    // Buscar configuración existente
    const existingConfig = await PaymentConfig.findOne({ type });
    
    if (existingConfig) {
      // Actualizar configuración existente
      existingConfig.name = name.trim();
      existingConfig.enabled = enabled !== undefined ? enabled : existingConfig.enabled;
      existingConfig.config = config || existingConfig.config;
      existingConfig.message = message || existingConfig.message;
      
      await existingConfig.save();
      
      console.log('✅ [paymentConfigController] Configuración actualizada:', existingConfig._id);
      
      res.json({
        success: true,
        message: 'Configuración actualizada exitosamente',
        config: existingConfig.toPublicObject()
      });
    } else {
      // Crear nueva configuración
      const newConfig = new PaymentConfig({
        type,
        name: name.trim(),
        enabled: enabled !== undefined ? enabled : true,
        config: config || {},
        message: message || ''
      });
      
      await newConfig.save();
      
      console.log('✅ [paymentConfigController] Configuración creada:', newConfig._id);
      
      res.status(201).json({
        success: true,
        message: 'Configuración creada exitosamente',
        config: newConfig.toPublicObject()
      });
    }
  } catch (error) {
    console.error('❌ [paymentConfigController] Error creando/actualizando configuración:', error);
    
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Ya existe una configuración para este tipo de método'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error creando/actualizando configuración',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
    });
  }
};

// Eliminar configuración de método de pago
export const deletePaymentConfig = async (req, res) => {
  try {
    console.log('🗑️ [paymentConfigController] Eliminando configuración:', req.params.type);
    
    const config = await PaymentConfig.findOneAndDelete({ type: req.params.type });
    
    if (!config) {
      return res.status(404).json({
        success: false,
        message: 'Configuración no encontrada'
      });
    }
    
    console.log('✅ [paymentConfigController] Configuración eliminada:', config._id);
    
    res.json({
      success: true,
      message: 'Configuración eliminada exitosamente'
    });
  } catch (error) {
    console.error('❌ [paymentConfigController] Error eliminando configuración:', error);
    res.status(500).json({
      success: false,
      message: 'Error eliminando configuración',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
    });
  }
};

// Obtener estadísticas de métodos de pago
export const getPaymentStats = async (req, res) => {
  try {
    console.log('📊 [paymentConfigController] Obteniendo estadísticas de pagos');
    
    const configs = await PaymentConfig.find();
    const activeConfigs = configs.filter(config => config.enabled);
    
    const stats = {
      totalMethods: configs.length,
      activeMethods: activeConfigs.length,
      methods: configs.map(config => ({
        type: config.type,
        name: config.name,
        enabled: config.enabled,
        hasConfig: Object.keys(config.config).length > 0
      }))
    };
    
    console.log('✅ [paymentConfigController] Estadísticas generadas');
    
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('❌ [paymentConfigController] Error obteniendo estadísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo estadísticas',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
    });
  }
};
