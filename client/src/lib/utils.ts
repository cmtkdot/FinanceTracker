import { type ClassValue, clsx } from "clsx"
import { format, isValid } from "date-fns";
import { twMerge } from "tailwind-merge"
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: string | number | null | undefined, currencyCode = 'USD'): string {
  if (amount === null || amount === undefined) return '$0.00';
  
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 2
  }).format(numAmount);
}

export function formatDate(date: string | Date | null | undefined, formatString = 'MMM dd, yyyy'): string {
  if (!date) return 'N/A';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (!isValid(dateObj)) return 'Invalid date';
  
  return format(dateObj, formatString);
}

export function formatPercentChange(value: number | null | undefined, includeSign = true): string {
  if (value === null || value === undefined) return '0%';
  
  const sign = includeSign && value > 0 ? '+' : '';
  
  return `${sign}${value.toFixed(1)}%`;
}

export function getStatusColor(status: string): string {
  const statusLower = status.toLowerCase();
  
  switch (statusLower) {
    case 'paid':
    case 'approved':
    case 'active':
    case 'completed':
    case 'accepted':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      
    case 'pending':
    case 'draft':
    case 'sent':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300';
      
    case 'overdue':
    case 'rejected':
    case 'cancelled':
    case 'failed':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      
    case 'partial':
    case 'inprogress':
    case 'in-progress':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  }
}