
import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, CheckCheck, X, Settings } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getNotifications } from "@/api/functions";
import { markNotificationRead } from "@/api/functions";
import { markAllNotificationsRead } from "@/api/functions";
import { User } from '@/api/entities';
import { createPageUrl } from "@/utils";
import { useNavigate } from "react-router-dom";
import NotificationItem from './NotificationItem';

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("unread");
  const [currentUser, setCurrentUser] = useState(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // טעינת המשתמש הנוכחי
  useEffect(() => {
    const loadUser = async () => {
      try {
        const user = await User.me();
        setCurrentUser(user);
      } catch (error) {
        console.error('Error loading user:', error);
      }
    };
    loadUser();
  }, []);

  const isAdmin = currentUser?.custom_role === 'admin';

  // טעינת התראות - משתמש רגיל
  const { data: notificationsData, isLoading } = useQuery({
    queryKey: ['notifications', activeTab],
    queryFn: async () => {
      const response = await getNotifications({ filter: activeTab });
      return response.data;
    },
    refetchInterval: 30000, // רענון כל 30 שניות
    enabled: true
  });

  // טעינת התראות - מנהל מערכת (תצוגה מקוצרת)
  const { data: adminNotificationsData } = useQuery({
    queryKey: ['admin-notifications-preview', activeTab],
    queryFn: async () => {
      try {
        const response = await getNotifications({ 
          params: 'admin_view=true&filter=all&limit=10'
        });
        return response.data;
      } catch (error) {
        console.error('Error fetching admin notifications:', error);
        return { notifications: [], unreadCount: 0 };
      }
    },
    refetchInterval: 30000,
    enabled: isAdmin // רק עבור מנהלים
  });

  const notifications = notificationsData?.notifications || [];
  const adminNotifications = adminNotificationsData?.notifications || [];
  const unreadCount = notificationsData?.unreadCount || 0;

  // בדיקה לפתיחה אוטומטית עם deep link
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const shouldOpen = urlParams.get('notify') === 'open';
    
    if (shouldOpen) {
      if (isAdmin) {
        // עבור מנהלים - נווט למרכז ההתראות
        navigate(createPageUrl('AdminNotifications') + window.location.search);
      } else {
        // עבור משתמשים רגילים - פתח את הדרוור
        setIsOpen(true);
      }
      
      // הסרת הפרמטר מה-URL בלי רענון הדף
      const newUrl = new URL(window.location);
      newUrl.searchParams.delete('notify');
      window.history.replaceState({}, '', newUrl);
    }
  }, [isAdmin, navigate]);

  // פונקציה לסימון התראה כנקראה
  const handleMarkAsRead = async (notificationId) => {
    try {
      await markNotificationRead({ notificationId });
      queryClient.invalidateQueries(['notifications']);
      if (isAdmin) {
        queryClient.invalidateQueries(['admin-notifications-preview']);
      }
      toast.success('התראה סומנה כנקראה');
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('שגיאה בסימון ההתראות');
    }
  };

  // פונקציה לסימון כל ההתראות כנקראו
  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsRead({});
      queryClient.invalidateQueries(['notifications']);
      if (isAdmin) {
        queryClient.invalidateQueries(['admin-notifications-preview']);
      }
      toast.success('כל ההתראות סומנו כנקראו');
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast.error('שגיאה בסימון כל ההתראות');
    }
  };

  // פונקציה לניווט להתראה
  const handleNotificationClick = (notification) => {
    if (!notification.is_read) {
      handleMarkAsRead(notification.id);
    }
    
    if (notification.link_url) {
      // אם זה קישור פנימי, נווט בלי רענון דף
      if (notification.link_url.startsWith('/')) {
        navigate(notification.link_url);
      } else {
        window.open(notification.link_url, '_blank');
      }
    }
    
    setIsOpen(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative hover:bg-gray-100 focus:bg-gray-100"
          aria-label="התראות"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      
      <SheetContent side="right" className="w-full sm:w-96 p-0 flex flex-col h-full" dir="rtl">
        <SheetHeader className="p-4 pb-2 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-lg font-bold">התראות</SheetTitle>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMarkAllAsRead}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  <CheckCheck className="w-4 h-4 ml-1" />
                  סמן הכל כנקרא
                </Button>
              )}
              {isAdmin && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    navigate(createPageUrl('AdminNotifications'));
                    setIsOpen(false);
                  }}
                  className="text-xs text-purple-600 hover:text-purple-800"
                >
                  <Settings className="w-4 h-4 ml-1" />
                  מרכז ניהול
                </Button>
              )}
            </div>
          </div>
        </SheetHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col flex-1 overflow-hidden">
          <TabsList className={`grid w-full m-4 mb-0 flex-shrink-0 ${isAdmin ? 'grid-cols-3' : 'grid-cols-2'}`}>
            <TabsTrigger value="unread" className="relative">
              לא נקראו
              {unreadCount > 0 && (
                <Badge variant="secondary" className="mr-2 h-4 w-4 p-0 text-xs">
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="all">שלי</TabsTrigger>
            {isAdmin && (
              <TabsTrigger value="admin">הכל</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="unread" className="flex-1 overflow-y-auto mx-4 mb-4">
            <div className="space-y-2 py-4">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                </div>
              ) : notifications.filter(n => !n.is_read).length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="font-medium">אין התראות חדשות</p>
                  <p className="text-sm">כל ההתראות נקראו</p>
                </div>
              ) : (
                notifications
                  .filter(n => !n.is_read)
                  .map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onClick={() => handleNotificationClick(notification)}
                      onMarkAsRead={() => handleMarkAsRead(notification.id)}
                    />
                  ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="all" className="flex-1 overflow-y-auto mx-4 mb-4">
            <div className="space-y-2 py-4">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="font-medium">אין התראות</p>
                  <p className="text-sm">לא נמצאו התראות</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onClick={() => handleNotificationClick(notification)}
                    onMarkAsRead={() => handleMarkAsRead(notification.id)}
                  />
                ))
              )}
            </div>
          </TabsContent>

          {/* טאב מיוחד למנהלי מערכת */}
          {isAdmin && (
            <TabsContent value="admin" className="flex-1 overflow-y-auto mx-4 mb-4">
              <div className="space-y-2 py-4">
                {!adminNotificationsData ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  </div>
                ) : adminNotifications.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="font-medium">אין התראות</p>
                    <p className="text-sm">לא נמצאו התראות במערכת</p>
                  </div>
                ) : (
                  <>
                    {adminNotifications.map((notification) => (
                      <NotificationItem
                        key={notification.id}
                        notification={notification}
                        onClick={() => handleNotificationClick(notification)}
                        onMarkAsRead={() => handleMarkAsRead(notification.id)}
                        showRole={true} // הצגת תפקיד היעד
                      />
                    ))}
                    
                    {adminNotifications.length >= 10 && (
                      <div className="text-center py-4">
                        <Button
                          variant="outline"
                          onClick={() => {
                            navigate(createPageUrl('AdminNotifications'));
                            setIsOpen(false);
                          }}
                          className="text-purple-600 border-purple-200 hover:bg-purple-50"
                        >
                          <Settings className="w-4 h-4 ml-2" />
                          צפה בכל ההתראות
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </TabsContent>
          )}
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
