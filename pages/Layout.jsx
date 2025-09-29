
import React, { useState, useEffect, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { FileText, Home, Upload, BarChart3, PackageSearch, Truck, AlertTriangle, Store, Archive, ChefHat, Package2, Users, MailSearch, ChevronDown, ChevronUp, Bell } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { User } from '@/api/entities';
import { hasPageAccess, getDefaultPageForRole, getNavigationItemsForRole, getUserRole } from '@/components/utils/rolePermissions';
import UserMenu from '@/components/UserMenu';
import NotificationBell from '@/components/notifications/NotificationBell';
import { toast } from 'sonner';
import { triggerDailyEmailCheckIfMissed } from '@/api/functions';
import { OrderProvider } from '@/components/contexts/OrderContext';

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState(null);
  const [userNavigationItems, setUserNavigationItems] = useState([]);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [expandedSubmenu, setExpandedSubmenu] = useState(null);

  const checkUserAndSetNavigation = useCallback(async () => {
    try {
      let user = await User.me();
      
      if (user && !user.custom_role) {
        try {
          await User.updateMyUserData({ custom_role: 'pending' });
          user = await User.me();
        } catch (updateError) {
          console.error("Error updating user custom_role to pending:", updateError);
        }
      }
      
      setCurrentUser(user);
      
      const userRole = getUserRole(user);
      let allowedNavItems = getNavigationItemsForRole(userRole);
      
      if (userRole !== 'admin') {
        allowedNavItems = allowedNavItems.filter(item => item.url !== 'Invoices');
      }
      
      const navItemsWithIcons = allowedNavItems.map(item => ({
        ...item,
        url: item.url ? createPageUrl(item.url) : null,
        icon: item.url ? getIconForPage(item.url) : getIconForPage(item.title),
        items: item.items ? item.items.map(subItem => ({
          ...subItem,
          url: createPageUrl(subItem.url),
          icon: getIconForPage(subItem.url)
        })) : undefined
      }));
      
      setUserNavigationItems(navItemsWithIcons);
    } catch (error) {
      console.error("Error checking user authentication:", error);
      try {
        await User.updateMyUserData({ custom_role: 'pending' });
        const newUser = await User.me();
        setCurrentUser(newUser);
        setUserNavigationItems([]); 
      } catch (createError) {
        console.error("Error creating/updating user with pending custom_role:", createError);
        setCurrentUser(null);
        setUserNavigationItems([]);
      }
    } finally {
      setIsCheckingAuth(false);
    }
  }, []);

  const runDailyEmailCheckIfNeeded = useCallback(async () => {
    try {
      console.log('🔍 Checking if daily email check is needed...');
      
      const response = await triggerDailyEmailCheckIfMissed({});
      
      if (response?.data) {
        const result = response.data;
        
        if (result.success && result.triggered) {
          if (result.message.includes('נוצרו')) {
            toast.success(result.message, {
              duration: 8000,
              description: `טווח תאריכים: ${result.details?.dateRange || 'לא זמין'}`
            });
          } else {
            toast.info(result.message, {
              duration: 5000,
              description: `טווח תאריכים: ${result.details?.dateRange || 'לא זמין'}`
            });
          }
          console.log('✅ Daily email check completed:', result.details);
        } else if (result.success && !result.triggered) {
          console.log(`ℹ️ Daily email check not needed: ${result.message}`);
        } else if (!result.success && result.triggered) {
          toast.error('שגיאה בבדיקת מיילים אוטומטית', {
            duration: 6000,
            description: result.message
          });
          console.error('❌ Daily email check failed:', result.error);
        }
      }
    } catch (error) {
      console.error('❌ Error calling daily email check:', error);
      toast.error('שגיאה בתהליך בדיקת המיילים האוטומטית', {
        duration: 4000,
        description: 'נסה לרענן את הדף או פנה למנהל המערכת'
      });
    }
  }, []);

  const processOverduePickupsAutomatically = useCallback(async () => {
    try {
      const now = new Date();
      const currentHour = now.getHours();
      const today = now.toDateString();
      
      const lastRunKey = 'processOverduePickups_lastRun';
      const lastRunData = localStorage.getItem(lastRunKey);
      
      let shouldRun = false;
      
      if (!lastRunData) {
        shouldRun = currentHour >= 22;
        console.log('No previous run recorded, running if after 22:00:', shouldRun);
      } else {
        const lastRunInfo = JSON.parse(lastRunData);
        const lastRunDate = new Date(lastRunInfo.timestamp).toDateString();
        
        if (lastRunDate !== today && currentHour >= 22) {
          shouldRun = true;
          console.log(`Last run was on ${lastRunDate}, today is ${today}, current hour: ${currentHour} - should run`);
        } else {
          console.log(`Last run was on ${lastRunDate}, today is ${today}, current hour: ${currentHour} - skip`);
        }
      }
      
      if (shouldRun) {
        console.log('Processing overdue pickups automatically...');
        
        const { processOverduePickups } = await import("@/api/functions");
        const result = await processOverduePickups({});
        
        const runInfo = {
          timestamp: now.toISOString(),
          date: today,
          hour: currentHour,
          updatedCount: result?.data?.updatedCount || 0
        };
        localStorage.setItem(lastRunKey, JSON.stringify(runInfo));
        
        if (result?.data?.updatedCount > 0) {
          console.log(`Successfully processed ${result.data.updatedCount} overdue pickups automatically`);
        } else {
          console.log('Automatic overdue pickups check completed - no pickups needed processing');
        }
        
        console.log('Next automatic check will be after 22:00 tomorrow when an admin/store manager logs in');
        
      } else {
        console.log('Skipping overdue pickups processing - conditions not met');
      }
      
    } catch (error) {
      console.error('Error in automatic overdue pickups processing:', error);
      localStorage.removeItem('processOverduePickups_lastRun');
    }
  }, []);

  const processOverdueDeliveriesAutomatically = useCallback(async () => {
    try {
      const now = new Date();
      const currentHour = now.getHours();
      const today = now.toDateString();
      
      const lastRunKey = 'processOverdueDeliveries_lastRun';
      const lastRunData = localStorage.getItem(lastRunKey);
      
      let shouldRun = false;
      
      if (!lastRunData) {
        shouldRun = currentHour >= 20;
        console.log('No previous delivery processing run recorded, running if after 20:00:', shouldRun);
      } else {
        const lastRunInfo = JSON.parse(lastRunData);
        const lastRunDate = new Date(lastRunInfo.timestamp).toDateString();
        
        if (lastRunDate !== today && currentHour >= 20) {
          shouldRun = true;
          console.log(`Last delivery processing run was on ${lastRunDate}, today is ${today}, current hour: ${currentHour} - should run`);
        } else {
          console.log(`Last delivery processing run was on ${lastRunDate}, today is ${today}, current hour: ${currentHour} - skip`);
        }
      }
      
      if (shouldRun) {
        console.log('Processing overdue deliveries automatically...');
        
        const { processOverdueDelivery } = await import("@/api/functions");
        const result = await processOverdueDelivery({});
        
        const runInfo = {
          timestamp: now.toISOString(),
          date: today,
          hour: currentHour,
          updatedCount: result?.data?.updatedCount || 0
        };
        localStorage.setItem(lastRunKey, JSON.stringify(runInfo));
        
        if (result?.data?.updatedCount > 0) {
          console.log(`Successfully processed ${result.data.updatedCount} overdue deliveries automatically`);
        } else {
          console.log('Automatic overdue deliveries check completed - no deliveries needed processing');
        }
        
        console.log('Next automatic delivery check will be after 20:00 tomorrow when an admin/store manager logs in');
        
      } else {
        console.log('Skipping overdue deliveries processing - conditions not met');
      }
      
    } catch (error) {
      console.error('Error in automatic overdue deliveries processing:', error);
      localStorage.removeItem('processOverdueDeliveries_lastRun');
    }
  }, []);

  useEffect(() => {
    if (currentUser && (currentUser.custom_role === 'admin' || currentUser.custom_role === 'store_manager')) {
      const timer = setTimeout(() => {
        processOverduePickupsAutomatically();
        processOverdueDeliveriesAutomatically();
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [currentUser, processOverduePickupsAutomatically, processOverdueDeliveriesAutomatically]);

  useEffect(() => {
    checkUserAndSetNavigation();
  }, [checkUserAndSetNavigation]);

  useEffect(() => {
    if (currentUser && ['admin', 'store_manager', 'picker', 'picker_baker', 'baker'].includes(currentUser.custom_role)) {
      const timer = setTimeout(() => {
        runDailyEmailCheckIfNeeded();
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [currentUser, runDailyEmailCheckIfNeeded]);

  useEffect(() => {
    if (currentUser && currentPageName) {
      const currentPagePath = currentPageName;
      const userRole = getUserRole(currentUser);
      
      if (userRole === 'pending' && currentPagePath !== 'PendingApproval') {
        window.location.href = createPageUrl('PendingApproval');
        return;
      }
      
      if (userRole !== 'pending' && !hasPageAccess(userRole, currentPagePath)) {
        const defaultPage = getDefaultPageForRole(userRole);
        window.location.href = createPageUrl(defaultPage);
        return;
      }
    }
  }, [currentUser, currentPageName]);

  useEffect(() => {
    if (currentPageName && userNavigationItems.length > 0) {
      const currentFullPath = createPageUrl(currentPageName);
      let foundSubmenuTitle = null;

      for (const item of userNavigationItems) {
        if (item.type === 'submenu' && item.items) {
          if (item.items.some(subItem => subItem.url === currentFullPath)) {
            foundSubmenuTitle = item.title;
            break; 
          }
        }
      }
      
      setExpandedSubmenu(foundSubmenuTitle);
    } else if (userNavigationItems.length > 0) {
      setExpandedSubmenu(null);
    }
  }, [currentPageName, userNavigationItems]);

  const getIconForPage = (pageName) => {
    const iconMap = {
      'Home': Home,
      'ScanOrder': Upload,
      'Picking': PackageSearch,
      'Shipments': Truck,
      'Pickups': Store,
      'Bakers': ChefHat,
      'BakersManualOrder': Upload,
      'BakersArchive': Archive,
      'CourierDashboard': Truck,
      'CourierControl': Users,
      'Invoices': MailSearch,
      'Inventory': Package2,
      'MissingItems': AlertTriangle,
      'Analytics': BarChart3,
      'ArchivedOrders': Archive,
      'UserManagement': Users,
      'AdminNotifications': Bell,
      'אופות': ChefHat,
    };
    return iconMap[pageName] || FileText;
  };

  const toggleSubmenu = (title) => {
    setExpandedSubmenu(prev => prev === title ? null : title);
  };

  const isCurrentPageInSubmenu = (items) => {
    return items?.some(item => location.pathname === item.url);
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">טוען המערכת...</p>
        </div>
      </div>
    );
  }

  const childrenWithProps = React.Children.map(children, child => {
      if (React.isValidElement(child)) {
          return React.cloneElement(child, { currentUser });
      }
      return child;
  });

  if (!currentUser || getUserRole(currentUser) === 'pending') {
    return (
      <OrderProvider>
        <div id="modal-root" />
        <div dir="rtl" className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
          {childrenWithProps}
        </div>
      </OrderProvider>
    );
  }

  return (
    <OrderProvider>
      <div id="modal-root" />
      <SidebarProvider dir="rtl">
        <div className="min-h-screen flex w-full rtl-layout">
          <style>{`
            :root {
              --primary-blue: #1e40af;
              --primary-blue-light: #3b82f6;
              --primary-blue-lighter: #dbeafe;
              --text-primary: #0f172a;
              --text-secondary: #64748b;
              --background-primary: #ffffff;
              --background-secondary: #f8fafc;
            }
            
            .rtl-layout {
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
              -webkit-font-smoothing: antialiased;
              -moz-osx-font-smoothing: grayscale;
            }
            
            .elegant-shadow {
              box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
            }
            
            .elegant-shadow-lg {
              box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
            }

            @media (max-width: 768px) {
              .rtl-layout {
                font-size: 14px;
              }
              
              .sidebar-mobile {
                position: fixed;
                top: 0;
                right: 0;
                height: 100vh;
                z-index: 50;
                transform: translateX(100%);
                transition: transform 0.3s ease;
              }
              
              .sidebar-mobile.open {
                transform: translateX(0);
              }
            }
            
            body {
              overflow-x: hidden;
            }
            
            * {
              box-sizing: border-box;
            }

            .submenu-item {
              padding-right: 2rem;
            }
          `}</style>
          
          <Sidebar className="border-l border-gray-200 elegant-shadow-lg" side="right">
            <SidebarHeader className="border-b border-gray-100 p-4 md:p-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center elegant-shadow">
                  <FileText className="w-4 h-4 md:w-6 md:h-6 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-gray-900 text-base md:text-lg">סורק הזמנות</h2>
                  <p className="text-xs md:text-sm text-gray-500">ניהול הזמנות חכם</p>
                </div>
              </div>
            </SidebarHeader>
            
            <SidebarContent className="p-2 md:p-3">
              <SidebarGroup>
                <SidebarGroupLabel className="text-xs md:text-sm font-semibold text-gray-600 px-2 md:px-3 py-2 md:py-3 tracking-wide">
                  תפריט ראשי
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {userNavigationItems.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        {item.type === 'submenu' ? (
                          <div>
                            <SidebarMenuButton
                              onClick={() => toggleSubmenu(item.title)}
                              className={`hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 rounded-xl mb-1 ${
                                isCurrentPageInSubmenu(item.items) || expandedSubmenu === item.title
                                  ? 'bg-blue-50 text-blue-700 border-r-4 border-blue-700' 
                                  : 'text-gray-600'
                              }`}
                            >
                              <div className="flex items-center justify-between w-full px-2 md:px-4 py-2 md:py-3">
                                <div className="flex items-center gap-2 md:gap-3">
                                  <item.icon className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
                                  <span className="font-medium text-sm md:text-base">{item.title}</span>
                                </div>
                                {expandedSubmenu === item.title ? 
                                  <ChevronUp className="w-4 h-4" /> : 
                                  <ChevronDown className="w-4 h-4" />
                                }
                              </div>
                            </SidebarMenuButton>
                            
                            {expandedSubmenu === item.title && (
                              <div className="mt-1 space-y-1">
                                {item.items?.map((subItem) => (
                                  <SidebarMenuButton 
                                    key={subItem.title}
                                    asChild 
                                    className={`submenu-item hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 rounded-xl ${
                                      location.pathname === subItem.url 
                                        ? 'bg-blue-50 text-blue-700 border-r-4 border-blue-700' 
                                        : 'text-gray-600'
                                    }`}
                                  >
                                    <Link to={subItem.url} className="flex items-center gap-2 md:gap-3 px-2 md:px-4 py-2 md:py-3">
                                      <subItem.icon className="w-4 h-4 flex-shrink-0" />
                                      <span className="font-medium text-sm">{subItem.title}</span>
                                    </Link>
                                  </SidebarMenuButton>
                                ))}
                              </div>
                            )}
                          </div>
                        ) : (
                          <SidebarMenuButton 
                            asChild 
                            className={`hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 rounded-xl mb-1 ${
                              location.pathname === item.url 
                                ? 'bg-blue-50 text-blue-700 border-r-4 border-blue-700' 
                                : 'text-gray-600'
                            }`}
                          >
                            <Link to={item.url} className="flex items-center gap-2 md:gap-3 px-2 md:px-4 py-2 md:py-3">
                              <item.icon className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
                              <span className="font-medium text-sm md:text-base">{item.title}</span>
                            </Link>
                          </SidebarMenuButton>
                        )}
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="border-t border-gray-100 p-4 md:p-6">
              <div id="user-identity-anchor" className="mb-4">
                <UserMenu className="w-full" />
              </div>

              <div className="border-t border-gray-100 pt-3 mt-3">
                <div className="flex justify-center gap-3 text-xs text-gray-500">
                  <Link 
                    to={createPageUrl("Privacy")} 
                    className="hover:text-gray-700 transition-colors underline"
                  >
                    מדיניות פרטיות
                  </Link>
                  <span>|</span>
                  <Link 
                    to={createPageUrl("Terms")} 
                    className="hover:text-gray-700 transition-colors underline"
                  >
                    תנאי שימוש
                  </Link>
                </div>
              </div>
            </SidebarFooter>
          </Sidebar>

          <main className="flex-1 flex flex-col min-w-0">
            <header className="bg-white/90 backdrop-blur-sm border-b border-gray-100 px-4 md:px-6 py-3 md:py-4 md:hidden elegant-shadow">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <SidebarTrigger className="hover:bg-gray-100 p-2 rounded-xl transition-colors duration-200" />
                  <h1 className="text-lg md:text-xl font-bold">סורק הזמנות</h1>
                </div>
                
                <div className="flex items-center gap-2">
                  <NotificationBell />
                </div>
              </div>
            </header>

            <div className="hidden md:block fixed top-4 left-4 z-50">
              <NotificationBell />
            </div>

            <div className="flex-1 overflow-auto">
              <div className="min-h-full">
                {childrenWithProps}
              </div>
            </div>
          </main>
        </div>
      </SidebarProvider>
    </OrderProvider>
  );
}
