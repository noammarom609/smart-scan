
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, XCircle, Camera } from "lucide-react"; // Removed Upload as it's not used
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export default function DeliveryActionsDialog({ 
  order, // Changed from orderId to order object
  isOpen, // New prop - though its direct usage on internal dialogs is omitted as per original structure
  onClose, // New prop for closing parent context
  onDelivered, 
  onNotDelivered 
}) {
  const [isDeliveredOpen, setIsDeliveredOpen] = useState(false);
  const [isNotDeliveredOpen, setIsNotDeliveredOpen] = useState(false);
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [notDeliveryReason, setNotDeliveryReason] = useState(''); // Renamed from nonDeliveryReason
  const [deliveryPhoto, setDeliveryPhoto] = useState(null); // Renamed from photoFile
  const [isLoading, setIsLoading] = useState(false); // Renamed from isUploading

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setDeliveryPhoto(file); // Updated to new state name
    }
  };

  const handleDelivered = async () => { // Renamed function
    if (!deliveryPhoto) { // Updated to new state name
      toast.error("נדרש להעלות תמונת אישור מסירה");
      return;
    }

    setIsLoading(true); // Updated to new state name
    try {
      // Call the parent handler which will handle the archiving. 
      // Assuming onDelivered still expects the file object, not URL yet.
      await onDelivered(order.id, deliveryPhoto, deliveryNotes); // Updated parameters to match new props and state
      
      // Reset form and close dialog
      setDeliveryNotes('');
      setDeliveryPhoto(null); // Updated to new state name
      setNotDeliveryReason(''); // Added reset for the other reason as well
      setIsDeliveredOpen(false); // Close current dialog
      onClose(); // Call the parent's onClose handler
    } catch (error) {
      console.error("Error in delivery submission:", error);
      toast.error("שגיאה בעדכון סטטוס המסירה"); // Added toast error
    } finally {
      setIsLoading(false); // Updated to new state name
    }
  };

  const handleNotDelivered = async () => { // Renamed function
    if (!notDeliveryReason.trim()) { // Updated to new state name
      toast.error("נא להזין סיבה לאי מסירה"); // Updated error message
      return;
    }
    
    setIsLoading(true); // Updated to new state name
    try {
      // Call the parent handler which will handle the archiving
      await onNotDelivered(order.id, notDeliveryReason); // Updated parameters to match new props and state
      
      // Reset form and close dialog
      setDeliveryNotes('');
      setDeliveryPhoto(null); // Added reset for photo as well
      setNotDeliveryReason(''); // Updated to new state name
      setIsNotDeliveredOpen(false); // Close current dialog
      onClose(); // Call the parent's onClose handler
    } catch (error) {
      console.error("Error in not delivered:", error);
      toast.error("שגיאה בעדכון סטטוס אי המסירה"); // Added toast error
    } finally {
      setIsLoading(false); // Updated to new state name
    }
  };

  return (
    <>
      {/* Delivered Dialog */}
      <Dialog open={isDeliveredOpen} onOpenChange={setIsDeliveredOpen}>
        <DialogTrigger asChild>
          <Button className="flex-1 bg-green-600 hover:bg-green-700">
            <CheckCircle className="w-4 h-4 mr-2" />
            נמסר
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>אישור מסירת הזמנה</DialogTitle>
            <DialogDescription>
              אנא העלה תמונת אישור והוסף הערות לפי הצורך
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">תמונת אישור מסירה *</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handlePhotoChange}
                  className="hidden"
                  id="photo-upload"
                />
                <label htmlFor="photo-upload" className="cursor-pointer">
                  <div className="flex flex-col items-center gap-2">
                    {deliveryPhoto ? ( // Updated to new state name
                      <div className="text-green-600">
                        <CheckCircle className="w-8 h-8 mx-auto" />
                        <p className="text-sm">תמונה נבחרה: {deliveryPhoto.name}</p> {/* Updated to new state name */}
                      </div>
                    ) : (
                      <div className="text-gray-500">
                        <Camera className="w-8 h-8 mx-auto" />
                        <p className="text-sm">לחץ לצילום או העלאה</p>
                      </div>
                    )}
                  </div>
                </label>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">הערות מסירה (אופציונלי)</label>
              <Textarea
                value={deliveryNotes}
                onChange={(e) => setDeliveryNotes(e.target.value)}
                placeholder="הערות נוספות על המסירה..."
                rows={3}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsDeliveredOpen(false)}>
              ביטול
            </Button>
            <Button 
              onClick={handleDelivered} // Renamed function
              disabled={isLoading || !deliveryPhoto} // Updated to new state names
              className="bg-green-600 hover:bg-green-700"
            >
              {isLoading ? "מעלה..." : "אשר מסירה"} {/* Updated to new state name */}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Not Delivered Dialog */}
      <Dialog open={isNotDeliveredOpen} onOpenChange={setIsNotDeliveredOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="flex-1 border-red-200 text-red-600 hover:bg-red-50">
            <XCircle className="w-4 h-4 mr-2" />
            לא נמסר
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>סימון הזמנה כלא נמסרה</DialogTitle>
            <DialogDescription>
              אנא ציין את הסיבה לאי-מסירת ההזמנה
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">סיבת אי-מסירה *</label>
              <Textarea
                value={notDeliveryReason} // Updated to new state name
                onChange={(e) => setNotDeliveryReason(e.target.value)} // Updated to new state name
                placeholder="למשל: לקוח לא בבית, כתובת שגויה, סירב לקבל..."
                rows={3}
                className="resize-none"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsNotDeliveredOpen(false)}>
              ביטול
            </Button>
            <Button 
              onClick={handleNotDelivered} // Renamed function
              disabled={isLoading || !notDeliveryReason.trim()} // Updated to new state name
              variant="outline" 
              className="border-red-200 text-red-600 hover:bg-red-50"
            >
              {isLoading ? "מעדכן..." : "אשר אי-מסירה"} {/* Added loading text */}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
