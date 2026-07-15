import { ReactNode } from "react";
import { Link } from "wouter";
import { LogOut, UserCog } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { AppSidebar } from "@/components/app-sidebar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const initial = user?.name?.charAt(0) ?? "؟";

  return (
    <div className="erp-shell main-gradient min-h-screen font-arabic" dir="rtl">
      <div className="me-auto ltr:me-0 flex min-h-screen w-full max-w-[1600px] gap-6 p-2 md:p-3">
        <AppSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="mb-4 hidden items-center justify-end gap-2 md:flex">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  {user?.photoUrl ? (
                    <img
                      src={user.photoUrl}
                      alt={user.name}
                      className="h-9 w-9 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FFD100] text-sm font-bold text-gray-900">
                      {initial}
                    </div>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href="/my-account" className="flex items-center gap-2">
                    <UserCog className="h-4 w-4" />
                    حسابي
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => void logout()} className="text-destructive">
                  <LogOut className="h-4 w-4" />
                  تسجيل الخروج
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </header>
          <main className="flex-1 pt-0 pb-2 sm:pb-4 ps-4 sm:ps-6 pe-3 sm:pe-6 lg:pe-10">{children}</main>
        </div>
      </div>
    </div>
  );
}
