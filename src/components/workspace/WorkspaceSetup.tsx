"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Building2, ArrowRight, CheckCircle } from "lucide-react";
import { toast } from "sonner";

interface WorkspaceSetupProps {
  onComplete: () => void;
}

export function WorkspaceSetup({ onComplete }: WorkspaceSetupProps) {
  const [loading, setLoading] = useState(false);
  const [workspaceData, setWorkspaceData] = useState({
    name: "",
    description: "",
    email: "",
  });

  const handleCreateWorkspace = async () => {
    if (!workspaceData.name || !workspaceData.email) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      
      const response = await fetch('/api/workspaces', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(workspaceData),
      });

      if (!response.ok) {
        throw new Error('Failed to create workspace');
      }

      toast.success('Workspace created successfully!');
      onComplete();
    } catch (error) {
      console.error('Error creating workspace:', error);
      toast.error('Failed to create workspace');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Building2 className="w-8 h-8 text-blue-600 mr-2" />
            <CardTitle className="text-2xl">Welcome to Linea</CardTitle>
          </div>
          <p className="text-gray-600">
            Set up your workspace to get started
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">Workspace Name *</Label>
            <Input
              id="name"
              value={workspaceData.name}
              onChange={(e) => setWorkspaceData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="My Company"
            />
          </div>
          
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={workspaceData.description}
              onChange={(e) => setWorkspaceData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Brief description of your business"
              rows={3}
            />
          </div>
          
          <div>
            <Label htmlFor="email">Business Email *</Label>
            <Input
              id="email"
              type="email"
              value={workspaceData.email}
              onChange={(e) => setWorkspaceData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="hello@mycompany.com"
            />
          </div>

          <Button
            onClick={handleCreateWorkspace}
            disabled={loading || !workspaceData.name || !workspaceData.email}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Creating...
              </>
            ) : (
              <>
                Create Workspace
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
