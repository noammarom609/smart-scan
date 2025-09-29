import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MapPin, Phone, User } from "lucide-react";

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

export default function CourierTable({ orders, courierName }) {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4">
        <h2 className="text-xl font-bold text-center">רשימת משלוחים - {courierName}</h2>
        <p className="text-center text-blue-100 mt-1">{orders.length} משלוחים</p>
      </div>
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="font-bold">שם לקוח</TableHead>
              <TableHead className="font-bold">טלפון</TableHead>
              <TableHead className="font-bold">איש קשר נוסף</TableHead>
              <TableHead className="font-bold">כתובת מלאה</TableHead>
              <TableHead className="font-bold">פירוט שקיות</TableHead>
              <TableHead className="font-bold">סה״כ שקיות</TableHead>
              <TableHead className="font-bold">הערות</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order, index) => {
              const customerName = order.shipping_name || order.customer_name || 'לא צוין';
              const customerPhone = order.shipping_phone || order.customer_phone || 'לא צוין';
              const fullAddress = `${order.shipping_address || ''}, ${order.shipping_city || ''}`.trim().replace(/^,|,$/, '') || 'לא צוין';
              
              // **FIX**: If location_bag_summary is missing or empty, generate it from items.
              let locationSummary = order.location_bag_summary || [];
              if ((!locationSummary || locationSummary.length === 0) && order.items && order.items.length > 0) {
                locationSummary = generateBagsSummaryFromItems(order.items);
              }
              const totalBags = locationSummary.reduce((sum, loc) => sum + (loc.bags_count || 0), 0);
              
              return (
                <TableRow key={order.id} className={index % 2 === 0 ? 'bg-gray-50/30' : 'bg-white'}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-500" />
                      <span className="font-medium">{customerName}</span>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <span className="font-mono">{customerPhone}</span>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <span>{order.additional_contact || 'לא צוין'}</span>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span>{fullAddress}</span>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {locationSummary.length > 0 ? (
                        locationSummary.map((loc, locIndex) => (
                          <Badge key={locIndex} variant="outline" className="text-sm">
                            {loc.location}: {loc.bags_count} {loc.unit_type || 'שקיות'}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-gray-500 text-sm">לא צוין</span>
                      )}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="text-center">
                      <Badge className="bg-blue-100 text-blue-800 font-bold text-base">
                        {totalBags} יח׳
                      </Badge>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="max-w-xs">
                      <span className="text-sm">
                        {order.shipping_notes || order.notes || 'אין הערות'}
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      
      <div className="bg-gray-50 p-4 border-t">
        <div className="flex justify-between items-center text-sm text-gray-600">
          <span>סה״כ משלוחים: <strong>{orders.length}</strong></span>
          <span>סה״כ שקיות: <strong>{orders.reduce((total, order) => {
            let summary = order.location_bag_summary || [];
            if ((!summary || summary.length === 0) && order.items && order.items.length > 0) {
              summary = generateBagsSummaryFromItems(order.items);
            }
            return total + summary.reduce((sum, loc) => sum + (loc.bags_count || 0), 0);
          }, 0)}</strong></span>
        </div>
      </div>
    </div>
  );
}