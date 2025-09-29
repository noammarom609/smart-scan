import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { processOverduePickups } from "@/api/functions";
import { toast } from "sonner";
import { Clock, CheckCircle2, AlertTriangle } from "lucide-react";

export default function TestPickupProcessorPage() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastResult, setLastResult] = useState(null);

  const handleManualProcess = async () => {
    setIsProcessing(true);
    const toastId = toast.loading("בודק איסופים שפספסו...");
    
    try {
      const result = await processOverduePickups({});
      console.log('Manual process result:', result);
      setLastResult(result.data);
      
      if (result.data?.updatedCount > 0) {
        toast.success(`נמצאו ועודכנו ${result.data.updatedCount} איסופים שפספסו!`, { 
          id: toastId,
          duration: 5000 
        });
      } else {
        toast.info("לא נמצאו איסופים שצריכים עדכון", { 
          id: toastId,
          duration: 3000 
        });
      }
    } catch (error) {
      console.error('Error in manual process:', error);
      toast.error("שגיאה בבדיקת איסופים", { id: toastId });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">בדיקת אוטומציה לאיסופים</h1>
          <p className="text-gray-600">בדוק ועבד איסופים שפספסו את המועד שלהם</p>
        </div>

        <Card className="border-none elegant-shadow-lg bg-white/90 backdrop-blur-sm mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Clock className="w-6 h-6 text-blue-600" />
              בדיקה ידנית
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-gray-600">
                לחץ על הכפתור כדי לבדוק ולעבד איסופים שפספסו את המועד (60+ דקות אחרי הזמן המתוכנן)
              </p>
              <Button
                onClick={handleManualProcess}
                disabled={isProcessing}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isProcessing ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                ) : (
                  <Clock className="w-4 h-4 mr-2" />
                )}
                בדוק איסופים עכשיו
              </Button>
            </div>
          </CardContent>
        </Card>

        {lastResult && (
          <Card className="border-none elegant-shadow-lg bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                {lastResult.updatedCount > 0 ? (
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                ) : (
                  <AlertTriangle className="w-6 h-6 text-orange-600" />
                )}
                תוצאות הבדיקה האחרונה
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">סה"כ נבדקו</p>
                    <p className="text-2xl font-bold text-gray-900">{lastResult.totalChecked}</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">עודכנו</p>
                    <p className="text-2xl font-bold text-green-600">{lastResult.updatedCount}</p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">זמן עיבוד</p>
                    <p className="text-sm font-medium text-blue-600">{lastResult.processedAt}</p>
                  </div>
                </div>

                {lastResult.updatedOrders && lastResult.updatedOrders.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-semibold text-gray-900 mb-3">הזמנות שעודכנו:</h4>
                    <div className="space-y-2">
                      {lastResult.updatedOrders.map((order, index) => (
                        <div key={index} className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">הזמנה #{order.order_number}</p>
                              <p className="text-sm text-gray-600">{order.customer_name}</p>
                            </div>
                            <div className="text-right">
                              <Badge variant="outline" className="mb-1">
                                {order.original_date} {order.original_time} → {order.new_date} {order.new_time}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-800">
                    <strong>הודעה:</strong> {lastResult.message}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}