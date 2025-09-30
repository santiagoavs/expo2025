// hooks/useOrders.js
import { useState, useEffect, useCallback, useContext } from 'react';
import ordersAPI from '../api/ordersApi';
import { AuthContext } from '../context/authContext';

export const useOrders = (initialFilters = {}) => {
  const { user, isAuthenticated } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(initialFilters);

  const fetchOrders = useCallback(async () => {
    // Only fetch if user is authenticated
    if (!isAuthenticated) {
      console.log('🔄 [useOrders] User not authenticated, skipping fetch');
      setOrders([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 [useOrders] Fetching orders with filters:', filters);
      
      // Get orders using the authenticated user's session
      const response = await ordersAPI.getMyOrders({
        ...filters,
        // Default pagination
        page: filters.page || 1,
        limit: filters.limit || 10,
        sort: filters.sort || 'createdAt',
        order: filters.order || 'desc'
      });
      
      console.log('📦 [useOrders] Orders response:', {
        success: response.success,
        count: response.data?.orders?.length || 0,
        total: response.data?.total || 0
      });
      
      if (response.success) {
        // Format orders from the new response format
        const formattedOrders = (response.data.orders || []).map(order => ({
          ...order,
          // Add calculated properties
          isPending: ['pending_approval', 'quoted'].includes(order.status),
          needsResponse: order.status === 'quoted' && !order.quoteResponse,
          hasQualityPending: order.status === 'quality_check' && 
            (order.productionPhotos || []).some(p => !p.clientResponse)
        }));
        
        setOrders(formattedOrders);
      } else {
        console.error('❌ [useOrders] Error in response:', response.message);
        setError(response.message || 'Error al cargar las órdenes');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Error al cargar las órdenes';
      console.error('❌ [useOrders] Error fetching orders:', {
        message: errorMessage,
        status: err.response?.status,
        data: err.response?.data
      });
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [filters, isAuthenticated, user?._id]); // Add dependencies to prevent stale closures

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return {
    orders,
    loading,
    error,
    filters,
    setFilters,
    refreshOrders: fetchOrders
  };
};