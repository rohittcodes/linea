"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Save, X, Palette, FileText, Settings, Eye } from "lucide-react";

interface TemplateFormData {
  name: string;
  description?: string;
  category: string;
  layout: string;
  design: {
    primaryColor: string;
    secondaryColor: string;
    fontFamily: string;
    fontSize: string;
  };
  branding: {
    logoUrl?: string;
    companyName: string;
    companyAddress: string;
    companyEmail: string;
    companyPhone: string;
    companyWebsite?: string;
  };
  isDefault: boolean;
  isPublic: boolean;
  tags: string[];
}

interface TemplateFormProps {
  initialData?: Partial<TemplateFormData>;
  onSave?: (data: TemplateFormData) => void;
  onCancel?: () => void;
}

export function TemplateForm({
  initialData,
  onSave,
  onCancel,
}: TemplateFormProps) {
  const [formData, setFormData] = useState<TemplateFormData>({
    name: initialData?.name || "",
    description: initialData?.description || "",
    category: initialData?.category || "Business",
    layout: initialData?.layout || "standard",
    design: {
      primaryColor: initialData?.design?.primaryColor || "#2388ff",
      secondaryColor: initialData?.design?.secondaryColor || "#f8fafc",
      fontFamily: initialData?.design?.fontFamily || "Inter",
      fontSize: initialData?.design?.fontSize || "14px",
    },
    branding: {
      logoUrl: initialData?.branding?.logoUrl || "",
      companyName: initialData?.branding?.companyName || "",
      companyAddress: initialData?.branding?.companyAddress || "",
      companyEmail: initialData?.branding?.companyEmail || "",
      companyPhone: initialData?.branding?.companyPhone || "",
      companyWebsite: initialData?.branding?.companyWebsite || "",
    },
    isDefault: initialData?.isDefault || false,
    isPublic: initialData?.isPublic || false,
    tags: initialData?.tags || [],
  });

  const [newTag, setNewTag] = useState("");

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSave = () => {
    if (!formData.name) {
      alert("Template name is required");
      return;
    }
    onSave?.(formData);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold text-gray-900">
              {initialData ? "Edit Template" : "Create New Template"}
            </CardTitle>
            <Badge variant="outline" className="capitalize px-3 py-1 text-sm">
              {formData.category}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-8">
          {/* Basic Information */}
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-[#2388ff]" />
              <h3 className="text-lg font-semibold">Template Information</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Template Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Professional Invoice Template"
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Business">Business</SelectItem>
                    <SelectItem value="Corporate">Corporate</SelectItem>
                    <SelectItem value="Minimal">Minimal</SelectItem>
                    <SelectItem value="Creative">Creative</SelectItem>
                    <SelectItem value="Classic">Classic</SelectItem>
                    <SelectItem value="Modern">Modern</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe your template..."
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="layout">Layout Style</Label>
              <Select value={formData.layout} onValueChange={(value) => setFormData(prev => ({ ...prev, layout: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="compact">Compact</SelectItem>
                  <SelectItem value="detailed">Detailed</SelectItem>
                  <SelectItem value="minimal">Minimal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          {/* Design Settings */}
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <Palette className="w-5 h-5 text-[#2388ff]" />
              <h3 className="text-lg font-semibold">Design Settings</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="primaryColor">Primary Color</Label>
                <div className="flex space-x-2">
                  <Input
                    id="primaryColor"
                    type="color"
                    value={formData.design.primaryColor}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      design: { ...prev.design, primaryColor: e.target.value }
                    }))}
                    className="w-16 h-10"
                  />
                  <Input
                    value={formData.design.primaryColor}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      design: { ...prev.design, primaryColor: e.target.value }
                    }))}
                    placeholder="#2388ff"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="secondaryColor">Secondary Color</Label>
                <div className="flex space-x-2">
                  <Input
                    id="secondaryColor"
                    type="color"
                    value={formData.design.secondaryColor}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      design: { ...prev.design, secondaryColor: e.target.value }
                    }))}
                    className="w-16 h-10"
                  />
                  <Input
                    value={formData.design.secondaryColor}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      design: { ...prev.design, secondaryColor: e.target.value }
                    }))}
                    placeholder="#f8fafc"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fontFamily">Font Family</Label>
                <Select value={formData.design.fontFamily} onValueChange={(value) => setFormData(prev => ({ 
                  ...prev, 
                  design: { ...prev.design, fontFamily: value }
                }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Inter">Inter</SelectItem>
                    <SelectItem value="Roboto">Roboto</SelectItem>
                    <SelectItem value="Open Sans">Open Sans</SelectItem>
                    <SelectItem value="Lato">Lato</SelectItem>
                    <SelectItem value="Poppins">Poppins</SelectItem>
                    <SelectItem value="Montserrat">Montserrat</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="fontSize">Font Size</Label>
                <Select value={formData.design.fontSize} onValueChange={(value) => setFormData(prev => ({ 
                  ...prev, 
                  design: { ...prev.design, fontSize: value }
                }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="12px">Small (12px)</SelectItem>
                    <SelectItem value="14px">Medium (14px)</SelectItem>
                    <SelectItem value="16px">Large (16px)</SelectItem>
                    <SelectItem value="18px">Extra Large (18px)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Separator />

          {/* Branding Information */}
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <Settings className="w-5 h-5 text-[#2388ff]" />
              <h3 className="text-lg font-semibold">Branding Information</h3>
            </div>
            
            <div>
              <Label htmlFor="logoUrl">Logo URL</Label>
              <Input
                id="logoUrl"
                value={formData.branding.logoUrl}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  branding: { ...prev.branding, logoUrl: e.target.value }
                }))}
                placeholder="https://example.com/logo.png"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  value={formData.branding.companyName}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    branding: { ...prev.branding, companyName: e.target.value }
                  }))}
                  placeholder="Your Company Name"
                />
              </div>
              <div>
                <Label htmlFor="companyEmail">Company Email</Label>
                <Input
                  id="companyEmail"
                  type="email"
                  value={formData.branding.companyEmail}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    branding: { ...prev.branding, companyEmail: e.target.value }
                  }))}
                  placeholder="hello@company.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="companyPhone">Company Phone</Label>
                <Input
                  id="companyPhone"
                  value={formData.branding.companyPhone}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    branding: { ...prev.branding, companyPhone: e.target.value }
                  }))}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              <div>
                <Label htmlFor="companyWebsite">Company Website</Label>
                <Input
                  id="companyWebsite"
                  value={formData.branding.companyWebsite}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    branding: { ...prev.branding, companyWebsite: e.target.value }
                  }))}
                  placeholder="https://company.com"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="companyAddress">Company Address</Label>
              <Textarea
                id="companyAddress"
                value={formData.branding.companyAddress}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  branding: { ...prev.branding, companyAddress: e.target.value }
                }))}
                placeholder="123 Business St, Suite 100, City, State 12345"
                rows={2}
              />
            </div>
          </div>

          <Separator />

          {/* Template Settings */}
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <Eye className="w-5 h-5 text-[#2388ff]" />
              <h3 className="text-lg font-semibold">Template Settings</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="isDefault">Set as Default Template</Label>
                  <p className="text-sm text-gray-600">
                    This template will be used as the default for new invoices
                  </p>
                </div>
                <Switch
                  id="isDefault"
                  checked={formData.isDefault}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isDefault: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="isPublic">Make Template Public</Label>
                  <p className="text-sm text-gray-600">
                    Allow other users to use this template
                  </p>
                </div>
                <Switch
                  id="isPublic"
                  checked={formData.isPublic}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPublic: checked }))}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="tags">Tags</Label>
              <div className="space-y-2">
                <div className="flex space-x-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add a tag..."
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  />
                  <Button type="button" variant="outline" onClick={addTag}>
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="flex items-center space-x-1">
                      <span>{tag}</span>
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 hover:text-red-500"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave} className="bg-[#2388ff] hover:bg-blue-600">
          <Save className="w-4 h-4 mr-2" />
          {initialData ? "Update Template" : "Create Template"}
        </Button>
      </div>
    </div>
  );
}
