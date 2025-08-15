// utils/cashPaymentUtils.js - Helpers para pagos en efectivo
import mongoose from 'mongoose';

/**
 * Validar datos de pago en efectivo
 */
export const validateCashPayment = (cashData, orderTotal) => {
  const errors = [];
  
  if (!cashData) {
    return {
      isValid: false,
      errors: ['Datos de pago en efectivo requeridos']
    };
  }
  
  const {
    totalAmount,
    cashReceived,
    changeGiven,
    paymentLocation,
    adminNotes
  } = cashData;
  
  // Validar monto total
  const expectedTotal = parseFloat(totalAmount) || orderTotal;
  if (isNaN(expectedTotal) || expectedTotal <= 0) {
    errors.push('Monto total inválido');
  }
  
  // Validar monto recibido
  const received = parseFloat(cashReceived);
  if (isNaN(received) || received <= 0) {
    errors.push('Monto recibido debe ser mayor que cero');
  }
  
  // Validar que el monto recibido cubra el total
  if (received < expectedTotal) {
    errors.push(`Monto insuficiente. Recibido: $${received.toFixed(2)}, Requerido: $${expectedTotal.toFixed(2)}`);
  }
  
  // Validar cambio
  const expectedChange = Math.max(0, received - expectedTotal);
  const providedChange = parseFloat(changeGiven) || 0;
  
  if (Math.abs(providedChange - expectedChange) > 0.01) {
    errors.push(`Cambio incorrecto. Esperado: $${expectedChange.toFixed(2)}, Proporcionado: $${providedChange.toFixed(2)}`);
  }
  
  // Validar ubicación
  if (!paymentLocation || paymentLocation.trim().length === 0) {
    errors.push('Ubicación del pago es requerida');
  }
  
  // Validar longitud de notas
  if (adminNotes && adminNotes.length > 500) {
    errors.push('Las notas no pueden exceder 500 caracteres');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    calculatedChange: expectedChange,
    validatedAmounts: {
      total: expectedTotal,
      received: received,
      change: expectedChange
    }
  };
};

/**
 * Calcular denominaciones sugeridas para el cambio
 */
export const calculateChangeDenominations = (changeAmount) => {
  if (changeAmount <= 0) {
    return { total: 0, denominations: [] };
  }
  
  // Denominaciones en USD (El Salvador)
  const denominations = [
    { value: 20, name: '$20', type: 'bill' },
    { value: 10, name: '$10', type: 'bill' },
    { value: 5, name: '$5', type: 'bill' },
    { value: 1, name: '$1', type: 'bill' },
    { value: 0.25, name: '25¢', type: 'coin' },
    { value: 0.10, name: '10¢', type: 'coin' },
    { value: 0.05, name: '5¢', type: 'coin' },
    { value: 0.01, name: '1¢', type: 'coin' }
  ];
  
  let remaining = Math.round(changeAmount * 100) / 100; // Redondear a centavos
  const result = [];
  
  for (const denom of denominations) {
    const count = Math.floor(remaining / denom.value);
    if (count > 0) {
      result.push({
        denomination: denom.name,
        value: denom.value,
        count: count,
        total: Math.round(count * denom.value * 100) / 100,
        type: denom.type
      });
      remaining = Math.round((remaining - (count * denom.value)) * 100) / 100;
    }
  }
  
  return {
    total: changeAmount,
    denominations: result,
    bills: result.filter(d => d.type === 'bill'),
    coins: result.filter(d => d.type === 'coin')
  };
};

/**
 * Generar número de recibo de efectivo
 */
export const generateCashReceiptNumber = (orderNumber, timestamp = new Date()) => {
  const date = timestamp.toISOString().slice(0, 10).replace(/-/g, '');
  const time = timestamp.toISOString().slice(11, 19).replace(/:/g, '');
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  
  return `CASH-${orderNumber}-${date}${time}-${random}`;
};

/**
 * Formatear datos de pago en efectivo para almacenar
 */
