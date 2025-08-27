"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Building2, Users, Save } from "lucide-react";
import { toast } from "sonner";

interface CreateWorkspaceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface WorkspaceFormData {
  name: string;
  description: string;
  type: "PERSONAL" | "TEAM" | "ENTERPRISE";
}

export function CreateWorkspaceModal({ open, onOpenChange, onSuccess }: CreateWorkspaceModalProps) {
  const [formData, setFormData] = useState<WorkspaceFormData>({
    name: "",
    description: "",
    type: "PERSONAL"
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error("Workspace name is required");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/workspaces', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create workspace');
      }

      toast.success('Workspace created successfully');
      setFormData({ name: "", description: "", type: "PERSONAL" });
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error('Error creating workspace:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create workspace');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({ name: "", description: "", type: "PERSONAL" });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Workspace</DialogTitle>
          <DialogDescription>
            Create a new workspace to organize your invoices, clients, and team members.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Workspace Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="My New Workspace"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe your workspace..."
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="type">Workspace Type</Label>
            <Select 
              value={formData.type} 
              onValueChange={(value: "PERSONAL" | "TEAM" | "ENTERPRISE") => 
                setFormData(prev => ({ ...prev, type: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PERSONAL">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    Personal
                  </div>
                </SelectItem>
                <SelectItem value="TEAM">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Team
                  </div>
                </SelectItem>
                <SelectItem value="ENTERPRISE">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    Enterprise
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-[#2388ff] hover:bg-blue-600">
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Create Workspace
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
