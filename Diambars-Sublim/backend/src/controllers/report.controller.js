// controllers/report.controller.js - Estadísticas y reportes separados
import Order from "../models/order.js";
import Design from "../models/design.js";
import Product from "../models/product.js";
import User from "../models/users.js";

const reportController = {};

// ==================== REPORTES DE VENTAS ====================

/**
 * Reporte de ventas por período
 */
reportController.getSalesReport = async (req, res) => {
  try {
    const { 
      startDate, 
      endDate, 
      groupBy = 'day',
      includeDetails = false 
    } = req.query;

    // Construir filtro de fechas
    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);

    const matchFilter = {
      'payment.status': 'paid',
      ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter })
    };

    // Configurar agrupación
    let dateGrouping;
    switch (groupBy) {
      case 'day':
        dateGrouping = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        };
        break;
      case 'week':
        dateGrouping = {
          year: { $year: '$createdAt' },
          week: { $week: '$createdAt' }
        };
        break;
      case 'month':
        dateGrouping = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        };
        break;
      default:
        dateGrouping = { year: { $year: '$createdAt' } };
    }

    // Agregación principal
    const salesData = await Order.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: dateGrouping,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$total' },
          averageOrderValue: { $avg: '$total' },
          totalProducts: { $sum: { $size: '$items' } },
          paymentMethods: { $push: '$payment.method' }
        }
      },
      {
        $addFields: {
          date: {
            $dateFromParts: {
              year: '$_id.year',
              month: { $ifNull: ['$_id.month', 1] },
              day: { $ifNull: ['$_id.day', 1] }
            }
          }
        }
      },
      { $sort: { date: 1 } }
    ]);

    // Estadísticas generales
    const totalStats = await Order.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$total' },
          averageOrderValue: { $avg: '$total' },
          minOrderValue: { $min: '$total' },
          maxOrderValue: { $max: '$total' }
        }
      }
    ]);

    // Estadísticas por método de pago
    const paymentMethodStats = await Order.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: '$payment.method',
          count: { $sum: 1 },
          totalAmount: { $sum: '$total' },
          averageAmount: { $avg: '$total' }
        }
      },
      { $sort: { totalAmount: -1 } }
    ]);

    // Detalles adicionales si se solicitan
    let orderDetails = null;
    if (includeDetails === 'true') {
      orderDetails = await Order.find(matchFilter)
        .select('orderNumber total payment.method createdAt user')
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .limit(100)
        .lean();
    }

    res.status(200).json({
      success: true,
      data: {
        summary: totalStats[0] || {
          totalOrders: 0,
          totalRevenue: 0,
          averageOrderValue: 0,
          minOrderValue: 0,
          maxOrderValue: 0
        },
        salesByPeriod: salesData,
        paymentMethodBreakdown: paymentMethodStats,
        orderDetails,
        filters: {
          startDate,
          endDate,
          groupBy,
          includeDetails
        },
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error("❌ Error en getSalesReport:", error);
    res.status(500).json({
      success: false,
      message: "Error generando reporte de ventas",
      error: 'SALES_REPORT_ERROR'
    });
  }
};

/**
 * Reporte de productos más vendidos
 */
reportController.getTopProductsReport = async (req, res) => {
  try {
    const { 
      startDate, 
      endDate, 
      limit = 10,
      includeRevenue = true 
    } = req.query;

    // Filtro de fechas
    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);

    const matchFilter = {
      'payment.status': 'paid',
      ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter })
    };

    // Productos más vendidos por cantidad
    const topProductsByQuantity = await Order.aggregate([
      { $match: matchFilter },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          totalQuantity: { $sum: '$items.quantity' },
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$items.subtotal' },
          averageUnitPrice: { $avg: '$items.unitPrice' }
        }
      },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'productInfo'
        }
      },
      { $unwind: '$productInfo' },
      {
        $project: {
          productId: '$_id',
          productName: '$productInfo.name',
          productImage: '$productInfo.images.main',
          basePrice: '$productInfo.basePrice',
          totalQuantity: 1,
          totalOrders: 1,
          totalRevenue: { $round: ['$totalRevenue', 2] },
          averageUnitPrice: { $round: ['$averageUnitPrice', 2] }
        }
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: parseInt(limit) }
    ]);

    // Productos más vendidos por ingresos
    const topProductsByRevenue = await Order.aggregate([
      { $match: matchFilter },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          totalRevenue: { $sum: '$items.subtotal' },
          totalQuantity: { $sum: '$items.quantity' },
          totalOrders: { $sum: 1 },
          averageUnitPrice: { $avg: '$items.unitPrice' }
        }
      },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'productInfo'
        }
      },
      { $unwind: '$productInfo' },
      {
        $project: {
          productId: '$_id',
          productName: '$productInfo.name',
          productImage: '$productInfo.images.main',
          basePrice: '$productInfo.basePrice',
          totalRevenue: { $round: ['$totalRevenue', 2] },
          totalQuantity: 1,
          totalOrders: 1,
          averageUnitPrice: { $round: ['$averageUnitPrice', 2] }
        }
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: parseInt(limit) }
    ]);

    // Estadísticas por categoría
    const categoryStats = await Order.aggregate([
      { $match: matchFilter },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.product',
          foreignField: '_id',
          as: 'productInfo'
        }
      },
      { $unwind: '$productInfo' },
      {
        $lookup: {
          from: 'categories',
          localField: 'productInfo.category',
          foreignField: '_id',
          as: 'categoryInfo'
        }
      },
      { $unwind: '$categoryInfo' },
      {
        $group: {
          _id: '$categoryInfo._id',
          categoryName: { $first: '$categoryInfo.name' },
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.subtotal' },
          totalOrders: { $sum: 1 },
          uniqueProducts: { $addToSet: '$items.product' }
        }
      },
      {
        $project: {
          categoryId: '$_id',
          categoryName: 1,
          totalQuantity: 1,
          totalRevenue: { $round: ['$totalRevenue', 2] },
          totalOrders: 1,
          uniqueProductsCount: { $size: '$uniqueProducts' }
        }
      },
      { $sort: { totalRevenue: -1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        topProductsByQuantity,
        topProductsByRevenue,
        categoryBreakdown: categoryStats,
        filters: {
          startDate,
          endDate,
          limit: parseInt(limit)
        },
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error("❌ Error en getTopProductsReport:", error);
    res.status(500).json({
      success: false,
      message: "Error generando reporte de productos",
      error: 'PRODUCTS_REPORT_ERROR'
    });
  }
};

