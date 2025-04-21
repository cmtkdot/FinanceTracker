import React from 'react';
import { formatDate, formatCurrency, getStatusColor } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Activity {
  type: string;
  date: Date;
  description: string;
  amount?: number;
  status?: string;
}

interface RecentActivityProps {
  activities: Activity[];
}

export function RecentActivity({ activities }: RecentActivityProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-5">
          {activities && activities.length > 0 ? (
            activities.map((activity, index) => (
              <div key={index} className="flex items-start">
                <div className={`w-2 h-2 rounded-full mt-2 mr-3 ${getActivityTypeColor(activity.type)}`} />
                <div className="flex-1">
                  <div className="flex justify-between">
                    <p className="font-medium">{activity.type}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(activity.date, 'MMM dd')}
                    </p>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{activity.description}</p>
                  <div className="flex justify-between items-center">
                    {activity.amount && (
                      <p className="font-medium">{formatCurrency(activity.amount)}</p>
                    )}
                    {activity.status && (
                      <Badge className={`${getStatusColor(activity.status)} text-xs`}>
                        {activity.status}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">No recent activity</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function getActivityTypeColor(type: string): string {
  const lowerType = type.toLowerCase();
  
  switch (lowerType) {
    case 'invoice':
    case 'payment received':
      return 'bg-blue-500';
    case 'purchase':
    case 'payment sent':
      return 'bg-green-500';
    case 'expense':
      return 'bg-red-500';
    case 'estimate':
      return 'bg-purple-500';
    case 'credit':
      return 'bg-amber-500';
    default:
      return 'bg-gray-500';
  }
}