export const formatCashPaymentData = (cashData, adminId, orderNumber) => {
  const validation = validateCashPayment(cashData, cashData.totalAmount);
  
  if (!validation.isValid) {
    const error = new Error('Datos de pago en efectivo inválidos');
    error.details = validation.errors;
    throw error;
  }
  
  const {
    totalAmount,
    cashReceived,
    paymentLocation,
    adminNotes,
    deliveredAt
  } = cashData;
  
  return {
    collectedBy: adminId,
    collectedAt: new Date(),
    receiptNumber: generateCashReceiptNumber(orderNumber),
    totalAmount: validation.validatedAmounts.total,
    cashReceived: validation.validatedAmounts.received,
    changeGiven: validation.validatedAmounts.change,
    changeDenominations: calculateChangeDenominations(validation.validatedAmounts.change),
    location: {
      type: 'Point',
      coordinates: [-89.2182, 13.6929], // Default San Salvador
      address: paymentLocation?.trim() || 'Punto de entrega',
      placeName: paymentLocation?.trim() || ''
    },
    notes: adminNotes?.trim() || '',
    deliveredAt: deliveredAt ? new Date(deliveredAt) : new Date(),
    metadata: {
      paymentMethod: 'cash',
      processedBy: 'admin',
      validationPassed: true
    }
  };
};

/**
 * Obtener resumen de pago en efectivo
 */
export const getCashPaymentSummary = (cashPaymentDetails) => {
  if (!cashPaymentDetails) {
    return null;
  }
  
  return {
    receiptNumber: cashPaymentDetails.receiptNumber,
    totalAmount: cashPaymentDetails.totalAmount,
    cashReceived: cashPaymentDetails.cashReceived,
    changeGiven: cashPaymentDetails.changeGiven,
    collectedAt: cashPaymentDetails.collectedAt,
    location: cashPaymentDetails.location?.address || 'No especificada',
    collectedBy: cashPaymentDetails.collectedBy,
    changeDenominations: cashPaymentDetails.changeDenominations,
    notes: cashPaymentDetails.notes
  };
};

/**
 * Validar ubicación de pago
 */
export const validatePaymentLocation = (location) => {
  const errors = [];
  
  if (!location || typeof location !== 'string') {
    errors.push('Ubicación es requerida');
    return { isValid: false, errors };
  }
  
  const trimmedLocation = location.trim();
  
  if (trimmedLocation.length < 5) {
    errors.push('La ubicación debe tener al menos 5 caracteres');
  }
  
  if (trimmedLocation.length > 200) {
    errors.push('La ubicación no puede exceder 200 caracteres');
  }
  
  // Palabras prohibidas o sospechosas
  const suspiciousWords = ['test', 'testing', 'prueba', 'fake', 'falso'];
  const containsSuspicious = suspiciousWords.some(word => 
    trimmedLocation.toLowerCase().includes(word)
  );
  
  if (containsSuspicious) {
    errors.push('La ubicación parece ser de prueba o inválida');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    cleanLocation: trimmedLocation
  };
};

/**
 * Calcular estadísticas de pagos en efectivo
 */
export const calculateCashPaymentStats = (cashPayments) => {
  if (!Array.isArray(cashPayments) || cashPayments.length === 0) {
    return {
      totalPayments: 0,
      totalAmount: 0,
      totalCashReceived: 0,
      totalChangeGiven: 0,
      averagePayment: 0,
      averageChange: 0,
      largestPayment: 0,
      smallestPayment: 0
    };
  }
  
  const amounts = cashPayments.map(p => p.totalAmount || 0);
  const cashReceived = cashPayments.map(p => p.cashReceived || 0);
  const changeGiven = cashPayments.map(p => p.changeGiven || 0);
  
  return {
    totalPayments: cashPayments.length,
    totalAmount: amounts.reduce((sum, amount) => sum + amount, 0),
    totalCashReceived: cashReceived.reduce((sum, amount) => sum + amount, 0),
    totalChangeGiven: changeGiven.reduce((sum, amount) => sum + amount, 0),
    averagePayment: amounts.reduce((sum, amount) => sum + amount, 0) / amounts.length,
    averageChange: changeGiven.reduce((sum, amount) => sum + amount, 0) / changeGiven.length,
    largestPayment: Math.max(...amounts),
    smallestPayment: Math.min(...amounts)
  };
};

