import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Truck, Store, Package, Calendar, User, Eye, CheckCircle2, RefreshCw, ChevronUp, ChevronDown } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useOrders } from '@/components/contexts/OrderContext';
import { Order } from '@/api/entities';
import { toast } from "sonner";
import GlobalSearch from '../components/common/GlobalSearch';

const statusColors = {
  "ממתין לאיסוף": "bg-purple-100 text-purple-800 border-purple-200",
  "ממתין למשלוח": "bg-indigo-100 text-indigo-800 border-indigo-200",
  "משלוח אצל השליח": "bg-blue-100 text-blue-800 border-blue-200",
};

const actionTypeColors = {
  "איסוף": "bg-green-50 text-green-700",
  "משלוח": "bg-orange-50 text-orange-700"
};

export default function LogisticsOverviewPage() {
  const {
    orders: allOrders,
    isLoading: ordersLoading,
    refreshOrders
  } = useOrders();

  const [selectedFilter, setSelectedFilter] = useState('all'); 
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [sortColumn, setSortColumn] = useState('target_date'); 
  const [sortDirection, setSortDirection] = useState('asc'); 
  const navigate = useNavigate();

  // סינון ההזמנות הרלוונטיות
  const relevantOrders = useMemo(() => {
    if (!allOrders) return [];

    return allOrders.filter(order => {
      const isPickup = order.status === "ממתין לאיסוף" && order.shipping_method_chosen === "איסוף_עצמי";
      const isShipment = (order.status === "ממתין למשלוח" && order.shipping_method_chosen === "משלוח") || 
                        order.status === "משלוח אצל השליח";
      
      return isPickup || isShipment;
    });
  }, [allOrders]);

  // פונקציה למיון עם טיפול בערכים ריקים
  const sortOrders = (orders, column, direction) => {
    return [...orders].sort((a, b) => {
      let aValue, bValue;

      switch (column) {
        case 'order_number':
          aValue = a.order_number || '';
          bValue = b.order_number || '';
          break;
        case 'customer_name':
          aValue = a.customer_name || a.shipping_name || '';
          bValue = b.customer_name || b.shipping_name || '';
          break;
        case 'target_date':
          aValue = getTargetDate(a);
          bValue = getTargetDate(b);
          break;
        case 'action_type':
          aValue = getActionType(a);
          bValue = getActionType(b);
          break;
        case 'status':
          aValue = a.status || '';
          bValue = b.status || '';
          break;
        default:
          return 0;
      }

      // טיפול בערכים ריקים - תמיד למטה
      const aEmpty = !aValue || aValue === '' || aValue === '---';
      const bEmpty = !bValue || bValue === '' || bValue === '---';
      
      if (aEmpty && bEmpty) return 0;
      if (aEmpty) return 1; 
      if (bEmpty) return -1; 

      // מיון רגיל עבור ערכים שאינם ריקים
      if (column === 'target_date') {
        // מיון תאריכים
        const dateA = new Date(aValue);
        const dateB = new Date(bValue);
        // Ensure dates are valid for comparison
        if (isNaN(dateA.getTime()) && isNaN(dateB.getTime())) return 0;
        if (isNaN(dateA.getTime())) return 1;
        if (isNaN(dateB.getTime())) return -1;

        return direction === 'asc' ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime();
      } else {
        // מיון טקסט
        const comparison = aValue.toString().localeCompare(bValue.toString(), 'he');
        return direction === 'asc' ? comparison : -comparison;
      }
    });
  };

  // פונקציות עזר - צריכות להיות לפני השימוש בהן
  const getActionType = (order) => {
    if (order.shipping_method_chosen === "איסוף_עצמי") {
      return "איסוף";
    } else if (order.shipping_method_chosen === "משלוח") {
      return "משלוח";
    }
    return "לא ידוע";
  };

  const getTargetDate = (order) => {
    if (order.shipping_method_chosen === "איסוף_עצמי") {
      return order.pickup_preferred_date;
    } else {
      return order.shipment_due_date;
    }
  };

  // סינון ומיון משולב
  const filteredAndSortedOrders = useMemo(() => {
    let filtered;
    
    if (selectedFilter === 'pickups') {
      filtered = relevantOrders.filter(order => 
        order.status === "ממתין לאיסוף" && order.shipping_method_chosen === "איסוף_עצמי"
      );
    } else if (selectedFilter === 'shipments') {
      filtered = relevantOrders.filter(order => 
        (order.status === "ממתין למשלוח" && order.shipping_method_chosen === "משלוח") || 
        order.status === "משלוח אצל השליח"
      );
    } else {
      filtered = relevantOrders;
    }

    return sortOrders(filtered, sortColumn, sortDirection);
  }, [relevantOrders, selectedFilter, sortColumn, sortDirection]);

  // פונקציה להחלפת מיון
  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  // רכיב כותרת עמודה עם מיון
  const SortableHeader = ({ column, children }) => {
    const isSorted = sortColumn === column;
    const SortIcon = isSorted && sortDirection === 'asc' ? ChevronUp : ChevronDown;
    
    return (
      <TableHead 
        className="text-right font-semibold cursor-pointer hover:bg-gray-100 transition-colors select-none"
        onClick={() => handleSort(column)}
      >
        <div className="flex items-center justify-between">
          <span>{children}</span>
          <div className="flex items-center gap-1">
            {isSorted && <SortIcon className="w-4 h-4 text-blue-600" />}
            {!isSorted && <ChevronDown className="w-4 h-4 text-gray-300" />}
          </div>
        </div>
      </TableHead>
    );
  };

  // פונקציה לסימון נאסף
  const markAsPickedUp = async (orderId) => {
    const toastId = toast.loading("מעדכן לנאסף...");
    
    try {
      await Order.update(orderId, {
        status: "התקבל",
        delivered_date: new Date().toISOString(),
        delivery_status: "נמסרה"
      });
      
      toast.success("ההזמנה נאספה בהצלחה!", { id: toastId });
      
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      console.log('🔄 מתחיל רענון מלא אוטומטי...');
      await refreshOrders();
      console.log('✅ רענון מלא אוטומטי הושלם');
      
    } catch (error) {
      toast.error("שגיאה בעדכון הזמנה", { id: toastId });
      console.error("Error marking pickup:", error);
    }
  };

  // פונקציה לסימון נאסף על ידי שליח
  const markAsPickedUpByShipper = async (orderId) => {
    const toastId = toast.loading("מעדכן סטטוס לנאסף על ידי שליח...");
    
    try {
      await Order.update(orderId, {
        status: "משלוח אצל השליח",
        shipped_date: new Date().toISOString()
      });
      
      toast.success("ההזמנה נאספה ועברה לשליח!", { id: toastId });
      
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      console.log('🔄 מתחיל רענון מלא אוטומטי למשלוח...');
      await refreshOrders();
      console.log('✅ רענון מלא אוטומטי למשלוח הושלם');
      
    } catch (error) {
      toast.error("שגיאה בעדכון סטטוס משלוח", { id: toastId });
      console.error("Error marking shipment as picked up:", error);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshOrders();
      toast.success("הנתונים עודכנו!");
    } catch (error) {
      console.error("Error during manual refresh:", error);
      toast.error("שגיאה בריענון הנתונים.");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleViewOrder = (orderId) => {
    navigate(createPageUrl(`OrderDetails?id=${orderId}`));
  };

  const safeFormatDate = (dateString) => {
    if (!dateString) return '---';
    try {
      return format(new Date(dateString), "dd/MM/yyyy", { locale: he });
    } catch (error) {
      return '---';
    }
  };

  const canMarkAsPickedUp = (order) => {
    return order.shipping_method_chosen === "איסוף_עצמי" && 
           order.status === "ממתין לאיסוף";
  };

  const canMarkAsPickedUpByShipper = (order) => {
    return order.shipping_method_chosen === "משלוח" && 
           order.status === "ממתין למשלוח";
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-6">
          <div className="flex items-center gap-4">
            <Package className="w-8 h-8 text-indigo-600" />
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">משלוחים ואיסופים</h1>
              <p className="text-gray-600 text-lg mt-1">תצוגה מאוחדת לכל הפעילות הלוגיסטית</p>
            </div>
          </div>
          <div className="flex items-center gap-4 w-full lg:w-auto">
            <Button onClick={handleRefresh} variant="outline" size="icon" className="bg-white elegant-shadow" disabled={isRefreshing}>
              <RefreshCw className={`w-5 h-5 text-gray-600 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
            <div className="w-full lg:w-80">
              <GlobalSearch />
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Button
            variant={selectedFilter === 'all' ? 'default' : 'outline'}
            onClick={() => setSelectedFilter('all')}
            className="flex items-center gap-2"
          >
            <Package className="w-4 h-4" />
            הכל ({relevantOrders.length})
          </Button>
          <Button
            variant={selectedFilter === 'pickups' ? 'default' : 'outline'}
            onClick={() => setSelectedFilter('pickups')}
            className="flex items-center gap-2"
          >
            <Store className="w-4 h-4" />
            איסופים ({relevantOrders.filter(o => o.shipping_method_chosen === "איסוף_עצמי").length})
          </Button>
          <Button
            variant={selectedFilter === 'shipments' ? 'default' : 'outline'}
            onClick={() => setSelectedFilter('shipments')}
            className="flex items-center gap-2"
          >
            <Truck className="w-4 h-4" />
            משלוחים ({relevantOrders.filter(o => o.shipping_method_chosen === "משלוח" || o.status === "משלוח אצל השליח").length})
          </Button>
        </div>

        {/* Main Content */}
        <Card className="border-none elegant-shadow-lg bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Calendar className="w-6 h-6 text-indigo-600" />
              {selectedFilter === 'all' && 'כל ההזמנות הלוגיסטיות'}
              {selectedFilter === 'pickups' && 'איסופים עצמיים'}
              {selectedFilter === 'shipments' && 'משלוחים'}
              <Badge variant="secondary" className="text-base">
                {filteredAndSortedOrders.length} הזמנות
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {ordersLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : filteredAndSortedOrders.length === 0 ? (
              <div className="p-12 text-center">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {selectedFilter === 'pickups' && 'אין איסופים ממתינים'}
                  {selectedFilter === 'shipments' && 'אין משלוחים ממתינים'}
                  {selectedFilter === 'all' && 'אין הזמנות לוגיסטיות ממתינות'}
                </h3>
                <p className="text-gray-500">כל ההזמנות טופלו או שאין כאלה כרגע.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50/50 border-b border-gray-100">
                      <SortableHeader column="order_number">מספר הזמנה</SortableHeader>
                      <SortableHeader column="customer_name">לקוח</SortableHeader>
                      <SortableHeader column="target_date">תאריך יעד</SortableHeader>
                      <SortableHeader column="action_type">סוג פעולה</SortableHeader>
                      <SortableHeader column="status">סטטוס</SortableHeader>
                      <TableHead className="text-right font-semibold">פעולות</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAndSortedOrders.map((order) => (
                      <TableRow
                        key={order.id}
                        className="hover:bg-blue-50/30 transition-colors duration-200 border-b border-gray-50"
                      >
                        <TableCell>
                          <span className="font-mono text-sm font-medium">
                            #{order.order_number || '---'}
                          </span>
                        </TableCell>
                        
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
                              <User className="w-4 h-4 text-blue-700" />
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900">
                                {order.customer_name || order.shipping_name || 'לקוח לא ידוע'}
                              </div>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>
                          <span className="text-gray-600">
                            {safeFormatDate(getTargetDate(order))}
                          </span>
                        </TableCell>

                        <TableCell>
                          <Badge 
                            className={`${actionTypeColors[getActionType(order)]} border font-medium flex items-center gap-1 w-fit`}
                          >
                            {getActionType(order) === "איסוף" ? 
                              <Store className="w-3 h-3" /> : 
                              <Truck className="w-3 h-3" />
                            }
                            {getActionType(order)}
                          </Badge>
                        </TableCell>

                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={`${statusColors[order.status] || statusColors["ממתין למשלוח"]} border font-medium`}
                          >
                            {order.status}
                          </Badge>
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center gap-2">
                            {/* כפתור נאסף - רק עבור איסופים ממתינים */}
                            {canMarkAsPickedUp(order) && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => markAsPickedUp(order.id)}
                                className="text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700 flex items-center gap-1"
                              >
                                <CheckCircle2 className="w-3 h-3" />
                                נאסף
                              </Button>
                            )}

                            {/* כפתור נאסף על ידי שליח - רק עבור משלוחים ממתינים */}
                            {canMarkAsPickedUpByShipper(order) && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => markAsPickedUpByShipper(order.id)}
                                className="text-orange-600 border-orange-200 hover:bg-orange-50 hover:text-orange-700 flex items-center gap-1"
                              >
                                <Truck className="w-3 h-3" />
                                נאסף על ידי שליח
                              </Button>
                            )}
                            
                            {/* כפתור צפייה בפרטים */}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewOrder(order.id)}
                              className="text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-1"
                            >
                              <Eye className="w-3 h-3" />
                              פרטים
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}