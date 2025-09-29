import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ChefHat, Clock, CheckCircle, AlertTriangle, Calendar, Package, TrendingUp, Timer } from "lucide-react";
import { format, parseISO, isToday, isTomorrow, differenceInDays } from "date-fns";
import { he } from "date-fns/locale";

export default function BakingAnalytics({ bakingOrdersByDate, searchTerm }) {
  const analytics = useMemo(() => {
    const allOrders = Object.values(bakingOrdersByDate).flat();
    
    // סטטיסטיקות כלליות
    const totalOrders = allOrders.length;
    const completedOrders = allOrders.filter(order => order.picking_status === 'הושלם').length;
    const inProgressOrders = allOrders.filter(order => order.picking_status === 'בתהליך').length;
    const waitingOrders = allOrders.filter(order => order.picking_status === 'לא_התחיל').length;
    
    // *** סטטיסטיקות פריטים משודרגות עם baked_quantity ***
    const allItems = allOrders.flatMap(order => order.items || []);
    const totalItems = allItems.length;
    
    // חישוב פריטים מושלמים על בסיס baked_quantity
    const completedItems = allItems.filter(item => {
      const bakedQty = item.baked_quantity || 0;
      const totalQty = item.quantity || 1;
      return bakedQty >= totalQty;
    }).length;
    
    // חישוב פריטים בתהליך על בסיס baked_quantity
    const inProgressItems = allItems.filter(item => {
      const bakedQty = item.baked_quantity || 0;
      const totalQty = item.quantity || 1;
      return bakedQty > 0 && bakedQty < totalQty;
    }).length;
    
    // חישוב פריטים ממתינים על בסיס baked_quantity
    const waitingItems = allItems.filter(item => {
      const bakedQty = item.baked_quantity || 0;
      return bakedQty === 0;
    }).length;
    
    // *** חישוב אחוז השלמה מדויק יותר על בסיס כמויות בפועל ***
    const totalBakedQuantity = allItems.reduce((sum, item) => sum + (item.baked_quantity || 0), 0);
    const totalRequiredQuantity = allItems.reduce((sum, item) => sum + (item.quantity || 1), 0);
    const completionPercentage = totalRequiredQuantity > 0 ? Math.round((totalBakedQuantity / totalRequiredQuantity) * 100) : 0;
    
    // ניתוח תאריכים קריטיים
    const today = new Date();
    const todayOrders = allOrders.filter(order => {
      const targetDate = order.shipment_due_date || order.pickup_preferred_date;
      return targetDate && isToday(parseISO(targetDate));
    });
    
    const tomorrowOrders = allOrders.filter(order => {
      const targetDate = order.shipment_due_date || order.pickup_preferred_date;
      return targetDate && isTomorrow(parseISO(targetDate));
    });
    
    const overdueOrders = allOrders.filter(order => {
      const targetDate = order.shipment_due_date || order.pickup_preferred_date;
      if (!targetDate) return false;
      return differenceInDays(parseISO(targetDate), today) < 0 && order.picking_status !== 'הושלם';
    });
    
    // הזמנות איסוף עצמי דחופות
    const urgentPickups = allOrders.filter(order => {
      if (order.shipping_method_chosen !== 'איסוף_עצמי') return false;
      const targetDate = order.pickup_preferred_date;
      if (!targetDate) return false;
      const daysDiff = differenceInDays(parseISO(targetDate), today);
      return daysDiff <= 1 && order.picking_status !== 'הושלם';
    });
    
    return {
      totalOrders,
      completedOrders,
      inProgressOrders,
      waitingOrders,
      totalItems,
      completedItems,
      inProgressItems,
      waitingItems,
      completionPercentage,
      todayOrders: todayOrders.length,
      tomorrowOrders: tomorrowOrders.length,
      overdueOrders: overdueOrders.length,
      urgentPickups: urgentPickups.length,
      // *** נתונים חדשים לתצוגה משודרגת ***
      totalBakedQuantity,
      totalRequiredQuantity,
      averageProgressPerOrder: totalOrders > 0 ? Math.round((totalBakedQuantity / totalRequiredQuantity) * 100) : 0
    };
  }, [bakingOrdersByDate]);

  if (analytics.totalOrders === 0) {
    return (
      <Card className="border-none elegant-shadow-lg bg-white/90 backdrop-blur-sm mb-8">
        <CardContent className="p-6 text-center">
          <ChefHat className="w-12 h-12 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500">
            {searchTerm ? `אין נתונים אנליטיים עבור החיפוש "${searchTerm}"` : 'אין הזמנות אפייה להצגת נתונים אנליטיים'}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="mb-8 space-y-6">
      {/* כותרת אנליטיקה */}
      <div className="flex items-center gap-3">
        <TrendingUp className="w-6 h-6 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-900">סקירה אנליטית - מבוסס כמויות מדויקות</h2>
        {searchTerm && (
          <Badge variant="outline" className="text-blue-600 border-blue-300">
            מסונן עבור: "{searchTerm}"
          </Badge>
        )}
      </div>

      {/* התראות קריטיות */}
      {(analytics.overdueOrders > 0 || analytics.urgentPickups > 0) && (
        <Card className="border-red-200 bg-red-50/80 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <h3 className="font-semibold text-red-800">התראות דחופות</h3>
            </div>
            <div className="flex flex-wrap gap-4">
              {analytics.overdueOrders > 0 && (
                <Badge className="bg-red-600 text-white">
                  {analytics.overdueOrders} הזמנות באיחור
                </Badge>
              )}
              {analytics.urgentPickups > 0 && (
                <Badge className="bg-orange-600 text-white">
                  {analytics.urgentPickups} איסופים דחופים
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* כרטיסי סטטיסטיקות משודרגים */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* סטטוס הזמנות */}
        <Card className="border-none elegant-shadow-lg bg-white/90 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg text-blue-800">
              <Package className="w-5 h-5" />
              הזמנות אפייה
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-3xl font-bold text-gray-900">{analytics.totalOrders}</div>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-green-600">הושלמו:</span>
                <span className="font-medium">{analytics.completedOrders}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-blue-600">בתהליך:</span>
                <span className="font-medium">{analytics.inProgressOrders}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-yellow-600">ממתינות:</span>
                <span className="font-medium">{analytics.waitingOrders}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* התקדמות אפייה מדויקת */}
        <Card className="border-none elegant-shadow-lg bg-white/90 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg text-orange-800">
              <ChefHat className="w-5 h-5" />
              התקדמות אפייה מדויקת
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-2xl font-bold text-gray-900">{analytics.completionPercentage}%</span>
              <CheckCircle className={`w-6 h-6 ${analytics.completionPercentage === 100 ? 'text-green-600' : 'text-gray-400'}`} />
            </div>
            <Progress value={analytics.completionPercentage} className="h-2" />
            <div className="text-sm text-gray-600">
              {analytics.totalBakedQuantity} מתוך {analytics.totalRequiredQuantity} יחידות הוכנו
            </div>
          </CardContent>
        </Card>

        {/* לוחות זמנים */}
        <Card className="border-none elegant-shadow-lg bg-white/90 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg text-purple-800">
              <Calendar className="w-5 h-5" />
              לוחות זמנים
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-green-600">היום:</span>
              <Badge className={analytics.todayOrders > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}>
                {analytics.todayOrders}
              </Badge>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-blue-600">מחר:</span>
              <Badge className={analytics.tomorrowOrders > 0 ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'}>
                {analytics.tomorrowOrders}
              </Badge>
            </div>
            {analytics.overdueOrders > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-red-600">באיחור:</span>
                <Badge className="bg-red-100 text-red-800">
                  {analytics.overdueOrders}
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>

        {/* פירוט פריטים מתקדם */}
        <Card className="border-none elegant-shadow-lg bg-white/90 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg text-gray-800">
              <Timer className="w-5 h-5" />
              פריטי אפייה
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-2xl font-bold text-gray-900">{analytics.totalItems}</div>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-green-600">מושלמים:</span>
                <span className="font-medium">{analytics.completedItems}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-blue-600">בתהליך:</span>
                <span className="font-medium">{analytics.inProgressItems}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-yellow-600">ממתינים:</span>
                <span className="font-medium">{analytics.waitingItems}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* אינפו נוסף על הנתונים המדויקים */}
      <Card className="border-none elegant-shadow-lg bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-blue-800">
            <CheckCircle className="w-5 h-5" />
            <h3 className="font-semibold">מעקב מדויק:</h3>
            <span className="text-sm">
              הנתונים מבוססים על כמויות בפועל שדווחו על ידי האופים, ומאפשרים מעקב מדויק אחר ההתקדמות.
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}