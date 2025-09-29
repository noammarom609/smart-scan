import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Save, XCircle, User, Phone, DollarSign, Package, X } from "lucide-react";
import { toast } from "sonner";

export default function BakingOrderForm({ extractedData, onSave, onCancel, isProcessing }) {
  const [formData, setFormData] = useState({
    supplier: extractedData.supplier || "משימת אפייה פנימית",
    date: new Date().toISOString().split('T')[0], // תאריך קבוע
    customer_name: extractedData.customer_name || "",
    customer_phone: extractedData.customer_phone || "",
    delivery_notes: extractedData.delivery_notes || "",
    payment_status: extractedData.payment_status || "לא_שולם",
    items: extractedData.items && extractedData.items.length > 0 ? extractedData.items : [{ product_name: "", quantity: 1, total: 0 }]
  });

  const [validationErrors, setValidationErrors] = useState({});

  const handleFormChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (validationErrors[field]) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: false
      }));
    }
  };

  const updateItem = (index, field, value) => {
    const newItems = [...(formData.items || [])];
    newItems[index] = {
      ...newItems[index],
      [field]: value,
    };

    setFormData(prev => ({
      ...prev,
      items: newItems
    }));
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...(prev.items || []), {
        product_name: '',
        quantity: 1,
        total: 0
      }]
    }));
  };

  const removeItem = (index) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const calculateTotal = () => {
    const itemsTotal = formData.items?.reduce((sum, item) => sum + (item.total || 0), 0) || 0;
    return itemsTotal;
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.customer_name) {
      errors.customer_name = true;
    }
    
    if (!formData.customer_phone) {
      errors.customer_phone = true;
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("יש למלא את כל השדות החובה", {
        duration: 4000,
        position: "top-center"
      });
      return;
    }

    if (!formData.items.some(item => item.product_name && item.product_name.trim() !== '')) {
      toast.error("יש להוסיף לפחות פריט אחד עם שם מוצר", {
        duration: 4000,
        position: "top-center"
      });
      return;
    }

    const totalAmount = calculateTotal();

    const processedData = {
      ...formData,
      total_amount: totalAmount,
      currency: "₪",
      items: formData.items.filter(item => item.product_name && item.product_name.trim() !== '')
    };

    onSave(processedData);
  };

  const RequiredAsterisk = () => <span className="text-red-500 text-lg">*</span>;

  return (
    <Card className="border-none elegant-shadow-lg bg-white/90 backdrop-blur-sm">
      <CardHeader className="border-b border-gray-100">
        <CardTitle className="text-xl font-bold text-gray-900">
          יצירת משימת אפייה חדשה
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* פרטי הזמנה כלליים */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-2">
              <Label htmlFor="supplier" className="text-sm font-semibold text-gray-700">
                ספק
              </Label>
              <Input
                id="supplier"
                value={formData.supplier}
                readOnly
                disabled
                className="bg-gray-100 border-gray-200 text-sm sm:text-base cursor-not-allowed"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="date" className="text-sm font-semibold text-gray-700">
                תאריך יצירת המשימה
              </Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                readOnly
                disabled
                className="bg-gray-100 border-gray-200 text-sm sm:text-base cursor-not-allowed"
              />
            </div>
          </div>

          {/* פרטי מזמין */}
          <div className="border-t pt-4 sm:pt-6">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-bold text-gray-900">פרטי המזמין</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-2">
                <Label htmlFor="customer_name" className={`text-sm font-semibold ${validationErrors.customer_name ? 'text-red-600' : 'text-gray-700'}`}>
                  שם המזמין <RequiredAsterisk />
                </Label>
                <Input
                  id="customer_name"
                  value={formData.customer_name || ''}
                  onChange={(e) => handleFormChange('customer_name', e.target.value)}
                  placeholder="הכנס שם המזמין"
                  className={`bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-500 text-sm sm:text-base ${validationErrors.customer_name ? 'border-red-500 focus:border-red-500' : ''}`}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customer_phone" className={`text-sm font-semibold ${validationErrors.customer_phone ? 'text-red-600' : 'text-gray-700'}`}>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    מספר טלפון <RequiredAsterisk />
                  </div>
                </Label>
                <Input
                  id="customer_phone"
                  value={formData.customer_phone || ''}
                  onChange={(e) => handleFormChange('customer_phone', e.target.value)}
                  placeholder="הכנס מספר טלפון"
                  className={`bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-500 text-sm sm:text-base ${validationErrors.customer_phone ? 'border-red-500 focus:border-red-500' : ''}`}
                />
              </div>
            </div>
          </div>

          {/* פרטי תשלום */}
          <div className="border-t pt-4 sm:pt-6">
            <div className="flex items-center gap-2 mb-4">
              <DollarSign className="w-5 h-5 text-green-600" />
              <h3 className="text-lg font-bold text-gray-900">פרטי תשלום</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="payment_status" className="text-sm font-semibold text-gray-700">
                  סטטוס תשלום
                </Label>
                <Select
                  value={formData.payment_status || 'לא_שולם'}
                  onValueChange={(value) => handleFormChange('payment_status', value)}
                >
                  <SelectTrigger className="bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-500 text-sm sm:text-base">
                    <SelectValue placeholder="בחר סטטוס תשלום" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="לא_שולם">לא שולם</SelectItem>
                    <SelectItem value="שולם">שולם</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* הערות */}
          <div className="space-y-2">
            <Label htmlFor="delivery_notes" className="text-sm font-semibold text-gray-700">
              הערות למשימה
            </Label>
            <Textarea
              id="delivery_notes"
              value={formData.delivery_notes || ''}
              onChange={(e) => handleFormChange('delivery_notes', e.target.value)}
              placeholder="הערות עבור משימת האפייה..."
              className="bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-500 h-24"
            />
          </div>

          {/* פריטי המשימה */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Package className="w-5 h-5 text-purple-600" />
                פריטי המשימה
              </h3>
            </div>

            <div className="space-y-3">
              {(formData.items || []).map((item, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="md:col-span-2">
                    <Label htmlFor={`product_name_${index}`} className="text-xs font-medium text-gray-700 mb-1 block">שם המוצר</Label>
                    <Input
                      id={`product_name_${index}`}
                      placeholder="שם המוצר"
                      value={item.product_name || ''}
                      onChange={(e) => updateItem(index, 'product_name', e.target.value)}
                      className="border-gray-200 text-sm"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`quantity_${index}`} className="text-xs font-medium text-gray-700 mb-1 block">כמות</Label>
                    <Input
                      id={`quantity_${index}`}
                      type="number"
                      placeholder="כמות"
                      min="1"
                      value={item.quantity || ''}
                      onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                      className="border-gray-200 text-sm"
                    />
                  </div>
                  <div className="flex items-end gap-2">
                    <div className="flex-grow">
                      <Label htmlFor={`total_${index}`} className="text-xs font-medium text-gray-700 mb-1 block">סה״כ</Label>
                      <Input
                        id={`total_${index}`}
                        type="number"
                        placeholder="מחיר"
                        step="0.01"
                        value={item.total || ''}
                        onChange={(e) => updateItem(index, 'total', parseFloat(e.target.value) || 0)}
                        className="border-gray-200 font-bold text-green-600 text-sm"
                      />
                    </div>
                    {formData.items.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(index)}
                        className="text-red-600 hover:text-red-800 hover:bg-red-50 p-1"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={addItem}
                className="w-full bg-blue-50 border-blue-200 hover:bg-blue-100 text-blue-700"
              >
                <Plus className="w-4 h-4 ml-2" />
                הוסף פריט
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center p-4 sm:p-6 bg-gray-50 rounded-xl gap-2">
              <span className="text-base sm:text-lg font-semibold text-gray-700">סכום כולל:</span>
              <span className="text-xl sm:text-2xl font-bold text-green-600">
                ₪{calculateTotal().toFixed(2)}
              </span>
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-4 p-4 sm:p-6 border-t border-gray-100">
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={isProcessing}
          className="w-full sm:w-auto px-6 py-3 text-gray-700 border-gray-300 hover:bg-gray-50"
        >
          ביטול <XCircle className="w-4 h-4 mr-2" />
        </Button>
        <Button
          type="submit"
          onClick={handleSubmit}
          disabled={isProcessing}
          className="w-full sm:w-auto bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 px-8 py-3 elegant-shadow"
        >
          יצור משימת אפייה <Save className="w-4 h-4 mr-2" />
        </Button>
      </CardFooter>
    </Card>
  );
}