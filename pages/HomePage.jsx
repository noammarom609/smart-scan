
import { useEffect, useState, useCallback, useMemo } from "react";
import axios from "@/lib/axios";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { format, parseISO } from "date-fns";
import { he } from "date-fns/locale";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import OrdersList from "@/components/OrdersList";
import GlobalSearch from "@/components/GlobalSearch";
import {
  CalendarIcon,
  RefreshCw,
  Plus,
  Mail,
  ArrowRight,
  Archive,
  Truck,
  Package,
  CheckCircle,
  Clock,
  Download,
  AlertCircle,
} from "lucide-react";
import { DateRange } from "react-day-picker";
import { checkEmails } from "@/api/functions";
import { formatCSV } from "@/lib/csvUtils";
import { useAuth } from "@/contexts/AuthContext";
import createPageUrl from "@/utils/createPageUrl";
import useLocalStorage from "@/hooks/useLocalStorage";

export default function HomePage() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [isCheckingEmails, setIsCheckingEmails] = useState(false);
  const [dateRange, setDateRange] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [filters, setFilters] = useLocalStorage("order_filters", {
    searchTerm: "",
    status: "all",
  });
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth(); // Assuming useAuth provides user object

  const loadOrders = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get("/api/orders", {
        params: {
          startDate: dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : undefined,
          endDate: dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : undefined,
        },
      });
      setOrders(response.data);
    } catch (err) {
      console.error("Failed to load orders:", err);
      setError("Failed to load orders. Please try again.");
      toast.error("שגיאה בטעינת ההזמנות.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [dateRange]);

  const cleanupDuplicateOrders = useCallback(async () => {
    try {
      await axios.post("/api/orders/cleanup-duplicates");
      console.log("Duplicate orders cleaned up successfully.");
    } catch (err) {
      console.error("Failed to cleanup duplicate orders:", err);
    }
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadOrders();
    toast.success("רשימת הזמנות עודכנה!");
  };

  const handleArchiveOrder = async (orderId) => {
    const toastId = toast.loading("מעביר הזמנה לארכיון...");
    try {
      await axios.put(`/api/orders/${orderId}/archive`);
      await loadOrders();
      toast.success("הזמנה הועברה לארכיון בהצלחה!", { id: toastId });
    } catch (error) {
      console.error("Error archiving order:", error);
      toast.error(`שגיאה בהעברת הזמנה לארכיון: ${error.message}`, { id: toastId });
    }
  };

  const handleDeleteOrder = async (orderId) => {
    const toastId = toast.loading("מוחק הזמנה...");
    try {
      await axios.delete(`/api/orders/${orderId}`);
      await loadOrders();
      toast.success("הזמנה נמחקה בהצלחה!", { id: toastId });
    } catch (error) {
      console.error("Error deleting order:", error);
      toast.error(`שגיאה במחיקת הזמנה: ${error.message}`, { id: toastId });
    }
  };

  const handleStartPicking = async (orderId) => {
    const toastId = toast.loading("מעביר הזמנה לליקוט...");
    try {
      await axios.put(`/api/orders/${orderId}/start-picking`);
      await loadOrders();
      toast.success("הזמנה עברה לליקוט בהצלחה!", { id: toastId });
      navigate(createPageUrl(`picking/${orderId}`));
    } catch (error) {
      console.error("Error starting picking:", error);
      toast.error(`שגיאה בהעברת ההזמנה לליקוט: ${error.message}`, { id: toastId });
    }
  };

  const handleCheckEmails = async () => {
    setIsCheckingEmails(true);
    const toastId = toast.loading("בודק מיילים חדשים...");
    try {
      const { newOrdersCount, processedOrdersCount } = await checkEmails();
      toast.success(
        `סונכרנו ${processedOrdersCount} הזמנות, מתוכן ${newOrdersCount} חדשות.`,
        { id: toastId, duration: 5000 }
      );
      setShowDatePicker(false); // Close the popover after checking
      await loadOrders(); // Refresh orders after checking emails
    } catch (error) {
      console.error("Error checking emails:", error);
      toast.error(`שגיאה בבדיקת מיילים: ${error.message}`, { id: toastId });
    } finally {
      setIsCheckingEmails(false);
    }
  };

  const safeFormatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = parseISO(dateString);
      return format(date, "dd/MM/yyyy", { locale: he });
    } catch (e) {
      // Fallback for potentially non-ISO date strings
      const d = new Date(dateString);
      if (d instanceof Date && !isNaN(d)) {
        return format(d, "dd/MM/yyyy", { locale: he });
      }
      return '';
    }
  };

  const exportToCSV = async () => {
    try {
      const response = await axios.get("/api/orders/export", {
        params: {
          searchTerm: filters.searchTerm,
          status: filters.status,
          startDate: dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : undefined,
          endDate: dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : undefined,
        },
      });

      const ordersToExport = response.data.map((order) => ({
        "ID הזמנה": order.orderId,
        תאריך: safeFormatDate(order.orderDate),
        סטטוס: order.status,
        לקוח: order.customerName,
        טלפון: order.customerPhone,
        אימייל: order.customerEmail,
        כתובת: order.customerAddress,
        "סוג משלוח": order.shippingMethod,
        "עלות משלוח": order.shippingCost,
        "מחיר סופי": order.totalPrice,
        "פריטים": order.items.map((item) => `${item.name} (x${item.quantity})`).join("; "),
        הערות: order.notes,
        "תאריך עדכון": safeFormatDate(order.updatedAt),
        "תאריך יצירה": safeFormatDate(order.createdAt),
      }));

      const csvContent = formatCSV(ordersToExport);
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `orders_export_${format(new Date(), "yyyyMMdd_HHmm")}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("הייצוא ל-CSV הושלם!");
    } catch (error) {
      console.error("Error exporting orders:", error);
      toast.error("שגיאה בייצוא הזמנות ל-CSV.");
    }
  };

  useEffect(() => {
    loadOrders();
    cleanupDuplicateOrders(); // Clean up duplicates on initial load
  }, [loadOrders, cleanupDuplicateOrders]);

  const filteredOrders = useMemo(() => {
    if (isLoading) return []; // Don't filter if still loading initial data

    let currentOrders = orders;

    if (filters.searchTerm) {
      const lowerCaseSearchTerm = filters.searchTerm.toLowerCase();
      currentOrders = currentOrders.filter(
        (order) =>
          order.orderId.toLowerCase().includes(lowerCaseSearchTerm) ||
          order.customerName.toLowerCase().includes(lowerCaseSearchTerm) ||
          order.customerEmail.toLowerCase().includes(lowerCaseSearchTerm) ||
          order.customerPhone.toLowerCase().includes(lowerCaseSearchTerm) ||
          order.items.some((item) => item.name.toLowerCase().includes(lowerCaseSearchTerm))
      );
    }

    if (filters.status !== "all") {
      currentOrders = currentOrders.filter((order) => order.status === filters.status);
    }

    return currentOrders;
  }, [orders, filters, isLoading]);

  const getOrderStatusCount = useCallback(
    (status) => orders.filter((order) => order.status === status).length,
    [orders]
  );

  const stats = useMemo(() => [
    {
      title: "הזמנות ממתינות",
      count: getOrderStatusCount("pending"),
      icon: <Clock className="h-4 w-4 text-gray-500" />,
      description: "ממתינות לטיפול",
      color: "text-orange-500",
    },
    {
      title: "הזמנות בליקוט",
      count: getOrderStatusCount("picking"),
      icon: <Package className="h-4 w-4 text-gray-500" />,
      description: "כעת בליקוט",
      color: "text-blue-500",
    },
    {
      title: "הזמנות במשלוח",
      count: getOrderStatusCount("shipping"),
      icon: <Truck className="h-4 w-4 text-gray-500" />,
      description: "בדרך ללקוח",
      color: "text-purple-500",
    },
    {
      title: "הזמנות הושלמו",
      count: getOrderStatusCount("completed"),
      icon: <CheckCircle className="h-4 w-4 text-gray-500" />,
      description: "הסתיימו בהצלחה",
      color: "text-green-500",
    },
  ], [getOrderStatusCount]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header - Mobile Optimized */}
        <div className="flex flex-col gap-4 mb-6 sm:mb-8">
          <div className="flex justify-between items-center">
            <div className="text-right flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-1 sm:mb-2 truncate">
                ניהול הזמנות
              </h1>
              <p className="text-sm sm:text-base text-gray-600 truncate">עקוב וטפל בכל ההזמנות שלך במקום אחד</p>
            </div>
            <Button onClick={handleRefresh} variant="outline" size="icon" className="bg-white elegant-shadow flex-shrink-0" disabled={isRefreshing}>
              <RefreshCw className={`w-5 h-5 text-gray-600 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
          
          {/* Mobile First Controls */}
          <div className="space-y-3">
            {/* Search Bar - Full Width on Mobile */}
            <div className="w-full">
              <GlobalSearch onSearch={(term) => setFilters(prev => ({ ...prev, searchTerm: term }))} />
            </div>
            
            {/* Action Buttons - Stacked on Mobile */}
            <div className="grid grid-cols-1 sm:flex sm:flex-row gap-2">
              <Popover open={showDatePicker} onOpenChange={setShowDatePicker}>
                  <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full sm:w-auto bg-white hover:bg-gray-50 border-gray-200 elegant-shadow text-sm"
                        disabled={isCheckingEmails}
                      >
                        <Mail className="w-4 h-4 ml-2" />
                        בדיקת מיילים
                      </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-screen max-w-sm mx-2 p-0" align="center">
                    <div className="flex flex-col p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold text-lg">בדיקת מיילים</h4>
                        <Button
                          variant="ghost"
                          onClick={() => setDateRange(null)}
                          disabled={!dateRange?.from && !dateRange?.to}
                        >
                          נקה תאריכים
                        </Button>
                      </div>
                      <Calendar
                        initialFocus
                        mode="range"
                        selected={dateRange}
                        onSelect={setDateRange}
                        numberOfMonths={1}
                        locale={he}
                        defaultMonth={dateRange?.from || new Date()}
                        className="w-full flex justify-center"
                      />
                      <Button
                        onClick={handleCheckEmails}
                        className="mt-4 w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 elegant-shadow"
                        disabled={isCheckingEmails}
                      >
                        {isCheckingEmails ? "בודק..." : "בדוק מיילים"}
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
          {stats.map((stat, index) => (
            <Card key={index} className="elegant-shadow border-none">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                {stat.icon}
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${stat.color}`}>
                  {isLoading ? <div className="animate-pulse h-6 bg-gray-200 rounded w-1/2"></div> : stat.count}
                </div>
                <p className="text-xs text-gray-500">{stat.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Orders List Card - Mobile Optimized */}
        <Card className="elegant-shadow-lg border-none bg-white/80 backdrop-blur-sm">
          <CardHeader className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <CardTitle className="text-xl sm:text-2xl font-bold text-gray-800">רשימת הזמנות</CardTitle>
              <div className="flex flex-wrap gap-2 justify-end sm:justify-start w-full sm:w-auto">
                <Button
                  onClick={() => setFilters(prev => ({ ...prev, status: "all" }))}
                  variant={filters.status === "all" ? "default" : "outline"}
                  className={`text-sm ${filters.status === "all" ? "bg-blue-600 text-white" : "bg-white text-gray-700 hover:bg-gray-50 border-gray-200"} elegant-shadow`}
                >
                  הכל
                </Button>
                <Button
                  onClick={() => setFilters(prev => ({ ...prev, status: "pending" }))}
                  variant={filters.status === "pending" ? "default" : "outline"}
                  className={`text-sm ${filters.status === "pending" ? "bg-blue-600 text-white" : "bg-white text-gray-700 hover:bg-gray-50 border-gray-200"} elegant-shadow`}
                >
                  ממתינות
                </Button>
                <Button
                  onClick={() => setFilters(prev => ({ ...prev, status: "picking" }))}
                  variant={filters.status === "picking" ? "default" : "outline"}
                  className={`text-sm ${filters.status === "picking" ? "bg-blue-600 text-white" : "bg-white text-gray-700 hover:bg-gray-50 border-gray-200"} elegant-shadow`}
                >
                  בליקוט
                </Button>
                <Button
                  onClick={() => setFilters(prev => ({ ...prev, status: "shipping" }))}
                  variant={filters.status === "shipping" ? "default" : "outline"}
                  className={`text-sm ${filters.status === "shipping" ? "bg-blue-600 text-white" : "bg-white text-gray-700 hover:bg-gray-50 border-gray-200"} elegant-shadow`}
                >
                  במשלוח
                </Button>
                <Button
                  onClick={() => setFilters(prev => ({ ...prev, status: "completed" }))}
                  variant={filters.status === "completed" ? "default" : "outline"}
                  className={`text-sm ${filters.status === "completed" ? "bg-blue-600 text-white" : "bg-white text-gray-700 hover:bg-gray-50 border-gray-200"} elegant-shadow`}
                >
                  הושלמו
                </Button>
                <Button
                  onClick={exportToCSV}
                  variant="outline"
                  className="bg-white hover:bg-gray-50 border-gray-200 elegant-shadow text-sm"
                >
                  <Download className="h-4 w-4 ml-2" />
                  ייצוא CSV
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0 sm:p-2 md:p-6 md:pt-0">
            {error && (
              <div className="text-red-500 text-center py-4 flex items-center justify-center">
                <AlertCircle className="h-5 w-5 ml-2" />
                {error}
              </div>
            )}
            <OrdersList
              orders={filteredOrders}
              isLoading={isLoading}
              onRefresh={loadOrders}
              onArchiveOrder={handleArchiveOrder}
              onStartPicking={handleStartPicking}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
