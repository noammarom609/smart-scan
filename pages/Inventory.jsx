
import React, { useState, useEffect, useMemo } from "react";
import { InventoryItem } from "@/api/entities";
import { Supplier } from "@/api/entities"; // Added Supplier entity import
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Package2,
  Plus,
  RefreshCw,
  Edit3,
  Trash2,
  ShoppingCart,
  AlertTriangle,
  Filter,
  Search,
  Users // Icon for suppliers
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import SupplierCombobox from "@/components/inventory/SupplierCombobox";
import AddSupplierDialog from "@/components/inventory/AddSupplierDialog"; // Added AddSupplierDialog import

const STATUS_COLORS = {
  "במלאי": "bg-green-100 text-green-800",
  "דורש_הזמנה": "bg-orange-100 text-orange-800",
  "הוזמן": "bg-blue-100 text-blue-800",
  "אזל": "bg-red-100 text-red-800"
};

export default function InventoryPage() {
  const [items, setItems] = useState([]);
  const [suppliers, setSuppliers] = useState([]); // State for suppliers
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showAddSupplierDialog, setShowAddSupplierDialog] = useState(false); // State for AddSupplierDialog
  const [editingItem, setEditingItem] = useState(null);
  const [filterSupplier, setFilterSupplier] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItems, setSelectedItems] = useState([]);

  const [newItem, setNewItem] = useState({
    product_name: "",
    product_code: "",
    supplier: "",
    current_stock: 0,
    quantity_to_order: 0,
    notes: ""
  });

  const loadData = async (isRefresh = false) => {
    if (!isRefresh) setIsLoading(true);
    setIsRefreshing(true);
    try {
      const [itemsData, suppliersData] = await Promise.all([
        InventoryItem.list("-created_date"),
        Supplier.list()
      ]);
      setItems(itemsData);
      
      // Deduplicate and sort suppliers
      const uniqueSupplierNames = [...new Set(suppliersData.map(s => s.name.trim()).filter(Boolean))];
      const uniqueSuppliers = uniqueSupplierNames.map(name => ({ name }));
      setSuppliers(uniqueSuppliers.sort((a, b) => a.name.localeCompare(b.name, 'he')));
      
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("שגיאה בטעינת הנתונים.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSupplierAdded = (newSupplierName) => {
    loadData(true); // Refresh all data after a new supplier is added
    setNewItem(prev => ({ ...prev, supplier: newSupplierName })); // Set new item's supplier to the newly added one
    setShowAddSupplierDialog(false); // Close the dialog
  };

  const supplierOptions = useMemo(() => {
    return suppliers.map(s => ({ value: s.name, label: s.name }));
  }, [suppliers]);

  const filterSupplierOptions = useMemo(() => {
    return [
      { value: "all", label: "כל הספקים" },
      ...supplierOptions
    ];
  }, [supplierOptions]);

  const handleRefresh = async () => {
    toast.info("מרענן נתונים...");
    await loadData(true);
    toast.success("הנתונים עודכנו!");
  };

  const handleAddItem = async () => {
    if (!newItem.product_name || !newItem.supplier) {
      toast.error("יש למלא שם מוצר וספק");
      return;
    }

    try {
      await InventoryItem.create({
        ...newItem,
        status: "דורש_הזמנה"
      });
      toast.success("המוצר נוסף בהצלחה!");
      setNewItem({
        product_name: "",
        product_code: "",
        supplier: "",
        current_stock: 0,
        quantity_to_order: 0,
        notes: ""
      });
      setShowAddDialog(false);
      loadData(); // Reload items after adding
    } catch (error) {
      console.error("Error adding item:", error);
      toast.error("שגיאה בהוספת המוצר");
    }
  };

  const handleUpdateItem = async () => {
    if (!editingItem) return;
    try {
      const { id, created_date, updated_date, created_by, ...updateData } = editingItem;
      await InventoryItem.update(id, updateData);
      toast.success("המוצר עודכן בהצלחה!");
      setShowEditDialog(false);
      setEditingItem(null);
      loadData(); // Reload items after updating
    } catch (error) {
      console.error("Error updating item:", error);
      toast.error("שגיאה בעדכון המוצר");
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (!confirm("האם אתה בטוח שברצונך למחוק את המוצר?")) return;

    try {
      await InventoryItem.delete(itemId);
      toast.success("המוצר נמחק בהצלחה!");
      loadData(); // Reload items after deleting
    } catch (error) {
      console.error("Error deleting item:", error);
      toast.error("שגיאה במחיקת המוצר");
    }
  };

  const handleDeleteSelectedItems = async () => {
    if (selectedItems.length === 0) {
      toast.error("לא נבחרו מוצרים למחיקה");
      return;
    }

    if (!confirm(`האם אתה בטוח שברצונך למחוק ${selectedItems.length} מוצרים?`)) return;

    const toastId = toast.loading("מוחק מוצרים...");
    try {
      await Promise.all(selectedItems.map(itemId => InventoryItem.delete(itemId)));
      toast.success(`${selectedItems.length} מוצרים נמחקו בהצלחה!`, { id: toastId });
      setSelectedItems([]);
      loadData(); // Reload items after bulk delete
    } catch (error) {
      console.error("Error deleting selected items:", error);
      toast.error("שגיאה במחיקת המוצרים", { id: toastId });
    }
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedItems(filteredItems.map(item => item.id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (itemId, checked) => {
    if (checked) {
      setSelectedItems(prev => [...prev, itemId]);
    } else {
      setSelectedItems(prev => prev.filter(id => id !== itemId));
    }
  };

  const filteredItems = items.filter(item => {
    const supplierMatch = filterSupplier === "all" || item.supplier === filterSupplier;
    const statusMatch = filterStatus === "all" || item.status === filterStatus;
    const searchLower = searchTerm.toLowerCase();
    const searchMatch = searchTerm === "" ||
      (item.product_name && item.product_name.toLowerCase().includes(searchLower)) ||
      (item.product_code && item.product_code.toLowerCase().includes(searchLower));
    return supplierMatch && statusMatch && searchMatch;
  });

  const needToOrderItems = items.filter(item =>
    item.status === "דורש_הזמנה" || item.status === "אזל"
  );

  const groupedBySupplier = needToOrderItems.reduce((acc, item) => {
    if (!acc[item.supplier]) {
      acc[item.supplier] = [];
    }
    acc[item.supplier].push(item);
    return acc;
  }, {});

  return (
    <div className="p-6 lg:p-8 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-6">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <Package2 className="w-8 h-8 text-blue-600" />
              ניהול מלאי
            </h1>
            <p className="text-gray-600 text-lg">ניהול רשימת קניות וחוסרי מלאי</p>
          </div>
          <div className="flex items-center gap-3">
            {selectedItems.length > 0 && (
              <Button
                onClick={handleDeleteSelectedItems}
                variant="destructive"
                className="bg-red-600 hover:bg-red-700"
              >
                <Trash2 className="w-4 h-4 ml-2" />
                מחק נבחרים ({selectedItems.length})
              </Button>
            )}
            <Button onClick={handleRefresh} variant="outline" size="icon" className="bg-white elegant-shadow" disabled={isRefreshing}>
              <RefreshCw className={`w-5 h-5 text-gray-600 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
            <Button
              onClick={() => setShowAddSupplierDialog(true)}
              variant="outline"
              className="bg-white hover:bg-gray-50 border-gray-200 elegant-shadow"
            >
              <Users className="w-4 h-4 ml-2" />
              הוסף ספק
            </Button>
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800">
                  <Plus className="w-4 h-4 ml-2" />
                  הוסף מוצר
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-right">הוסף מוצר חדש</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="product_name">שם המוצר <span className="text-red-500">*</span></Label>
                    <Input
                      id="product_name"
                      value={newItem.product_name}
                      onChange={(e) => setNewItem(prev => ({ ...prev, product_name: e.target.value }))}
                      placeholder="הכנס שם מוצר"
                    />
                  </div>

                  <div>
                    <Label htmlFor="product_code">מק״ט</Label>
                    <Input
                      id="product_code"
                      value={newItem.product_code}
                      onChange={(e) => setNewItem(prev => ({ ...prev, product_code: e.target.value }))}
                      placeholder="הכנס מק״ט (אופציונלי)"
                    />
                  </div>

                  <div>
                    <Label htmlFor="supplier">ספק <span className="text-red-500">*</span></Label>
                    <SupplierCombobox
                      options={supplierOptions}
                      value={newItem.supplier}
                      onValueChange={(value) => setNewItem(prev => ({ ...prev, supplier: value || '' }))}
                      placeholder="בחר ספק"
                    />
                  </div>

                  <div>
                    <Label htmlFor="current_stock">מלאי נוכחי</Label>
                    <Input
                      id="current_stock"
                      type="number"
                      min="0"
                      value={newItem.current_stock}
                      onChange={(e) => setNewItem(prev => ({ ...prev, current_stock: parseInt(e.target.value) || 0 }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="quantity_to_order">כמות מומלצת להזמנה</Label>
                    <Input
                      id="quantity_to_order"
                      type="number"
                      min="0"
                      value={newItem.quantity_to_order}
                      onChange={(e) => setNewItem(prev => ({ ...prev, quantity_to_order: parseInt(e.target.value) || 0 }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="notes">הערות</Label>
                    <Textarea
                      id="notes"
                      value={newItem.notes}
                      onChange={(e) => setNewItem(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="הערות נוספות על המוצר"
                      className="h-20"
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                      ביטול
                    </Button>
                    <Button onClick={handleAddItem} className="bg-green-600 hover:bg-green-700">
                      הוסף מוצר
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {Object.keys(groupedBySupplier).length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <AlertTriangle className="w-7 h-7 text-orange-500" />
              מוצרים הדורשים הזמנה
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(groupedBySupplier).map(([supplier, supplierItems]) => (
                <Card key={supplier} className="border-none elegant-shadow-lg bg-white/80 backdrop-blur-sm">
                  <CardHeader className="bg-gray-50 border-b">
                    <CardTitle className="text-lg font-bold text-gray-800">{supplier}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-2">
                    {supplierItems.map((item) => (
                      <div key={item.id} className="flex justify-between items-center p-2 bg-white rounded-md border">
                        <div>
                          <span className="font-medium text-gray-900">{item.product_name}</span>
                          {item.product_code && <p className="text-xs text-gray-500 mt-1">מק״ט: {item.product_code}</p>}
                          {item.notes && <p className="text-xs text-gray-500 mt-1">{item.notes}</p>}
                        </div>
                        <Badge className={`${STATUS_COLORS[item.status]} text-xs`}>
                          {item.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row flex-wrap gap-4 mb-6">
          <div className="relative flex-grow">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="חיפוש לפי שם מוצר או מק״ט..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10 bg-white w-full"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <div className="w-full sm:w-48">
               <SupplierCombobox
                options={filterSupplierOptions}
                value={filterSupplier}
                onValueChange={(value) => setFilterSupplier(value || 'all')}
                placeholder="כל הספקים"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-40 bg-white">
                <SelectValue placeholder="כל הסטטוסים" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">כל הסטטוסים</SelectItem>
                <SelectItem value="במלאי">במלאי</SelectItem>
                <SelectItem value="דורש_הזמנה">דורש הזמנה</SelectItem>
                <SelectItem value="הוזמן">הוזמן</SelectItem>
                <SelectItem value="אזל">אזל</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Card className="border-none elegant-shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <ShoppingCart className="w-6 h-6 text-blue-600" />
              רשימת מוצרים ({filteredItems.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="p-12 text-center">
                <Package2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">אין מוצרים</h3>
                <p className="text-gray-500">התחל בהוספת המוצר הראשון שלך</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="text-right font-semibold w-12">
                        <Checkbox
                          checked={filteredItems.length > 0 && selectedItems.length === filteredItems.length}
                          onCheckedChange={handleSelectAll}
                          aria-label="בחר הכל"
                        />
                      </TableHead>
                      <TableHead className="text-right font-semibold">מוצר</TableHead>
                      <TableHead className="text-right font-semibold">מק״ט</TableHead>
                      <TableHead className="text-right font-semibold">ספק</TableHead>
                      <TableHead className="text-right font-semibold">מלאי נוכחי</TableHead>
                      <TableHead className="text-right font-semibold">סטטוס</TableHead>
                      <TableHead className="text-right font-semibold">כמות להזמנה</TableHead>
                      <TableHead className="text-right font-semibold">פעולות</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredItems.map((item) => (
                      <TableRow key={item.id} className="hover:bg-gray-50">
                        <TableCell>
                          <Checkbox
                            checked={selectedItems.includes(item.id)}
                            onCheckedChange={(checked) => handleSelectItem(item.id, checked)}
                            aria-label={`בחר ${item.product_name}`}
                          />
                        </TableCell>
                        <TableCell className="font-medium">
                          <div>
                            <div className="font-semibold">{item.product_name}</div>
                            {item.notes && (
                              <div className="text-sm text-gray-500 mt-1">{item.notes}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{item.product_code || '---'}</TableCell>
                        <TableCell>{item.supplier}</TableCell>
                        <TableCell>
                          <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-sm font-medium">
                            {item.current_stock}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge className={STATUS_COLORS[item.status]}>
                            {item.status.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {item.quantity_to_order > 0 && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm font-medium">
                              {item.quantity_to_order}
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setEditingItem({ ...item });
                                setShowEditDialog(true);
                              }}
                              className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                            >
                              <Edit3 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteItem(item.id)}
                              className="text-red-600 hover:text-red-800 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {editingItem && (
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-right">עריכת מוצר: {editingItem.product_name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="edit_product_name">שם המוצר</Label>
                <Input
                  id="edit_product_name"
                  value={editingItem.product_name}
                  onChange={(e) => setEditingItem(prev => ({ ...prev, product_name: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="edit_product_code">מק״ט</Label>
                <Input
                  id="edit_product_code"
                  value={editingItem.product_code || ''}
                  onChange={(e) => setEditingItem(prev => ({ ...prev, product_code: e.target.value }))}
                  placeholder="מק״ט המוצר"
                />
              </div>

              <div>
                <Label htmlFor="edit_supplier">ספק</Label>
                <SupplierCombobox
                  options={supplierOptions}
                  value={editingItem.supplier}
                  onValueChange={(value) => setEditingItem(prev => ({ ...prev, supplier: value || '' }))}
                  placeholder="בחר ספק"
                />
              </div>

              <div>
                <Label htmlFor="edit_current_stock">מלאי נוכחי</Label>
                <Input
                  id="edit_current_stock"
                  type="number"
                  min="0"
                  value={editingItem.current_stock}
                  onChange={(e) => setEditingItem(prev => ({ ...prev, current_stock: parseInt(e.target.value) || 0 }))}
                />
              </div>

              <div>
                <Label htmlFor="edit_status">סטטוס</Label>
                <Select
                  value={editingItem.status}
                  onValueChange={(value) => setEditingItem(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="במלאי">במלאי</SelectItem>
                    <SelectItem value="דורש_הזמנה">דורש הזמנה</SelectItem>
                    <SelectItem value="הוזמן">הוזמן</SelectItem>
                    <SelectItem value="אזל">אזל</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="edit_quantity_to_order">כמות מומלצת להזמנה</Label>
                <Input
                  id="edit_quantity_to_order"
                  type="number"
                  min="0"
                  value={editingItem.quantity_to_order}
                  onChange={(e) => setEditingItem(prev => ({ ...prev, quantity_to_order: parseInt(e.target.value) || 0 }))}
                />
              </div>

              <div>
                <Label htmlFor="edit_notes">הערות</Label>
                <Textarea
                  id="edit_notes"
                  value={editingItem.notes}
                  onChange={(e) => setEditingItem(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="הערות נוספות על המוצר"
                  className="h-20"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                  ביטול
                </Button>
                <Button onClick={handleUpdateItem} className="bg-blue-600 hover:bg-blue-700">
                  שמור שינויים
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Add Supplier Dialog */}
      <AddSupplierDialog
        open={showAddSupplierDialog}
        onOpenChange={setShowAddSupplierDialog}
        onSupplierAdded={handleSupplierAdded}
      />
    </div>
  );
}
