
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertTriangle, Package, Truck, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import { toast } from "sonner";
import { useOrders } from '@/components/contexts/OrderContext';

export default function MissingItemsPage() {
  // Destructure from global context
  const { 
    orders: allOrders, 
    isLoading: ordersLoading, // Orders loading state from the context
    updateOrder,
    refreshOrders 
  } = useOrders();

  const [missingItems, setMissingItems] = useState([]);
  // State to track if the local processing of `missingItems` is ongoing
  const [isProcessingLocalMissingItems, setIsProcessingLocalMissingItems] = useState(true); 
  // State to track if an explicit refresh of the context orders is in progress
  const [isRefreshingOrders, setIsRefreshingOrders] = useState(false);

  // useCallback to memoize the item processing logic, triggered when allOrders changes
  const loadMissingItems = useCallback(() => {
    setIsProcessingLocalMissingItems(true); // Indicate local processing has started
    try {
      const itemsWithMissingStatus = [];
      
      allOrders.forEach(order => {
        if (order.items && Array.isArray(order.items)) {
          order.items.forEach((item, itemIndex) => {
            if (item.picking_status === "חסר_במלאי") {
              itemsWithMissingStatus.push({
                ...item,
                orderId: order.id,
                orderNumber: order.order_number,
                supplier: order.supplier,
                customerName: order.customer_name || order.shipping_name,
                orderDate: order.created_date,
                missingQuantity: item.quantity - (item.picked_quantity || 0),
                itemIndex: itemIndex // Store original item index for updating
              });
            }
          });
        }
      });

      setMissingItems(itemsWithMissingStatus);
    } catch (error) {
      console.error("Error processing missing items:", error);
      toast.error("שגיאה בעיבוד פריטים חסרים");
    } finally {
      setIsProcessingLocalMissingItems(false); // Indicate local processing has finished
    }
  }, [allOrders]); // Dependency: re-run when allOrders from context changes

  // Effect to trigger loadMissingItems when context orders are initially loaded or updated
  useEffect(() => {
    if (!ordersLoading) {
      loadMissingItems();
    }
  }, [ordersLoading, loadMissingItems]); // Dependencies: ordersLoading from context, and the memoized loadMissingItems

  // Derived state for orders that contain missing items, used for the second card
  const ordersWithMissingItems = useMemo(() => {
    return allOrders.filter(order => 
      order.items?.some(item => item.picking_status === "חסר_במלאי")
    );
  }, [allOrders]); // Re-calculate if allOrders from context changes

  const handleRefresh = async () => {
    toast.info("מרענן נתונים..."); // Info toast before starting refresh
    setIsRefreshingOrders(true); // Set local state to indicate refresh is ongoing
    try {
      await refreshOrders(); // Trigger the global refresh of orders from context
      toast.success("הנתונים עודכנו בהצלחה!"); // Success toast after global refresh
    } catch (error) {
      console.error("Error refreshing orders:", error);
      toast.error("שגיאה בריענון נתונים"); // Error toast if global refresh fails
    } finally {
      setIsRefreshingOrders(false); // Reset local refresh state
    }
  };

  const safeFormatDate = (dateString) => {
    if (!dateString) return '---';
    const date = new Date(dateString);
    if (date instanceof Date && !isNaN(date)) {
      return format(date, "dd/MM/yyyy", { locale: he });
    }
    return '---';
  };

  // Grouped missing items based on the 'missingItems' state
  const groupedMissingItems = missingItems.reduce((acc, item) => {
    const key = item.product_name || 'מוצר לא ידוע';
    if (!acc[key]) {
      acc[key] = {
        productName: key,
        totalMissing: 0,
        orders: []
      };
    }
    acc[key].totalMissing += item.missingQuantity;
    acc[key].orders.push(item);
    return acc;
  }, {});

  const handleMarkAsAvailable = async (orderId, itemIndex) => {
    const toastId = toast.loading("מעדכן סטטוס פריט...");
    try {
      const order = allOrders.find(o => o.id === orderId);
      if (!order || !order.items || !order.items[itemIndex]) {
        throw new Error("פריט לא נמצא");
      }

      // Create a deep copy of the items array to modify
      const updatedItems = [...order.items];
      updatedItems[itemIndex] = {
        ...updatedItems[itemIndex],
        picking_status: "יש_במלאי",
        picked_quantity: updatedItems[itemIndex].quantity // Assume all quantity is picked if marked as available
      };

      // Use the global updateOrder function from context to persist the change
      await updateOrder(orderId, { items: updatedItems });
      
      toast.success("הפריט עודכן לזמין במלאי!", { id: toastId });
      // The context will automatically refresh `allOrders` after `updateOrder`,
      // which will then trigger `loadMissingItems` via `useEffect` to re-process and update the page.
    } catch (error) {
      console.error("Error updating item status:", error);
      toast.error("שגיאה בעדכון סטטוס הפריט.", { id: toastId });
    }
  };

  // Overall loading state for the main content area
  const overallLoading = ordersLoading || isProcessingLocalMissingItems;

  return (
    <div className="p-6 lg:p-8 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-6">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
              דף חוסרים
            </h1>
            <p className="text-gray-600 text-lg">מוצרים שלא נמצאו במלאי בזמן הליקוט</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="icon"
              className="bg-white elegant-shadow"
              // Disable refresh button if orders are loading from context, local items are being processed, or a refresh is already in progress
              disabled={isRefreshingOrders || overallLoading}
            >
              <RefreshCw className={`w-5 h-5 text-gray-600 ${isRefreshingOrders ? 'animate-spin' : ''}`} />
            </Button>
            <div className="text-sm text-gray-600">
              סה"כ פריטים חסרים: <span className="font-bold text-red-600">{missingItems.length}</span>
            </div>
          </div>
        </div>

        {overallLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            <div className="grid lg:grid-cols-2 gap-6 mb-6">
              {/* סיכום חוסרים לפי מוצר */}
              <Card className="border-none elegant-shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Package className="w-6 h-6 text-red-600" />
                    חוסרים לפי מוצר
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {Object.keys(groupedMissingItems).length === 0 ? (
                    <div className="p-8 text-center">
                      <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">אין חוסרים במלאי כרגע</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gray-50/50">
                            <TableHead className="text-right font-semibold">שם מוצר</TableHead>
                            <TableHead className="text-right font-semibold">כמות חסרה</TableHead>
                            <TableHead className="text-right font-semibold">הזמנות מושפעות</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {Object.values(groupedMissingItems).map((group, index) => (
                            <TableRow key={index} className="hover:bg-red-50/30">
                              <TableCell className="font-medium">
                                {group.productName}
                              </TableCell>
                              <TableCell>
                                <Badge className="bg-red-100 text-red-800">
                                  {group.totalMissing} יחידות
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">
                                  {group.orders.length} הזמנות
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* הזמנות עם חוסרים */}
              <Card className="border-none elegant-shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <AlertTriangle className="w-6 h-6 text-orange-600" />
                    הזמנות מושפעות
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {ordersWithMissingItems.length === 0 ? (
                    <div className="p-8 text-center">
                      <Truck className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">אין הזמנות עם חוסרים</p>
                    </div>
                  ) : (
                    <div className="space-y-2 p-4">
                      {ordersWithMissingItems.map((order) => {
                        const missingCount = order.items?.filter(item =>
                          item.picking_status === "חסר_במלאי"
                        ).length || 0;

                        return (
                          <div
                            key={order.id}
                            className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-200"
                          >
                            <div>
                              <div className="font-semibold text-gray-900">
                                {order.supplier} - #{order.order_number}
                              </div>
                              <div className="text-sm text-gray-600">
                                {order.customer_name || order.shipping_name || 'לקוח לא ידוע'} | {safeFormatDate(order.created_date)}
                              </div>
                            </div>
                            <Badge className="bg-orange-100 text-orange-800">
                              {missingCount} פריטים חסרים
                            </Badge>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* טבלה מפורטת של כל החוסרים */}
            <Card className="border-none elegant-shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                  פירוט מלא של חוסרים
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {missingItems.length === 0 ? (
                  <div className="p-12 text-center">
                    <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">אין חוסרים במלאי</h3>
                    <p className="text-gray-500">כל המוצרים זמינים במלאי</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50/50">
                          <TableHead className="text-right font-semibold">מוצר</TableHead>
                          <TableHead className="text-right font-semibold">הזמנה</TableHead>
                          <TableHead className="text-right font-semibold">לקוח</TableHead>
                          <TableHead className="text-right font-semibold">כמות נדרשת</TableHead>
                          <TableHead className="text-right font-semibold">כמות שנלקטה</TableHead>
                          <TableHead className="text-right font-semibold">כמות חסרה</TableHead>
                          <TableHead className="text-right font-semibold">תאריך הזמנה</TableHead>
                          <TableHead className="text-right font-semibold">פעולות</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {missingItems.map((item, index) => (
                          <TableRow key={`${item.orderId}-${item.product_id}-${index}`} className="hover:bg-red-50/30">
                            <TableCell className="font-medium">
                              {item.product_name || 'מוצר לא ידוע'}
                            </TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">{item.supplier}</div>
                                <div className="text-sm text-gray-500 font-mono">
                                  #{item.orderNumber}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              {item.customerName || 'לקוח לא ידוע'}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {item.quantity}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className="bg-yellow-100 text-yellow-800">
                                {item.picked_quantity || 0}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className="bg-red-100 text-red-800">
                                {item.missingQuantity}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm text-gray-600">
                                {safeFormatDate(item.orderDate)}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleMarkAsAvailable(item.orderId, item.itemIndex)}
                                className="text-green-600 border-green-300 hover:bg-green-50"
                              >
                                סומן כזמין
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
