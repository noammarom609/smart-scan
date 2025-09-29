import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Bell, Search, Filter, CheckSquare, ExternalLink, Eye, AlertCircle, Package, Truck, Store, ChefHat, RefreshCw } from "lucide-react";
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getNotifications } from "@/api/functions";
import { markNotificationRead } from "@/api/functions";
import { markAllNotificationsRead } from "@/api/functions";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format, isToday, isYesterday, parseISO } from "date-fns";
import { he } from "date-fns/locale";
import { User } from '@/api/entities';

// הגדרת צבעים ואייקונים לתפקידים
const ROLE_CONFIG = {
  'picker': { 
    label: 'מלקט', 
    color: 'bg-blue-100 text-blue-800 border-blue-300', 
    icon: Package 
  },
  'baker': { 
    label: 'אופה', 
    color: 'bg-green-100 text-green-800 border-green-300', 
    icon: ChefHat 
  },
  'courier': { 
    label: 'שליח', 
    color: 'bg-purple-100 text-purple-800 border-purple-300', 
    icon: Truck 
  },
  'admin': { 
    label: 'מנהל', 
    color: 'bg-red-100 text-red-800 border-red-300', 
    icon: AlertCircle 
  },
  'store_manager': { 
    label: 'מנהל חנות', 
    color: 'bg-orange-100 text-orange-800 border-orange-300', 
    icon: Store 
  }
};

// הגדרת סוגי התראות
const NOTIFICATION_TYPES = {
  'order_ready_for_pickup': 'הזמנה מוכנה לאיסוף',
  'baking_order_created': 'משימת אפייה נוצרה', 
  'shipment_ready': 'משלוח מוכן',
  'pickup_ready': 'איסוף מוכן',
  'order_completed': 'הזמנה הושלמה',
  'system_alert': 'התראת מערכת'
};

