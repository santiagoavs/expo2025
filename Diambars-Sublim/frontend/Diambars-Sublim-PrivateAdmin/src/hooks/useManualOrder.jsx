// src/hooks/useManualOrder.jsx - Hook especializado para pedidos manuales
import { useState, useEffect, useCallback, useRef } from 'react';
import manualOrderService from '../api/ManualOrderService';
import Swal from 'sweetalert2';

/**
 * Hook principal para pedidos manuales
 */
export const useManualOrder = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [orderData, setOrderData] = useState(() => manualOrderService.generateDefaultOrderData());
  const [estimatedPrice, setEstimatedPrice] = useState(0);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedDesign, setSelectedDesign] = useState(null);

  /**
   * Crear pedido manual completo
   */
  const createManualOrder = useCallback(async (finalOrderData) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('📝 [useManualOrder] Creando pedido manual:', finalOrderData);
      
      // Validar datos
      const validation = manualOrderService.validateManualOrderData(finalOrderData);
      if (!validation.isValid) {
        throw new Error(validation.errors.join('\n• '));
      }
      
      const response = await manualOrderService.createManualOrder(finalOrderData);
      
      console.log('📝 [useManualOrder] Respuesta del servidor:', response);
      
      if (response.success) {
        const orderNumber = response.data.order?.orderNumber || response.data.orderNumber || 'N/A';
        console.log('📝 [useManualOrder] OrderNumber extraído:', orderNumber);
        await Swal.fire({
          title: 'Pedido manual creado',
          text: `Pedido ${orderNumber} creado exitosamente`,
          icon: 'success',
          confirmButtonColor: '#1F64BF',
          zIndex: 10000 // Asegurar que esté por encima del modal
        });
        
        // Limpiar formulario
        resetForm();
        
        return response.data;
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('❌ [useManualOrder] Error creando pedido:', error);
      
      await Swal.fire({
        title: 'Error al crear pedido',
        text: error.message || 'No se pudo crear el pedido manual',
        icon: 'error',
        confirmButtonColor: '#1F64BF'
      });
      
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Calcular precio estimado
   */
  const calculatePrice = useCallback(async (calculationData) => {
    try {
      setLoading(true);
      
      const response = await manualOrderService.calculateEstimatedPrice(calculationData);
      
      if (response.success) {
        setEstimatedPrice(response.data.estimatedPrice);
        return response.data;
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('❌ [useManualOrder] Error calculando precio:', error);
      setError(error.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Actualizar datos de la orden
   */
  const updateOrderData = useCallback((updates) => {
    setOrderData(prev => ({ ...prev, ...updates }));
  }, []);

  /**
   * Seleccionar cliente
   */
  const selectCustomer = useCallback((customer) => {
    console.log('👤 [useManualOrder] Cliente seleccionado:', customer);
    setSelectedCustomer(customer);
    
    if (customer._id) {
      updateOrderData({ customerId: customer._id });
    } else {
      updateOrderData({ customerData: customer });
    }
  }, [updateOrderData]);

  /**
   * Seleccionar producto
   */
  const selectProduct = useCallback((product) => {
    console.log('📦 [useManualOrder] Producto seleccionado:', product);
    setSelectedProduct(product);
    setSelectedDesign(null); // Limpiar diseño seleccionado
    
    updateOrderData({ 
      productId: product._id,
      basePrice: product.basePrice 
    });
  }, [updateOrderData]);

  /**
   * Seleccionar diseño
   */
  const selectDesign = useCallback((design) => {
    console.log('🎨 [useManualOrder] Diseño seleccionado:', design);
    setSelectedDesign(design);
    
    // Extraer automáticamente los datos del cliente y producto del diseño
    const orderUpdates = {
      designId: design._id,
      designPrice: design.price || 0,
      customerId: design.user?._id || design.userId,
      productId: design.product?._id || design.productId,
      basePrice: design.product?.basePrice || 0
    };
    
    console.log('📝 [useManualOrder] Datos extraídos del diseño:', orderUpdates);
    updateOrderData(orderUpdates);
  }, [updateOrderData]);

  /**
   * Reiniciar formulario
   */
  const resetForm = useCallback(() => {
    setOrderData(manualOrderService.generateDefaultOrderData());
    setEstimatedPrice(0);
    setSelectedCustomer(null);
    setSelectedProduct(null);
    setSelectedDesign(null);
    setError(null);
  }, []);

  /**
   * Validar estado actual del formulario
   */
  const validateCurrentData = useCallback(() => {
    return manualOrderService.validateManualOrderData(orderData);
  }, [orderData]);

  /**
   * Verificar si el formulario está completo
   */
  const isFormComplete = useCallback(() => {
    const validation = validateCurrentData();
    return validation.isValid;
  }, [validateCurrentData]);

  return {
    // Estado
    loading,
    error,
    orderData,
    estimatedPrice,
    selectedCustomer,
    selectedProduct,
    selectedDesign,
    
    // Acciones
    createManualOrder,
    calculatePrice,
    updateOrderData,
    selectCustomer,
    selectProduct,
    selectDesign,
    resetForm,
    
    // Validaciones
    validateCurrentData,
    isFormComplete,
    
    // Utilidades
    formatCustomer: manualOrderService.formatCustomerForDisplay
  };
};

/**
 * Hook para búsqueda de clientes
 */
export const useCustomerSearch = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const searchTimeoutRef = useRef(null);

  /**
   * Buscar clientes con debounce
   */
  const searchCustomers = useCallback(async (query) => {
    if (!query || query.trim().length < 2) {
      setCustomers([]);
      return;
    }

    // Limpiar timeout anterior
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Agregar debounce
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await manualOrderService.searchCustomers(query.trim());
        
        if (response.success) {
          const formattedCustomers = (response.data || []).map(customer => 
            manualOrderService.formatCustomerForDisplay(customer)
          );
          setCustomers(formattedCustomers);
        } else {
          setCustomers([]);
        }
      } catch (error) {
        console.error('❌ [useCustomerSearch] Error:', error);
        setError(error.message);
        setCustomers([]);
      } finally {
        setLoading(false);
      }
    }, 300); // 300ms de debounce
  }, []);

  /**
   * Obtener detalles de un cliente
   */
  const getCustomerDetails = useCallback(async (customerId) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await manualOrderService.getCustomerDetails(customerId);
      
      if (response.success) {
        return manualOrderService.formatCustomerForDisplay(response.data);
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('❌ [useCustomerSearch] Error obteniendo detalles:', error);
      setError(error.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Crear nuevo cliente
   */
  const createCustomer = useCallback(async (customerData) => {
    try {
      setLoading(true);
      setError(null);
      
      // Validar datos del cliente
      const validation = manualOrderService.validateNewCustomerData(customerData);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }
      
      const response = await manualOrderService.createCustomerForOrder(customerData);
      
      if (response.success) {
        const newCustomer = manualOrderService.formatCustomerForDisplay(response.data);
        
        await Swal.fire({
          title: 'Cliente creado',
          text: `Cliente ${newCustomer.displayName} creado exitosamente`,
          icon: 'success',
          confirmButtonColor: '#1F64BF'
        });
        
        return newCustomer;
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('❌ [useCustomerSearch] Error creando cliente:', error);
      
      await Swal.fire({
        title: 'Error al crear cliente',
        text: error.message || 'No se pudo crear el cliente',
        icon: 'error',
        confirmButtonColor: '#1F64BF'
      });
      
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  return {
    customers,
    loading,
    error,
    searchCustomers,
    getCustomerDetails,
    createCustomer,
    hasCustomers: customers.length > 0
  };
};

/**
 * Hook para búsqueda de productos
 */
export const useProductSearch = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const searchTimeoutRef = useRef(null);

  /**
   * Buscar productos con debounce
   */
  const searchProducts = useCallback(async (query, filters = {}) => {
    if (!query || query.trim().length < 2) {
      setProducts([]);
      return;
    }

    // Limpiar timeout anterior
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Agregar debounce
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await manualOrderService.searchProducts(query.trim(), filters);
        
        if (response.success) {
          setProducts(response.data || []);
        } else {
          setProducts([]);
        }
      } catch (error) {
        console.error('❌ [useProductSearch] Error:', error);
        setError(error.message);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }, 300);
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  return {
    products,
    loading,
    error,
    searchProducts,
    hasProducts: products.length > 0
  };
};

/**
 * Hook para gestión de diseños
 */
export const useDesignManagement = () => {
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const searchTimeoutRef = useRef(null);

  /**
   * Cargar todos los diseños disponibles
   */
  const loadAllDesigns = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 [useDesignManagement] Cargando diseños...');
      const response = await manualOrderService.getAllDesigns();
      
      console.log('📥 [useDesignManagement] Respuesta completa:', response);
      console.log('📊 [useDesignManagement] response.success:', response.success);
      console.log('📊 [useDesignManagement] response.data:', response.data);
      console.log('📊 [useDesignManagement] Array.isArray(response.data):', Array.isArray(response.data));
      
      if (response.success) {
        // El backend devuelve los diseños en response.data.designs
        const designsArray = response.data?.designs || response.data || [];
        const designsData = Array.isArray(designsArray) ? designsArray : [];
        console.log('🎨 [useDesignManagement] Diseños procesados:', designsData);
        console.log('🎨 [useDesignManagement] Cantidad de diseños:', designsData.length);
        setDesigns(designsData);
      } else {
        console.log('❌ [useDesignManagement] Respuesta no exitosa');
        setDesigns([]);
      }
    } catch (error) {
      console.error('❌ [useDesignManagement] Error cargando diseños:', error);
      setError(error.message);
      setDesigns([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Buscar diseños con debounce
   */
  const searchDesigns = useCallback(async (query) => {
    if (!query || query.trim().length < 2) {
      // Si no hay query, cargar todos los diseños
      loadAllDesigns();
      return;
    }

    // Limpiar timeout anterior
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Agregar debounce
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await manualOrderService.searchDesigns(query.trim());
        
        if (response.success) {
          // El backend devuelve los diseños en response.data.designs
          const designsArray = response.data?.designs || response.data || [];
          const designsData = Array.isArray(designsArray) ? designsArray : [];
          setDesigns(designsData);
        } else {
          setDesigns([]);
        }
      } catch (error) {
        console.error('❌ [useDesignManagement] Error:', error);
        setError(error.message);
        setDesigns([]);
      } finally {
        setLoading(false);
      }
    }, 300);
  }, [loadAllDesigns]);

  /**
   * Obtener diseños de un producto
   */
  const getProductDesigns = useCallback(async (productId, filters = {}) => {
    if (!productId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await manualOrderService.getProductDesigns(productId, filters);
      
      if (response.success) {
        setDesigns(response.data || []);
      } else {
        setDesigns([]);
      }
    } catch (error) {
      console.error('❌ [useDesignManagement] Error:', error);
      setError(error.message);
      setDesigns([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Crear diseño personalizado
   */
  const createCustomDesign = useCallback(async (designData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await manualOrderService.createCustomDesign(designData);
      
      if (response.success) {
        await Swal.fire({
          title: 'Diseño creado',
          text: 'Diseño personalizado creado exitosamente',
          icon: 'success',
          confirmButtonColor: '#1F64BF'
        });
        
        return response.data;
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('❌ [useDesignManagement] Error creando diseño:', error);
      
      await Swal.fire({
        title: 'Error al crear diseño',
        text: error.message || 'No se pudo crear el diseño',
        icon: 'error',
        confirmButtonColor: '#1F64BF'
      });
      
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar diseños al montar el componente
  useEffect(() => {
    loadAllDesigns();
  }, [loadAllDesigns]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  return {
    designs,
    loading,
    error,
    searchDesigns,
    loadAllDesigns,
    getProductDesigns,
    createCustomDesign,
    hasDesigns: designs.length > 0
  };
};

export default useManualOrder;