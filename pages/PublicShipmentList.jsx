import React, { useState, useEffect } from 'react';
import { Order } from '@/api/entities';
import { Badge } from "@/components/ui/badge";
import { User, Phone, MapPin, Truck, Hash, StickyNote, Box } from "lucide-react";

// Helper function to generate bag summary if it's missing
const generateBagsSummaryFromItems = (items) => {
  if (!items || items.length === 0) return [];
  const locationCounts = {};
  items.forEach(item => {
    if (item.picked_quantity > 0 || item.picking_status === 'נשלח_לאפייה') {
      if (item.location_breakdown && item.location_breakdown.length > 0) {
        item.location_breakdown.forEach(breakdown => {
          if (breakdown.location && breakdown.quantity > 0) {
            if (!locationCounts[breakdown.location]) {
              locationCounts[breakdown.location] = 0;
            }
            locationCounts[breakdown.location] += breakdown.quantity;
          }
        });
      } else if (item.location && item.picked_quantity > 0) {
        if (!locationCounts[item.location]) {
          locationCounts[item.location] = 0;
        }
        locationCounts[item.location] += item.picked_quantity;
      }
    }
  });
  return Object.entries(locationCounts).map(([location, totalItems]) => ({
    location,
    bags_count: Math.max(1, Math.ceil(totalItems / 10)),
    unit_type: location === 'קרטון' ? 'קרטון' : 'שקיות'
  }));
};

export default function PublicShipmentList() {
    const [orders, setOrders] = useState([]);
    const [courierName, setCourierName] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const ids = urlParams.get('ids')?.split(',');
        const name = urlParams.get('courierName');
        setCourierName(name || 'השליח');

        if (!ids || ids.length === 0) {
            setError('לא סופקו מזהי הזמנות.');
            setIsLoading(false);
            return;
        }

        const fetchOrders = async () => {
            try {
                // RLS should be configured for public read on Orders
                const allOrders = await Order.list(); 
                const filteredOrders = allOrders.filter(o => ids.includes(o.id));
                setOrders(filteredOrders);
            } catch (e) {
                setError('שגיאה בטעינת נתוני המשלוח.');
                console.error(e);
            } finally {
                setIsLoading(false);
            }
        };

        fetchOrders();
    }, []);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center text-center p-4">
                <div className="bg-white p-8 rounded-lg shadow-md">
                    <Truck className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h1 className="text-xl font-bold text-red-700">שגיאה</h1>
                    <p className="text-gray-600 mt-2">{error}</p>
                </div>
            </div>
        );
    }
    
    const totalBags = orders.reduce((total, order) => {
        let summary = order.location_bag_summary || [];
        if ((!summary || summary.length === 0) && order.items && order.items.length > 0) {
            summary = generateBagsSummaryFromItems(order.items);
        }
        return total + summary.reduce((sum, loc) => sum + (loc.bags_count || 0), 0);
    }, 0);


    return (
        <div dir="rtl" className="min-h-screen bg-gray-50 p-2 sm:p-4">
            <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
                <header className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 sm:p-6 text-center">
                    <h1 className="text-2xl sm:text-3xl font-bold">רשימת משלוחים - {courierName}</h1>
                    <p className="text-blue-100 mt-1">{orders.length} משלוחים בסך הכל</p>
                </header>
                
                <div className="space-y-3 p-2 sm:p-4">
                    {orders.map(order => {
                         let locationSummary = order.location_bag_summary || [];
                         if ((!locationSummary || locationSummary.length === 0) && order.items && order.items.length > 0) {
                           locationSummary = generateBagsSummaryFromItems(order.items);
                         }
                         const orderTotalBags = locationSummary.reduce((sum, loc) => sum + (loc.bags_count || 0), 0);

                        return (
                            <div key={order.id} className="bg-white border border-gray-200 rounded-lg p-4 space-y-3 shadow-sm">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        <User className="w-5 h-5 text-blue-600" />
                                        <span className="font-bold text-lg text-gray-800">{order.shipping_name || order.customer_name}</span>
                                    </div>
                                    <Badge className="bg-blue-100 text-blue-800 font-mono text-sm">#{order.order_number}</Badge>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                                    <div className="flex items-center gap-2">
                                        <Phone className="w-4 h-4 text-gray-500"/>
                                        <a href={`tel:${order.shipping_phone || order.customer_phone}`} className="text-blue-600">{order.shipping_phone || order.customer_phone}</a>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-gray-500"/>
                                        <span>{`${order.shipping_address || ''}, ${order.shipping_city || ''}`}</span>
                                    </div>
                                     <div className="flex items-center gap-2">
                                        <User className="w-4 h-4 text-gray-500"/>
                                        <span>{order.additional_contact || 'אין איש קשר נוסף'}</span>
                                    </div>
                                </div>
                                <div className="border-t pt-3 mt-3">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Box className="w-4 h-4 text-gray-500"/>
                                        <span className="font-semibold">פריטים: {orderTotalBags} יח' סה"כ</span>
                                    </div>
                                    <div className="flex flex-wrap gap-1">
                                        {locationSummary.length > 0 ? (
                                            locationSummary.map((loc, locIndex) => (
                                            <Badge key={locIndex} variant="outline" className="text-xs">
                                                {loc.location}: {loc.bags_count} {loc.unit_type || 'שקיות'}
                                            </Badge>
                                            ))
                                        ) : (
                                            <span className="text-gray-500 text-xs">אין פירוט</span>
                                        )}
                                    </div>
                                </div>
                                {(order.shipping_notes || order.notes) && (
                                     <div className="border-t pt-3 mt-3">
                                        <div className="flex items-center gap-2">
                                            <StickyNote className="w-4 h-4 text-gray-500"/>
                                            <p className="text-sm text-gray-700">{order.shipping_notes || order.notes}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                 <footer className="bg-gray-100 border-t p-4 flex justify-between items-center">
                    <span className="font-bold text-gray-700">סה״כ משלוחים: {orders.length}</span>
                    <span className="font-bold text-gray-700">סה״כ שקיות/קרטונים: {totalBags}</span>
                </footer>
            </div>
        </div>
    );
}