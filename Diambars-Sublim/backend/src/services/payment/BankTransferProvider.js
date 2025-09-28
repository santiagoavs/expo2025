// services/payment/BankTransferProvider.js - Provider específico para transferencias bancarias
import { notificationService } from '../email/notification.service.js';
import cloudinary from '../../utils/cloudinary.js';
import PaymentConfig from '../../models/paymentConfig.js';

export class BankTransferProvider {
  
  constructor() {
    console.log('🏦 BankTransferProvider inicializado');
  }
  
  // ==================== PROCESAMIENTO ====================
  
  /**
   * Procesar transferencia bancaria
   * Prepara el pago y envía instrucciones al cliente
   */
  async process(payment, order, paymentData) {
    console.log(`🏦 [Transfer] Preparando transferencia bancaria para orden: ${order.orderNumber}`);
    
    const { customerEmail, customerName, notes } = paymentData;
    
    try {
      // Obtener configuración de cuentas bancarias
      const bankConfig = await this.getBankAccountsConfig();
      
      // Generar número de referencia único
      const referenceNumber = `TRF-${order.orderNumber}-${Date.now()}`;
      
      // Preparar instrucciones de transferencia
      const transferInstructions = await this.generateTransferInstructions(
        payment, 
        order, 
        referenceNumber, 
        bankConfig
      );
      
      // Enviar instrucciones por email
      await this.sendTransferInstructionsEmail(
        payment, 
        order, 
        transferInstructions, 
        customerEmail || order.user?.email
      );
      
      return {
        status: 'pending',
        providerData: {
          paymentMethod: 'bank_transfer',
          referenceNumber,
          bankAccounts: bankConfig.accounts,
          instructions: transferInstructions.text,
          emailSent: true
        },
        transferData: {
          referenceNumber,
          bankName: bankConfig.accounts[0]?.bankName,
          accountNumber: bankConfig.accounts[0]?.accountNumber,
          accountHolder: bankConfig.accounts[0]?.accountHolder,
          customerEmail: customerEmail || order.user?.email,
          emailSentAt: new Date(),
          notes: notes || ''
        },
        responseData: {
          referenceNumber,
          instructions: transferInstructions.text,
          bankAccounts: bankConfig.accounts,
          uploadInstructions: this.getUploadInstructions(referenceNumber),
          estimatedProcessingTime: '24-48 horas',
          supportContact: {
            email: 'pagos@diambars.com',
            whatsapp: '+503 1234-5678'
          }
        }
      };
      
    } catch (error) {
      console.error('❌ [Transfer] Error preparando transferencia:', error);
      throw error;
    }
  }
  
  /**
   * Confirmar transferencia (cuando el cliente sube comprobante y admin verifica)
   */
  async confirm(payment, confirmationData, adminContext) {
    console.log(`🏦 [Transfer] Confirmando transferencia: ${payment._id}`);
    
    const { 
      proofFile, 
      proofUrl, 
      transferDate, 
      bankReference,
      verificationNotes,
      isApproved = true
    } = confirmationData;
    
    try {
      let finalProofUrl = proofUrl;
      let proofPublicId = null;
      
      // Subir comprobante si se proporcionó archivo
      if (proofFile) {
        const uploadResult = await cloudinary.uploadImage(proofFile.path, 'payment-proofs', {
          public_id: `payment-${payment._id}-${Date.now()}`,
          tags: [`payment-${payment._id}`, `order-${payment.orderId}`, 'bank-transfer']
        });
        finalProofUrl = uploadResult.secure_url;
        proofPublicId = uploadResult.public_id;
      }
      
      // Actualizar detalles de transferencia
      payment.transferDetails = {
        ...payment.transferDetails,
        proofUrl: finalProofUrl,
        proofPublicId,
        transferDate: transferDate || new Date(),
        referenceNumber: bankReference || payment.transferDetails?.referenceNumber,
        verifiedBy: adminContext.adminId,
        verifiedAt: new Date(),
        rejectionReason: isApproved ? null : verificationNotes
      };
      
      // Actualizar estado basado en aprobación
      const newStatus = isApproved ? 'completed' : 'failed';
      await payment.updateStatus(newStatus, {
        verifiedBy: adminContext.adminId,
        verificationResult: isApproved ? 'approved' : 'rejected',
        verificationNotes,
        transferDate
      });
      
      // Enviar notificaciones
      await this.sendTransferConfirmationNotifications(payment, isApproved, adminContext);
      
      console.log(`✅ [Transfer] Transferencia ${isApproved ? 'aprobada' : 'rechazada'}: ${payment._id}`);
      
      return {
        approved: isApproved,
        referenceNumber: payment.transferDetails.referenceNumber,
        transferDate: payment.transferDetails.transferDate,
        proofUrl: finalProofUrl,
        verifiedBy: adminContext.adminId,
        verifiedAt: payment.transferDetails.verifiedAt,
        rejectionReason: payment.transferDetails.rejectionReason
      };
      
    } catch (error) {
      console.error('❌ [Transfer] Error confirmando transferencia:', error);
      
      await payment.addError(`Error confirmando transferencia: ${error.message}`, {
        confirmationData,
        adminContext
      });
      
      throw error;
    }
  }
  
