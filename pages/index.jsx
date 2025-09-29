import Layout from "./Layout.jsx";

import Home from "./Home";

import ScanOrder from "./ScanOrder";

import Analytics from "./Analytics";

import OrderDetails from "./OrderDetails";

import Picking from "./Picking";

import Shipments from "./Shipments";

import MissingItems from "./MissingItems";

import Pickups from "./Pickups";

import HomePage from "./HomePage";

import ArchivedOrders from "./ArchivedOrders";

import Bakers from "./Bakers";

import Inventory from "./Inventory";

import PendingApproval from "./PendingApproval";

import UserManagement from "./UserManagement";

import Invoices from "./Invoices";

import PublicShipmentList from "./PublicShipmentList";

import CourierDashboard from "./CourierDashboard";

import CourierControl from "./CourierControl";

import Privacy from "./Privacy";

import Terms from "./Terms";

import Settings from "./Settings";

import DevelopmentConsole from "./DevelopmentConsole";

import Documentation from "./Documentation";

import TestPickupProcessor from "./TestPickupProcessor";

import BakersManualOrder from "./BakersManualOrder";

import BakersArchive from "./BakersArchive";

import _app from "./_app";

import AdminNotifications from "./AdminNotifications";

import EmailTester from "./EmailTester";

import OrderDataManagement from "./OrderDataManagement";

import LogisticsOverview from "./LogisticsOverview";

import OrderBackups from "./OrderBackups";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Home: Home,
    
    ScanOrder: ScanOrder,
    
    Analytics: Analytics,
    
    OrderDetails: OrderDetails,
    
    Picking: Picking,
    
    Shipments: Shipments,
    
    MissingItems: MissingItems,
    
    Pickups: Pickups,
    
    HomePage: HomePage,
    
    ArchivedOrders: ArchivedOrders,
    
    Bakers: Bakers,
    
    Inventory: Inventory,
    
    PendingApproval: PendingApproval,
    
    UserManagement: UserManagement,
    
    Invoices: Invoices,
    
    PublicShipmentList: PublicShipmentList,
    
    CourierDashboard: CourierDashboard,
    
    CourierControl: CourierControl,
    
    Privacy: Privacy,
    
    Terms: Terms,
    
    Settings: Settings,
    
    DevelopmentConsole: DevelopmentConsole,
    
    Documentation: Documentation,
    
    TestPickupProcessor: TestPickupProcessor,
    
    BakersManualOrder: BakersManualOrder,
    
    BakersArchive: BakersArchive,
    
    _app: _app,
    
    AdminNotifications: AdminNotifications,
    
    EmailTester: EmailTester,
    
    OrderDataManagement: OrderDataManagement,
    
    LogisticsOverview: LogisticsOverview,
    
    OrderBackups: OrderBackups,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Home />} />
                
                
                <Route path="/Home" element={<Home />} />
                
                <Route path="/ScanOrder" element={<ScanOrder />} />
                
                <Route path="/Analytics" element={<Analytics />} />
                
                <Route path="/OrderDetails" element={<OrderDetails />} />
                
                <Route path="/Picking" element={<Picking />} />
                
                <Route path="/Shipments" element={<Shipments />} />
                
                <Route path="/MissingItems" element={<MissingItems />} />
                
                <Route path="/Pickups" element={<Pickups />} />
                
                <Route path="/HomePage" element={<HomePage />} />
                
                <Route path="/ArchivedOrders" element={<ArchivedOrders />} />
                
                <Route path="/Bakers" element={<Bakers />} />
                
                <Route path="/Inventory" element={<Inventory />} />
                
                <Route path="/PendingApproval" element={<PendingApproval />} />
                
                <Route path="/UserManagement" element={<UserManagement />} />
                
                <Route path="/Invoices" element={<Invoices />} />
                
                <Route path="/PublicShipmentList" element={<PublicShipmentList />} />
                
                <Route path="/CourierDashboard" element={<CourierDashboard />} />
                
                <Route path="/CourierControl" element={<CourierControl />} />
                
                <Route path="/Privacy" element={<Privacy />} />
                
                <Route path="/Terms" element={<Terms />} />
                
                <Route path="/Settings" element={<Settings />} />
                
                <Route path="/DevelopmentConsole" element={<DevelopmentConsole />} />
                
                <Route path="/Documentation" element={<Documentation />} />
                
                <Route path="/TestPickupProcessor" element={<TestPickupProcessor />} />
                
                <Route path="/BakersManualOrder" element={<BakersManualOrder />} />
                
                <Route path="/BakersArchive" element={<BakersArchive />} />
                
                <Route path="/_app" element={<_app />} />
                
                <Route path="/AdminNotifications" element={<AdminNotifications />} />
                
                <Route path="/EmailTester" element={<EmailTester />} />
                
                <Route path="/OrderDataManagement" element={<OrderDataManagement />} />
                
                <Route path="/LogisticsOverview" element={<LogisticsOverview />} />
                
                <Route path="/OrderBackups" element={<OrderBackups />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}