
import React, { useState, useEffect, useCallback } from 'react';
import { Order } from '@/api/entities';
import { User } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Truck,
  Phone,
  MapPin,
  Camera,
  Eye,
  RefreshCw,
  User as UserIcon,
  Package,
  CheckCircle,
  XCircle,
  Clock,
  FileX,
  CalendarDays,
  RotateCcw // Added for the return shipment feature
} from "lucide-react";
import { format, parseISO, isWithinInterval, addDays, addMonths, differenceInDays } from "date-fns";
import { he } from "date-fns/locale";
import { toast } from "sonner";
import { UploadFile } from "@/api/integrations";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import ReturnShipmentDialog from '../components/courier/ReturnShipmentDialog'; // Added for the return shipment feature

export default function CourierDashboardPage() {
  const [orders, setOrders] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDateRange, setSelectedDateRange] = useState({
    from: new Date(),
    to: addDays(new Date(), 1) // ברירת מחדל: היום ומחר
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const navigate = useNavigate();

  // Camera/Photo state management
  const [cameraStates, setCameraStates] = useState({});
  const [uploadingPhoto, setUploadingPhoto] = useState({});
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  // State עבור דיאלוג החזרת משלוח
  const [returnDialogOpen, setReturnDialogOpen] = useState(false);
  const [selectedOrderForReturn, setSelectedOrderForReturn] = useState(null);

  // Camera state management
  const setCameraState = (orderId, state) => {
    setCameraStates(prev => ({ ...prev, [orderId]: state }));
  };

  const getCameraState = (orderId) => {
    return cameraStates[orderId] || 'idle';
  };

  // Helper function to calculate total bags and cartons for an order
  const calculateTotalBags = (order) => {
    let totalShakiyot = 0;
    let totalKartonot = 0;

    // First try to use location_bag_summary if available
    if (order.location_bag_summary && order.location_bag_summary.length > 0) {
      order.location_bag_summary.forEach(location => {
        const count = location.bags_count || 0;
        if (location.unit_type === 'קרטון' || location.location?.toLowerCase().includes('קרטון')) {
          totalKartonot += count;
        } else {
          totalShakiyot += count;
        }
      });
    } else {
      // Fallback: generate from items if location_bag_summary is not available
      if (order.items && order.items.length > 0) {
        const locationCounts = {};
        order.items.forEach(item => {
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
        
        // Calculate bags/cartons by location (assuming 10 items per unit, minimum 1 unit per location)
        Object.entries(locationCounts).forEach(([location, itemCount]) => {
          const unitCount = Math.max(1, Math.ceil(itemCount / 10));
          if (location.toLowerCase().includes('קרטון')) {
            totalKartonot += unitCount;
          } else {
            totalShakiyot += unitCount;
          }
        });
      }
    }
    
    return { shakiyot: totalShakiyot, kartonot: totalKartonot };
  };

  // Load current user
  useEffect(() => {
    const loadUser = async () => {
      try {
        const user = await User.me();
        setCurrentUser(user);
      } catch (error) {
        console.error("Error loading user:", error);
        setCurrentUser(null);
      }
    };
    loadUser();
  }, []);

  const loadOrders = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setIsLoading(true);
    setIsRefreshing(true);
    
    try {
      if (!currentUser || (!currentUser.courier_company_affiliation && currentUser.custom_role !== 'admin')) {
        if (currentUser && currentUser.custom_role !== 'admin') {
          toast.error("לא נמצא שיוך לחברת שליחויות עבור המשתמש");
        }
        setOrders([]);
        return;
      }

      const allOrders = await Order.list();
      const relevantOrders = allOrders.filter(order => {
        // Admins can see all courier orders, couriers only see their own.
        const isCourierAffiliated = currentUser.custom_role === 'admin' || order.courier_company === currentUser.courier_company_affiliation;

        // Check if order matches courier affiliation and status
        const statusMatch = order.status === 'משלוח אצל השליח' && order.shipping_method_chosen === 'משלוח';
        
        // Check if order falls within selected date range
        let dateMatch = true;
        if (order.shipment_due_date && selectedDateRange.from && selectedDateRange.to) {
          try {
            const orderDate = parseISO(order.shipment_due_date);
            dateMatch = isWithinInterval(orderDate, {
              start: selectedDateRange.from,
              end: selectedDateRange.to
            });
          } catch (error) {
            console.error("Error parsing shipment_due_date:", error);
            dateMatch = false;
          }
        }

        return isCourierAffiliated && statusMatch && dateMatch;
      });

      setOrders(relevantOrders);
    } catch (error) {
      console.error("Error loading orders:", error);
      toast.error("שגיאה בטעינת המשלוחים");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [currentUser, selectedDateRange]);

  useEffect(() => {
    if (currentUser) {
      loadOrders();
    } else {
      setIsLoading(false);
    }
  }, [selectedDateRange, currentUser, loadOrders]);

  const handleRefresh = async () => {
    toast.info("מרענן נתונים...");
    await loadOrders(true);
    toast.success("הנתונים עודכנו!");
  };

  const handleDateRangeChange = (range) => {
    if (!range || !range.from) return;

    // אם לא נבחר תאריך סיום, נגדיר אותו כיום אחד אחרי ההתחלה
    const from = range.from;
    const to = range.to || addDays(range.from, 1);

    // בדיקת מינימום יומיים
    const daysDifference = differenceInDays(to, from);
    if (daysDifference < 1) { // 0 days means same day, 1 means next day, so 0 diff is 1 day. Need at least 1 day difference for 2 days.
      toast.error("יש לבחור טווח של לפחות יום אחד"); // Changed from "יומיים" to "יום אחד" based on differenceInDays logic (0 diff = 1 day range)
      return;
    }

    // בדיקת מקסימום 12 חודשים
    const maxDate = addMonths(from, 12);
    if (to > maxDate) {
      toast.error("טווח התאריכים לא יכול להיות יותר מ-12 חודשים");
      return;
    }

    setSelectedDateRange({ from, to });
  };

  const handlePhoneCall = (phoneNumber) => {
    if (phoneNumber) {
      window.location.href = `tel:${phoneNumber}`;
    } else {
      toast.error("מספר טלפון לא זמין");
    }
  };

  const handleNavigate = (address, city) => {
    const fullAddress = `${address}, ${city}`.trim();
    if (fullAddress) {
      const encodedAddress = encodeURIComponent(fullAddress);
      window.open(`https://maps.google.com?q=${encodedAddress}`, '_blank');
    } else {
      toast.error("כתובת לא זמינה");
    }
  };

  // Photo handling with proper state machine
  const handleTakePhoto = async (orderId) => {
    const currentState = getCameraState(orderId);
    
    if (currentState === 'uploading') return; // Prevent duplicate uploads
    
    let stream;
    try {
      setCameraState(orderId, 'preview');
      
      // Open camera preview
      stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();
      
      // Wait for video to load metadata
      await new Promise(resolve => {
        video.onloadedmetadata = () => {
          video.width = video.videoWidth;
          video.height = video.videoHeight;
          resolve();
        };
      });

      setCameraState(orderId, 'capturing');
      
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.8));
      
      // Stop camera after capture
      stream.getTracks().forEach(track => track.stop());
      
      setCameraState(orderId, 'uploading');
      setUploadingPhoto(prev => ({ ...prev, [orderId]: true }));
      
      if (!blob) {
        throw new Error("Failed to create image blob.");
      }
      const file = new File([blob], `delivery_${orderId}_${Date.now()}.jpg`, { type: 'image/jpeg' });

      toast.loading("מעלה תמונה...", { id: `upload-${orderId}` });
      const uploadResult = await UploadFile({ file });
      
      await Order.update(orderId, {
        delivery_photo_url: uploadResult.file_url
      });
      
      toast.success("התמונה נשמרה בהצלחה!", { id: `upload-${orderId}` });
      setCameraState(orderId, 'success');
      
      setTimeout(() => {
        setCameraState(orderId, 'idle');
      }, 1000);
      
    } catch (error) {
      console.error("Error taking photo:", error);
      toast.error("שגיאה בשמירת התמונה - נסה שוב", { id: `upload-${orderId}` });
      setCameraState(orderId, 'error');
      
      // Stop stream in case of error
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      setTimeout(() => {
        setCameraState(orderId, 'idle');
      }, 2000);
      
    } finally {
      setUploadingPhoto(prev => ({ ...prev, [orderId]: false }));
    }
  };

  // Modified handleDelivered as per outline
  const handleDelivered = async (orderId, photo, notes) => {
    const toastId = toast.loading("מעדכן סטטוס הזמנה...");
    try {
      const fetchedUser = await User.me(); // Fetch currentUser fresh as per outline
      
      // Update order status to delivered and then to archived
      await Order.update(orderId, {
        delivery_status: "נמסרה",
        status: "בארכיון", // Auto-archive after delivery as per outline
        delivered_by: fetchedUser.full_name || fetchedUser.email,
        delivered_date: new Date().toISOString(),
        delivery_photo_url: photo || undefined, // As per outline
        delivery_notes: notes || undefined // As per outline
      });

      toast.success("ההזמנה סומנה כנמסרה והועברה לארכיון!", { id: toastId }); // Updated toast message
      
      // Refresh the orders list to remove the delivered order
      await loadOrders(true);
      
    } catch (error) {
      console.error("Error marking order as delivered:", error);
      toast.error("שגיאה בעדכון סטטוס ההזמנה.", { id: toastId });
    }
  };

  // Modified handleNotDelivered as per outline
  const handleNotDelivered = async (orderId, reason) => {
    const toastId = toast.loading("מעדכן סטטוס להזמנה לא נמסרה...");
    try {
      const fetchedUser = await User.me(); // Fetch currentUser fresh as per outline
      
      // Update order status to not delivered and then to archived
      await Order.update(orderId, {
        delivery_status: "לא_נמסרה",
        status: "בארכיון", // Auto-archive after failed delivery attempt as per outline
        delivered_by: fetchedUser.full_name || fetchedUser.email,
        delivered_date: new Date().toISOString(), // This will be the date of the failed attempt
        nonDeliveryReason: reason || undefined // Only set if reason provided
      });

      toast.success("ההזמנה סומנה כלא נמסרה והועברה לארכיון!", { id: toastId });
      
      // Refresh the orders list to remove the order
      await loadOrders(true);
      
    } catch (error) {
      console.error("Error marking order as not delivered:", error);
      toast.error("שגיאה בעדכון סטטוס ההזמנה.", { id: toastId });
    }
  };

  // פונקציה לפתיחת דיאלוג החזרת משלוח
  const handleReturnShipment = (order) => {
    setSelectedOrderForReturn(order);
    setReturnDialogOpen(true);
  };

  // פונקציה שנקראת לאחר החזרה מוצלחת
  const handleReturnSuccess = async () => {
    // רענון רשימת ההזמנות
    await loadOrders(true);
    setSelectedOrderForReturn(null);
    setReturnDialogOpen(false); // Close dialog after success
  };

  // New component for photo modal
  const ViewPhotoModal = ({ photoUrl, isOpen, onClose }) => {
    if (!isOpen || !photoUrl) return null;

    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>תמונת אישור מסירה</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center items-center h-full max-h-[70vh]">
            <img 
              src={photoUrl} 
              alt="תמונת אישור מסירה" 
              className="max-w-full max-h-full object-contain rounded-lg"
              onError={(e) => {
                e.target.style.display = 'none';
                if (e.target.nextElementSibling) {
                  e.target.nextElementSibling.style.display = 'flex'; // Show fallback div
                }
              }}
            />
            <div className="hidden flex-col items-center justify-center text-center text-gray-500 p-8">
              <FileX className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p>לא ניתן לטעון את התמונה</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  // New component for delivery actions (Delivered/Not Delivered)
  const DeliveryActionsDialog = ({ orderId, onDelivered, onNotDelivered, disabled }) => {
    const [open, setOpen] = useState(false);
    const [notDeliveredOpen, setNotDeliveredOpen] = useState(false);
    const [reason, setReason] = useState("");

    const handleDeliveredClick = async () => {
      // Calls onDelivered (handleDelivered) without 'photo' or 'notes' parameters.
      // These will be 'undefined' in handleDelivered, potentially clearing existing values on the order.
      await onDelivered(orderId); 
      setOpen(false); // Close main dialog
    };

    const handleNotDeliveredClick = async () => {
      if (!reason.trim()) {
        toast.error("אנא הזן סיבה לאי-מסירה.");
        return;
      }
      await onNotDelivered(orderId, reason);
      setNotDeliveredOpen(false); // Close sub-dialog
      setOpen(false); // Close main dialog
      setReason(""); // Clear reason
    };

    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="flex-1 sm:flex-none" disabled={disabled}>
            <Truck className="w-4 h-4 mr-2" />
            פעולות מסירה
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>פעולות עבור הזמנה #{orderId}</DialogTitle>
            <DialogDescription>בחר פעולה עבור הזמנה זו.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {!notDeliveredOpen ? (
              <>
                <Button onClick={handleDeliveredClick}>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  סמן כנמסר
                </Button>
                <Button variant="outline" onClick={() => setNotDeliveredOpen(true)}>
                  <XCircle className="w-4 h-4 mr-2" />
                  סמן כלא נמסר
                </Button>
              </>
            ) : (
              <>
                <Label htmlFor="reason" className="text-right">
                  סיבת אי-מסירה
                </Label>
                <Textarea
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="הזן את הסיבה לאי-מסירה..."
                  className="col-span-3"
                />
                <DialogFooter>
                  <Button variant="outline" onClick={() => {
                    setNotDeliveredOpen(false);
                    setReason("");
                  }}>
                    ביטול
                  </Button>
                  <Button type="submit" onClick={handleNotDeliveredClick}>
                    אישור
                  </Button>
                </DialogFooter>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  const safeFormatDate = (dateString) => {
    if (!dateString) return '---';
    const date = new Date(dateString);
    if (date instanceof Date && !isNaN(date)) {
      return format(date, "dd/MM/yyyy", { locale: he });
    }
    return '---';
  };

  const formatDateRange = () => {
    if (!selectedDateRange.from || !selectedDateRange.to) return 'לא נבחר טווח תאריכים';
    
    const fromStr = format(selectedDateRange.from, "dd/MM/yyyy", { locale: he });
    const toStr = format(selectedDateRange.to, "dd/MM/yyyy", { locale: he });
    
    if (fromStr === toStr) return fromStr;
    return `${fromStr} - ${toStr}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentUser || (currentUser.custom_role !== 'courier' && currentUser.custom_role !== 'admin')) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6 lg:p-8 flex items-center justify-center">
        <Card className="max-w-lg w-full border-none elegant-shadow-lg bg-white/90 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl font-bold text-red-600">
              גישה מוגבלת
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 leading-relaxed">
              דף זה מיועד לשליחים ומנהלי מערכת בלבד.
              {currentUser ? " אנא פנה למנהל המערכת לקבלת הרשאות מתאימות." : " אנא התחבר למערכת."}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-green-700 rounded-xl flex items-center justify-center">
              <Truck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">דף השליח</h1>
              <p className="text-gray-600 text-lg">
                שלום {currentUser.full_name} {currentUser.courier_company_affiliation ? `- ${currentUser.courier_company_affiliation}` : ''}
              </p>
            </div>
          </div>
          <Button onClick={handleRefresh} variant="outline" size="icon" className="bg-white elegant-shadow" disabled={isRefreshing}>
            <RefreshCw className={`w-5 h-5 text-gray-600 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {/* Date Range Picker */}
        <div className="mb-6">
          <Card className="border-none elegant-shadow-lg bg-white/90 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-4 flex-wrap">
                <CalendarDays className="w-5 h-5 text-blue-600" />
                <label className="font-medium text-gray-700">בחר טווח תאריכים למשלוחים:</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-80 justify-start text-left font-normal bg-white border-gray-200">
                      <CalendarDays className="mr-2 h-4 w-4" />
                      {formatDateRange()}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      initialFocus
                      mode="range"
                      defaultMonth={selectedDateRange.from}
                      selected={selectedDateRange}
                      onSelect={handleDateRangeChange}
                      numberOfMonths={2}
                      locale={he}
                      dir="rtl"
                    />
                    <div className="p-3 border-t bg-gray-50">
                      <p className="text-xs text-gray-600">
                        • מינימום: יום אחד • מקסימום: 12 חודשים
                      </p>
                    </div>
                  </PopoverContent>
                </Popover>
                <span className="text-sm text-gray-500">
                  {orders.length} משלוחים בטווח הנבחר
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {orders.length === 0 ? (
            <Card className="border-none elegant-shadow-lg bg-white/80 backdrop-blur-sm">
              <CardContent className="p-12 text-center">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">אין משלוחים</h3>
                <p className="text-gray-500 mb-6">
                  לא נמצאו משלוחים בטווח התאריכים {formatDateRange()}
                  {currentUser.courier_company_affiliation ? ` עבור ${currentUser.courier_company_affiliation}` : ''}
                </p>
              </CardContent>
            </Card>
          ) : (
            orders.map((order) => {
              const cameraState = getCameraState(order.id);
              const isUploading = uploadingPhoto[order.id];
              const bagsSummary = calculateTotalBags(order);
              
              return (
                <Card key={order.id} className="border-none elegant-shadow-lg bg-white/90 backdrop-blur-sm">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <UserIcon className="w-5 h-5 text-blue-600" />
                          {order.shipping_name || order.customer_name || 'לקוח לא ידוע'}
                        </CardTitle>
                        <p className="text-sm text-gray-600 mt-1">
                          הזמנה #{order.order_number}
                        </p>
                      </div>
                      <Badge 
                        className={`${
                          order.delivery_status === 'נמסרה' ? 'bg-green-100 text-green-800' : 
                          order.delivery_status === 'לא_נמסרה' ? 'bg-red-100 text-red-800' : 
                          'bg-yellow-100 text-yellow-800'
                        } border font-medium`}
                      >
                        {order.delivery_status === 'נמסרה' ? 'נמסרה' : 
                         order.delivery_status === 'לא_נמסרה' ? 'לא נמסרה' : 
                         'ממתין למסירה'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="w-4 h-4 text-gray-500" />
                          <span className="font-medium">כתובת:</span>
                          <span>{order.shipping_address || 'לא צוין'}, {order.shipping_city || ''}</span>
                        </div>
                        {(order.shipping_phone || order.customer_phone) && (
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="w-4 h-4 text-gray-500" />
                            <span className="font-medium">טלפון:</span>
                            <a 
                              href={`tel:${order.shipping_phone || order.customer_phone}`}
                              className="text-blue-600 hover:underline"
                            >
                              {order.shipping_phone || order.customer_phone}
                            </a>
                          </div>
                        )}
                         {order.total_amount && (
                           <div className="flex items-center gap-2 text-sm">
                            <span className="font-medium">סכום הזמנה:</span>
                            <span className="text-lg font-bold">
                              {order.currency || '₪'}{order.total_amount?.toLocaleString() || '0'}
                            </span>
                          </div>
                        )}
                        
                        {/* Updated bags and cartons summary display */}
                        {(bagsSummary.shakiyot > 0 || bagsSummary.kartonot > 0) && (
                          <div className="flex items-center gap-2 text-sm">
                            <Package className="w-4 h-4 text-orange-500" />
                            <span className="font-medium">סה״כ למסירה:</span>
                            <div className="flex items-center gap-2">
                              {bagsSummary.shakiyot > 0 && (
                                <span className="text-lg font-bold text-orange-600">
                                  {bagsSummary.shakiyot} שקיות
                                </span>
                              )}
                              {bagsSummary.shakiyot > 0 && bagsSummary.kartonot > 0 && (
                                <span className="text-gray-500">+</span>
                              )}
                              {bagsSummary.kartonot > 0 && (
                                <span className="text-lg font-bold text-orange-600">
                                  {bagsSummary.kartonot} קרטונים
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        {order.shipping_notes && (
                          <div className="text-sm">
                            <span className="font-medium">הערות:</span>
                            <p className="text-gray-600 mt-1">{order.shipping_notes}</p>
                          </div>
                        )}
                        {order.delivered_date && (
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="w-4 h-4 text-gray-500" />
                            <span className="font-medium">נמסר בתאריך:</span>
                            <span>{safeFormatDate(order.delivered_date)}</span>
                          </div>
                        )}
                        {order.nonDeliveryReason && (
                          <div className="text-sm">
                            <span className="font-medium text-red-600">סיבת אי-מסירה:</span>
                            <p className="text-red-600 mt-1">{order.nonDeliveryReason}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Photo display section */}
                    {order.delivery_photo_url && (
                      <div className="border-t pt-4">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm">תמונת אישור מסירה:</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedPhoto({ url: order.delivery_photo_url, orderId: order.id })}
                            className="flex items-center gap-2"
                          >
                            <Eye className="w-4 h-4" />
                            צפייה בתמונה
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Action buttons */}
                    {order.delivery_status !== 'נמסרה' && order.delivery_status !== 'לא_נמסרה' && (
                      <div className="flex flex-wrap gap-3 pt-4 border-t">
                        <DeliveryActionsDialog
                          orderId={order.id}
                          onDelivered={handleDelivered}
                          onNotDelivered={handleNotDelivered}
                          disabled={isUploading || cameraState === 'uploading'}
                        />

                        <Button
                          variant="outline"
                          onClick={() => handleTakePhoto(order.id)}
                          className="text-blue-600 border-blue-200 hover:bg-blue-50 flex-1 sm:flex-none"
                          disabled={isUploading || cameraState === 'uploading'}
                        >
                          {cameraState === 'uploading' || isUploading ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                              שומר תמונה...
                            </>
                          ) : cameraState === 'success' ? (
                            <>
                              <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                              נשמר
                            </>
                          ) : (
                            <>
                              <Camera className="w-4 h-4 mr-2" />
                              צלם תמונה
                            </>
                          )}
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => navigate(createPageUrl(`OrderDetails?id=${order.id}`))}
                          title="צפה בפרטי ההזמנה"
                        >
                          <Eye className="w-5 h-5" />
                        </Button>

                        {/* כפתור החזרת משלוח - רק למנהלי מערכת */}
                        {currentUser?.custom_role === 'admin' && (
                          <Button
                            variant="outline"
                            onClick={() => handleReturnShipment(order)}
                            className="text-orange-600 border-orange-200 hover:bg-orange-50 flex-1 sm:flex-none"
                            title="החזר משלוח להמתנה לשליח"
                          >
                            <RotateCcw className="w-4 h-4 mr-2" />
                            החזר משלוח
                          </Button>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })
          )}

          {/* Photo viewing modal */}
          <ViewPhotoModal
            photoUrl={selectedPhoto?.url}
            isOpen={!!selectedPhoto}
            onClose={() => setSelectedPhoto(null)}
          />

          {/* דיאלוג החזרת משלוח */}
          <ReturnShipmentDialog
            orderId={selectedOrderForReturn?.id}
            orderData={selectedOrderForReturn}
            isOpen={returnDialogOpen}
            onOpenChange={setReturnDialogOpen}
            onSuccess={handleReturnSuccess}
          />
        </div>
      </div>
    </div>
  );
}
