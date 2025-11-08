"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { InvoiceTemplate1 } from "@/components/invoices/InvoiceTemplate1";
import { InvoiceTemplate2 } from "@/components/invoices/InvoiceTemplate2";
import { InvoiceTemplate3 } from "@/components/invoices/InvoiceTemplate3";
import { InvoiceTemplate4 } from "@/components/invoices/InvoiceTemplate4";
import { InvoiceTemplate5 } from "@/components/invoices/InvoiceTemplate5";
import { InvoiceTemplate6 } from "@/components/invoices/InvoiceTemplate6";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Plus, Eye, Copy, Download, Star } from "lucide-react";
import { TemplateForm } from "@/components/templates/TemplateForm";

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

const templates = [
  {
    id: "template1",
    name: "Professional",
    description: "Clean and professional design with a modern layout",
    category: "Business",
    popular: true,
    preview: InvoiceTemplate1,
  },
  {
    id: "template2",
    name: "Corporate",
    description: "Corporate style with company branding elements",
    category: "Corporate",
    popular: false,
    preview: InvoiceTemplate2,
  },
  {
    id: "template3",
    name: "Minimal",
    description: "Simple and clean design for modern businesses",
    category: "Minimal",
    popular: true,
    preview: InvoiceTemplate3,
  },
  {
    id: "template4",
    name: "Creative",
    description: "Colorful and creative design for creative agencies",
    category: "Creative",
    popular: false,
    preview: InvoiceTemplate4,
  },
  {
    id: "template5",
    name: "Classic",
    description: "Traditional invoice design with professional elements",
    category: "Classic",
    popular: false,
    preview: InvoiceTemplate5,
  },
  {
    id: "template6",
    name: "Modern",
    description: "Contemporary design with gradient backgrounds",
    category: "Modern",
    popular: true,
    preview: InvoiceTemplate6,
  },
];

export default function TemplatesPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const handlePreviewTemplate = (templateId: string) => {
    setSelectedTemplate(templateId);
    setPreviewOpen(true);
  };

  const handleUseTemplate = (templateId: string) => {
    // Navigate to invoice creation with the selected template
    window.location.href = `/invoices?template=${templateId}`;
  };

  const handleCreateTemplate = async (templateData: any) => {
    try {
      const response = await fetch('/api/templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(templateData),
      });

      if (!response.ok) {
        throw new Error('Failed to create template');
      }

      setShowForm(false);
      // You could refresh templates list here if needed
    } catch (err) {
      console.error('Error creating template:', err);
      alert('Failed to create template');
    }
  };

  const selectedTemplateData = templates.find((t) => t.id === selectedTemplate);

  if (showForm) {
    return (
      <div className="space-y-6">
        <TemplateForm
          onCancel={() => setShowForm(false)}
          onSave={handleCreateTemplate}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Invoice Templates</h1>
        <p className="text-gray-600 mt-2">
          Choose from our collection of professionally designed invoice
          templates inspired by BRIX Agency designs
        </p>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Categories:</span>
            <div className="flex flex-wrap gap-2">
              {[
                "All",
                "Business",
                "Corporate",
                "Minimal",
                "Creative",
                "Classic",
                "Modern",
              ].map((category) => (
                <Badge
                  key={category}
                  variant="outline"
                  className="cursor-pointer hover:bg-gray-50"
                >
                  {category}
                </Badge>
              ))}
            </div>
          </div>
        </div>
        <Button 
          className="bg-[#2388ff] hover:bg-blue-600"
          onClick={() => setShowForm(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Custom Template
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <Card
            key={template.id}
            className="group hover:shadow-lg transition-all duration-200 border-0 shadow-sm"
          >
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                    {template.name}
                    {template.popular && (
                      <Star className="w-4 h-4 ml-2 text-yellow-500 fill-current" />
                    )}
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    {template.description}
                  </p>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {template.category}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Template Preview Thumbnail */}
              {/* <div className="aspect-[3/4] bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center group-hover:border-[#2388ff] transition-colors">
                <div className="text-center">
                  <div className="w-12 h-12 bg-white rounded-lg shadow-sm flex items-center justify-center mb-3">
                    <template.preview />
                  </div>
                  <p className="text-sm text-gray-500">Preview Available</p>
                </div>
              </div> */}

              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => handlePreviewTemplate(template.id)}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                </Button>
                <Button
                  size="sm"
                  className="flex-1 bg-[#2388ff] hover:bg-blue-600"
                  onClick={() => handleUseTemplate(template.id)}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Use Template
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Custom Template Creation Card */}
      <Card className="border-dashed border-2 border-gray-300 hover:border-[#2388ff] transition-colors">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Plus className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Create Custom Template
          </h3>
          <p className="text-gray-600 text-center mb-4 max-w-md">
            Design your own invoice template with custom branding, colors, and
            layout to match your business identity.
          </p>
          <Button className="bg-[#2388ff] hover:bg-blue-600">
            <Plus className="w-4 h-4 mr-2" />
            Start Creating
          </Button>
        </CardContent>
      </Card>

      <Sheet open={previewOpen} onOpenChange={setPreviewOpen}>
        <SheetContent className="w-full sm:max-w-4xl overflow-y-auto bg-white">
          <SheetHeader className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <SheetTitle className="flex items-center">
                  {selectedTemplateData?.name} Template
                  {selectedTemplateData?.popular && (
                    <Star className="w-5 h-5 ml-2 text-yellow-500 fill-current" />
                  )}
                </SheetTitle>
                <p className="text-gray-600 text-sm mt-1">
                  {selectedTemplateData?.description}
                </p>
              </div>
              <Badge variant="secondary">
                {selectedTemplateData?.category}
              </Badge>
            </div>
          </SheetHeader>

          <div className="space-y-6">
            {selectedTemplateData && (
              <div className="transform scale-90 origin-top">
                <selectedTemplateData.preview data={sampleInvoiceData} />
              </div>
            )}

            <div className="flex self-end justify-between items-center pt-4 px-4 border-t">
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Download Template
                </Button>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" onClick={() => setPreviewOpen(false)}>
                  Close
                </Button>
                <Button
                  className="bg-[#2388ff] hover:bg-blue-600"
                  onClick={() => handleUseTemplate(selectedTemplate!)}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Use This Template
                </Button>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
