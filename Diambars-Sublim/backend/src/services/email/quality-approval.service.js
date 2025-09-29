// services/email/quality-approval.service.js - Servicio para envío de correos de aprobación de calidad
import nodemailer from 'nodemailer';
import { config } from '../../config.js';

const transporter = nodemailer.createTransport({
  host: config.email.host,
  port: config.email.port,
  secure: config.email.secure,
  auth: {
    user: config.email.user,
    pass: config.email.pass
  }
});

export const qualityApprovalService = {

  // Verificar si el servicio de correo está disponible
  async isEmailAvailable() {
    try {
      console.log('📧 [QualityApprovalService] Verificando configuración SMTP:', {
        host: process.env.SMTP_HOST || config.email.host,
        port: process.env.SMTP_PORT || config.email.port,
        secure: process.env.SMTP_SECURE || config.email.secure,
        user: process.env.SMTP_USER || config.email.user,
        hasPass: !!(process.env.SMTP_PASS || config.email.pass)
      });
      
      await transporter.verify();
      console.log('✅ [QualityApprovalService] Conexión SMTP verificada exitosamente');
      return true;
    } catch (error) {
      console.error('❌ [QualityApprovalService] Error verificando conexión SMTP:', error);
      return false;
    }
  },

  // Generar HTML para el correo de aprobación de calidad
  generateQualityApprovalHTML(order, photoUrl, adminNotes, approvalUrl, rejectionUrl) {
    return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Control de Calidad - Orden #${order.orderNumber}</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f8fafc;
            }
            .container {
                background: white;
                border-radius: 12px;
                padding: 30px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header {
                text-align: center;
                border-bottom: 2px solid #e5e7eb;
                padding-bottom: 20px;
                margin-bottom: 30px;
            }
            .logo {
                font-size: 24px;
                font-weight: bold;
                color: #2563eb;
                margin-bottom: 10px;
            }
            .order-info {
                background: #f3f4f6;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
            }
            .photo-container {
                text-align: center;
                margin: 20px 0;
            }
            .photo-container img {
                max-width: 100%;
                height: auto;
                border-radius: 8px;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            }
            .admin-notes {
                background: #fef3c7;
                border-left: 4px solid #f59e0b;
                padding: 15px;
                margin: 20px 0;
                border-radius: 4px;
            }
            .approval-buttons {
                text-align: center;
                margin: 30px 0;
            }
            .btn {
                display: inline-block;
                padding: 12px 30px;
                margin: 0 10px;
                text-decoration: none;
                border-radius: 8px;
                font-weight: 600;
                font-size: 16px;
                transition: all 0.3s ease;
            }
            .btn-approve {
                background: #10b981;
                color: white;
            }
            .btn-approve:hover {
                background: #059669;
                transform: translateY(-2px);
            }
            .btn-reject {
                background: #ef4444;
                color: white;
            }
            .btn-reject:hover {
                background: #dc2626;
                transform: translateY(-2px);
            }
            .footer {
                text-align: center;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #e5e7eb;
                color: #6b7280;
                font-size: 14px;
            }
            .warning {
                background: #fef2f2;
                border: 1px solid #fecaca;
                color: #dc2626;
                padding: 15px;
                border-radius: 8px;
                margin: 20px 0;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">🏭 Diambars Sublim</div>
                <h1>Control de Calidad</h1>
                <p>Tu producto está listo para revisión</p>
            </div>

            <div class="order-info">
                <h3>📋 Información de la Orden</h3>
                <p><strong>Número de Orden:</strong> #${order.orderNumber}</p>
                <p><strong>Cliente:</strong> ${order.user.name}</p>
                <p><strong>Fecha:</strong> ${new Date().toLocaleDateString('es-ES')}</p>
            </div>

            <div class="photo-container">
                <h3>📸 Foto del Producto</h3>
                <img src="${photoUrl}" alt="Producto terminado" />
            </div>

            <div class="admin-notes">
                <h4>📝 Nota del Control de Calidad:</h4>
                <p>${adminNotes}</p>
            </div>

            <div class="approval-buttons">
                <h3>¿Apruebas la calidad del producto?</h3>
                <p>Por favor revisa la foto y decide si el producto cumple con tus expectativas.</p>
                
                <a href="${approvalUrl}" class="btn btn-approve">
                    ✅ Aprobar Calidad
                </a>
                <a href="${rejectionUrl}" class="btn btn-reject">
                    ❌ Rechazar
                </a>
            </div>

            <div class="warning">
                <strong>⚠️ Importante:</strong> 
                <ul>
                    <li>Si apruebas, el producto pasará a empacado y envío</li>
                    <li>Si rechazas, podrás agregar una nota explicando qué necesita corregirse</li>
                    <li>Esta decisión afectará el tiempo de entrega de tu pedido</li>
                </ul>
            </div>

            <div class="footer">
                <p>Este correo fue enviado automáticamente por el sistema de control de calidad.</p>
                <p>Si tienes dudas, contacta a nuestro equipo de soporte.</p>
            </div>
        </div>
    </body>
    </html>
    `;
  },

  // Enviar correo de aprobación de calidad
  async sendQualityApprovalEmail(order, photoUrl, adminNotes) {
    try {
      // Verificar si el correo está disponible
      const emailAvailable = await this.isEmailAvailable();
      console.log('📧 [QualityApprovalService] Servicio de correo disponible:', emailAvailable);
      
      if (!emailAvailable) {
        console.log('📧 [QualityApprovalService] Servicio de correo no disponible, saltando envío');
        return { success: false, error: 'Email service not available' };
      }

      // URLs para aprobación y rechazo
      const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      const approvalUrl = `${baseUrl}/quality-approval/${order._id}`;
      const rejectionUrl = `${baseUrl}/quality-approval/${order._id}`;

      const mailOptions = {
        from: `"Diambars Sublim" <${process.env.SMTP_USER}>`,
        to: order.user.email,
        subject: `🏭 Control de Calidad - Orden #${order.orderNumber}`,
        html: this.generateQualityApprovalHTML(order, photoUrl, adminNotes, approvalUrl, rejectionUrl),
        // No usar attachments por ahora, solo URL en HTML
        // attachments: [
        //   {
        //     filename: `producto-${order.orderNumber}.jpg`,
        //     path: photoUrl,
        //     cid: 'product-photo'
        //   }
        // ]
      };

      console.log('📧 [QualityApprovalService] Configuración de correo:', {
        from: mailOptions.from,
        to: mailOptions.to,
        subject: mailOptions.subject,
        hasHtml: !!mailOptions.html,
        approvalUrl,
        rejectionUrl
      });

      const result = await transporter.sendMail(mailOptions);
      console.log('✅ [QualityApprovalService] Correo de aprobación enviado:', result.messageId);
      
      return { 
        success: true, 
        messageId: result.messageId,
        approvalUrl,
        rejectionUrl
      };

    } catch (error) {
      console.error('❌ [QualityApprovalService] Error enviando correo de aprobación:', error);
      return { success: false, error: error.message };
    }
  },

  // Generar token simple para las URLs
  generateToken(orderId, action) {
    const timestamp = Date.now();
    const secret = process.env.APP_SECRET || 'default-secret';
    return Buffer.from(`${orderId}-${action}-${timestamp}-${secret}`).toString('base64');
  },

  // Verificar token
  verifyToken(token, orderId, action) {
    try {
      const decoded = Buffer.from(token, 'base64').toString('utf-8');
      const parts = decoded.split('-');
      
      if (parts.length !== 4) return false;
      if (parts[0] !== orderId) return false;
      if (parts[1] !== action) return false;
      
      // Verificar que el token no sea muy viejo (24 horas)
      const timestamp = parseInt(parts[2]);
      const now = Date.now();
      const maxAge = 24 * 60 * 60 * 1000; // 24 horas
      
      return (now - timestamp) < maxAge;
    } catch (error) {
      return false;
    }
  }
};
