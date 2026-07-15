import { Route, Switch, Redirect, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { canAccessPath } from "@workspace/users-domain";
import { Layout } from "@/components/layout";
import LoginPage from "@/pages/login";
import DashboardPage from "@/pages/dashboard";
import CustomersPage from "@/pages/customers";
import UsersPage from "@/pages/users";
import VehiclesPage from "@/pages/vehicles";
import ContractsPage from "@/pages/contracts";
import InvoicesPage from "@/pages/invoices";
import FinancePage from "@/pages/finance";
import NotificationsPage from "@/pages/notifications";
import SettingsPage from "@/pages/settings";
import MyAccountPage from "@/pages/my-account";
import ActivityLogPage from "@/pages/activity-log";

function RequireAuth({
  children,
  bare = false,
}: {
  children: React.ReactNode;
  bare?: boolean;
}) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="main-gradient flex min-h-screen items-center justify-center font-arabic">
        <p className="text-muted-foreground">جاري التحميل...</p>
      </div>
    );
  }

  if (!user) return <Redirect to="/login" />;
  if (bare) return <>{children}</>;
  return <Layout>{children}</Layout>;
}

function RequireRoleAccess({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const [location] = useLocation();

  if (isLoading) {
    return (
      <div className="main-gradient flex min-h-screen items-center justify-center font-arabic">
        <p className="text-muted-foreground">جاري التحميل...</p>
      </div>
    );
  }

  if (!user) return <Redirect to="/login" />;
  if (!canAccessPath(user.role, location)) return <Redirect to="/" />;
  return <>{children}</>;
}

function GuestOnly({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return null;
  if (user) return <Redirect to="/" />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Switch>
      <Route path="/login">
        <GuestOnly>
          <LoginPage />
        </GuestOnly>
      </Route>
      <Route path="/">
        <RequireAuth>
          <DashboardPage />
        </RequireAuth>
      </Route>
      <Route path="/customers">
        <RequireAuth>
          <CustomersPage />
        </RequireAuth>
      </Route>
      <Route path="/vehicles">
        <RequireAuth>
          <VehiclesPage />
        </RequireAuth>
      </Route>
      <Route path="/contracts">
        <RequireAuth>
          <ContractsPage />
        </RequireAuth>
      </Route>
      <Route path="/invoices">
        <RequireAuth>
          <InvoicesPage />
        </RequireAuth>
      </Route>
      <Route path="/finance">
        <RequireAuth>
          <RequireRoleAccess>
            <FinancePage />
          </RequireRoleAccess>
        </RequireAuth>
      </Route>
      <Route path="/notifications">
        <RequireAuth>
          <NotificationsPage />
        </RequireAuth>
      </Route>
      <Route path="/users">
        <RequireAuth>
          <RequireRoleAccess>
            <UsersPage />
          </RequireRoleAccess>
        </RequireAuth>
      </Route>
      <Route path="/settings">
        <RequireAuth>
          <RequireRoleAccess>
            <SettingsPage />
          </RequireRoleAccess>
        </RequireAuth>
      </Route>
      <Route path="/my-account">
        <RequireAuth>
          <MyAccountPage />
        </RequireAuth>
      </Route>
      <Route path="/activity-log">
        <RequireAuth>
          <ActivityLogPage />
        </RequireAuth>
      </Route>
      <Route>
        <Redirect to="/" />
      </Route>
    </Switch>
  );
}
