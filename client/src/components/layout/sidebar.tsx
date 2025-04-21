import { cn } from "@/lib/utils";
import { Link, useLocation } from "wouter";
import { 
  ChevronLeft, 
  LayoutDashboard, 
  Users, 
  FileText, 
  ClipboardList, 
  ShoppingCart, 
  DollarSign,
  Package,
  PieChart,
  Settings,
  LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface SidebarProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function Sidebar({ collapsed = false, onToggleCollapse }: SidebarProps) {
  const [_, setLocation] = useLocation();
  const [location] = useLocation();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await apiRequest("POST", "/api/auth/logout");
      setLocation("/login");
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account.",
      });
    } catch (error) {
      toast({
        title: "Logout failed",
        description: "There was an error logging out. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <aside 
      className={cn(
        "bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col h-screen fixed transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <div className={cn("flex items-center", collapsed && "justify-center w-full")}>
          {!collapsed && (
            <div className="flex items-center space-x-2">
              <span className="font-bold text-gray-900 dark:text-white">FinventoryPro</span>
              <span className="text-xs text-blue-500 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">ADMIN</span>
            </div>
          )}
          {collapsed && (
            <div className="flex-shrink-0 flex items-center justify-center">
              <span className="font-bold text-xl text-gray-900 dark:text-white">F</span>
            </div>
          )}
        </div>
        <Button 
          onClick={onToggleCollapse} 
          variant="ghost" 
          size="sm" 
          className="text-gray-500 dark:text-gray-400 p-1"
        >
          <ChevronLeft className={cn("h-5 w-5", collapsed && "rotate-180")} />
        </Button>
      </div>

      <div className="py-2 flex-1 overflow-y-auto">
        <p className={cn("px-4 py-2 text-xs uppercase font-semibold text-gray-400 dark:text-gray-500", collapsed && "text-center")}>
          {!collapsed ? "Main" : ""}
        </p>
        
        <NavItem 
          href="/dashboard" 
          icon={<LayoutDashboard className="h-5 w-5" />}
          label="Dashboard"
          collapsed={collapsed}
          active={location === "/dashboard" || location === "/"}
        />
        
        <NavItem 
          href="/accounts" 
          icon={<Users className="h-5 w-5" />}
          label="Accounts"
          collapsed={collapsed}
          active={location === "/accounts"}
        />
        
        <p className={cn("mt-4 px-4 py-2 text-xs uppercase font-semibold text-gray-400 dark:text-gray-500", collapsed && "text-center")}>
          {!collapsed ? "Finances" : ""}
        </p>
        
        <NavItem 
          href="/invoices" 
          icon={<FileText className="h-5 w-5" />}
          label="Invoices"
          collapsed={collapsed}
          active={location === "/invoices"}
        />
        
        <NavItem 
          href="/estimates" 
          icon={<ClipboardList className="h-5 w-5" />}
          label="Estimates"
          collapsed={collapsed}
          active={location === "/estimates"}
        />
        
        <NavItem 
          href="/purchase-orders" 
          icon={<ShoppingCart className="h-5 w-5" />}
          label="Purchase Orders"
          collapsed={collapsed}
          active={location === "/purchase-orders"}
        />
        
        <NavItem 
          href="/payments" 
          icon={<DollarSign className="h-5 w-5" />}
          label="Payments"
          collapsed={collapsed}
          active={location === "/payments"}
        />
        
        <p className={cn("mt-4 px-4 py-2 text-xs uppercase font-semibold text-gray-400 dark:text-gray-500", collapsed && "text-center")}>
          {!collapsed ? "Inventory" : ""}
        </p>
        
        <NavItem 
          href="/products" 
          icon={<Package className="h-5 w-5" />}
          label="Products"
          collapsed={collapsed}
          active={location === "/products"}
        />
        
        <p className={cn("mt-4 px-4 py-2 text-xs uppercase font-semibold text-gray-400 dark:text-gray-500", collapsed && "text-center")}>
          {!collapsed ? "Reporting" : ""}
        </p>
        
        <NavItem 
          href="/reports" 
          icon={<PieChart className="h-5 w-5" />}
          label="Reports"
          collapsed={collapsed}
          active={location === "/reports"}
        />
        
        <p className={cn("mt-4 px-4 py-2 text-xs uppercase font-semibold text-gray-400 dark:text-gray-500", collapsed && "text-center")}>
          {!collapsed ? "System" : ""}
        </p>
        
        <NavItem 
          href="/settings" 
          icon={<Settings className="h-5 w-5" />}
          label="Settings"
          collapsed={collapsed}
          active={location === "/settings"}
        />
      </div>

      <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 mr-3">
            <span className="text-sm font-medium">A</span>
          </div>
          {!collapsed && (
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Administrator</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">admin@finventorypro.com</p>
            </div>
          )}
          <Button 
            onClick={handleLogout}
            variant="ghost" 
            size="sm" 
            className={cn("ml-auto p-1.5 text-gray-500 dark:text-gray-400", collapsed && "mx-auto")}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </aside>
  );
}

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  collapsed: boolean;
  active: boolean;
}

function NavItem({ href, icon, label, collapsed, active }: NavItemProps) {
  return (
    <Link href={href}>
      <a
        className={cn(
          "flex items-center px-4 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700",
          active && "bg-gray-100 dark:bg-gray-700 text-blue-600 dark:text-blue-400 border-r-4 border-blue-500",
          collapsed && "justify-center"
        )}
      >
        <span className="w-5 text-center mr-2">{icon}</span>
        {!collapsed && <span>{label}</span>}
      </a>
    </Link>
  );
}
