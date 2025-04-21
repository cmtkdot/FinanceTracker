import React from 'react';
import { formatDate, formatCurrency, getStatusColor } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { Link } from 'wouter';

interface Invoice {
  id: string;
  accountName: string;
  amount: number;
  date: Date;
  dueDate: Date;
  status: string;
}

interface RecentInvoicesProps {
  invoices: Invoice[];
}

export function RecentInvoices({ invoices }: RecentInvoicesProps) {
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>Recent Invoices</CardTitle>
        <Link href="/invoices">
          <Button variant="ghost" className="text-sm text-primary">
            View all <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {invoices && invoices.length > 0 ? (
            invoices.map((invoice) => (
              <div key={invoice.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                <div>
                  <p className="font-medium">{invoice.accountName}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={getStatusColor(invoice.status)}>
                      {invoice.status}
                    </Badge>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Due {formatDate(invoice.dueDate, 'MMM dd')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatCurrency(invoice.amount)}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(invoice.date, 'MMM dd, yyyy')}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">No recent invoices</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}