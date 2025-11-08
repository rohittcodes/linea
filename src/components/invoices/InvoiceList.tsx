"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MoreHorizontal, Eye, Edit, Download, Send, Plus, Trash2, CheckCircle, Clock, AlertCircle, Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Invoice {
  id: string;
  number: string;
  client: string;
  amount: number;
  status: "DRAFT" | "SENT" | "VIEWED" | "PAID" | "OVERDUE" | "CANCELLED" | "REFUNDED";
  date: string;
  dueDate: string;
  demoIrn?: string | null;
  hasDemoIrn?: boolean;
}

interface InvoiceListProps {
  invoices: Invoice[];
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDownload?: (id: string) => void;
  onSend?: (id: string) => void;
  onDelete?: (id: string) => void;
  onStatusChange?: (id: string, status: string) => void;
  onCreate?: () => void;
}

export function InvoiceList({
  invoices,
  onView,
  onEdit,
  onDownload,
  onSend,
  onDelete,
  onStatusChange,
  onCreate,
}: InvoiceListProps) {
  const queryClient = useQueryClient();
  const [qrOpen, setQrOpen] = useState(false)
  const [qrSrc, setQrSrc] = useState<string | null>(null)
  
  const fetchInvoiceMutation = useMutation({
    mutationFn: async (invoiceId: string) => {
      const res = await fetch(`/api/invoices/${invoiceId}`)
      if (!res.ok) {
        throw new Error('Failed to fetch invoice');
      }
      const json = await res.json()
      return json?.data || {}
    },
    onSuccess: (data, invoiceId) => {
      if (!data?.demoQrPng) {
        toast.error('No provisional QR stored for this invoice')
        return
      }
      setQrSrc(data.demoQrPng as string)
      setQrOpen(true)
    },
    onError: (error: Error) => {
      toast.error('Failed to open QR', { description: error.message })
    },
  });

  const generateDemoIrnMutation = useMutation({
    mutationFn: async (invoiceId: string) => {
      const res = await fetch(`/api/einvoicing/demo/register/${invoiceId}`, { method: 'POST' })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data?.message || data?.error || 'Provisional IRN failed')
      }
      return data
    },
    onSuccess: (data) => {
      toast.success('Provisional IRN generated', {
        description: `DEMO-${String(data.demoIrn || '').slice(0, 12)}...`
      })
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
    },
    onError: (error: Error) => {
      const msg = error.message
      if (msg.includes('missing_gstin')) {
        toast.error('Add GSTINs before generating IRN', {
          description: 'Save seller GSTIN in Settings and client GSTIN in the client details, then retry.',
        })
      } else if (msg.includes('no_lines')) {
        toast.error('Add at least one line item to the invoice, then retry.')
      } else if (msg.includes('invoice_not_found')) {
        toast.error('Invoice not found. Refresh and try again.')
      } else if (msg.startsWith('demo_mode_disabled')) {
        toast.error('Enable demo mode (EINV_DEMO_MODE=true) and restart the server.')
      } else {
        toast.error('Provisional IRN failed', { description: msg })
      }
    },
  });

  const saveManualIrnMutation = useMutation({
    mutationFn: async ({ invoiceId, irn }: { invoiceId: string; irn: string }) => {
      const res = await fetch(`/api/einvoicing/manual/${invoiceId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ irn })
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data?.message || data?.error || 'Save IRN failed')
      }
      return data
    },
    onSuccess: () => {
      toast.success('Official IRN saved')
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
    },
    onError: (error: Error) => {
      toast.error('Save IRN failed', { description: error.message })
    },
  });

  const copyProvisionalIrn = async (demoIrn: string | null | undefined) => {
    try {
      await navigator.clipboard.writeText(`DEMO-${(demoIrn || '').slice(0,64)}`)
      toast.success('Provisional IRN copied')
    } catch (e: any) {
      toast.error('Copy failed', { description: String(e?.message || e) })
    }
  }
  const getStatusColor = (status: string) => {
    switch (status) {
      case "PAID":
        return "bg-green-100 text-green-800 border-green-200";
      case "SENT":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "VIEWED":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "OVERDUE":
        return "bg-red-100 text-red-800 border-red-200";
      case "DRAFT":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "CANCELLED":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "REFUNDED":
        return "bg-pink-100 text-pink-800 border-pink-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <>
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold text-gray-900">
            Invoices
          </CardTitle>
          <Button onClick={onCreate} className="bg-[#2388ff] hover:bg-blue-600">
            <Plus className="w-4 h-4 mr-2" />
            Create Invoice
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <div className="rounded-[16px] border border-gray-200 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-semibold text-gray-700">
                  Invoice
                </TableHead>
                <TableHead className="font-semibold text-gray-700">
                  Client
                </TableHead>
                <TableHead className="font-semibold text-gray-700">
                  Amount
                </TableHead>
                <TableHead className="font-semibold text-gray-700">
                  Status
                </TableHead>
                <TableHead className="font-semibold text-gray-700">
                  Date
                </TableHead>
                <TableHead className="font-semibold text-gray-700">
                  Due Date
                </TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow
                  key={invoice.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <TableCell className="font-medium text-gray-900 flex items-center gap-2">
                    <span>#{invoice.number}</span>
                    {invoice.hasDemoIrn && (
                      <Badge variant="outline" className="text-xs">DEMO IRN</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-gray-700">
                    {invoice.client}
                  </TableCell>
                  <TableCell className="font-semibold text-gray-900">
                    {formatCurrency(invoice.amount)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`capitalize font-medium ${getStatusColor(invoice.status)}`}
                    >
                      {invoice.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-700">
                    {formatDate(invoice.date)}
                  </TableCell>
                  <TableCell className="text-gray-700">
                    {formatDate(invoice.dueDate)}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        {invoice.hasDemoIrn && (
                          <>
                            <DropdownMenuItem
                              onClick={() => fetchInvoiceMutation.mutate(invoice.id)}
                              disabled={fetchInvoiceMutation.isPending}
                            >
                              {fetchInvoiceMutation.isPending ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Loading QR...
                                </>
                              ) : (
                                <>
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Provisional QR
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => copyProvisionalIrn(invoice.demoIrn)}
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Copy Provisional IRN
                            </DropdownMenuItem>
                            <Separator className="my-1" />
                          </>
                        )}
                        <DropdownMenuItem onClick={() => onView?.(invoice.id)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Invoice
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => window.open(`/invoice/${invoice.id}`, '_blank')}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View Online
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEdit?.(invoice.id)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Invoice
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onDownload?.(invoice.id)}
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Download PDF
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onSend?.(invoice.id)}>
                          <Send className="mr-2 h-4 w-4" />
                          Send to Client
                        </DropdownMenuItem>
                        <Separator className="my-1" />
                        <DropdownMenuItem
                          onClick={() => generateDemoIrnMutation.mutate(invoice.id)}
                          disabled={generateDemoIrnMutation.isPending}
                        >
                          {generateDemoIrnMutation.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Generate Provisional IRN
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            const irn = prompt('Enter official IRN to store:')
                            if (!irn) return
                            saveManualIrnMutation.mutate({ invoiceId: invoice.id, irn })
                          }}
                          disabled={saveManualIrnMutation.isPending}
                        >
                          {saveManualIrnMutation.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <AlertCircle className="mr-2 h-4 w-4" />
                              Enter Official IRN
                            </>
                          )}
                        </DropdownMenuItem>
                        
                        {/* Status Change Submenu */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Change Status
                            </DropdownMenuItem>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent side="right" className="w-48">
                            <DropdownMenuItem 
                              onClick={() => onStatusChange?.(invoice.id, 'DRAFT')}
                              className={invoice.status === 'DRAFT' ? 'bg-blue-50' : ''}
                            >
                              <Clock className="mr-2 h-4 w-4" />
                              Draft
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => onStatusChange?.(invoice.id, 'SENT')}
                              className={invoice.status === 'SENT' ? 'bg-blue-50' : ''}
                            >
                              <Send className="mr-2 h-4 w-4" />
                              Sent
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => onStatusChange?.(invoice.id, 'PAID')}
                              className={invoice.status === 'PAID' ? 'bg-blue-50' : ''}
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Paid
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => onStatusChange?.(invoice.id, 'OVERDUE')}
                              className={invoice.status === 'OVERDUE' ? 'bg-blue-50' : ''}
                            >
                              <AlertCircle className="mr-2 h-4 w-4" />
                              Overdue
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        
                        <DropdownMenuItem 
                          onClick={() => onDelete?.(invoice.id)}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Invoice
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {invoices.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg
                className="w-16 h-16 mx-auto"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0h8v12H6V4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No invoices yet
            </h3>
            <p className="text-gray-600 mb-4">
              Get started by creating your first invoice.
            </p>
            <Button
              onClick={onCreate}
              className="bg-[#2388ff] hover:bg-blue-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Invoice
            </Button>
          </div>
        )}
      </CardContent>
    </Card>

    <Dialog open={qrOpen} onOpenChange={setQrOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Provisional IRN QR</DialogTitle>
        </DialogHeader>
        <div className="flex items-center justify-center py-2">
          {qrSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={qrSrc} alt="Provisional QR" className="w-56 h-56 border rounded" />
          ) : (
            <div className="text-sm text-gray-500">No QR available</div>
          )}
        </div>
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={async () => {
              try {
                if (!qrSrc) return
                await navigator.clipboard.writeText(qrSrc)
                toast.success('QR image copied (data URL)')
              } catch (e: any) {
                toast.error('Copy failed', { description: String(e?.message || e) })
              }
            }}
          >
            Copy QR
          </Button>
          <Button onClick={() => setQrOpen(false)}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
}
