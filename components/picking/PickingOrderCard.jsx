import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Order } from "@/api/entities";
import { ChevronDown, ChevronUp, Package, User, Phone, MapPin, Clock, CheckCircle, Truck, Store, Archive } from "lucide-react";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import { toast } from "sonner";
import { useOrders } from '@/components/contexts/OrderContext';
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

import ItemPickingList from "./ItemPickingList";

export default function PickingOrderCard({ order, onUpdate }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const prevPickingStatusRef = useRef(order.picking_status);
  const { updateOrder } = useOrders();

  const safeFormatDate = (dateString) => {
    if (!dateString) return '---';
    const date = new Date(dateString);
    if (date instanceof Date && !isNaN(date)) {
      return format(date, "dd/MM/yyyy HH:mm", { locale: he });
    }
    return '---';
  };

  const getStatusBadge = (pickingStatus) => {
    const statusConfig = {
      "לא_התחיל": { color: "bg-yellow-100 text-yellow-800 border-yellow-200", text: "לא התחיל", icon: Clock },
      "בתהליך": { color: "bg-blue-100 text-blue-800 border-blue-200", text: "בתהליך", icon: Package },
      "הושלם": { color: "bg-green-100 text-green-800 border-green-200", text: "הושלם", icon: CheckCircle }
    };
    
    const config = statusConfig[pickingStatus] || statusConfig["לא_התחיל"];
    const Icon = config.icon;
    
    return (
      <Badge className={`${config.color} border flex items-center gap-1 font-medium`}>
        <Icon className="w-3 h-3" />
        {config.text}
      </Badge>
    );
  };

  const getAddressText = () => {
    if (order.shipping_address) {
      return `${order.shipping_address}${order.shipping_city ? `, ${order.shipping_city}` : ''}`;
    }
    return order.shipping_city || 'כתובת לא זמינה';
  };

  // Effect to trigger automatic baking toast when picking status transitions to "הושלם"
  useEffect(() => {
    if (prevPickingStatusRef.current !== "הושלם" && order.picking_status === "הושלם") {
      toast.success("הליקוט הושלם! ההזמנה נשלחה אוטומטית לאפייה.", {
        duration: 5000,
      });
    }
    prevPickingStatusRef.current = order.picking_status;
  }, [order.picking_status]);

  const handleArchiveOrder = async (orderId) => {
    const toastId = toast.loading("מעביר לארכיון...");
    try {
      await updateOrder(orderId, { status: "בארכיון" });
      toast.success("ההזמנה הועברה לארכיון!", { id: toastId });
      if (onUpdate) {
        onUpdate(); // Refresh the list of picking orders
      }
    } catch (error) {
      console.error("Error archiving order:", error);
      toast.error("שגיאה בהעברה לארכיון.", { id: toastId });
    }
  };

  return (
    <Card className="border-none elegant-shadow-lg bg-white/90 backdrop-blur-sm hover:shadow-xl transition-shadow duration-300 mx-2 sm:mx-0">
      <CardHeader 
        className="cursor-pointer hover:bg-gray-50/50 transition-colors duration-200 p-3 sm:p-6"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-4">
          <div className="flex-1 w-full">
            {/* Header Row - Mobile Optimized */}
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center flex-shrink-0">
                <Package className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <CardTitle className="text-lg sm:text-xl font-bold text-gray-900 truncate">
                  {order.supplier || 'ספק לא ידוע'}
                </CardTitle>
                <p className="text-xs sm:text-sm text-gray-500 font-mono truncate">
                  הזמנה #{order.order_number}
                </p>
              </div>
              <div className="flex flex-col items-end gap-2 flex-shrink-0">
                {getStatusBadge(order.picking_status)}
                
                {/* כפתור ארכיון חדש */}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-gray-600 hover:text-gray-800 hover:bg-gray-100 p-2 rounded-lg"
                      title="העבר לארכיון"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Archive className="w-4 h-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="mx-2 max-w-md">
                    <AlertDialogHeader>
                      <AlertDialogTitle>העברה לארכיון</AlertDialogTitle>
                      <AlertDialogDescription>
                        האם אתה בטוח שברצונך להעביר לארכיון את הזמנה #{order.order_number}?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>ביטול</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleArchiveOrder(order.id)}>
                        העבר לארכיון
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                
                <div className="flex items-center gap-1 text-gray-500">
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  <span className="text-xs">פרטים</span>
                </div>
              </div>
            </div>

            {/* Info Grid - Mobile Responsive */}
            <div className="space-y-2 sm:space-y-0 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:gap-4 text-xs sm:text-sm">
              <div className="flex items-center gap-2">
                <User className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                <span className="truncate">{order.customer_name || order.shipping_name || 'לקוח לא ידוע'}</span>
              </div>
              {(order.customer_phone || order.shipping_phone) && (
                <div className="flex items-center gap-2">
                  <Phone className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                  <span className="truncate">{order.customer_phone || order.shipping_phone}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                <span className="truncate">{safeFormatDate(order.created_date)}</span>
              </div>
              <div className="flex items-center gap-2">
                {order.shipping_cost > 0 ? (
                    <>
                        <Truck className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 flex-shrink-0" />
                        <span className="text-green-700 font-medium text-xs sm:text-sm truncate">משלוח ({order.currency || '₪'}{order.shipping_cost?.toLocaleString() || '0'})</span>
                    </>
                ) : (
                    <>
                        <Store className="w-3 h-3 sm:w-4 sm:h-4 text-purple-600 flex-shrink-0" />
                        <span className="text-purple-700 font-medium text-xs sm:text-sm">איסוף עצמי</span>
                    </>
                )}
              </div>
              <div className="flex items-center gap-2 sm:col-span-2 lg:col-span-4">
                <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                <span className="truncate text-xs sm:text-sm">
                  {getAddressText()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="border-t border-gray-100 p-3 sm:p-6 sm:pt-6">
          <div className="space-y-4 sm:space-y-6">
            {order.items && order.items.length > 0 && (
              <ItemPickingList 
                order={order}
                onUpdate={onUpdate}
                updateOrderContext={updateOrder}
              />
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}