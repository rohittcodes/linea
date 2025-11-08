"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Trash2, Plus, Save, Send, Mail, FileText, Palette, Eye, Loader2 } from "lucide-react";
import { TemplatePreview } from "@/components/templates/TemplatePreview";
import { toast } from "sonner";

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

interface InvoiceFormData {
  invoiceNumber: string;
  date: string;
  dueDate: string;
  status: "DRAFT" | "SENT" | "VIEWED" | "PAID" | "OVERDUE" | "CANCELLED" | "REFUNDED";
  selectedTemplate: string;
  company: {
    name: string;
    address: string;
    email: string;
    phone: string;
  };
  client: {
    name: string;
    address: string;
    email: string;
  };
  items: InvoiceItem[];
  notes: string;
}

interface InvoiceFormProps {
  initialData?: Partial<InvoiceFormData>;
  onSave?: (data: InvoiceFormData) => void;
  onSend?: (data: InvoiceFormData) => void;
  onCancel?: () => void;
}

export function InvoiceForm({
  initialData,
  onSave,
  onSend,
  onCancel,
}: InvoiceFormProps) {
  const [formData, setFormData] = useState<InvoiceFormData>({
    invoiceNumber: initialData?.invoiceNumber || "",
    date: initialData?.date || new Date().toISOString().split("T")[0],
    dueDate: initialData?.dueDate || "",
    status: initialData?.status || "DRAFT",
    selectedTemplate: initialData?.selectedTemplate || "template1",
    company: {
      name: initialData?.company?.name || "",
      address: initialData?.company?.address || "",
      email: initialData?.company?.email || "",
      phone: initialData?.company?.phone || "",
    },
    client: {
      name: initialData?.client?.name || "",
      address: initialData?.client?.address || "",
      email: initialData?.client?.email || "",
    },
    items: initialData?.items || [
      { id: "1", description: "", quantity: 1, rate: 0, amount: 0 },
    ],
    notes: initialData?.notes || "",
  });

  const updateItem = (
    id: string,
    field: keyof InvoiceItem,
    value: string | number,
  ) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((item) => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };
          if (field === "quantity" || field === "rate") {
            updated.amount = updated.quantity * updated.rate;
          }
          return updated;
        }
        return item;
      }),
    }));
  };

  const addItem = () => {
    const newId = (formData.items.length + 1).toString();
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        { id: newId, description: "", quantity: 1, rate: 0, amount: 0 },
      ],
    }));
  };

  const removeItem = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.id !== id),
    }));
  };

  const calculateTotals = () => {
    const subtotal = formData.items.reduce((sum, item) => sum + item.amount, 0);
    const tax = subtotal * 0.1; // 10% tax
    const total = subtotal + tax;
    return { subtotal, tax, total };
  };

  const { subtotal, tax, total } = calculateTotals();

  const createInvoicePayload = () => ({
    invoiceNumber: formData.invoiceNumber,
    title: `Invoice ${formData.invoiceNumber}`,
    issueDate: formData.date,
    dueDate: formData.dueDate,
    status: 'DRAFT' as const,
    subtotal: subtotal,
    taxAmount: tax,
    total: total,
    notes: formData.notes,
    templateName: formData.selectedTemplate,
    client: {
      name: formData.client.name,
      email: formData.client.email,
      address: formData.client.address,
    },
    lineItems: formData.items.map(item => ({
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.rate,
      amount: item.amount,
    })),
  });

  const saveInvoiceMutation = useMutation({
    mutationFn: async () => {
      // Validate required fields
      if (!formData.client.name || !formData.client.email) {
        throw new Error('Please fill in client information');
      }

      if (!formData.items.length || formData.items.some(item => !item.description)) {
        throw new Error('Please add at least one item with description');
      }

      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(createInvoicePayload()),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to create invoice');
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success('Invoice saved as draft successfully!');
      onSave?.(formData);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create invoice');
    },
  });

  const sendInvoiceMutation = useMutation({
    mutationFn: async ({ invoiceId, emailData }: { invoiceId: string; emailData: typeof emailState }) => {
      const response = await fetch(`/api/invoices/${invoiceId}/send`, {
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
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to send invoice');
      }

      return response.json();
    },
    onSuccess: () => {
      setShowEmailDialog(false);
      toast.success('Invoice sent successfully!');
      onSend?.({ ...formData, status: "SENT" });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to send invoice');
    },
  });

  const createAndSendMutation = useMutation({
    mutationFn: async ({ emailData }: { emailData: typeof emailState }) => {
      // First create the invoice
      const createResponse = await fetch('/api/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(createInvoicePayload()),
      });

      if (!createResponse.ok) {
        const errorData = await createResponse.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to create invoice');
      }

      const createResult = await createResponse.json();
      const invoiceId = createResult.data.id;

      // Then send the invoice via email
      const sendResponse = await fetch(`/api/invoices/${invoiceId}/send`, {
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

      if (!sendResponse.ok) {
        const errorData = await sendResponse.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to send invoice');
      }

      return sendResponse.json();
    },
    onSuccess: () => {
      setShowEmailDialog(false);
      toast.success('Invoice sent successfully!');
      onSend?.({ ...formData, status: "SENT" });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create and send invoice');
    },
  });

  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [showTemplatePreview, setShowTemplatePreview] = useState(false);
  
  type EmailState = {
    recipientEmail: string;
    includePDF: boolean;
    customMessage: string;
  };

  const emailState = {
    recipientEmail: formData.client.email,
    includePDF: true,
    customMessage: '',
  };

  const [emailData, setEmailData] = useState<EmailState>(emailState);

  const handleSave = () => {
    saveInvoiceMutation.mutate();
  };

  const handleSend = () => {
    setShowEmailDialog(true);
  };

  const handleSendEmail = () => {
    createAndSendMutation.mutate({ emailData });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold text-gray-900">
              {initialData ? "Edit Invoice" : "Create New Invoice"}
            </CardTitle>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="capitalize px-3 py-1 text-sm">
                {formData.status}
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-8">
          {/* Template Selection */}
          <div className="border-b pb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Palette className="w-5 h-5 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">Invoice Template</h3>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowTemplatePreview(true)}
                className="flex items-center gap-2"
              >
                <Eye className="w-4 h-4" />
                Preview Template
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { id: "template1", name: "Professional", color: "bg-blue-500" },
                { id: "template2", name: "Corporate", color: "bg-gray-700" },
                { id: "template3", name: "Minimal", color: "bg-green-500" },
                { id: "template4", name: "Creative", color: "bg-purple-500" },
                { id: "template5", name: "Classic", color: "bg-orange-500" },
                { id: "template6", name: "Modern", color: "bg-pink-500" },
              ].map((template) => (
                <div
                  key={template.id}
                  className={`relative cursor-pointer rounded-lg border-2 p-4 transition-all hover:shadow-md ${
                    formData.selectedTemplate === template.id
                      ? "border-[#2388ff] bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => setFormData(prev => ({ ...prev, selectedTemplate: template.id }))}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full ${template.color} flex items-center justify-center`}>
                      <span className="text-white text-xs font-bold">T</span>
                    </div>
                    <div>
                      <p className="font-medium text-sm text-gray-900">{template.name}</p>
                      <p className="text-xs text-gray-500">Template</p>
                    </div>
                  </div>
                  {formData.selectedTemplate === template.id && (
                    <div className="absolute top-2 right-2">
                      <div className="w-4 h-4 bg-[#2388ff] rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Invoice Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="invoiceNumber">Invoice Number</Label>
              <Input
                id="invoiceNumber"
                value={formData.invoiceNumber}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    invoiceNumber: e.target.value,
                  }))
                }
                placeholder="INV-001"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Invoice Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, date: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, dueDate: e.target.value }))
                }
              />
            </div>
          </div>

          <Separator />

          {/* Company and Client Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="border-gray-200">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">From (Your Company)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    value={formData.company.name}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        company: { ...prev.company, name: e.target.value },
                      }))
                    }
                    placeholder="Your Company Name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyAddress">Address</Label>
                  <Input
                    id="companyAddress"
                    value={formData.company.address}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        company: { ...prev.company, address: e.target.value },
                      }))
                    }
                    placeholder="123 Business St, City, State 12345"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyEmail">Email</Label>
                    <Input
                      id="companyEmail"
                      type="email"
                      value={formData.company.email}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          company: { ...prev.company, email: e.target.value },
                        }))
                      }
                      placeholder="info@company.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="companyPhone">Phone</Label>
                    <Input
                      id="companyPhone"
                      value={formData.company.phone}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          company: { ...prev.company, phone: e.target.value },
                        }))
                      }
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-gray-200">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Bill To (Client)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="clientName">Client Name</Label>
                  <Input
                    id="clientName"
                    value={formData.client.name}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        client: { ...prev.client, name: e.target.value },
                      }))
                    }
                    placeholder="Client Company or Name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clientAddress">Address</Label>
                  <Input
                    id="clientAddress"
                    value={formData.client.address}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        client: { ...prev.client, address: e.target.value },
                      }))
                    }
                    placeholder="456 Client Ave, City, State 67890"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clientEmail">Email</Label>
                  <Input
                    id="clientEmail"
                    type="email"
                    value={formData.client.email}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        client: { ...prev.client, email: e.target.value },
                      }))
                    }
                    placeholder="client@company.com"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <Separator />

          {/* Invoice Items */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Invoice Items
              </h3>
              <Button onClick={addItem} variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </Button>
            </div>

            <div className="space-y-4">
              {formData.items.map((item, index) => (
                <Card key={item.id} className="border-gray-200">
                  <CardContent className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                      <div className="md:col-span-5 space-y-2">
                        <Label>Description</Label>
                        <Input
                          value={item.description}
                          onChange={(e) =>
                            updateItem(item.id, "description", e.target.value)
                          }
                          placeholder="Description of service or product"
                        />
                      </div>
                      <div className="md:col-span-2 space-y-2">
                        <Label>Quantity</Label>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) =>
                            updateItem(
                              item.id,
                              "quantity",
                              parseInt(e.target.value) || 0,
                            )
                          }
                        />
                      </div>
                      <div className="md:col-span-2 space-y-2">
                        <Label>Rate</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.rate}
                          onChange={(e) =>
                            updateItem(
                              item.id,
                              "rate",
                              parseFloat(e.target.value) || 0,
                            )
                          }
                          placeholder="0.00"
                        />
                      </div>
                      <div className="md:col-span-2 space-y-2">
                        <Label>Amount</Label>
                        <Input
                          value={`$${item.amount.toFixed(2)}`}
                          disabled
                          className="bg-gray-50"
                        />
                      </div>
                      <div className="md:col-span-1 flex justify-center">
                        <Button
                          onClick={() => removeItem(item.id)}
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          disabled={formData.items.length === 1}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="flex justify-end">
            <Card className="w-80 border-gray-200">
              <CardContent className="p-6 space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax (10%)</span>
                  <span className="font-medium">${tax.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-xl font-bold">
                  <span>Total</span>
                  <span className="text-[#2388ff]">${total.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Actions */}
          <div className="flex justify-between pt-6">
            <Button onClick={onCancel} variant="outline">
              Cancel
            </Button>
            <div className="space-x-4">
              <Button 
                onClick={handleSave} 
                variant="outline"
                disabled={saveInvoiceMutation.isPending}
              >
                {saveInvoiceMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Draft
                  </>
                )}
              </Button>
              <Button
                onClick={handleSend}
                className="bg-[#2388ff] hover:bg-blue-600"
                disabled={saveInvoiceMutation.isPending}
              >
                <Send className="w-4 h-4 mr-2" />
                Send Invoice
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Email Dialog */}
      <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
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
              onClick={() => setShowEmailDialog(false)}
              disabled={createAndSendMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSendEmail}
              disabled={createAndSendMutation.isPending || !emailData.recipientEmail}
              className="bg-[#2388ff] hover:bg-blue-600"
            >
              {createAndSendMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
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

      {/* Template Preview Dialog */}
      <Dialog open={showTemplatePreview} onOpenChange={setShowTemplatePreview}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Template Preview
            </DialogTitle>
            <DialogDescription>
              Preview how your invoice will look with the selected template.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <TemplatePreview 
              templateId={formData.selectedTemplate} 
              data={{
                invoiceNumber: formData.invoiceNumber || "INV-001",
                date: formData.date,
                dueDate: formData.dueDate,
                status: formData.status,
                company: formData.company,
                client: formData.client,
                items: formData.items,
                subtotal: subtotal,
                tax: tax,
                total: total,
              }}
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowTemplatePreview(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