  /**
   * Procesar subida de comprobante por parte del cliente
   */
  async submitProof(payment, proofData, userContext) {
    console.log(`📄 [Transfer] Cliente subiendo comprobante: ${payment._id}`);
    
    const { proofFile, transferDate, bankReference, notes } = proofData;
    
    try {
      // Validar que el pago permite subir comprobante
      if (payment.status !== 'pending') {
        throw new Error(`No se puede subir comprobante en estado: ${payment.status}`);
      }
      
      // Subir archivo
      const uploadResult = await cloudinary.uploadImage(proofFile.path, 'payment-proofs', {
        public_id: `payment-${payment._id}-${Date.now()}`,
        tags: [`payment-${payment._id}`, `order-${payment.orderId}`, 'bank-transfer', `user-${userContext.userId}`]
      });
      
      // Actualizar detalles
      payment.transferDetails = {
        ...payment.transferDetails,
        proofUrl: uploadResult.secure_url,
        proofPublicId: uploadResult.public_id,
        transferDate: transferDate || new Date(),
        referenceNumber: bankReference || payment.transferDetails?.referenceNumber,
        customerNotes: notes
      };
      
      // Cambiar a estado "processing" (esperando verificación)
      await payment.updateStatus('processing', {
        proofSubmitted: true,
        submittedBy: userContext.userId,
        submittedAt: new Date()
      });
      
      // Notificar al equipo interno
      await this.sendProofSubmittedNotification(payment, userContext);
      
      console.log(`📄 [Transfer] Comprobante subido exitosamente: ${payment._id}`);
      
      return {
        uploaded: true,
        proofUrl: uploadResult.secure_url,
        referenceNumber: payment.transferDetails.referenceNumber,
        status: payment.status,
        message: 'Comprobante subido exitosamente. Será verificado en 24-48 horas.'
      };
      
    } catch (error) {
      console.error('❌ [Transfer] Error subiendo comprobante:', error);
      throw error;
    }
  }
  
  /**
   * Cancelar transferencia
   */
  async cancel(payment, reason, context) {
    console.log(`❌ [Transfer] Cancelando transferencia: ${payment._id}`);
    
    // Actualizar notas con motivo de cancelación
    payment.notes = `${payment.notes ? payment.notes + ' | ' : ''}Cancelado: ${reason}`;
    
    // Si había comprobante subido, marcarlo como cancelado
    if (payment.transferDetails?.proofUrl) {
      payment.transferDetails.rejectionReason = `Cancelado: ${reason}`;
    }
    
    return {
      cancelled: true,
      reason,
      cancelledAt: new Date()
    };
  }
  
  // ==================== MÉTODOS INTERNOS ====================
  
  /**
   * Obtener configuración de cuentas bancarias
   */
  async getBankAccountsConfig() {
    try {
      const config = await PaymentConfig.findOne({ 
        type: 'bank_transfer', 
        enabled: true 
      });
      
      if (!config || !config.config?.accounts) {
        // Configuración por defecto si no existe
        return {
          accounts: [
            {
              bankName: 'Banco Agrícola',
              accountType: 'Cuenta Corriente',
              accountNumber: '1234567890',
              accountHolder: 'Diambars Sublim S.A. de C.V.',
              swift: 'BACRSVSV',
              instructions: 'Transferencia en USD'
            },
            {
              bankName: 'Banco de América Central',
              accountType: 'Cuenta de Ahorros',
              accountNumber: '0987654321',
              accountHolder: 'Diambars Sublim S.A. de C.V.',
              swift: 'BACLSVSV',
              instructions: 'Transferencia en USD'
            }
          ]
        };
      }
      
      return config.config;
      
    } catch (error) {
      console.error('❌ [Transfer] Error obteniendo configuración bancaria:', error);
      throw new Error('No se pudo obtener la configuración de cuentas bancarias');
    }
  }
  
