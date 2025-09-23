// services/paymentSelection.service.js - Servicio para selección de métodos de pago
import PaymentConfig from '../models/paymentConfig.js';
import PaymentMethod from '../models/paymentMethod.js';
import User from '../models/users.js';

/**
 * Obtener métodos de pago disponibles para un usuario
 */
export const getAvailablePaymentMethodsForUser = async (userId) => {
  try {
    console.log(`💳 [PaymentSelection] Obteniendo métodos disponibles para usuario: ${userId}`);

    // Obtener configuraciones del sistema habilitadas
    const systemConfigs = await PaymentConfig.find({ enabled: true })
      .select('type name message config')
      .sort({ createdAt: 1 });

    // Obtener métodos de pago del usuario
    const userMethods = await PaymentMethod.find({ 
      userId, 
      active: true 
    })
      .select('type lastFourDigits name expiry issuer nickname')
      .sort({ createdAt: -1 });

    // Agrupar métodos por tipo
    const methodsByType = {
      wompi: {
        systemConfig: systemConfigs.find(config => config.type === 'wompi'),
        userMethods: userMethods.filter(method => method.type === 'wompi')
      },
      credit_card: {
        systemConfig: systemConfigs.find(config => config.type === 'credit_card'),
        userMethods: userMethods.filter(method => method.type === 'credit_card')
      },
      bank_transfer: {
        systemConfig: systemConfigs.find(config => config.type === 'bank_transfer'),
        userMethods: userMethods.filter(method => method.type === 'bank_transfer')
      },
      cash: {
        systemConfig: systemConfigs.find(config => config.type === 'cash'),
        userMethods: userMethods.filter(method => method.type === 'cash')
      }
    };

    // Filtrar solo métodos que tienen configuración del sistema
    const availableMethods = Object.entries(methodsByType)
      .filter(([type, data]) => data.systemConfig)
      .map(([type, data]) => ({
        type,
        name: data.systemConfig.name,
        message: data.systemConfig.message,
        config: data.systemConfig.config,
        userMethods: data.userMethods,
        canAddNew: type === 'credit_card' || type === 'wompi' || type === 'bank_transfer'
      }));

    console.log(`✅ [PaymentSelection] ${availableMethods.length} métodos disponibles`);

    return {
      success: true,
      methods: availableMethods,
      count: availableMethods.length
    };

  } catch (error) {
    console.error('❌ [PaymentSelection] Error obteniendo métodos:', error);
    throw error;
  }
};

/**
 * Validar método de pago seleccionado
 */
export const validateSelectedPaymentMethod = async (userId, paymentData) => {
  try {
    const { method, userMethodId, newMethodData } = paymentData;

    console.log(`🔍 [PaymentSelection] Validando método de pago: ${method}`);

    // Verificar que el método esté habilitado en el sistema
    const systemConfig = await PaymentConfig.findOne({ 
      type: method, 
      enabled: true 
    });

    if (!systemConfig) {
      throw new Error(`Método de pago ${method} no está disponible`);
    }

    let validatedMethod = null;

    if (userMethodId) {
      // Validar método existente del usuario
      const userMethod = await PaymentMethod.findOne({
        _id: userMethodId,
        userId,
        active: true,
        type: method
      });

      if (!userMethod) {
        throw new Error('Método de pago del usuario no encontrado o inactivo');
      }

      validatedMethod = {
        type: method,
        userMethodId,
        userMethod: {
          id: userMethod._id,
          name: userMethod.name,
          lastFourDigits: userMethod.lastFourDigits,
          expiry: userMethod.expiry,
          issuer: userMethod.issuer,
          nickname: userMethod.nickname
        },
        systemConfig: {
          name: systemConfig.name,
          message: systemConfig.message,
          config: systemConfig.config
        }
      };
    } else if (newMethodData) {
      // Validar nuevo método de pago
      if (method === 'credit_card' || method === 'wompi') {
        if (!newMethodData.cardNumber || !newMethodData.expiry || !newMethodData.name) {
          throw new Error('Datos de tarjeta incompletos');
        }
      } else if (method === 'bank_transfer') {
        if (!newMethodData.bankAccount || !newMethodData.name) {
          throw new Error('Datos de cuenta bancaria incompletos');
        }
      }

      validatedMethod = {
        type: method,
        newMethod: newMethodData,
        systemConfig: {
          name: systemConfig.name,
          message: systemConfig.message,
          config: systemConfig.config
        }
      };
    } else {
      // Método sin datos adicionales (efectivo)
      validatedMethod = {
        type: method,
        systemConfig: {
          name: systemConfig.name,
          message: systemConfig.message,
          config: systemConfig.config
        }
      };
    }

    console.log(`✅ [PaymentSelection] Método validado: ${method}`);

    return {
      success: true,
      method: validatedMethod
    };

  } catch (error) {
    console.error('❌ [PaymentSelection] Error validando método:', error);
    throw error;
  }
};

