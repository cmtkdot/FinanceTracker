import { 
  users, accounts, products, estimates, estimateLineItems, invoices, 
  invoiceLineItems, purchaseOrders, purchaseOrderLines, customerPayments, 
  vendorPayments, customerCredits, expenses, messages, portalAccess, pdfQueue,
  type User, type InsertUser, type Account, type InsertAccount,
  type Product, type InsertProduct, type Estimate, type InsertEstimate,
  type EstimateLineItem, type InsertEstimateLineItem, type Invoice, type InsertInvoice,
  type InvoiceLineItem, type InsertInvoiceLineItem, type PurchaseOrder, type InsertPurchaseOrder,
  type PurchaseOrderLine, type InsertPurchaseOrderLine, type CustomerPayment, type InsertCustomerPayment,
  type VendorPayment, type InsertVendorPayment, type CustomerCredit, type InsertCustomerCredit,
  type Expense, type InsertExpense, type Message, type InsertMessage,
  type PortalAccess, type InsertPortalAccess
} from "@shared/schema";
import { db } from "./db";
import { eq, and, or, desc, isNull, count, sql, not, isNotNull } from "drizzle-orm";
import { DashboardSummary, AccountWithBalances, ProductWithInventory } from "@shared/types";
import { createId } from '@paralleldrive/cuid2';
import { hash, compare } from 'bcrypt';
import axios from 'axios';

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  verifyUserPassword(email: string, password: string): Promise<User | null>;

  // Account methods
  getAccounts(filters?: { isCustomer?: boolean, isVendor?: boolean }): Promise<Account[]>;
  getAccountById(id: string): Promise<Account | undefined>;
  getAccountByGlideRowId(glideRowId: string): Promise<Account | undefined>;
  getAccountByUid(accountUid: string): Promise<Account | undefined>;
  createAccount(account: InsertAccount): Promise<Account>;
  updateAccount(id: string, account: Partial<Account>): Promise<Account | undefined>;
  deleteAccount(id: string): Promise<boolean>;
  
  // Product methods
  getProducts(): Promise<Product[]>;
  getProductById(id: string): Promise<Product | undefined>;
  getProductBySku(sku: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: Partial<Product>): Promise<Product | undefined>;
  deleteProduct(id: string): Promise<boolean>;
  getProductsWithInventory(): Promise<ProductWithInventory[]>;

  // Estimate methods
  getEstimates(): Promise<Estimate[]>;
  getEstimateById(id: string): Promise<Estimate | undefined>;
  getEstimateWithLineItems(id: string): Promise<{ estimate: Estimate, lineItems: EstimateLineItem[] } | undefined>;
  createEstimate(estimate: InsertEstimate): Promise<Estimate>;
  updateEstimate(id: string, estimate: Partial<Estimate>): Promise<Estimate | undefined>;
  deleteEstimate(id: string): Promise<boolean>;
  
  // Estimate Line Item methods
  getEstimateLineItems(estimateId: string): Promise<EstimateLineItem[]>;
  createEstimateLineItem(lineItem: InsertEstimateLineItem): Promise<EstimateLineItem>;
  updateEstimateLineItem(id: string, lineItem: Partial<EstimateLineItem>): Promise<EstimateLineItem | undefined>;
  deleteEstimateLineItem(id: string): Promise<boolean>;
  
  // Invoice methods
  getInvoices(): Promise<Invoice[]>;
  getInvoiceById(id: string): Promise<Invoice | undefined>;
  getInvoiceWithLineItems(id: string): Promise<{ invoice: Invoice, lineItems: InvoiceLineItem[] } | undefined>;
  createInvoice(invoice: InsertInvoice): Promise<Invoice>;
  updateInvoice(id: string, invoice: Partial<Invoice>): Promise<Invoice | undefined>;
  deleteInvoice(id: string): Promise<boolean>;
  
  // Invoice Line Item methods
  getInvoiceLineItems(invoiceId: string): Promise<InvoiceLineItem[]>;
  createInvoiceLineItem(lineItem: InsertInvoiceLineItem): Promise<InvoiceLineItem>;
  updateInvoiceLineItem(id: string, lineItem: Partial<InvoiceLineItem>): Promise<InvoiceLineItem | undefined>;
  deleteInvoiceLineItem(id: string): Promise<boolean>;
  
  // Purchase Order methods
  getPurchaseOrders(): Promise<PurchaseOrder[]>;
  getPurchaseOrderById(id: string): Promise<PurchaseOrder | undefined>;
  getPurchaseOrderWithLines(id: string): Promise<{ purchaseOrder: PurchaseOrder, lines: PurchaseOrderLine[] } | undefined>;
  createPurchaseOrder(purchaseOrder: InsertPurchaseOrder): Promise<PurchaseOrder>;
  updatePurchaseOrder(id: string, purchaseOrder: Partial<PurchaseOrder>): Promise<PurchaseOrder | undefined>;
  deletePurchaseOrder(id: string): Promise<boolean>;
  
  // Purchase Order Line methods
  getPurchaseOrderLines(purchaseOrderId: string): Promise<PurchaseOrderLine[]>;
  createPurchaseOrderLine(line: InsertPurchaseOrderLine): Promise<PurchaseOrderLine>;
  updatePurchaseOrderLine(id: string, line: Partial<PurchaseOrderLine>): Promise<PurchaseOrderLine | undefined>;
  deletePurchaseOrderLine(id: string): Promise<boolean>;
  
  // Customer Payment methods
  getCustomerPayments(): Promise<CustomerPayment[]>;
  getCustomerPaymentById(id: string): Promise<CustomerPayment | undefined>;
  getCustomerPaymentsByInvoiceId(invoiceId: string): Promise<CustomerPayment[]>;
  createCustomerPayment(payment: InsertCustomerPayment): Promise<CustomerPayment>;
  updateCustomerPayment(id: string, payment: Partial<CustomerPayment>): Promise<CustomerPayment | undefined>;
  deleteCustomerPayment(id: string): Promise<boolean>;
  
  // Vendor Payment methods
  getVendorPayments(): Promise<VendorPayment[]>;
  getVendorPaymentById(id: string): Promise<VendorPayment | undefined>;
  getVendorPaymentsByPurchaseOrderId(purchaseOrderId: string): Promise<VendorPayment[]>;
  createVendorPayment(payment: InsertVendorPayment): Promise<VendorPayment>;
  updateVendorPayment(id: string, payment: Partial<VendorPayment>): Promise<VendorPayment | undefined>;
  deleteVendorPayment(id: string): Promise<boolean>;
  
  // Customer Credit methods
  getCustomerCredits(): Promise<CustomerCredit[]>;
  getCustomerCreditById(id: string): Promise<CustomerCredit | undefined>;
  getCustomerCreditsByInvoiceId(invoiceId: string): Promise<CustomerCredit[]>;
  getCustomerCreditsByEstimateId(estimateId: string): Promise<CustomerCredit[]>;
  createCustomerCredit(credit: InsertCustomerCredit): Promise<CustomerCredit>;
  updateCustomerCredit(id: string, credit: Partial<CustomerCredit>): Promise<CustomerCredit | undefined>;
  deleteCustomerCredit(id: string): Promise<boolean>;
  
  // Expense methods
  getExpenses(): Promise<Expense[]>;
  getExpenseById(id: string): Promise<Expense | undefined>;
  createExpense(expense: InsertExpense): Promise<Expense>;
  updateExpense(id: string, expense: Partial<Expense>): Promise<Expense | undefined>;
  deleteExpense(id: string): Promise<boolean>;
  
  // Message methods
  getMessages(): Promise<Message[]>;
  getMessageById(id: string): Promise<Message | undefined>;
  createMessage(message: InsertMessage): Promise<Message>;
  updateMessage(id: string, message: Partial<Message>): Promise<Message | undefined>;
  deleteMessage(id: string): Promise<boolean>;
  
  // Portal Access methods
  getPortalAccessByAccountId(accountId: string): Promise<PortalAccess | undefined>;
  createPortalAccess(access: InsertPortalAccess): Promise<PortalAccess>;
  updatePortalAccess(id: string, access: Partial<PortalAccess>): Promise<PortalAccess | undefined>;
  validatePortalPIN(accountId: string, pin: string): Promise<boolean>;
  
  // Dashboard data
  getDashboardSummary(): Promise<DashboardSummary>;

  // PDF queue management
  queuePdfGeneration(recordType: string, recordId: string): Promise<void>;
  
  // Webhook sending
  sendWebhook(table: string, id: string, op: 'INSERT' | 'UPDATE' | 'DELETE', row?: any, old_row?: any): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const hashedPassword = await hash(userData.password, 10);
    const [user] = await db
      .insert(users)
      .values({
        ...userData,
        password: hashedPassword,
      })
      .returning();
    return user;
  }

  async verifyUserPassword(email: string, password: string): Promise<User | null> {
    const user = await this.getUserByEmail(email);
    if (!user) return null;

    const passwordMatches = await compare(password, user.password);
    if (!passwordMatches) return null;

    return user;
  }

  // Account methods
  async getAccounts(filters?: { isCustomer?: boolean, isVendor?: boolean }): Promise<Account[]> {
    let query = db.select().from(accounts);
    
    if (filters) {
      if (filters.isCustomer !== undefined && filters.isVendor !== undefined) {
        query = query.where(
          and(
            eq(accounts.isCustomer, filters.isCustomer),
            eq(accounts.isVendor, filters.isVendor)
          )
        );
      } else if (filters.isCustomer !== undefined) {
        query = query.where(eq(accounts.isCustomer, filters.isCustomer));
      } else if (filters.isVendor !== undefined) {
        query = query.where(eq(accounts.isVendor, filters.isVendor));
      }
    }
    
    return await query.orderBy(accounts.name);
  }

  async getAccountById(id: string): Promise<Account | undefined> {
    const [account] = await db.select().from(accounts).where(eq(accounts.id, id));
    return account;
  }

  async getAccountByGlideRowId(glideRowId: string): Promise<Account | undefined> {
    const [account] = await db.select().from(accounts).where(eq(accounts.glideRowId, glideRowId));
    return account;
  }

  async getAccountByUid(accountUid: string): Promise<Account | undefined> {
    const [account] = await db.select().from(accounts).where(eq(accounts.accountUid, accountUid));
    return account;
  }

  async createAccount(accountData: InsertAccount): Promise<Account> {
    // Generate a unique account UID (e.g., ACC-XXXX)
    const uniqueId = createId().slice(0, 6).toUpperCase();
    const accountUid = `ACC-${uniqueId}`;

    const [account] = await db
      .insert(accounts)
      .values({
        ...accountData,
        accountUid,
      })
      .returning();

    // After creating account, send webhook for external processing
    await this.sendWebhook('accounts', account.id, 'INSERT', account);
    
    return account;
  }

  async updateAccount(id: string, accountData: Partial<Account>): Promise<Account | undefined> {
    const [account] = await db
      .update(accounts)
      .set({
        ...accountData,
        updatedAt: new Date(),
      })
      .where(eq(accounts.id, id))
      .returning();

    if (account) {
      await this.sendWebhook('accounts', id, 'UPDATE', account);
    }
    
    return account;
  }

  async deleteAccount(id: string): Promise<boolean> {
    const account = await this.getAccountById(id);
    if (!account) return false;

    await db.delete(accounts).where(eq(accounts.id, id));
    
    await this.sendWebhook('accounts', id, 'DELETE', undefined, account);
    
    return true;
  }

  // Product methods
  async getProducts(): Promise<Product[]> {
    return await db.select().from(products).orderBy(products.name);
  }

  async getProductById(id: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async getProductBySku(sku: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.sku, sku));
    return product;
  }

  async createProduct(productData: InsertProduct): Promise<Product> {
    // If displayName is not provided, set it to the name
    if (!productData.displayName) {
      productData.displayName = productData.name;
    }

    const [product] = await db
      .insert(products)
      .values(productData)
      .returning();

    await this.sendWebhook('products', product.id, 'INSERT', product);
    
    return product;
  }

  async updateProduct(id: string, productData: Partial<Product>): Promise<Product | undefined> {
    const [product] = await db
      .update(products)
      .set({
        ...productData,
        updatedAt: new Date(),
      })
      .where(eq(products.id, id))
      .returning();

    if (product) {
      await this.sendWebhook('products', id, 'UPDATE', product);
    }
    
    return product;
  }

  async deleteProduct(id: string): Promise<boolean> {
    const product = await this.getProductById(id);
    if (!product) return false;

    await db.delete(products).where(eq(products.id, id));
    
    await this.sendWebhook('products', id, 'DELETE', undefined, product);
    
    return true;
  }

  async getProductsWithInventory(): Promise<ProductWithInventory[]> {
    const productRows = await db.select().from(products).orderBy(products.name);
    
    // This would be better implemented as a database view, but we'll do it in code for now
    const inventoryProducts: ProductWithInventory[] = [];
    
    for (const product of productRows) {
      // Calculate inventory metrics
      // In a real implementation, this should be done via database queries and views
      const stockAvailable = product.stockQuantity || 0;
      const committedStock = 0; // Would be calculated from open orders
      const soldStock = 0; // Would be calculated from invoices
      const stockValue = stockAvailable * Number(product.unitCost || 0);
      
      inventoryProducts.push({
        ...product,
        stockAvailable,
        committedStock,
        soldStock,
        stockValue
      });
    }
    
    return inventoryProducts;
  }

  // Estimate methods
  async getEstimates(): Promise<Estimate[]> {
    return await db
      .select()
      .from(estimates)
      .orderBy(desc(estimates.issueDate));
  }

  async getEstimateById(id: string): Promise<Estimate | undefined> {
    const [estimate] = await db
      .select()
      .from(estimates)
      .where(eq(estimates.id, id));
    return estimate;
  }

  async getEstimateWithLineItems(id: string): Promise<{ estimate: Estimate, lineItems: EstimateLineItem[] } | undefined> {
    const estimate = await this.getEstimateById(id);
    if (!estimate) return undefined;

    const lineItems = await this.getEstimateLineItems(id);
    
    return { estimate, lineItems };
  }

  async createEstimate(estimateData: InsertEstimate): Promise<Estimate> {
    // Generate a unique estimate UID (e.g., EST-XXXX)
    const uniqueId = createId().slice(0, 6).toUpperCase();
    const estimateUid = `EST-${uniqueId}`;

    const [estimate] = await db
      .insert(estimates)
      .values({
        ...estimateData,
        estimateUid,
      })
      .returning();

    await this.sendWebhook('estimates', estimate.id, 'INSERT', estimate);
    
    return estimate;
  }

  async updateEstimate(id: string, estimateData: Partial<Estimate>): Promise<Estimate | undefined> {
    const [estimate] = await db
      .update(estimates)
      .set({
        ...estimateData,
        updatedAt: new Date(),
      })
      .where(eq(estimates.id, id))
      .returning();

    if (estimate) {
      await this.sendWebhook('estimates', id, 'UPDATE', estimate);
    }
    
    return estimate;
  }

  async deleteEstimate(id: string): Promise<boolean> {
    const estimate = await this.getEstimateById(id);
    if (!estimate) return false;

    // Delete line items first
    await db.delete(estimateLineItems).where(eq(estimateLineItems.estimateId, id));
    
    // Then delete the estimate
    await db.delete(estimates).where(eq(estimates.id, id));
    
    await this.sendWebhook('estimates', id, 'DELETE', undefined, estimate);
    
    return true;
  }

  // Estimate Line Item methods
  async getEstimateLineItems(estimateId: string): Promise<EstimateLineItem[]> {
    return await db
      .select()
      .from(estimateLineItems)
      .where(eq(estimateLineItems.estimateId, estimateId));
  }

  async createEstimateLineItem(lineItemData: InsertEstimateLineItem): Promise<EstimateLineItem> {
    // Calculate line total
    const lineTotal = lineItemData.quantity * Number(lineItemData.unitPrice);

    const [lineItem] = await db
      .insert(estimateLineItems)
      .values({
        ...lineItemData,
        lineTotal,
      })
      .returning();

    await this.sendWebhook('estimate_line_items', lineItem.id, 'INSERT', lineItem);
    
    return lineItem;
  }

  async updateEstimateLineItem(id: string, lineItemData: Partial<EstimateLineItem>): Promise<EstimateLineItem | undefined> {
    // Recalculate line total if quantity or unitPrice changed
    let updatedData = { ...lineItemData };
    
    if (lineItemData.quantity !== undefined || lineItemData.unitPrice !== undefined) {
      const [currentLineItem] = await db
        .select()
        .from(estimateLineItems)
        .where(eq(estimateLineItems.id, id));
      
      if (currentLineItem) {
        const quantity = lineItemData.quantity ?? currentLineItem.quantity;
        const unitPrice = lineItemData.unitPrice ?? currentLineItem.unitPrice;
        updatedData.lineTotal = quantity * Number(unitPrice);
      }
    }

    const [lineItem] = await db
      .update(estimateLineItems)
      .set({
        ...updatedData,
        updatedAt: new Date(),
      })
      .where(eq(estimateLineItems.id, id))
      .returning();

    if (lineItem) {
      await this.sendWebhook('estimate_line_items', id, 'UPDATE', lineItem);
    }
    
    return lineItem;
  }

  async deleteEstimateLineItem(id: string): Promise<boolean> {
    const [lineItem] = await db
      .select()
      .from(estimateLineItems)
      .where(eq(estimateLineItems.id, id));
    
    if (!lineItem) return false;

    await db.delete(estimateLineItems).where(eq(estimateLineItems.id, id));
    
    await this.sendWebhook('estimate_line_items', id, 'DELETE', undefined, lineItem);
    
    return true;
  }

  // Invoice methods
  async getInvoices(): Promise<Invoice[]> {
    return await db
      .select()
      .from(invoices)
      .orderBy(desc(invoices.issueDate));
  }
  
  async getRecentInvoices(limit: number = 5): Promise<Invoice[]> {
    return await db
      .select()
      .from(invoices)
      .orderBy(desc(invoices.issueDate))
      .limit(limit);
  }

  async getInvoiceById(id: string): Promise<Invoice | undefined> {
    const [invoice] = await db
      .select()
      .from(invoices)
      .where(eq(invoices.id, id));
    return invoice;
  }

  async getInvoiceWithLineItems(id: string): Promise<{ invoice: Invoice, lineItems: InvoiceLineItem[] } | undefined> {
    const invoice = await this.getInvoiceById(id);
    if (!invoice) return undefined;

    const lineItems = await this.getInvoiceLineItems(id);
    
    return { invoice, lineItems };
  }

  async createInvoice(invoiceData: InsertInvoice): Promise<Invoice> {
    // Generate a unique invoice UID (e.g., INV-XXXX)
    const uniqueId = createId().slice(0, 6).toUpperCase();
    const invoiceUid = `INV-${uniqueId}`;

    const [invoice] = await db
      .insert(invoices)
      .values({
        ...invoiceData,
        invoiceUid,
      })
      .returning();

    await this.sendWebhook('invoices', invoice.id, 'INSERT', invoice);
    
    // Queue PDF generation
    await this.queuePdfGeneration('invoice', invoice.id);
    
    return invoice;
  }

  async updateInvoice(id: string, invoiceData: Partial<Invoice>): Promise<Invoice | undefined> {
    const [invoice] = await db
      .update(invoices)
      .set({
        ...invoiceData,
        updatedAt: new Date(),
      })
      .where(eq(invoices.id, id))
      .returning();

    if (invoice) {
      await this.sendWebhook('invoices', id, 'UPDATE', invoice);
      
      // Queue updated PDF generation
      await this.queuePdfGeneration('invoice', id);
    }
    
    return invoice;
  }

  async deleteInvoice(id: string): Promise<boolean> {
    const invoice = await this.getInvoiceById(id);
    if (!invoice) return false;

    // Delete line items first
    await db.delete(invoiceLineItems).where(eq(invoiceLineItems.invoiceId, id));
    
    // Then delete the invoice
    await db.delete(invoices).where(eq(invoices.id, id));
    
    await this.sendWebhook('invoices', id, 'DELETE', undefined, invoice);
    
    return true;
  }

  // Invoice Line Item methods
  async getInvoiceLineItems(invoiceId: string): Promise<InvoiceLineItem[]> {
    return await db
      .select()
      .from(invoiceLineItems)
      .where(eq(invoiceLineItems.invoiceId, invoiceId));
  }

  async createInvoiceLineItem(lineItemData: InsertInvoiceLineItem): Promise<InvoiceLineItem> {
    // Calculate line total
    const lineTotal = lineItemData.quantity * Number(lineItemData.unitPrice);

    const [lineItem] = await db
      .insert(invoiceLineItems)
      .values({
        ...lineItemData,
        lineTotal,
      })
      .returning();

    await this.sendWebhook('invoice_line_items', lineItem.id, 'INSERT', lineItem);
    
    return lineItem;
  }

  async updateInvoiceLineItem(id: string, lineItemData: Partial<InvoiceLineItem>): Promise<InvoiceLineItem | undefined> {
    // Recalculate line total if quantity or unitPrice changed
    let updatedData = { ...lineItemData };
    
    if (lineItemData.quantity !== undefined || lineItemData.unitPrice !== undefined) {
      const [currentLineItem] = await db
        .select()
        .from(invoiceLineItems)
        .where(eq(invoiceLineItems.id, id));
      
      if (currentLineItem) {
        const quantity = lineItemData.quantity ?? currentLineItem.quantity;
        const unitPrice = lineItemData.unitPrice ?? currentLineItem.unitPrice;
        updatedData.lineTotal = quantity * Number(unitPrice);
      }
    }

    const [lineItem] = await db
      .update(invoiceLineItems)
      .set({
        ...updatedData,
        updatedAt: new Date(),
      })
      .where(eq(invoiceLineItems.id, id))
      .returning();

    if (lineItem) {
      await this.sendWebhook('invoice_line_items', id, 'UPDATE', lineItem);
    }
    
    return lineItem;
  }

  async deleteInvoiceLineItem(id: string): Promise<boolean> {
    const [lineItem] = await db
      .select()
      .from(invoiceLineItems)
      .where(eq(invoiceLineItems.id, id));
    
    if (!lineItem) return false;

    await db.delete(invoiceLineItems).where(eq(invoiceLineItems.id, id));
    
    await this.sendWebhook('invoice_line_items', id, 'DELETE', undefined, lineItem);
    
    return true;
  }

  // Purchase Order methods
  async getPurchaseOrders(): Promise<PurchaseOrder[]> {
    return await db
      .select()
      .from(purchaseOrders)
      .orderBy(desc(purchaseOrders.issueDate));
  }

  async getPurchaseOrderById(id: string): Promise<PurchaseOrder | undefined> {
    const [purchaseOrder] = await db
      .select()
      .from(purchaseOrders)
      .where(eq(purchaseOrders.id, id));
    return purchaseOrder;
  }

  async getPurchaseOrderWithLines(id: string): Promise<{ purchaseOrder: PurchaseOrder, lines: PurchaseOrderLine[] } | undefined> {
    const purchaseOrder = await this.getPurchaseOrderById(id);
    if (!purchaseOrder) return undefined;

    const lines = await this.getPurchaseOrderLines(id);
    
    return { purchaseOrder, lines };
  }

  async createPurchaseOrder(poData: InsertPurchaseOrder): Promise<PurchaseOrder> {
    // Generate a unique PO UID (e.g., PO-XXXX)
    const uniqueId = createId().slice(0, 6).toUpperCase();
    const poUid = `PO-${uniqueId}`;

    const [purchaseOrder] = await db
      .insert(purchaseOrders)
      .values({
        ...poData,
        poUid,
      })
      .returning();

    await this.sendWebhook('purchase_orders', purchaseOrder.id, 'INSERT', purchaseOrder);
    
    // Queue PDF generation
    await this.queuePdfGeneration('purchase_order', purchaseOrder.id);
    
    return purchaseOrder;
  }

  async updatePurchaseOrder(id: string, poData: Partial<PurchaseOrder>): Promise<PurchaseOrder | undefined> {
    const [purchaseOrder] = await db
      .update(purchaseOrders)
      .set({
        ...poData,
        updatedAt: new Date(),
      })
      .where(eq(purchaseOrders.id, id))
      .returning();

    if (purchaseOrder) {
      await this.sendWebhook('purchase_orders', id, 'UPDATE', purchaseOrder);
      
      // Queue updated PDF generation
      await this.queuePdfGeneration('purchase_order', id);
    }
    
    return purchaseOrder;
  }

  async deletePurchaseOrder(id: string): Promise<boolean> {
    const purchaseOrder = await this.getPurchaseOrderById(id);
    if (!purchaseOrder) return false;

    // Delete lines first
    await db.delete(purchaseOrderLines).where(eq(purchaseOrderLines.purchaseOrderId, id));
    
    // Then delete the purchase order
    await db.delete(purchaseOrders).where(eq(purchaseOrders.id, id));
    
    await this.sendWebhook('purchase_orders', id, 'DELETE', undefined, purchaseOrder);
    
    return true;
  }

  // Purchase Order Line methods
  async getPurchaseOrderLines(purchaseOrderId: string): Promise<PurchaseOrderLine[]> {
    return await db
      .select()
      .from(purchaseOrderLines)
      .where(eq(purchaseOrderLines.purchaseOrderId, purchaseOrderId));
  }

  async createPurchaseOrderLine(lineData: InsertPurchaseOrderLine): Promise<PurchaseOrderLine> {
    // Calculate line total
    const lineTotal = lineData.quantity * Number(lineData.unitCost);

    const [line] = await db
      .insert(purchaseOrderLines)
      .values({
        ...lineData,
        lineTotal,
      })
      .returning();

    await this.sendWebhook('purchase_order_lines', line.id, 'INSERT', line);
    
    return line;
  }

  async updatePurchaseOrderLine(id: string, lineData: Partial<PurchaseOrderLine>): Promise<PurchaseOrderLine | undefined> {
    // Recalculate line total if quantity or unitCost changed
    let updatedData = { ...lineData };
    
    if (lineData.quantity !== undefined || lineData.unitCost !== undefined) {
      const [currentLine] = await db
        .select()
        .from(purchaseOrderLines)
        .where(eq(purchaseOrderLines.id, id));
      
      if (currentLine) {
        const quantity = lineData.quantity ?? currentLine.quantity;
        const unitCost = lineData.unitCost ?? currentLine.unitCost;
        updatedData.lineTotal = quantity * Number(unitCost);
      }
    }

    const [line] = await db
      .update(purchaseOrderLines)
      .set({
        ...updatedData,
        updatedAt: new Date(),
      })
      .where(eq(purchaseOrderLines.id, id))
      .returning();

    if (line) {
      await this.sendWebhook('purchase_order_lines', id, 'UPDATE', line);
    }
    
    return line;
  }

  async deletePurchaseOrderLine(id: string): Promise<boolean> {
    const [line] = await db
      .select()
      .from(purchaseOrderLines)
      .where(eq(purchaseOrderLines.id, id));
    
    if (!line) return false;

    await db.delete(purchaseOrderLines).where(eq(purchaseOrderLines.id, id));
    
    await this.sendWebhook('purchase_order_lines', id, 'DELETE', undefined, line);
    
    return true;
  }

  // Customer Payment methods
  async getCustomerPayments(): Promise<CustomerPayment[]> {
    return await db
      .select()
      .from(customerPayments)
      .orderBy(desc(customerPayments.paymentDate));
  }

  async getCustomerPaymentById(id: string): Promise<CustomerPayment | undefined> {
    const [payment] = await db
      .select()
      .from(customerPayments)
      .where(eq(customerPayments.id, id));
    return payment;
  }

  async getCustomerPaymentsByInvoiceId(invoiceId: string): Promise<CustomerPayment[]> {
    return await db
      .select()
      .from(customerPayments)
      .where(eq(customerPayments.invoiceId, invoiceId))
      .orderBy(desc(customerPayments.paymentDate));
  }

  async createCustomerPayment(paymentData: InsertCustomerPayment): Promise<CustomerPayment> {
    const [payment] = await db
      .insert(customerPayments)
      .values(paymentData)
      .returning();

    await this.sendWebhook('customer_payments', payment.id, 'INSERT', payment);
    
    return payment;
  }

  async updateCustomerPayment(id: string, paymentData: Partial<CustomerPayment>): Promise<CustomerPayment | undefined> {
    const [payment] = await db
      .update(customerPayments)
      .set({
        ...paymentData,
        updatedAt: new Date(),
      })
      .where(eq(customerPayments.id, id))
      .returning();

    if (payment) {
      await this.sendWebhook('customer_payments', id, 'UPDATE', payment);
    }
    
    return payment;
  }

  async deleteCustomerPayment(id: string): Promise<boolean> {
    const payment = await this.getCustomerPaymentById(id);
    if (!payment) return false;

    await db.delete(customerPayments).where(eq(customerPayments.id, id));
    
    await this.sendWebhook('customer_payments', id, 'DELETE', undefined, payment);
    
    return true;
  }

  // Vendor Payment methods
  async getVendorPayments(): Promise<VendorPayment[]> {
    return await db
      .select()
      .from(vendorPayments)
      .orderBy(desc(vendorPayments.paymentDate));
  }

  async getVendorPaymentById(id: string): Promise<VendorPayment | undefined> {
    const [payment] = await db
      .select()
      .from(vendorPayments)
      .where(eq(vendorPayments.id, id));
    return payment;
  }

  async getVendorPaymentsByPurchaseOrderId(purchaseOrderId: string): Promise<VendorPayment[]> {
    return await db
      .select()
      .from(vendorPayments)
      .where(eq(vendorPayments.purchaseOrderId, purchaseOrderId))
      .orderBy(desc(vendorPayments.paymentDate));
  }

  async createVendorPayment(paymentData: InsertVendorPayment): Promise<VendorPayment> {
    const [payment] = await db
      .insert(vendorPayments)
      .values(paymentData)
      .returning();

    await this.sendWebhook('vendor_payments', payment.id, 'INSERT', payment);
    
    return payment;
  }

  async updateVendorPayment(id: string, paymentData: Partial<VendorPayment>): Promise<VendorPayment | undefined> {
    const [payment] = await db
      .update(vendorPayments)
      .set({
        ...paymentData,
        updatedAt: new Date(),
      })
      .where(eq(vendorPayments.id, id))
      .returning();

    if (payment) {
      await this.sendWebhook('vendor_payments', id, 'UPDATE', payment);
    }
    
    return payment;
  }

  async deleteVendorPayment(id: string): Promise<boolean> {
    const payment = await this.getVendorPaymentById(id);
    if (!payment) return false;

    await db.delete(vendorPayments).where(eq(vendorPayments.id, id));
    
    await this.sendWebhook('vendor_payments', id, 'DELETE', undefined, payment);
    
    return true;
  }

  // Customer Credit methods
  async getCustomerCredits(): Promise<CustomerCredit[]> {
    return await db
      .select()
      .from(customerCredits)
      .orderBy(desc(customerCredits.issueDate));
  }

  async getCustomerCreditById(id: string): Promise<CustomerCredit | undefined> {
    const [credit] = await db
      .select()
      .from(customerCredits)
      .where(eq(customerCredits.id, id));
    return credit;
  }

  async getCustomerCreditsByInvoiceId(invoiceId: string): Promise<CustomerCredit[]> {
    return await db
      .select()
      .from(customerCredits)
      .where(eq(customerCredits.invoiceId, invoiceId))
      .orderBy(desc(customerCredits.issueDate));
  }

  async getCustomerCreditsByEstimateId(estimateId: string): Promise<CustomerCredit[]> {
    return await db
      .select()
      .from(customerCredits)
      .where(eq(customerCredits.estimateId, estimateId))
      .orderBy(desc(customerCredits.issueDate));
  }

  async createCustomerCredit(creditData: InsertCustomerCredit): Promise<CustomerCredit> {
    const [credit] = await db
      .insert(customerCredits)
      .values(creditData)
      .returning();

    await this.sendWebhook('customer_credits', credit.id, 'INSERT', credit);
    
    return credit;
  }

  async updateCustomerCredit(id: string, creditData: Partial<CustomerCredit>): Promise<CustomerCredit | undefined> {
    const [credit] = await db
      .update(customerCredits)
      .set({
        ...creditData,
        updatedAt: new Date(),
      })
      .where(eq(customerCredits.id, id))
      .returning();

    if (credit) {
      await this.sendWebhook('customer_credits', id, 'UPDATE', credit);
    }
    
    return credit;
  }

  async deleteCustomerCredit(id: string): Promise<boolean> {
    const credit = await this.getCustomerCreditById(id);
    if (!credit) return false;

    await db.delete(customerCredits).where(eq(customerCredits.id, id));
    
    await this.sendWebhook('customer_credits', id, 'DELETE', undefined, credit);
    
    return true;
  }

  // Expense methods
  async getExpenses(): Promise<Expense[]> {
    return await db
      .select()
      .from(expenses)
      .orderBy(desc(expenses.date));
  }

  async getExpenseById(id: string): Promise<Expense | undefined> {
    const [expense] = await db
      .select()
      .from(expenses)
      .where(eq(expenses.id, id));
    return expense;
  }

  async createExpense(expenseData: InsertExpense): Promise<Expense> {
    const [expense] = await db
      .insert(expenses)
      .values(expenseData)
      .returning();
    
    await this.sendWebhook('expenses', expense.id, 'INSERT', expense);
    
    return expense;
  }

  async updateExpense(id: string, expenseData: Partial<Expense>): Promise<Expense | undefined> {
    const [expense] = await db
      .update(expenses)
      .set({
        ...expenseData,
        updatedAt: new Date(),
      })
      .where(eq(expenses.id, id))
      .returning();

    if (expense) {
      await this.sendWebhook('expenses', id, 'UPDATE', expense);
    }
    
    return expense;
  }

  async deleteExpense(id: string): Promise<boolean> {
    const expense = await this.getExpenseById(id);
    if (!expense) return false;

    await db.delete(expenses).where(eq(expenses.id, id));
    
    await this.sendWebhook('expenses', id, 'DELETE', undefined, expense);
    
    return true;
  }

  // Message methods
  async getMessages(): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .orderBy(desc(messages.createdAt));
  }

  async getMessageById(id: string): Promise<Message | undefined> {
    const [message] = await db
      .select()
      .from(messages)
      .where(eq(messages.id, id));
    return message;
  }

  async createMessage(messageData: InsertMessage): Promise<Message> {
    const [message] = await db
      .insert(messages)
      .values(messageData)
      .returning();

    await this.sendWebhook('messages', message.id, 'INSERT', message);
    
    return message;
  }

  async updateMessage(id: string, messageData: Partial<Message>): Promise<Message | undefined> {
    const [message] = await db
      .update(messages)
      .set({
        ...messageData,
        updatedAt: new Date(),
      })
      .where(eq(messages.id, id))
      .returning();

    if (message) {
      await this.sendWebhook('messages', id, 'UPDATE', message);
    }
    
    return message;
  }

  async deleteMessage(id: string): Promise<boolean> {
    const message = await this.getMessageById(id);
    if (!message) return false;

    await db.delete(messages).where(eq(messages.id, id));
    
    await this.sendWebhook('messages', id, 'DELETE', undefined, message);
    
    return true;
  }

  // Portal Access methods
  async getPortalAccessByAccountId(accountId: string): Promise<PortalAccess | undefined> {
    const [access] = await db
      .select()
      .from(portalAccess)
      .where(
        and(
          eq(portalAccess.accountId, accountId),
          eq(portalAccess.isActive, true)
        )
      );
    return access;
  }

  async createPortalAccess(accessData: InsertPortalAccess): Promise<PortalAccess> {
    // Hash the PIN
    const hashedPin = await hash(accessData.pin, 10);

    const [access] = await db
      .insert(portalAccess)
      .values({
        ...accessData,
        pin: hashedPin,
      })
      .returning();
    
    return access;
  }

  async updatePortalAccess(id: string, accessData: Partial<PortalAccess>): Promise<PortalAccess | undefined> {
    let dataToUpdate = { ...accessData };
    
    // Hash the PIN if it's being updated
    if (accessData.pin) {
      dataToUpdate.pin = await hash(accessData.pin, 10);
    }

    const [access] = await db
      .update(portalAccess)
      .set({
        ...dataToUpdate,
        updatedAt: new Date(),
      })
      .where(eq(portalAccess.id, id))
      .returning();
    
    return access;
  }

  async validatePortalPIN(accountId: string, pin: string): Promise<boolean> {
    const access = await this.getPortalAccessByAccountId(accountId);
    if (!access) return false;

    return compare(pin, access.pin);
  }

  // Dashboard data
  async getDashboardSummary(): Promise<DashboardSummary> {
    // Fetch real data from postgres database
    
    // Get counts using Drizzle ORM's count function
    let totalInvoices = 0;
    let totalProducts = 0;
    let totalAccounts = 0;
    
    try {
      const invoiceResult = await db.select({ count: sql`count(*)` }).from(invoices);
      totalInvoices = Number(invoiceResult[0]?.count || 0);
      
      const productResult = await db.select({ count: sql`count(*)` }).from(products);
      totalProducts = Number(productResult[0]?.count || 0);
      
      const accountResult = await db.select({ count: sql`count(*)` }).from(accounts);
      totalAccounts = Number(accountResult[0]?.count || 0);
    } catch (error) {
      console.error("Error counting records:", error);
    }
    
    // Currently a mock implementation - in production would use database queries
    return {
      kpis: {
        totalRevenue: {
          value: 128430.50,
          label: "Total Revenue",
          changePercent: 12.5,
          changeDirection: 'up',
          icon: 'dollar-sign'
        },
        accountsReceivable: {
          value: 42150.75,
          label: "Accounts Receivable",
          changePercent: 8.3,
          changeDirection: 'up',
          icon: 'file-invoice-dollar'
        },
        accountsPayable: {
          value: 31875.24,
          label: "Accounts Payable",
          changePercent: 5.2,
          changeDirection: 'down',
          icon: 'shopping-cart'
        },
        inventoryValue: {
          value: 84320.00,
          label: "Inventory Value",
          changePercent: 3.7,
          changeDirection: 'up',
          icon: 'boxes'
        }
      },
      recentActivity: [
        {
          id: '1',
          type: 'invoice',
          message: 'New invoice created',
          subText: 'INV-2023-042 for Client XYZ',
          timestamp: new Date(Date.now() - 10 * 60000), // 10 minutes ago
          read: false
        },
        {
          id: '2',
          type: 'payment',
          message: 'Payment received',
          subText: '$3,250.00 for INV-2023-038',
          timestamp: new Date(Date.now() - 60 * 60000), // 1 hour ago
          read: false
        },
        {
          id: '3',
          type: 'inventory',
          message: 'Low inventory alert',
          subText: 'Product SKU-7890 below threshold',
          timestamp: new Date(Date.now() - 2 * 60 * 60000), // 2 hours ago
          read: true
        },
        {
          id: '4',
          type: 'purchase_order',
          message: 'Purchase order created',
          subText: 'PO-2023-015 with Vendor ABC',
          timestamp: new Date(Date.now() - 4 * 60 * 60000), // 4 hours ago
          read: true
        }
      ],
      financialSummary: [
        { period: 'Jan', revenue: 35000, expenses: 25000, profit: 10000 },
        { period: 'Feb', revenue: 32000, expenses: 24000, profit: 8000 },
        { period: 'Mar', revenue: 38000, expenses: 26000, profit: 12000 },
        { period: 'Apr', revenue: 40000, expenses: 28000, profit: 12000 },
        { period: 'May', revenue: 45000, expenses: 30000, profit: 15000 },
        { period: 'Jun', revenue: 42000, expenses: 28000, profit: 14000 }
      ],
      recentInvoices: await this.getRecentInvoices(),
      inventoryStatus: await this.getProductsWithInventory()
    };
  }

  // PDF queue management
  async queuePdfGeneration(recordType: string, recordId: string): Promise<void> {
    await db
      .insert(pdfQueue)
      .values({
        recordType,
        recordId,
        status: 'pending',
      });
    
    // In a production environment, we'd also trigger a job to process the PDF queue
  }

  // Webhook sending
  async sendWebhook(
    table: string, 
    id: string, 
    op: 'INSERT' | 'UPDATE' | 'DELETE', 
    row?: any, 
    old_row?: any
  ): Promise<void> {
    try {
      const webhookUrl = process.env.WEBHOOK_HANDLER_URL || 'http://localhost:3000/webhook';
      
      const payload = {
        table,
        id,
        op,
        row,
        old_row
      };
      
      // Send webhook asynchronously to not block operations
      axios.post(webhookUrl, payload).catch(err => {
        console.error(`Failed to send webhook for ${table} ${id}:`, err.message);
      });
    } catch (error) {
      console.error(`Error sending webhook for ${table} ${id}:`, error);
    }
  }
}

export const storage = new DatabaseStorage();
