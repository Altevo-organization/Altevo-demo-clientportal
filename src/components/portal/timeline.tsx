import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface TimelineEvent {
  id: string;
  icon?: React.ReactNode;
  title: string;
  description?: string;
  timestamp: Date;
  actor?: string;
}

interface TimelineProps {
  events: TimelineEvent[];
  className?: string;
}

export function Timeline({ events, className }: TimelineProps) {
  return (
    <div className={cn("space-y-0", className)}>
      {events.map((event, index) => (
        <div key={event.id} className="relative flex gap-4 pb-8 last:pb-0">
          {/* Line */}
          {index < events.length - 1 && (
            <div className="absolute left-[15px] top-8 h-full w-px bg-border" />
          )}
          {/* Dot/Icon */}
          <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full border bg-background">
            {event.icon || (
              <div className="h-2 w-2 rounded-full bg-muted-foreground" />
            )}
          </div>
          {/* Content */}
          <div className="flex-1 pt-0.5">
            <p className="text-sm font-medium">{event.title}</p>
            {event.description && (
              <p className="mt-0.5 text-sm text-muted-foreground">{event.description}</p>
            )}
            <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
              <time>{format(event.timestamp, "d MMM yyyy à HH:mm", { locale: fr })}</time>
              {event.actor && (
                <>
                  <span>·</span>
                  <span>{event.actor}</span>
                </>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
