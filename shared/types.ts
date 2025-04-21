import { 
  Account, EstimateLineItem, InvoiceLineItem, PurchaseOrderLine, 
  Product, CustomerPayment, VendorPayment, CustomerCredit
} from './schema';

// Common status types
export type PaymentStatus = 'pending' | 'partial' | 'paid' | 'overdue';
export type EstimateStatus = 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
export type PaymentApprovalStatus = 'pending' | 'approved' | 'rejected';
export type PdfStatus = 'pending' | 'processing' | 'completed' | 'failed';

// Extended types with related data
export interface AccountWithBalances extends Account {
  invoicesCount?: number;
  purchaseOrdersCount?: number;
}

export interface ProductWithInventory extends Product {
  stockAvailable?: number;
  committedStock?: number;
  soldStock?: number;
  stockValue?: number;
  vendor?: Account;
}

export interface EstimateWithDetails {
  id: string;
  estimateUid: string;
  issueDate: Date;
  expiryDate?: Date | null;
  totalAmount: number;
  totalCredits: number;
  balance: number;
  status: EstimateStatus;
  account: Account;
  lineItems: EstimateLineItem[];
  credits?: CustomerCredit[];
}

export interface InvoiceWithDetails {
  id: string;
  invoiceUid: string;
  issueDate: Date;
  dueDate?: Date | null;
  totalAmount: number;
  totalPaid: number;
  totalCredits: number;
  balance: number;
  paymentStatus: PaymentStatus;
  account: Account;
  lineItems: InvoiceLineItem[];
  payments?: CustomerPayment[];
  credits?: CustomerCredit[];
}

export interface PurchaseOrderWithDetails {
  id: string;
  poUid: string;
  issueDate: Date;
  expectedDate?: Date | null;
  totalAmount: number;
  totalPaid: number;
  balance: number;
  paymentStatus: PaymentStatus;
  productCount: number;
  account: Account;
  lines: PurchaseOrderLine[];
  payments?: VendorPayment[];
}

// Dashboard summary types
export interface FinancialSummary {
  period: string;
  revenue: number;
  expenses: number;
  profit: number;
}

export interface RecentActivity {
  id: string;
  type: 'invoice' | 'payment' | 'inventory' | 'purchase_order' | 'estimate' | 'credit';
  message: string;
  subText: string;
  timestamp: Date;
  read: boolean;
}

export interface KpiMetric {
  value: number;
  label: string;
  changePercent: number;
  changeDirection: 'up' | 'down' | 'none';
  icon: string;
}

export interface DashboardSummary {
  kpis: {
    totalRevenue: KpiMetric;
    accountsReceivable: KpiMetric;
    accountsPayable: KpiMetric;
    inventoryValue: KpiMetric;
  };
  recentActivity: RecentActivity[];
  financialSummary: FinancialSummary[];
  recentInvoices: InvoiceWithDetails[];
  inventoryStatus: ProductWithInventory[];
}

// Form state types for various components
export interface InvoiceFormState {
  accountId: string;
  issueDate: Date;
  dueDate?: Date;
  notes?: string;
  lineItems: {
    id?: string;
    productId?: string;
    description: string;
    quantity: number;
    unitPrice: number;
  }[];
}

export interface ProductFormState {
  name: string;
  sku: string;
  description?: string;
  unitPrice: number;
  unitCost?: number;
  stockQuantity: number;
  reorderLevel: number;
  vendorId?: string;
  publicUrlPhoto?: string;
  publicUrlVideo?: string;
}

// Portal authentication
export interface PortalAuthRequest {
  accountIdentifier: string; // Account UID or email
  pin: string;
}

// Webhook payload types
export interface WebhookPayload {
  table: string;
  id: string;
  op: 'INSERT' | 'UPDATE' | 'DELETE';
  row?: Record<string, any>;
  old_row?: Record<string, any>;
}
