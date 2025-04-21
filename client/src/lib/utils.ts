import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines class names with Tailwind CSS
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a number as a currency string
 */
export function formatCurrency(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined) return "$0.00";
  
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numericAmount);
}

/**
 * Format a date string to a readable format
 */
export function formatDate(dateString: string | Date | null | undefined): string {
  if (!dateString) return '';
  
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date);
}

/**
 * Format a percentage change with + or - sign
 */
export function formatPercentChange(percent: number): string {
  if (percent === 0) return '0%';
  return `${percent > 0 ? '+' : ''}${percent.toFixed(1)}%`;
}

/**
 * Calculate the status of an invoice based on payment and due date
 */
export function calculateInvoiceStatus(
  dueDate: string | Date | null | undefined,
  totalAmount: number | string,
  totalPaid: number | string
): 'paid' | 'partial' | 'pending' | 'overdue' {
  const totalAmountNumber = typeof totalAmount === 'string' ? parseFloat(totalAmount) : totalAmount;
  const totalPaidNumber = typeof totalPaid === 'string' ? parseFloat(totalPaid) : totalPaid;
  
  // If fully paid
  if (totalPaidNumber >= totalAmountNumber) {
    return 'paid';
  }
  
  // If partially paid
  if (totalPaidNumber > 0) {
    return 'partial';
  }
  
  // Check if overdue
  if (dueDate) {
    const today = new Date();
    const due = typeof dueDate === 'string' ? new Date(dueDate) : dueDate;
    
    if (today > due) {
      return 'overdue';
    }
  }
  
  // Default is pending
  return 'pending';
}

/**
 * Truncate text with ellipsis if it exceeds the max length
 */
export function truncateText(text: string, maxLength: number = 50): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

/**
 * Get status badge color class based on status
 */
export function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'paid':
    case 'approved':
    case 'completed':
    case 'active':
    case 'in stock':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    case 'pending':
    case 'sent':
    case 'low stock':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    case 'overdue':
    case 'rejected':
    case 'expired':
    case 'critical':
    case 'out of stock':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    case 'draft':
    case 'partial':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  }
}
