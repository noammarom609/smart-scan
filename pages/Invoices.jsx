
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, Loader, Inbox, Calendar, Search, ThumbsUp, ThumbsDown, Trash2, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { toast } from "sonner";
import { harvestInvoices } from '@/api/functions';
import { analyzeFeedback } from '@/api/functions'; // הוספת ייבוא סטטי
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import InvoiceDetails from '../components/invoices/InvoiceDetails';
import { Invoice } from '@/api/entities';
import { Textarea } from "@/components/ui/textarea";
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
import { Link } from 'react-router-dom'; // Assuming react-router-dom for Link

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingEmails, setIsCheckingEmails] = useState(false); // Renamed from isScanning
  const [error, setError] = useState(null);
  // Removed dateRange state

  // New states for the email check date range popover
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [emailDateRange, setEmailDateRange] = useState({
    from: undefined, // Default to undefined to force selection
    to: undefined
  });

  const [rejectionInvoice, setRejectionInvoice] = useState(null);
  const [rejectionNotes, setRejectionNotes] = useState("");

  const handleAnalyzeFeedback = async () => {
    const toastId = toast.loading("מנתח משוב קיים...");
    try {
      // Dynamic import for analyzeInvoiceFeedback function - REMOVED
      const result = await analyzeFeedback({});
      
      console.log("Invoice Feedback Analysis:", result.data);
      
      if (result.data.summary) {
        const { summary, recommendations } = result.data;
        toast.success(
          `ניתוח הושלם: ${summary.totalApproved} מאושרות, ${summary.totalRejected} נדחות. ביטחון ממוצע - מאושרות: ${summary.avgApprovedConfidence}, נדחות: ${summary.avgRejectedConfidence}`, 
          { id: toastId, duration: 8000 }
        );
        
        if (recommendations.length > 0) {
          console.log("המלצות לשיפור:", recommendations);
          toast.info(`המלצות לשיפור זמינות בקונסול הדפדפן`, { duration: 5000 });
        }
      } else {
        toast.info("לא נמצא מספיק משוב לניתוח", { id: toastId });
      }
    } catch (error) {
      console.error("Error analyzing feedback:", error);
      toast.error(`שגיאה בניתוח המשוב: ${error.message}`, { id: toastId });
    }
  };

  // Renamed and refactored handleScanInvoices to handleCheckEmails
  const handleCheckEmails = async () => {
    setIsCheckingEmails(true);
    setError(null);
    const toastId = toast.loading("מתחיל סריקת מיילים...");
    setShowDatePicker(false); // Close the date picker popover after selection

    try {
      if (!emailDateRange.from || !emailDateRange.to) {
        toast.error("יש לבחור טווח תאריכים.", { id: toastId });
        setIsCheckingEmails(false);
        return;
      }
      const fromDate = format(emailDateRange.from, 'yyyy-MM-dd');
      const toDate = format(emailDateRange.to, 'yyyy-MM-dd');

      let currentPageToken = null;
      let keepScanning = true;
      let totalCreated = 0;
      let batch = 1;

      while (keepScanning && batch < 50) { // Safety break after 50 batches
        toast.loading(`מעבד אצווה ${batch}...`, { id: toastId });
        
        const result = await harvestInvoices({ 
          since: fromDate, 
          until: toDate,
          pageToken: currentPageToken
        });

        if (result.data.error) {
          throw new Error(result.data.error);
        }
        
        totalCreated += result.data.created;
        currentPageToken = result.data.nextPageToken;

        if (result.data.created > 0) {
          toast.info(`נמצאו ${result.data.created} חשבוניות חדשות באצווה ${batch}. ממשיך לסרוק...`, { id: toastId, duration: 4000 });
        }

        if (!currentPageToken) {
          keepScanning = false;
          if (totalCreated > 0) {
            toast.success(`סריקה הושלמה. נמצאו בסך הכל ${totalCreated} חשבוניות חדשות.`, { id: toastId, duration: 8000 });
          } else {
            toast.info(`הסריקה הושלמה. לא נמצאו חשבוניות חדשות.`, { id: toastId, duration: 5000 });
          }
        } else {
          batch++;
          await new Promise(resolve => setTimeout(resolve, 500)); // Small delay between batches
        }
      }
      
      if (batch >= 50) {
        toast.warning("הסריקה הופסקה לאחר 50 אצוות למניעת עומס יתר. ניתן להריץ שוב להמשך.", { id: toastId, duration: 10000 });
      }

      await loadPendingInvoices();

    } catch (err) {
      console.error("Error harvesting invoices:", err);
      setError(`שגיאה בסריקת הח חשבוניות: ${err.message}`);
      toast.error(`שגיאה בסריקת החשבוניות: ${err.message}`, { id: toastId });
    } finally {
      setIsCheckingEmails(false);
    }
  };

  const loadPendingInvoices = async () => {
    setIsLoading(true);
    try {
      const pending = await Invoice.filter({ status: 'pending_review' }, '-created_date');
      setInvoices(pending);
    } catch (err) {
      console.error("Error loading pending invoices:", err);
      setError("שגיאה בטעינת חשבוניות ממתינות לאישור.");
      toast.error("שגיאה בטעינת חשבוניות ממתינות לאישור.");
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    loadPendingInvoices();
  }, []);

  const handleApproval = async (invoiceId, isApproved, notes = "") => {
    const status = isApproved ? 'approved' : 'rejected';
    const toastId = toast.loading(`מעדכן סטטוס חשבונית...`);
    try {
      await Invoice.update(invoiceId, { status, reviewNotes: notes });
      setInvoices(prev => prev.filter(inv => inv.id !== invoiceId));
      toast.success(`החשבונית ${isApproved ? 'אושרה' : 'נדחתה'} בהצלחה!`, { id: toastId });
    } catch (err) {
      toast.error("שגיאה בעדכון סטטוס החשבונית.", { id: toastId });
    } finally {
      if (rejectionInvoice) {
        setRejectionInvoice(null);
        setRejectionNotes("");
      }
    }
  };

  const handleRejectClick = (invoice) => {
    setRejectionInvoice(invoice);
    setRejectionNotes(invoice.reviewNotes || ""); // Pre-fill notes if they exist
  };

  const handleDeleteAllPending = async () => {
    const toastId = toast.loading(`מוחק את כל החשבוניות הממתינות...`);
    try {
      const pendingInvoices = await Invoice.filter({ status: 'pending_review' });
      const idsToDelete = pendingInvoices.map(inv => inv.id);

      if (idsToDelete.length === 0) {
          toast.info("אין חשבוניות למחיקה.", { id: toastId });
          return;
      }

      for (const id of idsToDelete) {
        await Invoice.delete(id);
      }
      
      setInvoices([]);
      toast.success(`${idsToDelete.length} חשבוניות נמחקו בהצלחה.`, { id: toastId });
    } catch (err) {
      console.error("Error deleting all pending invoices:", err);
      toast.error("שגיאה במחיקת החשבוניות.", { id: toastId });
    }
  };

  // Placeholder for createPageUrl, assuming it's part of routing setup
  const createPageUrl = (pageName) => {
    switch (pageName) {
      case "ScanOrder":
        return "/scan-order"; // Replace with actual path as per your routing setup
      default:
        return "/";
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
          <div className="text-right">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
              חשבוניות מהמייל
            </h1>
            <p className="text-sm sm:text-base text-gray-600">סרוק, סנן ואשר את כל החשבוניות שהגיעו במייל</p>
          </div>
          
          {/* New action buttons section */}
          <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-2">
            <Popover open={showDatePicker} onOpenChange={setShowDatePicker}>
                <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full sm:w-auto bg-white hover:bg-gray-50 border-gray-200 elegant-shadow text-sm"
                      disabled={isCheckingEmails}
                    >
                      <Mail className="w-4 h-4 ml-2" />
                      בדיקת מיילים
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-screen max-w-sm mx-2 p-0" align="center">
                    <CalendarComponent
                        mode="range"
                        selected={emailDateRange}
                        onSelect={setEmailDateRange}
                        initialFocus
                        locale={he}
                        dir="rtl"
                        numberOfMonths={1}
                        className="text-sm"
                    />
                    <div className="p-3 border-t">
                        <Button 
                            onClick={handleCheckEmails} 
                            className="w-full text-sm" 
                            disabled={isCheckingEmails || !emailDateRange?.from}
                            size="sm"
                        >
                            {isCheckingEmails ? "בודק..." : "בדוק טווח תאריכים"}
                        </Button>
                    </div>
                </PopoverContent>
            </Popover>

            <Button 
              onClick={handleAnalyzeFeedback}
              variant="outline"
              className="w-full sm:w-auto bg-purple-50 border-purple-200 hover:bg-purple-100 text-purple-700 text-sm"
            >
              <Search className="w-4 h-4 ml-2" />
              ניתוח משוב
            </Button>

            <Link to={createPageUrl("ScanOrder")} className="w-full sm:w-auto">
              <Button className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 elegant-shadow text-sm">
                <Plus className="w-4 h-4 ml-2" />
                הזמנה ידנית
              </Button>
            </Link>
          </div>
        </div>

        {/* Content */}
        <Card className="border-none elegant-shadow-lg bg-white/90 backdrop-blur-sm">
          <CardHeader className="p-4 sm:p-6 border-b border-gray-100 flex flex-row justify-between items-center">
            <CardTitle className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-blue-600"/>
              חשבוניות ממתינות לאישור ({invoices.length})
            </CardTitle>
            {invoices.length > 0 && (
               <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                        <Trash2 className="w-4 h-4 ml-2" />
                        מחק הכל
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>אישור מחיקת כל החשבוניות</AlertDialogTitle>
                      <AlertDialogDescription>
                        האם אתה בטוח שברצונך למחוק את כל {invoices.length} החשבוניות הממתינות לאישור? פעולה זו אינה הפיכה.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>ביטול</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeleteAllPending} className="bg-red-600 hover:bg-red-700">
                        מחק הכל
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
            )}
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            {isLoading && !isCheckingEmails && (
              <div className="flex justify-center items-center py-12">
                <div className="text-center">
                  <Loader className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
                  <p className="text-gray-600">טוען חשבוניות...</p>
                </div>
              </div>
            )}
            
            {!isLoading && error && (
              <div className="text-center py-12 text-red-600">
                <p>{error}</p>
              </div>
            )}

            {!isLoading && !error && invoices.length === 0 && (
              <div className="text-center py-12">
                <Inbox className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">אין חשבוניות ממתינות לאישור</h3>
                <p className="text-gray-500 mb-6">בחר טווח תאריכים ולחץ על "בדוק טווח תאריכים" כדי להתחיל.</p>
              </div>
            )}

            {!isLoading && !error && invoices.length > 0 && (
              <div className="space-y-4">
                {invoices.map((invoice) => (
                  <div key={invoice.id} className="relative group">
                    <InvoiceDetails invoice={invoice} />
                    <div className="absolute top-2 left-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                        <Button size="icon" className="bg-green-500 hover:bg-green-600" onClick={() => handleApproval(invoice.id, true)}>
                            <ThumbsUp className="w-5 h-5"/>
                        </Button>
                        <Button size="icon" variant="destructive" onClick={() => handleRejectClick(invoice)}>
                            <ThumbsDown className="w-5 h-5"/>
                        </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Rejection Dialog */}
      <AlertDialog open={!!rejectionInvoice} onOpenChange={(open) => !open && setRejectionInvoice(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>דחיית חשבונית מספק: {rejectionInvoice?.vendor}</AlertDialogTitle>
            <AlertDialogDescription>
              אנא ציין את סיבת הדחייה. הערה זו תישמר לעיון עתידי.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Textarea 
              placeholder="לדוגמה: זו אינה חשבונית, סכום שגוי, כפילות..."
              value={rejectionNotes}
              onChange={(e) => setRejectionNotes(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setRejectionInvoice(null)}>ביטול</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => handleApproval(rejectionInvoice.id, false, rejectionNotes)}
              className="bg-red-600 hover:bg-red-700"
              disabled={!rejectionNotes.trim()}
            >
              דחה חשבונית
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
