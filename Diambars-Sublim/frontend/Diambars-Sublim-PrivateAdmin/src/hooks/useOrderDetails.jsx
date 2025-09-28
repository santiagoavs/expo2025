// hooks/useOrderDetails.jsx - Hook para manejar detalles avanzados de órdenes
import { useState, useCallback } from 'react';
import { orderDetailsService } from '../api/OrderDetailsService';
import { toast } from 'react-hot-toast';

export const useOrderDetails = () => {
  const [loading, setLoading] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [timeline, setTimeline] = useState(null);
  const [productionPhotos, setProductionPhotos] = useState(null);

  /**
   * Cargar detalles de pago
   */
  const loadPaymentDetails = useCallback(async (orderId) => {
    try {
      console.log('💳 [useOrderDetails] Iniciando carga de detalles de pago para:', orderId);
      setLoading(true);
      const details = await orderDetailsService.getPaymentDetails(orderId);
      console.log('💳 [useOrderDetails] Detalles de pago recibidos:', details);
      setPaymentDetails(details);
      return details;
    } catch (error) {
      console.error('❌ [useOrderDetails] Error cargando detalles de pago:', error);
      toast.error('Error cargando detalles de pago');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Cargar timeline
   */
  const loadTimeline = useCallback(async (orderId) => {
    try {
      setLoading(true);
      const timelineData = await orderDetailsService.getOrderTimeline(orderId);
      setTimeline(timelineData);
      return timelineData;
    } catch (error) {
      console.error('❌ [useOrderDetails] Error cargando timeline:', error);
      toast.error('Error cargando línea de tiempo');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Cargar fotos de producción
   */
  const loadProductionPhotos = useCallback(async (orderId) => {
    try {
      setLoading(true);
      const photos = await orderDetailsService.getProductionPhotos(orderId);
      setProductionPhotos(photos);
      return photos;
    } catch (error) {
      console.error('❌ [useOrderDetails] Error cargando fotos:', error);
      toast.error('Error cargando fotos de producción');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Subir foto de producción
   */
  const uploadProductionPhoto = useCallback(async (orderId, photoData) => {
    try {
      setLoading(true);
      const result = await orderDetailsService.uploadProductionPhoto(orderId, photoData);
      
      // Recargar fotos después de subir
      await loadProductionPhotos(orderId);
      
      toast.success(`Foto de ${photoData.stage} subida exitosamente`);
      return result;
    } catch (error) {
      console.error('❌ [useOrderDetails] Error subiendo foto:', error);
      toast.error('Error subiendo foto de producción');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [loadProductionPhotos]);

  /**
   * Actualizar estado de orden
   */
  const updateOrderStatus = useCallback(async (orderId, status, notes = '') => {
    try {
      setLoading(true);
      const result = await orderDetailsService.updateOrderStatus(orderId, status, notes);
      
      // Recargar timeline después de actualizar
      await loadTimeline(orderId);
      
      toast.success(`Estado actualizado a ${status}`);
      return result;
    } catch (error) {
      console.error('❌ [useOrderDetails] Error actualizando estado:', error);
      toast.error('Error actualizando estado');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [loadTimeline]);

  /**
   * Limpiar datos
   */
  const clearData = useCallback(() => {
    setPaymentDetails(null);
    setTimeline(null);
    setProductionPhotos(null);
  }, []);

  return {
    // Estados
    loading,
    paymentDetails,
    timeline,
    productionPhotos,
    
    // Acciones
    loadPaymentDetails,
    loadTimeline,
    loadProductionPhotos,
    uploadProductionPhoto,
    updateOrderStatus,
    clearData
  };
};

export default useOrderDetails;
