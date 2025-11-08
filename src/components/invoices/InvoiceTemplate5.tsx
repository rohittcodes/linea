"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface Item { description: string; quantity: number; rate: number; amount: number }
interface Party { name?: string; address?: string; email?: string; phone?: string }
interface Data {
  invoiceNumber?: string; date?: string; dueDate?: string; status?: string;
  company?: Party; client?: Party; items?: Item[]; subtotal?: number; tax?: number; total?: number;
}

export function InvoiceTemplate5({ data }: { data?: Data }) {
  const d = {
    invoiceNumber: data?.invoiceNumber || "INV-001",
    date: data?.date || "2024-01-15",
    dueDate: data?.dueDate || "2024-02-15",
    status: data?.status || "pending",
    company: { name: data?.company?.name || "Your Company", address: data?.company?.address || "123 Street", email: data?.company?.email || "hello@co.com" },
    client: { name: data?.client?.name || "Client", address: data?.client?.address || "456 Avenue", email: data?.client?.email || "client@ex.com" },
    items: data?.items || [{ description: "Consulting", quantity: 2, rate: 150, amount: 300 }],
    subtotal: data?.subtotal || 300, tax: data?.tax || 0, total: data?.total || 300,
  }

  return (
    <Card className="w-full max-w-4xl mx-auto border shadow-sm">
      <CardHeader className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold tracking-tight">{d.company.name}</div>
            <div className="text-sm text-gray-500">{d.company.address}</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500">Invoice Number</div>
            <div className="text-lg font-semibold">#{d.invoiceNumber}</div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 pt-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="rounded-md bg-gray-50 border p-4">
            <div className="text-xs font-semibold text-gray-500 uppercase">Billed To</div>
            <div className="mt-2 text-sm text-gray-900 font-semibold">{d.client.name}</div>
            <div className="text-xs text-gray-600">{d.client.address}</div>
            <div className="text-xs text-gray-600">{d.client.email}</div>
          </div>
          <div className="rounded-md border p-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><div className="text-gray-500 text-xs">Issue Date</div><div className="font-medium">{d.date}</div></div>
              <div><div className="text-gray-500 text-xs">Due Date</div><div className="font-medium">{d.dueDate}</div></div>
              <div><div className="text-gray-500 text-xs">Status</div><div className="font-medium uppercase">{d.status}</div></div>
            </div>
          </div>
        </div>

        <div className="rounded-md border overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Item</th>
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

        <div className="mt-6 flex justify-end">
          <div className="w-72 space-y-2">
            <div className="flex justify-between text-sm"><span className="text-gray-600">Subtotal</span><span className="text-gray-900">${d.subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between text-sm"><span className="text-gray-600">Tax</span><span className="text-gray-900">${d.tax.toFixed(2)}</span></div>
            <div className="flex justify-between text-lg font-semibold pt-2 border-t"><span>Total</span><span>${d.total.toFixed(2)}</span></div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}


