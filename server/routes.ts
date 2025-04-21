import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { configurePassport, configureSession, isAuthenticated } from "./auth";
import passport from "passport";
import { webhookService } from "./webhooks";
import { z } from "zod";
import {
  insertUserSchema,
  insertContactSchema, // renamed from insertAccountSchema
  insertProductSchema,
  insertEstimateSchema,
  insertEstimateLineItemSchema,
  insertInvoiceSchema,
  insertInvoiceLineItemSchema,
  insertPurchaseOrderSchema,
  insertPurchaseOrderLineSchema,
  insertCustomerPaymentSchema,
  insertPurchaseOrderPaymentSchema, // renamed from insertVendorPaymentSchema
  insertEstimateCreditSchema, // renamed from insertCustomerCreditSchema
  insertExpenseSchema,
  insertMessageSchema,
  Contact
} from "@shared/schema";
import { PortalAuthRequest } from "@shared/types";

// Add Contact type to express-session
declare module 'express-session' {
  interface SessionData {
    portalContact?: Contact;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // Configure authentication
  configurePassport();
  configureSession(app);

  // Authentication Routes
  app.post("/api/auth/login", passport.authenticate("local"), (req, res) => {
    res.json({ user: req.user });
  });

  app.post("/api/auth/logout", (req, res) => {
    req.logout(() => {
      res.json({ success: true });
    });
  });

  app.get("/api/auth/session", (req, res) => {
    if (req.isAuthenticated()) {
      res.json({ user: req.user });
    } else {
      res.status(401).json({ message: "Not authenticated" });
    }
  });

  // Portal Authentication - uses PIN-based access
  app.post("/api/portal/auth", async (req, res) => {
    try {
      const { contactIdentifier, pin } = req.body as PortalAuthRequest;

      // Try to find contact by UID first, then by email
      let contact = await storage.getContactByUid(contactIdentifier);
      if (!contact) {
        const contacts = await storage.getContacts();
        contact = contacts.find(c => c.email === contactIdentifier);
      }

      if (!contact) {
        return res.status(400).json({ message: "Contact not found" });
      }

      const isValid = await storage.validatePortalPIN(contact.id, pin);
      if (!isValid) {
        return res.status(401).json({ message: "Invalid PIN" });
      }

      // Store contact in session
      req.session.portalContact = contact;
      
      res.json({ 
        success: true, 
        contact: {
          id: contact.id,
          name: contact.name,
          contactUid: contact.contactUid
        } 
      });
    } catch (error) {
      console.error("Portal auth error:", error);
      res.status(500).json({ message: "Authentication failed" });
    }
  });

  // Ensure portal user is authenticated
  const isPortalAuthenticated = (req: Request, res: Response, next: Function) => {
    if (req.session.portalContact) { // renamed from portalAccount
      return next();
    }
    res.status(401).json({ message: "Portal access unauthorized" });
  };

  // Webhook endpoint
  app.post("/api/webhook", async (req, res) => {
    try {
      await webhookService.processWebhook(req.body);
      res.json({ success: true });
    } catch (error) {
      console.error("Webhook processing error:", error);
      res.status(500).json({ message: "Webhook processing failed" });
    }
  });

  // Dashboard summary
  app.get("/api/dashboard", isAuthenticated, async (req, res) => {
    try {
      const summary = await storage.getDashboardSummary();
      res.json(summary);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      res.status(500).json({ message: "Failed to fetch dashboard data" });
    }
  });

