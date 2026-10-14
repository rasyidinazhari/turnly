"use client";

import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

export function Toaster() {
  const { toasts, dismiss } = useToast();

  if (!toasts.length) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            "pointer-events-auto flex items-start justify-between rounded-lg border p-4 shadow-lg backdrop-blur bg-background/95 transition-all animate-in slide-in-from-bottom-2",
            t.variant === "destructive"
              ? "border-destructive text-destructive bg-destructive/10"
              : "border-border text-foreground"
          )}
        >
          <div className="grid gap-1">
            {t.title && <div className="text-sm font-semibold">{t.title}</div>}
            {t.description && (
              <div className="text-xs text-muted-foreground">{t.description}</div>
            )}
          </div>
          <button
            onClick={() => dismiss(t.id)}
            className="ml-4 rounded-md p-1 opacity-70 hover:opacity-100 transition-opacity"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
