import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Order } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Archive, ArchiveRestore, Calendar, DollarSign, Eye, Trash2, AlertTriangle, Search, Truck, Hash, Package, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import { toast } from "sonner";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
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
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useOrders } from '@/components/contexts/OrderContext';

export default function ArchivedOrdersPage() {
  const {
    orders: allOrders,
    isLoading: ordersLoading,
    updateOrder,
    deleteOrder,
    refreshOrders
  } = useOrders();

  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedOrders, setExpandedOrders] = useState(new Set());

  const loadArchivedOrders = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setIsLoading(true);
    setIsRefreshing(true);
    try {
      if (isRefresh) {
        await refreshOrders();
      }

      const filteredArchivedOrders = allOrders.filter(order =>
        order.status === 'בארכיון'
      );

      setOrders(filteredArchivedOrders);
    } catch (error) {
      console.error("Error loading archived orders:", error);
      toast.error("שגיאה בטעינת הזמנות בארכיון");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [allOrders, refreshOrders]);

  useEffect(() => {
    if (!ordersLoading) {
      loadArchivedOrders();
    }
  }, [allOrders, ordersLoading, loadArchivedOrders]);

  const handleRefresh = async () => {
    toast.info("מרענן נתונים...");
    await loadArchivedOrders(true);
    toast.success("הנתונים עודכנו!");
  };

  const handleRestoreOrder = async (orderId) => {
    const toastId = toast.loading("משחזר הזמנה מהארכיון...");
    try {
      await updateOrder(orderId, { status: "ממתין" });
      toast.success("ההזמנה שוחזרה בהצלחה!", { id: toastId });
    } catch (error) {
      console.error("Error restoring order:", error);
      toast.error("שגיאה בשחזור ההזמנה.", { id: toastId });
    }
  };

  const handleDeleteOrder = async (orderId) => {
    const toastId = toast.loading("מוחק הזמנה לצמיתות...");
    try {
      await deleteOrder(orderId);
      toast.success("ההזמנה נמחקה בהצלחה!", { id: toastId });
    } catch (error) {
      console.error("Error deleting order:", error);
      toast.error("שגיאה במחיקת ההזמנה.", { id: toastId });
    }
  };

  const toggleOrderExpansion = (orderId) => {
    setExpandedOrders(prevExpanded => {
      const newExpanded = new Set(prevExpanded);
      if (newExpanded.has(orderId)) {
        newExpanded.delete(orderId);
      } else {
        newExpanded.add(orderId);
      }
      return newExpanded;
    });
  };

  const safeFormatDate = (dateString, formatString = "dd/MM/yyyy") => {
    if (!dateString) return '---';
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date) ? format(date, formatString, { locale: he }) : '---';
  };

  const getArchiveStatusBadge = (order) => {
    if (order.status === "בארכיון") {
      return <Badge className="bg-gray-100 text-gray-800 border-gray-200">בארכיון</Badge>;
    }
    return <Badge className="bg-gray-100 text-gray-800 border-gray-200">{order.status}</Badge>;
  };

  const getDeliveryInfo = (order) => {
    const hasDeliveryInfo = order.shipping_method_chosen || order.delivery_status || order.delivered_by || order.delivered_date || order.delivery_notes || order.nonDeliveryReason || order.pickup_preferred_date || order.pickup_preferred_time || order.courier_company;

    if (!hasDeliveryInfo) return null;

    let deliveryContent = null;

    // איסוף עצמי
    if (order.shipping_method_chosen === "איסוף_עצמי") {
      deliveryContent = (
        <div className="mt-2 p-3 bg-purple-50 rounded-lg border border-purple-200">
          <div className="text-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-purple-800">פרטי איסוף עצמי:</span>
            </div>
            <p className="text-purple-700 text-xs">
              <strong>סטטוס:</strong> נאסף עצמאית
            </p>
            {order.pickup_preferred_date && (
              <p className="text-purple-700 text-xs">
                <strong>תאריך איסוף מועדף:</strong> {safeFormatDate(order.pickup_preferred_date)}
              </p>
            )}
            {order.pickup_preferred_time && (
              <p className="text-purple-700 text-xs">
                <strong>שעת איסוף מועדפת:</strong> {order.pickup_preferred_time}
              </p>
            )}
            {order.delivered_date && (
              <p className="text-purple-700 text-xs">
                <strong>תאריך איסוף בפועל:</strong> {safeFormatDate(order.delivered_date)}
              </p>
            )}
          </div>
        </div>
      );
    }
    // משלוח שנמסר
    else if (order.shipping_method_chosen === "משלוח" && order.delivery_status === "נמסרה") {
      deliveryContent = (
        <div className="mt-2 p-3 bg-green-50 rounded-lg border border-green-200">
          <div className="text-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-green-800">פרטי מסירה מוצלחת:</span>
              {order.delivery_photo_url && (
                <a
                  href={order.delivery_photo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-600 hover:text-green-800 text-xs underline"
                >
                  צפה בתמונה
                </a>
              )}
            </div>
            <p className="text-green-700 text-xs">
              <strong>סטטוס:</strong> המשלוח נמסר בהצלחה
            </p>
            {order.delivered_by && (
              <p className="text-green-700 text-xs">
                <strong>שליח:</strong> {order.delivered_by}
              </p>
            )}
            {order.delivered_date && (
              <p className="text-green-700 text-xs">
                <strong>תאריך מסירה:</strong> {safeFormatDate(order.delivered_date)}
              </p>
            )}
            {order.courier_company && (
              <p className="text-green-700 text-xs">
                <strong>חברת שליחויות:</strong> {order.courier_company}
              </p>
            )}
            {order.delivery_notes && (
              <p className="text-green-700 text-xs mt-1">
                <strong>הערות מסירה:</strong> {order.delivery_notes}
              </p>
            )}
          </div>
        </div>
      );
    }
    // משלוח שלא נמסר
    else if (order.shipping_method_chosen === "משלוח" && order.delivery_status === "לא נמסרה") {
      deliveryContent = (
        <div className="mt-2 p-3 bg-red-50 rounded-lg border border-red-200">
          <div className="text-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-red-800">פרטי מסירה לא מוצלחת:</span>
            </div>
            <p className="text-red-700 text-xs">
              <strong>סטטוס:</strong> המשלוח לא נמסר
            </p>
            {order.nonDeliveryReason && (
              <p className="text-red-700 text-xs">
                <strong>סיבת אי מסירה:</strong> {order.nonDeliveryReason}
              </p>
            )}
            {order.delivered_by && (
              <p className="text-red-700 text-xs">
                <strong>שליח:</strong> {order.delivered_by}
              </p>
            )}
            {order.delivered_date && (
              <p className="text-red-700 text-xs">
                <strong>תאריך ניסיון מסירה:</strong> {safeFormatDate(order.delivered_date)}
              </p>
            )}
            {order.courier_company && (
              <p className="text-red-700 text-xs">
                <strong>חברת שליחויות:</strong> {order.courier_company}
              </p>
            )}
            {order.delivery_notes && (
              <p className="text-red-700 text-xs mt-1">
                <strong>הערות:</strong> {order.delivery_notes}
              </p>
            )}
          </div>
        </div>
      );
    }
    // משלוח כללי או סטטוסים אחרים
    else if (order.shipping_method_chosen === "משלוח" || order.delivery_status || order.delivered_by) {
      deliveryContent = (
        <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="text-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-blue-800">פרטי משלוח:</span>
              {order.delivery_photo_url && (
                <a
                  href={order.delivery_photo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 text-xs underline"
                >
                  צפה בתמונה
                </a>
              )}
            </div>
            {order.delivery_status && (
              <p className="text-blue-700 text-xs">
                <strong>סטטוס:</strong> {
                  order.delivery_status === "נמסרה" ? "נמסר" :
                  order.delivery_status === "לא נמסרה" ? "לא נמסר" :
                  order.delivery_status === "בעיה בשליחה" ? "בעיה בשליחה" :
                  order.delivery_status
                }
              </p>
            )}
            {order.delivered_by && (
              <p className="text-blue-700 text-xs">
                <strong>שליח:</strong> {order.delivered_by}
              </p>
            )}
            {order.delivered_date && (
              <p className="text-blue-700 text-xs">
                <strong>תאריך:</strong> {safeFormatDate(order.delivered_date)}
              </p>
            )}
            {order.courier_company && (
              <p className="text-blue-700 text-xs">
                <strong>חברת שליחויות:</strong> {order.courier_company}
              </p>
            )}
            {order.delivery_notes && (
              <p className="text-blue-700 text-xs mt-1">
                <strong>הערות:</strong> {order.delivery_notes}
              </p>
            )}
            {order.nonDeliveryReason && (
              <p className="text-blue-700 text-xs mt-1">
                <strong>סיבת אי מסירה:</strong> {order.nonDeliveryReason}
              </p>
            )}
          </div>
        </div>
      );
    }

    return deliveryContent;
  };

  const filteredOrders = useMemo(() => {
    if (!searchTerm) return orders;

    return orders.filter(order =>
      (order.supplier && order.supplier.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (order.order_number && order.order_number.includes(searchTerm)) ||
      (order.customer_name && order.customer_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (order.handled_by && order.handled_by.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [orders, searchTerm]);

  return (
    <div className="p-4 md:p-6 lg:p-8 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-gray-600 to-gray-800 rounded-xl flex items-center justify-center elegant-shadow">
                <Archive className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">ארכיון הזמנות</h1>
              <p className="text-gray-600 text-lg mt-1">כל ההזמנות שהועברו לארכיון</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={handleRefresh} variant="outline" size="icon" className="bg-white elegant-shadow" disabled={isRefreshing}>
              <RefreshCw className={`w-5 h-5 text-gray-600 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
            <div className="relative w-full md:w-80">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="חיפוש בארכיון..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10 bg-white elegant-shadow border-gray-200"
              />
            </div>
          </div>
        </div>

        {isLoading || ordersLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Card key={i} className="animate-pulse bg-white/50">
                <CardContent className="p-4">
                  <div className="h-24 bg-gray-200 rounded-md"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <Archive className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800">הארכיון ריק</h3>
            <p className="text-gray-500 mt-2">{searchTerm ? "לא נמצאו הזמנות שתואמות את החיפוש." : "אין הזמנות שהועברו לארכיון."}</p>
          </div>
        ) : (
          <div className="space-y-6">
            <Card className="border-none elegant-shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-lg sm:text-xl">הזמנות בארכיון</CardTitle>
              </CardHeader>
              <CardContent className="p-0 sm:p-6 sm:pt-0">
                {/* Mobile Layout */}
                <div className="md:hidden space-y-3 p-2 sm:p-0">
                  {filteredOrders.map(order => (
                    <div
                      key={order.id}
                      className="bg-white rounded-lg elegant-shadow border border-gray-100"
                    >
                      <div
                        className="p-3 space-y-3 cursor-pointer hover:bg-gray-50"
                        onClick={() => toggleOrderExpansion(order.id)}
                      >
                        <div className="flex justify-between items-start gap-2 mb-2">
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-sm text-gray-900 truncate">{order.customer_name || order.shipping_name || 'לקוח לא ידוע'}</div>
                            <div className="text-xs text-gray-500 font-mono">#{order.order_number || '---'}</div>
                          </div>
                          {getArchiveStatusBadge(order)}
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="flex items-center gap-2">
                            <Package className="w-4 h-4 text-blue-600" />
                            <span>{order.supplier}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center">
                              <span className="text-purple-700 font-bold text-xs">
                                {order.handled_by ? order.handled_by[0] : '?'}
                              </span>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">טופל על ידי</p>
                              <p className="font-medium text-xs">{order.handled_by || 'לא צוין'}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <div>
                              <p className="text-xs text-gray-500">התקבל</p>
                              <p className="font-medium text-xs">{safeFormatDate(order.email_received_date || order.created_date)}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Truck className="w-4 h-4 text-green-500" />
                            <div>
                              <p className="text-xs text-gray-500">נשלח/נאסף</p>
                              <p className="font-medium text-xs">{safeFormatDate(order.shipped_date)}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 col-span-2">
                            <DollarSign className="w-4 h-4 text-green-600" />
                            <div>
                              <p className="text-xs text-gray-500">סכום</p>
                              <p className="font-bold text-green-600 text-sm">₪{(order.total_amount || 0).toLocaleString()}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {expandedOrders.has(order.id) && (
                        <div className="border-t border-gray-100 p-3">
                          {getDeliveryInfo(order)}
                        </div>
                      )}

                      <div className="flex justify-end gap-2 p-3 border-t border-gray-100">
                        <Button asChild variant="ghost" size="icon" title="צפה בפרטים">
                          <Link to={createPageUrl(`OrderDetails?id=${order.id}`)}>
                            <Eye className="w-4 h-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRestoreOrder(order.id)}
                          className="text-blue-500 hover:bg-blue-100"
                          title="שחזר מארכיון"
                        >
                          <ArchiveRestore className="w-4 h-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="destructive-ghost"
                              size="icon"
                              className="text-red-500 hover:bg-red-100"
                              title="מחק לצמיתות"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle className="flex items-center gap-2 text-red-700">
                                <AlertTriangle className="w-5 h-5" />
                                מחיקה לצמיתות
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                האם אתה בטוח שברצונך למחוק את ההזמנה לצמיתות? לא ניתן לשחזר פעולה זו.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>ביטול</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteOrder(order.id)} className="bg-red-600 hover:bg-red-700">
                                מחק לצמיתות
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[150px]">ספק ומספר הזמנה</TableHead>
                        <TableHead>לקוח</TableHead>
                        <TableHead>טופל על ידי</TableHead>
                        <TableHead>תאריך קבלה</TableHead>
                        <TableHead>תאריך שליחה/איסוף</TableHead>
                        <TableHead>סכום</TableHead>
                        <TableHead>סטטוס</TableHead>
                        <TableHead className="text-right">פעולות</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredOrders.map((order) => (
                        <React.Fragment key={order.id}>
                          <TableRow
                            className="hover:bg-gray-50 cursor-pointer"
                            onClick={() => toggleOrderExpansion(order.id)}
                          >
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2 font-bold text-gray-800">
                                <Package className="w-4 h-4 text-blue-600" />
                                <span>{order.supplier}</span>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-gray-500 font-mono">
                                <Hash className="w-3 h-3" />
                                <span>#{order.order_number}</span>
                              </div>
                            </TableCell>
                            <TableCell className="font-medium text-sm text-gray-800">{order.customer_name || order.shipping_name || '---'}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center">
                                  <span className="text-purple-700 font-bold text-xs">
                                    {order.handled_by ? order.handled_by[0] : '?'}
                                  </span>
                                </div>
                                <p className="font-medium text-sm">{order.handled_by || 'לא צוין'}</p>
                              </div>
                            </TableCell>
                            <TableCell className="text-sm text-gray-600">
                              {safeFormatDate(order.email_received_date || order.created_date)}
                            </TableCell>
                            <TableCell className="text-sm text-gray-600">
                              {safeFormatDate(order.shipped_date)}
                            </TableCell>
                            <TableCell className="font-bold text-green-600 text-sm">
                              ₪{(order.total_amount || 0).toLocaleString()}
                            </TableCell>
                            <TableCell>{getArchiveStatusBadge(order)}</TableCell>
                            <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                              <div className="flex justify-end gap-2">
                                <Button asChild variant="ghost" size="icon" title="צפה בפרטים">
                                  <Link to={createPageUrl(`OrderDetails?id=${order.id}`)}>
                                    <Eye className="w-4 h-4" />
                                  </Link>
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleRestoreOrder(order.id)}
                                  className="text-blue-500 hover:bg-blue-100"
                                  title="שחזר מארכיון"
                                >
                                  <ArchiveRestore className="w-4 h-4" />
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      variant="destructive-ghost"
                                      size="icon"
                                      className="text-red-500 hover:bg-red-100"
                                      title="מחק לצמיתות"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle className="flex items-center gap-2 text-red-700">
                                        <AlertTriangle className="w-5 h-5" />
                                        מחיקה לצמיתות
                                      </AlertDialogTitle>
                                      <AlertDialogDescription>
                                        האם אתה בטוח שברצונך למחוק את ההזמנה לצמיתות? לא ניתן לשחזר פעולה זו.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>ביטול</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => handleDeleteOrder(order.id)} className="bg-red-600 hover:bg-red-700">
                                        מחק לצמיתות
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </TableCell>
                          </TableRow>

                          {expandedOrders.has(order.id) && (
                            <TableRow>
                              <TableCell colSpan={8} className="p-0">
                                <div className="bg-gray-50 p-4 border-t">
                                  {getDeliveryInfo(order)}
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </React.Fragment>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}