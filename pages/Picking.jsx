
import React, { useState, useEffect, useCallback } from "react";
import { Order } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, Clock, CheckCircle, AlertCircle, Eye, Play, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { toast } from "sonner";
import { User } from '@/api/entities';
import { getUserRole } from '@/components/utils/rolePermissions';
import { useOrders } from '@/components/contexts/OrderContext';

import PickingOrderCard from "../components/picking/PickingOrderCard";
import GlobalSearch from '../components/common/GlobalSearch';

export default function PickingPage() {
  const { 
    orders: allOrders, 
    isLoading: ordersLoading,
    refreshOrders 
  } = useOrders();

  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const loadOrders = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setIsLoading(true);
    setIsRefreshing(true);
    try {
      if (isRefresh) {
        await refreshOrders();
      }
      // Additional filter to ensure we only show active orders (not archived)
      // and preserve the existing filter for order_type
      const activePickingOrders = allOrders.filter(order =>
        order.status === "בליקוט" &&
        order.order_type !== 'הזמנה_לאופות'
      );
      setOrders(activePickingOrders);
    } catch (error) {
      console.error("Error loading picking orders:", error);
      toast.error("שגיאה בטעינת הזמנות לליקוט");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [allOrders, refreshOrders]);

  useEffect(() => {
    if (!ordersLoading) {
      loadOrders();
    }
    loadCurrentUser();
  }, [allOrders, ordersLoading, loadOrders]);

  const loadCurrentUser = async () => {
    try {
      const user = await User.me();
      setCurrentUser(user);
    } catch (error) {
      console.error("Error loading current user:", error);
    }
  };

  const handleRefresh = async () => {
    toast.info("מרענן נתונים...");
    await loadOrders(true);
    toast.success("הנתונים עודכנו!");
  };

  const safeFormatDate = (dateString) => {
    if (!dateString) return '---';
    const date = new Date(dateString);
    if (date instanceof Date && !isNaN(date)) {
      return format(date, "dd/MM/yyyy HH:mm", { locale: he });
    }
    return '---';
  };

  const filteredOrders = orders.filter(order => {
    if (filter === "all") return true;
    return order.picking_status === filter;
  });

  const getStatusBadge = (pickingStatus) => {
    const statusConfig = {
      "לא_התחיל": { color: "bg-yellow-100 text-yellow-800", text: "לא התחיל", icon: Clock },
      "בתהליך": { color: "bg-blue-100 text-blue-800", text: "בתהליך", icon: Play },
      "הושלם": { color: "bg-green-100 text-green-800", text: "הושלם", icon: CheckCircle }
    };
    
    const config = statusConfig[pickingStatus] || statusConfig["לא_התחיל"];
    const Icon = config.icon;
    
    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {config.text}
      </Badge>
    );
  };

  const getNavigationPage = () => {
    if (!currentUser) return "Home";
    
    const userRole = getUserRole(currentUser);
    
    switch (userRole) {
      case "picker":
        return "ScanOrder";
      case "baker":
        return "Bakers";
      case "admin":
      case "store_manager":
      default:
        return "Home";
    }
  };

  const getNavigationButtonText = () => {
    if (!currentUser) return "חזור לדף הבית";
    
    const userRole = getUserRole(currentUser);
    
    switch (userRole) {
      case "picker":
        return "עבור לסריקת הזמנות";
      case "baker":
        return "עבור לדף אופות";
      case "admin":
      case "store_manager":
      default:
        return "חזור לדף הבית";
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header - Mobile Optimized */}
        <div className="flex justify-between items-center mb-6 sm:mb-8">
          <div className="text-right flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 truncate">
              דף ליקוטים
            </h1>
            <p className="text-sm sm:text-base text-gray-600">נהל את כל תהליכי הליקוט במחסן</p>
          </div>
          <Button onClick={handleRefresh} variant="outline" size="icon" className="bg-white elegant-shadow flex-shrink-0" disabled={isRefreshing}>
            <RefreshCw className={`w-5 h-5 text-gray-600 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
          
        {/* Mobile First Controls - FIXED */}
        <div className="space-y-4 mb-6 sm:mb-8">
          {/* Search Bar - Full Width on Mobile - FIXED */}
          <div className="w-full">
            <GlobalSearch />
          </div>
          
          {/* Filter Buttons - Mobile Layout - FIXED */}
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <Button
              variant={filter === "all" ? "default" : "outline"}
              onClick={() => setFilter("all")}
              className={`flex-1 min-w-0 text-xs sm:text-sm ${filter === "all" ? "bg-blue-600 text-white" : "bg-white border-gray-200 text-gray-700"}`}
              size="sm"
            >
              <span className="truncate">הכל ({orders.length})</span>
            </Button>
            <Button
              variant={filter === "לא_התחיל" ? "default" : "outline"}
              onClick={() => setFilter("לא_התחיל")}
              className={`flex-1 min-w-0 text-xs sm:text-sm ${filter === "לא_התחיל" ? "bg-orange-600 text-white" : "bg-white border-gray-200 text-gray-700"}`}
              size="sm"
            >
              <span className="truncate">לא התחיל ({orders.filter(o => o.picking_status === "לא_התחיל").length})</span>
            </Button>
            <Button
              variant={filter === "בתהליך" ? "default" : "outline"}
              onClick={() => setFilter("בתהליך")}
              className={`flex-1 min-w-0 text-xs sm:text-sm ${filter === "בתהליך" ? "bg-blue-600 text-white" : "bg-white border-gray-200 text-gray-700"}`}
              size="sm"
            >
              <span className="truncate">בתהליך ({orders.filter(o => o.picking_status === "בתהליך").length})</span>
            </Button>
          </div>
        </div>

        <div className="space-y-4 sm:space-y-6">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredOrders.length === 0 ? (
            <Card className="border-none elegant-shadow-lg bg-white/80 backdrop-blur-sm">
              <CardContent className="p-8 sm:p-12 text-center">
                <Package className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">אין הזמנות בליקוט</h3>
                <p className="text-sm sm:text-base text-gray-500 mb-4 sm:mb-6">כל ההזמנות נמצאות בדפים אחרים או שלא התחיל עדיין ליקוט</p>
                <Link to={createPageUrl(getNavigationPage())}>
                  <Button variant="outline" size="sm">
                    {getNavigationButtonText()}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            filteredOrders.map((order) => (
              <div key={order.id} data-order-id={order.id}>
                <PickingOrderCard
                  order={order}
                  onUpdate={loadOrders}
                />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
