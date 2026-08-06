"use client"

import { Dialog } from "@base-ui/react/dialog"
import { AlertTriangle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  loading?: boolean
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  onConfirm,
  loading = false,
}: ConfirmDialogProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-in fade-in-0" />
        <Dialog.Popup className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-3xl glass-panel border border-border shadow-2xl p-6 sm:p-7 outline-none animate-in fade-in-0 zoom-in-95 animate-out fade-out-0 zoom-out-95">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-6 h-6 text-red-500 dark:text-red-400" />
            </div>
            <div className="space-y-1.5 min-w-0">
              <Dialog.Title className="text-lg font-bold text-foreground">{title}</Dialog.Title>
              <Dialog.Description className="text-sm text-muted-foreground leading-relaxed">
                {description}
              </Dialog.Description>
            </div>
          </div>

          <div className="mt-6 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5">
            <Dialog.Close
              render={
                <Button variant="outline" disabled={loading}>
                  {cancelLabel}
                </Button>
              }
            />
            <Button
              variant="destructive"
              onClick={onConfirm}
              disabled={loading}
              className="bg-red-600 hover:bg-red-500 text-white border-0"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Deleting…
                </span>
              ) : (
                confirmLabel
              )}
            </Button>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
