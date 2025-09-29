
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter, ArrowUpDown } from "lucide-react";

export default function OrderFilters({ onFilterChange, orders = [] }) {
  const uniqueSuppliers = [...new Set(orders.map(order => order.supplier).filter(Boolean))];

  const handleFilterChange = (type, value) => {
    onFilterChange(prev => ({ ...prev, [type]: value }));
  };

  return (
    <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-4 mt-3 sm:mt-4">
      {/* Status Filter */}
      <div className="flex items-center gap-2 w-full sm:w-auto">
        <Filter className="w-4 h-4 text-gray-500 flex-shrink-0" />
        <Select onValueChange={(value) => handleFilterChange("status", value)} defaultValue="all">
          <SelectTrigger className="w-full sm:w-40 bg-gray-50 border-gray-200 focus:bg-white text-sm">
            <SelectValue placeholder="סטטוס" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">כל הסטטוסים</SelectItem>
            <SelectItem value="ממתין">ממתין</SelectItem>
            <SelectItem value="בליקוט">בליקוט</SelectItem>
            <SelectItem value="ממתין למשלוח">ממתין למשלוח</SelectItem>
            <SelectItem value="ממתין לאיסוף">ממתין לאיסוף</SelectItem>
            <SelectItem value="נשלח">נשלח</SelectItem>
            <SelectItem value="התקבל">התקבל</SelectItem>
            <SelectItem value="בוטל">בוטל</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Supplier Filter */}
      <div className="flex items-center gap-2 w-full sm:w-auto">
        <Select onValueChange={(value) => handleFilterChange("supplier", value)} defaultValue="all">
          <SelectTrigger className="w-full sm:w-40 bg-gray-50 border-gray-200 focus:bg-white text-sm">
            <SelectValue placeholder="ספק" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">כל הספקים</SelectItem>
            {uniqueSuppliers.map((supplier) => (
              <SelectItem key={supplier} value={supplier}>
                {supplier}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Sort Filter */}
      <div className="flex items-center gap-2 w-full sm:w-auto">
        <ArrowUpDown className="w-4 h-4 text-gray-500 flex-shrink-0" />
        <Select onValueChange={(value) => handleFilterChange("sortOrder", value)} defaultValue="newest">
          <SelectTrigger className="w-full sm:w-40 bg-gray-50 border-gray-200 focus:bg-white text-sm">
            <SelectValue placeholder="מיון לפי תאריך" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">חדש לישן</SelectItem>
            <SelectItem value="oldest">ישן לחדש</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
