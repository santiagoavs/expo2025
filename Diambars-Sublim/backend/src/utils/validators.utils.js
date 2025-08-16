// src/utils/validators.js - Validadores centralizados
import mongoose from 'mongoose';
import { EL_SALVADOR_LOCATIONS } from '../constants/locations.js';

export const validators = {
  
  // ==================== VALIDACIONES BÁSICAS ====================
  
  /**
   * Valida email
   */
  email(email) {
    if (!email || typeof email !== 'string') {
      return { isValid: false, error: 'Email requerido' };
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return { isValid: false, error: 'Formato de email inválido' };
    }
    
    return { isValid: true, cleaned: email.toLowerCase().trim() };
  },

  /**
   * Valida teléfono salvadoreño
   */
  phone(phone) {
    if (!phone || typeof phone !== 'string') {
      return { isValid: false, error: 'Teléfono requerido' };
    }
    
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    const phoneRegex = /^[267]\d{7}$/;
    
    if (!phoneRegex.test(cleanPhone)) {
      return { 
        isValid: false, 
        error: 'Formato inválido. Debe ser de El Salvador (ej: 7123-4567)' 
      };
    }
    
    return { 
      isValid: true, 
      cleaned: cleanPhone,
      formatted: `${cleanPhone.slice(0,4)}-${cleanPhone.slice(4)}`
    };
  },

  /**
   * Valida ID de MongoDB
   */
  mongoId(id, fieldName = 'ID') {
    if (!id) {
      return { isValid: false, error: `${fieldName} requerido` };
    }
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return { isValid: false, error: `${fieldName} inválido` };
    }
    
    return { isValid: true, cleaned: id.toString() };
  },

  /**
   * Valida precio
   */
  price(price, min = 0.01) {
    if (price === undefined || price === null) {
      return { isValid: false, error: 'Precio requerido' };
    }
    
    const numPrice = parseFloat(price);
    if (isNaN(numPrice) || !isFinite(numPrice)) {
      return { isValid: false, error: 'Precio debe ser un número válido' };
    }
    
    if (numPrice < min) {
      return { isValid: false, error: `Precio mínimo: $${min}` };
    }
    
    return { isValid: true, cleaned: Math.round(numPrice * 100) / 100 };
  },

  /**
   * Valida cantidad
   */
  quantity(qty, min = 1, max = 100) {
    if (qty === undefined || qty === null) {
      return { isValid: false, error: 'Cantidad requerida' };
    }
    
    const numQty = parseInt(qty);
    if (isNaN(numQty) || numQty < min || numQty > max) {
      return { isValid: false, error: `Cantidad debe estar entre ${min} y ${max}` };
    }
    
    return { isValid: true, cleaned: numQty };
  },

  // ==================== VALIDACIONES DE UBICACIÓN ====================

  /**
   * Valida departamento de El Salvador
   */
  department(department) {
    if (!department || typeof department !== 'string') {
      return { isValid: false, error: 'Departamento requerido' };
    }
    
    const trimmed = department.trim();
    if (!Object.keys(EL_SALVADOR_LOCATIONS).includes(trimmed)) {
      return { 
        isValid: false, 
        error: 'Departamento no válido',
        validOptions: Object.keys(EL_SALVADOR_LOCATIONS)
      };
    }
    
    return { isValid: true, cleaned: trimmed };
  },

  /**
   * Valida municipio
   */
  municipality(department, municipality) {
    if (!municipality || typeof municipality !== 'string') {
      return { isValid: false, error: 'Municipio requerido' };
    }
    
    const trimmedMun = municipality.trim();
    const trimmedDept = department?.trim();
    
    if (!trimmedDept || !EL_SALVADOR_LOCATIONS[trimmedDept]) {
      return { isValid: false, error: 'Departamento inválido para validar municipio' };
    }
    
    const validMunicipalities = EL_SALVADOR_LOCATIONS[trimmedDept];
    if (!validMunicipalities.includes(trimmedMun)) {
      return { 
        isValid: false, 
        error: `Municipio no pertenece a ${trimmedDept}`,
        validOptions: validMunicipalities
      };
    }
    
    return { isValid: true, cleaned: trimmedMun };
  },

  /**
   * Valida dirección completa
   */
  address(addressData) {
    const errors = [];
    const cleaned = {};
    
    // Validar campos requeridos
    const required = ['recipient', 'phoneNumber', 'department', 'municipality', 'address'];
    const missing = required.filter(field => !addressData[field]);
    
    if (missing.length > 0) {
      return { 
        isValid: false, 
        error: `Campos faltantes: ${missing.join(', ')}` 
      };
    }
    
    // Validar cada campo
    const recipientCheck = this.text(addressData.recipient, 2, 100);
    if (!recipientCheck.isValid) errors.push(`Destinatario: ${recipientCheck.error}`);
    else cleaned.recipient = recipientCheck.cleaned;
    
    const phoneCheck = this.phone(addressData.phoneNumber);
    if (!phoneCheck.isValid) errors.push(`Teléfono: ${phoneCheck.error}`);
    else cleaned.phoneNumber = phoneCheck.cleaned;
    
    const deptCheck = this.department(addressData.department);
    if (!deptCheck.isValid) errors.push(`Departamento: ${deptCheck.error}`);
    else cleaned.department = deptCheck.cleaned;
    
    const munCheck = this.municipality(addressData.department, addressData.municipality);
    if (!munCheck.isValid) errors.push(`Municipio: ${munCheck.error}`);
    else cleaned.municipality = munCheck.cleaned;
    
    const addressCheck = this.text(addressData.address, 10, 200);
    if (!addressCheck.isValid) errors.push(`Dirección: ${addressCheck.error}`);
    else cleaned.address = addressCheck.cleaned;
    
    // Campos opcionales
    if (addressData.label) {
      const labelCheck = this.text(addressData.label, 1, 50);
      if (labelCheck.isValid) cleaned.label = labelCheck.cleaned;
    }
    
    if (addressData.additionalDetails) {
      const detailsCheck = this.text(addressData.additionalDetails, 0, 200);
      if (detailsCheck.isValid) cleaned.additionalDetails = detailsCheck.cleaned;
    }
    
    if (errors.length > 0) {
      return { isValid: false, error: errors.join('; ') };
    }
    
    return { isValid: true, cleaned };
  },

  // ==================== VALIDACIONES DE TEXTO ====================

  /**
   * Valida texto con longitud
   */
  text(text, minLength = 0, maxLength = 1000) {
    if (text === undefined || text === null) {
      return minLength > 0 ? 
        { isValid: false, error: 'Texto requerido' } :
        { isValid: true, cleaned: '' };
    }
    
    if (typeof text !== 'string') {
      return { isValid: false, error: 'Debe ser texto' };
    }
    
    const trimmed = text.trim();
    
    if (trimmed.length < minLength) {
      return { isValid: false, error: `Mínimo ${minLength} caracteres` };
    }
    
    if (trimmed.length > maxLength) {
      return { isValid: false, error: `Máximo ${maxLength} caracteres` };
    }
    
    return { isValid: true, cleaned: trimmed };
  },

  /**
   * Valida nombre de persona
   */
  personName(name) {
    const textCheck = this.text(name, 2, 100);
    if (!textCheck.isValid) return textCheck;
    
    // Verificar que no sea solo números o caracteres especiales
    const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s\-\.]+$/;
    if (!nameRegex.test(textCheck.cleaned)) {
      return { isValid: false, error: 'Nombre contiene caracteres inválidos' };
    }
    
    return { isValid: true, cleaned: textCheck.cleaned };
  },

  // ==================== VALIDACIONES DE PRODUCTO/DISEÑO ====================

  /**
   * Valida posición de elemento
   */
  position(position) {
    if (!position || typeof position !== 'object') {
      return { isValid: false, error: 'Posición requerida' };
    }
    
    const required = ['x', 'y', 'width', 'height'];
    const missing = required.filter(field => typeof position[field] !== 'number');
    
    if (missing.length > 0) {
      return { isValid: false, error: `Faltan coordenadas: ${missing.join(', ')}` };
    }
    
    if (position.x < 0 || position.y < 0) {
      return { isValid: false, error: 'Coordenadas no pueden ser negativas' };
    }
    
    if (position.width < 10 || position.height < 10) {
      return { isValid: false, error: 'Tamaño mínimo 10x10 píxeles' };
    }
    
    return { 
      isValid: true, 
      cleaned: {
        x: Math.round(position.x),
        y: Math.round(position.y),
        width: Math.round(position.width),
        height: Math.round(position.height)
      }
    };
  },

  /**
   * Valida color hexadecimal
   */
  color(color) {
    if (!color || typeof color !== 'string') {
      return { isValid: false, error: 'Color requerido' };
    }
    
    const colorRegex = /^#[0-9A-F]{6}$/i;
    if (!colorRegex.test(color)) {
      return { isValid: false, error: 'Color debe ser hexadecimal (#RRGGBB)' };
    }
    
    return { isValid: true, cleaned: color.toUpperCase() };
  },

  // ==================== VALIDACIONES DE PAGO ====================

  /**
   * Valida datos de pago en efectivo
   */
  cashPayment(cashData, orderTotal) {
    const errors = [];
    const cleaned = {};
    
    if (!cashData || typeof cashData !== 'object') {
      return { isValid: false, error: 'Datos de pago requeridos' };
    }
    
    // Validar monto total
    const totalCheck = this.price(cashData.totalAmount || orderTotal);
    if (!totalCheck.isValid) errors.push(`Total: ${totalCheck.error}`);
    else cleaned.totalAmount = totalCheck.cleaned;
    
    // Validar monto recibido
    const receivedCheck = this.price(cashData.cashReceived);
    if (!receivedCheck.isValid) errors.push(`Recibido: ${receivedCheck.error}`);
    else cleaned.cashReceived = receivedCheck.cleaned;
    
    // Validar que el monto sea suficiente
    if (cleaned.cashReceived && cleaned.totalAmount && 
        cleaned.cashReceived < cleaned.totalAmount) {
      errors.push('Monto recibido insuficiente');
    }
    
    // Calcular cambio
    if (cleaned.cashReceived && cleaned.totalAmount) {
      cleaned.changeGiven = Math.max(0, cleaned.cashReceived - cleaned.totalAmount);
    }
    
    // Validar ubicación
    const locationCheck = this.text(cashData.location, 5, 200);
    if (!locationCheck.isValid) errors.push(`Ubicación: ${locationCheck.error}`);
    else cleaned.location = locationCheck.cleaned;
    
    // Notas opcionales
    if (cashData.notes) {
      const notesCheck = this.text(cashData.notes, 0, 500);
      if (notesCheck.isValid) cleaned.notes = notesCheck.cleaned;
    }
    
    if (errors.length > 0) {
      return { isValid: false, error: errors.join('; ') };
    }
    
    return { isValid: true, cleaned };
  },

  // ==================== VALIDACIONES DE ARCHIVO ====================

  /**
   * Valida archivo de imagen
   */
  imageFile(file, maxSize = 5 * 1024 * 1024) {
    if (!file) {
      return { isValid: false, error: 'Archivo requerido' };
    }
    
    // Validar tamaño
    if (file.size > maxSize) {
      const maxMB = maxSize / (1024 * 1024);
      return { isValid: false, error: `Archivo muy grande. Máximo ${maxMB}MB` };
    }
    
    // Validar tipo MIME
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.mimetype)) {
      return { isValid: false, error: 'Solo se permiten: JPG, PNG, WEBP' };
    }
    
    return { isValid: true };
  },

  // ==================== VALIDACIONES DE FECHA ====================

  /**
   * Valida fecha futura
   */
  futureDate(date, minHours = 24) {
    if (!date) {
      return { isValid: false, error: 'Fecha requerida' };
    }
    
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return { isValid: false, error: 'Fecha inválida' };
    }
    
    const minDate = new Date(Date.now() + minHours * 60 * 60 * 1000);
    if (dateObj < minDate) {
      return { isValid: false, error: `Fecha debe ser al menos ${minHours} horas en el futuro` };
    }
    
    return { isValid: true, cleaned: dateObj };
  },

  // ==================== VALIDACIONES COMBINADAS ====================

  /**
   * Valida datos de pedido
   */
  orderData(orderData) {
    const errors = [];
    const cleaned = {};
    
    // Validar designId
    const designCheck = this.mongoId(orderData.designId, 'ID de diseño');
    if (!designCheck.isValid) errors.push(designCheck.error);
    else cleaned.designId = designCheck.cleaned;
    
    // Validar cantidad
    if (orderData.quantity) {
      const qtyCheck = this.quantity(orderData.quantity);
      if (!qtyCheck.isValid) errors.push(qtyCheck.error);
      else cleaned.quantity = qtyCheck.cleaned;
    }
    
    // Validar tipo de entrega
    if (orderData.deliveryType && !['delivery', 'meetup'].includes(orderData.deliveryType)) {
      errors.push('Tipo de entrega debe ser "delivery" o "meetup"');
    } else {
      cleaned.deliveryType = orderData.deliveryType || 'meetup';
    }
    
    // Validar notas del cliente
    if (orderData.clientNotes) {
      const notesCheck = this.text(orderData.clientNotes, 0, 1000);
      if (!notesCheck.isValid) errors.push(`Notas: ${notesCheck.error}`);
      else cleaned.clientNotes = notesCheck.cleaned;
    }
    
    if (errors.length > 0) {
      return { isValid: false, error: errors.join('; ') };
    }
    
    return { isValid: true, cleaned };
  }
};

/**
 * Helper para validar múltiples campos a la vez
 */
export const validateFields = (data, validations) => {
  const errors = [];
  const cleaned = {};
  
  Object.entries(validations).forEach(([field, validator]) => {
    const value = data[field];
    let result;
    
    if (typeof validator === 'function') {
      result = validator(value);
    } else if (typeof validator === 'string' && validators[validator]) {
      result = validators[validator](value);
    } else {
      result = { isValid: false, error: 'Validador inválido' };
    }
    
    if (!result.isValid) {
      errors.push(`${field}: ${result.error}`);
    } else if (result.cleaned !== undefined) {
      cleaned[field] = result.cleaned;
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors,
    cleaned
  };
};

export default validators;