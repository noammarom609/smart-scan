
import React, { useState, useEffect, useCallback } from 'react';
import { User } from '@/api/entities';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { getUserRole } from '@/components/utils/rolePermissions';

// רכיב לבדיקת הרשאות - עוטף דפים/רכיבים שדורשים הרשאה מסוימת
export default function RoleGuard({ 
  children, 
  allowedRoles = [], 
  redirectTo = null,
  showLoader = true 
}) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState(false);
  const navigate = useNavigate();

  const checkUserPermission = useCallback(async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);
      
      // בדיקה אם המשתמש מאושר (לא pending)
      const userRole = getUserRole(currentUser);
      if (userRole === 'pending') {
        navigate(createPageUrl('PendingApproval'));
        return;
      }

      // בדיקה אם יש הרשאה לדף זה
      const hasAccess = allowedRoles.length === 0 || allowedRoles.includes(userRole);
      
      setHasPermission(hasAccess);
      
      if (!hasAccess && redirectTo) {
        navigate(createPageUrl(redirectTo));
      }
    } catch (error) {
      console.error("Error checking user permission:", error);
      // אם יש שגיאה באימות, נתב לדף התחברות או דף שגיאה
      navigate(createPageUrl('Login'));
    } finally {
      setIsLoading(false);
    }
  }, [allowedRoles, navigate, redirectTo]);

  useEffect(() => {
    checkUserPermission();
  }, [checkUserPermission]);

  if (showLoader && isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">טוען הרשאות...</p>
        </div>
      </div>
    );
  }

  if (!hasPermission) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 text-2xl">🚫</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">אין הרשאה</h2>
          <p className="text-gray-600">אין לך הרשאה לגשת לעמוד זה</p>
        </div>
      </div>
    );
  }

  return children;
}
