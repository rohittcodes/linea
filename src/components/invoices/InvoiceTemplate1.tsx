"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface InvoiceItem {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

interface InvoiceData {
  invoiceNumber?: string;
  date?: string;
  dueDate?: string;
  status?: string;
  company?: {
    name?: string;
    address?: string;
    email?: string;
    phone?: string;
  };
  client?: {
    name?: string;
    address?: string;
    email?: string;
  };
  items?: InvoiceItem[];
  subtotal?: number;
  tax?: number;
  total?: number;
}

interface InvoiceTemplate1Props {
  data?: InvoiceData;
}

export function InvoiceTemplate1({ data }: InvoiceTemplate1Props) {
  // Provide default values to prevent undefined errors
  const invoiceData = {
    invoiceNumber: data?.invoiceNumber || "INV-001",
    date: data?.date || "2024-01-15",
    dueDate: data?.dueDate || "2024-02-15",
    status: data?.status || "pending",
    company: {
      name: data?.company?.name || "Your Company Name",
      address: data?.company?.address || "123 Business St, Suite 100, City, State 12345",
      email: data?.company?.email || "hello@yourcompany.com",
      phone: data?.company?.phone || "(555) 123-4567",
    },
    client: {
      name: data?.client?.name || "Client Name",
      address: data?.client?.address || "456 Client Ave, City, State 67890",
      email: data?.client?.email || "client@example.com",
    },
    items: data?.items || [
      {
        description: "Sample Item",
        quantity: 1,
        rate: 100.0,
        amount: 100.0,
      },
    ],
    subtotal: data?.subtotal || 100.0,
    tax: data?.tax || 0.0,
    total: data?.total || 100.0,
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "overdue":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-lg border-0 rounded-[24px] bg-white">
      <CardHeader className="p-8 pb-6">
        <div className="text-center mb-4">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">Invoice</h1>
          <p className="text-gray-500 mt-1">#{invoiceData.invoiceNumber}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-lg border p-4 bg-gray-50">
            <h3 className="text-xs font-semibold text-gray-500 uppercase">From</h3>
            <p className="mt-2 font-semibold text-gray-900">{invoiceData.company.name}</p>
            <p className="text-gray-600 text-sm">{invoiceData.company.address}</p>
            <p className="text-gray-600 text-sm">{invoiceData.company.email}</p>
            <p className="text-gray-600 text-sm">{invoiceData.company.phone}</p>
          </div>
          <div className="rounded-lg border p-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase">Bill To</h3>
            <p className="mt-2 font-semibold text-gray-900">{invoiceData.client.name}</p>
            <p className="text-gray-600 text-sm">{invoiceData.client.address}</p>
            <p className="text-gray-600 text-sm">{invoiceData.client.email}</p>
          </div>
          <div className="rounded-lg p-4 bg-gray-900 text-white">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wide opacity-80">Status</span>
              <Badge className={`px-3 py-1 text-xs font-medium rounded ${getStatusColor(invoiceData.status)}`}>{invoiceData.status.toUpperCase()}</Badge>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
              <div>
                <div className="opacity-80">Issue Date</div>
                <div className="font-semibold">{invoiceData.date}</div>
              </div>
              <div>
                <div className="opacity-80">Due Date</div>
                <div className="font-semibold">{invoiceData.dueDate}</div>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-8 pb-8">
        <div className="overflow-hidden rounded-lg border">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Description</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Qty</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Rate</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Amount</th>
              </tr>
            </thead>
            <tbody>
              {invoiceData.items.map((item, index) => (
                <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="py-3 px-4 text-gray-900">{item.description}</td>
                  <td className="py-3 px-4 text-right text-gray-900">{item.quantity}</td>
                  <td className="py-3 px-4 text-right text-gray-900">${item.rate.toFixed(2)}</td>
                  <td className="py-3 px-4 text-right text-gray-900">${item.amount.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-start-3">
            <div className="rounded-lg border p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="text-gray-900">${invoiceData.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax</span>
                <span className="text-gray-900">${invoiceData.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-semibold pt-2 border-t">
                <span className="text-gray-900">Total</span>
                <span className="text-gray-900">${invoiceData.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
