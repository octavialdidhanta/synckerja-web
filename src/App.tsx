import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import AdminLayout from "./admin/components/AdminLayout.tsx";
import ProtectedRoute from "./admin/components/ProtectedRoute.tsx";
import { AuthProvider } from "./admin/context/AuthContext.tsx";
import AdminDashboardPage from "./admin/pages/AdminDashboardPage.tsx";
import AdminIndexPage from "./admin/pages/AdminIndexPage.tsx";
import AdminLoginPage from "./admin/pages/AdminLoginPage.tsx";
import AdminPricingPage from "./admin/pages/AdminPricingPage.tsx";
import WhatsappCentangBiruPage from "./fitur/whatsapp-centang-biru/WhatsappCentangBiruPage.tsx";
import Index from "./home/pages/Index.tsx";
import NotFound from "./home/pages/NotFound.tsx";
import GtmPageView from "./share/analytics/GtmPageView.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
    <BrowserRouter>
      <GtmPageView />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/fitur/whatsapp-centang-biru" element={<WhatsappCentangBiruPage />} />
        <Route path="/admin" element={<AdminIndexPage />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <AdminDashboardPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/pricing"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <AdminPricingPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
