import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { testGmailConnection } from "@/api/functions";
import { productionCheckEmails } from "@/api/functions";
import { Calendar, CheckCircle, AlertCircle, RefreshCw, Settings, Mail, Database, Code, Rocket, ShoppingCart } from "lucide-react";
import { toast } from "sonner";

export default function EmailTester() {
  const [credentials, setCredentials] = useState({
    clientId: '',
    clientSecret: '',
    refreshToken: ''
  });
  
  const [testResult, setTestResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    from: new Date().toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0]
  });

  // New state for production function
  const [productionResult, setProductionResult] = useState(null);
  const [isLoadingProduction, setIsLoadingProduction] = useState(false);

  const handleCredentialsTest = async () => {
    setIsLoading(true);
    setTestResult(null);
    
    try {
      const result = await testGmailConnection({
        testType: 'credentials',
        credentials: credentials
      });
      
      setTestResult(result.data);
      
      if (result.data?.success) {
        toast.success('התחברות לגוגל הצליחה!');
      } else {
        toast.error('שגיאה בהתחברות לגוגל');
      }
    } catch (error) {
      console.error('Error testing credentials:', error);
      setTestResult({ 
        success: false, 
        error: error.message || 'שגיאה לא ידועה',
        details: error.response?.data || 'אין פרטים נוספים'
      });
      toast.error('שגיאה בבדיקת הפרטים');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailFetch = async () => {
    setIsLoading(true);
    setTestResult(null);
    
    try {
      const result = await testGmailConnection({
        testType: 'fetch_emails',
        credentials: credentials,
        dateFrom: dateRange.from,
        dateTo: dateRange.to
      });
      
      setTestResult(result.data);
      
      if (result.data?.success) {
        toast.success(`נמצאו ${result.data.emailsFound || 0} מיילים`);
      } else {
        toast.error('שגיאה בשליפת מיילים');
      }
    } catch (error) {
      console.error('Error fetching emails:', error);
      setTestResult({ 
        success: false, 
        error: error.message || 'שגיאה לא ידועה',
        details: error.response?.data || 'אין פרטים נוספים'
      });
      toast.error('שגיאה בשליפת המיילים');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateOrders = async () => {
    setIsLoading(true);
    setTestResult(null);
    
    try {
      const result = await testGmailConnection({
        testType: 'create_orders',
        credentials: credentials,
        dateFrom: dateRange.from,
        dateTo: dateRange.to
      });
      
      setTestResult(result.data);
      
      if (result.data?.success) {
        toast.success(`נוצרו ${result.data.ordersCreated || 0} הזמנות חדשות`);
      } else {
        toast.error('שגיאה ביצירת הזמנות');
      }
    } catch (error) {
      console.error('Error creating orders:', error);
      setTestResult({ 
        success: false, 
        error: error.message || 'שגיאה לא ידועה',
        details: error.response?.data || 'אין פרטים נוספים'
      });
      toast.error('שגיאה ביצירת הזמנות');
    } finally {
      setIsLoading(false);
    }
  };

  // NEW: Production function handler
  const handleProductionCheckEmails = async () => {
    setIsLoadingProduction(true);
    setProductionResult(null);
    
    try {
      const result = await productionCheckEmails({
        dateFrom: dateRange.from,
        dateTo: dateRange.to
      });
      
      setProductionResult(result.data);
      
      if (result.data?.success) {
        toast.success(`הפונקציה הפרודקטיבית הצליחה! נוצרו ${result.data.ordersCreated || 0} הזמנות חדשות`);
      } else {
        toast.error('שגיאה בהפעלת הפונקציה הפרודקטיבית');
      }
    } catch (error) {
      console.error('Error in production function:', error);
      setProductionResult({ 
        success: false, 
        error: error.message || 'שגיאה לא ידועה',
        details: error.response?.data || 'אין פרטים נוספים'
      });
      toast.error('שגיאה בהפעלת הפונקציה הפרודקטיבית');
    } finally {
      setIsLoadingProduction(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            <Mail className="inline-block w-8 h-8 ml-3" />
            מעבדת בדיקת מיילים וחיבור גוגל
          </h1>
          <p className="text-gray-600">כלי לפיתוח ובדיקת פונקציית שליפת הזמנות מהמייל</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* תצורת פרטי גוגל */}
          <Card className="border-none elegant-shadow-lg bg-white/90">
            <CardHeader className="border-b border-gray-100">
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-blue-600" />
                הגדרות פרטי Google API
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="clientId">Client ID</Label>
                <Input
                  id="clientId"
                  value={credentials.clientId}
                  onChange={(e) => setCredentials({...credentials, clientId: e.target.value})}
                  placeholder="הזן את ה-Client ID מגוגל"
                  className="font-mono text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clientSecret">Client Secret</Label>
                <Input
                  id="clientSecret"
                  type="password"
                  value={credentials.clientSecret}
                  onChange={(e) => setCredentials({...credentials, clientSecret: e.target.value})}
                  placeholder="הזן את ה-Client Secret מגוגל"
                  className="font-mono text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="refreshToken">Refresh Token</Label>
                <Textarea
                  id="refreshToken"
                  value={credentials.refreshToken}
                  onChange={(e) => setCredentials({...credentials, refreshToken: e.target.value})}
                  placeholder="הזן את ה-Refresh Token מגוגל"
                  className="font-mono text-sm h-20"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* טווח תאריכים */}
          <Card className="border-none elegant-shadow-lg bg-white/90">
            <CardHeader className="border-b border-gray-100">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-green-600" />
                טווח תאריכים לבדיקה
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dateFrom">תאריך מ</Label>
                  <Input
                    id="dateFrom"
                    type="date"
                    value={dateRange.from}
                    onChange={(e) => setDateRange({...dateRange, from: e.target.value})}
                    className="text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateTo">תאריך עד</Label>
                  <Input
                    id="dateTo"
                    type="date"
                    value={dateRange.to}
                    onChange={(e) => setDateRange({...dateRange, to: e.target.value})}
                    className="text-sm"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* בדיקות ופעולות */}
        <Card className="border-none elegant-shadow-lg bg-white/90 mt-6">
          <CardHeader className="border-b border-gray-100">
            <CardTitle className="flex items-center gap-2">
              <Code className="w-5 h-5 text-purple-600" />
              בדיקות ופעולות
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button 
                onClick={handleCredentialsTest}
                disabled={isLoading || !credentials.clientId || !credentials.clientSecret || !credentials.refreshToken}
                className="h-12 bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin ml-2" />
                ) : (
                  <Settings className="w-4 h-4 ml-2" />
                )}
                בדוק חיבור לגוגל
              </Button>

              <Button 
                onClick={handleEmailFetch}
                disabled={isLoading || !credentials.clientId || !credentials.clientSecret || !credentials.refreshToken}
                variant="outline" 
                className="h-12 border-green-200 text-green-700 hover:bg-green-50"
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin ml-2" />
                ) : (
                  <Mail className="w-4 h-4 ml-2" />
                )}
                שלוף מיילים
              </Button>

              <Button 
                onClick={handleCreateOrders}
                disabled={isLoading || !credentials.clientId || !credentials.clientSecret || !credentials.refreshToken}
                variant="outline" 
                className="h-12 border-orange-200 text-orange-700 hover:bg-orange-50"
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin ml-2" />
                ) : (
                  <Database className="w-4 h-4 ml-2" />
                )}
                צור הזמנות (בזהירות)
              </Button>

              {/* NEW: Production function button */}
              <Button 
                onClick={handleProductionCheckEmails}
                disabled={isLoadingProduction}
                className="h-12 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white"
              >
                {isLoadingProduction ? (
                  <RefreshCw className="w-4 h-4 animate-spin ml-2" />
                ) : (
                  <Rocket className="w-4 h-4 ml-2" />
                )}
                🚀 פונקציה פרודקטיבית
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* תוצאות בדיקה */}
        {testResult && (
          <Card className="border-none elegant-shadow-lg bg-white/90 mt-6">
            <CardHeader className="border-b border-gray-100">
              <CardTitle className="flex items-center gap-2">
                {testResult.success ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600" />
                )}
                תוצאות בדיקה
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <Alert className={testResult.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                <AlertDescription className="text-sm">
                  <div className="space-y-2">
                    <div><strong>הודעה:</strong> {testResult.message}</div>
                    {testResult.error && <div><strong>שגיאה:</strong> {testResult.error}</div>}
                    {testResult.emailsFound !== undefined && <div><strong>מיילים שנמצאו:</strong> {testResult.emailsFound}</div>}
                    {testResult.ordersCreated !== undefined && <div><strong>הזמנות שנוצרו:</strong> {testResult.ordersCreated}</div>}
                    {testResult.details && (
                      <div className="mt-4">
                        <strong>פרטים נוספים:</strong>
                        <pre className="text-xs mt-2 p-2 bg-gray-100 rounded overflow-auto max-h-40">
                          {JSON.stringify(testResult.details, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        )}

        {/* NEW: Production function results */}
        {productionResult && (
          <Card className="border-none elegant-shadow-lg bg-white/90 mt-6">
            <CardHeader className="border-b border-gray-100">
              <CardTitle className="flex items-center gap-2">
                {productionResult.success ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600" />
                )}
                תוצאות הפונקציה הפרודקטיבית 🚀
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <Alert className={productionResult.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                <AlertDescription>
                  <div className="space-y-4">
                    <div className="text-sm">
                      <div><strong>סטטוס:</strong> {productionResult.success ? '✅ הצליח' : '❌ נכשל'}</div>
                      <div><strong>הודעה:</strong> {productionResult.message}</div>
                      {productionResult.error && <div><strong>שגיאה:</strong> {productionResult.error}</div>}
                      {productionResult.processedCount !== undefined && <div><strong>מיילים שעובדו:</strong> {productionResult.processedCount}</div>}
                      {productionResult.ordersCreated !== undefined && <div><strong>הזמנות שנוצרו:</strong> {productionResult.ordersCreated}</div>}
                    </div>

                    {/* Display orders details */}
                    {productionResult.ordersDetails && productionResult.ordersDetails.length > 0 && (
                      <div className="mt-4">
                        <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                          <ShoppingCart className="w-4 h-4" />
                          פרטי ההזמנות שנוצרו:
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {productionResult.ordersDetails.map((order, index) => (
                            <div key={index} className="bg-white p-3 rounded-lg border border-gray-200 elegant-shadow">
                              <div className="space-y-1 text-xs">
                                <div className="flex items-center justify-between">
                                  <span className="font-semibold">הזמנה #{order.order_number}</span>
                                  <Badge variant="outline" className="text-xs">
                                    {order.source === 'attachment' ? 'קובץ מצורף' : 'טקסט'}
                                  </Badge>
                                </div>
                                <div><strong>לקוח:</strong> {order.customer_name}</div>
                                <div><strong>סכום:</strong> ₪{order.total_amount?.toLocaleString() || '0'}</div>
                                <div><strong>פריטים:</strong> {order.items_count || 0}</div>
                                {order.filename && <div><strong>קובץ:</strong> {order.filename}</div>}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {productionResult.details && (
                      <div className="mt-4">
                        <strong className="text-sm">פרטים טכניים:</strong>
                        <pre className="text-xs mt-2 p-2 bg-gray-100 rounded overflow-auto max-h-32">
                          {JSON.stringify(productionResult.details, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}