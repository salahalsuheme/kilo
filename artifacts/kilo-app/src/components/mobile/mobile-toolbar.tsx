import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function MobileToolbar({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex w-full flex-col gap-3 md:flex-row md:flex-wrap md:items-center md:gap-2",
        className,
      )}
    >
      {children}
    </div>
  );
}

export const mobileToolbarBtnClass = "w-full md:w-auto";

export const mobileToolbarSearchWrapClass = "w-full md:max-w-xs";

export const mobileToolbarSelectClass = "w-full md:w-[11rem]";

export const mobileToolbarFilterClass = "w-full md:w-40";

export const mobileToolbarCountClass =
  "text-sm text-muted-foreground tabular-nums md:ms-auto md:shrink-0 md:whitespace-nowrap";

export const mobileToolbarRowClass = "mobile-toolbar-row";

/** Tab-attached panel: flat top-start corner on desktop where tabs connect. */
export const mobileTabPanelClass =
  "rounded-xl border border-gray-300 p-4 md:rounded-ss-none md:rounded-se-xl md:rounded-b-xl";

/** Standalone list panel (no tabs): rounded corners on all sides. */
export const mobileListPanelClass = "rounded-xl border border-gray-300 p-4";
