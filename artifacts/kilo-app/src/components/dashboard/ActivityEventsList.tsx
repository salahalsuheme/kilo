import type { ActivityEvent } from "@/lib/api-client-react-tenant";
import { ActivityEventRow } from "@/components/dashboard/ActivityEventRow";

interface ActivityEventsListProps {
  events: ActivityEvent[];
  compact?: boolean;
  emptyMessage?: string;
}

export function ActivityEventsList({
  events,
  compact = false,
  emptyMessage = "لا توجد أحداث بعد",
}: ActivityEventsListProps) {
  if (!events.length) {
    return <p className="text-sm text-muted-foreground">{emptyMessage}</p>;
  }

  return (
    <ul className={compact ? "space-y-2" : "space-y-3"}>
      {events.map((event) => (
        <ActivityEventRow key={event.id} event={event} compact={compact} />
      ))}
    </ul>
  );
}
