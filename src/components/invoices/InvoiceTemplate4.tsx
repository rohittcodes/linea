"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface InvoiceItem { description: string; quantity: number; rate: number; amount: number }
interface Party { name?: string; address?: string; email?: string; phone?: string }
interface InvoiceData {
  invoiceNumber?: string; date?: string; dueDate?: string; status?: string;
  company?: Party; client?: Party; items?: InvoiceItem[]; subtotal?: number; tax?: number; total?: number;
}

export function InvoiceTemplate4({ data }: { data?: InvoiceData }) {
  const d = {
    invoiceNumber: data?.invoiceNumber || "INV-001",
    date: data?.date || "2024-01-15",
    dueDate: data?.dueDate || "2024-02-15",
    status: data?.status || "pending",
    company: {
      name: data?.company?.name || "Your Company",
      address: data?.company?.address || "123 Street, City",
      email: data?.company?.email || "hello@company.com",
      phone: data?.company?.phone || "(555) 000-0000",
    },
    client: {
      name: data?.client?.name || "Client Name",
      address: data?.client?.address || "456 Client Ave, City",
      email: data?.client?.email || "client@example.com",
    },
    items: data?.items || [{ description: "Design", quantity: 1, rate: 200, amount: 200 }],
    subtotal: data?.subtotal || 200, tax: data?.tax || 0, total: data?.total || 200,
  }

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-sm border bg-white">
      <CardHeader className="p-0">
        <div className="bg-gradient-to-r from-purple-600 to-fuchsia-500 h-24 w-full" />
        <div className="px-8 -mt-8 pb-2 flex items-end justify-between">
          <div>
            <div className="text-3xl font-extrabold text-white drop-shadow">{d.company.name}</div>
            <div className="text-white/80 text-sm">{d.company.email}</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-white/80">Invoice</div>
            <div className="text-white text-lg font-bold">#{d.invoiceNumber}</div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="rounded border p-4">
            <div className="text-xs font-semibold text-gray-500 uppercase">From</div>
            <div className="mt-2 text-sm text-gray-900 font-semibold">{d.company.name}</div>
            <div className="text-xs text-gray-600">{d.company.address}</div>
            <div className="text-xs text-gray-600">{d.company.phone}</div>
          </div>
          <div className="rounded border p-4">
            <div className="text-xs font-semibold text-gray-500 uppercase">Bill To</div>
            <div className="mt-2 text-sm text-gray-900 font-semibold">{d.client.name}</div>
            <div className="text-xs text-gray-600">{d.client.address}</div>
            <div className="text-xs text-gray-600">{d.client.email}</div>
          </div>
          <div className="rounded border p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-500 uppercase">Status</span>
              <Badge variant="secondary" className="text-xs">{d.status.toUpperCase()}</Badge>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><div className="text-gray-500 text-xs">Issue</div><div className="font-medium">{d.date}</div></div>
              <div><div className="text-gray-500 text-xs">Due</div><div className="font-medium">{d.dueDate}</div></div>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-md border">
          <table className="w-full">
            <thead className="bg-purple-50">
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

        <div className="mt-6 flex justify-end">
          <div className="w-80 rounded-md border p-4 space-y-2">
            <div className="flex justify-between text-sm"><span className="text-gray-600">Subtotal</span><span className="text-gray-900">${d.subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between text-sm"><span className="text-gray-600">Tax</span><span className="text-gray-900">${d.tax.toFixed(2)}</span></div>
            <div className="flex justify-between text-lg font-semibold pt-2 border-t"><span className="text-gray-900">Total</span><span className="text-gray-900">${d.total.toFixed(2)}</span></div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}


