import React, { useState, useEffect } from 'react';
import { Order } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Database, Search, RefreshCw, Edit, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import { useOrders } from '@/components/contexts/OrderContext';

export default function OrderDataManagement() {
  const { 
    orders: allOrders, 
    isLoading: ordersLoading,
    refreshOrders,
    updateOrder,
    deleteOrder,
    createOrder
  } = useOrders();

  const [searchTerm, setSearchTerm] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editData, setEditData] = useState('');

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshOrders();
      toast.success("נתונים רוענו בהצלחה");
    } catch (error) {
      toast.error("שגיאה ברענון נתונים");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleEdit = (order) => {
    setSelectedOrder(order);
    setEditData(JSON.stringify(order, null, 2));
    setShowEditDialog(true);
  };

  const handleSaveEdit = async () => {
    try {
      const updatedData = JSON.parse(editData);
      await updateOrder(selectedOrder.id, updatedData);
      toast.success("הזמנה עודכנה בהצלחה");
      setShowEditDialog(false);
      setSelectedOrder(null);
    } catch (error) {
      toast.error("שגיאה בעדכון ההזמנה: " + error.message);
    }
  };

  const handleDelete = async (orderId, orderNumber) => {
    if (window.confirm(`האם אתה בטוח שברצונך למחוק את ההזמנה ${orderNumber}?`)) {
      try {
        await deleteOrder(orderId);
        toast.success("הזמנה נמחקה בהצלחה");
      } catch (error) {
        toast.error("שגיאה במחיקת ההזמנה");
      }
    }
  };

  const filteredOrders = allOrders.filter(order =>
    !searchTerm ||
    (order.order_number && order.order_number.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (order.customer_name && order.customer_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (order.supplier && order.supplier.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (order.status && order.status.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatDate = (dateString) => {
    if (!dateString) return 'null';
    try {
      return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: he });
    } catch {
      return dateString;
    }
  };

  const renderCellValue = (value) => {
    if (value === null || value === undefined) return <span className="text-gray-400">null</span>;
    if (typeof value === 'boolean') return <Badge variant={value ? 'default' : 'secondary'}>{value ? 'true' : 'false'}</Badge>;
    if (typeof value === 'object') return <span className="text-blue-600 font-mono text-xs">{JSON.stringify(value)}</span>;
    if (typeof value === 'string' && value.includes('T') && value.includes('Z')) return formatDate(value);
    return String(value);
  };

  const getStatusColor = (status) => {
    const colors = {
      "ממתין": "bg-yellow-100 text-yellow-800",
      "בליקוט": "bg-blue-100 text-blue-800",
      "ממתין למשלוח": "bg-purple-100 text-purple-800",
      "ממתין לאיסוף": "bg-indigo-100 text-indigo-800",
      "נשלח": "bg-green-100 text-green-800",
      "התקבל": "bg-emerald-100 text-emerald-800",
      "בארכיון": "bg-gray-100 text-gray-800"
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="p-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="max-w-full mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <Database className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">ניהול נתוני הזמנות</h1>
              <p className="text-gray-600">צפיה ועריכה של נתונים גולמיים</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button onClick={handleRefresh} variant="outline" size="icon" disabled={isRefreshing}>
              <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="חיפוש לפי מספר הזמנה, שם לקוח, ספק או סטטוס..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">סה״כ הזמנות</p>
                  <p className="text-2xl font-bold text-gray-900">{allOrders.length}</p>
                </div>
                <Database className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">מוצגות כעת</p>
                  <p className="text-2xl font-bold text-gray-900">{filteredOrders.length}</p>
                </div>
                <Search className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">בארכיון</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {allOrders.filter(o => o.status === 'בארכיון').length}
                  </p>
                </div>
                <Badge className="bg-gray-100 text-gray-800 w-8 h-8 rounded-full flex items-center justify-center">A</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">פעילות</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {allOrders.filter(o => o.status !== 'בארכיון').length}
                  </p>
                </div>
                <Badge className="bg-green-100 text-green-800 w-8 h-8 rounded-full flex items-center justify-center">●</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Table */}
        <Card className="bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              טבלת הזמנות ({filteredOrders.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto max-h-[600px]">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="text-right font-semibold w-20">פעולות</TableHead>
                    <TableHead className="text-right font-semibold">ID</TableHead>
                    <TableHead className="text-right font-semibold">מס' הזמנה</TableHead>
                    <TableHead className="text-right font-semibold">ספק</TableHead>
                    <TableHead className="text-right font-semibold">לקוח</TableHead>
                    <TableHead className="text-right font-semibold">סטטוס</TableHead>
                    <TableHead className="text-right font-semibold">סכום</TableHead>
                    <TableHead className="text-right font-semibold">נוצר</TableHead>
                    <TableHead className="text-right font-semibold">עודכן</TableHead>
                    <TableHead className="text-right font-semibold">סוג הזמנה</TableHead>
                    <TableHead className="text-right font-semibold">אמצעי משלוח</TableHead>
                    <TableHead className="text-right font-semibold">טלפון</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id} className="hover:bg-gray-50">
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="w-8 h-8"
                            onClick={() => handleEdit(order)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="w-8 h-8 text-red-600"
                            onClick={() => handleDelete(order.id, order.order_number)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs">{order.id}</TableCell>
                      <TableCell className="font-mono">{renderCellValue(order.order_number)}</TableCell>
                      <TableCell>{renderCellValue(order.supplier)}</TableCell>
                      <TableCell>{renderCellValue(order.customer_name || order.shipping_name)}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(order.status)}>{order.status || 'null'}</Badge>
                      </TableCell>
                      <TableCell className="font-mono">
                        {order.total_amount ? `₪${order.total_amount.toLocaleString()}` : renderCellValue(order.total_amount)}
                      </TableCell>
                      <TableCell className="text-xs">{renderCellValue(order.created_date)}</TableCell>
                      <TableCell className="text-xs">{renderCellValue(order.updated_date)}</TableCell>
                      <TableCell>{renderCellValue(order.order_type)}</TableCell>
                      <TableCell>{renderCellValue(order.shipping_method_chosen)}</TableCell>
                      <TableCell className="font-mono">{renderCellValue(order.customer_phone || order.shipping_phone)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>עריכת הזמנה #{selectedOrder?.order_number}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">נתוני JSON:</label>
                <textarea
                  className="w-full h-96 p-3 border rounded-md font-mono text-sm"
                  value={editData}
                  onChange={(e) => setEditData(e.target.value)}
                  placeholder="נתוני ההזמנה בפורמט JSON..."
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                  ביטול
                </Button>
                <Button onClick={handleSaveEdit}>
                  שמירה
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}