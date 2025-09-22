import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, Navigate, useNavigate } from "react-router-dom";
import { CookiesProvider, useCookies } from "react-cookie";
import ScrollToTopButton from "@/components/ScrollToTopButton";
import Index from "./pages/Index";
import OfficeBooking from "./pages/OfficeBooking";
import MeetingRooms from "./pages/MeetingRooms";
import Cart from "./pages/Cart";
import Coworking from "./pages/Coworking";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Spaces from "./pages/Spaces";
import SpaceDetails from "./pages/SpaceDetails";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";
import { useEffect } from "react";

const queryClient = new QueryClient();

// Helper function to decode JWT
const decodeJWT = (token: string) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window.atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
};

// ProtectedRoute component to restrict access
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const [cookies] = useCookies(['access_token']);
  const accessToken = cookies.access_token;
  const navigate = useNavigate();
  const location = useLocation();

  // Re-check auth state on route change
  useEffect(() => {
    console.log(accessToken)
    if (!accessToken) {
      navigate("/login", { replace: true });
      return;
    }

    const decodedToken = decodeJWT(accessToken);
    if (!decodedToken || !decodedToken.user_type) {
      navigate("/login", { replace: true });
      return;
    }

    if (decodedToken.user_type !== 'admin') {
      navigate("/", { replace: true });
    }
  }, [accessToken, navigate, location.pathname]); // Re-run on route or token change

  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }

  const decodedToken = decodeJWT(accessToken);
  if (!decodedToken || !decodedToken.user_type) {
    return <Navigate to="/login" replace />;
  }

  if (decodedToken.user_type !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
};

const AppContent = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <>
      <Routes key={location.pathname}>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/officebooking" element={<OfficeBooking />} />
        <Route path="/meetingrooms" element={<MeetingRooms />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/coworking" element={<Coworking />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/spaces" element={<Spaces />} />
        <Route path="/spaces/:id" element={<SpaceDetails />} />
        {/* <Route path="/booking" element={<BookingPage />} /> */}
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      {!isAdminRoute && <ScrollToTopButton />}
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <CookiesProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </CookiesProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;