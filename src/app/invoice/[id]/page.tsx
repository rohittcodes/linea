"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, Mail, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface Invoice {
  id: string;
  invoiceNumber: string;
  title: string;
  description: string;
  issueDate: string;
  dueDate: string;
  status: string;
  currency: string;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
  notes: string;
  terms: string;
  client: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  user: {
    name: string;
    email: string;
    companyName: string;
    companyAddress: string;
    companyEmail: string;
    companyPhone: string;
  };
  lineItems: Array<{
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
    amount: number;
    notes: string;
  }>;
}

interface InvoicePageProps {
  params: Promise<{ id: string }>;
}

async function fetchInvoiceData(invoiceId: string) {
  const response = await fetch(`/api/invoice/${invoiceId}/public`);
  if (!response.ok) {
    throw new Error('Invoice not found');
  }
  const data = await response.json();
  return data.invoice as Invoice;
}

export default function InvoicePage({ params }: InvoicePageProps) {
  const [invoiceId, setInvoiceId] = useState<string | null>(null);

  useEffect(() => {
    const getInvoiceId = async () => {
      const { id } = await params;
      setInvoiceId(id);
    };
    getInvoiceId();
  }, [params]);

  const { data: invoice, isLoading: loading, error } = useQuery<Invoice>({
    queryKey: ['invoice', 'public', invoiceId],
    queryFn: () => fetchInvoiceData(invoiceId!),
    enabled: !!invoiceId,
    retry: 1,
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: invoice?.currency || 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'sent':
        return 'bg-blue-100 text-blue-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header Shimmer */}
          <div className="mb-8">
            <Skeleton className="h-10 w-24 mb-4" />
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-6 w-40" />
              </div>
              <div className="text-right space-y-2">
                <Skeleton className="h-6 w-20 ml-auto" />
                <Skeleton className="h-4 w-32 ml-auto" />
              </div>
            </div>
          </div>

          {/* Company and Client Info Shimmer */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-16" />
              </CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-36" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-20" />
              </CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-5 w-28" />
                <Skeleton className="h-4 w-52" />
                <Skeleton className="h-4 w-44" />
                <Skeleton className="h-4 w-38" />
              </CardContent>
            </Card>
          </div>

          {/* Invoice Details Shimmer */}
          <Card className="mb-8">
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-5 w-32" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-5 w-32" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Items Table Shimmer */}
          <Card className="mb-8">
            <CardHeader>
              <Skeleton className="h-6 w-20" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Table Header */}
                <div className="grid grid-cols-4 gap-4 pb-2 border-b">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-5 w-16 mx-auto" />
                  <Skeleton className="h-5 w-16 ml-auto" />
                  <Skeleton className="h-5 w-16 ml-auto" />
                </div>
                {/* Table Rows */}
                {[1, 2, 3].map((i) => (
                  <div key={i} className="grid grid-cols-4 gap-4 py-3 border-b">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-3 w-3/4" />
                    </div>
                    <Skeleton className="h-4 w-8 mx-auto" />
                    <Skeleton className="h-4 w-20 ml-auto" />
                    <Skeleton className="h-4 w-20 ml-auto" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Totals Shimmer */}
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="flex justify-end">
                <div className="w-64 space-y-3">
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-28" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error || (!loading && !invoice)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Invoice Not Found</h1>
          <p className="text-gray-600 mb-6">{error instanceof Error ? error.message : 'The invoice you are looking for does not exist.'}</p>
          <Link href="/">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">INVOICE</h1>
              <p className="text-lg text-gray-600">#{invoice.invoiceNumber}</p>
            </div>
            <div className="text-right">
              <Badge className={getStatusColor(invoice.status)}>
                {invoice.status.toUpperCase()}
              </Badge>
              <p className="text-sm text-gray-600 mt-2">{formatDate(invoice.issueDate)}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Company Information */}
          <Card>
            <CardHeader>
              <CardTitle>From</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-semibold">{invoice.user.companyName || 'Your Company'}</p>
              {invoice.user.companyAddress && <p className="text-gray-600">{invoice.user.companyAddress}</p>}
              {invoice.user.companyEmail && <p className="text-gray-600">{invoice.user.companyEmail}</p>}
              {invoice.user.companyPhone && <p className="text-gray-600">{invoice.user.companyPhone}</p>}
            </CardContent>
          </Card>

          {/* Client Information */}
          <Card>
            <CardHeader>
              <CardTitle>Bill To</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-semibold">{invoice.client.name}</p>
              {invoice.client.address && <p className="text-gray-600">{invoice.client.address}</p>}
              <p className="text-gray-600">{invoice.client.email}</p>
              {invoice.client.phone && <p className="text-gray-600">{invoice.client.phone}</p>}
            </CardContent>
          </Card>
        </div>

        {/* Invoice Details */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Invoice Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Issue Date</p>
                <p className="text-gray-900">{formatDate(invoice.issueDate)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Due Date</p>
                <p className="text-gray-900">{formatDate(invoice.dueDate)}</p>
              </div>
              {invoice.description && (
                <div className="md:col-span-2">
                  <p className="text-sm font-medium text-gray-500">Description</p>
                  <p className="text-gray-900">{invoice.description}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Items Table */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Items</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-center">Qty</TableHead>
                  <TableHead className="text-right">Rate</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoice.lineItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{item.description}</p>
                        {item.notes && <p className="text-sm text-gray-500">{item.notes}</p>}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">{item.quantity}</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.unitPrice)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.amount)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Totals */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex justify-end">
              <div className="w-64 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span>{formatCurrency(invoice.subtotal)}</span>
                </div>
                {invoice.taxAmount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax:</span>
                    <span>{formatCurrency(invoice.taxAmount)}</span>
                  </div>
                )}
                {invoice.discountAmount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Discount:</span>
                    <span>-{formatCurrency(invoice.discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t pt-2">
                  <span className="font-bold text-lg">Total:</span>
                  <span className="font-bold text-lg">{formatCurrency(invoice.total)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notes and Terms */}
        {(invoice.notes || invoice.terms) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {invoice.notes && (
              <Card>
                <CardHeader>
                  <CardTitle>Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">{invoice.notes}</p>
                </CardContent>
              </Card>
            )}
            {invoice.terms && (
              <Card>
                <CardHeader>
                  <CardTitle>Terms & Conditions</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">{invoice.terms}</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Footer */}
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-lg font-semibold mb-2">Thank you for your business!</p>
              <p className="text-gray-600">{invoice.user.companyName || 'Your Company'}</p>
              {invoice.user.companyEmail && (
                <p className="text-gray-600">{invoice.user.companyEmail}</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
