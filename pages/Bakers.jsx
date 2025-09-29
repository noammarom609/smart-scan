
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Order } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ChefHat, RefreshCw, CalendarDays, Package, User, Hash, Save, CheckCircle, Clock, MapPin, Undo2, Archive, MessageSquare, Plus, X, Search, ChevronUp, ChevronDown, Minus, Download, BarChart3, Factory } from "lucide-react";
import { format, parseISO, isToday, startOfWeek, endOfWeek, isWithinInterval } from "date-fns";
import { he } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
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
  AlertDialogTrigger, // Added AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { syncOrderData } from "@/api/functions";
import { useOrders } from '@/components/contexts/OrderContext';
import BakingAnalytics from '../components/bakers/BakingAnalytics';

// BakingQuantityControl Component - רכיב חדש לעדכון כמותי
const BakingQuantityControl = ({ item, orderId, itemIndex, onQuantityChange }) => {
  const [localQuantity, setLocalQuantity] = useState(item.baked_quantity || 0);
  const maxQuantity = item.quantity || 1;

  const handleQuantityChange = (newQuantity) => {
    const clampedQuantity = Math.max(0, Math.min(newQuantity, maxQuantity));
    setLocalQuantity(clampedQuantity);
    onQuantityChange(orderId, itemIndex, clampedQuantity);
  };

  const incrementQuantity = () => {
    if (localQuantity < maxQuantity) {
      handleQuantityChange(localQuantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (localQuantity > 0) {
      handleQuantityChange(localQuantity - 1);
    }
  };

  const getBakingStatusBadge = (bakedQuantity, totalQuantity) => {
    const percentage = totalQuantity > 0 ? (bakedQuantity / totalQuantity) * 100 : 0;
    
    if (percentage === 0) {
      return (
        <Badge className="bg-yellow-100 text-yellow-800 flex items-center gap-1">
          <Clock className="w-3 h-3" />
          ממתין
        </Badge>
      );
    } else if (percentage < 100) {
      return (
        <Badge className="bg-blue-100 text-blue-800 flex items-center gap-1">
          <ChefHat className="w-3 h-3" />
          בתהליך ({Math.round(percentage)}%)
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
          <CheckCircle className="w-3 h-3" />
          הושלם
        </Badge>
      );
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {/* תצוגת סטטוס */}
      <div className="flex justify-center">
        {getBakingStatusBadge(localQuantity, maxQuantity)}
      </div>
      
      {/* קונטרול כמות */}
      <div className="flex items-center gap-1 justify-center">
        <Button
          variant="outline"
          size="sm"
          onClick={decrementQuantity}
          disabled={localQuantity <= 0}
          className="w-8 h-8 p-0"
        >
          <Minus className="w-3 h-3" />
        </Button>
        
        <div className="relative">
          <Input
            type="number"
            value={localQuantity}
            onChange={(e) => {
              const newValue = parseInt(e.target.value) || 0;
              handleQuantityChange(newValue);
            }}
            min={0}
            max={maxQuantity}
            className="w-16 text-center text-sm"
          />
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={incrementQuantity}
          disabled={localQuantity >= maxQuantity}
          className="w-8 h-8 p-0"
        >
          <Plus className="w-3 h-3" />
        </Button>
      </div>
      
      {/* תצוגת התקדמות */}
      <div className="text-xs text-center text-gray-600">
        {localQuantity} מתוך {maxQuantity}
      </div>
    </div>
  );
};

// ProductionQuantityControl Component - רכיב לעדכון כמותי בתכנון ייצור
const ProductionQuantityControl = ({ product, onQuantityChange }) => {
  const [localQuantity, setLocalQuantity] = useState(product.ready_quantity || 0);
  const maxQuantity = product.total_quantity || 1;

  const handleQuantityChange = (newQuantity) => {
    const clampedQuantity = Math.max(0, Math.min(newQuantity, maxQuantity));
    setLocalQuantity(clampedQuantity);
    onQuantityChange(product.product_name, clampedQuantity);
  };

  const incrementQuantity = () => {
    if (localQuantity < maxQuantity) {
      handleQuantityChange(localQuantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (localQuantity > 0) {
      handleQuantityChange(localQuantity - 1);
    }
  };

  return (
    <div className="flex items-center gap-1 justify-center">
      <Button
        variant="outline"
        size="sm"
        onClick={decrementQuantity}
        disabled={localQuantity <= 0}
        className="w-8 h-8 p-0"
      >
        <Minus className="w-3 h-3" />
      </Button>
      
      <div className="relative">
        <Input
          type="number"
          value={localQuantity}
          onChange={(e) => {
            const newValue = parseInt(e.target.value) || 0;
            handleQuantityChange(newValue);
          }}
          min={0}
          max={maxQuantity}
          className="w-16 text-center text-sm"
        />
      </div>
      
      <Button
        variant="outline"
        size="sm"
        onClick={incrementQuantity}
        disabled={localQuantity >= maxQuantity}
        className="w-8 h-8 p-0"
      >
        <Plus className="w-3 h-3" />
      </Button>
    </div>
  );
};

// ProductionPlanningView Component - תצוגת תכנון ייצור
const ProductionPlanningView = ({ allOrders, updateOrder }) => {
  const [dateRange, setDateRange] = useState({
    from: startOfWeek(new Date(), { weekStartsOn: 0 }),
    to: endOfWeek(new Date(), { weekStartsOn: 0 })
  });
  const [expandedProducts, setExpandedProducts] = useState({});

  // *** State עבור ניהול הערות בתכנון ייצור - NEW ***
  const [editingProductNotes, setEditingProductNotes] = useState({});
  const [isProductNotesDialogOpen, setIsProductNotesDialogOpen] = useState({});
  const [isSavingProductNotes, setIsSavingProductNotes] = useState({});

  // אגרגציית נתונים עבור תכנון ייצור
  const productionData = useMemo(() => {
    // סינון הזמנות לפי טווח התאריכים
    const ordersInRange = allOrders.filter(order => {
      if (order.order_type !== "הזמנה_לאופות" || order.status === 'בארכיון') return false;
      
      const targetDate = order.shipment_due_date || order.pickup_preferred_date;
      if (!targetDate) return false;
      
      try {
        const orderDate = parseISO(targetDate);
        // Ensure dateRange.from and dateRange.to are valid Date objects for isWithinInterval
        const start = dateRange.from instanceof Date ? dateRange.from : parseISO(dateRange.from);
        const end = dateRange.to instanceof Date ? dateRange.to : parseISO(dateRange.to);

        // Include orders from start of "from" day to end of "to" day
        return isWithinInterval(orderDate, { start: startOfWeek(start, { weekStartsOn: 0 }), end: endOfWeek(end, { weekStartsOn: 0 }) });
      } catch (error) {
        console.error("Error parsing date for production planning:", targetDate, error);
        return false;
      }
    });

    // אגרגציה לפי מוצרים
    const productAggregation = {};
    
    ordersInRange.forEach(order => {
      if (!order.items) return;
      
      order.items.forEach((item, itemIndex) => {
        const productName = item.product_name;
        if (!productName) return;
        
        if (!productAggregation[productName]) {
          productAggregation[productName] = {
            product_name: productName,
            total_quantity: 0,
            ready_quantity: 0,
            orders: [],
            by_delivery_method: { משלוח: 0, איסוף_עצמי: 0 },
            by_target_date: {}
          };
        }
        
        const quantity = item.quantity || 0;
        const readyQuantity = item.baked_quantity || 0;
        
        productAggregation[productName].total_quantity += quantity;
        productAggregation[productName].ready_quantity += readyQuantity;
        
        // פילוח לפי אופן מסירה
        const deliveryMethod = (order.shipping_method_chosen === 'איסוף_עצמי') ? 'איסוף_עצמי' : 'משלוח';
        if (productAggregation[productName].by_delivery_method[deliveryMethod] !== undefined) {
          productAggregation[productName].by_delivery_method[deliveryMethod] += quantity;
        } else {
          productAggregation[productName].by_delivery_method[deliveryMethod] = quantity;
        }
        
        // פילוח לפי תאריך יעד
        const targetDate = order.shipment_due_date || order.pickup_preferred_date || 'ללא תאריך';
        if (!productAggregation[productName].by_target_date[targetDate]) {
          productAggregation[productName].by_target_date[targetDate] = 0;
        }
        productAggregation[productName].by_target_date[targetDate] += quantity;
        
        // הוספת פרטי הזמנה
        productAggregation[productName].orders.push({
          order_number: order.order_number ? order.order_number.replace('BAKE-', '') : order.id.slice(0, 8),
          customer_name: order.customer_name,
          target_date: targetDate,
          delivery_method: deliveryMethod,
          quantity: quantity,
          ready_quantity: readyQuantity,
          order_id: order.id,
          item_index: itemIndex,
          notes_for_baker: item.notes_for_baker // Add notes for baker to order detail
        });
      });
    });

    // *** שיפור חדש: סינון מוצרים שהושלמו ב-100% ***
    const filteredProducts = Object.values(productAggregation).filter(product => {
      // בדיקה אם המוצר הושלם ב-100%
      const isCompleted = product.ready_quantity >= product.total_quantity && product.total_quantity > 0;
      
      // אם המוצר הושלם ב-100%, לא נכלול אותו ברשימת תכנון הייצור
      if (isCompleted) {
        console.log(`✅ מוצר ${product.product_name} הושלם ב-100% (${product.ready_quantity}/${product.total_quantity}) - הוסר מתכנון ייצור`);
        return false;
      }
      
      return true;
    });

    // *** חדש: מיון לפי סדר כרונולוגי של התאריך הקרוב ביותר ***
    return filteredProducts.sort((a, b) => {
      // פונקציה לחיפוש התאריך הקרוב ביותר של מוצר
      const getEarliestDate = (product) => {
        const dates = Object.keys(product.by_target_date).filter(date => date !== 'ללא תאריך');
        if (dates.length === 0) return null; // אין תאריכים - יופיע בסוף
        
        // מיון התאריכים ולקיחת הקרוב ביותר
        const sortedDates = dates.sort((dateA, dateB) => {
          try {
            return new Date(dateA).getTime() - new Date(dateB).getTime();
          } catch (error) {
            console.error('Error parsing dates for chronological sort:', dateA, dateB);
            return 0;
          }
        });
        
        return sortedDates[0]; // התאריך הקרוב ביותר
      };
      
      const earliestDateA = getEarliestDate(a);
      const earliestDateB = getEarliestDate(b);
      
      // אם לשניהם אין תאריכים - מיון לפי שם המוצר
      if (!earliestDateA && !earliestDateB) {
        return a.product_name.localeCompare(b.product_name, 'he');
      }
      
      // אם לאחד אין תאריך - הוא יופיע בסוף
      if (!earliestDateA) return 1;
      if (!earliestDateB) return -1;
      
      // השוואה כרונולוגית
      try {
        const dateComparison = new Date(earliestDateA).getTime() - new Date(earliestDateB).getTime();
        
        // אם התאריכים זהים - מיון משני לפי שם המוצר
        if (dateComparison === 0) {
          return a.product_name.localeCompare(b.product_name, 'he');
        }
        
        return dateComparison;
      } catch (error) {
        console.error('Error in chronological comparison:', earliestDateA, earliestDateB, error);
        // במקרה של שגיאה - מיון לפי שם המוצר
        return a.product_name.localeCompare(b.product_name, 'he');
      }
    });
  }, [allOrders, dateRange]);

  // חישוב KPI
  const kpiData = useMemo(() => {
    const totalProducts = productionData.length;
    const totalUnits = productionData.reduce((sum, product) => sum + product.total_quantity, 0);
    const readyUnits = productionData.reduce((sum, product) => sum + product.ready_quantity, 0);
    const progressPercentage = totalUnits > 0 ? Math.round((readyUnits / totalUnits) * 100) : 0;
    
    let deliveryBreakdown = { משלוח: 0, איסוף_עצמי: 0 };
    productionData.forEach(product => {
      deliveryBreakdown.משלוח += product.by_delivery_method.משלוח || 0;
      deliveryBreakdown.איסוף_עצמי += product.by_delivery_method.איסוף_עצמי || 0;
    });

    return {
      totalProducts,
      totalUnits,
      readyUnits,
      progressPercentage,
      deliveryBreakdown
    };
  }, [productionData]);

  // *** פונקציה חדשה לניהול הערות מוצר בתכנון ייצור - NEW ***
  const openProductNotesDialog = (productName, orderDetail, currentNotes) => {
    const key = `${productName}-${orderDetail.order_id}-${orderDetail.item_index}`;
    setEditingProductNotes(prev => ({
      ...prev,
      [key]: currentNotes || ''
    }));
    setIsProductNotesDialogOpen(prev => ({
      ...prev,
      [key]: true
    }));
  };

  const closeProductNotesDialog = (productName, orderDetail) => {
    const key = `${productName}-${orderDetail.order_id}-${orderDetail.item_index}`;
    setIsProductNotesDialogOpen(prev => ({
      ...prev,
      [key]: false
    }));
    setEditingProductNotes(prev => {
      const newState = { ...prev };
      delete newState[key];
      return newState;
    });
  };

  const saveProductNotes = async (productName, orderDetail) => {
    const key = `${productName}-${orderDetail.order_id}-${orderDetail.item_index}`;
    const newNotes = editingProductNotes[key] || '';
    setIsSavingProductNotes(prev => ({ ...prev, [key]: true }));

    try {
      // מציאת ההזמנה הספציפית
      const targetOrder = allOrders.find(order => order.id === orderDetail.order_id);
      if (!targetOrder || !targetOrder.items) {
        throw new Error("הזמנה או פריטים לא נמצאו");
      }

      // עדכון הפריט בהזמנה
      const updatedItems = targetOrder.items.map((item, index) => {
        if (index === orderDetail.item_index && item.product_name === productName) {
          return {
            ...item,
            notes_for_baker: newNotes
          };
        }
        return item;
      });

      // עדכון ההזמנה
      await updateOrder(orderDetail.order_id, {
        items: updatedItems
      });

      // *** סינכרון הערות לכל ההזמנות עם אותו מוצר - NEW ***
      try {
        // מציאת כל ההזמנות שיש בהן את אותו מוצר
        const relatedOrders = allOrders.filter(order => 
          order.items?.some(item => item.product_name === productName)
        );

        const syncPromises = [];
        
        for (const relatedOrder of relatedOrders) {
          // Skip the order we just updated, as it's already done
          if (relatedOrder.id === orderDetail.order_id) continue; 
          
          const needsUpdate = relatedOrder.items.some(item => 
            item.product_name === productName && 
            (item.notes_for_baker || '') !== newNotes
          );

          if (needsUpdate) {
            const syncedItems = relatedOrder.items.map(item => {
              if (item.product_name === productName) {
                return {
                  ...item,
                  notes_for_baker: newNotes
                };
              }
              return item;
            });

            syncPromises.push(
              updateOrder(relatedOrder.id, { items: syncedItems })
            );
          }
        }

        if (syncPromises.length > 0) {
          await Promise.all(syncPromises);
          console.log(`✅ הערות סונכרנו ב-${syncPromises.length + 1} הזמנות עבור מוצר: ${productName}`);
        }

      } catch (syncError) {
        console.error('⚠️ שגיאה בסינכרון הערות:', syncError);
      }

      toast.success(`הערות עבור ${productName} עודכנו וסונכרנו בהצלחה!`, { duration: 4000 });
      closeProductNotesDialog(productName, orderDetail);

    } catch (error) {
      console.error('Error updating product notes:', error);
      toast.error("שגיאה בעדכון הערות המוצר. נסה שוב.", { duration: 4000 });
    } finally {
      setIsSavingProductNotes(prev => ({ ...prev, [key]: false }));
    }
  };

  // פונקציה לעדכון כמות מוכנה
  const handleProductQuantityChange = async (productName, newReadyQuantity) => {
    const toastId = toast.loading(`מעדכן כמות מוכנה עבור ${productName}...`);
    try {
      const product = productionData.find(p => p.product_name === productName);
      if (!product) {
        toast.error("מוצר לא נמצא", { id: toastId });
        return;
      }

      // Group updates by orderId to make a single update call per order
      const ordersToUpdate = new Map(); // Map<orderId, { order: Order, items: Item[] }>

      for (const orderDetail of product.orders) {
        let order = ordersToUpdate.get(orderDetail.order_id)?.order;
        if (!order) {
            order = allOrders.find(o => o.id === orderDetail.order_id);
            if (!order) continue;
            ordersToUpdate.set(orderDetail.order_id, { order: order, items: JSON.parse(JSON.stringify(order.items || [])) }); // Deep copy items
        }

        const items = ordersToUpdate.get(orderDetail.order_id).items;
        if (items && items[orderDetail.item_index]) {
            const currentItem = items[orderDetail.item_index];
            if (currentItem.product_name === productName) { // Double check product name consistency
                currentItem.baked_quantity = Math.min(newReadyQuantity, currentItem.quantity || 0);

                // Also update baking_status if necessary
                if (currentItem.baked_quantity === 0) {
                    currentItem.baking_status = 'ממתין';
                } else if (currentItem.baked_quantity >= (currentItem.quantity || 0)) {
                    currentItem.baking_status = 'הוכן';
                } else {
                    currentItem.baking_status = 'בתהליך';
                }
            }
        }
      }

      const updatePromises = [];
      for (const [orderId, data] of ordersToUpdate.entries()) {
        const orderToSave = data.order;
        const updatedItems = data.items;

        // Determine new picking_status for the order based on its items
        const allItemsCompleted = updatedItems.every(item => (item.baked_quantity || 0) >= (item.quantity || 0));
        const anyItemStarted = updatedItems.some(item => (item.baked_quantity || 0) > 0);

        let newPickingStatus = orderToSave.picking_status;
        if (allItemsCompleted) {
            // If all items are completed, the order itself is marked "הושלם"
            newPickingStatus = 'הושלם';
        } else if (anyItemStarted) {
            newPickingStatus = 'בתהליך';
        } else {
            newPickingStatus = 'לא_התחיל';
        }

        updatePromises.push(
          updateOrder(orderId, {
            items: updatedItems,
            picking_status: newPickingStatus
          })
        );
      }

      await Promise.all(updatePromises);
      toast.success(`כמות מוכנה עודכנה עבור ${productName}`, { id: toastId });
    } catch (error) {
      console.error('Error updating product quantity:', error);
      toast.error('שגיאה בעדכון כמות מוכנה', { id: toastId });
    }
  };

  // פונקציה לייצוא לאקסל
  const handleExportToExcel = () => {
    try {
      // יצירת CSV content
      const csvData = [
        ['מוצר', 'כמות כוללת', 'כמות מוכנה', 'אחוז השלמה', 'משלוח', 'איסוף עצמי', 'סטטוס', 'תאריכי יעד'].join(','),
        ...productionData.map(product => {
          const progressPercentage = product.total_quantity > 0 
            ? Math.round((product.ready_quantity / product.total_quantity) * 100) 
            : 0;
          const status = progressPercentage === 0 ? 'מתוכנן' : progressPercentage === 100 ? 'הושלם' : 'בתהליך';
          
          const targetDatesString = Object.entries(product.by_target_date)
            .map(([date, quantity]) => `${date === 'ללא תאריך' ? 'ללא תאריך' : format(parseISO(date), 'dd/MM')}: ${quantity}`)
            .join('; ');

          return [
            `"${product.product_name.replace(/"/g, '""')}"`, // Handle quotes in product name
            product.total_quantity,
            product.ready_quantity,
            `${progressPercentage}%`,
            product.by_delivery_method.משלוח || 0,
            product.by_delivery_method.איסוף_עצמי || 0,
            status,
            `"${targetDatesString.replace(/"/g, '""')}"`
          ].join(',');
        })
      ].join('\n');

      // יצירת קובץ והורדה
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `תכנון_ייצור_${format(dateRange.from, 'yyyy-MM-dd')}_${format(dateRange.to, 'yyyy-MM-dd')}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('הקובץ יוצא בהצלחה!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('שגיאה בייצוא הקובץ');
    }
  };

  // פונקציה לשמירת Snapshot
  const handleSaveSnapshot = async () => {
    try {
      // כרגע רק הודעה - בעתיד נוכל להוסיף Entity לsnapshots
      toast.info('Snapshot נשמר בהצלחה! (תכונה תתווסף בעתיד)', { duration: 3000 });
    } catch (error) {
      console.error('Snapshot error:', error);
      toast.error('שגיאה בשמירת Snapshot');
    }
  };

  const getProductStatus = (product) => {
    const progressPercentage = product.total_quantity > 0 
      ? Math.round((product.ready_quantity / product.total_quantity) * 100) 
      : 0;
    
    if (progressPercentage === 0) {
      return { status: 'planned', label: 'מתוכנן', color: 'bg-gray-100 text-gray-800' };
    } else if (progressPercentage === 100) {
      return { status: 'done', label: 'הושלם', color: 'bg-green-100 text-green-800' };
    } else {
      return { status: 'in-progress', label: 'בתהליך', color: 'bg-blue-100 text-blue-800' };
    }
  };

  return (
    <div className="space-y-6">
      {/* בורר טווח תאריכים */}
      <Card className="border-none elegant-shadow-lg bg-white/90 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">בחירת טווח תאריכים</h3>
              <p className="text-sm text-gray-600">
                טווח נבחר: {format(dateRange.from, 'dd/MM/yyyy', { locale: he })} - {format(dateRange.to, 'dd/MM/yyyy', { locale: he })}
              </p>
            </div>
            <div className="flex gap-3">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-48 justify-between">
                    <CalendarDays className="w-4 h-4 ml-2" />
                    {dateRange.from ? format(dateRange.from, 'dd/MM/yyyy', { locale: he }) : 'בחר תאריך'}
                    {' - '}
                    {dateRange.to ? format(dateRange.to, 'dd/MM/yyyy', { locale: he }) : 'בחר תאריך'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="range"
                    selected={dateRange}
                    onSelect={setDateRange}
                    locale={he}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
              <Button onClick={handleExportToExcel} variant="outline">
                <Download className="w-4 h-4 ml-2" />
                ייצוא לאקסל
              </Button>
              <Button onClick={handleSaveSnapshot} variant="outline">
                <Archive className="w-4 h-4 ml-2" />
                שמור Snapshot
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* כרטיסי KPI */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-none elegant-shadow-lg bg-white/90 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg text-blue-800">
              <Package className="w-5 h-5" />
              סה"כ מוצרים
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{kpiData.totalProducts}</div>
            <p className="text-sm text-gray-600 mt-1">מוצרים שונים לייצור</p>
          </CardContent>
        </Card>

        <Card className="border-none elegant-shadow-lg bg-white/90 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg text-green-800">
              <Factory className="w-5 h-5" />
              יחידות לייצור
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{kpiData.totalUnits}</div>
            <div className="text-sm text-gray-600 mt-1">
              <span className="text-green-600 font-semibold">{kpiData.readyUnits} מוכנות</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none elegant-shadow-lg bg-white/90 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg text-purple-800">
              <BarChart3 className="w-5 h-5" />
              אחוז התקדמות
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{kpiData.progressPercentage}%</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-purple-600 h-2 rounded-full" 
                style={{ width: `${kpiData.progressPercentage}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none elegant-shadow-lg bg-white/90 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg text-orange-800">
              <MapPin className="w-5 h-5" />
              פילוח מסירה
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">משלוח:</span>
                <span className="font-medium">{kpiData.deliveryBreakdown.משלוח}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">איסוף עצמי:</span>
                <span className="font-medium">{kpiData.deliveryBreakdown.איסוף_עצמי}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* טבלת תכנון ייצור */}
      <Card className="border-none elegant-shadow-lg bg-white/90 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <ChefHat className="w-6 h-6 text-orange-600" />
            תכנית ייצור - {productionData.length} מוצרים
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {productionData.length === 0 ? (
            <div className="p-12 text-center">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                אין נתוני ייצור
              </h3>
              <p className="text-gray-500">
                לא נמצאו הזמנות אפייה בטווח התאריכים שנבחר
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="text-right font-semibold"></TableHead>
                    <TableHead className="text-right font-semibold">מוצר</TableHead>
                    <TableHead className="text-center font-semibold">כמות כוללת</TableHead>
                    <TableHead className="text-center font-semibold">כמות מוכנה</TableHead>
                    <TableHead className="text-center font-semibold">אחוז השלמה</TableHead>
                    <TableHead className="text-center font-semibold">משלוח</TableHead>
                    <TableHead className="text-center font-semibold">איסוף עצמי</TableHead>
                    <TableHead className="text-center font-semibold">סטטוס</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productionData.map((product, index) => {
                    const productStatus = getProductStatus(product);
                    const isExpanded = expandedProducts[product.product_name];
                    
                    return (
                      <React.Fragment key={product.product_name}>
                        <TableRow className="hover:bg-gray-50">
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setExpandedProducts(prev => ({
                                ...prev,
                                [product.product_name]: !prev[product.product_name]
                              }))}
                              className="p-1"
                            >
                              {isExpanded ? 
                                <ChevronUp className="w-4 h-4" /> : 
                                <ChevronDown className="w-4 h-4" />
                              }
                            </Button>
                          </TableCell>
                          <TableCell className="font-medium">
                            {product.product_name}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge className="bg-purple-100 text-purple-800">
                              {product.total_quantity}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <ProductionQuantityControl
                              product={product}
                              onQuantityChange={handleProductQuantityChange}
                            />
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex flex-col items-center gap-1">
                              <span className="font-semibold">
                                {Math.round((product.ready_quantity / product.total_quantity) * 100)}%
                              </span>
                              <div className="w-16 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full" 
                                  style={{ 
                                    width: `${Math.round((product.ready_quantity / product.total_quantity) * 100)}%` 
                                  }}
                                ></div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline">
                              {product.by_delivery_method.משלוח || 0}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline">
                              {product.by_delivery_method.איסוף_עצמי || 0}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge className={productStatus.color}>
                              {productStatus.label}
                            </Badge>
                          </TableCell>
                        </TableRow>
                        
                        {isExpanded && (
                          <TableRow>
                            <TableCell colSpan={8} className="bg-gray-50 p-0">
                              <Collapsible open={true}>
                                <CollapsibleContent>
                                  <div className="p-4 space-y-4">
                                    {/* פילוח לפי תאריך יעד */}
                                    <div>
                                      <h4 className="font-semibold text-gray-700 mb-2">פילוח לפי תאריך יעד:</h4>
                                      <div className="flex flex-wrap gap-2">
                                        {Object.entries(product.by_target_date).sort(([dateA], [dateB]) => {
                                          if (dateA === 'ללא תאריך') return 1;
                                          if (dateB === 'ללא תאריך') return -1;
                                          return new Date(dateA).getTime() - new Date(dateB).getTime();
                                        }).map(([date, quantity]) => (
                                          <Badge key={date} variant="outline" className="bg-blue-50">
                                            {date === 'ללא תאריך' ? 'ללא תאריך' : format(parseISO(date), 'dd/MM')} - {quantity} יח׳
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>
                                    
                                    {/* רשימת הזמנות עם עמודת הערות חדשה */}
                                    <div>
                                      <h4 className="font-semibold text-gray-700 mb-2">הזמנות תורמות:</h4>
                                      <div className="overflow-x-auto">
                                        <Table>
                                          <TableHeader>
                                            <TableRow>
                                              <TableHead className="text-right">מספר הזמנה</TableHead>
                                              <TableHead className="text-right">לקוח</TableHead>
                                              <TableHead className="text-center">תאריך יעד</TableHead>
                                              <TableHead className="text-center">סוג מסירה</TableHead>
                                              <TableHead className="text-center">כמות</TableHead>
                                              <TableHead className="text-center">מוכן</TableHead>
                                              <TableHead className="text-center">הערות לאופה</TableHead>
                                            </TableRow>
                                          </TableHeader>
                                          <TableBody>
                                            {product.orders.sort((a,b) => a.customer_name?.localeCompare(b.customer_name || '', 'he')).map((orderDetail, idx) => {
                                              const key = `${product.product_name}-${orderDetail.order_id}-${orderDetail.item_index}`;
                                              
                                              return (
                                                <TableRow key={orderDetail.order_id + '-' + orderDetail.item_index} className="text-sm">
                                                  <TableCell className="font-medium">
                                                    {orderDetail.order_number}
                                                  </TableCell>
                                                  <TableCell>
                                                    {orderDetail.customer_name || '-'}
                                                  </TableCell>
                                                  <TableCell className="text-center">
                                                    {orderDetail.target_date === 'ללא תאריך' ? 
                                                      'ללא תאריך' : 
                                                      format(parseISO(orderDetail.target_date), 'dd/MM/yyyy')
                                                    }
                                                  </TableCell>
                                                  <TableCell className="text-center">
                                                    <Badge variant="outline" className="text-xs">
                                                      {orderDetail.delivery_method === 'משלוח' ? 'משלוח' : 'איסוף עצמי'}
                                                    </Badge>
                                                  </TableCell>
                                                  <TableCell className="text-center">
                                                    {orderDetail.quantity}
                                                  </TableCell>
                                                  <TableCell className="text-center">
                                                    <Badge className={
                                                      orderDetail.ready_quantity >= orderDetail.quantity 
                                                        ? 'bg-green-100 text-green-800' 
                                                        : orderDetail.ready_quantity > 0 
                                                          ? 'bg-blue-100 text-blue-800' 
                                                          : 'bg-gray-100 text-gray-800'
                                                    }>
                                                      {orderDetail.ready_quantity}/{orderDetail.quantity}
                                                    </Badge>
                                                  </TableCell>
                                                  {/* *** עמודת הערות חדשה *** */}
                                                  <TableCell className="text-center">
                                                    {/* מציאת ההערה הקיימת מההזמנה */}
                                                    {(() => {
                                                      const currentOrder = allOrders.find(o => o.id === orderDetail.order_id);
                                                      const currentItem = currentOrder?.items?.[orderDetail.item_index];
                                                      const currentNotes = currentItem?.notes_for_baker || '';
                                                      
                                                      if (currentNotes.trim()) {
                                                        return (
                                                          <TooltipProvider>
                                                            <Tooltip>
                                                              <TooltipTrigger asChild>
                                                                <div>
                                                                  <Dialog
                                                                    open={isProductNotesDialogOpen[key] || false}
                                                                    onOpenChange={(open) => {
                                                                      if (!open) {
                                                                        closeProductNotesDialog(product.product_name, orderDetail);
                                                                      }
                                                                    }}
                                                                  >
                                                                    <DialogTrigger asChild>
                                                                      <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-8 w-8 text-blue-600 hover:bg-blue-100"
                                                                        onClick={() => openProductNotesDialog(product.product_name, orderDetail, currentNotes)}
                                                                      >
                                                                        <MessageSquare className="w-4 h-4" />
                                                                      </Button>
                                                                    </DialogTrigger>

                                                                    <DialogContent className="max-w-md">
                                                                      <DialogHeader>
                                                                        <DialogTitle className="flex items-center gap-2 text-blue-800">
                                                                          <ChefHat className="w-5 h-5" />
                                                                          הערות לאופה - {product.product_name}
                                                                        </DialogTitle>
                                                                        <DialogDescription>
                                                                          ערוך את ההערות המיוחדות עבור מוצר זה (יסתנכרנו בכל ההזמנות)
                                                                        </DialogDescription>
                                                                      </DialogHeader>

                                                                      <div className="space-y-4 py-4">
                                                                        <div>
                                                                          <Label htmlFor={`notes-${key}`} className="text-sm font-medium text-gray-700">
                                                                            הערות:
                                                                          </Label>
                                                                          <Textarea
                                                                            id={`notes-${key}`}
                                                                            value={editingProductNotes[key] || ''}
                                                                            onChange={(e) => setEditingProductNotes(prev => ({
                                                                              ...prev,
                                                                              [key]: e.target.value
                                                                            }))}
                                                                            placeholder="הכנס הערות מיוחדות לאופה..."
                                                                            className="mt-2 min-h-24 bg-yellow-50 border-yellow-200 focus:border-yellow-400"
                                                                            dir="rtl"
                                                                          />
                                                                        </div>
                                                                      </div>

                                                                      <div className="flex justify-end gap-2 pt-4 border-t">
                                                                        <Button
                                                                          variant="outline"
                                                                          onClick={() => closeProductNotesDialog(product.product_name, orderDetail)}
                                                                          disabled={isSavingProductNotes[key]}
                                                                        >
                                                                          <X className="w-4 h-4 ml-2" />
                                                                          ביטול
                                                                        </Button>
                                                                        <Button
                                                                          onClick={() => saveProductNotes(product.product_name, orderDetail)}
                                                                          disabled={isSavingProductNotes[key]}
                                                                          className="bg-blue-600 hover:bg-blue-700"
                                                                        >
                                                                          {isSavingProductNotes[key] ? (
                                                                            <>
                                                                              <div className="w-4 h-4 ml-2 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                                                              שומר...
                                                                            </>
                                                                          ) : (
                                                                            <>
                                                                              <Save className="w-4 h-4 ml-2" />
                                                                              שמור הערות
                                                                            </>
                                                                          )}
                                                                        </Button>
                                                                      </div>
                                                                    </DialogContent>
                                                                  </Dialog>
                                                                </div>
                                                              </TooltipTrigger>
                                                              <TooltipContent className="max-w-xs p-3 bg-yellow-100 border border-yellow-200">
                                                                <div className="text-sm">
                                                                  <div className="font-semibold text-yellow-800 mb-1">הערות לאופה:</div>
                                                                  <div className="text-yellow-700 whitespace-pre-wrap">{currentNotes}</div>
                                                                  <div className="text-xs text-yellow-600 mt-2 italic">
                                                                    לחץ לעריכה
                                                                  </div>
                                                                </div>
                                                              </TooltipContent>
                                                            </Tooltip>
                                                          </TooltipProvider>
                                                        );
                                                      } else {
                                                        return (
                                                          <Dialog
                                                            open={isProductNotesDialogOpen[key] || false}
                                                            onOpenChange={(open) => {
                                                              if (!open) {
                                                                closeProductNotesDialog(product.product_name, orderDetail);
                                                              }
                                                            }}
                                                          >
                                                            <DialogTrigger asChild>
                                                              <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="text-blue-600 border-blue-300 hover:bg-blue-50 hover:border-blue-400 text-xs h-7 px-2"
                                                                onClick={() => openProductNotesDialog(product.product_name, orderDetail, '')}
                                                              >
                                                                <Plus className="w-3 h-3 ml-1" />
                                                                הוסף הערה
                                                              </Button>
                                                            </DialogTrigger>

                                                            <DialogContent className="max-w-md">
                                                              <DialogHeader>
                                                                <DialogTitle className="flex items-center gap-2 text-blue-800">
                                                                  <ChefHat className="w-5 h-5" />
                                                                  הוסף הערות לאופה - {product.product_name}
                                                                </DialogTitle>
                                                                <DialogDescription>
                                                                  הוסף הערות מיוחדות עבור מוצר זה (יסתנכרנו בכל ההזמנות)
                                                                </DialogDescription>
                                                              </DialogHeader>

                                                              <div className="space-y-4 py-4">
                                                                <div>
                                                                  <Label htmlFor={`notes-${key}`} className="text-sm font-medium text-gray-700">
                                                                    הערות:
                                                                  </Label>
                                                                  <Textarea
                                                                    id={`notes-${key}`}
                                                                    value={editingProductNotes[key] || ''}
                                                                    onChange={(e) => setEditingProductNotes(prev => ({
                                                                      ...prev,
                                                                      [key]: e.target.value
                                                                    }))}
                                                                    placeholder="הכנס הערות מיוחדות לאופה (כיתוב על עוגה, עיצוב מיוחד, דרישות אלרגיה)..."
                                                                    className="mt-2 min-h-24 bg-yellow-50 border-yellow-200 focus:border-yellow-400"
                                                                    dir="rtl"
                                                                  />
                                                                </div>
                                                              </div>

                                                              <div className="flex justify-end gap-2 pt-4 border-t">
                                                                <Button
                                                                  variant="outline"
                                                                  onClick={() => closeProductNotesDialog(product.product_name, orderDetail)}
                                                                  disabled={isSavingProductNotes[key]}
                                                                >
                                                                  <X className="w-4 h-4 ml-2" />
                                                                  ביטול
                                                                </Button>
                                                                <Button
                                                                  onClick={() => saveProductNotes(product.product_name, orderDetail)}
                                                                  disabled={isSavingProductNotes[key]}
                                                                  className="bg-blue-600 hover:bg-blue-700"
                                                                >
                                                                  {isSavingProductNotes[key] ? (
                                                                    <>
                                                                      <div className="w-4 h-4 ml-2 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                                                      שומר...
                                                                    </>
                                                                  ) : (
                                                                    <>
                                                                      <Save className="w-4 h-4 ml-2" />
                                                                      שמור הערות
                                                                    </>
                                                                  )}
                                                                </Button>
                                                              </div>
                                                            </DialogContent>
                                                          </Dialog>
                                                        );
                                                      }
                                                    })()}
                                                  </TableCell>
                                                </TableRow>
                                              );
                                            })}
                                          </TableBody>
                                        </Table>
                                      </div>
                                    </div>
                                  </div>
                                </CollapsibleContent>
                              </Collapsible>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};


// BakingOrderCard Component - עדכון לרכיב הכרטיס
const BakingOrderCard = ({
  order,
  expandedItems,
  onArchiveOrder,
  onSaveProgress,
  markBakingOrderAsCompleted,
  onQuantityChange,
  openNotesDialog,
  closeNotesDialog,
  saveNotes,
  editingNotes,
  isDialogOpen,
  isSaving,
  setEditingNotes,
  setIsDialogOpen,
  getShippingMethod,
  getBakingStatusBadge,
  shouldShowPickupTime,
  getPickupTimeDisplay,
}) => {
  return (
    <div key={order.id} className="border rounded-lg p-4 bg-gray-50">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
        <div>
          <h4 className="font-bold text-lg flex items-center gap-2">
            <User className="w-5 h-5 text-gray-600" />
            {order.customer_name}
          </h4>
          <p className="text-gray-600 text-sm flex items-center gap-1">
            <Hash className="w-3 h-3" />
            הזמנה מקורית: {order.order_number ? order.order_number.replace('BAKE-', '') : order.original_order_id}
          </p>
          <p className="text-sm text-gray-500 flex items-center gap-1">
            <Package className="w-3 h-3" />
            {getShippingMethod(order)}
          </p>
          {shouldShowPickupTime(order) && getPickupTimeDisplay(order) && (
            <p className="text-sm text-orange-600 font-medium flex items-center gap-1 mt-1">
              <Clock className="w-3 h-3" />
              זמן איסוף מתוכנן: {getPickupTimeDisplay(order)}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
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
                <AlertDialogTitle>העברה לארכיון</AlertDialogTitle>
                <AlertDialogDescription>
                  האם אתה בטוח שברצונך להעביר לארכיון את הזמנת האפייה של {order.customer_name}?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>ביטול</AlertDialogCancel>
                <AlertDialogAction onClick={() => onArchiveOrder(order.id)}>
                  העבר לארכיון
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          {getBakingStatusBadge(order.picking_status)}
        </div>
      </div>

      <div className="overflow-x-auto mb-4">
        <TooltipProvider>
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="text-right font-semibold">מוצר</TableHead>
                <TableHead className="text-right font-semibold">מיקום במחסן</TableHead>
                <TableHead className="text-center font-semibold">כמות כוללת</TableHead>
                <TableHead className="text-center font-semibold">התקדמות אפייה</TableHead>
                <TableHead className="text-center font-semibold">הערות לאופה</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expandedItems.map((item, itemDisplayIndex) => {
                const actualItemIndex = order.items.findIndex(originalItem =>
                  originalItem.product_name === item._original_item_id
                );
                const key = `${order.id}-${actualItemIndex}`;

                return (
                  <TableRow
                    key={`${order.id}-${item.product_name}-${item.location}-${itemDisplayIndex}`}
                    className="hover:bg-gray-50"
                  >
                    <TableCell className="font-medium max-w-xs">
                      <div className="break-words">
                        {item.product_name}
                        {item._expanded_from_breakdown && (
                          <div className="text-xs text-blue-600 mt-1">
                            (פירוט: {item.location})
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {item.location ? (
                          <Badge
                            variant="outline"
                            className="text-xs bg-blue-50 border-blue-200 text-blue-800"
                          >
                            <MapPin className="w-3 h-3 ml-1" />
                            {item.location}
                          </Badge>
                        ) : (
                          <span className="text-gray-400 text-xs italic">לא צוין מיקום</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className="bg-purple-100 text-purple-800">
                        {item.quantity || 1}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <BakingQuantityControl
                        item={item}
                        orderId={order.id}
                        itemIndex={actualItemIndex}
                        onQuantityChange={onQuantityChange}
                      />
                    </TableCell>
                    <TableCell className="text-center">
                      {item.notes_for_baker && item.notes_for_baker.trim() ? (
                        <div className="flex items-center justify-center">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div>
                                  <Dialog
                                    open={isDialogOpen[key] || false}
                                    onOpenChange={(open) => {
                                      if (!open) {
                                        closeNotesDialog(order.id, actualItemIndex);
                                      }
                                    }}
                                  >
                                    <DialogTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-blue-600 hover:bg-blue-100"
                                        onClick={() => openNotesDialog(order.id, actualItemIndex, item.notes_for_baker)}
                                      >
                                        <MessageSquare className="w-4 h-4" />
                                      </Button>
                                    </DialogTrigger>

                                    <DialogContent className="max-w-md">
                                      <DialogHeader>
                                        <DialogTitle className="flex items-center gap-2 text-blue-800">
                                          <ChefHat className="w-5 h-5" />
                                          הערות לאופה - {item.product_name}
                                        </DialogTitle>
                                        <DialogDescription>
                                          ערוך את ההערות המיוחדות עבור מוצר זה
                                        </DialogDescription>
                                      </DialogHeader>

                                      <div className="space-y-4 py-4">
                                        <div>
                                          <Label htmlFor={`notes-${key}`} className="text-sm font-medium text-gray-700">
                                            הערות:
                                          </Label>
                                          <Textarea
                                            id={`notes-${key}`}
                                            value={editingNotes[key] || ''}
                                            onChange={(e) => setEditingNotes(prev => ({
                                              ...prev,
                                              [key]: e.target.value
                                            }))}
                                            placeholder="הכנס הערות מיוחדות לאופה..."
                                            className="mt-2 min-h-24 bg-yellow-50 border-yellow-200 focus:border-yellow-400"
                                            dir="rtl"
                                          />
                                        </div>
                                      </div>

                                      <div className="flex justify-end gap-2 pt-4 border-t">
                                        <Button
                                          variant="outline"
                                          onClick={() => closeNotesDialog(order.id, actualItemIndex)}
                                          disabled={isSaving[key]}
                                        >
                                          <X className="w-4 h-4 ml-2" />
                                          ביטול
                                        </Button>
                                        <Button
                                          onClick={() => saveNotes(order.id, actualItemIndex)}
                                          disabled={isSaving[key]}
                                          className="bg-blue-600 hover:bg-blue-700"
                                        >
                                          {isSaving[key] ? (
                                            <>
                                              <div className="w-4 h-4 ml-2 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                              שומר...
                                            </>
                                          ) : (
                                            <>
                                              <Save className="w-4 h-4 ml-2" />
                                              שמור הערות
                                            </>
                                          )}
                                        </Button>
                                      </div>
                                    </DialogContent>
                                  </Dialog>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent className="max-w-xs p-3 bg-yellow-100 border border-yellow-200">
                                <div className="text-sm">
                                  <div className="font-semibold text-yellow-800 mb-1">הערות לאופה:</div>
                                  <div className="text-yellow-700 whitespace-pre-wrap">{item.notes_for_baker}</div>
                                  <div className="text-xs text-yellow-600 mt-2 italic">
                                    לחץ לעריכה
                                  </div>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      ) : (
                        <Dialog
                          open={isDialogOpen[key] || false}
                          onOpenChange={(open) => {
                            if (!open) {
                              closeNotesDialog(order.id, actualItemIndex);
                            }
                          }}
                        >
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-blue-600 border-blue-300 hover:bg-blue-50 hover:border-blue-400 text-xs h-7 px-2"
                              onClick={() => openNotesDialog(order.id, actualItemIndex, '')}
                            >
                              <Plus className="w-3 h-3 ml-1" />
                              הוסף הערה
                            </Button>
                          </DialogTrigger>

                          <DialogContent className="max-w-md">
                            <DialogHeader>
                              <DialogTitle className="flex items-center gap-2 text-blue-800">
                                <ChefHat className="w-5 h-5" />
                                הוסף הערות לאופה - {item.product_name}
                              </DialogTitle>
                              <DialogDescription>
                                הוסף הערות מיוחדות עבור מוצר זה
                              </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-4 py-4">
                              <div>
                                <Label htmlFor={`notes-${key}`} className="text-sm font-medium text-gray-700">
                                  הערות:
                                </Label>
                                <Textarea
                                  id={`notes-${key}`}
                                  value={editingNotes[key] || ''}
                                  onChange={(e) => setEditingNotes(prev => ({
                                    ...prev,
                                    [key]: e.target.value
                                  }))}
                                  placeholder="הכנס הערות מיוחדות לאופה (כיתוב על עוגה, עיצוב מיוחד, דרישות אלרגיה)..."
                                  className="mt-2 min-h-24 bg-yellow-50 border-yellow-200 focus:border-yellow-400"
                                  dir="rtl"
                                />
                              </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-4 border-t">
                              <Button
                                variant="outline"
                                onClick={() => closeNotesDialog(order.id, actualItemIndex)}
                                disabled={isSaving[key]}
                              >
                                <X className="w-4 h-4 ml-2" />
                                ביטול
                              </Button>
                              <Button
                                onClick={() => saveNotes(order.id, actualItemIndex)}
                                disabled={isSaving[key]}
                                className="bg-blue-600 hover:bg-blue-700"
                              >
                                {isSaving[key] ? (
                                  <>
                                    <div className="w-4 h-4 ml-2 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                    שומר...
                                  </>
                                ) : (
                                  <>
                                    <Save className="w-4 h-4 ml-2" />
                                    שמור הערות
                                  </>
                                )}
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TooltipProvider>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button variant="outline" onClick={() => onSaveProgress(order)}>
          <Save className="w-4 h-4 ml-2" />
          שמור
        </Button>
        <Button
          onClick={() => markBakingOrderAsCompleted(order)}
          disabled={!order.items || order.items.some(i => (i.baked_quantity || 0) < (i.quantity || 0))}
          className="bg-green-600 hover:bg-green-700"
        >
          <CheckCircle className="w-4 h-4 ml-2" />
          הושלם
        </Button>
      </div>
    </div>
  );
};

export default function BakersPage() {
  // *** שימוש בקונטקסט הגלובלי במקום טעינה נפרדת - NEW ***
  const {
    orders: allOrders,
    isLoading: ordersLoading,
    updateOrder,
    refreshOrders
  } = useOrders();

  const [bakingOrdersByDate, setBakingOrdersByDate] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // State עבור ניהול הערות האופה - NEW
  const [editingNotes, setEditingNotes] = useState({});
  const [isDialogOpen, setIsDialogOpen] = useState({});
  const [isSaving, setIsSaving] = useState({});

  // *** חדש: מצב חיפוש ***
  const [searchTerm, setSearchTerm] = useState('');

  // *** חדש: מצב לניהול פתיחה/סגירה של תאריכים ***
  const [expandedDates, setExpandedDates] = useState({});

  // *** חדש: מצב לטאבים ***
  const [activeTab, setActiveTab] = useState('baking-orders');

  // *** חדש: פונקציה לטיפול בלחיצה על תאריך ***
  const toggleDateExpansion = (dateKey) => {
    setExpandedDates(prev => ({
      ...prev,
      [dateKey]: !prev[dateKey]
    }));
  };

  // Constants for baking-relevant locations wrapped in useMemo
  const BAKING_RELEVANT_LOCATIONS = useMemo(() => ["טרי מטבח", "טרי מטבח לאפייה"], []);

  // Helper function to check if item is relevant for baking based on location wrapped in useCallback
  const isItemRelevantForBaking = useCallback((item) => {
    // Check location_breakdown first
    if (item.location_breakdown && item.location_breakdown.length > 0) {
      return item.location_breakdown.some(breakdown =>
        BAKING_RELEVANT_LOCATIONS.includes(breakdown.location)
      );
    }
    // Fallback to single location
    return BAKING_RELEVANT_LOCATIONS.includes(item.location);
  }, [BAKING_RELEVANT_LOCATIONS]);

  // Helper function to filter items to show only baking-relevant locations wrapped in useCallback
  const filterBakingRelevantItems = useCallback((items) => {
    return items.filter(item => isItemRelevantForBaking(item));
  }, [isItemRelevantForBaking]);

  // Helper function to expand items by location breakdown - now filtered for baking locations only
  const expandItemsByLocation = useCallback((items) => {
    const expandedItems = [];

    // First filter to only baking-relevant items
    const bakingRelevantItems = filterBakingRelevantItems(items);

    bakingRelevantItems.forEach(item => {
      // Check if item has location breakdown.
      if (item.location_breakdown && item.location_breakdown.length > 0) {
        // Filter breakdown entries to only include baking-relevant ones
        const relevantBreakdowns = item.location_breakdown.filter(breakdown =>
          BAKING_RELEVANT_LOCATIONS.includes(breakdown.location)
        );

        if (relevantBreakdowns.length > 0) {
          // If there are relevant breakdowns, create expanded items for each
          relevantBreakdowns.forEach(breakdown => {
            expandedItems.push({
              ...item, // Keep all original item properties
              // Override with breakdown specific data for display
              location: breakdown.location,
              quantity: breakdown.quantity, // Use breakdown quantity for display
              location_breakdown: [breakdown], // Keep as array for consistency (though this might not be strictly necessary for display)
              // Add identifier for display logic
              _expanded_from_breakdown: true,
              _original_item_id: item.product_name // This is used to find the original item for status update
            });
          });
        }
      } else {
        // If no breakdown or empty breakdown, and it passed filterBakingRelevantItems (which is already done)
        expandedItems.push({
          ...item,
          _original_item_id: item.product_name // Also add this for consistency when finding original item
        });
      }
    });

    return expandedItems;
  }, [BAKING_RELEVANT_LOCATIONS, filterBakingRelevantItems]);

  // פונקציות ניהול הערות האופה - NEW
  const openNotesDialog = (orderId, itemIndex, currentNotes) => {
    const key = `${orderId}-${itemIndex}`;
    setEditingNotes(prev => ({
      ...prev,
      [key]: currentNotes || ''
    }));
    setIsDialogOpen(prev => ({
      ...prev,
      [key]: true
    }));
  };

  const closeNotesDialog = (orderId, itemIndex) => {
    const key = `${orderId}-${itemIndex}`;
    setIsDialogOpen(prev => ({
      ...prev,
      [key]: false
    }));
    setEditingNotes(prev => {
      const newState = { ...prev };
      delete newState[key];
      return newState;
    });
  };

  // פונקציה משופרת לסינכרון תאריכים אוטומטי - ENHANCED
  const syncDatesFromOriginalOrder = useCallback(async (bakingOrderId, originalOrderId) => {
    try {
      console.log(`🔄 בודק סינכרון תאריכים: ${bakingOrderId} ← ${originalOrderId}`);

      // *** שימוש בקונטקסט הגלובלי במקום טעינה נפרדת - OPTIMIZED ***
      const originalOrder = allOrders.find(order => order.id === originalOrderId);
      const bakingOrder = allOrders.find(order => order.id === bakingOrderId);

      if (!originalOrder || !bakingOrder) {
        console.warn('⚠️ אחת מההזמנות לא נמצאה בקונטקסט לסינכרון תאריכים');
        return false;
      }

      // בדוק האם יש הבדלים בתאריכים
      const needsUpdate = {};

      // בדיקת תאריך משלוח
      if (originalOrder.shipment_due_date &&
          originalOrder.shipment_due_date !== bakingOrder.shipment_due_date) {
        needsUpdate.shipment_due_date = originalOrder.shipment_due_date;
        console.log(`📅 תאריך משלוח שונה: ${bakingOrder.shipment_due_date} → ${originalOrder.shipment_due_date}`);
      }

      // בדיקת תאריך איסוף
      if (originalOrder.pickup_preferred_date &&
          originalOrder.pickup_preferred_date !== bakingOrder.pickup_preferred_date) {
        needsUpdate.pickup_preferred_date = originalOrder.pickup_preferred_date;
        console.log(`📅 תאריך איסוף שונה: ${bakingOrder.pickup_preferred_date} → ${originalOrder.pickup_preferred_date}`);
      }

      // בדיקת שעת איסוף
      if (originalOrder.pickup_preferred_time &&
          originalOrder.pickup_preferred_time !== bakingOrder.pickup_preferred_time) {
        needsUpdate.pickup_preferred_time = originalOrder.pickup_preferred_time;
        console.log(`🕐 שעת איסוף שונה: ${bakingOrder.pickup_preferred_time} → ${originalOrder.pickup_preferred_time}`);
      }

      // אם יש עדכונים נדרשים
      if (Object.keys(needsUpdate).length > 0) {
        // *** שימוש בפונקציית העדכון מהקונטקסט - OPTIMIZED ***
        await updateOrder(bakingOrderId, needsUpdate);
        console.log(`✅ תאריכים עודכנו בהזמנת אפייה: ${bakingOrderId}`, needsUpdate);

        // עדכן גם את המצב המקומי
        setBakingOrdersByDate(prevData => {
          const newData = { ...prevData };
          let orderUpdated = false;
          // Iterate through dates to find the correct order and update it
          for (const dateKey in newData) {
            const orders = newData[dateKey];
            const orderIndex = orders.findIndex(o => o.id === bakingOrderId);
            if (orderIndex !== -1) {
              const updatedOrder = {
                ...orders[orderIndex],
                ...needsUpdate
              };
              // If the shipment_due_date changed, the order might need to move to a different date group
              const oldDateKey = orders[orderIndex].shipment_due_date || orders[orderIndex].pickup_preferred_date || 'ללא תאריך';
              const newDateKey = updatedOrder.shipment_due_date || updatedOrder.pickup_preferred_date || 'ללא תאריך';

              if (oldDateKey !== newDateKey) {
                // Remove from old date key
                newData[dateKey] = orders.filter(o => o.id !== bakingOrderId);
                // Add to new date key (or create new key)
                if (!newData[newDateKey]) {
                  newData[newDateKey] = [];
                }
                newData[newDateKey].push(updatedOrder);
                // Sort the orders within the new date key
                newData[newDateKey].sort((a, b) => (a.customer_name || '').localeCompare(b.customer_name || '', 'he'));
                // Clean up empty old date keys if necessary
                if (newData[dateKey].length === 0) {
                    delete newData[dateKey];
                }
              } else {
                // Same date key, just update in place
                orders[orderIndex] = updatedOrder;
              }
              orderUpdated = true;
              break;
            }
          }

          // If the order wasn't found or moved, we need to re-sort the top-level keys
          if (orderUpdated) {
            const sortedKeys = Object.keys(newData).sort((a, b) => {
              if (a === 'ללא תאריך') return 1;
              if (b === 'ללא תאריך') return -1;
              return new Date(a).getTime() - new Date(b).getTime();
            });

            const sortedGroupedOrders = {};
            for (const key of sortedKeys) {
              sortedGroupedOrders[key] = newData[key];
            }
            return sortedGroupedOrders;
          }
          return newData; // No update needed or order not found
        });

        return true;
      } else {
        console.log(`✅ תאריכים מסונכרנים - אין צורך בעדכון: ${bakingOrderId}`);
        return false;
      }
    } catch (error) {
      console.error('❌ שגיאה בסינכרון תאריכים:', error);
      return false;
    }
  }, [allOrders, updateOrder]); // *** תלות בקונטקסט הגלובלי ***

  // עדכון פונקציית השמירה עם סינכרון משופר - ENHANCED
  const saveNotes = async (orderId, itemIndex) => {
    const key = `${orderId}-${itemIndex}`;
    const newNotes = editingNotes[key] || '';
    setIsSaving(prev => ({ ...prev, [key]: true }));

    try {
      let targetOrder = null;
      let targetDateKey = null;
      for (const [dateKey, orders] of Object.entries(bakingOrdersByDate)) {
        const found = orders.find(order => order.id === orderId);
        if (found) {
          targetOrder = found;
          targetDateKey = dateKey;
          break;
        }
      }

      if (!targetOrder) {
        throw new Error("הזמנה לא נמצאה");
      }

      // עדכן את הפריט בהזמנת האפייה
      const updatedItems = targetOrder.items.map((item, index) => {
        if (index === itemIndex) {
          return {
            ...item,
            notes_for_baker: newNotes
          };
        }
        return item;
      });

      // *** שימוש בפונקציית העדכון מהקונטקסט - OPTIMIZED ***
      await updateOrder(orderId, {
        items: updatedItems
      });

      let wasDateUpdated = false;
      // *** סינכרון דו-כיווני: עדכן גם את ההזמנה המקורית וסנכרן תאריכים ***
      if (targetOrder.original_order_id) {
        try {
          // *** שימוש בקונטקסט הגלובלי במקום טעינה נפרדת - OPTIMIZED ***
          const originalOrder = allOrders.find(order => order.id === targetOrder.original_order_id);

          if (originalOrder) {
            // עדכן את הפריט המתאים בהזמנה המקורית
            const updatedOriginalItems = originalOrder.items?.map(originalItem => {
              const bakingItem = updatedItems.find(bakingItem =>
                bakingItem.product_name === originalItem.product_name
              );

              if (bakingItem) {
                return {
                  ...originalItem,
                  notes_for_baker: bakingItem.notes_for_baker // סינכרון הערות האופה
                };
              }
              return originalItem;
            }) || [];

            // *** שימוש בפונקציית העדכון מהקונטקסט - OPTIMIZED ***
            await updateOrder(targetOrder.original_order_id, {
              items: updatedOriginalItems
            });

            console.log('✅ הערות סונכרנו בהצלחה להזמנה המקורית:', targetOrder.original_order_id);

            // *** בדיקה וסינכרון תאריכים אוטומטי - NEW ***
            wasDateUpdated = await syncDatesFromOriginalOrder(orderId, targetOrder.original_order_id);
          }
        } catch (syncError) {
          console.error('⚠️ שגיאה בסינכרון הערות או תאריכים להזמנה המקורית:', syncError);
          // לא נפסיק את התהליך בגלל שגיאת סינכרון
        }
      }

      // עדכן את המצב המקומי מיידית
      setBakingOrdersByDate(prevData => {
        const newData = { ...prevData };
        // If dates were updated by syncDatesFromOriginalOrder, the state is already updated there.
        // Otherwise, update notes locally.
        if (!wasDateUpdated && newData[targetDateKey]) {
          const orderIndex = newData[targetDateKey].findIndex(o => o.id === orderId);
          if (orderIndex !== -1) {
            newData[targetDateKey][orderIndex] = {
              ...newData[targetDateKey][orderIndex],
              items: updatedItems
            };
          }
        }
        return newData;
      });

      if (wasDateUpdated) {
        toast.success("הערות עודכנו ותאריכים סונכרנו אוטומטית!", { duration: 4000 });
      } else if (targetOrder.original_order_id) {
        toast.success("הערות עודכנו וסונכרנו בהצלחה!", { duration: 3000 });
      } else {
        toast.success("הערות האופה עודכנו בהצלחה!", { duration: 3000 });
      }

      // סגור את הדיאלוג
      closeNotesDialog(orderId, itemIndex);

    } catch (error) {
      console.error('Error updating baker notes:', error);
      toast.error("שגיאה בעדכון הערות האופה. נסה שוב.", { duration: 4000 });
    } finally {
      setIsSaving(prev => ({ ...prev, [key]: false }));
    }
  };

  // *** פונקציית טעינה מהירה מהקונטקסט הגלובלי - SUPER OPTIMIZED ***
  const loadBakingOrders = useCallback(async (isRefresh = false) => {
    // אם הקונטקסט הגלובלי עדיין טוען, המתן
    if (ordersLoading && !isRefresh) {
      setIsLoading(true);
      return;
    }

    if (!isRefresh) setIsLoading(true);
    setIsRefreshing(true);

    try {
      console.log('🚀 טוען הזמנות אפייה מהקונטקסט הגלובלי (ללא DB queries!)...');

      // רענון הקונטקסט הגלובלי אם נדרש
      if (isRefresh) {
        await refreshOrders();
        // After refresh, allOrders will update, triggering this effect again.
        // So, we can return here to avoid processing old data.
        return;
      }

      // *** עיבוד מהיר מהנתונים שכבר בזיכרון - SUPER FAST ***
      // 1. סנן הזמנות אפייה פעילות מהקונטקסט הגלובלי
      const activeBakingOrders = allOrders.filter(order =>
        order.order_type === "הזמנה_לאופות" &&
        order.picking_status !== 'הושלם' &&
        order.status !== 'בארכיון'
      );

      // 2. צור מפה של ההזמנות המקוריות מהקונטקסט הגלובלי
      const originalOrdersMap = new Map();
      allOrders.forEach(order => {
        if (order.order_type !== 'הזמנה_לאופות') { // Only consider original orders
          originalOrdersMap.set(order.id, order);
        }
      });

      console.log(`📊 נמצאו ${activeBakingOrders.length} הזמנות אפייה פעילות`);
      console.log(`📊 נמצאו ${originalOrdersMap.size} הזמנות מקוריות בזיכרון`);

      // 3. עבד את הזמנות האפייה באופן יעיל (ללא DB queries!)
      const enrichedOrders = activeBakingOrders.map(bakingOrder => {
        const originalOrder = originalOrdersMap.get(bakingOrder.original_order_id);
        let updatedBakingOrder = { ...bakingOrder };

        if (originalOrder) {
          let needsOriginalNotesUpdate = false; // Flag to track if original notes need update

          // סינכרון דו-כיווני של פריטים (לצורך תצוגה בלבד)
          const syncedItems = bakingOrder.items?.map(bakingItem => {
            const originalItem = originalOrder.items?.find(
              origItem => origItem.product_name === bakingItem.product_name
            );

            const currentBakingNotes = bakingItem.notes_for_baker || '';
            const currentOriginalNotes = originalItem?.notes_for_baker || '';

            // prioritize baking item's notes if present, else original's
            const effectiveNotes = currentBakingNotes || currentOriginalNotes;

            if (effectiveNotes && effectiveNotes !== currentOriginalNotes) {
              needsOriginalNotesUpdate = true;
            }

            return {
              ...bakingItem,
              // סינכרון מיקומים מההזמנה המקורית
              location: originalItem?.location || bakingItem.location || '',
              location_breakdown: originalItem?.location_breakdown || bakingItem.location_breakdown || [],
              // שמור על הערות האופה מהזמנת האפייה (עדיפות גבוהה יותר)
              notes_for_baker: effectiveNotes, // Use the prioritized notes
              // וודא שיש baked_quantity עם ברירת מחדל
              baked_quantity: bakingItem.baked_quantity || 0
            };
          }) || [];

          // סינכרון דו-כיווני של תאריכים (לצורך תצוגה בלבד)
          updatedBakingOrder = {
            ...bakingOrder, // מתחיל מהזמנת האפייה
            items: syncedItems,
            // מידע משלוח מההזמנה המקורית (אלו התאריכים והשיטות שהלקוח בחר)
            shipping_method_chosen: originalOrder.shipping_method_chosen,
            courier_company: originalOrder.courier_company,
            // שימוש בתאריכים מההזמנה המקורית כברירת מחדל אם אין בהזמנת האפייה,
            // אחרת העדיפות היא לנתונים של הזמנת האפייה
            pickup_preferred_date: bakingOrder.pickup_preferred_date || originalOrder.pickup_preferred_date,
            pickup_preferred_time: bakingOrder.pickup_preferred_time || originalOrder.pickup_preferred_time,
            shipment_due_date: bakingOrder.shipment_due_date || originalOrder.shipment_due_date,
          };

          // אם יש הערות "חדשות" (שונות) בהזמנת האפייה, סנכרן להזמנה המקורית
          if (needsOriginalNotesUpdate) {
            try {
              const updatedOriginalItems = originalOrder.items?.map(originalItem => {
                const syncedItem = syncedItems.find(
                  syncedItem => syncedItem.product_name === originalItem.product_name
                );

                // Only update notes for the specific item if they differ and the synced item has a value
                if (syncedItem && syncedItem.notes_for_baker !== (originalItem.notes_for_baker || '')) {
                  return {
                    ...originalItem,
                    notes_for_baker: syncedItem.notes_for_baker
                  };
                }
                return originalItem;
              }) || [];

              // *** שימוש בפונקציית העדכון מהקונטקסט - OPTIMIZED ***
              // This is a direct update to the database via the context's updateOrder
              updateOrder(bakingOrder.original_order_id, {
                items: updatedOriginalItems
              });

              console.log('🔄 סינכרון הערות אופה להזמנה מקורית בעת טעינה:', bakingOrder.original_order_id);
            } catch (syncError) {
              console.error('⚠️ שגיאה בסינכרון הערות להזמנה המקורית בעת טעינה:', syncError);
            }
          }
        }

        // וודא שיש baking_status לכל פריט
        if (updatedBakingOrder.items) {
          updatedBakingOrder.items = updatedBakingOrder.items.map(item => ({
            ...item,
            baking_status: item.baking_status || 'ממתין',
            notes_for_baker: item.notes_for_baker || '',
            baked_quantity: item.baked_quantity || 0 // ודא שיש ברירת מחדל חדש
          }));
        }
        return updatedBakingOrder;
      });

      // קיבוץ ההזמנות לפי תאריך היעד
      const groupedOrders = enrichedOrders.reduce((acc, order) => {
        // רק הזמנות עם פריטים רלוונטיים לאפייה
        const hasBakingRelevantItems = expandItemsByLocation(order.items || []).length > 0;
        if (!hasBakingRelevantItems) {
            return acc;
        }

        // קביעת תאריך יעד: תאריך משלוח או תאריך איסוף עצמי
        let targetDate = 'ללא תאריך';

        if (order.shipment_due_date) {
          targetDate = order.shipment_due_date;
        } else if (order.pickup_preferred_date) {
          targetDate = order.pickup_preferred_date;
        }

        if (!acc[targetDate]) {
          acc[targetDate] = [];
        }
        acc[targetDate].push(order);
        return acc;
      }, {});

      // מיון תאריכים
      const sortedKeys = Object.keys(groupedOrders).sort((a, b) => {
        if (a === 'ללא תאריך') return 1;
        if (b === 'ללא תאריך') return -1;
        return new Date(a).getTime() - new Date(b).getTime();
      });

      const sortedGroupedOrders = {};
      for (const key of sortedKeys) {
        // Sort orders within each date group by customer name
        sortedGroupedOrders[key] = groupedOrders[key].sort((a, b) => (a.customer_name || '').localeCompare(b.customer_name || '', 'he'));
      }

      setBakingOrdersByDate(sortedGroupedOrders);
      console.log('✅ טעינה מהירה מהקונטקסט הושלמה בהצלחה!');

      // Set initial expansion state: expand today's date if present, otherwise the first date with orders
      const todayKey = format(new Date(), 'yyyy-MM-dd');
      let defaultExpandedKey = null;

      if (sortedGroupedOrders[todayKey]) {
        defaultExpandedKey = todayKey;
      } else {
        const firstDateWithOrders = Object.keys(sortedGroupedOrders).find(key => key !== 'ללא תאריך' && sortedGroupedOrders[key].length > 0);
        if (firstDateWithOrders) {
          defaultExpandedKey = firstDateWithOrders;
        } else if (sortedGroupedOrders['ללא תאריך'] && sortedGroupedOrders['ללא תאריך'].length > 0) {
          defaultExpandedKey = 'ללא תאריך';
        }
      }

      if (defaultExpandedKey) {
        setExpandedDates({ [defaultExpandedKey]: true });
      } else {
        setExpandedDates({}); // No dates to expand
      }

    } catch (error) {
      console.error("Error processing baking orders from context:", error);
      toast.error("שגיאה בעיבוד הזמנות האפייה");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [allOrders, ordersLoading, refreshOrders, expandItemsByLocation, updateOrder]); // *** תלות בקונטקסט הגלובלי ו-updateOrder ***

  // *** טעינה אוטומטית כשהקונטקסט הגלובלי מתעדכן ***
  useEffect(() => {
    if (!ordersLoading) {
      loadBakingOrders();
    }
  }, [allOrders, ordersLoading, loadBakingOrders]);

  const handleRefresh = async () => {
    toast.info("מרענן נתונים מהקונטקסט הגלובלי...");
    await refreshOrders(); // Trigger refresh on global context
    // loadBakingOrders will be called by the useEffect after allOrders updates
    toast.success("הנתונים עודכנו!");
  };

  // פונקציית הארכוב חדשה
  const handleArchiveOrder = async (orderId) => {
    const toastId = toast.loading("מעביר לארכיון...");
    try {
      // *** שימוש בפונקציית העדכון מהקונטקסט - OPTIMIZED ***
      await updateOrder(orderId, { status: "בארכיון" });
      toast.success("הזמנת האפייה הועברה לארכיון!", { id: toastId });
      // הקונטקסט יתעדכן אוטומטית ו-useEffect יטריגר loadBakingOrders
    } catch (error) {
      console.error("Error archiving baking order:", error);
      toast.error("שגיאה בהעברה לארכיון.", { id: toastId });
    }
  };

  // *** פונקציה חדשה לטיפול בעדכון כמות - NEW ***
  const handleQuantityChange = (orderId, itemIndex, newBakedQuantity) => {
    setBakingOrdersByDate(currentData => {
      const newData = JSON.parse(JSON.stringify(currentData)); // Deep copy to ensure immutability
      let updated = false;
      // Iterate through dates to find the correct order
      for (const dateKey in newData) {
        const orderIndex = newData[dateKey].findIndex(order => order.id === orderId);
        if (orderIndex !== -1) {
          // Found the order, now update the specific item's baked_quantity
          if (newData[dateKey][orderIndex].items && newData[dateKey][orderIndex].items[itemIndex]) {
            newData[dateKey][orderIndex].items[itemIndex].baked_quantity = newBakedQuantity;
            
            // עדכן גם את baking_status בהתאם לכמות
            const item = newData[dateKey][orderIndex].items[itemIndex];
            const totalQuantity = item.quantity || 1;
            
            if (newBakedQuantity === 0) {
              item.baking_status = 'ממתין';
            } else if (newBakedQuantity >= totalQuantity) {
              item.baking_status = 'הוכן';
            } else {
              item.baking_status = 'בתהליך'; // NEW STATUS FOR PARTIAL COMPLETION
            }
            
            updated = true;
          }
          break; // Found the order, no need to check other dates
        }
      }
      return updated ? newData : currentData; // Return new data only if update occurred
    });
  };

  const handleSaveProgress = async (order) => {
    try {
      console.log("Saving baking order progress:", {
        orderId: order.id,
        items: order.items.map(item => ({
          product_name: item.product_name,
          baked_quantity: item.baked_quantity,
          baking_status: item.baking_status
        }))
      });

      // חישוב סטטוס ההזמנה על בסיס הכמויות שנאפו
      const allItemsCompleted = order.items.every(item => 
        (item.baked_quantity || 0) >= (item.quantity || 1)
      );
      const anyItemStarted = order.items.some(item => 
        (item.baked_quantity || 0) > 0
      );

      let newPickingStatus = order.picking_status; // Keep existing status by default
      if (allItemsCompleted) {
        // אם כל הפריטים הושלמו, הסטטוס יישאר כמו שהוא עד שילחצו על "הושלם"
      } else if (anyItemStarted) {
        newPickingStatus = 'בתהליך'; // Set to "in progress" if any item has progress
      } else {
        newPickingStatus = 'לא_התחיל'; // If no items have progress, it's not started
      }

      // *** שימוש בפונקציית העדכון מהקונטקסט - OPTIMIZED ***
      await updateOrder(order.id, {
        items: order.items,
        picking_status: newPickingStatus
      });

      // Update original order with baking quantities and status
      if (order.original_order_id) {
        try {
          // *** שימוש בקונטקסט הגלובלי במקום טעינה נפרדת - OPTIMIZED ***
          const originalOrder = allOrders.find(o => o.id === order.original_order_id);

          if (originalOrder && originalOrder.items) {
            const updatedOriginalItems = originalOrder.items.map(originalItem => {
              const bakingItem = order.items.find(bakingItem =>
                bakingItem.product_name === originalItem.product_name
              );
              // Only update baked_quantity and baking_status if it's an item that was sent for baking
              // and the corresponding baking item exists
              if (bakingItem && originalItem.picking_status === 'נשלח_לאפייה') {
                return {
                  ...originalItem,
                  baked_quantity: bakingItem.baked_quantity || 0,
                  baking_status: bakingItem.baking_status || 'ממתין',
                };
              }
              return originalItem;
            });

            // *** שימוש בפונקציית העדכון מהקונטקסט - OPTIMIZED ***
            await updateOrder(order.original_order_id, {
              items: updatedOriginalItems
            });

            console.log("Updated original order items with baking quantities and status");
            // Also attempt to sync dates after saving progress, just in case.
            await syncDatesFromOriginalOrder(order.id, order.original_order_id);
          }
        } catch (originalOrderError) {
          console.error("Error updating original order:", originalOrderError);
          toast.error("שגיאה בעדכון הזמנה מקורית.");
        }
      }

      toast.success("ההתקדמות נשמרה בהצלחה!");
      // הקונטקסט יתעדכן אוטומטית
    } catch (error) {
      console.error("Error saving baking progress:", error);
      toast.error("שגיאה בשמירת ההתקדמות.");
    }
  };

  const markBakingOrderAsCompleted = async (order) => {
    try {
      // בדיקה שכל הפריטים הושלמו על בסיס baked_quantity
      const allItemsCompleted = order.items.every(item => 
        (item.baked_quantity || 0) >= (item.quantity || 1)
      );
      
      if (!allItemsCompleted) {
        toast.warning("לא ניתן להשלים הזמנה, ישנם פריטים שטרם הושלמו.");
        return;
      }

      // Ensure the latest item quantities and statuses are saved before marking as completed
      await handleSaveProgress(order);

      // Now, mark the baking order itself as completed
      // *** שימוש בפונקציית העדכון מהקונטקסט - OPTIMIZED ***
      await updateOrder(order.id, {
        picking_status: "הושלם",
        picking_completed_date: new Date().toISOString()
      });
      toast.success("הזמנת האפייה הושלמה!");
      // הקונטקסט יתעדכן אוטומטית ו-useEffect יטריגר loadBakingOrders
    } catch (error) {
      console.error("Error completing baking order:", error);
      toast.error("שגיאה בהשלמת הזמנת האפייה");
    }
  };

  const getShippingMethod = (order) => {
    if (order.shipping_method_chosen === 'איסוף_עצמי') return 'איסוף עצמי';
    if (order.courier_company) return order.courier_company;
    return 'משלוח';
  };

  // Modified to handle both order picking_status and item baking_status
  const getBakingStatusBadge = (status) => {
    const statusConfig = {
      "לא_התחיל": { color: "bg-yellow-100 text-yellow-800", text: "ממתין לאפייה", icon: Clock },
      "בתהליך": { color: "bg-blue-100 text-blue-800", text: "בתהליך אפייה", icon: ChefHat },
      "ממתין": { color: "bg-yellow-100 text-yellow-800", text: "ממתין", icon: Clock }, // For item
      "הוכן": { color: "bg-green-100 text-green-800", text: "הוכן", icon: CheckCircle }, // For item
      "הושלם": { color: "bg-gray-100 text-gray-800", text: "הושלם", icon: CheckCircle }, // For order
    };

    const config = statusConfig[status] || { color: "bg-gray-100 text-gray-800", text: status, icon: Clock };
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        {Icon && <Icon className="w-3 h-3" />}
        {config.text}
      </Badge>
    );
  };

  const safeFormatDate = (dateString) => {
    if (!dateString || dateString === 'ללא תאריך') return "ללא תאריך";
    try {
      const date = parseISO(dateString);
      return format(date, "EEEE, dd/MM/yyyy", { locale: he });
    } catch (e) {
      return "תאריך לא תקין";
    }
  };

  // Helper function to check if order needs pickup time display
  const shouldShowPickupTime = (order) => {
    // Only show if it's self-pickup AND there's a preferred date/time AND at least one item is not completed
    return order.shipping_method_chosen === "איסוף_עצמי" &&
           (order.pickup_preferred_date || order.pickup_preferred_time) &&
           order.items?.some(item =>
             (item.baked_quantity || 0) < (item.quantity || 1)
           );
  };

  // Helper function to format pickup time display
  const getPickupTimeDisplay = (order) => {
    const date = order.pickup_preferred_date ? safeFormatDate(order.pickup_preferred_date) : null;
    const time = order.pickup_preferred_time || null;

    if (date && time) {
      // Remove "יום " prefix from formatted date for cleaner display with time
      const formattedDate = date.startsWith('יום ') ? date.substring(4) : date;
      return `${formattedDate} - ${time}`;
    } else if (date) {
      return date;
    } else if (time) {
      return time;
    }
    return null;
  };

  // *** חדש: פונקציית סינון עם חיפוש ***
  const filteredBakingOrdersByDate = useMemo(() => {
    if (!searchTerm.trim()) {
      return bakingOrdersByDate;
    }

    const filtered = {};
    Object.entries(bakingOrdersByDate).forEach(([date, orders]) => {
      const matchingOrders = orders.filter(order => {
        const customerNameMatch = order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase());
        const orderNumberMatch = order.order_number?.toLowerCase().includes(searchTerm.toLowerCase());
        const originalOrderIdMatch = order.original_order_id?.toLowerCase().includes(searchTerm.toLowerCase());

        return customerNameMatch || orderNumberMatch || originalOrderIdMatch;
      });

      if (matchingOrders.length > 0) {
        filtered[date] = matchingOrders;
      }
    });

    return filtered;
  }, [bakingOrdersByDate, searchTerm]);

  // *** פונקציה חדשה לקידום הזמנות אפייה ***
  const handleAdvanceBakingOrders = async () => {
    const toastId = toast.loading("מקדם הזמנות אפייה...");
    
    try {
      // יבוא דינמי של הפונקציה החדשה
      const { processOverdueBaking } = await import("@/api/functions");
      const result = await processOverdueBaking({});
      
      if (result?.data?.success) {
        if (result.data.processedCount > 0) {
          toast.success(result.data.message, {
            id: toastId,
            duration: 6000,
            description: `טופלו ${result.data.processedCount} מתוך ${result.data.totalChecked} הזמנות`
          });
          
          // רענון הנתונים
          await refreshOrders();
          // loadBakingOrders will be called by the useEffect after allOrders updates
          
        } else {
          toast.info(result.data.message, {
            id: toastId,
            duration: 4000
          });
        }
      } else {
        toast.error('שגיאה בקידום הזמנות אפייה', { 
          id: toastId,
          duration: 4000 
        });
      }
    } catch (error) {
      console.error('Error advancing baking orders:', error);
      toast.error('שגיאה בקידום הזמנות אפייה. נסה שוב.', { 
        id: toastId,
        duration: 4000 
      });
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <ChefHat className="w-8 h-8 text-orange-600" />
              דף אופות
            </h1>
            <p className="text-gray-600 text-lg">ניהול הזמנות אפייה ותכנון ייצור מתקדם</p>
          </div>
          
          {/* *** כפתורי פעולה מעודכנים *** */}
          <div className="flex items-center gap-3">
            {/* כפתור קידום הזמנות אפייה - חדש */}
            <Button 
              onClick={handleAdvanceBakingOrders}
              variant="outline"
              className="bg-orange-50 hover:bg-orange-100 border-orange-200 text-orange-700 font-medium"
            >
              <ChefHat className="w-4 h-4 ml-2" />
              קדם הזמנות אפייה
            </Button>
            
            {/* כפתור רענון קיים */}
            <Button 
              onClick={handleRefresh} 
              variant="outline" 
              size="icon" 
              className="bg-white elegant-shadow" 
              disabled={isRefreshing}
            >
              <RefreshCw className={`w-5 h-5 text-gray-600 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {/* *** טאבים חדשים *** */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="baking-orders" className="flex items-center gap-2">
              <ChefHat className="w-4 h-4" />
              הזמנות אפייה
            </TabsTrigger>
            <TabsTrigger value="production-planning" className="flex items-center gap-2">
              <Factory className="w-4 h-4" />
              תכנון ייצור
            </TabsTrigger>
          </TabsList>

          {/* תצוגת הזמנות אפייה קיימת */}
          <TabsContent value="baking-orders">
            {/* *** שורת חיפוש קיימת *** */}
            <div className="mb-6">
              <div className="relative max-w-md">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="חיפוש לקוח או מספר הזמנה..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10 bg-white border-gray-200 elegant-shadow"
                />
              </div>
            </div>

            {/* *** חדש: תצוגה אנליטית *** */}
            {!isLoading && !ordersLoading && (
              <BakingAnalytics
                bakingOrdersByDate={filteredBakingOrdersByDate}
                searchTerm={searchTerm}
              />
            )}

            {isLoading || ordersLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : Object.keys(filteredBakingOrdersByDate).length === 0 ? (
              <Card className="border-none elegant-shadow-lg bg-white/80 backdrop-blur-sm">
                <CardContent className="p-12 text-center">
                  <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {searchTerm ? 'לא נמצאו תוצאות חיפוש' : 'אין הזמנות אפייה'}
                  </h3>
                  <p className="text-gray-500">
                    {searchTerm ? `לא נמצאו הזמנות התואמות לחיפוש "${searchTerm}"` : 'לא נמצאו הזמנות אפייה הממתינות.'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-8">
                {Object.entries(filteredBakingOrdersByDate).map(([date, orders], dateIndex) => {
                  const isCurrentDay = date !== 'ללא תאריך' && isToday(parseISO(date));
                  const isDateExpanded = expandedDates[date] || false;
                  
                  return (
                    <Card key={date} className="border-none elegant-shadow-lg bg-white/90 backdrop-blur-sm">
                      {/* *** Header של תאריך - ניתן ללחיצה *** */}
                      <CardHeader
                        onClick={() => toggleDateExpansion(date)}
                        className={`cursor-pointer rounded-t-xl ${isCurrentDay ? 'bg-green-100 hover:bg-green-200' : 'bg-blue-100 hover:bg-blue-200'} transition-colors duration-200`}
                      >
                        <CardTitle className={`flex items-center justify-between text-xl ${isCurrentDay ? 'text-green-800' : 'text-blue-800'}`}>
                          <div className="flex items-center gap-3">
                            <CalendarDays className="w-6 h-6" />
                            {safeFormatDate(date)}
                            <Badge className="bg-white/80 text-gray-700 border">
                              {orders.length} הזמנות
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            {isDateExpanded ? (
                              <>
                                <span className="text-sm text-gray-600">לחץ להסתרת הזמנות</span>
                                <ChevronUp className="w-5 h-5" />
                              </>
                            ) : (
                              <>
                                <span className="text-sm text-gray-600">לחץ להצגת הזמנות</span>
                                <ChevronDown className="w-5 h-5" />
                              </>
                            )}
                          </div>
                        </CardTitle>
                      </CardHeader>
                      
                      {/* *** תוכן התאריך - מוצג רק אם פתוח *** */}
                      {isDateExpanded && (
                        <CardContent className="p-0">
                          <div className="space-y-4 p-6">
                            {orders.map((order, orderIndex) => {
                              // Expand items by location breakdown for display - now filtered for baking locations only
                              const expandedItems = expandItemsByLocation(order.items || []);

                              // Skip orders that have no baking-relevant items after filtering
                              if (expandedItems.length === 0) {
                                return null;
                              }

                              return (
                                <BakingOrderCard
                                  key={order.id}
                                  order={order}
                                  expandedItems={expandedItems}
                                  onArchiveOrder={handleArchiveOrder}
                                  onSaveProgress={handleSaveProgress}
                                  markBakingOrderAsCompleted={markBakingOrderAsCompleted}
                                  onQuantityChange={handleQuantityChange}
                                  openNotesDialog={openNotesDialog}
                                  closeNotesDialog={closeNotesDialog}
                                  saveNotes={saveNotes}
                                  editingNotes={editingNotes}
                                  isDialogOpen={isDialogOpen}
                                  isSaving={isSaving}
                                  setEditingNotes={setEditingNotes}
                                  setIsDialogOpen={setIsDialogOpen}
                                  getShippingMethod={getShippingMethod}
                                  getBakingStatusBadge={getBakingStatusBadge}
                                  shouldShowPickupTime={shouldShowPickupTime}
                                  getPickupTimeDisplay={getPickupTimeDisplay}
                                />
                              );
                            })}
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* תצוגת תכנון ייצור חדשה */}
          <TabsContent value="production-planning">
            <ProductionPlanningView 
              allOrders={allOrders}
              updateOrder={updateOrder}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
