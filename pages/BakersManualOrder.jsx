
import React, { useState } from "react";
import { Order } from "@/api/entities";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { toast } from "sonner";
import { ArrowRight, ChefHat } from "lucide-react";
import { Button } from "@/components/ui/button";
import BakingOrderForm from "../components/bakers/BakingOrderForm";
import { createNotification } from "@/api/functions";

export default function BakersManualOrderPage() {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

  // Generate next manual baking order number (B1, B2, B3, etc.)
  const generateNextBakingOrderNumber = async () => {
    try {
      const allOrders = await Order.list();
      
      // Filter only manual baking orders (starting with 'B')
      const bakingOrderNumbers = allOrders
        .filter(order => order.order_number && order.order_number.startsWith('B'))
        .map(order => {
          const numberPart = order.order_number.substring(1); // Remove 'B' prefix
          return parseInt(numberPart);
        })
        .filter(num => !isNaN(num))
        .sort((a, b) => b - a);
      
      if (bakingOrderNumbers.length === 0) {
        return "B1"; // Start from B1 if no manual baking orders exist
      }
      
      const maxNumber = bakingOrderNumbers[0];
      return `B${maxNumber + 1}`;
    } catch (error) {
      console.error("Error generating manual baking order number:", error);
      return "B1";
    }
  };

  const handleSaveOrder = async (orderData) => {
    setIsProcessing(true);
    try {
      // Generate automatic manual baking order number
      const nextOrderNumber = await generateNextBakingOrderNumber();

      // Create items with baking-relevant location to ensure they appear in Bakers page
      const itemsWithBakingLocation = (orderData.items || []).map(item => ({
        ...item,
        location: "טרי מטבח לאפייה", // Default baking location
        location_breakdown: [
          {
            location: "טרי מטבח לאפייה",
            quantity: item.quantity || 1
          }
        ],
        picking_status: "לא_התחיל",
        baking_status: "ממתין"
      }));

      const newOrder = await Order.create({
        ...orderData,
        supplier: orderData.supplier || "משימת אפייה פנימית", // ערך ברירת מחדל לספק
        order_number: nextOrderNumber,
        order_type: "הזמנה_לאופות", // קביעה אוטומטית של סוג ההזמנה לאופות
        email_received_date: new Date().toISOString(), // Current time instead of date field
        status: "בליקוט", // שינוי סטטוס ישירות לליקוט
        picking_status: "לא_התחיל", // הגדרת סטטוס ליקוט
        picking_started_date: new Date().toISOString(), // הגדרת זמן תחילת ליקוט
        items: itemsWithBakingLocation // Use items with baking locations
      });

      // יצירת התראה למשתמשי אופות
      try {
        await createNotification({
          recipient_role: 'baker',
          type: 'baking_order_created',
          message: `משימת אפייה חדשה: ${orderData.customer_name || 'לקוח'} (${itemsWithBakingLocation.length} פריטים)`,
          related_entity_id: newOrder.id,
          link_url: `/OrderDetails?id=${newOrder.id}`,
          dedupe_key: `baking_order:${newOrder.id}`,
          priority: 'medium'
        });
      } catch (notifError) {
        console.error('Error creating baking notification:', notifError);
      }
      
      toast.success(`משימת האפייה נוצרה בהצלחה! מספר משימה: ${nextOrderNumber}`, {
        duration: 4000,
        position: "top-center"
      });
      navigate(createPageUrl("Bakers"));

    } catch (error) {
      console.error("Error saving order:", error);
      toast.error("שגיאה ביצירת משימת האפייה. אנא נסה שוב.", {
        duration: 4000,
        position: "top-center"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = () => {
    navigate(createPageUrl("Bakers"));
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
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 flex items-center gap-3">
                <ChefHat className="w-8 h-8 text-orange-600" />
                הזמנה ידנית לאופות
              </h1>
              <p className="text-gray-600 mt-1 text-lg">הזן משימת אפייה חדשה - מספר המשימה יווצר אוטומטית</p>
            </div>
          </div>
        </div>

        <BakingOrderForm
          extractedData={{
            supplier: "משימת אפייה פנימית"
          }}
          onSave={handleSaveOrder}
          onCancel={handleCancel}
          isProcessing={isProcessing}
        />
      </div>
    </div>
  );
}
