import { useLayoutEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGetSettings } from "@/lib/api-client-react-tenant";
import { KILO_LOGO_SRC, KILO_SIDEBAR_LOGO_CLASS } from "@/lib/brand-assets";
import { useNavItems, type NavItem } from "@/hooks/use-nav-items";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const SIDEBAR_STORAGE_KEY = "kilo-sidebar-expanded";

function loadSidebarExpanded(): boolean {
  try {
    const saved = localStorage.getItem(SIDEBAR_STORAGE_KEY);
    if (saved === null) return false;
    return saved === "true";
  } catch {
    return false;
  }
}

const SIDEBAR_LOGO_BLOCK_PX = 64;
const SIDEBAR_FOOTER_BLOCK_PX = 44;
const SIDEBAR_VIEWPORT_OFFSET_PX = 24;

const SIDEBAR_NAV_BASE_BTN = 38;
const SIDEBAR_NAV_MAX_ICON = 17;
const SIDEBAR_NAV_BASE_GAP = 6;
const SIDEBAR_NAV_MAX_GAP = 14;
const SIDEBAR_NAV_MIN_BTN = 26;
const SIDEBAR_NAV_MIN_ICON = 12;
const SIDEBAR_NAV_MIN_GAP = 2;

interface SidebarNavMetrics {
  btnSize: number;
  iconSize: number;
  gap: number;
  logoGap: number;
  footerGap: number;
  needsScroll: boolean;
  sidebarHeightPx: number;
  fillsViewport: boolean;
}

function navBlockHeight(itemCount: number, btnSize: number, gap: number): number {
  if (itemCount === 0) return 0;
  return itemCount * btnSize + Math.max(0, itemCount - 1) * gap;
}

function metricsFromBtnGap(
  btnSize: number,
  gap: number,
  logoGap: number,
  footerGap: number,
  needsScroll: boolean,
  sidebarHeightPx: number,
  fillsViewport: boolean,
): SidebarNavMetrics {
  const ratio = Math.min(1, btnSize / SIDEBAR_NAV_BASE_BTN);
  return {
    btnSize,
    iconSize: Math.max(SIDEBAR_NAV_MIN_ICON, Math.round(SIDEBAR_NAV_MAX_ICON * ratio)),
    gap,
    logoGap,
    footerGap,
    needsScroll,
    sidebarHeightPx,
    fillsViewport,
  };
}

function gapsForFewItems(
  itemCount: number,
  maxNavHeight: number,
): { itemGap: number; logoGap: number; footerGap: number } {
  const spare = maxNavHeight - itemCount * SIDEBAR_NAV_BASE_BTN;
  const distributed = Math.floor(spare / (itemCount + 1));
  const gap = Math.max(SIDEBAR_NAV_BASE_GAP, Math.min(SIDEBAR_NAV_MAX_GAP, distributed));
  return {
    itemGap: itemCount > 1 ? gap : 0,
    logoGap: gap,
    footerGap: gap,
  };
}

