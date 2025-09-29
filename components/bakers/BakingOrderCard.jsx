import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ChefHat, CalendarDays, Package, User, Hash, Save, CheckCircle, Clock, MapPin, Undo2, Archive, MessageSquare, Plus, X, ChevronDown, ChevronUp } from "lucide-react";
import { format, parseISO } from "date-fns";
import { he } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function BakingOrderCard({ 
  order, 
  expandedItems,
  onArchiveOrder,
  onSaveProgress,
  markBakingOrderAsCompleted,
  updateItemBakingStatus,
  openNotesDialog,
  closeNotesDialog,
  saveNotes,
  editingNotes,
  isDialogOpen,
  isSaving,
  setEditingNotes,
  setIsDialogOpen
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Helper functions מועברות מדף Bakers הראשי
  const getBakingStatusBadge = (status) => {
    const statusConfig = {
      "לא_התחיל": { color: "bg-yellow-100 text-yellow-800", text: "ממתין לאפייה", icon: Clock },
      "בתהליך": { color: "bg-blue-100 text-blue-800", text: "בתהליך אפייה", icon: ChefHat },
      "ממתין": { color: "bg-yellow-100 text-yellow-800", text: "ממתין", icon: Clock },
      "הוכן": { color: "bg-green-100 text-green-800", text: "הוכן", icon: CheckCircle },
      "הושלם": { color: "bg-gray-100 text-gray-800", text: "הושלם", icon: CheckCircle },
    };

    const config = statusConfig[status] || { color: "bg-gray-100 text-gray-800", text: status, icon: Clock };
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        {Icon && <Icon className="w-3 h-3" />}
        {config.text}
      </Badge>
    );
  };

  const getShippingMethod = (order) => {
    if (order.shipping_method_chosen === 'איסוף_עצמי') return 'איסוף עצמי';
    if (order.courier_company) return order.courier_company;
    return 'משלוח';
  };

  const shouldShowPickupTime = (order) => {
    return order.shipping_method_chosen === "איסוף_עצמי" &&
           (order.pickup_preferred_date || order.pickup_preferred_time) &&
           order.items?.some(item => item.baking_status !== "הוכן");
  };

  const getPickupTimeDisplay = (order) => {
    const safeFormatDate = (dateString) => {
      if (!dateString || dateString === 'ללא תאריך') return "ללא תאריך";
      try {
        const date = parseISO(dateString);
        return format(date, "EEEE, dd/MM/yyyy", { locale: he });
      } catch (e) {
        return "תאריך לא תקין";
      }
    };

    const date = order.pickup_preferred_date ? safeFormatDate(order.pickup_preferred_date) : null;
    const time = order.pickup_preferred_time || null;

    if (date && time) {
      const formattedDate = date.startsWith('יום ') ? date.substring(4) : date;
      return `${formattedDate} - ${time}`;
    } else if (date) {
      return date;
    } else if (time) {
      return time;
    }
    return null;
  };

  return (
    <div className="border rounded-lg p-4 bg-gray-50">
      {/* Header - ניתן ללחיצה */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2 text-right hover:bg-gray-100 p-2 rounded-lg transition-colors"
      >
        <div className="flex-1">
          <h4 className="font-bold text-lg flex items-center gap-2">
            <User className="w-5 h-5 text-gray-600" />
            {order.customer_name}
          </h4>
          <p className="text-gray-600 text-sm flex items-center gap-1">
            <Hash className="w-3 h-3" />
            הזמנה מקורית: {order.order_number ? order.order_number.replace('BAKE-', '') : order.original_order_id}
          </p>
          <p className="text-sm text-gray-500 flex items-center gap-1">
            <Package className="w-3 h-3" />
            {getShippingMethod(order)}
          </p>
          {shouldShowPickupTime(order) && getPickupTimeDisplay(order) && (
            <p className="text-sm text-orange-600 font-medium flex items-center gap-1 mt-1">
              <Clock className="w-3 h-3" />
              זמן איסוף מתוכנן: {getPickupTimeDisplay(order)}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {getBakingStatusBadge(order.picking_status)}
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </button>

      {/* Content - מוצג רק כשפתוח */}
      {isExpanded && (
        <div className="mt-4 space-y-4 border-t pt-4">
          {/* כפתור ארכיון */}
          <div className="flex justify-between items-center">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                >
                  <Archive className="w-4 h-4 ml-2" />
                  העבר לארכיון
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="mx-2 max-w-md">
                <AlertDialogHeader>
                  <AlertDialogTitle>העברה לארכיון</AlertDialogTitle>
                  <AlertDialogDescription>
                    האם אתה בטוח שברצונך להעביר לארכיון את הזמנת האפייה של {order.customer_name}?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>ביטול</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onArchiveOrder(order.id)}>
                    העבר לארכיון
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          {/* טבלת פריטים */}
          <div className="overflow-x-auto">
            <TooltipProvider>
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="text-right font-semibold">מוצר</TableHead>
                    <TableHead className="text-right font-semibold">מיקום במחסן</TableHead>
                    <TableHead className="text-center font-semibold">כמות</TableHead>
                    <TableHead className="text-center font-semibold">סטטוס אפייה</TableHead>
                    <TableHead className="text-center font-semibold">הערות לאופה</TableHead>
                    <TableHead className="text-center font-semibold">פעולות</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expandedItems.map((item, itemDisplayIndex) => {
                    const actualItemIndex = order.items.findIndex(originalItem => 
                      originalItem.product_name === item._original_item_id
                    );
                    const key = `${order.id}-${actualItemIndex}`;

                    return (
                      <TableRow
                        key={`${order.id}-${item.product_name}-${item.location}-${itemDisplayIndex}`}
                        className="hover:bg-gray-50"
                      >
                        <TableCell className="font-medium max-w-xs">
                          <div className="break-words">
                            {item.product_name}
                            {item._expanded_from_breakdown && (
                              <div className="text-xs text-blue-600 mt-1">
                                (פירוט: {item.location})
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {item.location ? (
                              <Badge
                                variant="outline"
                                className="text-xs bg-blue-50 border-blue-200 text-blue-800"
                              >
                                <MapPin className="w-3 h-3 ml-1" />
                                {item.location}
                              </Badge>
                            ) : (
                              <span className="text-gray-400 text-xs italic">לא צוין מיקום</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className="bg-purple-100 text-purple-800">
                            {item.quantity || 1}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          {getBakingStatusBadge(item.baking_status)}
                        </TableCell>
                        <TableCell className="text-center">
                          {/* תא הערות לאופה */}
                          {item.notes_for_baker && item.notes_for_baker.trim() ? (
                            <div className="flex items-center justify-center">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div>
                                      <Dialog 
                                        open={isDialogOpen[key] || false}
                                        onOpenChange={(open) => {
                                          if (!open) {
                                            closeNotesDialog(order.id, actualItemIndex);
                                          }
                                        }}
                                      >
                                        <DialogTrigger asChild>
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-blue-600 hover:bg-blue-100"
                                            onClick={() => openNotesDialog(order.id, actualItemIndex, item.notes_for_baker)}
                                          >
                                            <MessageSquare className="w-4 h-4" />
                                          </Button>
                                        </DialogTrigger>
                                        <DialogContent className="max-w-md">
                                          <DialogHeader>
                                            <DialogTitle className="flex items-center gap-2 text-blue-800">
                                              <ChefHat className="w-5 h-5" />
                                              הערות לאופה - {item.product_name}
                                            </DialogTitle>
                                            <DialogDescription>
                                              ערוך את ההערות המיוחדות עבור מוצר זה
                                            </DialogDescription>
                                          </DialogHeader>
                                          
                                          <div className="space-y-4 py-4">
                                            <div>
                                              <Label htmlFor={`notes-${key}`} className="text-sm font-medium text-gray-700">
                                                הערות:
                                              </Label>
                                              <Textarea
                                                id={`notes-${key}`}
                                                value={editingNotes[key] || ''}
                                                onChange={(e) => setEditingNotes(prev => ({
                                                  ...prev,
                                                  [key]: e.target.value
                                                }))}
                                                placeholder="הכנס הערות מיוחדות לאופה..."
                                                className="mt-2 min-h-24 bg-yellow-50 border-yellow-200 focus:border-yellow-400"
                                                dir="rtl"
                                              />
                                            </div>
                                          </div>
                                          
                                          <div className="flex justify-end gap-2 pt-4 border-t">
                                            <Button
                                              variant="outline"
                                              onClick={() => closeNotesDialog(order.id, actualItemIndex)}
                                              disabled={isSaving[key]}
                                            >
                                              <X className="w-4 h-4 ml-2" />
                                              ביטול
                                            </Button>
                                            <Button
                                              onClick={() => saveNotes(order.id, actualItemIndex)}
                                              disabled={isSaving[key]}
                                              className="bg-blue-600 hover:bg-blue-700"
                                            >
                                              {isSaving[key] ? (
                                                <>
                                                  <div className="w-4 h-4 ml-2 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                                  שומר...
                                                </>
                                              ) : (
                                                <>
                                                  <Save className="w-4 h-4 ml-2" />
                                                  שמור הערות
                                                </>
                                              )}
                                            </Button>
                                          </div>
                                        </DialogContent>
                                      </Dialog>
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent className="max-w-xs p-3 bg-yellow-100 border border-yellow-200">
                                    <div className="text-sm">
                                      <div className="font-semibold text-yellow-800 mb-1">הערות לאופה:</div>
                                      <div className="text-yellow-700 whitespace-pre-wrap">{item.notes_for_baker}</div>
                                      <div className="text-xs text-yellow-600 mt-2 italic">
                                        לחץ לעריכה
                                      </div>
                                    </div>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          ) : (
                            <Dialog 
                              open={isDialogOpen[key] || false}
                              onOpenChange={(open) => {
                                if (!open) {
                                  closeNotesDialog(order.id, actualItemIndex);
                                }
                              }}
                            >
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-blue-600 border-blue-300 hover:bg-blue-50 hover:border-blue-400 text-xs h-7 px-2"
                                  onClick={() => openNotesDialog(order.id, actualItemIndex, '')}
                                >
                                  <Plus className="w-3 h-3 ml-1" />
                                  הוסף הערה
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-md">
                                <DialogHeader>
                                  <DialogTitle className="flex items-center gap-2 text-blue-800">
                                    <ChefHat className="w-5 h-5" />
                                    הוסף הערות לאופה - {item.product_name}
                                  </DialogTitle>
                                  <DialogDescription>
                                    הוסף הערות מיוחדות עבור מוצר זה
                                  </DialogDescription>
                                </DialogHeader>
                                
                                <div className="space-y-4 py-4">
                                  <div>
                                    <Label htmlFor={`notes-${key}`} className="text-sm font-medium text-gray-700">
                                      הערות:
                                    </Label>
                                    <Textarea
                                      id={`notes-${key}`}
                                      value={editingNotes[key] || ''}
                                      onChange={(e) => setEditingNotes(prev => ({
                                        ...prev,
                                        [key]: e.target.value
                                      }))}
                                      placeholder="הכנס הערות מיוחדות לאופה (כיתוב על עוגה, עיצוב מיוחד, דרישות אלרגיה)..."
                                      className="mt-2 min-h-24 bg-yellow-50 border-yellow-200 focus:border-yellow-400"
                                      dir="rtl"
                                    />
                                  </div>
                                </div>
                                
                                <div className="flex justify-end gap-2 pt-4 border-t">
                                  <Button
                                    variant="outline"
                                    onClick={() => closeNotesDialog(order.id, actualItemIndex)}
                                    disabled={isSaving[key]}
                                  >
                                    <X className="w-4 h-4 ml-2" />
                                    ביטול
                                  </Button>
                                  <Button
                                    onClick={() => saveNotes(order.id, actualItemIndex)}
                                    disabled={isSaving[key]}
                                    className="bg-blue-600 hover:bg-blue-700"
                                  >
                                    {isSaving[key] ? (
                                      <>
                                        <div className="w-4 h-4 ml-2 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                        שומר...
                                      </>
                                    ) : (
                                      <>
                                        <Save className="w-4 h-4 ml-2" />
                                        שמור הערות
                                      </>
                                    )}
                                  </Button>
                                </div>
                              </DialogContent>
                            </Dialog>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex justify-center gap-2">
                            <Button
                              onClick={() => {
                                const originalItemIndex = order.items.findIndex(originalItem => 
                                  originalItem.product_name === item._original_item_id
                                );
                                if (originalItemIndex !== -1) {
                                  const newStatus = item.baking_status === 'הוכן' ? 'ממתין' : 'הוכן';
                                  updateItemBakingStatus(order.id, originalItemIndex, newStatus);
                                }
                              }}
                              className={`text-xs h-8 px-3 ${
                                item.baking_status === 'הוכן'
                                  ? 'bg-red-600 hover:bg-red-700 text-white'
                                  : 'bg-green-600 hover:bg-green-700 text-white'
                              }`}
                              size="sm"
                            >
                              {item.baking_status === 'הוכן' ? (
                                <>
                                  <Undo2 className="w-3 h-3 mr-1" />
                                  בטל סימון
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  סמן כמוכן
                                </>
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TooltipProvider>
          </div>

          {/* כפתורי פעולה */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => onSaveProgress(order)}>
              <Save className="w-4 h-4 ml-2" />
              שמור
            </Button>
            <Button
              onClick={() => markBakingOrderAsCompleted(order)}
              disabled={!order.items || order.items.some(i => i.baking_status !== 'הוכן')}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="w-4 h-4 ml-2" />
              הושלם
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}