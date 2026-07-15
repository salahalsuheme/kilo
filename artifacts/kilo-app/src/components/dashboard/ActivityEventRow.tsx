import { format } from "date-fns";
import { arSA } from "date-fns/locale";
import type { ActivityEvent } from "@/lib/api-client-react-tenant";

interface ActivityEventRowProps {
  event: ActivityEvent;
  compact?: boolean;
}

export function ActivityEventRow({ event, compact = false }: ActivityEventRowProps) {
  return (
    <li
      className={
        compact
          ? "flex items-start justify-between gap-3 rounded-lg bg-white/40 px-3 py-2"
          : "flex items-start justify-between gap-4 rounded-xl border border-border/60 bg-white/50 px-4 py-3"
      }
    >
      <div className="min-w-0">
        <p className={`font-medium text-foreground ${compact ? "text-xs" : "text-sm"}`}>
          {event.message}
        </p>
        <p className={`text-muted-foreground ${compact ? "text-[10px]" : "text-xs"}`}>
          {event.kind}
        </p>
      </div>
      <time
        className={`shrink-0 text-muted-foreground ${compact ? "text-[10px]" : "text-xs"}`}
        dir="ltr"
      >
        {format(new Date(event.createdAt), compact ? "dd MMM HH:mm" : "dd MMM yyyy HH:mm", {
          locale: arSA,
        })}
      </time>
    </li>
  );
}
