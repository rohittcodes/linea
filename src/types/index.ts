export interface Client {
  id: string;
  name: string;
  email: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Invoice {
  id: string;
  clientId: string;
  status: InvoiceStatus;
  dueOn: Date;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  sentAt?: Date | null;
  client?: Client;
  lineItems?: LineItem[];
}

export interface LineItem {
  id: string;
  invoiceId: string;
  desc: string;
  qty: number;
  unitPrice: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Template {
  id: string;
  name: string;
  brandingJson: BrandingConfig;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BrandingConfig {
  colors: {
    primary: string;
    secondary: string;
    text: string;
    background: string;
  };
  typography: {
    fontFamily: string;
    headerSize: string;
    bodySize: string;
  };
  layout: {
    logoPosition: "left" | "center" | "right";
    headerStyle: "minimal" | "standard" | "detailed";
  };
  company: {
    name: string;
    address?: string;
    phone?: string;
    website?: string;
    logoUrl?: string;
  };
}

export enum InvoiceStatus {
  DRAFT = "DRAFT",
  SENT = "SENT",
  PAID = "PAID",
  OVERDUE = "OVERDUE",
}

// Form types
export interface InvoiceFormData {
  clientId: string;
  dueOn: Date;
  lineItems: LineItemFormData[];
}

export interface LineItemFormData {
  desc: string;
  qty: number;
  unitPrice: number;
}

export interface ClientFormData {
  name: string;
  email: string;
}

export interface TemplateFormData {
  name: string;
  brandingJson: BrandingConfig;
}
