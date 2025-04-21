import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { FinancialSummary } from "@/components/dashboard/financial-summary";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { RecentInvoices } from "@/components/dashboard/recent-invoices";
import { InventoryStatus } from "@/components/dashboard/inventory-status";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { DashboardSummary } from "@shared/types";

export default function Dashboard() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardSummary | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const response = await apiRequest("GET", "/api/dashboard");
        const data = await response.json();
        setDashboardData(data);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load dashboard data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [toast]);

  if (isLoading) {
    return (
      <DashboardLayout title="Dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  // Sample data for demonstration purposes
  const financialSummaryData = [
    { month: 'Jan', revenue: 12500, expenses: 8200, profit: 4300 },
    { month: 'Feb', revenue: 14500, expenses: 9400, profit: 5100 },
    { month: 'Mar', revenue: 15250, expenses: 9800, profit: 5450 },
    { month: 'Apr', revenue: 17300, expenses: 10200, profit: 7100 },
    { month: 'May', revenue: 19400, expenses: 11500, profit: 7900 },
    { month: 'Jun', revenue: 21200, expenses: 12400, profit: 8800 },
  ];

  const recentInvoicesData = [
    {
      id: '1',
      accountName: 'Acme Corporation',
      amount: 1250.00,
      date: new Date('2023-04-15'),
      dueDate: new Date('2023-05-15'),
      status: 'paid'
    },
    {
      id: '2',
      accountName: 'Tech Solutions Inc',
      amount: 3450.75,
      date: new Date('2023-04-10'),
      dueDate: new Date('2023-05-10'),
      status: 'pending'
    },
    {
      id: '3',
      accountName: 'Global Industries',
      amount: 5780.25,
      date: new Date('2023-04-05'),
      dueDate: new Date('2023-05-05'),
      status: 'overdue'
    },
    {
      id: '4',
      accountName: 'ABC Supply Co',
      amount: 1875.50,
      date: new Date('2023-04-01'),
      dueDate: new Date('2023-05-01'),
      status: 'paid'
    }
  ];

  const inventoryProductsData = [
    {
      id: '1',
      name: 'Premium Keyboard',
      sku: 'KB-001',
      description: 'Premium mechanical keyboard with RGB lighting',
      unitPrice: 129.99,
      stockAvailable: 15,
      reorderLevel: 5,
      publicUrlPhoto: null
    },
    {
      id: '2',
      name: 'Wireless Mouse',
      sku: 'MS-002',
      description: 'Ergonomic wireless mouse with long battery life',
      unitPrice: 49.99,
      stockAvailable: 3,
      reorderLevel: 5,
      publicUrlPhoto: null
    },
    {
      id: '3',
      name: '27" Monitor',
      sku: 'MN-003',
      description: '27" 4K Ultra HD monitor with HDR support',
      unitPrice: 299.99,
      stockAvailable: 0,
      reorderLevel: 2,
      publicUrlPhoto: null
    }
  ];

  return (
    <DashboardLayout title="Dashboard">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">Dashboard</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">System overview and key metrics</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        {dashboardData ? (
          <>
            <KpiCard 
              title="Total Revenue"
              value={dashboardData.revenueStats.totalRevenue}
              isCurrency={true}
              trend="up"
              change={5.2}
            />
            <KpiCard 
              title="Accounts Receivable"
              value={dashboardData.accountsStats.totalReceivable}
              isCurrency={true}
              trend={dashboardData.accountsStats.totalReceivable > 0 ? "up" : "down"}
              change={2.8}
            />
            <KpiCard 
              title="Accounts Payable"
              value={dashboardData.accountsStats.totalPayable}
              isCurrency={true}
              trend={dashboardData.accountsStats.totalPayable > 0 ? "up" : "down"}
              change={1.3}
            />
            <KpiCard 
              title="Inventory Value"
              value={dashboardData.inventoryStats.inventoryValue}
              isCurrency={true}
              trend="up"
              change={3.7}
            />
          </>
        ) : (
          <>
            <KpiCard 
              title="Total Revenue"
              value={45000}
              isCurrency={true}
              trend="up"
              change={5.2}
            />
            <KpiCard 
              title="Accounts Receivable"
              value={12500}
              isCurrency={true}
              trend="down"
              change={2.8}
            />
            <KpiCard 
              title="Accounts Payable"
              value={9800}
              isCurrency={true}
              trend="up"
              change={1.3}
            />
            <KpiCard 
              title="Inventory Value"
              value={28750}
              isCurrency={true}
              trend="up"
              change={3.7}
            />
          </>
        )}
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Financial Summary */}
        <div className="lg:col-span-2">
          <FinancialSummary data={dashboardData?.revenueStats ? 
            Array(6).fill(0).map((_, i) => ({ 
              month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'][i],
              revenue: dashboardData.revenueStats.totalRevenue / 6 * (1 + i * 0.1),
              expenses: dashboardData.revenueStats.totalRevenue / 6 * 0.6 * (1 + i * 0.05),
              profit: dashboardData.revenueStats.totalRevenue / 6 * 0.4 * (1 + i * 0.15),
            })) : 
            financialSummaryData} 
          />
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-1">
          <RecentActivity activities={dashboardData?.recentActivity || []} />
        </div>
      </div>

      {/* Third Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Invoices */}
        <div>
          <RecentInvoices invoices={recentInvoicesData} />
        </div>

        {/* Inventory Status */}
        <div>
          <InventoryStatus products={inventoryProductsData} />
        </div>
      </div>
    </DashboardLayout>
  );
}
