
import React, { useState, useEffect, useRef } from 'react';
import { Order } from '@/api/entities';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle, XCircle, MapPin, Truck, Store, CalendarDays, Package, Plus, Trash2, Edit3, RefreshCw, Clock, X, Loader2, Save, User, Calendar as CalendarIcon, Box, Send } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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
import { User as UserEntity } from '@/api/entities';
import { useOrders } from '@/components/contexts/OrderContext';
import { triggerNotificationsFromOrder } from '@/api/functions';

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

// רשימת מיקומים רלוונטיים להערות לאופה
const BAKING_RELEVANT_LOCATIONS_FOR_NOTES = ["טרי מטבח", "טרי מטבח לאפייה"];

export default function ItemPickingList({ order, onUpdate, inEditMode = false, updateOrderContext }) {
  const navigate = useNavigate();
  const { updateOrder: contextUpdateOrder } = useOrders();
  
  const updateOrder = updateOrderContext || contextUpdateOrder;

  // State מקומי לכל השינויים - עם הוספת notes_for_baker
  const [localItems, setLocalItems] = useState(() =>
    order.items?.map(item => ({
      ...item,
      picking_status: item.picking_status || 'לא_התחיל',
      picked_quantity: item.picked_quantity || 0,
      location: item.location || '',
      location_breakdown: item.location_breakdown || [],
      baking_status: item.baking_status || '',
      notes_for_baker: item.notes_for_baker || '' // הוספת שדה הערות לאופה
    })) || []
  );

  const [shippingMethod, setShippingMethod] = useState(order.shipping_method_chosen || "");
  const [courierCompany, setCourierCompany] = useState(order.courier_company || "");
  const [shipmentDate, setShipmentDate] = useState(() => {
    const orderDate = order.shipment_due_date ? new Date(order.shipment_due_date) : null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return orderDate && !isNaN(orderDate.getTime()) ? orderDate : today;
  });

  // שני מצבי טעינה נפרדים
  const [isSavingProgress, setIsSavingProgress] = useState(false); // עבור "שמור התקדמות ליקוט"
  const [isFinalizingPicking, setIsFinalizingPicking] = useState(false); // עבור "סיים והעבר לשלב הבא"

  const [originalItems, setOriginalItems] = useState([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const [bagsSummary, setBagsSummary] = useState(order.location_bag_summary || []);

  const [pickupDate, setPickupDate] = useState(() => {
    const orderPickupDate = order.pickup_preferred_date ? new Date(order.pickup_preferred_date) : null;
    return orderPickupDate && !isNaN(orderPickupDate.getTime()) ? orderPickupDate : null;
  });
  const [pickupPreferredTime, setPickupPreferredTime] = useState(order.pickup_preferred_time || "");

  const [editingItem, setEditingItem] = useState(null);
  const [replacementProduct, setReplacementProduct] = useState("");

  const [showItemEditor, setShowItemEditor] = useState(false);

  const [deliveryCost, setDeliveryCost] = useState(order.shipping_cost || 0);
  const [handledBy, setHandledBy] = useState(order.handled_by || "");

  const [handlers, setHandlers] = useState([]);

  // פונקציה לקביעה אם להציג שדה הערות לאופה
  const shouldShowNotesForBaker = (item) => {
    // אם הפריט כבר סומן כ"נשלח לאפייה"
    if (item.picking_status === 'נשלח_לאפייה') {
      return true;
    }
    
    // אם הפריט נלקט ונמצא במיקום רלוונטי לאפייה
    if (item.picking_status === 'יש_במלאי') {
      return itemIsCurrentlyInBakingLocation(item);
    }
    
    return false;
  };

  // פונקציה לבדיקה אם הפריט נמצא במיקום רלוונטי לאפייה
  const itemIsCurrentlyInBakingLocation = (item) => {
    // בדיקה ב-location_breakdown
    if (item.location_breakdown && item.location_breakdown.length > 0) {
      return item.location_breakdown.some(breakdown => 
        BAKING_RELEVANT_LOCATIONS_FOR_NOTES.includes(breakdown.location)
      );
    }
    // בדיקה במיקום הבסיסי
    return BAKING_RELEVANT_LOCATIONS_FOR_NOTES.includes(item.location);
  };

  // פונקציה לעדכון הערות לאופה
  const handleNotesForBakerChange = (itemIndex, notes) => {
    setLocalItems(prev => {
      const updated = [...prev];
      updated[itemIndex] = {
        ...updated[itemIndex],
        notes_for_baker: notes
      };
      return updated;
    });
  };

  // פונקציה לטיפול בתאריך איסוף עם ברירת מחדל לשעה
  const handlePickupDateChange = (date) => {
    setPickupDate(date);
    // אם לא נבחרה שעה עדיין, קבע ברירת מחדל ל-12:00
    if (!pickupPreferredTime && date) {
      setPickupPreferredTime('12:00');
    }
  };

  // פונקציה לבדיקה אם ניתן לשמור התקדמות
  const canSaveProgress = () => {
    return hasUnsavedChanges && handledBy && !isSavingProgress;
  };

  // פונקציה לבדיקה אם ניתן לסיים ליקוט - עדכון להסרת חובת בחירת חברת שילוח
  const canFinalizePicking = () => {
    if (!allPicked || !handledBy || isFinalizingPicking) {
      return false;
    }
    
    if (!shippingMethod) {
      return false;
    }
    
    if (shippingMethod === 'משלוח') {
      return shipmentDate; // הסרנו את הדרישה לcourierCompany
    }
    
    if (shippingMethod === 'איסוף_עצמי') {
      // תיקון: רק תאריך נדרש, שעה אופציונלית
      return pickupDate; 
    }
    
    return false;
  };

  // Use useEffect to update localItems if the order prop changes
  useEffect(() => {
    const newLocalItems = order.items?.map(item => ({
      ...item,
      picking_status: item.picking_status || 'לא_התחיל',
      picked_quantity: item.picked_quantity || 0,
      location: item.location || '',
      location_breakdown: item.location_breakdown || [],
      baking_status: item.baking_status || '',
      notes_for_baker: item.notes_for_baker || '' // וודא שהשדה מתווסף גם בעדכון
    })) || [];
    setLocalItems(newLocalItems);
    setOriginalItems(JSON.parse(JSON.stringify(newLocalItems)));
    
    setHandledBy(order.handled_by || "");
    setBagsSummary(order.location_bag_summary || []);
    setShippingMethod(order.shipping_method_chosen || "");
    setCourierCompany(order.courier_company || "");
    
    if (order.shipment_due_date) {
      const date = new Date(order.shipment_due_date);
      setShipmentDate(date && !isNaN(date.getTime()) ? date : new Date());
    } else {
      const today = new Date();
      today.setHours(0,0,0,0);
      setShipmentDate(today);
    }
    if (order.pickup_preferred_date) {
      const date = new Date(order.pickup_preferred_date);
      setPickupDate(date && !isNaN(date.getTime()) ? date : null);
    } else {
      setPickupDate(null);
    }
    setPickupPreferredTime(order.pickup_preferred_time || "");

    setHasUnsavedChanges(false);
  }, [order.items, order.handled_by, order.location_bag_summary, order.shipping_method_chosen, order.courier_company, order.shipment_due_date, order.pickup_preferred_date, order.pickup_preferred_time]);

  // Effect to detect changes
  useEffect(() => {
    const itemsChanged = JSON.stringify(localItems) !== JSON.stringify(originalItems);
    const bagsChanged = JSON.stringify(bagsSummary) !== JSON.stringify(order.location_bag_summary || []);
    const handledByChanged = handledBy !== (order.handled_by || "");
    const shippingMethodChanged = shippingMethod !== (order.shipping_method_chosen || "");
    const courierCompanyChanged = courierCompany !== (order.courier_company || "");
    
    const currentShipmentDateFormatted = shipmentDate ? format(shipmentDate, 'yyyy-MM-dd') : null;
    const orderShipmentDateFormatted = order.shipment_due_date ? format(new Date(order.shipment_due_date), 'yyyy-MM-dd') : null;
    const shipmentDateChanged = currentShipmentDateFormatted !== orderShipmentDateFormatted;

    const currentPickupDateFormatted = pickupDate ? format(pickupDate, 'yyyy-MM-dd') : null;
    const orderPickupDateFormatted = order.pickup_preferred_date ? format(new Date(order.pickup_preferred_date), 'yyyy-MM-dd') : null;
    const pickupDateChanged = currentPickupDateFormatted !== orderPickupDateFormatted;

    const pickupPreferredTimeChanged = pickupPreferredTime !== (order.pickup_preferred_time || "");

    if (itemsChanged || bagsChanged || handledByChanged || shippingMethodChanged || courierCompanyChanged || shipmentDateChanged || pickupDateChanged || pickupPreferredTimeChanged) {
        setHasUnsavedChanges(true);
    } else {
        setHasUnsavedChanges(false);
    }
  }, [
    localItems, originalItems, bagsSummary, order.location_bag_summary,
    handledBy, order.handled_by, shippingMethod, order.shipping_method_chosen,
    courierCompany, order.courier_company, shipmentDate, order.shipment_due_date,
    pickupDate, order.pickup_preferred_date, pickupPreferredTime, order.pickup_preferred_time
  ]);

  useEffect(() => {
    const loadHandlers = async () => {
        try {
            const currentUser = await UserEntity.me();
            const allowedRoles = ["admin", "store_manager", "picker", "picker_baker"];
            
            try {
                const allUsers = await UserEntity.list();
                const filteredHandlers = allUsers.filter(u =>
                    allowedRoles.includes(u.custom_role) && u.full_name
                );
                setHandlers(filteredHandlers);
            } catch (listError) {
                console.warn("Could not load all users, showing current user only:", listError);
                if (currentUser && allowedRoles.includes(currentUser.custom_role) && currentUser.full_name) {
                    setHandlers([currentUser]);
                } else {
                    setHandlers([]);
                }
            }
        } catch (error) {
            console.error("Failed to load current user:", error);
            setHandlers([]);
        }
    };
    loadHandlers();
  }, []);

  // Derived states for completion logic
  const allPicked = localItems.every(item =>
    item.picking_status === 'יש_במלאי' ||
    item.picking_status === 'חסר_במלאי' ||
    item.picking_status === 'נשלח_לאפייה'
  );

  const hasMissingItems = localItems.some(item =>
    item.picking_status === 'חסר_במלאי' || item.picking_status === 'לא_התחיל'
  );

  // עדכון פריט במצב המקומי בלבד
  const handleStatusChange = (itemIndex, status) => {
    const item = localItems[itemIndex];
    const pickedQuantity = status === 'יש_במלאי' ? item.quantity : 0;

    setLocalItems(prev => {
      const updated = [...prev];
      updated[itemIndex] = {
        ...updated[itemIndex],
        picking_status: status,
        picked_quantity: pickedQuantity,
        location_breakdown: status === 'יש_במלאי' && item.quantity >= 1 ?
          (updated[itemIndex].location_breakdown && updated[itemIndex].location_breakdown.length > 0 ?
            updated[itemIndex].location_breakdown :
            [{ location: '', quantity: item.quantity }]
          ) : [],
        baking_status: ''
      };
      return updated;
    });

    toast.success(`פריט סומן כ"${status === 'יש_במלאי' ? 'יש במלאי' : 'חסר במלאי'}"`, { duration: 1000 });

    if (status === 'חסר_במלאי') {
      setEditingItem(itemIndex);
      setReplacementProduct('');
    } else {
      if (editingItem === itemIndex) {
        setEditingItem(null);
        setReplacementProduct('');
      }
    }
  };

  // החלפת מוצר
  const handleItemReplacement = (itemIndex, newReplacementProduct) => {
    if (!newReplacementProduct) {
      toast.error("יש להזין שם מוצר חלופי");
      return;
    }

    setLocalItems(prev => {
      const updated = [...prev];
      updated[itemIndex] = {
        ...updated[itemIndex],
        product_name: newReplacementProduct,
        picking_status: 'יש_במלאי',
        picked_quantity: updated[itemIndex].quantity,
        location_breakdown: [{ location: '', quantity: updated[itemIndex].quantity }],
        replaced_from: updated[itemIndex].product_name
      };
      return updated;
    });

    toast.success("מוצר הוחלף בהצלחה");
    setEditingItem(null);
    setReplacementProduct("");
  };

  // הוספת מוצר חדש
  const addNewItem = () => {
    const newItem = {
      product_name: '',
      quantity: 1,
      total: 0,
      picking_status: 'לא_התחיל',
      picked_quantity: 0,
      location: '',
      location_breakdown: [],
      baking_status: '',
      notes_for_baker: '' // הוסף גם לפריט חדש
    };

    setLocalItems(prev => [...prev, newItem]);
    toast.success("מוצר חדש נוסף");
  };

  // הסרת מוצר
  const removeItem = (itemIndex) => {
    setLocalItems(prev => prev.filter((_, i) => i !== itemIndex));
    toast.success("מוצר הוסר");
  };

  // עדכון פרטי מוצר
  const updateItemDetails = (itemIndex, field, value) => {
    setLocalItems(prev => {
      const updated = [...prev];
      updated[itemIndex] = {
        ...updated[itemIndex],
        [field]: field === 'quantity' || field === 'total' ? parseFloat(value) || 0 : value
      };
      if (field === 'quantity' && updated[itemIndex].picking_status === 'יש_במלאי') {
        const newQuantity = parseFloat(value) || 0;
        updated[itemIndex].picked_quantity = newQuantity;
        if (updated[itemIndex].location_breakdown.length === 1 && !updated[itemIndex].location_breakdown[0].location) {
          updated[itemIndex].location_breakdown[0].quantity = newQuantity;
        } else {
          updated[itemIndex].location_breakdown = [{ location: '', quantity: newQuantity }];
        }
      }
      return updated;
    });
  };

  // עדכון חלוקה למיקומים
  const handleLocationBreakdownChange = (itemIndex, breakdownIndex, field, value) => {
    setLocalItems(prev => {
      const updated = [...prev];
      const newBreakdown = [...updated[itemIndex].location_breakdown];
      newBreakdown[breakdownIndex] = {
        ...newBreakdown[breakdownIndex],
        [field]: field === 'quantity' ? parseInt(value) || 0 : value
      };
      if (field === 'location' && breakdownIndex === 0) {
        updated[itemIndex].location = value;
      }
      updated[itemIndex] = {
        ...updated[itemIndex],
        location_breakdown: newBreakdown
      };
      return updated;
    });
  };

  // הוספת מיקום נוסף
  const addLocationBreakdown = (itemIndex) => {
    setLocalItems(prev => {
      const updated = [...prev];
      updated[itemIndex] = {
        ...updated[itemIndex],
        location_breakdown: [
          ...updated[itemIndex].location_breakdown,
          { location: '', quantity: 0 }
        ]
      };
      return updated;
    });
  };

  // הסרת מיקום
  const removeLocationBreakdown = (itemIndex, breakdownIndex) => {
    setLocalItems(prev => {
      const updated = [...prev];
      const newBreakdown = updated[itemIndex].location_breakdown.filter((_, i) => i !== breakdownIndex);
      updated[itemIndex] = {
        ...updated[itemIndex],
        location_breakdown: newBreakdown.length > 0 ? newBreakdown : [{ location: '', quantity: updated[itemIndex].quantity }]
      };
      if (breakdownIndex === 0 && newBreakdown.length > 0) {
        updated[itemIndex].location = newBreakdown[0].location;
      } else if (breakdownIndex === 0 && newBreakdown.length === 0) {
        updated[itemIndex].location = '';
      }
      return updated;
    });
  };

  // בדיקה שסך הכמויות במיקומים תואם לכמות הכוללת
  const validateLocationBreakdown = (item) => {
    if (item.picking_status !== 'יש_במלאי') return true;

    const totalBreakdown = item.location_breakdown.reduce((sum, loc) => sum + (loc.quantity || 0), 0);
    return totalBreakdown === item.quantity;
  };

  // עדכון כמות שקיות
  const updateBagsCount = (locationIndex, newCount) => {
    setBagsSummary(prev => {
      const updated = [...prev];
      updated[locationIndex] = {
        ...updated[locationIndex],
        bags_count: parseInt(newCount) || 0
      };
      return updated;
    });
  };

  // *** פונקציה חדשה: שמירת התקדמות בלבד (ללא קידום לשלב הבא) ***
  const handleSaveProgress = async () => {
    if (!canSaveProgress()) {
      if (!handledBy) {
        toast.error("יש לבחור מי מטפל בהזמנה לפני שמירת התקדמות.");
      } else {
        toast.info("אין שינויים לשמירה");
      }
      return;
    }

    const toastId = toast.loading("שומר התקדמות...", { position: "top-center" });
    setIsSavingProgress(true);

    try {
      // בדיקת תקינות בסיסית
      const invalidItems = localItems.filter(item => item.picking_status === 'יש_במלאי' && !validateLocationBreakdown(item));
      if (invalidItems.length > 0) {
        toast.error("יש לוודא שסך כל הכמויות במיקומים תואם לכמות הכוללת של הפריט", { id: toastId });
        setIsSavingProgress(false);
        return;
      }

      const itemsWithEmptyLocations = localItems.filter(item =>
        item.picking_status === 'יש_במלאי' &&
        item.location_breakdown.some(loc => !loc.location || loc.quantity <= 0)
      );
      if (itemsWithEmptyLocations.length > 0) {
        toast.error("יש לבחור מיקום וכמות לכל חלק של הפריט", { id: toastId });
        setIsSavingProgress(false);
        return;
      }

      // עדכון סטטוס הליקוט הכללי בהתבסס על התקדמות
      const totalItemsCount = localItems.length;
      const fullyProcessedItems = localItems.filter(item =>
        item.picking_status === 'יש_במלאי' ||
        item.picking_status === 'חסר_במלאי' ||
        item.picking_status === 'נשלח_לאפייה'
      ).length;

      let newOverallPickingStatus = order.picking_status;
      let newOrderStatus = order.status;

      if (totalItemsCount > 0 && fullyProcessedItems > 0) {
        if (fullyProcessedItems === totalItemsCount) {
          newOverallPickingStatus = 'הושלם';
        } else {
          newOverallPickingStatus = 'בתהליך';
        }
        // אם יש התקדמות, שנה את סטטוס ההזמנה ל"בליקוט"
        if (newOrderStatus === 'ממתין') {
          newOrderStatus = 'בליקוט';
        }
      }

      // שמירה פשוטה ללא קידום לשלב הבא
      const updatePayload = {
        items: localItems,
        picking_status: newOverallPickingStatus,
        status: newOrderStatus,
        location_bag_summary: bagsSummary,
        handled_by: handledBy,
      };

      // אם הליקוט התחיל לראשונה, רשום תאריך התחלה
      if (order.picking_status === 'לא_התחיל' && newOverallPickingStatus !== 'לא_התחיל') {
        updatePayload.picking_started_date = new Date().toISOString();
      }

      await updateOrder(order.id, updatePayload);

      toast.success("התקדמות הליקוט נשמרה בהצלחה!", { duration: 3000, id: toastId });

      if (onUpdate) {
        onUpdate();
      }

      setOriginalItems(JSON.parse(JSON.stringify(localItems)));
      setHasUnsavedChanges(false);

    } catch (error) {
      console.error('Error saving picking progress:', error);
      toast.error('שגיאה בשמירת התקדמות. אנא נסה שוב.', { id: toastId });
    } finally {
      setIsSavingProgress(false);
    }
  };

  // *** פונקציה מקורית: סיום מלא של הליקוט וקידום לשלב הבא ***
  const handleFinalizePicking = async () => {
    if (!canFinalizePicking()) {
      toast.error("יש להשלים את כל הפרטים הנדרשים לפני סיום הליקוט.");
      return;
    }

    const toastId = toast.loading("מסיים ליקוט ומקדם לשלב הבא...", { position: "top-center" });
    setIsFinalizingPicking(true);

    try {
      // כל הוולידציות הקיימות
      const itemsToProcess = localItems.map(item => {
        if (item.picking_status === 'לא_התחיל' && item.quantity > 0) {
          return { ...item, picking_status: 'חסר_במלאי', picked_quantity: 0 };
        }
        if (item.picking_status === 'יש_במלאי') {
          return { ...item, picked_quantity: item.quantity };
        }
        if (item.picking_status === 'חסר_במלאי' || item.picking_status === 'נשלח_לאפייה') {
          return { ...item, picked_quantity: 0 };
        }
        return item;
      });

      const invalidItems = itemsToProcess.filter(item => item.picking_status === 'יש_במלאי' && !validateLocationBreakdown(item));
      if (invalidItems.length > 0) {
        toast.error("יש לוודא שסך כל הכמויות במיקומים תואם לכמות הכוללת של הפריט", { id: toastId });
        setIsFinalizingPicking(false);
        return;
      }

      const itemsWithEmptyLocations = itemsToProcess.filter(item =>
        item.picking_status === 'יש_במלאי' &&
        item.location_breakdown.some(loc => !loc.location || loc.quantity <= 0)
      );
      if (itemsWithEmptyLocations.length > 0) {
        toast.error("יש לבחור מיקום וכמות לכל חלק של הפריט", { id: toastId });
        setIsFinalizingPicking(false);
        return;
      }

      const newOverallPickingStatus = 'הושלם';
      let newOrderStatus = order.status;
      const pickingCompletedDate = new Date().toISOString();

      const itemsForBaking = [];
      const updatedItemsForOriginalOrder = [];

      itemsToProcess.forEach(item => {
        let shouldGoToBaking = false;
        if (item.picking_status === 'יש_במלאי') {
          if (item.location_breakdown && item.location_breakdown.length > 0) {
            shouldGoToBaking = item.location_breakdown.some(b => 
              b.location === 'טרי מטבח' || b.location === 'טרי מטבח לאפייה'
            );
          } else if (item.location) {
            shouldGoToBaking = item.location === 'טרי מטבח' || item.location === 'טרי מטבח לאפייה';
          }
        }

        if (shouldGoToBaking) {
          itemsForBaking.push({
            ...item,
            baking_status: 'ממתין',
            picking_status: 'לא_התחיל'
          });
          updatedItemsForOriginalOrder.push({
            ...item,
            picking_status: 'נשלח_לאפייה',
            baking_status: 'נשלח_לאפייה'
          });
        } else {
          updatedItemsForOriginalOrder.push(item);
        }
      });

      if (itemsForBaking.length > 0) {
        const totalBakingAmount = itemsForBaking.reduce((sum, item) => sum + (item.total || 0), 0);
        const bakingOrderDueDate = shippingMethod === 'איסוף_עצמי' ? pickupDate : shipmentDate;
        const formattedBakingDueDate = bakingOrderDueDate instanceof Date && !isNaN(bakingOrderDueDate.getTime())
                                        ? format(bakingOrderDueDate, 'yyyy-MM-dd')
                                        : new Date().toISOString().split('T')[0];

        await Order.create({
            supplier: order.supplier,
            order_number: `${order.order_number}-אפייה`,
            customer_name: order.customer_name,
            customer_phone: order.customer_phone,
            billing_name: order.billing_name,
            billing_phone: order.billing_phone,
            shipping_name: order.shipping_name,
            shipping_phone: order.shipping_phone,
            total_amount: totalBakingAmount,
            status: 'בליקוט',
            order_type: 'הזמנה_לאופות',
            original_order_id: order.id,
            items: itemsForBaking,
            email_received_date: order.email_received_date,
            picking_status: 'לא_התחיל',
            shipment_due_date: shippingMethod === 'משלוח' ? formattedBakingDueDate : undefined,
            pickup_preferred_date: shippingMethod === 'איסוף_עצמי' ? formattedBakingDueDate : undefined,
            notes: `הזמנת אפייה אוטומטית עבור הזמנה ${order.order_number} (${order.customer_name})`
        });
        toast.info(`נוצרה הזמנת אפייה אוטומטית עם ${itemsForBaking.length} פריטים.`, { id: toastId });

        try {
          await triggerNotificationsFromOrder({ 
            orderId: order.id,
            triggerType: 'baking_order_created' 
          });
        } catch (notificationError) {
          console.error('Error triggering baking notifications:', notificationError);
        }
      }

      // עדכון ההזמנה המקורית לסיום מלא
      const formattedShipmentDate = shipmentDate instanceof Date && !isNaN(shipmentDate.getTime())
        ? format(shipmentDate, "yyyy-MM-dd")
        : new Date().toISOString().split('T')[0];

      const formattedPickupDate = pickupDate instanceof Date && !isNaN(pickupDate.getTime())
        ? format(pickupDate, "yyyy-MM-dd")
        : new Date().toISOString().split('T')[0];

      const updatePayload = {
        items: updatedItemsForOriginalOrder,
        picking_status: newOverallPickingStatus,
        picking_completed_date: pickingCompletedDate,
        location_bag_summary: bagsSummary,
        handled_by: handledBy,
      };
      
      if (shippingMethod === 'משלוח') {
        updatePayload.status = 'ממתין למשלוח';
        updatePayload.shipment_due_date = formattedShipmentDate;
        updatePayload.shipping_method_chosen = 'משלוח';
        // חברת שילוח אופציונלית - נוסיף רק אם נבחרה
        if (courierCompany) {
          updatePayload.courier_company = courierCompany;
        }
      } else if (shippingMethod === 'איסוף_עצמי') {
        updatePayload.status = 'ממתין לאיסוף';
        updatePayload.pickup_preferred_date = formattedPickupDate;
        updatePayload.shipping_method_chosen = 'איסוף_עצמי';
        // Note: pickupPreferredTime is now optional for the condition in canFinalizePicking,
        // but it's still good to save it if set.
        if (pickupPreferredTime) {
          updatePayload.pickup_preferred_time = pickupPreferredTime;
        } else {
          // If pickupPreferredTime is not set by user, set a default for the order object
          updatePayload.pickup_preferred_time = '12:00';
        }
      }

      await updateOrder(order.id, updatePayload);

      if (order.picking_status !== 'הושלם') {
        toast.success('הליקוט הושלם בהצלחה!', { duration: 4000, position: "top-center", id: toastId });
        
        try {
          await triggerNotificationsFromOrder({ 
            orderId: order.id, 
            triggerType: 'picking_completed' 
          });
        } catch (notificationError) {
          console.error('Error triggering completion notifications:', notificationError);
        }

        if (shippingMethod === 'משלוח') {
          navigate(createPageUrl("Shipments"));
        } else if (shippingMethod === 'איסוף_עצמי') {
          navigate(createPageUrl("Pickups"));
        }
      }

      if (onUpdate) {
        onUpdate();
      }

      setOriginalItems(JSON.parse(JSON.stringify(localItems)));
      setHasUnsavedChanges(false);

    } catch (error) {
      console.error('Error in handleFinalizePicking:', error);
      toast.error('שגיאה בסיום הליקוט. אנא נסה שוב.', { id: toastId });
    } finally {
      setIsFinalizingPicking(false);
    }
  };

  const getItemStatusBadge = (status) => {
    const statusConfig = {
      "לא_התחיל": { color: "bg-gray-100 text-gray-800", text: "לא התחיל" },
      "יש_במלאי": { color: "bg-green-100 text-green-800", text: "יש במלאי", icon: CheckCircle },
      "חסר_במלאי": { color: "bg-red-100 text-red-800", text: "חסר במלאי", icon: XCircle },
      "נשלח_לאפייה": { color: "bg-blue-100 text-blue-800", text: "נשלח לאפייה", icon: Truck }
    };

    const config = statusConfig[status] || statusConfig["לא_התחיל"];
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} flex items-center gap-1 font-medium`}>
        {Icon && <Icon className="w-3 h-3" />}
        {config.text}
      </Badge>
    );
  };

  const BAKING_RELEVANT_LOCATIONS = ["טרי מטבח", "טרי מטבח לאפייה"];

  const isLocationRelevantForBaking = (item) => {
    if (item.location_breakdown && item.location_breakdown.length > 0) {
      return item.location_breakdown.some(breakdown => 
        BAKING_RELEVANT_LOCATIONS.includes(breakdown.location)
      );
    }
    return BAKING_RELEVANT_LOCATIONS.includes(item.location);
  };

  const getBakingStatusBadge = (item) => {
    if (!isLocationRelevantForBaking(item)) {
      return (
        <Badge variant="outline" className="bg-gray-100 text-gray-600 border-gray-300 text-xs font-medium">
          לא רלוונטי
        </Badge>
      );
    }

    let bakingStatusText = "לא רלוונטי";

    if (item.picking_status === 'יש_במלאי') {
      bakingStatusText = "נשלח לאפייה";
    } else if (item.picking_status === 'נשלח_לאפייה') {
      bakingStatusText = item.baking_status === 'הוכן' ? "מוכן" : "לאפייה";
    } else {
      bakingStatusText = "ממתין לליקוט";
    }

    const statusColors = {
      "לא רלוונטי": "bg-gray-100 text-gray-600 border-gray-300",
      "ממתין לליקוט": "bg-yellow-100 text-yellow-800 border-yellow-300",
      "נשלח לאפייה": "bg-blue-100 text-blue-800 border-blue-300",
      "לאפייה": "bg-orange-100 text-orange-800 border-orange-300",
      "מוכן": "bg-green-100 text-green-800 border-green-300"
    };

    return (
      <Badge variant="outline" className={`${statusColors[bakingStatusText]} text-xs font-medium`}>
        {bakingStatusText}
      </Badge>
    );
  };

  const checkedItems = localItems.filter(item =>
    item.picking_status === 'יש_במלאי' || item.picking_status === 'חסר_במלאי' || item.picking_status === 'נשלח_לאפייה'
  ).length;

  const progress = localItems.length > 0 ? (checkedItems / localItems.length) * 100 : 0;

  const safeFormatDate = (date) => {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      return format(new Date(), "dd/MM/yyyy", { locale: he });
    }
    return format(date, "dd/MM/yyyy", { locale: he });
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {inEditMode && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mx-4 sm:mx-0">
          <div className="flex items-center gap-2 text-blue-700 text-sm">
            <Package className="w-4 h-4" />
            <span className="font-medium">מצב עריכה</span>
          </div>
          <p className="text-blue-600 text-xs mt-1">
            ניתן לערוך כמויות, מיקומים וסטטוס ליקוט של הפריטים
          </p>
        </div>
      )}
      
      {/* Top section: Title and Save Progress Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 px-4 pt-4 sm:px-0 sm:pt-0">
        <h3 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
          <Package className="w-5 h-5 text-blue-600" />
          פריטים לליקוט ({localItems.length})
        </h3>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            onClick={handleSaveProgress}
            disabled={!canSaveProgress()}
            className="w-full sm:w-auto bg-green-600 hover:bg-green-700 disabled:bg-gray-300 elegant-shadow"
            size="sm"
            title={!handledBy ? "יש לבחור מי מטפל בהזמנה תחילה" : !hasUnsavedChanges ? "אין שינויים לשמירה" : "שמור את ההתקדמות הנוכחית"}
          >
            {isSavingProgress ? (
              <>
                <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                שומר...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 ml-2" />
                שמור התקדמות ליקוט
              </>
            )}
          </Button>
        </div>
      </div>

      {/* מי מטפל בהזמנה? section */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-3 bg-green-50/50 rounded-lg border border-green-100 mx-4 sm:mx-0">
          <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-green-600" />
              <label htmlFor={`handler-select-${order.id}`} className="font-semibold text-gray-700 text-sm">
                  מי מטפל בהזמנה:
              </label>
          </div>
          <Select
              value={handledBy || ""}
              onValueChange={(value) => setHandledBy(value)}
          >
              <SelectTrigger id={`handler-select-${order.id}`} className="w-full sm:w-52 bg-white">
                  <SelectValue placeholder="בחר מטפל..." />
              </SelectTrigger>
              <SelectContent>
                  <SelectItem value={null}>
                      <em>לא צוין</em>
                  </SelectItem>
                  {handlers.map(handler => (
                      <SelectItem key={handler.id} value={handler.full_name}>
                          {handler.full_name}
                      </SelectItem>
                  ))}
              </SelectContent>
          </Select>
      </div>

      {/* Edit Order Button and Dialog */}
      <div className="flex justify-end px-4 sm:px-0">
        <Dialog open={showItemEditor} onOpenChange={setShowItemEditor}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="bg-white text-xs sm:text-sm h-8 sm:h-9">
              <Edit3 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              ערוך הזמנה
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto mx-2 sm:mx-auto">
            <DialogHeader>
              <DialogTitle>עריכת פריטי ההזמנה</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {/* Mobile: Card View */}
              <div className="md:hidden space-y-3">
                {localItems.map((item, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-3 space-y-3 border">
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-gray-700">שם המוצר:</Label>
                      <Input
                        value={item.product_name}
                        onChange={(e) => updateItemDetails(index, 'product_name', e.target.value)}
                        placeholder="שם מוצר"
                        className="text-sm"
                      />
                      {item.replaced_from && (
                        <div className="text-xs text-orange-600">
                          הוחלף מ: {item.replaced_from}
                        </div>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs font-medium text-gray-700">כמות:</Label>
                        <Input
                          type="number"
                          min="0"
                          value={item.quantity}
                          onChange={(e) => updateItemDetails(index, 'quantity', e.target.value)}
                          className="text-sm"
                        />
                      </div>
                      <div>
                        <Label className="text-xs font-medium text-gray-700">מחיר:</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.total}
                          onChange={(e) => updateItemDetails(index, 'total', e.target.value)}
                          className="text-sm"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(index)}
                        className="text-red-600 hover:bg-red-100"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        הסר
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop: Table View */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>שם המוצר</TableHead>
                      <TableHead>כמות</TableHead>
                      <TableHead>מחיר</TableHead>
                      <TableHead>פעולות</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {localItems.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Input
                            value={item.product_name}
                            onChange={(e) => updateItemDetails(index, 'product_name', e.target.value)}
                            placeholder="שם מוצר"
                            className="text-sm"
                          />
                          {item.replaced_from && (
                            <div className="text-xs text-orange-600 mt-1">
                              הוחלף מ: {item.replaced_from}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            value={item.quantity}
                            onChange={(e) => updateItemDetails(index, 'quantity', e.target.value)}
                            className="w-20 text-sm"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.total}
                            onChange={(e) => updateItemDetails(index, 'total', e.target.value)}
                            className="w-24 text-sm"
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeItem(index)}
                            className="h-8 w-8 text-red-600 hover:bg-red-100"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <Button onClick={addNewItem} className="w-full text-sm">
                <Plus className="w-4 h-4 mr-2" />
                הוסף מוצר
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Items List - Mobile Optimized / Responsive detailed cards */}
      <div className="space-y-3 sm:space-y-4 px-4 sm:px-0">
        {localItems.map((item, index) => (
          <div key={index} className="bg-gray-50 rounded-lg p-3 sm:p-4 space-y-3 shadow-sm border border-gray-100 elegant-shadow-sm">
            {/* Product Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
              <div className="flex-1 min-w-0">
                <h5 className="font-semibold text-gray-900 text-sm sm:text-base">
                  {item.product_name}
                  {item.replaced_from && (
                    <span className="text-xs text-orange-600 ml-1 sm:ml-2">
                      (הוחלף מ: {item.replaced_from})
                    </span>
                  )}
                </h5>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs px-3 py-1 min-w-fit whitespace-nowrap">
                    כמות: {item.quantity}
                  </Badge>
                  {item.location && (
                    <Badge variant="outline" className="text-xs flex items-center gap-1 min-w-fit">
                      <MapPin className="w-3 h-3" />
                      {item.location}
                    </Badge>
                  )}
                  {getItemStatusBadge(item.picking_status)}
                  {getBakingStatusBadge(item)}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                variant={item.picking_status === 'יש_במלאי' ? 'default' : 'outline'}
                onClick={() => handleStatusChange(index, 'יש_במלאי')}
                className={`flex-1 text-xs sm:text-sm h-8 sm:h-9 ${
                  item.picking_status === 'יש_במלאי'
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-white hover:bg-green-50 border-green-200 text-green-700'
                }`}
                size="sm"
              >
                <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                יש במלאי
              </Button>

              <Button
                variant={item.picking_status === 'חסר_במלאי' ? 'default' : 'outline'}
                onClick={() => handleStatusChange(index, 'חסר_במלאי')}
                className={`flex-1 text-xs sm:text-sm h-8 sm:h-9 ${
                  item.picking_status === 'חסר_במלאי'
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-white hover:bg-red-50 border-red-200 text-red-700'
                }`}
                size="sm"
              >
                <X className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                אין במלאי
              </Button>
            </div>

            {/* Show replacement options for missing items */}
            {item.picking_status === 'חסר_במלאי' && editingItem === index && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 space-y-3">
                <h6 className="font-medium text-yellow-800 text-sm">החלפת מוצר:</h6>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Input
                    placeholder="שם מוצר חלופי"
                    value={replacementProduct}
                    onChange={(e) => setReplacementProduct(e.target.value)}
                    className="flex-1 text-sm h-8"
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleItemReplacement(index, replacementProduct)}
                      className="bg-yellow-600 hover:bg-yellow-700 text-xs h-8 px-3"
                      size="sm"
                    >
                      החלף
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setEditingItem(null)}
                      className="text-xs h-8 px-3"
                      size="sm"
                    >
                      ביטול
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {item.picking_status === 'חסר_במלאי' && editingItem !== index && (
              <Button
                variant="outline"
                onClick={() => {
                  setEditingItem(index);
                  setReplacementProduct('');
                }}
                className="w-full text-xs h-8 bg-yellow-50 border-yellow-200 hover:bg-yellow-100 text-yellow-700"
                size="sm"
              >
                <Plus className="w-3 h-3 mr-1" />
                הוסף מוצר חלופי
              </Button>
            )}

            {/* Location breakdown */}
            {item.picking_status === 'יש_במלאי' && (
              <div className="bg-green-50 p-3 rounded-lg border border-green-200 mt-3 space-y-2">
                <div className="flex items-center justify-between">
                  <h6 className="font-medium text-green-800 text-sm flex items-center gap-1">
                    <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                    חלוקה למיקומים:
                  </h6>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => addLocationBreakdown(index)}
                    className="text-green-700 border-green-300 hover:bg-green-100 h-7 text-xs"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    הוסף מיקום
                  </Button>
                </div>

                {/* Location breakdown editing */}
                {item.location_breakdown && item.location_breakdown.length > 0 && (
                  <div className="grid gap-2">
                    {item.location_breakdown.map((breakdown, locIndex) => (
                      <div key={locIndex} className="flex items-center gap-2 p-2 bg-white rounded border">
                        <Select
                          value={breakdown.location || ''}
                          onValueChange={(value) => handleLocationBreakdownChange(index, locIndex, 'location', value)}
                        >
                          <SelectTrigger className="flex-1 text-xs h-6 bg-gray-50 border-gray-200">
                            <SelectValue placeholder="בחר מיקום" />
                          </SelectTrigger>
                          <SelectContent>
                            {ITEM_LOCATIONS.map((loc) => (
                              <SelectItem key={loc} value={loc} className="text-xs">
                                {loc}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Input
                          type="number"
                          min="0"
                          max={item.quantity}
                          value={breakdown.quantity === 0 ? '' : breakdown.quantity}
                          onChange={(e) => handleLocationBreakdownChange(index, locIndex, 'quantity', e.target.value)}
                          className="w-16 text-xs h-6 p-1 text-center bg-blue-50 border-blue-200"
                          placeholder="כמות"
                        />
                        {item.location_breakdown.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeLocationBreakdown(index, locIndex)}
                            className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Summary of quantities */}
                <div className="mt-2 p-2 bg-green-100 rounded text-xs sm:text-sm">
                  <span className="font-medium">
                    סך הכל: {item.location_breakdown.reduce((sum, loc) => sum + (loc.quantity || 0), 0)} / {item.quantity}
                  </span>
                  {!validateLocationBreakdown(item) && (
                    <span className="text-red-600 font-medium mr-1 sm:mr-2">
                      (יש לתקן את החלוקה)
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* *** שדה הערות לאופה החדש *** */}
            {shouldShowNotesForBaker(item) && (
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 mt-3 space-y-2">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm">🧑‍🍳</span>
                  <Label htmlFor={`notes_for_baker_${index}`} className="font-medium text-blue-800 text-sm">
                    הערות לאופה על הפריט:
                  </Label>
                </div>
                <Textarea
                  id={`notes_for_baker_${index}`}
                  value={item.notes_for_baker || ''}
                  onChange={(e) => handleNotesForBakerChange(index, e.target.value)}
                  placeholder="הכנס הערות לאופה (למשל: כיתוב על עוגה, עיצוב מיוחד, דרישות אלרגיה)"
                  className="text-sm h-20 bg-white"
                />
                <p className="text-xs text-blue-600">
                  💡 הערות אלה יועברו לאופה יחד עם הפריט
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Progress Bar */}
      <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm mx-4 sm:mx-0 elegant-shadow">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs sm:text-sm font-medium text-gray-700">התקדמות ליקוט:</span>
          <span className="text-xs sm:text-sm text-gray-600 px-2 py-1 bg-gray-100 rounded-full min-w-fit">{checkedItems} / {localItems.length}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Bags Summary Section - Manual Entry */}
      {localItems.some(item => item.picking_status === 'יש_במלאי' || item.picking_status === 'נשלח_לאפייה') && (
        <div className="bg-blue-50 rounded-lg p-3 sm:p-4 space-y-3 mx-4 sm:mx-0 elegant-shadow">
          <div className="flex justify-between items-center">
            <h5 className="font-bold text-blue-800 text-sm sm:text-base flex items-center gap-2">
              <Package className="w-4 h-4 sm:w-5 sm:h-5" />
              סיכום שקיות למשלוח:
            </h5>
            <Button
              onClick={() => setBagsSummary(prev => [...prev, { location: '', bags_count: 1, unit_type: 'שקיות' }])}
              variant="outline"
              size="sm"
              className="text-blue-700 border-blue-300 hover:bg-blue-100 h-7 text-xs"
            >
              <Plus className="w-3 h-3 mr-1" />
              הוסף מיקום
            </Button>
          </div>

          {bagsSummary && bagsSummary.length > 0 ? (
            <div className="space-y-2">
              {bagsSummary.map((bag, index) => (
                <div key={index} className="bg-white rounded-lg p-2 sm:p-3 border border-gray-200">
                  <div className="flex items-center gap-2">
                    <Select
                      value={bag.location || ''}
                      onValueChange={(value) => setBagsSummary(prev => {
                        const updated = [...prev];
                        updated[index] = { ...updated[index], location: value };
                        return updated;
                      })}
                    >
                      <SelectTrigger className="flex-1 text-xs sm:text-sm h-8">
                        <SelectValue placeholder="בחר מיקום" />
                      </SelectTrigger>
                      <SelectContent>
                        {ITEM_LOCATIONS.map((loc) => (
                          <SelectItem key={loc} value={loc} className="text-xs">
                            {loc}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Input
                      type="number"
                      min="1"
                      value={bag.bags_count === 0 ? '' : bag.bags_count}
                      onChange={(e) => updateBagsCount(index, e.target.value)}
                      className="w-16 sm:w-20 text-center text-xs sm:text-sm h-8"
                      placeholder="כמות"
                    />
                    
                    <Select
                      value={bag.unit_type || 'שקיות'}
                      onValueChange={(value) => setBagsSummary(prev => {
                        const updated = [...prev];
                        updated[index] = { ...updated[index], unit_type: value };
                        return updated;
                      })}
                    >
                      <SelectTrigger className="w-20 sm:w-24 text-xs sm:text-sm h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="שקיות">שקיות</SelectItem>
                        <SelectItem value="קרטון">קרטון</SelectItem>
                        <SelectItem value="יחידות">יחידות</SelectItem>
                      </SelectContent>
                    </Select>

                    <Button
                      onClick={() => setBagsSummary(prev => prev.filter((_, i) => i !== index))}
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg p-4 text-center text-gray-500 border-2 border-dashed border-gray-300">
              <Package className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm font-medium">אין מיקומים להצגה</p>
              <p className="text-xs text-gray-400 mt-1">לחץ על "הוסף מיקום" כדי להתחיל</p>
            </div>
          )}
        </div>
      )}

      {/* ============== סיום ליקוט ============== */}
      {allPicked && (
        <div className="mt-6 pt-6 border-t border-dashed border-gray-300">
          {/* Enhanced Mobile-First Completion Section */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-4 sm:p-6 mx-2 sm:mx-0 elegant-shadow-lg">
            <h3 className="text-xl sm:text-2xl font-bold text-center text-green-800 mb-4 sm:mb-6">
              🎉 ליקוט הושלם בהצלחה!
            </h3>

            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm space-y-4 sm:space-y-6">
              {/* בורר אופן משלוח */}
              <div>
                <p className="text-sm sm:text-base font-bold text-gray-800 mb-3 text-center">בחר אופן משלוח:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Button
                    onClick={() => setShippingMethod('משלוח')}
                    variant={shippingMethod === 'משלוח' ? 'default' : 'outline'}
                    className={`h-12 sm:h-14 text-sm sm:text-base font-medium ${
                      shippingMethod === 'משלוח'
                        ? 'bg-blue-600 hover:bg-blue-700 text-white border-2 border-blue-600'
                        : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-blue-400'
                    }`}
                  >
                    <Truck className="w-5 h-5 sm:w-6 sm:h-6 ml-2" />
                    משלוח
                  </Button>
                  <Button
                    onClick={() => setShippingMethod('איסוף_עצמי')}
                    variant={shippingMethod === 'איסוף_עצמי' ? 'default' : 'outline'}
                    className={`h-12 sm:h-14 text-sm sm:text-base font-medium ${
                      shippingMethod === 'איסוף_עצמי'
                        ? 'bg-purple-600 hover:bg-purple-700 text-white border-2 border-purple-600'
                        : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-purple-400'
                    }`}
                  >
                    <Store className="w-5 h-5 sm:w-6 sm:h-6 ml-2" />
                    איסוף עצמי
                  </Button>
                </div>
              </div>

              {/* שדות תלויים בבחירה */}
              <div className="space-y-4 sm:space-y-5">
                {/* מקרה של משלוח */}
                {shippingMethod === 'משלוח' && (
                  <div className="space-y-4 animate-in fade-in bg-blue-50 p-4 rounded-xl border border-blue-200">
                    <div>
                      <Label className="text-sm sm:text-base font-semibold text-blue-800 block mb-2">חברת שילוח: <span className="text-gray-400 text-xs">(אופציונלי)</span></Label>
                      <Select value={courierCompany} onValueChange={setCourierCompany}>
                        <SelectTrigger className="h-12 text-sm sm:text-base">
                          <SelectValue placeholder="בחר חברת שילוח" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ציטה">🐆 ציטה</SelectItem>
                          <SelectItem value="דוד">🚚 דוד</SelectItem>
                          <SelectItem value="עצמאי">🚶‍♂️ עצמאי</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-sm sm:text-base font-semibold text-blue-800 flex items-center mb-2">
                        תאריך יעד למשלוח: <span className="text-red-500 mr-1">*</span>
                      </Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start text-left font-normal h-12">
                            <CalendarIcon className="ml-2 h-5 w-5" />
                            {shipmentDate ? format(shipmentDate, "dd/MM/yyyy", { locale: he }) : <span>בחר תאריך</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={shipmentDate}
                            onSelect={setShipmentDate}
                            initialFocus
                            locale={he}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                )}

                {/* מקרה של איסוף עצמי */}
                {shippingMethod === 'איסוף_עצמי' && (
                  <div className="space-y-4 animate-in fade-in bg-purple-50 p-4 rounded-xl border border-purple-200">
                    <div>
                      <Label className="text-sm sm:text-base font-semibold text-purple-800 flex items-center mb-2">
                        תאריך איסוף מועדף: <span className="text-red-500 mr-1">*</span>
                      </Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start text-left font-normal h-12">
                            <CalendarIcon className="ml-2 h-5 w-5" />
                            {pickupDate ? format(pickupDate, "dd/MM/yyyy", { locale: he }) : <span>בחר תאריך</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={pickupDate}
                            onSelect={handlePickupDateChange}
                            initialFocus
                            locale={he}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div>
                      <Label className="text-sm sm:text-base font-semibold text-purple-800 flex items-center mb-2">
                        שעת איסוף מועדפת: <span className="text-gray-400 text-xs">(אופציונלי - ברירת מחדל 12:00)</span>
                      </Label>
                      <Input
                        type="time"
                        value={pickupPreferredTime}
                        onChange={(e) => setPickupPreferredTime(e.target.value)}
                        className="h-12 text-sm sm:text-base"
                        placeholder="12:00"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* כפתור סיום ליקוט - ENHANCED */}
              <div className="pt-4 border-t border-gray-200">
                <Button
                  onClick={handleFinalizePicking}
                  className="w-full h-14 sm:h-16 text-base sm:text-lg font-bold shadow-lg"
                  style={{
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    border: '2px solid #065f46',
                    boxShadow: '0 8px 20px rgba(16, 185, 129, 0.4)'
                  }}
                  disabled={!canFinalizePicking()}
                >
                  {isFinalizingPicking ? (
                    <>
                      <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 ml-2 animate-spin" />
                      מסיים ומקדם...
                    </>
                  ) : (
                    <>
                      <Box className="w-6 h-6 sm:w-7 sm:h-7 ml-2" />
                      סיים והעבר לשלב הבא
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
