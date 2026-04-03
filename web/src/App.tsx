import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppProvider, useApp } from "@/contexts/AppContext";
import { DashboardLayout } from "@/components/DashboardLayout";
import LoginPage from "@/pages/LoginPage";
import SecretsPage from "@/pages/SecretsPage";
import AddSecretPage from "@/pages/AddSecretPage";
import ExportPage from "@/pages/ExportPage";
import ImportPage from "@/pages/ImportPage";
import EnvironmentsPage from "@/pages/EnvironmentsPage";
import RunCommandPage from "@/pages/RunCommandPage";
import SettingsPage from "@/pages/SettingsPage";
import RecoveryPage from "@/pages/RecoveryPage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

function AppRoutes() {
  const { isLoggedIn, needsRecovery } = useApp();

  if (!isLoggedIn) return <LoginPage />;

  // Show recovery page if vaults need recovery
  if (needsRecovery) return <RecoveryPage />;

  return (
    <Routes>
      <Route path="/" element={<DashboardLayout />}>
        <Route path="/" element={<SecretsPage />} />
        <Route path="/add" element={<AddSecretPage />} />
        <Route path="/edit" element={<AddSecretPage />} />
        <Route path="/export" element={<ExportPage />} />
        <Route path="/import" element={<ImportPage />} />
        <Route path="/environments" element={<EnvironmentsPage />} />
        <Route path="/run" element={<RunCommandPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner />
      <AppProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AppProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