function computeSidebarNavLayout(itemCount: number, maxSidebarHeightPx: number): SidebarNavMetrics {
  const maxNavHeight = Math.max(
    0,
    maxSidebarHeightPx - SIDEBAR_LOGO_BLOCK_PX - SIDEBAR_FOOTER_BLOCK_PX,
  );

  if (itemCount === 0) {
    return metricsFromBtnGap(
      SIDEBAR_NAV_BASE_BTN,
      SIDEBAR_NAV_BASE_GAP,
      0,
      0,
      false,
      maxSidebarHeightPx,
      true,
    );
  }

  const shrinkToFit = (btnCap: number, gapCap: number): SidebarNavMetrics => {
    let gap = gapCap;
    let btnSize = btnCap;
    let navHeight = navBlockHeight(itemCount, btnSize, gap);

    if (navHeight > maxNavHeight) {
      gap = SIDEBAR_NAV_MIN_GAP;
      navHeight = navBlockHeight(itemCount, btnSize, gap);
    }

    if (navHeight > maxNavHeight) {
      btnSize = Math.max(
        SIDEBAR_NAV_MIN_BTN,
        Math.min(btnCap, Math.floor((maxNavHeight - Math.max(0, itemCount - 1) * gap) / itemCount)),
      );
      navHeight = navBlockHeight(itemCount, btnSize, gap);
    }

    const fillsViewport = navHeight >= maxNavHeight;
    const sidebarHeightPx = fillsViewport
      ? maxSidebarHeightPx
      : SIDEBAR_LOGO_BLOCK_PX + navHeight + SIDEBAR_FOOTER_BLOCK_PX;

    return metricsFromBtnGap(
      btnSize,
      gap,
      0,
      0,
      navHeight > maxNavHeight,
      sidebarHeightPx,
      fillsViewport,
    );
  };

  const comfortableNavHeight =
    SIDEBAR_NAV_BASE_GAP +
    navBlockHeight(itemCount, SIDEBAR_NAV_BASE_BTN, SIDEBAR_NAV_BASE_GAP) +
    SIDEBAR_NAV_BASE_GAP;

  if (comfortableNavHeight <= maxNavHeight) {
    const { itemGap, logoGap, footerGap } = gapsForFewItems(itemCount, maxNavHeight);
    const navHeight = navBlockHeight(itemCount, SIDEBAR_NAV_BASE_BTN, itemGap);
    const sidebarHeightPx =
      SIDEBAR_LOGO_BLOCK_PX + logoGap + navHeight + footerGap + SIDEBAR_FOOTER_BLOCK_PX;
    return metricsFromBtnGap(
      SIDEBAR_NAV_BASE_BTN,
      itemGap,
      logoGap,
      footerGap,
      false,
      sidebarHeightPx,
      false,
    );
  }

  return shrinkToFit(SIDEBAR_NAV_BASE_BTN, SIDEBAR_NAV_BASE_GAP);
}

function useSidebarNavMetrics(itemCount: number) {
  const [maxSidebarHeightPx, setMaxSidebarHeightPx] = useState(() =>
    typeof window === "undefined"
      ? 640
      : window.innerHeight - SIDEBAR_VIEWPORT_OFFSET_PX,
  );
  const [metrics, setMetrics] = useState<SidebarNavMetrics>(() =>
    computeSidebarNavLayout(itemCount, maxSidebarHeightPx),
  );

  useLayoutEffect(() => {
    const syncViewport = () => {
      setMaxSidebarHeightPx(window.innerHeight - SIDEBAR_VIEWPORT_OFFSET_PX);
    };
    syncViewport();
    window.addEventListener("resize", syncViewport);
    return () => window.removeEventListener("resize", syncViewport);
  }, []);

  useLayoutEffect(() => {
    setMetrics(computeSidebarNavLayout(itemCount, maxSidebarHeightPx));
  }, [itemCount, maxSidebarHeightPx]);

  return { metrics };
}

interface SidebarNavLinkProps {
  item: NavItem;
  expanded: boolean;
  active: boolean;
  navMetrics: SidebarNavMetrics;
}

function SidebarNavLink({ item, expanded, active, navMetrics }: SidebarNavLinkProps) {
  const link = (
    <Link
      href={item.href}
      className={cn(
        "relative flex items-center rounded-lg transition-all duration-200",
        expanded ? "w-full gap-2 px-2" : "justify-center mx-auto",
        active
          ? "bg-gray-900 text-white shadow-md"
          : "text-gray-600 hover:bg-black/5 hover:text-gray-600",
      )}
      style={{
        width: expanded ? undefined : navMetrics.btnSize,
        height: navMetrics.btnSize,
      }}
    >
      <item.icon
        className="shrink-0"
        style={{
          width: navMetrics.iconSize,
          height: navMetrics.iconSize,
        }}
      />
      {expanded && (
        <span className="flex-1 min-w-0 text-xs font-medium leading-normal overflow-x-hidden text-ellipsis whitespace-nowrap">
          {item.label}
        </span>
      )}
    </Link>
  );

  if (expanded) return link;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{link}</TooltipTrigger>
      <TooltipContent
        side="left"
        className="font-medium text-xs bg-gray-800 text-white border-0 rounded-lg px-3 py-1.5 shadow-lg"
      >
        {item.label}
      </TooltipContent>
    </Tooltip>
  );
}

