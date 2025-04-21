import { Product } from "./schema";

export interface PortalAuthRequest {
  accountIdentifier: string; // Email or account UID
  pin: string;
}

export interface AccountWithBalances {
  id: string;
  name: string;
  email: string;
  accountUid: string;
  isCustomer: boolean;
  isVendor: boolean;
  totalReceivable?: number;
  totalPayable?: number;
  lastInvoiceDate?: Date;
  lastPaymentDate?: Date;
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
  accountsStats: {
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