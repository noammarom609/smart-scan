
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  FileText,
  Users,
  UserCog,
  ShieldCheck,
  ListChecks,
  Search,
  Code2,
  Database,
  Bell,
  FileSpreadsheet,
  FileDown,
  Printer,
  Workflow,
  Info,
  Clock // Added Clock icon
} from "lucide-react";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import { createPageUrl } from "@/utils";

export default function DocumentationPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedRole, setSelectedRole] = useState("admin");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 250);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  // Current date for traceability footer
  const lastUpdated = new Date().toISOString();
  const israelTime = format(new Date(), "dd/MM/yyyy HH:mm", {
    locale: he,
    timeZone: "Asia/Jerusalem"
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6 lg:p-8" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 no-print">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">מדריך ותיעוד</h1>
              <p className="text-gray-600 text-lg">תיעוד מקיף ומדריכי שימוש לכל בעלי התפקידים במערכת</p>
            </div>
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 mb-8 no-print">
            <TabsTrigger value="overview">סקירה כללית</TabsTrigger>
            <TabsTrigger value="role-guides">מדריכי תפקידים</TabsTrigger>
            <TabsTrigger value="admin-dashboard">תצוגת מנהל</TabsTrigger>
            <TabsTrigger value="technical">מידע טכני</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            {/* @generated:doc-overview BEGIN */}
            <div id="doc-overview" className="space-y-8">
              <Card className="border-none shadow-lg bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Info className="w-6 h-6 text-blue-600" />
                    סקירת המערכת
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-700 text-lg">
                    מערכת סורק הזמנות היא פלטפורמה מקיפה לניהול הזמנות ותכנון ייצור, המיועדת לעסקים במגזר המזון.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        תכנון ייצור ואפייה
                      </h4>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li>• טווחי תאריכים לתכנון</li>
                        <li>• מדדי KPI ואנליטיקה</li>
                        <li>• טבלת תכנון מתקדמת</li>
                        <li>• עדכון כמויות אפייה (`baked_quantity`)</li>
                        <li>• ייצוא נתונים</li>
                      </ul>
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                        <ListChecks className="w-4 h-4" />
                        ליקוטים ואריזה
                      </h4>
                      <ul className="text-sm text-green-800 space-y-1">
                        <li>• הערות לאופה</li>
                        <li>• פירוק לשקיות ומיקומים</li>
                        <li>• מעקב סטטוס ליקוט</li>
                        <li>• סינכרון עם הזמנות אפייה</li>
                      </ul>
                    </div>

                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-purple-900 mb-2 flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        משלוחים ואיסופים
                      </h4>
                      <ul className="text-sm text-purple-800 space-y-1">
                        <li>• ניהול סטטוסי משלוח</li>
                        <li>• פילוח לפי חברות שילוח</li>
                        <li>• רשימת משלוחים ציבורית לשליחים</li>
                        <li>• מעקב איסופים עצמיים</li>
                      </ul>
                    </div>

                    <div className="bg-orange-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-orange-900 mb-2 flex items-center gap-2">
                        <Workflow className="w-4 h-4" />
                        אוטומציות וסינכרונים
                      </h4>
                      <ul className="text-sm text-orange-800 space-y-1">
                        <li>• סינכרון תאריכים והערות</li>
                        <li>• עיבוד אוטומטי של איחורים</li>
                        <li>• בדיקות מיילים יומיות</li>
                        <li>• מנגנוני התראות</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            {/* @generated:doc-overview END */}

            {/* @generated:doc-roles BEGIN */}
            <div id="doc-roles" className="space-y-8">
              <Card className="border-none shadow-lg bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Users className="w-6 h-6 text-green-600" />
                    תפקידים והרשאות
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-right p-3 font-semibold">תפקיד</th>
                          <th className="text-right p-3 font-semibold">קריאה</th>
                          <th className="text-right p-3 font-semibold">כתיבה</th>
                          <th className="text-right p-3 font-semibold">ביצוע</th>
                          <th className="text-right p-3 font-semibold">אישור</th>
                          <th className="text-right p-3 font-semibold">דפים עיקריים</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        <tr>
                          <td className="p-3 font-medium text-blue-900">מנהל מערכת</td>
                          <td className="p-3">כל הנתונים</td>
                          <td className="p-3">כל הנתונים</td>
                          <td className="p-3">כל הפעולות</td>
                          <td className="p-3">משתמשים</td>
                          <td className="p-3 text-xs">כל הדפים</td>
                        </tr>
                        <tr>
                          <td className="p-3 font-medium text-green-900">מנהל חנות</td>
                          <td className="p-3">כל הנתונים</td>
                          <td className="p-3">הזמנות, מלאי</td>
                          <td className="p-3">ליקוט, אפייה</td>
                          <td className="p-3">לא</td>
                          <td className="p-3 text-xs">רוב הדפים (פרט לניהול משתמשים)</td>
                        </tr>
                        <tr>
                          <td className="p-3 font-medium text-purple-900">אופה</td>
                          <td className="p-3">הזמנות אפייה</td>
                          <td className="p-3">כמויות אפייה</td>
                          <td className="p-3">סימון הושלם</td>
                          <td className="p-3">לא</td>
                          <td className="p-3 text-xs">Bakers, BakersManualOrder, BakersArchive</td>
                        </tr>
                        <tr>
                          <td className="p-3 font-medium text-orange-900">מלקט</td>
                          <td className="p-3">הזמנות ליקוט</td>
                          <td className="p-3">סטטוס ליקוט</td>
                          <td className="p-3">ליקוט והכנה</td>
                          <td className="p-3">לא</td>
                          <td className="p-3 text-xs">Picking, Shipments, Inventory</td>
                        </tr>
                        <tr>
                          <td className="p-3 font-medium text-indigo-900">מלקט ואופה</td>
                          <td className="p-3">הזמנות ליקוט ואפייה</td>
                          <td className="p-3">ליקוט ואפייה</td>
                          <td className="p-3">ליקוט ואפייה</td>
                          <td className="p-3">לא</td>
                          <td className="p-3 text-xs">Bakers + Picking + Shipments</td>
                        </tr>
                        <tr>
                          <td className="p-3 font-medium text-red-900">שליח</td>
                          <td className="p-3">משלוחים מוקצים</td>
                          <td className="p-3">סטטוס מסירה</td>
                          <td className="p-3">דיווח מסירה</td>
                          <td className="p-3">לא</td>
                          <td className="p-3 text-xs">CourierDashboard</td>
                        </tr>
                        <tr>
                          <td className="p-3 font-medium text-gray-600">ממתין לאישור</td>
                          <td className="p-3">אין</td>
                          <td className="p-3">אין</td>
                          <td className="p-3">אין</td>
                          <td className="p-3">אין</td>
                          <td className="p-3 text-xs">PendingApproval</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
            {/* @generated:doc-roles END */}

            {/* @generated:doc-features BEGIN */}
            <div id="doc-features" className="space-y-8">
              <Card className="border-none shadow-lg bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <ListChecks className="w-6 h-6 text-purple-600" />
                    תכונות המערכת
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      ליקוטים ואריזה
                    </h4>
                    <ul className="text-gray-700 space-y-1 mr-6">
                      <li>• ניהול רשימת פריטים לליקוט עם מיקומים</li>
                      <li>• הערות מיוחדות לאופה לכל פריט</li>
                      <li>• פירוק אוטומטי לשקיות לפי מיקום (10 פריטים לשקית, קרטון=1)</li>
                      <li>• סינכרון דו-כיווני עם הזמנות אפייה</li>
                      <li>• מעקב סטטוס ליקוט: לא התחיל / בתהליך / הושלם</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Database className="w-4 h-4" />
                      אפייה ותכנון ייצור
                    </h4>
                    <ul className="text-gray-700 space-y-1 mr-6">
                      <li>• טבלת תכנון ייצור עם טווחי תאריכים</li>
                      <li>• מדדי KPI: סה"כ פריטים, הושלמו, באחוזים</li>
                      <li>• עדכון כמויות אפייה בפועל (`Order.items.baked_quantity`)</li>
                      <li>• קונטרול כמות אינטראקטיבי עם סטטוס חזותי</li>
                      <li>• ייצוא נתונים לאקסל/מדאון</li>
                      <li>• אנליטיקה מתקדמת עם גרפים</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      משלוחים ואיסופים
                    </h4>
                    <ul className="text-gray-700 space-y-1 mr-6">
                      <li>• ניהול סטטוסי משלוח: ממתין / נשלח / נמסר / בעיה</li>
                      <li>• פילוח לפי חברות שילוח: ציטה, דוד, עצמאי</li>
                      <li>• רשימת משלוחים ציבורית לשליחים (`PublicShipmentList`)</li>
                      <li>• ניהול איסופים עצמיים עם תאריכים ושעות מועדפות</li>
                      <li>• עיבוד אוטומטי של איחורים</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <FileDown className="w-4 h-4" />
                      ייצוא ודוחות
                    </h4>
                    <ul className="text-gray-700 space-y-1 mr-6">
                      <li>• ייצוא טבלאות לפורמט Markdown</li>
                      <li>• הדפסה מותאמת עם Print CSS</li>
                      <li>• אנליטיקה עם גרפי מגמות</li>
                      <li>• סיכומי תכנון ייצור</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
            {/* @generated:doc-features END */}

            {/* @generated:doc-automations BEGIN */}
            <div id="doc-automations" className="space-y-8">
              <Card className="border-none shadow-lg bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Workflow className="w-6 h-6 text-orange-600" />
                    אוטומציות
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-right p-3 font-semibold">פונקציה</th>
                          <th className="text-right p-3 font-semibold">טריגר/תזמון</th>
                          <th className="text-right p-3 font-semibold">קלט</th>
                          <th className="text-right p-3 font-semibold">השפעות</th>
                          <th className="text-right p-3 font-semibold">הערות</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        <tr>
                          <td className="p-3 font-mono text-xs bg-blue-50">processOverdueDelivery</td>
                          <td className="p-3">יומי ~20:00</td>
                          <td className="p-3">משלוחים עם תאריך עבר</td>
                          <td className="p-3">העברה ליום הבא</td>
                          <td className="p-3 text-xs">אידמפוטנטי, לוג localStorage</td>
                        </tr>
                        <tr>
                          <td className="p-3 font-mono text-xs bg-green-50">processOverduePickups</td>
                          <td className="p-3">יומי ~22:00</td>
                          <td className="p-3">איסופים עם תאריך עבר</td>
                          <td className="p-3">העברה ליום הבא</td>
                          <td className="p-3 text-xs">אידמפוטנטי, לוג localStorage</td>
                        </tr>
                        <tr>
                          <td className="p-3 font-mono text-xs bg-purple-50">triggerDailyEmailCheckIfMissed</td>
                          <td className="p-3">כניסה למערכת</td>
                          <td className="p-3">תאריך בדיקה אחרון</td>
                          <td className="p-3">בדיקת מיילים חדשים</td>
                          <td className="p-3 text-xs">פעם ביום, עם toast הודעות</td>
                        </tr>
                        <tr>
                          <td className="p-3 font-mono text-xs bg-orange-50">checkEmails</td>
                          <td className="p-3">ידני או מתוזמן</td>
                          <td className="p-3">Gmail API</td>
                          <td className="p-3">יצירת הזמנות חדשות</td>
                          <td className="p-3 text-xs">מניעת כפילויות</td>
                        </tr>
                        <tr>
                          <td className="p-3 font-mono text-xs bg-red-50">syncOrderData</td>
                          <td className="p-3">עדכוני UI</td>
                          <td className="p-3">הזמנות ראשית ואפייה</td>
                          <td className="p-3">סינכרון תאריכים והערות</td>
                          <td className="p-3 text-xs">דו-כיווני בזמן אמת</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
            {/* @generated:doc-automations END */}

            {/* @generated:doc-technical BEGIN */}
            <div id="doc-technical" className="space-y-8">
              <Card className="border-none shadow-lg bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Code2 className="w-6 h-6 text-red-600" />
                    מידע טכני
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Entities ושדות עיקריים</h4>
                    <div className="bg-gray-50 p-4 rounded-lg font-mono text-sm">
                      <div className="space-y-2">
                        <div><strong>Order</strong> → items[].baked_quantity, location_bag_summary</div>
                        <div><strong>InventoryItem</strong> → product_name, current_stock, status</div>
                        <div><strong>Invoice</strong> → vendor, invoiceNumber, total, items[]</div>
                        <div><strong>User</strong> → custom_role, approved_by, department</div>
                        <div><strong>Notification</strong> → recipient_role, type, message</div>
                        <div><strong>AppSetting</strong> → key, value (למעקב מצב מערכת)</div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Data Flow</h4>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="text-sm space-y-2">
                        <div><strong>UI → Server:</strong> עדכוני `baked_quantity` דרך `updateOrder()`</div>
                        <div><strong>Server → DB:</strong> שמירה אוטומטית ב-Order.items[]</div>
                        <div><strong>Export:</strong> UI → Client-side processing → Markdown/Print</div>
                        <div><strong>Sync:</strong> `syncOrderData()` מסנכרן בין הזמנה ראשית לאפייה</div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">קומפוננטות מרכזיות</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-green-50 p-3 rounded">
                        <div className="font-mono text-sm font-semibold">BakingOrderCard</div>
                        <div className="text-xs text-green-800">דף Bakers - הצגת הזמנות אפייה</div>
                      </div>
                      <div className="bg-purple-50 p-3 rounded">
                        <div className="font-mono text-sm font-semibold">BakingAnalytics</div>
                        <div className="text-xs text-purple-800">דף Bakers - גרפים ו-KPI</div>
                      </div>
                      <div className="bg-orange-50 p-3 rounded">
                        <div className="font-mono text-sm font-semibold">ItemPickingList</div>
                        <div className="text-xs text-orange-800">דף Picking - ניהול ליקוט</div>
                      </div>
                      <div className="bg-blue-50 p-3 rounded">
                        <div className="font-mono text-sm font-semibold">OrderContext</div>
                        <div className="text-xs text-blue-800">ניהול state גלובלי</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            {/* @generated:doc-technical END */}

            {/* @generated:doc-troubleshooting BEGIN */}
            <div id="doc-troubleshooting" className="space-y-8">
              <Card className="border-none shadow-lg bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <ShieldCheck className="w-6 h-6 text-yellow-600" />
                    פתרון בעיות
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="border border-red-200 bg-red-50 p-4 rounded-lg">
                      <h5 className="font-semibold text-red-900 mb-2">🚨 הזמנות כפולות ממיילים</h5>
                      <div className="text-sm text-red-800 space-y-1">
                        <div><strong>סיבה:</strong> messageId כפול או בדיקה כפולה של אותו מייל</div>
                        <div><strong>פתרון:</strong> בדוק דף Invoices → חפש לפי מספר הזמנה → מחק כפילויות</div>
                      </div>
                    </div>

                    <div className="border border-orange-200 bg-orange-50 p-4 rounded-lg">
                      <h5 className="font-semibold text-orange-900 mb-2">⚠️ אי-התאמות בכמויות אפייה</h5>
                      <div className="text-sm text-orange-800 space-y-1">
                        <div><strong>סיבה:</strong> עדכון חלקי של `baked_quantity` או חוסר סינכרון</div>
                        <div><strong>פתרון:</strong> דף Bakers → עדכן כמויות ידנית → שמור → בדוק דף OrderDetails</div>
                      </div>
                    </div>

                    <div className="border border-blue-200 bg-blue-50 p-4 rounded-lg">
                      <h5 className="font-semibold text-blue-900 mb-2">🔒 משתמש לא רואה דפים</h5>
                      <div className="text-sm text-blue-800 space-y-1">
                        <div><strong>סיבה:</strong> custom_role לא מוגדר או pending</div>
                        <div><strong>פתרון:</strong> דף UserManagement → בחר משתמש → עדכן תפקיד → שמור</div>
                      </div>
                    </div>

                    <div className="border border-purple-200 bg-purple-50 p-4 rounded-lg">
                      <h5 className="font-semibold text-purple-900 mb-2">📄 ייצוא נכשל</h5>
                      <div className="text-sm text-purple-800 space-y-1">
                        <div><strong>סיבה:</strong> נתונים ריקים או שגיאת client-side</div>
                        <div><strong>פתרון:</strong> רענן הדף → בדוק שיש נתונים בטבלה → נסה שוב</div>
                      </div>
                    </div>

                    <div className="border border-green-200 bg-green-50 p-4 rounded-lg">
                      <h5 className="font-semibold text-green-900 mb-2">🔄 אוטומציות לא רצות</h5>
                      <div className="text-sm text-green-800 space-y-1">
                        <div><strong>סיבה:</strong> localStorage לא מעודכן או שעה לא נכונה</div>
                        <div><strong>פתרון:</strong> דף Settings → נקה מטמון → התחבר מחדש אחרי השעות הרלוונטיות</div>
                      </div>
                    </div>

                    <div className="border border-indigo-200 bg-indigo-50 p-4 rounded-lg">
                      <h5 className="font-semibold text-indigo-900 mb-2">📧 מיילים לא נקראים</h5>
                      <div className="text-sm text-indigo-800 space-y-1">
                        <div><strong>סיבה:</strong> Gmail API credentials או שגיאת OAuth</div>
                        <div><strong>פתרון:</strong> דף EmailTester → בדוק חיבור → עדכן credentials בהגדרות</div>
                      </div>
                    </div>

                    <div className="border border-gray-200 bg-gray-50 p-4 rounded-lg">
                      <h5 className="font-semibold text-gray-900 mb-2">💾 נתונים לא נשמרים</h5>
                      <div className="text-sm text-gray-800 space-y-1">
                        <div><strong>סיבה:</strong> שגיאת רשת או validation של Entity</div>
                        <div><strong>פתרון:</strong> בדוק console בדפדפן → ודא שדות חובה מלאים → נסה שוב</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            {/* @generated:doc-troubleshooting END */}

            {/* @generated:doc-changelog BEGIN */}
            <div id="doc-changelog" className="space-y-8">
              <Card className="border-none shadow-lg bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Database className="w-6 h-6 text-indigo-600" />
                    Change Log ומעקב שינויים
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">קישורים למעקב פיתוח</h4>
                    <div className="space-y-2">
                      <div>
                        <a
                          href={createPageUrl("DevelopmentConsole")}
                          className="text-blue-600 hover:text-blue-800 underline font-medium"
                        >
                          דף מעקב פיתוח טכני
                        </a>
                        <span className="text-sm text-blue-700 mr-2">- לצפייה בסטטוס קומפוננטות ופונקציות</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-900 mb-3">עדכונים אחרונים</h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-start gap-3">
                        <Badge className="bg-green-600 text-white text-xs">NEW</Badge>
                        <div>
                          <div className="font-medium">תכנון ייצור מתקדם</div>
                          <div className="text-green-800">הוספת עדכון כמויות אפייה, אנליטיקה וייצוא</div>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Badge className="bg-blue-600 text-white text-xs">UPD</Badge>
                        <div>
                          <div className="font-medium">סינכרונים דו-כיווניים</div>
                          <div className="text-green-800">שיפור סינכרון תאריכים והערות בין הזמנות</div>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Badge className="bg-orange-600 text-white text-xs">FIX</Badge>
                        <div>
                          <div className="font-medium">חברת שילוח אופציונלית</div>
                          <div className="text-green-800">אפשרות לסיים ליקוט ללא בחירת חברת שילוח</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-yellow-900 mb-2">📊 מעקב נתונים</h4>
                    <div className="text-sm text-yellow-800">
                      <p>כל שינוי במערכת נרשם אוטומטית עם חותמת זמן ומזהה משתמש.</p>
                      <p>לפרטים מלאים עיין ב<strong>דף מעקב פיתוח</strong>.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            {/* @generated:doc-changelog END */}
          </TabsContent>

          {/* Role Guides Tab */}
          <TabsContent value="role-guides">
            {/* @generated:guide-index BEGIN */}
            <div id="guide-index" className="space-y-8">
              <Card className="border-none shadow-lg bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <UserCog className="w-6 h-6 text-green-600" />
                    מדריך שימוש לפי בעלי תפקידים
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Search - Enhanced with debounce */}
                  <div className="mb-6 no-print">
                    <div className="relative">
                      <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="חיפוש במדריכים..."
                        value={searchTerm}
                        onChange={(e) => {
                          const value = e.target.value;
                          setSearchTerm(value); // Update immediately for UI feedback
                        }}
                        className="pr-10"
                        aria-label="חיפוש במדריכי התפקידים"
                      />
                    </div>
                  </div>

                  {/* Role Switcher - Enhanced accessibility */}
                  <div className="mb-6 no-print">
                    <Select
                      value={selectedRole}
                      onValueChange={setSelectedRole}
                      aria-label="בחירת תפקיד למדריך"
                    >
                      <SelectTrigger className="w-64" aria-controls="role-content">
                        <SelectValue placeholder="בחר תפקיד" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">מנהל מערכת</SelectItem>
                        <SelectItem value="store_manager">מנהל חנות</SelectItem>
                        <SelectItem value="baker">אופה</SelectItem>
                        <SelectItem value="picker">מלקט</SelectItem>
                        <SelectItem value="picker_baker">מלקט ואופה</SelectItem>
                        <SelectItem value="courier">שליח</SelectItem>
                        <SelectItem value="pending">ממתין לאישור</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Export Actions - Enhanced with loading states */}
                  <div className="flex gap-2 mb-6 no-print">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const content = document.getElementById(`guide-${selectedRole}`);
                        if (content) {
                          // Basic conversion to markdown, might need more advanced parsing for rich content
                          let markdown = `# מדריך ${selectedRole}\n\n`;
                          const headings = content.querySelectorAll('h4');
                          headings.forEach(h => {
                            markdown += `## ${h.textContent}\n\n`;
                            let nextSibling = h.nextElementSibling;
                            while (nextSibling && nextSibling.tagName !== 'H4') {
                              if (nextSibling.tagName === 'DIV' && nextSibling.classList.contains('bg-gray-50')) {
                                markdown += nextSibling.innerText + '\n\n';
                              } else if (nextSibling.tagName === 'UL') {
                                nextSibling.querySelectorAll('li').forEach(li => {
                                  markdown += `- ${li.textContent}\n`;
                                });
                                markdown += '\n';
                              } else if (nextSibling.tagName === 'P') {
                                markdown += nextSibling.textContent + '\n\n';
                              }
                              nextSibling = nextSibling.nextElementSibling;
                            }
                          });

                          const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `guide-${selectedRole}.md`;
                          document.body.appendChild(a); // Required for Firefox
                          a.click();
                          document.body.removeChild(a); // Clean up
                          URL.revokeObjectURL(url);
                        } else {
                          alert("לא ניתן למצוא תוכן לייצוא עבור התפקיד הנבחר.");
                        }
                      }}
                      aria-label={`ייצוא מדריך ${selectedRole} כקובץ Markdown`}
                    >
                      <FileDown className="w-4 h-4 mr-2" />
                      ייצוא מדריך תפקיד זה (MD)
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.print()}
                      aria-label="הדפסת המדריך הנוכחי"
                    >
                      <Printer className="w-4 h-4 mr-2" />
                      הדפס
                    </Button>
                  </div>

                  {/* TOC - Enhanced with keyboard navigation */}
                  <div className="bg-gray-50 p-4 rounded-lg mb-6 no-print">
                    <h4 className="font-semibold mb-3">תוכן עניינים</h4>
                    <nav role="navigation" aria-label="תוכן עניינים למדריך התפקיד">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <a
                          href={`#guide-${selectedRole}--goals`}
                          className="text-blue-600 hover:text-blue-800 focus:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-1"
                          tabIndex="0"
                        >
                          1. מטרות ו-KPIs
                        </a>
                        <a
                          href={`#guide-${selectedRole}--journey`}
                          className="text-blue-600 hover:text-blue-800 focus:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-1"
                          tabIndex="0"
                        >
                          2. יום בחיי
                        </a>
                        <a
                          href={`#guide-${selectedRole}--views`}
                          className="text-blue-600 hover:text-blue-800 focus:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-1"
                          tabIndex="0"
                        >
                          3. מסכים עיקריים
                        </a>
                        <a
                          href={`#guide-${selectedRole}--flows`}
                          className="text-blue-600 hover:text-blue-800 focus:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-1"
                          tabIndex="0"
                        >
                          4. זרימות ליבה
                        </a>
                        <a
                          href={`#guide-${selectedRole}--edge-cases`}
                          className="text-blue-600 hover:text-blue-800 focus:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-1"
                          tabIndex="0"
                        >
                          5. מצבים חריגים
                        </a>
                        <a
                          href={`#guide-${selectedRole}--permissions`}
                          className="text-blue-600 hover:text-blue-800 focus:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-1"
                          tabIndex="0"
                        >
                          6. הרשאות
                        </a>
                        <a
                          href={`#guide-${selectedRole}--local-qa`}
                          className="text-blue-600 hover:text-blue-800 focus:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-1"
                          tabIndex="0"
                        >
                          7. בדיקות איכות
                        </a>
                        <a
                          href={`#guide-${selectedRole}--shortcuts`}
                          className="text-blue-600 hover:text-blue-800 focus:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-1"
                          tabIndex="0"
                        >
                          8. קיצורי דרך
                        </a>
                        <a
                          href={`#guide-${selectedRole}--troubleshooting`}
                          className="text-blue-600 hover:text-blue-800 focus:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-1"
                          tabIndex="0"
                        >
                          9. פתרון בעיות
                        </a>
                        <a
                          href={`#guide-${selectedRole}--glossary`}
                          className="text-blue-600 hover:text-blue-800 focus:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-1"
                          tabIndex="0"
                        >
                          10. מילון מונחים
                        </a>
                      </div>
                    </nav>
                  </div>

                  {/* Quick Actions per Role - Enhanced accessibility */}
                  <div className="bg-gray-50 p-4 rounded-lg mb-6 no-print">
                    <h4 className="font-semibold mb-3">מעבר מהיר לפעולות</h4>
                    <nav role="navigation" aria-label="פעולות מהירות לתפקיד הנבחר">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {selectedRole === 'admin' && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              asChild
                              className="focus:ring-2 focus:ring-blue-500"
                            >
                              <a href={createPageUrl("Home")} tabIndex="0">דף הבית</a>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              asChild
                              className="focus:ring-2 focus:ring-blue-500"
                            >
                              <a href={createPageUrl("UserManagement")} tabIndex="0">ניהול משתמשים</a>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              asChild
                              className="focus:ring-2 focus:ring-blue-500"
                            >
                              <a href={createPageUrl("Analytics")} tabIndex="0">ניתוח נתונים</a>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              asChild
                              className="focus:ring-2 focus:ring-blue-500"
                            >
                              <a href={createPageUrl("AdminNotifications")} tabIndex="0">התראות מנהל</a>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              asChild
                              className="focus:ring-2 focus:ring-blue-500"
                            >
                              <a href={createPageUrl("DevelopmentConsole")} tabIndex="0">קונסול פיתוח</a>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              asChild
                              className="focus:ring-2 focus:ring-blue-500"
                            >
                              <a href={createPageUrl("Settings")} tabIndex="0">הגדרות מערכת</a>
                            </Button>
                          </>
                        )}
                        {selectedRole === 'store_manager' && (
                          <>
                            <Button variant="outline" size="sm" asChild className="focus:ring-2 focus:ring-green-500">
                              <a href={createPageUrl("Home")} tabIndex="0">דף הבית</a>
                            </Button>
                            <Button variant="outline" size="sm" asChild className="focus:ring-2 focus:ring-green-500">
                              <a href={createPageUrl("Picking")} tabIndex="0">ניהול ליקוטים</a>
                            </Button>
                            <Button variant="outline" size="sm" asChild className="focus:ring-2 focus:ring-green-500">
                              <a href={createPageUrl("Bakers")} tabIndex="0">ניהול אפייה</a>
                            </Button>
                            <Button variant="outline" size="sm" asChild className="focus:ring-2 focus:ring-green-500">
                              <a href={createPageUrl("Shipments")} tabIndex="0">ניהול משלוחים</a>
                            </Button>
                            <Button variant="outline" size="sm" asChild className="focus:ring-2 focus:ring-green-500">
                              <a href={createPageUrl("Inventory")} tabIndex="0">ניהול מלאי</a>
                            </Button>
                            <Button variant="outline" size="sm" asChild className="focus:ring-2 focus:ring-green-500">
                              <a href={createPageUrl("Analytics")} tabIndex="0">דוחות וניתוח</a>
                            </Button>
                          </>
                        )}
                        {selectedRole === 'baker' && (
                          <>
                            <Button variant="outline" size="sm" asChild className="focus:ring-2 focus:ring-orange-500">
                              <a href={createPageUrl("Bakers")} tabIndex="0">הזמנות אפייה</a>
                            </Button>
                            <Button variant="outline" size="sm" asChild className="focus:ring-2 focus:ring-orange-500">
                              <a href={createPageUrl("BakersManualOrder")} tabIndex="0">הזמנה ידנית</a>
                            </Button>
                            <Button variant="outline" size="sm" asChild className="focus:ring-2 focus:ring-orange-500">
                              <a href={createPageUrl("BakersArchive")} tabIndex="0">ארכיון הזמנות</a>
                            </Button>
                          </>
                        )}
                        {selectedRole === 'picker' && (
                          <>
                            <Button variant="outline" size="sm" asChild className="focus:ring-2 focus:ring-blue-500">
                              <a href={createPageUrl("Picking")} tabIndex="0">ליקוטים</a>
                            </Button>
                            <Button variant="outline" size="sm" asChild className="focus:ring-2 focus:ring-blue-500">
                              <a href={createPageUrl("Shipments")} tabIndex="0">משלוחים</a>
                            </Button>
                            <Button variant="outline" size="sm" asChild className="focus:ring-2 focus:ring-blue-500">
                              <a href={createPageUrl("Inventory")} tabIndex="0">מלאי</a>
                            </Button>
                          </>
                        )}
                        {selectedRole === 'picker_baker' && (
                          <>
                            <Button variant="outline" size="sm" asChild className="focus:ring-2 focus:ring-indigo-500">
                              <a href={createPageUrl("Bakers")} tabIndex="0">הזמנות אפייה</a>
                            </Button>
                            <Button variant="outline" size="sm" asChild className="focus:ring-2 focus:ring-indigo-500">
                              <a href={createPageUrl("Picking")} tabIndex="0">ליקוטים</a>
                            </Button>
                            <Button variant="outline" size="sm" asChild className="focus:ring-2 focus:ring-indigo-500">
                              <a href={createPageUrl("Shipments")} tabIndex="0">משלוחים</a>
                            </Button>
                            <Button variant="outline" size="sm" asChild className="focus:ring-2 focus:ring-indigo-500">
                              <a href={createPageUrl("Inventory")} tabIndex="0">מלאי</a>
                            </Button>
                            <Button variant="outline" size="sm" asChild className="focus:ring-2 focus:ring-indigo-500">
                              <a href={createPageUrl("BakersManualOrder")} tabIndex="0">הזמנה ידנית לאפייה</a>
                            </Button>
                          </>
                        )}
                        {selectedRole === 'courier' && (
                          <>
                            <Button variant="outline" size="sm" asChild className="focus:ring-2 focus:ring-purple-500">
                              <a href={createPageUrl("CourierDashboard")} tabIndex="0">לוח מחוונים שליחים</a>
                            </Button>
                            <Button variant="outline" size="sm" asChild className="focus:ring-2 focus:ring-purple-500">
                              <a href={createPageUrl("PublicShipmentList")} tabIndex="0">רשימת משלוחים ציבורית</a>
                            </Button>
                          </>
                        )}
                        {selectedRole === 'pending' && (
                          <div className="col-span-full text-center py-2 text-gray-700">
                            אין פעולות זמינות לפני אישור התפקיד.
                          </div>
                        )}
                        {!selectedRole && (
                          <div className="col-span-full text-center py-4 text-gray-500">
                            בחר תפקיד כדי לראות פעולות זמינות
                          </div>
                        )}
                      </div>
                    </nav>
                  </div>
                </CardContent>
              </Card>
            </div>
            {/* @generated:guide-index END */}

            {/* Admin Guide */}
            {selectedRole === 'admin' && (
              /* @generated:guide-admin BEGIN */
              <div id="guide-admin" className="space-y-8">
                <Card className="border-none shadow-lg bg-white/90 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <ShieldCheck className="w-6 h-6 text-blue-600" />
                      מדריך למנהל מערכת
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    {/* Goals */}
                    <div id="guide-admin--goals">
                      <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Info className="w-5 h-5 text-blue-600" />
                        מטרות ו-KPIs
                      </h4>
                      <div className="bg-blue-50 p-4 rounded-lg space-y-3">
                        <div><strong>מטרות עיקריות:</strong></div>
                        <ul className="space-y-2 mr-4">
                          <li>• פיקוח על כל תהליכי המערכת וביצועיה</li>
                          <li>• ניהול משתמשים והרשאות</li>
                          <li>• מעקב אחר KPIs: זמני תגובה, שיעור שגיאות, נפח הזמנות</li>
                          <li>• הבטחת רציפות תפעולית ואוטומציות</li>
                        </ul>
                        <div className="mt-3">
                          <strong>דשבורד KPI:</strong> <a href={createPageUrl("Analytics")} className="text-blue-600 underline">דף ניתוח נתונים</a>
                        </div>
                      </div>
                    </div>

                    {/* Journey */}
                    <div id="guide-admin--journey">
                      <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Users className="w-5 h-5 text-green-600" />
                        יום בחיי מנהל מערכת
                      </h4>
                      <div className="space-y-3 text-sm">
                        <div className="border-r-4 border-blue-500 pr-4">
                          <strong>בוקר (8:00-10:00):</strong> בדיקת התראות במרכז ההתראות, סקירת דוח לילה, אישור משתמשים חדשים
                        </div>
                        <div className="border-r-4 border-green-500 pr-4">
                          <strong>צהריים (10:00-14:00):</strong> מעקב אחר תהליכי ליקוט ואפייה, פתרון בעיות דחופות
                        </div>
                        <div className="border-r-4 border-orange-500 pr-4">
                          <strong>אחר הצהריים (14:00-18:00):</strong> ניהול משלוחים, עדכון הגדרות מערכת, סקירת דוחות
                        </div>
                        <div className="border-r-4 border-purple-500 pr-4">
                          <strong>Hand-offs:</strong> קבלת עדכונים מ<a href="#guide-store_manager" className="text-purple-600 underline">מנהל החנות</a>,
                          תיאום עם <a href="#guide-baker" className="text-purple-600 underline">אופים</a> ו<a href="#guide-picker" className="text-purple-600 underline">מלקטים</a>
                        </div>
                      </div>
                    </div>

                    {/* Views */}
                    <div id="guide-admin--views">
                      <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Database className="w-5 h-5 text-purple-600" />
                        מסכים ומודולים עיקריים
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-3 rounded">
                          <div className="font-mono text-sm font-semibold">Home</div>
                          <div className="text-xs text-gray-600">דשבורד ראשי עם כרטיסי KPI</div>
                        </div>
                        <div className="bg-gray-50 p-3 rounded">
                          <div className="font-mono text-sm font-semibold">UserManagement</div>
                          <div className="text-xs text-gray-600">ניהול משתמשים ותפקידים</div>
                        </div>
                        <div className="bg-gray-50 p-3 rounded">
                          <div className="font-mono text-sm font-semibold">AdminNotifications</div>
                          <div className="text-xs text-gray-600">מרכז התראות</div>
                        </div>
                        <div className="bg-gray-50 p-3 rounded">
                          <div className="font-mono text-sm font-semibold">DevelopmentConsole</div>
                          <div className="text-xs text-gray-600">מעקב טכני ופיתוח</div>
                        </div>
                        <div className="bg-gray-50 p-3 rounded">
                          <div className="font-mono text-sm font-semibold">Analytics</div>
                          <div className="text-xs text-gray-600">דוחות ואנליטיקה</div>
                        </div>
                        <div className="bg-gray-50 p-3 rounded">
                          <div className="font-mono text-sm font-semibold">Settings</div>
                          <div className="text-xs text-gray-600">הגדרות מערכת</div>
                        </div>
                      </div>
                    </div>

                    {/* Flows */}
                    <div id="guide-admin--flows">
                      <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Workflow className="w-5 h-5 text-orange-600" />
                        זרימות ליבה (Happy Paths)
                      </h4>
                      <div className="space-y-4">
                        <div className="bg-green-50 p-4 rounded-lg">
                          <div className="font-semibold text-green-900 mb-2">1. אישור משתמש חדש</div>
                          <div className="text-sm text-green-800 space-y-1">
                            <div>UserManagement → רשימת משתמשים → בחירת משתמש pending → עדכון custom_role → שמירה</div>
                            <div><strong>תוצאה:</strong> המשתמש מקבל גישה מתאימה למערכת</div>
                          </div>
                        </div>
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <div className="font-semibold text-blue-900 mb-2">2. פתרון בעיה בליקוט</div>
                          <div className="text-sm text-blue-800 space-y-1">
                            <div>AdminNotifications → זיהוי התראה → Picking → מציאת הזמנה → עזרה למלקט</div>
                            <div><strong>תוצאה:</strong> הליקוט ממשיך בצורה תקינה</div>
                          </div>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-lg">
                          <div className="font-semibold text-purple-900 mb-2">3. ניטור ביצועי מערכת</div>
                          <div className="text-sm text-purple-800 space-y-1">
                            <div>Analytics → סקירת מדדים → זיהוי מגמות → DevelopmentConsole → בדיקת סטטוס</div>
                            <div><strong>תוצאה:</strong> זיהוי מוקדם של בעיות פוטנציאליות</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Edge Cases */}
                    <div id="guide-admin--edge-cases">
                      <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Bell className="w-5 h-5 text-red-600" />
                        מצבים חריגים והתאוששות
                      </h4>
                      <div className="space-y-3">
                        <div className="border border-red-200 bg-red-50 p-3 rounded">
                          <strong>Empty Data:</strong> אם אין נתונים בדשבורד → בדיקת חיבור DB בהגדרות
                        </div>
                        <div className="border border-orange-200 bg-orange-50 p-3 rounded">
                          <strong>Permission Denied:</strong> מעולם לא אמור לקרות למנהל מערכת → בדיקת תפקיד בפרופיל
                        </div>
                        <div className="border border-yellow-200 bg-yellow-50 p-3 rounded">
                          <strong>System Error:</strong> שגיאות בקונסול → DevelopmentConsole → בדיקת לוגים
                        </div>
                      </div>
                    </div>

                    {/* Permissions */}
                    <div id="guide-admin--permissions">
                      <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-indigo-600" />
                        הרשאות וגדרות
                      </h4>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <tbody className="space-y-1">
                            <tr><td className="font-semibold pr-4">Read:</td><td>כל הנתונים במערכת</td></tr>
                            <tr><td className="font-semibold pr-4">Write:</td><td>כל הנתונים והגדרות</td></tr>
                            <tr><td className="font-semibold pr-4">Execute:</td><td>כל הפעולות והאוטומציות</td></tr>
                            <tr><td className="font-semibold pr-4">Approve:</td><td>אישור משתמשים והגדרות קריטיות</td></tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Local QA */}
                    <div id="guide-admin--local-qa">
                      <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <ListChecks className="w-5 h-5 text-green-600" />
                        בדיקות איכות יומיות
                      </h4>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <div className="space-y-2 text-sm">
                          <div>✅ בדיקת מרכז התראות - אין התראות קריטיות</div>
                          <div>✅ ביקורת משתמשים pending - אין המתנות ארוכות</div>
                          <div>✅ סקירת KPIs יומיים - מגמות תקינות</div>
                          <div>✅ בדיקת תהליכים אוטומטיים - רצים בזמן</div>
                          <div>✅ ביקורת גיבויים ולוגים</div>
                        </div>
                      </div>
                    </div>

                    {/* Shortcuts */}
                    <div id="guide-admin--shortcuts">
                      <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Search className="w-5 h-5 text-blue-600" />
                        קיצורי דרך ויעילות
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div><strong>החיפוש הגלובלי</strong> - זמין בכל דף לחיפוש מהיר של הזמנות</div>
                        <div><strong>התראות</strong> - פעמון בפינה העליונה לעדכונים בזמן אמת</div>
                        <div><strong>פילטרים שמורים</strong> - בדפי ניתוח ודוחות</div>
                      </div>
                    </div>

                    {/* Troubleshooting */}
                    <div id="guide-admin--troubleshooting">
                      <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-red-600" />
                        פתרון בעיות ושאלות נפוצות
                      </h4>
                      <div className="space-y-3 text-sm">
                        <div className="border-r-4 border-red-500 pr-3">
                          <strong>בעיה:</strong> מערכת איטית<br />
                          <strong>פתרון:</strong> Analytics → בדיקת עומס → DevelopmentConsole → סטטוס שרתים
                        </div>
                        <div className="border-r-4 border-orange-500 pr-3">
                          <strong>בעיה:</strong> משתמש לא יכול להתחבר<br />
                          <strong>פתרון:</strong> UserManagement → בדיקת סטטוס → עדכון הרשאות
                        </div>
                        <div className="border-r-4 border-yellow-500 pr-3">
                          <strong>בעיה:</strong> אוטומציות לא עובדות<br />
                          <strong>פתרון:</strong> Settings → בדיקת תזמון → הפעלה ידנית
                        </div>
                      </div>
                    </div>

                    {/* Glossary */}
                    <div id="guide-admin--glossary">
                      <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Database className="w-5 h-5 text-indigo-600" />
                        מילון מונחים חיוניים
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div><strong>custom_role:</strong> תפקיד מותאם במערכת</div>
                        <div><strong>picking_status:</strong> סטטוס תהליך הליקוט</div>
                        <div><strong>baked_quantity:</strong> כמות שנאפתה בפועל</div>
                        <div><strong>Order Context:</strong> ניהול state הזמנות</div>
                        <div><strong>RBAC:</strong> ניהול הרשאות מבוסס תפקיד</div>
                        <div><strong>SSOT:</strong> Single Source of Truth</div>
                        <div><strong>AppSetting:</strong> הגדרות מערכת</div>
                        <div><strong>Notification:</strong> התראות מערכת</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              /* @generated:guide-admin END */
            )}

            {/* Store Manager Guide */}
            {selectedRole === 'store_manager' && (
              /* @generated:guide-store_manager BEGIN */
              <div id="guide-store_manager" className="space-y-8">
                <Card className="border-none shadow-lg bg-white/90 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <Users className="w-6 h-6 text-green-600" />
                      מדריך למנהל חנות
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    {/* Goals */}
                    <div id="guide-store_manager--goals">
                      <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Info className="w-5 h-5 text-green-600" />
                        מטרות ו-KPIs
                      </h4>
                      <div className="bg-green-50 p-4 rounded-lg space-y-3">
                        <div><strong>מטרות עיקריות:</strong></div>
                        <ul className="space-y-2 mr-4">
                          <li>• ניהול תפעול יומי של החנות</li>
                          <li>• פיקוח על תהליכי ליקוט ואפייה</li>
                          <li>• מעקב אחר KPIs: זמני מחזור, דיוק ליקוט, שביעות רצון לקוחות</li>
                          <li>• תיאום בין צוותים</li>
                        </ul>
                        <div className="mt-3">
                          <strong>דשבורד KPI:</strong> <a href={createPageUrl("Analytics")} className="text-green-600 underline">דף ניתוח נתונים</a>
                        </div>
                      </div>
                    </div>

                    {/* Journey */}
                    <div id="guide-store_manager--journey">
                      <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Users className="w-5 h-5 text-blue-600" />
                        יום בחיי מנהל חנות
                      </h4>
                      <div className="space-y-3 text-sm">
                        <div className="border-r-4 border-blue-500 pr-4">
                          <strong>בוקר (7:00-9:00):</strong> סקירת הזמנות היום, תדריך צוות, בדיקת מלאי
                        </div>
                        <div className="border-r-4 border-green-500 pr-4">
                          <strong>צהריים (9:00-13:00):</strong> מעקב ליקוטים, תיאום עם אופים, פתרון בעיות
                        </div>
                        <div className="border-r-4 border-orange-500 pr-4">
                          <strong>אחר הצהריים (13:00-17:00):</strong> ניהול משלוחים, סקירת ביצועים יומיים
                        </div>
                        <div className="border-r-4 border-purple-500 pr-4">
                          <strong>Hand-offs:</strong> דיווח ל<a href="#guide-admin" className="text-purple-600 underline">מנהל המערכת</a>,
                          קבלת עדכונים מ<a href="#guide-picker" className="text-purple-600 underline">מלקטים</a> ו<a href="#guide-baker" className="text-purple-600 underline">אופים</a>
                        </div>
                      </div>
                    </div>

                    {/* Views */}
                    <div id="guide-store_manager--views">
                      <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Database className="w-5 h-5 text-purple-600" />
                        מסכים ומודולים עיקריים
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-3 rounded">
                          <div className="font-mono text-sm font-semibold">Home</div>
                          <div className="text-xs text-gray-600">סקירה כללית ודשבורד</div>
                        </div>
                        <div className="bg-gray-50 p-3 rounded">
                          <div className="font-mono text-sm font-semibold">Picking</div>
                          <div className="text-xs text-gray-600">ניהול ליקוטים</div>
                        </div>
                        <div className="bg-gray-50 p-3 rounded">
                          <div className="font-mono text-sm font-semibold">Bakers</div>
                          <div className="text-xs text-gray-600">ניהול אפייה</div>
                        </div>
                        <div className="bg-gray-50 p-3 rounded">
                          <div className="font-mono text-sm font-semibold">Shipments</div>
                          <div className="text-xs text-gray-600">ניהול משלוחים</div>
                        </div>
                        <div className="bg-gray-50 p-3 rounded">
                          <div className="font-mono text-sm font-semibold">Inventory</div>
                          <div className="text-xs text-gray-600">ניהול מלאי</div>
                        </div>
                        <div className="bg-gray-50 p-3 rounded">
                          <div className="font-mono text-sm font-semibold">Analytics</div>
                          <div className="text-xs text-gray-600">דוחות וניתוח</div>
                        </div>
                      </div>
                    </div>

                    {/* Flows */}
                    <div id="guide-store_manager--flows">
                      <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Workflow className="w-5 h-5 text-orange-600" />
                        זרימות ליבה
                      </h4>
                      <div className="space-y-4">
                        <div className="bg-green-50 p-4 rounded-lg">
                          <div className="font-semibold text-green-900 mb-2">1. ניהול ליקוט יומי</div>
                          <div className="text-sm text-green-800">
                            Picking → בדיקת הזמנות לא התחילו → הקצאה למלקטים → מעקב התקדמות
                          </div>
                        </div>
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <div className="font-semibold text-blue-900 mb-2">2. תיאום עם אפייה</div>
                          <div className="text-sm text-blue-800">
                            Bakers → בדיקת הזמנות אפייה → תיאום עם אופים → עדכון baked_quantity
                          </div>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-lg">
                          <div className="font-semibold text-purple-900 mb-2">3. ניהול משלוחים</div>
                          <div className="text-sm text-purple-800">
                            Shipments → פילוח לחברות שילוח → תיאום עם שליחים → מעקב מסירות
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Edge Cases */}
                    <div id="guide-store_manager--edge-cases">
                      <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Bell className="w-5 h-5 text-red-600" />
                        מצבים חריגים
                      </h4>
                      <div className="space-y-3">
                        <div className="border border-red-200 bg-red-50 p-3 rounded">
                          <strong>חוסר במלאי:</strong> Inventory → בדיקת מלאי → הזמנה מספקים
                        </div>
                        <div className="border border-orange-200 bg-orange-50 p-3 rounded">
                          <strong>עיכוב בליקוט:</strong> זיהוי בעיה → הקצאה מחדש → סיוע למלקט
                        </div>
                        <div className="border border-yellow-200 bg-yellow-50 p-3 rounded">
                          <strong>בעיה במשלוח:</strong> Shipments → יצירת קשר עם חברת שילוח → עדכון לקוח
                        </div>
                      </div>
                    </div>

                    {/* הרשאות */}
                    <div id="guide-store_manager--permissions">
                      <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-indigo-600" />
                        הרשאות וגדרות
                      </h4>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <tbody className="space-y-1">
                            <tr><td className="font-semibold pr-4">Read:</td><td>כל נתוני תפעול (פרט למשתמשים)</td></tr>
                            <tr><td className="font-semibold pr-4">Write:</td><td>הזמנות, מלאי, ליקוט, אפייה</td></tr>
                            <tr><td className="font-semibold pr-4">Execute:</td><td>תהליכי ליקוט ואפייה</td></tr>
                            <tr><td className="font-semibold pr-4">Approve:</td><td>אין הרשאות אישור</td></tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Local QA */}
                    <div id="guide-store_manager--local-qa">
                      <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <ListChecks className="w-5 h-5 text-green-600" />
                        בדיקות איכות יומיות
                      </h4>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <div className="space-y-2 text-sm">
                          <div>✅ כל ההזמנות היומיות בליקוט או מוכנות</div>
                          <div>✅ אין הזמנות אפייה באיחור</div>
                          <div>✅ כל המשלוחים מוקצים לשליחים</div>
                          <div>✅ מלאי במצב תקין לליקוט מחר</div>
                        </div>
                      </div>
                    </div>

                    {/* Shortcuts */}
                    <div id="guide-store_manager--shortcuts">
                      <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Search className="w-5 h-5 text-blue-600" />
                        קיצורי דרך
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div><strong>מעבר מהיר בין דפים</strong> - תפריט צדדי עם חיווי מצב</div>
                        <div><strong>פילטרים מהירים</strong> - לפי סטטוס, תאריך, מלקט</div>
                        <div><strong>רענון אוטומטי</strong> - נתונים מתעדכנים כל דקה</div>
                      </div>
                    </div>

                    {/* Troubleshooting */}
                    <div id="guide-store_manager--troubleshooting">
                      <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-red-600" />
                        פתרון בעיות
                      </h4>
                      <div className="space-y-3 text-sm">
                        <div className="border-r-4 border-red-500 pr-3">
                          <strong>בעיה:</strong> מלקט לא מוצא פריט<br />
                          <strong>פתרון:</strong> Inventory → חיפוש מוצר → בדיקת מיקום → עדכון
                        </div>
                        <div className="border-r-4 border-orange-500 pr-3">
                          <strong>בעיה:</strong> הזמנת אפייה באיחור<br />
                          <strong>פתרון:</strong> Bakers → הקצאה מחדש → תיאום עם אופה
                        </div>
                        <div className="border-r-4 border-yellow-500 pr-3">
                          <strong>בעיה:</strong> שליח לא הגיע<br />
                          <strong>פתרון:</strong> CourierControl → בדיקת סטטוס → חיפוש שליח חלופי
                        </div>
                      </div>
                    </div>

                    {/* Glossary */}
                    <div id="guide-store_manager--glossary">
                      <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Database className="w-5 h-5 text-indigo-600" />
                        מילון מונחים
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div><strong>handled_by:</strong> מי מטפל בהזמנה</div>
                        <div><strong>location_breakdown:</strong> פירוק לשקיות</div>
                        <div><strong>courier_company:</strong> חברת שילוח</div>
                        <div><strong>shipment_due_date:</strong> יעד למשלוח</div>
                        <div><strong>current_stock:</strong> מלאי נוכחי</div>
                        <div><strong>order_type:</strong> סוג הזמנה</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              /* @generated:guide-store_manager END */
            )}

            {/* Baker Guide */}
            {selectedRole === 'baker' && (
              /* @generated:guide-baker BEGIN */
              <div id="guide-baker" className="space-y-8">
                <Card className="border-none shadow-lg bg-white/90 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <Database className="w-6 h-6 text-orange-600" />
                      מדריך לאופה
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    {/* Goals */}
                    <div id="guide-baker--goals">
                      <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Info className="w-5 h-5 text-orange-600" />
                        מטרות ו-KPIs
                      </h4>
                      <div className="bg-orange-50 p-4 rounded-lg space-y-3">
                        <div><strong>מטרות עיקריות:</strong></div>
                        <ul className="space-y-2 mr-4">
                          <li>• ביצוע הזמנות אפייה בזמן ובאיכות</li>
                          <li>• עדכון כמויות אפייה בפועל</li>
                          <li>• תיאום עם מלקטים וניהול</li>
                          <li>• שמירה על תכנון ייצור</li>
                        </ul>
                        <div className="mt-3">
                          <strong>KPIs:</strong> זמן אפייה, דיוק כמויות, איכות מוצר
                        </div>
                      </div>
                    </div>

                    {/* Journey */}
                    <div id="guide-baker--journey">
                      <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Users className="w-5 h-5 text-green-600" />
                        יום בחיי אופה
                      </h4>
                      <div className="space-y-3 text-sm">
                        <div className="border-r-4 border-blue-500 pr-4">
                          <strong>בוקר (6:00-8:00):</strong> בדיקת הזמנות אפייה להיום, הכנת חומרי גלם
                        </div>
                        <div className="border-r-4 border-green-500 pr-4">
                          <strong>צהריים (8:00-14:00):</strong> תהליך האפייה, עדכון כמויות במערכת
                        </div>
                        <div className="border-r-4 border-orange-500 pr-4">
                          <strong>אחר הצהריים (14:00-16:00):</strong> סיום הזמנות, ניקיון והכנה למחר
                        </div>
                        <div className="border-r-4 border-purple-500 pr-4">
                          <strong>Hand-offs:</strong> קבלת הזמנות מ<a href="#guide-picker" className="text-purple-600 underline">מלקטים</a>,
                          דיווח ל<a href="#guide-store_manager" className="text-purple-600 underline">מנהל החנות</a>
                        </div>
                      </div>
                    </div>

                    {/* Views */}
                    <div id="guide-baker--views">
                      <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Database className="w-5 h-5 text-purple-600" />
                        מסכים ומודולים עיקריים
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-3 rounded">
                          <div className="font-mono text-sm font-semibold">Bakers</div>
                          <div className="text-xs text-gray-600">דף ראשי - הזמנות אפייה</div>
                        </div>
                        <div className="bg-gray-50 p-3 rounded">
                          <div className="font-mono text-sm font-semibold">BakersManualOrder</div>
                          <div className="text-xs text-gray-600">יצירת הזמנה ידנית</div>
                        </div>
                        <div className="bg-gray-50 p-3 rounded">
                          <div className="font-mono text-sm font-semibold">BakersArchive</div>
                          <div className="text-xs text-gray-600">ארכיון הזמנות</div>
                        </div>
                        <div className="bg-gray-50 p-3 rounded">
                          <div className="font-mono text-sm font-semibold">BakingOrderCard</div>
                          <div className="text-xs text-gray-600">כרטיס הזמנה</div>
                        </div>
                      </div>
                    </div>

                    {/* Flows */}
                    <div id="guide-baker--flows">
                      <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Workflow className="w-5 h-5 text-orange-600" />
                        זרימות ליבה
                      </h4>
                      <div className="space-y-4">
                        <div className="bg-green-50 p-4 rounded-lg">
                          <div className="font-semibold text-green-900 mb-2">1. ביצוע הזמנת אפייה</div>
                          <div className="text-sm text-green-800">
                            Bakers → בחירת הזמנה → בדיקת הערות לאופה → אפייה → עדכון baked_quantity
                          </div>
                        </div>
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <div className="font-semibold text-blue-900 mb-2">2. עדכון כמויות</div>
                          <div className="text-sm text-blue-800">
                            BakingQuantityControl → עדכון כמות אמיתית → סימון הושלם → שמירה
                          </div>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-lg">
                          <div className="font-semibold text-purple-900 mb-2">3. יצירת הזמנה ידנית</div>
                          <div className="text-sm text-purple-800">
                            BakersManualOrder → מילוי פרטים → הוספת פריטים → שמירה ואפייה
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Edge Cases */}
                    <div id="guide-baker--edge-cases">
                      <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Bell className="w-5 h-5 text-red-600" />
                        מצבים חריגים
                      </h4>
                      <div className="space-y-3">
                        <div className="border border-red-200 bg-red-50 p-3 rounded">
                          <strong>חוסר בחומר גלם:</strong> יצירת קשר עם מנהל → עדכון כמות חלקית → הערה
                        </div>
                        <div className="border border-orange-200 bg-orange-50 p-3 rounded">
                          <strong>בעיה טכנית בתנור:</strong> דחיית הזמנה → הודעה למנהל → תיאום חלופי
                        </div>
                        <div className="border border-yellow-200 bg-yellow-50 p-3 rounded">
                          <strong>הערות מיוחדות:</strong> קריאת notes_for_baker → התייעצות במידת הצורך
                        </div>
                      </div>
                    </div>

                    {/* Permissions */}
                    <div id="guide-baker--permissions">
                      <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-indigo-600" />
                        הרשאות וגדרות
                      </h4>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <tbody className="space-y-1">
                            <tr><td className="font-semibold pr-4">Read:</td><td>הזמנות אפייה בלבד</td></tr>
                            <tr><td className="font-semibold pr-4">Write:</td><td>baked_quantity, baking_status</td></tr>
                            <tr><td className="font-semibold pr-4">Execute:</td><td>סימון הושלם</td></tr>
                            <tr><td className="font-semibold pr-4">Approve:</td><td>אין</td></tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Local QA */}
                    <div id="guide-baker--local-qa">
                      <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <ListChecks className="w-5 h-5 text-green-600" />
                        בדיקות איכות
                      </h4>
                      <div className="bg-orange-50 p-4 rounded-lg">
                        <div className="space-y-2 text-sm">
                          <div>✅ כל ההזמנות היומיות הושלמו</div>
                          <div>✅ כמויות עודכנו במערכת</div>
                          <div>✅ איכות מוצרים בסטנדרט</div>
                          <div>✅ מקום עבודה נקי ומוכן למחר</div>
                        </div>
                      </div>
                    </div>

                    {/* Shortcuts */}
                    <div id="guide-baker--shortcuts">
                      <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Search className="w-5 h-5 text-blue-600" />
                        קיצורי דרך
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div><strong>עדכון מהיר:</strong> לחיצה על כמות לעריכה מיידית</div>
                        <div><strong>פילטר לפי תאריך:</strong> הצגת הזמנות ליום מסוים</div>
                        <div><strong>הערות:</strong> תצוגה מורחבת של הערות מיוחדות</div>
                      </div>
                    </div>

                    {/* Troubleshooting */}
                    <div id="guide-baker--troubleshooting">
                      <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-red-600" />
                        פתרון בעיות
                      </h4>
                      <div className="space-y-3 text-sm">
                        <div className="border-r-4 border-red-500 pr-3">
                          <strong>בעיה:</strong> לא רואה הזמנות חדשות<br />
                          <strong>פתרון:</strong> רענון הדף → בדיקת פילטרים → פנייה למנהל
                        </div>
                        <div className="border-r-4 border-orange-500 pr-3">
                          <strong>בעיה:</strong> לא ניתן לעדכן כמות<br />
                          <strong>פתרון:</strong> בדיקת הרשאות → רענון הדף → ניסיון חוזר
                        </div>
                        <div className="border-r-4 border-yellow-500 pr-3">
                          <strong>בעיה:</strong> הערות לא ברורות<br />
                          <strong>פתרון:</strong> יצירת קשר עם מלקט או מנהל לבירור
                        </div>
                      </div>
                    </div>

                    {/* Glossary */}
                    <div id="guide-baker--glossary">
                      <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Database className="w-5 h-5 text-indigo-600" />
                        מילון מונחים
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div><strong>baked_quantity:</strong> כמות שנאפתה בפועל</div>
                        <div><strong>baking_status:</strong> סטטוס אפייה</div>
                        <div><strong>notes_for_baker:</strong> הערות מיוחדות</div>
                        <div><strong>original_order_id:</strong> מזהה הזמנה מקורית</div>
                        <div><strong>order_type:</strong> הזמנה לאופות</div>
                        <div><strong>BakingOrderCard:</strong> כרטיס הזמנה</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              /* @generated:guide-baker END */
            )}

            {/* Picker Guide */}
            {selectedRole === 'picker' && (
              /* @generated:guide-picker BEGIN */
              <div id="guide-picker" className="space-y-8">
                <Card className="border-none shadow-lg bg-white/90 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <ListChecks className="w-6 h-6 text-blue-600" />
                      מדריך למלקט
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    {/* Goals */}
                    <div id="guide-picker--goals">
                      <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Info className="w-5 h-5 text-blue-600" />
                        מטרות ו-KPIs
                      </h4>
                      <div className="bg-blue-50 p-4 rounded-lg space-y-3">
                        <div><strong>מטרות עיקריות:</strong></div>
                        <ul className="space-y-2 mr-4">
                          <li>• ליקוט מדויק ומהיר של הזמנות</li>
                          <li>• סימון נכון של מיקומים ושקיות</li>
                          <li>• תיאום עם אפייה ומשלוחים</li>
                          <li>• שמירה על איכות ורעננות מוצרים</li>
                        </ul>
                        <div className="mt-3">
                          <strong>KPIs:</strong> זמן ליקוט, דיוק מיקומים, שיעור שגיאות
                        </div>
                      </div>
                    </div>

                    {/* Journey */}
                    <div id="guide-picker--journey">
                      <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Users className="w-5 h-5 text-green-600" />
                        יום בחיי מלקט
                      </h4>
                      <div className="space-y-3 text-sm">
                        <div className="border-r-4 border-blue-500 pr-4">
                          <strong>בוקר (7:00-9:00):</strong> בדיקת הזמנות יום, תכנון מסלול ליקוט
                        </div>
                        <div className="border-r-4 border-green-500 pr-4">
                          <strong>צהריים (9:00-15:00):</strong> ליקוט פעיל, עדכון סטטוסים, אריזה לשקיות
                        </div>
                        <div className="border-r-4 border-orange-500 pr-4">
                          <strong>אחר הצהריים (15:00-17:00):</strong> סיום הזמנות, העברה למשלוחים
                        </div>
                        <div className="border-r-4 border-purple-500 pr-4">
                          <strong>Hand-offs:</strong> העברת הזמנות אפייה ל<a href="#guide-baker" className="text-purple-600 underline">אופים</a>,
                          דיווח ל<a href="#guide-store_manager" className="text-purple-600 underline">מנהל החנות</a>
                        </div>
                      </div>
                    </div>

                    {/* Views */}
                    <div id="guide-picker--views">
                      <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Database className="w-5 h-5 text-purple-600" />
                        מסכים ומודולים עיקריים
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-3 rounded">
                          <div className="font-mono text-sm font-semibold">Picking</div>
                          <div className="text-xs text-gray-600">דף ראשי - ליקוטים</div>
                        </div>
                        <div className="bg-gray-50 p-3 rounded">
                          <div className="font-mono text-sm font-semibold">ScanOrder</div>
                          <div className="text-xs text-gray-600">הזמנה ידנית</div>
                        </div>
                        <div className="bg-gray-50 p-3 rounded">
                          <div className="font-mono text-sm font-semibold">Shipments</div>
                          <div className="text-xs text-gray-600">משלוחים</div>
                        </div>
                        <div className="bg-gray-50 p-3 rounded">
                          <div className="font-mono text-sm font-semibold">Inventory</div>
                          <div className="text-xs text-gray-600">ניהול מלאי</div>
                        </div>
                        <div className="bg-gray-50 p-3 rounded">
                          <div className="font-mono text-sm font-semibold">ItemPickingList</div>
                          <div className="text-xs text-gray-600">רשימת פריטים</div>
                        </div>
                        <div className="bg-gray-50 p-3 rounded">
                          <div className="font-mono text-sm font-semibold">BakersManualOrder</div>
                          <div className="text-xs text-gray-600">הזמנה ידנית לאופות</div>
                        </div>
                      </div>
                    </div>

                    {/* Flows */}
                    <div id="guide-picker--flows">
                      <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Workflow className="w-5 h-5 text-orange-600" />
                        זרימות ליבה
                      </h4>
                      <div className="space-y-4">
                        <div className="bg-green-50 p-4 rounded-lg">
                          <div className="font-semibold text-green-900 mb-2">1. ליקוט הזמנה רגילה</div>
                          <div className="text-sm text-green-800">
                            Picking → בחירת הזמנה → ליקוט פריטים → סימון מיקומים → פירוק לשקיות → סיום
                          </div>
                        </div>
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <div className="font-semibold text-blue-900 mb-2">2. טיפול בפריט לאפייה</div>
                          <div className="text-sm text-blue-800">
                            זיהוי פריט טרי → הוספת הערות לאופה → סימון "נשלח לאפייה" → העברה לטיפול האופה
                          </div>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-lg">
                          <div className="font-semibold text-purple-900 mb-2">3. טיפול בחסר במלאי</div>
                          <div className="text-sm text-purple-800">
                            זיהוי חסר → סימון "אין במלאי" → הוספת מוצר חלופי → עדכון Inventory
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Edge Cases */}
                    <div id="guide-picker--edge-cases">
                      <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Bell className="w-5 h-5 text-red-600" />
                        מצבים חריגים
                      </h4>
                      <div className="space-y-3">
                        <div className="border border-red-200 bg-red-50 p-3 rounded">
                          <strong>מוצר פגום:</strong> סימון "אין במלאי" → חיפוש חלופה → הודעה למנהל מלאי
                        </div>
                        <div className="border border-orange-200 bg-orange-50 p-3 rounded">
                          <strong>מיקום לא נמצא:</strong> בדיקה ב-Inventory → שאילת עמיתים → עדכון מיקום
                        </div>
                        <div className="border border-yellow-200 bg-yellow-50 p-3 rounded">
                          <strong>כמות לא מתאימה:</strong> ספירה מחדש → עדכון במערכת → הוספת הערה
                        </div>
                      </div>
                    </div>

                    {/* Permissions */}
                    <div id="guide-picker--permissions">
                      <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-indigo-600" />
                        הרשאות וגדרות
                      </h4>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <tbody className="space-y-1">
                            <tr><td className="font-semibold pr-4">Read:</td><td>הזמנות ליקוט, מלאי</td></tr>
                            <tr><td className="font-semibold pr-4">Write:</td><td>picking_status, location, notes_for_baker</td></tr>
                            <tr><td className="font-semibold pr-4">Execute:</td><td>סיום ליקוט</td></tr>
                            <tr><td className="font-semibold pr-4">Approve:</td><td>אין</td></tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Local QA */}
                    <div id="guide-picker--local-qa">
                      <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <ListChecks className="w-5 h-5 text-green-600" />
                        בדיקות איכות
                      </h4>
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="space-y-2 text-sm">
                          <div>✅ כל הפריטים נלקטו או סומנו כחסרים</div>
                          <div>✅ מיקומים מדויקים לכל פריט</div>
                          <div>✅ שקיות מסומנות ומאורגנות</div>
                          <div>✅ הערות לאופים נוספו במידת הצורך</div>
                        </div>
                      </div>
                    </div>

                    {/* Shortcuts */}
                    <div id="guide-picker--shortcuts">
                      <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Search className="w-5 h-5 text-blue-600" />
                        קיצורי דרך
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div><strong>סימון מהיר:</strong> לחיצות מהירות לסימון "יש/אין במלאי"</div>
                        <div><strong>חיפוש גלובלי:</strong> חיפוש מהיר של הזמנות ופריטים</div>
                        <div><strong>פילטרים חכמים:</strong> הצגה לפי סטטוס, מיקום, דחיפות</div>
                      </div>
                    </div>

                    {/* Troubleshooting */}
                    <div id="guide-picker--troubleshooting">
                      <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-red-600" />
                        פתרון בעיות
                      </h4>
                      <div className="space-y-3 text-sm">
                        <div className="border-r-4 border-red-500 pr-3">
                          <strong>בעיה:</strong> לא ניתן לשמור התקדמות<br />
                          <strong>פתרון:</strong> בדיקת חיבור אינטרנט → רענון → בדיקת מטפל בהזמנה
                        </div>
                        <div className="border-r-4 border-orange-500 pr-3">
                          <strong>בעיה:</strong> פריט לא נמצא במיקום<br />
                          <strong>פתרון:</strong> Inventory → חיפוש מוצר → עדכון מיקום → המשך ליקוט
                        </div>
                        <div className="border-r-4 border-yellow-500 pr-3">
                          <strong>בעיה:</strong> בעיה בפירוק לשקיות<br />
                          <strong>פתרון:</strong> בדיקת סך כמויות → התאמה למספר המקורי → שמירה
                        </div>
                      </div>
                    </div>

                    {/* Glossary */}
                    <div id="guide-picker--glossary">
                      <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Database className="w-5 h-5 text-indigo-600" />
                        מילון מונחים
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div><strong>picking_status:</strong> סטטוס ליקוט פריט</div>
                        <div><strong>location_breakdown:</strong> פירוק פריט למיקומים</div>
                        <div><strong>notes_for_baker:</strong> הערות לאופה</div>
                        <div><strong>handled_by:</strong> מי מטפל בהזמנה</div>
                        <div><strong>location_bag_summary:</strong> סיכום שקיות</div>
                        <div><strong>picked_quantity:</strong> כמות נלקטה</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              /* @generated:guide-picker END */
            )}

            {/* Picker Baker Guide */}
            {selectedRole === 'picker_baker' && (
              /* @generated:guide-picker_baker BEGIN */
              <div id="guide-picker_baker" className="space-y-8">
                <Card className="border-none shadow-lg bg-white/90 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <Workflow className="w-6 h-6 text-indigo-600" />
                      מדריך למלקט ואופה
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    {/* Goals */}
                    <div id="guide-picker_baker--goals">
                      <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Info className="w-5 h-5 text-indigo-600" />
                        מטרות ו-KPIs
                      </h4>
                      <div className="bg-indigo-50 p-4 rounded-lg space-y-3">
                        <div><strong>מטרות עיקריות:</strong></div>
                        <ul className="space-y-2 mr-4">
                          <li>• ביצוע משולב של ליקוט ואפייה</li>
                          <li>• תיאום אופטימלי בין שני התחומים</li>
                          <li>• ניצול יעיל של זמן ומשאבים</li>
                          <li>• שמירה על איכות בשני תהליכים</li>
                        </ul>
                        <div className="mt-3">
                          <strong>KPIs:</strong> זמן כולל, יעילות תכנון, דיוק משולב
                        </div>
                      </div>
                    </div>

                    {/* Journey */}
                    <div id="guide-picker_baker--journey">
                      <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Users className="w-5 h-5 text-green-600" />
                        יום בחיי מלקט ואופה
                      </h4>
                      <div className="space-y-3 text-sm">
                        <div className="border-r-4 border-blue-500 pr-4">
                          <strong>בוקר מוקדם (6:00-8:00):</strong> בדיקת הזמנות אפייה, הכנת תנורים וחומרי גלם
                        </div>
                        <div className="border-r-4 border-green-500 pr-4">
                          <strong>בוקר (8:00-12:00):</strong> אפייה מקבילה לליקוט, עדכוני כמויות
                        </div>
                        <div className="border-r-4 border-orange-500 pr-4">
                          <strong>צהריים (12:00-16:00):</strong> מיקוד בליקוט, סיום אפיות, אריזה
                        </div>
                        <div className="border-r-4 border-purple-500 pr-4">
                          <strong>Hand-offs:</strong> תיאום עצמי בין משימות, דיווח ל<a href="#guide-store_manager" className="text-purple-600 underline">מנהל החנות</a>
                        </div>
                      </div>
                    </div>

                    {/* Views */}
                    <div id="guide-picker_baker--views">
                      <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Database className="w-5 h-5 text-purple-600" />
                        מסכים ומודולים עיקריים
                      </h4>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="bg-gray-50 p-3 rounded">
                          <div className="font-mono text-xs font-semibold">Bakers</div>
                          <div className="text-xs text-gray-600">הזמנות אפייה</div>
                        </div>
                        <div className="bg-gray-50 p-3 rounded">
                          <div className="font-mono text-xs font-semibold">Picking</div>
                          <div className="text-xs text-gray-600">ליקוטים</div>
                        </div>
                        <div className="bg-gray-50 p-3 rounded">
                          <div className="font-mono text-xs font-semibold">Shipments</div>
                          <div className="text-xs text-gray-600">משלוחים</div>
                        </div>
                        <div className="bg-gray-50 p-3 rounded">
                          <div className="font-mono text-xs font-semibold">Inventory</div>
                          <div className="text-xs text-gray-600">מלאי</div>
                        </div>
                        <div className="bg-gray-50 p-3 rounded">
                          <div className="font-mono text-xs font-semibold">BakersManualOrder</div>
                          <div className="text-xs text-gray-600">הזמנה ידנית</div>
                        </div>
                        <div className="bg-gray-50 p-3 rounded">
                          <div className="font-mono text-xs font-semibold">LogisticsOverview</div>
                          <div className="text-xs text-gray-600">תצוגה לוגיסטית</div>
                        </div>
                      </div>
                    </div>

                    {/* Flows */}
                    <div id="guide-picker_baker--flows">
                      <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Workflow className="w-5 h-5 text-orange-600" />
                        זרימות ליבה
                      </h4>
                      <div className="space-y-4">
                        <div className="bg-green-50 p-4 rounded-lg">
                          <div className="font-semibold text-green-900 mb-2">1. זרימה משולבת יומית</div>
                          <div className="text-sm text-green-800">
                            Bakers → התחלת אפיות → Picking → ליקוט מקביל → עדכון baked_quantity → סיום משולב
                          </div>
                        </div>
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <div className="font-semibold text-blue-900 mb-2">2. תכנון אופטימלי</div>
                          <div className="text-sm text-blue-800">
                            LogisticsOverview → תכנון יום → הקצאת זמנים → ביצוע לפי עדיפויות
                          </div>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-lg">
                          <div className="font-semibold text-purple-900 mb-2">3. טיפול בדחיפות</div>
                          <div className="text-sm text-purple-800">
                            זיהוי הזמנה דחופה → תעדוף אפייה → ליקוט מיידי → העברה למשלוח
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Edge Cases */}
                    <div id="guide-picker_baker--edge-cases">
                      <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Bell className="w-5 h-5 text-red-600" />
                        מצבים חריגים
                      </h4>
                      <div className="space-y-3">
                        <div className="border border-red-200 bg-red-50 p-3 rounded">
                          <strong>התנגשות זמנים:</strong> תעדוף לפי דחיפות → דחיית משימות פחות חשובות
                        </div>
                        <div className="border border-orange-200 bg-orange-50 p-3 rounded">
                          <strong>בעיה באפייה בזמן ליקוט:</strong> השלמת ליקוט נוכחי → חזרה לטיפול באפייה
                        </div>
                        <div className="border border-yellow-200 bg-yellow-50 p-3 rounded">
                          <strong>חסר בחומר גלם:</strong> Inventory → בדיקה → הזמנה → התאמת תכנון
                        </div>
                      </div>
                    </div>

                    {/* הרשאות והגדרות יחידות המשימה */}
                    <div id="guide-picker_baker--permissions">
                      <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-indigo-600" />
                        הרשאות מורכבות
                      </h4>
                      <div className="space-y-4">
                        <div className="bg-indigo-50 p-3 rounded">
                          <strong>הרשאות אפייה:</strong> Read הזמנות אפייה, Write baked_quantity + baking_status
                        </div>
                        <div className="bg-blue-50 p-3 rounded">
                          <strong>הרשאות ליקוט:</strong> Read/Write picking_status, location, notes_for_baker
                        </div>
                        <div className="bg-green-50 p-3 rounded">
                          <strong>הרשאות משותפות:</strong> משלוחים, מלאי, הזמנות ידניות
                        </div>
                      </div>
                    </div>

                    {/* Local QA מתקדמת */}
                    <div id="guide-picker_baker--local-qa">
                      <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <ListChecks className="w-5 h-5 text-green-600" />
                        בדיקות איכות משולבות
                      </h4>
                      <div className="bg-indigo-50 p-4 rounded-lg">
                        <div className="space-y-2 text-sm">
                          <div>✅ הזמנות אפייה הושלמו וכמויות עודכנו</div>
                          <div>✅ ליקוטים הושלמו ומיקומים מדויקים</div>
                          <div>✅ סנכרון בין תהליכי אפייה וליקוט</div>
                          <div>✅ איכות משולבת - אפייה + אריזה</div>
                        </div>
                      </div>
                    </div>

                    {/* קיצורי דרך מתקדמים */}
                    <div id="guide-picker_baker--shortcuts">
                      <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Search className="w-5 h-5 text-blue-600" />
                        קיצורי דרך מיוחדים
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div><strong>מעבר מהיר:</strong> מעבר בין Bakers ל-Picking בלחיצה אחת</div>
                        <div><strong>תצוגה משולבת:</strong> LogisticsOverview לתכנון יום שלם</div>
                        <div><strong>עדכונים מקבילים:</strong> שמירה אוטומטית בשני המערכות</div>
                      </div>
                    </div>

                    {/* Troubleshooting מורכב */}
                    <div id="guide-picker_baker--troubleshooting">
                      <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-red-600" />
                        פתרון בעיות מורכבות
                      </h4>
                      <div className="space-y-3 text-sm">
                        <div className="border-r-4 border-red-500 pr-3">
                          <strong>בעיה:</strong> סתירה בין נתוני אפייה וליקוט<br />
                          <strong>פתרון:</strong> בדיקה בשני הדפים → איתור חוסר התאמה → עדכון ידני
                        </div>
                        <div className="border-r-4 border-orange-500 pr-3">
                          <strong>בעיה:</strong> עומס יתר בזמנים<br />
                          <strong>פתרון:</strong> LogisticsOverview → תכנון מחדש → בקשת סיוע
                        </div>
                        <div className="border-r-4 border-yellow-500 pr-3">
                          <strong>בעיה:</strong> אובדן סנכרון<br />
                          <strong>פתרון:</strong> רענון שני הדפים → בדיקת עדכונים → שמירה מחדש
                        </div>
                      </div>
                    </div>

                    {/* Glossary מורחב */}
                    <div id="guide-picker_baker--glossary">
                      <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Database className="w-5 h-5 text-indigo-600" />
                        מילון מונחים מורחב
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div><strong>dual_role:</strong> תפקיד כפול במערכת</div>
                        <div><strong>sync_status:</strong> סטטוס סנכרון בין מערכות</div>
                        <div><strong>logistics_flow:</strong> זרימה לוגיסטית</div>
                        <div><strong>priority_queue:</strong> תור עדיפויות</div>
                        <div><strong>batch_processing:</strong> עיבוד קבוצתי</div>
                        <div><strong>cross_system_update:</strong> עדכון חוצה מערכות</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              /* @generated:guide-picker_baker END */
            )}

            {/* Courier Guide */}
            {selectedRole === 'courier' && (
              /* @generated:guide-courier BEGIN */
              <div id="guide-courier" className="space-y-8">
                <Card className="border-none shadow-lg bg-white/90 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <Users className="w-6 h-6 text-purple-600" />
                      מדריך לשליח
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    {/* Goals */}
                    <div id="guide-courier--goals">
                      <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Info className="w-5 h-5 text-purple-600" />
                        מטרות ו-KPIs
                      </h4>
                      <div className="bg-purple-50 p-4 rounded-lg space-y-3">
                        <div><strong>מטרות עיקריות:</strong></div>
                        <ul className="space-y-2 mr-4">
                          <li>• מסירה מהירה ומדויקת של משלוחים</li>
                          <li>• דיווח נכון על סטטוס מסירות</li>
                          <li>• שירות לקוחות איכותי</li>
                          <li>• תיעוד מסירות עם צילומים</li>
                        </ul>
                        <div className="mt-3">
                          <strong>KPIs:</strong> זמן מסירה, שיעור מסירות מוצלחות, שביעות רצון לקוחות
                        </div>
                      </div>
                    </div>

                    {/* Journey */}
                    <div id="guide-courier--journey">
                      <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Users className="w-5 h-5 text-green-600" />
                        יום בחיי שליח
                      </h4>
                      <div className="space-y-3 text-sm">
                        <div className="border-r-4 border-blue-500 pr-4">
                          <strong>בוקר (8:00-9:00):</strong> איסוף משלוחים מהחנות, בדיקת רשימה
                        </div>
                        <div className="border-r-4 border-green-500 pr-4">
                          <strong>יום (9:00-17:00):</strong> מסירת משלוחים, דיווח סטטוסים בזמן אמת
                        </div>
                        <div className="border-r-4 border-orange-500 pr-4">
                          <strong>ערב (17:00-18:00):</strong> החזרת משלוחים שלא נמסרו, דיווח סיכום
                        </div>
                        <div className="border-r-4 border-purple-500 pr-4">
                          <strong>Hand-offs:</strong> קבלת משלוחים מ<a href="#guide-store_manager" className="text-purple-600 underline">מנהל החנות</a>,
                          דיווח למרכז השליחות
                        </div>
                      </div>
                    </div>

                    {/* Views */}
                    <div id="guide-courier--views">
                      <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Database className="w-5 h-5 text-purple-600" />
                        מסכים ומודולים עיקריים
                      </h4>
                      <div className="grid grid-cols-1 gap-4">
                        <div className="bg-gray-50 p-3 rounded">
                          <div className="font-mono text-sm font-semibold">CourierDashboard</div>
                          <div className="text-xs text-gray-600">דף ראשי - רשימת משלוחים מוקצים</div>
                        </div>
                        <div className="bg-gray-50 p-3 rounded">
                          <div className="font-mono text-sm font-semibold">DeliveryActionsDialog</div>
                          <div className="text-xs text-gray-600">דיווח מסירה עם צילום</div>
                        </div>
                        <div className="bg-gray-50 p-3 rounded">
                          <div className="font-mono text-sm font-semibold">PublicShipmentList</div>
                          <div className="text-xs text-gray-600">רשימה ציבורית (ללא התחברות)</div>
                        </div>
                      </div>
                    </div>

                    {/* Flows */}
                    <div id="guide-courier--flows">
                      <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Workflow className="w-5 h-5 text-orange-600" />
                        זרימות ליבה
                      </h4>
                      <div className="space-y-4">
                        <div className="bg-green-50 p-4 rounded-lg">
                          <div className="font-semibold text-green-900 mb-2">1. מסירה מוצלחת</div>
                          <div className="text-sm text-green-800">
                            CourierDashboard → בחירת משלוח → הגעה לכתובת → צילום אישור → סימון "נמסר"
                          </div>
                        </div>
                        <div className="bg-red-50 p-4 rounded-lg">
                          <div className="font-semibold text-red-900 mb-2">2. מסירה שנכשלה</div>
                          <div className="text-sm text-red-800">
                            הגעה לכתובת → אין מענה → צילום הוכחה → סימון "לא נמסר" → הוספת סיבה
                          </div>
                        </div>
                        <div className="bg-yellow-50 p-4 rounded-lg">
                          <div className="font-semibold text-yellow-900 mb-2">3. בעיה במסירה</div>
                          <div className="text-sm text-yellow-800">
                            זיהוי בעיה → יצירת קשר עם מרכז → סימון "בעיה בשליחה" → החזרה למרכז
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Edge Cases */}
                    <div id="guide-courier--edge-cases">
                      <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Bell className="w-5 h-5 text-red-600" />
                        מצבים חריגים
                      </h4>
                      <div className="space-y-3">
                        <div className="border border-red-200 bg-red-50 p-3 rounded">
                          <strong>כתובת לא נמצאה:</strong> יצירת קשר עם לקוח → קבלת הכוונה → עדכון כתובת
                        </div>
                        <div className="border border-orange-200 bg-orange-50 p-3 rounded">
                          <strong>לקוח לא זמין:</strong> ניסיון יצירת קשר → השארת הודעה → תיאום זמן חדש
                        </div>
                        <div className="border border-yellow-200 bg-yellow-50 p-3 rounded">
                          <strong>משלוח פגום:</strong> צילום נזק → סירוב מסירה → החזרה עם דוח
                        </div>
                      </div>
                    </div>

                    {/* Permissions */}
                    <div id="guide-courier--permissions">
                      <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-indigo-600" />
                        הרשאות וגדרות
                      </h4>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <tbody className="space-y-1">
                            <tr><td className="font-semibold pr-4">Read:</td><td>משלוחים מוקצים בלבד</td></tr>
                            <tr><td className="font-semibold pr-4">Write:</td><td>delivery_status, delivery_notes, delivery_photo</td></tr>
                            <tr><td className="font-semibold pr-4">Execute:</td><td>דיווח מסירה</td></tr>
                            <tr><td className="font-semibold pr-4">Approve:</td><td>אין</td></tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Local QA */}
                    <div id="guide-courier--local-qa">
                      <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <ListChecks className="w-5 h-5 text-green-600" />
                        בדיקות איכות
                      </h4>
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <div className="space-y-2 text-sm">
                          <div>✅ כל המשלוחים דווחו (נמסר/לא נמסר/בעיה)</div>
                          <div>✅ צילומי אישור לכל מסירה</div>
                          <div>✅ הערות מפורטות למשלוחים שלא נמסרו</div>
                          <div>✅ לא נשארו משלוחים ללא סטטוס</div>
                        </div>
                      </div>
                    </div>

                    {/* Shortcuts */}
                    <div id="guide-courier--shortcuts">
                      <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Search className="w-5 h-5 text-blue-600" />
                        קיצורי דרך
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div><strong>מעבר מהיר:</strong> לחיצה על כתובת פותחת ניווט GPS</div>
                        <div><strong>צילום מהיר:</strong> כפתור צילום ישירות מהמסך</div>
                        <div><strong>דיווח מהיר:</strong> כפתורי מקש לסטטוסים נפוצים</div>
                      </div>
                    </div>

                    {/* Troubleshooting */}
                    <div id="guide-courier--troubleshooting">
                      <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-red-600" />
                        פתרון בעיות
                      </h4>
                      <div className="space-y-3 text-sm">
                        <div className="border-r-4 border-red-500 pr-3">
                          <strong>בעיה:</strong> לא רואה רשימת משלוחים<br />
                          <strong>פתרון:</strong> בדיקת חיבור אינטרנט → רענון אפליקציה → פנייה למרכז
                        </div>
                        <div className="border-r-4 border-orange-500 pr-3">
                          <strong>בעיה:</strong> לא ניתן להעלות צילום<br />
                          <strong>פתרון:</strong> בדיקת הרשאות מצלמה → חיבור Wi-Fi → ניסיון חוזר
                        </div>
                        <div className="border-r-4 border-yellow-500 pr-3">
                          <strong>בעיה:</strong> כתובת שגויה במערכת<br />
                          <strong>פתרון:</strong> יצירת קשר עם לקוח → עדכון בהערות → דיווח למרכז
                        </div>
                      </div>
                    </div>

                    {/* Glossary */}
                    <div id="guide-courier--glossary">
                      <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Database className="w-5 h-5 text-indigo-600" />
                        מילון מונחים
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div><strong>delivery_status:</strong> סטטוס מסירה</div>
                        <div><strong>delivery_notes:</strong> הערות מסירה</div>
                        <div><strong>delivery_photo:</strong> תמונת אישור</div>
                        <div><strong>nonDeliveryReason:</strong> סיבת אי-מסירה</div>
                        <div><strong>courier_company:</strong> חברת שילוח</div>
                        <div><strong>shipping_address:</strong> כתובת מסירה</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              /* @generated:guide-courier END */
            )}

            {/* Pending Guide */}
            {selectedRole === 'pending' && (
              /* @generated:guide-pending BEGIN */
              <div id="guide-pending" className="space-y-8">
                <Card className="border-none shadow-lg bg-white/90 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <ShieldCheck className="w-6 h-6 text-gray-600" />
                      מדריך למשתמש ממתין לאישור
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    {/* Goals */}
                    <div id="guide-pending--goals">
                      <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Info className="w-5 h-5 text-gray-600" />
                        מטרות ו-KPIs
                      </h4>
                      <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                        <div><strong>מצב נוכחי:</strong></div>
                        <ul className="space-y-2 mr-4">
                          <li>• ממתין לאישור מנהל המערכת</li>
                          <li>• אין גישה לתכונות המערכת</li>
                          <li>• יכול רק לצפות בדף ההמתנה</li>
                        </ul>
                        <div className="mt-3">
                          <strong>יעד:</strong> קבלת תפקיד מתאים ותחילת עבודה
                        </div>
                      </div>
                    </div>

                    {/* Journey */}
                    <div id="guide-pending--journey">
                      <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Users className="w-5 h-5 text-green-600" />
                        תהליך ההמתנה
                      </h4>
                      <div className="space-y-3 text-sm">
                        <div className="border-r-4 border-yellow-500 pr-4">
                          <strong>שלב 1:</strong> הרשמה למערכת הושלמה
                        </div>
                        <div className="border-r-4 border-orange-500 pr-4">
                          <strong>שלב 2:</strong> ממתין לבדיקת מנהל המערכת
                        </div>
                        <div className="border-r-4 border-blue-500 pr-4">
                          <strong>שלב 3:</strong> מנהל יקצה תפקיד מתאים
                        </div>
                        <div className="border-r-4 border-green-500 pr-4">
                          <strong>שלב 4:</strong> קבלת גישה מלאה למערכת
                        </div>
                      </div>
                    </div>

                    {/* Views */}
                    <div id="guide-pending--views">
                      <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Database className="w-5 h-5 text-purple-600" />
                        מסכים זמינים
                      </h4>
                      <div className="grid grid-cols-1 gap-4">
                        <div className="bg-gray-50 p-3 rounded">
                          <div className="font-mono text-sm font-semibold">PendingApproval</div>
                          <div className="text-xs text-gray-600">דף ההמתנה - המסך היחיד הזמין</div>
                        </div>
                      </div>
                    </div>

                    {/* Flows */}
                    <div id="guide-pending--flows">
                      <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Workflow className="w-5 h-5 text-orange-600" />
                        זרימות אפשריות
                      </h4>
                      <div className="space-y-4">
                        <div className="bg-yellow-50 p-4 rounded-lg">
                          <div className="font-semibold text-yellow-900 mb-2">1. המתנה רגילה</div>
                          <div className="text-sm text-yellow-800">
                            כניסה למערכת → PendingApproval → המתנה → קבלת הודעת אישור → כניסה מחדש
                          </div>
                        </div>
                        <div className="bg-orange-50 p-4 rounded-lg">
                          <div className="font-semibold text-orange-900 mb-2">2. פנייה למנהל</div>
                          <div className="text-sm text-orange-800">
                            המתנה ארוכה → יצירת קשר עם מנהל → הזדהות → זירוז תהליך
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Edge Cases */}
                    <div id="guide-pending--edge-cases">
                      <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Bell className="w-5 h-5 text-red-600" />
                        מצבים חריגים
                      </h4>
                      <div className="space-y-3">
                        <div className="border border-red-200 bg-red-50 p-3 rounded">
                          <strong>המתנה ארוכה:</strong> יצירת קשר ישירה עם מנהל המערכת
                        </div>
                        <div className="border border-orange-200 bg-orange-50 p-3 rounded">
                          <strong>בעיה בגישה:</strong> ניסיון כניסה חוזר עם חשבון Google
                        </div>
                        <div className="border border-yellow-200 bg-yellow-50 p-3 rounded">
                          <strong>שגיאה במערכת:</strong> רענון דף או שימוש בדפדפן אחר
                        </div>
                      </div>
                    </div>

                    {/* Permissions */}
                    <div id="guide-pending--permissions">
                      <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-indigo-600" />
                        הרשאות נוכחיות
                      </h4>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <tbody className="space-y-1">
                            <tr><td className="font-semibold pr-4">Read:</td><td>אין גישה לנתונים</td></tr>
                            <tr><td className="font-semibold pr-4">Write:</td><td>אין יכולת עריכה</td></tr>
                            <tr><td className="font-semibold pr-4">Execute:</td><td>אין יכולת ביצוע פעולות</td></tr>
                            <tr><td className="font-semibold pr-4">Approve:</td><td>אין</td></tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Local QA */}
                    <div id="guide-pending--local-qa">
                      <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <ListChecks className="w-5 h-5 text-green-600" />
                        מה ניתן לעשות
                      </h4>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="space-y-2 text-sm">
                          <div>✅ להמתין בסבלנות לאישור</div>
                          <div>✅ לבדוק מעת לעת אם התקבל אישור</div>
                          <div>✅ ליצור קשר עם מנהל בהמתנה ארוכה</div>
                          <div>✅ להכין מידע על התפקיד המבוקש</div>
                        </div>
                      </div>
                    </div>

                    {/* Shortcuts */}
                    <div id="guide-pending--shortcuts">
                      <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Search className="w-5 h-5 text-blue-600" />
                        טיפים
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div><strong>רענון תקופתי:</strong> כדאי לרענן את הדף מדי פעם</div>
                        <div><strong>כניסה מחדש:</strong> לאחר קבלת הודעת אישור</div>
                        <div><strong>סבלנות:</strong> התהליך יכול לקחת מספר שעות</div>
                      </div>
                    </div>

                    {/* Troubleshooting */}
                    <div id="guide-pending--troubleshooting">
                      <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-red-600" />
                        פתרון בעיות
                      </h4>
                      <div className="space-y-3 text-sm">
                        <div className="border-r-4 border-red-500 pr-3">
                          <strong>בעיה:</strong> המתנה ארוכה מהצפוי<br />
                          <strong>פתרון:</strong> יצירת קשר עם מנהל המערכת לבירור סטטוס
                        </div>
                        <div className="border-r-4 border-orange-500 pr-3">
                          <strong>בעיה:</strong> לא מצליח להיכנס למערכת<br />
                          <strong>פתרון:</strong> בדיקת חשבון Google → ניסיון כניסה חוזר
                        </div>
                        <div className="border-r-4 border-yellow-500 pr-3">
                          <strong>בעיה:</strong> דף לא נטען כראוי<br />
                          <strong>פתרון:</strong> רענון דף → ניקוי cache דפדפן → ניסיון חוזר
                        </div>
                      </div>
                    </div>

                    {/* Glossary */}
                    <div id="guide-pending--glossary">
                      <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Database className="w-5 h-5 text-indigo-600" />
                        מילון מונחים
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div><strong>custom_role:</strong> תפקיד במערכת</div>
                        <div><strong>pending:</strong> ממתין לאישור</div>
                        <div><strong>approved_by:</strong> מי אישר את המשתמש</div>
                        <div><strong>PendingApproval:</strong> דף ההמתנה</div>
                        <div><strong>UserManagement:</strong> ניהול משתמשים</div>
                        <div><strong>Google Auth:</strong> התחברות גוגל</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              /* @generated:guide-pending END */
            )}
          </TabsContent>

          {/* Admin Dashboard Tab */}
          <TabsContent value="admin-dashboard">
            {/* @generated:admin-big-picture BEGIN */}
            <div id="admin-big-picture" className="space-y-8">
              <Card className="border-none shadow-lg bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <ShieldCheck className="w-6 h-6 text-green-600" />
                    תמונת על למנהל מערכת
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg text-gray-700 mb-6">
                    מבט כולל על המערכת, תהליכים עסקיים, בקרה ומעקב עבור מנהלי מערכת.
                  </p>
                </CardContent>
              </Card>
            </div>
            {/* @generated:admin-big-picture END */}

            {/* @generated:admin-e2e BEGIN */}
            <div id="admin-e2e" className="space-y-8">
              <Card className="border-none shadow-lg bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Workflow className="w-6 h-6 text-blue-600" />
                    זרימה עסקית (E2E)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</span>
                        <h4 className="font-semibold text-blue-900">קליטת מיילים/קבצים</h4>
                      </div>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li>• <code>checkEmails</code> - בדיקה יומית</li>
                        <li>• יצירת רשומות <code>Invoice</code></li>
                        <li>• <a href={createPageUrl("Invoices")} className="text-blue-600 underline">ניהול חשבוניות</a></li>
                      </ul>
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</span>
                        <h4 className="font-semibold text-green-900">ליקוט ופירוק</h4>
                      </div>
                      <ul className="text-sm text-green-800 space-y-1">
                        <li>• <code>picking_status</code> מעקב</li>
                        <li>• <code>location_bag_summary</code></li>
                        <li>• <a href={createPageUrl("Picking")} className="text-green-600 underline">דף ליקוטים</a></li>
                      </ul>
                    </div>

                    <div className="bg-orange-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="bg-orange-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">3</span>
                        <h4 className="font-semibold text-orange-900">אפייה ותכנון ייצור</h4>
                      </div>
                      <ul className="text-sm text-orange-800 space-y-1">
                        <li>• עדכון <code>baked_quantity</code></li>
                        <li>• <code>syncOrderData</code> אוטומטי</li>
                        <li>• <a href={createPageUrl("Bakers")} className="text-orange-600 underline">דף אופים</a></li>
                      </ul>
                    </div>

                    <div className="bg-purple-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">4</span>
                        <h4 className="font-semibold text-purple-900">אריזה והכנה</h4>
                      </div>
                      <ul className="text-sm text-purple-800 space-y-1">
                        <li>• סיום <code>picking_status</code></li>
                        <li>• בחירת <code>courier_company</code></li>
                        <li>• <a href={createPageUrl("Inventory")} className="text-purple-600 underline">ניהול מלאי</a></li>
                      </ul>
                    </div>

                    <div className="bg-indigo-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="bg-indigo-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">5</span>
                        <h4 className="font-semibold text-indigo-900">משלוח/איסוף</h4>
                      </div>
                      <ul className="text-sm text-indigo-800 space-y-1">
                        <li>• <code>processOverdueDelivery</code></li>
                        <li>• <code>processOverduePickups</code></li>
                        <li>• <a href={createPageUrl("Shipments")} className="text-indigo-600 underline">משלוחים</a> | <a href={createPageUrl("Pickups")} className="text-indigo-600 underline">איסופים</a></li>
                      </ul>
                    </div>

                    <div className="bg-red-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">6</span>
                        <h4 className="font-semibold text-red-900">דוחות ובקרה</h4>
                      </div>
                      <ul className="text-sm text-red-800 space-y-1">
                        <li>• <code>Notification</code> מערכת</li>
                        <li>• <a href={createPageUrl("Analytics")} className="text-red-600 underline">אנליטיקה</a></li>
                        <li>• <a href={createPageUrl("AdminNotifications")} className="text-red-600 underline">מרכז התראות</a></li>
                      </ul>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <h5 className="font-semibold text-gray-900 mb-2">אוטומציות בזרימה:</h5>
                    <div className="text-sm text-gray-700 grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div>• <code>triggerDailyEmailCheckIfMissed</code> - יומי</div>
                      <div>• <code>processOverdueDelivery</code> - ~20:00</div>
                      <div>• <code>processOverduePickups</code> - ~22:00</div>
                      <div>• <code>syncOrderData</code> - בזמן אמת</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            {/* @generated:admin-e2e END */}

            {/* @generated:admin-ctrl BEGIN */}
            <div id="admin-ctrl" className="space-y-8">
              <Card className="border-none shadow-lg bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <ShieldCheck className="w-6 h-6 text-green-600" />
                    Command & Control
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                    {/* KPI Cards */}
                    <Card className="bg-blue-50 border-blue-200">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Database className="w-4 h-4 text-blue-600" />
                          <span className="text-sm font-medium text-blue-900">גיבוי אחרון</span>
                        </div>
                        <div className="text-lg font-bold text-blue-700">
                          <a href={createPageUrl("OrderBackups")} className="hover:underline">
                            צפה בסטטוס
                          </a>
                        </div>
                        <p className="text-xs text-blue-600 mt-1">מעקב גיבויים אוטומטיים</p>
                      </CardContent>
                    </Card>

                    <Card className="bg-green-50 border-green-200">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <ListChecks className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-medium text-green-900">הזמנות פעילות</span>
                        </div>
                        <div className="text-lg font-bold text-green-700">
                          <a href={createPageUrl("Home")} className="hover:underline">
                            צפה בדשבורד
                          </a>
                        </div>
                        <p className="text-xs text-green-600 mt-1">הזמנות בתהליך</p>
                      </CardContent>
                    </Card>

                    <Card className="bg-orange-50 border-orange-200">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Bell className="w-4 h-4 text-orange-600" />
                          <span className="text-sm font-medium text-orange-900">התראות</span>
                        </div>
                        <div className="text-lg font-bold text-orange-700">
                          <a href={createPageUrl("AdminNotifications")} className="hover:underline">
                            מרכז התראות
                          </a>
                        </div>
                        <p className="text-xs text-orange-600 mt-1">התראות מערכת</p>
                      </CardContent>
                    </Card>

                    <Card className="bg-purple-50 border-purple-200">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Code2 className="w-4 h-4 text-purple-600" />
                          <span className="text-sm font-medium text-purple-900">מעקב טכני</span>
                        </div>
                        <div className="text-lg font-bold text-purple-700">
                          <a href={createPageUrl("DevelopmentConsole")} className="hover:underline">
                            פתח קונסולה
                          </a>
                        </div>
                        <p className="text-xs text-purple-600 mt-1">מעקב פיתוח</p>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900">פעולות מנהל מערכת</h4>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h5 className="font-medium mb-3">ניהול נתונים</h5>
                        <div className="space-y-2 text-sm">
                          <a href={createPageUrl("OrderBackups")} className="block text-blue-600 hover:text-blue-800">
                            • גיבוי ושחזור הזמנות
                          </a>
                          <a href={createPageUrl("OrderDataManagement")} className="block text-blue-600 hover:text-blue-800">
                            • ניהול נתוני הזמנות
                          </a>
                          <a href={createPageUrl("UserManagement")} className="block text-blue-600 hover:text-blue-800">
                            • ניהול משתמשים והרשאות
                          </a>
                          <a href={createPageUrl("Invoices")} className="block text-blue-600 hover:text-blue-800">
                            • חשבוניות מהמייל
                          </a>
                        </div>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h5 className="font-medium mb-3">מעקב ובקרה</h5>
                        <div className="space-y-2 text-sm">
                          <a href={createPageUrl("Analytics")} className="block text-blue-600 hover:text-blue-800">
                            • ניתוח נתונים ודוחות
                          </a>
                          <a href={createPageUrl("TestPickupProcessor")} className="block text-blue-600 hover:text-blue-800">
                            • בדיקות מעבד איסופים
                          </a>
                          <a href={createPageUrl("EmailTester")} className="block text-blue-600 hover:text-blue-800">
                            • מעבדת מיילים
                          </a>
                          <a href={createPageUrl("Settings")} className="block text-blue-600 hover:text-blue-800">
                            • הגדרות מערכת
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            {/* @generated:admin-ctrl END */}

            {/* @generated:admin-rbac-map BEGIN */}
            <div id="admin-rbac-map" className="space-y-8">
              <Card className="border-none shadow-lg bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Users className="w-6 h-6 text-orange-600" />
                    מפת RBAC
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <p className="text-gray-700">
                      מטריצת הרשאות מבוססת על <code>rolePermissions</code> הקיים במערכת.
                    </p>
                  </div>

                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-right">תפקיד</TableHead>
                          <TableHead className="text-right">קריאה</TableHead>
                          <TableHead className="text-right">כתיבה</TableHead>
                          <TableHead className="text-right">ביצוע</TableHead>
                          <TableHead className="text-right">אישור</TableHead>
                          <TableHead className="text-right">Views עיקריים</TableHead>
                          <TableHead className="text-right">מדריך</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <tr className="bg-blue-50">
                          <td className="p-3 font-medium text-blue-900 border">מנהל מערכת</td>
                          <td className="p-3 border">כל הנתונים</td>
                          <td className="p-3 border">כל הנתונים</td>
                          <td className="p-3 border">כל הפעולות</td>
                          <td className="p-3 border">משתמשים</td>
                          <td className="p-3 text-xs border">כל הדפים</td>
                          <td className="p-3 border">
                            <a href="#guide-admin" className="text-blue-600 underline text-xs">מדריך</a>
                          </td>
                        </tr>
                        <tr className="bg-green-50">
                          <td className="p-3 font-medium text-green-900 border">מנהל חנות</td>
                          <td className="p-3 border">כל הנתונים</td>
                          <td className="p-3 border">הזמנות, מלאי</td>
                          <td className="p-3 border">ליקוט, אפייה</td>
                          <td className="p-3 border">לא</td>
                          <td className="p-3 text-xs border">רוב הדפים (פרט לניהול משתמשים)</td>
                          <td className="p-3 border">
                            <a href="#guide-store_manager" className="text-green-600 underline text-xs">מדריך</a>
                          </td>
                        </tr>
                        <tr className="bg-purple-50">
                          <td className="p-3 font-medium text-purple-900 border">אופה</td>
                          <td className="p-3 border">הזמנות אפייה</td>
                          <td className="p-3 border">כמויות אפייה</td>
                          <td className="p-3 border">סימון הושלם</td>
                          <td className="p-3 border">לא</td>
                          <td className="p-3 text-xs border">Bakers, BakersManualOrder, BakersArchive</td>
                          <td className="p-3 border">
                            <a href="#guide-baker" className="text-purple-600 underline text-xs">מדריך</a>
                          </td>
                        </tr>
                        <tr className="bg-orange-50">
                          <td className="p-3 font-medium text-orange-900 border">מלקט</td>
                          <td className="p-3 border">הזמנות ליקוט</td>
                          <td className="p-3 border">סטטוס ליקוט</td>
                          <td className="p-3 border">ליקוט והכנה</td>
                          <td className="p-3 border">לא</td>
                          <td className="p-3 text-xs border">Picking, Shipments, Inventory</td>
                          <td className="p-3 border">
                            <a href="#guide-picker" className="text-orange-600 underline text-xs">מדריך</a>
                          </td>
                        </tr>
                        <tr className="bg-indigo-50">
                          <td className="p-3 font-medium text-indigo-900 border">מלקט ואופה</td>
                          <td className="p-3 border">הזמנות ליקוט ואפייה</td>
                          <td className="p-3 border">ליקוט ואפייה</td>
                          <td className="p-3 border">ליקוט ואפייה</td>
                          <td className="p-3 border">לא</td>
                          <td className="p-3 text-xs border">Bakers + Picking + Shipments</td>
                          <td className="p-3 border">
                            <a href="#guide-picker_baker" className="text-indigo-600 underline text-xs">מדריך</a>
                          </td>
                        </tr>
                        <tr className="bg-red-50">
                          <td className="p-3 font-medium text-red-900 border">שליח</td>
                          <td className="p-3 border">משלוחים מוקצים</td>
                          <td className="p-3 border">סטטוס מסירה</td>
                          <td className="p-3 border">דיווח מסירה</td>
                          <td className="p-3 border">לא</td>
                          <td className="p-3 text-xs border">CourierDashboard</td>
                          <td className="p-3 border">
                            <a href="#guide-courier" className="text-red-600 underline text-xs">מדריך</a>
                          </td>
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="p-3 font-medium text-gray-600 border">ממתין לאישור</td>
                          <td className="p-3 border">אין</td>
                          <td className="p-3 border">אין</td>
                          <td className="p-3 border">אין</td>
                          <td className="p-3 border">אין</td>
                          <td className="p-3 text-xs border">PendingApproval</td>
                          <td className="p-3 border">
                            <a href="#guide-pending" className="text-gray-600 underline text-xs">מדריך</a>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <h5 className="font-semibold text-blue-900 mb-2">הערות RBAC:</h5>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• כל הרשאה מבוססת על <code>custom_role</code> שדה ב-<code>User</code> entity</li>
                      <li>• <code>ROLE_PERMISSIONS</code> ב-<code>rolePermissions</code> מגדיר גישה לדפים</li>
                      <li>• <code>hasPageAccess()</code> בודק הרשאות בזמן ניווט</li>
                      <li>• מנהל מערכת יכול לאשר משתמשים דרך <a href={createPageUrl("UserManagement")} className="underline">ניהול משתמשים</a></li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
            {/* @generated:admin-rbac-map END */}

            {/* @generated:admin-telemetry BEGIN */}
            <div id="admin-telemetry" className="space-y-8">
              <Card className="border-none shadow-lg bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Bell className="w-6 h-6 text-red-600" />
                    מדדים ומעקב
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">

                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Info className="w-5 h-5 text-yellow-600" />
                      <h5 className="font-semibold text-yellow-900">סטטוס טלמטריה</h5>
                    </div>
                    <p className="text-yellow-800 text-sm">
                      אין מערכת טלמטריה מרוכזת זמינה כרגע. המדדים הבאים מבוססים על לוגיקה קיימת בפונקציות.
                    </p>
                  </div>

                  {/* Function Status */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white border rounded-lg p-4">
                      <h5 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Workflow className="w-5 h-5 text-blue-600" />
                        סטטוס אוטומציות
                      </h5>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                          <span className="text-sm font-medium">processOverdueDelivery</span>
                          <Badge className="bg-green-100 text-green-800">פעיל (~20:00)</Badge>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                          <span className="text-sm font-medium">processOverduePickups</span>
                          <Badge className="bg-green-100 text-green-800">פעיל (~22:00)</Badge>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                          <span className="text-sm font-medium">triggerDailyEmailCheckIfMissed</span>
                          <Badge className="bg-green-100 text-green-800">פעיל (יומי)</Badge>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                          <span className="text-sm font-medium">checkEmails</span>
                          <Badge className="bg-blue-100 text-blue-800">ידני/מתוזמן</Badge>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                          <span className="text-sm font-medium">syncOrderData</span>
                          <Badge className="bg-blue-100 text-blue-800">בזמן אמת</Badge>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white border rounded-lg p-4">
                      <h5 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Database className="w-5 h-5 text-purple-600" />
                        מדדי נתונים זמינים
                      </h5>
                      <div className="space-y-3">
                        <div className="p-2 bg-gray-50 rounded">
                          <div className="text-sm font-medium">Entities במערכת</div>
                          <div className="text-xs text-gray-600">Order, User, InventoryItem, Invoice, Notification, AppSetting, DevelopmentRequest</div>
                        </div>
                        <div className="p-2 bg-gray-50 rounded">
                          <div className="text-sm font-medium">שדות מעקב עיקריים</div>
                          <div className="text-xs text-gray-600">baked_quantity, picking_status, delivery_status, custom_role</div>
                        </div>
                        <div className="p-2 bg-gray-50 rounded">
                          <div className="text-sm font-medium">מערכת התראות</div>
                          <div className="text-xs text-gray-600">Notification entity עם type, priority, recipient_role</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Available Metrics */}
                  <div className="bg-white border rounded-lg p-4">
                    <h5 className="font-semibold text-gray-900 mb-4">מדדים ניתנים למעקב (מבוססי ה-SSOT)</h5>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-blue-50 p-3 rounded">
                        <div className="font-medium text-blue-900 text-sm">הזמנות</div>
                        <ul className="text-xs text-blue-700 mt-1 space-y-1">
                          <li>• ספירה לפי <code>status</code></li>
                          <li>• ספירה לפי <code>order_type</code></li>
                          <li>• <code>picking_status</code> התפלגות</li>
                        </ul>
                      </div>
                      <div className="bg-green-50 p-3 rounded">
                        <div className="font-medium text-green-900 text-sm">אפייה וליקוט</div>
                        <ul className="text-xs text-green-700 mt-1 space-y-1">
                          <li>• <code>baked_quantity</code> vs <code>quantity</code></li>
                          <li>• זמני השלמת ליקוט</li>
                          <li>• הערות לאופה</li>
                        </ul>
                      </div>
                      <div className="bg-purple-50 p-3 rounded">
                        <div className="font-medium text-purple-900 text-sm">משתמשים</div>
                        <ul className="text-xs text-purple-700 mt-1 space-y-1">
                          <li>• <code>custom_role</code> התפלגות</li>
                          <li>• משתמשים <code>pending</code></li>
                          <li>• פעילות לפי תפקיד</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h5 className="font-semibold text-blue-900 mb-2">מיקום מדדים נוספים</h5>
                    <div className="text-sm text-blue-800 space-y-1">
                      <div>• <a href={createPageUrl("Analytics")} className="underline">דף אנליטיקה</a> - גרפים ודוחות מתקדמים</div>
                      <div>• <a href={createPageUrl("DevelopmentConsole")} className="underline">קונסול פיתוח</a> - מעקב טכני ופיתוח</div>
                      <div>• <code>localStorage</code> - לוגי ריצות אוטומציות (לדוגמה: <code>lastProcessedDate</code>)</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            {/* @generated:admin-telemetry END */}

            {/* @generated:admin-change-mgmt BEGIN */}
            <div id="admin-change-mgmt" className="space-y-8">
              <Card className="border-none shadow-lg bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <FileText className="w-6 h-6 text-indigo-600" />
                    ניהול שינויים
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">

                  <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Info className="w-5 h-5 text-orange-600" />
                      <h5 className="font-semibold text-orange-900">סטטוס Snapshot</h5>
                    </div>
                    <p className="text-orange-800 text-sm">
                      לא נמצא מנגנון Snapshot אוטומטי במערכת כרגע. Change Log מנוהל באופן ידני.
                    </p>
                  </div>

                  {/* Change Log Policy */}
                  <div className="bg-white border rounded-lg p-4">
                    <h5 className="font-semibold text-gray-900 mb-4">מדיניות Change Log</h5>
                    <div className="space-y-4">
                      <div>
                        <div className="font-medium text-gray-800 mb-2">מה נרשם:</div>
                        <ul className="text-sm text-gray-700 space-y-1 mr-4">
                          <li>• שינויים במבנה Entities (שדות חדשים, שינוי טיפוסים)</li>
                          <li>• הוספת/עריכת Functions (אוטומציות, אינטגרציות)</li>
                          <li>• שינויי הרשאות ב-<code>rolePermissions</code></li>
                          <li>• עדכוני UI משמעותיים (דפים חדשים, קומפוננטות עיקריות)</li>
                          <li>• תיקוני באגים קריטיים</li>
                        </ul>
                      </div>

                      <div>
                        <div className="font-medium text-gray-800 mb-2">פורמט רישום:</div>
                        <div className="bg-gray-50 p-3 rounded font-mono text-sm">
                          ✅ [PHASE X]: [תיאור קצר] ([קטגוריות מפתח])
                        </div>
                        <p className="text-xs text-gray-600 mt-1">
                          דוגמה: "✅ PHASE 3: Role Usage Guides (UI+Content) built (SSOT, idempotent, cross-linked)"
                        </p>
                      </div>

                      <div>
                        <div className="font-medium text-gray-800 mb-2">גישה ל-Change Log:</div>
                        <div className="text-sm text-gray-700">
                          <a href="#doc-changelog" className="text-blue-600 underline">Change Log ב-Documentation</a> |
                          <span className="mx-2">•</span>
                          <a href={createPageUrl("DevelopmentConsole")} className="text-blue-600 underline">מעקב טכני</a>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Manual Tracking */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h5 className="font-semibold text-blue-900 mb-3">מעקב ידני זמין</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="font-medium text-blue-800 mb-2">אם נדרש Snapshot עתידי:</div>
                        <ul className="text-sm text-blue-700 space-y-1">
                          <li>• שדות מוצעים: timestamp, updated_by, version</li>
                          <li>• טבלה: <code>SystemSnapshot</code></li>
                          <li>• תדירות מוצעת: לפני כל פריסה</li>
                        </ul>
                      </div>
                      <div>
                        <div className="font-medium text-blue-800 mb-2">כלים קיימים:</div>
                        <ul className="text-sm text-blue-700 space-y-1">
                          <li>• <code>AppSetting</code> entity לקונפיגורציה</li>
                          <li>• <code>DevelopmentRequest</code> למעקב פיתוח</li>
                          <li>• Footer traceability בכל דף תיעוד</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Integration */}
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h5 className="font-semibold text-green-900 mb-2">אינטגרציה עם כלי הניהול</h5>
                    <div className="text-sm text-green-800 space-y-1">
                      <div>• <strong>Development Console:</strong>
                        <a href={createPageUrl("DevelopmentConsole")} className="underline mr-2">מעקב סטטוס קומפוננטות</a>
                      </div>
                      <div>• <strong>User Management:</strong>
                        <a href={createPageUrl("UserManagement")} className="underline mr-2">מעקב שינויי הרשאות</a>
                      </div>
                      <div>• <strong>Settings:</strong>
                        <a href={createPageUrl("Settings")} className="underline mr-2">קונפיגורציה כללית</a>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            {/* @generated:admin-change-mgmt END */}

            {/* @generated:admin-standards BEGIN */}
            <div id="admin-standards" className="space-y-8">
              <Card className="border-none shadow-lg bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <ListChecks className="w-6 h-6 text-yellow-600" />
                    סטנדרטים
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">

                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Info className="w-5 h-5 text-yellow-600" />
                      <h5 className="font-semibold text-yellow-900">סטטוס תיעוד סטנדרטים</h5>
                    </div>
                    <p className="text-yellow-800 text-sm">
                      לא נמצא תיעוד פורמלי של DoR/DoD. להלן סטנדרטים נגזרים מה-SSOT ומתהליכי העבודה הקיימים.
                    </p>
                  </div>

                  {/* Inferred DoR */}
                  <div className="bg-white border rounded-lg p-4">
                    <h5 className="font-semibold text-gray-900 mb-4">Definition of Ready (DoR) - נגזר</h5>
                    <div className="space-y-3">
                      <div className="bg-blue-50 p-3 rounded">
                        <h6 className="font-medium text-blue-900 mb-2">עבור Features חדשים:</h6>
                        <ul className="text-sm text-blue-800 space-y-1">
                          <li>• הגדרת Entity/שדות נדרשים (אם רלוונטי)</li>
                          <li>• בירור הרשאות ב-<code>rolePermissions</code></li>
                          <li>• זיהוי Routes/Components מושפעים</li>
                          <li>• בדיקת תאימות עם אוטומציות קיימות</li>
                        </ul>
                      </div>
                      <div className="bg-green-50 p-3 rounded">
                        <h6 className="font-medium text-green-900 mb-2">עבור תיקוני באגים:</h6>
                        <ul className="text-sm text-green-800 space-y-1">
                          <li>• זיהוי מקור הבעיה (Entity/Function/Component)</li>
                          <li>• הערכת השפעה על משתמשים</li>
                          <li>• תכנון בדיקות (manual/unit)</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Inferred DoD */}
                  <div className="bg-white border rounded-lg p-4">
                    <h5 className="font-semibold text-gray-900 mb-4">Definition of Done (DoD) - נגזר</h5>
                    <div className="space-y-3">
                      <div className="bg-purple-50 p-3 rounded">
                        <h6 className="font-medium text-purple-900 mb-2">קודינג והטמעה:</h6>
                        <ul className="text-sm text-purple-800 space-y-1">
                          <li>• קוד נכתב ועובר Build תקין</li>
                          <li>• Entity schemas תקינים (אם רלוונטי)</li>
                          <li>• Components רנדרינג ללא שגיאות</li>
                          <li>• Functions רצות בהצלחה</li>
                        </ul>
                      </div>
                      <div className="bg-orange-50 p-3 rounded">
                        <h6 className="font-medium text-orange-900 mb-2">בדיקות ואיכות:</h6>
                        <ul className="text-sm text-orange-800 space-y-1">
                          <li>• בדיקה ב-happy path</li>
                          <li>• בדיקת edge cases בסיסיים</li>
                          <li>• אין שבירת תכונות קיימות</li>
                          <li>• RTL/A11y תקינים (לUI)</li>
                        </ul>
                      </div>
                      <div className="bg-red-50 p-3 rounded">
                        <h6 className="font-medium text-red-900 mb-2">תיעוד ופריסה:</h6>
                        <ul className="text-sm text-red-800 space-y-1">
                          <li>• עדכון תיעוד רלוונטי (אם נדרש)</li>
                          <li>• רישום ב-Change Log</li>
                          <li>• שחרור לסביבת ייצור</li>
                          <li>• הודעה למשתמשים (אם נדרש)</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Quality Gates */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h5 className="font-semibold text-gray-900 mb-3">שערי איכות (Quality Gates)</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="font-medium text-gray-800 mb-2">טכני:</div>
                        <ul className="text-sm text-gray-700 space-y-1">
                          <li>• אין import errors</li>
                          <li>• אין console.error ב-runtime</li>
                          <li>• Icons מה-Safe-List בלבד</li>
                          <li>• SSOT compliance</li>
                        </ul>
                      </div>
                      <div>
                        <div className="font-medium text-gray-800 mb-2">חווית משתמש:</div>
                        <ul className="text-sm text-gray-700 space-y-1">
                          <li>• הרשאות תקינות לפי Role</li>
                          <li>• עברית RTL תקינה</li>
                          <li>• ניווט וקישורים עובדים</li>
                          <li>• Loading states במקומות רלוונטיים</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h5 className="font-semibold text-blue-900 mb-2">כלים תומכים</h5>
                    <div className="text-sm text-blue-800 space-y-1">
                      <div>• <a href={createPageUrl("DevelopmentConsole")} className="underline">Development Console</a> - מעקב איכות ופיתוח</div>
                      <div>• <a href="#doc-technical" className="underline">Technical Docs</a> - סטנדרטים טכניים</div>
                      <div>• Role Guides - בדיקת UX לפי תפקיד</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            {/* @generated:admin-standards END */}

            {/* @generated:admin-doc-nav BEGIN */}
            <div id="admin-doc-nav" className="space-y-8">
              <Card className="border-none shadow-lg bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Search className="w-6 h-6 text-green-600" />
                    ניווט תיעוד
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">

                  {/* Quick Navigation */}
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h5 className="font-semibold text-green-900 mb-3">ניווט מהיר</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <h6 className="font-medium text-green-800 mb-2">סקירה כללית:</h6>
                        <ul className="text-sm space-y-1">
                          <li><a href="#doc-overview" className="text-blue-600 hover:underline">סקירת המערכת</a></li>
                          <li><a href="#doc-roles" className="text-blue-600 hover:underline">תפקידים והרשאות</a></li>
                          <li><a href="#doc-features" className="text-blue-600 hover:underline">תכונות המערכת</a></li>
                        </ul>
                      </div>
                      <div>
                        <h6 className="font-medium text-green-800 mb-2">טכני:</h6>
                        <ul className="text-sm space-y-1">
                          <li><a href="#doc-automations" className="text-blue-600 hover:underline">אוטומציות</a></li>
                          <li><a href="#doc-technical" className="text-blue-600 hover:underline">מידע טכני</a></li>
                          <li><a href="#doc-troubleshooting" className="text-blue-600 hover:underline">פתרון בעיות</a></li>
                        </ul>
                      </div>
                      <div>
                        <h6 className="font-medium text-green-800 mb-2">מעקב:</h6>
                        <ul className="text-sm space-y-1">
                          <li><a href="#doc-changelog" className="text-blue-600 hover:underline">Change Log</a></li>
                          <li><a href={createPageUrl("DevelopmentConsole")} className="text-blue-600 hover:underline">קונסול פיתוח</a></li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Role Guides Navigation */}
                  <div className="bg-white border rounded-lg p-4">
                    <h5 className="font-semibold text-gray-900 mb-4">מדריכי תפקידים</h5>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <a href="#guide-admin" className="p-3 bg-blue-50 rounded text-center hover:shadow transition-shadow">
                        <ShieldCheck className="w-5 h-5 mx-auto mb-1 text-blue-600" />
                        <div className="text-sm font-medium text-blue-900">מנהל מערכת</div>
                      </a>
                      <a href="#guide-store_manager" className="p-3 bg-green-50 rounded text-center hover:shadow transition-shadow">
                        <Users className="w-5 h-5 mx-auto mb-1 text-green-600" />
                        <div className="text-sm font-medium text-green-900">מנהל חנות</div>
                      </a>
                      <a href="#guide-baker" className="p-3 bg-orange-50 rounded text-center hover:shadow transition-shadow">
                        <Database className="w-5 h-5 mx-auto mb-1 text-orange-600" />
                        <div className="text-sm font-medium text-orange-900">אופה</div>
                      </a>
                      <a href="#guide-picker" className="p-3 bg-purple-50 rounded text-center hover:shadow transition-shadow">
                        <ListChecks className="w-5 h-5 mx-auto mb-1 text-purple-600" />
                        <div className="text-sm font-medium text-purple-900">מלקט</div>
                      </a>
                      <a href="#guide-picker_baker" className="p-3 bg-indigo-50 rounded text-center hover:shadow transition-shadow">
                        <Workflow className="w-5 h-5 mx-auto mb-1 text-indigo-600" />
                        <div className="text-sm font-medium text-indigo-900">מלקט ואופה</div>
                      </a>
                      <a href="#guide-courier" className="p-3 bg-red-50 rounded text-center hover:shadow transition-shadow">
                        <Users className="w-5 h-5 mx-auto mb-1 text-red-600" />
                        <div className="text-sm font-medium text-red-900">שליח</div>
                      </a>
                      <a href="#guide-pending" className="p-3 bg-gray-50 rounded text-center hover:shadow transition-shadow">
                        <ShieldCheck className="w-5 h-5 mx-auto mb-1 text-gray-600" />
                        <div className="text-sm font-medium text-gray-900">ממתין לאישור</div>
                      </a>
                      <a href="#guide-index" className="p-3 bg-yellow-50 rounded text-center hover:shadow transition-shadow">
                        <Search className="w-5 h-5 mx-auto mb-1 text-yellow-600" />
                        <div className="text-sm font-medium text-yellow-900">אינדקס מדריכים</div>
                      </a>
                    </div>
                  </div>

                  {/* Admin Big Picture Navigation */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h5 className="font-semibold text-blue-900 mb-3">תמונת על למנהל (מקטע זה)</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <ul className="text-sm space-y-1">
                          <li><a href="#admin-e2e" className="text-blue-700 hover:underline">• זרימה עסקית (E2E)</a></li>
                          <li><a href="#admin-ctrl" className="text-blue-700 hover:underline">• Command & Control</a></li>
                          <li><a href="#admin-rbac-map" className="text-blue-700 hover:underline">• מפת RBAC</a></li>
                        </ul>
                      </div>
                      <div>
                        <ul className="text-sm space-y-1">
                          <li><a href="#admin-telemetry" className="text-blue-700 hover:underline">• מדדים ומעקב</a></li>
                          <li><a href="#admin-change-mgmt" className="text-blue-700 hover:underline">• ניהול שינויים</a></li>
                          <li><a href="#admin-standards" className="text-blue-700 hover:underline">• סטנדרטים</a></li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* External Links */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h5 className="font-semibold text-gray-900 mb-3">קישורים חיצוניים</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h6 className="font-medium text-gray-800 mb-2">כלי ניהול:</h6>
                        <ul className="text-sm space-y-1">
                          <li><a href={createPageUrl("UserManagement")} className="text-blue-600 hover:underline">ניהול משתמשים</a></li>
                          <li><a href={createPageUrl("AdminNotifications")} className="text-blue-600 hover:underline">מרכז התראות</a></li>
                          <li><a href={createPageUrl("Settings")} className="text-blue-600 hover:underline">הגדרות מערכת</a></li>
                        </ul>
                      </div>
                      <div>
                        <h6 className="font-medium text-gray-800 mb-2">כלי פיתוח:</h6>
                        <ul className="text-sm space-y-1">
                          <li><a href={createPageUrl("DevelopmentConsole")} className="text-blue-600 hover:underline">קונסול פיתוח</a></li>
                          <li><a href={createPageUrl("EmailTester")} className="text-blue-600 hover:underline">מבחן מיילים</a></li>
                          <li><a href={createPageUrl("Analytics")} className="text-blue-600 hover:underline">אנליטיקה</a></li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Search Tips */}
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h5 className="font-semibold text-yellow-900 mb-2">טיפים לחיפוש</h5>
                    <ul className="text-sm text-yellow-800 space-y-1">
                      <li>• השתמש ב-Ctrl+F לחיפוש טקסט בדף</li>
                      <li>• בחיפוש מדריכים - השתמש בשמות תפקידים או מונחים טכניים</li>
                      <li>• בחיפוש קוד - השתמש בשמות Entities או Functions</li>
                      <li>• עוגנים (#) מאפשרים קישור ישיר למקטעים</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
            {/* @generated:admin-doc-nav END */}
          </TabsContent>

          {/* Technical Tab */}
          <TabsContent value="technical">
            {/* @generated:tech-entities BEGIN */}
            <div id="tech-entities" className="space-y-8">
              <Card className="border-none shadow-lg bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Database className="w-6 h-6 text-blue-600" />
                    ישויות וסכימות
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-4 bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>קישור למעקב טכני:</strong> לפירוט מקיף יותר, עיין ב-
                      <a href={createPageUrl("DevelopmentConsole")} className="text-blue-600 hover:text-blue-800 underline mx-1">
                        מעקב פיתוח
                      </a>
                      בסעיף "ישויות וסכמה"
                    </p>
                  </div>

                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-right">ישות</TableHead>
                          <TableHead className="text-right">שדה/נתיב</TableHead>
                          <TableHead className="text-right">סוג</TableHead>
                          <TableHead className="text-right">חובה</TableHead>
                          <TableHead className="text-right">הערות</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell><code>Order</code></TableCell>
                          <TableCell><code>items.baked_quantity</code></TableCell>
                          <TableCell>number</TableCell>
                          <TableCell>לא</TableCell>
                          <TableCell>כמות אפויה בפועל - עדכון מדפי אופים</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell><code>Order</code></TableCell>
                          <TableCell><code>items.picked_quantity</code></TableCell>
                          <TableCell>number</TableCell>
                          <TableCell>לא</TableCell>
                          <TableCell>כמות נלקטה - עדכון מליקוטים</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell><code>Order</code></TableCell>
                          <TableCell><code>items.location_breakdown</code></TableCell>
                          <TableCell>array</TableCell>
                          <TableCell>לא</TableCell>
                          <TableCell>פילוח מיקומים - מלקטים</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell><code>Order</code></TableCell>
                          <TableCell><code>location_bag_summary</code></TableCell>
                          <TableCell>array</TableCell>
                          <TableCell>לא</TableCell>
                          <TableCell>סיכום שקיות לפי מיקום</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell><code>Order</code></TableCell>
                          <TableCell><code>delivery_notes_internal</code></TableCell>
                          <TableCell>string</TableCell>
                          <TableCell>לא</TableCell>
                          <TableCell>הערות פנימיות למשלוח/איסוף</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell><code>User</code></TableCell>
                          <TableCell><code>custom_role</code></TableCell>
                          <TableCell>enum</TableCell>
                          <TableCell>כן</TableCell>
                          <TableCell>תפקיד מותאם - בסיס RBAC</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell><code>Invoice</code></TableCell>
                          <TableCell><code>messageId</code></TableCell>
                          <TableCell>string</TableCell>
                          <TableCell>כן</TableCell>
                          <TableCell>מזהה Gmail לזיהוי כפילויות</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell><code>Notification</code></TableCell>
                          <TableCell><code>dedupe_key</code></TableCell>
                          <TableCell>string</TableCell>
                          <TableCell>לא</TableCell>
                          <TableCell>מנע התראות כפולות</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell><code>AppSetting</code></TableCell>
                          <TableCell><code>key, value</code></TableCell>
                          <TableCell>string</TableCell>
                          <TableCell>כן</TableCell>
                          <TableCell>הגדרות גלובליות - כמו תאריך בדיקה אחרון</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>
            {/* @generated:tech-entities END */}

            {/* @generated:tech-dataflow BEGIN */}
            <div id="tech-dataflow" className="space-y-8">
              <Card className="border-none shadow-lg bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Workflow className="w-6 h-6 text-purple-600" />
                    זרימות נתונים
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="mb-4 bg-purple-50 p-4 rounded-lg">
                    <p className="text-sm text-purple-800">
                      <strong>תמונה מלאה:</strong> לזרימה עסקית כוללת, עיין ב-
                      <a href="#admin-e2e" className="text-purple-600 hover:text-purple-800 underline mx-1">
                        Value Stream (E2E)
                      </a>
                      בתמונת על למנהל מערכת
                    </p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                        <Database className="w-4 h-4" />
                        עדכון כמויות אפייה
                      </h4>
                      <div className="text-sm text-blue-800 space-y-1">
                        <p><strong>מקור:</strong> דף אופים → <code>BakingQuantityControl</code></p>
                        <p><strong>יעד:</strong> <code>Order.items.baked_quantity</code></p>
                        <p><strong>טריגר:</strong> שמירה ידנית מאופה</p>
                        <p><strong>Side-Effect:</strong> <code>syncOrderData</code> להזמנה מקורית</p>
                      </div>
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                        <ListChecks className="w-4 h-4" />
                        עדכון מצב ליקוט
                      </h4>
                      <div className="text-sm text-green-800 space-y-1">
                        <p><strong>מקור:</strong> דף ליקוטים → <code>ItemPickingList</code></p>
                        <p><strong>יעד:</strong> <code>Order.items.picked_quantity</code>, <code>picking_status</code></p>
                        <p><strong>טריגר:</strong> עדכון ליקוט פריט</p>
                        <p><strong>Side-Effect:</strong> עדכון <code>location_bag_summary</code></p>
                      </div>
                    </div>

                    <div className="bg-orange-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-orange-900 mb-3 flex items-center gap-2">
                        <Bell className="w-4 h-4" />
                        קליטת מיילים
                      </h4>
                      <div className="text-sm text-orange-800 space-y-1">
                        <p><strong>מקור:</strong> Gmail API → <code>checkEmails</code></p>
                        <p><strong>יעד:</strong> <code>Invoice</code> entities</p>
                        <p><strong>טריגר:</strong> יומי עם <code>triggerDailyEmailCheckIfMissed</code></p>
                        <p><strong>Side-Effect:</strong> עדכון <code>AppSetting</code> תאריך אחרון</p>
                      </div>
                    </div>

                    <div className="bg-red-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-red-900 mb-3 flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        עיבוד איחורים
                      </h4>
                      <div className="text-sm text-red-800 space-y-1">
                        <p><strong>מקור:</strong> <code>processOverduePickups</code> (22:00)</p>
                        <p><strong>יעד:</strong> <code>pickup_preferred_date</code> + יום</p>
                        <p><strong>טריגר:</strong> אוטומטי לפי זמן</p>
                        <p><strong>Side-Effect:</strong> הערות ב-<code>delivery_notes_internal</code></p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            {/* @generated:tech-dataflow END */}

            {/* @generated:tech-functions BEGIN */}
            <div id="tech-functions" className="space-y-8">
              <Card className="border-none shadow-lg bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Code2 className="w-6 h-6 text-green-600" />
                    פונקציות שרת ואוטומציות
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-4 flex gap-2">
                    <div className="bg-green-50 p-3 rounded-lg text-sm flex-1">
                      <strong>מעקב טכני:</strong>
                      <a href={createPageUrl("DevelopmentConsole")} className="text-green-600 hover:underline mx-1">
                        פונקציות שרת
                      </a>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-lg text-sm flex-1">
                      <strong>אוטומציות:</strong>
                      <a href="#doc-automations" className="text-blue-600 hover:underline mx-1">
                        סעיף אוטומציות
                      </a>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-right">שם</TableHead>
                          <TableHead className="text-right">מטרה</TableHead>
                          <TableHead className="text-right">קלטים</TableHead>
                          <TableHead className="text-right">Side-Effects</TableHead>
                          <TableHead className="text-right">אידמפוטנטיות</TableHead>
                          <TableHead className="text-right">טיפול שגיאות</TableHead>
                          <TableHead className="text-right">תזמון</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell><code>processOverduePickups</code></TableCell>
                          <TableCell>העברת איסופים מפגרים</TableCell>
                          <TableCell>הזמנות עם <code>status: "ממתין לאיסוף"</code></TableCell>
                          <TableCell>עדכון תאריכי איסוף + הערות</TableCell>
                          <TableCell>localStorage מניעת ריצה כפולה</TableCell>
                          <TableCell>try/catch + log שגיאות</TableCell>
                          <TableCell>יומי אחרי 22:00</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell><code>processOverdueDelivery</code></TableCell>
                          <TableCell>העברת משלוחים מפגרים</TableCell>
                          <TableCell>הזמנות עם <code>shipment_due_date</code> עבר</TableCell>
                          <TableCell>עדכון תאריכי משלוח + הערות</TableCell>
                          <TableCell>localStorage מניעת ריצה כפולה</TableCell>
                          <TableCell>try/catch + log שגיאות</TableCell>
                          <TableCell>יומי אחרי 20:00</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell><code>checkEmails</code></TableCell>
                          <TableCell>בדיקת מיילים ויצירת חשבוניות</TableCell>
                          <TableCell>Gmail API + תווית מסנן</TableCell>
                          <TableCell>יצירת <code>Invoice</code> entities</TableCell>
                          <TableCell><code>messageId</code> למניעת כפילויות</TableCell>
                          <TableCell>Gmail API errors + parse failures</TableCell>
                          <TableCell>יומי</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell><code>syncOrderData</code></TableCell>
                          <TableCell>סינכרון נתונים בין הזמנות</TableCell>
                          <TableCell>orderId + updateType + updateData</TableCell>
                          <TableCell>עדכון הזמנות מקושרות</TableCell>
                          <TableCell>בדיקת שינויים לפני עדכון</TableCell>
                          <TableCell>validation + rollback</TableCell>
                          <TableCell>triggered על ידי UI</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell><code>triggerDailyEmailCheckIfMissed</code></TableCell>
                          <TableCell>בדיקה אם נדרש להריץ checkEmails</TableCell>
                          <TableCell><code>AppSetting</code> תאריך אחרון</TableCell>
                          <TableCell>קריאה ל-<code>checkEmails</code></TableCell>
                          <TableCell>בדיקת זמן אחרון מול נוכחי</TableCell>
                          <TableCell>catch + log</TableCell>
                          <TableCell>auto במטמון Layout</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>
            {/* @generated:tech-functions END */}

            {/* @generated:tech-integrations BEGIN */}
            <div id="tech-integrations" className="space-y-8">
              <Card className="border-none shadow-lg bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Workflow className="w-6 h-6 text-orange-600" />
                    אינטגרציות וקונפיגורציה
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                    <div className="flex items-center gap-2 mb-2">
                      <ShieldCheck className="w-4 h-4 text-red-600" />
                      <h4 className="font-semibold text-red-900">אזהרת אבטחה</h4>
                    </div>
                    <p className="text-sm text-red-800">
                      כל ערכי הקונפיגורציה והסודות מנוהלים דרך משתני סביבה ולא מוצגים כאן.
                      גישה למשתני סביבה מוגבלת למנהלי מערכת בלבד.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-blue-900 mb-3">אינטגרציית Gmail</h4>
                      <div className="space-y-2 text-sm text-blue-800">
                        <p><strong>מטרה:</strong> חילוץ חשבוניות מהמייל</p>
                        <p><strong>API:</strong> Gmail API v1</p>
                        <p><strong>Authentication:</strong> OAuth 2.0</p>
                        <p><strong>Rate Limits:</strong> עוקב אחרי גבולות Google</p>
                      </div>
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-green-900 mb-3">אינטגרציית AI (Core)</h4>
                      <div className="space-y-2 text-sm text-green-800">
                        <p><strong>מטרה:</strong> עיבוד טקסט וחילוץ נתונים</p>
                        <p><strong>יכולות:</strong> InvokeLLM, ExtractDataFromUploadedFile</p>
                        <p><strong>Context:</strong> תמיכה בחיפוש אינטרנט</p>
                        <p><strong>Output:</strong> JSON מובנה</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h4 className="font-semibold text-gray-900 mb-4">משתני תצורה</h4>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-right">משתנה</TableHead>
                            <TableHead className="text-right">מטרה</TableHead>
                            <TableHead className="text-right">היקף</TableHead>
                            <TableHead className="text-right">חובה</TableHead>
                            <TableHead className="text-right">הערות</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell><code>GMAIL_CLIENT_ID</code></TableCell>
                            <TableCell>זיהוי OAuth Gmail</TableCell>
                            <TableCell>Server</TableCell>
                            <TableCell>כן</TableCell>
                            <TableCell>נדרש לחילוץ מיילים</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell><code>GMAIL_CLIENT_SECRET</code></TableCell>
                            <TableCell>סוד OAuth Gmail</TableCell>
                            <TableCell>Server</TableCell>
                            <TableCell>כן</TableCell>
                            <TableCell>מוצפן - לא לחשוף</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell><code>GMAIL_REFRESH_TOKEN</code></TableCell>
                            <TableCell>רענון טוקן Gmail</TableCell>
                            <TableCell>Server</TableCell>
                            <TableCell>כן</TableCell>
                            <TableCell>מוצפן - לא לחשוף</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell><code>OPENAI_API_KEY</code></TableCell>
                            <TableCell>גישה לשירותי AI</TableCell>
                            <TableCell>Server</TableCell>
                            <TableCell>כן</TableCell>
                            <TableCell>נדרש לעיבוד נתונים</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell><code>BASE44_APP_ID</code></TableCell>
                            <TableCell>מזהה אפליקציה</TableCell>
                            <TableCell>Global</TableCell>
                            <TableCell>אוטומטי</TableCell>
                            <TableCell>מוגדר אוטומטית</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            {/* @generated:tech-integrations END */}

            {/* @generated:tech-idempotency BEGIN */}
            <div id="tech-idempotency" className="space-y-8">
              <Card className="border-none shadow-lg bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <ShieldCheck className="w-6 h-6 text-indigo-600" />
                    אימותים, אידמפוטנטיות ונעילות
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="bg-indigo-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-indigo-900 mb-3 flex items-center gap-2">
                        <Database className="w-4 h-4" />
                        Schema Validation
                      </h4>
                      <div className="text-sm text-indigo-800 space-y-1">
                        <p>• כל Entity מוגדר בקובץ JSON Schema</p>
                        <p>• בדיקת טיפוסים וחובות</p>
                        <p>• Enum validation לסטטוסים</p>
                        <p>• Format validation לתאריכים</p>
                      </div>
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                        <ListChecks className="w-4 h-4" />
                        Logic Validation
                      </h4>
                      <div className="text-sm text-green-800 space-y-1">
                        <p>• בדיקת הרשאות לפני כתיבה</p>
                        <p>• וידוא עקביות בין שדות</p>
                        <p>• בדיקת קיום parent entities</p>
                        <p>• Cross-validation בין הזמנות</p>
                      </div>
                    </div>

                    <div className="bg-orange-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-orange-900 mb-3 flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        אידמפוטנטיות
                      </h4>
                      <div className="text-sm text-orange-800 space-y-1">
                        <p>• <code>messageId</code> למניעת מיילים כפולים</p>
                        <p>• <code>dedupe_key</code> להתראות</p>
                        <p>• localStorage למניעת ריצות כפולות</p>
                        <p>• תימות זמן לבדיקת עדכון אחרון</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h4 className="font-semibold text-gray-900 mb-4">מנגנוני אידמפוטנטיות לפי פונקציה</h4>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-right">פונקציה</TableHead>
                            <TableHead className="text-right">מפתח אידמפוטנטיות</TableHead>
                            <TableHead className="text-right">מנגנון</TableHead>
                            <TableHead className="text-right">חלון זמן</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell><code>checkEmails</code></TableCell>
                            <TableCell><code>messageId</code></TableCell>
                            <TableCell>בדיקה ב-DB לפני הוספה</TableCell>
                            <TableCell>קבוע</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell><code>processOverduePickups</code></TableCell>
                            <TableCell><code>processOverduePickups_lastRun</code></TableCell>
                            <TableCell>localStorage + תאריך</TableCell>
                            <TableCell>24 שעות</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell><code>processOverdueDelivery</code></TableCell>
                            <TableCell><code>processOverdueDeliveries_lastRun</code></TableCell>
                            <TableCell>localStorage + תאריך</TableCell>
                            <TableCell>24 שעות</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell><code>triggerDailyEmailCheckIfMissed</code></TableCell>
                            <TableCell><code>last_daily_email_check_date</code></TableCell>
                            <TableCell>AppSetting + תאריך</TableCell>
                            <TableCell>24 שעות</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell><code>syncOrderData</code></TableCell>
                            <TableCell>השוואת ערכים</TableCell>
                            <TableCell>diff לפני עדכון</TableCell>
                            <TableCell>מיידי</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            {/* @generated:tech-idempotency END */}

            {/* @generated:tech-errors BEGIN */}
            <div id="tech-errors" className="space-y-8">
              <Card className="border-none shadow-lg bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Info className="w-6 h-6 text-red-600" />
                    שגיאות, מצבי קצה ו-Retries
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-right">אזור</TableHead>
                          <TableHead className="text-right">דפוס שגיאה</TableHead>
                          <TableHead className="text-right">סיבה אפשרית</TableHead>
                          <TableHead className="text-right">השפעה על משתמש</TableHead>
                          <TableHead className="text-right">Retry אוטומטי</TableHead>
                          <TableHead className="text-right">פעולה ידנית</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell>Gmail Integration</TableCell>
                          <TableCell>Parsing מיילים כפול</TableCell>
                          <TableCell>messageId לא יחודי או שגיאת רשת</TableCell>
                          <TableCell>חשבוניות מיותרות</TableCell>
                          <TableCell>לא</TableCell>
                          <TableCell>
                            <a href={createPageUrl("Invoices")} className="text-blue-600 hover:underline">
                              נקה חשבוניות כפולות
                            </a>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Data Sync</TableCell>
                          <TableCell>כמויות לא מסונכרנות</TableCell>
                          <TableCell>כשל בsyncOrderData או rate limit</TableCell>
                          <TableCell>נתונים לא עקביים בין דפים</TableCell>
                          <TableCell>כן (3 ניסיונות)</TableCell>
                          <TableCell>
                            <a href={createPageUrl("OrderDataManagement")} className="text-blue-600 hover:underline">
                              תיקון נתוני הזמנות
                            </a>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Permissions</TableCell>
                          <TableCell>גישה נדחתה</TableCell>
                          <TableCell>תפקיד לא מאושר או הרשאות חסרות</TableCell>
                          <TableCell>חסימת פעולות</TableCell>
                          <TableCell>לא</TableCell>
                          <TableCell>
                            <a href={createPageUrl("UserManagement")} className="text-blue-600 hover:underline">
                              עדכן הרשאות משתמש
                            </a>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Data Loading</TableCell>
                          <TableCell>No-Data / Empty State</TableCell>
                          <TableCell>פילטרים מגבילים או אין נתונים</TableCell>
                          <TableCell>מסכים ריקים</TableCell>
                          <TableCell>לא</TableCell>
                          <TableCell>נקה פילטרים או הוסף נתונים</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Automation</TableCell>
                          <TableCell>פונקציה לא רצה בזמן</TableCell>
                          <TableCell>שגיאת רשת או תצורה</TableCell>
                          <TableCell>איחורים לא עובדו</TableCell>
                          <TableCell>ביום הבא</TableCell>
                          <TableCell>
                            <a href={createPageUrl("TestPickupProcessor")} className="text-blue-600 hover:underline">
                              הרצה ידנית
                            </a>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Export/Print</TableCell>
                          <TableCell>ייצוא כושל</TableCell>
                          <TableCell>נתונים גדולים מדי או שגיאת format</TableCell>
                          <TableCell>לא ניתן לייצא</TableCell>
                          <TableCell>לא</TableCell>
                          <TableCell>נסה פילטר קטן יותר או MD במקום PDF</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>

                  <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                      <h4 className="font-semibold text-red-900 mb-2">שגיאות קריטיות</h4>
                      <p className="text-sm text-red-800">
                        כשל בפונקציות אוטומטיות - דורש טיפול מיידי של מנהל מערכת
                      </p>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                      <h4 className="font-semibold text-yellow-900 mb-2">שגיאות בינוניות</h4>
                      <p className="text-sm text-yellow-800">
                        אי עקביות נתונים - ניתן לתקן דרך הממשקים הקיימים
                      </p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <h4 className="font-semibold text-blue-900 mb-2">שגיאות משתמש</h4>
                      <p className="text-sm text-blue-800">
                        הרשאות או פילטרים - הדרכת משתמש או עדכון הרשאות
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            {/* @generated:tech-errors END */}

            {/* @generated:tech-observability BEGIN */}
            <div id="tech-observability" className="space-y-8">
              <Card className="border-none shadow-lg bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Bell className="w-6 h-6 text-cyan-600" />
                    תצפיות וטלמטריה
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex gap-4 mb-6">
                    <div className="bg-cyan-50 p-3 rounded-lg text-sm flex-1">
                      <strong>מעקב מנהל:</strong>
                      <a href="#admin-telemetry" className="text-cyan-600 hover:underline mx-1">
                        Telemetry & Observability
                      </a>
                      בתמונת על למנהל
                    </div>
                    <div className="bg-purple-50 p-3 rounded-lg text-sm flex-1">
                      <strong>מעקב טכני:</strong>
                      <a href={createPageUrl("DevelopmentConsole")} className="text-purple-600 hover:underline mx-1">
                        Telemetry במעקב פיתוח
                      </a>
                    </div>
                  </div>

                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Info className="w-4 h-4 text-yellow-600" />
                      <h4 className="font-semibold text-yellow-900">מצב הטלמטריה</h4>
                    </div>
                    <p className="text-sm text-yellow-800">
                      כרגע אין מערכת טלמטריה מרכזית מוגדרת. המידע נאסף באופן פרטני בפונקציות השונות:
                    </p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-green-900 mb-3">מה נאסף כיום</h4>
                      <div className="text-sm text-green-800 space-y-1">
                        <p>• זמני ריצה אחרונים (localStorage)</p>
                        <p>• ספירת עדכונים באוטומציות</p>
                        <p>• לוגים ב-console.log</p>
                        <p>• שמירת מצב אחרון ב-AppSetting</p>
                        <p>• התראות למשתמשים (Notification entity)</p>
                      </div>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-blue-900 mb-3">היכן לראות</h4>
                      <div className="text-sm text-blue-800 space-y-2">
                        <p>
                          <strong>Browser Console:</strong> לוגי פונקציות וסטטוס ריצה
                        </p>
                        <p>
                          <strong>localStorage:</strong> מפתחות *_lastRun עם תימות זמן
                        </p>
                        <p>
                          <strong>התראות:</strong>
                          <a href={createPageUrl("AdminNotifications")} className="text-blue-600 hover:underline mx-1">
                            מרכז התראות
                          </a>
                        </p>
                        <p>
                          <strong>נתוני ביצועים:</strong> פונקציות מודדות זמן ריצה בגלוי
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h4 className="font-semibold text-gray-900 mb-4">מטריקות זמינות לפי פונקציה</h4>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-right">פונקציה</TableHead>
                            <TableHead className="text-right">מטריקה</TableHead>
                            <TableHead className="text-right">מיקום</TableHead>
                            <TableHead className="text-right">עדכון אחרון</TableHead>
                            <TableHead className="text-right">פורמט</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell><code>checkEmails</code></TableCell>
                            <TableCell>זמן ריצה אחרון + כמות מיילים</TableCell>
                            <TableCell>AppSetting + Console</TableCell>
                            <TableCell>יומי</TableCell>
                            <TableCell>ISO timestamp + count</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell><code>processOverduePickups</code></TableCell>
                            <TableCell>איסופים שעובדו + זמן ריצה</TableCell>
                            <TableCell>localStorage + Console</TableCell>
                            <TableCell>יומי אחרי 22:00</TableCell>
                            <TableCell>JSON עם timestamp וcount</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell><code>syncOrderData</code></TableCell>
                            <TableCell>הצלחות/כשלונות סינכרון</TableCell>
                            <TableCell>Console logs</TableCell>
                            <TableCell>בכל קריאה</TableCell>
                            <TableCell>Success/Error messages</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>UI Exports</TableCell>
                            <TableCell>שימוש בייצוא</TableCell>
                            <TableCell>Browser download events</TableCell>
                            <TableCell>בכל ייצוא</TableCell>
                            <TableCell>Download count (לא נשמר)</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            {/* @generated:tech-observability END */}

            {/* @generated:tech-performance BEGIN */}
            <div id="tech-performance" className="space-y-8">
              <Card className="border-none shadow-lg bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Workflow className="w-6 h-6 text-emerald-600" />
                    ביצועים וגבולות
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Info className="w-4 h-4 text-emerald-600" />
                      <h4 className="font-semibold text-emerald-900">מצב תקציבי ביצועים</h4>
                    </div>
                    <p className="text-sm text-emerald-800">
                      כרגע אין תקציבי ביצועים פורמליים מוגדרים בקוד. הנתונים הבאים מבוססים על התנהגות נצפית:
                    </p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        פונקציות שרת
                      </h4>
                      <div className="text-sm text-blue-800 space-y-2">
                        <div className="flex justify-between">
                          <span>checkEmails:</span>
                          <span className="font-mono">~5-15s</span>
                        </div>
                        <div className="flex justify-between">
                          <span>syncOrderData:</span>
                          <span className="font-mono">~1-3s</span>
                        </div>
                        <div className="flex justify-between">
                          <span>processOverdue*:</span>
                          <span className="font-mono">~2-8s</span>
                        </div>
                        <p className="text-xs text-blue-600 mt-2">
                          * תלוי בכמות הזמנות לעיבוד
                        </p>
                      </div>
                    </div>

                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-purple-900 mb-3 flex items-center gap-2">
                        <Database className="w-4 h-4" />
                        ממשק משתמש
                      </h4>
                      <div className="text-sm text-purple-800 space-y-2">
                        <div className="flex justify-between">
                          <span>טעינת דפים:</span>
                          <span className="font-mono">~1-2s</span>
                        </div>
                        <div className="flex justify-between">
                          <span>חיפוש (debounce):</span>
                          <span className="font-mono">250ms</span>
                        </div>
                        <div className="flex justify-between">
                          <span>עדכון טבלאות:</span>
                          <span className="font-mono">~0.5-1s</span>
                        </div>
                        <div className="flex justify-between">
                          <span>ייצוא MD:</span>
                          <span className="font-mono">~1-3s</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-yellow-900 mb-3 flex items-center gap-2">
                        <ListChecks className="w-4 h-4" />
                        מגבלות נתונים
                      </h4>
                      <div className="text-sm text-yellow-800 space-y-2">
                        <div className="flex justify-between">
                          <span>הזמנות בטבלה:</span>
                          <span className="font-mono">ללא מגבלה</span>
                        </div>
                        <div className="flex justify-between">
                          <span>פריטים בהזמנה:</span>
                          <span className="font-mono">ללא מגבלה</span>
                        </div>
                        <div className="flex justify-between">
                          <span>חיפוש תווים:</span>
                          <span className="font-mono">ללא מגבלה</span>
                        </div>
                        <div className="flex justify-between">
                          <span>ייצוא רשומות:</span>
                          <span className="font-mono">מוגבל בזיכרון</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-red-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-red-900 mb-3 flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4" />
                        Rate Limits
                      </h4>
                      <div className="text-sm text-red-800 space-y-2">
                        <div className="flex justify-between">
                          <span>Gmail API:</span>
                          <span className="font-mono">פר Google</span>
                        </div>
                        <div className="flex justify-between">
                          <span>OpenAI API:</span>
                          <span className="font-mono">פר מפתח</span>
                        </div>
                        <div className="flex justify-between">
                          <span>DB עדכונים:</span>
                          <span className="font-mono">Retry x3</span>
                        </div>
                        <p className="text-xs text-red-600 mt-2">
                          * כלולי נגנוני המתנה אוטומטיים
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h4 className="font-semibold text-gray-900 mb-4">אופטימיזציות קיימות</h4>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-sm">
                      <div className="space-y-2">
                        <p><strong>בממשק משתמש:</strong></p>
                        <ul className="list-disc list-inside text-gray-700 space-y-1 mr-4">
                          <li>Debounce לחיפוש (250ms)</li>
                          <li>Lazy loading לתוכן כבד</li>
                          <li>Virtual scrolling אינו מיושם</li>
                          <li>Client-side פילטרים</li>
                        </ul>
                      </div>
                      <div className="space-y-2">
                        <p><strong>בשרת:</strong></p>
                        <ul className="list-disc list-inside text-gray-700 space-y-1 mr-4">
                          <li>מנגנון אידמפוטנטיות מובנה</li>
                          <li>Rate limit handling עם retry</li>
                          <li>localStorage למניעת ריצות כפולות</li>
                          <li>Batch processing אינו מיושם</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            {/* @generated:tech-performance END */}

            {/* @generated:tech-security BEGIN */}
            <div id="tech-security" className="space-y-8">
              <Card className="border-none shadow-lg bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <ShieldCheck className="w-6 h-6 text-red-600" />
                    הרשאות ואבטחה
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex gap-4 mb-6">
                    <div className="bg-red-50 p-3 rounded-lg text-sm flex-1">
                      <strong>RBAC Map:</strong>
                      <a href="#admin-rbac-map" className="text-red-600 hover:underline mx-1">
                        מפת הרשאות מנהל
                      </a>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-lg text-sm flex-1">
                      <strong>מדריכי תפקידים:</strong>
                      <a href="#guide-index" className="text-blue-600 hover:underline mx-1">
                        הרשאות לפי Role
                      </a>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                      <h4 className="font-semibold text-red-900 mb-3 flex items-center gap-2">
                        <UserCog className="w-4 h-4" />
                        מבנה RBAC
                      </h4>
                      <div className="text-sm text-red-800 space-y-2">
                        <p><strong>בסיס:</strong> <code>User.custom_role</code></p>
                        <p><strong>בדיקה:</strong> <code>hasPageAccess(userRole, pageName)</code></p>
                        <p><strong>Fallback:</strong> הפניה ל-<code>getDefaultPageForRole</code></p>
                        <p><strong>Pending:</strong> משתמשים חדשים ממתינים לאישור</p>
                      </div>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                        <Database className="w-4 h-4" />
                        הגנות Built-in
                      </h4>
                      <div className="text-sm text-blue-800 space-y-2">
                        <p><strong>User Entity:</strong> רק admin יכול לעדכן משתמשים אחרים</p>
                        <p><strong>Service Role:</strong> פונקציות שרת עם הרשאות עליונות</p>
                        <p><strong>Client Auth:</strong> <code>User.me()</code> לזיהוי זהות</p>
                        <p><strong>Route Guards:</strong> בדיקה בכל ניווט</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h4 className="font-semibold text-gray-900 mb-4">מטריצת הרשאות טכנית</h4>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-right">תפקיד</TableHead>
                            <TableHead className="text-right">Read</TableHead>
                            <TableHead className="text-right">Write</TableHead>
                            <TableHead className="text-right">Execute</TableHead>
                            <TableHead className="text-right">Approve</TableHead>
                            <TableHead className="text-right">אזורים רגישים</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell><code>admin</code></TableCell>
                            <TableCell>
                              <Badge className="bg-green-100 text-green-800">הכל</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className="bg-green-100 text-green-800">הכל</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className="bg-green-100 text-green-800">הכל</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className="bg-green-100 text-green-800">כן</Badge>
                            </TableCell>
                            <TableCell>UserManagement, Invoices, DevConsole</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell><code>store_manager</code></TableCell>
                            <TableCell>
                              <Badge className="bg-green-100 text-green-800">הכל</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className="bg-green-100 text-green-800">הכל</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className="bg-yellow-100 text-yellow-800">חלקי</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className="bg-red-100 text-red-800">לא</Badge>
                            </TableCell>
                            <TableCell>מגבלות: UserManagement, Invoices</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell><code>baker</code></TableCell>
                            <TableCell>
                              <Badge className="bg-yellow-100 text-yellow-800">חלקי</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className="bg-yellow-100 text-yellow-800">חלקי</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className="bg-red-100 text-red-800">לא</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className="bg-red-100 text-red-800">לא</Badge>
                            </TableCell>
                            <TableCell>רק: Bakers, BakersManualOrder</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell><code>picker</code></TableCell>
                            <TableCell>
                              <Badge className="bg-yellow-100 text-yellow-800">חלקי</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className="bg-yellow-100 text-yellow-800">חלקי</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className="bg-red-100 text-red-800">לא</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className="bg-red-100 text-red-800">לא</Badge>
                            </TableCell>
                            <TableCell>Picking, Shipments, Inventory</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell><code>picker_baker</code></TableCell>
                            <TableCell>
                              <Badge className="bg-yellow-100 text-yellow-800">חלקי</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className="bg-yellow-100 text-yellow-800">חלקי</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className="bg-yellow-100 text-yellow-800">חלקי</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className="bg-red-100 text-red-800">לא</Badge>
                            </TableCell>
                            <TableCell>שילוב Baker + Picker</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell><code>courier</code></TableCell>
                            <TableCell>
                              <Badge className="bg-red-100 text-red-800">מוגבל</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className="bg-yellow-100 text-yellow-800">חלקי</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className="bg-red-100 text-red-800">לא</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className="bg-red-100 text-red-800">לא</Badge>
                            </TableCell>
                            <TableCell>רק: CourierDashboard, delivery updates</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell><code>pending</code></TableCell>
                            <TableCell>
                              <Badge className="bg-red-100 text-red-800">מוגבל</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className="bg-red-100 text-red-800">לא</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className="bg-red-100 text-red-800">לא</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className="bg-red-100 text-red-800">לא</Badge>
                            </TableCell>
                            <TableCell>רק: PendingApproval</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <h4 className="font-semibold text-green-900 mb-2">אימות זהות</h4>
                      <div className="text-sm text-green-800 space-y-1">
                        <p>• Google OAuth integration</p>
                        <p>• <code>User.me()</code> session validation</p>
                        <p>• Automatic logout on auth failure</p>
                      </div>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <h4 className="font-semibold text-blue-900 mb-2">הגנות נתונים</h4>
                      <div className="text-sm text-blue-800 space-y-1">
                        <p>• Entity-level access control</p>
                        <p>• Field-level restrictions (RLS)</p>
                        <p>• Cross-user data isolation</p>
                      </div>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                      <h4 className="font-semibold text-purple-900 mb-2">ביקורת ורישום</h4>
                      <div className="text-sm text-purple-800 space-y-1">
                        <p>• <code>created_by</code> automatic field</p>
                        <p>• <code>updated_date</code> timestamps</p>
                        <p>• Change Log integration</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            {/* @generated:tech-security END */}

            {/* @generated:tech-testing BEGIN */}
            <div id="tech-testing" className="space-y-8">
              <Card className="border-none shadow-lg bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <ListChecks className="w-6 h-6 text-indigo-600" />
                    בדיקות ותצורות סביבות
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                    <p className="text-sm text-indigo-800">
                      <strong>קישור למעקב איכות:</strong>
                      <a href={createPageUrl("DevelopmentConsole")} className="text-indigo-600 hover:underline mx-1">
                        Quality Gates במעקב פיתוח
                      </a>
                    </p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4" />
                        מצבי UI מכוסים
                      </h4>
                      <div className="text-sm text-green-800 space-y-2">
                        <p><strong>Loading States:</strong> spinner וanimations</p>
                        <p><strong>Empty States:</strong> הודעות "אין נתונים" + CTA</p>
                        <p><strong>Error States:</strong> הודעות שגיאה + recovery</p>
                        <p><strong>No-Data:</strong> מסכים ריקים עם הדרכה</p>
                        <p><strong>Permission Denied:</strong> הפניה לדף מתאים</p>
                      </div>
                    </div>

                    <div className="bg-orange-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-orange-900 mb-3 flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        בדיקות ידניות
                      </h4>
                      <div className="text-sm text-orange-800 space-y-2">
                        <p><strong>Role Switching:</strong> בדיקת הרשאות לכל תפקיד</p>
                        <p><strong>Data Flow:</strong> סינכרון בין הזמנות</p>
                        <p><strong>Automation:</strong>
                          <a href={createPageUrl("TestPickupProcessor")} className="text-orange-600 hover:underline mx-1">
                            בדיקות איסוף
                          </a>
                        </p>
                        <p><strong>Export/Print:</strong> בדיקת פורמטים</p>
                      </div>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                        <Code2 className="w-4 h-4" />
                        בדיקות אוטומטיות
                      </h4>
                      <div className="text-sm text-blue-800 space-y-2">
                        <p><strong>Build Validation:</strong> TypeScript/Lint תקין</p>
                        <p><strong>Import Testing:</strong> fallback לאייקונים</p>
                        <p><strong>Schema Validation:</strong> Entity constraints</p>
                        <p><strong>Idempotency:</strong> בדיקת מניעת כפילויות</p>
                      </div>
                    </div>

                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-purple-900 mb-3 flex items-center gap-2">
                        <Database className="w-4 h-4" />
                        תצורות סביבות
                      </h4>
                      <div className="text-sm text-purple-800 space-y-2">
                        <p><strong>Development:</strong> local build + hot reload</p>
                        <p><strong>Production:</strong> optimized build</p>
                        <p><strong>Secrets:</strong> environment variables</p>
                        <p><strong>API Integration:</strong> live Gmail/OpenAI</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h4 className="font-semibold text-gray-900 mb-4">צ'קליסט QA לפיצ'ר חדש</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-sm">
                        <div className="space-y-2">
                          <p><strong>תצורה טכנית:</strong></p>
                          <ul className="list-disc list-inside text-gray-700 space-y-1 mr-4">
                            <li>Build עובר ללא שגיאות</li>
                            <li>כל ה-imports תקינים</li>
                            <li>RTL layout נבדק</li>
                            <li>נגישות (A11y) מאומתת</li>
                            <li>Icons מ-Safe-List בלבד</li>
                          </ul>
                        </div>
                        <div className="space-y-2">
                          <p><strong>פונקציונליות:</strong></p>
                          <ul className="list-disc list-inside text-gray-700 space-y-1 mr-4">
                            <li>כל מצבי UI עובדים (Loading/Empty/Error)</li>
                            <li>הרשאות לכל תפקיד נבדקו</li>
                            <li>Cross-links פעילים</li>
                            <li>Export/Print תקין</li>
                            <li>Mobile responsive</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            {/* @generated:tech-testing END */}

            {/* @generated:tech-versioning BEGIN */}
            <div id="tech-versioning" className="space-y-8">
              <Card className="border-none shadow-lg bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <FileText className="w-6 h-6 text-teal-600" />
                    גרסאות ושינויי סכמה
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex gap-4 mb-6">
                    <div className="bg-teal-50 p-3 rounded-lg text-sm flex-1">
                      <strong>Change Log:</strong>
                      <a href="#doc-changelog" className="text-teal-600 hover:underline mx-1">
                        רישום שינויים בתיעוד
                      </a>
                    </div>
                    <div className="bg-purple-50 p-3 rounded-lg text-sm flex-1">
                      <strong>DevConsole:</strong>
                      <a href={createPageUrl("DevelopmentConsole")} className="text-purple-600 hover:underline mx-1">
                        Change Log Integration
                      </a>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-teal-50 p-4 rounded-lg border border-teal-200">
                      <h4 className="font-semibold text-teal-900 mb-3 flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        מדיניות גרסאות
                      </h4>
                      <div className="text-sm text-teal-800 space-y-2">
                        <p><strong>פורמט:</strong> <code>PHASE X: תיאור (רכיבים)</code></p>
                        <p><strong>שדות חובה:</strong> תאריך, מבצע, תיאור, השפעה</p>
                        <p><strong>רמות:</strong> Major (Entity שינוי) / Minor (UI/Features)</p>
                        <p><strong>Backward Compatibility:</strong> נשמרת תמיד</p>
                      </div>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                        <Database className="w-4 h-4" />
                        שינויי סכמה
                      </h4>
                      <div className="text-sm text-blue-800 space-y-2">
                        <p><strong>הוספת שדות:</strong> תמיד עם default value</p>
                        <p><strong>שינוי טיפוס:</strong> עם migration script</p>
                        <p><strong>מחיקת שדות:</strong> deprecated תחילה</p>
                        <p><strong>Rollback:</strong> נתמך לשינויים קטנים</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h4 className="font-semibold text-gray-900 mb-4">היסטוריית גרסאות עיקריות</h4>
                    <div className="space-y-3">
                      <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-green-900">v1.0 - Base System</span>
                          <span className="text-xs text-green-700">{israelTime.split(' ')[0]}</span>
                        </div>
                        <p className="text-sm text-green-800">
                          ✅ Core entities (Order, User, Invoice) • Basic RBAC • Gmail integration
                        </p>
                      </div>

                      <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-blue-900">v1.1 - Baking System</span>
                          <span className="text-xs text-blue-700">{israelTime.split(' ')[0]}</span>
                        </div>
                        <p className="text-sm text-blue-800">
                          ✅ baked_quantity field • BakingAnalytics • syncOrderData • Order splitting
                        </p>
                      </div>

                      <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-purple-900">v1.2 - Advanced Logistics</span>
                          <span className="text-xs text-purple-700">{israelTime.split(' ')[0]}</span>
                        </div>
                        <p className="text-sm text-purple-800">
                          ✅ location_breakdown • Overdue processors • Notifications • PublicShipmentList
                        </p>
                      </div>

                      <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-orange-900">v1.3 - Documentation & QA</span>
                          <span className="text-xs text-orange-700">{israelTime.split(' ')[0]}</span>
                        </div>
                        <p className="text-sm text-orange-800">
                          ✅ Role Guides • DevConsole • Admin Big-Picture • Technical Info • Cross-linking
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h4 className="font-semibold text-gray-900 mb-4">Naming Conventions</h4>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-right">סוג</TableHead>
                            <TableHead className="text-right">קונבנציה</TableHead>
                            <TableHead className="text-right">דוגמה</TableHead>
                            <TableHead className="text-right">הערות</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell>Entities</TableCell>
                            <TableCell>PascalCase</TableCell>
                            <TableCell><code>Order</code>, <code>User</code></TableCell>
                            <TableCell>יחידה, לא רבים</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Fields</TableCell>
                            <TableCell>snake_case</TableCell>
                            <TableCell><code>baked_quantity</code>, <code>custom_role</code></TableCell>
                            <TableCell>עקבי לכל השדות</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Components</TableCell>
                            <TableCell>PascalCase</TableCell>
                            <TableCell><code>BakingOrderCard</code></TableCell>
                            <TableCell>תיאור תכלית</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Functions</TableCell>
                            <TableCell>camelCase</TableCell>
                            <TableCell><code>processOverduePickups</code></TableCell>
                            <TableCell>פועל + אובייקט</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Pages</TableCell>
                            <TableCell>PascalCase</TableCell>
                            <TableCell><code>OrderDetails</code></TableCell>
                            <TableCell>ללא סיומת Page</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Routes</TableCell>
                            <TableCell>PascalCase</TableCell>
                            <TableCell><code>createPageUrl("Bakers")</code></TableCell>
                            <TableCell>זהה לשם הדף</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            {/* @generated:tech-versioning END */}
          </TabsContent>
        </Tabs>

        {/* Traceability Footer */}
        <div className="mt-16 pt-8 border-t border-gray-200 no-print">
          <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
            <div className="flex justify-between items-center">
              <div>
                <strong>עודכן לאחרונה:</strong> {israelTime} (Asia/Jerusalem)
              </div>
              <div>
                <strong>עודכן על ידי:</strong> Base44
              </div>
            </div>
            <div className="mt-2">
              <strong>Change Log:</strong> PHASE 4: Admin Big-Picture added (E2E, Command&Control, RBAC, Telemetry, Change Mgmt, Standards, Doc Nav)
            </div>
            <div className="mt-1 text-xs">
              <strong>ISO Timestamp:</strong> {lastUpdated}
            </div>
          </div>
        </div>
      </div>

      {/* Print CSS */}
      <style jsx>{`
        @media print {
          .no-print {
            display: none !important;
          }

          .print-header {
            display: block !important;
            margin-bottom: 2rem;
            padding-bottom: 1rem;
            border-bottom: 2px solid #000;
          }

          .print-header h1 {
            font-size: 24px;
            font-weight: bold;
            margin: 0;
            color: #000; /* Ensure black text for print */
          }

          .print-header .print-date {
            font-size: 12px;
            color: #666;
          }

          h1, h2, h3, h4, h5, h6 {
            page-break-after: avoid;
            font-weight: bold;
            color: #000; /* Ensure headings are black */
          }

          p, ul, ol, table {
            page-break-inside: avoid;
            margin-bottom: 0.5rem;
            color: #000; /* Ensure text is black */
          }

          .card {
            break-inside: avoid;
            margin-bottom: 1rem;
            border: 1px solid #ccc; /* Add border for cards in print */
            box-shadow: none; /* Remove shadow in print */
            background-color: #fff !important; /* Ensure white background */
          }

          .card-header, .card-content {
            background-color: #fff !important;
            color: #000;
          }

          .bg-gray-50, .bg-blue-50, .bg-green-50, .bg-purple-50, .bg-orange-50, .bg-red-50, .bg-yellow-50, .bg-indigo-50, .bg-cyan-50, .bg-teal-50, .bg-emerald-50 {
            background-color: #f9f9f9 !important; /* Light background for code blocks etc. */
            border: 1px solid #eee;
          }
          .bg-green-100, .bg-blue-100, .bg-yellow-100, .bg-red-100 { /* For Badges */
            background-color: #f0f0f0 !important;
            color: #333 !important;
          }


          table {
            border-collapse: collapse;
            width: 100%;
          }
          table, th, td {
            border: 1px solid #ddd;
          }
          th, td {
            padding: 8px;
            text-align: right;
            color: #000;
          }
          thead tr {
            background-color: #f2f2f2 !important;
          }

          a {
            text-decoration: underline;
            color: #0000ee; /* Standard blue for links */
          }

          code {
            background-color: #eee;
            padding: 2px 4px;
            border-radius: 3px;
          }

          @page {
            margin: 2cm;
            @top-right {
              content: "עמוד " counter(page);
            }
          }
        }

        @media screen {
          .print-header {
            display: none;
          }
        }
      `}</style>

      {/* Print Header (only visible when printing) */}
      <div className="print-header">
        <h1>מדריך ותיעוד - מערכת סורק הזמנות</h1>
        <div className="print-date">הודפס ב: {israelTime}</div>
      </div>
    </div>
  );
}

