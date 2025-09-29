
// הגדרות הרשאות לכל תפקיד
export const ROLE_PERMISSIONS = {
  admin: {
    name: "מנהל מערכת", 
    pages: "*", // גישה לכל הדפים
    canEdit: true,
    canDelete: true,
    canApproveUsers: true
  },
  store_manager: {
    name: "מנהל חנות",
    pages: "*", // גישה לכל הדפים (הגבלת ניהול משתמשים וחשבוניות תתבצע בנפרד ב-hasPageAccess)
    canEdit: true,
    canDelete: true,
    canApproveUsers: false
  },
  baker: {
    name: "אופה",
    pages: ["Bakers", "BakersManualOrder", "BakersArchive"], // הוספת הדפים החדשים
    canEdit: true,
    canDelete: false,
    canApproveUsers: false
  },
  picker: {
    name: "מלקט",
    pages: [
      "ScanOrder", 
      "Picking", 
      "Shipments", 
      "Pickups", 
      "Inventory", 
      "MissingItems", 
      "ArchivedOrders", 
      "OrderDetails",
      "BakersManualOrder", // הוספה חדשה - מלקט יכול לגשת להזמנה ידנית לאופות
      "LogisticsOverview" // הוספת הדף החדש
    ],
    canEdit: true,
    canDelete: false,
    canApproveUsers: false
  },
  picker_baker: {
    name: "מלקט ואופה",
    pages: [
      "Bakers",
      "BakersManualOrder", // הוספת הדף החדש
      "BakersArchive", // הוספת הדף החדש
      "ScanOrder", 
      "Picking", 
      "Shipments", 
      "Pickups", 
      "Inventory", 
      "MissingItems", 
      "ArchivedOrders", 
      "OrderDetails",
      "LogisticsOverview" // הוספת הדף החדש
    ],
    canEdit: true,
    canDelete: false,
    canApproveUsers: false
  },
  courier: {
    name: "שליח",
    pages: ["CourierDashboard"], // רק דף השליחים
    canEdit: true,
    canDelete: false,
    canApproveUsers: false
  },
  pending: {
    name: "ממתין לאישור",
    pages: ["PendingApproval"], // רק דף ההמתנה
    canEdit: false,
    canDelete: false,
    canApproveUsers: false
  }
};

// פונקציה להחזיר את התפקיד המותאם של המשתמש
export const getUserRole = (user) => {
  return user?.custom_role || 'pending';
};

// פונקציה לבדיקה אם למשתמש יש הרשאה לדף מסוים
export const hasPageAccess = (userRole, pageName) => {
  // מנהל מערכת תמיד מורשה לכל דף
  if (userRole === 'admin') return true;

  // מנהל חנות מורשה לכל דף פרט לניהול משתמשים, חשבוניות ומעקב פיתוח
  if (userRole === 'store_manager') {
    if (pageName === 'UserManagement' || pageName === 'Invoices' || pageName === 'DevelopmentConsole' || pageName === 'EmailTester' || pageName === 'OrderDataManagement') {
      return false; 
    }
    return true;
  }
  
  const roleConfig = ROLE_PERMISSIONS[userRole];
  if (!roleConfig) return false;
  
  if (roleConfig.pages === "*") return true;
  return roleConfig.pages.includes(pageName);
};

// פונקציה להחזיר דף ברירת מחדל לפי תפקיד
export const getDefaultPageForRole = (userRole) => {
  switch (userRole) {
    case "admin":
    case "store_manager":
      return "Home";
    case "baker":
    case "picker_baker":
      return "Bakers";
    case "picker":
      return "Picking";
    case "courier":
      return "CourierDashboard";
    case "pending":
      return "PendingApproval";
    default:
      return "PendingApproval";
  }
};

