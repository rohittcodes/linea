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
  company?: { name?: string; address?: string; email?: string; phone?: string };
  client?: { name?: string; address?: string; email?: string };
  items?: InvoiceItem[];
  subtotal?: number;
  tax?: number;
  total?: number;
}

interface InvoiceTemplate3Props { data?: InvoiceData }

export function InvoiceTemplate3({ data }: InvoiceTemplate3Props) {
  const d = {
    invoiceNumber: data?.invoiceNumber || "INV-001",
    date: data?.date || "2024-01-15",
    dueDate: data?.dueDate || "2024-02-15",
    status: data?.status || "pending",
    company: {
      name: data?.company?.name || "Your Company Name",
      address: data?.company?.address || "123 Business St, City",
      email: data?.company?.email || "hello@yourcompany.com",
      phone: data?.company?.phone || "(555) 123-4567",
    },
    client: {
      name: data?.client?.name || "Client Name",
      address: data?.client?.address || "456 Client Ave, City",
      email: data?.client?.email || "client@example.com",
    },
    items: data?.items || [{ description: "Service", quantity: 1, rate: 100, amount: 100 }],
    subtotal: data?.subtotal || 100,
    tax: data?.tax || 0,
    total: data?.total || 100,
  }

  const statusTone = (s: string) => {
    switch (s.toLowerCase()) {
      case 'paid': return 'bg-emerald-600';
      case 'overdue': return 'bg-rose-600';
      default: return 'bg-amber-500';
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto overflow-hidden border shadow-sm">
      <CardHeader className="p-0">
        <div className="h-2 w-full bg-gradient-to-r from-indigo-500 via-sky-500 to-cyan-400" />
        <div className="px-8 pt-6 pb-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">Invoice</h1>
            <p className="text-gray-500">#{d.invoiceNumber}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-xs text-gray-500">Issue</div>
              <div className="text-sm font-medium text-gray-900">{d.date}</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-500">Due</div>
              <div className="text-sm font-medium text-gray-900">{d.dueDate}</div>
            </div>
            <Badge className={`rounded-full text-white ${statusTone(d.status)}`}>{d.status.toUpperCase()}</Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="flex flex-col md:flex-row">
          <aside className="md:w-64 bg-gray-50 border-r p-6 space-y-6">
            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase">From</div>
              <div className="mt-2 text-sm text-gray-900 font-semibold">{d.company.name}</div>
              <div className="text-xs text-gray-600">{d.company.address}</div>
              <div className="text-xs text-gray-600">{d.company.email}</div>
              <div className="text-xs text-gray-600">{d.company.phone}</div>
            </div>
            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase">Bill To</div>
              <div className="mt-2 text-sm text-gray-900 font-semibold">{d.client.name}</div>
              <div className="text-xs text-gray-600">{d.client.address}</div>
              <div className="text-xs text-gray-600">{d.client.email}</div>
            </div>
          </aside>

          <section className="flex-1 p-6">
            <div className="overflow-hidden rounded-md border">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Description</th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Qty</th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Rate</th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {d.items.map((it, idx) => (
                    <tr key={idx} className="odd:bg-white even:bg-gray-50">
                      <td className="py-3 px-4 text-gray-900">{it.description}</td>
                      <td className="py-3 px-4 text-right text-gray-900">{it.quantity}</td>
                      <td className="py-3 px-4 text-right text-gray-900">${it.rate.toFixed(2)}</td>
                      <td className="py-3 px-4 text-right text-gray-900">${it.amount.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 flex flex-col items-end">
              <div className="w-full md:w-80 rounded-md border p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-900">${d.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax</span>
                  <span className="text-gray-900">${d.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-semibold pt-2 border-t">
                  <span className="text-gray-900">Total</span>
                  <span className="text-gray-900">${d.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </CardContent>
    </Card>
  )
}


