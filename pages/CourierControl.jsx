
import React, { useState, useEffect, useCallback } from 'react';
import { Order } from '@/api/entities';
import { User } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"; // Added Dialog components
import {
  Truck,
  Phone,
  MapPin,
  Camera,
  Eye,
  RefreshCw,
  Calendar,
  User as UserIcon, // Renamed to avoid conflict with `User` entity
  Package,
  Clock,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Download,
  // New imports for OrderRow expansion
  ChevronUp,
  ChevronDown
} from "lucide-react";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom"; // Added useNavigate
import { createPageUrl } from "@/utils";

export default function CourierControlPage() {
  const [orders, setOrders] = useState([]);
  const [couriers, setCouriers] = useState([]);
  const [stats, setStats] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filters, setFilters] = useState({
    dateFrom: new Date().toISOString().split('T')[0],
    dateTo: new Date().toISOString().split('T')[0],
    courierCompany: 'all',
    deliveryStatus: 'all',
    specificCourier: 'all'
  });
  const [selectedPhoto, setSelectedPhoto] = useState(null); // State for photo viewer modal

  const loadCouriers = useCallback(async () => {
    try {
      const allUsers = await User.list();
      const courierUsers = allUsers.filter(user =>
        user.custom_role === 'courier' && user.courier_company_affiliation
      );
      setCouriers(courierUsers);
    } catch (error) {
      console.error("Error loading couriers:", error);
      toast.error("שגיאה בטעינת רשימת שליחים");
    }
  }, []);

  const loadOrdersAndStats = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setIsLoading(true);
    setIsRefreshing(true);

    try {
      // It is assumed that Order.list() now provides 'status', 'items', and 'location_bag_summary'
      // for the Order objects, as required by the OrderRow component.
      const allOrders = await Order.list();
      const deliveryOrders = allOrders.filter(order => {
        const hasDeliveryInfo = order.shipping_method_chosen === 'משלוח' &&
                               order.courier_company;

        // בדיקת טווח תאריכים
        const orderDate = order.shipment_due_date;
        const inDateRange = orderDate >= filters.dateFrom && orderDate <= filters.dateTo;

        return hasDeliveryInfo && inDateRange;
      });

      // סינון לפי פילטרים נוספים
      let filteredOrders = deliveryOrders;

      if (filters.courierCompany !== 'all') {
        filteredOrders = filteredOrders.filter(order =>
          order.courier_company === filters.courierCompany
        );
      }

      if (filters.deliveryStatus !== 'all') {
        filteredOrders = filteredOrders.filter(order =>
          (order.delivery_status || 'לא_נמסר') === filters.deliveryStatus
        );
      }

      if (filters.specificCourier !== 'all') {
        filteredOrders = filteredOrders.filter(order =>
          order.delivered_by === filters.specificCourier
        );
      }

      setOrders(filteredOrders);

      // חישוב סטטיסטיקות
      const statsData = {
        totalOrders: filteredOrders.length,
        deliveredCount: filteredOrders.filter(o => o.delivery_status === 'נמסר').length,
        failedCount: filteredOrders.filter(o => o.delivery_status === 'נכשל_ניסיון').length,
        pendingCount: filteredOrders.filter(o => !o.delivery_status || o.delivery_status === 'לא_נמסר').length,
        withPhotos: filteredOrders.filter(o => o.delivery_photo_url).length,
        byCompany: {}
      };

      // סטטיסטיקות לפי חברת שליחויות
      ['ציטה', 'דוד', 'עצמאי'].forEach(company => {
        const companyOrders = filteredOrders.filter(o => o.courier_company === company);
        statsData.byCompany[company] = {
          total: companyOrders.length,
          delivered: companyOrders.filter(o => o.delivery_status === 'נמסר').length,
          failed: companyOrders.filter(o => o.delivery_status === 'נכשל_ניסיון').length,
          pending: companyOrders.filter(o => !o.delivery_status || o.delivery_status === 'לא_נמסר').length
        };
      });

      setStats(statsData);
    } catch (error) {
      console.error("Error loading orders and stats:", error);
      toast.error("שגיאה בטעינת נתוני השליחים");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [filters]);

  useEffect(() => {
    loadCouriers();
  }, [loadCouriers]);

  useEffect(() => {
    loadOrdersAndStats();
  }, [loadOrdersAndStats]);

  const handleRefresh = async () => {
    toast.info("מרענן נתונים...");
    await loadOrdersAndStats(true);
    toast.success("הנתונים עודכנו!");
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const safeFormatDate = (dateString) => {
    if (!dateString) return '---';
    const date = new Date(dateString);
    if (date instanceof Date && !isNaN(date)) {
      return format(date, "dd/MM/yyyy HH:mm", { locale: he });
    }
    return '---';
  };

  const exportToCSV = () => {
    const csvData = orders.map(order => ({
      'מספר הזמנה': order.order_number || '',
      'תאריך משלוח': order.shipment_due_date || '',
      'חברת שליחויות': order.courier_company || '',
      'שליח': order.delivered_by || '',
      'לקוח': order.shipping_name || order.customer_name || '',
      'טלפון': order.shipping_phone || order.customer_phone || '',
      'כתובת': `${order.shipping_address || ''} ${order.shipping_city || ''}`,
      'סטטוס מסירה': order.delivery_status || 'לא_נמסר',
      'הערות מסירה': order.delivery_notes || '',
      'תאריך מסירה': order.delivered_date ? safeFormatDate(order.delivered_date) : '',
      'יש תמונה': order.delivery_photo_url ? 'כן' : 'לא'
    }));

    // Convert to CSV string, handling commas and quotes within data
    const headers = Object.keys(csvData[0] || {});
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => headers.map(header => {
        const value = row[header];
        if (typeof value === 'string') {
          // Escape double quotes and enclose in double quotes if it contains commas or double quotes
          const escapedValue = value.replace(/"/g, '""');
          return `"${escapedValue.includes(',') || escapedValue.includes('"') ? escapedValue : value}"`;
        }
        return `"${value}"`;
      }).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `courier_report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("הדוח יוצא בהצלחה!");
  };

  const navigate = useNavigate();

  const handleViewOrder = (orderId) => {
    navigate(createPageUrl(`OrderDetails?id=${orderId}`));
  };

  const OrderRow = ({ order, handleViewOrder, setSelectedPhoto, safeFormatDate }) => { // Added setSelectedPhoto, safeFormatDate
    const [isExpanded, setIsExpanded] = useState(false);

    const getStatusColor = (status) => {
      const colors = {
        "ממתין למשלוח": "bg-indigo-100 text-indigo-800 border-indigo-200",
        "משלוח אצל השליח": "bg-blue-100 text-blue-800 border-blue-200",
        "נמסרה": "bg-green-100 text-green-800 border-green-200",
        "לא נמסרה": "bg-red-100 text-red-800 border-red-200",
        "בעיה בשליחה": "bg-orange-100 text-orange-800 border-orange-200"
      };
      return colors[status] || "bg-gray-100 text-gray-800 border-gray-200";
    };

    // Secondary delivery status (from backend, might differ from main order.status)
    // This maps backend values ('לא_נמסר', 'נמסר', 'נכשל_ניסיון') to display strings and colors
    const getDeliveryStatusColor = (deliveryStatus) => {
      const statusMap = {
        "נמסר": { text: "נמסרה", color: "bg-green-100 text-green-800" },
        "לא_נמסר": { text: "לא נמסרה", color: "bg-red-100 text-red-800" },
        "נכשל_ניסיון": { text: "בעיה בשליחה", color: "bg-orange-100 text-orange-800" }
      };
      return statusMap[deliveryStatus]?.color || "bg-gray-100 text-gray-800";
    };

    const getDeliveryStatusText = (deliveryStatus) => {
        const statusMap = {
          "נמסר": { text: "נמסרה", color: "bg-green-100 text-green-800" },
          "לא_נמסר": { text: "לא נמסרה", color: "bg-red-100 text-red-800" },
          "נכשל_ניסיון": { text: "בעיה בשליחה", color: "bg-orange-100 text-orange-800" }
        };
        return statusMap[deliveryStatus]?.text || deliveryStatus;
    };


    // Generate bags summary for display only (no editing)
    const generateBagsSummaryForDisplay = (items) => {
      if (!items || items.length === 0) return [];

      const locationCounts = {};

      items.forEach(item => {
        if (item.picked_quantity > 0 || item.picking_status === 'נשלח_לאפייה') {
          if (item.location_breakdown && item.location_breakdown.length > 0) {
            item.location_breakdown.forEach(breakdown => {
              if (breakdown.location && breakdown.quantity > 0) {
                if (!locationCounts[breakdown.location]) {
                  locationCounts[breakdown.location] = 0;
                }
                locationCounts[breakdown.location] += breakdown.quantity;
              }
            });
          } else if (item.location && item.picked_quantity > 0) {
            if (!locationCounts[item.location]) {
              locationCounts[item.location] = 0;
            }
            locationCounts[item.location] += item.picked_quantity;
          }
        }
      });

      return Object.entries(locationCounts).map(([location, totalItems]) => ({
        location,
        bags_count: Math.max(1, Math.ceil(totalItems / 10)), // Assuming 10 items per bag
        unit_type: location === 'קרטון' ? 'קרטון' : 'שקיות'
      }));
    };

    const bagsSummary = order.location_bag_summary || generateBagsSummaryForDisplay(order.items || []);
    const totalBags = bagsSummary.reduce((sum, loc) => sum + (loc.bags_count || 0), 0);

    return (
      <>
        {/* Order Row */}
        <TableRow
          className="hover:bg-gray-50 cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
          data-order-id={order.id}
        >
          <TableCell className="font-medium">
            <div className="flex items-center gap-2">
              <div className="text-sm font-mono">#{order.order_number}</div>
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </TableCell>
          <TableCell>
            <div className="flex items-center gap-2">
              <UserIcon className="w-4 h-4 text-gray-500" />
              <span>{order.customer_name || order.shipping_name || 'לא צוין'}</span>
            </div>
          </TableCell>
          <TableCell>
            {/* Read directly from order.status - single source of truth */}
            <Badge className={getStatusColor(order.status)}>
              {order.status || 'ממתין'}
            </Badge>
          </TableCell>
          <TableCell>
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-gray-500" />
              <span>{order.courier_company || 'לא שויך'}</span>
            </div>
          </TableCell>
          <TableCell>
            {/* Show secondary delivery status badge if it exists, is different from the main order status, and is not the "לא נמסרה" (not delivered) state. */}
            {order.delivery_status &&
              order.status !== getDeliveryStatusText(order.delivery_status) &&
              getDeliveryStatusText(order.delivery_status) !== "לא נמסרה" ? (
                <Badge className={getDeliveryStatusColor(order.delivery_status)}>
                  {getDeliveryStatusText(order.delivery_status)}
                </Badge>
              ) : (
                <span className="text-gray-400">-</span>
            )}
          </TableCell>
          <TableCell>
            <Badge className="bg-blue-100 text-blue-800">
              {totalBags} יח׳
            </Badge>
          </TableCell>
          <TableCell>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                handleViewOrder(order.id);
              }}
            >
              <Eye className="w-4 h-4" />
            </Button>
          </TableCell>
        </TableRow>

        {/* Expanded Content - Bags Summary & Additional Info */}
        {isExpanded && (
          <TableRow>
            <TableCell colSpan={7} className="p-0">
              <div className="bg-gray-50 p-4 border-t">
                <div className="space-y-4">
                  {/* Bags Summary Only - No baking status editing */}
                  <div>
                    <h4 className="font-bold text-gray-800 flex items-center gap-2 mb-3 text-lg">
                      <Package className="w-6 h-6 text-blue-600" />
                      סיכום שקיות למשלוח
                    </h4>
                    {bagsSummary.length > 0 ? (
                      <>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                          {bagsSummary.map((locationSummary, index) => (
                            <div
                              key={locationSummary.location || index}
                              className="bg-white rounded-lg p-3 border border-gray-200"
                            >
                              <div className="flex items-center gap-2 mb-2">
                                <MapPin className="w-4 h-4 text-gray-500" />
                                <span className="text-sm font-medium text-gray-700">
                                  {locationSummary.location}
                                </span>
                              </div>
                              <div className="text-lg font-bold text-blue-600">
                                {locationSummary.bags_count} {locationSummary.unit_type || 'שקיות'}
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="flex items-center gap-2">
                            <Package className="w-5 h-5 text-blue-600" />
                            <span className="font-bold text-blue-800">
                              סה״כ: {totalBags} יחידות למשלוח
                            </span>
                          </div>
                        </div>
                      </>
                    ) : (
                      <p className="text-gray-500 text-sm">אין מידע על חלוקת שקיות</p>
                    )}
                  </div>

                  {/* Delivery Information - Extended to show for both delivered and not delivered */}
                  {(order.delivery_photo_url || order.delivery_notes || order.delivered_by || order.delivery_status === "לא_נמסר" || order.nonDeliveryReason) && (
                    <div className="border-t pt-4">
                      <h4 className="font-bold text-gray-800 mb-3">
                        {order.delivery_status === "לא_נמסר" ? "פרטי ניסיון מסירה" : "פרטי מסירה"}
                      </h4>
                      <div className="space-y-2 text-sm">
                        {order.delivered_by && (
                          <div className="flex items-center gap-2">
                            <UserIcon className="w-4 h-4 text-gray-500" />
                            <span>
                              {order.delivery_status === "לא_נמסר" ? "ניסיון מסירה על ידי: " : "נמסר על ידי: "}
                              {order.delivered_by}
                            </span>
                          </div>
                        )}
                        {order.delivered_date && (
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-500" />
                            <span>
                              {order.delivery_status === "לא_נמסר" ? "תאריך ניסיון מסירה: " : "תאריך מסירה: "}
                              {safeFormatDate(order.delivered_date)}
                            </span>
                          </div>
                        )}
                        {order.nonDeliveryReason && (
                          <div>
                            <span className="font-medium text-red-600">סיבת אי-מסירה: </span>
                            <span className="text-red-600">{order.nonDeliveryReason}</span>
                          </div>
                        )}
                        {order.delivery_notes && (
                          <div>
                            <span className="font-medium">הערות: </span>
                            <span>{order.delivery_notes}</span>
                          </div>
                        )}
                        {order.delivery_photo_url && (
                          <div>
                            <button
                              onClick={() => setSelectedPhoto({ url: order.delivery_photo_url, orderId: order.id })}
                              className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                            >
                              <Camera className="w-4 h-4" />
                              {order.delivery_status === "לא_נמסר" ? "צפה בתמונה מניסיון המסירה" : "צפה בתמונת מסירה"}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </TableCell>
          </TableRow>
        )}
      </>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
              <Truck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">לוח בקרת שליחים</h1>
              <p className="text-gray-600 text-lg">ניהול ופיקוח על כל פעילות השליחים</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={exportToCSV} variant="outline" className="bg-white elegant-shadow">
              <Download className="w-4 h-4 ml-2" />
              ייצוא CSV
            </Button>
            <Button onClick={handleRefresh} variant="outline" size="icon" className="bg-white elegant-shadow" disabled={isRefreshing}>
              <RefreshCw className={`w-5 h-5 text-gray-600 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="border-none elegant-shadow-lg bg-white/90 backdrop-blur-sm mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">מתאריך:</label>
                <Input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                  className="bg-white border-gray-200"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">עד תאריך:</label>
                <Input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                  className="bg-white border-gray-200"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">חברת שליחויות:</label>
                <Select value={filters.courierCompany} onValueChange={(value) => handleFilterChange('courierCompany', value)}>
                  <SelectTrigger className="bg-white border-gray-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">כל החברות</SelectItem>
                    <SelectItem value="ציטה">ציטה</SelectItem>
                    <SelectItem value="דוד">דוד</SelectItem>
                    <SelectItem value="עצמאי">עצמאי</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">סטטוס מסירה:</label>
                <Select value={filters.deliveryStatus} onValueChange={(value) => handleFilterChange('deliveryStatus', value)}>
                  <SelectTrigger className="bg-white border-gray-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">כל הסטטוסים</SelectItem>
                    <SelectItem value="לא_נמסר">ממתין</SelectItem>
                    <SelectItem value="נמסר">נמסר</SelectItem>
                    <SelectItem value="נכשל_ניסיון">נכשל</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">שליח ספציפי:</label>
                <Select value={filters.specificCourier} onValueChange={(value) => handleFilterChange('specificCourier', value)}>
                  <SelectTrigger className="bg-white border-gray-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">כל השליחים</SelectItem>
                    {couriers.map(courier => (
                      <SelectItem key={courier.id} value={courier.full_name}>
                        {courier.full_name} ({courier.courier_company_affiliation})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="border-none elegant-shadow-lg bg-white/90 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-600">סה״כ משלוחים</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalOrders || 0}</p>
                </div>
                <Package className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-none elegant-shadow-lg bg-white/90 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-600">נמסרו</p>
                  <p className="text-2xl font-bold text-green-600">{stats.deliveredCount || 0}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-none elegant-shadow-lg bg-white/90 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-600">נכשלו</p>
                  <p className="text-2xl font-bold text-red-600">{stats.failedCount || 0}</p>
                </div>
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-none elegant-shadow-lg bg-white/90 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-600">עם תמונות</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.withPhotos || 0}</p>
                </div>
                <Camera className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Orders Table */}
        <Card className="border-none elegant-shadow-lg bg-white/90 backdrop-blur-sm mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="w-5 h-5" />
              רשימת משלוחים ({orders.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="text-right font-semibold">הזמנה</TableHead>
                    <TableHead className="text-right font-semibold">לקוח</TableHead>
                    <TableHead className="text-right font-semibold">סטטוס הזמנה</TableHead>
                    <TableHead className="text-right font-semibold">חברת שליחויות</TableHead>
                    <TableHead className="text-right font-semibold">סטטוס מסירה</TableHead>
                    <TableHead className="text-right font-semibold">סה"כ יח׳</TableHead>
                    <TableHead className="text-right font-semibold">צפה</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <OrderRow
                      key={order.id}
                      order={order}
                      handleViewOrder={handleViewOrder}
                      setSelectedPhoto={setSelectedPhoto} // Pass setSelectedPhoto
                      safeFormatDate={safeFormatDate}     // Pass safeFormatDate
                    />
                  ))}
                </TableBody>
              </Table>
            </div>

            {orders.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                <Truck className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p>לא נמצאו משלוחים בטווח התאריכים הנבחר</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Company Stats */}
        <Card className="border-none elegant-shadow-lg bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>סיכום לפי חברות שליחויות</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(stats.byCompany || {}).map(([company, companyStats]) => (
                <div key={company} className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-bold text-lg text-gray-900 mb-3">{company}</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">סה״כ:</span>
                      <span className="font-semibold">{companyStats.total}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-600">נמסרו:</span>
                      <span className="font-semibold text-green-600">{companyStats.delivered}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-red-600">נכשלו:</span>
                      <span className="font-semibold text-red-600">{companyStats.failed}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-yellow-600">ממתינים:</span>
                      <span className="font-semibold text-yellow-600">{companyStats.pending}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Photo Viewer Modal */}
      {selectedPhoto && (
        <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
          <DialogContent className="sm:max-w-[600px] p-6">
            <DialogHeader>
              <DialogTitle>תמונת מסירה (הזמנה #{selectedPhoto.orderId})</DialogTitle>
            </DialogHeader>
            <div className="mt-4">
              <img
                src={selectedPhoto.url}
                alt={`Delivery photo for order ${selectedPhoto.orderId}`}
                className="max-w-full h-auto object-contain rounded-md"
              />
            </div>
            <div className="flex justify-end mt-4">
              <Button onClick={() => setSelectedPhoto(null)}>סגור</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
