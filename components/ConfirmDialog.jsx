import React, { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function ConfirmDialog({
  isOpen = false,
  title = 'אישור',
  body = 'האם אתה בטוח?',
  confirmText = 'אישור',
  cancelText = 'ביטול',
  onConfirm = () => {},
  onCancel = () => {},
  confirmButtonDisabled = false,
  confirmButtonVariant = 'default', // 'default' | 'destructive'
  icon = null, // Custom icon component
  className = ''
}) {
  const confirmButtonRef = useRef(null);
  const cancelButtonRef = useRef(null);

  // Focus management
  useEffect(() => {
    if (isOpen) {
      // Focus the cancel button by default for safety
      setTimeout(() => {
        cancelButtonRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Keyboard handling
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (!isOpen) return;

      switch (event.key) {
        case 'Escape':
          event.preventDefault();
          onCancel();
          break;
        case 'Enter':
          // Allow Enter to submit if confirm button is focused
          if (document.activeElement === confirmButtonRef.current && !confirmButtonDisabled) {
            event.preventDefault();
            onConfirm();
          }
          break;
        case 'Tab':
          // Trap focus within dialog
          const focusableElements = [cancelButtonRef.current, confirmButtonRef.current].filter(Boolean);
          const firstElement = focusableElements[0];
          const lastElement = focusableElements[focusableElements.length - 1];

          if (event.shiftKey) {
            if (document.activeElement === firstElement) {
              event.preventDefault();
              lastElement?.focus();
            }
          } else {
            if (document.activeElement === lastElement) {
              event.preventDefault();
              firstElement?.focus();
            }
          }
          break;
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onCancel, onConfirm, confirmButtonDisabled]);

  const DefaultIcon = confirmButtonVariant === 'destructive' ? AlertTriangle : null;
  const IconComponent = icon || DefaultIcon;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent 
        className={`sm:max-w-md ${className}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        aria-describedby="dialog-description"
      >
        <DialogHeader>
          <DialogTitle id="dialog-title" className="flex items-center gap-3 text-lg">
            {IconComponent && (
              <IconComponent 
                className={`w-5 h-5 ${
                  confirmButtonVariant === 'destructive' ? 'text-red-500' : 'text-blue-500'
                }`} 
              />
            )}
            {title}
          </DialogTitle>
          {body && (
            <DialogDescription id="dialog-description" className="text-gray-600">
              {body}
            </DialogDescription>
          )}
        </DialogHeader>
        
        <DialogFooter className="gap-2 sm:gap-3">
          <Button
            ref={cancelButtonRef}
            variant="outline"
            onClick={onCancel}
            className="flex-1 sm:flex-none"
          >
            {cancelText}
          </Button>
          <Button
            ref={confirmButtonRef}
            variant={confirmButtonVariant}
            onClick={onConfirm}
            disabled={confirmButtonDisabled}
            className="flex-1 sm:flex-none"
          >
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}