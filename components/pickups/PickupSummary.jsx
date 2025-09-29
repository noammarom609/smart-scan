
import React, { useState } from 'react';
import { Order } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Package, MapPin, Eye, ChevronDown, ChevronUp, Clock, User, Phone, Save, DollarSign, MessageSquare, StickyNote, Plus, Calendar } from "lucide-react";
import { toast } from "sonner";
import { createPageUrl } from "@/utils";
import { useNavigate } from "react-router-dom";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import NotesDialog from '../common/NotesDialog';
import { useOrders } from '@/components/contexts/OrderContext';
import { triggerNotificationsFromOrder } from '@/api/functions';
import { syncOrderData } from '@/api/functions';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogTrigger
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const ITEM_LOCATIONS = [
  "ניילון מקפיא שוכב",
  "מקפיא לבן",
  "חומה",
  "ניילון יבש",
  "קרטון",
  "טרי מטבח",
  "טרי בלי קמח",
  "מקרר",
  "טרי מטבח לאפייה",
  "עידן טרי",
  "עידו ניילון",
  "החזרות",
  "מארז יבש",
  "מארז קפוא",
  "מעדניה"
];

const BAKING_RELEVANT_LOCATIONS = ["טרי מטבח", "טרי מטבח לאפייה"];

// Helper function to check if item location is relevant for baking
const isLocationRelevantForBaking = (item) => {
  // Check location_breakdown first
  if (item.location_breakdown && item.location_breakdown.length > 0) {
    return item.location_breakdown.some(breakdown =>
      BAKING_RELEVANT_LOCATIONS.includes(breakdown.location)
    );
  }
  // Fallback to single location
  return BAKING_RELEVANT_LOCATIONS.includes(item.location);
};

const generateBagsSummaryFromItems = (items) => {
  if (!items || items.length === 0) return [];

  const locationCounts = {};

  items.forEach(item => {
    // Only consider items that have been picked or sent for baking for bag summary
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
    bags_count: Math.max(1, Math.ceil(totalItems / 10)), // Default: 1 bag per 10 items, minimum 1 bag
    unit_type: location === 'קרטון' ? 'קרטון' : 'שקיות'
  }));
};

