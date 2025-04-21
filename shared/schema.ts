import { pgTable, text, uuid, timestamp, boolean, integer, decimal, jsonb, varchar } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table for authentication
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  role: text("role").notNull().default("admin"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  expenses: many(expenses),
}));

// Accounts table (Clients/Vendors)
export const accounts = pgTable("accounts", {
  id: uuid("id").primaryKey().defaultRandom(),
  glideRowId: text("glide_row_id").unique(),
  accountUid: text("account_uid").unique(),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
  isVendor: boolean("is_vendor").default(false),
  isCustomer: boolean("is_customer").default(false),
  customerBalance: decimal("customer_balance", { precision: 10, scale: 2 }).default("0"),
  vendorBalance: decimal("vendor_balance", { precision: 10, scale: 2 }).default("0"),
  netBalance: decimal("net_balance", { precision: 10, scale: 2 }).default("0"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const accountsRelations = relations(accounts, ({ many }) => ({
  estimates: many(estimates),
  invoices: many(invoices),
  purchaseOrders: many(purchaseOrders),
  customerPayments: many(customerPayments),
  vendorPayments: many(vendorPayments),
  customerCredits: many(customerCredits),
  products: many(products),
}));

// Products table
export const products = pgTable("products", {
  id: uuid("id").primaryKey().defaultRandom(),
  glideRowId: text("glide_row_id").unique(),
  sku: text("sku").unique().notNull(),
  name: text("name").notNull(),
  displayName: text("display_name"),
  description: text("description"),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  unitCost: decimal("unit_cost", { precision: 10, scale: 2 }),
  stockQuantity: integer("stock_quantity").default(0),
  reorderLevel: integer("reorder_level").default(5),
  vendorId: uuid("vendor_id").references(() => accounts.id),
  rowid_vendor: text("rowid_vendor"),
  publicUrlPhoto: text("public_url_photo"),
  publicUrlVideo: text("public_url_video"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const productsRelations = relations(products, ({ one, many }) => ({
  vendor: one(accounts, {
    fields: [products.vendorId],
    references: [accounts.id],
  }),
  estimateLineItems: many(estimateLineItems),
  invoiceLineItems: many(invoiceLineItems),
  purchaseOrderLines: many(purchaseOrderLines),
  vendorPayments: many(vendorPayments),
  messages: many(messages),
}));

// Estimates table (without the invoice reference for now)
export const estimates = pgTable("estimates", {
  id: uuid("id").primaryKey().defaultRandom(),
  glideRowId: text("glide_row_id").unique(),
  estimateUid: text("estimate_uid").unique(),
  accountId: uuid("account_id").references(() => accounts.id).notNull(),
  rowid_account: text("rowid_account"),
  issueDate: timestamp("issue_date").defaultNow().notNull(),
  expiryDate: timestamp("expiry_date"),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).default("0"),
  totalCredits: decimal("total_credits", { precision: 10, scale: 2 }).default("0"),
  balance: decimal("balance", { precision: 10, scale: 2 }).default("0"),
  notes: text("notes"),
  convertedToInvoice: boolean("converted_to_invoice").default(false),
  invoiceId: uuid("invoice_id"),
  status: text("status").default("draft"), // draft, sent, accepted, rejected, expired
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const estimatesRelations = relations(estimates, ({ one, many }) => ({
  account: one(accounts, {
    fields: [estimates.accountId],
    references: [accounts.id],
  }),
  invoice: one(invoices, {
    fields: [estimates.invoiceId],
    references: [invoices.id],
  }),
  lineItems: many(estimateLineItems),
  credits: many(customerCredits),
}));

// Estimate Line Items table
export const estimateLineItems = pgTable("estimate_line_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  glideRowId: text("glide_row_id").unique(),
  estimateId: uuid("estimate_id").references(() => estimates.id).notNull(),
  rowid_estimate: text("rowid_estimate"),
  productId: uuid("product_id").references(() => products.id),
  rowid_product: text("rowid_product"),
  description: text("description").notNull(),
  displayName: text("display_name"),
  quantity: integer("quantity").notNull().default(1),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  lineTotal: decimal("line_total", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const estimateLineItemsRelations = relations(estimateLineItems, ({ one }) => ({
  estimate: one(estimates, {
    fields: [estimateLineItems.estimateId],
    references: [estimates.id],
  }),
  product: one(products, {
    fields: [estimateLineItems.productId],
    references: [products.id],
  }),
}));

// Invoices table
export const invoices = pgTable("invoices", {
  id: uuid("id").primaryKey().defaultRandom(),
  glideRowId: text("glide_row_id").unique(),
  invoiceUid: text("invoice_uid").unique(),
  accountId: uuid("account_id").references(() => accounts.id).notNull(),
  rowid_account: text("rowid_account"),
  estimateId: uuid("estimate_id").references(() => estimates.id),
  rowid_estimate: text("rowid_estimate"),
  issueDate: timestamp("issue_date").defaultNow().notNull(),
  dueDate: timestamp("due_date"),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).default("0"),
  totalPaid: decimal("total_paid", { precision: 10, scale: 2 }).default("0"),
  totalCredits: decimal("total_credits", { precision: 10, scale: 2 }).default("0"),
  balance: decimal("balance", { precision: 10, scale: 2 }).default("0"),
  paymentStatus: text("payment_status").default("pending"), // pending, partial, paid, overdue
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const invoicesRelations = relations(invoices, ({ one, many }) => ({
  account: one(accounts, {
    fields: [invoices.accountId],
    references: [accounts.id],
  }),
  estimate: one(estimates, {
    fields: [invoices.estimateId],
    references: [estimates.id],
  }),
  lineItems: many(invoiceLineItems),
  payments: many(customerPayments),
  credits: many(customerCredits),
}));

// Invoice Line Items table
export const invoiceLineItems = pgTable("invoice_line_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  glideRowId: text("glide_row_id").unique(),
  invoiceId: uuid("invoice_id").references(() => invoices.id).notNull(),
  rowid_invoice: text("rowid_invoice"),
  productId: uuid("product_id").references(() => products.id),
  rowid_product: text("rowid_product"),
  description: text("description").notNull(),
  displayName: text("display_name"),
  quantity: integer("quantity").notNull().default(1),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  lineTotal: decimal("line_total", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const invoiceLineItemsRelations = relations(invoiceLineItems, ({ one }) => ({
  invoice: one(invoices, {
    fields: [invoiceLineItems.invoiceId],
    references: [invoices.id],
  }),
  product: one(products, {
    fields: [invoiceLineItems.productId],
    references: [products.id],
  }),
}));

// Purchase Orders table
export const purchaseOrders = pgTable("purchase_orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  glideRowId: text("glide_row_id").unique(),
  poUid: text("po_uid").unique(),
  accountId: uuid("account_id").references(() => accounts.id).notNull(),
  rowid_account: text("rowid_account"),
  issueDate: timestamp("issue_date").defaultNow().notNull(),
  expectedDate: timestamp("expected_date"),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).default("0"),
  totalPaid: decimal("total_paid", { precision: 10, scale: 2 }).default("0"),
  balance: decimal("balance", { precision: 10, scale: 2 }).default("0"),
  paymentStatus: text("payment_status").default("pending"), // pending, partial, paid, overdue
  productCount: integer("product_count").default(0),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const purchaseOrdersRelations = relations(purchaseOrders, ({ one, many }) => ({
  account: one(accounts, {
    fields: [purchaseOrders.accountId],
    references: [accounts.id],
  }),
  lines: many(purchaseOrderLines),
  payments: many(vendorPayments),
}));

// Purchase Order Lines table
export const purchaseOrderLines = pgTable("purchase_order_lines", {
  id: uuid("id").primaryKey().defaultRandom(),
  glideRowId: text("glide_row_id").unique(),
  purchaseOrderId: uuid("purchase_order_id").references(() => purchaseOrders.id).notNull(),
  rowid_purchase_order: text("rowid_purchase_order"),
  productId: uuid("product_id").references(() => products.id),
  rowid_product: text("rowid_product"),
  description: text("description").notNull(),
  quantity: integer("quantity").notNull().default(1),
  unitCost: decimal("unit_cost", { precision: 10, scale: 2 }).notNull(),
  lineTotal: decimal("line_total", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const purchaseOrderLinesRelations = relations(purchaseOrderLines, ({ one }) => ({
  purchaseOrder: one(purchaseOrders, {
    fields: [purchaseOrderLines.purchaseOrderId],
    references: [purchaseOrders.id],
  }),
  product: one(products, {
    fields: [purchaseOrderLines.productId],
    references: [products.id],
  }),
}));

// Customer Payments table
export const customerPayments = pgTable("customer_payments", {
  id: uuid("id").primaryKey().defaultRandom(),
  glideRowId: text("glide_row_id").unique(),
  accountId: uuid("account_id").references(() => accounts.id).notNull(),
  rowid_account: text("rowid_account"),
  invoiceId: uuid("invoice_id").references(() => invoices.id).notNull(),
  rowid_invoice: text("rowid_invoice"),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  paymentDate: timestamp("payment_date").defaultNow().notNull(),
  paymentMethod: text("payment_method"),
  status: text("status").default("pending"), // pending, approved, rejected
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const customerPaymentsRelations = relations(customerPayments, ({ one }) => ({
  account: one(accounts, {
    fields: [customerPayments.accountId],
    references: [accounts.id],
  }),
  invoice: one(invoices, {
    fields: [customerPayments.invoiceId],
    references: [invoices.id],
  }),
}));

// Vendor Payments table
export const vendorPayments = pgTable("vendor_payments", {
  id: uuid("id").primaryKey().defaultRandom(),
  glideRowId: text("glide_row_id").unique(),
  accountId: uuid("account_id").references(() => accounts.id).notNull(),
  rowid_account: text("rowid_account"),
  purchaseOrderId: uuid("purchase_order_id").references(() => purchaseOrders.id).notNull(),
  rowid_purchase_order: text("rowid_purchase_order"),
  productId: uuid("product_id").references(() => products.id),
  rowid_product: text("rowid_product"),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  paymentDate: timestamp("payment_date").defaultNow().notNull(),
  paymentMethod: text("payment_method"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const vendorPaymentsRelations = relations(vendorPayments, ({ one }) => ({
  account: one(accounts, {
    fields: [vendorPayments.accountId],
    references: [accounts.id],
  }),
  purchaseOrder: one(purchaseOrders, {
    fields: [vendorPayments.purchaseOrderId],
    references: [purchaseOrders.id],
  }),
  product: one(products, {
    fields: [vendorPayments.productId],
    references: [products.id],
  }),
}));

// Customer Credits table
export const customerCredits = pgTable("customer_credits", {
  id: uuid("id").primaryKey().defaultRandom(),
  glideRowId: text("glide_row_id").unique(),
  accountId: uuid("account_id").references(() => accounts.id).notNull(),
  rowid_account: text("rowid_account"),
  invoiceId: uuid("invoice_id").references(() => invoices.id),
  rowid_invoice: text("rowid_invoice"),
  estimateId: uuid("estimate_id").references(() => estimates.id),
  rowid_estimate: text("rowid_estimate"),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  issueDate: timestamp("issue_date").defaultNow().notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const customerCreditsRelations = relations(customerCredits, ({ one }) => ({
  account: one(accounts, {
    fields: [customerCredits.accountId],
    references: [accounts.id],
  }),
  invoice: one(invoices, {
    fields: [customerCredits.invoiceId],
    references: [invoices.id],
  }),
  estimate: one(estimates, {
    fields: [customerCredits.estimateId],
    references: [estimates.id],
  }),
}));

// Expenses table
export const expenses = pgTable("expenses", {
  id: uuid("id").primaryKey().defaultRandom(),
  glideRowId: text("glide_row_id").unique(),
  userId: uuid("user_id").references(() => users.id),
  rowid_user: text("rowid_user"),
  description: text("description").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  date: timestamp("date").defaultNow().notNull(),
  category: text("category"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const expensesRelations = relations(expenses, ({ one }) => ({
  user: one(users, {
    fields: [expenses.userId],
    references: [users.id],
  }),
}));

// Messages table
export const messages = pgTable("messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  glideRowId: text("glide_row_id").unique(),
  source: text("source").notNull(), // e.g. 'telegram'
  messageId: text("message_id").notNull(),
  content: text("content"),
  extractedData: jsonb("extracted_data"),
  productId: uuid("product_id").references(() => products.id),
  rowid_product: text("rowid_product"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const messagesRelations = relations(messages, ({ one }) => ({
  product: one(products, {
    fields: [messages.productId],
    references: [products.id],
  }),
}));

// PIN Access for secure customer/vendor portal
export const portalAccess = pgTable("portal_access", {
  id: uuid("id").primaryKey().defaultRandom(),
  accountId: uuid("account_id").references(() => accounts.id).notNull(),
  pin: varchar("pin", { length: 6 }).notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const portalAccessRelations = relations(portalAccess, ({ one }) => ({
  account: one(accounts, {
    fields: [portalAccess.accountId],
    references: [accounts.id],
  }),
}));

// PDF Generation Queue
export const pdfQueue = pgTable("pdf_queue", {
  id: uuid("id").primaryKey().defaultRandom(),
  recordType: text("record_type").notNull(), // invoice, estimate, purchase_order
  recordId: uuid("record_id").notNull(),
  status: text("status").default("pending"), // pending, processing, completed, failed
  pdfUrl: text("pdf_url"),
  attempts: integer("attempts").default(0),
  error: text("error"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Create insert schemas for validation
export const insertUserSchema = createInsertSchema(users).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

export const insertAccountSchema = createInsertSchema(accounts).omit({ 
  id: true, 
  accountUid: true, 
  customerBalance: true, 
  vendorBalance: true, 
  netBalance: true, 
  createdAt: true, 
  updatedAt: true 
});

export const insertProductSchema = createInsertSchema(products).omit({ 
  id: true, 
  displayName: true, 
  createdAt: true, 
  updatedAt: true 
});

export const insertEstimateSchema = createInsertSchema(estimates).omit({ 
  id: true, 
  estimateUid: true, 
  totalAmount: true, 
  totalCredits: true, 
  balance: true, 
  createdAt: true, 
  updatedAt: true 
});

export const insertEstimateLineItemSchema = createInsertSchema(estimateLineItems).omit({ 
  id: true, 
  displayName: true, 
  lineTotal: true, 
  createdAt: true, 
  updatedAt: true 
});

export const insertInvoiceSchema = createInsertSchema(invoices).omit({ 
  id: true, 
  invoiceUid: true, 
  totalAmount: true, 
  totalPaid: true, 
  totalCredits: true, 
  balance: true, 
  paymentStatus: true, 
  createdAt: true, 
  updatedAt: true 
});

export const insertInvoiceLineItemSchema = createInsertSchema(invoiceLineItems).omit({ 
  id: true, 
  displayName: true, 
  lineTotal: true, 
  createdAt: true, 
  updatedAt: true 
});

export const insertPurchaseOrderSchema = createInsertSchema(purchaseOrders).omit({ 
  id: true, 
  poUid: true, 
  totalAmount: true, 
  totalPaid: true, 
  balance: true, 
  paymentStatus: true, 
  productCount: true, 
  createdAt: true, 
  updatedAt: true 
});

export const insertPurchaseOrderLineSchema = createInsertSchema(purchaseOrderLines).omit({ 
  id: true, 
  lineTotal: true, 
  createdAt: true, 
  updatedAt: true 
});

export const insertCustomerPaymentSchema = createInsertSchema(customerPayments).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

export const insertVendorPaymentSchema = createInsertSchema(vendorPayments).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

export const insertCustomerCreditSchema = createInsertSchema(customerCredits).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

export const insertExpenseSchema = createInsertSchema(expenses).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

export const insertMessageSchema = createInsertSchema(messages).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

export const insertPortalAccessSchema = createInsertSchema(portalAccess).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Account = typeof accounts.$inferSelect;
export type InsertAccount = z.infer<typeof insertAccountSchema>;

export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;

export type Estimate = typeof estimates.$inferSelect;
export type InsertEstimate = z.infer<typeof insertEstimateSchema>;

export type EstimateLineItem = typeof estimateLineItems.$inferSelect;
export type InsertEstimateLineItem = z.infer<typeof insertEstimateLineItemSchema>;

export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;

export type InvoiceLineItem = typeof invoiceLineItems.$inferSelect;
export type InsertInvoiceLineItem = z.infer<typeof insertInvoiceLineItemSchema>;

export type PurchaseOrder = typeof purchaseOrders.$inferSelect;
export type InsertPurchaseOrder = z.infer<typeof insertPurchaseOrderSchema>;

export type PurchaseOrderLine = typeof purchaseOrderLines.$inferSelect;
export type InsertPurchaseOrderLine = z.infer<typeof insertPurchaseOrderLineSchema>;

export type CustomerPayment = typeof customerPayments.$inferSelect;
export type InsertCustomerPayment = z.infer<typeof insertCustomerPaymentSchema>;

export type VendorPayment = typeof vendorPayments.$inferSelect;
export type InsertVendorPayment = z.infer<typeof insertVendorPaymentSchema>;

export type CustomerCredit = typeof customerCredits.$inferSelect;
export type InsertCustomerCredit = z.infer<typeof insertCustomerCreditSchema>;

export type Expense = typeof expenses.$inferSelect;
export type InsertExpense = z.infer<typeof insertExpenseSchema>;

export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;

export type PortalAccess = typeof portalAccess.$inferSelect;
export type InsertPortalAccess = z.infer<typeof insertPortalAccessSchema>;
