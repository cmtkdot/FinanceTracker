import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Estimate } from "@shared/schema";
import { formatCurrency, formatDate, getStatusColor } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Eye, Edit, FileText, MoreHorizontal, Plus, ArrowRightLeft, Trash2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocation } from "wouter";

export default function Estimates() {
  const { toast } = useToast();
  const [_, navigate] = useLocation();
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("all");

  const fetchEstimates = async () => {
    try {
      setIsLoading(true);
      const response = await apiRequest("GET", "/api/estimates");
      const data = await response.json();
      setEstimates(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load estimates. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEstimates();
  }, []);

  const handleCreateClick = () => {
    setModalOpen(true);
  };

  const convertToInvoice = async (estimateId: string) => {
    try {
      const response = await apiRequest("POST", `/api/estimates/${estimateId}/convert`);
      const { invoiceId } = await response.json();
      
      queryClient.invalidateQueries({ queryKey: ['/api/estimates'] });
      queryClient.invalidateQueries({ queryKey: ['/api/invoices'] });
      
      toast({
        title: "Estimate Converted",
        description: "Estimate has been successfully converted to an invoice.",
      });
      
      navigate(`/invoices`);
    } catch (error) {
      toast({
        title: "Conversion Failed",
        description: "Failed to convert estimate to invoice. Please try again.",
        variant: "destructive",
      });
    }
  };

  const deleteEstimate = async (id: string) => {
    try {
      await apiRequest("DELETE", `/api/estimates/${id}`);
      queryClient.invalidateQueries({ queryKey: ['/api/estimates'] });
      toast({
        title: "Estimate deleted",
        description: "The estimate has been deleted successfully."
      });
      fetchEstimates();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete the estimate. Please try again.",
        variant: "destructive"
      });
    }
  };

  const columns: ColumnDef<Estimate>[] = [
    {
      accessorKey: "estimateUid",
      header: "Estimate #",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("estimateUid")}</div>
      ),
    },
    {
      accessorKey: "account",
      header: "Client",
      cell: ({ row }) => {
        const accountName = row.original.account?.name || "Unknown Client";
        return <div>{accountName}</div>;
      },
    },
    {
      accessorKey: "issueDate",
      header: "Issue Date",
      cell: ({ row }) => formatDate(row.getValue("issueDate")),
    },
    {
      accessorKey: "expiryDate",
      header: "Expiry Date",
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
        const estimate = row.original;
        
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
                <DropdownMenuItem onClick={() => navigate(`/estimates/${estimate.id}`)}>
                  <Eye className="mr-2 h-4 w-4" />
                  View
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <FileText className="mr-2 h-4 w-4" />
                  Download PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => convertToInvoice(estimate.id)}>
                  <ArrowRightLeft className="mr-2 h-4 w-4" />
                  Convert to Invoice
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
                  onClick={() => deleteEstimate(estimate.id)}
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

  const filteredEstimates = estimates.filter((estimate) => {
    if (activeTab === "all") return true;
    return estimate.status === activeTab;
  });

  return (
    <DashboardLayout title="Estimates">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">Estimates</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage client estimates and quotes</p>
        </div>
        <Button onClick={handleCreateClick}>
          <Plus className="mr-2 h-4 w-4" />
          New Estimate
        </Button>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="draft">Draft</TabsTrigger>
          <TabsTrigger value="sent">Sent</TabsTrigger>
          <TabsTrigger value="accepted">Accepted</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
          <TabsTrigger value="expired">Expired</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-0">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <DataTable 
              columns={columns} 
              data={filteredEstimates}
              searchColumn="estimateUid"
              searchPlaceholder="Search estimates..."
            />
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-4xl">
          <div className="p-6 text-center text-gray-500">
            <h3 className="text-lg font-medium mb-4">Create Estimate Form</h3>
            <p>Estimate form would be implemented here similar to the Invoice form</p>
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
