import {
  LayoutDashboard,
  Users,
  UserCog,
  Car,
  Receipt,
  Landmark,
  Settings,
  Bell,
  History,
  type LucideIcon,
} from "lucide-react";
import { ContractsIcon } from "@/components/icons/contracts-icon";
import { useAuth } from "@/hooks/use-auth";
import { canAccessPath } from "@workspace/users-domain";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const ALL_NAV_ITEMS: NavItem[] = [
  { href: "/", label: "لوحة التحكم", icon: LayoutDashboard },
  { href: "/customers", label: "العملاء", icon: Users },
  { href: "/vehicles", label: "المركبات", icon: Car },
  { href: "/contracts", label: "العقود", icon: ContractsIcon },
  { href: "/invoices", label: "الفواتير", icon: Receipt },
  { href: "/finance", label: "المالية", icon: Landmark },
  { href: "/notifications", label: "الإشعارات", icon: Bell },
  { href: "/users", label: "المستخدمون", icon: UserCog },
  { href: "/activity-log", label: "سجل الأحداث", icon: History },
  { href: "/settings", label: "الإعدادات", icon: Settings },
];

export function useNavItems(): NavItem[] {
  const { user } = useAuth();
  const role = user?.role ?? "employee";

  return ALL_NAV_ITEMS.filter((item) => canAccessPath(role, item.href));
}