/**
 * Reporte de clientes frecuentes
 */
reportController.getTopCustomersReport = async (req, res) => {
  try {
    const { 
      startDate, 
      endDate, 
      limit = 10,
      sortBy = 'totalSpent' 
    } = req.query;

    // Filtro de fechas
    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);

    const matchFilter = {
      'payment.status': 'paid',
      ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter })
    };

    // Configurar ordenamiento
    let sortField;
    switch (sortBy) {
      case 'totalOrders':
        sortField = { totalOrders: -1 };
        break;
      case 'averageOrderValue':
        sortField = { averageOrderValue: -1 };
        break;
      case 'lastOrderDate':
        sortField = { lastOrderDate: -1 };
        break;
      default:
        sortField = { totalSpent: -1 };
    }

    const topCustomers = await Order.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: '$user',
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: '$total' },
          averageOrderValue: { $avg: '$total' },
          firstOrderDate: { $min: '$createdAt' },
          lastOrderDate: { $max: '$createdAt' },
          paymentMethods: { $addToSet: '$payment.method' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userInfo'
        }
      },
      { $unwind: '$userInfo' },
      {
        $project: {
          userId: '$_id',
          userName: '$userInfo.name',
          userEmail: '$userInfo.email',
          totalOrders: 1,
          totalSpent: { $round: ['$totalSpent', 2] },
          averageOrderValue: { $round: ['$averageOrderValue', 2] },
          firstOrderDate: 1,
          lastOrderDate: 1,
          paymentMethods: 1,
          customerLifetimeDays: {
            $divide: [
              { $subtract: ['$lastOrderDate', '$firstOrderDate'] },
              1000 * 60 * 60 * 24
            ]
          }
        }
      },
      { $sort: sortField },
      { $limit: parseInt(limit) }
    ]);

    // Estadísticas generales de clientes
    const customerStats = await Order.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: '$user',
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: '$total' }
        }
      },
      {
        $group: {
          _id: null,
          totalCustomers: { $sum: 1 },
          averageOrdersPerCustomer: { $avg: '$totalOrders' },
          averageSpentPerCustomer: { $avg: '$totalSpent' },
          repeatCustomers: {
            $sum: { $cond: [{ $gt: ['$totalOrders', 1] }, 1, 0] }
          }
        }
      },
      {
        $project: {
          totalCustomers: 1,
          averageOrdersPerCustomer: { $round: ['$averageOrdersPerCustomer', 2] },
          averageSpentPerCustomer: { $round: ['$averageSpentPerCustomer', 2] },
          repeatCustomers: 1,
          repeatCustomerRate: {
            $round: [
              { $multiply: [{ $divide: ['$repeatCustomers', '$totalCustomers'] }, 100] },
              2
            ]
          }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        topCustomers,
        customerStatistics: customerStats[0] || {
          totalCustomers: 0,
          averageOrdersPerCustomer: 0,
          averageSpentPerCustomer: 0,
          repeatCustomers: 0,
          repeatCustomerRate: 0
        },
        filters: {
          startDate,
          endDate,
          limit: parseInt(limit),
          sortBy
        },
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error("❌ Error en getTopCustomersReport:", error);
    res.status(500).json({
      success: false,
      message: "Error generando reporte de clientes",
      error: 'CUSTOMERS_REPORT_ERROR'
    });
  }
};

