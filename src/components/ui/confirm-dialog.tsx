"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Dialog } from "@/src/components/ui/dialog";

export function ConfirmDialog({ open, onOpenChange, onConfirm, title = "Confirm action", description = "Are you sure you want to continue?", confirmLabel = "Confirm" }: { open: boolean; onOpenChange: (open: boolean) => void; onConfirm: () => void; title?: string; description?: string; confirmLabel?: string }) {
  return <Dialog open={open} onOpenChange={onOpenChange} title={title} description={description} footer={<><Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button><Button variant="danger" onClick={onConfirm}>{confirmLabel}</Button></>}><div className="flex gap-3 rounded-xl bg-red-50 p-4 text-red-900"><AlertTriangle className="h-5 w-5 shrink-0 text-red-600" /><p className="text-sm leading-6">This action cannot be undone.</p></div></Dialog>;
}
