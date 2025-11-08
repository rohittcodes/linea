"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface Item { description: string; quantity: number; rate: number; amount: number }
interface Party { name?: string; address?: string; email?: string; phone?: string }
interface Data {
  invoiceNumber?: string; date?: string; dueDate?: string; status?: string;
  company?: Party; client?: Party; items?: Item[]; subtotal?: number; tax?: number; total?: number;
}

export function InvoiceTemplate6({ data }: { data?: Data }) {
  const d = {
    invoiceNumber: data?.invoiceNumber || "INV-001",
    date: data?.date || "2024-01-15",
    dueDate: data?.dueDate || "2024-02-15",
    status: data?.status || "pending",
    company: { name: data?.company?.name || "Your Company", address: data?.company?.address || "123 Street", email: data?.company?.email || "hello@co.com" },
    client: { name: data?.client?.name || "Client", address: data?.client?.address || "456 Avenue", email: data?.client?.email || "client@ex.com" },
    items: data?.items || [{ description: "Development", quantity: 10, rate: 50, amount: 500 }],
    subtotal: data?.subtotal || 500, tax: data?.tax || 0, total: data?.total || 500,
  }

  return (
    <Card className="w-full max-w-4xl mx-auto border shadow-sm">
      <CardHeader className="p-0">
        <div className="px-8 py-6 bg-gray-900 text-white flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-widest text-white/70">Invoice</div>
            <div className="text-2xl font-bold">#{d.invoiceNumber}</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-white/70">Issue</div>
            <div className="font-medium">{d.date}</div>
            <div className="text-xs text-white/70 mt-2">Due</div>
            <div className="font-medium">{d.dueDate}</div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase">From</div>
            <div className="mt-2 text-sm text-gray-900 font-semibold">{d.company.name}</div>
            <div className="text-xs text-gray-600">{d.company.address}</div>
            <div className="text-xs text-gray-600">{d.company.email}</div>
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase">Bill To</div>
            <div className="mt-2 text-sm text-gray-900 font-semibold">{d.client.name}</div>
            <div className="text-xs text-gray-600">{d.client.address}</div>
            <div className="text-xs text-gray-600">{d.client.email}</div>
          </div>
        </div>

        <div className="rounded-md overflow-hidden ring-1 ring-gray-200">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Description</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Qty</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Rate</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Amount</th>
              </tr>
            </thead>
            <tbody>
              {d.items.map((it, idx) => (
                <tr key={idx} className="border-t">
                  <td className="py-3 px-4">{it.description}</td>
                  <td className="py-3 px-4 text-right">{it.quantity}</td>
                  <td className="py-3 px-4 text-right">${it.rate.toFixed(2)}</td>
                  <td className="py-3 px-4 text-right font-medium">${it.amount.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-start-3">
            <div className="rounded-md border p-4 space-y-2">
              <div className="flex justify-between text-sm"><span className="text-gray-600">Subtotal</span><span className="text-gray-900">${d.subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-600">Tax</span><span className="text-gray-900">${d.tax.toFixed(2)}</span></div>
              <div className="flex justify-between text-lg font-semibold pt-2 border-t"><span>Total</span><span>${d.total.toFixed(2)}</span></div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}


