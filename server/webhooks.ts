import { db } from './db';
import { sql } from 'drizzle-orm';
import { WebhookPayload } from '@shared/types';

/**
 * Processes webhooks for complex database operations
 * This service handles the complex cascading logic by calling the appropriate database functions
 */
export class WebhookService {
  /**
   * Process an incoming webhook payload
   */
  async processWebhook(payload: WebhookPayload): Promise<void> {
    const { table, id, op, row, old_row } = payload;

    try {
      console.log(`Processing webhook: ${table} ${id} ${op}`);

      switch (table) {
        case 'invoice_line_items':
          if (op === 'INSERT' || op === 'UPDATE' || op === 'DELETE') {
            // When invoice line items change, update invoice finance metrics
            const invoiceId = row?.invoiceId || old_row?.invoiceId;
            if (invoiceId) {
              await this.callDatabaseFunction('update_invoice_finance_metrics', invoiceId);
            }
          }
          break;

        case 'customer_payments':
          if (op === 'INSERT' || op === 'UPDATE' || op === 'DELETE') {
            // When customer payments change, update invoice finance metrics
            const invoiceId = row?.invoiceId || old_row?.invoiceId;
            if (invoiceId) {
              await this.callDatabaseFunction('update_invoice_finance_metrics', invoiceId);
            }
          }
          break;

        case 'invoices':
          // If invoice balance changed, update account customer balance
          if (op === 'UPDATE' && row && old_row && row.balance !== old_row.balance) {
            await this.callDatabaseFunction('update_account_customer_balance', row.accountId);
          } else if (op === 'INSERT') {
            await this.callDatabaseFunction('update_account_customer_balance', row.accountId);
          } else if (op === 'DELETE') {
            await this.callDatabaseFunction('update_account_customer_balance', old_row.accountId);
          }
          break;

        case 'customer_credits':
          if (op === 'INSERT' || op === 'UPDATE' || op === 'DELETE') {
            // When customer credits change, update invoice or estimate finance metrics
            const invoiceId = row?.invoiceId || old_row?.invoiceId;
            const estimateId = row?.estimateId || old_row?.estimateId;
            
            if (invoiceId) {
              await this.callDatabaseFunction('update_invoice_finance_metrics', invoiceId);
            }
            
            if (estimateId) {
              await this.callDatabaseFunction('update_estimate_finance_metrics', estimateId);
            }
          }
          break;

        case 'estimate_line_items':
          if (op === 'INSERT' || op === 'UPDATE' || op === 'DELETE') {
            // When estimate line items change, update estimate finance metrics
            const estimateId = row?.estimateId || old_row?.estimateId;
            if (estimateId) {
              await this.callDatabaseFunction('update_estimate_finance_metrics', estimateId);
            }
          }
          break;

        case 'purchase_order_lines':
          if (op === 'INSERT' || op === 'UPDATE' || op === 'DELETE') {
            // When PO lines change, update PO finance metrics
            const purchaseOrderId = row?.purchaseOrderId || old_row?.purchaseOrderId;
            if (purchaseOrderId) {
              await this.callDatabaseFunction('update_po_finance_metrics', purchaseOrderId);
            }
          }
          break;

        case 'vendor_payments':
          if (op === 'INSERT' || op === 'UPDATE' || op === 'DELETE') {
            // When vendor payments change, update PO finance metrics
            const purchaseOrderId = row?.purchaseOrderId || old_row?.purchaseOrderId;
            if (purchaseOrderId) {
              await this.callDatabaseFunction('update_po_finance_metrics', purchaseOrderId);
            }
          }
          break;

        case 'purchase_orders':
          // If PO balance changed, update account vendor balance
          if (op === 'UPDATE' && row && old_row && row.balance !== old_row.balance) {
            await this.callDatabaseFunction('update_account_vendor_balance', row.accountId);
          } else if (op === 'INSERT') {
            await this.callDatabaseFunction('update_account_vendor_balance', row.accountId);
          } else if (op === 'DELETE') {
            await this.callDatabaseFunction('update_account_vendor_balance', old_row.accountId);
          }
          break;

        case 'messages':
          // Process message linking to product
          if ((op === 'INSERT' || op === 'UPDATE') && row && row.extractedData) {
            await this.callDatabaseFunction('handle_message_product_link_db', id);
          }
          break;

        case 'accounts':
          // Update net balance when customer or vendor balance changes
          if (op === 'UPDATE' && row && old_row && 
              (row.customerBalance !== old_row.customerBalance || 
               row.vendorBalance !== old_row.vendorBalance)) {
            await this.callDatabaseFunction('update_account_net_balance', id);
          }
          break;
      }

      console.log(`Webhook processed successfully: ${table} ${id} ${op}`);
    } catch (error) {
      console.error(`Error processing webhook: ${table} ${id} ${op}`, error);
      throw error;
    }
  }

  /**
   * Handle the conversion of an estimate to an invoice
   */
  async convertEstimateToInvoice(estimateId: string): Promise<string> {
    try {
      const result = await this.callDatabaseFunction('convert_estimate_to_invoice_db', estimateId);
      return result.invoice_id;
    } catch (error) {
      console.error('Error converting estimate to invoice:', error);
      throw error;
    }
  }

  /**
   * Handle customer payment approval
   */
  async approveCustomerPayment(paymentId: string): Promise<void> {
    try {
      await this.callDatabaseFunction('approve_customer_payment_db', paymentId);
    } catch (error) {
      console.error('Error approving customer payment:', error);
      throw error;
    }
  }

  /**
   * Call a database function with the given parameters
   */
  private async callDatabaseFunction(functionName: string, ...params: any[]): Promise<any> {
    try {
      // Convert params to SQL parameters
      const sqlParams = params.map((param, index) => `$${index + 1}`).join(',');
      
      // Build the SQL query
      const query = sql.raw(`SELECT * FROM ${functionName}(${sqlParams})`, params);
      
      // Execute the function
      const result = await db.execute(query);
      
      return result.rows[0];
    } catch (error) {
      console.error(`Error calling database function ${functionName}:`, error);
      throw error;
    }
  }
}

export const webhookService = new WebhookService();
