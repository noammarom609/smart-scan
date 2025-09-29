import React, { useState } from 'react';
import { Supplier } from '@/api/entities';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { PlusCircle } from 'lucide-react';

export default function AddSupplierDialog({ open, onOpenChange, onSupplierAdded }) {
  const [newSupplierName, setNewSupplierName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleAddSupplier = async () => {
    if (!newSupplierName.trim()) {
      toast.error("שם הספק לא יכול להיות ריק");
      return;
    }
    setIsSaving(true);
    try {
      // Check if supplier already exists (case-insensitive)
      const existingSuppliers = await Supplier.list();
      const supplierExists = existingSuppliers.some(s => s.name.toLowerCase() === newSupplierName.trim().toLowerCase());

      if (supplierExists) {
        toast.error("ספק עם שם זה כבר קיים");
        return;
      }

      await Supplier.create({ name: newSupplierName.trim() });
      toast.success("הספק נוסף בהצלחה!");
      onSupplierAdded(newSupplierName.trim()); // Callback to parent
      setNewSupplierName(''); // Reset field
      onOpenChange(false); // Close dialog
    } catch (error) {
      console.error("Error adding supplier:", error);
      toast.error("שגיאה בהוספת הספק");
    } finally {
      setIsSaving(false);
    }
  };
  
  // Handle Enter key press
  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      handleAddSupplier();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-right flex items-center gap-2">
            <PlusCircle className="w-6 h-6 text-blue-600" />
            הוספת ספק חדש
          </DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <Label htmlFor="supplier-name" className="text-right">
            שם הספק
          </Label>
          <Input
            id="supplier-name"
            value={newSupplierName}
            onChange={(e) => setNewSupplierName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="הקלד את שם הספק החדש"
            className="mt-2"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            ביטול
          </Button>
          <Button onClick={handleAddSupplier} disabled={isSaving}>
            {isSaving ? 'שומר...' : 'הוסף ספק'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}