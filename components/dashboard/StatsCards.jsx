import React from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { TrendingUp, Package, DollarSign } from "lucide-react";

export default function StatsCards({ title, value, icon: Icon, bgColor = 'bg-gray-500', trend }) {
  return (
    <Card className="relative overflow-hidden border-none elegant-shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
      <div className={`absolute top-0 left-0 w-16 sm:w-32 h-16 sm:h-32 transform -translate-x-4 sm:-translate-x-8 -translate-y-4 sm:-translate-y-8 ${bgColor} rounded-full opacity-10`} />
      <CardHeader className="p-3 sm:p-6">
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm font-semibold text-gray-600 mb-1 truncate">{title}</p>
            <div className="text-lg sm:text-2xl lg:text-3xl font-bold text-gray-900 truncate">
              {value}
            </div>
          </div>
          <div className={`p-2 sm:p-3 rounded-xl ${bgColor} bg-opacity-20 elegant-shadow flex-shrink-0`}>
            {Icon && <Icon className={`w-4 h-4 sm:w-6 sm:h-6 ${bgColor.replace('bg-', 'text-')}`} />}
          </div>
        </div>
        {trend && (
          <div className="flex items-center mt-2 sm:mt-4 text-xs sm:text-sm">
            <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 ml-1 text-green-500" />
            <span className="text-green-600 font-semibold truncate">{trend}</span>
          </div>
        )}
      </CardHeader>
    </Card>
  );
}