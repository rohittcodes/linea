"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

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

interface InvoiceTemplate2Props {
  data?: InvoiceData;
}

export function InvoiceTemplate2({ data }: InvoiceTemplate2Props) {
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
    <Card className="w-full max-w-4xl mx-auto shadow-lg border-0 rounded-[32px] bg-white">
      <CardHeader className="p-0">
        <div className="bg-[#f6f8fc] rounded-t-[32px] px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="w-12 h-12 bg-white">
                <AvatarFallback className="bg-[#2388ff] text-white font-semibold">
                  {invoiceData.company.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {invoiceData.company.name}
                </h2>
                <p className="text-gray-600">{invoiceData.company.email}</p>
              </div>
            </div>
            <Badge
              className={`px-4 py-2 text-sm font-medium rounded-full ${getStatusColor(invoiceData.status)}`}
            >
              {invoiceData.status.toUpperCase()}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div className="space-y-4">
            <div>
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                Invoice
              </h3>
              <p className="text-2xl font-bold text-gray-900">
                #{invoiceData.invoiceNumber}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                Issue Date
              </h3>
              <p className="text-gray-900 font-medium">{invoiceData.date}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                Due Date
              </h3>
              <p className="text-gray-900 font-medium">{invoiceData.dueDate}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
              Bill From
            </h3>
            <div className="space-y-2">
              <p className="font-semibold text-gray-900">
                {invoiceData.company.name}
              </p>
              <p className="text-gray-600 text-sm">{invoiceData.company.address}</p>
              <p className="text-gray-600 text-sm">{invoiceData.company.phone}</p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
              Bill To
            </h3>
            <div className="space-y-2">
              <p className="font-semibold text-gray-900">
                {invoiceData.client.name}
              </p>
              <p className="text-gray-600 text-sm">{invoiceData.client.address}</p>
              <p className="text-gray-600 text-sm">{invoiceData.client.email}</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-4 text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Item
                  </th>
                  <th className="text-right py-4 text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Qty
                  </th>
                  <th className="text-right py-4 text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Rate
                  </th>
                  <th className="text-right py-4 text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {invoiceData.items.map((item, index) => (
                  <tr key={index} className="border-b border-gray-100">
                    <td className="py-4 text-gray-900 font-medium">
                      {item.description}
                    </td>
                    <td className="py-4 text-right text-gray-900">
                      {item.quantity}
                    </td>
                    <td className="py-4 text-right text-gray-900">
                      ${item.rate.toFixed(2)}
                    </td>
                    <td className="py-4 text-right text-gray-900 font-medium">
                      ${item.amount.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end">
            <div className="w-80 space-y-3">
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600 font-medium">Subtotal</span>
                <span className="text-gray-900 font-medium">
                  ${invoiceData.subtotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600 font-medium">Tax</span>
                <span className="text-gray-900 font-medium">
                  ${invoiceData.tax.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between py-3 text-lg font-bold bg-[#f6f8fc] px-4 rounded-lg">
                <span className="text-gray-900">Total</span>
                <span className="text-[#2388ff]">${invoiceData.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