export default function PickupSummary({ orders, onUpdate, currentUser }) { // Added currentUser to props
  const { updateOrder, refreshOrders, orders: allOrders } = useOrders(); // Destructure allOrders
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [editingOrders, setEditingOrders] = useState({});
  const [notesDialog, setNotesDialog] = useState({ isOpen: false, orderId: null, currentNotes: '' });

  // *** הוספת State ניהול הערות אופה - EXISTING ***
  const [editingBakerNotes, setEditingBakerNotes] = useState({});
  const [isBakerNotesDialogOpen, setIsBakerNotesDialogOpen] = useState({});
  const [isSavingBakerNotes, setIsSavingBakerNotes] = useState({});

  const navigate = useNavigate();

  // *** פונקציות עדכון תאריכים - NEW COMPLETE ***
  const handleDateChange = (orderId, field, value) => {
    console.log(`📅 עדכון תאריך באיסופים: ${orderId} - ${field} = ${value}`);
    setEditingOrders(prev => ({
      ...prev,
      [orderId]: {
        ...prev[orderId],
        dateChanges: {
          ...prev[orderId]?.dateChanges,
          [field]: value
        }
      }
    }));
  };

  const getCurrentDateValue = (order, field) => {
    // Check if there's a pending change first
    const pendingValue = editingOrders[order.id]?.dateChanges?.[field];
    if (pendingValue !== undefined) {
      return pendingValue;
    }

    // Return current value from order
    const currentValue = order[field];
    if (currentValue) {
      // Make sure to return just the date part (YYYY-MM-DD) for date inputs
      if (field === 'pickup_preferred_time') {
        return currentValue;
      }
      // Assuming date fields are ISO strings like "YYYY-MM-DDTHH:mm:ss.sssZ"
      return currentValue.split('T')[0];
    }
    return '';
  };

  // *** שיפור פונקציית עדכון תאריכי איסוף - סינכרון מלא של כל התאריכים ***
  const handleUpdateScheduledPickup = async (orderId, updateData) => {
    const toastId = toast.loading("מעדכן תאריכי איסוף ומסנכרן עם הזמנות אפייה...");
    try {
      const order = orders.find(o => o.id === orderId);
      if (!order) {
        toast.error("לא נמצאה הזמנה", { id: toastId });
        return;
      }

      console.log('📅 Updating pickup dates and syncing ALL dates:', {
        orderId: order.id,
        orderNumber: order.order_number,
        updateData: updateData,
        currentShipmentDate: order.shipment_due_date,
        currentPickupDate: order.pickup_preferred_date,
        currentPickupTime: order.pickup_preferred_time
      });

      // עדכון ההזמנה הראשית
      await updateOrder(orderId, updateData);

      console.log('✅ Main order updated, now syncing ALL dates to baking orders...');

      // *** סינכרון כל התאריכים הרלוונטיים - כולל מה שלא השתנה ***
      try {
        const syncResult = await syncOrderData({
          orderId: orderId,
          updateType: 'sync_dates',
          updateData: {
            // התאריכים החדשים שעודכנו
            pickup_preferred_date: updateData.pickup_preferred_date || order.pickup_preferred_date,
            pickup_preferred_time: updateData.pickup_preferred_time || order.pickup_preferred_time,
            shipment_due_date: updateData.shipment_due_date || order.shipment_due_date,
            // וודא שכל השדות הרלוונטיים מועברים
            ...updateData
          }
        });

        if (syncResult?.data?.success) {
          console.log('✅ כל התאריכים סונכרנו בהצלחה לאופות:', syncResult.data.message);
          toast.success("תאריכי איסוף עודכנו וכל התאריכים סונכרנו לאופות! 🔄", {
            id: toastId,
            duration: 4000,
            description: "כל התאריכים עודכנו בכל הדפים הרלוונטיים"
          });
        } else {
          console.warn('⚠️ סינכרון לאופות נכשל או לא היה נדרש:', syncResult?.data?.message || 'שגיאה לא ידועה');
          toast.success("תאריכי איסוף עודכנו בהצלחה!", { id: toastId, duration: 3000 });
        }
      } catch (syncError) {
        console.error('⚠️ שגיאה בסינכרון תאריכים לאופות:', syncError);
        toast.success("תאריכי איסוף עודכנו! (חלק מהסינכרון נכשל)", {
          id: toastId,
          duration: 5000
        });
      }

      // *** רענון מלא של המערכת ***
      console.log('🔄 מתחיל רענון מלא של המערכת...');

      toast.loading("מרענן את כל הדפים במערכת...", { id: toastId });

      await refreshOrders();
      await new Promise(resolve => setTimeout(resolve, 800));
      await refreshOrders();

      if (onUpdate) {
        await onUpdate();
      }

      await new Promise(resolve => setTimeout(resolve, 300));
      await refreshOrders();

      console.log('✅ רענון מלא הושלם בהצלחה!');

      toast.success("🎯 תאריכי איסוף עודכנו וכל התאריכים סונכרנו בהצלחה!", {
        id: toastId,
        duration: 5000,
        description: "תוכל לעבור לדפים אחרים לראות את השינויים"
      });

    } catch (error) {
      console.error("שגיאה בעדכון תאריכי איסוף:", error);
      toast.error("שגיאה בעדכון תאריכי האיסוף. נסה שוב.", { id: toastId, duration: 4000 });
    }
  };

  // *** פונקציות ניהול הערות אופה - EXISTING ***
  const openBakerNotesDialog = (orderId, itemIndex, currentNotes) => {
    const key = `${orderId}-${itemIndex}`;
    setEditingBakerNotes(prev => ({
      ...prev,
      [key]: currentNotes || ''
    }));
    setIsBakerNotesDialogOpen(prev => ({
      ...prev,
      [key]: true
    }));
  };

  const closeBakerNotesDialog = (orderId, itemIndex) => {
    const key = `${orderId}-${itemIndex}`;
    setIsBakerNotesDialogOpen(prev => ({
      ...prev,
      [key]: false
    }));
    setEditingBakerNotes(prev => {
      const newState = { ...prev };
      delete newState[key];
      return newState;
    });
  };

  const saveBakerNotes = async (orderId, itemIndex) => {
    const key = `${orderId}-${itemIndex}`;
    const newNotes = editingBakerNotes[key] || '';
    setIsSavingBakerNotes(prev => ({ ...prev, [key]: true }));

    try {
      const orderToUpdate = orders.find(o => o.id === orderId);
      if (!orderToUpdate) {
        throw new Error("הזמנה לא נמצאה");
      }

      const updatedItems = orderToUpdate.items.map((item, index) => {
        if (index === itemIndex) {
          return {
            ...item,
            notes_for_baker: newNotes
          };
        }
        return item;
      });

      await updateOrder(orderId, {
        items: updatedItems
      });

      // *** סינכרון להזמנות אפייה קשורות - ENHANCED to use syncOrderData for notes and dates ***
      try {
        // Use 'allOrders' from useOrders context
        const relatedBakingOrders = allOrders.filter(order =>
          order.order_type === "הזמנה_לאופות" &&
          order.original_order_id === orderId
        );

        for (const bakingOrder of relatedBakingOrders) {
          await syncOrderData({
            orderId: orderId,
            bakingOrderId: bakingOrder.id,
            updateType: 'sync_notes' // Specific baking order for notes
          });
          console.log(`✅ הערות סונכרנו להזמנת אפייה: ${bakingOrder.id}`);
        }

        // *** בדיקה וסינכרון תאריכים אוטומטי (באמצעות syncOrderData הכללי) ***
        if (relatedBakingOrders.length > 0) {
          const orderDataForDateSync = {
            pickup_preferred_date: orderToUpdate.pickup_preferred_date,
            pickup_preferred_time: orderToUpdate.pickup_preferred_time,
            shipment_due_date: orderToUpdate.shipment_due_date
          };

          // Use the generic syncOrderData for date synchronization across all related baking orders
          await syncOrderData({
            orderId: orderId, // The original order ID
            updateType: 'sync_dates', // Indicates to sync dates
            updateData: orderDataForDateSync // The date fields to sync
          });
          console.log('🗓️ תאריכים סונכרנו אוטומטית להזמנות אפייה באמצעות syncOrderData');
        }

      } catch (syncError) {
        console.error('⚠️ שגיאה בסינכרון הערות ותאריכים לאופות:', syncError);
      }

      toast.success("הערות האופה עודכנו וסונכרנו בהצלחה!", { duration: 3000 });

      closeBakerNotesDialog(orderId, itemIndex);

      if (onUpdate) {
        onUpdate();
      }

    } catch (error) {
      console.error('Error updating baker notes:', error);
      toast.error("שגיאה בעדכון הערות האופה. נסה שוב.", { duration: 4000 });
    } finally {
      setIsSavingBakerNotes(prev => ({ ...prev, [key]: false }));
    }
  };

  const toggleExpand = (orderId) => {
    setExpandedOrderId(prev => (prev === orderId ? null : orderId));
  };

  const handleCountChange = (orderId, locationName, newCount) => {
    setEditingOrders(prev => ({
      ...prev,
      [orderId]: {
        ...prev[orderId],
        locationChanges: {
          ...prev[orderId]?.locationChanges,
          [locationName]: parseInt(newCount, 10) || 0
        }
      }
    }));
  };

  const handleItemLocationChange = (orderId, itemIndex, breakdownIndex, newLocation) => {
    setEditingOrders(prev => ({
      ...prev,
      [orderId]: {
        ...prev[orderId],
        itemChanges: {
          ...prev[orderId]?.itemChanges,
          [`${itemIndex}_${breakdownIndex}`]: newLocation
        }
      }
    }));
  };

  const handleSaveChanges = async (orderId) => {
    const orderToUpdate = orders.find(o => o.id === orderId);
    if (!orderToUpdate) return;

    const toastId = toast.loading("שומר שינויים ומסנכרן...");

    try {
      const editingData = editingOrders[orderId];
      if (!editingData || (!editingData.locationChanges && !editingData.itemChanges && !editingData.dateChanges)) {
        toast.info("לא בוצעו שינויים לשמירה.", { id: toastId });
        return;
      }

      let updateData = {};
      let updatedItems = JSON.parse(JSON.stringify(orderToUpdate.items || [])); // Deep copy

      // 1. Apply item location changes to our copied items array
      if (editingData.itemChanges) {
        Object.entries(editingData.itemChanges).forEach(([key, newLocation]) => {
          const [itemIndexStr, breakdownIndexStr] = key.split('_');
          const itemIndex = parseInt(itemIndexStr, 10);
          const breakdownIndex = breakdownIndexStr === 'null' ? null : parseInt(breakdownIndexStr, 10);

          if (updatedItems[itemIndex]) {
            if (breakdownIndex !== null && updatedItems[itemIndex].location_breakdown && updatedItems[itemIndex].location_breakdown[breakdownIndex]) {
              updatedItems[itemIndex].location_breakdown[breakdownIndex].location = newLocation;
            } else {
              updatedItems[itemIndex].location = newLocation;
            }
          }
        });
        updateData.items = updatedItems;
      }

      // 2. Regenerate bag summary based on the potentially updated items
      let finalBagsSummary = generateBagsSummaryFromItems(updateData.items || orderToUpdate.items);

      // 3. Apply any manual bag count edits on top of the regenerated summary
      if (editingData.locationChanges) {
        finalBagsSummary = finalBagsSummary.map(summaryItem => {
          if (editingData.locationChanges.hasOwnProperty(summaryItem.location)) {
            return { ...summaryItem, bags_count: editingData.locationChanges[summaryItem.location] };
          }
          return summaryItem;
        });
      }
      updateData.location_bag_summary = finalBagsSummary;

      // *** 4. הוספת עדכון תאריכים ***
      const hasDateChanges = !!editingData.dateChanges;
      if (hasDateChanges) {
        Object.assign(updateData, editingData.dateChanges);
        console.log(`📅 תאריכים לעדכון באיסופים:`, editingData.dateChanges);
      }

      if (Object.keys(updateData).length > 0) {
        console.log(`💾 שומר עדכונים להזמנת איסוף ${orderId}:`, updateData);

        // שמור את העדכונים
        await updateOrder(orderId, updateData);

        // *** אם היו שינויי תאריכים - הפעל את הפונקציה החדשה ***
        if (hasDateChanges) {
          await handleUpdateScheduledPickup(orderId, editingData.dateChanges);
        } else {
          toast.success(`השינויים נשמרו בהצלחה!`, { id: toastId, duration: 4000 });
        }

        // *** Clear editing state ONLY after successful save - FIXED ***
        setEditingOrders(prev => {
          const newState = { ...prev };
          delete newState[orderId];
          return newState;
        });

      } else {
        toast.info("אין שינויים לשמירה.", { id: toastId });
      }

    } catch (error) {
      toast.error("שגיאה בשמירת השינויים. נסה שוב.", { id: toastId, duration: 4000 });
      console.error("Failed to save changes:", error);
    }
    
    // *** רענון יחיד בסוף - ללא קשר להצלחה או כישלון ***
    if (onUpdate) {
      await onUpdate();
    }
  };

  // *** פונקציה חדשה ופשוטה לסימון נאסף - עם רענון מלא ***
  const markAsPickedUp = async (order) => { // Changed to accept order object directly
    const toastId = toast.loading("מסמן כנאסף...");
    try {
      // עדכון ההזמנה המקורית לסטטוס נמסרה
      await updateOrder(order.id, {
        status: "נמסרה",
        delivered_date: new Date().toISOString(),
        delivered_by: currentUser ? currentUser.full_name || currentUser.email : 'לא ידוע', // Added delivered_by
        delivery_status: "נמסרה"
      });

      // *** חדש: בדיקה והשלמת הזמנת אפייה מקושרת ***
      let bakingOrdersCompletedCount = 0;
      try {
        // חיפוש הזמנת אפייה מקושרת
        // Using 'allOrders' from useOrders context
        const bakingOrdersToComplete = allOrders.filter(bakingOrder =>
          bakingOrder.order_type === "הזמנה_לאופות" &&
          bakingOrder.original_order_id === order.id &&
          bakingOrder.picking_status !== "הושלם" // Only complete those not already completed
        );

        // עדכון הזמנות האפייה המקושרות
        if (bakingOrdersToComplete.length > 0) {
          console.log(`🍞 נמצאו ${bakingOrdersToComplete.length} הזמנות אפייה מקושרות להזמנה ${order.order_number}, משלים אוטומטית...`);
          
          const bakingUpdatePromises = bakingOrdersToComplete.map(async (bakingOrder) => {
            await updateOrder(bakingOrder.id, {
              picking_status: "הושלם",
              picking_completed_date: new Date().toISOString(),
              // הוספת הערה על השלמה אוטומטית
              notes: (bakingOrder.notes || '') + (bakingOrder.notes ? '\n' : '') +
                     `הושלמה אוטומטית ב-${new Date().toLocaleString('he-IL')} לאחר מסירת ההזמנה המקורית ${order.order_number}`
            });
            bakingOrdersCompletedCount++;
          });

          await Promise.all(bakingUpdatePromises);
          
          toast.success(
            `הזמנה נמסרה בהצלחה! ${bakingOrdersCompletedCount} הזמנות אפייה מקושרות הושלמו אוטומטית.`,
            { id: toastId, duration: 6000 }
          );
        } else {
          toast.success("הזמנה נמסרה בהצלחה!", { id: toastId });
        }
      } catch (bakingError) {
        console.error('שגיאה בעדכון הזמנת אפייה מקושרת:', bakingError);
        // ממשיכים גם אם יש שגיאה בעדכון הזמנת האפייה
        toast.success("הזמנה נמסרה בהצלחה! (התרחשה שגיאה בעדכון הזמנת אפייה מקושרת)", { id: toastId });
      }

      // Refresh data after all updates are done
      console.log('🔄 מתחיל רענון מלא אוטומטי...');
      await refreshOrders(); // Global context refresh
      if (onUpdate) {
        await onUpdate(); // Local component prop refresh
      }
      console.log('✅ רענון מלא אוטומטי הושלם');
      
    } catch (error) {
      toast.error("שגיאה בסימון כנאסף", { id: toastId });
      console.error("Error marking pickup as picked up:", error);
    }
  };


  const handleViewOrder = (e, orderId) => {
    e.stopPropagation();
    navigate(createPageUrl(`OrderDetails?id=${orderId}`));
  };

  const getAddressText = (order) => {
    if (order.shipping_address) {
      return `${order.shipping_address}${order.shipping_city ? `, ${order.shipping_city}` : ''}`;
    }
    return order.shipping_city || 'כתובת לא זמינה';
  };

  const handleOpenNotesDialog = (orderId, currentNotes = '') => {
    console.log('Opening notes dialog for order:', orderId, 'with notes:', currentNotes);
    setNotesDialog({
      isOpen: true,
      orderId,
      currentNotes
    });
  };

  const handleCloseNotesDialog = () => {
    console.log('Closing notes dialog');
    setNotesDialog({ isOpen: false, orderId: null, currentNotes: '' });
  };

  const handleSaveNotes = async (notes) => {
    console.log('Saving notes for order:', notesDialog.orderId, 'notes:', notes);
    try {
      await updateOrder(notesDialog.orderId, {
        delivery_notes_internal: notes
      });
      toast.success("ההערה נשמרה בהצלחה!");
      if (onUpdate) {
        onUpdate();
      }
      handleCloseNotesDialog();
    } catch (error) {
      toast.error("שגיאה בשמירת ההערה");
      console.error("Failed to save notes:", error);
    }
  };

  return (
    <>
      <div className="space-y-4">
        {orders.map((order) => {
          const isExpanded = expandedOrderId === order.id;
          const hasEdits = editingOrders[order.id] && (editingOrders[order.id].locationChanges || editingOrders[order.id].itemChanges || editingOrders[order.id].dateChanges);
          const itemsToShow = order.items?.filter(item => item.picked_quantity > 0 || item.picking_status === 'נשלח_לאפייה') || [];

          let bagsSummary = order.location_bag_summary;

          // If item locations have been changed, we need to show a preview of the new bag summary
          const currentItemsInEdit = editingOrders[order.id]?.itemChanges
            ? order.items.map((item, itemIndex) => {
                const updatedItem = { ...item };
                if (item.location_breakdown && item.location_breakdown.length > 0) {
                  updatedItem.location_breakdown = item.location_breakdown.map((breakdown, breakdownIndex) => {
                    const key = `${itemIndex}_${breakdownIndex}`;
                    if (editingOrders[order.id].itemChanges[key]) {
                      return { ...breakdown, location: editingOrders[order.id].itemChanges[key] };
                    }
                    return breakdown;
                  });
                } else {
                  const key = `${itemIndex}_null`;
                  if (editingOrders[order.id].itemChanges[key]) {
                    updatedItem.location = editingOrders[order.id].itemChanges[key];
                  }
                }
                return updatedItem;
              })
            : order.items;

          if (!bagsSummary || bagsSummary.length === 0 || editingOrders[order.id]?.itemChanges) {
            bagsSummary = generateBagsSummaryFromItems(currentItemsInEdit || []);
          }

          const hasBagsSummary = bagsSummary && bagsSummary.length > 0;
          const hasNotes = order.delivery_notes_internal && order.delivery_notes_internal.trim();

          return (
            <div key={order.id} className="border rounded-lg bg-white overflow-hidden">
              {/* Order Header */}
              <div
                className="p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => toggleExpand(order.id)}
                data-order-id={order.id}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center">
                      <Package className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900 truncate">
                        {order.customer_name || order.shipping_name || 'לקוח לא ידוע'}
                      </div>
                      <div className="text-sm text-gray-500">
                        הזמנה #{order.order_number} | {order.supplier}
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                        <Clock className="w-3 h-3" />
                        {order.pickup_preferred_time ? `שעה: ${order.pickup_preferred_time}` : 'לא צוין זמן'}
                      </div>
                      {(order.shipping_phone || order.customer_phone) && (
                        <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                          <Phone className="w-3 h-3" />
                          {order.shipping_phone || order.customer_phone}
                        </div>
                      )}
                      {order.total_amount && (
                        <div className="flex items-center gap-2 mt-1 text-sm text-green-600 font-medium">
                          <DollarSign className="w-3 h-3" />
                          ₪{order.total_amount.toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3">
                    {hasBagsSummary && (
                      <Badge className="bg-purple-100 text-purple-800 hidden sm:inline-flex">
                        {bagsSummary.reduce((sum, loc) => sum + (loc.bags_count || 0), 0)} יח׳
                      </Badge>
                    )}

                    {/* Notes Icon with Tooltip */}
                    {hasNotes && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenNotesDialog(order.id, order.delivery_notes_internal);
                              }}
                              className="text-blue-500 hover:text-blue-600 h-8 w-8"
                            >
                              <StickyNote className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-xs">
                            <p className="whitespace-pre-wrap font-medium">{order.delivery_notes_internal}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}

                    <div className="flex flex-col-reverse items-center gap-2 sm:flex-row">
                      {/* Notes Button */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          console.log('Notes button clicked for order:', order.id);
                          handleOpenNotesDialog(order.id, order.delivery_notes_internal || '');
                        }}
                        className="text-blue-600 border-blue-200 hover:bg-blue-50 w-full sm:w-auto px-2"
                      >
                        <MessageSquare className="w-4 h-4 ml-1" />
                        {hasNotes ? 'ערוך הערה' : 'הוסף הערה'}
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => handleViewOrder(e, order.id)}
                        title="צפה בפרטי ההזמנה"
                        className="text-gray-500 hover:text-blue-600"
                        data-expand-button
                      >
                        <Eye className="w-5 h-5" />
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsPickedUp(order); // Updated to pass order object
                        }}
                        className="text-purple-600 border-purple-200 hover:bg-purple-50 w-full sm:w-auto px-2"
                      >
                        נאסף
                      </Button>
                    </div>

                    <div className="hidden sm:block">
                      {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                    </div>
                  </div>
                </div>
              </div>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="p-4 border-t space-y-6">
                  {/* *** אזור עדכון תאריכים - ENHANCED *** */}
                  <div className="bg-green-50 p-4 rounded-lg border">
                      <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                          <Calendar className="w-5 h-5 text-green-600" />
                          עדכון תאריכי איסוף
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                              <Label className="text-sm font-medium text-gray-700 mb-1 block">
                                  תאריך איסוף מועדף
                              </Label>
                              <Input
                                  type="date"
                                  value={getCurrentDateValue(order, 'pickup_preferred_date')}
                                  onChange={(e) => {
                                      console.log(`📅 שינוי תאריך איסוף: ${e.target.value}`);
                                      handleDateChange(order.id, 'pickup_preferred_date', e.target.value);
                                  }}
                                  className="mt-1 bg-white"
                              />
                          </div>
                          <div>
                              <Label className="text-sm font-medium text-gray-700 mb-1 block">
                                  שעת איסוף מועדפת
                              </Label>
                              <Input
                                  type="time"
                                  value={getCurrentDateValue(order, 'pickup_preferred_time')}
                                  onChange={(e) => {
                                      console.log(`🕐 שינוי שעת איסוף: ${e.target.value}`);
                                      handleDateChange(order.id, 'pickup_preferred_time', e.target.value);
                                  }}
                                  className="mt-1 bg-white"
                              />
                          </div>
                      </div>
                  </div>

                  {/* Save Button - Always visible when expanded */}
                  {hasEdits && (
                    <div className="flex justify-end">
                      <Button onClick={() => handleSaveChanges(order.id)} className="bg-green-600 hover:bg-green-700">
                        <Save className="w-4 h-4 mr-2" /> שמור שינויים (כולל סינכרון לאופות)
                      </Button>
                    </div>
                  )}

                  {/* Bags Summary */}
                  {hasBagsSummary && (
                    <div>
                      <h4 className="font-bold text-gray-800 flex items-center gap-2 mb-2">
                        <Package className="w-5 h-5 text-blue-600" />
                        סיכום שקיות לאיסוף:
                      </h4>
                      <div className="rounded-lg border bg-white overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-100">
                              <TableHead>מיקום</TableHead>
                              <TableHead>כמות</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {bagsSummary.map((locationSummary, index) => (
                              <TableRow key={locationSummary.location || index}>
                                <TableCell>
                                  <Badge variant="outline" className="flex items-center gap-1 w-fit">
                                    <MapPin className="w-3 h-3 text-gray-500" />
                                    {locationSummary.location}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <Input
                                      type="number"
                                      min="0"
                                      value={editingOrders[order.id]?.locationChanges?.[locationSummary.location] ?? locationSummary.bags_count ?? 0}
                                      onChange={(e) => handleCountChange(order.id, locationSummary.location, e.target.value)}
                                      className="w-20 text-center"
                                    />
                                    <span className="text-sm font-medium">{locationSummary.unit_type || 'שקיות'}</span>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  )}

                  {/* Items List */}
                  {itemsToShow.length > 0 && (
                    <div>
                      <h4 className="font-bold text-gray-800 mb-2">פירוט פריטים לאיסוף:</h4>
                      <div className="rounded-lg border bg-white overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-100">
                              <TableHead>מוצר</TableHead>
                              <TableHead>מיקום</TableHead>
                              <TableHead>כמות</TableHead>
                              <TableHead>הערות לאופה</TableHead>
                              <TableHead>סטטוס ליקוט</TableHead>
                              <TableHead>סטטוס אפייה</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {itemsToShow.map((item, itemIndex) => {
                              const key = `${order.id}-${itemIndex}`; // Key for baker notes state
                              if (item.location_breakdown && item.location_breakdown.length > 0) {
                                return item.location_breakdown.map((breakdown, breakdownIndex) => (
                                  <TableRow key={`${itemIndex}-${breakdownIndex}`}>
                                    <TableCell className="font-medium">
                                      {item.product_name}
                                      {item.location_breakdown.length > 1 && (
                                        <span className="text-gray-500 text-sm"> ({breakdownIndex + 1})</span>
                                      )}
                                    </TableCell>
                                    <TableCell>
                                      <Select
                                        value={editingOrders[order.id]?.itemChanges?.[`${itemIndex}_${breakdownIndex}`] ?? breakdown.location ?? ''}
                                        onValueChange={(value) => handleItemLocationChange(order.id, itemIndex, breakdownIndex, value)}
                                      >
                                        <SelectTrigger className="w-48 bg-white border-gray-200">
                                          <div className="flex items-center gap-2">
                                            <MapPin className="w-3 h-3 text-gray-500" />
                                            <SelectValue placeholder="בחר מיקום" />
                                          </div>
                                        </SelectTrigger>
                                        <SelectContent>
                                          {ITEM_LOCATIONS.map((location) => (
                                            <SelectItem key={location} value={location}>
                                              <div className="flex items-center gap-2">
                                                <MapPin className="w-3 h-3 text-gray-500" />
                                                {location}
                                              </div>
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </TableCell>
                                    <TableCell>
                                      <Badge className="bg-purple-100 text-purple-800 font-semibold">
                                        {breakdown.quantity}
                                      </Badge>
                                    </TableCell>
                                    {/* תא הערות לאופה עם פונקציונליות מלאה - ENHANCED */}
                                    <TableCell>
                                      {item.notes_for_baker && item.notes_for_baker.trim() ? (
                                        /* יש הערות - הצג עם Tooltip + Dialog לעריכה */
                                        <div className="flex items-center justify-center">
                                          <TooltipProvider>
                                            <Tooltip>
                                              <TooltipTrigger asChild>
                                                <div>
                                                  <Dialog
                                                    open={isBakerNotesDialogOpen[key] || false}
                                                    onOpenChange={(open) => {
                                                      if (!open) {
                                                        closeBakerNotesDialog(order.id, itemIndex);
                                                      }
                                                    }}
                                                  >
                                                    <DialogTrigger asChild>
                                                      <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-blue-600 hover:bg-blue-100"
                                                        onClick={() => openBakerNotesDialog(order.id, itemIndex, item.notes_for_baker)}
                                                      >
                                                        <MessageSquare className="w-4 h-4" />
                                                      </Button>
                                                    </DialogTrigger>
                                                    <DialogContent className="sm:max-w-[425px]">
                                                      <DialogHeader>
                                                        <DialogTitle>עריכת הערות לאופה עבור {item.product_name}</DialogTitle>
                                                      </DialogHeader>
                                                      <div className="grid gap-4 py-4">
                                                        <Textarea
                                                          value={editingBakerNotes[key] || ''}
                                                          onChange={(e) => setEditingBakerNotes(prev => ({ ...prev, [key]: e.target.value }))}
                                                          placeholder="הזן הערות עבור האופה..."
                                                          rows={5}
                                                        />
                                                      </div>
                                                      <DialogFooter>
                                                        <DialogClose asChild>
                                                          <Button variant="outline">ביטול</Button>
                                                        </DialogClose>
                                                        <Button
                                                          onClick={() => saveBakerNotes(order.id, itemIndex)}
                                                          disabled={isSavingBakerNotes[key]}
                                                        >
                                                          {isSavingBakerNotes[key] ? 'שומר...' : 'שמור'}
                                                        </Button>
                                                      </DialogFooter>
                                                    </DialogContent>
                                                  </Dialog>
                                                </div>
                                              </TooltipTrigger>
                                              <TooltipContent side="top" className="max-w-xs">
                                                <p className="whitespace-pre-wrap font-medium">{item.notes_for_baker}</p>
                                              </TooltipContent>
                                            </Tooltip>
                                          </TooltipProvider>
                                        </div>
                                      ) : (
                                        /* אין הערות - הצג כפתור "הוסף הערה" */
                                        <Dialog
                                          open={isBakerNotesDialogOpen[key] || false}
                                          onOpenChange={(open) => {
                                            if (!open) {
                                              closeBakerNotesDialog(order.id, itemIndex);
                                            }
                                          }}
                                        >
                                          <DialogTrigger asChild>
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              className="text-blue-600 border-blue-300 hover:bg-blue-50 hover:border-blue-400 text-xs h-7 px-2"
                                              onClick={() => openBakerNotesDialog(order.id, itemIndex, '')}
                                            >
                                              <Plus className="w-3 h-3 ml-1" />
                                              הוסף הערה
                                            </Button>
                                          </DialogTrigger>
                                          <DialogContent className="sm:max-w-[425px]">
                                            <DialogHeader>
                                              <DialogTitle>הוספת הערות לאופה עבור {item.product_name}</DialogTitle>
                                            </DialogHeader>
                                            <div className="grid gap-4 py-4">
                                              <Textarea
                                                value={editingBakerNotes[key] || ''}
                                                onChange={(e) => setEditingBakerNotes(prev => ({ ...prev, [key]: e.target.value }))}
                                                placeholder="הזן הערות עבור האופה..."
                                                rows={5}
                                              />
                                            </div>
                                            <DialogFooter>
                                              <DialogClose asChild>
                                                <Button variant="outline">ביטול</Button>
                                              </DialogClose>
                                              <Button
                                                onClick={() => saveBakerNotes(order.id, itemIndex)}
                                                disabled={isSavingBakerNotes[key]}
                                              >
                                                {isSavingBakerNotes[key] ? 'שומר...' : 'שמור'}
                                              </Button>
                                            </DialogFooter>
                                          </DialogContent>
                                        </Dialog>
                                      )}
                                    </TableCell>
                                    <TableCell>
                                      <Badge variant="outline" className="text-green-600 border-green-300 font-medium">
                                        במלאי
                                      </Badge>
                                    </TableCell>
                                    <TableCell>
                                      {item.picking_status === 'נשלח_לאפייה' ? (
                                        // Check if location is relevant for baking before showing baking status
                                        isLocationRelevantForBaking({ location_breakdown: [breakdown] }) ? (
                                          item.baking_status === 'הוכן' ? (
                                            <Badge className="bg-green-100 text-green-800 border-green-300 font-medium">
                                              מוכן
                                            </Badge>
                                          ) : (
                                            <Badge className="bg-orange-100 text-orange-800 border-orange-300 font-medium">
                                              לאפייה
                                            </Badge>
                                          )
                                        ) : (
                                          <Badge variant="outline" className="bg-gray-100 text-gray-600 border-gray-300 font-medium">
                                            לא רלוונטי
                                          </Badge>
                                        )
                                      ) : (
                                        <Badge variant="outline" className="text-gray-400 border-gray-300">
                                          לא רלוונטי
                                        </Badge>
                                      )}
                                    </TableCell>
                                  </TableRow>
                                ));
                              } else {
                                return (
                                  <TableRow key={itemIndex}>
                                    <TableCell className="font-medium">{item.product_name}</TableCell>
                                    <TableCell>
                                      <Select
                                        value={editingOrders[order.id]?.itemChanges?.[`${itemIndex}_null`] ?? item.location ?? ''}
                                        onValueChange={(value) => handleItemLocationChange(order.id, itemIndex, null, value)}
                                      >
                                        <SelectTrigger className="w-48 bg-white border-gray-200">
                                          <div className="flex items-center gap-2">
                                            <MapPin className="w-3 h-3 text-gray-500" />
                                            <SelectValue placeholder="בחר מיקום" />
                                          </div>
                                        </SelectTrigger>
                                        <SelectContent>
                                          {ITEM_LOCATIONS.map((location) => (
                                            <SelectItem key={location} value={location}>
                                              <div className="flex items-center gap-2">
                                                <MapPin className="w-3 h-3 text-gray-500" />
                                                {location}
                                              </div>
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </TableCell>
                                    <TableCell>
                                      <Badge className="bg-purple-100 text-purple-800 font-semibold">{item.picked_quantity}</Badge>
                                    </TableCell>
                                    {/* תא הערות לאופה עם פונקציונליות מלאה - ENHANCED */}
                                    <TableCell>
                                      {item.notes_for_baker && item.notes_for_baker.trim() ? (
                                        /* יש הערות - הצג עם Tooltip + Dialog לעריכה */
                                        <div className="flex items-center justify-center">
                                          <TooltipProvider>
                                            <Tooltip>
                                              <TooltipTrigger asChild>
                                                <div>
                                                  <Dialog
                                                    open={isBakerNotesDialogOpen[key] || false}
                                                    onOpenChange={(open) => {
                                                      if (!open) {
                                                        closeBakerNotesDialog(order.id, itemIndex);
                                                      }
                                                    }}
                                                  >
                                                    <DialogTrigger asChild>
                                                      <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-blue-600 hover:bg-blue-100"
                                                        onClick={() => openBakerNotesDialog(order.id, itemIndex, item.notes_for_baker)}
                                                      >
                                                        <MessageSquare className="w-4 h-4" />
                                                      </Button>
                                                    </DialogTrigger>
                                                    <DialogContent className="sm:max-w-[425px]">
                                                      <DialogHeader>
                                                        <DialogTitle>עריכת הערות לאופה עבור {item.product_name}</DialogTitle>
                                                      </DialogHeader>
                                                      <div className="grid gap-4 py-4">
                                                        <Textarea
                                                          value={editingBakerNotes[key] || ''}
                                                          onChange={(e) => setEditingBakerNotes(prev => ({ ...prev, [key]: e.target.value }))}
                                                          placeholder="הזן הערות עבור האופה..."
                                                          rows={5}
                                                        />
                                                      </div>
                                                      <DialogFooter>
                                                        <DialogClose asChild>
                                                          <Button variant="outline">ביטול</Button>
                                                        </DialogClose>
                                                        <Button
                                                          onClick={() => saveBakerNotes(order.id, itemIndex)}
                                                          disabled={isSavingBakerNotes[key]}
                                                        >
                                                          {isSavingBakerNotes[key] ? 'שומר...' : 'שמור'}
                                                        </Button>
                                                      </DialogFooter>
                                                    </DialogContent>
                                                  </Dialog>
                                                </div>
                                              </TooltipTrigger>
                                              <TooltipContent side="top" className="max-w-xs">
                                                <p className="whitespace-pre-wrap font-medium">{item.notes_for_baker}</p>
                                              </TooltipContent>
                                            </Tooltip>
                                          </TooltipProvider>
                                        </div>
                                      ) : (
                                        /* אין הערות - הצג כפתור "הוסף הערה" */
                                        <Dialog
                                          open={isBakerNotesDialogOpen[key] || false}
                                          onOpenChange={(open) => {
                                            if (!open) {
                                              closeBakerNotesDialog(order.id, itemIndex);
                                            }
                                          }}
                                        >
                                          <DialogTrigger asChild>
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              className="text-blue-600 border-blue-300 hover:bg-blue-50 hover:border-blue-400 text-xs h-7 px-2"
                                              onClick={() => openBakerNotesDialog(order.id, itemIndex, '')}
                                            >
                                              <Plus className="w-3 h-3 ml-1" />
                                              הוסף הערה
                                            </Button>
                                          </DialogTrigger>
                                          <DialogContent className="sm:max-w-[425px]">
                                            <DialogHeader>
                                              <DialogTitle>הוספת הערות לאופה עבור {item.product_name}</DialogTitle>
                                            </DialogHeader>
                                            <div className="grid gap-4 py-4">
                                              <Textarea
                                                value={editingBakerNotes[key] || ''}
                                                onChange={(e) => setEditingBakerNotes(prev => ({ ...prev, [key]: e.target.value }))}
                                                placeholder="הזן הערות עבור האופה..."
                                                rows={5}
                                              />
                                            </div>
                                            <DialogFooter>
                                              <DialogClose asChild>
                                                <Button variant="outline">ביטול</Button>
                                              </DialogClose>
                                              <Button
                                                onClick={() => saveBakerNotes(order.id, itemIndex)}
                                                disabled={isSavingBakerNotes[key]}
                                              >
                                                {isSavingBakerNotes[key] ? 'שומר...' : 'שמור'}
                                              </Button>
                                            </DialogFooter>
                                          </DialogContent>
                                        </Dialog>
                                      )}
                                    </TableCell>
                                    <TableCell>
                                      <Badge variant="outline" className="text-green-600 border-green-300 font-medium">
                                        במ מלאי
                                      </Badge>
                                    </TableCell>
                                    <TableCell>
                                      {item.picking_status === 'נשלח_לאפייה' ? (
                                        // Check if location is relevant for baking before showing baking status
                                        isLocationRelevantForBaking(item) ? (
                                          item.baking_status === 'הוכן' ? (
                                            <Badge className="bg-green-100 text-green-800 border-green-300 font-medium">
                                              מוכן
                                            </Badge>
                                          ) : (
                                            <Badge className="bg-orange-100 text-orange-800 border-orange-300 font-medium">
                                              לאפייה
                                            </Badge>
                                          )
                                        ) : (
                                          <Badge variant="outline" className="bg-gray-100 text-gray-600 border-gray-300 font-medium">
                                            לא רלוונטי
                                          </Badge>
                                        )
                                      ) : (
                                        <Badge variant="outline" className="text-gray-400 border-gray-300">
                                          לא רלוונטי
                                        </Badge>
                                      )}
                                    </TableCell>
                                  </TableRow>
                                );
                              }
                            })}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  )}

                  {/* Pickup Details */}
                  <div className="text-sm text-gray-600">
                    <p><strong>פרטי איסוף:</strong></p>
                    <p>תאריך מועדף: {order.pickup_preferred_date || 'לא צוין'}</p>
                    <p>זמן מועדף: {order.pickup_preferred_time || 'לא צוין'}</p>
                    {order.delivery_notes && (
                      <p>הערות: {order.delivery_notes}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Notes Dialog */}
      <NotesDialog
        isOpen={notesDialog.isOpen}
        onClose={handleCloseNotesDialog}
        onSave={handleSaveNotes}
        initialNotes={notesDialog.currentNotes}
        title="הערות איסוף"
        placeholder="הכנס הערות לאיסוף..."
      />
    </>
  );
}
