import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RecentActivity as RecentActivityType } from "@shared/types";
import { FileText, DollarSign, Package, ShoppingCart, ArrowRight } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { Link } from "wouter";

interface RecentActivityProps {
  activities: RecentActivityType[];
}

export function RecentActivity({ activities }: RecentActivityProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'invoice':
        return <FileText className="h-4 w-4 text-blue-500" />;
      case 'payment':
        return <DollarSign className="h-4 w-4 text-green-500" />;
      case 'inventory':
        return <Package className="h-4 w-4 text-yellow-500" />;
      case 'purchase_order':
        return <ShoppingCart className="h-4 w-4 text-red-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const getBgColor = (type: string) => {
    switch (type) {
      case 'invoice':
        return 'bg-blue-100 dark:bg-blue-900/30';
      case 'payment':
        return 'bg-green-100 dark:bg-green-900/30';
      case 'inventory':
        return 'bg-yellow-100 dark:bg-yellow-900/30';
      case 'purchase_order':
        return 'bg-red-100 dark:bg-red-900/30';
      default:
        return 'bg-gray-100 dark:bg-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex">
            <div className="flex-shrink-0 w-10">
              <div className={`flex items-center justify-center h-8 w-8 rounded-full ${getBgColor(activity.type)}`}>
                {getIcon(activity.type)}
              </div>
            </div>
            <div className="flex-1 ml-3">
              <p className="text-sm text-gray-900 dark:text-white font-medium">{activity.message}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{activity.subText}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                {formatTimestamp(activity.timestamp)}
              </p>
            </div>
          </div>
        ))}
      </CardContent>
      <CardFooter className="pt-0">
        <Link href="/reports">
          <Button variant="link" size="sm" className="w-full">
            View all activity <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}

function formatTimestamp(timestamp: Date): string {
  const now = new Date();
  const date = new Date(timestamp);
  
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.round(diffMs / 60000);
  
  if (diffMins < 1) {
    return 'just now';
  } else if (diffMins < 60) {
    return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  } else if (diffMins < 24 * 60) {
    const hours = Math.floor(diffMins / 60);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else {
    return formatDate(date);
  }
}
