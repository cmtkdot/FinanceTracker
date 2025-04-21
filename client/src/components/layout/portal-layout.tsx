import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  Home, 
  CreditCard, 
  User,
  LogOut,
  Bell
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

interface PortalLayoutProps {
  children: ReactNode;
  userName: string;
  onLogout: () => void;
}

export function PortalLayout({ children, userName, onLogout }: PortalLayoutProps) {
  const [currentLocation] = useLocation();

  const navItems = [
    { href: "/portal", label: "Dashboard", icon: Home },
    { href: "/portal/invoices", label: "Invoices", icon: FileText },
    { href: "/portal/estimates", label: "Estimates", icon: FileText },
    { href: "/portal/payments", label: "Payments", icon: CreditCard },
    { href: "/portal/profile", label: "Profile", icon: User },
  ];
  
  // Extract initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Portal Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/portal">
              <a className="text-xl font-bold text-primary">Client Portal</a>
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="hidden sm:flex">
              <Bell className="h-5 w-5" />
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{getInitials(userName)}</AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:inline-block">{userName}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
      
      <div className="container mx-auto px-4 py-8">
        {/* Navigation Tabs */}
        <div className="pb-4 mb-6 border-b border-gray-200 dark:border-gray-700">
          <nav className="flex overflow-x-auto">
            {navItems.map((item, i) => {
              const isActive = currentLocation === item.href || 
                (item.href !== "/portal" && currentLocation.startsWith(item.href));
              const Icon = item.icon;
              
              return (
                <Link key={i} href={item.href}>
                  <a 
                    className={`
                      flex items-center px-4 py-2 mr-4 border-b-2 whitespace-nowrap
                      ${isActive 
                        ? "border-primary text-primary font-medium" 
                        : "border-transparent text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
                      }
                    `}
                  >
                    <Icon className="mr-2 h-5 w-5" />
                    {item.label}
                  </a>
                </Link>
              );
            })}
          </nav>
        </div>
        
        {/* Main Content */}
        <div>
          {children}
        </div>
      </div>
      
      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-6 mt-auto">
        <div className="container mx-auto px-4">
          <div className="text-center text-sm text-gray-500 dark:text-gray-400">
            <p>© 2025 Financial Manager. All rights reserved.</p>
            <p className="mt-1">Need help? Contact our support team at support@financialmanager.com</p>
          </div>
        </div>
      </footer>
    </div>
  );
}