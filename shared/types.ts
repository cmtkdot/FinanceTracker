import { Product } from "./schema";

export interface PortalAuthRequest {
  accountIdentifier: string; // can be contact UID or email
  pin: string;
}

export interface ProductWithInventory extends Product {
  stockAvailable?: number | null;
  stockOnOrder?: number | null;
  stockReserved?: number | null;
  stockValue?: number | null;
}

export interface DashboardSummary {
  revenueStats: {
    totalRevenue: number;
    openInvoices: number;
    paidInvoices: number;
    overdueInvoices: number;
  };
  inventoryStats: {
    totalProducts: number;
    lowStockProducts: number;
    outOfStockProducts: number;
    inventoryValue: number;
  };
  contactsStats: {
    totalCustomers: number;
    totalVendors: number;
    totalReceivable: number;
    totalPayable: number;
  };
  recentActivity: {
    type: string;
    date: Date;
    description: string;
    amount?: number;
    status?: string;
  }[];
}