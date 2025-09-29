import React, { useState, useEffect } from 'react';
import { User } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Mail, RefreshCw } from "lucide-react";

export default function PendingApprovalPage() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);
    } catch (error) {
      console.error("Error loading user data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-6">
      <Card className="max-w-md w-full border-none elegant-shadow-lg bg-white/90 backdrop-blur-sm">
        <CardHeader className="text-center pb-4">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            ממתין לאישור
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <div>
            <p className="text-gray-600 mb-4">
              שלום <strong>{user?.full_name || 'משתמש'}</strong>,
            </p>
            <p className="text-gray-600 leading-relaxed">
              החשבון שלך ממתין לאישור מנהל המערכת. 
              <br />
              לאחר האישור תוכל לגשת לכל הפעולות המותרות לך במערכת.
            </p>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 text-blue-700 mb-2">
              <Mail className="w-4 h-4" />
              <span className="font-semibold">פרטי ההתחברות:</span>
            </div>
            <p className="text-blue-600 text-sm">
              <strong>אימייל:</strong> {user?.email}
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-sm text-gray-500">
              צור קשר עם מנהל המערכת לאישור החשבון
            </p>
            <Button 
              onClick={handleRefresh}
              variant="outline"
              className="w-full"
            >
              <RefreshCw className="w-4 h-4 ml-2" />
              בדוק שוב
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}