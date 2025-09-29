
import React, { useState, useEffect, useCallback } from "react";
import { Order } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Store, CalendarDays, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";
import { format, parseISO, isToday } from "date-fns";
import { he } from "date-fns/locale";
import { createPageUrl } from "@/utils";
import { useNavigate } from "react-router-dom";
import PickupSummary from "../components/pickups/PickupSummary";
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
import { processOverduePickups } from "@/api/functions";

const courierIcons = {
  "ציטה": "🐆",
  "דוד": "🚚",
  "עצמאי": "🚶‍♂️"
};

export default function PickupsPage() {
  const {
    orders: allOrders,
    isLoading: ordersLoading,
    refreshOrders
  } = useOrders();

  const [groupedOrders, setGroupedOrders] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isProcessingOverduePickups, setIsProcessingOverduePickups] = useState(false);
  const [expandedDate, setExpandedDate] = useState(null);
  const navigate = useNavigate();

  const loadPickups = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setIsLoading(true);
    setIsRefreshing(true);
    try {
      if (isRefresh) {
        await refreshOrders();
      }

      const activePickups = allOrders.filter(order =>
        order.status === "ממתין לאיסוף" &&
        order.shipping_method_chosen === "איסוף_עצמי"
      );

      const grouped = activePickups.reduce((acc, order) => {
        const dateKey = order.pickup_preferred_date ? format(new Date(order.pickup_preferred_date), 'yyyy-MM-dd') : "ללא תאריך יעד";
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
    } catch (error) {
      console.error("Error loading orders for pickup:", error);
      toast.error("שגיאה בטעינת הזמנות לאיסוף");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [allOrders, refreshOrders]);

  useEffect(() => {
    // Only run loadPickups once global orders are not loading and are available
    if (!ordersLoading) {
      loadPickups();
    }
  }, [allOrders, ordersLoading, loadPickups]);

  const handleRefresh = async () => {
    toast.info("מרענן נתונים...");
    await loadPickups(true); // Pass true to indicate a refresh
    toast.success("הנתונים עודכנו!");
  };

  const handleProcessOverduePickups = async () => {
    if (isProcessingOverduePickups) {
      toast.warning("כבר מעבד איסופים באיחור, אנא המתן...");
      return;
    }

    setIsProcessingOverduePickups(true);
    const toastId = toast.loading("🏪 בודק ומעבד איסופים באיחור...");

    try {
      console.log('🔄 הפעלת פונקציית עיבוד איסופים באיחור');

      const response = await processOverduePickups({});

      if (response?.data) {
        const result = response.data;

        if (result.success) {
          const updatedCount = result.updatedCount || 0;

          if (updatedCount > 0) {
            toast.success(
              `✅ ${updatedCount} איסופים הועברו למחרת!`,
              {
                id: toastId,
                duration: 8000,
                description: result.updatedOrders ?
                  `הועברו ${result.updatedOrders.length} איסופים ליום הבא בשעה 12:00` :
                  'כל האיסופים באיחור הועברו ליום למחרת בשעה 12:00'
              }
            );

            if (result.updatedOrders && result.updatedOrders.length > 0) {
              console.log('📋 איסופים שהועברו:', result.updatedOrders);
              const ordersList = result.updatedOrders
                .slice(0, 5)
                .map(order => `• ${order.orderNumber} (${order.originalDate} → ${order.newDate})`)
                .join('\n');

              if (result.updatedOrders.length > 5) {
                toast.info(
                  `דוגמאות איסופים שהועברו:\n${ordersList}\n...ועוד ${result.updatedOrders.length - 5}`,
                  { duration: 10000 }
                );
              } else {
                toast.info(`איסופים שהועברו:\n${ordersList}`, { duration: 8000 });
              }
            }

          } else {
            toast.success(
              "✓ כל האיסופים בזמן!",
              {
                id: toastId,
                duration: 4000,
                description: `נבדקו ${result.totalChecked || 0} איסופים - כולם מתוזמנים כראוי`
              }
            );
          }

          console.log('🔄 מרענן תצוגת איסופים אחרי עיבוד');
          setTimeout(async () => {
            try {
              await loadPickups(true);
              console.log('✅ תצוגת איסופים רוענה בהצלחה');
            } catch (refreshError) {
              console.error('❌ שגיאה ברענון תצוגה:', refreshError);
              toast.warning("האיסופים עובדו אך יש בעיה ברענון התצוגה - רענן את הדף");
            }
          }, 2000);

        } else {
          throw new Error(result.message || 'שגיאה לא ידועה בעיבוד איסופים');
        }
      } else {
        throw new Error('לא התקבלה תגובה מהשרת');
      }

    } catch (error) {
      console.error('❌ שגיאה בעיבוד איסופים באיחור:', error);

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
      setIsProcessingOverduePickups(false);
    }
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

  return (
    <div className="p-4 md:p-6 lg:p-8 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-6">
          <div className="flex items-center gap-4">
            <Store className="w-8 h-8 text-purple-600" />
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">איסופים</h1>
              <p className="text-gray-600 text-lg mt-1">ניהול הזמנות לאיסוף עצמי</p>
            </div>
          </div>
          <div className="flex items-center gap-4 w-full lg:w-auto">
            <Button
              onClick={handleProcessOverduePickups}
              disabled={isProcessingOverduePickups}
              className="bg-purple-600 hover:bg-purple-700 text-white font-medium px-4 py-2 elegant-shadow"
              size="default"
            >
              {isProcessingOverduePickups ? (
                <>
                  <RefreshCw className="w-4 h-4 ml-2 animate-spin" />
                  בודק...
                </>
              ) : (
                <>
                  <Store className="w-4 h-4 ml-2" />
                  בדוק איסופים עכשיו
                </>
              )}
            </Button>

            <Button onClick={handleRefresh} variant="outline" size="icon" className="bg-white elegant-shadow" disabled={isRefreshing}>
              <RefreshCw className={`w-5 h-5 text-gray-600 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
            <div className="w-full lg:w-80">
              <GlobalSearch />
            </div>
          </div>
        </div>

        {isLoading || ordersLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : Object.keys(groupedOrders).length === 0 ? (
          <Card className="border-none elegant-shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-12 text-center">
              <Store className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">אין איסופים ממתינים</h3>
              <p className="text-gray-500">כל ההזמנות לאיסוף עצמי טופלו.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedOrders).map(([dateStr, orders]) => {
              const isExpanded = expandedDate === dateStr;
              const isCurrentDay = dateStr !== "ללא תאריך יעד" && isToday(new Date(dateStr));
              return (
                <Card key={dateStr} className="border-none elegant-shadow-lg bg-white/90 backdrop-blur-sm">
                  <CardHeader
                    className={`rounded-t-xl cursor-pointer ${isCurrentDay ? 'bg-green-100' : 'bg-purple-100'}`}
                    onClick={() => toggleExpand(dateStr)}
                  >
                    <div className="flex justify-between items-center">
                      <CardTitle className={`flex items-center gap-3 text-xl ${isCurrentDay ? 'text-green-800' : 'text-purple-800'}`}>
                        <CalendarDays className="w-6 h-6" />
                        איסופים ליום {safeFormatDate(dateStr)}
                      </CardTitle>
                      <div className="flex items-center gap-4">
                        <Badge variant="secondary" className="text-base">{orders.length} הזמנות</Badge>
                        {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-600" /> : <ChevronDown className="w-5 h-5 text-gray-600" />}
                      </div>
                    </div>
                  </CardHeader>
                  {isExpanded && (
                    <CardContent className="p-4 md:p-6">
                      <PickupSummary orders={orders} onUpdate={loadPickups} />
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
