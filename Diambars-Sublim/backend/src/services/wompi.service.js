// services/wompi.service.js - Servicio optimizado con modo ficticio
import axios from 'axios';
import crypto from 'crypto';
import { config } from '../config.js';

// Usar configuración centralizada
const WOMPI_CONFIG = config.wompi;

/**
 * Valida si Wompi está configurado correctamente
 */
export const isWompiConfigured = () => {
  const hasValidKeys = !!(
    WOMPI_CONFIG.publicKey && 
    WOMPI_CONFIG.privateKey && 
    WOMPI_CONFIG.integritySecret && 
    WOMPI_CONFIG.webhookSecret &&
    WOMPI_CONFIG.publicKey !== 'pub_sandbox_placeholder' &&
    WOMPI_CONFIG.privateKey !== 'prv_sandbox_placeholder' &&
    WOMPI_CONFIG.integritySecret !== 'integrity_placeholder' &&
    WOMPI_CONFIG.webhookSecret !== 'webhook_placeholder'
  );
  
  return hasValidKeys;
};

/**
 * Procesa pago con Wompi o simula el proceso si no está configurado
 */
export const processWompiPayment = async (paymentData) => {
  try {
    console.log('💳 Iniciando proceso de pago:', {
      orderId: paymentData.orderId,
      amount: paymentData.amount,
      isConfigured: isWompiConfigured(),
      isPartial: paymentData.isPartialPayment
    });

    // Si Wompi no está configurado, usar modo ficticio
    if (!isWompiConfigured()) {
      console.warn('⚠️ Wompi no configurado - usando modo FICTICIO');
      return generateFakePaymentResponse(paymentData);
    }

    // Proceso real con Wompi
    return await processRealWompiPayment(paymentData);

  } catch (error) {
    console.error('❌ Error procesando pago:', error);
    
    // En caso de error, devolver respuesta ficticia para no romper el flujo
    console.warn('⚠️ Error en Wompi - fallback a modo ficticio');
    return generateFakePaymentResponse(paymentData);
  }
};

/**
 * Genera respuesta de pago ficticia para desarrollo/testing
 */
function generateFakePaymentResponse(paymentData) {
  const {
    orderId,
    amount,
    currency = WOMPI_CONFIG.currency,
    isPartialPayment = false
  } = paymentData;

  // Crear referencia única
  const reference = `FAKE-${orderId}-${Date.now()}`;
  const amountInCents = Math.round(amount * 100);
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

  console.log('🎭 Generando respuesta de pago FICTICIA:', {
    reference,
    amountInCents,
    expiresAt: expiresAt.toISOString()
  });

  return {
    success: true,
    paymentLinkId: `fake_link_${Date.now()}`,
    paymentUrl: `${WOMPI_CONFIG.urls.success}?simulated=true&order=${orderId}&ref=${reference}`,
    reference,
    expiresAt: expiresAt.toISOString(),
    amountInCents,
    currency,
    environment: 'simulated',
    isFake: true,
    message: 'Pago simulado - Wompi no configurado'
  };
}

/**
 * Procesa pago real con API de Wompi
 */
