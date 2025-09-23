// controllers/paymentConfig.controller.js - Controlador para configuración de métodos de pago
import PaymentConfig from '../models/paymentConfig.js';
import { validationResult } from 'express-validator';

const paymentConfigController = {};

/**
 * Obtener todas las configuraciones de métodos de pago (ADMIN)
 */
paymentConfigController.getPaymentConfigs = async (req, res) => {
  try {
    console.log('⚙️ [PaymentConfig] Obteniendo configuraciones');

    const configs = await PaymentConfig.find()
      .sort({ createdAt: -1 });

    console.log(`✅ [PaymentConfig] ${configs.length} configuraciones encontradas`);

    res.json({
      success: true,
      configs,
      count: configs.length
    });

  } catch (error) {
    console.error('❌ [PaymentConfig] Error obteniendo configuraciones:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

/**
 * Obtener métodos de pago disponibles públicamente (SIN AUTENTICACIÓN)
 */
paymentConfigController.getAvailablePaymentMethods = async (req, res) => {
  try {
    console.log('🌐 [PaymentConfig] Obteniendo métodos disponibles públicamente');

    const availableMethods = await PaymentConfig.find({ enabled: true })
      .select('type name message config')
      .sort({ createdAt: 1 });

    console.log(`✅ [PaymentConfig] ${availableMethods.length} métodos disponibles`);

    res.json({
      success: true,
      methods: availableMethods,
      count: availableMethods.length
    });

  } catch (error) {
    console.error('❌ [PaymentConfig] Error obteniendo métodos disponibles:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

/**
 * Obtener configuración por tipo
 */
paymentConfigController.getPaymentConfigByType = async (req, res) => {
  try {
    const { type } = req.params;

    console.log(`⚙️ [PaymentConfig] Obteniendo configuración para tipo: ${type}`);

    const config = await PaymentConfig.findOne({ type });

    if (!config) {
      return res.status(404).json({
        success: false,
        message: 'Configuración no encontrada',
        error: 'CONFIG_NOT_FOUND'
      });
    }

    console.log(`✅ [PaymentConfig] Configuración encontrada para ${type}`);

    res.json({
      success: true,
      config
    });

  } catch (error) {
    console.error('❌ [PaymentConfig] Error obteniendo configuración:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

/**
 * Crear o actualizar configuración
 */
paymentConfigController.upsertPaymentConfig = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Datos de entrada inválidos',
        errors: errors.array()
      });
    }

    const { type, name, enabled, config, message } = req.body;

    console.log(`⚙️ [PaymentConfig] Upserting configuración para tipo: ${type}`);

    // Verificar si ya existe
    const existingConfig = await PaymentConfig.findOne({ type });

    let result;
    if (existingConfig) {
      // Actualizar existente
      result = await PaymentConfig.findByIdAndUpdate(
        existingConfig._id,
        { name, enabled, config, message, updatedAt: new Date() },
        { new: true, runValidators: true }
      );
      console.log(`✅ [PaymentConfig] Configuración actualizada para ${type}`);
    } else {
      // Crear nueva
      result = await PaymentConfig.create({
        type,
        name,
        enabled,
        config,
        message
      });
      console.log(`✅ [PaymentConfig] Nueva configuración creada para ${type}`);
    }

    res.json({
      success: true,
      message: existingConfig ? 'Configuración actualizada exitosamente' : 'Configuración creada exitosamente',
      config: result
    });

  } catch (error) {
    console.error('❌ [PaymentConfig] Error upserting configuración:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

/**
 * Actualizar configuración existente
 */
paymentConfigController.updatePaymentConfig = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Datos de entrada inválidos',
        errors: errors.array()
      });
    }

    const { type } = req.params;
    const { name, enabled, config, message } = req.body;

    console.log(`⚙️ [PaymentConfig] Actualizando configuración para tipo: ${type}`);

    const updatedConfig = await PaymentConfig.findOneAndUpdate(
      { type },
      { name, enabled, config, message, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!updatedConfig) {
      return res.status(404).json({
        success: false,
        message: 'Configuración no encontrada',
        error: 'CONFIG_NOT_FOUND'
      });
    }

    console.log(`✅ [PaymentConfig] Configuración actualizada para ${type}`);

    res.json({
      success: true,
      message: 'Configuración actualizada exitosamente',
      config: updatedConfig
    });

  } catch (error) {
    console.error('❌ [PaymentConfig] Error actualizando configuración:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

/**
 * Eliminar configuración
 */
paymentConfigController.deletePaymentConfig = async (req, res) => {
  try {
    const { type } = req.params;

    console.log(`⚙️ [PaymentConfig] Eliminando configuración para tipo: ${type}`);

    const deletedConfig = await PaymentConfig.findOneAndDelete({ type });

    if (!deletedConfig) {
      return res.status(404).json({
        success: false,
        message: 'Configuración no encontrada',
        error: 'CONFIG_NOT_FOUND'
      });
    }

    console.log(`✅ [PaymentConfig] Configuración eliminada para ${type}`);

    res.json({
      success: true,
      message: 'Configuración eliminada exitosamente',
      config: deletedConfig
    });

  } catch (error) {
    console.error('❌ [PaymentConfig] Error eliminando configuración:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

/**
 * Obtener estadísticas de configuraciones
 */
paymentConfigController.getPaymentConfigStats = async (req, res) => {
  try {
    console.log('📊 [PaymentConfig] Obteniendo estadísticas');

    const totalConfigs = await PaymentConfig.countDocuments();
    const enabledConfigs = await PaymentConfig.countDocuments({ enabled: true });
    const disabledConfigs = await PaymentConfig.countDocuments({ enabled: false });

    const configsByType = await PaymentConfig.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          enabled: { $sum: { $cond: ['$enabled', 1, 0] } }
        }
      }
    ]);

    const stats = {
      total: totalConfigs,
      enabled: enabledConfigs,
      disabled: disabledConfigs,
      byType: configsByType
    };

    console.log(`✅ [PaymentConfig] Estadísticas obtenidas: ${totalConfigs} total`);

    res.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('❌ [PaymentConfig] Error obteniendo estadísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Exportar funciones individuales
export const {
  getPaymentConfigs,
  getAvailablePaymentMethods,
  getPaymentConfigByType,
  upsertPaymentConfig,
  updatePaymentConfig,
  deletePaymentConfig,
  getPaymentConfigStats
} = paymentConfigController;

export default paymentConfigController;