
import React, { useState, useEffect } from "react";
import { Order } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { TrendingUp, DollarSign, Package, Calendar } from "lucide-react";
import { format, subDays, startOfMonth, endOfMonth } from "date-fns";
import { he } from "date-fns/locale";

import StatsCards from "../components/dashboard/StatsCards"; // This import will become unused, but the instruction is to preserve all other features. For this specific task, I'll keep it as the outline doesn't explicitly remove it, only the usage.

const COLORS = ['#3b82f6', '#f97316', '#8b5cf6', '#10b981', '#ef4444', '#06b6d4'];

export default function AnalyticsPage() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setIsLoading(true);
    const data = await Order.list("-created_date");
    setOrders(data);
    setIsLoading(false);
  };

  const safeFormat = (dateString, formatString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    if (date instanceof Date && !isNaN(date)) {
      return format(date, formatString, { locale: he });
    }
    return null;
  };

  // הכנת נתונים לגרפים
  const getSupplierData = () => {
    const supplierTotals = {};
    orders.forEach(order => {
      if (order.supplier && order.total_amount) {
        supplierTotals[order.supplier] = (supplierTotals[order.supplier] || 0) + order.total_amount;
      }
    });
    
    return Object.entries(supplierTotals)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 6)
      .map(([name, value]) => ({ name, value: Math.round(value) }));
  };

  const getStatusData = () => {
    const statusCounts = {};
    orders.forEach(order => {
      const statusText = order.status || 'לא ידוע';
      statusCounts[statusText] = (statusCounts[statusText] || 0) + 1;
    });
    
    return Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
  };

  const getMonthlyData = () => {
    const monthlyTotals = {};
    orders.forEach(order => {
      if (order.date && order.total_amount) {
        const month = safeFormat(order.date, "yyyy-MM");
        if (month) {
          monthlyTotals[month] = (monthlyTotals[month] || 0) + order.total_amount;
        }
      }
    });
    
    return Object.entries(monthlyTotals)
      .sort(([a], [b]) => a.localeCompare(b))
      // Removed .slice(-6) to show all months
      .map(([month, total]) => ({
        month: format(new Date(month + "-01"), "MMM yyyy", { locale: he }),
        total: Math.round(total)
      }));
  };

  // The quick statistics calculations are removed as per the request.
  // const thisMonthTotal = orders
  //   .filter(order => {
  //     if (!order.date) return false;
  //     const orderDate = new Date(order.date);
  //     if (!(orderDate instanceof Date && !isNaN(orderDate))) return false; // Added validation for invalid date
  //     const now = new Date();
  //     return orderDate >= startOfMonth(now) && orderDate <= endOfMonth(now);
  //   })
  //   .reduce((sum, order) => sum + (order.total_amount || 0), 0);

  // const avgOrderValue = orders.length > 0 
  //   ? orders.reduce((sum, order) => sum + (order.total_amount || 0), 0) / orders.length
  //   : 0;

  return (
    <div className="p-6 lg:p-8 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
            ניתוח נתונים
          </h1>
          <p className="text-gray-600 text-lg">סקירה מפורטת של ההזמנות והספקים</p>
        </div>

        {/* The quick statistics cards are removed as per the request */}
        {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCards 
            title="הזמנות החודש" 
            value={orders.filter(o => {
              // Ensure created_date is a valid date before filtering
              const orderDate = new Date(o.created_date);
              if (!(orderDate instanceof Date && !isNaN(orderDate))) return false;
              return orderDate >= startOfMonth(new Date()) && orderDate <= endOfMonth(new Date());
            }).length}
            icon={Package}
            bgColor="bg-blue-500"
          />
          <StatsCards 
            title="סכום החודש" 
            value={`₪${thisMonthTotal.toLocaleString()}`}
            icon={DollarSign}
            bgColor="bg-green-500"
          />
          <StatsCards 
            title="ממוצע להזמנה" 
            value={`₪${Math.round(avgOrderValue).toLocaleString()}`}
            icon={TrendingUp}
            bgColor="bg-purple-500"
          />
          <StatsCards 
            title="ספקים פעילים" 
            value={new Set(orders.map(o => o.supplier)).size}
            icon={Calendar}
            bgColor="bg-orange-500"
          />
        </div> */}

        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          <Card className="border-none elegant-shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader className="border-b border-gray-100">
              <CardTitle className="text-xl font-bold text-gray-900">הוצאות לפי ספק</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={getSupplierData()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    formatter={(value) => [`₪${value.toLocaleString()}`, 'סכום']}
                    labelStyle={{ textAlign: 'right' }}
                  />
                  <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-none elegant-shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader className="border-b border-gray-100">
              <CardTitle className="text-xl font-bold text-gray-900">התפלגות לפי סטטוס</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={getStatusData()}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({name, percent}) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {getStatusData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Card className="border-none elegant-shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader className="border-b border-gray-100">
            <CardTitle className="text-xl font-bold text-gray-900">מגמות חודשיות</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={getMonthlyData()}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 12 }}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  formatter={(value) => [`₪${value.toLocaleString()}`, 'סכום כולל']}
                  labelStyle={{ textAlign: 'right' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="total" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
