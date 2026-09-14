import React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  showCloseButton?: boolean;
}

export function BottomSheet({
  isOpen,
  onClose,
  title,
  description,
  children,
  className,
  showCloseButton = true,
}: BottomSheetProps) {
  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          className={cn(
            "fixed inset-x-0 bottom-0 z-50 flex max-h-[88vh] flex-col rounded-t-3xl border-t border-slate-200 bg-white p-5 shadow-2xl transition ease-out pb-safe data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom focus:outline-none",
            className
          )}
        >
          {/* Grab Handle Bar */}
          <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-slate-300/80 shrink-0" />

          {/* Header */}
          {(title || showCloseButton) && (
            <div className="flex items-center justify-between mb-3 shrink-0">
              <div>
                {title && (
                  <DialogPrimitive.Title className="font-heading font-bold text-base text-slate-900 leading-snug">
                    {title}
                  </DialogPrimitive.Title>
                )}
                {description && (
                  <DialogPrimitive.Description className="text-xs text-slate-500 mt-0.5">
                    {description}
                  </DialogPrimitive.Description>
                )}
              </div>

              {showCloseButton && (
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-full p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 touch-target-44 flex items-center justify-center -mr-2 transition-colors cursor-pointer"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
          )}

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar">
            {children}
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
