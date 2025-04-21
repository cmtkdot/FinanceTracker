import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { 
  LayoutDashboard, 
  CreditCard, 
  FileText, 
  ShoppingCart, 
  FileDown, 
  FileUp, 
  BarChart3, 
  Users, 
  Settings, 
  Menu, 
  X, 
  LogOut 
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export function DashboardLayout({ children, title }: DashboardLayoutProps) {
  const [location] = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const navItems = [
    { 
      icon: <LayoutDashboard className="w-5 h-5 mr-3" />, 
      name: 'Dashboard', 
      path: '/dashboard' 
    },
    { 
      icon: <Users className="w-5 h-5 mr-3" />, 
      name: 'Accounts', 
      path: '/accounts' 
    },
    { 
      icon: <ShoppingCart className="w-5 h-5 mr-3" />, 
      name: 'Products', 
      path: '/products' 
    },
    { 
      icon: <FileDown className="w-5 h-5 mr-3" />, 
      name: 'Estimates', 
      path: '/estimates' 
    },
    { 
      icon: <FileText className="w-5 h-5 mr-3" />, 
      name: 'Invoices', 
      path: '/invoices' 
    },
    { 
      icon: <FileUp className="w-5 h-5 mr-3" />, 
      name: 'Purchase Orders', 
      path: '/purchase-orders' 
    },
    { 
      icon: <CreditCard className="w-5 h-5 mr-3" />, 
      name: 'Payments', 
      path: '/payments' 
    },
    { 
      icon: <BarChart3 className="w-5 h-5 mr-3" />, 
      name: 'Reports', 
      path: '/reports' 
    },
    { 
      icon: <Settings className="w-5 h-5 mr-3" />, 
      name: 'Settings', 
      path: '/settings' 
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Mobile sidebar backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <div 
        className={`fixed top-0 left-0 h-full w-64 bg-white dark:bg-gray-800 shadow-lg z-50 transition-transform transform lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:static lg:z-0`}
      >
        <div className="p-4 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
          <Link href="/dashboard">
            <a className="text-xl font-bold text-primary flex items-center">
              <CreditCard className="w-6 h-6 mr-2" />
              FinTrack
            </a>
          </Link>
          <button 
            className="lg:hidden text-gray-600 dark:text-gray-300" 
            onClick={toggleSidebar}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <nav className="p-4">
          <ul className="space-y-2">
            {navItems.map((item, index) => (
              <li key={index}>
                <Link href={item.path}>
                  <a 
                    className={`flex items-center p-2 rounded-md w-full ${
                      location === item.path
                        ? 'bg-primary text-white font-medium'
                        : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                    onClick={() => setIsSidebarOpen(false)}
                  >
                    {item.icon}
                    {item.name}
                  </a>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700">
          <Link href="/logout">
            <a className="flex items-center justify-center p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md w-full">
              <LogOut className="w-5 h-5 mr-3" />
              Logout
            </a>
          </Link>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="px-4 py-3 flex justify-between items-center">
            <div className="flex items-center">
              <button
                className="lg:hidden text-gray-600 dark:text-gray-300 mr-2"
                onClick={toggleSidebar}
              >
                <Menu className="w-6 h-6" />
              </button>
              {title && (
                <h1 className="text-xl font-semibold text-gray-800 dark:text-white">{title}</h1>
              )}
            </div>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <img
                  src="https://ui-avatars.com/api/?name=Admin+User&background=4f46e5&color=fff"
                  alt="Admin User"
                  className="w-8 h-8 rounded-full"
                />
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-4 md:p-6 bg-gray-50 dark:bg-gray-900">
          {children}
        </main>
      </div>
    </div>
  );
}