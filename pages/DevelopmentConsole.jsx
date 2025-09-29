
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
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
  Info
} from "lucide-react";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import { createPageUrl } from "@/utils";

export default function DevelopmentConsolePage() {
  const [activeTab, setActiveTab] = useState("scope");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(false);

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
            <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-green-700 rounded-xl flex items-center justify-center">
              <Code2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">מעקב פיתוח</h1>
              <p className="text-gray-600 text-lg">קונסולת מפתחים - מעקב אחרי רכיבים, פונקציות וכיסוי</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const scopeData = document.getElementById('dev-scope');
                const coverageData = document.getElementById('dev-role-coverage');
                const technicalData = document.getElementById('dev-entities'); // New: include entities
                const technicalComponents = document.getElementById('dev-components'); // New: include components
                const technicalFunctions = document.getElementById('dev-functions'); // New: include functions
                const uiuxData = document.getElementById('dev-uiux'); // New: include ui/ux
                const qualityData = document.getElementById('dev-quality'); // New: include quality
                const changelogData = document.getElementById('dev-changelog'); // New: include changelog
                const telemetryData = document.getElementById('dev-telemetry'); // New: include telemetry
                const knownIssuesData = document.getElementById('dev-known'); // New: include known issues
                const backupsData = document.getElementById('dev-backups'); // New: include backups

                let content = `# מעקב פיתוח - דוח\n\n`;
                content += `## דוח נוצר ב: ${israelTime}\n\n`;

                if (scopeData) content += `## היקף ומטריצת סטטוס\n\n${scopeData.innerText}\n\n`;
                if (technicalData) content += `## ישויות וסכמות\n\n${technicalData.innerText}\n\n`;
                if (technicalComponents) content += `## רכיבי מערכת\n\n${technicalComponents.innerText}\n\n`;
                if (technicalFunctions) content += `## פונקציות Backend\n\n${technicalFunctions.innerText}\n\n`;
                if (uiuxData) content += `## שינויי UI/UX\n\n${uiuxData.innerText}\n\n`;
                if (qualityData) content += `## שערי איכות (DoR/DoD)\n\n${qualityData.innerText}\n\n`;
                if (changelogData) content += `## אינטגרציה עם Change Log\n\n${changelogData.innerText}\n\n`;
                if (coverageData) content += `## כיסוי לפי תפקידים\n\n${coverageData.innerText}\n\n`;
                if (telemetryData) content += `## טלמטריה וניטור\n\n${telemetryData.innerText}\n\n`;
                if (knownIssuesData) content += `## בעיות ידועות ו-TODOs\n\n${knownIssuesData.innerText}\n\n`;
                if (backupsData) content += `## מערכת גיבוי ושחזור\n\n${backupsData.innerText}\n\n`;


                const blob = new Blob([content], { type: 'text/markdown' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'development-console-report.md';
                a.click();
                URL.revokeObjectURL(url);
              }}
              aria-label="ייצוא נתוני מעקב הפיתוח כקובץ Markdown"
            >
              <FileDown className="w-4 h-4 mr-2" />
              ייצוא נתונים
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.print()}
              aria-label="הדפסת דוח מעקב הפיתוח"
            >
              <Printer className="w-4 h-4 mr-2" />
              הדפס
            </Button>
          </div>
        </div>

        {/* Print Header */}
        <div className="print-header">
          <h1>מעקב פיתוח - מערכת סורק הזמנות</h1>
          <div className="print-date">הודפס ב: {israelTime}</div>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-5 mb-8 no-print">
            <TabsTrigger value="scope">היקף ומטריצת סטטוס</TabsTrigger>
            <TabsTrigger value="technical">טכני</TabsTrigger>
            <TabsTrigger value="quality">איכות ותהליכים</TabsTrigger>
            <TabsTrigger value="coverage">כיסוי תפקידים</TabsTrigger>
            <TabsTrigger value="monitoring">ניטור</TabsTrigger>
          </TabsList>

          {/* Scope & Status Tab */}
          <TabsContent value="scope">
            {/* @generated:dev-scope BEGIN */}
            <div id="dev-scope" className="space-y-8">
              <Card className="border-none shadow-lg bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <ListChecks className="w-6 h-6 text-green-600" />
                    מטריצת היקף וסטטוס
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Filters - Enhanced with loading states and accessibility */}
                  <div className="flex gap-4 items-center no-print">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="חיפוש פריטים..."
                          value={searchTerm}
                          onChange={(e) => {
                            const value = e.target.value;
                            // @ts-ignore
                            clearTimeout(window.devSearchTimeout);
                            // @ts-ignore
                            window.devSearchTimeout = setTimeout(() => {
                              setSearchTerm(value);
                            }, 250);
                          }}
                          className="pr-10"
                          aria-label="חיפוש בפריטי הפיתוח"
                        />
                      </div>
                    </div>
                    <Select
                      value={statusFilter}
                      onValueChange={setStatusFilter}
                      aria-label="סינון לפי סטטוס"
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="סטטוס" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">הכל</SelectItem>
                        <SelectItem value="done">הושלם</SelectItem>
                        <SelectItem value="in-dev">בפיתוח</SelectItem>
                        <SelectItem value="in-qa">בבדיקה</SelectItem>
                        <SelectItem value="approved">אושר</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select
                      value={typeFilter}
                      onValueChange={setTypeFilter}
                      aria-label="סינון לפי סוג"
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="סוג" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">הכל</SelectItem>
                        <SelectItem value="feature">פיצ'ר</SelectItem>
                        <SelectItem value="function">פונקציה</SelectItem>
                        <SelectItem value="component">רכיב</SelectItem>
                        <SelectItem value="entity">ישות</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Status Matrix Table - Enhanced with loading and empty states */}
                  <div className="overflow-x-auto">
                    {isLoading ? (
                      <div className="flex justify-center py-8" role="status" aria-label="טוען נתונים">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                      </div>
                    ) : (
                      <Table role="table" aria-label="מטריצת סטטוס פיתוח">
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-right">ID</TableHead>
                            <TableHead className="text-right">כותרת</TableHead>
                            <TableHead className="text-right">סוג</TableHead>
                            <TableHead className="text-right">אחראי</TableHead>
                            <TableHead className="text-right">סטטוס</TableHead>
                            <TableHead className="text-right">קישורים</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {/* Existing table rows with enhanced accessibility */}
                          <TableRow>
                            <TableCell>BAK-001</TableCell>
                            <TableCell>ניהול אפייה ותכנון ייצור</TableCell>
                            <TableCell>
                              <Badge variant="secondary" aria-label="סוג: פיצ'ר">Feature</Badge>
                            </TableCell>
                            <TableCell>System</TableCell>
                            <TableCell>
                              <Badge
                                className="bg-green-100 text-green-800"
                                aria-label="סטטוס: הושלם"
                              >
                                הושלם
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <a
                                href={createPageUrl("Bakers")}
                                className="text-blue-600 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                                aria-label="עבור לדף אופים"
                              >
                                דף אופים
                              </a>
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>PICK-001</TableCell>
                            <TableCell>מערכת ליקוטים מתקדמת</TableCell>
                            <TableCell>
                              <Badge variant="secondary" aria-label="סוג: פיצ'ר">Feature</Badge>
                            </TableCell>
                            <TableCell>System</TableCell>
                            <TableCell>
                              <Badge
                                className="bg-green-100 text-green-800"
                                aria-label="סטטוס: הושלם"
                              >
                                הושלם
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <a
                                href={createPageUrl("Picking")}
                                className="text-blue-600 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                                aria-label="עבור לדף ליקוטים"
                              >
                                דף ליקוטים
                              </a>
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>SHIP-001</TableCell>
                            <TableCell>ניהול משלוחים ואיסופים</TableCell>
                            <TableCell>
                              <Badge variant="secondary" aria-label="סוג: פיצ'ר">Feature</Badge>
                            </TableCell>
                            <TableCell>System</TableCell>
                            <TableCell>
                              <Badge
                                className="bg-green-100 text-green-800"
                                aria-label="סטטוס: הושלם"
                              >
                                הושלם
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="space-x-2">
                                <a
                                  href={createPageUrl("Shipments")}
                                  className="text-blue-600 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                                  aria-label="עבור לדף משלוחים"
                                >
                                  משלוחים
                                </a>
                                <a
                                  href={createPageUrl("Pickups")}
                                  className="text-blue-600 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                                  aria-label="עבור לדף איסופים"
                                >
                                  איסופים
                                </a>
                              </div>
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>AUTO-001</TableCell>
                            <TableCell>אוטומציות יומיות</TableCell>
                            <TableCell>
                              <Badge variant="secondary" aria-label="סוג: פונקציה">Function</Badge>
                            </TableCell>
                            <TableCell>System</TableCell>
                            <TableCell>
                              <Badge
                                className="bg-green-100 text-green-800"
                                aria-label="סטטוס: הושלם"
                              >
                                הושלם
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <span className="text-gray-500">Backend Functions</span>
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    )}

                    {/* Empty State */}
                    {!isLoading && searchTerm && (
                      <div className="text-center py-8 text-gray-500">
                        <Info className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <h3 className="text-lg font-semibold mb-2">לא נמצאו תוצאות</h3>
                        <p>נסה מונחי חיפוש אחרים או נקה את הפילטרים</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
            {/* @generated:dev-scope END */}
          </TabsContent>

          {/* Technical Tab */}
          <TabsContent value="technical">
            {/* @generated:dev-entities BEGIN */}
            <div id="dev-entities" className="space-y-8">
              <Card className="border-none shadow-lg bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Database className="w-6 h-6 text-blue-600" />
                    ישויות וסכמות
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-blue-900 mb-3">Order Entity</h4>
                      <div className="space-y-2 text-sm text-blue-800">
                        <div><code>items[].baked_quantity</code> - כמות אפויה בפועל</div>
                        <div><code>picking_status</code> - סטטוס ליקוט</div>
                        <div><code>location_bag_summary</code> - סיכום שקיות לפי מיקום</div>
                        <div><code>shipping_method_chosen</code> - שיטת משלוח נבחרת</div>
                        <div><code>courier_company</code> - חברת שילוח</div>
                      </div>
                      <div className="mt-3">
                        <span className="text-xs text-blue-700">
                          <strong>Writers:</strong> דפי תכנון ייצור, ליקוטים, משלוחים
                        </span>
                      </div>
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-green-900 mb-3">Invoice Entity</h4>
                      <div className="space-y-2 text-sm text-green-800">
                        <div><code>messageId</code> - מזהה מייל יחודי</div>
                        <div><code>vendor</code> - שם הספק</div>
                        <div><code>total</code> - סכום כולל</div>
                        <div><code>status</code> - סטטוס טיפול</div>
                        <div><code>confidence</code> - ציון ביטחון זיהוי</div>
                      </div>
                      <div className="mt-3">
                        <span className="text-xs text-green-700">
                          <strong>Writers:</strong> checkEmails function
                        </span>
                      </div>
                    </div>

                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-purple-900 mb-3">User Entity</h4>
                      <div className="space-y-2 text-sm text-purple-800">
                        <div><code>custom_role</code> - תפקיד מותאם במערכת</div>
                        <div><code>approved_by</code> - מי אישר המשתמש</div>
                        <div><code>approved_date</code> - תאריך אישור</div>
                        <div><code>courier_company_affiliation</code> - שיוך לחברת שילוח</div>
                      </div>
                      <div className="mt-3">
                        <span className="text-xs text-purple-700">
                          <strong>Writers:</strong> UserManagement, אישור משתמשים
                        </span>
                      </div>
                    </div>

                    <div className="bg-orange-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-orange-900 mb-3">Notification Entity</h4>
                      <div className="space-y-2 text-sm text-orange-800">
                        <div><code>recipient_role</code> - תפקיד מקבל ההתראה</div>
                        <div><code>type</code> - סוג ההתראה</div>
                        <div><code>is_read</code> - האם נקראה</div>
                        <div><code>dedupe_key</code> - מניעת כפילויות</div>
                      </div>
                      <div className="mt-3">
                        <span className="text-xs text-orange-700">
                          <strong>Writers:</strong> Notification system
                        </span>
                      </div>
                    </div>

                  </div>
                </CardContent>
              </Card>
            </div>
            {/* @generated:dev-entities END */}

            {/* @generated:dev-components BEGIN */}
            <div id="dev-components" className="space-y-8">
              <Card className="border-none shadow-lg bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Code2 className="w-6 h-6 text-purple-600" />
                    רכיבי מערכת
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-right">שם הרכיב</TableHead>
                          <TableHead className="text-right">מטרה</TableHead>
                          <TableHead className="text-right">Props עיקריים</TableHead>
                          <TableHead className="text-right">מצב</TableHead>
                          <TableHead className="text-right">בשימוש ב</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell><code>BakingOrderCard</code></TableCell>
                          <TableCell>כרטיס הזמנת אפייה</TableCell>
                          <TableCell>order, onUpdate</TableCell>
                          <TableCell>
                            <Badge className="bg-green-100 text-green-800" aria-label="מצב: פעיל">פעיל</Badge>
                          </TableCell>
                          <TableCell>
                            <a href={createPageUrl("Bakers")} className="text-blue-600 hover:underline">
                              Bakers
                            </a>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell><code>BakingAnalytics</code></TableCell>
                          <TableCell>אנליטיקה לאפייה</TableCell>
                          <TableCell>dateRange, data</TableCell>
                          <TableCell>
                            <Badge className="bg-green-100 text-green-800" aria-label="מצב: פעיל">פעיל</Badge>
                          </TableCell>
                          <TableCell>
                            <a href={createPageUrl("Bakers")} className="text-blue-600 hover:underline">
                              Bakers
                            </a>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell><code>ItemPickingList</code></TableCell>
                          <TableCell>רשימת פריטים לליקוט</TableCell>
                          <TableCell>order, onUpdate, inEditMode</TableCell>
                          <TableCell>
                            <Badge className="bg-green-100 text-green-800" aria-label="מצב: פעיל">פעיל</Badge>
                          </TableCell>
                          <TableCell>
                            <a href={createPageUrl("Picking")} className="text-blue-600 hover:underline">
                              Picking, OrderDetails
                            </a>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell><code>PickingOrderCard</code></TableCell>
                          <TableCell>כרטיס הזמנה לליקוט</TableCell>
                          <TableCell>order, onUpdate</TableCell>
                          <TableCell>
                            <Badge className="bg-green-100 text-green-800" aria-label="מצב: פעיל">פעיל</Badge>
                          </TableCell>
                          <TableCell>
                            <a href={createPageUrl("Picking")} className="text-blue-600 hover:underline">
                              Picking
                            </a>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell><code>ShipmentSummary</code></TableCell>
                          <TableCell>סיכום משלוחים</TableCell>
                          <TableCell>orders, onUpdate</TableCell>
                          <TableCell>
                            <Badge className="bg-green-100 text-green-800" aria-label="מצב: פעיל">פעיל</Badge>
                          </TableCell>
                          <TableCell>
                            <a href={createPageUrl("Shipments")} className="text-blue-600 hover:underline">
                              Shipments
                            </a>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell><code>PickupSummary</code></TableCell>
                          <TableCell>סיכום איסופים</TableCell>
                          <TableCell>orders, onUpdate</TableCell>
                          <TableCell>
                            <Badge className="bg-green-100 text-green-800" aria-label="מצב: פעיל">פעיל</Badge>
                          </TableCell>
                          <TableCell>
                            <a href={createPageUrl("Pickups")} className="text-blue-600 hover:underline">
                              Pickups
                            </a>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell><code>GlobalSearch</code></TableCell>
                          <TableCell>חיפוש גלובלי</TableCell>
                          <TableCell>-</TableCell>
                          <TableCell>
                            <Badge className="bg-green-100 text-green-800" aria-label="מצב: פעיל">פעיל</Badge>
                          </TableCell>
                          <TableCell>כל הדפים הראשיים</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell><code>NotificationBell</code></TableCell>
                          <TableCell>פעמון התראות</TableCell>
                          <TableCell>-</TableCell>
                          <TableCell>
                            <Badge className="bg-green-100 text-green-800" aria-label="מצב: פעיל">פעיל</Badge>
                          </TableCell>
                          <TableCell>Layout (Header)</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>
            {/* @generated:dev-components END */}

            {/* @generated:dev-functions BEGIN */}
            <div id="dev-functions" className="space-y-8">
              <Card className="border-none shadow-lg bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Workflow className="w-6 h-6 text-orange-600" />
                    פונקציות Backend
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-right">שם הפונקציה</TableHead>
                          <TableHead className="text-right">מטרה</TableHead>
                          <TableHead className="text-right">Inputs</TableHead>
                          <TableHead className="text-right">Side Effects</TableHead>
                          <TableHead className="text-right">Idempotency</TableHead>
                          <TableHead className="text-right">Triggers</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell><code>processOverdueDelivery</code></TableCell>
                          <TableCell>עיבוד משלוחים באיחור</TableCell>
                          <TableCell>-</TableCell>
                          <TableCell>עדכון <code>shipment_due_date</code></TableCell>
                          <TableCell>בדיקה יומית, רץ פעם אחת ביום</TableCell>
                          <TableCell>אוטומטי ~20:00</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell><code>processOverduePickups</code></TableCell>
                          <TableCell>עיבוד איסופים באיחור</TableCell>
                          <TableCell>-</TableCell>
                          <TableCell>עדכון <code>pickup_preferred_date</code></TableCell>
                          <TableCell>בדיקה יומית, רץ פעם אחת ביום</TableCell>
                          <TableCell>אוטומטי ~22:00</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell><code>triggerDailyEmailCheckIfMissed</code></TableCell>
                          <TableCell>הפעלת בדיקת מיילים יומית</TableCell>
                          <TableCell>-</TableCell>
                          <TableCell>קריאה ל-<code>checkEmails</code></TableCell>
                          <TableCell>בדיקה אם לא רץ היום</TableCell>
                          <TableCell>כניסה למערכת</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell><code>checkEmails</code></TableCell>
                          <TableCell>בדיקה וחילוץ חשבוניות ממיילים</TableCell>
                          <TableCell>-</TableCell>
                          <TableCell>יצירת רשומות <code>Invoice</code></TableCell>
                          <TableCell>מניעת עיבוד כפול באמצעות <code>messageId</code></TableCell>
                          <TableCell>יומי או ידני</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell><code>syncOrderData</code></TableCell>
                          <TableCell>סינכרון נתונים בין הזמנות</TableCell>
                          <TableCell>orderId, updateType, updateData</TableCell>
                          <TableCell>עדכון הזמנות קשורות</TableCell>
                          <TableCell>בדיקה אם הערך השתנה</TableCell>
                          <TableCell>עדכוני UI</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell><code>createNotification</code></TableCell>
                          <TableCell>יצירת התראות למשתמשים</TableCell>
                          <TableCell>type, message, recipient</TableCell>
                          <TableCell>יצירת רשומת <code>Notification</code></TableCell>
                          <TableCell>מניעת כפילויות עם <code>dedupe_key</code></TableCell>
                          <TableCell>אירועי מערכת</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>
            {/* @generated:dev-functions END */}
          </TabsContent>

          {/* Quality & Process Tab */}
          <TabsContent value="quality">
            {/* @generated:dev-uiux BEGIN */}
            <div id="dev-uiux" className="space-y-8">
              <Card className="border-none shadow-lg bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Info className="w-6 h-6 text-blue-600" />
                    שינויי UI/UX
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-green-900 mb-3">כרטיסי KPI שנוספו</h4>
                      <ul className="text-sm text-green-800 space-y-1">
                        <li>• כרטיסי סיכום בדף אופים</li>
                        <li>• אנליטיקת כמויות אפייה</li>
                        <li>• סיכום שקיות לפי מיקום</li>
                        <li>• מעקב משלוחים לפי חברות</li>
                      </ul>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-blue-900 mb-3">טבלאות ואינטרקציות</h4>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li>• עדכון <code>baked_quantity</code> ישיר</li>
                        <li>• ייצוא נתונים (Markdown)</li>
                        <li>• חיפוש גלובלי מתקדם</li>
                        <li>• פילטרים דינמיים</li>
                      </ul>
                    </div>

                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-purple-900 mb-3">מצבי UI</h4>
                      <ul className="text-sm text-purple-800 space-y-1">
                        <li>• Loading spinners</li>
                        <li>• Empty states עם הנחיות</li>
                        <li>• Error handling</li>
                        <li>• No-Data fallbacks</li>
                      </ul>
                    </div>

                    <div className="bg-orange-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-orange-900 mb-3">נגישות ו-RTL</h4>
                      <ul className="text-sm text-orange-800 space-y-1">
                        <li>• תמיכה מלאה ב-RTL</li>
                        <li>• ניווט מקלדת</li>
                        <li>• aria-labels תקינים</li>
                        <li>• קונטרסט צבעים</li>
                      </ul>
                    </div>

                  </div>
                </CardContent>
              </Card>
            </div>
            {/* @generated:dev-uiux END */}

            {/* @generated:dev-quality BEGIN */}
            <div id="dev-quality" className="space-y-8">
              <Card className="border-none shadow-lg bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <ShieldCheck className="w-6 h-6 text-green-600" />
                    שערי איכות (DoR/DoD)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-blue-900 mb-3">Definition of Ready (DoR)</h4>
                      <ul className="text-sm text-blue-800 space-y-2">
                        <li>✓ בעיית משתמש מוגדרת בבירור</li>
                        <li>✓ היפותזת פתרון</li>
                        <li>✓ תלויות מזוהות</li>
                        <li>✓ הערכת מאמץ (Story Points)</li>
                        <li>✓ Owner מוקצה</li>
                        <li>✓ Acceptance Criteria</li>
                      </ul>
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-green-900 mb-3">Definition of Done (DoD)</h4>
                      <ul className="text-sm text-green-800 space-y-2">
                        <li>✓ קוד כתוב ועובר בדיקות</li>
                        <li>✓ מצבי שגיאה מטופלים</li>
                        <li>✓ תיעוד מעודכן (Docs + DevConsole)</li>
                        <li>✓ נבדק על ידי בודק נוסף</li>
                        <li>✓ שוחרר לפרודקשן</li>
                        <li>✓ נרשם ב-Change Log</li>
                      </ul>
                    </div>

                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-3">תהליך Code Review</h4>
                    <div className="text-sm text-gray-800 space-y-1">
                      <p>• כל שינוי עובר בדיקה עצמית</p>
                      <p>• בדיקת SSOT - רק תוכן המבוסס על קוד קיים</p>
                      <p>• בדיקת נגישות (RTL, keyboard navigation)</p>
                      <p>• בדיקת מצבי שגיאה</p>
                    </div>
                  </div>

                </CardContent>
              </Card>
            </div>
            {/* @generated:dev-quality END */}

            {/* @generated:dev-changelog BEGIN */}
            <div id="dev-changelog" className="space-y-8">
              <Card className="border-none shadow-lg bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <FileText className="w-6 h-6 text-purple-600" />
                    אינטגרציה עם Change Log
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-3">תהליך רישום שינויים</h4>
                    <div className="text-sm text-blue-800 space-y-2">
                      <p><strong>פורמט רישום:</strong> <code>✅ PHASE X: תיאור השינוי (רכיבים/תכונות)</code></p>
                      <p><strong>שדות חובה:</strong> תאריך, מבצע, תיאור, רכיבים מושפעים</p>
                      <p><strong>קישור דו-כיווני:</strong> <a href="#doc-changelog" className="text-blue-600 underline">Documentation Change Log</a></p>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-3">שינויים אחרונים</h4>
                    <div className="text-sm text-gray-700 space-y-1">
                      <p>✅ PHASE 1: Documentation scaffold created</p>
                      <p>✅ PHASE 2: Documentation filled from SSOT</p>
                      <p>✅ PHASE 3: Role Guides implemented</p>
                      <p>✅ PHASE 4: Admin Big-Picture added</p>
                      <p>✅ PHASE 5: Development Console rebuilt</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            {/* @generated:dev-changelog END */}
          </TabsContent>

          {/* Coverage Tab */}
          <TabsContent value="coverage">
            {/* @generated:dev-role-coverage BEGIN */}
            <div id="dev-role-coverage" className="space-y-8">
              <Card className="border-none shadow-lg bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <UserCog className="w-6 h-6 text-green-600" />
                    כיסוי לפי תפקידים
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-right">תפקיד</TableHead>
                          <TableHead className="text-right">תכונות עיקריות</TableHead>
                          <TableHead className="text-right">רכיבים</TableHead>
                          <TableHead className="text-right">פונקציות</TableHead>
                          <TableHead className="text-right">ישויות</TableHead>
                          <TableHead className="text-right">סטטוס</TableHead>
                          <TableHead className="text-right">קישורים</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell><strong>Admin</strong></TableCell>
                          <TableCell>ניהול כללי, ניתוח, הרשאות</TableCell>
                          <TableCell>GlobalSearch, NotificationBell</TableCell>
                          <TableCell>כל הפונקציות</TableCell>
                          <TableCell>כל הישויות</TableCell>
                          <TableCell>
                            <Badge className="bg-green-100 text-green-800" aria-label="סטטוס: מלא">מלא</Badge>
                          </TableCell>
                          <TableCell>
                            <a href="#guide-admin" className="text-blue-600 hover:underline">
                              מדריך Admin
                            </a>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell><strong>Store Manager</strong></TableCell>
                          <TableCell>ניהול חנות, תכנון</TableCell>
                          <TableCell>BakingAnalytics, ShipmentSummary</TableCell>
                          <TableCell>processOverdue*, syncOrderData</TableCell>
                          <TableCell>Order, Invoice, User</TableCell>
                          <TableCell>
                            <Badge className="bg-green-100 text-green-800" aria-label="סטטוס: מלא">מלא</Badge>
                          </TableCell>
                          <TableCell>
                            <a href="#guide-store_manager" className="text-blue-600 hover:underline">
                              מדריך Store Manager
                            </a>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell><strong>Baker</strong></TableCell>
                          <TableCell>אפייה ותכנון ייצור</TableCell>
                          <TableCell>BakingOrderCard, BakingAnalytics</TableCell>
                          <TableCell>syncOrderData</TableCell>
                          <TableCell>Order (baked_quantity)</TableCell>
                          <TableCell>
                            <Badge className="bg-green-100 text-green-800" aria-label="סטטוס: מלא">מלא</Badge>
                          </TableCell>
                          <TableCell>
                            <a href="#guide-baker" className="text-blue-600 hover:underline">
                              מדריך Baker
                            </a>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell><strong>Picker</strong></TableCell>
                          <TableCell>ליקוט ואריזה</TableCell>
                          <TableCell>ItemPickingList, PickingOrderCard</TableCell>
                          <TableCell>-</TableCell>
                          <TableCell>Order (picking_status)</TableCell>
                          <TableCell>
                            <Badge className="bg-green-100 text-green-800" aria-label="סטטוס: מלא">מלא</Badge>
                          </TableCell>
                          <TableCell>
                            <a href="#guide-picker" className="text-blue-600 hover:underline">
                              מדריך Picker
                            </a>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell><strong>Picker Baker</strong></TableCell>
                          <TableCell>ליקוט ואפייה</TableCell>
                          <TableCell>כל רכיבי Baker + Picker</TableCell>
                          <TableCell>syncOrderData</TableCell>
                          <TableCell>Order (כל השדות)</TableCell>
                          <TableCell>
                            <Badge className="bg-green-100 text-green-800" aria-label="סטטוס: מלא">מלא</Badge>
                          </TableCell>
                          <TableCell>
                            <a href="#guide-picker_baker" className="text-blue-600 hover:underline">
                              מדריך Picker Baker
                            </a>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell><strong>Courier</strong></TableCell>
                          <TableCell>משלוחים</TableCell>
                          <TableCell>DeliveryActionsDialog, PublicShipmentList</TableCell>
                          <TableCell>-</TableCell>
                          <TableCell>Order (delivery_status)</TableCell>
                          <TableCell>
                            <Badge className="bg-green-100 text-green-800" aria-label="סטטוס: מלא">מלא</Badge>
                          </TableCell>
                          <TableCell>
                            <a href="#guide-courier" className="text-blue-600 hover:underline">
                              מדריך Courier
                            </a>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell><strong>Pending</strong></TableCell>
                          <TableCell>ממתין לאישור</TableCell>
                          <TableCell>PendingApproval</TableCell>
                          <TableCell>-</TableCell>
                          <TableCell>User</TableCell>
                          <TableCell>
                            <Badge className="bg-yellow-100 text-yellow-800" aria-label="סטטוס: מוגבל">מוגבל</Badge>
                          </TableCell>
                          <TableCell>
                            <a href="#guide-pending" className="text-blue-600 hover:underline">
                              מדריך Pending
                            </a>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>

                  <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-green-900 mb-2">כיסוי מלא</h4>
                      <p className="text-sm text-green-800">6 תפקידים עם כיסוי מלא של התכונות הנדרשות</p>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-yellow-900 mb-2">כיסוי חלקי</h4>
                      <p className="text-sm text-yellow-800">1 תפקיד עם גישה מוגבלת (Pending)</p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-blue-900 mb-2">רכיבים משותפים</h4>
                      <p className="text-sm text-blue-800">GlobalSearch, NotificationBell זמינים לכולם</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            {/* @generated:dev-role-coverage END */}
          </TabsContent>

          {/* Monitoring Tab */}
          <TabsContent value="monitoring">
            {/* @generated:dev-telemetry BEGIN */}
            <div id="dev-telemetry" className="space-y-8">
              <Card className="border-none shadow-lg bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Bell className="w-6 h-6 text-orange-600" />
                    טלמטריה וניטור
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">

                  <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <Info className="w-5 h-5 text-yellow-600" />
                      <h4 className="font-semibold text-yellow-800">מצב טלמטריה</h4>
                    </div>
                    <p className="text-sm text-yellow-700">
                      אין טלמטריה זמינה כעת. המערכת פועלת על בסיס לוגים בסיסיים ומעקב ידני.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-blue-900 mb-3">מדדי ביצועים בסיסיים</h4>
                      <div className="space-y-2 text-sm text-blue-800">
                        <div>שימוש ב-Export: לא מעוקב</div>
                        <div>זמני ריצת אוטומציות: לא מעוקב</div>
                        <div>שגיאות מערכת: לא מעוקב</div>
                        <div>זמני טעינה: לא מעוקב</div>
                      </div>
                    </div>

                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-purple-900 mb-3">הצעות לשיפור ניטור</h4>
                      <ul className="text-sm text-purple-800 space-y-1">
                        <li>• הוספת מדידת זמני ריצה לפונקציות</li>
                        <li>• מעקב אחרי שימוש ב-Export</li>
                        <li>• לוג שגיאות מרוכז</li>
                        <li>• מדידת זמני טעינה</li>
                        <li>• מעקב אחרי שימוש בתכונות</li>
                      </ul>
                    </div>

                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-3">פונקציות עם תזמון אוטומטי</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="bg-white p-3 rounded border">
                        <div className="font-medium">processOverdueDelivery</div>
                        <div className="text-gray-600">~20:00 יומי</div>
                        <div className="text-green-600">פעיל</div>
                      </div>
                      <div className="bg-white p-3 rounded border">
                        <div className="font-medium">processOverduePickups</div>
                        <div className="text-gray-600">~22:00 יומי</div>
                        <div className="text-green-600">פעיל</div>
                      </div>
                      <div className="bg-white p-3 rounded border">
                        <div className="font-medium">checkEmails</div>
                        <div className="text-gray-600">יומי/לפי דרישה</div>
                        <div className="text-green-600">פעיל</div>
                      </div>
                    </div>
                  </div>

                </CardContent>
              </Card>
            </div>
            {/* @generated:dev-telemetry END */}

            {/* @generated:dev-known BEGIN */}
            <div id="dev-known" className="space-y-8">
              <Card className="border-none shadow-lg bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Info className="w-6 h-6 text-red-600" />
                    בעיות ידועות ו-TODOs
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">

                  <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                    <h4 className="font-semibold text-red-900 mb-3">בעיות טכניות ידועות</h4>
                    <div className="space-y-3">
                      <div className="bg-white p-3 rounded border-l-4 border-red-500">
                        <div className="font-medium text-red-900">Icon Import Fallbacks</div>
                        <div className="text-sm text-red-700 mt-1">
                          פתרון: הוסף fallback טקסטואלי לכל אייקון שעלול להיכשל
                        </div>
                        <div className="text-xs text-red-600 mt-2">Owner: System | Status: Mitigated</div>
                      </div>

                      <div className="bg-white p-3 rounded border-l-4 border-yellow-500">
                        <div className="font-medium text-yellow-900">Rate Limiting בעדכונים מקבילים</div>
                        <div className="text-sm text-yellow-700 mt-1">
                          פתרון: הוסף retry מנגנון ו-debouncing לעדכונים
                        </div>
                        <div className="text-xs text-yellow-600 mt-2">Owner: System | Status: Partial</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-3">שיפורים עתידיים</h4>
                    <div className="space-y-2">
                      <div className="bg-white p-3 rounded">
                        <div className="font-medium text-blue-900">הוספת PDF Export</div>
                        <div className="text-sm text-blue-700 mt-1">
                          כרגע רק Markdown + Print CSS זמינים
                        </div>
                        <div className="text-xs text-blue-600 mt-2">Priority: Low | Target: Future</div>
                      </div>

                      <div className="bg-white p-3 rounded">
                        <div className="font-medium text-blue-900">מערכת Snapshot מתקדמת</div>
                        <div className="text-sm text-blue-700 mt-1">
                          לשמירת מצבי מערכת והשוואות היסטוריות
                        </div>
                        <div className="text-xs text-blue-600 mt-2">Priority: Medium | Target: Q2</div>
                      </div>

                      <div className="bg-white p-3 rounded">
                        <div className="font-medium text-blue-900">טלמטריה מתקדמת</div>
                        <div className="text-sm text-blue-700 mt-1">
                          מדידת ביצועים, שימוש בתכונות, וזיהוי צווארי בקבוק
                        </div>
                        <div className="xs text-blue-600 mt-2">Priority: High | Target: Q1</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-900 mb-3">הצלחות ופתרונות</h4>
                    <div className="space-y-2 text-sm text-green-800">
                      <div>✅ מנגנון אידמפוטנטי לעדכונים מובן</div>
                      <div>✅ מניעת כפילויות בפונקציות אוטומטיות</div>
                      <div>✅ SSOT מיושם עקבית בכל הדפים</div>
                      <div>✅ נגישות RTL מלאה</div>
                      <div>✅ Cross-linking בין דפים</div>
                    </div>
                  </div>

                </CardContent>
              </Card>
            </div>
            {/* @generated:dev-known END */}

            {/* @generated:dev-backups BEGIN */}
            <div id="dev-backups" className="mt-8">
              <Card className="border-none shadow-lg bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Database className="w-6 h-6 text-cyan-600" />
                    מערכת גיבוי ושחזור
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-cyan-50 p-4 rounded-lg border border-cyan-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Info className="w-4 h-4 text-cyan-600" />
                      <h4 className="font-semibold text-cyan-900">פרטים טכניים</h4>
                    </div>
                    <p className="text-sm text-cyan-800">
                      מערכת גיבוי מלאה עם Point-in-Time snapshots, אידמפוטנטיות ושחזור מבוקר.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-900">Entities & Schema</h4>
                      <div className="text-sm text-gray-700 space-y-1">
                        <p><code>BackupRun</code> - רשומות גיבוי עם metadata</p>
                        <p><code>RestoreRun</code> - רשומות שחזור עם diff</p>
                        <p>Storage URI format: <code>backups/orders/YYYY/MM/DD/ID/</code></p>
                        <p>Data format: JSONL דחוס (gzip) + manifest</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-900">Backend Functions</h4>
                      <div className="text-sm text-gray-700 space-y-1">
                        <p><code>backupOrders</code> - יצירת גיבוי עם hash</p>
                        <p><code>verifyBackup</code> - אימות שלמות SHA-256</p>
                        <p><code>restoreOrders</code> - שחזור עם conflict policy</p>
                        <p><code>scheduleOrderBackups</code> - אוטומציה דו-שעתית</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900">Error Paths & Recovery</h4>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-right">שגיאה</TableHead>
                            <TableHead className="text-right">טיפול</TableHead>
                            <TableHead className="text-right">Recovery</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell>Backup corruption</TableCell>
                            <TableCell>Hash verification fail</TableCell>
                            <TableCell>Re-run backup from same as_of</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Restore conflict</TableCell>
                            <TableCell>Policy-based handling</TableCell>
                            <TableCell>Dry-run preview + manual override</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Storage failure</TableCell>
                            <TableCell>Mark backup as failed</TableCell>
                            <TableCell>Retry with new storage URI</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Schedule skip</TableCell>
                            <TableCell>Business hours check</TableCell>
                            <TableCell>Next 2h window in business hours</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => window.open('/admin/backups', '_blank')}>
                      <Database className="w-4 h-4 mr-2" />
                      פתח ממשק גיבוי
                    </Button>
                    <Button variant="outline" size="sm">
                      <FileText className="w-4 h-4 mr-2" />
                      צפה בלוגים
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
            {/* @generated:dev-backups END */}
          </TabsContent>

        </Tabs>

        {/* Footer with traceability */}
        <div className="mt-12 pt-8 border-t border-gray-200 text-center text-sm text-gray-500 no-print">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
            <div>
              עדכון אחרון: {israelTime} (Asia/Jerusalem)
            </div>
            <div className="flex items-center gap-4">
              <span>עודכן על ידי: Base44</span>
              <span>•</span>
              <a href="#doc-changelog" className="text-blue-600 hover:underline">
                Change Log
              </a>
            </div>
          </div>
        </div>
      </div>
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
            text-align: center;
          }

          .print-header h1 {
            font-size: 24px;
            font-weight: bold;
            margin: 0;
            color: #000;
          }

          .print-header .print-date {
            font-size: 14px;
            color: #555;
            margin-top: 5px;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 12px;
            break-inside: auto;
            margin-bottom: 1rem;
          }

          th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: right;
          }

          th {
            background-color: #f2f2f2;
          }

          tr {
            break-inside: avoid;
            break-after: auto;
          }

          /* General styling for cards in print */
          .card {
            border: 1px solid #eee;
            margin-bottom: 1rem;
            padding: 1rem;
            background-color: #fff;
          }

          .card-header, .card-title {
            color: #333;
            font-weight: bold;
          }

          .badge {
            background-color: #e0e0e0;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 10px;
          }

          /* Specific elements for print */
          #dev-scope, #dev-entities, #dev-components, #dev-functions,
          #dev-uiux, #dev-quality, #dev-changelog, #dev-role-coverage,
          #dev-telemetry, #dev-known, #dev-backups {
            margin-top: 2rem;
            page-break-before: always; /* Start new content sections on new page */
          }

          @page {
            margin: 1.5cm;
            @top-center {
              content: "מעקב פיתוח";
            }
            @bottom-right {
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
    </div>
  );
}