/**
 * Procesar pago según el método seleccionado
 */
export const processPayment = async (orderId, paymentMethod, paymentData) => {
  try {
    console.log(`💳 [PaymentSelection] Procesando pago para orden: ${orderId}`);

    const { method, userMethodId, newMethodData } = paymentMethod;

    let paymentResult = null;

    switch (method) {
      case 'wompi':
        // Procesar con Wompi
        paymentResult = await processWompiPayment(orderId, paymentData);
        break;

      case 'credit_card':
        // Procesar tarjeta de crédito
        paymentResult = await processCreditCardPayment(orderId, paymentData);
        break;

      case 'bank_transfer':
        // Procesar transferencia bancaria
        paymentResult = await processBankTransferPayment(orderId, paymentData);
        break;

      case 'cash':
        // Procesar efectivo
        paymentResult = await processCashPayment(orderId, paymentData);
        break;

      default:
        throw new Error(`Método de pago no soportado: ${method}`);
    }

    console.log(`✅ [PaymentSelection] Pago procesado: ${method}`);

    return {
      success: true,
      paymentResult
    };

  } catch (error) {
    console.error('❌ [PaymentSelection] Error procesando pago:', error);
    throw error;
  }
};

/**
 * Procesar pago con Wompi
 */
const processWompiPayment = async (orderId, paymentData) => {
  // Implementar lógica de Wompi
  return {
    method: 'wompi',
    status: 'pending',
    transactionId: `wompi_${Date.now()}`,
    paymentUrl: 'https://wompi.example.com/pay',
    expiresAt: new Date(Date.now() + 15 * 60 * 1000) // 15 minutos
  };
};

/**
 * Procesar pago con tarjeta de crédito
 */
const processCreditCardPayment = async (orderId, paymentData) => {
  // Implementar lógica de tarjeta de crédito
  return {
    method: 'credit_card',
    status: 'pending',
    transactionId: `card_${Date.now()}`,
    lastFourDigits: paymentData.cardNumber?.slice(-4),
    cardBrand: 'visa' // Determinar según el número
  };
};

/**
 * Procesar transferencia bancaria
 */
const processBankTransferPayment = async (orderId, paymentData) => {
  // Implementar lógica de transferencia bancaria
  return {
    method: 'bank_transfer',
    status: 'pending',
    transactionId: `transfer_${Date.now()}`,
    bankAccount: paymentData.bankAccount,
    instructions: 'Realizar transferencia a la cuenta especificada'
  };
};

/**
 * Procesar pago en efectivo
 */
const processCashPayment = async (orderId, paymentData) => {
  // Implementar lógica de efectivo
  return {
    method: 'cash',
    status: 'pending',
    transactionId: `cash_${Date.now()}`,
    instructions: 'Pago al momento de la entrega'
  };
};

export default {
  getAvailablePaymentMethodsForUser,
  validateSelectedPaymentMethod,
  processPayment
};
