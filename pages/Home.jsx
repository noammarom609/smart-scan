
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Order } from '@/api/entities';
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Plus, Package, DollarSign, RefreshCw } from "lucide-react";
import OrdersList from "../components/orders/OrdersList";
import StatsCards from "../components/dashboard/StatsCards";
import OrderFilters from '../components/orders/OrderFilters';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { he } from "date-fns/locale";
import { toast } from "sonner";
import { checkEmails } from "@/api/functions";
import { format, parseISO } from "date-fns";
import { triggerNotificationsFromOrder } from '@/api/functions';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

import GlobalSearch from '../components/common/GlobalSearch';
import { User } from '@/api/entities';
import { getUserRole } from '@/components/utils/rolePermissions';
import { useOrders } from '@/components/contexts/OrderContext';

export default function HomePage() {
  // Destructure from global order context
  const { 
    orders: contextOrders, // Renamed from allOrders to avoid confusion with local filtered list
    isLoading: ordersLoading, // Global loading state from context
    updateOrder, 
    deleteOrder,
    refreshOrders 
  } = useOrders();

  const [orders, setOrders] = useState([]); // Local state for filtered/active orders displayed in this component
  const [stats, setStats] = useState({ total: 0, pending: 0, ready: 0, shipped: 0, averageValue: 0, totalValue: 0, lastUpdatedAt: null });
  const [filters, setFilters] = useState({ status: 'all', supplier: 'all', searchTerm: '', sortOrder: 'newest' });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [emailDateRange, setEmailDateRange] = useState({
    from: new Date(),
    to: new Date(),
  });
  const [isCheckingEmails, setIsCheckingEmails] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false); // For manual refresh button spinner
  const [currentUser, setCurrentUser] = useState(null);

  const calculateStats = (ordersData) => {
    if (!ordersData || ordersData.length === 0) {
      setStats({ total: 0, pending: 0, ready: 0, shipped: 0, averageValue: 0, totalValue: 0, lastUpdatedAt: new Date() });
      return;
    }
    const pendingOrders = ordersData.filter(o => o.status === 'ממתין' || o.status === 'בליקוט');
    const readyOrders = ordersData.filter(o => o.status === 'ממתין למשלוח' || o.status === 'ממתין לאיסוף');
    const shippedOrders = ordersData.filter(o => o.status === 'נשלח' || o.status === 'התקבל');
    const totalValue = ordersData.reduce((sum, o) => sum + (o.total_amount || 0), 0);
    const averageValue = ordersData.length > 0 ? totalValue / ordersData.length : 0;
    
    setStats({
      total: ordersData.length,
      pending: pendingOrders.length,
      ready: readyOrders.length,
      shipped: shippedOrders.length,
      averageValue: averageValue,
      totalValue: totalValue,
      lastUpdatedAt: new Date()
    });
  };

  const cleanupDuplicateOrders = useCallback(async () => {
    const allOrdersFromDB = await Order.list(); // Still fetch from DB to find all, including archived/etc.
    const ordersByNumber = allOrdersFromDB.reduce((acc, order) => {
      if (order.order_number) {
        if (!acc[order.order_number]) {
          acc[order.order_number] = [];
        }
        acc[order.order_number].push(order);
      }
      return acc;
    }, {});

    let duplicatesFound = false;
    for (const orderNumber in ordersByNumber) {
      if (ordersByNumber[orderNumber].length > 1) {
        duplicatesFound = true;
        const sortedOrders = ordersByNumber[orderNumber].sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
        const toDelete = sortedOrders.slice(1);
        for (const order of toDelete) {
          try {
            await Order.delete(order.id); // Direct DB operation for cleanup
            console.log(`Deleted duplicate order ${order.order_number} (ID: ${order.id})`);
          } catch (e) {
            console.error(`Failed to delete duplicate order ${order.id}:`, e);
          }
        }
      }
    }
    if (duplicatesFound) {
      await refreshOrders(); // Refresh context state if any changes occurred
    }
  }, [refreshOrders]);

  const autoArchiveDeliveredOrders = useCallback(async () => {
    try {
      const deliveredOrdersToArchive = contextOrders.filter(o => 
        (o.status === 'נמסרה' || o.status === 'לא נמסרה' || o.status === 'התקבל') && 
        o.status !== 'בארכיון'
      );

      if (deliveredOrdersToArchive.length > 0) {
        console.log(`Found ${deliveredOrdersToArchive.length} delivered orders to archive.`);
        for (const order of deliveredOrdersToArchive) {
          try {
            await updateOrder(order.id, { status: "בארכיון" }); // Use context's updateOrder
            console.log(`Automatically archived delivered order ${order.order_number} (ID: ${order.id})`);
          } catch (error) {
            console.error(`Failed to automatically archive order ${order.id}:`, error);
          }
        }
        toast.info(`הועברו לארכיון ${deliveredOrdersToArchive.length} הזמנות שהושלמו.`);
      }
    } catch (error) {
      console.error("Error during auto-archiving delivered orders:", error);
    }
  }, [contextOrders, updateOrder]);

  // This function processes the orders from the global context and sets them for local display
  const processOrdersFromContext = useCallback(() => {
    const activeOrders = contextOrders.filter(o => 
      o.status !== 'בארכיון' && 
      (o.order_type !== 'הזמנה_לאופות' || !o.order_type)
    );
    
    setOrders(activeOrders);
    calculateStats(activeOrders);
  }, [contextOrders]);

  const loadCurrentUser = useCallback(async () => {
    try {
      const user = await User.me();
      setCurrentUser(user);
    } catch (error) {
      console.error("Error loading current user:", error);
    }
  }, []);

  // Initial setup effect (runs once on mount)
  useEffect(() => {
    const initializeData = async () => {
      await loadCurrentUser();
      await cleanupDuplicateOrders(); // This might trigger refreshOrders
      await autoArchiveDeliveredOrders(); // This uses updateOrder, which updates context
      // The context itself should have triggered a load on mount of OrderProvider
      // Any updates from cleanup/autoArchive will cause contextOrders to change,
      // which will then trigger processOrdersFromContext.
    };
    initializeData();
  }, [cleanupDuplicateOrders, autoArchiveDeliveredOrders, loadCurrentUser]); // Dependencies should be stable functions

  // Effect to react to changes in global orders state
  useEffect(() => {
    if (!ordersLoading) {
      processOrdersFromContext();
    }
  }, [contextOrders, ordersLoading, processOrdersFromContext]);


  const handleDeleteOrder = async (orderId) => {
    const toastId = toast.loading("מוחק הזמנה...");
    try {
      await deleteOrder(orderId); // Use context's deleteOrder
      toast.success("ההזמנה נמחקה בהצלחה!", { id: toastId });
      // No explicit loadOrders needed, context handles state update
    } catch (error) {
      console.error("Error deleting order:", error);
      toast.error("שגיאה במחיקת ההזמנה.", { id: toastId });
    }
  };

  const handleArchiveOrder = async (orderId) => {
    const toastId = toast.loading("מעביר לארכיון...");
    try {
      await updateOrder(orderId, { status: "בארכיון" }); // Use context's updateOrder
      toast.success("ההזמנה הועברה לארכיון!", { id: toastId });
      // No explicit loadOrders needed, context handles state update
    } catch (error) {
      console.error("Error archiving order:", error);
      toast.error("שגיאה בהעברה לארכיון.", { id: toastId });
    }
  };

  const handleStartPicking = async (orderId) => {
    const toastId = toast.loading("מעביר לליקוט...");
    try {
        const order = contextOrders.find(o => o.id === orderId); // Use contextOrders to find
        if (!order) {
            throw new Error("הזמנה לא נמצאה");
        }

        await updateOrder(orderId, { // Use context's updateOrder
            status: "בליקוט",
            picking_status: "לא_התחיל",
            picking_started_date: new Date().toISOString()
        });
        
        // טריגר אוטומטי להתראות - הזמנה עברה לליקוט
        try {
          await triggerNotificationsFromOrder({ 
            orderId: orderId, 
            triggerType: 'picking_started' 
          });
          console.log('Notifications triggered for picking started:', orderId);
        } catch (notificationError) {
          console.error('Error triggering notifications for picking started:', notificationError);
          // לא נעצור את התהליך בגלל שגיאת התראות
        }
        
        toast.success("ההזמנה הועברה לליקוט!", { id: toastId });
        // No explicit loadOrders needed, context handles state update
    } catch (error) {
        console.error("Error starting picking:", error);
        toast.error(`שגיאה בהעברת ההזמנה לליקוט: ${error.message}`, { id: toastId });
    }
  };

  const handleCheckEmails = async () => {
    if (isCheckingEmails) {
      toast.warning("בדיקת מיילים כבר מתבצעת, אנא המתן...");
      return;
    }

    setIsCheckingEmails(true);
    const toastId = toast.loading("בודק מיילים חדשים, אנא המתן...");
    try {
      const dateFrom = emailDateRange?.from ? format(emailDateRange.from, "yyyy-MM-dd") : null;
      const dateTo = emailDateRange?.to ? format(emailDateRange.to, "yyyy-MM-dd") : dateFrom;

      if (!dateFrom) {
        toast.error("יש לבחור טווח תאריכים.", { id: toastId });
        return;
      }

      const result = await checkEmails({ dateFrom, dateTo });
      
      if (result?.data?.rateLimited) {
        toast.error("יותר מדי בקשות - נסה שוב בעוד כמה דקות", { 
          id: toastId, 
          duration: 8000 
        });
        return;
      }

      const createdCount = result?.data?.ordersCreated || 0;
      if (createdCount > 0) {
        toast.success(`נמצאו ונוצרו ${createdCount} הזמנות חדשות!`, { id: toastId, duration: 5000 });
        await cleanupDuplicateOrders(); // This function now calls refreshOrders if duplicates were deleted
        await refreshOrders(); // Explicitly refresh global state to show new orders
      } else {
        toast.info("לא נמצאו הזמנות חדשות במיילים.", { id: toastId, duration: 3000 });
      }
    } catch (error) {
      console.error("Error checking emails:", error);
      
      if (error.response?.status === 429 || error.message?.includes('429')) {
        toast.error("יותר מדי בקשות - נסה שוב בעוד כמה דקות", { 
          id: toastId, 
          duration: 8000 
        });
      } else if (error.response?.status && error.response.status >= 500) {
        toast.error("שגיאת שרת - נסה שוב מאוחר יותר", { id: toastId });
      } else {
        toast.error("שגיאה בבדיקת המיילים - נסה שוב", { id: toastId });
      }
    } finally {
      setIsCheckingEmails(false);
      setShowDatePicker(false);
    }
  };

  const handleManualRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refreshOrders(); // Trigger global refresh
      toast.success("הנתונים עודכנו!");
    } catch (error) {
      console.error("Error during manual refresh:", error);
      toast.error("שגיאה בריענון הנתונים.");
    } finally {
      setIsRefreshing(false);
    }
  }, [refreshOrders]);

  const safeFormatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = parseISO(dateString);
      return format(date, "dd/MM/yyyy", { locale: he });
    } catch (e) {
      const d = new Date(dateString);
      if (d instanceof Date && !isNaN(d)) {
        return format(d, "dd/MM/yyyy", { locale: he });
      }
      return '';
    }
  };
  
  const filteredOrders = useMemo(() => {
    let currentFiltered = orders.filter(order => { // Use local 'orders' state (which is already active orders from context)
      const statusMatch = filters.status === 'all' || order.status === filters.status;
      const supplierMatch = filters.supplier === 'all' || order.supplier === filters.supplier;
      const searchMatch = !filters.searchTerm || 
                          (order.supplier && order.supplier.toLowerCase().includes(filters.searchTerm.toLowerCase())) ||
                          (order.order_number && order.order_number.includes(filters.searchTerm));
      return statusMatch && supplierMatch && searchMatch;
    });

    currentFiltered.sort((a, b) => {
      const dateA = new Date(a.email_received_date || a.created_date);
      const dateB = new Date(b.email_received_date || b.created_date);
      
      if (filters.sortOrder === 'oldest') {
        return dateA.getTime() - dateB.getTime();
      } else {
        return dateB.getTime() - dateA.getTime();
      }
    });

    return currentFiltered;
  }, [orders, filters]); // Depends on local 'orders' state and filters

  return (
    <div className="p-2 sm:p-4 md:p-6 lg:p-8 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header - Mobile Optimized */}
        <div className="flex flex-col gap-4 mb-6 sm:mb-8">
          <div className="flex justify-between items-center">
            <div className="text-center sm:text-right">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-1 sm:mb-2">
                ניהול הזמנות
              </h1>
              <p className="text-sm sm:text-lg text-gray-600">עקוב וטפל בכל ההזמנות שלך במקום אחד</p>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={handleManualRefresh} variant="outline" size="icon" className="bg-white elegant-shadow" disabled={isRefreshing}>
                <RefreshCw className={`w-5 h-5 ml-auto text-gray-600 ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
          
          {/* Mobile First Controls */}
          <div className="space-y-3">
            {/* Search Bar - Full Width on Mobile */}
            <div className="w-full">
              <GlobalSearch onSearch={(term) => setFilters(prev => ({ ...prev, searchTerm: term }))} />
            </div>
            
            {/* Action Buttons - Stacked on Mobile */}
            <div className="flex flex-col sm:flex-row gap-2">
              <Popover open={showDatePicker} onOpenChange={setShowDatePicker}>
                  <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full sm:w-auto bg-white hover:bg-gray-50 border-gray-200 elegant-shadow text-sm"
                        disabled={isCheckingEmails}
                      >
                        <Package className="w-4 h-4 ml-2" />
                        בדיקת מיילים
                      </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-screen max-w-sm mx-2 p-0" align="center">
                      <Calendar
                          mode="range"
                          selected={emailDateRange}
                          onSelect={setEmailDateRange}
                          initialFocus
                          locale={he}
                          dir="rtl"
                          numberOfMonths={1}
                          className="text-sm"
                      />
                      <div className="p-3 border-t">
                          <Button 
                              onClick={handleCheckEmails} 
                              className="w-full text-sm" 
                              disabled={isCheckingEmails || !emailDateRange?.from}
                              size="sm"
                          >
                              {isCheckingEmails ? "בודק..." : "בדוק טווח תאריכים"}
                          </Button>
                      </div>
                  </PopoverContent>
              </Popover>

              <Link to={createPageUrl("ScanOrder")} className="w-full sm:w-auto">
                <Button className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 elegant-shadow text-sm">
                  <Plus className="w-4 h-4 ml-2" />
                  הזמנה ידנית
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Cards - Mobile Optimized */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
            <StatsCards
                title="סה״כ הזמנות"
                value={stats.total}
                icon={Package}
                bgColor="bg-blue-500"
            />
            <StatsCards
                title="הזמנות בתהליך"
                value={stats.pending}
                icon={Package}
                bgColor="bg-orange-500"
            />
            <StatsCards
                title="מוכן למשלוח/איסוף"
                value={stats.ready || 0}
                icon={Package}
                bgColor="bg-purple-500"
            />
            <StatsCards
                title="הזמנות שנשלחו"
                value={stats.shipped}
                icon={Package}
                bgColor="bg-green-500"
            />
        </div>
        
        {/* Orders List Card - Mobile Optimized */}
        <Card className="elegant-shadow-lg border-none bg-white/80 backdrop-blur-sm">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-lg sm:text-xl">רשימת הזמנות</CardTitle>
            <OrderFilters
              orders={orders} // Pass local 'orders' for supplier list in filters
              onFilterChange={setFilters}
            />
          </CardHeader>
          <CardContent className="p-0 sm:p-6 sm:pt-0">
            <OrdersList
              orders={filteredOrders}
              isLoading={ordersLoading} // Use global ordersLoading from context
              onRefresh={handleManualRefresh}
              onArchiveOrder={handleArchiveOrder}
              onStartPicking={handleStartPicking}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
