import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { CustomerPayment, VendorPayment } from "@shared/schema";
import { formatCurrency, formatDate, getStatusColor } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Eye, Edit, MoreHorizontal, Plus, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Payment = CustomerPayment | VendorPayment;

export default function Payments() {
  const { toast } = useToast();
  const [customerPayments, setCustomerPayments] = useState<CustomerPayment[]>([]);
  const [vendorPayments, setVendorPayments] = useState<VendorPayment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("customer");
  const [paymentType, setPaymentType] = useState<'customer' | 'vendor'>('customer');

  const fetchPayments = async () => {
    try {
      setIsLoading(true);
      const [customerResponse, vendorResponse] = await Promise.all([
        apiRequest("GET", "/api/payments/customer"),
        apiRequest("GET", "/api/payments/vendor")
      ]);
      
      const customerData = await customerResponse.json();
      const vendorData = await vendorResponse.json();
      
      setCustomerPayments(customerData);
      setVendorPayments(vendorData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load payments. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleCreateClick = (type: 'customer' | 'vendor') => {
    setPaymentType(type);
    setModalOpen(true);
  };

  const customerColumns: ColumnDef<CustomerPayment>[] = [
    {
      accessorKey: "account",
      header: "Customer",
      cell: ({ row }) => {
        const accountName = row.original.account?.name || "Unknown Customer";
        return <div>{accountName}</div>;
      },
    },
    {
      accessorKey: "invoice",
      header: "Invoice #",
      cell: ({ row }) => {
        const invoiceUid = row.original.invoice?.invoiceUid || "N/A";
        return <div className="font-medium">{invoiceUid}</div>;
      },
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) => formatCurrency(row.getValue("amount")),
    },
    {
      accessorKey: "paymentDate",
      header: "Payment Date",
      cell: ({ row }) => formatDate(row.getValue("paymentDate")),
    },
    {
      accessorKey: "paymentMethod",
      header: "Method",
      cell: ({ row }) => {
        const method = row.getValue("paymentMethod") as string || "N/A";
        return <div>{method}</div>;
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return (
          <Badge variant="outline" className={getStatusColor(status)}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const payment = row.original;
        
        return (
          <div className="text-right">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem>
                  <Eye className="mr-2 h-4 w-4" />
                  View
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  const vendorColumns: ColumnDef<VendorPayment>[] = [
    {
      accessorKey: "account",
      header: "Vendor",
      cell: ({ row }) => {
        const accountName = row.original.account?.name || "Unknown Vendor";
        return <div>{accountName}</div>;
      },
    },
    {
      accessorKey: "purchaseOrder",
      header: "PO #",
      cell: ({ row }) => {
        const poUid = row.original.purchaseOrder?.poUid || "N/A";
        return <div className="font-medium">{poUid}</div>;
      },
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) => formatCurrency(row.getValue("amount")),
    },
    {
      accessorKey: "paymentDate",
      header: "Payment Date",
      cell: ({ row }) => formatDate(row.getValue("paymentDate")),
    },
    {
      accessorKey: "paymentMethod",
      header: "Method",
      cell: ({ row }) => {
        const method = row.getValue("paymentMethod") as string || "N/A";
        return <div>{method}</div>;
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const payment = row.original;
        
        return (
          <div className="text-right">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem>
                  <Eye className="mr-2 h-4 w-4" />
                  View
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  return (
    <DashboardLayout title="Payments">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">Payments</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage payments received from customers and made to vendors</p>
        </div>
        
        <div className="flex space-x-2">
          <Button onClick={() => handleCreateClick('customer')}>
            <ArrowDown className="mr-2 h-4 w-4" />
            New Customer Payment
          </Button>
          <Button variant="outline" onClick={() => handleCreateClick('vendor')}>
            <ArrowUp className="mr-2 h-4 w-4" />
            New Vendor Payment
          </Button>
        </div>
      </div>

      <Tabs defaultValue="customer" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="customer">Customer Payments</TabsTrigger>
          <TabsTrigger value="vendor">Vendor Payments</TabsTrigger>
        </TabsList>

        <TabsContent value="customer" className="mt-0">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <DataTable 
              columns={customerColumns} 
              data={customerPayments}
              searchColumn="account.name"
              searchPlaceholder="Search customer payments..."
            />
          )}
        </TabsContent>
        
        <TabsContent value="vendor" className="mt-0">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <DataTable 
              columns={vendorColumns} 
              data={vendorPayments}
              searchColumn="account.name"
              searchPlaceholder="Search vendor payments..."
            />
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-4xl">
          <div className="p-6 text-center text-gray-500">
            <h3 className="text-lg font-medium mb-4">
              Create {paymentType === 'customer' ? 'Customer' : 'Vendor'} Payment
            </h3>
            <p>Payment form would be implemented here</p>
            <Button 
              className="mt-4"
              onClick={() => setModalOpen(false)}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}