import { cn } from "@/lib/utils";
import { REQUEST_STATUSES, PRIORITY_CONFIGS } from "@/types";

interface StatusBadgeProps {
  status: string;
  type?: "status" | "priority";
  className?: string;
}

export function StatusBadge({ status, type = "status", className }: StatusBadgeProps) {
  const config = type === "status" ? REQUEST_STATUSES[status] : PRIORITY_CONFIGS[status];
  if (!config) return null;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium",
        config.bgColor,
        config.color,
        className
      )}
    >
      {config.label}
    </span>
  );
}
