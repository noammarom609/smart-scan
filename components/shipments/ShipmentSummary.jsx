
import React, { useState } from 'react';
import { Order } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Package, MapPin, Eye, ChevronDown, ChevronUp, Clock, User, Phone, Save, DollarSign, MessageSquare, StickyNote, ChefHat, Plus, X, Calendar } from "lucide-react";
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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";


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

export default function ShipmentSummary({ orders: propOrders, onUpdate, onPickedUp, currentUser }) { // Added currentUser to props
    const [expandedOrderId, setExpandedOrderId] = useState(null);
    const [editingOrders, setEditingOrders] = useState({});
    const [notesDialog, setNotesDialog] = useState({ isOpen: false, orderId: null, currentNotes: '' });

    // State to manage baker notes dialogs and saving status
    const [editingBakerNotes, setEditingBakerNotes] = useState({});
    const [isBakerNotesDialogOpen, setIsBakerNotesDialogOpen] = useState({});
    const [isSavingBakerNotes, setIsSavingBakerNotes] = useState({});
    const [isSaving, setIsSaving] = useState(false); // Added for generic saving state

    const navigate = useNavigate();
    const { orders: allOrders, updateOrder, refreshOrders } = useOrders(); // Get all orders from context, including baking orders

    // *** פונקציות עדכון תאריכים - COMPLETE ***
    const handleDateChange = (orderId, field, value) => {
        console.log(`📅 עדכון תאריך: ${orderId} - ${field} = ${value}`);
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
        // First, check if there's a pending update in editingOrders
        const tempValue = editingOrders[order.id]?.dateChanges?.[field];
        if (tempValue !== undefined) {
            // For date inputs, we need 'YYYY-MM-DD' format. For time, just the value.
            if (field === 'pickup_preferred_time') {
                return tempValue;
            }
            // If it's a date field and tempValue is a valid date string (e.g., '2023-10-26T10:00:00Z' or '2023-10-26')
            // we only need the YYYY-MM-DD part. If it's empty, return empty.
            return tempValue ? tempValue.split('T')[0] : '';
        }

        // If no pending changes, use the original order value
        const currentValue = order[field];
        if (currentValue) {
            if (field === 'pickup_preferred_time') {
                return currentValue;
            }
            return currentValue.split('T')[0]; // Remove time part if exists
        }
        return '';
    };

    // Removed the local syncDatesWithBaking function, as the global syncOrderData utility will handle this.

    // *** פונקציות ניהול הערות אופה - NEW ***
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
            // מצא את ההזמנה
            const orderToUpdate = propOrders.find(o => o.id === orderId); // Use propOrders
            if (!orderToUpdate) {
                throw new Error("הזמנה לא נמצאה");
            }

            // עדכן את הפריט בהזמנה
            // Deep copy of items to ensure immutability before modification
            const updatedItems = JSON.parse(JSON.stringify(orderToUpdate.items)).map((item, index) => {
                if (index === itemIndex) {
                    return {
                        ...item,
                        notes_for_baker: newNotes
                    };
                }
                return item;
            });

            // שמור בבסיס הנתונים
            await updateOrder(orderId, {
                items: updatedItems
            });

            // *** סינכרון להזמנות אפייה קשורות - ENHANCED ***
            try {
                // Sync baker notes
                await syncOrderData({
                    orderId: orderId, // This is the original order ID
                    updateType: 'sync_notes',
                    itemIndex: itemIndex, // Pass item index to sync specific item notes
                    updateData: {
                        notes_for_baker: newNotes
                    }
                });
                console.log(`✅ הערות סונכרנו להזמנות אפייה קשורות עבור פריט ${itemIndex} בהזמנה ${orderId}`);

                // *** בדיקה וסינכרון תאריכים אוטומטי (אם יש הזמנות אפייה קשורות) ***
                // We need to determine if there are related baking orders to trigger the date sync.
                // The syncOrderData utility should handle finding them if we pass the original order ID.
                const orderData = {
                    shipment_due_date: orderToUpdate.shipment_due_date,
                    pickup_preferred_date: orderToUpdate.pickup_preferred_date,
                    pickup_preferred_time: orderToUpdate.pickup_preferred_time
                };

                await syncOrderData({
                    orderId: orderId,
                    updateType: 'sync_dates',
                    updateData: orderData
                });
                console.log('🗓️ תאריכים סונכרנו אוטומטית להזמנות אפייה');

            } catch (syncError) {
                console.error('⚠️ שגיאה בסינכרון הערות ו/או תאריכים להזמנות אפייה:', syncError);
                toast.error('שגיאה בסינכרון הערות ו/או תאריכים להזמנות אפייה. נסה שוב.', { duration: 4000 });
            }

            toast.success("הערות האופה עודכנו וסונכרנו בהצלחה!", { duration: 3000 });

            // סגור את הדיאלוג
            closeBakerNotesDialog(orderId, itemIndex);

            // עדכן תצוגה
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
        setIsSaving(true); // Start saving
        const orderToUpdate = propOrders.find(o => o.id === orderId); // Use propOrders
        if (!orderToUpdate) {
            toast.error("הזמנה לא נמצאה");
            setIsSaving(false);
            return;
        }

        let refreshToastId; // To manage the toast for the full refresh sequence

        try {
            const editingData = editingOrders[orderId];
            if (!editingData || (!editingData.locationChanges && !editingData.itemChanges && !editingData.dateChanges)) {
                toast.info("לא בוצעו שינויים לשמירה.");
                setIsSaving(false);
                return;
            }

            console.log(`💾 מתחיל שמירת שינויים להזמנה ${orderId}:`, editingData);

            let updateData = {};
            let updatedItems = JSON.parse(JSON.stringify(orderToUpdate.items || [])); // Deep copy

            // 1. Apply item location changes to our copied items array
            if (editingData.itemChanges) {
                console.log('🔧 מעדכן מיקומי פריטים:', editingData.itemChanges);
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

            // 2. Regenerate bag summary if needed
            if (editingData.itemChanges || editingData.locationChanges) {
                let finalBagsSummary = generateBagsSummaryFromItems(updateData.items || orderToUpdate.items);

                // Apply manual bag count edits
                if (editingData.locationChanges) {
                    finalBagsSummary = finalBagsSummary.map(summaryItem => {
                        if (editingData.locationChanges.hasOwnProperty(summaryItem.location)) {
                            return { ...summaryItem, bags_count: editingData.locationChanges[summaryItem.location] };
                        }
                        return summaryItem;
                    });
                }
                updateData.location_bag_summary = finalBagsSummary;
            }

            // *** 3. הוספת עדכון תאריכים ***
            let hasDateChanges = false;
            if (editingData.dateChanges) {
                console.log('📅 מעדכן תאריכים:', editingData.dateChanges);
                // Assign all dateChanges to updateData
                Object.assign(updateData, editingData.dateChanges);
                hasDateChanges = Object.keys(editingData.dateChanges).length > 0;
            }

            // *** 4. שמירת העדכונים בבסיס הנתונים ***
            if (Object.keys(updateData).length > 0) {
                console.log(`💾 שומר עדכונים בבסיס הנתונים:`, updateData);

                await updateOrder(orderId, updateData);

                // *** 5. סינכרון תאריכים אוטומטי לאופות - ENHANCED ***
                if (hasDateChanges) {
                    try {
                        console.log('📅 Date changes detected, syncing to related baking orders...');

                        // Construct the full set of current date values to send for sync
                        // Prioritize changes from editingData.dateChanges, otherwise use orderToUpdate's original values
                        const datesForSync = {
                            shipment_due_date: editingData.dateChanges?.shipment_due_date || orderToUpdate.shipment_due_date,
                            pickup_preferred_date: editingData.dateChanges?.pickup_preferred_date || orderToUpdate.pickup_preferred_date,
                            pickup_preferred_time: editingData.dateChanges?.pickup_preferred_time || orderToUpdate.pickup_preferred_time
                        };

                        const syncResult = await syncOrderData({
                            orderId: orderId,
                            updateType: 'sync_dates',
                            updateData: datesForSync // Use the fully constructed dates for sync
                        });

                        if (syncResult?.data?.success) {
                            console.log('✅ תאריכים סונכרנו בהצלחה לאופות:', syncResult.data.message);
                            toast.success("תאריכים סונכרנו לאופות! 🔄", {
                                duration: 4000,
                                description: "התאריכים עודכנו בכל הדפים הרלוונטיים"
                            });
                        } else {
                            console.warn('⚠️ סינכרון לאופות נכשל או לא היה נדרש:', syncResult?.data?.message || 'שגיאה לא ידועה');
                            toast.success("תאריכים עודכנו בהצלחה!", { duration: 3000 });
                        }
                    } catch (syncError) {
                        console.error('⚠️ שגיאה בסינכרון תאריכים לאופות:', syncError);
                        toast.warning("תאריכים עודכנו, אך אירעה שגיאה בסינכרון לחלק מהאופות.", {
                            duration: 5000
                        });
                    }

                    // *** 6. רענון מלא מחוזק של כל המערכת - כמו ב-OrderDetails ***
                    console.log('🔄 מתחיל רענון מלא של המערכת...');
                    refreshToastId = toast.loading("מרענן את כל הדפים במערכת...", { id: 'full-refresh-toast' });

                    // שלב 1: רענון מיידי של הקונטקסט הגלובלי
                    await refreshOrders();

                    // שלב 2: המתנה קצרה להבטיח עדכון
                    await new Promise(resolve => setTimeout(resolve, 800));

                    // שלב 3: רענון נוסף להבטחה
                    await refreshOrders();

                    // שלב 4: קריאה לפונקציית העדכון של הקומפוננט האב
                    if (onUpdate) {
                        await onUpdate();
                    }

                    // שלב 5: פינג סופי להבטחת עדכון מלא
                    await new Promise(resolve => setTimeout(resolve, 300));
                    await refreshOrders();

                    console.log('✅ רענון מלא הושלם בהצלחה!');
                    toast.success("🎯 תאריכים עודכנו וסונכרנו בהצלחה ברחבי המערכת!", {
                        id: refreshToastId, // Use the same ID to update the loading toast
                        duration: 5000,
                        description: "תוכל לעבור לדפים אחרים לראות את השינויים"
                    });
                } else {
                    toast.success("השינויים נשמרו וסונכרנו בהצלחה!", { duration: 4000 });
                }

                // *** 7. Clear editing state ONLY after successful save ***
                setEditingOrders(prev => {
                    const newState = { ...prev };
                    delete newState[orderId];
                    return newState;
                });

                // *** 8. Refresh the view (original onUpdate for this component) ***
                if (onUpdate) {
                    console.log('🔄 מרענן את התצוגה של הרכיב');
                    onUpdate();
                }
            } else {
                toast.info("אין שינויים לשמירה.");
            }

        } catch (error) {
            console.error("❌ שגיאה בשמירת השינויים:", error);
            // If there was a refreshToastId, update it to error state
            if (refreshToastId) {
                toast.error(`שגיאה בשמירת השינויים: ${error.message}`, { id: refreshToastId, duration: 4000 });
            } else {
                toast.error(`שגיאה בשמירת השינויים: ${error.message}`, { duration: 4000 });
            }
        } finally {
            setIsSaving(false); // End saving
        }
    };


    const handlePickedUp = async (orderId) => {
        const toastId = toast.loading("מסמן כנאסף על ידי שליח...");
        try {
            const orderToHandle = allOrders.find(o => o.id === orderId); // Find the order object from allOrders
            if (!orderToHandle) {
                toast.error("הזמנה לא נמצאה.", { id: toastId });
                return;
            }

            // עדכון ההזמנה המקורית לסטטוס נשלח אצל השליח
            await updateOrder(orderId, {
                status: "משלוח אצל השליח",
                shipped_date: new Date().toISOString(),
                delivered_by: currentUser ? currentUser.full_name || currentUser.email : 'לא ידוע'
            });

            // *** חדש: בדיקה והשלמת הזמנת אפייה מקושרת ***
            try {
                // חיפוש הזמנת אפייה מקושרת מתוך כל ההזמנות (allOrders)
                const bakingOrders = allOrders.filter(bakingOrder =>
                    bakingOrder.order_type === "הזמנה_לאופות" &&
                    bakingOrder.original_order_id === orderId && // Use the orderId from the current shipment
                    bakingOrder.picking_status !== "הושלם"
                );

                // עדכון הזמנות האפייה המקושרות
                if (bakingOrders.length > 0) {
                    console.log(`🍞 נמצאו ${bakingOrders.length} הזמנות אפייה מקושרות להזמנה ${orderToHandle.order_number}, משלים אוטומטית...`);

                    const bakingUpdatePromises = bakingOrders.map(bakingOrder =>
                        updateOrder(bakingOrder.id, {
                            picking_status: "הושלם",
                            picking_completed_date: new Date().toISOString(),
                            // הוספת הערה על השלמה אוטומטית
                            notes: (bakingOrder.notes || '') + (bakingOrder.notes ? '\n' : '') +
                                   `הושלמה אוטומטית ב-${new Date().toLocaleString('he-IL')} לאחר איסוף ההזמנה המקורית ${orderToHandle.order_number} על ידי שליח`
                        })
                    );

                    await Promise.all(bakingUpdatePromises);

                    toast.success(
                        `הזמנה נאספה על ידי שליח! ${bakingOrders.length} הזמנות אפייה מקושרות הושלמו אוטומטית.`,
                        { id: toastId, duration: 6000 }
                    );
                } else {
                    toast.success("הזמנה נאספה על ידי שליח!", { id: toastId });
                }
            } catch (bakingError) {
                console.error('שגיאה בעדכון הזמנת אפייה מקושרת:', bakingError);
                // ממשיכים גם אם יש שגיאה בעדכון הזמנת האפייה
                toast.success("הזמנה נאספה על ידי שליח! (התרחשה שגיאה בעדכון הזמנת אפייה מקושרת)", { id: toastId });
            }

            // טריגר התראה על איסוף המשלוח
            try {
                await triggerNotificationsFromOrder({
                  orderId: orderId,
                  triggerType: 'shipment_picked_up'
                });
                console.log('Notifications triggered for shipment picked up:', orderId);
            } catch (notificationError) {
                console.error('Error triggering notifications for shipment pickup:', notificationError);
            }

            // Refresh data
            if (onUpdate) {
                await onUpdate();
            }
        } catch (error) {
            console.error("Error marking shipment as picked up:", error);
            toast.error(`שגיאה בסימון כנאסף. נסה שוב: ${error.message}`, { id: toastId });
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
                {propOrders.map((order) => { // Use propOrders here
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
                                    if (editingOrders[order.id]?.itemChanges?.[key]) { // Fix: Added optional chaining
                                        return { ...breakdown, location: editingOrders[order.id].itemChanges[key] };
                                    }
                                    return breakdown;
                                });
                            } else {
                                const key = `${itemIndex}_null`;
                                if (editingOrders[order.id]?.itemChanges?.[key]) { // Fix: Added optional chaining
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
                                        <div className="w-10 h-10 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl flex items-center justify-center">
                                            <Package className="w-5 h-5 text-orange-600" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-semibold text-gray-900 truncate">
                                                {order.customer_name || order.shipping_name || 'לקוח לא ידוע'}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                הזמנה #{order.order_number} | {order.supplier}
                                            </div>
                                            <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                                                <MapPin className="w-3 h-3" />
                                                {getAddressText(order)}
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
                                            <Badge className="bg-orange-100 text-orange-800 hidden sm:inline-flex">
                                                {bagsSummary.reduce((sum, loc) => sum + (loc.bags_count || 0), 0)} יח׳
                                            </Badge>
                                        )}

                                        {/* Notes Icon with Tooltip */}
                                        {hasNotes && (
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <div>
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
                                                        </div>
                                                    </TooltipTrigger>
                                                    <TooltipContent side="top" className="max-w-xs">
                                                        <p className="whitespace-pre-wrap">{order.delivery_notes_internal}</p>
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
                                                    handlePickedUp(order.id);
                                                }}
                                                className="text-orange-600 border-orange-200 hover:bg-orange-50 w-full sm:w-auto px-2"
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
                                    <div className="bg-blue-50 p-4 rounded-lg border">
                                        <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                                            <Calendar className="w-5 h-5 text-blue-600" />
                                            עדכון תאריך משלוח
                                        </h4>
                                        <div className="grid grid-cols-1 gap-4">
                                            <div>
                                                <Label className="text-sm font-medium text-gray-700 mb-1 block">
                                                    תאריך משלוח יעד
                                                </Label>
                                                <Input
                                                    type="date"
                                                    value={getCurrentDateValue(order, 'shipment_due_date')}
                                                    onChange={(e) => {
                                                        console.log(`📅 שינוי תאריך משלוח: ${e.target.value}`);
                                                        handleDateChange(order.id, 'shipment_due_date', e.target.value);
                                                    }}
                                                    className="mt-1 bg-white max-w-xs"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Save Button - Show when there are any edits */}
                                    {hasEdits && (
                                        <div className="flex justify-end bg-green-50 p-3 rounded-lg border border-green-200">
                                            <Button
                                                onClick={() => handleSaveChanges(order.id)}
                                                className="bg-green-600 hover:bg-green-700 text-white font-medium"
                                                size="lg"
                                                disabled={isSaving}
                                            >
                                                {isSaving ? (
                                                    <>
                                                        <div className="w-4 h-4 ml-2 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                                        שומר...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Save className="w-4 h-4 mr-2" />
                                                        שמור שינויים וסנכרן לאופות
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    )}

                                    {/* Bags Summary */}
                                    {hasBagsSummary && (
                                        <div>
                                            <h4 className="font-bold text-gray-800 flex items-center gap-2 mb-2">
                                                <Package className="w-5 h-5 text-blue-600" />
                                                סיכום שקיות למשלוח:
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
                                            <h4 className="font-bold text-gray-800 mb-2">פירוט פריטים למשלוח:</h4>
                                            <div className="rounded-lg border bg-white overflow-hidden">
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow className="bg-gray-100">
                                                            <TableHead>מוצר</TableHead>
                                                            <TableHead>מיקום</TableHead>
                                                            <TableHead>כמות</TableHead>
                                                            <TableHead>הערות לאופה</TableHead> {/* עמודה חדשה */}
                                                            <TableHead>סטטוס ליקוט</TableHead>
                                                            <TableHead>סטטוס אפייה</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {itemsToShow.map((item, itemIndex) => {
                                                            if (item.location_breakdown && item.location_breakdown.length > 0) {
                                                                return item.location_breakdown.map((breakdown, breakdownIndex) => (
                                                                    <TableRow key={`${order.id}-${itemIndex}-${breakdownIndex}`}>
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
                                                                            <Badge className="bg-orange-100 text-orange-800 font-semibold">
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
                                                                                                        open={isBakerNotesDialogOpen[`${order.id}-${itemIndex}`] || false}
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
                                                                                                                    <Label htmlFor={`notes-${order.id}-${itemIndex}`} className="text-sm font-medium text-gray-700">
                                                                                                                        הערות:
                                                                                                                    </Label>
                                                                                                                    <Textarea
                                                                                                                        id={`notes-${order.id}-${itemIndex}`}
                                                                                                                        value={editingBakerNotes[`${order.id}-${itemIndex}`] || ''}
                                                                                                                        onChange={(e) => setEditingBakerNotes(prev => ({
                                                                                                                            ...prev,
                                                                                                                            [`${order.id}-${itemIndex}`]: e.target.value
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
                                                                                                                    onClick={() => closeBakerNotesDialog(order.id, itemIndex)}
                                                                                                                    disabled={isSavingBakerNotes[`${order.id}-${itemIndex}`]}
                                                                                                                >
                                                                                                                    <X className="w-4 h-4 ml-2" />
                                                                                                                    ביטול
                                                                                                                </Button>
                                                                                                                <Button
                                                                                                                    onClick={() => saveBakerNotes(order.id, itemIndex)}
                                                                                                                    disabled={isSavingBakerNotes[`${order.id}-${itemIndex}`]}
                                                                                                                    className="bg-blue-600 hover:bg-blue-700"
                                                                                                                >
                                                                                                                    {isSavingBakerNotes[`${order.id}-${itemIndex}`] ? (
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
                                                                                /* אין הערות - הצג כפתור "הוסף הערה" */
                                                                                <Dialog
                                                                                    open={isBakerNotesDialogOpen[`${order.id}-${itemIndex}`] || false}
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
                                                                                                <Label htmlFor={`notes-${order.id}-${itemIndex}`} className="text-sm font-medium text-gray-700">
                                                                                                    הערות:
                                                                                                </Label>
                                                                                                <Textarea
                                                                                                    id={`notes-${order.id}-${itemIndex}`}
                                                                                                    value={editingBakerNotes[`${order.id}-${itemIndex}`] || ''}
                                                                                                    onChange={(e) => setEditingBakerNotes(prev => ({
                                                                                                        ...prev,
                                                                                                        [`${order.id}-${itemIndex}`]: e.target.value
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
                                                                                                onClick={() => closeBakerNotesDialog(order.id, itemIndex)}
                                                                                                disabled={isSavingBakerNotes[`${order.id}-${itemIndex}`]}
                                                                                            >
                                                                                                <X className="w-4 h-4 ml-2" />
                                                                                                ביטול
                                                                                            </Button>
                                                                                            <Button
                                                                                                onClick={() => saveBakerNotes(order.id, itemIndex)}
                                                                                                disabled={isSavingBakerNotes[`${order.id}-${itemIndex}`]}
                                                                                                className="bg-blue-600 hover:bg-blue-700"
                                                                                                dir="rtl"
                                                                                            >
                                                                                                {isSavingBakerNotes[`${order.id}-${itemIndex}`] ? (
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
                                                                    <TableRow key={`${order.id}-${itemIndex}`}>
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
                                                                            <Badge className="bg-orange-100 text-orange-800 font-semibold">{item.picked_quantity}</Badge>
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
                                                                                                        open={isBakerNotesDialogOpen[`${order.id}-${itemIndex}`] || false}
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
                                                                                                                    <Label htmlFor={`notes-${order.id}-${itemIndex}`} className="text-sm font-medium text-gray-700">
                                                                                                                        הערות:
                                                                                                                    </Label>
                                                                                                                    <Textarea
                                                                                                                        id={`notes-${order.id}-${itemIndex}`}
                                                                                                                        value={editingBakerNotes[`${order.id}-${itemIndex}`] || ''}
                                                                                                                        onChange={(e) => setEditingBakerNotes(prev => ({
                                                                                                                            ...prev,
                                                                                                                            [`${order.id}-${itemIndex}`]: e.target.value
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
                                                                                                                    onClick={() => closeBakerNotesDialog(order.id, itemIndex)}
                                                                                                                    disabled={isSavingBakerNotes[`${order.id}-${itemIndex}`]}
                                                                                                                >
                                                                                                                    <X className="w-4 h-4 ml-2" />
                                                                                                                    ביטול
                                                                                                                </Button>
                                                                                                                <Button
                                                                                                                    onClick={() => saveBakerNotes(order.id, itemIndex)}
                                                                                                                    disabled={isSavingBakerNotes[`${order.id}-${itemIndex}`]}
                                                                                                                    className="bg-blue-600 hover:bg-blue-700"
                                                                                                                >
                                                                                                                    {isSavingBakerNotes[`${order.id}-${itemIndex}`] ? (
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
                                                                                /* אין הערות - הצג כפתור "הוסף הערה" */
                                                                                <Dialog
                                                                                    open={isBakerNotesDialogOpen[`${order.id}-${itemIndex}`] || false}
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
                                                                                                <Label htmlFor={`notes-${order.id}-${itemIndex}`} className="text-sm font-medium text-gray-700">
                                                                                                    הערות:
                                                                                                </Label>
                                                                                                <Textarea
                                                                                                    id={`notes-${order.id}-${itemIndex}`}
                                                                                                    value={editingBakerNotes[`${order.id}-${itemIndex}`] || ''}
                                                                                                    onChange={(e) => setEditingBakerNotes(prev => ({
                                                                                                        ...prev,
                                                                                                        [`${order.id}-${itemIndex}`]: e.target.value
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
                                                                                                onClick={() => closeBakerNotesDialog(order.id, itemIndex)}
                                                                                                disabled={isSavingBakerNotes[`${order.id}-${itemIndex}`]}
                                                                                            >
                                                                                                <X className="w-4 h-4 ml-2" />
                                                                                                ביטול
                                                                                            </Button>
                                                                                            <Button
                                                                                                onClick={() => saveBakerNotes(order.id, itemIndex)}
                                                                                                disabled={isSavingBakerNotes[`${order.id}-${itemIndex}`]}
                                                                                                className="bg-blue-600 hover:bg-blue-700"
                                                                                                dir="rtl"
                                                                                            >
                                                                                                {isSavingBakerNotes[`${order.id}-${itemIndex}`] ? (
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
                                                                        <TableCell>
                                                                            <Badge variant="outline" className="text-green-600 border-green-300 font-medium">
                                                                                במלאי
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
                title="הערות משלוח"
                placeholder="הכנס הערות למשלוח..."
            />
        </>
    );
}
