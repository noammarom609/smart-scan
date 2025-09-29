
import React, { useState, useEffect, useCallback } from 'react';
import { User } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, CheckCircle, Clock, Mail, RefreshCw, UserCheck, Trash2, ShieldAlert } from "lucide-react";
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
import { toast } from "sonner";
import { format } from "date-fns";
import { he } from "date-fns/locale";

const ROLE_NAMES = {
  admin: "מנהל מערכת",
  store_manager: "מנהל חנות",
  baker: "אופה",
  picker: "מלקט",
  picker_baker: "מלקט ואופה",
  courier: "שליח",
  pending: "ממתין לאישור"
};

const ROLE_COLORS = {
  admin: "bg-purple-100 text-purple-800 border-purple-200",
  store_manager: "bg-teal-100 text-teal-800 border-teal-200",
  baker: "bg-orange-100 text-orange-800 border-orange-200",
  picker: "bg-blue-100 text-blue-800 border-blue-200",
  picker_baker: "bg-cyan-100 text-cyan-800 border-cyan-200",
  courier: "bg-green-100 text-green-800 border-green-200",
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200"
};

const ROLE_OPTIONS = [
  { value: "admin", label: "מנהל מערכת" },
  { value: "store_manager", label: "מנהל חנות" },
  { value: "picker", label: "מלקט" },
  { value: "baker", label: "אופה" },
  { value: "picker_baker", label: "מלקט ואופה" },
  { value: "courier", label: "שליח" },
  { value: "pending", label: "ממתין לאישור" },
];

const COURIER_COMPANIES = [
  { value: "ציטה", label: "ציטה" },
  { value: "דוד", label: "דוד" },
  { value: "עצמאי", label: "עצמאי" },
];