  // User Routes
  app.post("/api/users", async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(validatedData);
      res.status(201).json(user);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  // Contact Routes (renamed from Account Routes)
  app.get("/api/contacts", isAuthenticated, async (req, res) => { // renamed from /api/accounts
    try {
      const { isCustomer, isVendor } = req.query;
      const filters: any = {};
      
      if (isCustomer !== undefined) {
        filters.isCustomer = isCustomer === 'true';
      }
      
      if (isVendor !== undefined) {
        filters.isVendor = isVendor === 'true';
      }
      
      const contacts = await storage.getContacts( // renamed from getAccounts
        Object.keys(filters).length > 0 ? filters : undefined
      );
      res.json(contacts); // renamed from accounts
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/contacts/:id", isAuthenticated, async (req, res) => { // renamed from /api/accounts/:id
    try {
      const contact = await storage.getContactById(req.params.id); // renamed from getAccountById
      if (!contact) { // renamed from account
        return res.status(404).json({ message: "Contact not found" }); // renamed from Account
      }
      res.json(contact); // renamed from account
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/contacts", isAuthenticated, async (req, res) => { // renamed from /api/accounts
    try {
      const validatedData = insertContactSchema.parse(req.body);
      const contact = await storage.createContact(validatedData); // renamed from createAccount
      res.status(201).json(contact); // renamed from account
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/contacts/:id", isAuthenticated, async (req, res) => { // renamed from /api/accounts/:id
    try {
      const updatedContact = await storage.updateContact(req.params.id, req.body); // renamed from updateAccount
      if (!updatedContact) { // renamed from updatedAccount
        return res.status(404).json({ message: "Contact not found" }); // renamed from Account
      }
      res.json(updatedContact); // renamed from updatedAccount
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/contacts/:id", isAuthenticated, async (req, res) => { // renamed from /api/accounts/:id
    try {
      const deleted = await storage.deleteContact(req.params.id); // renamed from deleteAccount
      if (!deleted) {
        return res.status(404).json({ message: "Contact not found" }); // renamed from Account
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // Product Routes
  app.get("/api/products", isAuthenticated, async (req, res) => {
    try {
      const products = await storage.getProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/products/inventory", isAuthenticated, async (req, res) => {
    try {
      const products = await storage.getProductsWithInventory();
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/products/:id", isAuthenticated, async (req, res) => {
    try {
      const product = await storage.getProductById(req.params.id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/products", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(validatedData);
      res.status(201).json(product);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/products/:id", isAuthenticated, async (req, res) => {
    try {
      const updatedProduct = await storage.updateProduct(req.params.id, req.body);
      if (!updatedProduct) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(updatedProduct);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/products/:id", isAuthenticated, async (req, res) => {
    try {
      const deleted = await storage.deleteProduct(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // Estimate Routes
  app.get("/api/estimates", isAuthenticated, async (req, res) => {
    try {
      const estimates = await storage.getEstimates();
      res.json(estimates);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/estimates/:id", isAuthenticated, async (req, res) => {
    try {
      const estimate = await storage.getEstimateWithLineItems(req.params.id);
      if (!estimate) {
        return res.status(404).json({ message: "Estimate not found" });
      }
      res.json(estimate);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/estimates", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertEstimateSchema.parse(req.body);
      const estimate = await storage.createEstimate(validatedData);
      res.status(201).json(estimate);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/estimates/:id", isAuthenticated, async (req, res) => {
    try {
      const updatedEstimate = await storage.updateEstimate(req.params.id, req.body);
      if (!updatedEstimate) {
        return res.status(404).json({ message: "Estimate not found" });
      }
      res.json(updatedEstimate);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/estimates/:id", isAuthenticated, async (req, res) => {
    try {
      const deleted = await storage.deleteEstimate(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Estimate not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // Convert estimate to invoice
  app.post("/api/estimates/:id/convert", isAuthenticated, async (req, res) => {
    try {
      const invoiceId = await webhookService.convertEstimateToInvoice(req.params.id);
      res.json({ success: true, invoiceId });
    } catch (error) {
      res.status(500).json({ message: "Failed to convert estimate to invoice" });
    }
  });

  // Estimate Line Items
  app.get("/api/estimates/:id/line-items", isAuthenticated, async (req, res) => {
    try {
      const lineItems = await storage.getEstimateLineItems(req.params.id);
      res.json(lineItems);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/estimate-line-items", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertEstimateLineItemSchema.parse(req.body);
      const lineItem = await storage.createEstimateLineItem(validatedData);
      res.status(201).json(lineItem);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  // Invoice Routes
  app.get("/api/invoices", isAuthenticated, async (req, res) => {
    try {
      const invoices = await storage.getInvoices();
      res.json(invoices);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/invoices/:id", isAuthenticated, async (req, res) => {
    try {
      const invoice = await storage.getInvoiceWithLineItems(req.params.id);
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      res.json(invoice);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/invoices", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertInvoiceSchema.parse(req.body);
      const invoice = await storage.createInvoice(validatedData);
      res.status(201).json(invoice);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/invoices/:id", isAuthenticated, async (req, res) => {
    try {
      const updatedInvoice = await storage.updateInvoice(req.params.id, req.body);
      if (!updatedInvoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      res.json(updatedInvoice);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/invoices/:id", isAuthenticated, async (req, res) => {
    try {
      const deleted = await storage.deleteInvoice(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // Invoice Line Items
  app.get("/api/invoices/:id/line-items", isAuthenticated, async (req, res) => {
    try {
      const lineItems = await storage.getInvoiceLineItems(req.params.id);
      res.json(lineItems);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/invoice-line-items", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertInvoiceLineItemSchema.parse(req.body);
      const lineItem = await storage.createInvoiceLineItem(validatedData);
      res.status(201).json(lineItem);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  // Purchase Order Routes
  app.get("/api/purchase-orders", isAuthenticated, async (req, res) => {
    try {
      const purchaseOrders = await storage.getPurchaseOrders();
      res.json(purchaseOrders);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/purchase-orders/:id", isAuthenticated, async (req, res) => {
    try {
      const purchaseOrder = await storage.getPurchaseOrderWithLines(req.params.id);
      if (!purchaseOrder) {
        return res.status(404).json({ message: "Purchase Order not found" });
      }
      res.json(purchaseOrder);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/purchase-orders", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertPurchaseOrderSchema.parse(req.body);
      const purchaseOrder = await storage.createPurchaseOrder(validatedData);
      res.status(201).json(purchaseOrder);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/purchase-orders/:id", isAuthenticated, async (req, res) => {
    try {
      const updatedPO = await storage.updatePurchaseOrder(req.params.id, req.body);
      if (!updatedPO) {
        return res.status(404).json({ message: "Purchase Order not found" });
      }
      res.json(updatedPO);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/purchase-orders/:id", isAuthenticated, async (req, res) => {
    try {
      const deleted = await storage.deletePurchaseOrder(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Purchase Order not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // Purchase Order Lines
  app.get("/api/purchase-orders/:id/lines", isAuthenticated, async (req, res) => {
    try {
      const lines = await storage.getPurchaseOrderLines(req.params.id);
      res.json(lines);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/purchase-order-lines", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertPurchaseOrderLineSchema.parse(req.body);
      const line = await storage.createPurchaseOrderLine(validatedData);
      res.status(201).json(line);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  // Customer Payment Routes
  app.get("/api/customer-payments", isAuthenticated, async (req, res) => {
    try {
      const payments = await storage.getCustomerPayments();
      res.json(payments);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/invoices/:id/payments", isAuthenticated, async (req, res) => {
    try {
      const payments = await storage.getCustomerPaymentsByInvoiceId(req.params.id);
      res.json(payments);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/customer-payments", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertCustomerPaymentSchema.parse(req.body);
      const payment = await storage.createCustomerPayment(validatedData);
      res.status(201).json(payment);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/customer-payments/:id/approve", isAuthenticated, async (req, res) => {
    try {
      await webhookService.approveCustomerPayment(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to approve payment" });
    }
  });

  // Vendor Payment Routes
  app.get("/api/purchase-order-payments", isAuthenticated, async (req, res) => {
    try {
      const payments = await storage.getPurchaseOrderPayments(); // renamed from getVendorPayments
      res.json(payments);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/purchase-orders/:id/payments", isAuthenticated, async (req, res) => {
    try {
      const payments = await storage.getPurchaseOrderPaymentsByPurchaseOrderId(req.params.id); // renamed from getVendorPaymentsByPurchaseOrderId
      res.json(payments);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/purchase-order-payments", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertPurchaseOrderPaymentSchema.parse(req.body); // renamed from insertVendorPaymentSchema
      const payment = await storage.createPurchaseOrderPayment(validatedData); // renamed from createVendorPayment
      res.status(201).json(payment);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  // Estimate Credits Routes (renamed from Customer Credit Routes)
  app.get("/api/estimate-credits", isAuthenticated, async (req, res) => {
    try {
      const credits = await storage.getEstimateCredits(); // renamed from getCustomerCredits
      res.json(credits);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/estimate-credits", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertEstimateCreditSchema.parse(req.body); // renamed from insertCustomerCreditSchema
      const credit = await storage.createEstimateCredit(validatedData); // renamed from createCustomerCredit
      res.status(201).json(credit);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  // Expense Routes
  app.get("/api/expenses", isAuthenticated, async (req, res) => {
    try {
      const expenses = await storage.getExpenses();
      res.json(expenses);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/expenses", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertExpenseSchema.parse(req.body);
      const expense = await storage.createExpense(validatedData);
      res.status(201).json(expense);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  // Message Routes
  app.post("/api/messages", async (req, res) => {
    try {
      const validatedData = insertMessageSchema.parse(req.body);
      const message = await storage.createMessage(validatedData);
      res.status(201).json(message);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  // Portal Routes (Customer/Vendor)
  app.get("/api/portal/contact", isPortalAuthenticated, (req, res) => { // renamed from /api/portal/account
    res.json(req.session.portalContact); // renamed from portalAccount
  });

  app.get("/api/portal/invoices", isPortalAuthenticated, async (req, res) => {
    try {
      const contactId = req.session.portalContact.id; // renamed from portalAccount
      const allInvoices = await storage.getInvoices();
      const contactInvoices = allInvoices.filter(
        (invoice) => invoice.contactId === contactId
      );
      res.json(contactInvoices);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/portal/purchase-orders", isPortalAuthenticated, async (req, res) => {
    try {
      const contactId = req.session.portalContact.id; // renamed from portalAccount
      const allPOs = await storage.getPurchaseOrders();
      const contactPOs = allPOs.filter(
        (po) => po.contactId === contactId
      );
      res.json(contactPOs);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  return httpServer;
}
