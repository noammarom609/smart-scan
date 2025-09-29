import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Truck, Store, RotateCcw, X, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import { toast } from "sonner";
import { Order } from '@/api/entities';
import { User } from '@/api/entities';

export default function ReturnShipmentDialog({ 
  orderId, 
  orderData,
  isOpen, 
  onOpenChange, 
  onSuccess 
}) {
  // State עבור הטופס
  const [shippingMethod, setShippingMethod] = useState("");
  const [courierCompany, setCourierCompany] = useState("");
  const [shipmentDate, setShipmentDate] = useState(null);
  const [pickupDate, setPickupDate] = useState(null);
  const [pickupTime, setPickupTime] = useState("");
  const [returnReason, setReturnReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // איפוס הטופס בעת פתיחת הדיאלוג
  React.useEffect(() => {
    if (isOpen) {
      setShippingMethod("");
      setCourierCompany("");
      setShipmentDate(null);
      setPickupDate(null);
      setPickupTime("");
      setReturnReason("");
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    // ולידציות
    if (!shippingMethod) {
      toast.error("יש לבחור אופן משלוח");
      return;
    }

    if (!returnReason.trim()) {
      toast.error("יש להזין סיבת החזרה");
      return;
    }

    if (shippingMethod === 'משלוח') {
      if (!courierCompany) {
        toast.error("יש לבחור חברת שילוח");
        return;
      }
      if (!shipmentDate) {
        toast.error("יש לבחור תאריך יעד למשלוח");
        return;
      }
    } else if (shippingMethod === 'איסוף_עצמי') {
      if (!pickupDate) {
        toast.error("יש לבחור תאריך איסוף");
        return;
      }
      if (!pickupTime) {
        toast.error("יש לבחור שעת איסוף");
        return;
      }
    }

    setIsSubmitting(true);
    const toastId = toast.loading("מחזיר משלוח להמתנה...");

    try {
      // קבלת פרטי המשתמש הנוכחי (מנהל המערכת)
      const currentUser = await User.me();

      // הכנת נתוני העדכון
      const updateData = {
        // עדכון סטטוס בהתאם לבחירה
        status: shippingMethod === 'משלוח' ? 'ממתין למשלוח' : 'ממתין לאיסוף',
        
        // עדכון פרטי המשלוח החדשים
        shipping_method_chosen: shippingMethod,
        
        // ניקוי נתוני מסירה קיימים
        delivery_status: 'לא_נמסר',
        delivered_by: null,
        delivered_date: null,
        delivery_photo_url: null,
        delivery_notes: null,
        nonDeliveryReason: null,
        
        // תיעוד ההחזרה
        return_reason: returnReason.trim(),
        returned_by: currentUser.full_name || currentUser.email,
        returned_date: new Date().toISOString()
      };

      // הוספת פרטים ספציפיים לפי סוג המשלוח
      if (shippingMethod === 'משלוח') {
        updateData.courier_company = courierCompany;
        updateData.shipment_due_date = format(shipmentDate, 'yyyy-MM-dd');
        // ניקוי נתוני איסוף עצמי אם היו קיימים
        updateData.pickup_preferred_date = null;
        updateData.pickup_preferred_time = null;
      } else {
        updateData.pickup_preferred_date = format(pickupDate, 'yyyy-MM-dd');
        updateData.pickup_preferred_time = pickupTime;
        // ניקוי נתוני משלוח אם היו קיימים
        updateData.courier_company = null;
        updateData.shipment_due_date = null;
      }

      // עדכון ההזמנה במסד הנתונים
      await Order.update(orderId, updateData);

      toast.success(
        `המשלוח הוחזר בהצלחה ל${shippingMethod === 'משלוח' ? 'משלוח' : 'איסוף עצמי'}!`,
        { id: toastId }
      );

      // סגירת הדיאלוג והודעה להורה על הצלחה
      onOpenChange(false);
      if (onSuccess) {
        onSuccess();
      }

    } catch (error) {
      console.error('Error returning shipment:', error);
      toast.error('שגיאה בהחזרת המשלוח. אנא נסה שוב.', { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (!isSubmitting) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <RotateCcw className="w-6 h-6 text-orange-600" />
            החזר משלוח להמתנה לשליח
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* פרטי ההזמנה */}
          {orderData && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">פרטי ההזמנה:</h4>
              <div className="text-sm text-gray-700 space-y-1">
                <div><strong>מספר הזמנה:</strong> {orderData.order_number}</div>
                <div><strong>לקוח:</strong> {orderData.shipping_name || orderData.customer_name}</div>
                <div><strong>כתובת:</strong> {orderData.shipping_address}, {orderData.shipping_city}</div>
                <div><strong>חברת שילוח נוכחית:</strong> {orderData.courier_company || 'לא צוין'}</div>
              </div>
            </div>
          )}

          {/* סיבת החזרה */}
          <div className="space-y-2">
            <Label htmlFor="returnReason" className="text-base font-semibold text-gray-900">
              סיבת החזרה <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="returnReason"
              value={returnReason}
              onChange={(e) => setReturnReason(e.target.value)}
              placeholder="הזן את הסיבה להחזרת המשלוח (למשל: שליח לא מצא את הכתובת, בעיה טכנית, שינוי בדרישות הלקוח וכו')"
              className="h-20"
            />
          </div>

          {/* בחירת אופן משלוח */}
          <div className="space-y-4">
            <Label className="text-base font-semibold text-gray-900">
              בחר אופן משלוח חדש <span className="text-red-500">*</span>
            </Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button
                type="button"
                onClick={() => setShippingMethod('משלוח')}
                variant={shippingMethod === 'משלוח' ? 'default' : 'outline'}
                className={`h-14 text-sm font-medium ${
                  shippingMethod === 'משלוח'
                    ? 'bg-blue-600 hover:bg-blue-700 text-white border-2 border-blue-600'
                    : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-blue-400'
                }`}
              >
                <Truck className="w-5 h-5 mr-2" />
                משלוח
              </Button>
              <Button
                type="button"
                onClick={() => setShippingMethod('איסוף_עצמי')}
                variant={shippingMethod === 'איסוף_עצמי' ? 'default' : 'outline'}
                className={`h-14 text-sm font-medium ${
                  shippingMethod === 'איסוף_עצמי'
                    ? 'bg-purple-600 hover:bg-purple-700 text-white border-2 border-purple-600'
                    : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-purple-400'
                }`}
              >
                <Store className="w-5 h-5 mr-2" />
                איסוף עצמי
              </Button>
            </div>
          </div>

          {/* שדות תלויי בחירה */}
          {shippingMethod === 'משלוח' && (
            <div className="space-y-4 animate-in fade-in bg-blue-50 p-4 rounded-xl border border-blue-200">
              <div>
                <Label className="text-sm font-semibold text-blue-800 block mb-2">
                  חברת שילוח <span className="text-red-500">*</span>
                </Label>
                <Select value={courierCompany} onValueChange={setCourierCompany}>
                  <SelectTrigger className="h-12">
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
                <Label className="text-sm font-semibold text-blue-800 block mb-2">
                  תאריך יעד למשלוח <span className="text-red-500">*</span>
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start text-left font-normal h-12"
                    >
                      <CalendarIcon className="mr-2 h-5 w-5" />
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

          {shippingMethod === 'איסוף_עצמי' && (
            <div className="space-y-4 animate-in fade-in bg-purple-50 p-4 rounded-xl border border-purple-200">
              <div>
                <Label className="text-sm font-semibold text-purple-800 block mb-2">
                  תאריך איסוף מועדף <span className="text-red-500">*</span>
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start text-left font-normal h-12"
                    >
                      <CalendarIcon className="mr-2 h-5 w-5" />
                      {pickupDate ? format(pickupDate, "dd/MM/yyyy", { locale: he }) : <span>בחר תאריך</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={pickupDate}
                      onSelect={setPickupDate}
                      initialFocus
                      locale={he}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label className="text-sm font-semibold text-purple-800 block mb-2">
                  שעת איסוף מועדפת <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="time"
                  value={pickupTime}
                  onChange={(e) => setPickupTime(e.target.value)}
                  className="h-12"
                />
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex items-center gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isSubmitting}
            className="flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            ביטול
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-orange-600 hover:bg-orange-700 flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                מחזיר...
              </>
            ) : (
              <>
                <RotateCcw className="w-4 h-4" />
                החזר משלוח
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}