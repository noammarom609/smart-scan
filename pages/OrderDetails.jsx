
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Order } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowRight, ExternalLink, Calendar, Building2, FileText, DollarSign, Package, User, Phone, Truck, MapPin, Edit2, Save, X, Clock, Plus, Settings, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import { createPageUrl } from "@/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Label } from "@/components/ui/label";
import ItemPickingList from "../components/picking/ItemPickingList";
import { useOrders } from '@/components/contexts/OrderContext';
import { syncOrderData } from "@/api/functions";

const statusColors = {
  "ממתין": "bg-yellow-100 text-yellow-800 border-yellow-200",
  "בליקוט": "bg-orange-100 text-orange-800 border-orange-200",
  "ממתין למשלוח": "bg-indigo-100 text-indigo-800 border-indigo-200",
  "ממתין לאיסוף": "bg-purple-100 text-purple-800 border-purple-200",
  "נשלח": "bg-blue-100 text-blue-800 border-blue-200",
  "התקבל": "bg-green-100 text-green-800 border-green-200",
  "בוטל": "bg-red-100 text-red-800 border-red-200"
};

export default function OrderDetailsPage() {
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [localIsLoading, setLocalIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orderId, setOrderId] = useState(null);

  const { 
    orders: allOrders, 
    isLoading: ordersLoading,
    updateOrder,
    deleteOrder,
    refreshOrders
  } = useOrders();
  
  const [isEditingShipping, setIsEditingShipping] = useState(false);
  const [isSavingShipping, setIsSavingShipping] = useState(false); // New state for saving status
  const [editingShippingData, setEditingShippingData] = useState({
    shipping_method_chosen: '',
    pickup_preferred_date: '',
    shipment_due_date: '',
    pickup_preferred_time: '',
    courier_company: ''
  });
  const [isEditingItems, setIsEditingItems] = useState(false);

  const [isEditingOrderDetails, setIsEditingOrderDetails] = useState(false);
  const [editingOrderDetailsData, setEditingOrderDetailsData] = useState({
    supplier: '',
    order_number: '',
    status: '',
    notes: '',
    payment_status: ''
  });

  const [isEditingCustomer, setIsEditingCustomer] = useState(false);
  const [editingCustomerData, setEditingCustomerData] = useState({
    customer_name: '',
    customer_phone: ''
  });

  const [isEditingShippingDetails, setIsEditingShippingDetails] = useState(false);
  const [editingShippingDetailsData, setEditingShippingDetailsData] = useState({
    shipping_name: '',
    shipping_phone: '',
    shipping_address: '',
    shipping_city: '',
    shipping_zip: '',
    shipping_method: '',
    shipping_cost: 0,
    shipping_notes: ''
  });

  const [isEditingPayment, setIsEditingPayment] = useState(false);
  const [editingPaymentData, setEditingPaymentData] = useState({
    payment_status: ''
  });

  const [localItems, setLocalItems] = useState([]);
  const [showItemEditor, setShowItemEditor] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    if (id) {
      setOrderId(id);
    } else {
      setError("מזהה הזמנה לא נמצא");
      setLocalIsLoading(false);
    }
  }, []);


  const loadOrder = useCallback(async () => {
    if (!orderId) {
      setLocalIsLoading(false);
      return;
    }
    
    setLocalIsLoading(true);
    try {
      let foundOrder = allOrders.find(o => o.id === orderId);
      
      if (!foundOrder) {
        await refreshOrders();
        foundOrder = allOrders.find(o => o.id === orderId);
      }
      
      if (foundOrder) {
        setOrder(foundOrder);
        setEditingShippingData({
          shipping_method_chosen: foundOrder.shipping_method_chosen || '',
          pickup_preferred_date: foundOrder.pickup_preferred_date || '',
          shipment_due_date: foundOrder.shipment_due_date || '',
          pickup_preferred_time: foundOrder.pickup_preferred_time || '',
          courier_company: foundOrder.courier_company || ''
        });
        setEditingOrderDetailsData({
          supplier: foundOrder.supplier || '',
          order_number: foundOrder.order_number || '',
          status: foundOrder.status || '',
          notes: foundOrder.notes || '',
          payment_status: foundOrder.payment_status || ''
        });
        setEditingCustomerData({
          customer_name: foundOrder.customer_name || '',
          customer_phone: foundOrder.customer_phone || ''
        });
        setEditingShippingDetailsData({
          shipping_name: foundOrder.shipping_name || '',
          shipping_phone: foundOrder.shipping_phone || '',
          shipping_address: foundOrder.shipping_address || '',
          shipping_city: foundOrder.shipping_city || '',
          shipping_zip: foundOrder.shipping_zip || '',
          shipping_method: foundOrder.shipping_method || '',
          shipping_cost: foundOrder.shipping_cost || 0,
          shipping_notes: foundOrder.shipping_notes || ''
        });
        setEditingPaymentData({
          payment_status: foundOrder.payment_status || 'לא_שולם'
        });
        if (foundOrder.items) {
          setLocalItems(foundOrder.items.map(item => ({
            ...item,
            id: item.id || Math.random().toString(36).substr(2, 9)
          })));
        } else {
            setLocalItems([]);
        }

      } else {
        toast.error("הזמנה לא נמצאה. ייתכן שנמחקה או לא קיימת.", { duration: 4000 });
        navigate(createPageUrl("Home"));
      }
    } catch (err) {
      setError("שגיאה בטעינת ההזמנה");
      console.error("Error loading order:", err);
      toast.error("שגיאה בטעינת פרטי ההזמנה. אנא נסה שוב.", { duration: 4000 });
    } finally {
      setLocalIsLoading(false);
    }
  }, [orderId, allOrders, refreshOrders, navigate,
      setOrder, setEditingShippingData, setEditingOrderDetailsData, setEditingCustomerData,
      setEditingShippingDetailsData, setEditingPaymentData, setLocalItems, setLocalIsLoading, setError
  ]);

  useEffect(() => {
    if (orderId && !ordersLoading) {
      loadOrder();
    }
  }, [orderId, ordersLoading, loadOrder]);

  // *** פונקציית רענון מלא משופרת - ENHANCED ***
  const performFullRefreshAfterSave = useCallback(async (existingToastId = null) => {
    try {
      console.log('🔄 מתחיל רענון מלא מחוזק של כל המערכת...');
      
      // 1. רענון מיידי של הקונטקסט הגלובלי
      console.log('📡 שלב 1: רענון קונטקסט גלובלי...');
      await refreshOrders();
      
      // 2. המתנה להבטיח עדכון
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // 3. רענון נוסף אגרסיבי
      console.log('🔄 שלב 2: רענון נוסף להבטחה...');
      await refreshOrders();
      
      // 4. עדכון מקומי של ההזמנה הנוכחית
      console.log('🏠 שלב 3: עדכון מקומי...');
      await new Promise(resolve => setTimeout(resolve, 500));
      await loadOrder();
      
      // 5. פינג נוסף לוודא עדכון מלא
      console.log('📢 שלב 4: פינג סופי להבטחת עדכון...');
      await new Promise(resolve => setTimeout(resolve, 300));
      await refreshOrders();
      
      console.log('✅ רענון מלא מחוזק הושלם בהצלחה!');
      
      // 6. הודעה למשתמש על השלמת העדכון
      if (existingToastId) {
        toast.success("הנתונים עודכנו בכל הדפים! 🔄", {
          id: existingToastId,
          duration: 4000,
          description: "תוכל לעבור לדפים אחרים לראות את השינויים"
        });
      } else {
        toast.success("הנתונים עודכנו בכל הדפים! 🔄", { 
          duration: 4000,
          description: "תוכל לעבור לדפים אחרים לראות את השינויים"
        });
      }
      
    } catch (error) {
      console.error('⚠️ שגיאה ברענון מלא מחוזק:', error);
      if (existingToastId) {
        toast.error('שגיאה ברענון הנתונים. נסה לרענן את הדף ידנית.', { 
          id: existingToastId, 
          duration: 5000 
        });
      } else {
        toast.error('שגיאה ברענון הנתונים. נסה לרענן את הדף ידנית.', { duration: 5000 });
      }
    }
  }, [refreshOrders, loadOrder]);


  const handleStartEditShipping = () => {
    setIsEditingShipping(true);
  };

  const handleCancelEditShipping = () => {
    setIsEditingShipping(false);
    setEditingShippingData({
      shipping_method_chosen: order.shipping_method_chosen || '',
      pickup_preferred_date: order.pickup_preferred_date || '',
      shipment_due_date: order.shipment_due_date || '',
      pickup_preferred_time: order.pickup_preferred_time || '',
      courier_company: order.courier_company || ''
    });
  };

  const handleShippingMethodChange = (newMethod) => {
    const currentMethod = editingShippingData.shipping_method_chosen;
    let updatedData = { ...editingShippingData, shipping_method_chosen: newMethod };

    if (currentMethod === "משלוח" && newMethod === "איסוף_עצמי") {
      updatedData.pickup_preferred_date = updatedData.shipment_due_date || '';
      updatedData.shipment_due_date = '';
      updatedData.courier_company = '';
    } else if (currentMethod === "איסוף_עצמי" && newMethod === "משלוח") {
      updatedData.shipment_due_date = updatedData.pickup_preferred_date || '';
      updatedData.pickup_preferred_date = '';
      updatedData.pickup_preferred_time = '';
    } else if (newMethod !== "איסוף_עצמי" && newMethod !== "משלוח") {
      updatedData.pickup_preferred_date = '';
      updatedData.shipment_due_date = '';
      updatedData.pickup_preferred_time = '';
      updatedData.courier_company = '';
    }

    setEditingShippingData(updatedData);
  };

  const handleSaveShippingChanges = async (changes) => {
    setIsSavingShipping(true);
    const toastId = toast.loading("שומר שינויים בפרטי המשלוח...");
    try {
      console.log('💾 Saving shipping changes (from form data):', changes);
      
      let updateData = {};
      let changedFieldsForSync = {};

      // Logic to determine actual changes and updateData for the order
      const currentStatus = order.status;
      if (changes.shipping_method_chosen === "איסוף_עצמי" && currentStatus === "ממתין למשלוח") {
        updateData.status = "ממתין לאיסוף";
      } else if (changes.shipping_method_chosen === "משלוח" && currentStatus === "ממתין לאיסוף") {
        updateData.status = "ממתין למשלוח";
      }

      if (changes.shipping_method_chosen !== order.shipping_method_chosen) {
        updateData.shipping_method_chosen = changes.shipping_method_chosen;
        changedFieldsForSync.shipping_method_chosen = changes.shipping_method_chosen;
      }
      if (changes.pickup_preferred_date !== order.pickup_preferred_date) {
        updateData.pickup_preferred_date = changes.pickup_preferred_date;
        changedFieldsForSync.pickup_preferred_date = changes.pickup_preferred_date;
      }
      if (changes.shipment_due_date !== order.shipment_due_date) {
        updateData.shipment_due_date = changes.shipment_due_date;
        changedFieldsForSync.shipment_due_date = changes.shipment_due_date;
      }
      if (changes.pickup_preferred_time !== order.pickup_preferred_time) {
        updateData.pickup_preferred_time = changes.pickup_preferred_time;
        changedFieldsForSync.pickup_preferred_time = changes.pickup_preferred_time;
      }
      if (changes.courier_company !== order.courier_company) {
        updateData.courier_company = changes.courier_company;
        changedFieldsForSync.courier_company = changes.courier_company;
      }

      if (Object.keys(updateData).length === 0) { // No actual changes to save to the main order
        toast.info("לא בוצעו שינויים בפרטי המשלוח", { id: toastId, duration: 3000 });
        setIsEditingShipping(false);
        return;
      }

      console.log('💾 Saving actual shipping updates to main order:', updateData);
      await updateOrder(order.id, updateData);
      
      // *** Check if date/time related fields were changed and synchronize to baking orders ***
      const hasDateChangesForSync = Object.keys(changedFieldsForSync).some(key => 
          ['pickup_preferred_date', 'pickup_preferred_time', 'shipment_due_date'].includes(key)
      );
      
      if (hasDateChangesForSync) {
        try {
          console.log('📅 Date changes detected, syncing to related baking orders...');
          
          const relatedBakingOrder = allOrders.find(orderItem => 
            orderItem.order_type === 'הזמנה_לאופות' && 
            orderItem.original_order_id === order.id
          );

          if (relatedBakingOrder) {
            const syncDateUpdateData = {};
            if (changedFieldsForSync.shipment_due_date !== undefined) syncDateUpdateData.shipment_due_date = changedFieldsForSync.shipment_due_date;
            if (changedFieldsForSync.pickup_preferred_date !== undefined) syncDateUpdateData.pickup_preferred_date = changedFieldsForSync.pickup_preferred_date;
            if (changedFieldsForSync.pickup_preferred_time !== undefined) syncDateUpdateData.pickup_preferred_time = changedFieldsForSync.pickup_preferred_time;

            if (Object.keys(syncDateUpdateData).length > 0) { // Only sync if there are actual date changes relevant for baking orders
              const syncResult = await syncOrderData({
                orderId: order.id,
                bakingOrderId: relatedBakingOrder.id,
                updateType: 'sync_dates',
                updateData: syncDateUpdateData
              });

              if (syncResult?.data?.success) {
                console.log('✅ תאריכים סונכרנו לאופות:', syncResult.data.message);
                toast.success(`פרטי המשלוח נשמרו ותאריכים סונכרנו לאופות!`, { id: toastId, duration: 4000 });
              } else {
                console.warn('⚠️ סינכרון תאריכים לאופות נכשל או לא היה נדרש:', syncResult?.data?.message || 'שגיאה לא ידועה');
                toast.success('פרטי המשלוח נשמרו בהצלחה! (סינכרון חלקי)', { id: toastId, duration: 4000 });
              }
            } else {
                // If there were other shipping changes but no relevant date changes for sync, just show success
                toast.success("פרטי המשלוח נשמרו בהצלחה!", { id: toastId, duration: 3000 });
            }
          } else {
            console.log('ℹ️ אין הזמנת אפייה קשורה לסינכרון תאריכים');
            toast.success('פרטי המשלוח נשמרו בהצלחה!', { id: toastId, duration: 3000 });
          }
        } catch (syncError) {
          console.error('⚠️ שגיאה בסינכרון תאריכים לאופות:', syncError);
          toast.error('שגיאה בסינכרון תאריכים לאופות, אך פרטי המשלוח נשמרו בהצלחה!', { id: toastId, duration: 5000 });
        }
      } else {
        toast.success("פרטי המשלוח נשמרו בהצלחה!", { id: toastId, duration: 3000 });
      }

      // *** Use the robust full refresh mechanism ***
      toast.loading("מרענן את כל הדפים במערכת...", { id: toastId });
      await performFullRefreshAfterSave(toastId);
      
      setIsEditingShipping(false);
      
    } catch (error) {
      console.error("Error updating shipping details:", error);
      toast.error("שגיאה בעדכון פרטי המשלוח. אנא נסה שוב.", { id: toastId, duration: 4000 });
    } finally {
      setIsSavingShipping(false); // Ensure loading state is turned off
    }
  };

  const handleStartEditOrderDetails = () => {
    setEditingOrderDetailsData({
      supplier: order.supplier || '',
      order_number: order.order_number || '',
      status: order.status || '',
      notes: order.notes || '',
      payment_status: order.payment_status || ''
    });
    setIsEditingOrderDetails(true);
  };

  const handleCancelEditOrderDetails = () => {
    setIsEditingOrderDetails(false);
    setEditingOrderDetailsData({
      supplier: order.supplier || '',
      order_number: order.order_number || '',
      status: order.status || '',
      notes: order.notes || '',
      payment_status: order.payment_status || ''
    });
  };

  const handleSaveOrderDetailsChanges = async () => {
    const toastId = toast.loading("שומר שינויים בפרטי ההזמנה...");
    try {
      console.log('💾 שומר פרטי הזמנה:', editingOrderDetailsData);
      await updateOrder(order.id, editingOrderDetailsData);

      // *** שמירת הערות כלליות עם סינכרון - ENHANCED ***
      if (editingOrderDetailsData.notes !== order.notes) {
        try {
          console.log('🔄 מפעיל סינכרון הערות כלליות...');
          const syncResult = await syncOrderData({
            orderId: order.id,
            updateType: 'sync_notes',
            updateData: {
              notes: editingOrderDetailsData.notes
            }
          });

          if (syncResult?.data?.success) {
            console.log('✅ הערות כלליות סונכרנו:', syncResult.data.message);
            toast.success("פרטי ההזמנה וההערות סונכרנו בהצלחה!", { id: toastId, duration: 4000 });
          } else {
            console.warn('⚠️ סינכרון הערות כלליות נכשל או לא היה נדרש:', syncResult?.data?.message || 'שגיאה לא ידועה');
            toast.success('פרטי ההזמנה עודכנו בהצלחה! (סינכרון הערות חלקי)', { id: toastId, duration: 4000 });
          }
        } catch (syncError) {
          console.error('⚠️ שגיאה בסינכרון הערות כלליות:', syncError);
          toast.error('שגיאה בסינכרון הערות כלליות, אך פרטי ההזמנה נשמרו בהצלחה!', { id: toastId, duration: 5000 });
        }
      } else {
        toast.success("פרטי ההזמנה עודכנו בהצלחה!", { id: toastId, duration: 3000 });
      }

      // *** רענון מלא מחוזק אחרי שמירה - ENHANCED ***
      toast.loading("מרענן את כל הדפים במערכת...", { id: toastId });
      await performFullRefreshAfterSave(toastId);
      
      setIsEditingOrderDetails(false);
    } catch (error) {
      console.error("Error updating order details:", error);
      toast.error("שגיאה בעדכון פרטי ההזמנה. אנא נסה שוב.", { id: toastId, duration: 4000 });
    }
  };

  const handleStartEditCustomer = () => {
    setEditingCustomerData({
      customer_name: order.customer_name || '',
      customer_phone: order.customer_phone || ''
    });
    setIsEditingCustomer(true);
  };

  const handleCancelEditCustomer = () => {
    setIsEditingCustomer(false);
    setEditingCustomerData({
      customer_name: order.customer_name || '',
      customer_phone: order.customer_phone || ''
    });
  };

  const handleSaveCustomerChanges = async () => {
    const toastId = toast.loading("שומר שינויים בפרטי המזמין...");
    try {
      console.log('💾 שומר פרטי מזמין:', editingCustomerData);
      await updateOrder(order.id, editingCustomerData);
      
      // *** רענון מלא מחוזק אחרי שמירה - ENHANCED ***
      toast.loading("מרענן את כל הדפים במערכת...", { id: toastId });
      await performFullRefreshAfterSave(toastId);
      
      setIsEditingCustomer(false);
    } catch (error) {
      console.error("Error updating customer details:", error);
      toast.error("שגיאה בעדכון פרטי המזמין. אנא נסה שוב.", { id: toastId, duration: 4000 });
    }
  };

  const handleStartEditShippingDetails = () => {
    setEditingShippingDetailsData({
      shipping_name: order.shipping_name || '',
      shipping_phone: order.shipping_phone || '',
      shipping_address: order.shipping_address || '',
      shipping_city: order.shipping_city || '',
      shipping_zip: order.shipping_zip || '',
      shipping_method: order.shipping_method || '',
      shipping_cost: order.shipping_cost || 0,
      shipping_notes: order.shipping_notes || ''
    });
    setIsEditingShippingDetails(true);
  };

  const handleCancelEditShippingDetails = () => {
    setIsEditingShippingDetails(false);
    setEditingShippingDetailsData({
      shipping_name: order.shipping_name || '',
      shipping_phone: order.shipping_phone || '',
      shipping_address: order.shipping_address || '',
      shipping_city: order.shipping_city || '',
      shipping_zip: order.shipping_zip || '',
      shipping_method: order.shipping_method || '',
      shipping_cost: order.shipping_cost || 0,
      shipping_notes: order.shipping_notes || ''
    });
  };

  const handleSaveShippingDetailsChanges = async () => {
    const toastId = toast.loading("שומר שינויים בפרטי המשלוח...");
    try {
      console.log('💾 שומר פרטי משלוח מפורטים:', editingShippingDetailsData);
      await updateOrder(order.id, editingShippingDetailsData);
      
      // *** רענון מלא מחוזק אחרי שמירה - ENHANCED ***
      toast.loading("מרענן את כל הדפים במערכת...", { id: toastId });
      await performFullRefreshAfterSave(toastId);
      
      setIsEditingShippingDetails(false);
    } catch (error) {
      console.error("Error updating shipping details:", error);
      toast.error("שגיאה בעדכון פרטי המשלוח. אנא נסה שוב.", { id: toastId, duration: 4000 });
    }
  };

  const handleStartEditPayment = () => {
    setEditingPaymentData({
      payment_status: order.payment_status || 'לא_שולם'
    });
    setIsEditingPayment(true);
  };

  const handleCancelEditPayment = () => {
    setIsEditingPayment(false);
    setEditingPaymentData({
      payment_status: order.payment_status || 'לא_שולם'
    });
  };

  const handleSavePaymentChanges = async () => {
    const toastId = toast.loading("שומר שינויים בפרטי התשלום...");
    try {
      console.log('💾 שומר פרטי תשלום:', editingPaymentData);
      await updateOrder(order.id, editingPaymentData);
      
      // *** רענון מלא מחוזק אחרי שמירה - ENHANCED ***
      toast.loading("מרענן את כל הדפים במערכת...", { id: toastId });
      await performFullRefreshAfterSave(toastId);
      
      setIsEditingPayment(false);
    } catch (error) {
      console.error("Error updating payment details:", error);
      toast.error("שגיאה בעדכון פרטי התשלום. אנא נסה שוב.", { id: toastId, duration: 4000 });
    }
  };

  const updateItemDetails = (itemIndex, field, value) => {
    setLocalItems(prev => {
      const updated = [...prev];
      updated[itemIndex] = {
        ...updated[itemIndex],
        [field]: field === 'quantity' || field === 'total' ? parseFloat(value) || 0 : value
      };
      return updated;
    });
  };

  const addNewItem = () => {
    const newItem = {
      id: Math.random().toString(36).substr(2, 9),
      product_name: '',
      quantity: 1,
      total: 0,
      picking_status: 'לא_התחיל',
      picked_quantity: 0,
      location: '',
      location_breakdown: []
    };
    setLocalItems(prev => [...prev, newItem]);
  };

  const removeItem = (itemIndex) => {
    setLocalItems(prev => prev.filter((_, i) => i !== itemIndex));
  };

  // *** פונקציה לחישוב שקיות לפי מיקומים - FIXED ***
  const calculateLocationBagSummary = (items) => {
    if (!items || items.length === 0) return [];
    
    console.log('🧮 מחשב שקיות עבור פריטים:', items.map(i => ({ name: i.product_name, qty: i.quantity, location: i.location })));
    
    const locationCounts = {};
    
    items.forEach(item => {
      // אם יש פילוח מיקומים מפורט
      if (item.location_breakdown && item.location_breakdown.length > 0) {
        item.location_breakdown.forEach(breakdown => {
          if (breakdown.location && breakdown.quantity > 0) {
            if (!locationCounts[breakdown.location]) {
              locationCounts[breakdown.location] = 0;
            }
            locationCounts[breakdown.location] += breakdown.quantity;
          }
        });
      } 
      // אחרת השתמש במיקום יחיד וכמות כללית
      else if (item.location && item.quantity > 0) {
        if (!locationCounts[item.location]) {
          locationCounts[item.location] = 0;
        }
        locationCounts[item.location] += item.quantity;
      }
    });

    console.log('📍 כמויות לפי מיקום:', locationCounts);

    // המרה למבנה הנדרש
    const bagSummary = Object.entries(locationCounts).map(([location, totalQuantity]) => {
      const isCartonLocation = location === 'קרטון';
      const itemsPerBag = isCartonLocation ? 1 : 10; // קרטון = 1 יחידה לקרטון, אחרת 10 לשקית
      const bagsCount = Math.max(1, Math.ceil(totalQuantity / itemsPerBag));
      
      return {
        location,
        bags_count: bagsCount,
        unit_type: isCartonLocation ? 'קרטון' : 'שקיות'
      };
    });

    console.log('📦 סיכום שקיות מחושב:', bagSummary);
    return bagSummary;
  };

  const saveItemsChanges = async () => {
    const toastId = toast.loading("שומר שינויים ומעדכן את כל המערכת...");
    try {
      console.log('🎯 מתחיל סינכרון פריטים - תיקון כמויות מלא');
      
      // שלב 1: חישוב נתונים מעודכנים עם תיקון כמויות
      const correctedItems = localItems.map(item => {
        // *** תיקון המפתח - סינכרון picked_quantity עם quantity החדשה ***
        const correctedItem = {
          ...item,
          quantity: item.quantity, // הכמות החדשה שהמשתמש הזין
          picked_quantity: item.quantity, // *** עדכון כמות נלקטה להיות זהה לכמות הכללית ***
        };

        // *** תיקון location_breakdown - עדכון כמויות גם שם ***
        if (correctedItem.location_breakdown && correctedItem.location_breakdown.length > 0) {
          // אם יש פירוט מיקומים, עדכן את הכמויות פרופורציונלית
          const totalBreakdownQuantity = correctedItem.location_breakdown.reduce((sum, loc) => sum + (loc.quantity || 0), 0);
          
          if (totalBreakdownQuantity !== correctedItem.quantity) {
            console.log(`🔧 מתקן location_breakdown עבור ${item.product_name}: ${totalBreakdownQuantity} → ${correctedItem.quantity}`);
            
            if (correctedItem.location_breakdown.length === 1) {
              // אם יש מיקום אחד, עדכן את הכמות שלו
              correctedItem.location_breakdown[0].quantity = correctedItem.quantity;
            } else {
              // אם יש כמה מיקומים, חלק פרופורציונלית
              const ratio = correctedItem.quantity / totalBreakdownQuantity;
              correctedItem.location_breakdown = correctedItem.location_breakdown.map(loc => ({
                ...loc,
                quantity: Math.round(loc.quantity * ratio)
              }));
            }
          }
        } else if (correctedItem.location && correctedItem.quantity > 0) {
          // אם אין location_breakdown אבל יש מיקום, צור אחד
          correctedItem.location_breakdown = [{
            location: correctedItem.location,
            quantity: correctedItem.quantity
          }];
        }

        console.log(`📦 תוקן פריט ${item.product_name}:`, {
          quantity: correctedItem.quantity,
          picked_quantity: correctedItem.picked_quantity,
          location_breakdown: correctedItem.location_breakdown
        });

        return correctedItem;
      });

      const newTotalAmount = correctedItems.reduce((sum, item) => sum + (item.total || 0), 0);
      const updatedLocationBagSummary = calculateLocationBagSummary(correctedItems);
      
      console.log('📊 נתונים מתוקנים:', {
        orderId: order.id,
        itemsCount: correctedItems.length,
        totalAmount: newTotalAmount,
        correctedQuantities: correctedItems.map(item => ({ 
          name: item.product_name, 
          quantity: item.quantity, 
          picked_quantity: item.picked_quantity 
        }))
      });

      // שלב 2: עדכון ההזמנה הראשית עם הנתונים המתוקנים
      const mainUpdatePayload = { 
        items: correctedItems,
        total_amount: newTotalAmount,
        location_bag_summary: updatedLocationBagSummary
      };

      await updateOrder(order.id, mainUpdatePayload);
      console.log('✅ הזמנה ראשית עודכנה עם נתונים מתוקנים');
      
      // *** הוספת השהיה קצרה אחרי עדכון ראשי - NEW ***
      toast.loading("ממתין רגע קצר למניעת עומס...", { id: toastId });
      await new Promise(resolve => setTimeout(resolve, 2000)); // 2 שניות
      
      // שלב 3: עדכון הזמנות אפייה קשורות עם הנתונים המתוקנים
      const relatedBakingOrders = allOrders.filter(orderItem => 
        orderItem.order_type === 'הזמנה_לאופות' && 
        orderItem.original_order_id === order.id
      );

      if (relatedBakingOrders.length > 0) {
        console.log(`🍞 נמצאו ${relatedBakingOrders.length} הזמנות אפייה לעדכון עם הנתונים המתוקנים`);
        toast.loading(`מעדכן הזמנות אפייה (${relatedBakingOrders.length})...`, { id: toastId });
        
        for (let i = 0; i < relatedBakingOrders.length; i++) {
          const bakingOrder = relatedBakingOrders[i];
          console.log(`🔄 מעדכן הזמנת אפייה ${i + 1}/${relatedBakingOrders.length}: ${bakingOrder.id}`);
          
          try {
            // *** עדכון פריטים בהזמנת האפייה עם נתונים מתוקנים ***
            const syncedBakingItems = bakingOrder.items?.map(bakingItem => {
              const correctedMainItem = correctedItems.find(mainItem => 
                mainItem.product_name === bakingItem.product_name
              );
              
              if (correctedMainItem) {
                console.log(`📦 מסנכרן פריט ${bakingItem.product_name}:`, {
                  quantity: `${bakingItem.quantity} → ${correctedMainItem.quantity}`,
                  picked_quantity: `${bakingItem.picked_quantity} → ${correctedMainItem.picked_quantity}`
                });
                
                return {
                  ...bakingItem,
                  // *** סינכרון מלא של כמויות מההזמנה הראשית המתוקנת ***
                  quantity: correctedMainItem.quantity,
                  picked_quantity: correctedMainItem.picked_quantity,
                  total: correctedMainItem.total,
                  location: correctedMainItem.location || bakingItem.location,
                  location_breakdown: correctedMainItem.location_breakdown || bakingItem.location_breakdown,
                  // שמירה על נתוני אפייה קיימים
                  baking_status: bakingItem.baking_status || 'ממתין',
                  notes_for_baker: bakingItem.notes_for_baker || ''
                };
              }
              return bakingItem;
            }) || [];

            const bakingTotalAmount = syncedBakingItems.reduce((sum, item) => sum + (item.total || 0), 0);
            const bakingBagSummary = calculateLocationBagSummary(syncedBakingItems);

            // עדכון עם retry אוטומטי בשגיאת Rate Limit
            let attempts = 0;
            const maxAttempts = 3;
            
            while (attempts < maxAttempts) {
              try {
                await updateOrder(bakingOrder.id, {
                  items: syncedBakingItems,
                  total_amount: bakingTotalAmount,
                  location_bag_summary: bakingBagSummary
                });
                
                console.log(`✅ הזמנת אפייה ${bakingOrder.id} עודכנה בהצלחה`);
                break; // הצליח - צא מהלופ
                
              } catch (updateError) {
                attempts++;
                console.error(`❌ שגיאה בעדכון הזמנת אפייה (ניסיון ${attempts}/${maxAttempts}):`, updateError);
                
                if (updateError.response?.status === 429) {
                  // Rate limit - חכה זמן מתקדם
                  const waitTime = attempts * 3000; // 3s, 6s, 9s
                  console.log(`⏳ Rate limit - ממתין ${waitTime}ms`);
                  toast.loading(`Rate limit - ממתין ${waitTime/1000} שניות...`, { id: toastId });
                  await new Promise(resolve => setTimeout(resolve, waitTime));
                  
                  if (attempts >= maxAttempts) {
                    console.error(`❌ נכשל לעדכן הזמנת אפייה ${bakingOrder.id} אחרי ${maxAttempts} ניסיונות`);
                    toast.warning(`לא ניתן לעדכן הזמנת אפייה ${bakingOrder.id} - נסה שוב מאוחר יותר`);
                  }
                } else {
                  throw updateError; // שגיאה אחרת
                }
              }
            }
            
            // השהיה בין עדכוני הזמנות אפייה
            if (i < relatedBakingOrders.length - 1) {
              await new Promise(resolve => setTimeout(resolve, 1500));
            }
            
          } catch (bakingError) {
            console.error(`❌ שגיאה כללית בעדכון הזמנת אפייה ${bakingOrder.id}:`, bakingError);
          }
        }
      }

      // שלב 4: רענון הקונטקסט הגלובלי
      console.log('🔄 מרענן קונטקסט גלובלי...');
      toast.loading("מרענן נתונים בכל הדפים...", { id: toastId });
      await refreshOrders();

      // שלב 5: רענון מקומי של הדף הנוכחי
      console.log('🏠 מרענן נתונים מקומיים...');
      await loadOrder();

      console.log('✅ כל הסינכרונים הושלמו בהצלחה - כמויות תוקנו!');
      
      toast.success("🎯 כמויות תוקנו וסונכרנו בהצלחה ברחבי המערכת!", { 
        id: toastId, 
        duration: 5000,
        description: "quantity ו-picked_quantity עודכנו יחד"
      });
      
      setShowItemEditor(false);
      
    } catch (error) {
      console.error("❌ שגיאה בעדכון פריטים:", error);
      toast.error("שגיאה בעדכון הפריטים. נסה שוב או רענן את הדף.", { 
        id: toastId, 
        duration: 5000 
      });
    }
  };

  const cancelItemsEdit = () => {
    if (order && order.items) {
      setLocalItems(order.items.map(item => ({
        ...item,
        id: item.id || Math.random().toString(36).substr(2, 9)
      })));
    } else {
      setLocalItems([]);
    }
    setShowItemEditor(false);
  };

  const handleDeleteOrder = async () => {
    const toastId = toast.loading("מוחק הזמנה...");
    try {
      await deleteOrder(order.id);
      toast.success("ההזמנה נמחקה בהצלחה!", { id: toastId, duration: 3000 });
      
      navigate(createPageUrl("Home"));
    } catch (error) {
      console.error("Error deleting order:", error);
      toast.error("שגיאה במחיקת ההזמנה. אנא נסה שוב.", { id: toastId, duration: 4000 });
    }
  };

  const safeFormatDate = (dateString) => {
    if (!dateString) return '---';
    const date = new Date(dateString);
    if (date instanceof Date && !isNaN(date)) {
      return format(date, "dd/MM/yyyy", { locale: he });
    }
    return '---';
  };

  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (date instanceof Date && !isNaN(date)) {
      return format(date, "yyyy-MM-dd");
    }
    return '';
  };

  const getCurrentShippingDate = () => {
    if (order.shipping_method_chosen === "איסוף_עצמי") {
      return order.pickup_preferred_date;
    } else if (order.shipping_method_chosen === "משלוח") {
      return order.shipment_due_date;
    }
    return null;
  };

  const getCurrentEditingDate = () => {
    if (editingShippingData.shipping_method_chosen === "איסוף_עצמי") {
      return editingShippingData.pickup_preferred_date;
    } else if (editingShippingData.shipping_method_chosen === "משלוח") {
      return editingShippingData.shipment_due_date;
    }
    return '';
  };

  const handleDateChange = (newDate) => {
    if (editingShippingData.shipping_method_chosen === "איסוף_עצמי") {
      setEditingShippingData(prev => ({ ...prev, pickup_preferred_date: newDate }));
    } else if (editingShippingData.shipping_method_chosen === "משלוח") {
      setEditingShippingData(prev => ({ ...prev, shipment_due_date: newDate }));
    }
  };

  const handleUpdateOrder = async () => {
    await performFullRefreshAfterSave();
    setIsEditingItems(false);
  };

  const getDisplayAddress = () => {
    if (order.shipping_address) {
      return order.shipping_address;
    }
    return order.billing_address || 'לא צוין';
  };

  const getDisplayCity = () => {
    if (order.shipping_city) {
      return order.shipping_city;
    }
    return order.billing_city || '';
  };

  const getDisplayZip = () => {
    if (order.shipping_zip) {
      return order.shipping_zip;
    }
    return order.billing_zip || '';
  };

  if (localIsLoading || ordersLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-48 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="outline"
              onClick={() => navigate(createPageUrl("Home"))}
              className="bg-white hover:bg-gray-50 border-gray-200 elegant-shadow"
            >
              <ArrowRight className="w-4 h-4" />
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">שגיאה</h1>
          </div>
          <Card className="border-none elegant-shadow-lg bg-white/90 backdrop-blur-sm">
            <CardContent className="p-12 text-center">
              <p className="text-red-600 text-lg">{error}</p>
              <Button 
                className="mt-4"
                onClick={() => navigate(createPageUrl("Home"))}
              >
                חזור לדף הבית
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const totalAmount = order.total_amount || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            onClick={() => navigate(createPageUrl("Home"))}
            className="bg-white hover:bg-gray-50 border-gray-200 elegant-shadow flex-shrink-0"
          >
            <ArrowRight className="w-4 h-4" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 truncate">פרטי הזמנה</h1>
            <p className="text-gray-600 text-base sm:text-lg mt-1 truncate">הצגה מלאה של פרטי ההזמנה</p>
          </div>
        </div>

        <div className="space-y-6">
          <Card className="border-none elegant-shadow-lg bg-white/90 backdrop-blur-sm">
            <CardHeader className="border-b border-gray-100 p-4 sm:p-6">
              <CardTitle className="flex items-center justify-between text-lg sm:text-xl">
                <div className="flex items-center gap-3">
                  <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                  פרטי ההזמנה
                </div>
                <div className="flex items-center gap-2">
                  {!isEditingOrderDetails && (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleStartEditOrderDetails}
                      className="text-blue-600 border-blue-200 hover:bg-blue-50"
                      title="ערוך פרטי הזמנה"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                  )}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        size="icon"
                        className="bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
                        title="מחק הזמנה"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>האם אתה בטוח?</AlertDialogTitle>
                        <AlertDialogDescription>
                          פעולה זו תמחק לצמיתות את הזמנה מספר "{order?.order_number}" ולא ניתנת לביטול.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>ביטול</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteOrder} className="bg-red-600 hover:bg-red-700">
                          מחק
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              {!isEditingOrderDetails ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <p className="text-xs sm:text-sm font-semibold text-gray-600">ספק</p>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center flex-shrink-0">
                        <span className="text-blue-700 font-bold text-sm">
                          {order.supplier ? order.supplier[0].toUpperCase() : '?'}
                        </span>
                      </div>
                      <span className="text-base sm:text-lg font-semibold text-gray-900">
                        {order.supplier || 'לא צוין'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-xs sm:text-sm font-semibold text-gray-600">מספר הזמנה</p>
                    <p className="text-base sm:text-lg font-mono bg-gray-50 px-3 py-2 rounded-lg break-all">
                      {order.order_number || '---'}
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-xs sm:text-sm font-semibold text-gray-600">תאריך הזמנה (חשבונית)</p>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className="text-base sm:text-lg">{safeFormatDate(order.date)}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-xs sm:text-sm font-semibold text-gray-600">סטטוס</p>
                    <Badge 
                      className={`${statusColors[order.status] || statusColors["ממתין"]} border font-medium px-3 py-1 sm:px-4 sm:py-2 text-sm sm:text-base`}
                    >
                      {order.status || 'ממתין'}
                    </Badge>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs sm:text-sm font-semibold text-gray-600">ספק</label>
                      <Input
                        value={editingOrderDetailsData.supplier}
                        onChange={(e) => setEditingOrderDetailsData(prev => ({...prev, supplier: e.target.value}))}
                        className="bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-500"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-xs sm:text-sm font-semibold text-gray-600">מספר הזמנה</label>
                      <Input
                        value={editingOrderDetailsData.order_number}
                        onChange={(e) => setEditingOrderDetailsData(prev => ({...prev, order_number: e.target.value}))}
                        className="bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-500"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-xs sm:text-sm font-semibold text-gray-600">סטטוס</label>
                      <Select
                        value={editingOrderDetailsData.status}
                        onValueChange={(value) => setEditingOrderDetailsData(prev => ({...prev, status: value}))}
                      >
                        <SelectTrigger className="bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-500">
                          <SelectValue placeholder="בחר סטטוס" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ממתין">ממתין</SelectItem>
                          <SelectItem value="בליקוט">בליקוט</SelectItem>
                          <SelectItem value="ממתין למשלוח">ממתין למשלוח</SelectItem>
                          <SelectItem value="ממתין לאיסוף">ממתין לאיסוף</SelectItem>
                          <SelectItem value="נשלח">נשלח</SelectItem>
                          <SelectItem value="התקבל">התקבל</SelectItem>
                          <SelectItem value="בוטל">בוטל</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-xs sm:text-sm font-semibold text-gray-600">סטטוס תשלום</label>
                      <Select
                        value={editingOrderDetailsData.payment_status}
                        onValueChange={(value) => setEditingOrderDetailsData(prev => ({...prev, payment_status: value}))}
                      >
                        <SelectTrigger className="bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-500">
                          <SelectValue placeholder="בחר סטטוס תשלום" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="שולם">שולם</SelectItem>
                          <SelectItem value="לא_שולם">לא שולם</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs sm:text-sm font-semibold text-gray-600">הערות</label>
                    <Textarea
                      value={editingOrderDetailsData.notes}
                      onChange={(e) => setEditingOrderDetailsData(prev => ({...prev, notes: e.target.value}))}
                      className="bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-500"
                      rows={3}
                    />
                  </div>
                  
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={handleCancelEditOrderDetails}
                      className="text-gray-700 border-gray-300 hover:bg-gray-50"
                    >
                      <X className="w-4 h-4 ml-2" />
                      ביטול
                    </Button>
                    <Button
                      onClick={handleSaveOrderDetailsChanges}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Save className="w-4 h-4 ml-2" />
                      שמור שינויים
                    </Button>
                  </div>
                </div>
              )}
              
              {!isEditingOrderDetails && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-6">
                    <div className="space-y-2">
                      <p className="text-xs sm:text-sm font-semibold text-gray-600">סכום כולל</p>
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-green-600" />
                        <span className="text-xl sm:text-2xl font-bold text-green-600">
                          {order.currency || '₪'}{totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-xs sm:text-sm font-semibold text-gray-600">תאריך יצירה</p>
                      <span className="text-base sm:text-lg text-gray-700">
                        {safeFormatDate(order.created_date)}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs sm:text-sm font-semibold text-gray-600">תאריך קבלה במייל</p>
                      <span className="text-base sm:text-lg text-gray-700">
                        {safeFormatDate(order.email_received_date || order.created_date)}
                      </span>
                    </div>

                    {order.handled_by && (
                      <div className="space-y-2">
                        <p className="text-xs sm:text-sm font-semibold text-gray-600">טופל על ידי</p>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center flex-shrink-0">
                            <span className="text-purple-700 font-bold text-sm">
                              {order.handled_by[0].toUpperCase()}
                            </span>
                          </div>
                          <span className="text-base sm:text-lg font-semibold text-gray-900">
                            {order.handled_by}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {order.notes && (
                    <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                      <p className="text-xs sm:text-sm font-semibold text-gray-600 mb-2">הערות</p>
                      <p className="text-gray-800 text-sm sm:text-base">{order.notes}</p>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          <Card className="border-none elegant-shadow-lg bg-white/90 backdrop-blur-sm">
            <CardHeader className="border-b border-gray-100 p-4 sm:p-6">
              <CardTitle className="flex items-center justify-between text-lg sm:text-xl">
                <div className="flex items-center gap-3">
                  <Truck className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
                  ניהול משלוח ותאריכים
                </div>
                {!isEditingShipping && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleStartEditShipping}
                    className="text-orange-600 border-orange-200 hover:bg-orange-50"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              {!isEditingShipping ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <p className="text-xs sm:text-sm font-semibold text-gray-600">שיטת משלוח</p>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Truck className="w-5 h-5 text-orange-700" />
                      </div>
                      <span className="text-base sm:text-lg font-semibold text-gray-900">
                        {order.shipping_method_chosen === "איסוף_עצמי" ? "איסוף עצמי" : 
                         order.shipping_method_chosen === "משלוח" ? "משלוח" : "לא צוין"}
                      </span>
                    </div>
                  </div>
                  
                  {order.shipping_method_chosen === "משלוח" && (
                    <div className="space-y-2">
                      <p className="text-xs sm:text-sm font-semibold text-gray-600">חברת שליחויות</p>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Truck className="w-5 h-5 text-blue-700" />
                        </div>
                        <span className="text-base sm:text-lg font-semibold text-gray-900">
                          {order.courier_company || "לא שויך"}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {(order.shipping_method_chosen === "איסוף_עצמי" || order.shipping_method_chosen === "משלוח") && (
                    <div className="space-y-2">
                      <p className="text-xs sm:text-sm font-semibold text-gray-600">
                        {order.shipping_method_chosen === "איסוף_עצמי" ? "תאריך איסוף מועדף" : "תאריך יעד למשלוח"}
                      </p>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span className="text-base sm:text-lg">
                          {safeFormatDate(getCurrentShippingDate())}
                        </span>
                      </div>
                    </div>
                  )}

                  {order.shipping_method_chosen === "איסוף_עצמי" && order.pickup_preferred_time && (
                     <div className="space-y-2">
                      <p className="text-xs sm:text-sm font-semibold text-gray-600">שעת איסוף מועדפת</p>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span className="text-base sm:text-lg">
                          {order.pickup_preferred_time}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs sm:text-sm font-semibold text-gray-600">שיטת משלוח</label>
                      <Select
                        value={editingShippingData.shipping_method_chosen}
                        onValueChange={handleShippingMethodChange}
                      >
                        <SelectTrigger className="bg-gray-50 border-gray-200 focus:bg-white focus:border-orange-500">
                          <SelectValue placeholder="בחר שיטת משלוח" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={null}>לא צוין</SelectItem>
                          <SelectItem value="איסוף_עצמי">איסוף עצמי</SelectItem>
                          <SelectItem value="משלוח">משלוח</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {editingShippingData.shipping_method_chosen === "משלוח" && (
                      <div className="space-y-2">
                        <label className="text-xs sm:text-sm font-semibold text-gray-600">חברת שליחויות</label>
                        <Select
                          value={editingShippingData.courier_company}
                          onValueChange={(value) => setEditingShippingData(prev => ({...prev, courier_company: value}))}
                        >
                          <SelectTrigger className="bg-gray-50 border-gray-200 focus:bg-white focus:border-orange-500">
                            <SelectValue placeholder="בחר חברת שליחויות" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={null}>לא שויך</SelectItem>
                            <SelectItem value="ציטה">ציטה</SelectItem>
                            <SelectItem value="דוד">דוד</SelectItem>
                            <SelectItem value="עצמאי">עצמאי</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {(editingShippingData.shipping_method_chosen === "איסוף_עצמי" || editingShippingData.shipping_method_chosen === "משלוח") && (
                      <div className="space-y-2">
                        <label className="text-xs sm:text-sm font-semibold text-gray-600">
                          {editingShippingData.shipping_method_chosen === "איסוף_עצמי" ? "תאריך איסוף" : "תאריך יעד למשלוח"}
                        </label>
                        <Input
                          type="date"
                          value={formatDateForInput(getCurrentEditingDate())}
                          onChange={(e) => handleDateChange(e.target.value)}
                          className="bg-gray-50 border-gray-200 focus:bg-white focus:border-orange-500"
                        />
                      </div>
                    )}

                    {editingShippingData.shipping_method_chosen === "איסוף_עצמי" && (
                      <div className="space-y-2">
                        <label className="text-xs sm:text-sm font-semibold text-gray-600">שעת איסוף</label>
                        <Input
                          type="time"
                          value={editingShippingData.pickup_preferred_time || ''}
                          onChange={(e) => setEditingShippingData(prev => ({...prev, pickup_preferred_time: e.target.value}))}
                          className="bg-gray-50 border-gray-200 focus:bg-white focus:border-orange-500"
                        />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={handleCancelEditShipping}
                      className="text-gray-700 border-gray-300 hover:bg-gray-50"
                      disabled={isSavingShipping}
                    >
                      <X className="w-4 h-4 ml-2" />
                      ביטול
                    </Button>
                    <Button
                      onClick={() => handleSaveShippingChanges(editingShippingData)}
                      className="bg-orange-600 hover:bg-orange-700 text-white"
                      disabled={isSavingShipping}
                    >
                      {isSavingShipping ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          שומר...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 ml-2" />
                          שמור שינויים
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {(order.customer_name || order.customer_phone) && (
            <Card className="border-none elegant-shadow-lg bg-white/90 backdrop-blur-sm">
              <CardHeader className="border-b border-gray-100 p-4 sm:p-6">
                <CardTitle className="flex items-center justify-between text-lg sm:text-xl">
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                    פרטי המזמין
                  </div>
                  {!isEditingCustomer && (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleStartEditCustomer}
                      className="text-green-600 border-green-200 hover:bg-green-50"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                {!isEditingCustomer ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    {order.customer_name && (
                      <div className="space-y-2">
                        <p className="text-xs sm:text-sm font-semibold text-gray-600">שם המזמין</p>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center flex-shrink-0">
                            <User className="w-5 h-5 text-green-700" />
                          </div>
                          <span className="text-base sm:text-lg font-semibold text-gray-900">
                            {order.customer_name}
                          </span>
                        </div>
                      </div>
                    )}
                    
                    {order.customer_phone && (
                      <div className="space-y-2">
                        <p className="text-xs sm:text-sm font-semibold text-gray-600">מספר טלפון</p>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center flex-shrink-0">
                            <Phone className="w-5 h-5 text-blue-700" />
                          </div>
                          <a 
                            href={`tel:${order.customer_phone}`}
                            className="text-base sm:text-lg font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            {order.customer_phone}
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs sm:text-sm font-semibold text-gray-600">שם המזמין</label>
                        <Input
                          value={editingCustomerData.customer_name}
                          onChange={(e) => setEditingCustomerData(prev => ({...prev, customer_name: e.target.value}))}
                          className="bg-gray-50 border-gray-200 focus:bg-white focus:border-green-500"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-xs sm:text-sm font-semibold text-gray-600">מספר טלפון</label>
                        <Input
                          type="tel"
                          value={editingCustomerData.customer_phone}
                          onChange={(e) => setEditingCustomerData(prev => ({...prev, customer_phone: e.target.value}))}
                          className="bg-gray-50 border-gray-200 focus:bg-white focus:border-green-500"
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={handleCancelEditCustomer}
                        className="text-gray-700 border-gray-300 hover:bg-gray-50"
                      >
                        <X className="w-4 h-4 ml-2" />
                        ביטול
                      </Button>
                      <Button
                        onClick={handleSaveCustomerChanges}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <Save className="w-4 h-4 ml-2" />
                        שמור שינויים
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {(order.billing_name || order.billing_address || order.billing_email || order.billing_phone) && (
            <Card className="border-none elegant-shadow-lg bg-white/90 backdrop-blur-sm">
              <CardHeader className="border-b border-gray-100 p-4 sm:p-6">
                <CardTitle className="flex items-center gap-3 text-lg sm:text-xl">
                  <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                 פרטי חיוב
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  {order.billing_name && (
                    <div className="space-y-2">
                      <p className="text-xs sm:text-sm font-semibold text-gray-600">שם לחיוב</p>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center flex-shrink-0">
                          <User className="w-5 h-5 text-purple-700" />
                        </div>
                        <span className="text-base sm:text-lg font-semibold text-gray-900">
                          {order.billing_name}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {order.billing_phone && (
                    <div className="space-y-2">
                      <p className="text-xs sm:text-sm font-semibold text-gray-600">טלפון לחיוב</p>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Phone className="w-5 h-5 text-blue-700" />
                        </div>
                        <a 
                          href={`tel:${order.billing_phone}`}
                          className="text-base sm:text-lg font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          {order.billing_phone}
                        </a>
                      </div>
                    </div>
                  )}

                  {order.billing_address && (
                    <div className="space-y-2">
                      <p className="text-xs sm:text-sm font-semibold text-gray-600">כתובת</p>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Building2 className="w-5 h-5 text-green-700" />
                        </div>
                        <span className="text-base sm:text-lg text-gray-900">
                          {order.billing_address}
                        </span>
                      </div>
                    </div>
                  )}

                  {order.billing_city && (
                    <div className="space-y-2">
                      <p className="text-xs sm:text-sm font-semibold text-gray-600">עיר</p>
                      <span className="text-base sm:text-lg text-gray-700">
                        {order.billing_city} {order.billing_zip && `(${order.billing_zip})`}
                      </span>
                    </div>
                  )}

                  {order.billing_email && (
                    <div className="space-y-2 col-span-full">
                      <p className="text-xs sm:text-sm font-semibold text-gray-600">דוא"ל לחיוב</p>
                      <a 
                        href={`mailto:${order.billing_email}`}
                        className="text-base sm:text-lg text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        {order.billing_email}
                      </a>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {(order.shipping_name || order.shipping_address || order.shipping_phone || order.shipping_method || order.shipping_cost || order.shipping_notes || order.shipping_city || order.shipping_zip || order.billing_address || order.billing_city || order.billing_zip) && (
            <Card className="border-none elegant-shadow-lg bg-white/90 backdrop-blur-sm">
              <CardHeader className="border-b border-gray-100 p-4 sm:p-6">
                <CardTitle className="flex items-center justify-between text-lg sm:text-xl">
                  <div className="flex items-center gap-3">
                    <Truck className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
                    פרטי משלוח
                  </div>
                  {!isEditingShippingDetails && (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleStartEditShippingDetails}
                      className="text-orange-600 border-orange-200 hover:bg-orange-50"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                {!isEditingShippingDetails ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    {order.shipping_name && (
                      <div className="space-y-2">
                        <p className="text-xs sm:text-sm font-semibold text-gray-600">שם המקבל</p>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl flex items-center justify-center flex-shrink-0">
                            <User className="w-5 h-5 text-orange-700" />
                          </div>
                          <span className="text-base sm:text-lg font-semibold text-gray-900">
                            {order.shipping_name}
                          </span>
                        </div>
                      </div>
                    )}
                    
                    {order.shipping_phone && (
                      <div className="space-y-2">
                        <p className="text-xs sm:text-sm font-semibold text-gray-600">טלפון למשלוח</p>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center flex-shrink-0">
                            <Phone className="w-5 h-5 text-blue-700" />
                          </div>
                          <a 
                            href={`tel:${order.shipping_phone}`}
                            className="text-base sm:text-lg font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            {order.shipping_phone}
                          </a>
                        </div>
                      </div>
                    )}

                    {(order.shipping_address || order.billing_address) && (
                      <div className="space-y-2">
                        <p className="text-xs sm:text-sm font-semibold text-gray-600">כתובת משלוח</p>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center flex-shrink-0">
                            <Building2 className="w-5 h-5 text-green-700" />
                          </div>
                          <span className="text-base sm:text-lg text-gray-900">
                            {getDisplayAddress()}
                          </span>
                        </div>
                      </div>
                    )}

                    {(order.shipping_city || order.billing_city) && (
                      <div className="space-y-2">
                        <p className="text-xs sm:text-sm font-semibold text-gray-600">עיר משלוח</p>
                        <span className="text-base sm:text-lg text-gray-700">
                          {getDisplayCity()} {getDisplayZip() && `(${getDisplayZip()})`}
                        </span>
                      </div>
                    )}

                    {order.shipping_method && (
                      <div className="space-y-2">
                        <p className="text-xs sm:text-sm font-semibold text-gray-600">אופן משלוח</p>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center flex-shrink-0">
                            <Truck className="w-5 h-5 text-purple-700" />
                          </div>
                          <span className="text-base sm:text-lg text-gray-900">
                            {order.shipping_method}
                          </span>
                        </div>
                      </div>
                    )}

                    {order.shipping_cost > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs sm:text-sm font-semibold text-gray-600">עלות משלוח</p>
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-5 h-5 text-orange-600" />
                          <span className="text-xl font-bold text-orange-600">
                            {order.currency || '₪'}{order.shipping_cost.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    )}

                    {order.shipping_notes && (
                      <div className="space-y-2 col-span-full">
                        <p className="text-xs sm:text-sm font-semibold text-gray-600">הערות משלוח</p>
                        <div className="p-4 bg-orange-50 rounded-xl border border-orange-200">
                          <p className="text-gray-800 text-sm sm:text-base">{order.shipping_notes}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs sm:text-sm font-semibold text-gray-600">שם המקבל</label>
                        <Input
                          value={editingShippingDetailsData.shipping_name}
                          onChange={(e) => setEditingShippingDetailsData(prev => ({...prev, shipping_name: e.target.value}))}
                          className="bg-gray-50 border-gray-200 focus:bg-white focus:border-orange-500"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-xs sm:text-sm font-semibold text-gray-600">טלפון למשלוח</label>
                        <Input
                          type="tel"
                          value={editingShippingDetailsData.shipping_phone}
                          onChange={(e) => setEditingShippingDetailsData(prev => ({...prev, shipping_phone: e.target.value}))}
                          className="bg-gray-50 border-gray-200 focus:bg-white focus:border-orange-500"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-xs sm:text-sm font-semibold text-gray-600">כתובת משלוח</label>
                        <Input
                          value={editingShippingDetailsData.shipping_address}
                          onChange={(e) => setEditingShippingDetailsData(prev => ({...prev, shipping_address: e.target.value}))}
                          className="bg-gray-50 border-gray-200 focus:bg-white focus:border-orange-500"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-xs sm:text-sm font-semibold text-gray-600">עיר</label>
                        <Input
                          value={editingShippingDetailsData.shipping_city}
                          onChange={(e) => setEditingShippingDetailsData(prev => ({...prev, shipping_city: e.target.value}))}
                          className="bg-gray-50 border-gray-200 focus:bg-white focus:border-orange-500"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-xs sm:text-sm font-semibold text-gray-600">מיקוד</label>
                        <Input
                          value={editingShippingDetailsData.shipping_zip}
                          onChange={(e) => setEditingShippingDetailsData(prev => ({...prev, shipping_zip: e.target.value}))}
                          className="bg-gray-50 border-gray-200 focus:bg-white focus:border-orange-500"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-xs sm:text-sm font-semibold text-gray-600">אופן משלוח</label>
                        <Input
                          value={editingShippingDetailsData.shipping_method}
                          onChange={(e) => setEditingShippingDetailsData(prev => ({...prev, shipping_method: e.target.value}))}
                          className="bg-gray-50 border-gray-200 focus:bg-white focus:border-orange-500"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-xs sm:text-sm font-semibold text-gray-600">עלות משלוח</label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={editingShippingDetailsData.shipping_cost}
                          onChange={(e) => setEditingShippingDetailsData(prev => ({...prev, shipping_cost: parseFloat(e.target.value) || 0}))}
                          className="bg-gray-50 border-gray-200 focus:bg-white focus:border-orange-500"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-xs sm:text-sm font-semibold text-gray-600">הערות משלוח</label>
                      <Textarea
                        value={editingShippingDetailsData.shipping_notes}
                        onChange={(e) => setEditingShippingDetailsData(prev => ({...prev, shipping_notes: e.target.value}))}
                        className="bg-gray-50 border-gray-200 focus:bg-white focus:border-orange-500"
                        rows={3}
                      />
                    </div>
                    
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={handleCancelEditShippingDetails}
                        className="text-gray-700 border-gray-300 hover:bg-gray-50"
                      >
                        <X className="w-4 h-4 ml-2" />
                        ביטול
                      </Button>
                      <Button
                        onClick={handleSaveShippingDetailsChanges}
                        className="bg-orange-600 hover:bg-orange-700 text-white"
                      >
                        <Save className="w-4 h-4 ml-2" />
                        שמור שינויים
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <Card className="border-none elegant-shadow-lg bg-white/90 backdrop-blur-sm">
            <CardHeader className="border-b border-gray-100 p-4 sm:p-6">
              <CardTitle className="flex items-center justify-between text-lg sm:text-xl">
                <div className="flex items-center gap-3">
                  <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                  פרטי תשלום
                </div>
                {!isEditingPayment && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleStartEditPayment}
                    className="text-green-600 border-green-200 hover:bg-green-50"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              {!isEditingPayment ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <p className="text-xs sm:text-sm font-semibold text-gray-600">סטטוס תשלום</p>
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        order.payment_status === 'שולם' 
                          ? 'bg-gradient-to-br from-green-100 to-green-200'
                          : 'bg-gradient-to-br from-red-100 to-red-200'
                      }`}>
                        <DollarSign className={`w-5 h-5 ${
                          order.payment_status === 'שולם' ? 'text-green-700' : 'text-red-700'
                        }`} />
                      </div>
                      <span className="text-base sm:text-lg font-semibold text-gray-900">
                        {order.payment_status === 'שולם' ? 'שולם' : 'לא שולם'}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs sm:text-sm font-semibold text-gray-600">סטטוס תשלום</label>
                      <Select
                        value={editingPaymentData.payment_status}
                        onValueChange={(value) => setEditingPaymentData(prev => ({...prev, payment_status: value}))}
                      >
                        <SelectTrigger className="bg-gray-50 border-gray-200 focus:bg-white focus:border-green-500">
                          <SelectValue placeholder="בחר סטטוס תשלום" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="לא_שולם">לא שולם</SelectItem>
                          <SelectItem value="שולם">שולם</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={handleCancelEditPayment}
                      className="text-gray-700 border-gray-300 hover:bg-gray-50"
                    >
                      <X className="w-4 h-4 ml-2" />
                      ביטול
                    </Button>
                    <Button
                      onClick={handleSavePaymentChanges}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Save className="w-4 h-4 ml-2" />
                      שמור שינויים
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>


          {order.items && (
            <Card className="border-none elegant-shadow-lg bg-white/90 backdrop-blur-sm">
              <CardHeader className="border-b border-gray-100 p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-3 text-lg sm:text-xl">
                    <Package className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                    פריטי ההזמנה ({order.items.length})
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Dialog open={showItemEditor} onOpenChange={setShowItemEditor}>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-green-600 border-green-200 hover:bg-green-50 gap-2"
                          title="ערוך פריטים"
                        >
                          <Edit2 className="w-4 h-4" />
                          ערוך פריטים
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2 text-lg">
                            <Package className="w-5 h-5 text-green-600" />
                            עריכת פריטי הזמנה #{order.order_number}
                          </DialogTitle>
                          <DialogDescription>
                            הוסף, הסר או ערוך פריטים בהזמנה
                          </DialogDescription>
                        </DialogHeader>
                        
                        <div className="mt-4">
                          <div className="space-y-4">
                            {localItems.map((item, index) => (
                              <div key={item.id || index} className="border border-gray-200 rounded-lg p-4 space-y-3">
                                <div className="flex items-center justify-between">
                                  <h4 className="font-medium text-gray-900">פריט #{index + 1}</h4>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => removeItem(index)}
                                    className="text-red-600 border-red-200 hover:bg-red-50"
                                  >
                                    <X className="w-4 h-4" />
                                    הסר
                                  </Button>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                  <div className="space-y-2">
                                    <Label className="text-sm font-medium">שם המוצר</Label>
                                    <Input
                                      value={item.product_name || ''}
                                      onChange={(e) => updateItemDetails(index, 'product_name', e.target.value)}
                                      placeholder="שם המוצר"
                                      className="bg-gray-50 border-gray-200 focus:bg-white focus:border-green-500"
                                    />
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <Label className="text-sm font-medium">כמות</Label>
                                    <Input
                                      type="number"
                                      min="0"
                                      step="0.01"
                                      value={item.quantity || ''}
                                      onChange={(e) => updateItemDetails(index, 'quantity', e.target.value)}
                                      placeholder="כמות"
                                      className="bg-gray-50 border-gray-200 focus:bg-white focus:border-green-500"
                                    />
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <Label className="text-sm font-medium">סכום</Label>
                                    <Input
                                      type="number"
                                      min="0"
                                      step="0.01"
                                      value={item.total || ''}
                                      onChange={(e) => updateItemDetails(index, 'total', e.target.value)}
                                      placeholder="סכום"
                                      className="bg-gray-50 border-gray-200 focus:bg-white focus:border-green-500"
                                    />
                                  </div>
                                </div>
                              </div>
                            ))}
                            
                            <Button
                              onClick={addNewItem}
                              variant="outline"
                              className="w-full bg-green-50 border-green-200 text-green-700 hover:bg-green-100 gap-2"
                            >
                              <Plus className="w-4 h-4" />
                              הוסף פריט חדש
                            </Button>
                            
                            <div className="border-t pt-4 mt-6">
                              <div className="flex justify-between items-center text-lg font-semibold">
                                <span>סכום כולל:</span>
                                <span className="text-green-600">
                                  ₪{localItems.reduce((sum, item) => sum + (parseFloat(item.total) || 0), 0).toFixed(2)}
                                </span>
                              </div>
                            </div>
                            
                            <div className="flex justify-end gap-3 pt-4">
                              <Button
                                variant="outline"
                                onClick={cancelItemsEdit}
                                className="text-gray-700 border-gray-300 hover:bg-gray-50 gap-2"
                              >
                                <X className="w-4 h-4" />
                                ביטול
                              </Button>
                              <Button
                                onClick={saveItemsChanges}
                                className="bg-green-600 hover:bg-green-700 text-white gap-2"
                              >
                                <Save className="w-4 h-4" />
                                שמור שינויים
                              </Button>
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>

                    {(order.status === "ממתין למשלוח" || order.status === "משלוח אצל השליח" || order.status === "בליקוט" || order.status === "ממתין לאיסוף") && (
                      <Dialog open={isEditingItems} onOpenChange={setIsEditingItems}>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-blue-600 border-blue-200 hover:bg-blue-50 gap-2"
                            title="עריכה מתקדמת"
                          >
                            <Settings className="w-4 h-4" />
                            עריכה מתקדמת
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-lg">
                              <Package className="w-5 h-5 text-blue-600" />
                              עריכה מתקדמת - הזמנה #{order.order_number}
                            </DialogTitle>
                            <DialogDescription>
                              ערוך כמויות, מיקומים וסטטוס ליקוט של הפריטים
                            </DialogDescription>
                          </DialogHeader>
                          <div className="mt-4">
                            <ItemPickingList 
                              order={order}
                              onUpdate={handleUpdateOrder}
                              inEditMode={true}
                            />
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="hidden md:block overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead className="text-right font-semibold">שם המוצר</TableHead>
                        <TableHead className="text-right font-semibold">מיקום</TableHead>
                        <TableHead className="text-right font-semibold">כמות</TableHead>
                        <TableHead className="text-right font-semibold">סה״כ</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {order.items.map((item, index) => (
                        <TableRow key={item.id || index} className="hover:bg-gray-50">
                          <TableCell className="font-medium">
                            {item.product_name || 'מוצר לא ידוע'}
                          </TableCell>
                          <TableCell>
                            {item.location && (
                                <Badge variant="outline" className="flex items-center gap-1 w-fit">
                                    <MapPin className="w-3 h-3 text-gray-500" />
                                    {item.location}
                                </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium min-w-fit inline-block">
                              {item.quantity || 0}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="font-bold text-green-600">
                              {order.currency || '₪'}{(item.total || 0).toFixed(2)}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                
                <div className="md:hidden p-2 sm:p-4 space-y-3">
                  {order.items.map((item, index) => (
                    <div key={item.id || index} className="bg-gray-50 rounded-lg p-3 space-y-3 border border-gray-100">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 text-sm leading-tight break-words">
                            {item.product_name || 'מוצר לא ידוע'}
                          </h4>
                          {item.location && (
                            <div className="mt-2">
                              <Badge variant="outline" className="flex items-center gap-1 w-fit text-xs">
                                <MapPin className="w-3 h-3 text-gray-500" />
                                {item.location}
                              </Badge>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-2 flex-shrink-0">
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium min-w-fit whitespace-nowrap">
                            כמות: {item.quantity || 0}
                          </span>
                          <span className="font-bold text-green-600 text-sm">
                            {order.currency || '₪'}{(item.total || 0).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="p-4 sm:p-6 bg-gray-50 border-t flex justify-between items-center">
                  <span className="text-base sm:text-lg font-semibold text-gray-700">סכום כולל:</span>
                  <span className="text-xl sm:text-2xl font-bold text-green-600">
                    {order.currency || '₪'}{totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {order.file_url && (
            <Card className="border-none elegant-shadow-lg bg-white/90 backdrop-blur-sm">
              <CardHeader className="border-b border-gray-100 p-4 sm:p-6">
                <CardTitle className="flex items-center gap-3 text-lg sm:text-xl">
                  <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                  קובץ מקורי
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">הזמנה מקורית</p>
                      <p className="text-sm text-gray-600 truncate">לחץ לצפיה בקובץ המקורי</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    asChild
                    className="bg-purple-50 border-purple-200 hover:bg-purple-100 text-purple-700 w-full sm:w-auto"
                  >
                    <a
                      href={order.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2"
                    >
                      <ExternalLink className="w-4 h-4 ml-2" />
                      פתח קובץ
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