  /**
   * Generar instrucciones detalladas de transferencia
   */
  async generateTransferInstructions(payment, order, referenceNumber, bankConfig) {
    const instructions = [
      `🏦 **INSTRUCCIONES DE TRANSFERENCIA BANCARIA**`,
      ``,
      `📋 **Detalles del pago:**`,
      `• Orden: ${order.orderNumber}`,
      `• Monto a transferir: ${payment.formattedAmount}`,
      `• Referencia: ${referenceNumber}`,
      `• Tipo de pago: ${payment.timing === 'advance' ? 'Adelanto' : 'Pago completo'}`,
      ``,
      `💳 **Cuentas disponibles:**`
    ];
    
    // Agregar información de cada cuenta
    bankConfig.accounts.forEach((account, index) => {
      instructions.push(
        ``,
        `**Opción ${index + 1} - ${account.bankName}**`,
        `• Tipo: ${account.accountType}`,
        `• Número: ${account.accountNumber}`,
        `• Titular: ${account.accountHolder}`,
        `• SWIFT: ${account.swift || 'N/A'}`,
        `• Notas: ${account.instructions || 'Transferencia en USD'}`
      );
    });
    
    instructions.push(
      ``,
      `📝 **PASOS A SEGUIR:**`,
      ``,
      `1. **Realizar la transferencia** a cualquiera de las cuentas arriba`,
      `2. **Usar como referencia:** ${referenceNumber}`,
      `3. **Conservar el comprobante** de la transferencia`,
      `4. **Subir el comprobante** en nuestro sistema o enviarlo por email`,
      `5. **Esperar verificación** (24-48 horas hábiles)`,
      ``,
      `📎 **Para subir comprobante:**`,
      `• Portal web: Ir a "Mi Pedido" → "Subir Comprobante"`,
      `• Email: Enviar a pagos@diambars.com con la referencia`,
      `• WhatsApp: +503 1234-5678`,
      ``,
      `⚠️ **IMPORTANTE:**`,
      `• El monto debe ser EXACTO: ${payment.formattedAmount}`,
      `• Incluya la referencia: ${referenceNumber}`,
      `• El comprobante debe ser legible y completo`,
      `• La verificación puede tomar 24-48 horas`,
      ``,
      `📞 **¿Necesita ayuda?**`,
      `• Email: pagos@diambars.com`,
      `• WhatsApp: +503 1234-5678`,
      `• Horario: Lunes a Viernes, 8:00 AM - 6:00 PM`
    );
    
    return {
      text: instructions.join('\n'),
      html: this.convertToHTML(instructions),
      referenceNumber,
      accounts: bankConfig.accounts
    };
  }
  
