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
import { AuthProvider, useAuth } from "@/hooks/use-auth-provider";

function ProtectedRoute({ component: Component, ...rest }: { component: React.FC; path: string }) {
  const { user, isLoading, checkAuth } = useAuth();
  const [location, setLocation] = useLocation();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const isAuthenticated = await checkAuth();
        setChecked(true);
        
        if (!isAuthenticated && !location.startsWith('/portal') && location !== '/login') {
          setLocation('/login');
        }
      } catch (error) {
        console.error("Authentication check failed:", error);
        setLocation('/login');
      }
    };
    
    verifyAuth();
  }, [location, checkAuth, setLocation]);

  if (isLoading || !checked) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <Component />;
}

function Router() {
  return (
    <Switch>
      {/* Public routes */}
      <Route path="/login" component={Login} />
      
      {/* Protected admin routes */}
      <Route path="/">
        <ProtectedRoute path="/" component={Dashboard} />
      </Route>
      <Route path="/dashboard">
        <ProtectedRoute path="/dashboard" component={Dashboard} />
      </Route>
      <Route path="/invoices">
        <ProtectedRoute path="/invoices" component={Invoices} />
      </Route>
      <Route path="/estimates">
        <ProtectedRoute path="/estimates" component={Estimates} />
      </Route>
      <Route path="/purchase-orders">
        <ProtectedRoute path="/purchase-orders" component={PurchaseOrders} />
      </Route>
      <Route path="/payments">
        <ProtectedRoute path="/payments" component={Payments} />
      </Route>
      <Route path="/products">
        <ProtectedRoute path="/products" component={Products} />
      </Route>
      <Route path="/reports">
        <ProtectedRoute path="/reports" component={Reports} />
      </Route>
      <Route path="/accounts">
        <ProtectedRoute path="/accounts" component={Accounts} />
      </Route>
      
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
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
