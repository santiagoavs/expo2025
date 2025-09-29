// routes/quality-approval.routes.js - Rutas para aprobación de calidad
import express from 'express';
import qualityApprovalController from '../controllers/quality-approval.controller.js';

const router = express.Router();

// ==================== RUTAS DE APROBACIÓN DE CALIDAD ====================

// Obtener información de la orden para aprobación (público)
router.get('/:orderId/info', qualityApprovalController.getOrderForApproval);

// Enviar respuesta del cliente (público)
router.post('/:orderId/respond', qualityApprovalController.submitClientResponse);

// Obtener respuestas del cliente (público)
router.get('/:orderId/responses', qualityApprovalController.getClientResponses);

// Obtener estado de aprobación de calidad (público)
router.get('/:orderId/status', qualityApprovalController.getQualityStatus);

// Aprobar calidad del producto (legacy - desde correo)
router.post('/:orderId/approve', qualityApprovalController.approveQuality);

// Rechazar calidad del producto (legacy - desde correo)
router.post('/:orderId/reject', qualityApprovalController.rejectQuality);

export default router;
