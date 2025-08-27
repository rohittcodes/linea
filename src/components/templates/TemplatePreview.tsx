"use client";

import { InvoiceTemplate1 } from "@/components/invoices/InvoiceTemplate1";
import { InvoiceTemplate2 } from "@/components/invoices/InvoiceTemplate2";

interface TemplatePreviewProps {
  templateId: string;
  data?: any;
}

const sampleData = {
  invoiceNumber: "INV-001",
  date: "2024-01-15",
  dueDate: "2024-02-15",
  status: "pending" as const,
  company: {
    name: "Your Company Name",
    address: "123 Business St, Suite 100, City, State 12345",
    email: "hello@yourcompany.com",
    phone: "(555) 123-4567",
  },
  client: {
    name: "Acme Corporation",
    address: "456 Client Ave, City, State 67890",
    email: "billing@acmecorp.com",
  },
  items: [
    {
      description: "Web Development Services",
      quantity: 1,
      rate: 2000.0,
      amount: 2000.0,
    },
    { description: "UI/UX Design", quantity: 1, rate: 500.0, amount: 500.0 },
  ],
  subtotal: 2500.0,
  tax: 0.0,
  total: 2500.0,
};

export function TemplatePreview({ templateId, data = sampleData }: TemplatePreviewProps) {
  const renderTemplate = () => {
    switch (templateId) {
      case "template1":
        return <InvoiceTemplate1 data={data} />;
      case "template2":
        return <InvoiceTemplate2 data={data} />;
      case "template3":
        return <InvoiceTemplate1 data={data} />;
      case "template4":
        return <InvoiceTemplate2 data={data} />;
      case "template5":
        return <InvoiceTemplate1 data={data} />;
      case "template6":
        return <InvoiceTemplate2 data={data} />;
      default:
        return <InvoiceTemplate1 data={data} />;
    }
  };

  return (
    <div className="w-full">
      {renderTemplate()}
    </div>
  );
}
