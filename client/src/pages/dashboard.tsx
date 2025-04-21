import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { KPICard } from "@/components/dashboard/kpi-card";
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

  return (
    <DashboardLayout title="Dashboard">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">Dashboard</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">System overview and key metrics</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        {dashboardData && (
          <>
            <KPICard data={dashboardData.kpis.totalRevenue} />
            <KPICard data={dashboardData.kpis.accountsReceivable} />
            <KPICard data={dashboardData.kpis.accountsPayable} />
            <KPICard data={dashboardData.kpis.inventoryValue} />
          </>
        )}
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Financial Summary */}
        <div className="lg:col-span-2">
          {dashboardData && (
            <FinancialSummary data={dashboardData.financialSummary} />
          )}
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-1">
          {dashboardData && (
            <RecentActivity activities={dashboardData.recentActivity} />
          )}
        </div>
      </div>

      {/* Third Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Invoices */}
        <div>
          {dashboardData && (
            <RecentInvoices invoices={dashboardData.recentInvoices} />
          )}
        </div>

        {/* Inventory Status */}
        <div>
          {dashboardData && (
            <InventoryStatus products={dashboardData.inventoryStatus} />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
