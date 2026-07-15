import { Skeleton } from "@/components/ui/skeleton";

interface GlassStatCardProps {
  icon: React.ElementType;
  iconBg?: string;
  iconBgStyle?: React.CSSProperties;
  title: string;
  value: string | number;
  subtitle: string;
}

export function GlassStatCard({
  icon: Icon,
  iconBg,
  iconBgStyle,
  title,
  value,
  subtitle,
}: GlassStatCardProps) {
  return (
    <div className="relative rounded-3xl pt-7">
      <div
        className={`absolute top-7 start-4 z-10 flex h-14 w-14 -translate-y-1/2 items-center justify-center rounded-2xl shadow-lg ${iconBgStyle ? "" : (iconBg ?? "")}`}
        style={iconBgStyle}
      >
        <Icon className="h-7 w-7 text-white" />
      </div>
      <div className="glass-card rounded-3xl px-5 pb-5 pt-10">
        <p className="mb-2 text-start text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </p>
        <p className="text-start text-3xl font-bold leading-tight text-foreground">{value}</p>
        <p className="mt-1.5 text-start text-xs text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  );
}

export function GlassStatCardSkeleton() {
  return (
    <div className="relative rounded-3xl pt-7">
      <Skeleton className="absolute top-7 start-4 z-10 h-14 w-14 -translate-y-1/2 rounded-2xl" />
      <div className="glass-card rounded-3xl px-5 pb-5 pt-10">
        <Skeleton className="mb-2 h-3 w-24" />
        <Skeleton className="mb-2 h-9 w-16" />
        <Skeleton className="h-3 w-32" />
      </div>
    </div>
  );
}
