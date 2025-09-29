import React, { useState, useEffect } from 'react';
import { User as UserEntity } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  Settings as SettingsIcon, 
  User, 
  Shield, 
  Bell, 
  Link, 
  Save,
  Smartphone,
  Globe,
  Clock,
  Mail,
  Check,
  X,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';

const TIMEZONES = [
  { value: 'Asia/Jerusalem', label: 'ירושלים (GMT+2/+3)' },
  { value: 'Europe/London', label: 'לונדון (GMT+0/+1)' },
  { value: 'America/New_York', label: 'ניו יורק (GMT-5/-4)' },
  { value: 'America/Los_Angeles', label: 'לוס אנג\'לס (GMT-8/-7)' },
];

const LANGUAGES = [
  { value: 'he', label: 'עברית' },
  { value: 'en', label: 'English' },
  { value: 'ar', label: 'العربية' },
];

export default function SettingsPage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  
  // Profile form state
  const [profileForm, setProfileForm] = useState({
    full_name: '',
    email: '',
    timezone: 'Asia/Jerusalem',
    language: 'he'
  });

  // Notification settings
  const [notifications, setNotifications] = useState({
    email_enabled: true,
    whatsapp_enabled: false,
    push_enabled: true
  });

  // Load user data
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const user = await UserEntity.me();
        setCurrentUser(user);
        
        // Initialize form with user data
        setProfileForm({
          full_name: user.full_name || '',
          email: user.email || '',
          timezone: user.timezone || 'Asia/Jerusalem',
          language: user.language || 'he'
        });

        // Initialize notification settings (stub data)
        setNotifications({
          email_enabled: user.email_notifications !== false,
          whatsapp_enabled: user.whatsapp_notifications || false,
          push_enabled: user.push_notifications !== false
        });

      } catch (error) {
        console.error('Error loading user data:', error);
        toast.error('שגיאה בטעינת נתוני המשתמש');
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, []);

  // Track form changes
  useEffect(() => {
    if (!currentUser) return;
    
    const hasChanges = 
      profileForm.full_name !== (currentUser.full_name || '') ||
      profileForm.timezone !== (currentUser.timezone || 'Asia/Jerusalem') ||
      profileForm.language !== (currentUser.language || 'he');
    
    setHasUnsavedChanges(hasChanges);
  }, [profileForm, currentUser]);

  // Warn about unsaved changes before leaving
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = 'יש לך שינויים שלא נשמרו. האם אתה בטוח שברצונך לעזוב?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const handleProfileInputChange = (field, value) => {
    setProfileForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      // Only send fields that can be updated
      const updateData = {
        full_name: profileForm.full_name,
        timezone: profileForm.timezone,
        language: profileForm.language
      };

      await UserEntity.updateMyUserData(updateData);
      
      // Update local state
      setCurrentUser(prev => ({
        ...prev,
        ...updateData
      }));

      setHasUnsavedChanges(false);
      toast.success('הפרופיל עודכן בהצלחה');

    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('שגיאה בשמירת הפרופיל');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDisconnectOtherDevices = async () => {
    // Stub implementation
    toast.info('תכונה זו תהיה זמינה בקרוב');
  };

  const handleRevokeGoogleAccess = async () => {
    // Stub implementation
    toast.info('תכונה זו תהיה זמינה בקרוב');
  };

  const getUserRole = () => {
    const role = currentUser?.custom_role || 'pending';
    const roleMap = {
      admin: 'מנהל מערכת',
      store_manager: 'מנהל חנות',
      baker: 'אופה',
      picker: 'מלקט',
      picker_baker: 'מלקט ואופה',
      courier: 'שליח',
      pending: 'ממתין לאישור'
    };
    return roleMap[role] || 'משתמש';
  };

  const tabs = [
    { id: 'profile', label: 'פרופיל', icon: User },
    { id: 'security', label: 'אבטחה', icon: Shield },
    { id: 'notifications', label: 'התראות', icon: Bell },
    { id: 'connections', label: 'חשבונות מחוברים', icon: Link },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">טוען הגדרות...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <SettingsIcon className="w-8 h-8 text-blue-600" />
            הגדרות
          </h1>
          <p className="text-gray-600 mt-2">נהל את הפרופיל והעדפות החשבון שלך</p>
        </div>

        {/* Unsaved Changes Alert */}
        {hasUnsavedChanges && (
          <Alert className="mb-6 border-orange-200 bg-orange-50">
            <AlertCircle className="w-4 h-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              יש לך שינויים שלא נשמרו. אל תשכח לשמור לפני שתעזוב את הדף.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">קטגוריות</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <nav className="space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-right hover:bg-gray-50 transition-colors ${
                        activeTab === tab.id
                          ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-700'
                          : 'text-gray-700'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </CardContent>
          </Card>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-600" />
                    פרופיל אישי
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Current User Info */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
                        <span className="text-blue-700 font-bold">
                          {currentUser?.full_name ? currentUser.full_name[0].toUpperCase() : 'מ'}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-blue-900">
                          {currentUser?.full_name || 'משתמש'}
                        </h3>
                        <p className="text-blue-700 text-sm">{getUserRole()}</p>
                        <Badge variant="outline" className="mt-1 text-xs">
                          {currentUser?.email}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Profile Form */}
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="full_name" className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        שם מלא
                      </Label>
                      <Input
                        id="full_name"
                        value={profileForm.full_name}
                        onChange={(e) => handleProfileInputChange('full_name', e.target.value)}
                        placeholder="הכנס שם מלא"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        כתובת אימייל
                      </Label>
                      <Input
                        value={profileForm.email}
                        disabled
                        className="mt-1 bg-gray-50 text-gray-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        לא ניתן לשנות כתובת אימייל
                      </p>
                    </div>

                    <div>
                      <Label className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        אזור זמן
                      </Label>
                      <Select
                        value={profileForm.timezone}
                        onValueChange={(value) => handleProfileInputChange('timezone', value)}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {TIMEZONES.map((tz) => (
                            <SelectItem key={tz.value} value={tz.value}>
                              {tz.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="flex items-center gap-2">
                        <Globe className="w-4 h-4" />
                        שפה
                      </Label>
                      <Select
                        value={profileForm.language}
                        onValueChange={(value) => handleProfileInputChange('language', value)}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {LANGUAGES.map((lang) => (
                            <SelectItem key={lang.value} value={lang.value}>
                              {lang.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Separator />

                  {/* Save Button */}
                  <div className="flex justify-end">
                    <Button
                      onClick={handleSaveProfile}
                      disabled={!hasUnsavedChanges || isSaving}
                      className="flex items-center gap-2"
                    >
                      {isSaving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      {isSaving ? 'שומר...' : 'שמור שינויים'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-green-600" />
                    אבטחה
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-2">סשנים פעילים</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Smartphone className="w-5 h-5 text-gray-500" />
                          <div>
                            <p className="font-medium">המכשיר הנוכחי</p>
                            <p className="text-sm text-gray-500">
                              {navigator.userAgent.includes('Mobile') ? 'מכשיר נייד' : 'מחשב שולחני'} • פעיל כעת
                            </p>
                          </div>
                        </div>
                        <Badge className="bg-green-100 text-green-800">
                          פעיל
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="font-semibold mb-2">פעולות אבטחה</h3>
                    <div className="space-y-3">
                      <Button
                        variant="outline"
                        onClick={handleDisconnectOtherDevices}
                        className="w-full justify-start"
                      >
                        <Shield className="w-4 h-4 ml-2" />
                        נתק מכשירים אחרים
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      פעולה זו תנתק את החשבון מכל המכשירים האחרים
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5 text-yellow-600" />
                    התראות
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">התראות אימייל</h3>
                        <p className="text-sm text-gray-500">קבל עדכונים על פעילות החשבון</p>
                      </div>
                      <Switch
                        checked={notifications.email_enabled}
                        onCheckedChange={(checked) =>
                          setNotifications(prev => ({ ...prev, email_enabled: checked }))
                        }
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">התראות וואטסאפ</h3>
                        <p className="text-sm text-gray-500">קבל הודעות במסנג'ר</p>
                      </div>
                      <Switch
                        checked={notifications.whatsapp_enabled}
                        onCheckedChange={(checked) =>
                          setNotifications(prev => ({ ...prev, whatsapp_enabled: checked }))
                        }
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">התראות Push</h3>
                        <p className="text-sm text-gray-500">התראות בדפדפן</p>
                      </div>
                      <Switch
                        checked={notifications.push_enabled}
                        onCheckedChange={(checked) =>
                          setNotifications(prev => ({ ...prev, push_enabled: checked }))
                        }
                      />
                    </div>
                  </div>

                  <Alert>
                    <AlertCircle className="w-4 h-4" />
                    <AlertDescription>
                      השינויים בהגדרות ההתראות יחולו החל מהפעם הבאה שתתחבר למערכת.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            )}

            {/* Connections Tab */}
            {activeTab === 'connections' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Link className="w-5 h-5 text-purple-600" />
                    חשבונות מחוברים
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-4">חיבורים חיצוניים</h3>
                    
                    {/* Google Connection */}
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                            <span className="text-red-600 font-bold text-sm">G</span>
                          </div>
                          <div>
                            <h4 className="font-medium">Google</h4>
                            <p className="text-sm text-gray-500">
                              מחובר לחשבון Google לצורך כניסה למערכת
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-green-100 text-green-800">
                            <Check className="w-3 h-3 ml-1" />
                            מחובר
                          </Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleRevokeGoogleAccess}
                          >
                            בטל גישה
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Alert>
                    <AlertCircle className="w-4 h-4" />
                    <AlertDescription>
                      ביטול גישה לחשבון Google יחייב אותך להתחבר מחדש למערכת.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}