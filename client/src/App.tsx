import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import Invoices from "@/pages/invoices";
import Estimates from "@/pages/estimates";
import PurchaseOrders from "@/pages/purchase-orders";
import Payments from "@/pages/payments";
import Products from "@/pages/products";
import Reports from "@/pages/reports";
import Accounts from "@/pages/accounts";
import PortalLogin from "@/pages/portal/login";
import PortalDashboard from "@/pages/portal/index";
import { useEffect, useState } from "react";
import { apiRequest } from "./lib/queryClient";

function Router() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [location, setLocation] = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await apiRequest("GET", "/api/auth/session");
        const data = await response.json();
        setIsAuthenticated(!!data.user);
      } catch (error) {
        setIsAuthenticated(false);
      }
    };
    
    checkAuth();
  }, []);

  // Loading state while checking authentication
  if (isAuthenticated === null) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated && location !== '/login' && !location.startsWith('/portal')) {
    setLocation('/login');
    return null;
  }

  return (
    <Switch>
      {/* Admin routes */}
      <Route path="/login" component={Login} />
      <Route path="/" component={Dashboard} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/invoices" component={Invoices} />
      <Route path="/estimates" component={Estimates} />
      <Route path="/purchase-orders" component={PurchaseOrders} />
      <Route path="/payments" component={Payments} />
      <Route path="/products" component={Products} />
      <Route path="/reports" component={Reports} />
      <Route path="/accounts" component={Accounts} />
      
      {/* Portal routes */}
      <Route path="/portal/login" component={PortalLogin} />
      <Route path="/portal" component={PortalDashboard} />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
