import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, Package, ChefHat, Truck, AlertCircle, Store } from 'lucide-react';
import { format, formatDistanceToNow, parseISO } from "date-fns";
import { he } from "date-fns/locale";

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

export default function NotificationItem({ 
  notification, 
  onClick, 
  onMarkAsRead, 
  showRole = false 
}) {
  const roleConfig = ROLE_CONFIG[notification.recipient_role] || ROLE_CONFIG['admin'];
  const RoleIcon = roleConfig.icon;

  const formatTimeAgo = (dateString) => {
    try {
      const date = parseISO(dateString);
      return formatDistanceToNow(date, { addSuffix: true, locale: he });
    } catch (error) {
      return 'זמן לא ידוע';
    }
  };

  return (
    <div
      className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-md ${
        notification.is_read 
          ? 'bg-gray-50 border-gray-200' 
          : 'bg-white border-blue-200 shadow-sm'
      }`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {/* אייקון התראה לפי סוג */}
            <div className="flex-shrink-0">
              <div className={`p-1 rounded-full ${roleConfig.color} bg-opacity-30`}>
                <RoleIcon className="w-3 h-3" />
              </div>
            </div>
            
            {/* תוכן ההתראה */}
            <div className="flex-1 min-w-0">
              <p className={`text-sm leading-tight ${
                notification.is_read ? 'text-gray-600' : 'text-gray-900 font-medium'
              }`}>
                {notification.message}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2">
              {/* תצוגת תפקיד יעד (רק במרכז ההתראות) */}
              {showRole && (
                <Badge className={`${roleConfig.color} text-xs flex items-center gap-1`}>
                  <RoleIcon className="w-2 h-2" />
                  {roleConfig.label}
                </Badge>
              )}
              
              {/* זמן יחסי */}
              <span className="text-xs text-gray-500">
                {formatTimeAgo(notification.created_date)}
              </span>
            </div>

            {/* כפתור סימון כנקרא (רק אם לא נקרא) */}
            {!notification.is_read && onMarkAsRead && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onMarkAsRead();
                }}
                className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
              >
                <Check className="w-3 h-3" />
              </Button>
            )}
          </div>
        </div>
      </div>
      
      {/* אינדיקטור לא נקרא */}
      {!notification.is_read && (
        <div className="absolute right-2 top-2 w-2 h-2 bg-blue-500 rounded-full"></div>
      )}
    </div>
  );
}