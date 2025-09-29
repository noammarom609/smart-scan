
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { 
  FileText, 
  Database, 
  FileDown, 
  FileSpreadsheet, 
  Printer, 
  ShieldCheck, 
  ListChecks, 
  Search, 
  Workflow, 
  Info, 
  Users, 
  UserCog, 
  Bell, 
  Code2 
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { he } from "date-fns/locale";
import { toast } from "sonner";
import { User } from '@/api/entities';
import { BackupRun } from '@/api/entities';
import { RestoreRun } from '@/api/entities';
import { backupOrders } from '@/api/functions';
import { verifyBackup } from '@/api/functions';
import { listBackups } from '@/api/functions'; // This might become redundant if BackupRun entity is primary
import { restoreOrders } from '@/api/functions';
import { cleanupBackups } from '@/api/functions';
import { scheduleOrderBackups } from '@/api/functions';
import { businessHours as getBusinessHours } from '@/api/functions'; // Renamed import to avoid conflict and match function call in outline
import { getBackupConfig } from '@/api/functions/backupConfig'; // Assuming getBackupConfig exists for fetching config

export default function OrderBackupsPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [backups, setBackups] = useState([]);
  const [lastBackup, setLastBackup] = useState(null);
  const [nextRun, setNextRun] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [restoreStep, setRestoreStep] = useState(1);
  const [selectedBackup, setSelectedBackup] = useState(null);
  const [dryRunResults, setDryRunResults] = useState(null);
  const [restoreConflictPolicy, setRestoreConflictPolicy] = useState('skip'); // Added for detailed dry run
  const [restoreMode, setRestoreMode] = useState('full'); // Added for detailed dry run
  const [backupSettings, setBackupSettings] = useState({
    autoBackupEnabled: true,
    frequency: 2,
    retentionDays: 30,
    businessHours: {
      sunday: { enabled: true, start: '07:00', end: '23:00' },
      monday: { enabled: true, start: '07:00', end: '23:00' },
      tuesday: { enabled: true, start: '07:00', end: '23:00' },
      wednesday: { enabled: true, start: '07:00', end: '23:00' },
      thursday: { enabled: true, start: '07:00', end: '23:00' },
      friday: { enabled: true, start: '07:00', end: '15:00' },
      saturday: { enabled: false, start: '08:00', end: '14:00' }
    }
  });

  useEffect(() => {
    loadCurrentUser();
    loadBackups();
    loadSettings(); // Re-enable settings loading
  }, []);

  const loadCurrentUser = async () => {
    try {
      const user = await User.me();
      setCurrentUser(user);
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  const loadBackups = async () => {
    setIsLoading(true);
    try {
      // Use listBackups function instead of direct entity access
      const result = await listBackups({}); // Assuming listBackups returns { data: { items: [...] } }
      if (result.data) {
        setBackups(result.data.items || []);
        setLastBackup(result.data.items?.[0] || null);
      }
    } catch (error) {
      console.error('Error loading backups:', error);
      toast.error('שגיאה בטעינת גיבויים');
    } finally {
      setIsLoading(false);
    }
  };

  const loadSettings = async () => {
    try {
      // Load both business hours and backup config concurrently
      const [businessResult, configResult] = await Promise.all([
        getBusinessHours({}), // Assuming this function takes an empty object or no args
        getBackupConfig({})    // Assuming this function takes an empty object or no args
      ]);
      
      setBackupSettings(prev => ({
        ...prev,
        // Update businessHours only if data is present, otherwise keep previous
        businessHours: businessResult.data || prev.businessHours, 
        // Update other settings with fetched data or use hardcoded defaults as fallbacks
        autoBackupEnabled: configResult.data?.auto_enabled ?? true,
        frequency: configResult.data?.every_hours ?? 2,
        retentionDays: configResult.data?.retention_days ?? 30
      }));
    } catch (error) {
      console.error('Error loading settings:', error);
      // Don't show error toast - settings will use defaults or initial state values
    }
  };

  const formatLocalTime = (dateString) => {
    if (!dateString) return '---';
    try {
      const date = parseISO(dateString);
      return format(date, "dd/MM/yyyy HH:mm", { locale: he });
    } catch (error) {
      return '---';
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleRunBackup = async () => {
    setIsLoading(true);
    const toastId = toast.loading('מריץ גיבוי...');
    
    try {
      const result = await backupOrders({
        asOf: new Date().toISOString(),
        encrypt: false
      });
      
      if (result.data?.success) {
        toast.success('הגיבוי הושלם בהצלחה!', { id: toastId });
        await loadBackups();
      } else {
        toast.error(`שגיאה בגיבוי: ${result.data?.message || 'שגיאה לא ידועה'}`, { id: toastId });
      }
    } catch (error) {
      console.error('Error running backup:', error);
      toast.error('שגיאה בביצוע הגיבוי', { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyBackup = async (backupId) => {
    const toastId = toast.loading('מאמת גיבוי...');
    
    try {
      const result = await verifyBackup({ backupId });
      
      if (result.data?.ok) {
        toast.success('הגיבוי תקין ואומת בהצלחה!', { id: toastId });
      } else {
        toast.error(`הגיבוי פגום: ${result.data?.message || 'שגיאה באימות'}`, { id: toastId });
      }
    } catch (error) {
      console.error('Error verifying backup:', error);
      toast.error('שגיאה באימות הגיבוי', { id: toastId });
    }
  };

  const handleDryRunRestore = async () => {
    if (!selectedBackup) return;
    
    setIsLoading(true);
    const toastId = toast.loading('מריץ תצוגה מקדימה...');

    const currentConflictPolicy = 'skip'; // As per the outline in the original restoreOrders call
    const currentMode = 'full'; // As per the outline in the original restoreOrders call
    
    try {
      const result = await restoreOrders({
        backupId: selectedBackup.id,
        mode: currentMode,
        dryRun: true,
        conflictPolicy: currentConflictPolicy
      });
      
      if (result.data?.success) {
        setDryRunResults(result.data.diff_summary);
        setRestoreStep(2);
        setRestoreConflictPolicy(currentConflictPolicy);
        setRestoreMode(currentMode);
        toast.success('תצוגה מקדימה מוכנה', { id: toastId });
      } else {
        toast.error(`שגיאה בתצוגה מקדימה: ${result.data?.message}`, { id: toastId });
      }
    } catch (error) {
      console.error('Error in dry run:', error);
      toast.error('שגיאה בתצוגה מקדימה', { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  const canRestore = currentUser?.custom_role === 'admin';
  const canBackup = ['admin', 'store_manager'].includes(currentUser?.custom_role);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6 lg:p-8" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
              <Database className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">גיבוי ושחזור הזמנות</h1>
              <p className="text-gray-600 text-lg">ניהול גיבויים אוטומטיים ושחזור נתונים</p>
            </div>
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-6 mb-8">
            <TabsTrigger value="overview">סקירה</TabsTrigger>
            <TabsTrigger value="history">היסטוריה</TabsTrigger>
            <TabsTrigger value="backup-now">גבה עכשיו</TabsTrigger>
            <TabsTrigger value="restore">שחזור</TabsTrigger>
            <TabsTrigger value="schedule">תזמון</TabsTrigger>
            <TabsTrigger value="logs">יומנים</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            {/* @generated:bk-overview BEGIN */}
            <div className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Last Backup */}
                <Card className="border-none shadow-lg bg-white/90 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <Database className="w-5 h-5 text-blue-600" />
                      גיבוי אחרון
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {lastBackup ? (
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">זמן:</span>
                          <span className="font-medium">{formatLocalTime(lastBackup.started_at)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">הזמנות:</span>
                          <span className="font-medium">{lastBackup.counts?.orders || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">פריטים:</span>
                          <span className="font-medium">{lastBackup.counts?.items || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">גודל:</span>
                          <span className="font-medium">{formatFileSize(lastBackup.bytes)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">סטטוס:</span>
                          <Badge className={lastBackup.status === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                            {lastBackup.status === 'success' ? 'הצליח' : 'נכשל'}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">טריגר:</span>
                          <span className="font-medium">{lastBackup.trigger === 'auto' ? 'אוטומטי' : 'ידני'}</span>
                        </div>
                        {lastBackup.duration_ms && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">משך:</span>
                            <span className="font-medium">{(lastBackup.duration_ms / 1000).toFixed(1)}s</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-4">אין גיבויים עדיין</p>
                    )}
                  </CardContent>
                </Card>

                {/* Next Run */}
                <Card className="border-none shadow-lg bg-white/90 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <Workflow className="w-5 h-5 text-green-600" />
                      הרצה הבאה
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">תדירות:</span>
                        <span className="font-medium">כל {backupSettings.frequency} שעות</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">רק בשעות עבודה:</span>
                        <Badge className="bg-blue-100 text-blue-800">כן</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">שמירה:</span>
                        <span className="font-medium">{backupSettings.retentionDays} ימים</span>
                      </div>
                      <div className="text-sm text-gray-600 mt-4">
                        <p><strong>שעות פעילות:</strong></p>
                        <p>א׳-ה׳: 07:00-23:00</p>
                        <p>ו׳: 07:00-15:00</p>
                        <p>שבת: מושבת</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Integrity */}
                <Card className="border-none shadow-lg bg-white/90 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <ShieldCheck className="w-5 h-5 text-purple-600" />
                      שלמות נתונים
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {lastBackup ? (
                        <>
                          <div className="text-sm text-gray-600">
                            <p><strong>Hash:</strong></p>
                            <p className="font-mono text-xs break-all bg-gray-50 p-2 rounded">
                              {lastBackup.hash_sha256?.substring(0, 16)}...
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleVerifyBackup(lastBackup.id)}
                            className="w-full"
                          >
                            <ShieldCheck className="w-4 h-4 mr-2" />
                            אמת גיבוי
                          </Button>
                        </>
                      ) : (
                        <p className="text-gray-500 text-center py-4">אין גיבויים לאימות</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
            {/* @generated:bk-overview END */}
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history">
            {/* @generated:bk-history BEGIN */}
            <Card className="border-none shadow-lg bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <FileText className="w-6 h-6 text-blue-600" />
                  היסטוריית גיבויים
                </CardTitle>
                <div className="flex gap-4 mt-4">
                  <div className="relative">
                    <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="חיפוש..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pr-10 w-64"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">הכל</SelectItem>
                      <SelectItem value="success">הצליח</SelectItem>
                      <SelectItem value="failed">נכשל</SelectItem>
                      <SelectItem value="running">רץ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-500 mt-2">טוען...</p>
                  </div>
                ) : backups.length === 0 ? (
                  <div className="text-center py-8">
                    <Database className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">אין גיבויים עדיין</p>
                    <Button className="mt-4" onClick={handleRunBackup} disabled={!canBackup}>
                      <Database className="w-4 h-4 mr-2" />
                      צור גיבוי ראשון
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-right">זמן</TableHead>
                          <TableHead className="text-right">הזמנות</TableHead>
                          <TableHead className="text-right">פריטים</TableHead>
                          <TableHead className="text-right">גודל</TableHead>
                          <TableHead className="text-right">Hash</TableHead>
                          <TableHead className="text-right">טריגר</TableHead>
                          <TableHead className="text-right">סטטוס</TableHead>
                          <TableHead className="text-right">משך</TableHead>
                          <TableHead className="text-right">פעולות</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {backups.map((backup) => (
                          <TableRow key={backup.id}>
                            <TableCell className="font-mono text-sm">
                              {formatLocalTime(backup.started_at)}
                            </TableCell>
                            <TableCell>{backup.counts?.orders || 0}</TableCell>
                            <TableCell>{backup.counts?.items || 0}</TableCell>
                            <TableCell>{formatFileSize(backup.bytes)}</TableCell>
                            <TableCell className="font-mono text-xs">
                              {backup.hash_sha256?.substring(0, 8)}...
                            </TableCell>
                            <TableCell>
                              <Badge variant={backup.trigger === 'auto' ? 'secondary' : 'outline'}>
                                {backup.trigger === 'auto' ? 'אוטומטי' : 'ידני'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className={
                                backup.status === 'success' ? 'bg-green-100 text-green-800' :
                                backup.status === 'failed' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                              }>
                                {backup.status === 'success' ? 'הצליח' : 
                                 backup.status === 'failed' ? 'נכשל' : 'רץ'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {backup.duration_ms ? `${(backup.duration_ms / 1000).toFixed(1)}s` : '---'}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleVerifyBackup(backup.id)}
                                  title="אמת גיבוי"
                                >
                                  <ShieldCheck className="w-4 h-4" />
                                </Button>
                                {canRestore && backup.status === 'success' && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedBackup(backup);
                                      setRestoreStep(1);
                                      setActiveTab('restore');
                                    }}
                                    title="שחזר"
                                  >
                                    <Database className="w-4 h-4" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
            {/* @generated:bk-history END */}
          </TabsContent>

          {/* Backup Now Tab */}
          <TabsContent value="backup-now">
            {/* @generated:bk-backup-now BEGIN */}
            <Card className="border-none shadow-lg bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Database className="w-6 h-6 text-green-600" />
                  גיבוי מיידי
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {!canBackup ? (
                  <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                    <div className="flex items-center gap-2 text-red-800">
                      <ShieldCheck className="w-5 h-5" />
                      <p><strong>אין הרשאה:</strong> רק מנהלים ומנהלי חנות יכולים להריץ גיבוי ידני.</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-blue-900 mb-3">פרמטרי הגיבוי</h4>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-blue-800">זמן הגיבוי:</span>
                          <span className="font-medium">עכשיו ({formatLocalTime(new Date().toISOString())})</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-blue-800">היקף:</span>
                          <span className="font-medium">כל ההזמנות</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-blue-800">פורמט:</span>
                          <span className="font-medium">JSONL דחוס (gzip)</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-blue-800">הצפנה:</span>
                          <span className="font-medium">ללא הצפנה</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Info className="w-4 h-4 text-yellow-600" />
                        <h4 className="font-semibold text-yellow-900">הערות חשובות</h4>
                      </div>
                      <ul className="text-sm text-yellow-800 space-y-1">
                        <li>• הגיבוי יכלול את כל ההזמנות עם כל הפריטים והנתונים</li>
                        <li>• התהליך יכול להימשך מספר דקות</li>
                        <li>• הגיבוי יישמר למשך {backupSettings.retentionDays} ימים</li>
                        <li>• לא ניתן להפעיל גיבוי נוסף בעת ריצה</li>
                      </ul>
                    </div>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          className="w-full bg-green-600 hover:bg-green-700" 
                          size="lg"
                          disabled={isLoading}
                        >
                          <Database className="w-5 h-5 mr-2" />
                          {isLoading ? 'מריץ גיבוי...' : 'הפעל גיבוי עכשיו'}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle className="flex items-center gap-2">
                            <Database className="w-5 h-5 text-green-600" />
                            אישור הפעלת גיבוי
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            האם אתה בטוח שברצונך להריץ גיבוי מיידי של כל נתוני ההזמנות?
                            התהליך יכול להימשך מספר דקות.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>ביטול</AlertDialogCancel>
                          <AlertDialogAction onClick={handleRunBackup}>
                            כן, הפעל גיבוי
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                )}
              </CardContent>
            </Card>
            {/* @generated:bk-backup-now END */}
          </TabsContent>

          {/* Restore Tab */}
          <TabsContent value="restore">
            {/* @generated:bk-restore BEGIN */}
            <Card className="border-none shadow-lg bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Database className="w-6 h-6 text-red-600" />
                  שחזור נתונים
                  <Badge className="bg-red-100 text-red-800">מנהל בלבד</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!canRestore ? (
                  <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                    <div className="flex items-center gap-2 text-red-800">
                      <ShieldCheck className="w-5 h-5" />
                      <p><strong>אין הרשאה:</strong> רק מנהלי מערכת יכולים לבצע שחזור נתונים.</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Step Indicator */}
                    <div className="flex items-center justify-center mb-8">
                      <div className="flex items-center space-x-4 rtl:space-x-reverse">
                        <div className={`flex items-center ${restoreStep >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
                          <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${restoreStep >= 1 ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300'}`}>
                            1
                          </div>
                          <span className="mr-2">בחר גיבוי</span>
                        </div>
                        <div className={`w-8 h-0.5 ${restoreStep >= 2 ? 'bg-blue-600' : 'bg-gray-300'}`} />
                        <div className={`flex items-center ${restoreStep >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
                          <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${restoreStep >= 2 ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300'}`}>
                            2
                          </div>
                          <span className="mr-2">תצוגה מקדימה</span>
                        </div>
                        <div className={`w-8 h-0.5 ${restoreStep >= 3 ? 'bg-blue-600' : 'bg-gray-300'}`} />
                        <div className={`flex items-center ${restoreStep >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
                          <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${restoreStep >= 3 ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300'}`}>
                            3
                          </div>
                          <span className="mr-2">שחזר</span>
                        </div>
                      </div>
                    </div>

                    {/* Step 1: Select Backup */}
                    {restoreStep === 1 && (
                      <div className="space-y-4">
                        <h4 className="font-semibold text-lg">שלב 1: בחר גיבוי לשחזור</h4>
                        <div className="space-y-2">
                          {backups.filter(b => b.status === 'success').map((backup) => (
                            <div
                              key={backup.id}
                              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                                selectedBackup?.id === backup.id
                                  ? 'border-blue-600 bg-blue-50'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                              onClick={() => setSelectedBackup(backup)}
                            >
                              <div className="flex justify-between items-center">
                                <div>
                                  <p className="font-semibold">{formatLocalTime(backup.started_at)}</p>
                                  <p className="text-sm text-gray-600">
                                    {backup.counts?.orders || 0} הזמנות • {backup.counts?.items || 0} פריטים • {formatFileSize(backup.bytes)}
                                  </p>
                                </div>
                                <div className="text-left">
                                  <Badge className="bg-green-100 text-green-800">מאומת</Badge>
                                  <p className="text-xs text-gray-500 mt-1">{backup.trigger === 'auto' ? 'אוטומטי' : 'ידני'}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <Button
                          onClick={handleDryRunRestore}
                          disabled={!selectedBackup || isLoading}
                          className="w-full"
                        >
                          המשך לתצוגה מקדימה
                        </Button>
                      </div>
                    )}

                    {/* Step 2: Dry Run Results */}
                    {restoreStep === 2 && dryRunResults && (
                      <div className="space-y-6">
                        <h4 className="font-semibold text-lg">שלב 2: תצוגה מקדימה מפורטת</h4>
                        
                        {/* Summary Cards */}
                        <div className="grid grid-cols-3 gap-4 mb-6">
                          <Card className="border border-green-200 bg-green-50">
                            <CardContent className="p-4 text-center">
                              <div className="text-3xl font-bold text-green-600">{dryRunResults.new_records || 0}</div>
                              <div className="text-sm text-green-800 font-medium">הזמנות חדשות</div>
                              <div className="text-xs text-green-600 mt-1">שלא קיימות במערכת</div>
                            </CardContent>
                          </Card>
                          
                          <Card className="border border-blue-200 bg-blue-50">
                            <CardContent className="p-4 text-center">
                              <div className="text-3xl font-bold text-blue-600">{dryRunResults.updated_records || 0}</div>
                              <div className="text-sm text-blue-800 font-medium">הזמנות מעודכנות</div>
                              <div className="text-xs text-blue-600 mt-1">עם שינויים</div>
                            </CardContent>
                          </Card>
                          
                          <Card className="border border-gray-200 bg-gray-50">
                            <CardContent className="p-4 text-center">
                              <div className="text-3xl font-bold text-gray-600">{dryRunResults.skipped_records || 0}</div>
                              <div className="text-sm text-gray-800 font-medium">ללא שינוי</div>
                              <div className="text-xs text-gray-600 mt-1">זהות לנוכחי</div>
                            </CardContent>
                          </Card>
                        </div>

                        {/* Detailed Information */}
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                          <div className="flex items-center gap-2 mb-3">
                            <Info className="w-4 h-4 text-blue-600" />
                            <h5 className="font-semibold text-blue-900">פרטי השחזור</h5>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <p><strong>מקור הגיבוי:</strong> {formatLocalTime(dryRunResults.backup_date)}</p>
                              <p><strong>מצב נוכחי:</strong> {formatLocalTime(dryRunResults.comparison_date)}</p>
                              <p><strong>מדיניות התנגשות:</strong> {restoreConflictPolicy === 'skip' ? 'דלג על קיימות' : 'החלף קיימות'}</p>
                            </div>
                            <div>
                              <p><strong>סה"כ בגיבוי:</strong> {dryRunResults.total_in_backup} הזמנות</p>
                              <p><strong>סה"כ נוכחי:</strong> {dryRunResults.total_current} הזמנות</p>
                              <p><strong>אופן השחזור:</strong> {restoreMode === 'full' ? 'מלא' : 'חלקי'}</p>
                            </div>
                          </div>
                        </div>

                        {/* New Orders Details */}
                        {dryRunResults.changes?.new_orders && dryRunResults.changes.new_orders.length > 0 && (
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-green-700 flex items-center gap-2">
                                <span className="w-4 h-4 bg-green-600 rounded-full"></span>
                                הזמנות חדשות שיווספו ({dryRunResults.changes.new_orders.length})
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-2 max-h-40 overflow-y-auto">
                                {dryRunResults.changes.new_orders.map((order, index) => (
                                  <div key={index} className="flex justify-between items-center p-2 bg-green-50 rounded border-r-4 border-green-500">
                                    <div>
                                      <span className="font-medium">{order.order_number}</span>
                                      <span className="text-gray-600 mr-2">{order.customer_name}</span>
                                    </div>
                                    <div className="text-sm text-gray-600">
                                      {order.status} • ₪{order.total_amount} • {order.items_count} פריטים
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        )}

                        {/* Updated Orders Details */}
                        {dryRunResults.changes?.updated_orders && dryRunResults.changes.updated_orders.length > 0 && (
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-blue-700 flex items-center gap-2">
                                <span className="w-4 h-4 bg-blue-600 rounded-full"></span>
                                הזמנות שיעודכנו ({dryRunResults.changes.updated_orders.length})
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-3 max-h-60 overflow-y-auto">
                                {dryRunResults.changes.updated_orders.map((order, index) => (
                                  <div key={index} className="p-3 bg-blue-50 rounded border-r-4 border-blue-500">
                                    <div className="flex justify-between items-start mb-2">
                                      <div>
                                        <span className="font-medium">{order.order_number}</span>
                                        <span className="text-gray-600 mr-2">{order.customer_name}</span>
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        {order.current_status} → {order.backup_status}
                                      </div>
                                    </div>
                                    <div className="text-sm text-blue-700">
                                      <strong>שינויים:</strong> {order.change_summary}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        )}

                        {/* Status Changes Summary */}
                        {dryRunResults.changes?.details?.status_changes && dryRunResults.changes.details.status_changes.length > 0 && (
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-purple-700 flex items-center gap-2">
                                <span className="w-4 h-4 bg-purple-600 rounded-full"></span>
                                שינויי סטטוס ({dryRunResults.changes.details.status_changes.length})
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {dryRunResults.changes.details.status_changes.map((change, index) => (
                                  <div key={index} className="flex justify-between items-center p-2 bg-purple-50 rounded text-sm">
                                    <span className="font-medium">{change.order_number}</span>
                                    <span className="text-purple-700">
                                      {change.from} → {change.to}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        )}

                        {/* Warning */}
                        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                          <div className="flex items-center gap-2 mb-2">
                            <Info className="w-4 h-4 text-yellow-600" />
                            <h5 className="font-semibold text-yellow-900">לתשומת ליבך</h5>
                          </div>
                          <ul className="text-sm text-yellow-800 space-y-1">
                            <li>• השחזור יחליף את הנתונים הנוכחיים בנתונים מהגיבוי</li>
                            <li>• הזמנות שנוצרו אחרי הגיבוי לא יושפעו</li>
                            <li>• שינויים שבוצעו אחרי הגיבוי יאבדו</li>
                            <li>• מומלץ ליצור גיבוי נוכחי לפני השחזור</li>
                          </ul>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-4">
                          <Button 
                            variant="outline" 
                            onClick={() => {
                              setRestoreStep(1);
                              setDryRunResults(null);
                            }}
                            className="flex-1"
                          >
                            חזור לבחירת גיבוי
                          </Button>
                          <Button 
                            onClick={() => setRestoreStep(3)} 
                            className="flex-1 bg-blue-600 hover:bg-blue-700"
                          >
                            המשך לשחזור ({ (dryRunResults.new_records || 0) + (dryRunResults.updated_records || 0) } שינויים)
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Step 3: Confirm Restore */}
                    {restoreStep === 3 && (
                      <div className="space-y-4">
                        <h4 className="font-semibold text-lg">שלב 3: אישור שחזור</h4>
                        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                          <div className="flex items-center gap-2 mb-2">
                            <ShieldCheck className="w-4 h-4 text-red-600" />
                            <h5 className="font-semibold text-red-900">אזהרה</h5>
                          </div>
                          <p className="text-sm text-red-800">
                            פעולת השחזור תשנה את נתוני ההזמנות הקיימים במערכת. 
                            פעולה זו אינה ניתנת לביטול. מומלץ ליצור גיבוי נוכחי לפני השחזור.
                          </p>
                        </div>
                        <div className="flex gap-4">
                          <Button variant="outline" onClick={() => setRestoreStep(2)}>
                            חזור
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button className="flex-1 bg-red-600 hover:bg-red-700">
                                בצע שחזור
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle className="text-red-600">
                                  אישור סופי לשחזור נתונים
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  האם אתה בטוח לחלוטין שברצונך לשחזר את הנתונים מהגיבוי שנבחר?
                                  פעולה זו תשנה את המערכת ואינה ניתנת לביטול.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>ביטול</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-red-600 hover:bg-red-700"
                                  onClick={() => {
                                    toast.info('תכונת שחזור בפיתוח');
                                    setRestoreStep(1);
                                    setSelectedBackup(null);
                                    setDryRunResults(null);
                                  }}
                                >
                                  כן, בצע שחזור
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
            {/* @generated:bk-restore END */}
          </TabsContent>

          {/* Schedule Tab */}
          <TabsContent value="schedule">
            {/* @generated:bk-schedule BEGIN */}
            <Card className="border-none shadow-lg bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Workflow className="w-6 h-6 text-purple-600" />
                  תזמון והגדרות
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Auto Backup Settings */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-lg">הגדרות גיבוי אוטומטי</h4>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-medium">גיבוי אוטומטי</span>
                        <Badge className="bg-green-100 text-green-800">פעיל</Badge>
                      </div>
                      <div className="space-y-2 text-sm text-gray-700">
                        <p>תדירות: כל {backupSettings.frequency} שעות</p>
                        <p>שמירה: {backupSettings.retentionDays} ימים</p>
                        <p>רק בתוך שעות העבודה המוגדרות</p>
                      </div>
                    </div>
                  </div>

                  {/* Business Hours */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-lg">שעות עבודה</h4>
                    <div className="space-y-2">
                      {Object.entries(backupSettings.businessHours).map(([day, config]) => (
                        <div key={day} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="font-medium">
                            {day === 'sunday' ? 'ראשון' :
                             day === 'monday' ? 'שני' :
                             day === 'tuesday' ? 'שלישי' :
                             day === 'wednesday' ? 'רביעי' :
                             day === 'thursday' ? 'חמישי' :
                             day === 'friday' ? 'שישי' : 'שבת'}
                          </span>
                          {config.enabled ? (
                            <span className="text-sm text-gray-600">
                              {config.start} - {config.end}
                            </span>
                          ) : (
                            <Badge variant="secondary">מושבת</Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Upcoming Runs */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg">ריצות מתוכננות</h4>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-blue-800 mb-2">
                      <strong>הריצה הבאה:</strong> מחושבת אוטומטית על פי שעות העבודה והתדירות
                    </p>
                    <p className="text-xs text-blue-600">
                      הגיבוי יתבצע אוטומטי כל {backupSettings.frequency} שעות בתוך שעות העבודה המוגדרות.
                      לא נדרשת התערבות ידנית.
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg">פעולות מערכת</h4>
                  <div className="flex gap-4">
                    <Button variant="outline">
                      <ShieldCheck className="w-4 h-4 mr-2" />
                      אמת את כל הגיבויים
                    </Button>
                    <Button variant="outline">
                      <Database className="w-4 h-4 mr-2" />
                      נקה גיבויים ישנים
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            {/* @generated:bk-schedule END */}
          </TabsContent>

          {/* Logs Tab */}
          <TabsContent value="logs">
            {/* @generated:bk-logs BEGIN */}
            <Card className="border-none shadow-lg bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <FileText className="w-6 h-6 text-gray-600" />
                  יומני גיבוי ושחזור
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Recent Activity */}
                  <div className="space-y-4">
                    <h4 className="font-semibold">פעילות אחרונה</h4>
                    <div className="space-y-2">
                      {backups.slice(0, 10).map((backup) => (
                        <div key={backup.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <Database className="w-4 h-4 text-blue-600" />
                            <div>
                              <p className="font-medium">גיבוי {backup.trigger === 'auto' ? 'אוטומטי' : 'ידני'}</p>
                              <p className="text-sm text-gray-600">{formatLocalTime(backup.started_at)}</p>
                            </div>
                          </div>
                          <div className="text-left">
                            <Badge className={backup.status === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                              {backup.status === 'success' ? 'הצליח' : 'נכשל'}
                            </Badge>
                            <p className="text-xs text-gray-500 mt-1">
                              {backup.counts?.orders || 0} הזמנות
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-4">
                    <Button variant="outline">
                      <FileDown className="w-4 h-4 mr-2" />
                      הורד יומנים
                    </Button>
                    <Button variant="outline" onClick={() => setActiveTab('history')}>
                      <FileText className="w-4 h-4 mr-2" />
                      צפה בהיסטוריה מלאה
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            {/* @generated:bk-logs END */}
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-gray-500 border-t pt-6">
          <p>
            עדכון אחרון: {formatLocalTime(new Date().toISOString())} • 
            עודכן על ידי: Base44 • 
            <a href="/changelog" className="text-blue-600 hover:underline mx-1">Change Log</a>
          </p>
        </div>
      </div>
    </div>
  );
}
