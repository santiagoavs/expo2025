// services/wompi.service.js
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
 * Genera un link de pago con Wompi
 */
export const processWompiPayment = async (paymentData) => {
  try {
    // Verificar configuración antes de procesar
    if (!isWompiConfigured()) {
      console.warn('⚠️ Wompi no está configurado correctamente. Simulando respuesta...');
      
      // Devolver respuesta simulada para desarrollo
      return {
        success: true,
        paymentLinkId: `simulated_${Date.now()}`,
        paymentUrl: `${WOMPI_CONFIG.urls.success}?simulated=true&order=${paymentData.orderId}`,
        reference: `SIM-${paymentData.orderId}-${Date.now()}`,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        amountInCents: Math.round(paymentData.amount * 100),
        currency: WOMPI_CONFIG.currency,
        environment: 'simulated'
      };
    }

    console.log('💳 Iniciando proceso de pago Wompi:', {
      orderId: paymentData.orderId,
      amount: paymentData.amount,
      env: WOMPI_CONFIG.env,
      isPartial: paymentData.isPartialPayment
    });

    const {
      orderId,
      amount,
      currency = WOMPI_CONFIG.currency,
      customerEmail,
      customerName,
      description,
      isPartialPayment = false
    } = paymentData;

    // Convertir monto a centavos (Wompi maneja centavos)
    const amountInCents = Math.round(amount * 100);

    // Crear referencia única con formato consistente
    const reference = `DS-${orderId}-${Date.now()}`;

    // Calcular tiempo de expiración (1 hora por defecto)
    const expiresAt = new Date(Date.now() + (WOMPI_CONFIG.settings.defaultTimeout * 60 * 1000));

    // Crear sesión de pago
    const paymentLinkData = {
      name: `Pedido ${description}`,
      description: `Pago ${isPartialPayment ? 'parcial' : 'total'} - ${description}`,
      single_use: true,
      collect_shipping: false,
      currency,
      amount_in_cents: amountInCents,
      // URLs de redirección dinámicas
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

    console.log('📝 Datos del payment link:', {
      amount_in_cents: amountInCents,
      reference,
      expires_at: expiresAt.toISOString()
    });

    // Llamar a API de Wompi para crear link de pago
    const response = await axios.post(
      `${WOMPI_CONFIG.baseUrl}/payment_links`,
      paymentLinkData,
      {
        headers: {
          'Authorization': `Bearer ${WOMPI_CONFIG.privateKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000 // 30 segundos timeout
      }
    );

    console.log('✅ Link de pago creado exitosamente:', {
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
      environment: WOMPI_CONFIG.env
    };

  } catch (error) {
    console.error('❌ Error creando link de pago Wompi:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    
    // Manejar errores específicos de Wompi
    if (error.response?.status === 401) {
      throw new Error('Credenciales de Wompi inválidas. Verifica WOMPI_PRIVATE_KEY.');
    }
    
    if (error.response?.status === 422) {
      const messages = error.response.data?.error?.messages || [];
      throw new Error(`Error de validación en Wompi: ${messages.join(', ')}`);
    }
    
    throw new Error(
      error.response?.data?.error?.messages?.[0] || 
      `Error al procesar el pago con Wompi: ${error.message}`
    );
  }
};

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
        statusMessage: 'Simulado - Pago aprobado',
        amount: 100,
        currency: 'USD',
        paymentMethod: 'CARD',
        reference: `SIM-${transactionId}`,
        createdAt: new Date().toISOString(),
        finalizedAt: new Date().toISOString(),
        paymentSourceId: 'simulated'
      };
    }

    console.log('🔍 Verificando estado de transacción:', transactionId);

    const response = await axios.get(
      `${WOMPI_CONFIG.baseUrl}/transactions/${transactionId}`,
      {
        headers: {
          'Authorization': `Bearer ${WOMPI_CONFIG.publicKey}` // Usar public key para consultas
        },
        timeout: 15000
      }
    );

    const transaction = response.data.data;

    console.log('📊 Estado de transacción obtenido:', {
      id: transaction.id,
      status: transaction.status,
      amount: transaction.amount_in_cents / 100
    });

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
      paymentSourceId: transaction.payment_source_id
    };

  } catch (error) {
    console.error('❌ Error verificando transacción:', {
      transactionId,
      error: error.response?.data || error.message
    });
    throw new Error(`Error al verificar el estado de la transacción: ${error.message}`);
  }
};

/**
 * Valida la firma del webhook de Wompi
 */
export const validateWompiWebhook = async (req) => {
  try {
    if (!isWompiConfigured()) {
      console.warn('⚠️ Wompi no configurado - webhook simulado como válido');
      return true;
    }

    console.log('🔐 Validando webhook de Wompi');

    const signature = req.headers['x-event-signature'];
    const timestamp = req.headers['x-timestamp'];
    const body = req.body;

    // Validar headers requeridos
    if (!signature || !timestamp) {
      console.error('❌ Faltan headers de seguridad:', { signature: !!signature, timestamp: !!timestamp });
      return false;
    }

    // Verificar timestamp (no más de 5 minutos de antigüedad)
    const currentTime = Math.floor(Date.now() / 1000);
    const webhookTime = parseInt(timestamp);
    const timeDiff = Math.abs(currentTime - webhookTime);
    
    if (timeDiff > 300) { // 5 minutos
      console.error('❌ Webhook muy antiguo:', { 
        timeDiff, 
        currentTime, 
        webhookTime,
        maxAge: 300 
      });
      return false;
    }

    // Construir string para firmar
    const bodyString = typeof body === 'string' ? body : JSON.stringify(body);
    const signatureString = `${bodyString}${timestamp}${WOMPI_CONFIG.webhookSecret}`;
    
    // Generar firma esperada
    const expectedSignature = crypto
      .createHash('sha256')
      .update(signatureString)
      .digest('hex');

    const isValid = signature === expectedSignature;

    console.log(isValid ? '✅ Webhook válido' : '❌ Webhook inválido', {
      providedSignature: signature.substring(0, 16) + '...',
      expectedSignature: expectedSignature.substring(0, 16) + '...',
      timeDiff
    });

    return isValid;

  } catch (error) {
    console.error('❌ Error validando webhook:', error);
    return false;
  }
};

/**
 * Obtiene configuración pública para el frontend
 */
export const getPublicWompiConfig = () => {
  return {
    publicKey: WOMPI_CONFIG.publicKey,
    currency: WOMPI_CONFIG.currency,
    country: WOMPI_CONFIG.country,
    environment: WOMPI_CONFIG.env,
    isConfigured: isWompiConfigured(),
    supportedCards: WOMPI_CONFIG.settings.supportedCards,
    locale: WOMPI_CONFIG.settings.locale
  };
};

/**
 * Genera firma de integridad para el checkout
 */
export const generateIntegritySignature = (data) => {
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
 * Calcula comisión de Wompi (aproximada)
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
if (isWompiConfigured()) {
  console.log('🔧 Wompi Service inicializado:', {
    environment: WOMPI_CONFIG.env,
    baseUrl: WOMPI_CONFIG.baseUrl,
    currency: WOMPI_CONFIG.currency,
    webhookUrl: WOMPI_CONFIG.urls.webhook
  });
} else {
  console.warn('⚠️ Wompi Service: Funcionando en modo simulado (configura credenciales reales)');
}

export default {
  processWompiPayment,
  checkTransactionStatus,
  validateWompiWebhook,
  getPublicWompiConfig,
  generateIntegritySignature,
  formatAmount,
  calculateWompiFee,
  isWompiConfigured,
  config: WOMPI_CONFIG
};