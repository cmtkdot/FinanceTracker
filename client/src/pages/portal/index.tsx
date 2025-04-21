import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { LogOut, FileText, CreditCard, Receipt, Clock, DollarSign } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { PortalLayout } from "@/components/layout/portal-layout";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

type AccountInfo = {
  id: string;
  name: string;
  email: string;
  phone: string;
  customerBalance: string;
};

type PortalInvoice = {
  id: string;
  invoiceUid: string;
  issueDate: string;
  dueDate: string;
  totalAmount: string;
  totalPaid: string;
  balance: string;
  paymentStatus: string;
};

type PortalEstimate = {
  id: string;
  estimateUid: string;
  issueDate: string;
  expiryDate: string;
  totalAmount: string;
  status: string;
};

type PortalPayment = {
  id: string;
  amount: string;
  paymentDate: string;
  paymentMethod: string;
  status: string;
  invoiceUid: string;
};

export default function PortalDashboard() {
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [account, setAccount] = useState<AccountInfo | null>(null);
  const [invoices, setInvoices] = useState<PortalInvoice[]>([]);
  const [estimates, setEstimates] = useState<PortalEstimate[]>([]);
  const [payments, setPayments] = useState<PortalPayment[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<PortalInvoice | null>(null);
  const [selectedEstimate, setSelectedEstimate] = useState<PortalEstimate | null>(null);
  const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false);
  const [estimateDialogOpen, setEstimateDialogOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);

  const fetchPortalData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch account info
      const accountResponse = await apiRequest("GET", "/api/portal/account");
      const accountData = await accountResponse.json();
      setAccount(accountData);
      
      // Fetch invoices
      const invoicesResponse = await apiRequest("GET", "/api/portal/invoices");
      const invoicesData = await invoicesResponse.json();
      setInvoices(invoicesData);
      
      // Fetch estimates
      const estimatesResponse = await apiRequest("GET", "/api/portal/estimates");
      const estimatesData = await estimatesResponse.json();
      setEstimates(estimatesData);
      
      // Fetch payments
      const paymentsResponse = await apiRequest("GET", "/api/portal/payments");
      const paymentsData = await paymentsResponse.json();
      setPayments(paymentsData);
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load your account data. Please try again.",
        variant: "destructive",
      });
      // If there's an error (like session expired), redirect to login
      navigate("/portal/login");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPortalData();
  }, []);

  const handleLogout = async () => {
    try {
      await apiRequest("POST", "/api/portal/logout");
      toast({
        title: "Logged Out",
        description: "You have been logged out successfully.",
      });
      navigate("/portal/login");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handlePaymentRequest = (invoice: PortalInvoice) => {
    setSelectedInvoice(invoice);
    setPaymentDialogOpen(true);
  };

  const handleMakePayment = async () => {
    // In a real app, this would process the payment
    toast({
      title: "Payment Functionality",
      description: "Payment processing would be implemented here.",
    });
    setPaymentDialogOpen(false);
  };

  const invoiceColumns: ColumnDef<PortalInvoice>[] = [
    {
      accessorKey: "invoiceUid",
      header: "Invoice #",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("invoiceUid")}</div>
      ),
    },
    {
      accessorKey: "issueDate",
      header: "Date",
      cell: ({ row }) => formatDate(row.getValue("issueDate")),
    },
    {
      accessorKey: "dueDate",
      header: "Due Date",
      cell: ({ row }) => formatDate(row.getValue("dueDate")),
    },
    {
      accessorKey: "totalAmount",
      header: "Amount",
      cell: ({ row }) => formatCurrency(row.getValue("totalAmount")),
    },
    {
      accessorKey: "totalPaid",
      header: "Paid",
      cell: ({ row }) => formatCurrency(row.getValue("totalPaid")),
    },
    {
      accessorKey: "balance",
      header: "Balance",
      cell: ({ row }) => formatCurrency(row.getValue("balance")),
    },
    {
      accessorKey: "paymentStatus",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("paymentStatus") as string;
        let colorClass = "";
        
        switch (status) {
          case "paid":
            colorClass = "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
            break;
          case "partial":
            colorClass = "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
            break;
          case "overdue":
            colorClass = "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
            break;
          default:
            colorClass = "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
        }
        
        return (
          <Badge variant="outline" className={colorClass}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const invoice = row.original;
        return (
          <div className="text-right">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => {
                setSelectedInvoice(invoice);
                setInvoiceDialogOpen(true);
              }}
            >
              View
            </Button>
          </div>
        );
      },
    },
  ];

  const estimateColumns: ColumnDef<PortalEstimate>[] = [
    {
      accessorKey: "estimateUid",
      header: "Estimate #",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("estimateUid")}</div>
      ),
    },
    {
      accessorKey: "issueDate",
      header: "Date",
      cell: ({ row }) => formatDate(row.getValue("issueDate")),
    },
    {
      accessorKey: "expiryDate",
      header: "Expires",
      cell: ({ row }) => formatDate(row.getValue("expiryDate")),
    },
    {
      accessorKey: "totalAmount",
      header: "Amount",
      cell: ({ row }) => formatCurrency(row.getValue("totalAmount")),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        let colorClass = "";
        
        switch (status) {
          case "accepted":
            colorClass = "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
            break;
          case "sent":
            colorClass = "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
            break;
          case "rejected":
            colorClass = "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
            break;
          case "expired":
            colorClass = "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300";
            break;
          default:
            colorClass = "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
        }
        
        return (
          <Badge variant="outline" className={colorClass}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const estimate = row.original;
        return (
          <div className="text-right">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => {
                setSelectedEstimate(estimate);
                setEstimateDialogOpen(true);
              }}
            >
              View
            </Button>
          </div>
        );
      },
    },
  ];

  const paymentColumns: ColumnDef<PortalPayment>[] = [
    {
      accessorKey: "paymentDate",
      header: "Date",
      cell: ({ row }) => formatDate(row.getValue("paymentDate")),
    },
    {
      accessorKey: "invoiceUid",
      header: "Invoice #",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("invoiceUid")}</div>
      ),
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) => formatCurrency(row.getValue("amount")),
    },
    {
      accessorKey: "paymentMethod",
      header: "Method",
      cell: ({ row }) => {
        const method = row.getValue("paymentMethod") as string;
        return <div>{method}</div>;
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        let colorClass = "";
        
        switch (status) {
          case "approved":
            colorClass = "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
            break;
          case "pending":
            colorClass = "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300";
            break;
          case "rejected":
            colorClass = "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
            break;
          default:
            colorClass = "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
        }
        
        return (
          <Badge variant="outline" className={colorClass}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        );
      },
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <PortalLayout userName={account?.name || "Client"} onLogout={handleLogout}>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Current Balance</p>
                <h3 className="text-2xl font-bold">
                  {formatCurrency(account?.customerBalance || "0")}
                </h3>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </CardContent>
          </Card>
          
          <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 dark:text-green-400">Paid Invoices</p>
                <h3 className="text-2xl font-bold">
                  {invoices.filter(i => i.paymentStatus === "paid").length}
                </h3>
              </div>
              <Receipt className="h-8 w-8 text-green-600 dark:text-green-400" />
            </CardContent>
          </Card>
          
          <Card className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-amber-600 dark:text-amber-400">Open Invoices</p>
                <h3 className="text-2xl font-bold">
                  {invoices.filter(i => i.paymentStatus !== "paid").length}
                </h3>
              </div>
              <Clock className="h-8 w-8 text-amber-600 dark:text-amber-400" />
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="invoices" className="space-y-4">
          <TabsList>
            <TabsTrigger value="invoices">
              <FileText className="mr-2 h-4 w-4" />
              Invoices
            </TabsTrigger>
            <TabsTrigger value="estimates">
              <FileText className="mr-2 h-4 w-4" />
              Estimates
            </TabsTrigger>
            <TabsTrigger value="payments">
              <CreditCard className="mr-2 h-4 w-4" />
              Payments
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="invoices">
            <Card>
              <CardHeader>
                <CardTitle>Your Invoices</CardTitle>
                <CardDescription>View and manage your invoice history</CardDescription>
              </CardHeader>
              <CardContent>
                <DataTable 
                  columns={invoiceColumns} 
                  data={invoices}
                  searchColumn="invoiceUid"
                  searchPlaceholder="Search invoices..."
                />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="estimates">
            <Card>
              <CardHeader>
                <CardTitle>Your Estimates</CardTitle>
                <CardDescription>View and manage your estimate history</CardDescription>
              </CardHeader>
              <CardContent>
                <DataTable 
                  columns={estimateColumns} 
                  data={estimates}
                  searchColumn="estimateUid"
                  searchPlaceholder="Search estimates..."
                />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="payments">
            <Card>
              <CardHeader>
                <CardTitle>Your Payments</CardTitle>
                <CardDescription>View your payment history</CardDescription>
              </CardHeader>
              <CardContent>
                <DataTable 
                  columns={paymentColumns} 
                  data={payments}
                  searchColumn="invoiceUid"
                  searchPlaceholder="Search payments..."
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Invoice Details Dialog */}
      <Dialog open={invoiceDialogOpen} onOpenChange={setInvoiceDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Invoice #{selectedInvoice?.invoiceUid}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Issue Date</p>
                <p>{formatDate(selectedInvoice?.issueDate || "")}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Due Date</p>
                <p>{formatDate(selectedInvoice?.dueDate || "")}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Total Amount</p>
                <p className="font-medium">{formatCurrency(selectedInvoice?.totalAmount || "0")}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Balance Due</p>
                <p className="font-medium">{formatCurrency(selectedInvoice?.balance || "0")}</p>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 mt-4">
              <Button variant="outline" onClick={() => setInvoiceDialogOpen(false)}>
                Close
              </Button>
              {selectedInvoice && selectedInvoice.paymentStatus !== "paid" && (
                <Button onClick={() => handlePaymentRequest(selectedInvoice)}>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Make Payment
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Estimate Details Dialog */}
      <Dialog open={estimateDialogOpen} onOpenChange={setEstimateDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Estimate #{selectedEstimate?.estimateUid}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Issue Date</p>
                <p>{formatDate(selectedEstimate?.issueDate || "")}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Expiry Date</p>
                <p>{formatDate(selectedEstimate?.expiryDate || "")}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Total Amount</p>
                <p className="font-medium">{formatCurrency(selectedEstimate?.totalAmount || "0")}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Status</p>
                <p className="font-medium">{selectedEstimate?.status}</p>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 mt-4">
              <Button variant="outline" onClick={() => setEstimateDialogOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Payment Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Make Payment for Invoice #{selectedInvoice?.invoiceUid}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Amount Due</p>
                <p className="text-xl font-bold">{formatCurrency(selectedInvoice?.balance || "0")}</p>
              </div>
            </div>
            
            <p className="text-center text-gray-500 py-4">
              Payment form would be implemented here
            </p>
            
            <div className="flex justify-end space-x-2 mt-4">
              <Button variant="outline" onClick={() => setPaymentDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleMakePayment}>
                Process Payment
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </PortalLayout>
  );
}