import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Order } from '@/api/entities';
import { toast } from 'sonner';

// יצירת הקונטקסט
const OrderContext = createContext();

// Provider component
export function OrderProvider({ children }) {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(Date.now());

  // טעינה ראשונית של כל ההזמנות
  const loadAllOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const allOrders = await Order.list('-created_date', 500); // טוען 500 הזמנות אחרונות
      setOrders(allOrders);
      setLastUpdate(Date.now());
    } catch (error) {
      console.error('Error loading orders in OrderContext:', error);
      toast.error('שגיאה בטעינת הזמנות');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // טעינה ראשונית
  useEffect(() => {
    loadAllOrders();
  }, [loadAllOrders]);

  // פונקציה לחיפוש הזמנה לפי ID
  const getOrderById = useCallback((orderId) => {
    return orders.find(order => order.id === orderId);
  }, [orders]);

  // פונקציה לסינון הזמנות
  const getOrdersByFilter = useCallback((filterFn) => {
    return orders.filter(filterFn);
  }, [orders]);

  // פונקציה לסינון לפי סטטוס
  const getOrdersByStatus = useCallback((status) => {
    return orders.filter(order => order.status === status);
  }, [orders]);

  // פונקציה לסינון לפי תפקיד/תצוגה
  const getOrdersByRole = useCallback((role) => {
    switch (role) {
      case 'picker':
        return orders.filter(order => 
          order.status === 'בליקוט' && 
          order.picking_status !== 'הושלם'
        );
      case 'baker':
        return orders.filter(order => 
          order.order_type === 'הזמנה_לאופות' && 
          (order.status === 'בליקוט' || order.status === 'ממתין')
        );
      case 'courier':
        return orders.filter(order => 
          order.status === 'נשלח' || 
          order.status === 'משלוח אצל השליח'
        );
      case 'shipments':
        return orders.filter(order => 
          order.status === 'ממתין למשלוח' && 
          order.shipping_method_chosen === 'משלוח'
        );
      case 'pickups':
        return orders.filter(order => 
          order.status === 'ממתין לאיסוף' && 
          order.shipping_method_chosen === 'איסוף_עצמי'
        );
      default:
        return orders;
    }
  }, [orders]);

  // יצירת הזמנה חדשה
  const createOrder = useCallback(async (orderData) => {
    try {
      const newOrder = await Order.create(orderData);
      setOrders(prevOrders => [newOrder, ...prevOrders]);
      setLastUpdate(Date.now());
      toast.success('הזמנה נוצרה בהצלחה');
      return newOrder;
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error('שגיאה ביצירת הזמנה');
      throw error;
    }
  }, []);

  // עדכון הזמנה קיימת
  const updateOrder = useCallback(async (orderId, updateData) => {
    try {
      const updatedOrder = await Order.update(orderId, updateData);
      
      // עדכון המצב המקומי
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId 
            ? { ...order, ...updateData, updated_date: new Date().toISOString() }
            : order
        )
      );
      
      setLastUpdate(Date.now());
      return updatedOrder;
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error('שגיאה בעדכון הזמנה');
      throw error;
    }
  }, []);

  // מחיקת הזמנה
  const deleteOrder = useCallback(async (orderId) => {
    try {
      await Order.delete(orderId);
      setOrders(prevOrders => prevOrders.filter(order => order.id !== orderId));
      setLastUpdate(Date.now());
      toast.success('הזמנה נמחקה בהצלחה');
    } catch (error) {
      console.error('Error deleting order:', error);
      toast.error('שגיאה במחיקת הזמנה');
      throw error;
    }
  }, []);

  // רענון הזמנות מהשרת
  const refreshOrders = useCallback(async () => {
    await loadAllOrders();
  }, [loadAllOrders]);

  // רענון הזמנה ספציפית מהשרת
  const refreshOrder = useCallback(async (orderId) => {
    try {
      const allOrders = await Order.list('-created_date', 500);
      const updatedOrder = allOrders.find(order => order.id === orderId);
      
      if (updatedOrder) {
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order.id === orderId ? updatedOrder : order
          )
        );
        setLastUpdate(Date.now());
      }
    } catch (error) {
      console.error('Error refreshing specific order:', error);
    }
  }, []);

  // עדכון מקומי בלבד (לאופטימיזציה)
  const updateOrderLocal = useCallback((orderId, updateData) => {
    setOrders(prevOrders => 
      prevOrders.map(order => 
        order.id === orderId 
          ? { ...order, ...updateData }
          : order
      )
    );
    setLastUpdate(Date.now());
  }, []);

  // Value object שיעבור לכל הילדים
  const contextValue = {
    // State
    orders,
    isLoading,
    lastUpdate,
    
    // Getter functions
    getOrderById,
    getOrdersByFilter,
    getOrdersByStatus,
    getOrdersByRole,
    
    // CRUD operations
    createOrder,
    updateOrder,
    deleteOrder,
    
    // Refresh operations
    refreshOrders,
    refreshOrder,
    updateOrderLocal,
    
    // Meta info
    ordersCount: orders.length,
    unreadOrdersCount: orders.filter(order => 
      order.status === 'ממתין' || order.status === 'בליקוט'
    ).length
  };

  return (
    <OrderContext.Provider value={contextValue}>
      {children}
    </OrderContext.Provider>
  );
}

// Custom hook לשימוש בקונטקסט
export function useOrders() {
  const context = useContext(OrderContext);
  
  if (!context) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  
  return context;
}

// Custom hooks נוספים לשימושים ספציפיים
export function useOrder(orderId) {
  const { getOrderById, refreshOrder } = useOrders();
  
  return {
    order: getOrderById(orderId),
    refreshOrder: () => refreshOrder(orderId)
  };
}

export function useOrdersByStatus(status) {
  const { getOrdersByStatus } = useOrders();
  return getOrdersByStatus(status);
}

export function useOrdersByRole(role) {
  const { getOrdersByRole } = useOrders();
  return getOrdersByRole(role);
}