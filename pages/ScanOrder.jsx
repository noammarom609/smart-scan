import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { toast } from "sonner";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import OrderPreview from "../components/scan/OrderPreview";
import { useOrders } from '@/components/contexts/OrderContext';
import { triggerNotificationsFromOrder } from '@/api/functions';

export default function ManualOrderPage() {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const { createOrder, orders: allOrders } = useOrders();

  // Generate next manual order number (A1, A2, A3, etc.)
  const generateNextOrderNumber = async () => {
    try {
      // Filter only manual orders (starting with 'A') from global state
      const manualOrderNumbers = allOrders
        .filter(order => order.order_number && order.order_number.startsWith('A'))
        .map(order => {
          const numberPart = order.order_number.substring(1); // Remove 'A' prefix
          return parseInt(numberPart);
        })
        .filter(num => !isNaN(num))
        .sort((a, b) => b - a);
      
      if (manualOrderNumbers.length === 0) {
        return "A1"; // Start from A1 if no manual orders exist
      }
      
      const maxNumber = manualOrderNumbers[0];
      return `A${maxNumber + 1}`;
    } catch (error) {
      console.error("Error generating manual order number:", error);
      return "A1";
    }
  };

  const handleSaveOrder = async (orderData) => {
    setIsProcessing(true);
    try {
      // Generate automatic manual order number
      const nextOrderNumber = await generateNextOrderNumber();

      const newOrder = await createOrder({
        ...orderData,
        supplier: "הזמנה ידנית", // ערך ברירת מחדל לספק
        order_number: nextOrderNumber,
        // עבור הזמנות ידניות: date משמש גם כתאריך קבלת ההזמנה
        email_received_date: orderData.date, // העתק מ-date כדי לשמור תאימות עם שאר המערכת
        status: "בליקוט", // שינוי סטטוס ישירות לליקוט
        picking_status: "לא_התחיל", // הגדרת סטטוס ליקוט
        picking_started_date: new Date().toISOString() // הגדרת זמן תחילת ליקוט
      });
      
      // טריגר אוטומטי להתראות - הזמנה חדשה נוצרה ועברה לליקוט
      try {
        await triggerNotificationsFromOrder({ 
          orderId: newOrder.id, 
          triggerType: 'order_created_and_picking_started' 
        });
        console.log('Notifications triggered for new manual order:', newOrder.id);
      } catch (notificationError) {
        console.error('Error triggering notifications for new order:', notificationError);
        // לא נעצור את התהליך בגלל שגיאת התראות
      }
      
      toast.success(`ההזמנה נוצרה בהצלחה! מספר הזמנה: ${nextOrderNumber}`, {
        duration: 4000,
        position: "top-center"
      });
      navigate(createPageUrl("Picking")); // ניווט לדף ליקוטים

    } catch (error) {
      toast.error("שגיאה בשמירת ההזמנה. אנא נסה שוב.", {
        duration: 4000,
        position: "top-center"
      });
      console.error(error);
    }
    setIsProcessing(false);
  };

  const handleCancel = () => {
    navigate(createPageUrl("Home"));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={handleCancel}
              className="bg-white hover:bg-gray-50 border-gray-200 elegant-shadow"
            >
              <ArrowRight className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">הזמנה ידנית</h1>
              <p className="text-gray-600 mt-1 text-lg">הזן את פרטי ההזמנה באופן ידני - מספר ההזמנה יווצר אוטומטית</p>
            </div>
          </div>
        </div>

        <OrderPreview
          extractedData={{}}
          onSave={handleSaveOrder}
          onCancel={handleCancel}
          isProcessing={isProcessing}
        />
      </div>
    </div>
  );
}