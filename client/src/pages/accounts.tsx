import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Account } from "@shared/schema";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Eye, Edit, MoreHorizontal, Plus, Trash2, UserRound, Building, Mail, Phone } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";

export default function Accounts() {
  const { toast } = useToast();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<string>("all");

  const fetchAccounts = async () => {
    try {
      setIsLoading(true);
      const response = await apiRequest("GET", "/api/accounts");
      const data = await response.json();
      setAccounts(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load accounts. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleCreateClick = () => {
    setSelectedAccount(undefined);
    setModalOpen(true);
  };

  const handleEditClick = (account: Account) => {
    setSelectedAccount(account);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedAccount(undefined);
  };

  const handleFormSuccess = () => {
    setModalOpen(false);
    queryClient.invalidateQueries({ queryKey: ['/api/accounts'] });
    fetchAccounts();
  };

  const deleteAccount = async (id: string) => {
    try {
      await apiRequest("DELETE", `/api/accounts/${id}`);
      queryClient.invalidateQueries({ queryKey: ['/api/accounts'] });
      toast({
        title: "Account deleted",
        description: "The account has been deleted successfully."
      });
      fetchAccounts();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete the account. Please try again.",
        variant: "destructive"
      });
    }
  };

  const columns: ColumnDef<Account>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("name")}</div>
      ),
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => row.getValue("email") || "—",
    },
    {
      accessorKey: "phone",
      header: "Phone",
      cell: ({ row }) => row.getValue("phone") || "—",
    },
    {
      accessorKey: "isCustomer",
      header: "Type",
      cell: ({ row }) => {
        const isCustomer = row.original.isCustomer;
        const isVendor = row.original.isVendor;
        
        if (isCustomer && isVendor) {
          return <Badge variant="outline" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">Customer & Vendor</Badge>;
        } else if (isCustomer) {
          return <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">Customer</Badge>;
        } else if (isVendor) {
          return <Badge variant="outline" className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300">Vendor</Badge>;
        } else {
          return <Badge variant="outline" className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">Other</Badge>;
        }
      },
    },
    {
      accessorKey: "netBalance",
      header: "Balance",
      cell: ({ row }) => {
        const balance = parseFloat(row.getValue("netBalance") || "0");
        const textColor = balance < 0 ? "text-red-600 dark:text-red-400" : balance > 0 ? "text-green-600 dark:text-green-400" : "";
        
        return <span className={textColor}>{formatCurrency(balance)}</span>;
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const account = row.original;
        
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
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleEditClick(account)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
                  onClick={() => deleteAccount(account.id)}
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

  const filteredAccounts = accounts.filter((account) => {
    if (activeTab === "all") return true;
    if (activeTab === "customers") return account.isCustomer;
    if (activeTab === "vendors") return account.isVendor;
    if (activeTab === "both") return account.isCustomer && account.isVendor;
    return true;
  });

  return (
    <DashboardLayout title="Accounts">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">Accounts</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage customers and vendors</p>
        </div>
        <Button onClick={handleCreateClick}>
          <Plus className="mr-2 h-4 w-4" />
          New Account
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Customers</p>
              <h3 className="text-2xl font-bold">
                {accounts.filter(a => a.isCustomer).length}
              </h3>
            </div>
            <UserRound className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </CardContent>
        </Card>
        
        <Card className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-amber-600 dark:text-amber-400">Vendors</p>
              <h3 className="text-2xl font-bold">
                {accounts.filter(a => a.isVendor).length}
              </h3>
            </div>
            <Building className="h-8 w-8 text-amber-600 dark:text-amber-400" />
          </CardContent>
        </Card>
        
        <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600 dark:text-green-400">Total Receivable</p>
              <h3 className="text-2xl font-bold">
                {formatCurrency(accounts.reduce((sum, account) => sum + parseFloat(account.customerBalance?.toString() || "0"), 0))}
              </h3>
            </div>
            <Mail className="h-8 w-8 text-green-600 dark:text-green-400" />
          </CardContent>
        </Card>
        
        <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600 dark:text-red-400">Total Payable</p>
              <h3 className="text-2xl font-bold">
                {formatCurrency(accounts.reduce((sum, account) => sum + parseFloat(account.vendorBalance?.toString() || "0"), 0))}
              </h3>
            </div>
            <Phone className="h-8 w-8 text-red-600 dark:text-red-400" />
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="all">All Accounts</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="vendors">Vendors</TabsTrigger>
          <TabsTrigger value="both">Customers & Vendors</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-0">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <DataTable 
              columns={columns} 
              data={filteredAccounts}
              searchColumn="name"
              searchPlaceholder="Search accounts..."
            />
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-3xl">
          <div className="p-6 text-center text-gray-500">
            <h3 className="text-lg font-medium mb-4">
              {selectedAccount ? "Edit Account" : "Create New Account"}
            </h3>
            <p>Account form would be implemented here</p>
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