export default function AdminNotificationsPage() {
  const [filters, setFilters] = useState({
    role: 'all',
    type: 'all', 
    unreadOnly: false,
    search: ''
  });

  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [isAutoTriggering, setIsAutoTriggering] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // טעינת משתמש נוכחי
  useEffect(() => {
    const loadUser = async () => {
      try {
        const user = await User.me();
        setCurrentUser(user);
      } catch (error) {
        console.error('Error loading current user:', error);
      }
    };
    loadUser();
  }, []);

  // טעינת התראות עם מסננים
  const { data: notificationsData, isLoading, refetch, error } = useQuery({
    queryKey: ['admin-notifications', filters],
    queryFn: async () => {
      try {
        const params = new URLSearchParams({
          admin_view: 'true',
          filter: filters.unreadOnly ? 'unread' : 'all',
          limit: '100'
        });
        
        if (filters.role !== 'all') params.append('role', filters.role);
        if (filters.type !== 'all') params.append('type', filters.type);
        if (filters.search) params.append('search', filters.search);
        
        const response = await getNotifications({ 
          params: params.toString()
        });
        
        if (!response || !response.data) {
          throw new Error('No data received from server');
        }
        
        return response.data;
      } catch (error) {
        console.error('Error in AdminNotifications query:', error);
        throw error;
      }
    },
    refetchInterval: 30000,
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    onError: (error) => {
      console.error('Query error in AdminNotifications:', error);
      toast.error(`שגיאה בטעינת התראות: ${error.message}`);
    }
  });

  const notifications = useMemo(() => {
    return notificationsData?.notifications || [];
  }, [notificationsData?.notifications]);

  // קיבוץ התראות לפי תאריך
  const groupedNotifications = useMemo(() => {
    const groups = {};
    
    notifications.forEach(notification => {
      const date = parseISO(notification.created_date);
      let groupKey = '';
      
      if (isToday(date)) {
        groupKey = 'היום';
      } else if (isYesterday(date)) {
        groupKey = 'אתמול';
      } else {
        groupKey = format(date, 'dd/MM/yyyy', { locale: he });
      }
      
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(notification);
    });
    
    return groups;
  }, [notifications]);

  // פונקציות טיפול
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleNotificationClick = async (notification) => {
    try {
      if (!notification.is_read) {
        await markNotificationRead({ notificationId: notification.id });
        queryClient.invalidateQueries(['admin-notifications']);
      }
      
      if (notification.link_url) {
        navigate(notification.link_url);
      }
    } catch (error) {
      console.error('Error handling notification click:', error);
      toast.error('שגיאה בטיפול בהתראה');
    }
  };

  const handleBulkMarkAsRead = async () => {
    try {
      const filterOptions = {};
      if (filters.role !== 'all') filterOptions.recipient_role = filters.role;
      if (filters.type !== 'all') filterOptions.type = filters.type;
      if (filters.search) filterOptions.search = filters.search;

      await markAllNotificationsRead({ 
        adminBulk: true, 
        filterOptions 
      });
      
      queryClient.invalidateQueries(['admin-notifications']);
      toast.success('כל ההתראות סומנו כנקראות!');
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast.error('שגיאה בסימון התראות כנקראות');
    }
  };

  // כפתור יצירת התראות ידנית - רק למנהלים
  const handleAutoTrigger = async () => {
    if (currentUser?.custom_role !== 'admin') {
      toast.error('פעולה זו מיועדת למנהלי מערכת בלבד');
      return;
    }

    setIsAutoTriggering(true);
    try {
      // כאן אפשר להוסיף לוגיקה ליצירת התראות ידנית
      toast.info('פונקציית יצירת התראות ידנית - בפיתוח');
    } catch (error) {
      console.error('Error in auto trigger:', error);
      toast.error('שגיאה ביצירת התראות אוטומטיות');
    } finally {
      setIsAutoTriggering(false);
    }
  };

  const formatDateTime = (dateString) => {
    try {
      const date = parseISO(dateString);
      return format(date, 'HH:mm', { locale: he });
    } catch (error) {
      return dateString;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-300';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low': return 'bg-gray-100 text-gray-800 border-gray-300';
      default: return 'bg-blue-100 text-blue-800 border-blue-300';
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-6">
          <div className="flex items-center gap-4">
            <Bell className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">מרכז התראות מערכת</h1>
              <p className="text-gray-600 text-lg mt-1">ניהול כל ההתראות במערכת</p>
              {error && (
                <p className="text-red-600 text-sm mt-1">שגיאה: {error.message}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* כפתור יצירת התראות ידנית - רק למנהלים */}
            {currentUser?.custom_role === 'admin' && (
              <Button 
                onClick={handleAutoTrigger} 
                disabled={isAutoTriggering}
                variant="outline" 
                className="bg-green-50 border-green-300 text-green-700 hover:bg-green-100"
              >
                {isAutoTriggering ? (
                  <>
                    <RefreshCw className="w-4 h-4 ml-2 animate-spin" />
                    יוצר...
                  </>
                ) : (
                  <>
                    <Bell className="w-4 h-4 ml-2" />
                    צור התראות ידנית
                  </>
                )}
              </Button>
            )}
            <Button onClick={() => refetch()} variant="outline" size="icon" className="bg-white">
              <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            <Button
              onClick={handleBulkMarkAsRead}
              className="bg-green-600 hover:bg-green-700"
              disabled={notifications.filter(n => !n.is_read).length === 0}
            >
              <CheckSquare className="w-4 h-4 ml-2" />
              סמן הכל כנקרא
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6 border-none elegant-shadow-lg bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              מסננים
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">תפקיד יעד:</label>
                <Select value={filters.role} onValueChange={(value) => handleFilterChange('role', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">כל התפקידים</SelectItem>
                    {Object.entries(ROLE_CONFIG).map(([role, config]) => (
                      <SelectItem key={role} value={role}>{config.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">סוג התראה:</label>
                <Select value={filters.type} onValueChange={(value) => handleFilterChange('type', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">כל הסוגים</SelectItem>
                    {Object.entries(NOTIFICATION_TYPES).map(([type, label]) => (
                      <SelectItem key={type} value={type}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">חיפוש:</label>
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="חפש לפי הודעה או ID..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="pr-10"
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2 pt-6">
                <Checkbox
                  id="unreadOnly"
                  checked={filters.unreadOnly}
                  onCheckedChange={(checked) => handleFilterChange('unreadOnly', checked)}
                />
                <label htmlFor="unreadOnly" className="text-sm font-medium">
                  רק לא נקראו
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : Object.keys(groupedNotifications).length === 0 ? (
          <Card className="border-none elegant-shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-12 text-center">
              <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">אין התראות</h3>
              <p className="text-gray-500">לא נמצאו התראות המתאימות למסננים שנבחרו.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedNotifications).map(([dateGroup, groupNotifications]) => (
              <Card key={dateGroup} className="border-none elegant-shadow-lg bg-white/90 backdrop-blur-sm">
                <CardHeader className="bg-blue-50 rounded-t-lg">
                  <CardTitle className="text-blue-800">{dateGroup} ({groupNotifications.length} התראות)</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>שעה</TableHead>
                        <TableHead>תפקיד יעד</TableHead>
                        <TableHead>סוג</TableHead>
                        <TableHead>הודעה</TableHead>
                        <TableHead>עדיפות</TableHead>
                        <TableHead>סטטוס</TableHead>
                        <TableHead>פעולות</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {groupNotifications.map((notification) => {
                        const RoleIcon = ROLE_CONFIG[notification.recipient_role]?.icon || AlertCircle;
                        return (
                          <TableRow key={notification.id} className={`hover:bg-gray-50 ${!notification.is_read ? 'bg-blue-50/30' : ''}`}>
                            <TableCell className="font-mono text-sm">
                              {formatDateTime(notification.created_date)}
                            </TableCell>
                            <TableCell>
                              <Badge className={`${ROLE_CONFIG[notification.recipient_role]?.color || 'bg-gray-100 text-gray-800'} flex items-center gap-1 w-fit`}>
                                <RoleIcon className="w-3 h-3" />
                                {ROLE_CONFIG[notification.recipient_role]?.label || notification.recipient_role}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {NOTIFICATION_TYPES[notification.type] || notification.type}
                              </Badge>
                            </TableCell>
                            <TableCell className="max-w-md">
                              <p className="truncate">{notification.message}</p>
                            </TableCell>
                            <TableCell>
                              <Badge className={getPriorityColor(notification.priority)}>
                                {notification.priority || 'medium'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {notification.is_read ? (
                                <Badge className="bg-gray-100 text-gray-600">נקרא</Badge>
                              ) : (
                                <Badge className="bg-blue-100 text-blue-800">חדש</Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleNotificationClick(notification)}
                                  className="text-blue-600 hover:text-blue-800"
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                                {notification.link_url && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => navigate(notification.link_url)}
                                    className="text-gray-600 hover:text-gray-800"
                                  >
                                    <ExternalLink className="w-4 h-4" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}