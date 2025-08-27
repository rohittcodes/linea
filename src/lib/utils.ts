import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { LineItem } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export class InvoiceCalculator {
  static calculateLineItemTotal(lineItem: LineItem): number {
    return lineItem.qty * Number(lineItem.unitPrice);
  }

  static calculateInvoiceSubtotal(lineItems: LineItem[]): number {
    return lineItems.reduce(
      (sum, item) => sum + this.calculateLineItemTotal(item),
      0,
    );
  }

  static calculateInvoiceTotal(lineItems: LineItem[], taxRate = 0): number {
    const subtotal = this.calculateInvoiceSubtotal(lineItems);
    return subtotal * (1 + taxRate);
  }
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}
