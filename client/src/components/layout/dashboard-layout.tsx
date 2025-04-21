import { ReactNode, useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  BarChart, 
  FileText, 
  Home, 
  Settings, 
  ShoppingCart, 
  Package, 
  CreditCard, 
  Users,
  FileBarChart,
  Menu,
  LogOut,
  ChevronLeft,
  Sun,
  Moon
} from "lucide-react";
import { useTheme } from "next-themes";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

interface DashboardLayoutProps {
  children: ReactNode;
  title?: string;
}

export function DashboardLayout({ children, title }: DashboardLayoutProps) {
  const [currentLocation] = useLocation();
  const { theme, setTheme } = useTheme();
  const [isThemeDark, setIsThemeDark] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Check theme on load and on theme change
  useEffect(() => {
    setIsThemeDark(theme === "dark");
  }, [theme]);

  const handleThemeToggle = () => {
    setTheme(isThemeDark ? "light" : "dark");
  };

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: Home },
    { href: "/invoices", label: "Invoices", icon: FileText },
    { href: "/estimates", label: "Estimates", icon: FileText },
    { href: "/purchase-orders", label: "Purchase Orders", icon: ShoppingCart },
    { href: "/payments", label: "Payments", icon: CreditCard },
    { href: "/products", label: "Products", icon: Package },
    { href: "/accounts", label: "Accounts", icon: Users },
    { href: "/reports", label: "Reports", icon: FileBarChart },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm lg:hidden">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <span className="ml-3 text-lg font-semibold">Financial Manager</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleThemeToggle}
            >
              {isThemeDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>John Doe</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
      
      {/* Mobile Sidebar */}
      <div 
        className={`
          fixed inset-0 z-50 lg:hidden bg-black/50 transition-opacity
          ${isMobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"}
        `}
        onClick={() => setIsMobileMenuOpen(false)}
      >
        <div 
          className={`
            fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-gray-800 overflow-y-auto transition-transform
            ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
          `}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-4 border-b flex items-center justify-between">
            <h2 className="font-semibold text-lg">Financial Manager</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </div>
          
          <nav className="p-4 space-y-1">
            {navItems.map((item, i) => {
              const isActive = currentLocation === item.href || 
                (item.href !== "/dashboard" && currentLocation.startsWith(item.href));
              const Icon = item.icon;
              
              return (
                <Link
                  key={i}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <a 
                    className={`
                      flex items-center px-3 py-2 rounded-md text-sm font-medium
                      ${isActive 
                        ? "bg-primary/10 text-primary" 
                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      }
                    `}
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    {item.label}
                  </a>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-64 h-screen sticky top-0 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
          <div className="flex flex-col h-full">
            <div className="p-4 border-b">
              <h1 className="text-xl font-bold">Financial Manager</h1>
            </div>
            
            <nav className="p-4 space-y-1 flex-1">
              {navItems.map((item, i) => {
                const isActive = currentLocation === item.href || 
                  (item.href !== "/dashboard" && currentLocation.startsWith(item.href));
                const Icon = item.icon;
                
                return (
                  <Link key={i} href={item.href}>
                    <a 
                      className={`
                        flex items-center px-3 py-2 rounded-md text-sm font-medium
                        ${isActive 
                          ? "bg-primary/10 text-primary" 
                          : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        }
                      `}
                    >
                      <Icon className="mr-3 h-5 w-5" />
                      {item.label}
                    </a>
                  </Link>
                );
              })}
            </nav>
            
            <div className="p-4 border-t">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="w-full justify-start px-3">
                    <Avatar className="h-8 w-8 mr-2">
                      <AvatarFallback>JD</AvatarFallback>
                    </Avatar>
                    <span>John Doe</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem className="cursor-pointer" onClick={handleThemeToggle}>
                    {isThemeDark ? (
                      <>
                        <Sun className="mr-2 h-4 w-4" />
                        <span>Light Mode</span>
                      </>
                    ) : (
                      <>
                        <Moon className="mr-2 h-4 w-4" />
                        <span>Dark Mode</span>
                      </>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </aside>
        
        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-8">
          {/* Title Bar */}
          <header className="mb-8 hidden lg:block">
            <h1 className="text-2xl font-bold">{title || "Dashboard"}</h1>
          </header>
          
          {/* Page Content */}
          {children}
        </main>
      </div>
    </div>
  );
}