export default function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [editingCourierData, setEditingCourierData] = useState({});

  const loadUsers = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setIsLoading(true);
    setIsRefreshing(true);
    try {
      // First ensure we have a valid authenticated user for authorization check
      const currentUserForAuth = await User.me();
      
      // Verify admin permissions before attempting to load users
      if (!currentUserForAuth || currentUserForAuth.custom_role !== 'admin') {
        throw new Error('Insufficient permissions - admin role required');
      }

      // Load all users with proper error handling
      const allUsers = await User.list();
      setUsers(allUsers || []); // Ensure we have an array even if undefined
      
    } catch (error) {
      console.error("Error loading users:", error);
      
      // Handle specific error cases
      if (error.message?.includes('permission') || error.message?.includes('admin')) {
        setIsAuthorized(false);
        toast.error("אין לך הרשאות לצפות ברשימת המשתמשים");
      } else if (error.message?.includes('401') || error.message?.includes('authentication')) {
        // Authentication issue - might need to re-login
        toast.error("נדרשת התחברות מחדש");
        try {
          await User.loginWithRedirect(window.location.href);
        } catch (loginError) {
          toast.error("שגיאה בהתחברות");
        }
      } else {
        toast.error("שגיאה בטעינת המשתמשים - נסה להתחבר מחדש");
      }
      
      setUsers([]); // Set empty array on error
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  const checkAuthorizationAndLoadData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Check current user authentication and authorization
      const user = await User.me();
      setCurrentUser(user);
      
      if (user && user.custom_role === 'admin') {
        setIsAuthorized(true);
        // Load users after confirming authorization
        await loadUsers(false);
      } else {
        setIsAuthorized(false);
        setIsLoading(false);
        if (user) {
          toast.warning("נדרשות הרשאות מנהל למעצת דף זה");
        }
      }
    } catch (error) {
      console.error("Error checking authorization:", error);
      setIsAuthorized(false);
      setCurrentUser(null);
      setIsLoading(false);
      
      // Handle authentication errors
      if (error.message?.includes('401') || error.message?.includes('authentication')) {
        toast.error("נדרשת התחברות למערכת");
      } else {
        toast.error("שגיאה בבדיקת הרשאות");
      }
    }
  }, [loadUsers]);

  useEffect(() => {
    checkAuthorizationAndLoadData();
  }, [checkAuthorizationAndLoadData]);

  const handleRefresh = async () => {
    toast.info("מרענן נתונים...");
    try {
      await loadUsers(true);
      toast.success("הנתונים עודכנו!");
    } catch (error) {
      toast.error("שגיאה בריענון הנתונים");
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    const toastId = toast.loading("מעדכן תפקיד...");
    try {
      // Verify we still have admin permissions
      const adminUser = await User.me();
      if (!adminUser || adminUser.custom_role !== 'admin') {
        throw new Error('Insufficient permissions');
      }

      const updateData = { 
        custom_role: newRole,
        approved_by: adminUser.email,
        approved_date: new Date().toISOString()
      };

      // If not courier role, clear courier company affiliation
      if (newRole !== 'courier') {
        updateData.courier_company_affiliation = null;
      }

      await User.update(userId, updateData);
      
      toast.success(`התפקיד עודכן בהצלחה ל${ROLE_NAMES[newRole]}`, { id: toastId });
      await loadUsers(true); // Refresh the list
    } catch (error) {
      console.error("Error updating user custom_role:", error);
      if (error.message?.includes('permission')) {
        toast.error("אין לך הרשאות לעדכן תפקידים", { id: toastId });
      } else {
        toast.error("שגיאה בעדכון התפקיד", { id: toastId });
      }
    }
  };

  const handleCourierCompanyChange = async (userId, courierCompany) => {
    const toastId = toast.loading("מעדכן חברת שליחויות...");
    try {
      // Verify admin permissions
      const adminUser = await User.me();
      if (!adminUser || adminUser.custom_role !== 'admin') {
        throw new Error('Insufficient permissions');
      }

      await User.update(userId, { 
        courier_company_affiliation: courierCompany,
        approved_by: adminUser.email,
        approved_date: new Date().toISOString()
      });
      
      toast.success(`חברת השליחויות עודכנה בהצלחה`, { id: toastId });
      await loadUsers(true); // Refresh the list
    } catch (error) {
      console.error("Error updating courier company:", error);
      if (error.message?.includes('permission')) {
        toast.error("אין לך הרשאות לעדכן חברת שליחויות", { id: toastId });
      } else {
        toast.error("שגיאה בעדכון חברת השליחויות", { id: toastId });
      }
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    // בדיקה מיוחדת לחשבון המוגן
    const userToDelete = users.find(user => user.id === userId);
    if (userToDelete && userToDelete.email === 'tupe241099@gmail.com') {
      toast.error("לא ניתן למחוק את חשבון מנהל המערכת הראשי", {
        duration: 5000,
        position: "top-center"
      });
      return;
    }

    const toastId = toast.loading(`מוחק את ${userName}...`);
    try {
      // Verify admin permissions
      const adminUser = await User.me();
      if (!adminUser || adminUser.custom_role !== 'admin') {
        throw new Error('Insufficient permissions');
      }

      await User.delete(userId);
      toast.success(`המשתמש ${userName} נמחק בהצלחה`, { id: toastId });
      await loadUsers(true); // רענון הרשימה
    } catch (error) {
      console.error("Error deleting user:", error);
      if (error.message?.includes('permission')) {
        toast.error(`אין לך הרשאות למחוק את המשתמש ${userName}`, { id: toastId });
      } else {
        toast.error(`שגיאה במחיקת המשתמש ${userName}`, { id: toastId });
      }
    }
  };

  // Ensure users is always an array
  const safeUsers = Array.isArray(users) ? users : [];
  const pendingUsers = safeUsers.filter(user => (user.custom_role || 'pending') === 'pending');
  const approvedUsers = safeUsers.filter(user => (user.custom_role || 'pending') !== 'pending');

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6 lg:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-48 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6 lg:p-8 flex items-center justify-center">
        <Card className="max-w-lg w-full border-none elegant-shadow-lg bg-white/90 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldAlert className="w-8 h-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              אין לך הרשאת גישה
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600 leading-relaxed">
              שלום <strong>{currentUser?.full_name || 'משתמש'}</strong>,
              <br />
              לצפייה בדף זה נדרשות הרשאות של "מנהל מערכת".
            </p>
            <p className="text-sm text-gray-500">
              אם אתה חושב שזו טעות, אנא פנה למנהל המערכת שלך.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">ניהול משתמשים</h1>
              <p className="text-gray-600 text-lg">ניהול הרשאות ואישור משתמשים חדשים</p>
            </div>
          </div>
          <Button onClick={handleRefresh} variant="outline" size="icon" className="bg-white elegant-shadow" disabled={isRefreshing}>
            <RefreshCw className={`w-5 h-5 text-gray-600 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        <div className="space-y-6">
          {/* סטטיסטיקות */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-none elegant-shadow-lg bg-white/90 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-600">סה״כ משתמשים</p>
                    <p className="text-2xl font-bold text-gray-900">{safeUsers.length}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none elegant-shadow-lg bg-white/90 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-600">ממתינים לאישור</p>
                    <p className="text-2xl font-bold text-orange-600">{pendingUsers.length}</p>
                  </div>
                  <div className="p-3 bg-orange-100 rounded-xl">
                    <Clock className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none elegant-shadow-lg bg-white/90 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-600">משתמשים מאושרים</p>
                    <p className="text-2xl font-bold text-green-600">{approvedUsers.length}</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-xl">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* משתמשים ממתינים לאישור */}
          {pendingUsers.length > 0 && (
            <Card className="border-none elegant-shadow-lg bg-white/90 backdrop-blur-sm">
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="flex items-center gap-3">
                  <Clock className="w-6 h-6 text-orange-600" />
                  משתמשים ממתינים לאישור ({pendingUsers.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-orange-50">
                      <TableHead className="text-right font-semibold">שם מלא</TableHead>
                      <TableHead className="text-right font-semibold">אימייל</TableHead>
                      <TableHead className="text-right font-semibold">תאריך הרשמה</TableHead>
                      <TableHead className="text-right font-semibold">פעולות</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingUsers.map((user) => (
                      <TableRow key={user.id} className="hover:bg-orange-50/50">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center">
                              <span className="text-orange-700 font-bold text-sm">
                                {user.full_name ? user.full_name[0].toUpperCase() : '?'}
                              </span>
                            </div>
                            <span className="font-semibold">{user.full_name || 'לא צוין'}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-gray-500" />
                            <span className="font-mono text-sm">{user.email}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {safeFormatDate(user.created_date)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Select 
                              onValueChange={(value) => handleRoleChange(user.id, value)}
                              disabled={user.id === currentUser?.id} // Cannot change self role
                            >
                              <SelectTrigger className="w-40 bg-white border-gray-200">
                                <SelectValue placeholder="בחר תפקיד" />
                              </SelectTrigger>
                              <SelectContent>
                                {ROLE_OPTIONS.filter(role => role.value !== 'pending').map(role => (
                                  <SelectItem key={role.value} value={role.value}>
                                    {role.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="text-red-500 hover:bg-red-50"
                                  disabled={user.id === currentUser?.id} // Cannot delete self
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>האם אתה בטוח?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    פעולה זו תמחק את המשתמש {user.full_name || user.email} באופן קבוע. לא ניתן לשחזר פעולה זו.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>ביטול</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteUser(user.id, user.full_name || user.email)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    כן, מחק
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* Approved Users Section */}
          {approvedUsers.length > 0 && (
            <Card className="border-none elegant-shadow-lg bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <UserCheck className="w-6 h-6 text-blue-600" />
                  כל המשתמשים ({approvedUsers.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead className="text-right">שם מלא</TableHead>
                        <TableHead className="text-right">אימייל</TableHead>
                        <TableHead className="text-right">תפקיד</TableHead>
                        <TableHead className="text-right">תאריך אישור</TableHead>
                        <TableHead className="text-right">אושר על ידי</TableHead>
                        <TableHead className="text-right">פעולות</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {approvedUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
                                <span className="text-blue-700 font-semibold text-sm">
                                  {user.full_name ? user.full_name[0].toUpperCase() : user.email[0].toUpperCase()}
                                </span>
                              </div>
                              <span className="font-medium">{user.full_name || 'לא צוין'}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4 text-gray-400" />
                              {user.email}
                              {user.email === 'tupe241099@gmail.com' && (
                                <Badge className="bg-purple-100 text-purple-800 border-purple-200 text-xs">
                                  מנהל ראשי
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Select
                                value={user.custom_role || 'pending'}
                                onValueChange={(newRole) => handleRoleChange(user.id, newRole)}
                                disabled={user.email === 'tupe241099@gmail.com' || user.id === currentUser?.id} // Prevent main admin role change and self-role change
                              >
                                <SelectTrigger className="w-40">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {ROLE_OPTIONS.map(role => (
                                    <SelectItem key={role.value} value={role.value}>
                                      {role.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              
                              {/* בחירת חברת שליחויות עבור שליחים */}
                              {user.custom_role === 'courier' && (
                                <Select
                                  value={user.courier_company_affiliation || ''}
                                  onValueChange={(value) => handleCourierCompanyChange(user.id, value)}
                                >
                                  <SelectTrigger className="w-32">
                                    <SelectValue placeholder="בחר חברה" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {COURIER_COMPANIES.map(company => (
                                      <SelectItem key={company.value} value={company.value}>
                                        {company.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {user.approved_date ? safeFormatDate(user.approved_date) : '---'}
                          </TableCell>
                          <TableCell>
                            {user.approved_by || '---'}
                          </TableCell>
                          <TableCell>
                            {user.email === 'tupe241099@gmail.com' ? (
                              <Badge className="bg-gray-100 text-gray-600 border-gray-200 text-xs">
                                מוגן ממחיקה
                              </Badge>
                            ) : (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-red-600 hover:text-red-800 hover:bg-red-50"
                                    disabled={user.id === currentUser?.id} // Cannot delete self
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>מחיקת משתמש</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      האם אתה בטוח שברצונך למחוק את המשתמש {user.full_name || user.email}?
                                      פעולה זו לא ניתנת לביטול.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>ביטול</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDeleteUser(user.id, user.full_name || user.email)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      מחק
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* הוראות לשיתוף קישור */}
          <Card className="border-none elegant-shadow-lg bg-blue-50/50 backdrop-blur-sm border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-900">איך לשתף את האפליקציה עם עובדים חדשים?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-white p-4 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-2">שלח את הקישור הזה לעובדים:</h4>
                <div className="bg-gray-100 p-3 rounded-lg font-mono text-sm break-all">
                  {window.location.origin}
                </div>
              </div>
              <div className="space-y-2 text-sm text-blue-800">
                <p><strong>1.</strong> העובד יכנס לקישור ויתחבר עם חשבון הגוגל שלו</p>
                <p><strong>2.</strong> הוא יקבל הודעה שהגישה שלו ממתינה לאישור</p>
                <p><strong>3.</strong> אתה תראה אותו כאן ברשימת "ממתינים לאישור"</p>
                <p><strong>4.</strong> תבחר לו תפקיד מתאים והוא יוכל להתחיל לעבוד</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