export function AppSidebar() {
  const [location] = useLocation();
  const navItems = useNavItems();
  const { data: settings } = useGetSettings();
  const [sidebarExpanded, setSidebarExpanded] = useState(() => loadSidebarExpanded());
  const { metrics: navMetrics } = useSidebarNavMetrics(navItems.length);
  const isRTL = true;

  const toggleSidebarExpanded = () => {
    setSidebarExpanded((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(SIDEBAR_STORAGE_KEY, String(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  const isActive = (href: string) =>
    location === href || (href !== "/" && location.startsWith(href));

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "flex-col hidden md:flex sticky top-3 bg-white border border-black/5 rounded-3xl shrink-0 z-30 ms-3 overflow-hidden transition-[width] duration-200 shadow-sm",
          sidebarExpanded ? "w-44" : "w-20",
        )}
        style={{
          height: navMetrics.sidebarHeightPx,
          maxHeight: `calc(100vh - ${SIDEBAR_VIEWPORT_OFFSET_PX}px)`,
        }}
      >
        <div className="h-16 flex items-center justify-center shrink-0 pb-0 px-2">
          <Link href="/" className="block mx-auto" aria-label={settings?.businessName ?? "كيلو"}>
            <img
              src={settings?.logoUrl ?? KILO_LOGO_SRC}
              alt={settings?.businessName ?? "كيلو"}
              className={KILO_SIDEBAR_LOGO_CLASS}
            />
          </Link>
        </div>

        <nav
          className={cn(
            "pt-0 pb-0 px-2",
            navMetrics.logoGap > 0 ? undefined : "-mt-2",
            navMetrics.fillsViewport ? "flex-1 min-h-0" : "shrink-0",
            navMetrics.needsScroll ? "overflow-y-auto scrollbar-hidden" : "overflow-hidden",
          )}
          style={{
            marginTop: navMetrics.logoGap > 0 ? navMetrics.logoGap : undefined,
          }}
        >
          <div className="flex flex-col" style={{ gap: navMetrics.gap }}>
            {navItems.map((item) => (
              <SidebarNavLink
                key={item.href}
                item={item}
                expanded={sidebarExpanded}
                active={isActive(item.href)}
                navMetrics={navMetrics}
              />
            ))}
          </div>
        </nav>

        <div
          className={cn(
            "shrink-0 pb-2 px-2 flex",
            navMetrics.footerGap > 0 ? undefined : "-mt-1",
            sidebarExpanded ? "justify-stretch" : "justify-center",
          )}
          style={{
            marginTop: navMetrics.footerGap > 0 ? navMetrics.footerGap : undefined,
          }}
        >
          <button
            type="button"
            onClick={toggleSidebarExpanded}
            aria-label={sidebarExpanded ? "طي القائمة" : "توسيع القائمة"}
            title={sidebarExpanded ? "طي القائمة" : "توسيع القائمة"}
            className={cn(
              "flex items-center h-8 rounded-lg text-gray-300 hover:text-gray-400 hover:bg-black/5 transition-colors duration-200",
              sidebarExpanded ? "w-full px-3" : "w-11 justify-center",
              sidebarExpanded && (isRTL ? "justify-start" : "justify-end"),
            )}
          >
            {sidebarExpanded
              ? isRTL
                ? <ChevronRight className="h-4 w-4" />
                : <ChevronLeft className="h-4 w-4" />
              : isRTL
                ? <ChevronLeft className="h-4 w-4" />
                : <ChevronRight className="h-4 w-4" />}
          </button>
        </div>
      </aside>
    </TooltipProvider>
  );
}
