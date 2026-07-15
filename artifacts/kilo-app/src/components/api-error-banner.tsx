import { cn } from "@/lib/utils";

interface ApiErrorBannerProps {
  message?: string | null;
  className?: string;
}

export function ApiErrorBanner({ message, className }: ApiErrorBannerProps) {
  if (!message) return null;

  return (
    <div
      role="alert"
      className={cn(
        "rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive",
        className,
      )}
    >
      {message}
    </div>
  );
}
