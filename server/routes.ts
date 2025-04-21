import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { configurePassport, configureSession, isAuthenticated } from "./auth";
import passport from "passport";
import { webhookService } from "./webhooks";
import { z } from "zod";
import {
  insertUserSchema,
  insertAccountSchema,
  insertProductSchema,
  insertEstimateSchema,
  insertEstimateLineItemSchema,
  insertInvoiceSchema,
  insertInvoiceLineItemSchema,
  insertPurchaseOrderSchema,
  insertPurchaseOrderLineSchema,
  insertCustomerPaymentSchema,
  insertVendorPaymentSchema,
  insertCustomerCreditSchema,
  insertExpenseSchema,
  insertMessageSchema,
} from "@shared/schema";
import { PortalAuthRequest } from "@shared/types";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // Configure authentication
  configurePassport();
  configureSession(app);

  // Authentication Routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      console.log("Registration attempt with:", { 
        email: req.body.email,
        hasPassword: !!req.body.password,
        hasFullName: !!req.body.fullName
      });
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(req.body.email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already in use" });
      }
      
      // Create the user
      const newUser = await storage.createUser({
        email: req.body.email,
        password: req.body.password, // Storage layer will hash this
        fullName: req.body.fullName,
        role: req.body.role || "user"
      });
      
      // Log in the user automatically
      req.login(newUser, (loginErr) => {
        if (loginErr) {
          console.error("Error logging in after registration:", loginErr);
          return res.status(500).json({ message: "Registration successful but failed to log in" });
        }
        
        console.log("User registered and authenticated:", { 
          id: newUser.id,
          email: newUser.email
        });
        
        // Return the user data without password
        const { password, ...userWithoutPassword } = newUser;
        return res.status(201).json({ user: userWithoutPassword });
      });
    } catch (error: any) {
      console.error("Registration error:", error);
      res.status(500).json({ message: error.message || "Failed to register user" });
    }
  });

  app.post("/api/auth/login", (req, res, next) => {
    console.log("Login attempt with:", { 
      email: req.body.email,
      hasPassword: !!req.body.password
    });
    
    passport.authenticate("local", (err, user, info) => {
      if (err) {
        console.error("Login error:", err);
        return res.status(500).json({ message: "Internal server error during login" });
      }
      
      if (!user) {
        console.log("Authentication failed:", info);
        return res.status(401).json({ message: info?.message || "Invalid credentials" });
      }
      
      req.login(user, (loginErr) => {
        if (loginErr) {
          console.error("Session creation error:", loginErr);
          return res.status(500).json({ message: "Error creating session" });
        }
        
        console.log("User authenticated successfully:", { 
          id: user.id,
          email: user.email,
          sessionID: req.sessionID
        });
        
        // Return the user data without password
        const { password, ...userWithoutPassword } = user;
        return res.json({ user: userWithoutPassword });
      });
    })(req, res, next);
  });

  app.post("/api/auth/logout", (req, res) => {
    const wasAuthenticated = req.isAuthenticated();
    const sessionID = req.sessionID;
    
    req.logout((err) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ message: "Error during logout" });
      }
      
      console.log("User logged out:", { wasAuthenticated, sessionID });
      res.json({ success: true });
    });
  });

  app.get("/api/auth/session", (req, res) => {
    console.log("Session check:", { 
      authenticated: req.isAuthenticated(),
      sessionID: req.sessionID,
      hasSession: !!req.session,
      user: req.user ? { id: req.user.id } : null
    });
    
    if (req.isAuthenticated()) {
      // Return user without sensitive fields
      const { password, ...userWithoutPassword } = req.user as any;
      res.json({ user: userWithoutPassword });
    } else {
      res.status(401).json({ message: "Not authenticated" });
    }
  });

  // Portal Authentication - uses PIN-based access
  app.post("/api/portal/auth", async (req, res) => {
    try {
      const { accountIdentifier, pin } = req.body as PortalAuthRequest;

      // Try to find account by UID first, then by email
      let account = await storage.getAccountByUid(accountIdentifier);
      if (!account) {
        const accounts = await storage.getAccounts();
        account = accounts.find(a => a.email === accountIdentifier);
      }

      if (!account) {
        return res.status(400).json({ message: "Account not found" });
      }

      const isValid = await storage.validatePortalPIN(account.id, pin);
      if (!isValid) {
        return res.status(401).json({ message: "Invalid PIN" });
      }

      // Store account in session
      req.session.portalAccount = account;
      
      res.json({ 
        success: true, 
        account: {
          id: account.id,
          name: account.name,
          accountUid: account.accountUid
        } 
      });
    } catch (error) {
      console.error("Portal auth error:", error);
      res.status(500).json({ message: "Authentication failed" });
    }
  });

  // Ensure portal user is authenticated
  const isPortalAuthenticated = (req: Request, res: Response, next: Function) => {
    if (req.session.portalAccount) {
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

  // Account Routes
  app.get("/api/accounts", isAuthenticated, async (req, res) => {
    try {
      const { isCustomer, isVendor } = req.query;
      const filters: any = {};
      
      if (isCustomer !== undefined) {
        filters.isCustomer = isCustomer === 'true';
      }
      
      if (isVendor !== undefined) {
        filters.isVendor = isVendor === 'true';
      }
      
      const accounts = await storage.getAccounts(
        Object.keys(filters).length > 0 ? filters : undefined
      );
      res.json(accounts);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/accounts/:id", isAuthenticated, async (req, res) => {
    try {
      const account = await storage.getAccountById(req.params.id);
      if (!account) {
        return res.status(404).json({ message: "Account not found" });
      }
      res.json(account);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/accounts", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertAccountSchema.parse(req.body);
      const account = await storage.createAccount(validatedData);
      res.status(201).json(account);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/accounts/:id", isAuthenticated, async (req, res) => {
    try {
      const updatedAccount = await storage.updateAccount(req.params.id, req.body);
      if (!updatedAccount) {
        return res.status(404).json({ message: "Account not found" });
      }
      res.json(updatedAccount);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/accounts/:id", isAuthenticated, async (req, res) => {
    try {
      const deleted = await storage.deleteAccount(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Account not found" });
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
  app.get("/api/vendor-payments", isAuthenticated, async (req, res) => {
    try {
      const payments = await storage.getVendorPayments();
      res.json(payments);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/purchase-orders/:id/payments", isAuthenticated, async (req, res) => {
    try {
      const payments = await storage.getVendorPaymentsByPurchaseOrderId(req.params.id);
      res.json(payments);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/vendor-payments", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertVendorPaymentSchema.parse(req.body);
      const payment = await storage.createVendorPayment(validatedData);
      res.status(201).json(payment);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  // Customer Credit Routes
  app.get("/api/customer-credits", isAuthenticated, async (req, res) => {
    try {
      const credits = await storage.getCustomerCredits();
      res.json(credits);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/customer-credits", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertCustomerCreditSchema.parse(req.body);
      const credit = await storage.createCustomerCredit(validatedData);
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
  app.get("/api/portal/account", isPortalAuthenticated, (req, res) => {
    res.json(req.session.portalAccount);
  });

  app.get("/api/portal/invoices", isPortalAuthenticated, async (req, res) => {
    try {
      const accountId = req.session.portalAccount.id;
      const allInvoices = await storage.getInvoices();
      const accountInvoices = allInvoices.filter(
        (invoice) => invoice.accountId === accountId
      );
      res.json(accountInvoices);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/portal/purchase-orders", isPortalAuthenticated, async (req, res) => {
    try {
      const accountId = req.session.portalAccount.id;
      const allPOs = await storage.getPurchaseOrders();
      const accountPOs = allPOs.filter(
        (po) => po.accountId === accountId
      );
      res.json(accountPOs);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  return httpServer;
}
