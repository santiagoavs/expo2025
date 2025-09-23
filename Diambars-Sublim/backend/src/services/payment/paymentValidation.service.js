// services/paymentValidation.service.js - Servicio de validación unificado para métodos de pago
export class PaymentValidationService {
  
  /**
   * Validar datos de método de pago según el tipo
   */
  static validatePaymentMethodData(data) {
    const errors = [];
    const { type, name, number, expiry, bankAccount, nickname } = data;

    // Validar nombre (requerido para todos los tipos)
    if (!name || name.trim().length < 2 || name.trim().length > 100) {
      errors.push({ field: 'name', message: 'Nombre debe tener entre 2 y 100 caracteres' });
    }

    // Validar apodo si se proporciona
    if (nickname && nickname.length > 50) {
      errors.push({ field: 'nickname', message: 'Apodo no puede exceder 50 caracteres' });
    }

    // Validaciones específicas según el tipo
    switch (type) {
      case 'credit_card':
      case 'wompi':
        return this.validateCardData(data, errors);
        
      case 'bank_transfer':
        return this.validateBankTransferData(data, errors);
        
      case 'cash':
        return this.validateCashData(data, errors);
        
      default:
        errors.push({ field: 'type', message: 'Tipo de método no válido' });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validar datos de tarjeta de crédito
   */
  static validateCardData(data, errors) {
    const { number, expiry } = data;

    // Validar número de tarjeta
    if (!number || number.length < 13 || number.length > 19 || !/^\d+$/.test(number)) {
      errors.push({ 
        field: 'number', 
        message: 'Número de tarjeta debe contener solo dígitos y tener entre 13-19 caracteres' 
      });
    }

    // Validar fecha de expiración
    if (!expiry || !/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry)) {
      errors.push({ 
        field: 'expiry', 
        message: 'Fecha de expiración debe tener formato MM/AA' 
      });
    } else {
      const [month, year] = expiry.split('/');
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear() % 100;
      const currentMonth = currentDate.getMonth() + 1;
      
      if (parseInt(year) < currentYear || (parseInt(year) === currentYear && parseInt(month) < currentMonth)) {
        errors.push({ 
          field: 'expiry', 
          message: 'La fecha de expiración no puede ser pasada' 
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validar datos de transferencia bancaria
   */
  static validateBankTransferData(data, errors) {
    const { bankAccount } = data;

    // Validar cuenta bancaria si se proporciona
    if (bankAccount && (bankAccount.length < 10 || !/^\d+$/.test(bankAccount))) {
      errors.push({ 
        field: 'bankAccount', 
        message: 'Número de cuenta debe tener al menos 10 dígitos' 
      });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validar datos de efectivo
   */
  static validateCashData(data, errors) {
    // Para efectivo, no se requieren validaciones adicionales
    // Solo se valida el nombre que ya se validó arriba
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validar configuración de método de pago
   */
  static validatePaymentConfig(config) {
    const errors = [];
    const { type, name, enabled } = config;

    // Validar tipo
    const supportedTypes = ['wompi', 'cash', 'bank_transfer', 'credit_card'];
    if (!type || !supportedTypes.includes(type)) {
      errors.push({ 
        field: 'type', 
        message: `Tipo debe ser uno de: ${supportedTypes.join(', ')}` 
      });
    }

    // Validar nombre
    if (!name || name.trim().length < 2 || name.trim().length > 100) {
      errors.push({ 
        field: 'name', 
        message: 'Nombre debe tener entre 2 y 100 caracteres' 
      });
    }

    // Validar enabled
    if (enabled !== undefined && typeof enabled !== 'boolean') {
      errors.push({ 
        field: 'enabled', 
        message: 'Enabled debe ser un booleano' 
      });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Obtener tipos de métodos soportados
   */
  static getSupportedTypes() {
    return {
      credit_card: {
        name: 'Tarjeta de Crédito',
        requiresCardData: true,
        requiresConfirmation: false
      },
      wompi: {
        name: 'Pago Digital (Wompi)',
        requiresCardData: false,
        requiresConfirmation: false
      },
      bank_transfer: {
        name: 'Transferencia Bancaria',
        requiresCardData: false,
        requiresConfirmation: true
      },
      cash: {
        name: 'Efectivo',
        requiresCardData: false,
        requiresConfirmation: true
      }
    };
  }
}
