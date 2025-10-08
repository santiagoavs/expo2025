// services/payment/WompiProvider.js - Provider específico para Wompi
import axios from 'axios';
import crypto from 'crypto';
import { config } from '../../config.js';

export class WompiProvider {
  
  constructor() {
    this.config = {
      baseUrl: config.wompi?.baseUrl || 'https://sandbox.wompi.co/v1',
      publicKey: config.wompi?.publicKey,
      privateKey: config.wompi?.privateKey,
      webhookSecret: config.wompi?.webhookSecret,
      environment: config.wompi?.environment || 'sandbox'
    };
    
    this.isConfigured = !!(
      this.config.publicKey && 
      this.config.privateKey &&
      this.config.publicKey !== 'pub_sandbox_placeholder' &&
      this.config.privateKey !== 'prv_sandbox_placeholder'
    );
    
    console.log(`🏦 WompiProvider inicializado - Configurado: ${this.isConfigured}`);
  }
  
  // ==================== PROCESAMIENTO ====================
  
  /**
   * Procesar pago con Wompi
   */
  async process(payment, order, paymentData) {
    console.log(`🏦 [Wompi] Procesando pago para orden: ${order.orderNumber}`);
    
    try {
      if (!this.isConfigured) {
        console.warn('⚠️ [Wompi] No configurado - usando modo simulado');
        return this.generateSimulatedResponse(payment, order);
      }
      
      // Crear payment link en Wompi
      const wompiResponse = await this.createPaymentLink(payment, order, paymentData);
      
      return {
        status: 'processing',
        providerData: {
          paymentLinkId: wompiResponse.paymentLinkId,
          reference: wompiResponse.reference,
          expiresAt: wompiResponse.expiresAt
        },
        wompiData: {
          paymentLinkId: wompiResponse.paymentLinkId,
          paymentUrl: wompiResponse.paymentUrl,
          reference: wompiResponse.reference,
          expiresAt: wompiResponse.expiresAt
        },
        responseData: {
          paymentUrl: wompiResponse.paymentUrl,
          reference: wompiResponse.reference,
          expiresAt: wompiResponse.expiresAt,
          instructions: 'Complete el pago en Wompi para confirmar su orden'
        }
      };
      
    } catch (error) {
      console.error('❌ [Wompi] Error procesando pago:', error);
      
      // En caso de error, fallback a simulación
      if (error.response?.status >= 500) {
        console.warn('⚠️ [Wompi] Error del servidor - usando fallback simulado');
        return this.generateSimulatedResponse(payment, order);
      }
      
      throw new Error(`Error en Wompi: ${error.message}`);
    }
  }
  
  /**
   * Confirmar pago (generalmente via webhook)
   */
  async confirm(payment, confirmationData, adminContext) {
    console.log(`✅ [Wompi] Confirmando pago: ${payment._id}`);
    
    const { transactionData, isWebhook = false } = confirmationData;
    
    try {
      if (isWebhook) {
        // Validar webhook signature
        if (!this.validateWebhookSignature(confirmationData)) {
          throw new Error('Webhook signature inválida');
        }
      }
      
      // Actualizar detalles del pago
      payment.wompiDetails = {
        ...payment.wompiDetails,
        transactionId: transactionData.id,
        authorizationCode: transactionData.authorization_code,
        cardInfo: {
          lastFour: transactionData.payment_source?.card?.last_four,
          brand: transactionData.payment_source?.card?.brand,
          type: transactionData.payment_source?.card?.type,
          issuer: transactionData.payment_source?.card?.issuer
        },
        processingFee: transactionData.amount_in_cents ? 
          this.calculateProcessingFee(transactionData.amount_in_cents / 100) : 0,
        webhookReceived: isWebhook
      };
      
      // Determinar estado final
      const finalStatus = this.mapWompiStatus(transactionData.status);
      await payment.updateStatus(finalStatus, {
        source: isWebhook ? 'webhook' : 'manual',
        transactionId: transactionData.id,
        confirmedBy: adminContext?.adminId
      });
      
      console.log(`✅ [Wompi] Pago confirmado: ${payment._id} - Estado: ${finalStatus}`);
      
      return {
        transactionId: transactionData.id,
        authorizationCode: transactionData.authorization_code,
        cardLastFour: transactionData.payment_source?.card?.last_four,
        processingFee: payment.wompiDetails.processingFee
      };
      
    } catch (error) {
      console.error('❌ [Wompi] Error confirmando pago:', error);
      
      await payment.addError(`Error confirmando pago: ${error.message}`, {
        confirmationData,
        adminContext
      });
      
      throw error;
    }
  }
  
