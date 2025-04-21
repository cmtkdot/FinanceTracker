import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate, getStatusColor } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { InvoiceWithDetails } from "@shared/types";

interface RecentInvoicesProps {
  invoices: InvoiceWithDetails[];
}

export function RecentInvoices({ invoices }: RecentInvoicesProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Recent Invoices</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 dark:bg-gray-800/50">
                <TableHead className="py-3 font-medium">Invoice #</TableHead>
                <TableHead className="py-3 font-medium">Client</TableHead>
                <TableHead className="py-3 font-medium">Amount</TableHead>
                <TableHead className="py-3 font-medium">Status</TableHead>
                <TableHead className="py-3 font-medium">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow key={invoice.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <TableCell className="font-medium">{invoice.invoiceUid}</TableCell>
                  <TableCell>{invoice.account.name}</TableCell>
                  <TableCell>{formatCurrency(invoice.totalAmount)}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={getStatusColor(invoice.paymentStatus)}
                    >
                      {capitalize(invoice.paymentStatus)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-500 dark:text-gray-400">{formatDate(invoice.issueDate)}</TableCell>
                </TableRow>
              ))}
              
              {invoices.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-gray-500 dark:text-gray-400">
                    No invoices found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      <CardFooter className="border-t border-gray-200 dark:border-gray-700 py-3">
        <Link href="/invoices">
          <Button variant="link" size="sm" className="w-full">
            View all invoices <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
