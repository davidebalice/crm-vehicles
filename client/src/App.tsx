import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import AdminsPage from "@/pages/admins";
import ApiDocsEN from "@/pages/api-docs/en";
import ApiDocsIT from "@/pages/api-docs/it";
import AppointmentsPage from "@/pages/appointments/index";
import AuthPage from "@/pages/auth-page";
import CalendarPage from "@/pages/calendar-page";
import CustomerDetailsPage from "@/pages/customers/details";
import CustomersPage from "@/pages/customers/index";
import DashboardPage from "@/pages/dashboard";
import FinancingPage from "@/pages/finance/financing";
import FinancePage from "@/pages/finance/index";
import ScheduledTransactionsPage from "@/pages/finance/scheduled-transactions";
import NotFound from "@/pages/not-found";
import PartsPage from "@/pages/parts/index";
import NewPartPage from "@/pages/parts/new";
import RemindersPage from "@/pages/reminders";
import ReportsPage from "@/pages/reports/index";
import SalesPage from "@/pages/sales/index";
import NewSalePage from "@/pages/sales/new";
import ServicesPage from "@/pages/services/index";
import SettingsPage from "@/pages/settings";
import VehicleCatalogSettingsPage from "@/pages/vehicles/catalog-settings";
import VehicleDetailsPage from "@/pages/vehicles/details";
import VehiclesPage from "@/pages/vehicles/index";
import VehicleManagePage from "@/pages/vehicles/manage";
import VehiclePhotoPage from "@/pages/vehicles/photo";
import { Route, Switch } from "wouter";

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={() => <DashboardPage />} />
      <ProtectedRoute path="/vehicles" component={() => <VehiclesPage />} />
      <ProtectedRoute
        path="/vehicles/details/:id"
        component={() => <VehicleDetailsPage />}
      />
      <ProtectedRoute
        path="/vehicles/manage"
        component={() => <VehicleManagePage />}
      />
      <ProtectedRoute
        path="/vehicles/photo/:id"
        component={() => <VehiclePhotoPage />}
      />
      <ProtectedRoute
        path="/vehicles/manage/:id"
        component={() => <VehicleManagePage />}
      />
      <ProtectedRoute
        path="/vehicles/catalog-settings"
        component={() => <VehicleCatalogSettingsPage />}
      />
      <ProtectedRoute path="/customers" component={() => <CustomersPage />} />
      <ProtectedRoute
        path="/customers/:id"
        component={() => <CustomerDetailsPage />}
      />
      <ProtectedRoute path="/services" component={() => <ServicesPage />} />
      <ProtectedRoute path="/sales" component={() => <SalesPage />} />
      <ProtectedRoute path="/sales/new" component={() => <NewSalePage />} />
      <ProtectedRoute
        path="/appointments"
        component={() => <AppointmentsPage />}
      />
      <ProtectedRoute path="/reminders" component={() => <RemindersPage />} />
      <ProtectedRoute path="/calendar" component={() => <CalendarPage />} />
      <ProtectedRoute path="/finance" component={() => <FinancePage />} />
      <ProtectedRoute
        path="/finance/scheduled-transactions"
        component={() => <ScheduledTransactionsPage />}
      />
      <ProtectedRoute
        path="/finance/financing"
        component={() => <FinancingPage />}
      />
      <ProtectedRoute path="/reports" component={() => <ReportsPage />} />
      <ProtectedRoute path="/parts" component={() => <PartsPage />} />
      <ProtectedRoute path="/parts/new" component={() => <NewPartPage />} />
      <ProtectedRoute path="/admins" component={() => <AdminsPage />} />
      <ProtectedRoute path="/settings" component={() => <SettingsPage />} />
      <ProtectedRoute path="/api-docs/it" component={() => <ApiDocsIT />} />
      <ProtectedRoute path="/api-docs/en" component={() => <ApiDocsEN />} />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