/**
 * Generar reporte de efectivo para un período
 */
export const generateCashReport = (cashPayments, startDate, endDate) => {
  const stats = calculateCashPaymentStats(cashPayments);
  
  // Agrupar por día
  const paymentsByDay = {};
  cashPayments.forEach(payment => {
    const day = new Date(payment.collectedAt).toISOString().split('T')[0];
    if (!paymentsByDay[day]) {
      paymentsByDay[day] = [];
    }
    paymentsByDay[day].push(payment);
  });
  
  // Calcular totales por día
  const dailyTotals = Object.entries(paymentsByDay).map(([day, payments]) => ({
    date: day,
    count: payments.length,
    totalAmount: payments.reduce((sum, p) => sum + (p.totalAmount || 0), 0),
    totalCashReceived: payments.reduce((sum, p) => sum + (p.cashReceived || 0), 0),
    totalChangeGiven: payments.reduce((sum, p) => sum + (p.changeGiven || 0), 0)
  })).sort((a, b) => a.date.localeCompare(b.date));
  
  return {
    period: {
      startDate,
      endDate,
      days: dailyTotals.length
    },
    summary: stats,
    dailyBreakdown: dailyTotals,
    topLocations: getTopPaymentLocations(cashPayments),
    adminBreakdown: getAdminPaymentBreakdown(cashPayments)
  };
};

/**
 * Obtener ubicaciones más frecuentes de pago
 */
export const getTopPaymentLocations = (cashPayments, limit = 10) => {
  const locationCounts = {};
  
  cashPayments.forEach(payment => {
    const location = payment.location?.address || 'Sin especificar';
    locationCounts[location] = (locationCounts[location] || 0) + 1;
  });
  
  return Object.entries(locationCounts)
    .map(([location, count]) => ({ location, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
};

/**
 * Obtener breakdown de pagos por admin
 */
export const getAdminPaymentBreakdown = (cashPayments) => {
  const adminStats = {};
  
  cashPayments.forEach(payment => {
    const adminId = payment.collectedBy?.toString() || 'unknown';
    
    if (!adminStats[adminId]) {
      adminStats[adminId] = {
        count: 0,
        totalAmount: 0,
        totalCashReceived: 0,
        totalChangeGiven: 0
      };
    }
    
    adminStats[adminId].count += 1;
    adminStats[adminId].totalAmount += payment.totalAmount || 0;
    adminStats[adminId].totalCashReceived += payment.cashReceived || 0;
    adminStats[adminId].totalChangeGiven += payment.changeGiven || 0;
  });
  
  return Object.entries(adminStats).map(([adminId, stats]) => ({
    adminId,
    ...stats,
    averagePayment: stats.totalAmount / stats.count
  })).sort((a, b) => b.totalAmount - a.totalAmount);
};

/**
 * Validar horario de pago (para restricciones de negocio)
 */
export const validatePaymentTime = (paymentTime = new Date()) => {
  const hour = paymentTime.getHours();
  const dayOfWeek = paymentTime.getDay(); // 0 = Domingo, 6 = Sábado
  
  const warnings = [];
  
  // Horario de negocio típico: 8 AM - 8 PM
  if (hour < 8 || hour > 20) {
    warnings.push('Pago registrado fuera del horario de negocio típico');
  }
  
  // Fines de semana
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    warnings.push('Pago registrado en fin de semana');
  }
  
  // Muy tarde en la noche
  if (hour >= 22 || hour < 6) {
    warnings.push('Pago registrado en horario nocturno - verificar si es correcto');
  }
  
  return {
    isValidTime: true, // Siempre válido, solo advertencias
    warnings,
    paymentTime,
    isBusinessHours: hour >= 8 && hour <= 20 && dayOfWeek >= 1 && dayOfWeek <= 5
  };
};

export default {
  validateCashPayment,
  calculateChangeDenominations,
  generateCashReceiptNumber,
  formatCashPaymentData,
  getCashPaymentSummary,
  validatePaymentLocation,
  calculateCashPaymentStats,
  generateCashReport,
  getTopPaymentLocations,
  getAdminPaymentBreakdown,
  validatePaymentTime
};