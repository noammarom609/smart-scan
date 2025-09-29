
import React, { useState, useEffect } from "react";
import { Order } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Archive, RefreshCw, ChefHat, Package, Search, Filter, Eye, Undo2, Calendar, User, Hash, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { createPageUrl } from "@/utils";
import { format } from "date-fns";
import { he } from "date-fns/locale";
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

export default function BakersArchivePage() {
  const [archivedOrders, setArchivedOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isReverting, setIsReverting] = useState(null);
  const [isDeleting, setIsDeleting] = useState(null); // New state for delete loading
  const [currentUser, setCurrentUser] = useState(null); // State to hold current user info

  // Placeholder for loading current user (in a real app, this would come from auth context/API)
  useEffect(() => {
    // Simulate loading user data
    const fetchCurrentUser = async () => {
      // In a real application, you'd fetch this from your authentication system
      // For demonstration, we'll mock an admin user
      await new Promise(resolve => setTimeout(resolve, 100)); // Simulate API call delay
      setCurrentUser({ id: 'user123', name: 'Admin User', custom_role: 'admin' });
      // To test as a non-admin, uncomment the line below and comment the admin line
      // setCurrentUser({ id: 'user123', name: 'Regular User', custom_role: 'baker' });
    };
    fetchCurrentUser();
  }, []);

  const loadArchivedBakingOrders = async (isRefresh = false) => {
    if (!isRefresh) setIsLoading(true);
    setIsRefreshing(true);
    try {
      // Load all baking orders that are completed
      const allBakingOrders = await Order.filter({ order_type: "הזמנה_לאופות" }, "-picking_completed_date");
      const completedOrders = allBakingOrders.filter(order => order.picking_status === 'הושלם');
      setArchivedOrders(completedOrders);
    } catch (error) {
      console.error("Error loading archived baking orders:", error);
      toast.error("שגיאה בטעינת ארכיון הזמנות האפייה");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadArchivedBakingOrders();
  }, []);

  const handleRefresh = async () => {
    toast.info("מרענן נתונים...");
    await loadArchivedBakingOrders(true);
    toast.success("הנתונים עודכנו!");
  };

  const handleViewDetails = (orderId) => {
    // Navigate to OrderDetails page with the order ID
    window.open(createPageUrl("OrderDetails") + "?id=" + orderId, "_blank");
  };

  const handleRevertStatus = async (order) => {
    setIsReverting(order.id);
    const toastId = toast.loading(`מחזיר סטטוס עבור הזמנה ${order.order_number}...`);
    
    try {
      // Revert the picking status back to active state
      const updateData = {
        picking_status: "בתהליך", // Change back to in-progress
        picking_completed_date: null, // Clear completion date
        // Add a note about who reverted and when
        notes: (order.notes || "") + `\n[${new Date().toLocaleString('he-IL')}] הוחזר מארכיון על ידי המשתמש`
      };

      await Order.update(order.id, updateData);
      
      toast.success(`הזמנת אפייה ${order.order_number} הוחזרה בהצלחה לסטטוס פעיל!`, { 
        id: toastId,
        duration: 4000 
      });
      
      // Refresh the archived orders list
      await loadArchivedBakingOrders(true);
      
    } catch (error) {
      console.error("Error reverting baking order status:", error);
      toast.error(`שגיאה בהחזרת סטטוס הזמנה ${order.order_number}. אנא נסה שוב.`, { 
        id: toastId,
        duration: 4000 
      });
    } finally {
      setIsReverting(null);
    }
  };

  const handleDeleteOrder = async (orderId, orderNumber) => {
    setIsDeleting(orderId);
    const toastId = toast.loading(`מוחק הזמנה ${orderNumber}...`);
    try {
      await Order.delete(orderId);
      toast.success(`הזמנת אפייה ${orderNumber} נמחקה לצמיתות.`, {
        id: toastId,
        duration: 4000
      });
      await loadArchivedBakingOrders(true); // Refresh the list
    } catch (error) {
      console.error("Error deleting baking order:", error);
      toast.error(`שגיאה במחיקת הזמנה ${orderNumber}. אנא נסה שוב.`, {
        id: toastId,
        duration: 4000
      });
    } finally {
      setIsDeleting(null);
    }
  };

  const safeFormatDate = (dateString) => {
    if (!dateString) return '---';
    try {
      const date = new Date(dateString);
      if (date instanceof Date && !isNaN(date)) {
        return format(date, "dd/MM/yyyy HH:mm", { locale: he });
      }
      return '---';
    } catch (e) {
      return '---';
    }
  };

  const filteredOrders = archivedOrders.filter(order => {
    const matchesSearch = !searchTerm || 
      order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.supplier?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  return (
    <div className="p-4 md:p-6 lg:p-8 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 sm:mb-8">
          <div className="text-right flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 truncate flex items-center gap-3">
              <Archive className="w-8 h-8 text-gray-600" />
              <ChefHat className="w-8 h-8 text-orange-600" />
              ארכיון אופות
            </h1>
            <p className="text-sm sm:text-base text-gray-600">צפייה וניהול של הזמנות אפייה שהושלמו</p>
          </div>
          <Button 
            onClick={handleRefresh} 
            variant="outline" 
            size="icon" 
            className="bg-white elegant-shadow flex-shrink-0" 
            disabled={isRefreshing}
          >
            <RefreshCw className={`w-5 h-5 text-gray-600 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="חפש לפי שם לקוח או מספר הזמנה..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white"
              />
            </div>
          </div>
          
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full sm:w-48 bg-white">
              <Filter className="w-4 h-4 ml-2" />
              <SelectValue placeholder="סנן לפי סטטוס" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">כל הסטטוסים</SelectItem>
              <SelectItem value="הושלם">הושלם</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Content */}
        <Card className="border-none elegant-shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              הזמנות אפייה מושלמות ({filteredOrders.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="text-center py-12">
                <Archive className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">אין הזמנות בארכיון</h3>
                <p className="text-gray-500">
                  {searchTerm ? "לא נמצאו הזמנות העונות על הקריטריונים" : "טרם הושלמו הזמנות אפייה"}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((order) => (
                  <div key={order.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-bold text-lg">{order.customer_name || "משימת אפייה פנימית"}</h4>
                        <p className="text-gray-600 text-sm flex items-center gap-2">
                          <Hash className="w-3 h-3" />
                          מספר: {order.order_number}
                        </p>
                        <p className="text-gray-600 text-sm flex items-center gap-2 mt-1">
                          <User className="w-3 h-3" />
                          ספק: {order.supplier || "לא צוין"}
                        </p>
                        <p className="text-gray-500 text-xs flex items-center gap-2 mt-1">
                          <Calendar className="w-3 h-3" />
                          הושלם: {safeFormatDate(order.picking_completed_date)}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge className="bg-green-100 text-green-800">
                          הושלם
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {order.items?.length || 0} פריטים
                        </span>
                      </div>
                    </div>
                    
                    {/* Action buttons */}
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewDetails(order.id)}
                          className="text-blue-600 border-blue-200 hover:bg-blue-50"
                        >
                          <Eye className="w-4 h-4 ml-2" />
                          צפה בפרטים
                        </Button>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              disabled={isReverting === order.id}
                              className="text-orange-600 border-orange-200 hover:bg-orange-50"
                            >
                              <Undo2 className="w-4 h-4 ml-2" />
                              {isReverting === order.id ? "מחזיר..." : "החזר סטטוס"}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="max-w-md">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="flex items-center gap-2 text-orange-700">
                                <Undo2 className="w-5 h-5" />
                                החזרת סטטוס
                              </AlertDialogTitle>
                              <AlertDialogDescription className="text-gray-600">
                                האם אתה בטוח שברצונך להחזיר את הזמנת האפייה "{order.order_number}" לסטטוס פעיל?
                                <br /><br />
                                הזמנה זו תחזור להיות זמינה בדף האופות הראשי ויהיה צורך להשלים אותה מחדש.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter className="gap-2">
                              <AlertDialogCancel className="bg-gray-100 hover:bg-gray-200">
                                ביטול
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleRevertStatus(order)}
                                className="bg-orange-600 hover:bg-orange-700 text-white"
                                disabled={isReverting === order.id}
                              >
                                <Undo2 className="w-4 h-4 ml-1" />
                                {isReverting === order.id ? "מחזיר..." : "החזר סטטוס"}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>

                        {/* New Delete Button for Admins - FIXED: Use custom_role instead of role */}
                        {currentUser?.custom_role === 'admin' && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="destructive"
                                size="sm"
                                disabled={isDeleting === order.id}
                                className="bg-red-600 hover:bg-red-700 text-white"
                              >
                                <Trash2 className="w-4 h-4 ml-2" />
                                {isDeleting === order.id ? "מוחק..." : "מחק"}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="max-w-md">
                              <AlertDialogHeader>
                                <AlertDialogTitle className="flex items-center gap-2 text-red-700">
                                  <Trash2 className="w-5 h-5" />
                                  מחיקת הזמנה
                                </AlertDialogTitle>
                                <AlertDialogDescription className="text-gray-600">
                                  האם אתה בטוח שברצונך למחוק לצמיתות את הזמנת האפייה "{order.order_number}"?
                                  <br /><br />
                                  פעולה זו אינה ניתנת לביטול.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter className="gap-2">
                                <AlertDialogCancel className="bg-gray-100 hover:bg-gray-200">
                                  ביטול
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteOrder(order.id, order.order_number)}
                                  className="bg-red-600 hover:bg-red-700 text-white"
                                  disabled={isDeleting === order.id}
                                >
                                  <Trash2 className="w-4 h-4 ml-1" />
                                  {isDeleting === order.id ? "מוחק..." : "מחק לצמיתות"}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
