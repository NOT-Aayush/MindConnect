import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import DoctorsPage from "./pages/Doctors";
import AppointmentsPage from "./pages/Appointments";
import FreeListenersPage from "./pages/FreeListeners";
import AICounselorPage, { AICounselorWithWidget } from "./pages/AICounselor";
import AddDoctorPage from "./pages/AddDoctor";
import PaymentPage from "./pages/Payment";
import MentalOptionPage from "./pages/MentalOption";
import DoctorDetail from "./pages/DoctorDetail";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import SignInManager from "./components/SignInManager";
import ErrorBoundary from "./components/ErrorBoundary";
import { AuthProvider } from "./context/AuthContext";
import LoginPage from "./pages/Login";
import RegisterPage from "./pages/Register";
import ProfilePage from "./pages/Profile";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ErrorBoundary>
            <AuthProvider>
              <Navbar />
              <SignInManager />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/doctors" element={<DoctorsPage />} />
                <Route path="/appointments" element={<AppointmentsPage />} />
                <Route path="/free-listeners" element={<FreeListenersPage />} />
                <Route path="/ai-counselor" element={<AICounselorWithWidget />} />
                <Route path="/add-doctor" element={<AddDoctorPage />} />
                <Route path="/doctors/:id" element={<DoctorDetail />} />
                <Route path="/payment" element={<PaymentPage />} />
                <Route path="/mental/:slug" element={<MentalOptionPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
              <Footer />
            </AuthProvider>
          </ErrorBoundary>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
