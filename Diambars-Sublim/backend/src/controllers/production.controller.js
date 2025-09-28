// controllers/production.controller.js - Controlador para fotos de producción
import Order from '../models/order.js';
import cloudinary from '../utils/cloudinary.js';
import { notificationService } from '../services/email/notification.service.js';
import { validators } from '../utils/validators.utils.js';

const productionController = {};

/**
 * Subir foto de producción
 * POST /api/production/orders/:orderId/photos
 */
productionController.uploadProductionPhoto = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { stage, notes, isQualityPhoto = false } = req.body;
    const adminId = req.user._id;

    console.log('📸 [ProductionController] Subiendo foto de producción:', {
      orderId,
      stage,
      isQualityPhoto,
      adminId
    });

    // Validar ID de orden
    const orderIdValidation = validators.mongoId(orderId, 'ID de orden');
    if (!orderIdValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: orderIdValidation.error
      });
    }

    // Validar etapa
    const validStages = ['cutting', 'printing', 'pressing', 'quality_check', 'packaging'];
    if (!validStages.includes(stage)) {
      return res.status(400).json({
        success: false,
        message: `Etapa inválida. Etapas válidas: ${validStages.join(', ')}`
      });
    }

    // Buscar orden
    const order = await Order.findById(orderIdValidation.cleaned)
      .populate('user', 'name email phoneNumber')
      .populate('items.design', 'name');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Orden no encontrada'
      });
    }

    // Verificar que la orden esté en producción
    if (!['in_production', 'ready_for_delivery'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: 'Solo se pueden subir fotos de órdenes en producción'
      });
    }

    // Subir foto a Cloudinary
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No se proporcionó archivo de imagen'
      });
    }

    const cloudinaryResult = await cloudinary.uploader.upload(req.file.path, {
      folder: `production/${orderId}`,
      public_id: `${stage}_${Date.now()}`,
      transformation: [
        { width: 800, height: 600, crop: 'fill', quality: 'auto' },
        { format: 'auto' }
      ]
    });

    console.log('☁️ [ProductionController] Foto subida a Cloudinary:', cloudinaryResult.public_id);

    // Agregar foto a la orden
    const productionPhoto = {
      stage,
      photoUrl: cloudinaryResult.secure_url,
      uploadedAt: new Date(),
      uploadedBy: adminId,
      notes: notes || '',
      isQualityPhoto
    };

    order.productionPhotos.push(productionPhoto);
    await order.save();

    // Enviar notificación por WhatsApp si es foto de calidad
    if (isQualityPhoto && order.user.phoneNumber) {
      try {
        await notificationService.sendQualityPhotoNotification(
          order, 
          stage, 
          cloudinaryResult.secure_url, 
          notes
        );
        console.log('✅ Notificación de foto de calidad enviada');
      } catch (notificationError) {
        console.error('⚠️ Error enviando notificación (no crítico):', notificationError.message);
      }
    }

    res.status(201).json({
      success: true,
      message: 'Foto de producción subida exitosamente',
      data: {
        photo: productionPhoto,
        orderNumber: order.orderNumber,
        stage,
        isQualityPhoto
      }
    });

  } catch (error) {
    console.error('❌ [ProductionController] Error subiendo foto:', error);
    
    res.status(500).json({
      success: false,
      message: 'Error subiendo foto de producción',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
    });
  }
};

/**
 * Obtener fotos de producción de una orden
 * GET /api/production/orders/:orderId/photos
 */
productionController.getProductionPhotos = async (req, res) => {
  try {
    const { orderId } = req.params;

    // Validar ID de orden
    const orderIdValidation = validators.mongoId(orderId, 'ID de orden');
    if (!orderIdValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: orderIdValidation.error
      });
    }

    const order = await Order.findById(orderIdValidation.cleaned)
      .select('productionPhotos orderNumber status')
      .populate('productionPhotos.uploadedBy', 'name email');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Orden no encontrada'
      });
    }

    // Agrupar fotos por etapa
    const photosByStage = order.productionPhotos.reduce((acc, photo) => {
      if (!acc[photo.stage]) {
        acc[photo.stage] = [];
      }
      acc[photo.stage].push(photo);
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      data: {
        orderNumber: order.orderNumber,
        status: order.status,
        totalPhotos: order.productionPhotos.length,
        photosByStage,
        allPhotos: order.productionPhotos
      }
    });

  } catch (error) {
    console.error('❌ [ProductionController] Error obteniendo fotos:', error);
    
    res.status(500).json({
      success: false,
      message: 'Error obteniendo fotos de producción',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
    });
  }
};

/**
 * Eliminar foto de producción
 * DELETE /api/production/orders/:orderId/photos/:photoId
 */
productionController.deleteProductionPhoto = async (req, res) => {
  try {
    const { orderId, photoId } = req.params;

    // Validar IDs
    const orderIdValidation = validators.mongoId(orderId, 'ID de orden');
    const photoIdValidation = validators.mongoId(photoId, 'ID de foto');
    
    if (!orderIdValidation.isValid || !photoIdValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'IDs inválidos'
      });
    }

    const order = await Order.findById(orderIdValidation.cleaned);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Orden no encontrada'
      });
    }

    // Buscar y eliminar foto
    const photoIndex = order.productionPhotos.findIndex(
      photo => photo._id.toString() === photoIdValidation.cleaned
    );

    if (photoIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Foto no encontrada'
      });
    }

    const photo = order.productionPhotos[photoIndex];
    
    // Eliminar de Cloudinary
    try {
      const publicId = photo.photoUrl.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(`production/${orderId}/${publicId}`);
      console.log('☁️ [ProductionController] Foto eliminada de Cloudinary');
    } catch (cloudinaryError) {
      console.error('⚠️ Error eliminando de Cloudinary (no crítico):', cloudinaryError.message);
    }

    // Eliminar de la base de datos
    order.productionPhotos.splice(photoIndex, 1);
    await order.save();

    res.status(200).json({
      success: true,
      message: 'Foto de producción eliminada exitosamente'
    });

  } catch (error) {
    console.error('❌ [ProductionController] Error eliminando foto:', error);
    
    res.status(500).json({
      success: false,
      message: 'Error eliminando foto de producción',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
    });
  }
};

export default productionController;