  /**
   * Convertir instrucciones a HTML para email
   */
  convertToHTML(instructions) {
    return instructions
      .join('\n')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/• /g, '&bull; ')
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>')
      .replace(/^/, '<p>')
      .replace(/$/, '</p>');
  }
  
  /**
   * Obtener instrucciones para subir comprobante
   */
  getUploadInstructions(referenceNumber) {
    return {
      title: 'Cómo subir tu comprobante',
      steps: [
        'Realiza la transferencia a cualquiera de nuestras cuentas',
        'Toma una foto clara del comprobante o guarda el PDF',
        'Sube el archivo usando el botón "Subir Comprobante"',
        'Incluye la referencia en los comentarios si es necesario',
        'Espera la verificación (24-48 horas)'
      ],
      acceptedFormats: ['JPG', 'PNG', 'PDF'],
      maxFileSize: '5MB',
      referenceNumber
    };
  }
  
  /**
   * Enviar instrucciones por email
   */
  async sendTransferInstructionsEmail(payment, order, instructions, customerEmail) {
    try {
      if (!customerEmail) {
        console.warn('⚠️ [Transfer] No se pudo enviar email - dirección no disponible');
        return;
      }
      
      await notificationService.sendTransferInstructionsEmail({
        orderNumber: order.orderNumber,
        amount: payment.amount,
        formattedAmount: payment.formattedAmount,
        referenceNumber: instructions.referenceNumber,
        instructions: instructions.html,
        bankAccounts: instructions.accounts,
        customerEmail: customerEmail,
        customerName: order.user?.name || 'Cliente'
      });
      
      console.log(`📧 [Transfer] Instrucciones enviadas a: ${customerEmail}`);
      
    } catch (error) {
      console.error('❌ [Transfer] Error enviando instrucciones por email:', error);
      // No interrumpir el flujo por error de email
    }
  }
  
  /**
   * Enviar notificación cuando se confirma la transferencia
   */
  async sendTransferConfirmationNotifications(payment, isApproved, adminContext) {
    try {
      await payment.populate([
        { path: 'orderId', populate: { path: 'user', select: 'name email' } }
      ]);
      
      const order = payment.orderId;
      const user = order.user;
      
      if (user?.email) {
        if (isApproved) {
          await notificationService.sendTransferApprovedNotification({
            orderNumber: order.orderNumber,
            amount: payment.amount,
            referenceNumber: payment.transferDetails.referenceNumber,
            transferDate: payment.transferDetails.transferDate,
            verifiedAt: payment.transferDetails.verifiedAt,
            userEmail: user.email,
            userName: user.name
          });
        } else {
          await notificationService.sendTransferRejectedNotification({
            orderNumber: order.orderNumber,
            amount: payment.amount,
            referenceNumber: payment.transferDetails.referenceNumber,
            rejectionReason: payment.transferDetails.rejectionReason,
            userEmail: user.email,
            userName: user.name
          });
        }
      }
      
      // Notificar internamente
      await notificationService.sendInternalTransferProcessedNotification({
        orderNumber: order.orderNumber,
        amount: payment.amount,
        referenceNumber: payment.transferDetails.referenceNumber,
        approved: isApproved,
        verifiedBy: adminContext.adminId,
        customerName: user?.name,
        customerEmail: user?.email
      });
      
    } catch (error) {
      console.error('❌ [Transfer] Error enviando notificaciones:', error);
    }
  }
  
  /**
   * Notificar cuando el cliente sube comprobante
   */
  async sendProofSubmittedNotification(payment, userContext) {
    try {
      await payment.populate([
        { path: 'orderId', select: 'orderNumber' },
        { path: 'createdBy', select: 'name email' }
      ]);
      
      await notificationService.sendInternalTransferProofSubmittedNotification({
        orderNumber: payment.orderId.orderNumber,
        amount: payment.amount,
        referenceNumber: payment.transferDetails.referenceNumber,
        proofUrl: payment.transferDetails.proofUrl,
        submittedBy: userContext.userId,
        customerName: payment.createdBy?.name,
        customerEmail: payment.createdBy?.email
      });
      
    } catch (error) {
      console.error('❌ [Transfer] Error enviando notificación de comprobante:', error);
    }
  }
  
  // ==================== MÉTODOS PARA ADMIN ====================
  
  /**
   * Obtener transferencias pendientes de verificación
   */
  async getPendingTransfers() {
    const Payment = (await import('../../models/payment.js')).default;
    
    return await Payment.find({
      method: 'bank_transfer',
      status: 'processing',
      'transferDetails.proofUrl': { $exists: true }
    })
    .populate('orderId', 'orderNumber user')
    .populate('createdBy', 'name email')
    .sort({ 'transferDetails.emailSentAt': 1 });
  }
  
  /**
   * Generar reporte de transferencias
   */
  async generateTransferReport(startDate, endDate, status = null) {
    const Payment = (await import('../../models/payment.js')).default;
    
    const matchStage = {
      method: 'bank_transfer',
      createdAt: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    };
    
    if (status) {
      matchStage.status = status;
    }
    
    const transfers = await Payment.find(matchStage)
      .populate('orderId', 'orderNumber user')
      .populate('transferDetails.verifiedBy', 'name')
      .sort({ createdAt: -1 });
    
    const summary = {
      period: { startDate, endDate },
      totalTransfers: transfers.length,
      statusBreakdown: {
        pending: transfers.filter(t => t.status === 'pending').length,
        processing: transfers.filter(t => t.status === 'processing').length,
        completed: transfers.filter(t => t.status === 'completed').length,
        failed: transfers.filter(t => t.status === 'failed').length
      },
      totalAmount: transfers.reduce((sum, t) => sum + t.amount, 0),
      avgProcessingTime: this.calculateAvgProcessingTime(transfers.filter(t => t.status === 'completed')),
      transfers: transfers.map(t => ({
        paymentId: t._id,
        orderNumber: t.orderId.orderNumber,
        amount: t.amount,
        status: t.status,
        referenceNumber: t.transferDetails?.referenceNumber,
        createdAt: t.createdAt,
        verifiedAt: t.transferDetails?.verifiedAt,
        verifiedBy: t.transferDetails?.verifiedBy?.name,
        hasProof: !!t.transferDetails?.proofUrl
      }))
    };
    
    return summary;
  }
  
  /**
   * Calcular tiempo promedio de procesamiento
   */
  calculateAvgProcessingTime(completedTransfers) {
    if (completedTransfers.length === 0) return null;
    
    const totalHours = completedTransfers.reduce((sum, transfer) => {
      if (transfer.transferDetails?.verifiedAt && transfer.createdAt) {
        const hours = (new Date(transfer.transferDetails.verifiedAt) - new Date(transfer.createdAt)) / (1000 * 60 * 60);
        return sum + hours;
      }
      return sum;
    }, 0);
    
    return Math.round(totalHours / completedTransfers.length * 100) / 100; // Horas con 2 decimales
  }
}