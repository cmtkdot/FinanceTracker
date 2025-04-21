import { useState, useEffect } from "react";
import { Bell, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/ui/theme-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { apiRequest } from "@/lib/queryClient";
import { Badge } from "@/components/ui/badge";
import { RecentActivity } from "@shared/types";

interface HeaderProps {
  title: string;
}

export function Header({ title }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const [notifications, setNotifications] = useState<RecentActivity[]>([]);
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await apiRequest("GET", "/api/dashboard");
        const data = await response.json();
        setNotifications(data.recentActivity || []);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      }
    };
    
    fetchDashboardData();
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
      <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
        {title}
      </h1>
      <div className="flex items-center space-x-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]"
                >
                  {unreadCount}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="font-medium text-gray-900 dark:text-white">Notifications</h3>
              {unreadCount > 0 && (
                <Badge variant="secondary" className="text-xs py-0.5 px-1.5">
                  {unreadCount} new
                </Badge>
              )}
            </div>
            <div className="max-h-72 overflow-y-auto">
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <DropdownMenuItem key={notification.id} className="p-3 border-b border-gray-100 dark:border-gray-800 cursor-pointer">
                    <div className="flex items-start">
                      <div className={`mt-0.5 mr-2 text-xs ${notification.read ? 'text-gray-400 dark:text-gray-500' : 'text-blue-500 dark:text-blue-400'}`}>
                        <span className="block h-2 w-2 rounded-full bg-current"></span>
                      </div>
                      <div>
                        <p className="text-sm text-gray-900 dark:text-white">{notification.message}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{notification.subText}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                          {new Date(notification.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  </DropdownMenuItem>
                ))
              ) : (
                <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                  No notifications
                </div>
              )}
            </div>
            {notifications.length > 0 && (
              <div className="p-2 text-center">
                <Button variant="link" size="sm" className="text-xs text-blue-500 hover:text-blue-700 dark:hover:text-blue-300">
                  Mark all as read
                </Button>
              </div>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>

        <div className="border-l border-gray-200 dark:border-gray-700 h-6 mx-1"></div>

        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
            <span className="text-sm font-medium">A</span>
          </div>
          <span className="text-sm font-medium text-gray-900 dark:text-white hidden md:inline-block">Admin</span>
        </div>
      </div>
    </header>
  );
}