  /**
   * Cancelar pago
   */
  async cancel(payment, reason, context) {
    console.log(`❌ [Wompi] Cancelando pago: ${payment._id}`);
    
    // Para Wompi, generalmente no podemos cancelar un link una vez creado
    // Pero podemos marcarlo como cancelado en nuestro sistema
    
    payment.notes = `${payment.notes ? payment.notes + ' | ' : ''}Cancelado: ${reason}`;
    
    if (payment.wompiDetails?.paymentLinkId) {
      // Aquí podrías llamar a la API de Wompi si tienen endpoint de cancelación
      // Por ahora solo lo marcamos localmente
    }
    
    return {
      cancelled: true,
      reason
    };
  }
  
  // ==================== MÉTODOS INTERNOS ====================
  
  /**
   * Crear payment link en Wompi
   */
  async createPaymentLink(payment, order, paymentData) {
    const amountInCents = Math.round(payment.amount * 100);
    const reference = `DS-${order._id}-${Date.now()}`;
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hora
    
    const paymentLinkData = {
      name: `Pedido ${order.orderNumber}`,
      description: `Pago ${payment.paymentType === 'partial' ? 'parcial' : 'total'} del pedido ${order.orderNumber}`,
      single_use: true,
      collect_shipping: false,
      currency: 'USD',
      amount_in_cents: amountInCents,
      redirect_url: `${config.server.FRONTEND_URL}/orders/payment-success?order=${order._id}&payment=${payment._id}`,
      expired_redirect_url: `${config.server.FRONTEND_URL}/orders/payment-failed?order=${order._id}&reason=expired`,
      expires_at: expiresAt.toISOString(),
      customer_data: {
        email: paymentData.customerEmail || order.user?.email,
        full_name: paymentData.customerName || order.user?.name
      },
      metadata: {
        order_id: order._id.toString(),
        payment_id: payment._id.toString(),
        is_partial: payment.paymentType !== 'full',
        percentage: payment.percentage,
        created_at: new Date().toISOString(),
        reference,
        source: 'diambars_backend',
        environment: this.config.environment
      }
    };
    
    console.log('📝 [Wompi] Enviando datos a Wompi:', {
      amount_in_cents: amountInCents,
      reference,
      expires_at: expiresAt.toISOString()
    });
    
    const response = await axios.post(
      `${this.config.baseUrl}/payment_links`,
      paymentLinkData,
      {
        headers: {
          'Authorization': `Bearer ${this.config.privateKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );
    
    if (!response.data?.data?.id) {
      throw new Error('Respuesta inválida de Wompi');
    }
    
    console.log('✅ [Wompi] Link de pago creado:', {
      id: response.data.data.id,
      url: response.data.data.public_url
    });
    
    return {
      paymentLinkId: response.data.data.id,
      paymentUrl: response.data.data.public_url,
      reference,
      expiresAt: response.data.data.expires_at || expiresAt.toISOString(),
      amountInCents,
      currency: 'USD'
    };
  }
  
  /**
   * Generar respuesta simulada para desarrollo
   */
  generateSimulatedResponse(payment, order) {
    const reference = `SIM-${order._id}-${Date.now()}`;
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    
    return {
      status: 'processing',
      providerData: {
        paymentLinkId: `sim_${Date.now()}`,
        reference,
        expiresAt: expiresAt.toISOString(),
        isSimulated: true
      },
      wompiData: {
        paymentLinkId: `sim_${Date.now()}`,
        paymentUrl: `${config.server.FRONTEND_URL}/orders/payment-success?order=${order._id}&payment=${payment._id}&simulated=true`,
        reference,
        expiresAt: expiresAt.toISOString()
      },
      responseData: {
        paymentUrl: `${config.server.FRONTEND_URL}/orders/payment-success?order=${order._id}&payment=${payment._id}&simulated=true`,
        reference,
        expiresAt: expiresAt.toISOString(),
        instructions: 'MODO SIMULADO - Wompi no configurado',
        isSimulated: true
      }
    };
  }
  
  /**
   * Mapear estados de Wompi a nuestros estados
   */
  mapWompiStatus(wompiStatus) {
    const statusMap = {
      'APPROVED': 'completed',
      'DECLINED': 'failed',
      'VOIDED': 'cancelled',
      'ERROR': 'failed',
      'PENDING': 'processing'
    };
    
    return statusMap[wompiStatus] || 'failed';
  }
  
  /**
   * Validar signature del webhook
   */
  validateWebhookSignature(webhookData) {
    if (!this.isConfigured || !this.config.webhookSecret) {
      console.warn('⚠️ [Wompi] Webhook secret no configurado - omitiendo validación');
      return true; // En desarrollo, permitir sin validación
    }
    
    const { signature, timestamp, data } = webhookData;
    
    if (!signature || !timestamp || !data) {
      return false;
    }
    
    // Recrear signature
    const payload = `${timestamp}.${JSON.stringify(data)}`;
    const expectedSignature = crypto
      .createHmac('sha256', this.config.webhookSecret)
      .update(payload)
      .digest('hex');
    
    return `sha256=${expectedSignature}` === signature;
  }
  
  /**
   * Calcular comisión de procesamiento de Wompi
   */
  calculateProcessingFee(amount) {
    // Comisión aproximada de Wompi: 3.5% + $0.30
    const percentage = 0.035;
    const fixed = 0.30;
    
    return Math.round((amount * percentage + fixed) * 100) / 100;
  }
  
  /**
   * Verificar estado de transacción
   */
  async checkTransactionStatus(transactionId) {
    if (!this.isConfigured) {
      return {
        id: transactionId,
        status: 'APPROVED',
        status_message: 'Simulado - aprobado',
        amount_in_cents: 1000,
        currency: 'USD',
        payment_source: {
          type: 'CARD',
          card: {
            last_four: '1234',
            brand: 'VISA',
            type: 'CREDIT'
          }
        },
        reference: `SIM-${transactionId}`,
        created_at: new Date().toISOString(),
        finalized_at: new Date().toISOString(),
        isSimulated: true
      };
    }
    
    try {
      const response = await axios.get(
        `${this.config.baseUrl}/transactions/${transactionId}`,
        {
        headers: {
          'Authorization': `Bearer ${this.config.privateKey}`
        },
          timeout: 15000
        }
      );
      
      return response.data.data;
      
    } catch (error) {
      console.error('❌ [Wompi] Error consultando transacción:', error);
      throw error;
    }
  }
  
  // ==================== TOKENIZACIÓN DE TARJETAS ====================
  
  /**
   * Tokenizar tarjeta de crédito con Wompi
   */
  async tokenizeCard(cardData) {
    console.log('🔐 [Wompi] Tokenizando tarjeta');
    
    if (!this.isConfigured) {
      console.warn('⚠️ [Wompi] No configurado - generando token simulado');
      return this.generateSimulatedToken(cardData);
    }
    
    try {
      const tokenData = {
        number: cardData.number.replace(/\s/g, ''),
        cvc: cardData.cvc,
        exp_month: cardData.exp_month.padStart(2, '0'),
        exp_year: cardData.exp_year.length === 2 ? `20${cardData.exp_year}` : cardData.exp_year,
        card_holder: cardData.card_holder.trim()
      };
      
      console.log('📝 [Wompi] Enviando datos para tokenización:', {
        number: `****${tokenData.number.slice(-4)}`,
        exp_month: tokenData.exp_month,
        exp_year: tokenData.exp_year,
        card_holder: tokenData.card_holder
      });
      
      const response = await axios.post(
        `${this.config.baseUrl}/tokens/cards`,
        tokenData,
        {
          headers: {
            'Authorization': `Bearer ${this.config.publicKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );
      
      if (!response.data?.data?.id) {
        throw new Error('Respuesta inválida de Wompi al tokenizar');
      }
      
      const tokenInfo = response.data.data;
      
      console.log('✅ [Wompi] Tarjeta tokenizada exitosamente:', {
        id: tokenInfo.id,
        status: tokenInfo.status,
        card_type: tokenInfo.card?.type,
        brand: tokenInfo.card?.brand
      });
      
      return {
        id: tokenInfo.id,
        status: tokenInfo.status,
        card_type: tokenInfo.card?.type || 'UNKNOWN',
        brand: tokenInfo.card?.brand || 'unknown',
        last_four: tokenInfo.card?.last_four || cardData.number.slice(-4),
        exp_month: tokenInfo.card?.exp_month || cardData.exp_month,
        exp_year: tokenInfo.card?.exp_year || cardData.exp_year,
        issuer_country: tokenInfo.card?.issuer_country,
        issuer_bank: tokenInfo.card?.issuer_bank,
        created_at: tokenInfo.created_at || new Date().toISOString()
      };
      
    } catch (error) {
      console.error('❌ [Wompi] Error tokenizando tarjeta:', error);
      
      // Manejar errores específicos de Wompi
      if (error.response?.data?.error) {
        const wompiError = error.response.data.error;
        throw new Error(`Error de Wompi: ${wompiError.reason || wompiError.type || 'Error desconocido'}`);
      }
      
      throw new Error(`Error tokenizando tarjeta: ${error.message}`);
    }
  }
  
  /**
   * Crear pago usando token de tarjeta guardada
   */
  async createPaymentWithToken(tokenId, amount, orderId, customerData = {}) {
    console.log(`💳 [Wompi] Creando pago con token: ${tokenId}`);
    
    if (!this.isConfigured) {
      console.warn('⚠️ [Wompi] No configurado - simulando pago con token');
      return this.generateSimulatedTokenPayment(tokenId, amount, orderId);
    }
    
    try {
      const amountInCents = Math.round(amount * 100);
      const reference = `DS-TOKEN-${orderId}-${Date.now()}`;
      
      const paymentData = {
        amount_in_cents: amountInCents,
        currency: 'USD',
        customer_email: customerData.email || 'customer@example.com',
        payment_method: {
          type: 'CARD',
          token: tokenId,
          installments: 1
        },
        reference: reference,
        customer_data: {
          phone_number: customerData.phone || '',
          full_name: customerData.name || ''
        },
        metadata: {
          order_id: orderId.toString(),
          payment_type: 'saved_card',
          created_at: new Date().toISOString()
        }
      };
      
      console.log('📝 [Wompi] Enviando pago con token:', {
        amount_in_cents: amountInCents,
        reference,
        token: tokenId
      });
      
      const response = await axios.post(
        `${this.config.baseUrl}/transactions`,
        paymentData,
        {
          headers: {
            'Authorization': `Bearer ${this.config.privateKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );
      
      if (!response.data?.data?.id) {
        throw new Error('Respuesta inválida de Wompi al procesar pago');
      }
      
      const transactionInfo = response.data.data;
      
      console.log('✅ [Wompi] Pago con token creado:', {
        id: transactionInfo.id,
        status: transactionInfo.status,
        reference: transactionInfo.reference
      });
      
      return {
        transactionId: transactionInfo.id,
        status: transactionInfo.status,
        reference: transactionInfo.reference,
        amount: amount,
        currency: 'USD',
        paymentMethod: 'saved_card',
        cardInfo: {
          lastFour: transactionInfo.payment_source?.card?.last_four,
          brand: transactionInfo.payment_source?.card?.brand,
          type: transactionInfo.payment_source?.card?.type
        },
        createdAt: transactionInfo.created_at,
        authorizationCode: transactionInfo.authorization_code
      };
      
    } catch (error) {
      console.error('❌ [Wompi] Error creando pago con token:', error);
      
      if (error.response?.data?.error) {
        const wompiError = error.response.data.error;
        throw new Error(`Error de Wompi: ${wompiError.reason || wompiError.type || 'Error desconocido'}`);
      }
      
      throw new Error(`Error procesando pago: ${error.message}`);
    }
  }
  
  /**
   * Validar token de tarjeta
   */
  async validateToken(tokenId) {
    console.log(`🔍 [Wompi] Validando token: ${tokenId}`);
    
    if (!this.isConfigured) {
      console.warn('⚠️ [Wompi] No configurado - asumiendo token válido');
      return { valid: true, status: 'active' };
    }
    
    try {
      const response = await axios.get(
        `${this.config.baseUrl}/tokens/${tokenId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.config.privateKey}`
          },
          timeout: 15000
        }
      );
      
      const tokenInfo = response.data.data;
      const isValid = tokenInfo.status === 'AVAILABLE';
      
      console.log(`✅ [Wompi] Token validado: ${tokenId} - Válido: ${isValid}`);
      
      return {
        valid: isValid,
        status: tokenInfo.status,
        card: tokenInfo.card
      };
      
    } catch (error) {
      console.error('❌ [Wompi] Error validando token:', error);
      return { valid: false, status: 'invalid', error: error.message };
    }
  }
  
  /**
   * Generar token simulado para desarrollo
   */
  generateSimulatedToken(cardData) {
    const tokenId = `tok_sim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Detectar marca de tarjeta
    const number = cardData.number.replace(/\s/g, '');
    let brand = 'unknown';
    if (/^4/.test(number)) brand = 'visa';
    else if (/^5[1-5]/.test(number)) brand = 'mastercard';
    else if (/^3[47]/.test(number)) brand = 'amex';
    
    return {
      id: tokenId,
      status: 'AVAILABLE',
      card_type: 'CREDIT',
      brand: brand,
      last_four: number.slice(-4),
      exp_month: cardData.exp_month,
      exp_year: cardData.exp_year,
      issuer_country: 'SV',
      issuer_bank: 'Banco Simulado',
      created_at: new Date().toISOString(),
      isSimulated: true
    };
  }
  
  /**
   * Generar pago simulado con token
   */
  generateSimulatedTokenPayment(tokenId, amount, orderId) {
    const transactionId = `txn_sim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      transactionId: transactionId,
      status: 'APPROVED',
      reference: `SIM-TOKEN-${orderId}-${Date.now()}`,
      amount: amount,
      currency: 'USD',
      paymentMethod: 'saved_card',
      cardInfo: {
        lastFour: '1234',
        brand: 'visa',
        type: 'CREDIT'
      },
      createdAt: new Date().toISOString(),
      authorizationCode: `AUTH_${Date.now()}`,
      isSimulated: true
    };
  }
  
  // ==================== MÉTODOS PÚBLICOS ====================
  
  /**
   * Obtener configuración pública para el frontend
   */
  getPublicConfig() {
    return {
      publicKey: this.isConfigured ? this.config.publicKey : null,
      environment: this.config.environment,
      currency: 'USD',
      isConfigured: this.isConfigured,
      isFakeMode: !this.isConfigured,
      supportedCards: ['VISA', 'MASTERCARD', 'AMERICAN_EXPRESS'],
      locale: 'es',
      tokenizationEnabled: true
    };
  }
  
  /**
   * Generar signature de integridad para el checkout
   */
  generateIntegritySignature(reference, amountInCents, currency = 'USD') {
    if (!this.isConfigured || !this.config.webhookSecret) {
      return `fake_signature_${Date.now()}`;
    }
    
    const signatureString = `${reference}${amountInCents}${currency}${this.config.webhookSecret}`;
    
    return crypto
      .createHash('sha256')
      .update(signatureString)
      .digest('hex');
  }
  
  /**
   * Formatear monto para mostrar
   */
  formatAmount(amount, currency = 'USD') {
    return new Intl.NumberFormat('es-SV', {
      style: 'currency',
      currency: currency
    }).format(amount);
  }
}