"use client";

import { useState, useEffect } from "react";
import { InvoiceList } from "@/components/invoices/InvoiceList";
import { InvoiceForm } from "@/components/invoices/InvoiceForm";
import { InvoiceTemplate1 } from "@/components/invoices/InvoiceTemplate1";
import { InvoiceTemplate2 } from "@/components/invoices/InvoiceTemplate2";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  FileText,
  DollarSign,
  TrendingUp,
  Clock,
  Eye,
  Edit,
  Download,
  Send,
  Loader2,
  AlertCircle,
  Mail,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

interface Invoice {
  id: string;
  invoiceNumber: string;
  title?: string;
  total: number;
  status: 'DRAFT' | 'SENT' | 'VIEWED' | 'PAID' | 'OVERDUE' | 'CANCELLED' | 'REFUNDED';
  issueDate: string;
  dueDate: string;
  client: {
    name: string;
    email: string;
  };
  lineItems: Array<{
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
    amount: number;
  }>;
}

interface InvoicesResponse {
  success: boolean;
  data: {
    invoices: Invoice[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

const sampleInvoiceData = {
  invoiceNumber: "INV-001",
  date: "2024-01-15",
  dueDate: "2024-02-15",
  status: "paid" as const,
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

export default function InvoicesPage() {
  const [showForm, setShowForm] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<
    "template1" | "template2"
  >("template1");

  // Check for template parameter in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const templateParam = urlParams.get('template');
    if (templateParam) {
      setSelectedTemplate(templateParam as "template1" | "template2");
      setShowForm(true);
    }
  }, []);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalInvoices, setTotalInvoices] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [paidInvoices, setPaidInvoices] = useState(0);
  const [pendingInvoices, setPendingInvoices] = useState(0);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/invoices');
      if (!response.ok) {
        throw new Error('Failed to fetch invoices');
      }
      
      const data: InvoicesResponse = await response.json();
      const invoices = data.data?.invoices || [];
      const total = data.data?.total || 0;
      
      setInvoices(invoices);
      setTotalInvoices(total);
      
      // Calculate stats
      const totalAmount = invoices.reduce((sum: number, inv: Invoice) => sum + Number(inv.total), 0);
      const paid = invoices.filter((inv: Invoice) => inv.status === 'PAID').length;
      const pending = invoices.filter((inv: Invoice) => inv.status === 'SENT').length;
      
      setTotalAmount(totalAmount);
      setPaidInvoices(paid);
      setPendingInvoices(pending);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      toast.error('Failed to fetch invoices');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInvoice = () => {
    setShowForm(true);
  };

  const handleViewInvoice = (id: string) => {
    setShowPreview(true);
  };

  const handleEditInvoice = (id: string) => {
    setShowForm(true);
  };

  const handleDownloadInvoice = async (id: string) => {
    try {
      console.log("Downloading invoice:", id);
      // TODO: Implement PDF download
    } catch (error) {
      console.error('Error downloading invoice:', error);
    }
  };

  const [sendingInvoice, setSendingInvoice] = useState<string | null>(null);
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const [invoiceToDelete, setInvoiceToDelete] = useState<string | null>(null);
  const [emailData, setEmailData] = useState({
    recipientEmail: '',
    includePDF: true,
    customMessage: '',
  });

  const handleSendInvoice = async (id: string) => {
    // Find the invoice to get client email
    const invoice = invoices.find(inv => inv.id === id);
    if (invoice) {
      setEmailData(prev => ({
        ...prev,
        recipientEmail: invoice.client.email
      }));
    }
    setSelectedInvoiceId(id);
    setShowSendDialog(true);
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/invoices/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update invoice status');
      }

      toast.success(`Invoice status updated to ${newStatus.toLowerCase()}`);
      fetchInvoices(); // Refresh the list
    } catch (error) {
      console.error('Error updating invoice status:', error);
      toast.error('Failed to update invoice status');
    }
  };

  const handleDeleteInvoice = async (id: string) => {
    setInvoiceToDelete(id);
    setShowDeleteDialog(true);
  };

  const confirmDeleteInvoice = async () => {
    if (!invoiceToDelete) return;

    try {
      const response = await fetch(`/api/invoices/${invoiceToDelete}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete invoice');
      }

      toast.success('Invoice deleted successfully!');
      fetchInvoices(); // Refresh the list
    } catch (error) {
      console.error('Error deleting invoice:', error);
      toast.error('Failed to delete invoice');
    } finally {
      setShowDeleteDialog(false);
      setInvoiceToDelete(null);
    }
  };

  const handleSendEmail = async () => {
    if (!selectedInvoiceId) return;

    try {
      setSendingInvoice(selectedInvoiceId);
      
      const response = await fetch(`/api/invoices/${selectedInvoiceId}/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipientEmail: emailData.recipientEmail,
          includePDF: emailData.includePDF,
          customMessage: emailData.customMessage,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send invoice');
      }

      setShowSendDialog(false);
      setSelectedInvoiceId(null);
      setEmailData({
        recipientEmail: '',
        includePDF: true,
        customMessage: '',
      });

      // Refresh the invoices list
      fetchInvoices();
      
      // Show success message
      toast.success('Invoice sent successfully!');
    } catch (error) {
      console.error('Error sending invoice:', error);
      toast.error('Failed to send invoice');
    } finally {
      setSendingInvoice(null);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const stats = [
    {
      title: "Total Invoices",
      value: totalInvoices,
      icon: FileText,
      color: "text-blue-600",
    },
    {
      title: "Total Amount",
      value: formatCurrency(totalAmount),
      icon: DollarSign,
      color: "text-green-600",
    },
    {
      title: "Paid",
      value: paidInvoices,
      icon: TrendingUp,
      color: "text-emerald-600",
    },
    {
      title: "Pending",
      value: pendingInvoices,
      icon: Clock,
      color: "text-amber-600",
    },
  ];

  if (loading && (!invoices || invoices.length === 0)) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-2">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading invoices...</span>
        </div>
      </div>
    );
  }

  if (error && (!invoices || invoices.length === 0)) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Invoices</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={fetchInvoices} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (showForm) {
    return (
      <div className="space-y-6">
        <InvoiceForm
          initialData={{
            selectedTemplate: selectedTemplate,
          }}
          onCancel={() => setShowForm(false)}
          onSave={(data) => {
            console.log("Saving invoice:", data);
            setShowForm(false);
            fetchInvoices(); // Refresh the list
            toast.success('Invoice saved successfully!');
          }}
          onSend={(data) => {
            console.log("Sending invoice:", data);
            setShowForm(false);
            fetchInvoices(); // Refresh the list
            toast.success('Invoice sent successfully!');
          }}
        />
      </div>
    );
  }

  // Transform invoices for the InvoiceList component
  const transformedInvoices = (invoices || []).map(invoice => ({
    id: invoice.id,
    number: invoice.invoiceNumber,
    client: invoice.client.name,
    amount: invoice.total,
    status: invoice.status as 'DRAFT' | 'SENT' | 'VIEWED' | 'PAID' | 'OVERDUE' | 'CANCELLED' | 'REFUNDED',
    date: invoice.issueDate,
    dueDate: invoice.dueDate,
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Invoices</h1>
        <p className="text-gray-600 mt-2">
          Manage your invoices and track payments
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {stat.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Invoice List */}
      <InvoiceList
        invoices={transformedInvoices}
        onCreate={handleCreateInvoice}
        onView={handleViewInvoice}
        onEdit={handleEditInvoice}
        onDownload={handleDownloadInvoice}
        onSend={handleSendInvoice}
        onDelete={handleDeleteInvoice}
        onStatusChange={handleStatusChange}
      />

      {/* Invoice Preview Sheet */}
      <Sheet open={showPreview} onOpenChange={setShowPreview}>
        <SheetContent className="w-full sm:max-w-4xl overflow-y-auto">
          <SheetHeader className="mb-6">
            <div className="flex items-center justify-between">
              <SheetTitle>Invoice Preview</SheetTitle>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedTemplate("template1")}
                  className={
                    selectedTemplate === "template1"
                      ? "bg-blue-50 border-blue-200"
                      : ""
                  }
                >
                  Template 1
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedTemplate("template2")}
                  className={
                    selectedTemplate === "template2"
                      ? "bg-blue-50 border-blue-200"
                      : ""
                  }
                >
                  Template 2
                </Button>
              </div>
            </div>
          </SheetHeader>

          <div className="space-y-4">
            {selectedTemplate === "template1" ? (
              <InvoiceTemplate1 data={sampleInvoiceData} />
            ) : (
              <InvoiceTemplate2 data={sampleInvoiceData} />
            )}

            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
              <Button size="sm" className="bg-[#2388ff] hover:bg-blue-600">
                <Send className="w-4 h-4 mr-2" />
                Send Invoice
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Send Invoice Dialog */}
      <Dialog open={showSendDialog} onOpenChange={setShowSendDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Send Invoice
            </DialogTitle>
            <DialogDescription>
              Send this invoice to your client via email. You can customize the recipient and include a PDF attachment.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="recipientEmail">Recipient Email</Label>
              <Input
                id="recipientEmail"
                type="email"
                value={emailData.recipientEmail}
                onChange={(e) => setEmailData(prev => ({
                  ...prev,
                  recipientEmail: e.target.value
                }))}
                placeholder="client@example.com"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="includePDF">Include PDF Attachment</Label>
                <p className="text-sm text-gray-500">
                  Attach a professional PDF version of the invoice
                </p>
              </div>
              <Switch
                id="includePDF"
                checked={emailData.includePDF}
                onCheckedChange={(checked) => setEmailData(prev => ({
                  ...prev,
                  includePDF: checked
                }))}
              />
            </div>

            <div>
              <Label htmlFor="customMessage">Custom Message (Optional)</Label>
              <Textarea
                id="customMessage"
                value={emailData.customMessage}
                onChange={(e) => setEmailData(prev => ({
                  ...prev,
                  customMessage: e.target.value
                }))}
                placeholder="Add a personal message to your client..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowSendDialog(false)}
              disabled={sendingInvoice !== null}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSendEmail}
              disabled={sendingInvoice !== null || !emailData.recipientEmail}
              className="bg-[#2388ff] hover:bg-blue-600"
            >
              {sendingInvoice ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Invoice
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-5 h-5" />
              Delete Invoice
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this invoice? This action cannot be undone and will permanently remove the invoice from your system.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmDeleteInvoice}
              variant="destructive"
              className="bg-red-600 hover:bg-red-700"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Invoice
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
