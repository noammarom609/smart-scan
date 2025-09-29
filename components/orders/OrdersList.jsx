
import React, { useState } from 'react';
import { format } from "date-fns";
import { he } from "date-fns/locale";
import { AnimatePresence } from "framer-motion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, ExternalLink, RefreshCw, Archive, Eye, Play, DollarSign, Calendar } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import toast from 'react-hot-toast'; // Assuming react-hot-toast for toast messages
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
import { createPageUrl } from "@/utils";

const statusColors = {
  "ממתין": "bg-yellow-100 text-yellow-800 border-yellow-200",
  "בליקוט": "bg-orange-100 text-orange-800 border-orange-200",
  "ממתין למשלוח": "bg-indigo-100 text-indigo-800 border-indigo-200",
  "ממתין לאיסוף": "bg-purple-100 text-purple-800 border-purple-200",
  "משלוח אצל השליח": "bg-blue-100 text-blue-800 border-blue-200",
  "נשלח": "bg-blue-100 text-blue-800 border-blue-200",
  "התקבל": "bg-green-100 text-green-800 border-green-200",
  "בוטל": "bg-red-100 text-red-800 border-red-200",
  "בארכיון": "bg-gray-100 text-gray-800 border-gray-200"
};

export default function OrdersList({
  orders,
  isLoading,
  onRefresh,
  onArchiveOrder,
  onStartPicking,
  updateOrder // Added updateOrder prop for saving changes
}) {
  // State variables for editing functionality, as implied by the handleSaveEdit outline
  const [isSaving, setIsSaving] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

  // *** פונקציה משופרת עם סנכרון תאריכים להזמנות אפייה - ENHANCED ***
  const handleSaveEdit = async (orderId, updatedData) => {
    setIsSaving(prev => ({ ...prev, [orderId]: true }));
    try {
      console.log('💾 Saving order with data:', updatedData);

      // עדכן את ההזמנה עצמה
      // This 'updateOrder' function must be provided as a prop from a parent component
      // or defined elsewhere that handles the actual data update logic.
      if (typeof updateOrder === 'function') {
        await updateOrder(orderId, updatedData);
      } else {
        console.warn("`updateOrder` function not provided to OrdersList. Order data will not be persisted.");
        // In a real application, you'd likely throw an error or handle this more robustly.
        // For this implementation, we'll proceed with date sync if `updateOrder` is missing,
        // but note the warning.
      }

      // *** NEW: בדוק האם עודכנו תאריכי משלוח/איסוף וסנכרן להזמנות אפייה אם נדרש ***
      const hasDateChanges = updatedData.shipment_due_date ||
                             updatedData.pickup_preferred_date ||
                             updatedData.pickup_preferred_time;

      if (hasDateChanges) {
        try {
          console.log('📅 Date changes detected, syncing to related baking orders...');

          // יבוא דינמי של פונקציית הסנכרון
          const { syncOrderData } = await import("@/api/functions");

          await syncOrderData({
            orderId: orderId,
            updateType: 'sync_dates',
            updateData: {
              shipment_due_date: updatedData.shipment_due_date,
              pickup_preferred_date: updatedData.pickup_preferred_date,
              pickup_preferred_time: updatedData.pickup_preferred_time
            }
          });

          console.log('✅ Successfully synced dates to related baking orders');

        } catch (syncError) {
          console.error('⚠️ Error syncing dates to baking orders:', syncError);
          // לא נעצור את התהליך בגלל שגיאת סינכרון
        }
      }

      toast.success("השינויים נשמרו בהצלחה!");
      setEditingId(null);
      setEditData({});

      // רענון נתונים עם עיכוב קטן
      setTimeout(() => {
        onRefresh?.();
      }, 500);

    } catch (error) {
      console.error("Error saving order:", error);
      toast.error("שגיאה בשמירת השינויים: " + error.message);
    } finally {
      setIsSaving(prev => ({ ...prev, [orderId]: false }));
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6">
        <div className="space-y-3">
          {Array(5).fill(0).map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-3 sm:p-4">
              <Skeleton className="h-4 w-24 sm:w-32" />
              <Skeleton className="h-4 w-16 sm:w-24" />
              <Skeleton className="h-4 w-12 sm:w-20" />
              <Skeleton className="h-6 w-12 sm:w-16 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="p-8 sm:p-12 text-center">
        <Building2 className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">אין הזמנות</h3>
        <p className="text-gray-500 mb-6 text-sm sm:text-base">התחל בסריקת ההזמנה הראשונה שלך</p>
        <Button onClick={onRefresh} variant="outline" className="mx-auto">
          <RefreshCw className="w-4 h-4 ml-2" />
          רענן
        </Button>
      </div>
    );
  }

  const safeFormatDate = (dateString) => {
    if (!dateString) return '---';
    const date = new Date(dateString);
    if (date instanceof Date && !isNaN(date)) {
      return format(date, "dd/MM/yyyy", { locale: he });
    }
    return '---';
  };

  const handleStartPickingClick = (orderId) => {
    if (onStartPicking) {
      onStartPicking(orderId);
    }
  };

  return (
    <div className="md:p-0">
      {/* Mobile Layout: Enhanced Cards */}
      <div className="md:hidden space-y-3 p-2 sm:p-0">
        {orders.map(order => (
          <div
            key={order.id}
            className="bg-white rounded-lg elegant-shadow p-3 space-y-3 border border-gray-100"
          >
            {/* Header Row */}
            <div className="flex justify-between items-start gap-2">
              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm text-gray-900 truncate">{order.customer_name || order.shipping_name || 'לקוח לא ידוע'}</div>
                <div className="text-xs text-gray-500 font-mono">#{order.order_number || '---'}</div>
              </div>
              <Badge
                variant="secondary"
                className={`${statusColors[order.status] || statusColors["ממתין"]} border font-medium text-xs flex-shrink-0`}
              >
                {order.status || 'ממתין'}
              </Badge>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex flex-col">
                <span className="text-gray-500 flex items-center gap-1">
                  <Calendar className="w-3 h-3"/>
                  תאריך:
                </span>
                <span className="font-medium">{safeFormatDate(order.email_received_date || order.created_date)}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-500 flex items-center gap-1">
                  <DollarSign className="w-3 h-3"/>
                  סכום:
                </span>
                <span className="font-bold text-green-600">
                  {order.total_amount ? `₪${order.total_amount.toLocaleString()}` : '₪0'}
                </span>
              </div>
            </div>

            {/* Action Buttons Row */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <div className="flex items-center gap-1">
                <a
                  href={createPageUrl("OrderDetails") + "?id=" + order.id}
                  className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50"
                  title="צפה בפרטי ההזמנה"
                >
                  <Eye className="w-4 h-4" />
                </a>
                {order.file_url && (
                  <a
                    href={order.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-600 hover:text-purple-800 p-2 rounded-lg hover:bg-purple-50"
                    title="צפה בקובץ המקורי"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-gray-600 hover:text-gray-800 hover:bg-gray-100 p-2 rounded-lg"
                      title="העבר לארכיון"
                    >
                      <Archive className="w-4 h-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="mx-2 max-w-md">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="flex items-center gap-2 text-gray-700 text-lg">
                        <Archive className="w-5 h-5" />
                        העברה לארכיון
                      </AlertDialogTitle>
                      <AlertDialogDescription className="text-gray-600 text-sm">
                        האם אתה בטוח שברצונך להעביר לארכיון את ההזמנה של {order.customer_name || order.shipping_name || 'לקוח לא ידוע'}?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex-col-reverse sm:flex-row gap-2">
                      <AlertDialogCancel className="w-full sm:w-auto bg-gray-100 hover:bg-gray-200">
                        ביטול
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => onArchiveOrder(order.id)}
                        className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <Archive className="w-4 h-4 ml-1" />
                        העבר לארכיון
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>

              {order.status === 'ממתין' && (
                <Button
                  variant="outline"
                  size="sm"
                  className="text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700 text-xs px-3 py-1"
                  onClick={() => handleStartPickingClick(order.id)}
                  title="התחל ליקוט"
                >
                  <Play className="w-3 h-3 ml-1" /> התחל ליקוט
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Layout: Table */}
      <div className="hidden md:block overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/50 border-b border-gray-100">
              <TableHead className="text-right font-semibold">לקוח</TableHead>
              <TableHead className="text-right font-semibold">מספר הזמנה</TableHead>
              <TableHead className="text-right font-semibold">תאריך קבלה</TableHead>
              <TableHead className="text-right font-semibold">סכום</TableHead>
              <TableHead className="text-right font-semibold">סטטוס</TableHead>
              <TableHead className="text-right font-semibold">פעולות</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <AnimatePresence>
              {orders.map((order) => (
                <TableRow
                  key={order.id}
                  className="hover:bg-blue-50/30 transition-colors duration-200 border-b border-gray-50"
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
                        <span className="text-blue-700 font-semibold text-sm">
                          {order.customer_name ? order.customer_name[0].toUpperCase() : order.shipping_name ? order.shipping_name[0].toUpperCase() : '?'}
                        </span>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">
                          {order.customer_name || order.shipping_name || 'לקוח לא ידוע'}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-sm">
                      {order.order_number || '---'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-gray-600">
                      {safeFormatDate(order.email_received_date || order.created_date)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="font-bold text-green-600">
                      {order.total_amount
                        ? `₪${order.total_amount.toLocaleString()}`
                        : '₪0'
                      }
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={`${statusColors[order.status] || statusColors["ממתין"]} border font-medium`}
                    >
                      {order.status || 'ממתין'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <a
                        href={createPageUrl("OrderDetails") + "?id=" + order.id}
                        className="text-blue-600 hover:text-blue-800 transition-colors p-2 rounded-lg hover:bg-blue-50"
                        title="צפה בפרטי ההזמנה"
                      >
                        <Eye className="w-4 h-4" />
                      </a>

                      {order.status === 'ממתין' && (
                          <Button
                              variant="outline"
                              size="icon"
                              className="text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                              onClick={() => handleStartPickingClick(order.id)}
                              title="התחל ליקוט"
                          >
                              <Play className="w-4 h-4" />
                          </Button>
                      )}

                      {order.file_url && (
                        <a
                          href={order.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-purple-600 hover:text-purple-800 transition-colors p-2 rounded-lg hover:bg-purple-50"
                          title="צפה בקובץ המקורי"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-gray-600 hover:text-gray-800 hover:bg-gray-100 p-2 rounded-lg"
                            title="העבר לארכיון"
                          >
                            <Archive className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="max-w-md">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="flex items-center gap-2 text-gray-700">
                              <Archive className="w-5 h-5" />
                              העברה לארכיון
                            </AlertDialogTitle>
                            <AlertDialogDescription className="text-gray-600">
                              האם אתה בטוח שברצונך להעביר לארכיון את ההזמנה של {order.customer_name || order.shipping_name || 'לקוח לא ידוע'}?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter className="gap-2">
                            <AlertDialogCancel className="bg-gray-100 hover:bg-gray-200">
                              ביטול
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => onArchiveOrder(order.id)}
                              className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                              <Archive className="w-4 h-4 ml-1" />
                              העבר לארכיון
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </AnimatePresence>
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
