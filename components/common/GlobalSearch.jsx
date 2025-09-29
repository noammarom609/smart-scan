import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Order } from '@/api/entities';
import { Input } from "@/components/ui/input";
import { Search, User, Eye } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createPageUrl } from "@/utils";
import { useLocation, useNavigate } from "react-router-dom";

export default function GlobalSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const searchRef = useRef(null);

  // זיהוי הדף הנוכחי
  const getCurrentPageContext = useCallback(() => {
    const pathname = location.pathname;
    if (pathname.includes('Pickups')) return 'pickups';
    if (pathname.includes('Shipments')) return 'shipments'; 
    if (pathname.includes('Picking')) return 'picking';
    if (pathname.includes('MissingItems')) return 'missing';
    if (pathname.includes('Analytics')) return 'analytics';
    return 'home';
  }, [location.pathname]);

  const searchOrders = useCallback(async (term) => {
    if (!term || term.length < 1) {
      setResults([]);
      setShowResults(false);
      return;
    }

    setIsLoading(true);
    try {
      const orders = await Order.list();
      let filtered = orders.filter(order => 
        (order.customer_name && order.customer_name.toLowerCase().includes(term.toLowerCase())) ||
        (order.shipping_name && order.shipping_name.toLowerCase().includes(term.toLowerCase())) ||
        (order.order_number && order.order_number.includes(term)) ||
        (order.supplier && order.supplier.toLowerCase().includes(term.toLowerCase()))
      );

      // סינון לפי עמוד נוכחי
      const currentPage = getCurrentPageContext();
      
      switch (currentPage) {
        case 'pickups':
          filtered = filtered.filter(order => 
            order.status === "ממתין לאיסוף" && order.shipping_method_chosen === "איסוף_עצמי"
          );
          break;
        case 'shipments':
          filtered = filtered.filter(order => 
            order.status === "ממתין למשלוח" && order.shipping_method_chosen === "משלוח"
          );
          break;
        case 'picking':
          filtered = filtered.filter(order => order.status === "בליקוט");
          break;
        case 'missing':
          filtered = filtered.filter(order => {
            return order.items && order.items.some(item => item.picking_status === "חסר_במלאי");
          });
          break;
        // לדף הבית ואנליטיקס נשאיר הכל
      }

      setResults(filtered);
      setShowResults(true);
    } catch (error) {
      console.error('Error searching orders:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [getCurrentPageContext]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchOrders(searchTerm);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, searchOrders]);

  const handleOrderClick = useCallback((order, event) => {
    event.preventDefault();
    event.stopPropagation();
    
    setShowResults(false);
    setSearchTerm('');
    
    // תמיד נווט לדף פרטי ההזמנה, ללא קשר לדף הנוכחי
    navigate(createPageUrl(`OrderDetails?id=${order.id}`));
  }, [navigate]);

  // סגירת תוצאות החיפוש כשלוחצים מחוץ לקומפוננטה
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const statusColors = {
    "ממתין": "bg-yellow-100 text-yellow-800",
    "בליקוט": "bg-orange-100 text-orange-800", 
    "ממתין למשלוח": "bg-indigo-100 text-indigo-800",
    "נשלח": "bg-purple-100 text-purple-800",
    "התקבל": "bg-green-100 text-green-800",
    "בוטל": "bg-red-100 text-red-800",
    "ממתין לאיסוף": "bg-blue-100 text-blue-800" // Added for consistency, though not directly used in the search filter context
  };

  const getContextualMessage = () => {
    const currentPage = getCurrentPageContext();
    const resultCount = results.length;
    
    if (searchTerm.length < 2) return 'הכנס לפחות 2 תווים לחיפוש';
    if (resultCount === 0) {
      switch (currentPage) {
        case 'pickups': return 'לא נמצאו הזמנות לאיסוף עצמי';
        case 'shipments': return 'לא נמצאו הזמנות למשלוח';
        case 'picking': return 'לא נמצאו הזמנות בליקוט';
        case 'missing': return 'לא נמצאו הזמנות עם חוסרים';
        default: return 'לא נמצאו תוצאות';
      }
    }
    return null;
  };

  return (
    <div className="relative" ref={searchRef}>
      <div className="relative">
        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="חיפוש לקוח או הזמנה..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pr-10 bg-white border-gray-200"
          onFocus={() => {
            if (searchTerm && searchTerm.length >= 1) {
              setShowResults(true);
            }
          }}
        />
      </div>

      {showResults && (
        <Card className="absolute top-full right-0 left-0 mt-1 z-50 max-h-96 overflow-auto elegant-shadow-lg">
          <CardContent className="p-2">
            {isLoading ? (
              <div className="p-4 text-center text-gray-500">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : results.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                {getContextualMessage()}
              </div>
            ) : (
              <div className="space-y-2">
                {results.map((order) => (
                  <button
                    key={order.id}
                    onClick={(e) => handleOrderClick(order, e)}
                    className="w-full block p-3 hover:bg-gray-50 rounded-lg transition-colors text-right cursor-pointer border border-transparent hover:border-blue-200"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <User className="w-4 h-4 text-gray-500" />
                        <div>
                          <div className="font-medium text-gray-900">
                            {order.customer_name || order.shipping_name || 'לא צוין'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {order.supplier} - #{order.order_number}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={`${statusColors[order.status] || statusColors["ממתין"]} text-xs`}>
                          {order.status || 'ממתין'}
                        </Badge>
                        <Eye className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}