// ==================== REPORTES DE PRODUCCIÓN ====================

/**
 * Reporte de tiempos de producción
 */
reportController.getProductionReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);

    const matchFilter = {
      status: { $in: ['completed', 'delivered'] },
      ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter })
    };

    const productionStats = await Order.aggregate([
      { $match: matchFilter },
      {
        $project: {
          orderNumber: 1,
          createdAt: 1,
          estimatedReadyDate: 1,
          actualReadyDate: 1,
          status: 1,
          daysInProduction: {
            $divide: [
              { $subtract: ['$actualReadyDate', '$createdAt'] },
              1000 * 60 * 60 * 24
            ]
          },
          estimatedDays: {
            $divide: [
              { $subtract: ['$estimatedReadyDate', '$createdAt'] },
              1000 * 60 * 60 * 24
            ]
          }
        }
      },
      {
        $addFields: {
          onTime: { $lte: ['$actualReadyDate', '$estimatedReadyDate'] },
          delayDays: {
            $max: [
              0,
              {
                $divide: [
                  { $subtract: ['$actualReadyDate', '$estimatedReadyDate'] },
                  1000 * 60 * 60 * 24
                ]
              }
            ]
          }
        }
      }
    ]);

    // Estadísticas agregadas
    const aggregatedStats = await Order.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          averageProductionDays: {
            $avg: {
              $divide: [
                { $subtract: ['$actualReadyDate', '$createdAt'] },
                1000 * 60 * 60 * 24
              ]
            }
          },
          onTimeDeliveries: {
            $sum: {
              $cond: [{ $lte: ['$actualReadyDate', '$estimatedReadyDate'] }, 1, 0]
            }
          }
        }
      },
      {
        $project: {
          totalOrders: 1,
          averageProductionDays: { $round: ['$averageProductionDays', 2] },
          onTimeDeliveries: 1,
          onTimeRate: {
            $round: [
              { $multiply: [{ $divide: ['$onTimeDeliveries', '$totalOrders'] }, 100] },
              2
            ]
          }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        orderDetails: productionStats,
        summary: aggregatedStats[0] || {
          totalOrders: 0,
          averageProductionDays: 0,
          onTimeDeliveries: 0,
          onTimeRate: 0
        },
        filters: {
          startDate,
          endDate
        },
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error("❌ Error en getProductionReport:", error);
    res.status(500).json({
      success: false,
      message: "Error generando reporte de producción",
      error: 'PRODUCTION_REPORT_ERROR'
    });
  }
};

// ==================== DASHBOARD GENERAL ====================

/**
 * Dashboard con métricas generales
 */
reportController.getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfYear = new Date(today.getFullYear(), 0, 1);

    // Métricas del día
    const todayStats = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfDay }
        }
      },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$total' },
          paidOrders: {
            $sum: { $cond: [{ $eq: ['$payment.status', 'paid'] }, 1, 0] }
          },
          pendingOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'pending_approval'] }, 1, 0] }
          }
        }
      }
    ]);

    // Métricas del mes
    const monthStats = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfMonth }
        }
      },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$total' },
          paidRevenue: {
            $sum: { $cond: [{ $eq: ['$payment.status', 'paid'] }, '$total', 0] }
          }
        }
      }
    ]);

    // Pedidos pendientes por estado
    const ordersByStatus = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Productos en producción
    const inProductionCount = await Order.countDocuments({
      status: 'in_production'
    });

    // Pedidos listos para entrega
    const readyForDeliveryCount = await Order.countDocuments({
      status: 'ready_for_delivery'
    });

    res.status(200).json({
      success: true,
      data: {
        today: todayStats[0] || {
          totalOrders: 0,
          totalRevenue: 0,
          paidOrders: 0,
          pendingOrders: 0
        },
        thisMonth: monthStats[0] || {
          totalOrders: 0,
          totalRevenue: 0,
          paidRevenue: 0
        },
        ordersByStatus: ordersByStatus.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        production: {
          inProduction: inProductionCount,
          readyForDelivery: readyForDeliveryCount
        },
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error("❌ Error en getDashboardStats:", error);
    res.status(500).json({
      success: false,
      message: "Error obteniendo estadísticas del dashboard",
      error: 'DASHBOARD_ERROR'
    });
  }
};

export default reportController;