async function processRealWompiPayment(paymentData) {
  const {
    orderId,
    amount,
    currency = WOMPI_CONFIG.currency,
    customerEmail,
    customerName,
    description,
    isPartialPayment = false
  } = paymentData;

  // Convertir monto a centavos
  const amountInCents = Math.round(amount * 100);
  const reference = `DS-${orderId}-${Date.now()}`;
  const expiresAt = new Date(Date.now() + (WOMPI_CONFIG.settings.defaultTimeout * 60 * 1000));

  const paymentLinkData = {
    name: `Pedido ${description}`,
    description: `Pago ${isPartialPayment ? 'parcial' : 'total'} - ${description}`,
    single_use: true,
    collect_shipping: false,
    currency,
    amount_in_cents: amountInCents,
    redirect_url: `${WOMPI_CONFIG.urls.success}?order=${orderId}&ref=${reference}`,
    expired_redirect_url: `${WOMPI_CONFIG.urls.failure}?order=${orderId}&reason=expired`,
    expires_at: expiresAt.toISOString(),
    customer_data: {
      email: customerEmail,
      full_name: customerName
    },
    metadata: {
      order_id: orderId.toString(),
      is_partial: isPartialPayment,
      created_at: new Date().toISOString(),
      reference,
      source: 'diambars_backend',
      environment: WOMPI_CONFIG.env
    }
  };

  console.log('📝 Enviando datos a Wompi:', {
    amount_in_cents: amountInCents,
    reference,
    expires_at: expiresAt.toISOString()
  });

  const response = await axios.post(
    `${WOMPI_CONFIG.baseUrl}/payment_links`,
    paymentLinkData,
    {
      headers: {
        'Authorization': `Bearer ${WOMPI_CONFIG.privateKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    }
  );

  console.log('✅ Link de pago real creado:', {
    id: response.data.data.id,
    url: response.data.data.public_url
  });

  return {
    success: true,
    paymentLinkId: response.data.data.id,
    paymentUrl: response.data.data.public_url,
    reference,
    expiresAt: response.data.data.expires_at,
    amountInCents,
    currency,
    environment: WOMPI_CONFIG.env,
    isFake: false
  };
}

/**
 * Verifica el estado de una transacción
 */
export const checkTransactionStatus = async (transactionId) => {
  try {
    if (!isWompiConfigured()) {
      console.warn('⚠️ Wompi no configurado - simulando consulta de transacción');
      return {
        id: transactionId,
        status: 'APPROVED',
        statusMessage: 'Pago simulado aprobado',
        amount: 100,
        currency: 'USD',
        paymentMethod: 'CARD',
        reference: `SIM-${transactionId}`,
        createdAt: new Date().toISOString(),
        finalizedAt: new Date().toISOString(),
        paymentSourceId: 'simulated',
        isFake: true
      };
    }

    console.log('🔍 Verificando estado de transacción real:', transactionId);

    const response = await axios.get(
      `${WOMPI_CONFIG.baseUrl}/transactions/${transactionId}`,
      {
        headers: {
          'Authorization': `Bearer ${WOMPI_CONFIG.publicKey}`
        },
        timeout: 15000
      }
    );

    const transaction = response.data.data;

    return {
      id: transaction.id,
      status: transaction.status,
      statusMessage: transaction.status_message,
      amount: transaction.amount_in_cents / 100,
      currency: transaction.currency,
      paymentMethod: transaction.payment_method_type,
      reference: transaction.reference,
      createdAt: transaction.created_at,
      finalizedAt: transaction.finalized_at,
      paymentSourceId: transaction.payment_source_id,
      isFake: false
    };

  } catch (error) {
    console.error('❌ Error verificando transacción:', error);
    
    // Fallback a respuesta simulada
    return {
      id: transactionId,
      status: 'ERROR',
      statusMessage: 'Error al verificar transacción',
      amount: 0,
      currency: 'USD',
      paymentMethod: 'UNKNOWN',
      reference: `ERR-${transactionId}`,
      createdAt: new Date().toISOString(),
      finalizedAt: new Date().toISOString(),
      paymentSourceId: 'error',
      isFake: true,
      error: error.message
    };
  }
};

/**
 * Valida webhook de Wompi (siempre retorna true si no está configurado)
 */
export const validateWompiWebhook = async (req) => {
  try {
    if (!isWompiConfigured()) {
      console.warn('⚠️ Wompi no configurado - webhook simulado como válido');
      return true;
    }

    console.log('🔐 Validando webhook real de Wompi');

    const signature = req.headers['x-event-signature'];
    const timestamp = req.headers['x-timestamp'];
    const body = req.body;

    if (!signature || !timestamp) {
      console.error('❌ Faltan headers de seguridad:', { signature: !!signature, timestamp: !!timestamp });
      return false;
    }

    // Verificar timestamp (no más de 5 minutos)
    const currentTime = Math.floor(Date.now() / 1000);
    const webhookTime = parseInt(timestamp);
    const timeDiff = Math.abs(currentTime - webhookTime);
    
    if (timeDiff > 300) {
      console.error('❌ Webhook muy antiguo:', { timeDiff });
      return false;
    }

    // Generar y validar firma
    const bodyString = typeof body === 'string' ? body : JSON.stringify(body);
    const signatureString = `${bodyString}${timestamp}${WOMPI_CONFIG.webhookSecret}`;
    
    const expectedSignature = crypto
      .createHash('sha256')
      .update(signatureString)
      .digest('hex');

    const isValid = signature === expectedSignature;
    console.log(isValid ? '✅ Webhook válido' : '❌ Webhook inválido');

    return isValid;

  } catch (error) {
    console.error('❌ Error validando webhook:', error);
    return false;
  }
};

/**
 * Simula confirmación de pago para modo ficticio
 */
export const simulatePaymentConfirmation = async (orderId, reference) => {
  if (isWompiConfigured()) {
    throw new Error('No se puede simular pago cuando Wompi está configurado');
  }

  console.log('🎭 Simulando confirmación de pago:', { orderId, reference });

  // Simular diferentes estados de pago aleatoriamente para testing
  const outcomes = ['approved', 'approved', 'approved', 'declined', 'error']; // 60% aprobado
  const outcome = outcomes[Math.floor(Math.random() * outcomes.length)];

  const baseResponse = {
    orderId,
    reference,
    timestamp: new Date().toISOString(),
    paymentMethod: 'simulated_card',
    amount: 100, // Este valor debería venir del pedido real
    currency: 'USD',
    isFake: true
  };

  switch (outcome) {
    case 'approved':
      return {
        ...baseResponse,
        status: 'APPROVED',
        statusMessage: 'Pago simulado aprobado exitosamente',
        transactionId: `sim_txn_${Date.now()}`,
        finalizedAt: new Date().toISOString()
      };
    
    case 'declined':
      return {
        ...baseResponse,
        status: 'DECLINED',
        statusMessage: 'Pago simulado rechazado - fondos insuficientes',
        errorCode: 'INSUFFICIENT_FUNDS'
      };
    
    default:
      return {
        ...baseResponse,
        status: 'ERROR',
        statusMessage: 'Error simulado en el procesamiento',
        errorCode: 'PROCESSING_ERROR'
      };
  }
};

/**
 * Obtiene configuración pública para el frontend
 */
export const getPublicWompiConfig = () => {
  return {
    publicKey: isWompiConfigured() ? WOMPI_CONFIG.publicKey : null,
    currency: WOMPI_CONFIG.currency,
    country: WOMPI_CONFIG.country,
    environment: WOMPI_CONFIG.env,
    isConfigured: isWompiConfigured(),
    isFakeMode: !isWompiConfigured(),
    supportedCards: WOMPI_CONFIG.settings.supportedCards,
    locale: WOMPI_CONFIG.settings.locale
  };
};

/**
 * Genera firma de integridad para el checkout
 */
export const generateIntegritySignature = (data) => {
  if (!isWompiConfigured()) {
    // Devolver firma ficticia para modo desarrollo
    return `fake_signature_${Date.now()}`;
  }

  const { reference, amountInCents, currency, integritySecret } = data;
  
  const signatureString = `${reference}${amountInCents}${currency}${integritySecret || WOMPI_CONFIG.integritySecret}`;
  
  return crypto
    .createHash('sha256')
    .update(signatureString)
    .digest('hex');
};

/**
 * Formatea monto para mostrar
 */
export const formatAmount = (amount, currency = WOMPI_CONFIG.currency) => {
  return new Intl.NumberFormat('es-SV', {
    style: 'currency',
    currency: currency
  }).format(amount);
};

/**
 * Calcula comisión de Wompi (solo para referencia)
 */
export const calculateWompiFee = (amount, paymentMethod = 'card') => {
  const fees = {
    card: {
      percentage: 0.035, // 3.5% aproximado
      fixed: 0.30 // $0.30 USD
    },
    pse: {
      percentage: 0.02, // 2% aproximado
      fixed: 0
    }
  };

  const fee = fees[paymentMethod] || fees.card;
  const totalFee = (amount * fee.percentage) + fee.fixed;

  return {
    fee: Math.round(totalFee * 100) / 100,
    netAmount: Math.round((amount - totalFee) * 100) / 100,
    feePercentage: fee.percentage * 100
  };
};

// Log de configuración al inicializar
console.log('🔧 Wompi Service inicializado:', {
  isConfigured: isWompiConfigured(),
  environment: WOMPI_CONFIG.env,
  baseUrl: WOMPI_CONFIG.baseUrl,
  currency: WOMPI_CONFIG.currency,
  mode: isWompiConfigured() ? 'REAL' : 'FICTICIO'
});

export default {
  processWompiPayment,
  checkTransactionStatus,
  validateWompiWebhook,
  simulatePaymentConfirmation,
  getPublicWompiConfig,
  generateIntegritySignature,
  formatAmount,
  calculateWompiFee,
  isWompiConfigured,
  config: WOMPI_CONFIG
};