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
      locale: 'es'
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