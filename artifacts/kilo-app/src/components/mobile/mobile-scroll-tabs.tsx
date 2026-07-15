import { cn } from "@/lib/utils";

export interface MobileScrollTabItem<T extends string = string> {
  id: T;
  label: string;
  badge?: number;
}

interface MobileScrollTabsProps<T extends string = string> {
  tabs: MobileScrollTabItem<T>[];
  activeTab: T;
  onTabChange: (id: T) => void;
  className?: string;
}

export function MobileScrollTabs<T extends string = string>({
  tabs,
  activeTab,
  onTabChange,
  className,
}: MobileScrollTabsProps<T>) {
  return (
    <>
      <div
        className={cn(
          "md:hidden flex gap-2 overflow-x-auto pb-1 scrollbar-hidden -mx-1 px-1",
          className,
        )}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "shrink-0 inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors",
              activeTab === tab.id
                ? "bg-[#FFD100] text-black"
                : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50",
            )}
          >
            {tab.label}
            {tab.badge != null && tab.badge > 0 && (
              <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-black/10 px-1 text-[10px] font-bold">
                {tab.badge > 99 ? "99+" : tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="hidden md:flex items-end">
        <div className="inline-flex flex-wrap overflow-hidden rounded-t-xl border border-b-0 border-gray-300 relative bottom-[-1px] z-10">
          {tabs.map((tab, index) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "px-4 py-2 text-sm font-medium transition-colors inline-flex items-center gap-1.5",
                index > 0 && "border-s border-gray-300",
                activeTab === tab.id
                  ? "bg-gray-100 text-black"
                  : "bg-white text-gray-700 hover:bg-gray-50",
              )}
            >
              {tab.label}
              {tab.badge != null && tab.badge > 0 && (
                <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-500 px-0.5 text-[9px] font-bold text-white">
                  {tab.badge > 99 ? "99+" : tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
