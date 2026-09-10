import { AlertCircle, CheckCircle2 } from "lucide-react";
import type { ReactNode } from "react";

type FormMessageType = "error" | "success";

const STYLES: Record<FormMessageType, string> = {
  error: "border-accent/30 bg-accent/10 text-accent",
  success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-500",
};

const ICONS: Record<FormMessageType, typeof AlertCircle> = {
  error: AlertCircle,
  success: CheckCircle2,
};

// Inline feedback box below a form field
export function FormMessage({
  type,
  children,
}: {
  type: FormMessageType;
  children: ReactNode;
}) {
  const Icon = ICONS[type];
  return (
    <p
      aria-live="polite"
      className={`flex items-start gap-2 rounded-lg border px-3 py-2 text-sm ${STYLES[type]}`}
    >
      <Icon size={16} className="mt-0.5 shrink-0" />
      {children}
    </p>
  );
}
