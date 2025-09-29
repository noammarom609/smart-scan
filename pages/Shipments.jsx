
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Order } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Truck, CalendarDays, Download, RefreshCw, ChevronDown, ChevronUp, Eye, Send, MapPin } from "lucide-react";
import { format, parseISO, isToday } from "date-fns";
import { he } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import ShipmentSummary from "../components/shipments/ShipmentSummary";
import CourierTable from "../components/shipments/CourierTable";
import { toast } from "sonner";
import GlobalSearch from '../components/common/GlobalSearch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useOrders } from '@/components/contexts/OrderContext';
import { processOverdueDelivery } from "@/api/functions";

const courierIcons = {
  "ציטה": "🐆",
  "דוד": "🚚",
  "עצמאי": "🚶‍♂️"
};

export default function ShipmentsPage() {
  const {
    orders: allOrders,
    isLoading: ordersLoading,
    updateOrder,
    refreshOrders
  } = useOrders();

  const [groupedOrders, setGroupedOrders] = useState({});
  const [isLoading, setIsLoading] = useState(true); // This tracks the page's overall loading state
  const [isRefreshing, setIsRefreshing] = useState(false); // This tracks explicit refresh actions
  const [selectedCourierForTable, setSelectedCourierForTable] = useState(null);
  const [expandedDate, setExpandedDate] = useState(null);
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isProcessingOverdue, setIsProcessingOverdue] = useState(false);
  const navigate = useNavigate();

  const loadOrders = useCallback(async (isRefresh = false) => {
    // If global orders are still loading, mark page as loading and wait.
    if (!isRefresh && ordersLoading) {
      setIsLoading(true);
      return;
    }
    // For initial load or if global orders just finished loading, set page loading state.
    // If it's a refresh, we'll use isRefreshing to show indicator.
    if (!isRefresh) setIsLoading(true);
    setIsRefreshing(true);

    try {
      if (isRefresh) {
        await refreshOrders(); // Trigger global context to refresh orders
      }

      // Filter to include ONLY orders waiting for shipment pickup
      // and sort by shipment_due_date descending
      // We are now filtering from the `allOrders` provided by the context
      const activeShipments = allOrders.filter(order =>
        order.status === "ממתין למשלוח" &&
        order.shipping_method_chosen === "משלוח"
      );

      // Group these orders by date for the existing date-grouped section
      const grouped = activeShipments.reduce((acc, order) => {
        const dateKey = order.shipment_due_date ? format(new Date(order.shipment_due_date), 'yyyy-MM-dd') : "ללא תאריך יעד";
        if (!acc[dateKey]) {
          acc[dateKey] = [];
        }
        acc[dateKey].push(order);
        return acc;
      }, {});

      const sortedDates = Object.keys(grouped).sort((a, b) => {
        if (a === "ללא תאריך יעד") return 1;
        if (b === "ללא תאריך יעד") return -1;
        return new Date(a) - new Date(b);
      });

      const sortedGroupedOrders = {};
      for (const date of sortedDates) {
        sortedGroupedOrders[date] = grouped[date];
      }

      setGroupedOrders(sortedGroupedOrders);

      // Expand the first date group by default upon initial load if not already expanded
      if (sortedDates.length > 0 && expandedDate === null) {
        setExpandedDate(sortedDates[0]);
      }

    } catch (error) {
      console.error("Error loading shipment orders:", error);
      toast.error("שגיאה בטעינת משלוחים.");
    } finally {
      setIsLoading(false); // Page specific loading done
      setIsRefreshing(false); // Refresh action done
    }
  }, [allOrders, refreshOrders, expandedDate, ordersLoading]); // Dependencies include allOrders and ordersLoading from context

  useEffect(() => {
    // Only call loadOrders once global orders are no longer loading
    // and whenever allOrders or ordersLoading status changes.
    if (!ordersLoading) {
      loadOrders();
    }
  }, [allOrders, ordersLoading, loadOrders]); // Trigger loadOrders when allOrders or ordersLoading changes

  const handleRefresh = async () => {
    toast.info("מרענן נתונים...");
    await loadOrders(true); // Pass true to indicate a refresh
    toast.success("הנתונים עודכנו!");
  };

  // *** פונקציה חדשה לטיפול במשלוחים באיחור ***
  const handleProcessOverdueDeliveries = async () => {
    if (isProcessingOverdue) {
      toast.warning("כבר מעבד משלוחים באיחור, אנא המתן...");
      return;
    }

    setIsProcessingOverdue(true);
    const toastId = toast.loading("🚚 בודק ומעבד משלוחים באיחור...");
    
    try {
      console.log('🔄 הפעלת פונקציית עיבוד משלוחים באיחור');
      
      const response = await processOverdueDelivery({});
      
      if (response?.data) {
        const result = response.data;
        
        if (result.success) {
          const updatedCount = result.updatedCount || 0;
          
          if (updatedCount > 0) {
            // הועברו משלוחים - הצגת פירוט
            toast.success(
              `✅ ${updatedCount} משלוחים הועברו למחרת!`, 
              {
                id: toastId,
                duration: 8000,
                description: result.details ? 
                  `${result.details}\n📅 ${result.dateRange || ''}` : 
                  'כל המשלוחים באיחור הועברו ליום למחרת בשעה 12:00'
              }
            );
            
            // הצגת פירוט המשלוחים שהועברו
            if (result.updatedOrders && result.updatedOrders.length > 0) {
              console.log('📋 משלוחים שהועברו:', result.updatedOrders);
              const ordersList = result.updatedOrders
                .slice(0, 5) // הצגת עד 5 הראשונים
                .map(order => `• ${order.customerName} (${order.delayDays} ימי איחור)`)
                .join('\n');
              
              if (result.updatedOrders.length > 5) {
                toast.info(
                  `דוגמאות משלוחים שהועברו:\n${ordersList}\n...ועוד ${result.updatedOrders.length - 5}`,
                  { duration: 10000 }
                );
              } else {
                toast.info(`משלוחים שהועברו:\n${ordersList}`, { duration: 8000 });
              }
            }
            
          } else {
            // לא היו משלוחים באיחור
            toast.success(
              "✓ כל המשלוחים בזמן!", 
              {
                id: toastId,
                duration: 4000,
                description: `נבדקו ${result.totalChecked || 0} משלוחים - כולם מתוזמנים כראוי`
              }
            );
          }
          
          // *** רענון התצוגה אחרי עיבוד משלוחים ***
          console.log('🔄 מרענן תצוגת משלוחים אחרי עיבוד');
          setTimeout(async () => {
            try {
              await loadOrders(true); // רענון עם דגל
              console.log('✅ תצוגת משלוחים רוענה בהצלחה');
            } catch (refreshError) {
              console.error('❌ שגיאה ברענון תצוגה:', refreshError);
              toast.warning("המשלוחים עובדו אך יש בעיה ברענון התצוגה - רענן את הדף");
            }
          }, 2000);
          
        } else {
          throw new Error(result.message || 'שגיאה לא ידועה בעיבוד משלוחים');
        }
      } else {
        throw new Error('לא התקבלה תגובה מהשרת');
      }
      
    } catch (error) {
      console.error('❌ שגיאה בעיבוד משלוחים באיחור:', error);
      
      const errorMessage = error.response?.status === 500 ? 
        'שגיאת שרת - נסה שוב מאוחר יותר' :
        error.response?.status === 429 ?
        'יותר מדי בקשות - נסה שוב בעוד כמה דקות' :
        `שגיאה: ${error.message || 'בעיה לא ידועה'}`;
        
      toast.error(errorMessage, { 
        id: toastId, 
        duration: 6000,
        description: 'ניתן לנסות שוב או לרענן את הדף'
      });
      
    } finally {
      setIsProcessingOverdue(false);
    }
  };


  const printCourierTable = (courierName, orders) => {
    setSelectedCourierForTable({ courierName, orders });
  };

  const handlePrintTable = () => {
    if (selectedCourierForTable) {
      const printContent = document.getElementById('courier-table-print');
      if (printContent) {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
          <html>
            <head>
              <title>רשימת משלוחים - ${selectedCourierForTable.courierName}</title>
              <style>
                body { font-family: Arial, sans-serif; direction: rtl; margin: 20px; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 14px; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: right; }
                th { background-color: #f2f2f2; font-weight: bold; }
                tr:nth-child(even) { background-color: #f9f9f9; }
                h1 { text-align: center; color: #333; margin-bottom: 20px; }
                .summary { margin-top: 20px; text-align: center; }
              </style>
            </head>
            <body>
              <h1>רשימת משלוחים - ${selectedCourierForTable.courierName}</h1>
              ${printContent.innerHTML}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
        printWindow.onafterprint = () => printWindow.close();
      } else {
        toast.error("Error: Print content not found.");
      }
    }
  };

  const handleSendToWhatsApp = async () => {
    if (!selectedCourierForTable) {
      toast.error("לא נבחרה רשימת משלוחים לשליחה.");
      return;
    }

    setIsGeneratingLink(true);
    const toastId = toast.loading("מכין קישור לשליחה...");

    try {
      const orderIds = selectedCourierForTable.orders.map(o => o.id);
      const courierNameParam = encodeURIComponent(selectedCourierForTable.courierName);

      const pagePath = createPageUrl(`PublicShipmentList?ids=${orderIds.join(',')}&courierName=${courierNameParam}`);
      const publicListUrl = `${window.location.origin}${pagePath}`;

      const whatsappNumber = '972585240102'; // Placeholder for actual courier number if available
      const message = `היי, הנה רשימת המשלוחים שלך עבור ${selectedCourierForTable.courierName}:`;
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message + ' ' + publicListUrl)}`;

      window.open(whatsappUrl, '_blank');
      toast.success("נפתח חלון וואטסאפ עם קישור לרשימה.", { id: toastId });

    } catch (error) {
      console.error("Error creating WhatsApp link:", error);
      toast.error("שגיאה ביצירת קישור הוואטסאפ.", { id: toastId });
    } finally {
      setIsGeneratingLink(false);
    }
  };

  const handlePickedUp = async (orderId) => {
    const toastId = toast.loading("מסמן כנאסף...");
    try {
      await updateOrder(orderId, {
        status: "משלוח אצל השליח",
        shipped_date: new Date().toISOString()
      });

      toast.success("ההזמנה נאספה על ידי שליח!", { id: toastId });
    } catch (error) {
      console.error("Error updating order to picked up:", error);
      toast.error(`שגיאה בעדכון הסטטוס: ${error.message}`, { id: toastId });
    }
  };

  const getCourierGroups = (orders) => {
    return orders.reduce((acc, order) => {
      const courier = order.courier_company || "לא שויך";
      if (!acc[courier]) {
        acc[courier] = [];
      }
      acc[courier].push(order); // Fixed typo: couourier -> courier
      return acc;
    }, {});
  };

  const safeFormatDate = (dateString) => {
    if (!dateString || dateString === "ללא תאריך יעד") return "ללא תאריך יעד";
    try {
      return format(new Date(dateString), "EEEE, dd/MM/yyyy", { locale: he });
    } catch (error) {
      return dateString;
    }
  };

  const toggleExpand = (date) => {
    setExpandedDate(prev => prev === date ? null : date);
  };

  const handleViewOrder = (e, orderId) => {
    e.stopPropagation();
    navigate(createPageUrl(`OrderDetails?id=${orderId}`));
  };

  // Filtered orders for search
  const filteredGroupedOrders = useMemo(() => {
    if (!searchTerm) return groupedOrders;

    const filtered = {};
    Object.entries(groupedOrders).forEach(([date, orders]) => {
      const filteredOrders = orders.filter(order =>
        (order.customer_name && order.customer_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (order.shipping_name && order.shipping_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (order.order_number && order.order_number.toString().includes(searchTerm)) ||
        (order.shipping_address && order.shipping_address.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (order.shipping_city && order.shipping_city.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (order.courier_company && order.courier_company.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      if (filteredOrders.length > 0) {
        filtered[date] = filteredOrders;
      }
    });
    return filtered;
  }, [groupedOrders, searchTerm]);

  return (
    <div className="p-4 md:p-6 lg:p-8 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-6">
          <div className="flex items-center gap-4">
            <Truck className="w-8 h-8 text-orange-600" />
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">משלוחים</h1>
              <p className="text-gray-600 text-lg mt-1">ניהול הזמנות למשלוח</p>
            </div>
          </div>
          <div className="flex items-center gap-4 w-full lg:w-auto">
            {/* *** לחצן קדם משלוחים החדש *** */}
            <Button 
              onClick={handleProcessOverdueDeliveries} 
              disabled={isProcessingOverdue}
              className="bg-purple-600 hover:bg-purple-700 text-white font-medium px-4 py-2 elegant-shadow"
              size="default"
            >
              {isProcessingOverdue ? (
                <>
                  <RefreshCw className="w-4 h-4 ml-2 animate-spin" />
                  מעבד...
                </>
              ) : (
                <>
                  <Truck className="w-4 h-4 ml-2" />
                  קדם משלוחים
                </>
              )}
            </Button>
            
            <Button onClick={handleRefresh} variant="outline" size="icon" className="bg-white elegant-shadow" disabled={isRefreshing}>
              <RefreshCw className={`w-5 h-5 text-gray-600 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
            <div className="w-full lg:w-80">
              <GlobalSearch onSearch={setSearchTerm} />
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : Object.keys(filteredGroupedOrders).length === 0 && !searchTerm ? (
          <Card className="border-none elegant-shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-12 text-center">
              <Truck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">אין משלוחים ממתינים לאיסוף</h3>
              <p className="text-gray-500">כל ההזמנות למשלוח נאספו על ידי שליחים או שאין כאלה.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {Object.entries(filteredGroupedOrders).map(([dateStr, orders]) => {
              const isExpanded = expandedDate === dateStr;
              const courierGroups = getCourierGroups(orders);
              const isCurrentDay = isToday(new Date(parseISO(dateStr))); // Use parseISO for consistency
              return (
                <Card key={dateStr} className="border-none elegant-shadow-lg bg-white/90 backdrop-blur-sm">
                  <CardHeader
                    className={`rounded-t-xl cursor-pointer ${isCurrentDay ? 'bg-green-100' : 'bg-orange-100'}`}
                    onClick={() => toggleExpand(dateStr)}
                  >
                    <div className="flex justify-between items-center">
                      <CardTitle className={`flex items-center gap-3 text-xl ${isCurrentDay ? 'text-green-800' : 'text-orange-800'}`}>
                        <CalendarDays className="w-6 h-6" />
                        משלוחים ליום {safeFormatDate(dateStr)}
                      </CardTitle>
                      <div className="flex items-center gap-4">
                        <Badge variant="secondary" className="text-base">{orders.length} הזמנות</Badge>
                        {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-600" /> : <ChevronDown className="w-5 h-5 text-gray-600" />}
                      </div>
                    </div>
                  </CardHeader>
                  {isExpanded && (
                    <CardContent className="p-4 md:p-6 space-y-4">
                      {Object.entries(courierGroups).map(([courier, courierOrders]) => (
                        <div key={courier}>
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-bold text-lg flex items-center gap-2">
                              {courierIcons[courier] || '🚚'} {courier}
                              <Badge variant="outline">({courierOrders.length})</Badge>
                            </h4>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); printCourierTable(courier, courierOrders); }}>
                                  <Download className="w-4 h-4 ml-2" />
                                  הצג רשימה
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-4xl">
                                <DialogHeader>
                                  <DialogTitle>תצוגה מקדימה - {courier}</DialogTitle>
                                  <DialogDescription>
                                    זוהי תצוגה מקדימה של הרשימה. ניתן להדפיס או לשלוח לשליח.
                                  </DialogDescription>
                                </DialogHeader>
                                <div id="courier-table-print">
                                  <CourierTable orders={courierOrders} courierName={courier} />
                                </div>
                                <div className="flex justify-end gap-2 mt-4">
                                  <Button onClick={handlePrintTable} className="bg-blue-600 hover:bg-blue-700">
                                    הדפס
                                  </Button>
                                  <Button
                                    onClick={handleSendToWhatsApp}
                                    className="bg-green-600 hover:bg-green-700"
                                    disabled={isGeneratingLink}
                                  >
                                    {isGeneratingLink ? "מכין..." : (
                                      <>
                                        <Send className="w-4 h-4 ml-2" />
                                        שלח לשליח
                                      </>
                                    )}
                                  </Button>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>
                          <div className="border rounded-lg overflow-hidden">
                            <ShipmentSummary
                              orders={courierOrders}
                              onUpdate={loadOrders} // This will trigger a full re-evaluation of orders on the page.
                              onPickedUp={handlePickedUp}
                            />
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  )}
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  );
}