// פונקציה לסינון פריטי הניווט לפי תפקיד - עם מבנה היררכי למנהל מערכת
export const getNavigationItemsForRole = (userRole) => {
  // מבנה מיוחד למנהל מערכת עם תפריטי משנה - כולל כל ההרשאות
  if (userRole === 'admin') {
    return [
      { title: "דף הבית", url: "Home", requiredRoles: ["admin"] },
      { 
        title: "ניהול מלקטים", 
        type: "submenu",
        requiredRoles: ["admin"],
        items: [
          { title: "ליקוטים", url: "Picking", requiredRoles: ["admin"] },
          { title: "הזמנה ידנית", url: "ScanOrder", requiredRoles: ["admin"] }
        ]
      },
      { 
        title: "ניהול אופות", 
        type: "submenu",
        requiredRoles: ["admin"],
        items: [
          { title: "דף אופות", url: "Bakers", requiredRoles: ["admin"] },
          { title: "הזמנה ידנית לאופות", url: "BakersManualOrder", requiredRoles: ["admin"] },
          { title: "ארכיון אופות", url: "BakersArchive", requiredRoles: ["admin"] }
        ]
      },
      { 
        title: "ניהול משלוחים", 
        type: "submenu",
        requiredRoles: ["admin"],
        items: [
          { title: "משלוחים", url: "Shipments", requiredRoles: ["admin"] },
          { title: "איסופים", url: "Pickups", requiredRoles: ["admin"] },
          { title: "משלוחים ואיסופים", url: "LogisticsOverview", requiredRoles: ["admin"] },
          { title: "בקרת שליחים", url: "CourierControl", requiredRoles: ["admin"] },
          { title: "דף שליח", url: "CourierDashboard", requiredRoles: ["admin"] }
        ]
      },
      { 
        title: "ניהול כללי", 
        type: "submenu",
        requiredRoles: ["admin"],
        items: [
          { title: "ארכיון", url: "ArchivedOrders", requiredRoles: ["admin"] },
          { title: "ניהול מלאי", url: "Inventory", requiredRoles: ["admin"] },
          { title: "חוסרים", url: "MissingItems", requiredRoles: ["admin"] },
          { title: "חשבוניות מהמייל", url: "Invoices", requiredRoles: ["admin"] },
          { title: "ניתוח נתונים", url: "Analytics", requiredRoles: ["admin"] }
        ]
      },
      { 
        title: "ניהול מתכנתים", 
        type: "submenu",
        requiredRoles: ["admin"],
        items: [
          { title: "ניהול משתמשים", url: "UserManagement", requiredRoles: ["admin"] },
          { title: "ניהול נתוני הזמנות", url: "OrderDataManagement", requiredRoles: ["admin"] },
          { title: "מעקב פיתוח", url: "DevelopmentConsole", requiredRoles: ["admin"] },
          { title: "מעבדת מיילים", url: "EmailTester", requiredRoles: ["admin"] },
          { title: "גיבוי ושחזור", url: "OrderBackups", requiredRoles: ["admin"] }
        ]
      },
      { title: "מרכז התראות", url: "AdminNotifications", requiredRoles: ["admin"] },
      { title: "הגדרות מערכת", url: "Settings", requiredRoles: ["admin"] },
      { title: "מדריך ותיעוד", url: "Documentation", requiredRoles: ["admin"] },
      { title: "בדיקות איסוף", url: "TestPickupProcessor", requiredRoles: ["admin"] },
      { title: "רשימת משלוחים ציבורית", url: "PublicShipmentList", requiredRoles: ["admin"] }
    ];
  }

  // מבנה קיים עבור כל שאר התפקידים (עם הוספת הדף החדש)
  const allItems = [
    { title: "דף הבית", url: "Home", requiredRoles: ["admin", "store_manager"] },
    { title: "ליקוטים", url: "Picking", requiredRoles: ["admin", "store_manager", "picker", "picker_baker"] },
    { 
      title: "אופות", 
      type: "submenu",
      requiredRoles: ["admin", "store_manager", "baker", "picker_baker", "picker"],
      items: [
        { title: "דף אופות", url: "Bakers", requiredRoles: ["admin", "store_manager", "baker", "picker_baker"] },
        { title: "הזמנה ידנית לאופות", url: "BakersManualOrder", requiredRoles: ["admin", "store_manager", "baker", "picker_baker", "picker"] },
        { title: "ארכיון אופות", url: "BakersArchive", requiredRoles: ["admin", "store_manager", "baker", "picker_baker"] }
      ]
    },
    { title: "משלוחים", url: "Shipments", requiredRoles: ["admin", "store_manager", "picker", "picker_baker"] },
    { title: "איסופים", url: "Pickups", requiredRoles: ["admin", "store_manager", "picker", "picker_baker"] },
    { title: "משלוחים ואיסופים", url: "LogisticsOverview", requiredRoles: ["admin", "store_manager", "picker", "picker_baker"] },
    { title: "הזמנה ידנית", url: "ScanOrder", requiredRoles: ["admin", "store_manager", "picker", "picker_baker"] },
    { title: "ניהול מלאי", url: "Inventory", requiredRoles: ["admin", "store_manager", "picker", "picker_baker"] },
    { title: "בקרת שליחים", url: "CourierControl", requiredRoles: ["admin", "store_manager"] },
    { title: "ארכיון", url: "ArchivedOrders", requiredRoles: ["admin", "store_manager", "picker", "picker_baker"] },
    { title: "ניהול משתמשים", url: "UserManagement", requiredRoles: ["admin"] },
    { title: "חשבוניות מהמייל", url: "Invoices", requiredRoles: ["admin"] },
    { title: "גיבוי ושחזור", url: "OrderBackups", requiredRoles: ["admin", "store_manager"] },
    { title: "מרכז התראות", url: "AdminNotifications", requiredRoles: ["admin"] },
    { title: "מעקב פיתוח", url: "DevelopmentConsole", requiredRoles: ["admin"] },
    { title: "ניתוח נתונים", url: "Analytics", requiredRoles: ["admin", "store_manager"] },
    { title: "חוסרים", url: "MissingItems", requiredRoles: ["admin", "store_manager", "picker", "picker_baker"] },
    { title: "דף שליח", url: "CourierDashboard", requiredRoles: ["courier"] }
  ];

  return allItems.filter(item => 
    item.requiredRoles.includes(userRole) ||
    (item.type === 'submenu' && item.items && item.items.some(subItem => subItem.requiredRoles.includes(userRole)))
  ).map(item => {
    if (item.type === 'submenu' && item.items) {
      return {
        ...item,
        items: item.items.filter(subItem => subItem.requiredRoles.includes(userRole))
      };
    }
    return item;
  });
};
